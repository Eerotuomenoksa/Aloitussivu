<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateInterval;
use DateTimeImmutable;
use DateTimeZone;
use Throwable;

final class LinkCheckJob
{
    private const LOCK_NAME = 'aloitussivu:link-check';
    private const MAX_TARGETS_PER_HOST = 3;
    private const CONNECTIVITY_ANCHOR = 'https://www.suomi.fi/';
    private const RUN_BUDGET_SECONDS = 120;
    private const NETWORK_FAILURE_CODES = [
        'dns_failed',
        'connection_failed',
        'timeout',
        'request_failed',
    ];

    public function __construct(
        private readonly DatabaseConnection $database,
        private readonly Config $config,
        private readonly LinkCatalog $catalog,
        private readonly LinkChecker $checker,
    ) {
    }

    /** @return array<string, int|string> */
    public function run(?DateTimeImmutable $now = null): array
    {
        if (!$this->config->linkCheckEnabled) {
            return $this->emptyResult('disabled');
        }
        $now = ($now ?? new DateTimeImmutable('now', new DateTimeZone('UTC')))->setTimezone(new DateTimeZone('UTC'));
        $runDeadline = hrtime(true) + self::RUN_BUDGET_SECONDS * 1_000_000_000;
        $lock = $this->database->fetchOne(
            'SELECT GET_LOCK(:lock_name, 0) AS acquired',
            ['lock_name' => self::LOCK_NAME],
        );
        if ((int) ($lock['acquired'] ?? 0) !== 1) {
            return $this->emptyResult('skipped');
        }

        $runId = Uuid::generate();
        $result = $this->emptyResult('completed');
        try {
            $this->startRun($runId, $now);
            $catalogCount = $this->syncCatalog($now);
            $approvedCount = $this->syncApprovedLinks($now);
            $result['catalogCount'] = $catalogCount;
            $result['approvedCount'] = $approvedCount;

            // LC-09: do not let a failure in our own DNS, firewall or uplink turn into
            // hundreds of false failures. The anchor is not a catalog result and is not
            // persisted; it only verifies that outbound HTTPS is usable for this run.
            $anchor = $this->safeCheck(self::CONNECTIVITY_ANCHOR);
            if ($this->isNetworkFailure($anchor)) {
                $result['status'] = 'skipped';
                $result['messageCode'] = $this->networkSuspectCode($runId);
                $this->finishRun($runId, $result, $now, (string) $result['messageCode']);
                return $result;
            }

            // Read the whole bounded due set so a large single host cannot starve later hosts.
            $candidateLimit = 20000;
            $candidates = $this->database->fetchAll(
                'SELECT url_hash, url, last_status, failure_count, check_interval_hours FROM link_check_targets '
                . 'WHERE (catalog_active = 1 OR approved_active = 1) AND next_check_at <= :now '
                . "ORDER BY CASE last_status WHEN 'failed' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, next_check_at "
                . 'LIMIT ' . $candidateLimit,
                ['now' => self::databaseDate($now)],
            );
            $targets = $this->fairBatch($candidates);
            $observations = [];
            $urlToTarget = [];
            foreach ($targets as $target) {
                $url = (string) ($target['url'] ?? '');
                $urlToTarget[$url] = $target;
            }
            if (hrtime(true) < $runDeadline && $urlToTarget !== []) {
                $checks = $this->checkBatch(array_keys($urlToTarget), $runDeadline, 4);
                foreach ($checks as $url => $check) {
                    if (!isset($urlToTarget[$url])) {
                        continue;
                    }
                    $target = $urlToTarget[$url];
                    $previousFailures = max(0, (int) ($target['failure_count'] ?? 0));
                    $failures = $check->status === 'failed'
                        ? min(65535, $previousFailures + 1)
                        : 0;
                    $intervalHours = $this->adaptiveIntervalHours(
                        $check->status,
                        max($this->config->linkCheckMinIntervalHours, (int) ($target['check_interval_hours'] ?? 0)),
                    );
                    $observations[] = [
                        'target' => $target,
                        'check' => $check,
                        'failures' => $failures,
                        'intervalHours' => $intervalHours,
                    ];
                    $this->countCheck($result, $check);
                }
            } elseif ($targets !== []) {
                $result['messageCode'] = 'time_budget_reached';
            }

            // Results must remain in memory until this decision has been made. Otherwise
            // the first failures of a broken network would already be persisted.
            if ($this->isSuspectBatch($observations)) {
                $result['status'] = 'skipped';
                $result['messageCode'] = $this->networkSuspectCode($runId);
                $this->finishRun($runId, $result, $now, (string) $result['messageCode']);
                return $result;
            }

            foreach ($observations as $observation) {
                /** @var array<string, mixed> $target */
                $target = $observation['target'];
                /** @var LinkCheckResult $check */
                $check = $observation['check'];
                $failures = (int) $observation['failures'];
                $intervalHours = (int) $observation['intervalHours'];
                $next = $this->nextCheck($now, $check, $failures, $intervalHours);
                $this->storeCheck($runId, (string) ($target['url_hash'] ?? ''), $check, $failures, $intervalHours, $now, $next);
            }

            // LC-02: blocking and recovery have separate feature flags. Recovery must remain
            // available when new automatic blocks are disabled.
            if ($this->config->linkCheckAutoBlockEnabled) {
                $result['blocked'] = $this->autoBlock($now);
            }
            if ($this->config->linkCheckAutoUnblockEnabled) {
                $result['unblocked'] = $this->autoUnblock();
            }
            $deleted = $this->database->execute(
                'DELETE FROM link_check_results WHERE checked_at < :cutoff LIMIT 5000',
                ['cutoff' => self::databaseDate($now->sub(new DateInterval('P180D')))],
            );
            $result['historyDeleted'] = max(0, $deleted);
            $messageCode = (string) ($result['messageCode'] ?? '');
            $this->finishRun($runId, $result, $now, $messageCode !== '' ? $messageCode : null);
        } catch (Throwable $error) {
            $result['status'] = 'failed';
            $this->finishRun($runId, $result, $now, self::safeError($error));
        } finally {
            try {
                $this->database->fetchOne(
                    'SELECT RELEASE_LOCK(:lock_name) AS released',
                    ['lock_name' => self::LOCK_NAME],
                );
            } catch (Throwable) {
                // Connection-scoped advisory locks are released when the database connection closes.
            }
        }
        return $result;
    }

