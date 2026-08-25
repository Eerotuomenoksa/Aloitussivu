<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

interface DatabaseConnection
{
    public function health(): void;

    /** @param array<string, mixed> $parameters @return array<string, mixed>|null */
    public function fetchOne(string $sql, array $parameters = []): ?array;

    /** @param array<string, mixed> $parameters @return list<array<string, mixed>> */
    public function fetchAll(string $sql, array $parameters = []): array;

    /** @param array<string, mixed> $parameters */
    public function execute(string $sql, array $parameters = []): int;

    public function transaction(callable $callback): mixed;
}
