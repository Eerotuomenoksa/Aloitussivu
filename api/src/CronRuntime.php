<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class CronRuntime
{
    public static function loadConfig(string $apiRoot): Config
    {
        $configuredPublicRoot = getenv('ALOITUSSIVU_PUBLIC_ROOT');
        $candidates = array_values(array_filter([
            is_string($configuredPublicRoot) ? $configuredPublicRoot : '',
            $apiRoot . '/public',
            dirname($apiRoot) . '/website.wp33403/aloitus',
            $apiRoot . '/public_html',
        ], static fn (string $path): bool => $path !== ''));
        $publicRoot = '';
        foreach ($candidates as $candidate) {
            if (is_dir($candidate)) {
                $publicRoot = $candidate;
                break;
            }
        }
        if ($publicRoot === '') {
            throw new ConfigException('Cron public root could not be resolved. Set ALOITUSSIVU_PUBLIC_ROOT.');
        }
        $configuredConfig = getenv('ALOITUSSIVU_API_CONFIG');
        $configFile = is_string($configuredConfig) && $configuredConfig !== ''
            ? $configuredConfig
            : $apiRoot . '/secrets/config.php';
        return Config::load($configFile, $publicRoot);
    }
}
