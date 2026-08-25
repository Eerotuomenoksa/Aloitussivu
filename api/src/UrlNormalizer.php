<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class UrlNormalizer
{
    public static function https(string $value, string $field = 'url', int $max = 2048): string
    {
        $normalized = self::httpUrl($value, ['https'], $field, $max);
        if ($normalized === null) {
            throw Validator::invalidField($field);
        }
        return $normalized;
    }

    public static function trackable(string $value, string $field = 'url', int $max = 500): string
    {
        $value = trim($value);
        if (strlen($value) > $max) {
            throw Validator::invalidField($field);
        }

        $scheme = strtolower((string) parse_url($value, PHP_URL_SCHEME));
        if (in_array($scheme, ['http', 'https'], true)) {
            $normalized = self::httpUrl($value, ['http', 'https'], $field, $max);
            if ($normalized !== null) {
                return $normalized;
            }
        }
        if ($scheme === 'mailto') {
            $address = substr($value, 7);
            if ($address !== '' && filter_var($address, FILTER_VALIDATE_EMAIL) !== false) {
                return 'mailto:' . $address;
            }
        }
        if ($scheme === 'tel') {
            $number = substr($value, 4);
            if (preg_match('/^\+?[0-9(). -]{3,40}$/D', $number) === 1) {
                return 'tel:' . $number;
            }
        }

        throw Validator::invalidField($field);
    }

    /** @param list<string> $allowedSchemes */
    private static function httpUrl(
        string $value,
        array $allowedSchemes,
        string $field,
        int $max,
    ): ?string {
        $value = trim($value);
        if (strlen($value) > $max || filter_var($value, FILTER_VALIDATE_URL) === false) {
            return null;
        }
        $parts = parse_url($value);
        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            return null;
        }
        $scheme = strtolower((string) $parts['scheme']);
        if (!in_array($scheme, $allowedSchemes, true) || isset($parts['user']) || isset($parts['pass'])) {
            return null;
        }

        $host = strtolower((string) $parts['host']);
        $port = isset($parts['port']) ? (int) $parts['port'] : null;
        if (($scheme === 'https' && $port === 443) || ($scheme === 'http' && $port === 80)) {
            $port = null;
        }
        $path = (string) ($parts['path'] ?? '');
        $query = isset($parts['query']) ? '?' . $parts['query'] : '';
        $normalized = $scheme . '://' . $host . ($port === null ? '' : ':' . $port) . $path . $query;
        return strlen($normalized) <= $max ? $normalized : null;
    }
}