    private function syncCatalog(DateTimeImmutable $now): int
    {
        $current = $this->database->fetchOne(
            'SELECT checksum FROM link_check_catalogs WHERE catalog_id = 1 LIMIT 1',
        );
        if (($current['checksum'] ?? null) === $this->catalog->checksum) {
            return count($this->catalog->links);
        }
        $timestamp = self::databaseDate($now);
        $this->database->transaction(function (DatabaseConnection $database) use ($timestamp, $now): void {
            $database->execute('UPDATE link_check_targets SET catalog_active = 0 WHERE catalog_active = 1');
            foreach ($this->catalog->links as $link) {
                $urlHash = hash('sha256', $link['url']);
                $database->execute(
                    'INSERT INTO link_check_targets '
                    . '(url_hash, url, name, category, source, catalog_active, next_check_at, check_interval_hours, created_at, updated_at) '
                    . 'VALUES (:url_hash, :url, :name, :category, :source, 1, :next_check_at, :check_interval_hours, :created_at, :updated_at) '
                    . 'ON DUPLICATE KEY UPDATE url = VALUES(url), name = VALUES(name), category = VALUES(category), '
                    . 'source = VALUES(source), catalog_active = 1, updated_at = VALUES(updated_at)',
                    [
                        'url_hash' => $urlHash,
                        'url' => $link['url'],
                        'name' => $link['name'],
                        'category' => $link['category'],
                        'source' => $link['source'],
                        'next_check_at' => self::databaseDate($this->initialNextCheck($now, $urlHash)),
                        'check_interval_hours' => $this->config->linkCheckMinIntervalHours,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ],
                );
            }
            $database->execute(
                'INSERT INTO link_check_catalogs (catalog_id, checksum, source_count, updated_at) '
                . 'VALUES (1, :checksum, :source_count, :updated_at) '
                . 'ON DUPLICATE KEY UPDATE checksum = VALUES(checksum), source_count = VALUES(source_count), updated_at = VALUES(updated_at)',
                [
                    'checksum' => $this->catalog->checksum,
                    'source_count' => count($this->catalog->links),
                    'updated_at' => $timestamp,
                ],
            );
        });
        return count($this->catalog->links);
    }

