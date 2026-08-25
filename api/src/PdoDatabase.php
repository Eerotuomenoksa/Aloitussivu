<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use PDO;
use PDOStatement;
use Throwable;

final class PdoDatabase implements DatabaseConnection
{
    public function __construct(private readonly PDO $pdo)
    {
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    }

    public static function connect(Config $config): self
    {
        $pdo = new PDO(
            $config->databaseDsn,
            $config->databaseUsername,
            $config->databasePassword,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_STRINGIFY_FETCHES => false,
            ],
        );

        if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql') {
            $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            $pdo->exec("SET time_zone = '+00:00'");
        }

        return new self($pdo);
    }

    public function health(): void
    {
        $row = $this->fetchOne('SELECT 1 AS ok');
        if (($row['ok'] ?? null) != 1) {
            throw new \RuntimeException('Database health check failed.');
        }
    }

    public function fetchOne(string $sql, array $parameters = []): ?array
    {
        $statement = $this->prepareAndExecute($sql, $parameters);
        $row = $statement->fetch();
        return is_array($row) ? $row : null;
    }

    public function fetchAll(string $sql, array $parameters = []): array
    {
        $rows = $this->prepareAndExecute($sql, $parameters)->fetchAll();
        return is_array($rows) ? $rows : [];
    }

    public function execute(string $sql, array $parameters = []): int
    {
        return $this->prepareAndExecute($sql, $parameters)->rowCount();
    }

    public function transaction(callable $callback): mixed
    {
        $this->pdo->beginTransaction();
        try {
            $result = $callback($this);
            $this->pdo->commit();
            return $result;
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }
    }

    /** @param array<string, mixed> $parameters */
    private function prepareAndExecute(string $sql, array $parameters): PDOStatement
    {
        $statement = $this->pdo->prepare($sql);
        foreach ($parameters as $name => $value) {
            $parameter = str_starts_with($name, ':') ? $name : ':' . $name;
            $type = match (true) {
                is_int($value) => PDO::PARAM_INT,
                is_bool($value) => PDO::PARAM_BOOL,
                $value === null => PDO::PARAM_NULL,
                default => PDO::PARAM_STR,
            };
            $statement->bindValue($parameter, $value, $type);
        }
        $statement->execute();
        return $statement;
    }
}
