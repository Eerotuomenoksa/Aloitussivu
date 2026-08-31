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
        public readonly bool $notificationEnabled,
        public readonly string $notificationRecipient,
        public readonly string $mailFromAddress,
        public readonly string $mailFromName,
        public readonly string $smtpHost,
        public readonly int $smtpPort,
        public readonly string $smtpEncryption,
        public readonly string $smtpUsername,
        public readonly string $smtpPassword,
        public readonly bool $linkCheckEnabled,
        public readonly int $linkCheckBatchSize,
        public readonly int $linkCheckTimeoutSeconds,
        public readonly int $linkCheckRefreshDays,
        public readonly int $linkCheckRetryHours,
        public readonly int $linkCheckAlertAfterFailures,
        public readonly bool $linkCheckAutoBlockEnabled,
        public readonly int $linkCheckAutoBlockMaxPerRun,
        public readonly bool $linkCheckAutoUnblockEnabled,
        public readonly int $linkCheckMinIntervalHours,
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
        $notifications = self::optionalSection($raw, 'notifications');
        $smtp = self::optionalSection($notifications, 'smtp');
        $linkChecks = self::optionalSection($raw, 'link_checks');

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

        $notificationEnabled = self::boolValue($notifications, 'enabled', false);
        $notificationRecipient = self::stringValue($notifications, 'recipient');
        $mailFromAddress = self::stringValue($notifications, 'from_address');
        $mailFromName = self::stringValue($notifications, 'from_name');
        $smtpHost = self::stringValue($smtp, 'host');
        $smtpPort = self::intValue($smtp, 'port', 587);
        $smtpEncryption = strtolower(self::stringValue($smtp, 'encryption'));
        if ($smtpEncryption === '') {
            $smtpEncryption = 'starttls';
        }
        $smtpUsername = self::stringValue($smtp, 'username');
        $smtpPassword = self::secretValue($smtp, 'password');

        foreach (['notification recipient' => $notificationRecipient, 'mail sender address' => $mailFromAddress] as $label => $address) {
            if ($address !== '' && filter_var($address, FILTER_VALIDATE_EMAIL) === false) {
                throw new ConfigException(sprintf('Invalid %s.', $label));
            }
        }
        if ($mailFromName !== '' && (strlen($mailFromName) > 120 || preg_match('/[\r\n]/', $mailFromName) === 1)) {
            throw new ConfigException('Mail sender name has an invalid format.');
        }
        if ($smtpHost !== '' && preg_match('/^(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(?:\.(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?))*$/D', $smtpHost) !== 1) {
            throw new ConfigException('SMTP host has an invalid format.');
        }
        if ($smtpPort < 1 || $smtpPort > 65535) {
            throw new ConfigException('SMTP port must be between 1 and 65535.');
        }
        if ($smtpEncryption !== 'starttls') {
            throw new ConfigException('SMTP encryption must be starttls.');
        }
        if ($smtpUsername !== '' && preg_match('/[\r\n]/', $smtpUsername) === 1) {
            throw new ConfigException('SMTP username has an invalid format.');
        }
        if ($notificationEnabled) {
            foreach ([
                'notification recipient' => $notificationRecipient,
                'mail sender address' => $mailFromAddress,
                'mail sender name' => $mailFromName,
                'SMTP host' => $smtpHost,
                'SMTP username' => $smtpUsername,
                'SMTP password' => $smtpPassword,
            ] as $label => $value) {
                if ($value === '') {
                    throw new ConfigException(sprintf('Missing enabled notification value: %s.', $label));
                }
            }
        }

        $linkCheckEnabled = self::boolValue($linkChecks, 'enabled', false);
        $linkCheckBatchSize = self::boundedInt($linkChecks, 'batch_size', 10, 1, 50);
        $linkCheckTimeoutSeconds = self::boundedInt($linkChecks, 'timeout_seconds', 8, 2, 20);
        $linkCheckRefreshDays = self::boundedInt($linkChecks, 'refresh_days', 30, 1, 365);
        $linkCheckRetryHours = self::boundedInt($linkChecks, 'retry_hours', 24, 1, 168);
        $linkCheckAlertAfterFailures = self::boundedInt($linkChecks, 'alert_after_failures', 2, 1, 10);
        // LC-02: automaattinen piilotus on oletuksena POIS. Ota kayttoon vasta kun putki on
        // ajanut tuotannossa yhden taydellisen kierroksen ja tulokset on katsottu lapi.
        $linkCheckAutoBlockEnabled = self::boolValue($linkChecks, 'auto_block_enabled', false);
        $linkCheckAutoBlockMaxPerRun = self::boundedInt($linkChecks, 'auto_block_max_per_run', 25, 1, 200);
        $linkCheckAutoUnblockEnabled = self::boolValue($linkChecks, 'auto_unblock_enabled', true);
        // LC-03: lyhin vali johon mukautuva ajastus voi laskea.
        $linkCheckMinIntervalHours = self::boundedInt($linkChecks, 'min_interval_hours', 72, 6, 720);

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
            notificationEnabled: $notificationEnabled,
            notificationRecipient: $notificationRecipient,
            mailFromAddress: $mailFromAddress,
            mailFromName: $mailFromName,
            smtpHost: $smtpHost,
            smtpPort: $smtpPort,
            smtpEncryption: $smtpEncryption,
            smtpUsername: $smtpUsername,
            smtpPassword: $smtpPassword,
            linkCheckEnabled: $linkCheckEnabled,
            linkCheckBatchSize: $linkCheckBatchSize,
            linkCheckTimeoutSeconds: $linkCheckTimeoutSeconds,
            linkCheckRefreshDays: $linkCheckRefreshDays,
            linkCheckRetryHours: $linkCheckRetryHours,
            linkCheckAlertAfterFailures: $linkCheckAlertAfterFailures,
            linkCheckAutoBlockEnabled: $linkCheckAutoBlockEnabled,
            linkCheckAutoBlockMaxPerRun: $linkCheckAutoBlockMaxPerRun,
            linkCheckAutoUnblockEnabled: $linkCheckAutoUnblockEnabled,
            linkCheckMinIntervalHours: $linkCheckMinIntervalHours,
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

    /** @param array<string, mixed> $raw */
    private static function optionalSection(array $raw, string $key): array
    {
        if (!array_key_exists($key, $raw)) {
            return [];
        }
        $value = $raw[$key];
        if (!is_array($value)) {
            throw new ConfigException(sprintf('API configuration section %s must be an array.', $key));
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
    private static function secretValue(array $values, string $key): string
    {
        $value = $values[$key] ?? '';
        if (!is_string($value)) {
            throw new ConfigException(sprintf('API configuration value %s must be a string.', $key));
        }
        return $value;
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

    /** @param array<string, mixed> $values */
    private static function boundedInt(array $values, string $key, int $default, int $minimum, int $maximum): int
    {
        $value = self::intValue($values, $key, $default);
        if ($value < $minimum || $value > $maximum) {
            throw new ConfigException(sprintf('API configuration value %s must be between %d and %d.', $key, $minimum, $maximum));
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
