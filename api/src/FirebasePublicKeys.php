<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

interface FirebasePublicKeys
{
    /** @return array<string, string> Firebase key ID to PEM certificate or public key. */
    public function keys(bool $forceRefresh = false): array;
}
