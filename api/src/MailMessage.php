<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use InvalidArgumentException;

final class MailMessage
{
    public function __construct(
        public readonly string $subject,
        public readonly string $textBody,
        public readonly string $htmlBody,
    ) {
        if ($subject === '' || strlen($subject) > 200 || preg_match('/[\r\n]/', $subject) === 1) {
            throw new InvalidArgumentException('mail_subject_invalid');
        }
        if ($textBody === '' || $htmlBody === '') {
            throw new InvalidArgumentException('mail_body_missing');
        }
    }
}
