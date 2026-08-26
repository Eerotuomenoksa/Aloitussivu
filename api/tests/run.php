<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

use Aloitussivu\Api\ApiException;
use Aloitussivu\Api\App;
use Aloitussivu\Api\AttachmentStorage;
use Aloitussivu\Api\Config;
use Aloitussivu\Api\ConfigException;
use Aloitussivu\Api\DatabaseConnection;
use Aloitussivu\Api\DatabaseRateLimiter;
use Aloitussivu\Api\FirebaseIdentity;
use Aloitussivu\Api\FirebaseIdTokenVerifier;
use Aloitussivu\Api\FirebasePublicKeys;
use Aloitussivu\Api\IdTokenVerifier;
use Aloitussivu\Api\JsonRequestLogger;
use Aloitussivu\Api\HttpNcscSource;
use Aloitussivu\Api\NcscJob;
use Aloitussivu\Api\NcscScrapeItem;
use Aloitussivu\Api\NcscScrapeResult;
use Aloitussivu\Api\NcscSource;
use Aloitussivu\Api\NcscTarget;
use Aloitussivu\Api\PdoDatabase;
use Aloitussivu\Api\Request;
use Aloitussivu\Api\RequestLogger;
use Aloitussivu\Api\RequestId;
use Aloitussivu\Api\RateLimiter;
use Aloitussivu\Api\Validator;

final class FakeDatabase implements DatabaseConnection
{
    /** @var list<array{sql: string, parameters: array<string, mixed>}> */
    public array $executions = [];
    public int $requestCount = 1;
    /** @var list<array<string, mixed>|null> */
    public array $fetchOneResults = [];
    /** @var list<list<array<string, mixed>>> */
    public array $fetchAllResults = [];
    /** @var list<int> */
    public array $executeResults = [];

    public function __construct(public bool $failHealth = false)
    {
    }

    public function health(): void
    {
        if ($this->failHealth) {
            throw new RuntimeException('secret database details must not leak');
        }
    }

    public function fetchOne(string $sql, array $parameters = []): ?array
    {
        $this->executions[] = ['sql' => $sql, 'parameters' => $parameters];
        if ($this->fetchOneResults !== []) {
            return array_shift($this->fetchOneResults);
        }
        return str_contains($sql, 'SELECT request_count FROM')
            ? ['request_count' => $this->requestCount]
            : null;
    }

    public function fetchAll(string $sql, array $parameters = []): array
    {
        $this->executions[] = ['sql' => $sql, 'parameters' => $parameters];
        return $this->fetchAllResults === [] ? [] : array_shift($this->fetchAllResults);
    }

    public function execute(string $sql, array $parameters = []): int
    {
        $this->executions[] = ['sql' => $sql, 'parameters' => $parameters];
        return $this->executeResults === [] ? 1 : array_shift($this->executeResults);
    }

    public function transaction(callable $callback): mixed
    {
        return $callback($this);
    }
}

final class FakeRateLimiter implements RateLimiter
{
    /** @var list<array{route: string, client: string, limit: int, window: int}> */
    public array $calls = [];
    /** @var list<array{allowed: bool, remaining: int, retry_after: int}> */
    public array $results = [];

    public function consume(
        string $route,
        string $clientAddress,
        int $limit,
        int $windowSeconds,
        ?int $now = null,
    ): array {
        $this->calls[] = [
            'route' => $route,
            'client' => $clientAddress,
            'limit' => $limit,
            'window' => $windowSeconds,
        ];
        return $this->results === []
            ? ['allowed' => true, 'remaining' => max(0, $limit - 1), 'retry_after' => $windowSeconds]
            : array_shift($this->results);
    }
}

final class FakeAttachmentStorage implements AttachmentStorage
{
    /** @var list<array{feedback_id: string, contents: string, media_type: string, key: string}> */
    public array $stored = [];
    /** @var list<string> */
    public array $deleted = [];
    /** @var array<string, string> */
    public array $files = [];

    public function store(string $feedbackId, string $contents, string $mediaType): string
    {
        $key = '2026/08/' . $feedbackId . '-0123456789ab.png';
        $this->stored[] = [
            'feedback_id' => $feedbackId,
            'contents' => $contents,
            'media_type' => $mediaType,
            'key' => $key,
        ];
        return $key;
    }

    public function read(string $storageKey): ?string
    {
        return $this->files[$storageKey] ?? null;
    }

    public function delete(string $storageKey): void
    {
        $this->deleted[] = $storageKey;
    }
}

final class FakeIdTokenVerifier implements IdTokenVerifier
{
    /** @var array<string, FirebaseIdentity|ApiException> */
    public array $results = [];

    public function verify(string $token): FirebaseIdentity
    {
        $result = $this->results[$token] ?? new ApiException(401, 'invalid_token', 'Invalid token.');
        if ($result instanceof ApiException) {
            throw $result;
        }
        return $result;
    }
}

final class StaticFirebasePublicKeys implements FirebasePublicKeys
{
    /** @param array<string, string> $values */
    public function __construct(private readonly array $values)
    {
    }

    public function keys(bool $forceRefresh = false): array
    {
        return $this->values;
    }
}

final class MemoryLogger implements RequestLogger
{
    /** @var list<array{event: string, context: array<string, mixed>}> */
    public array $entries = [];

    public function log(string $event, array $context = []): void
    {
        $this->entries[] = ['event' => $event, 'context' => $context];
    }
}

final class FakeNcscSource implements NcscSource
{
    /** @var list<NcscTarget> */
    public array $targetValues = [];
    /** @var array<string, NcscScrapeResult|Throwable> */
    public array $scrapeValues = [];
    public ?Throwable $targetsError = null;
    /** @var list<string> */
    public array $scrapedUrls = [];

    public function targets(DateTimeImmutable $now): array
    {
        if ($this->targetsError !== null) {
            throw $this->targetsError;
        }
        return $this->targetValues;
    }

    public function scrape(NcscTarget $target, DateTimeImmutable $now): NcscScrapeResult
    {
        $this->scrapedUrls[] = $target->url;
        $value = $this->scrapeValues[$target->url] ?? new RuntimeException('missing_fake_ncsc_result');
        if ($value instanceof Throwable) {
            throw $value;
        }
        return $value;
    }
}

/** @var list<array{name: string, test: Closure(): void}> $tests */
$tests = [];

function test(string $name, Closure $test): void
{
    global $tests;
    $tests[] = ['name' => $name, 'test' => $test];
}

function assertTrue(bool $condition, string $message = 'Expected condition to be true.'): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function assertSameValue(mixed $expected, mixed $actual, string $message = ''): void
{
    if ($expected !== $actual) {
        throw new RuntimeException($message !== '' ? $message : sprintf(
            'Expected %s, got %s.',
            var_export($expected, true),
            var_export($actual, true),
        ));
    }
}

/** @return array<string, mixed> */
function jsonBody(\Aloitussivu\Api\Response $response): array
{
    $decoded = json_decode($response->body, true, 64, JSON_THROW_ON_ERROR);
    assertTrue(is_array($decoded));
    return $decoded;
}

/** @param array<string, mixed> $appOverrides @param array<string, mixed> $authenticationOverrides */
function testConfig(array $appOverrides = [], array $authenticationOverrides = []): Config
{
    return Config::fromArray([
        'app' => [
            'environment' => 'testing',
            'origin' => 'http://127.0.0.1:8088',
            'require_https' => false,
            'trust_proxy' => false,
            'max_body_bytes' => 4096,
            ...$appOverrides,
        ],
        'database' => [
            'dsn' => 'sqlite::memory:',
            'username' => '',
            'password' => '',
        ],
        'logging' => [
            'path' => sys_get_temp_dir() . '/aloitussivu-api-test.log',
        ],
        'attachments' => [
            'path' => sys_get_temp_dir() . '/aloitussivu-api-test-attachments',
        ],
        'security' => [
            'rate_limit_secret' => str_repeat('t', 32),
        ],
        'authentication' => [
            'firebase_project_id' => 'test-firebase-project',
            'public_key_cache_path' => sys_get_temp_dir() . '/aloitussivu-firebase-public-keys.json',
            ...$authenticationOverrides,
        ],
    ], dirname(__DIR__) . '/public');
}

