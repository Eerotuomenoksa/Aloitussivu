<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;
use DateTimeZone;
use Throwable;

final class EmailDispatcher
{
    private const LOCK_NAME = 'aloitussivu:email-dispatch';

    public function __construct(
        private readonly Config $config,
        private readonly DatabaseConnection $database,
        private readonly MailTransport $transport,
    ) {
    }

    /** @return array{status: string, sent: int, retried: int, failed: int} */
    public function run(?DateTimeImmutable $now = null): array
    {
        if (!$this->config->notificationEnabled) {
            return ['status' => 'disabled', 'sent' => 0, 'retried' => 0, 'failed' => 0];
        }
        $lock = $this->database->fetchOne(
            'SELECT GET_LOCK(:lock_name, 0) AS acquired',
            ['lock_name' => self::LOCK_NAME],
        );
        if ((int) ($lock['acquired'] ?? 0) !== 1) {
            return ['status' => 'locked', 'sent' => 0, 'retried' => 0, 'failed' => 0];
        }

        $result = ['status' => 'ok', 'sent' => 0, 'retried' => 0, 'failed' => 0];
        $utcNow = ($now ?? new DateTimeImmutable('now'))->setTimezone(new DateTimeZone('UTC'));
        try {
            $rows = $this->database->fetchAll(
                'SELECT id, subject, text_body, html_body, status, attempt_count FROM email_outbox '
                . "WHERE ((status IN ('pending', 'retry') AND next_attempt_at <= :now) "
                . "OR (status = 'sending' AND updated_at < :stale_before)) "
                . 'ORDER BY next_attempt_at ASC, created_at ASC LIMIT 10',
                [
                    'now' => $utcNow->format('Y-m-d H:i:s.u'),
                    'stale_before' => $utcNow->modify('-1 hour')->format('Y-m-d H:i:s.u'),
                ],
            );
            foreach ($rows as $row) {
                $id = (string) ($row['id'] ?? '');
                if ($id === '') {
                    continue;
                }
                $claimed = $this->database->execute(
                    "UPDATE email_outbox SET status = 'sending', attempt_count = attempt_count + 1, "
                    . 'last_error_code = NULL, updated_at = :claim_at WHERE id = :id '
                    . "AND ((status IN ('pending', 'retry') AND next_attempt_at <= :due_at) "
                    . "OR (status = 'sending' AND updated_at < :stale_before))",
                    [
                        'id' => $id,
                        'claim_at' => $utcNow->format('Y-m-d H:i:s.u'),
                        'due_at' => $utcNow->format('Y-m-d H:i:s.u'),
                        'stale_before' => $utcNow->modify('-1 hour')->format('Y-m-d H:i:s.u'),
                    ],
                );
                if ($claimed !== 1) {
                    continue;
                }
                $attempt = (int) ($row['attempt_count'] ?? 0) + 1;
                try {
                    $this->transport->send(new MailMessage(
                        (string) ($row['subject'] ?? ''),
                        (string) ($row['text_body'] ?? ''),
                        (string) ($row['html_body'] ?? ''),
                    ));
                    $this->database->execute(
                        "UPDATE email_outbox SET status = 'sent', sent_at = :sent_at, updated_at = :updated_at, "
                        . 'last_error_code = NULL WHERE id = :id',
                        [
                            'id' => $id,
                            'sent_at' => $utcNow->format('Y-m-d H:i:s.u'),
                            'updated_at' => $utcNow->format('Y-m-d H:i:s.u'),
                        ],
                    );
                    $result['sent']++;
                } catch (Throwable $error) {
                    $errorCode = $this->safeErrorCode($error);
                    if ($attempt >= 3) {
                        $this->database->execute(
                            "UPDATE email_outbox SET status = 'failed', last_error_code = :error_code, "
                            . 'updated_at = :now WHERE id = :id',
                            [
                                'id' => $id,
                                'error_code' => $errorCode,
                                'now' => $utcNow->format('Y-m-d H:i:s.u'),
                            ],
                        );
                        $result['failed']++;
                        continue;
                    }
                    $delayMinutes = $attempt === 1 ? 5 : 30;
                    $this->database->execute(
                        "UPDATE email_outbox SET status = 'retry', last_error_code = :error_code, "
                        . 'next_attempt_at = :next_attempt_at, updated_at = :now WHERE id = :id',
                        [
                            'id' => $id,
                            'error_code' => $errorCode,
                            'next_attempt_at' => $utcNow->modify('+' . $delayMinutes . ' minutes')->format('Y-m-d H:i:s.u'),
                            'now' => $utcNow->format('Y-m-d H:i:s.u'),
                        ],
                    );
                    $result['retried']++;
                }
            }
        } finally {
            $this->database->fetchOne(
                'SELECT RELEASE_LOCK(:lock_name) AS released',
                ['lock_name' => self::LOCK_NAME],
            );
        }
        return $result;
    }

    private function safeErrorCode(Throwable $error): string
    {
        $message = $error->getMessage();
        return preg_match('/^smtp_[a-z0-9_]+$/D', $message) === 1 ? $message : 'smtp_send_failed';
    }
}