    private function syncApprovedLinks(DateTimeImmutable $now): int
    {
        $links = $this->database->fetchAll(
            'SELECT name, url, category, source FROM approved_links ORDER BY created_at LIMIT 5000',
        );
        $timestamp = self::databaseDate($now);
        $this->database->transaction(function (DatabaseConnection $database) use ($links, $timestamp, $now): void {
            $database->execute('UPDATE link_check_targets SET approved_active = 0 WHERE approved_active = 1');
            foreach ($links as $link) {
                $url = trim((string) ($link['url'] ?? ''));
                if ($url === '' || strlen($url) > 2048) continue;
                $urlHash = hash('sha256', $url);
                $database->execute(
                    'INSERT INTO link_check_targets '
                    . '(url_hash, url, name, category, source, approved_active, next_check_at, check_interval_hours, created_at, updated_at) '
                    . 'VALUES (:url_hash, :url, :name, :category, :source, 1, :next_check_at, :check_interval_hours, :created_at, :updated_at) '
                    . 'ON DUPLICATE KEY UPDATE url = VALUES(url), name = VALUES(name), category = VALUES(category), '
                    . 'source = VALUES(source), approved_active = 1, updated_at = VALUES(updated_at)',
                    [
                        'url_hash' => $urlHash,
                        'url' => $url,
                        'name' => self::shorten((string) ($link['name'] ?? 'Hyväksytty linkki'), 160),
                        'category' => self::shorten((string) ($link['category'] ?? 'Ylläpidon linkit'), 255),
                        'source' => self::shorten((string) ($link['source'] ?? 'approved-links'), 255),
                        'next_check_at' => self::databaseDate($this->initialNextCheck($now, $urlHash)),
                        'check_interval_hours' => $this->config->linkCheckMinIntervalHours,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ],
                );
            }
        });
        return count($links);
    }

    private function storeCheck(
        string $runId,
        string $urlHash,
        LinkCheckResult $check,
        int $failures,
        int $intervalHours,
        DateTimeImmutable $now,
        DateTimeImmutable $next,
    ): void {
        $checkedAt = self::databaseDate($now);
        $parameters = [
            'url_hash' => $urlHash,
            'last_checked_at' => $checkedAt,
            'next_check_at' => self::databaseDate($next),
            'last_status' => $check->status,
            'http_status' => $check->httpStatus,
            'final_url' => self::nullableShorten($check->finalUrl, 2048),
            'failure_count' => $failures,
            'check_interval_hours' => $intervalHours,
            'last_error_code' => self::nullableShorten($check->errorCode, 80),
            'response_ms' => $check->responseMs,
            'final_domain_changed' => $check->domainChanged ? 1 : 0,
        ];
        $this->database->transaction(function (DatabaseConnection $database) use ($runId, $check, $failures, $checkedAt, $parameters): void {
            $database->execute(
                'UPDATE link_check_targets SET last_checked_at = :last_checked_at, next_check_at = :next_check_at, '
                . 'last_status = :last_status, http_status = :http_status, final_url = :final_url, failure_count = :failure_count, '
                . 'check_interval_hours = :check_interval_hours, last_error_code = :last_error_code, response_ms = :response_ms, '
                . 'final_domain_changed = :final_domain_changed WHERE url_hash = :url_hash',
                $parameters,
            );
            $database->execute(
                'INSERT INTO link_check_results '
                . '(run_id, url_hash, checked_at, status, http_status, final_url, error_code, response_ms, consecutive_failures) '
                . 'VALUES (:run_id, :url_hash, :checked_at, :status, :http_status, :final_url, :error_code, :response_ms, :consecutive_failures)',
                [
                    'run_id' => $runId,
                    'url_hash' => $parameters['url_hash'],
                    'checked_at' => $checkedAt,
                    'status' => $check->status,
                    'http_status' => $check->httpStatus,
                    'final_url' => $parameters['final_url'],
                    'error_code' => $parameters['last_error_code'],
                    'response_ms' => $check->responseMs,
                    'consecutive_failures' => $failures,
                ],
            );
        });
    }

