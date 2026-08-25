<?php

declare(strict_types=1);

$configuredApiRoot = getenv('ALOITUSSIVU_API_ROOT') ?: '';
$apiRootCandidates = array_values(array_filter([
    $configuredApiRoot,
    dirname(__DIR__, 2),
    dirname(__DIR__, 3) . '/aloitus-production',
], static fn (string $candidate): bool => $candidate !== ''));
$apiRoot = $apiRootCandidates[0];
foreach ($apiRootCandidates as $candidate) {
    if (is_file($candidate . '/bootstrap.php') && is_dir($candidate . '/src')) {
        $apiRoot = $candidate;
        break;
    }
}
require $apiRoot . '/bootstrap.php';

use Aloitussivu\Api\ApiException;
use Aloitussivu\Api\App;
use Aloitussivu\Api\Config;
use Aloitussivu\Api\ConfigException;
use Aloitussivu\Api\JsonRequestLogger;
use Aloitussivu\Api\LazyPdoDatabase;
use Aloitussivu\Api\Request;
use Aloitussivu\Api\RequestId;

$requestId = RequestId::resolve($_SERVER['HTTP_X_REQUEST_ID'] ?? null);

try {
    $configFile = getenv('ALOITUSSIVU_API_CONFIG') ?: $apiRoot . '/secrets/config.php';
    $config = Config::load($configFile, dirname(__DIR__));
    $request = Request::fromGlobals($config->maxBodyBytes, $config->basePath);
    $app = App::create($config, new LazyPdoDatabase($config), new JsonRequestLogger($config->logPath));
    $app->handle($request)->emit();
} catch (ApiException $error) {
    App::errorResponse($error, $requestId)->withHeaders(['X-Request-ID' => $requestId])->emit();
} catch (ConfigException) {
    error_log('Aloitussivu API configuration unavailable. request_id=' . $requestId);
    App::errorResponse(
        new ApiException(500, 'configuration_error', 'Palvelun asetukset eivät ole käytettävissä.'),
        $requestId,
    )->withHeaders(['X-Request-ID' => $requestId])->emit();
} catch (Throwable) {
    error_log('Aloitussivu API bootstrap failed. request_id=' . $requestId);
    App::errorResponse(
        new ApiException(500, 'internal_error', 'Palvelimella tapahtui virhe.'),
        $requestId,
    )->withHeaders(['X-Request-ID' => $requestId])->emit();
}
