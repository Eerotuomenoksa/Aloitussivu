<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use JsonException;

final class Response
{
    /** @param array<string, string> $headers */
    public function __construct(
        public readonly int $status,
        public readonly string $body,
        public readonly array $headers = [],
    ) {
    }

    /** @param array<string, mixed> $payload @param array<string, string> $headers */
    public static function json(array $payload, int $status = 200, array $headers = []): self
    {
        try {
            $body = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        } catch (JsonException) {
            $body = '{"error":{"code":"json_encoding_failed","message":"Vastauksen muodostaminen epäonnistui."}}';
            $status = 500;
        }

        return new self($status, $body, [
            'Content-Type' => 'application/json; charset=utf-8',
            'Cache-Control' => 'no-store',
            'X-Content-Type-Options' => 'nosniff',
            ...$headers,
        ]);
    }

    /** @param array<string, string> $headers */
    public static function empty(int $status, array $headers = []): self
    {
        return new self($status, '', [
            'Cache-Control' => 'no-store',
            'X-Content-Type-Options' => 'nosniff',
            ...$headers,
        ]);
    }

    /** @param array<string, string> $headers */
    public function withHeaders(array $headers): self
    {
        return new self($this->status, $this->body, [...$this->headers, ...$headers]);
    }

    public function emit(): never
    {
        http_response_code($this->status);
        foreach ($this->headers as $name => $value) {
            header($name . ': ' . $value);
        }
        echo $this->body;
        exit;
    }
}
