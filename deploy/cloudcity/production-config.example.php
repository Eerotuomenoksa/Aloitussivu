<?php

declare(strict_types=1);

return [
    'app' => [
        'environment' => 'production',
        'origin' => 'https://seniorsurf.fi',
        'base_path' => '/aloitus',
        'require_https' => true,
        'trust_proxy' => false,
        'max_body_bytes' => 786432,
    ],
    'database' => [
        'dsn' => 'mysql:host=dbtqq.db.cchosting.fi;port=3306;dbname=REPLACE_WITH_PRODUCTION_DATABASE;charset=utf8mb4',
        'username' => 'REPLACE_WITH_PRODUCTION_DATABASE_USER',
        'password' => '',
    ],
    'logging' => [
        'path' => dirname(__DIR__) . '/logs/api.log',
    ],
    'attachments' => [
        'path' => dirname(__DIR__) . '/protected_uploads',
    ],
    'security' => [
        'rate_limit_secret' => 'CHANGE_ME',
    ],
    'authentication' => [
        'firebase_project_id' => 'aloitussivu-5d50c',
        'public_key_cache_path' => dirname(__DIR__) . '/cache/firebase-public-keys.json',
        'token_header' => 'authorization',
    ],
    'notifications' => [
        'enabled' => false,
        'recipient' => 'seniorsurf@vtkl.fi',
        'from_address' => 'noreply@seniorsurf.fi',
        'from_name' => 'Seniorin aloitussivu',
        'smtp' => [
            'host' => 'smtp.cloudcity.fi',
            'port' => 587,
            'encryption' => 'starttls',
            'username' => 'noreply@seniorsurf.fi',
            'password' => '',
        ],
    ],
    'link_checks' => [
        // Enable after migrations 005-008 and the hourly link-check cron are installed.
        'enabled' => true,
        // Tunnin välein ajettava 10 kohteen erä tekee koko katalogista kierroksen
        // noin kymmenessä vuorokaudessa. Tarkistin käyttää enintään neljää
        // samanaikaista ulkoista yhteyttä.
        'batch_size' => 10,
        'timeout_seconds' => 5,
        'refresh_days' => 30,
        'retry_hours' => 24,
        'alert_after_failures' => 2,
        // Automatic blocking only acts on confirmed 404/410, DNS, TLS, redirect-loop
        // and domain-for-sale failures. Network-wide failures stop the run first.
        'auto_block_enabled' => true,
        'auto_block_max_per_run' => 25,
        'auto_unblock_enabled' => true,
        'min_interval_hours' => 72,
    ],
];
