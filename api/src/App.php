<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use Throwable;

final class App
{
    private readonly OriginPolicy $originPolicy;

    public function __construct(
        private readonly Config $config,
        private readonly Router $router,
        private readonly RequestLogger $logger,
    ) {
        $this->originPolicy = new OriginPolicy($config->origin);
    }

    public static function create(
        Config $config,
        DatabaseConnection $database,
        RequestLogger $logger,
        ?RateLimiter $rateLimiter = null,
        ?AttachmentStorage $attachmentStorage = null,
        ?IdTokenVerifier $idTokenVerifier = null,
        ?NcscJob $ncscJob = null,
    ): self
    {
        $router = new Router();
        $router->add('GET', '/api/v1/health', static function (Request $request) use ($database): Response {
            try {
                $database->health();
            } catch (Throwable $error) {
                throw new ApiException(
                    503,
                    'service_unavailable',
                    'Palvelun tietokantayhteys ei ole käytettävissä.',
                    ['database' => 'down'],
                    previous: $error,
                );
            }

            return Response::json([
                'data' => [
                    'status' => 'ok',
                    'database' => 'up',
                    'version' => 'v1',
                    'time' => gmdate('c'),
                ],
                'requestId' => $request->requestId,
            ]);
        });

        $attachments = $attachmentStorage ?? new FileAttachmentStorage($config->attachmentPath);
        (new PublicApi(
            $database,
            $rateLimiter ?? new DatabaseRateLimiter($database, $config->rateLimitSecret),
            $attachments,
        ))->register($router);

        $tokenVerifier = $idTokenVerifier ?? new FirebaseIdTokenVerifier(
            $config->firebaseProjectId,
            new GoogleFirebasePublicKeys($config->firebasePublicKeyCachePath),
        );
        (new AdminApi(
            $database,
            new AdminAuthenticator(
                $database,
                $tokenVerifier,
                $config->adminTokenHeader,
                $config->environment === 'staging',
            ),
            $attachments,
            $ncscJob ?? new NcscJob($database, new HttpNcscSource()),
            $config,
            $config->basePath,
        ))->register($router);

        return new self($config, $router, $logger);
    }

    public function handle(Request $request): Response
    {
        $startedAt = hrtime(true);
        $requestId = RequestId::resolve($request->header('x-request-id'));
        $request = $request->withRequestId($requestId);
        $errorCode = '';

        try {
            if ($this->config->requireHttps && !$request->isSecure($this->config->trustProxy)) {
                throw new ApiException(426, 'https_required', 'HTTPS-yhteys vaaditaan.');
            }

            $corsHeaders = $this->originPolicy->headersFor($request);
            if ($request->method === 'OPTIONS') {
                $allowed = $this->router->allowedMethods($request->path);
                if ($allowed === []) {
                    throw new ApiException(404, 'not_found', 'Reittiä ei löytynyt.');
                }
                $response = Response::empty(204, [
                    ...$corsHeaders,
                    'Access-Control-Allow-Methods' => implode(', ', [...$allowed, 'OPTIONS']),
                    'Access-Control-Allow-Headers' => 'Authorization, Content-Type, X-Firebase-ID-Token, X-Request-ID',
                    'Access-Control-Max-Age' => '600',
                ]);
            } else {
                $response = $this->router->dispatch($request)->withHeaders($corsHeaders);
            }
        } catch (ApiException $error) {
            $errorCode = $error->errorCode;
            $response = self::errorResponse($error, $requestId);
        } catch (Throwable) {
            $errorCode = 'internal_error';
            $response = self::errorResponse(
                new ApiException(500, 'internal_error', 'Palvelimella tapahtui virhe.'),
                $requestId,
            );
        }

        $responseHeaders = ['X-Request-ID' => $requestId];
        if (str_starts_with($request->path, '/api/v1/admin/')) {
            $responseHeaders['Cache-Control'] = 'private, no-store';
        }
        $response = $response->withHeaders($responseHeaders);
        $this->logger->log('http_request', [
            'request_id' => $requestId,
            'method' => $request->method,
            'path' => $request->path,
            'status' => $response->status,
            'duration_ms' => round((hrtime(true) - $startedAt) / 1_000_000, 2),
            'error_code' => $errorCode,
        ]);

        return $response;
    }

    public static function errorResponse(ApiException $error, string $requestId): Response
    {
        $payload = [
            'error' => [
                'code' => $error->errorCode,
                'message' => $error->getMessage(),
                'requestId' => $requestId,
            ],
        ];
        if ($error->details !== []) {
            $payload['error']['details'] = $error->details;
        }
        return Response::json($payload, $error->status, $error->headers);
    }
}
