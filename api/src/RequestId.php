<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class RequestId
{
    public static function resolve(?string $candidate): string
    {
        $candidate = trim((string) $candidate);
        if ($candidate !== '' && preg_match('/^[A-Za-z0-9_-]{8,64}$/D', $candidate) === 1) {
            return $candidate;
        }

        return bin2hex(random_bytes(16));
    }
}
