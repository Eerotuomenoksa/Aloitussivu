<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit(1);
}

$apiRoot = getenv('ALOITUSSIVU_API_ROOT') ?: dirname(__DIR__);
require $apiRoot . '/bootstrap.php';

use Aloitussivu\Api\Config;
use Aloitussivu\Api\HttpNcscSource;
use Aloitussivu\Api\LazyPdoDatabase;
use Aloitussivu\Api\NcscJob;

try {
    $startedAt = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $configFile = getenv('ALOITUSSIVU_API_CONFIG') ?: $apiRoot . '/secrets/config.php';
    $config = Config::load($configFile, $apiRoot . '/public_html');
    $database = new LazyPdoDatabase($config);
    $result = (new NcscJob($database, new HttpNcscSource()))->run();
    echo json_encode([
        ...$result->toArray(),
        'runAtUtc' => $startedAt->format(DATE_ATOM),
        'runAtHelsinki' => $startedAt->setTimezone(new DateTimeZone('Europe/Helsinki'))->format(DATE_ATOM),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
    exit($result->status === 'failed' ? 1 : 0);
} catch (Throwable) {
    fwrite(STDERR, "NCSC background job failed before execution.\n");
    exit(1);
}