function testApp(
    ?DatabaseConnection $database = null,
    ?RequestLogger $logger = null,
    ?Config $config = null,
    ?RateLimiter $rateLimiter = null,
    ?AttachmentStorage $attachmentStorage = null,
    ?IdTokenVerifier $idTokenVerifier = null,
    ?NcscJob $ncscJob = null,
): App
{
    return App::create(
        $config ?? testConfig(),
        $database ?? new FakeDatabase(),
        $logger ?? new MemoryLogger(),
        $rateLimiter,
        $attachmentStorage,
        $idTokenVerifier,
        $ncscJob,
    );
}

function adminVerifier(
    string $token = 'valid-admin-token',
    string $uid = 'firebase-admin-uid',
    string $email = 'admin@example.com',
    bool $emailVerified = true,
    string $signInProvider = '',
): FakeIdTokenVerifier {
    $verifier = new FakeIdTokenVerifier();
    $verifier->results[$token] = new FirebaseIdentity($uid, $email, $emailVerified, $signInProvider);
    return $verifier;
}

/** @param array<string, mixed> $payload */
function adminJsonRequest(string $method, string $path, array $payload, string $token = 'valid-admin-token'): Request
{
    return Request::fromValues(
        $method,
        $path,
        ['Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . $token],
        json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    );
}

function adminRequest(string $method, string $path, string $token = 'valid-admin-token'): Request
{
    return Request::fromValues($method, $path, ['Authorization' => 'Bearer ' . $token]);
}

/** @param array<string, mixed> $payload @param array<string, mixed> $server */
function jsonRequest(string $method, string $path, array $payload, array $server = []): Request
{
    return Request::fromValues(
        $method,
        $path,
        ['Content-Type' => 'application/json'],
        json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        $server,
    );
}

/** @return array<string, mixed> */
function validTestFeedback(string $id = '10000000-0000-4000-8000-000000000001'): array
{
    return [
        'id' => $id,
        'formVersion' => '2026-08-release-candidate',
        'createdAt' => '2026-08-20T09:00:00.000Z',
        'deviceTypes' => ['computer'],
        'useMode' => 'self',
        'webExperience' => 'often',
        'purposeClear' => 'yes',
        'headerClarity' => 'yes',
        'firstImpression' => 'Selkeä',
        'pageFeelings' => ['clear', 'useful'],
        'foundServices' => 'yes',
        'searchedFor' => 'Pankkipalvelu',
        'missingService' => '',
        'categoryClarity' => 'yes',
        'unclearCategory' => '',
        'municipalityCorrect' => 'yes',
        'localServicesUseful' => 'yes',
        'seniorPageStatus' => 'opened',
        'missingLocalLink' => '',
        'localNewsUseful' => 'yes',
        'featureRatings' => ['weather' => 4, 'scamAlerts' => 5],
        'missingFeature' => '',
        'textSize' => 'good',
        'contrastClarity' => 'yes',
        'mobileEase' => 'notTested',
        'difficultPart' => '',
        'tourViewed' => 'yes',
        'tourHelpful' => 'yes',
        'tourFeedback' => '',
        'usefulnessRating' => 5,
        'easeRating' => 4,
        'recommend' => 'yes',
        'mostImportantFix' => 'Tärkein korjaus tähän',
        'bestThing' => 'Selkeys',
        'website' => '',
    ];
}

function base64Url(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

/** @param array<string, mixed> $claims */
function signedJwt(mixed $privateKey, array $claims, string $keyId = 'test-key'): string
{
    $header = base64Url(json_encode(['alg' => 'RS256', 'kid' => $keyId, 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
    $payload = base64Url(json_encode($claims, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES));
    $signature = '';
    assertTrue(openssl_sign($header . '.' . $payload, $signature, $privateKey, OPENSSL_ALGO_SHA256));
    return $header . '.' . $payload . '.' . base64Url($signature);
}

/** @return array{firebase_uid: string, email: string, role: string, active: int} */
function adminRow(string $role = 'admin', int $active = 1): array
{
    return [
        'firebase_uid' => 'firebase-admin-uid',
        'email' => 'admin@example.com',
        'role' => $role,
        'active' => $active,
    ];
}

test('health returns database status and request ID', static function (): void {
    $response = testApp()->handle(Request::fromValues(
        'GET',
        '/api/v1/health',
        ['X-Request-ID' => 'test-request-123'],
    ));
    $body = jsonBody($response);
    assertSameValue(200, $response->status);
    assertSameValue('ok', $body['data']['status']);
    assertSameValue('up', $body['data']['database']);
    assertSameValue('test-request-123', $body['requestId']);
    assertSameValue('test-request-123', $response->headers['X-Request-ID']);
});

test('configured base path is removed before API routing', static function (): void {
    $request = Request::fromValues(
        'GET',
        '/aloitus/api/v1/health?source=path-test',
        basePath: '/aloitus',
    );
    assertSameValue('/api/v1/health', $request->path);

    $response = testApp(config: testConfig(['base_path' => '/aloitus']))->handle($request);
    assertSameValue(200, $response->status);
    assertSameValue('ok', jsonBody($response)['data']['status']);
});

test('database failure is safe and returns 503', static function (): void {
    $response = testApp(new FakeDatabase(true))->handle(Request::fromValues('GET', '/api/v1/health'));
    $body = jsonBody($response);
    assertSameValue(503, $response->status);
    assertSameValue('service_unavailable', $body['error']['code']);
    assertSameValue('down', $body['error']['details']['database']);
    assertTrue(!str_contains($response->body, 'secret database details'));
});

test('unknown route returns JSON 404', static function (): void {
    $response = testApp()->handle(Request::fromValues('GET', '/api/v1/missing'));
    assertSameValue(404, $response->status);
    assertSameValue('not_found', jsonBody($response)['error']['code']);
});

test('wrong method returns JSON 405 and Allow header', static function (): void {
    $response = testApp()->handle(Request::fromValues('POST', '/api/v1/health'));
    assertSameValue(405, $response->status);
    assertSameValue('method_not_allowed', jsonBody($response)['error']['code']);
    assertSameValue('GET', $response->headers['Allow']);
});

test('same origin CORS and preflight are restricted', static function (): void {
    $allowed = testApp()->handle(Request::fromValues(
        'GET',
        '/api/v1/health',
        ['Origin' => 'http://127.0.0.1:8088'],
    ));
    assertSameValue('http://127.0.0.1:8088', $allowed->headers['Access-Control-Allow-Origin']);

    $preflight = testApp()->handle(Request::fromValues(
        'OPTIONS',
        '/api/v1/health',
        ['Origin' => 'http://127.0.0.1:8088'],
    ));
    assertSameValue(204, $preflight->status);
    assertSameValue('GET, OPTIONS', $preflight->headers['Access-Control-Allow-Methods']);

    $denied = testApp()->handle(Request::fromValues(
        'GET',
        '/api/v1/health',
        ['Origin' => 'https://example.invalid'],
    ));
    assertSameValue(403, $denied->status);
    assertSameValue('origin_not_allowed', jsonBody($denied)['error']['code']);
    assertTrue(!isset($denied->headers['Access-Control-Allow-Origin']));

    $malformed = testApp()->handle(Request::fromValues(
        'GET',
        '/api/v1/health',
        ['Origin' => 'http://127.0.0.1:8088/not-an-origin'],
    ));
    assertSameValue(403, $malformed->status);
    assertTrue(!isset($malformed->headers['Access-Control-Allow-Origin']));
});

test('HTTPS is required when configured', static function (): void {
    $config = testConfig(['origin' => 'https://aloitussivu.example', 'require_https' => true]);
    $denied = testApp(config: $config)->handle(Request::fromValues('GET', '/api/v1/health'));
    assertSameValue(426, $denied->status);

    $allowed = testApp(config: $config)->handle(Request::fromValues(
        'GET',
        '/api/v1/health',
        server: ['HTTPS' => 'on'],
    ));
    assertSameValue(200, $allowed->status);
});

test('oversized request is rejected before body parsing', static function (): void {
    try {
        Request::fromValues('POST', '/api/v1/health', body: str_repeat('x', 1025), maxBodyBytes: 1024);
        throw new RuntimeException('Oversized request was accepted.');
    } catch (ApiException $error) {
        assertSameValue(413, $error->status);
        assertSameValue('payload_too_large', $error->errorCode);
    }
});

test('missing configuration and public configuration are rejected', static function (): void {
    $root = sys_get_temp_dir() . '/aloitussivu-config-test-' . bin2hex(random_bytes(5));
    $public = $root . '/public';
    mkdir($public, 0750, true);
    try {
        Config::load($root . '/missing.php', $public);
        throw new RuntimeException('Missing configuration was accepted.');
    } catch (ConfigException) {
        assertTrue(true);
    }

    $inside = $public . '/config.php';
    file_put_contents($inside, '<?php return [];');
    try {
        Config::load($inside, $public);
        throw new RuntimeException('Public configuration was accepted.');
    } catch (ConfigException) {
        assertTrue(true);
    }
    unlink($inside);
    rmdir($public);
    rmdir($root);
});

test('configuration rejects an origin with URL components', static function (): void {
    try {
        testConfig(['origin' => 'http://127.0.0.1:8088/unexpected']);
        throw new RuntimeException('Origin path was accepted.');
    } catch (ConfigException) {
        assertTrue(true);
    }
});

test('configuration validates and normalizes the public base path', static function (): void {
    assertSameValue('/aloitus', testConfig(['base_path' => '/aloitus/'])->basePath);
    assertSameValue('', testConfig(['base_path' => '/'])->basePath);

    try {
        testConfig(['base_path' => 'https://seniorsurf.fi/aloitus']);
        throw new RuntimeException('Absolute URL was accepted as a base path.');
    } catch (ConfigException) {
        assertTrue(true);
    }
});

test('JSON validation rejects wrong media type, bad JSON and insecure URL', static function (): void {
    try {
        Validator::jsonObject(Request::fromValues('POST', '/api/v1/example', body: '{}'));
        throw new RuntimeException('Missing JSON content type was accepted.');
    } catch (ApiException $error) {
        assertSameValue(415, $error->status);
    }

    try {
        Validator::jsonObject(Request::fromValues(
            'POST',
            '/api/v1/example',
            ['Content-Type' => 'application/jsonp'],
            '{}',
        ));
        throw new RuntimeException('JSONP media type was accepted as JSON.');
    } catch (ApiException $error) {
        assertSameValue(415, $error->status);
    }

    try {
        Validator::jsonObject(Request::fromValues(
            'POST',
            '/api/v1/example',
            ['Content-Type' => 'application/json'],
            '{broken',
        ));
        throw new RuntimeException('Bad JSON was accepted.');
    } catch (ApiException $error) {
        assertSameValue('invalid_json', $error->errorCode);
    }

    try {
        Validator::httpsUrl(['url' => 'http://example.com'], 'url');
        throw new RuntimeException('Insecure URL was accepted.');
    } catch (ApiException $error) {
        assertSameValue(422, $error->status);
    }
});

test('PDO parameters neutralize SQL injection input', static function (): void {
    assertTrue(in_array('sqlite', PDO::getAvailableDrivers(), true), 'pdo_sqlite is required for this test.');
    $database = new PdoDatabase(new PDO('sqlite::memory:'));
    $database->execute('CREATE TABLE sample (name TEXT NOT NULL)');
    $database->execute('INSERT INTO sample (name) VALUES (:name)', ['name' => 'allowed']);
    $attack = "' OR 1=1 --";
    assertSameValue(null, $database->fetchOne('SELECT name FROM sample WHERE name = :name', ['name' => $attack]));
    assertSameValue(1, (int) $database->fetchOne('SELECT COUNT(*) AS count FROM sample')['count']);
});

test('request log excludes body and unknown context fields', static function (): void {
    $logPath = sys_get_temp_dir() . '/aloitussivu-api-log-' . bin2hex(random_bytes(5)) . '.log';
    $logger = new JsonRequestLogger($logPath);
    $secretBody = '{"description":"private-feedback-text"}';
    $response = testApp(logger: $logger)->handle(Request::fromValues(
        'POST',
        '/api/v1/missing',
        ['Content-Type' => 'application/json'],
        $secretBody,
    ));
    assertSameValue(404, $response->status);
    $log = (string) file_get_contents($logPath);
    assertTrue(str_contains($log, 'http_request'));
    assertTrue(str_contains($log, '/api/v1/missing'));
    assertTrue(!str_contains($log, 'private-feedback-text'));
    assertTrue(!str_contains($log, 'description'));
    unlink($logPath);
});

test('rate limit stores only keyed client hash and parameterized values', static function (): void {
    $database = new FakeDatabase();
    $address = '203.0.113.42';
    $route = "/api/v1/test' OR 1=1 --";
    $result = (new DatabaseRateLimiter($database, str_repeat('s', 32)))->consume($route, $address, 5, 60, 120);
    assertTrue($result['allowed']);
    assertSameValue(4, $result['remaining']);
    $insert = $database->executions[0];
    assertTrue(!str_contains($insert['sql'], $route));
    assertSameValue($route, $insert['parameters']['route']);
    assertSameValue(32, strlen($insert['parameters']['bucket_hash']));
    assertTrue(!str_contains($insert['parameters']['bucket_hash'], $address));
});

test('request ID accepts safe value and replaces unsafe value', static function (): void {
    assertSameValue('safe-id_123', RequestId::resolve('safe-id_123'));
    $generated = RequestId::resolve("bad\r\nheader");
    assertSameValue(32, strlen($generated));
    assertTrue(ctype_xdigit($generated));
});

test('public list routes expose only contracted fields and support ETag', static function (): void {
    $approvedRows = [[
        'id' => '20000000-0000-4000-8000-000000000001',
        'name' => 'Turvallinen palvelu',
        'url' => 'https://example.com/',
        'category' => 'Palvelut',
        'source' => 'Ylläpito',
        'note' => 'Julkinen huomio',
        'created_at' => '2026-08-20 09:00:00.123456',
        'created_from_report_id' => 'must-not-leak',
    ]];
    $database = new FakeDatabase();
    $database->fetchAllResults = [
        $approvedRows,
        [[
            'id' => '20000000-0000-4000-8000-000000000002',
            'url' => 'https://blocked.example/',
            'created_at' => '2026-08-20 09:01:00.000000',
            'reason' => 'must-not-leak',
            'created_by' => 'must-not-leak',
        ]],
        [[
            'id' => '20000000-0000-4000-8000-000000000003',
            'title' => 'Varoitus',
            'body' => 'Älä avaa epäilyttävää viestiä.',
            'severity' => 'warning',
            'source' => 'NCSC',
            'source_url' => 'https://example.com/warning',
            'source_week' => '34/2026',
            'original_heading' => 'Varoitus',
            'structure_version' => '2026',
            'created_at' => '2026-08-20 09:02:00.000000',
            'updated_at' => '2026-08-20 09:02:00.000000',
            'expires_at' => '2026-08-27 09:02:00.000000',
        ]],
        $approvedRows,
    ];
    $app = testApp($database, rateLimiter: new FakeRateLimiter(), attachmentStorage: new FakeAttachmentStorage());

    $approved = $app->handle(Request::fromValues('GET', '/api/v1/approved-links'));
    assertSameValue(200, $approved->status);
    assertSameValue('Turvallinen palvelu', jsonBody($approved)['data'][0]['name']);
    assertTrue(!str_contains($approved->body, 'created_from_report_id'));
    assertSameValue('public, max-age=60, stale-while-revalidate=300', $approved->headers['Cache-Control']);

    $blocked = $app->handle(Request::fromValues('GET', '/api/v1/blocked-links'));
    assertSameValue(200, $blocked->status);
    assertTrue(!str_contains($blocked->body, 'must-not-leak'));

    $alerts = $app->handle(Request::fromValues('GET', '/api/v1/scam-alerts'));
    assertSameValue(200, $alerts->status);
    assertSameValue(true, jsonBody($alerts)['data'][0]['active']);
    $scamQuery = $database->executions[2]['sql'];
    assertTrue(str_contains($scamQuery, 'active = 1'));
    assertTrue(str_contains($scamQuery, 'expires_at > UTC_TIMESTAMP(6)'));

    $notModified = $app->handle(Request::fromValues(
        'GET',
        '/api/v1/approved-links',
        ['If-None-Match' => $approved->headers['ETag']],
    ));
    assertSameValue(304, $notModified->status);
    assertSameValue('', $notModified->body);
});

test('link report validates, parameterizes and deduplicates submissions', static function (): void {
    $id = '30000000-0000-4000-8000-000000000001';
    $payload = [
        'id' => $id,
        'type' => 'broken',
        'name' => "Palvelu' OR 1=1 --",
        'url' => 'https://Example.com/path#fragment',
        'category' => 'Palvelut',
        'source' => 'Käyttäjä',
        'note' => 'Linkki ei avaudu.',
        'website' => '',
    ];
    $database = new FakeDatabase();
    $database->fetchOneResults = [null, null];
    $app = testApp($database, rateLimiter: new FakeRateLimiter(), attachmentStorage: new FakeAttachmentStorage());
    $created = $app->handle(jsonRequest('POST', '/api/v1/link-reports', $payload));
    assertSameValue(201, $created->status);
    assertSameValue(false, jsonBody($created)['data']['duplicate']);
    $insert = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO link_reports'),
    ))[0];
    assertTrue(!str_contains($insert['sql'], "Palvelu' OR 1=1 --"));
    assertSameValue("Palvelu' OR 1=1 --", $insert['parameters']['name']);
    assertSameValue('https://example.com/path', $insert['parameters']['url']);
    assertSameValue(32, strlen($insert['parameters']['url_hash']));

    $duplicateDatabase = new FakeDatabase();
    $duplicateDatabase->fetchOneResults = [
        null,
        ['id' => '30000000-0000-4000-8000-000000000099', 'created_at' => '2026-08-20 09:00:00.000000'],
    ];
    $duplicate = testApp(
        $duplicateDatabase,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/link-reports', $payload));
    assertSameValue(200, $duplicate->status);
    assertSameValue(true, jsonBody($duplicate)['data']['duplicate']);
    assertSameValue('30000000-0000-4000-8000-000000000099', jsonBody($duplicate)['data']['id']);
    assertTrue(!array_filter(
        $duplicateDatabase->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO link_reports'),
    ));
});

test('same submission ID is idempotent and conflicting content is rejected', static function (): void {
    $payload = [
        'id' => '30000000-0000-4000-8000-000000000002',
        'type' => 'new',
        'name' => 'Uusi palvelu',
        'url' => 'https://example.com/new',
        'category' => '',
        'source' => '',
        'note' => '',
    ];
    $existing = [
        ...$payload,
        'created_at' => '2026-08-20 09:00:00.000000',
    ];
    $database = new FakeDatabase();
    $database->fetchOneResults = [$existing];
    $response = testApp(
        $database,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/link-reports', $payload));
    assertSameValue(200, $response->status);
    assertSameValue(true, jsonBody($response)['data']['duplicate']);

    $conflictDatabase = new FakeDatabase();
    $conflictDatabase->fetchOneResults = [[...$existing, 'note' => 'Eri sisältö']];
    $conflict = testApp(
        $conflictDatabase,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/link-reports', $payload));
    assertSameValue(409, $conflict->status);
    assertSameValue('idempotency_conflict', jsonBody($conflict)['error']['code']);
});

test('feedback stores a verified screenshot outside the database payload', static function (): void {
    $png = base64_decode(
        'iVBORw0KGgoAAA' . 'ANSUhEUgAAA' . 'AEAAA' . 'ABCAQAAAC1HAwCAAA' . 'AC0lEQVR42mNk+A8AAQUBAScY42YAAA' . 'AASUVORK5CYII=',
        true,
    );
    assertTrue(is_string($png));
    $payload = [
        'id' => '40000000-0000-4000-8000-000000000001',
        'type' => 'accessibility',
        'title' => 'Painike ei erotu',
        'description' => 'Painikkeen kontrasti on liian matala.',
        'page' => 'index',
        'screenshot' => [
            'name' => 'kuva.png',
            'type' => 'image/png',
            'size' => strlen($png),
            'dataUrl' => 'data:image/png;base64,' . base64_encode($png),
        ],
        'website' => '',
    ];
    $database = new FakeDatabase();
    $database->fetchOneResults = [null];
    $storage = new FakeAttachmentStorage();
    $response = testApp(
        $database,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: $storage,
    )->handle(jsonRequest('POST', '/api/v1/feedback', $payload));
    assertSameValue(201, $response->status);
    assertSameValue(true, jsonBody($response)['data']['hasScreenshot']);
    assertSameValue(1, count($storage->stored));
    assertSameValue($png, $storage->stored[0]['contents']);
    $serializedDatabaseCalls = serialize($database->executions);
    assertTrue(!str_contains($serializedDatabaseCalls, 'data:image/png'));
    assertTrue(!str_contains($serializedDatabaseCalls, base64_encode($png)));
    assertTrue(str_contains($serializedDatabaseCalls, 'INSERT INTO feedback_attachments'));
});

test('invalid feedback and disguised screenshots do not write data', static function (): void {
    $database = new FakeDatabase();
    $storage = new FakeAttachmentStorage();
    $response = testApp(
        $database,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: $storage,
    )->handle(jsonRequest('POST', '/api/v1/feedback', [
        'id' => '40000000-0000-4000-8000-000000000002',
        'type' => 'bug',
        'title' => 'Virhe',
        'description' => 'Kuva ei ole oikeasti kuva.',
        'page' => 'index',
        'screenshot' => [
            'name' => 'fake.png',
            'type' => 'image/png',
            'size' => 12,
            'dataUrl' => 'data:image/png;base64,' . base64_encode('not an image'),
        ],
    ]));
    assertSameValue(422, $response->status);
    assertSameValue('validation_failed', jsonBody($response)['error']['code']);
    assertSameValue([], $database->executions);
    assertSameValue([], $storage->stored);

    $oversized = testApp(
        new FakeDatabase(),
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/feedback', [
        'id' => '40000000-0000-4000-8000-000000000003',
        'type' => 'bug',
        'title' => 'Virhe',
        'description' => str_repeat('x', 1601),
        'page' => 'index',
    ]));
    assertSameValue(422, $oversized->status);
});

test('test feedback mirrors the Firestore field contract without echoing answers', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [null];
    $payload = validTestFeedback();
    $payload['mostImportantFix'] = 'Yksityinen testipalaute ei kuulu vastaukseen';
    $response = testApp(
        $database,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/test-feedback', $payload));
    assertSameValue(201, $response->status);
    assertSameValue('2026-08-release-candidate', jsonBody($response)['data']['formVersion']);
    assertTrue(!str_contains($response->body, 'Yksityinen testipalaute'));
    $insert = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO test_feedback_responses'),
    ))[0];
    assertTrue(str_contains($insert['parameters']['response_json'], 'Yksityinen testipalaute'));

    $invalidPayload = validTestFeedback('10000000-0000-4000-8000-000000000002');
    $invalidPayload['bestThing'] = str_repeat('x', 901);
    $invalidDatabase = new FakeDatabase();
    $invalid = testApp(
        $invalidDatabase,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/test-feedback', $invalidPayload));
    assertSameValue(422, $invalid->status);
    assertSameValue([], $invalidDatabase->executions);
});

test('usage events store aggregates without raw client identifiers', static function (): void {
    $database = new FakeDatabase();
    $limiter = new FakeRateLimiter();
    $response = testApp(
        $database,
        rateLimiter: $limiter,
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/usage-events', [
        'type' => 'linkClick',
        'page' => 'index',
        'url' => 'https://Example.com/service#details',
        'label' => 'Palvelu',
        'category' => 'Asiointi',
    ], ['REMOTE_ADDR' => '203.0.113.45']));
    assertSameValue(204, $response->status);
    assertSameValue(2, count($database->executions));
    $stored = serialize($database->executions);
    assertTrue(!str_contains($stored, '203.0.113.45'));
    assertTrue(str_contains($stored, 'usage_daily'));
    assertTrue(str_contains($stored, 'usage_link_daily'));
    assertSameValue(32, strlen($database->executions[1]['parameters']['link_hash']));

    $invalidDatabase = new FakeDatabase();
    $invalid = testApp(
        $invalidDatabase,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/usage-events', [
        'type' => 'pageview',
        'page' => 'index',
        'userId' => 'must-not-be-accepted',
    ]));
    assertSameValue(422, $invalid->status);
    assertSameValue([], $invalidDatabase->executions);
});

