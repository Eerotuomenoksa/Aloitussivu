<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use JsonException;

final class Validator
{
    /** @param array<string, mixed> $data @param list<string> $allowed @param list<string> $required */
    public static function shape(array $data, array $allowed, array $required = []): void
    {
        $unknown = array_diff(array_keys($data), $allowed);
        if ($unknown !== []) {
            throw self::invalidField((string) reset($unknown));
        }
        foreach ($required as $field) {
            if (!array_key_exists($field, $data)) {
                throw self::invalidField($field);
            }
        }
    }

    /** @return array<string, mixed> */
    public static function jsonObject(Request $request): array
    {
        $contentType = strtolower(trim(explode(';', $request->header('content-type'), 2)[0]));
        if ($contentType !== 'application/json') {
            throw new ApiException(415, 'unsupported_media_type', 'Content-Type pitää olla application/json.');
        }
        if ($request->body === '') {
            throw new ApiException(400, 'empty_json_body', 'JSON-pyyntö ei saa olla tyhjä.');
        }

        try {
            $value = json_decode($request->body, true, 64, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new ApiException(400, 'invalid_json', 'JSON-pyyntö ei kelpaa.');
        }
        if (!is_array($value) || array_is_list($value)) {
            throw new ApiException(400, 'invalid_json_object', 'JSON-pyynnön pitää olla objekti.');
        }
        return $value;
    }

    /** @param array<string, mixed> $data */
    public static function string(array $data, string $field, int $min, int $max, bool $required = true): string
    {
        $value = $data[$field] ?? '';
        if (!is_string($value)) {
            throw self::invalidField($field);
        }
        $value = trim($value);
        if (function_exists('mb_strlen')) {
            $length = mb_strlen($value, 'UTF-8');
        } else {
            $length = preg_match_all('/./us', $value, $matches);
            if ($length === false) {
                throw self::invalidField($field);
            }
        }
        if ((($required || $value !== '') && $length < $min) || $length > $max) {
            throw self::invalidField($field);
        }
        return $value;
    }

    /** @param array<string, mixed> $data */
    public static function integer(array $data, string $field, int $min, int $max): int
    {
        $value = $data[$field] ?? null;
        if (!is_int($value) || $value < $min || $value > $max) {
            throw self::invalidField($field);
        }
        return $value;
    }

    /** @param array<string, mixed> $data */
    public static function boolean(array $data, string $field): bool
    {
        $value = $data[$field] ?? null;
        if (!is_bool($value)) {
            throw self::invalidField($field);
        }
        return $value;
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public static function object(array $data, string $field): array
    {
        $value = $data[$field] ?? null;
        if (!is_array($value) || array_is_list($value)) {
            throw self::invalidField($field);
        }
        return $value;
    }

    /** @param array<string, mixed> $data @param list<string> $allowed @return list<string> */
    public static function enumList(array $data, string $field, array $allowed, int $min, int $max): array
    {
        $value = $data[$field] ?? null;
        if (!is_array($value) || !array_is_list($value) || count($value) < $min || count($value) > $max) {
            throw self::invalidField($field);
        }
        $result = [];
        foreach ($value as $item) {
            if (!is_string($item) || !in_array($item, $allowed, true) || in_array($item, $result, true)) {
                throw self::invalidField($field);
            }
            $result[] = $item;
        }
        return $result;
    }

    /** @param array<string, mixed> $data @param list<string> $allowed */
    public static function enum(array $data, string $field, array $allowed): string
    {
        $value = $data[$field] ?? null;
        if (!is_string($value) || !in_array($value, $allowed, true)) {
            throw self::invalidField($field);
        }
        return $value;
    }

    /** @param array<string, mixed> $data */
    public static function httpsUrl(array $data, string $field, int $max = 2048): string
    {
        $value = self::string($data, $field, 1, $max);
        return UrlNormalizer::https($value, $field, $max);
    }

    /** @param array<string, mixed> $data */
    public static function uuid(array $data, string $field): string
    {
        $value = self::string($data, $field, 36, 36);
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/Di', $value) !== 1) {
            throw self::invalidField($field);
        }
        return strtolower($value);
    }

    /** @param array<string, mixed> $data */
    public static function honeypotIsEmpty(array $data, string $field = 'website'): void
    {
        $value = $data[$field] ?? '';
        if (!is_string($value) || trim($value) !== '') {
            throw new ApiException(422, 'invalid_submission', 'Lähetystä ei voitu hyväksyä.');
        }
    }

    public static function invalidField(string $field): ApiException
    {
        return new ApiException(
            422,
            'validation_failed',
            'Pyynnön tiedot eivät kelpaa.',
            ['field' => $field],
        );
    }
}
