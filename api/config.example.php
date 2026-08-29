<?php

declare(strict_types=1);

return [
    'app' => [
        'environment' => 'local',
        'origin' => 'http://127.0.0.1:8088',
        'base_path' => '',
        'require_https' => false,
        'trust_proxy' => false,
        'max_body_bytes' => 786432,
    ],
    'database' => [
        'dsn' => 'mysql:host=127.0.0.1;port=3306;dbname=aloitussivu;charset=utf8mb4',
        'username' => 'aloitussivu_local',
        'password' => '',
    ],
    'logging' => [
        'path' => dirname(__DIR__) . '/logs/api.log',
    ],
    'attachments' => [
        'path' => dirname(__DIR__) . '/protected_uploads',
    ],
    'security' => [
        'rate_limit_secret' => 'replace-with-a-random-value-of-at-least-32-characters',
    ],
    'authentication' => [
        'firebase_project_id' => 'your-firebase-project',
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
];