test('rapid repeats return a controlled 429 response', static function (): void {
    $limiter = new FakeRateLimiter();
    $limiter->results = [['allowed' => false, 'remaining' => 0, 'retry_after' => 37]];
    $database = new FakeDatabase();
    $response = testApp(
        $database,
        rateLimiter: $limiter,
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/link-reports', [
        'id' => '30000000-0000-4000-8000-000000000003',
        'type' => 'broken',
        'name' => 'Palvelu',
        'url' => 'https://example.com/',
        'note' => '',
    ], ['REMOTE_ADDR' => '203.0.113.46']));
    assertSameValue(429, $response->status);
    assertSameValue('rate_limited', jsonBody($response)['error']['code']);
    assertSameValue('37', $response->headers['Retry-After']);
    assertSameValue([], $database->executions);
});

test('public clients cannot read submission collections', static function (): void {
    $app = testApp(rateLimiter: new FakeRateLimiter(), attachmentStorage: new FakeAttachmentStorage());
    foreach (['/api/v1/link-reports', '/api/v1/feedback', '/api/v1/test-feedback', '/api/v1/usage-events'] as $path) {
        $response = $app->handle(Request::fromValues('GET', $path));
        assertSameValue(405, $response->status, 'Expected read denial for ' . $path);
        assertSameValue('POST', $response->headers['Allow']);
    }
});

