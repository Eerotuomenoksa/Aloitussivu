<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class AdminUser
{
    public function __construct(
        public readonly string $uid,
        public readonly string $email,
        public readonly string $role,
    ) {
    }
}
