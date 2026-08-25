<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

interface RateLimiter
{
    /** @return array{allowed: bool, remaining: int, retry_after: int} */
    public function consume(
        string $route,
        string $clientAddress,
        int $limit,
        int $windowSeconds,
        ?int $now = null,
    ): array;
}