test('Firebase verifier checks RS256 signature and required claims', static function (): void {
    assertTrue(function_exists('openssl_pkey_new'), 'OpenSSL is required for Firebase token tests.');
    $privateKey = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
    assertTrue($privateKey !== false);
    $details = openssl_pkey_get_details($privateKey);
    assertTrue(is_array($details) && is_string($details['key'] ?? null));
    $now = time();
    $claims = [
        'aud' => 'test-firebase-project',
        'iss' => 'https://securetoken.google.com/test-firebase-project',
        'sub' => 'firebase-admin-uid',
        'email' => 'admin@example.com',
        'email_verified' => true,
        'firebase' => [
            'identities' => ['google.com' => ['google-provider-user-id']],
            'sign_in_provider' => 'google.com',
        ],
        'iat' => $now - 10,
        'auth_time' => $now - 20,
        'exp' => $now + 3600,
    ];
    $verifier = new FirebaseIdTokenVerifier(
        'test-firebase-project',
        new StaticFirebasePublicKeys(['test-key' => $details['key']]),
    );
    $identity = $verifier->verify(signedJwt($privateKey, $claims));
    assertSameValue('firebase-admin-uid', $identity->uid);
    assertSameValue('admin@example.com', $identity->email);
    assertSameValue(true, $identity->emailVerified);
    assertSameValue('google.com', $identity->signInProvider);

    foreach ([
        [...$claims, 'exp' => $now - 120],
        [...$claims, 'aud' => 'wrong-project'],
        [...$claims, 'iss' => 'https://accounts.google.com'],
    ] as $invalidClaims) {
        try {
            $verifier->verify(signedJwt($privateKey, $invalidClaims));
            throw new RuntimeException('Invalid Firebase claims were accepted.');
        } catch (ApiException $error) {
            assertSameValue(401, $error->status);
            assertSameValue('invalid_token', $error->errorCode);
        }
    }

    $tampered = signedJwt($privateKey, $claims);
    $tampered[20] = $tampered[20] === 'a' ? 'b' : 'a';
    try {
        $verifier->verify($tampered);
        throw new RuntimeException('Tampered Firebase token was accepted.');
    } catch (ApiException $error) {
        assertSameValue('invalid_token', $error->errorCode);
    }
});

