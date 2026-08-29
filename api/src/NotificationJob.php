<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;
use DateTimeZone;

final class NotificationJob
{
    public function __construct(
        private readonly Config $config,
        private readonly NotificationReportBuilder $reports,
        private readonly NotificationOutbox $outbox,
    ) {
    }

    /** @return array{status: string, queued: list<string>, existing: list<string>, expiredDeleted: int} */
    public function run(?DateTimeImmutable $now = null): array
    {
        if (!$this->config->notificationEnabled) {
            return ['status' => 'disabled', 'queued' => [], 'existing' => [], 'expiredDeleted' => 0];
        }
        $localNow = ($now ?? new DateTimeImmutable('now'))->setTimezone(new DateTimeZone('Europe/Helsinki'));
        $queued = [];
        $existing = [];

        if ((int) $localNow->format('N') <= 5) {
            $digest = $this->reports->maintenanceDigest($localNow);
            if ($digest !== null) {
                $this->enqueue(
                    'maintenance_digest',
                    $localNow->format('Y-m-d'),
                    $digest,
                    $queued,
                    $existing,
                );
            }
        }

        if ((int) $localNow->format('j') >= 2) {
            $monthStart = $localNow->modify('first day of this month')->setTime(0, 0)->modify('-1 month');
            $this->enqueue(
                'monthly_report',
                $monthStart->format('Y-m'),
                $this->reports->monthlyReport($monthStart),
                $queued,
                $existing,
            );
        }

        $month = (int) $localNow->format('n');
        if (in_array($month, [1, 4, 7, 10], true) && (int) $localNow->format('j') >= 5) {
            $quarterStart = $localNow->modify('first day of this month')->setTime(0, 0)->modify('-3 months');
            $quarter = intdiv((int) $quarterStart->format('n') - 1, 3) + 1;
            $this->enqueue(
                'quarterly_report',
                sprintf('%s-Q%d', $quarterStart->format('Y'), $quarter),
                $this->reports->quarterlyReport($quarterStart),
                $queued,
                $existing,
            );
        }

        return [
            'status' => 'ok',
            'queued' => $queued,
            'existing' => $existing,
            'expiredDeleted' => $this->outbox->deleteExpired(),
        ];
    }

    /** @param list<string> $queued @param list<string> $existing */
    private function enqueue(
        string $type,
        string $periodKey,
        MailMessage $message,
        array &$queued,
        array &$existing,
    ): void {
        $key = $type . ':' . $periodKey;
        if ($this->outbox->enqueue($type, $periodKey, $message)) {
            $queued[] = $key;
            return;
        }
        $existing[] = $key;
    }
}
