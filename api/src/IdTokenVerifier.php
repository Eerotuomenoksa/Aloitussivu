<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

interface IdTokenVerifier
{
    public function verify(string $token): FirebaseIdentity;
}
