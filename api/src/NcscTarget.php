<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;

final class NcscTarget
{
    public function __construct(
        public readonly string $url,
        public readonly string $title,
        public readonly ?DateTimeImmutable $publishedAt,
        public readonly string $kind,
    ) {
    }
}