test('admin routes reject missing, expired and unassigned identities', static function (): void {
    $database = new FakeDatabase();
    $missing = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(Request::fromValues('GET', '/api/v1/admin/me', ['X-Admin-Email' => 'admin@example.com']));
    assertSameValue(401, $missing->status);
    assertSameValue('authentication_required', jsonBody($missing)['error']['code']);
    assertSameValue([], $database->executions);

    $expiredVerifier = new FakeIdTokenVerifier();
    $expiredVerifier->results['expired'] = new ApiException(401, 'invalid_token', 'Expired.');
    $expired = testApp(
        new FakeDatabase(),
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: $expiredVerifier,
    )->handle(adminRequest('GET', '/api/v1/admin/me', 'expired'));
    assertSameValue(401, $expired->status);
    assertSameValue('invalid_token', jsonBody($expired)['error']['code']);

    $unassigned = testApp(
        new FakeDatabase(),
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminRequest('GET', '/api/v1/admin/me'));
    assertSameValue(403, $unassigned->status);
    assertSameValue('admin_forbidden', jsonBody($unassigned)['error']['code']);

    $inactiveDatabase = new FakeDatabase();
    $inactiveDatabase->fetchOneResults = [adminRow(active: 0)];
    $inactive = testApp(
        $inactiveDatabase,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminRequest('GET', '/api/v1/admin/me'));
    assertSameValue(403, $inactive->status);
    assertSameValue('admin_forbidden', jsonBody($inactive)['error']['code']);

});

test('active provisioned Firebase UID is accepted when optional identity claims are omitted', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow()];
    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(email: '', emailVerified: false, signInProvider: ''),
    )->handle(adminRequest('GET', '/api/v1/admin/me'));

    assertSameValue(200, $response->status);
    assertSameValue('firebase-admin-uid', jsonBody($response)['data']['uid']);
    assertSameValue('admin', jsonBody($response)['data']['role']);
});

test('verified active admin can read identity and private collections', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow(), adminRow()];
    $database->fetchAllResults = [[[
        'id' => '40000000-0000-4000-8000-000000000010',
        'type' => 'bug',
        'title' => 'Yksityinen palaute',
        'description' => 'Vain ylläpidolle.',
        'page' => 'index',
        'status' => 'new',
        'public_note' => '',
        'client_json' => '{"browserName":"Example"}',
        'has_screenshot' => 1,
        'created_at' => '2026-08-21 08:00:00.000000',
        'updated_at' => '2026-08-21 08:00:00.000000',
        'handled_at' => null,
        'handled_by' => null,
        'original_name' => 'kuva.png',
        'media_type' => 'image/png',
        'byte_size' => 123,
        'storage_key' => 'must-not-leak',
    ]]];
    $app = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    );
    $me = $app->handle(adminRequest('GET', '/api/v1/admin/me'));
    assertSameValue(200, $me->status);
    assertSameValue('admin', jsonBody($me)['data']['role']);
    assertSameValue('private, no-store', $me->headers['Cache-Control']);

    $feedback = $app->handle(adminRequest('GET', '/api/v1/admin/feedback'));
    assertSameValue(200, $feedback->status);
    assertSameValue('Yksityinen palaute', jsonBody($feedback)['data'][0]['title']);
    assertSameValue('/api/v1/admin/feedback/40000000-0000-4000-8000-000000000010/attachment', jsonBody($feedback)['data'][0]['attachment']['url']);
    assertTrue(!str_contains($feedback->body, 'must-not-leak'));
});

