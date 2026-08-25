<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class LazyPdoDatabase implements DatabaseConnection
{
    private ?PdoDatabase $database = null;

    public function __construct(private readonly Config $config)
    {
    }

    public function health(): void
    {
        $this->connection()->health();
    }

    public function fetchOne(string $sql, array $parameters = []): ?array
    {
        return $this->connection()->fetchOne($sql, $parameters);
    }

    public function fetchAll(string $sql, array $parameters = []): array
    {
        return $this->connection()->fetchAll($sql, $parameters);
    }

    public function execute(string $sql, array $parameters = []): int
    {
        return $this->connection()->execute($sql, $parameters);
    }

    public function transaction(callable $callback): mixed
    {
        return $this->connection()->transaction($callback);
    }

    private function connection(): PdoDatabase
    {
        return $this->database ??= PdoDatabase::connect($this->config);
    }
}
