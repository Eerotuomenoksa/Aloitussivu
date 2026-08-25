<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;

interface NcscSource
{
    /** @return list<NcscTarget> */
    public function targets(DateTimeImmutable $now): array;

    public function scrape(NcscTarget $target, DateTimeImmutable $now): NcscScrapeResult;
}
