<?php

declare(strict_types=1);

if (PHP_VERSION_ID < 80400) {
    throw new RuntimeException('Aloitussivu API requires PHP 8.4 or newer.');
}

date_default_timezone_set('UTC');

spl_autoload_register(static function (string $class): void {
    $prefix = 'Aloitussivu\\Api\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/src/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($path)) {
        require $path;
    }
});
