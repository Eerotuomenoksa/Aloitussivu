<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class DatabaseRateLimiter implements RateLimiter
{
    public function __construct(
        private readonly DatabaseConnection $database,
        private readonly string $secret,
    ) {
    }

    /** @return array{allowed: bool, remaining: int, retry_after: int} */
    public function consume(string $route, string $clientAddress, int $limit, int $windowSeconds, ?int $now = null): array
    {
        if ($limit < 1 || $windowSeconds < 1 || strlen($route) > 120) {
            throw new \InvalidArgumentException('Invalid rate limit configuration.');
        }

        $now ??= time();
        $windowTimestamp = intdiv($now, $windowSeconds) * $windowSeconds;
        $windowStart = gmdate('Y-m-d H:i:s', $windowTimestamp);
        $expiresAt = gmdate('Y-m-d H:i:s', $windowTimestamp + $windowSeconds);
        $bucketHash = hash_hmac('sha256', $clientAddress, $this->secret, true);

        return $this->database->transaction(function (DatabaseConnection $database) use (
            $bucketHash,
            $route,
            $windowStart,
            $expiresAt,
            $limit,
            $windowSeconds,
            $windowTimestamp,
            $now,
        ): array {
            $database->execute(
                'INSERT INTO rate_limit_buckets '
                . '(bucket_hash, route, window_started_at, request_count, expires_at) '
                . 'VALUES (:bucket_hash, :route, :window_started_at, 1, :expires_at) '
                . 'ON DUPLICATE KEY UPDATE request_count = LEAST(request_count + 1, 65535), '
                . 'expires_at = VALUES(expires_at)',
                [
                    'bucket_hash' => $bucketHash,
                    'route' => $route,
                    'window_started_at' => $windowStart,
                    'expires_at' => $expiresAt,
                ],
            );
            $row = $database->fetchOne(
                'SELECT request_count FROM rate_limit_buckets '
                . 'WHERE bucket_hash = :bucket_hash AND route = :route AND window_started_at = :window_started_at',
                [
                    'bucket_hash' => $bucketHash,
                    'route' => $route,
                    'window_started_at' => $windowStart,
                ],
            );
            $count = (int) ($row['request_count'] ?? $limit + 1);
            return [
                'allowed' => $count <= $limit,
                'remaining' => max(0, $limit - $count),
                'retry_after' => max(1, $windowTimestamp + $windowSeconds - $now),
            ];
        });
    }
}