test('attachment URL includes the configured public base path', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow()];
    $database->fetchAllResults = [[[
        'id' => '40000000-0000-4000-8000-000000000010',
        'type' => 'bug',
        'title' => 'Palaute',
        'description' => 'Kuvaus',
        'page' => 'index',
        'status' => 'new',
        'public_note' => '',
        'client_json' => '{}',
        'has_screenshot' => 1,
        'created_at' => '2026-08-25 08:00:00.000000',
        'updated_at' => '2026-08-25 08:00:00.000000',
        'handled_at' => null,
        'handled_by' => null,
        'original_name' => 'kuva.png',
        'media_type' => 'image/png',
        'byte_size' => 123,
    ]]];
    $response = testApp(
        $database,
        config: testConfig(['base_path' => '/aloitus']),
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminRequest('GET', '/api/v1/admin/feedback'));

    assertSameValue(200, $response->status);
    assertSameValue(
        '/aloitus/api/v1/admin/feedback/40000000-0000-4000-8000-000000000010/attachment',
        jsonBody($response)['data'][0]['attachment']['url'],
    );
});

test('viewer can read but cannot mutate admin resources', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow('viewer')];
    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminJsonRequest(
        'PATCH',
        '/api/v1/admin/link-reports/30000000-0000-4000-8000-000000000010',
        ['status' => 'rejected', 'reviewReason' => 'Ei sovellu.'],
    ));
    assertSameValue(403, $response->status);
    assertSameValue('insufficient_role', jsonBody($response)['error']['code']);
    assertSameValue(1, count($database->executions));
});

test('admin link report mutation is parameterized and audited atomically', static function (): void {
    $id = '30000000-0000-4000-8000-000000000010';
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow(), ['id' => $id]];
    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminJsonRequest(
        'PATCH',
        '/api/v1/admin/link-reports/' . $id,
        ['status' => 'rejected', 'reviewReason' => "Sisäinen perustelu' OR 1=1 --"],
    ));
    assertSameValue(200, $response->status);
    $update = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'UPDATE link_reports'),
    ))[0];
    assertTrue(!str_contains($update['sql'], "OR 1=1"));
    assertSameValue("Sisäinen perustelu' OR 1=1 --", $update['parameters']['review_reason']);
    $audit = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO audit_log'),
    ))[0];
    assertSameValue('firebase-admin-uid', $audit['parameters']['actor_firebase_uid']);
    assertSameValue('link_report.update', $audit['parameters']['action']);
    assertSameValue($id, $audit['parameters']['target_id']);
    assertTrue(!str_contains((string) $audit['parameters']['metadata_json'], 'Sisäinen perustelu'));
});

test('admin creates approved links with an audit entry and duplicate protection', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow(), null];
    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminJsonRequest('POST', '/api/v1/admin/approved-links', [
        'id' => '20000000-0000-4000-8000-000000000010',
        'name' => 'Hyväksytty palvelu',
        'url' => 'https://Example.com/service#details',
        'category' => 'Asiointi',
        'source' => 'Ylläpito',
        'note' => '',
    ]));
    assertSameValue(201, $response->status);
    $insert = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO approved_links'),
    ))[0];
    assertSameValue('https://example.com/service', $insert['parameters']['url']);
    assertSameValue(32, strlen($insert['parameters']['url_hash']));
    assertTrue((bool) array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO audit_log'),
    ));
});

test('admin attachment download stays authenticated and outside the web root', static function (): void {
    $id = '40000000-0000-4000-8000-000000000011';
    $key = '2026/08/' . $id . '-0123456789ab.png';
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow(), [
        'storage_key' => $key,
        'original_name' => "kuva\r\nX-Evil: yes.png",
        'media_type' => 'image/png',
        'byte_size' => 7,
    ]];
    $storage = new FakeAttachmentStorage();
    $storage->files[$key] = 'PNGDATA';
    $response = testApp(
        $database,
        attachmentStorage: $storage,
        idTokenVerifier: adminVerifier(),
    )->handle(adminRequest('GET', '/api/v1/admin/feedback/' . $id . '/attachment'));
    assertSameValue(200, $response->status);
    assertSameValue('PNGDATA', $response->body);
    assertSameValue('image/png', $response->headers['Content-Type']);
    assertTrue(!str_contains($response->headers['Content-Disposition'], "\r"));
    assertTrue(!str_contains($response->headers['Content-Disposition'], "\n"));
});

test('parameterized admin routes report stable method contracts', static function (): void {
    $response = testApp(
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminRequest('GET', '/api/v1/admin/link-reports/30000000-0000-4000-8000-000000000010'));
    assertSameValue(405, $response->status);
    assertSameValue('PATCH', $response->headers['Allow']);

    $preflight = testApp(
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(Request::fromValues(
        'OPTIONS',
        '/api/v1/admin/link-reports/30000000-0000-4000-8000-000000000010',
        ['Origin' => 'http://127.0.0.1:8088'],
    ));
    assertSameValue(204, $preflight->status);
    assertSameValue('PATCH, OPTIONS', $preflight->headers['Access-Control-Allow-Methods']);
    assertSameValue('Authorization, Content-Type, X-Firebase-ID-Token, X-Request-ID', $preflight->headers['Access-Control-Allow-Headers']);
});

test('staging can keep HTTP Basic Auth while Firebase uses a separate token header', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow()];
    $request = Request::fromValues('GET', '/api/v1/admin/me', [
        'Authorization' => 'Basic c3RhZ2luZzp0ZXN0',
        'X-Firebase-ID-Token' => 'Bearer valid-admin-token',
    ]);
    $response = testApp(
        $database,
        config: testConfig(authenticationOverrides: ['token_header' => 'x-firebase-id-token']),
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle($request);
    assertSameValue(200, $response->status);
    assertSameValue('admin', jsonBody($response)['data']['role']);
});

test('NCSC feed parser selects one review and only recent consumer scam news', static function (): void {
    $source = new HttpNcscSource();
    $now = new DateTimeImmutable('2026-08-25T12:00:00Z');
    $xml = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <item><title>Viikkokatsaus 35/2026</title><link>https://www.kyberturvallisuuskeskus.fi/ajankohtaista/viikkokatsaus-352026</link><pubDate>Mon, 24 Aug 2026 08:00:00 +0000</pubDate></item>
  <item><title>Pankin nimissä lähetetään huijausviestejä</title><link>https://www.kyberturvallisuuskeskus.fi/ajankohtaista/pankkihuijaus</link><description>Varo tietojenkalastelua tekstiviesteissä.</description><pubDate>Sun, 23 Aug 2026 08:00:00 +0000</pubDate></item>
  <item><title>Tekninen haavoittuvuus</title><link>https://www.kyberturvallisuuskeskus.fi/ajankohtaista/cve</link><description>Huijaus ja CVE organisaatioille.</description><pubDate>Sat, 22 Aug 2026 08:00:00 +0000</pubDate></item>
  <item><title>Vanha huijaus</title><link>https://www.kyberturvallisuuskeskus.fi/ajankohtaista/vanha</link><description>Huijaussoitto.</description><pubDate>Wed, 01 Jul 2026 08:00:00 +0000</pubDate></item>
  <item><title>Väärä palvelin</title><link>https://example.com/not-allowed</link><description>Huijaus.</description><pubDate>Mon, 24 Aug 2026 08:00:00 +0000</pubDate></item>
</channel></rss>
XML;
    $targets = $source->targetsFromXml($xml, $now);
    assertSameValue(2, count($targets));
    assertSameValue('review', $targets[0]->kind);
    assertSameValue('news', $targets[1]->kind);
    assertTrue(str_contains($targets[1]->title, 'huijausviestejä'));
});

