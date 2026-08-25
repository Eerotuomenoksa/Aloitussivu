<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class NcscRunResult
{
    public function __construct(
        public readonly string $status,
        public readonly int $alertsCreated,
        public readonly int $targetsProcessed,
        public readonly int $targetsSkipped,
        public readonly int $errors,
        public readonly ?string $url,
    ) {
    }

    /** @return array{status: string, alertsCreated: int, targetsProcessed: int, targetsSkipped: int, errors: int, url: string|null} */
    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'alertsCreated' => $this->alertsCreated,
            'targetsProcessed' => $this->targetsProcessed,
            'targetsSkipped' => $this->targetsSkipped,
            'errors' => $this->errors,
            'url' => $this->url,
        ];
    }
}
