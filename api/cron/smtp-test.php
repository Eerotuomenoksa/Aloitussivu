<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit(1);
}

$apiRoot = getenv('ALOITUSSIVU_API_ROOT') ?: dirname(__DIR__);
require $apiRoot . '/bootstrap.php';

use Aloitussivu\Api\CronRuntime;
use Aloitussivu\Api\MailMessage;
use Aloitussivu\Api\SmtpMailTransport;

try {
    $startedAt = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $config = CronRuntime::loadConfig($apiRoot);
    if (!$config->notificationEnabled) {
        fwrite(STDERR, "Email notifications are disabled.\n");
        exit(1);
    }
    $helsinkiTime = $startedAt->setTimezone(new DateTimeZone('Europe/Helsinki'))->format('d.m.Y H.i.s');
    (new SmtpMailTransport($config))->send(new MailMessage(
        '[Aloitussivu] Sähköpostiyhteyden testiviesti',
        "Seniorin aloitussivun SMTP-yhteys toimii.\n\nTestiaika: {$helsinkiTime}",
        '<!doctype html><html lang="fi"><head><meta charset="utf-8"><title>SMTP-testi</title></head>'
        . '<body><h1>Seniorin aloitussivun SMTP-yhteys toimii</h1><p>Testiaika: '
        . htmlspecialchars($helsinkiTime, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p></body></html>',
    ));
    echo json_encode([
        'status' => 'sent',
        'runAtUtc' => $startedAt->format(DATE_ATOM),
        'runAtHelsinki' => $startedAt->setTimezone(new DateTimeZone('Europe/Helsinki'))->format(DATE_ATOM),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
    exit(0);
} catch (Throwable) {
    fwrite(STDERR, "SMTP test failed.\n");
    exit(1);
}
