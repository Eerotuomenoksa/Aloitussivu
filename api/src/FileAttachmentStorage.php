<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class FileAttachmentStorage implements AttachmentStorage
{
    private const EXTENSIONS = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    public function __construct(private readonly string $root)
    {
        if (!is_dir($root) && !mkdir($root, 0750, true) && !is_dir($root)) {
            throw new \RuntimeException('Attachment directory could not be created.');
        }
    }

    public function store(string $feedbackId, string $contents, string $mediaType): string
    {
        $extension = self::EXTENSIONS[$mediaType] ?? null;
        if ($extension === null || preg_match('/^[0-9a-f-]{36}$/D', $feedbackId) !== 1) {
            throw new \InvalidArgumentException('Invalid attachment metadata.');
        }

        $directory = gmdate('Y/m');
        $targetDirectory = $this->root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $directory);
        if (!is_dir($targetDirectory) && !mkdir($targetDirectory, 0750, true) && !is_dir($targetDirectory)) {
            throw new \RuntimeException('Attachment directory could not be created.');
        }

        $storageKey = sprintf('%s/%s-%s.%s', $directory, $feedbackId, bin2hex(random_bytes(6)), $extension);
        $target = $this->path($storageKey);
        if (file_put_contents($target, $contents, LOCK_EX) === false) {
            throw new \RuntimeException('Attachment could not be stored.');
        }
        @chmod($target, 0640);
        return $storageKey;
    }

    public function delete(string $storageKey): void
    {
        if (!$this->isSafeKey($storageKey)) {
            return;
        }
        $path = $this->path($storageKey);
        if (is_file($path)) {
            @unlink($path);
        }
    }

    public function read(string $storageKey): ?string
    {
        if (!$this->isSafeKey($storageKey)) {
            return null;
        }
        $path = $this->path($storageKey);
        if (!is_file($path) || !is_readable($path)) {
            return null;
        }
        $contents = file_get_contents($path);
        return is_string($contents) ? $contents : null;
    }

    private function path(string $storageKey): string
    {
        return $this->root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $storageKey);
    }

    private function isSafeKey(string $storageKey): bool
    {
        return preg_match('/^\d{4}\/\d{2}\/[0-9a-f-]{36}-[0-9a-f]{12}\.(png|jpg|webp|gif)$/D', $storageKey) === 1;
    }
}
