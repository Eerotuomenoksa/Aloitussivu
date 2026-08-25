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
        'dsn' => 'mysql:host=dbtma.db.cchosting.fi;port=3306;dbname=REPLACE_WITH_PRODUCTION_DATABASE;charset=utf8mb4',
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
];
