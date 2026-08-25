<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use JsonException;
use Throwable;

final class FirebaseIdTokenVerifier implements IdTokenVerifier
{
    public function __construct(
        private readonly string $projectId,
        private readonly FirebasePublicKeys $publicKeys,
        private readonly int $clockSkewSeconds = 60,
    ) {
    }

    public function verify(string $token): FirebaseIdentity
    {
        if (!function_exists('openssl_pkey_get_public') || !function_exists('openssl_verify')) {
            throw new ApiException(
                503,
                'authentication_unavailable',
                'Tunnistuspalvelu ei ole juuri nyt käytettävissä.',
            );
        }
        if ($token === '' || strlen($token) > 16384) {
            throw $this->invalidToken();
        }
        $segments = explode('.', $token);
        if (count($segments) !== 3) {
            throw $this->invalidToken();
        }

        $header = $this->jsonSegment($segments[0]);
        $claims = $this->jsonSegment($segments[1]);
        if (($header['alg'] ?? null) !== 'RS256') {
            throw $this->invalidToken();
        }
        $keyId = $header['kid'] ?? null;
        if (!is_string($keyId) || preg_match('/^[A-Za-z0-9_-]{1,200}$/D', $keyId) !== 1) {
            throw $this->invalidToken();
        }

        try {
            $keys = $this->publicKeys->keys();
            if (!isset($keys[$keyId])) {
                $keys = $this->publicKeys->keys(true);
            }
        } catch (Throwable $error) {
            throw new ApiException(
                503,
                'authentication_unavailable',
                'Tunnistuspalvelu ei ole juuri nyt käytettävissä.',
                previous: $error,
            );
        }
        $publicKey = isset($keys[$keyId]) ? openssl_pkey_get_public($keys[$keyId]) : false;
        $signature = $this->base64UrlDecode($segments[2]);
        if ($publicKey === false || $signature === null) {
            throw $this->invalidToken();
        }
        $verified = openssl_verify($segments[0] . '.' . $segments[1], $signature, $publicKey, OPENSSL_ALGO_SHA256);
        if ($verified !== 1) {
            throw $this->invalidToken();
        }

        $now = time();
        $expiration = $claims['exp'] ?? null;
        $issuedAt = $claims['iat'] ?? null;
        $authenticatedAt = $claims['auth_time'] ?? null;
        $uid = $claims['sub'] ?? null;
        if (
            !is_int($expiration)
            || $expiration <= $now - $this->clockSkewSeconds
            || !is_int($issuedAt)
            || $issuedAt > $now + $this->clockSkewSeconds
            || !is_int($authenticatedAt)
            || $authenticatedAt > $now + $this->clockSkewSeconds
            || ($claims['aud'] ?? null) !== $this->projectId
            || ($claims['iss'] ?? null) !== 'https://securetoken.google.com/' . $this->projectId
            || !is_string($uid)
            || $uid === ''
            || strlen($uid) > 128
        ) {
            throw $this->invalidToken();
        }

        $email = $claims['email'] ?? '';
        $emailVerified = $claims['email_verified'] ?? false;
        $firebaseClaims = $claims['firebase'] ?? null;
        $signInProvider = is_array($firebaseClaims)
            ? ($firebaseClaims['sign_in_provider'] ?? '')
            : '';
        return new FirebaseIdentity(
            $uid,
            is_string($email) && strlen($email) <= 320 ? trim($email) : '',
            $emailVerified === true,
            is_string($signInProvider) && strlen($signInProvider) <= 128 ? trim($signInProvider) : '',
        );
    }

    /** @return array<string, mixed> */
    private function jsonSegment(string $segment): array
    {
        $decoded = $this->base64UrlDecode($segment);
        if ($decoded === null) {
            throw $this->invalidToken();
        }
        try {
            $value = json_decode($decoded, true, 16, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw $this->invalidToken();
        }
        if (!is_array($value) || array_is_list($value)) {
            throw $this->invalidToken();
        }
        return $value;
    }

    private function base64UrlDecode(string $value): ?string
    {
        if ($value === '' || preg_match('/^[A-Za-z0-9_-]+$/D', $value) !== 1) {
            return null;
        }
        $padding = (4 - strlen($value) % 4) % 4;
        $decoded = base64_decode(strtr($value, '-_', '+/') . str_repeat('=', $padding), true);
        return is_string($decoded) ? $decoded : null;
    }

    private function invalidToken(): ApiException
    {
        return new ApiException(
            401,
            'invalid_token',
            'Kirjautuminen ei kelpaa tai on vanhentunut.',
            headers: ['WWW-Authenticate' => 'Bearer realm="aloitussivu-admin", error="invalid_token"'],
        );
    }
}
