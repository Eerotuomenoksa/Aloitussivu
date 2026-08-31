<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use JsonException;
use RuntimeException;

final class LinkCatalog
{
    /** @param list<array{url: string, name: string, category: string, source: string}> $links */
    private function __construct(
        public readonly array $links,
        public readonly string $checksum,
    ) {
    }

    public static function load(string $path): self
    {
        if (!is_file($path) || !is_readable($path)) {
            throw new RuntimeException('link_catalog_unreadable');
        }
        $size = filesize($path);
        if ($size === false || $size < 2 || $size > 12_000_000) {
            throw new RuntimeException('link_catalog_size_invalid');
        }
        $contents = file_get_contents($path);
        if (!is_string($contents)) {
            throw new RuntimeException('link_catalog_unreadable');
        }
        try {
            $data = json_decode($contents, true, 64, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new RuntimeException('link_catalog_json_invalid');
        }
        if (!is_array($data) || ($data['schemaVersion'] ?? null) !== 1 || !is_array($data['links'] ?? null)) {
            throw new RuntimeException('link_catalog_schema_invalid');
        }
        if (count($data['links']) > 20_000) {
            throw new RuntimeException('link_catalog_too_large');
        }

        $links = [];
        $seen = [];
        foreach ($data['links'] as $item) {
            if (!is_array($item)) {
                throw new RuntimeException('link_catalog_item_invalid');
            }
            $url = self::text($item, 'url', 2048);
            $parts = parse_url($url);
            if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])
                || !in_array(strtolower((string) $parts['scheme']), ['http', 'https'], true)
                || isset($parts['user']) || isset($parts['pass'])) {
                throw new RuntimeException('link_catalog_url_invalid');
            }
            $hash = hash('sha256', $url);
            if (isset($seen[$hash])) {
                continue;
            }
            $seen[$hash] = true;
            $links[] = [
                'url' => $url,
                'name' => self::text($item, 'name', 160),
                'category' => self::text($item, 'category', 255),
                'source' => self::text($item, 'source', 255),
            ];
        }
        try {
            $canonicalLinks = json_encode($links, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new RuntimeException('link_catalog_json_invalid');
        }
        return new self($links, hash('sha256', $canonicalLinks));
    }

    /** @param array<string, mixed> $item */
    private static function text(array $item, string $key, int $max): string
    {
        $value = $item[$key] ?? null;
        if (!is_string($value)) {
            throw new RuntimeException('link_catalog_item_invalid');
        }
        $value = trim($value);
        $length = function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : iconv_strlen($value, 'UTF-8');
        if ($value === '' || $length === false || $length > $max || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value) === 1) {
            throw new RuntimeException('link_catalog_item_invalid');
        }
        return $value;
    }
}