test('NCSC 2026 review parser extracts only the current scam section', static function (): void {
    $source = new HttpNcscSource();
    $target = new NcscTarget(
        'https://www.kyberturvallisuuskeskus.fi/ajankohtaista/viikkokatsaus-352026',
        'Viikkokatsaus 35/2026',
        new DateTimeImmutable('2026-08-24T08:00:00Z'),
        'review',
    );
    $html = <<<'HTML'
<!doctype html><html><body><main>
  <h1>Kyberturvallisuuskeskuksen viikkokatsaus 35/2026</h1>
  <time datetime="2026-08-24T08:00:00Z">24.8.2026</time>
  <h2>Ajankohtaiset huijaukset</h2>
  <h3>Pankin nimissä lähetetty kalasteluviesti</h3><p>Älä anna pankkitunnuksia viestin linkin kautta.</p>
  <h3>Valelaskuja yrityksen nimissä</h3><p>Tarkista laskun lähettäjä ennen maksamista.</p>
  <h2>Haavoittuvuudet</h2><h3>Tekninen tiedote</h3><p>Tämä ei kuulu kuluttajavaroituksiin.</p>
</main></body></html>
HTML;
    $result = $source->resultFromHtml($html, $target, new DateTimeImmutable('2026-08-25T12:00:00Z'));
    assertSameValue('35/2026', $result->weekLabel);
    assertSameValue('2026', $result->structureVersion);
    assertSameValue(2, count($result->items));
    assertTrue(!str_contains(serialize($result->items), 'Tekninen tiedote'));
});

test('NCSC parser truncates long source text at a whole word', static function (): void {
    $source = new HttpNcscSource();
    $target = new NcscTarget(
        'https://www.kyberturvallisuuskeskus.fi/ajankohtaista/viikkokatsaus-352026',
        'Viikkokatsaus 35/2026',
        new DateTimeImmutable('2026-08-24T08:00:00Z'),
        'review',
    );
    $longBody = trim(str_repeat('turvallinen ', 100));
    $html = '<!doctype html><html><body><main>'
        . '<h1>Kyberturvallisuuskeskuksen viikkokatsaus 35/2026</h1>'
        . '<h2>Ajankohtaiset huijaukset</h2>'
        . '<h3>Pankin nimissä lähetetty kalasteluviesti</h3><p>' . $longBody . '</p>'
        . '</main></body></html>';
    $result = $source->resultFromHtml($html, $target, new DateTimeImmutable('2026-08-25T12:00:00Z'));
    assertSameValue(1, count($result->items));
    assertTrue(str_ends_with($result->items[0]->body, 'turvallinen…'));
});

test('NCSC job locks execution, stores deterministic alerts and releases the lock', static function (): void {
    $url = 'https://www.kyberturvallisuuskeskus.fi/ajankohtaista/viikkokatsaus-352026';
    $publishedAt = new DateTimeImmutable('2026-08-24T08:00:00Z');
    $source = new FakeNcscSource();
    $source->targetValues = [new NcscTarget($url, 'Viikkokatsaus 35/2026', $publishedAt, 'review')];
    $fullAlertBody = str_repeat('Huijausviesti voi näyttää aidolta. ', 14)
        . 'Älä anna pankkitunnuksia tai avaa viestin linkkiä.';
    $source->scrapeValues[$url] = new NcscScrapeResult(
        $url,
        '35/2026',
        $publishedAt,
        [new NcscScrapeItem('Pankkihuijaus', $fullAlertBody)],
        '2026',
    );
    $database = new FakeDatabase();
    $database->fetchOneResults = [['acquired' => 1], null, null, ['released' => 1]];
    $result = (new NcscJob($database, $source))->run(new DateTimeImmutable('2026-08-25T12:00:00Z'));
    assertSameValue('completed', $result->status);
    assertSameValue(1, $result->alertsCreated);
    assertSameValue(1, $result->targetsProcessed);
    assertSameValue([$url], $source->scrapedUrls);

    $alertInsert = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO scam_alerts'),
    ))[0];
    assertTrue(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/D', (string) $alertInsert['parameters']['id']) === 1);
    assertTrue(str_contains($alertInsert['sql'], 'ON DUPLICATE KEY UPDATE'));
    assertSameValue('ncsc-auto', $alertInsert['parameters']['source']);
    assertTrue(strlen((string) $alertInsert['parameters']['body']) > 300);
    assertTrue(str_ends_with((string) $alertInsert['parameters']['body'], 'Älä anna pankkitunnuksia tai avaa viestin linkkiä.'));
    assertTrue((bool) array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'RELEASE_LOCK'),
    ));

    $existingDatabase = new FakeDatabase();
    $existingDatabase->fetchOneResults = [
        ['acquired' => 1],
        null,
        ['id' => $alertInsert['parameters']['id']],
        ['released' => 1],
    ];
    $existingDatabase->executeResults = [2, 1];
    $rerun = (new NcscJob($existingDatabase, $source))->run(new DateTimeImmutable('2026-09-02T12:00:00Z'));
    assertSameValue(0, $rerun->alertsCreated);
    $rerunInsert = array_values(array_filter(
        $existingDatabase->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO scam_alerts'),
    ))[0];
    assertSameValue($alertInsert['parameters']['id'], $rerunInsert['parameters']['id']);
});

test('NCSC job skips overlapping and recently processed runs without scraping', static function (): void {
    $source = new FakeNcscSource();
    $database = new FakeDatabase();
    $database->fetchOneResults = [['acquired' => 0]];
    $overlap = (new NcscJob($database, $source))->run(new DateTimeImmutable('2026-08-25T12:00:00Z'));
    assertSameValue('skipped', $overlap->status);
    assertSameValue(1, $overlap->targetsSkipped);
    assertSameValue([], $database->executeResults);

    $url = 'https://www.kyberturvallisuuskeskus.fi/ajankohtaista/viikkokatsaus-352026';
    $source->targetValues = [new NcscTarget($url, 'Viikkokatsaus 35/2026', null, 'review')];
    $recentDatabase = new FakeDatabase();
    $recentDatabase->fetchOneResults = [
        ['acquired' => 1],
        ['week_label' => '35/2026', 'structure_version' => '2026'],
        null,
        ['released' => 1],
    ];
    $recent = (new NcscJob($recentDatabase, $source))->run(new DateTimeImmutable('2026-08-25T12:00:00Z'));
    assertSameValue('completed', $recent->status);
    assertSameValue(1, $recent->targetsSkipped);
    assertSameValue([], $source->scrapedUrls);
    $skipLog = array_values(array_filter(
        $recentDatabase->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO ncsc_scrape_logs'),
    ))[0];
    assertSameValue('35/2026', $skipLog['parameters']['week_label']);
    assertSameValue('2026', $skipLog['parameters']['structure_version']);
    assertSameValue('recently_processed', $skipLog['parameters']['message']);
});