    private function startRun(string $runId, DateTimeImmutable $now): void
    {
        $this->database->execute(
            "INSERT INTO link_check_runs (id, started_at, status) VALUES (:id, :started_at, 'running')",
            ['id' => $runId, 'started_at' => self::databaseDate($now)],
        );
    }

    /** @param array<string, int|string> $result */
    private function finishRun(string $runId, array $result, DateTimeImmutable $now, ?string $message): void
    {
        try {
            $this->database->execute(
                'UPDATE link_check_runs SET finished_at = :finished_at, status = :status, catalog_count = :catalog_count, '
                . 'approved_count = :approved_count, checked_count = :checked_count, ok_count = :ok_count, '
                . 'warning_count = :warning_count, failed_count = :failed_count, rejected_count = :rejected_count, '
                . 'blocked_count = :blocked_count, unblocked_count = :unblocked_count, '
                . 'history_deleted = :history_deleted, message_code = :message_code WHERE id = :id',
                [
                    'id' => $runId,
                    'finished_at' => self::databaseDate($now),
                    'status' => $result['status'],
                    'catalog_count' => $result['catalogCount'],
                    'approved_count' => $result['approvedCount'],
                    'checked_count' => $result['checked'],
                    'ok_count' => $result['ok'],
                    'warning_count' => $result['warnings'],
                    'failed_count' => $result['failed'],
                    'rejected_count' => $result['rejected'],
                    'blocked_count' => $result['blocked'],
                    'unblocked_count' => $result['unblocked'],
                    'history_deleted' => $result['historyDeleted'],
                    'message_code' => $message,
                ],
            );
        } catch (Throwable) {
            // Preserve the original job outcome even if history finalization fails.
        }
    }

    private function initialNextCheck(DateTimeImmutable $now, string $urlHash): DateTimeImmutable
    {
        $spreadMinutes = max(1, $this->config->linkCheckMinIntervalHours * 60);
        $offsetMinutes = hexdec(substr($urlHash, 0, 6)) % $spreadMinutes;
        return $now->add(new DateInterval('PT' . $offsetMinutes . 'M'));
    }

    private function adaptiveIntervalHours(string $status, int $previousHours): int
    {
        $minimum = $this->config->linkCheckMinIntervalHours;
        $maximum = max($minimum, $this->config->linkCheckRefreshDays * 24);
        if ($status !== 'ok') {
            return $minimum;
        }
        return min($maximum, max($minimum, (int) ceil($previousHours * 1.5)));
    }

    private function nextCheck(
        DateTimeImmutable $now,
        LinkCheckResult $check,
        int $failures,
        int $intervalHours,
    ): DateTimeImmutable {
        if ($check->status === 'rejected') {
            return new DateTimeImmutable('9999-12-31T00:00:00+00:00');
        }
        if ($check->status === 'failed') {
            $secondRetryHours = $this->config->linkCheckRetryHours;
            $retryHours = match (true) {
                $failures <= 1 => min(6, $secondRetryHours),
                $failures === 2 => $secondRetryHours,
                $failures === 3 => min(168, max($secondRetryHours, $secondRetryHours * 3)),
                default => 168,
            };
            return $now->add(new DateInterval('PT' . $retryHours . 'H'));
        }
        if ($check->retryAfterSeconds !== null) {
            return $now->add(new DateInterval('PT' . $check->retryAfterSeconds . 'S'));
        }
        return $now->add(new DateInterval('PT' . $intervalHours . 'H'));
    }

    private function safeCheck(string $url): LinkCheckResult
    {
        try {
            return $this->checker->check($url);
        } catch (Throwable) {
            return new LinkCheckResult('failed', null, null, 'request_failed', 0);
        }
    }

    /** @param list<string> $urls @return array<string, LinkCheckResult> */
    private function checkBatch(array $urls, int $deadline, int $concurrency): array
    {
        if ($this->checker instanceof HttpLinkChecker) {
            return $this->checker->checkBatch($urls, $deadline, $concurrency);
        }
        $results = [];
        foreach ($urls as $url) {
            if (hrtime(true) >= $deadline) {
                break;
            }
            $results[$url] = $this->safeCheck($url);
        }
        return $results;
    }

