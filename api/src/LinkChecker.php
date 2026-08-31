<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

interface LinkChecker
{
    public function check(string $url): LinkCheckResult;
}