test('NCSC job refreshes a recently processed legacy alert truncated at 300 characters', static function (): void {
    $url = 'https://www.kyberturvallisuuskeskus.fi/ajankohtaista/viikkokatsaus-352026';
    $publishedAt = new DateTimeImmutable('2026-08-24T08:00:00Z');
    $source = new FakeNcscSource();
    $source->targetValues = [new NcscTarget($url, 'Viikkokatsaus 35/2026', $publishedAt, 'review')];
    $fullAlertBody = str_repeat('Huijausviesti voi näyttää aidolta. ', 14)
        . 'Älä anna pankkitunnuksia tai avaa viestin linkkiä.';
    $source->scrapeValues[$url] = new NcscScrapeResult(
        $url,
        '35/2026',
        $publishedAt,
        [new NcscScrapeItem('Pankkihuijaus', $fullAlertBody)],
        '2026',
    );
    $database = new FakeDatabase();
    $database->fetchOneResults = [
        ['acquired' => 1],
        ['week_label' => '35/2026', 'structure_version' => '2026'],
        ['id' => 'legacy-truncated-alert'],
        ['id' => 'legacy-truncated-alert'],
        ['released' => 1],
    ];
    $database->executeResults = [2, 1];
    $result = (new NcscJob($database, $source))->run(new DateTimeImmutable('2026-08-25T12:00:00Z'));
    assertSameValue('completed', $result->status);
    assertSameValue(1, $result->targetsProcessed);
    assertSameValue(0, $result->targetsSkipped);
    assertSameValue([$url], $source->scrapedUrls);

    $refreshQuery = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'CHAR_LENGTH(body) = 300')
            && isset($execution['parameters']['source_url']),
    ))[0];
    assertSameValue($url, $refreshQuery['parameters']['source_url']);
    $alertUpdate = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO scam_alerts'),
    ))[0];
    assertTrue(strlen((string) $alertUpdate['parameters']['body']) > 300);
    assertTrue(str_ends_with((string) $alertUpdate['parameters']['body'], 'Älä anna pankkitunnuksia tai avaa viestin linkkiä.'));
});

test('NCSC job refreshes an active legacy alert no longer present in the RSS feed', static function (): void {
    $legacyUrl = 'https://www.kyberturvallisuuskeskus.fi/ajankohtaista/viikkokatsaus-332026';
    $source = new FakeNcscSource();
    $fullAlertBody = str_repeat('Tarkista viestin lähettäjä rauhallisesti. ', 12)
        . 'Sulje viesti ja ota tarvittaessa yhteyttä omaan pankkiisi.';
    $source->scrapeValues[$legacyUrl] = new NcscScrapeResult(
        $legacyUrl,
        '33/2026',
        new DateTimeImmutable('2026-08-13T08:00:00Z'),
        [new NcscScrapeItem('Vanha aktiivinen huijausvaroitus', $fullAlertBody)],
        '2026',
    );
    $database = new FakeDatabase();
    $database->fetchAllResults = [[[
        'source_url' => $legacyUrl,
        'title' => 'Vanha aktiivinen huijausvaroitus',
        'structure_version' => '2026',
    ]]];
    $database->fetchOneResults = [
        ['acquired' => 1],
        ['week_label' => '33/2026', 'structure_version' => '2026'],
        ['id' => 'legacy-truncated-alert'],
        ['id' => 'legacy-truncated-alert'],
        ['released' => 1],
    ];
    $database->executeResults = [2, 1];

    $result = (new NcscJob($database, $source))->run(new DateTimeImmutable('2026-08-26T18:00:00Z'));
    assertSameValue('completed', $result->status);
    assertSameValue(1, $result->targetsProcessed);
    assertSameValue(0, $result->targetsSkipped);
    assertSameValue([$legacyUrl], $source->scrapedUrls);

    $legacyTargetQuery = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'MAX_LEGACY_TARGETS')
            || (str_contains($execution['sql'], 'GROUP BY source_url')
                && str_contains($execution['sql'], 'expires_at >= :now')),
    ))[0];
    assertTrue(isset($legacyTargetQuery['parameters']['now']));
    $alertUpdate = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO scam_alerts'),
    ))[0];
    assertTrue(strlen((string) $alertUpdate['parameters']['body']) > 300);
    assertTrue(str_ends_with(
        (string) $alertUpdate['parameters']['body'],
        'Sulje viesti ja ota tarvittaessa yhteyttä omaan pankkiisi.',
    ));
    $legacyCleanup = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'UPDATE scam_alerts SET active = 0'),
    ))[0];
    assertSameValue($legacyUrl, $legacyCleanup['parameters']['source_url']);
});

test('NCSC job hides a legacy truncated alert when the source yields no matching content', static function (): void {
    $legacyUrl = 'https://www.kyberturvallisuuskeskus.fi/fi/uutiset/vanha-huijausvaroitus';
    $source = new FakeNcscSource();
    $source->scrapeValues[$legacyUrl] = new NcscScrapeResult(
        $legacyUrl,
        'Uutinen',
        new DateTimeImmutable('2026-08-13T08:00:00Z'),
        [],
        'unknown',
    );
    $database = new FakeDatabase();
    $database->fetchAllResults = [[[
        'source_url' => $legacyUrl,
        'title' => 'Vanha huijausvaroitus',
        'structure_version' => 'news',
    ]]];
    $database->fetchOneResults = [
        ['acquired' => 1],
        ['week_label' => 'Uutinen', 'structure_version' => 'news'],
        ['id' => 'legacy-truncated-alert'],
        ['released' => 1],
    ];

    $result = (new NcscJob($database, $source))->run(new DateTimeImmutable('2026-08-26T18:00:00Z'));
    assertSameValue('completed', $result->status);
    assertSameValue(1, $result->targetsProcessed);
    assertSameValue(0, $result->errors);
    assertSameValue([$legacyUrl], $source->scrapedUrls);

    $legacyCleanup = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'UPDATE scam_alerts SET active = 0'),
    ))[0];
    assertSameValue($legacyUrl, $legacyCleanup['parameters']['source_url']);
    assertTrue(isset($legacyCleanup['parameters']['updated_at']));
});

test('NCSC source failures create a safe run log and a failed result', static function (): void {
    $source = new FakeNcscSource();
    $source->targetsError = new RuntimeException("private credential\nmust not be expanded");
    $database = new FakeDatabase();
    $database->fetchOneResults = [['acquired' => 1], ['released' => 1]];
    $result = (new NcscJob($database, $source))->run(new DateTimeImmutable('2026-08-25T12:00:00Z'));
    assertSameValue('failed', $result->status);
    assertSameValue(1, $result->errors);
    $log = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO ncsc_scrape_logs'),
    ))[0];
    assertTrue(!str_contains($log['parameters']['message'], "\n"));
    assertSameValue('ncsc_job_failed', $log['parameters']['message']);
});

test('authorized admin can run the Cloudcity NCSC job and the action is audited', static function (): void {
    $url = 'https://www.kyberturvallisuuskeskus.fi/ajankohtaista/viikkokatsaus-352026';
    $publishedAt = new DateTimeImmutable('2026-08-24T08:00:00Z');
    $source = new FakeNcscSource();
    $source->targetValues = [new NcscTarget($url, 'Viikkokatsaus 35/2026', $publishedAt, 'review')];
    $source->scrapeValues[$url] = new NcscScrapeResult(
        $url,
        '35/2026',
        $publishedAt,
        [new NcscScrapeItem('Huijausviesti', 'Tarkista lähettäjä.')],
        '2026',
    );
    $database = new FakeDatabase();
    $database->fetchOneResults = [
        adminRow(),
        ['acquired' => 1],
        null,
        null,
        ['released' => 1],
    ];
    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
        ncscJob: new NcscJob($database, $source),
    )->handle(adminRequest('POST', '/api/v1/admin/ncsc-run'));
    assertSameValue(200, $response->status);
    assertSameValue('completed', jsonBody($response)['data']['status']);
    assertSameValue('private, no-store', $response->headers['Cache-Control']);
    $audit = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO audit_log'),
    ))[0];
    assertSameValue('ncsc.run', $audit['parameters']['action']);
    assertTrue(!str_contains((string) $audit['parameters']['metadata_json'], $url));
});

$failures = 0;
foreach ($tests as $testCase) {
    try {
        ($testCase['test'])();
        echo '[PASS] ' . $testCase['name'] . PHP_EOL;
    } catch (Throwable $error) {
        $failures++;
        fwrite(STDERR, '[FAIL] ' . $testCase['name'] . ': ' . $error->getMessage() . PHP_EOL);
    }
}

echo sprintf('%d tests, %d failures%s', count($tests), $failures, PHP_EOL);
exit($failures === 0 ? 0 : 1);
