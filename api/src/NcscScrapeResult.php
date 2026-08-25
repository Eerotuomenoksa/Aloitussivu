<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;

final class NcscScrapeResult
{
    /** @param list<NcscScrapeItem> $items */
    public function __construct(
        public readonly string $url,
        public readonly string $weekLabel,
        public readonly DateTimeImmutable $publishedAt,
        public readonly array $items,
        public readonly string $structureVersion,
    ) {
    }
}
