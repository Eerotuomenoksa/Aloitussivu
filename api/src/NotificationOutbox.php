<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class NotificationOutbox
{
    public function __construct(private readonly DatabaseConnection $database)
    {
    }

    public function enqueue(string $type, string $periodKey, MailMessage $message): bool
    {
        if (!in_array($type, ['maintenance_digest', 'monthly_report', 'quarterly_report'], true)) {
            throw new \InvalidArgumentException('notification_type_invalid');
        }
        if (preg_match('/^[0-9]{4}(?:-[0-9]{2}){0,2}(?:-Q[1-4])?$/D', $periodKey) !== 1) {
            throw new \InvalidArgumentException('notification_period_invalid');
        }
        return $this->database->execute(
            'INSERT IGNORE INTO email_outbox '
            . '(id, message_type, period_key, recipient_alias, subject, text_body, html_body, status, next_attempt_at) '
            . "VALUES (:id, :message_type, :period_key, 'primary', :subject, :text_body, :html_body, 'pending', UTC_TIMESTAMP(6))",
            [
                'id' => Uuid::generate(),
                'message_type' => $type,
                'period_key' => $periodKey,
                'subject' => $message->subject,
                'text_body' => $message->textBody,
                'html_body' => $message->htmlBody,
            ],
        ) === 1;
    }

    public function deleteExpired(): int
    {
        return $this->database->execute(
            "DELETE FROM email_outbox WHERE status IN ('sent', 'failed') "
            . 'AND created_at < DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 24 MONTH)',
        );
    }
}
