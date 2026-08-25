<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateInterval;
use DateTimeImmutable;
use DateTimeZone;
use Throwable;

final class NcscJob
{
    private const LOCK_NAME = 'aloitussivu:ncsc-scrape';
    private const RECENT_DAYS = 6;
    private const ALERT_TTL_DAYS = 28;
    private const EMPTY_URL = 'internal:ncsc-rss-empty';

    public function __construct(
        private readonly DatabaseConnection $database,
        private readonly NcscSource $source,
    ) {
    }

    public function run(?DateTimeImmutable $now = null): NcscRunResult
    {
        $now = ($now ?? new DateTimeImmutable('now', new DateTimeZone('UTC')))
            ->setTimezone(new DateTimeZone('UTC'));
        $lock = $this->database->fetchOne(
            'SELECT GET_LOCK(:lock_name, 0) AS acquired',
            ['lock_name' => self::LOCK_NAME],
        );
        if ((int) ($lock['acquired'] ?? 0) !== 1) {
            return new NcscRunResult('skipped', 0, 0, 1, 0, null);
        }

        try {
            return $this->runLocked($now);
        } finally {
            try {
                $this->database->fetchOne(
                    'SELECT RELEASE_LOCK(:lock_name) AS released',
                    ['lock_name' => self::LOCK_NAME],
                );
            } catch (Throwable) {
                // The database releases a connection-scoped advisory lock when the connection closes.
            }
        }
    }

    private function runLocked(DateTimeImmutable $now): NcscRunResult
    {
        try {
            $targets = $this->source->targets($now);
        } catch (Throwable $error) {
            $this->writeLog(
                self::EMPTY_URL,
                'RSS-virhe',
                null,
                $now,
                0,
                'unknown',
                self::safeMessage($error),
            );
            return new NcscRunResult('failed', 0, 0, 0, 1, null);
        }

        if ($targets === []) {
            $this->writeLog(self::EMPTY_URL, 'RSS-syöte tyhjä', null, $now, 0, 'unknown', 'no_targets');
            return new NcscRunResult('completed', 0, 0, 0, 0, null);
        }

        $alertsCreated = 0;
        $processed = 0;
        $skipped = 0;
        $errors = 0;
        $firstUrl = null;
        foreach ($targets as $target) {
            $firstUrl ??= $target->url;
            $recent = $this->recentlyProcessed($target->url, $now);
            if ($recent !== null) {
                $skipped += 1;
                $this->writeLog(
                    $target->url,
                    self::shorten((string) ($recent['week_label'] ?? 'Ohitettu'), 100),
                    $target->publishedAt,
                    $now,
                    0,
                    (string) ($recent['structure_version'] ?? 'unknown'),
                    'recently_processed',
                );
                continue;
            }

            try {
                $result = $this->source->scrape($target, $now);
                $created = $this->storeResult($result, $now);
                $alertsCreated += $created;
                $processed += 1;
            } catch (Throwable $error) {
                $errors += 1;
                $this->writeLog(
                    $target->url,
                    'Ajovirhe',
                    $target->publishedAt,
                    $now,
                    0,
                    'unknown',
                    self::safeMessage($error),
                );
            }
        }

        return new NcscRunResult(
            $errors > 0 ? 'failed' : 'completed',
            $alertsCreated,
            $processed,
            $skipped,
            $errors,
            $firstUrl,
        );
    }

    /** @return array{week_label?: mixed, structure_version?: mixed}|null */
    private function recentlyProcessed(string $url, DateTimeImmutable $now): ?array
    {
        $cutoff = $now->sub(new DateInterval('P' . self::RECENT_DAYS . 'D'));
        return $this->database->fetchOne(
            'SELECT week_label, structure_version FROM ncsc_scrape_logs '
            . 'WHERE source_url = :source_url AND processed_at >= :cutoff '
            . "AND alerts_created > 0 AND structure_version <> 'unknown' "
            . 'ORDER BY processed_at DESC LIMIT 1',
            [
                'source_url' => $url,
                'cutoff' => self::databaseDate($cutoff),
            ],
        );
    }

