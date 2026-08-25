<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class OriginPolicy
{
    public function __construct(private readonly string $allowedOrigin)
    {
    }

    /** @return array<string, string> */
    public function headersFor(Request $request): array
    {
        $origin = $request->header('origin');
        if ($origin === '') {
            return [];
        }
        if ($this->normalize($origin) !== $this->normalize($this->allowedOrigin)) {
            throw new ApiException(403, 'origin_not_allowed', 'Pyynnön origin ei ole sallittu.');
        }

        return [
            'Access-Control-Allow-Origin' => $this->allowedOrigin,
            'Vary' => 'Origin',
        ];
    }

    private function normalize(string $origin): string
    {
        $parts = parse_url(trim($origin));
        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            return '';
        }
        foreach (['user', 'pass', 'path', 'query', 'fragment'] as $component) {
            if (isset($parts[$component]) && $parts[$component] !== '') {
                return '';
            }
        }

        $scheme = strtolower((string) $parts['scheme']);
        $host = strtolower((string) $parts['host']);
        $port = isset($parts['port']) ? (int) $parts['port'] : null;
        if (($scheme === 'https' && $port === 443) || ($scheme === 'http' && $port === 80)) {
            $port = null;
        }

        return $scheme . '://' . $host . ($port === null ? '' : ':' . $port);
    }
}
