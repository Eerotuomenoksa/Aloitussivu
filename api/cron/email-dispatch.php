<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit(1);
}

$apiRoot = getenv('ALOITUSSIVU_API_ROOT') ?: dirname(__DIR__);
require $apiRoot . '/bootstrap.php';

use Aloitussivu\Api\CronRuntime;
use Aloitussivu\Api\EmailDispatcher;
use Aloitussivu\Api\LazyPdoDatabase;
use Aloitussivu\Api\SmtpMailTransport;

try {
    $startedAt = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $config = CronRuntime::loadConfig($apiRoot);
    if (!$config->notificationEnabled) {
        $result = ['status' => 'disabled', 'sent' => 0, 'retried' => 0, 'failed' => 0];
    } else {
        $database = new LazyPdoDatabase($config);
        $result = (new EmailDispatcher($config, $database, new SmtpMailTransport($config)))->run($startedAt);
    }
    echo json_encode([
        ...$result,
        'runAtUtc' => $startedAt->format(DATE_ATOM),
        'runAtHelsinki' => $startedAt->setTimezone(new DateTimeZone('Europe/Helsinki'))->format(DATE_ATOM),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
    exit($result['failed'] > 0 ? 1 : 0);
} catch (Throwable) {
    fwrite(STDERR, "Email dispatch failed before execution.\n");
    exit(1);
}