    private function storeResult(NcscScrapeResult $result, DateTimeImmutable $now): int
    {
        return $this->database->transaction(function (DatabaseConnection $database) use ($result, $now): int {
            $created = 0;
            foreach ($result->items as $item) {
                $existing = $database->fetchOne(
                    'SELECT id FROM scam_alerts WHERE source_url = :source_url AND original_heading = :original_heading LIMIT 1 FOR UPDATE',
                    ['source_url' => $result->url, 'original_heading' => $item->heading],
                );
                $id = is_string($existing['id'] ?? null)
                    ? (string) $existing['id']
                    : Uuid::deterministic('ncsc-alert', $result->url . "\n" . $item->heading);
                $affected = $database->execute(
                    'INSERT INTO scam_alerts '
                    . '(id, title, body, severity, active, source, source_url, source_week, original_heading, '
                    . 'structure_version, created_at, updated_at, expires_at) '
                    . 'VALUES (:id, :title, :body, :severity, 1, :source, :source_url, :source_week, :original_heading, '
                    . ':structure_version, :created_at, :updated_at, :expires_at) '
                    . 'ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body), severity = VALUES(severity), '
                    . 'active = 1, source = VALUES(source), source_url = VALUES(source_url), source_week = VALUES(source_week), '
                    . 'original_heading = VALUES(original_heading), structure_version = VALUES(structure_version), '
                    . 'updated_at = VALUES(updated_at), expires_at = VALUES(expires_at)',
                    [
                        'id' => $id,
                        'title' => self::shorten($item->heading, 80),
                        'body' => self::shorten($item->body, 300),
                        'severity' => 'warning',
                        'source' => 'ncsc-auto',
                        'source_url' => $result->url,
                        'source_week' => $result->weekLabel,
                        'original_heading' => $item->heading,
                        'structure_version' => $result->structureVersion,
                        'created_at' => self::databaseDate($now),
                        'updated_at' => self::databaseDate($now),
                        'expires_at' => self::databaseDate($now->add(new DateInterval('P' . self::ALERT_TTL_DAYS . 'D'))),
                    ],
                );
                if ($affected === 1 && $existing === null) {
                    $created += 1;
                }
            }
            $this->writeLogWithDatabase(
                $database,
                $result->url,
                $result->weekLabel,
                $result->publishedAt,
                $now,
                $created,
                $result->structureVersion,
                $result->items === [] ? 'no_items' : null,
            );
            return $created;
        });
    }

    private function writeLog(
        string $url,
        string $weekLabel,
        ?DateTimeImmutable $publishedAt,
        DateTimeImmutable $processedAt,
        int $alertsCreated,
        string $structureVersion,
        ?string $message,
    ): void {
        $this->writeLogWithDatabase(
            $this->database,
            $url,
            $weekLabel,
            $publishedAt,
            $processedAt,
            $alertsCreated,
            $structureVersion,
            $message,
        );
    }

    private function writeLogWithDatabase(
        DatabaseConnection $database,
        string $url,
        string $weekLabel,
        ?DateTimeImmutable $publishedAt,
        DateTimeImmutable $processedAt,
        int $alertsCreated,
        string $structureVersion,
        ?string $message,
    ): void {
        $database->execute(
            'INSERT INTO ncsc_scrape_logs '
            . '(id, source_url, week_label, published_at, processed_at, alerts_created, structure_version, message) '
            . 'VALUES (:id, :source_url, :week_label, :published_at, :processed_at, :alerts_created, :structure_version, :message)',
            [
                'id' => Uuid::generate(),
                'source_url' => self::shorten($url, 2048),
                'week_label' => self::shorten($weekLabel, 100),
                'published_at' => $publishedAt === null ? null : self::databaseDate($publishedAt),
                'processed_at' => self::databaseDate($processedAt),
                'alerts_created' => max(0, $alertsCreated),
                'structure_version' => in_array($structureVersion, ['2026', '2025', 'news', 'unknown'], true)
                    ? $structureVersion
                    : 'unknown',
                'message' => $message === null ? null : self::shorten($message, 1000),
            ],
        );
    }

    private static function databaseDate(DateTimeImmutable $date): string
    {
        return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u');
    }

    private static function safeMessage(Throwable $error): string
    {
        $message = trim((string) preg_replace('/\s+/u', ' ', $error->getMessage()));
        return preg_match('/^ncsc_[a-z0-9_]+$/D', $message) === 1
            ? $message
            : 'ncsc_job_failed';
    }

    private static function shorten(string $value, int $maxLength): string
    {
        if (function_exists('mb_strlen') && function_exists('mb_substr')) {
            return mb_strlen($value, 'UTF-8') <= $maxLength
                ? $value
                : mb_substr($value, 0, $maxLength, 'UTF-8');
        }
        $length = iconv_strlen($value, 'UTF-8');
        if ($length !== false && $length <= $maxLength) {
            return $value;
        }
        $substring = iconv_substr($value, 0, $maxLength, 'UTF-8');
        return $substring === false ? substr($value, 0, $maxLength) : $substring;
    }
}
