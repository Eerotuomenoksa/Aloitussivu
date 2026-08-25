<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class NcscScrapeItem
{
    public function __construct(
        public readonly string $heading,
        public readonly string $body,
    ) {
    }
}
