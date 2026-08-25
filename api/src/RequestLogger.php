<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

interface RequestLogger
{
    /** @param array<string, mixed> $context */
    public function log(string $event, array $context = []): void;
}