    /** @param array<string, int|string> $result */
    private function countCheck(array &$result, LinkCheckResult $check): void
    {
        $result['checked'] += 1;
        $key = match ($check->status) {
            'ok' => 'ok',
            'warning' => 'warnings',
            'rejected' => 'rejected',
            default => 'failed',
        };
        $result[$key] += 1;
    }

    private function isNetworkFailure(LinkCheckResult $check): bool
    {
        return $check->status === 'failed'
            && in_array($check->errorCode, self::NETWORK_FAILURE_CODES, true);
    }

    /** @param list<array{target: array<string, mixed>, check: LinkCheckResult, failures: int, intervalHours: int}> $observations */
    private function isSuspectBatch(array $observations): bool
    {
        $total = count($observations);
        if ($total === 0) {
            return false;
        }
        $networkFailures = count(array_filter(
            $observations,
            fn (array $observation): bool => $this->isNetworkFailure($observation['check'])
                && ($observation['target']['last_status'] ?? null) !== 'failed',
        ));
        return $networkFailures * 100 > $total * 60;
    }

    private function networkSuspectCode(string $runId): string
    {
        $previous = $this->database->fetchOne(
            'SELECT message_code FROM link_check_runs '
            . 'WHERE id <> :id ORDER BY started_at DESC LIMIT 1',
            ['id' => $runId],
        );
        return in_array(($previous['message_code'] ?? null), ['network_suspect', 'network_suspect_repeated'], true)
            ? 'network_suspect_repeated'
            : 'network_suspect';
    }

    private function autoBlock(DateTimeImmutable $now): int
    {
        $candidates = $this->database->fetchAll(
            'SELECT t.url_hash, t.url, t.last_error_code, t.http_status '
            . 'FROM link_check_targets t '
            . 'LEFT JOIN blocked_links b ON b.url_hash = UNHEX(t.url_hash) '
            . "LEFT JOIN link_check_overrides o ON o.url_hash = t.url_hash AND o.scope = 'all' "
            . "AND o.status IN ('verified', 'exception') AND o.next_review_at >= :override_now "
            . 'WHERE (t.catalog_active = 1 OR t.approved_active = 1) '
            . "AND t.last_status = 'failed' AND t.failure_count >= :threshold AND b.id IS NULL AND o.id IS NULL "
            . "AND ((t.last_error_code = 'http_status_error' AND t.http_status IN (404, 410)) "
            . "OR t.last_error_code IN ('dns_failed', 'tls_failed', 'too_many_redirects', "
            . "'redirect_location_missing', 'domain_for_sale')) "
            . 'ORDER BY t.failure_count DESC, t.last_checked_at ASC '
            . 'LIMIT ' . $this->config->linkCheckAutoBlockMaxPerRun,
            [
                'threshold' => $this->config->linkCheckAlertAfterFailures,
                'override_now' => self::databaseDate($now),
            ],
        );
        $blocked = 0;
        $createdAt = self::databaseDate($now);
        foreach ($candidates as $candidate) {
            $url = trim((string) ($candidate['url'] ?? ''));
            $urlHash = strtolower((string) ($candidate['url_hash'] ?? ''));
            if ($url === '' || preg_match('/^[a-f0-9]{64}$/D', $urlHash) !== 1) {
                continue;
            }
            $errorCode = (string) ($candidate['last_error_code'] ?? 'unknown');
            $status = isset($candidate['http_status']) ? (int) $candidate['http_status'] : null;
            $reason = 'auto:' . $errorCode;
            if ($status !== null && $status > 0) {
                $reason .= ':' . $status;
            }
            $inserted = $this->database->execute(
                'INSERT IGNORE INTO blocked_links (id, url, url_hash, reason, created_at, created_by) '
                . 'VALUES (:id, :url, :url_hash, :reason, :created_at, NULL)',
                [
                    'id' => Uuid::generate(),
                    'url' => $url,
                    'url_hash' => hash('sha256', $url, true),
                    'reason' => $reason,
                    'created_at' => $createdAt,
                ],
            );
            if ($inserted < 1) {
                continue;
            }
            $this->database->execute(
                'UPDATE link_check_targets SET auto_blocked_at = :auto_blocked_at WHERE url_hash = :url_hash',
                ['auto_blocked_at' => $createdAt, 'url_hash' => $urlHash],
            );
            $blocked += 1;
        }
        return $blocked;
    }

