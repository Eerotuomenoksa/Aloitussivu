<?php

declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
if (!is_string($path)) {
    $path = '/';
}

$staticFile = __DIR__ . $path;
if (!str_starts_with($path, '/api/') && is_file($staticFile)) {
    return false;
}

if (str_starts_with($path, '/api/')) {
    require __DIR__ . '/api/index.php';
    return true;
}

http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo '{"error":{"code":"not_found","message":"Reittiä ei löytynyt."}}';
return true;
