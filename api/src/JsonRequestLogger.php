<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class JsonRequestLogger implements RequestLogger
{
    private const ALLOWED_CONTEXT = [
        'request_id' => true,
        'method' => true,
        'path' => true,
        'status' => true,
        'duration_ms' => true,
        'error_code' => true,
    ];

    public function __construct(private readonly string $path)
    {
        $directory = dirname($path);
        if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
            throw new \RuntimeException('API log directory could not be created.');
        }
    }

    public function log(string $event, array $context = []): void
    {
        $safeContext = array_intersect_key($context, self::ALLOWED_CONTEXT);
        $line = json_encode([
            'timestamp' => gmdate('c'),
            'event' => preg_replace('/[^a-z0-9_.-]/i', '_', $event),
            ...$safeContext,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        if (!is_string($line) || file_put_contents($this->path, $line . PHP_EOL, FILE_APPEND | LOCK_EX) === false) {
            error_log('Aloitussivu API log write failed.');
            return;
        }
        @chmod($this->path, 0640);
    }
}
