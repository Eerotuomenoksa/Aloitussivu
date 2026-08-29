<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

interface MailTransport
{
    public function send(MailMessage $message): void;
}
