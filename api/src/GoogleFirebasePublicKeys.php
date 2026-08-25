<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use JsonException;
use RuntimeException;

final class GoogleFirebasePublicKeys implements FirebasePublicKeys
{
    private const ENDPOINT = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    public function __construct(private readonly string $cachePath)
    {
    }

    public function keys(bool $forceRefresh = false): array
    {
        if (!$forceRefresh) {
            $cached = $this->readCache();
            if ($cached !== null && $cached['expires_at'] > time()) {
                return $cached['keys'];
            }
        }

        return $this->fetchAndCache();
    }

    /** @return array{expires_at: int, keys: array<string, string>}|null */
    private function readCache(): ?array
    {
        if (!is_file($this->cachePath) || !is_readable($this->cachePath)) {
            return null;
        }
        $contents = file_get_contents($this->cachePath);
        if (!is_string($contents)) {
            return null;
        }
        try {
            $decoded = json_decode($contents, true, 16, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return null;
        }
        if (!is_array($decoded) || !is_int($decoded['expires_at'] ?? null)) {
            return null;
        }
        $keys = $this->validatedKeys($decoded['keys'] ?? null);
        return $keys === [] ? null : ['expires_at' => $decoded['expires_at'], 'keys' => $keys];
    }

    /** @return array<string, string> */
    private function fetchAndCache(): array
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5,
                'ignore_errors' => true,
                'header' => "Accept: application/json\r\nUser-Agent: SeniorSurf-Aloitussivu-API/1\r\n",
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ]);
        $contents = @file_get_contents(self::ENDPOINT, false, $context);
        /** @var list<string> $responseHeaders */
        $responseHeaders = isset($http_response_header) && is_array($http_response_header)
            ? $http_response_header
            : [];
        $status = $responseHeaders[0] ?? '';
        if (!is_string($contents) || preg_match('/\s200(?:\s|$)/D', $status) !== 1) {
            throw new RuntimeException('Firebase public keys could not be refreshed.');
        }

        try {
            $decoded = json_decode($contents, true, 16, JSON_THROW_ON_ERROR);
        } catch (JsonException $error) {
            throw new RuntimeException('Firebase public key response is invalid.', previous: $error);
        }
        $keys = $this->validatedKeys($decoded);
        if ($keys === []) {
            throw new RuntimeException('Firebase public key response is empty.');
        }

        $maxAge = 300;
        foreach ($responseHeaders as $header) {
            if (preg_match('/^Cache-Control:.*?max-age=(\d+)/i', $header, $matches) === 1) {
                $maxAge = max(60, min(86400, (int) $matches[1]));
                break;
            }
        }
        $this->writeCache(['expires_at' => time() + $maxAge, 'keys' => $keys]);
        return $keys;
    }

    /** @return array<string, string> */
    private function validatedKeys(mixed $value): array
    {
        if (!is_array($value) || array_is_list($value)) {
            return [];
        }
        $keys = [];
        foreach ($value as $keyId => $pem) {
            if (
                !is_string($keyId)
                || preg_match('/^[A-Za-z0-9_-]{1,200}$/D', $keyId) !== 1
                || !is_string($pem)
                || !str_contains($pem, '-----BEGIN CERTIFICATE-----')
            ) {
                continue;
            }
            $keys[$keyId] = $pem;
        }
        return $keys;
    }

    /** @param array{expires_at: int, keys: array<string, string>} $cache */
    private function writeCache(array $cache): void
    {
        $directory = dirname($this->cachePath);
        if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
            throw new RuntimeException('Firebase public key cache directory could not be created.');
        }
        try {
            $contents = json_encode($cache, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        } catch (JsonException $error) {
            throw new RuntimeException('Firebase public key cache could not be encoded.', previous: $error);
        }
        if (file_put_contents($this->cachePath, $contents, LOCK_EX) === false) {
            throw new RuntimeException('Firebase public key cache could not be written.');
        }
        @chmod($this->cachePath, 0640);
    }
}
