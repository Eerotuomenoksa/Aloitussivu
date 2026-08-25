<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class Config
{
    private function __construct(
        public readonly string $environment,
        public readonly string $origin,
        public readonly string $basePath,
        public readonly bool $requireHttps,
        public readonly bool $trustProxy,
        public readonly int $maxBodyBytes,
        public readonly string $databaseDsn,
        public readonly string $databaseUsername,
        public readonly string $databasePassword,
        public readonly string $logPath,
        public readonly string $attachmentPath,
        public readonly string $rateLimitSecret,
        public readonly string $firebaseProjectId,
        public readonly string $firebasePublicKeyCachePath,
        public readonly string $adminTokenHeader,
    ) {
    }

    public static function load(string $path, string $publicRoot): self
    {
        if ($path === '' || !is_file($path) || !is_readable($path)) {
            throw new ConfigException('API configuration file is missing or unreadable.');
        }

        self::assertOutsidePublicRoot($path, $publicRoot, 'API configuration');
        $raw = require $path;
        if (!is_array($raw)) {
            throw new ConfigException('API configuration must return an array.');
        }

        return self::fromArray($raw, $publicRoot);
    }

    /** @param array<string, mixed> $raw */
    public static function fromArray(array $raw, string $publicRoot): self
    {
        $app = self::section($raw, 'app');
        $database = self::section($raw, 'database');
        $logging = self::section($raw, 'logging');
        $attachments = self::section($raw, 'attachments');
        $security = self::section($raw, 'security');
        $authentication = self::section($raw, 'authentication');

        $environment = self::requiredString($app, 'environment');
        if (!in_array($environment, ['local', 'testing', 'staging', 'production'], true)) {
            throw new ConfigException('Unsupported API environment.');
        }

        $origin = rtrim(self::requiredString($app, 'origin'), '/');
        $originParts = parse_url($origin);
        if (!is_array($originParts) || !isset($originParts['scheme'], $originParts['host'])) {
            throw new ConfigException('API origin must be an absolute origin URL.');
        }
        $scheme = strtolower((string) $originParts['scheme']);
        if (!in_array($scheme, ['http', 'https'], true)) {
            throw new ConfigException('API origin must use HTTP or HTTPS.');
        }
        foreach (['user', 'pass', 'path', 'query', 'fragment'] as $component) {
            if (isset($originParts[$component]) && $originParts[$component] !== '') {
                throw new ConfigException('API origin must contain only scheme, host and optional port.');
            }
        }

        $requireHttps = self::boolValue($app, 'require_https', true);
        if ($requireHttps && $scheme !== 'https') {
            throw new ConfigException('HTTPS is required but the configured origin is not HTTPS.');
        }

        $maxBodyBytes = self::intValue($app, 'max_body_bytes', 786432);
        if ($maxBodyBytes < 1024 || $maxBodyBytes > 1048576) {
            throw new ConfigException('API request size limit must be between 1024 and 1048576 bytes.');
        }

        $basePath = rtrim(self::stringValue($app, 'base_path'), '/');
        if ($basePath === '/') {
            $basePath = '';
        }
        if ($basePath !== '' && preg_match('#^/[A-Za-z0-9._~-]+(?:/[A-Za-z0-9._~-]+)*$#D', $basePath) !== 1) {
            throw new ConfigException('API base path must be empty or an absolute URL path without a trailing slash.');
        }

        $dsn = self::requiredString($database, 'dsn');
        if (in_array($environment, ['staging', 'production'], true) && !str_starts_with($dsn, 'mysql:')) {
            throw new ConfigException('Staging and production require a MySQL PDO DSN.');
        }
        $databasePassword = self::stringValue($database, 'password');
        if (in_array($environment, ['staging', 'production'], true) && $databasePassword === '') {
            throw new ConfigException('Staging and production require a database password.');
        }

        $logPath = self::requiredString($logging, 'path');
        self::assertOutsidePublicRoot($logPath, $publicRoot, 'API log');

        $attachmentPath = self::requiredString($attachments, 'path');
        self::assertOutsidePublicRoot($attachmentPath, $publicRoot, 'API attachment storage');

        $rateLimitSecret = self::requiredString($security, 'rate_limit_secret');
        if (strlen($rateLimitSecret) < 32) {
            throw new ConfigException('Rate limit secret must contain at least 32 characters.');
        }
        if (in_array($environment, ['staging', 'production'], true) && str_contains($rateLimitSecret, 'replace-with')) {
            throw new ConfigException('The placeholder rate limit secret cannot be used outside local development.');
        }

        $firebaseProjectId = self::requiredString($authentication, 'firebase_project_id');
        if (preg_match('/^[a-z0-9][a-z0-9-]{4,28}[a-z0-9]$/D', $firebaseProjectId) !== 1) {
            throw new ConfigException('Firebase project ID has an invalid format.');
        }
        $firebasePublicKeyCachePath = self::requiredString($authentication, 'public_key_cache_path');
        self::assertOutsidePublicRoot($firebasePublicKeyCachePath, $publicRoot, 'Firebase public key cache');
        $adminTokenHeader = strtolower(self::stringValue($authentication, 'token_header'));
        if ($adminTokenHeader === '') {
            $adminTokenHeader = 'authorization';
        }
        if (!in_array($adminTokenHeader, ['authorization', 'x-firebase-id-token'], true)) {
            throw new ConfigException('Unsupported Firebase token header.');
        }

        return new self(
            environment: $environment,
            origin: $origin,
            basePath: $basePath,
            requireHttps: $requireHttps,
            trustProxy: self::boolValue($app, 'trust_proxy', false),
            maxBodyBytes: $maxBodyBytes,
            databaseDsn: $dsn,
            databaseUsername: self::stringValue($database, 'username'),
            databasePassword: $databasePassword,
            logPath: $logPath,
            attachmentPath: $attachmentPath,
            rateLimitSecret: $rateLimitSecret,
            firebaseProjectId: $firebaseProjectId,
            firebasePublicKeyCachePath: $firebasePublicKeyCachePath,
            adminTokenHeader: $adminTokenHeader,
        );
    }

    /** @param array<string, mixed> $raw */
    private static function section(array $raw, string $key): array
    {
        $value = $raw[$key] ?? null;
        if (!is_array($value)) {
            throw new ConfigException(sprintf('Missing API configuration section: %s.', $key));
        }
        return $value;
    }

    /** @param array<string, mixed> $values */
    private static function requiredString(array $values, string $key): string
    {
        $value = self::stringValue($values, $key);
        if ($value === '') {
            throw new ConfigException(sprintf('Missing API configuration value: %s.', $key));
        }
        return $value;
    }

    /** @param array<string, mixed> $values */
    private static function stringValue(array $values, string $key): string
    {
        $value = $values[$key] ?? '';
        if (!is_string($value)) {
            throw new ConfigException(sprintf('API configuration value %s must be a string.', $key));
        }
        return trim($value);
    }

    /** @param array<string, mixed> $values */
    private static function boolValue(array $values, string $key, bool $default): bool
    {
        $value = $values[$key] ?? $default;
        if (!is_bool($value)) {
            throw new ConfigException(sprintf('API configuration value %s must be a boolean.', $key));
        }
        return $value;
    }

    /** @param array<string, mixed> $values */
    private static function intValue(array $values, string $key, int $default): int
    {
        $value = $values[$key] ?? $default;
        if (!is_int($value)) {
            throw new ConfigException(sprintf('API configuration value %s must be an integer.', $key));
        }
        return $value;
    }

    private static function assertOutsidePublicRoot(string $path, string $publicRoot, string $label): void
    {
        if (!self::isAbsolutePath($path)) {
            throw new ConfigException(sprintf('%s path must be absolute.', $label));
        }
        $resolvedRoot = realpath($publicRoot);
        if ($resolvedRoot === false) {
            throw new ConfigException('API public root could not be resolved.');
        }

        $resolvedPath = realpath($path);
        if ($resolvedPath === false) {
            $parent = realpath(dirname($path));
            $resolvedPath = $parent === false ? $path : $parent . DIRECTORY_SEPARATOR . basename($path);
        }

        $normalize = static function (string $value): string {
            $normalized = rtrim(str_replace('\\', '/', $value), '/');
            return DIRECTORY_SEPARATOR === '\\' ? strtolower($normalized) : $normalized;
        };

        $root = $normalize($resolvedRoot);
        $candidate = $normalize($resolvedPath);
        if ($candidate === $root || str_starts_with($candidate, $root . '/')) {
            throw new ConfigException(sprintf('%s must be outside the public web root.', $label));
        }
    }

    private static function isAbsolutePath(string $path): bool
    {
        return str_starts_with($path, '/')
            || preg_match('/^[A-Za-z]:[\\\\\/]/D', $path) === 1
            || str_starts_with($path, '\\\\');
    }
}