    private function autoUnblock(): int
    {
        $candidates = $this->database->fetchAll(
            'SELECT b.id, t.url_hash FROM blocked_links b '
            . 'INNER JOIN link_check_targets t ON b.url_hash = UNHEX(t.url_hash) '
            . "WHERE b.created_by IS NULL AND b.reason LIKE 'auto:%' "
            . "AND t.last_status = 'ok' AND t.failure_count = 0 LIMIT 500",
        );
        $unblocked = 0;
        foreach ($candidates as $candidate) {
            $id = (string) ($candidate['id'] ?? '');
            $urlHash = strtolower((string) ($candidate['url_hash'] ?? ''));
            if ($id === '' || preg_match('/^[a-f0-9]{64}$/D', $urlHash) !== 1) {
                continue;
            }
            $deleted = $this->database->execute(
                "DELETE FROM blocked_links WHERE id = :id AND created_by IS NULL AND reason LIKE 'auto:%'",
                ['id' => $id],
            );
            if ($deleted < 1) {
                continue;
            }
            $this->database->execute(
                'UPDATE link_check_targets SET auto_blocked_at = NULL WHERE url_hash = :url_hash',
                ['url_hash' => $urlHash],
            );
            $unblocked += 1;
        }
        return $unblocked;
    }

    /**
     * @param list<array<string, mixed>> $candidates
     * @return list<array<string, mixed>>
     */
    private function fairBatch(array $candidates): array
    {
        $selected = [];
        $hostCounts = [];
        foreach ($candidates as $candidate) {
            $host = strtolower((string) parse_url((string) ($candidate['url'] ?? ''), PHP_URL_HOST));
            if ($host === '') {
                $host = 'invalid:' . (string) ($candidate['url_hash'] ?? count($selected));
            }
            if (($hostCounts[$host] ?? 0) >= self::MAX_TARGETS_PER_HOST) {
                continue;
            }
            $hostCounts[$host] = ($hostCounts[$host] ?? 0) + 1;
            $selected[] = $candidate;
            if (count($selected) >= $this->config->linkCheckBatchSize) {
                break;
            }
        }
        return $selected;
    }

    /** @return array<string, int|string> */
    private function emptyResult(string $status): array
    {
        return [
            'status' => $status,
            'catalogCount' => 0,
            'approvedCount' => 0,
            'checked' => 0,
            'ok' => 0,
            'warnings' => 0,
            'failed' => 0,
            'rejected' => 0,
            'blocked' => 0,
            'unblocked' => 0,
            'historyDeleted' => 0,
            'messageCode' => '',
        ];
    }

    private static function databaseDate(DateTimeImmutable $date): string
    {
        return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u');
    }

    private static function safeError(Throwable $error): string
    {
        $message = trim($error->getMessage());
        return preg_match('/^link_[a-z0-9_]+$/D', $message) === 1 ? $message : 'link_check_job_failed';
    }

    private static function shorten(string $value, int $length): string
    {
        $value = trim(preg_replace('/\s+/u', ' ', $value) ?? '');
        if ($value === '') return '-';
        if (function_exists('mb_strlen') && function_exists('mb_substr')) {
            return mb_strlen($value, 'UTF-8') <= $length ? $value : mb_substr($value, 0, $length, 'UTF-8');
        }
        $valueLength = iconv_strlen($value, 'UTF-8');
        if ($valueLength === false || $valueLength <= $length) return $value;
        $short = iconv_substr($value, 0, $length, 'UTF-8');
        return $short === false ? substr($value, 0, $length) : $short;
    }

    private static function nullableShorten(?string $value, int $length): ?string
    {
        if ($value === null || trim($value) === '') return null;
        return self::shorten($value, $length);
    }
}
