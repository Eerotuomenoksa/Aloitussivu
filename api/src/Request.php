<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class Request
{
    /**
     * @param array<string, string> $headers
     * @param array<string, mixed> $server
     */
    private function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $headers,
        public readonly string $body,
        public readonly array $server,
        public readonly string $requestId = '',
        /** @var array<string, string> */
        public readonly array $pathParameters = [],
    ) {
    }

    public static function fromGlobals(int $maxBodyBytes, string $basePath = ''): self
    {
        $headers = [];
        if (function_exists('getallheaders')) {
            foreach ((array) getallheaders() as $name => $value) {
                if (is_string($name) && is_string($value)) {
                    $headers[$name] = $value;
                }
            }
        }

        foreach ($_SERVER as $name => $value) {
            if (!is_string($value) || !str_starts_with($name, 'HTTP_')) {
                continue;
            }
            $header = str_replace('_', '-', substr($name, 5));
            $headers[$header] = $value;
        }
        if (isset($_SERVER['CONTENT_TYPE']) && is_string($_SERVER['CONTENT_TYPE'])) {
            $headers['Content-Type'] = $_SERVER['CONTENT_TYPE'];
        }
        if (isset($_SERVER['CONTENT_LENGTH']) && is_string($_SERVER['CONTENT_LENGTH'])) {
            $headers['Content-Length'] = $_SERVER['CONTENT_LENGTH'];
        }

        $declaredLength = $headers['Content-Length'] ?? '';
        if ($declaredLength !== '' && ctype_digit($declaredLength) && (int) $declaredLength > $maxBodyBytes) {
            throw new ApiException(413, 'payload_too_large', 'Pyyntö on liian suuri.');
        }

        $body = file_get_contents('php://input', false, null, 0, $maxBodyBytes + 1);
        return self::fromValues(
            method: (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'),
            uri: (string) ($_SERVER['REQUEST_URI'] ?? '/'),
            headers: $headers,
            body: $body === false ? '' : $body,
            server: $_SERVER,
            maxBodyBytes: $maxBodyBytes,
            basePath: $basePath,
        );
    }

    /**
     * @param array<string, string> $headers
     * @param array<string, mixed> $server
     */
    public static function fromValues(
        string $method,
        string $uri,
        array $headers = [],
        string $body = '',
        array $server = [],
        int $maxBodyBytes = 786432,
        string $basePath = '',
    ): self {
        $normalizedHeaders = [];
        foreach ($headers as $name => $value) {
            $normalizedHeaders[strtolower(trim($name))] = trim($value);
        }

        $declaredLength = $normalizedHeaders['content-length'] ?? '';
        if ($declaredLength !== '' && ctype_digit($declaredLength) && (int) $declaredLength > $maxBodyBytes) {
            throw new ApiException(413, 'payload_too_large', 'Pyyntö on liian suuri.');
        }
        if (strlen($body) > $maxBodyBytes) {
            throw new ApiException(413, 'payload_too_large', 'Pyyntö on liian suuri.');
        }

        $path = parse_url($uri, PHP_URL_PATH);
        if (!is_string($path) || $path === '' || !str_starts_with($path, '/')) {
            throw new ApiException(400, 'invalid_request_path', 'Pyynnön polku ei kelpaa.');
        }
        $path = $path === '/' ? '/' : rtrim($path, '/');
        $normalizedBasePath = rtrim($basePath, '/');
        if ($normalizedBasePath === '/') {
            $normalizedBasePath = '';
        }
        if ($normalizedBasePath !== '') {
            if ($path === $normalizedBasePath) {
                $path = '/';
            } elseif (str_starts_with($path, $normalizedBasePath . '/')) {
                $path = substr($path, strlen($normalizedBasePath));
            }
        }

        return new self(
            method: strtoupper(trim($method)),
            path: $path,
            headers: $normalizedHeaders,
            body: $body,
            server: $server,
        );
    }

    public function withRequestId(string $requestId): self
    {
        return new self(
            $this->method,
            $this->path,
            $this->headers,
            $this->body,
            $this->server,
            $requestId,
            $this->pathParameters,
        );
    }

    /** @param array<string, string> $pathParameters */
    public function withPathParameters(array $pathParameters): self
    {
        return new self(
            $this->method,
            $this->path,
            $this->headers,
            $this->body,
            $this->server,
            $this->requestId,
            $pathParameters,
        );
    }

    public function pathParameter(string $name): string
    {
        return $this->pathParameters[$name] ?? '';
    }

    public function header(string $name): string
    {
        return $this->headers[strtolower($name)] ?? '';
    }

    public function isSecure(bool $trustProxy): bool
    {
        $https = strtolower((string) ($this->server['HTTPS'] ?? ''));
        if ($https === 'on' || $https === '1' || (int) ($this->server['SERVER_PORT'] ?? 0) === 443) {
            return true;
        }

        return $trustProxy && strtolower($this->header('x-forwarded-proto')) === 'https';
    }

    public function clientAddress(): string
    {
        $address = $this->server['REMOTE_ADDR'] ?? 'unknown';
        return is_string($address) && $address !== '' ? $address : 'unknown';
    }
}
