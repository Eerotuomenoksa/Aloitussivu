<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class ScreenshotValidator
{
    private const MAX_BYTES = 460800;
    private const MAX_DATA_URL = 700000;
    private const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

    /** @param array<string, mixed> $data @return array{name: string, media_type: string, contents: string, byte_size: int, sha256: string} */
    public static function validate(array $data): array
    {
        Validator::shape($data, ['name', 'type', 'size', 'dataUrl'], ['name', 'type', 'size', 'dataUrl']);
        $name = Validator::string($data, 'name', 1, 180);
        $mediaType = Validator::enum($data, 'type', self::ALLOWED_TYPES);
        $declaredSize = Validator::integer($data, 'size', 1, self::MAX_BYTES);
        $dataUrl = Validator::string($data, 'dataUrl', 1, self::MAX_DATA_URL);

        $prefix = 'data:' . $mediaType . ';base64,';
        if (!str_starts_with($dataUrl, $prefix)) {
            throw Validator::invalidField('screenshot');
        }
        $contents = base64_decode(substr($dataUrl, strlen($prefix)), true);
        if (!is_string($contents) || strlen($contents) !== $declaredSize || strlen($contents) > self::MAX_BYTES) {
            throw Validator::invalidField('screenshot');
        }
        if (self::detectedType($contents) !== $mediaType) {
            throw Validator::invalidField('screenshot');
        }

        $safeName = basename(str_replace('\\', '/', $name));
        if (
            $safeName === ''
            || $safeName === '.'
            || $safeName === '..'
            || preg_match('/[\x00-\x1f\x7f]/D', $safeName) === 1
        ) {
            throw Validator::invalidField('screenshot.name');
        }

        return [
            'name' => $safeName,
            'media_type' => $mediaType,
            'contents' => $contents,
            'byte_size' => strlen($contents),
            'sha256' => hash('sha256', $contents, true),
        ];
    }

    private static function detectedType(string $contents): string
    {
        $imageInfo = @getimagesizefromstring($contents);
        if (!is_array($imageInfo) || !isset($imageInfo['mime']) || !is_string($imageInfo['mime'])) {
            return '';
        }

        $detected = '';
        if (str_starts_with($contents, "\x89PNG\r\n\x1a\n")) {
            $detected = 'image/png';
        } elseif (str_starts_with($contents, "\xff\xd8\xff")) {
            $detected = 'image/jpeg';
        } elseif (str_starts_with($contents, 'GIF87a') || str_starts_with($contents, 'GIF89a')) {
            $detected = 'image/gif';
        } elseif (strlen($contents) >= 12 && substr($contents, 0, 4) === 'RIFF' && substr($contents, 8, 4) === 'WEBP') {
            $detected = 'image/webp';
        }
        return $imageInfo['mime'] === $detected ? $detected : '';
    }
}
