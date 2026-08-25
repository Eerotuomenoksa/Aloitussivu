<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

interface AttachmentStorage
{
    public function store(string $feedbackId, string $contents, string $mediaType): string;

    public function read(string $storageKey): ?string;

    public function delete(string $storageKey): void;
}
