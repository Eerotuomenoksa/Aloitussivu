<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class LinkCheckResult
{
    public function __construct(
        public readonly string $status,
        public readonly ?int $httpStatus,
        public readonly ?string $finalUrl,
        public readonly ?string $errorCode,
        public readonly int $responseMs,
        // LC-07: tosi kun uudelleenohjaus vie toiseen rekisteroitavaan verkkotunnukseen.
        public readonly bool $domainChanged = false,
        // LC-04: palvelimen pyytama odotusaika (Retry-After) sekunteina, jos se oli jarkeva.
        public readonly ?int $retryAfterSeconds = null,
    ) {
        if (!in_array($status, ['ok', 'warning', 'failed', 'rejected'], true)) {
            throw new \InvalidArgumentException('Unsupported link-check status.');
        }
    }
}
