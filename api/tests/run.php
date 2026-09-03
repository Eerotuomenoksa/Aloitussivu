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
use Aloitussivu\Api\EmailDispatcher;
use Aloitussivu\Api\FirebaseIdentity;
use Aloitussivu\Api\FirebaseIdTokenVerifier;
use Aloitussivu\Api\FirebasePublicKeys;
use Aloitussivu\Api\IdTokenVerifier;
use Aloitussivu\Api\JsonRequestLogger;
use Aloitussivu\Api\MailMessage;
use Aloitussivu\Api\MailTransport;
use Aloitussivu\Api\HttpNcscSource;
use Aloitussivu\Api\HttpLinkChecker;
use Aloitussivu\Api\LinkCatalog;
use Aloitussivu\Api\LinkChecker;
use Aloitussivu\Api\LinkCheckJob;
use Aloitussivu\Api\LinkCheckResult;
use Aloitussivu\Api\NcscJob;
use Aloitussivu\Api\NcscScrapeItem;
use Aloitussivu\Api\NcscScrapeResult;
use Aloitussivu\Api\NcscSource;
use Aloitussivu\Api\NcscTarget;
use Aloitussivu\Api\NotificationOutbox;
use Aloitussivu\Api\NotificationJob;
use Aloitussivu\Api\NotificationReportBuilder;
use Aloitussivu\Api\PdoDatabase;
use Aloitussivu\Api\Request;
use Aloitussivu\Api\RequestLogger;
use Aloitussivu\Api\RequestId;
use Aloitussivu\Api\RateLimiter;
use Aloitussivu\Api\SmtpMailTransport;
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

final class FakeLinkChecker implements LinkChecker
{
    /** @var list<LinkCheckResult> */
    public array $results = [];
    /** @var list<string> */
    public array $urls = [];

    public function check(string $url): LinkCheckResult
    {
        $this->urls[] = $url;
        return $this->results === []
            ? new LinkCheckResult('ok', 200, $url, null, 10)
            : array_shift($this->results);
    }
}

final class FakeMailTransport implements MailTransport
{
    /** @var list<MailMessage> */
    public array $messages = [];

    public function __construct(public ?Throwable $error = null)
    {
    }

    public function send(MailMessage $message): void
    {
        $this->messages[] = $message;
        if ($this->error !== null) {
            throw $this->error;
        }
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

/**
 * @param array<string, mixed> $appOverrides
 * @param array<string, mixed> $authenticationOverrides
 * @param array<string, mixed> $notificationOverrides
 * @param array<string, mixed> $linkCheckOverrides
 */
function testConfig(
    array $appOverrides = [],
    array $authenticationOverrides = [],
    array $notificationOverrides = [],
    array $linkCheckOverrides = [],
): Config
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
        'notifications' => [
            'enabled' => false,
            ...$notificationOverrides,
        ],
        'link_checks' => [
            'enabled' => false,
            ...$linkCheckOverrides,
        ],
    ], dirname(__DIR__) . '/public');
}

function notificationConfig(): Config
{
    return testConfig(notificationOverrides: [
        'enabled' => true,
        'recipient' => 'seniorsurf@vtkl.fi',
        'from_address' => 'noreply@seniorsurf.fi',
        'from_name' => 'Seniorin aloitussivu',
        'smtp' => [
            'host' => 'smtp.cloudcity.fi',
            'port' => 587,
            'encryption' => 'starttls',
            'username' => 'noreply@seniorsurf.fi',
            'password' => 'test-only-password',
        ],
    ]);
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
        'municipality' => 'Seinäjoki',
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
        [[
            'id' => '40000000-0000-4000-8000-000000000001',
            'type' => 'idea',
            'title' => 'Selkeämpi otsikko',
            'description' => 'Otsikko voisi kertoa sisällöstä tarkemmin.',
            'page' => 'Etusivu',
            'status' => 'planned',
            'public_note' => 'Lisätty kehitysjonoon.',
            'created_at' => '2026-08-20 09:03:00.000000',
            'updated_at' => '2026-08-20 09:04:00.000000',
            'handled_at' => null,
            'handled_by' => 'must-not-leak',
            'client_json' => 'must-not-leak',
            'has_screenshot' => 1,
        ]],
        [[
            'id' => '30000000-0000-4000-8000-000000000001',
            'type' => 'new',
            'name' => 'Uusi palvelu',
            'url' => 'https://example.com/new',
            'category' => 'Palvelut',
            'status' => 'rejected',
            'review_reason' => 'Palvelu ei ole valtakunnallinen.',
            'created_at' => '2026-08-20 09:05:00.000000',
            'updated_at' => '2026-08-20 09:06:00.000000',
            'reviewed_at' => '2026-08-20 09:06:00.000000',
            'source' => 'must-not-leak',
            'note' => 'must-not-leak',
            'reviewed_by' => 'must-not-leak',
            'approved_link_id' => 'must-not-leak',
        ]],
        $approvedRows,
    ];
    $app = testApp($database, rateLimiter: new FakeRateLimiter(), attachmentStorage: new FakeAttachmentStorage());

    $approved = $app->handle(Request::fromValues('GET', '/api/v1/approved-links'));
    assertSameValue(200, $approved->status);
    assertSameValue('Turvallinen palvelu', jsonBody($approved)['data'][0]['name']);
    assertSameValue('Seinäjoki', jsonBody($approved)['data'][0]['municipality']);
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
    assertTrue(str_contains($scamQuery, 'LIMIT 2'));

    $feedback = $app->handle(Request::fromValues('GET', '/api/v1/feedback'));
    assertSameValue(200, $feedback->status);
    assertSameValue('Lisätty kehitysjonoon.', jsonBody($feedback)['data'][0]['publicNote']);
    assertTrue(!str_contains($feedback->body, 'must-not-leak'));
    assertTrue(!str_contains($feedback->body, 'hasScreenshot'));

    $linkReports = $app->handle(Request::fromValues('GET', '/api/v1/link-reports'));
    assertSameValue(200, $linkReports->status);
    assertSameValue('Palvelu ei ole valtakunnallinen.', jsonBody($linkReports)['data'][0]['reviewReason']);
    assertTrue(!str_contains($linkReports->body, 'must-not-leak'));

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
        'category' => 'Asiointi',
    ], ['REMOTE_ADDR' => '203.0.113.45']));
    assertSameValue(204, $response->status);
    assertSameValue(2, count($database->executions));
    $stored = serialize($database->executions);
    assertTrue(!str_contains($stored, '203.0.113.45'));
    assertTrue(str_contains($stored, 'usage_daily'));
    assertTrue(str_contains($stored, 'usage_link_daily'));
    assertSameValue(32, strlen($database->executions[1]['parameters']['link_hash']));

    $privateFieldsDatabase = new FakeDatabase();
    $privateFields = testApp(
        $privateFieldsDatabase,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/usage-events', [
        'type' => 'linkClick',
        'page' => 'index',
        'category' => 'Asiointi',
        'url' => 'https://example.com/private',
    ]));
    assertSameValue(422, $privateFields->status);
    assertSameValue([], $privateFieldsDatabase->executions);

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

test('public clients cannot read private submission collections', static function (): void {
    $app = testApp(rateLimiter: new FakeRateLimiter(), attachmentStorage: new FakeAttachmentStorage());
    foreach (['/api/v1/test-feedback', '/api/v1/usage-events'] as $path) {
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
        'municipality' => 'Seinäjoki',
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
    assertSameValue('Seinäjoki', $insert['parameters']['municipality']);
    assertTrue((bool) array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO audit_log'),
    ));
});

test('admin scam-alert list keeps two months of history and every currently public alert', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow()];
    $database->fetchAllResults = [[]];

    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminRequest('GET', '/api/v1/admin/scam-alerts'));

    assertSameValue(200, $response->status);
    $query = (string) ($database->executions[1]['sql'] ?? '');
    assertTrue(str_contains($query, 'created_at >= DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 MONTH)'));
    assertTrue(str_contains($query, 'active = 1 AND expires_at > UTC_TIMESTAMP(6)'));
    assertTrue(!str_contains(strtoupper($query), 'DELETE'));
});

test('admin link-check overview identifies every warning and failed target', static function (): void {
    $warningHash = str_repeat('d', 64);
    $failedHash = str_repeat('e', 64);
    $database = new FakeDatabase();
    $database->fetchOneResults = [
        adminRow(),
        [
            'total' => 2,
            'pending' => 0,
            'ok_count' => 0,
            'warning_count' => 1,
            'failing' => 1,
            'rejected_count' => 0,
            'domain_changed' => 0,
            'attention' => 0,
            'due_count' => 0,
            'oldest_checked_at' => '2026-08-31 05:00:00.000000',
        ],
        null,
    ];
    $database->fetchAllResults = [
        [],
        [[
            'url_hash' => $failedHash,
            'url' => 'https://failed.example/',
            'name' => 'Ensimmäinen virhe',
            'category' => 'Testi',
            'source' => 'catalog',
            'last_checked_at' => '2026-08-31 05:10:00.000000',
            'next_check_at' => '2026-08-31 11:10:00.000000',
            'last_status' => 'failed',
            'http_status' => 500,
            'final_url' => null,
            'failure_count' => 1,
            'last_error_code' => 'server_error',
            'response_ms' => 250,
            'is_blocked' => 0,
            'override_scope' => null,
            'override_next_review_at' => null,
        ], [
            'url_hash' => $warningHash,
            'url' => 'https://limited.example/',
            'name' => 'Automaatiota rajoittava linkki',
            'category' => 'Testi',
            'source' => 'catalog',
            'last_checked_at' => '2026-08-31 05:00:00.000000',
            'next_check_at' => '2026-09-03 05:00:00.000000',
            'last_status' => 'warning',
            'http_status' => 403,
            'final_url' => 'https://limited.example/',
            'failure_count' => 0,
            'last_error_code' => 'access_limited',
            'response_ms' => 100,
            'is_blocked' => 0,
            'override_scope' => 'bot_protection',
            'override_next_review_at' => '2026-11-30 05:00:00.000000',
        ]],
        [],
        [],
        [],
    ];

    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminRequest('GET', '/api/v1/admin/link-checks'));

    assertSameValue(200, $response->status);
    $data = jsonBody($response)['data'];
    assertSameValue(2, count($data['statusItems']));
    assertSameValue($failedHash, $data['statusItems'][0]['id']);
    assertSameValue('failed', $data['statusItems'][0]['status']);
    assertSameValue(false, $data['statusItems'][0]['isBlocked']);
    assertSameValue($warningHash, $data['statusItems'][1]['id']);
    assertSameValue('bot_protection', $data['statusItems'][1]['overrideScope']);
    assertSameValue('2026-11-30T05:00:00.000000Z', $data['statusItems'][1]['overrideNextReviewAt']);
});

test('admin can approve a link-check redirect with a scoped expiring override', static function (): void {
    $urlHash = str_repeat('a', 64);
    $database = new FakeDatabase();
    $database->fetchOneResults = [
        adminRow(),
        [
            'url_hash' => $urlHash,
            'url' => 'https://taipalsaari.fi/palvelu',
            'last_status' => 'warning',
            'final_url' => 'https://www.taipalsaari.fi/palvelu',
            'final_domain_changed' => 1,
        ],
        null,
    ];
    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminJsonRequest(
        'POST',
        '/api/v1/admin/link-checks/' . $urlHash . '/action',
        ['action' => 'approve', 'reason' => 'Tarkistettu selaimessa ja kohde on oikea.'],
    ));
    assertSameValue(200, $response->status);
    $insert = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO link_check_overrides'),
    ))[0];
    assertSameValue($urlHash, $insert['parameters']['url_hash']);
    assertSameValue('verified', $insert['parameters']['status']);
    assertSameValue('redirect', $insert['parameters']['scope']);
    assertSameValue('https://www.taipalsaari.fi/palvelu', $insert['parameters']['expected_final_url']);
    assertTrue($insert['parameters']['next_review_at'] > $insert['parameters']['verified_at']);
    $audit = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO audit_log'),
    ))[0];
    assertSameValue('link_check.approve', $audit['parameters']['action']);
    assertSameValue($urlHash, $audit['parameters']['target_id']);
});

test('admin can permanently hide a link-check target with a manual block', static function (): void {
    $urlHash = str_repeat('b', 64);
    $database = new FakeDatabase();
    $database->fetchOneResults = [
        adminRow(),
        [
            'url_hash' => $urlHash,
            'url' => 'https://example.com/vanha',
            'last_status' => 'failed',
            'final_url' => null,
            'final_domain_changed' => 0,
        ],
        null,
    ];
    $response = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminJsonRequest(
        'POST',
        '/api/v1/admin/link-checks/' . $urlHash . '/action',
        ['action' => 'block', 'reason' => 'Palvelu on lopettanut toimintansa.'],
    ));
    assertSameValue(200, $response->status);
    $insert = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO blocked_links'),
    ))[0];
    assertSameValue($urlHash, $insert['parameters']['url_hash']);
    assertSameValue('firebase-admin-uid', $insert['parameters']['created_by']);
    assertSameValue('manual:Palvelu on lopettanut toimintansa.', $insert['parameters']['reason']);
    $audit = array_values(array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO audit_log'),
    ))[0];
    assertSameValue('link_check.block', $audit['parameters']['action']);
});

test('link-check actions validate the target hash and require an administrator reason', static function (): void {
    $invalidHashDatabase = new FakeDatabase();
    $invalidHashDatabase->fetchOneResults = [adminRow()];
    $invalidHash = testApp(
        $invalidHashDatabase,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminJsonRequest(
        'POST',
        '/api/v1/admin/link-checks/not-a-hash/action',
        ['action' => 'approve', 'reason' => 'Tarkistettu.'],
    ));
    assertSameValue(422, $invalidHash->status);

    $database = new FakeDatabase();
    $database->fetchOneResults = [adminRow()];
    $missingReason = testApp(
        $database,
        attachmentStorage: new FakeAttachmentStorage(),
        idTokenVerifier: adminVerifier(),
    )->handle(adminJsonRequest(
        'POST',
        '/api/v1/admin/link-checks/' . str_repeat('c', 64) . '/action',
        ['action' => 'approve', 'reason' => ''],
    ));
    assertSameValue(422, $missingReason->status);
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

test('usage pageview context and guide funnel are stored only as allowed daily buckets', static function (): void {
    $database = new FakeDatabase();
    $response = testApp(
        $database,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/usage-events', [
        'type' => 'pageview',
        'page' => 'index',
        'entry' => 'direct',
        'navType' => 'navigate',
        'freshTab' => true,
        'displayMode' => 'browser',
    ]));
    assertSameValue(204, $response->status);
    assertSameValue(6, count($database->executions));
    $stored = serialize($database->executions);
    assertTrue(str_contains($stored, 'usage_context_daily'));
    assertTrue(str_contains($stored, 'direct'));
    assertTrue(!str_contains($stored, 'referrer'));

    $unknownDatabase = new FakeDatabase();
    $unknown = testApp(
        $unknownDatabase,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/usage-events', [
        'type' => 'pageview',
        'page' => 'index',
        'entry' => 'not-allowed',
    ]));
    assertSameValue(204, $unknown->status);
    assertSameValue(2, count($unknownDatabase->executions));

    $guideDatabase = new FakeDatabase();
    foreach ([
        ['step' => 'opened'],
        ['step' => 'browser', 'value' => 'chrome'],
        ['step' => 'done'],
        ['step' => 'shared', 'value' => 'copy'],
    ] as $guide) {
        $guideResponse = testApp(
            $guideDatabase,
            rateLimiter: new FakeRateLimiter(),
            attachmentStorage: new FakeAttachmentStorage(),
        )->handle(jsonRequest('POST', '/api/v1/usage-events', [
            'type' => 'guide',
            'page' => 'index',
            ...$guide,
        ]));
        assertSameValue(204, $guideResponse->status);
    }
    assertSameValue(4, count($guideDatabase->executions));
    $guideStored = serialize($guideDatabase->executions);
    assertTrue(str_contains($guideStored, 'opened'));
    assertTrue(str_contains($guideStored, 'browser:chrome'));
    assertTrue(str_contains($guideStored, 'done'));
    assertTrue(str_contains($guideStored, 'shared:copy'));

    $invalidGuideDatabase = new FakeDatabase();
    $invalidGuide = testApp(
        $invalidGuideDatabase,
        rateLimiter: new FakeRateLimiter(),
        attachmentStorage: new FakeAttachmentStorage(),
    )->handle(jsonRequest('POST', '/api/v1/usage-events', [
        'type' => 'guide',
        'page' => 'index',
        'step' => 'browser',
        'value' => 'unknown-browser',
    ]));
    assertSameValue(204, $invalidGuide->status);
    assertSameValue([], $invalidGuideDatabase->executions);
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

test('notification configuration is optional and validates enabled SMTP settings', static function (): void {
    $disabled = testConfig();
    assertSameValue(false, $disabled->notificationEnabled);
    assertSameValue('', $disabled->smtpPassword);

    $enabled = notificationConfig();
    assertSameValue(true, $enabled->notificationEnabled);
    assertSameValue('seniorsurf@vtkl.fi', $enabled->notificationRecipient);
    assertSameValue('smtp.cloudcity.fi', $enabled->smtpHost);
    assertSameValue(587, $enabled->smtpPort);

    try {
        testConfig(notificationOverrides: [
            'enabled' => true,
            'recipient' => "bad@example.com\nBcc: attacker@example.com",
        ]);
        throw new RuntimeException('Invalid notification configuration was accepted.');
    } catch (ConfigException) {
        assertTrue(true);
    }
});

test('link-check configuration has safe defaults and bounded values', static function (): void {
    $defaults = testConfig();
    assertSameValue(false, $defaults->linkCheckEnabled);
    assertSameValue(10, $defaults->linkCheckBatchSize);
    assertSameValue(5, $defaults->linkCheckTimeoutSeconds);
    assertSameValue(2, $defaults->linkCheckAlertAfterFailures);
    assertSameValue(false, $defaults->linkCheckAutoBlockEnabled);
    assertSameValue(25, $defaults->linkCheckAutoBlockMaxPerRun);
    assertSameValue(true, $defaults->linkCheckAutoUnblockEnabled);

    $enabled = testConfig(linkCheckOverrides: [
        'enabled' => true,
        'batch_size' => 20,
        'timeout_seconds' => 12,
        'refresh_days' => 45,
        'retry_hours' => 6,
        'alert_after_failures' => 3,
        'auto_block_enabled' => true,
        'auto_block_max_per_run' => 40,
        'auto_unblock_enabled' => false,
    ]);
    assertSameValue(true, $enabled->linkCheckEnabled);
    assertSameValue(20, $enabled->linkCheckBatchSize);
    assertSameValue(3, $enabled->linkCheckAlertAfterFailures);
    assertSameValue(true, $enabled->linkCheckAutoBlockEnabled);
    assertSameValue(40, $enabled->linkCheckAutoBlockMaxPerRun);
    assertSameValue(false, $enabled->linkCheckAutoUnblockEnabled);

    try {
        testConfig(linkCheckOverrides: ['batch_size' => 51]);
        throw new RuntimeException('Invalid link-check batch size was accepted.');
    } catch (ConfigException $error) {
        assertTrue(str_contains($error->getMessage(), 'batch_size'));
    }
});

test('HTTP link checker rejects insecure and internal targets before a request', static function (): void {
    $checker = new HttpLinkChecker();
    $http = $checker->check('http://example.com/path');
    assertSameValue('rejected', $http->status);
    assertSameValue('https_required', $http->errorCode);

    $local = $checker->check('https://127.0.0.1/private');
    assertSameValue('rejected', $local->status);
    assertSameValue('address_not_allowed', $local->errorCode);

    $missingDns = $checker->check('https://host-that-must-not-exist.invalid/');
    assertSameValue('failed', $missingDns->status);
    assertSameValue('dns_failed', $missingDns->errorCode);
});

test('HTTP link checker maps TLS verification errors across PHP cURL builds', static function (): void {
    $method = new ReflectionMethod(HttpLinkChecker::class, 'curlErrorCode');

    assertSameValue('tls_failed', $method->invoke(null, 60));
});

test('link-check job is disabled without database access and persists a checked batch', static function (): void {
    $catalogPath = sys_get_temp_dir() . '/aloitussivu-link-catalog-' . bin2hex(random_bytes(6)) . '.json';
    file_put_contents($catalogPath, json_encode([
        'schemaVersion' => 1,
        'links' => [[
            'url' => 'https://example.com/',
            'name' => 'Esimerkki',
            'category' => 'Testi',
            'source' => 'test.php',
        ]],
    ], JSON_THROW_ON_ERROR));
    try {
        $catalog = LinkCatalog::load($catalogPath);
        $disabledDatabase = new FakeDatabase();
        $disabled = (new LinkCheckJob(
            $disabledDatabase,
            testConfig(),
            $catalog,
            new FakeLinkChecker(),
        ))->run(new DateTimeImmutable('2026-08-30T10:00:00Z'));
        assertSameValue('disabled', $disabled['status']);
        assertSameValue([], $disabledDatabase->executions);

        $database = new FakeDatabase();
        $database->fetchOneResults = [
            ['acquired' => 1],
            ['checksum' => $catalog->checksum],
        ];
        $database->fetchAllResults = [
            [],
            [[
                'url_hash' => hash('sha256', 'https://example.com/'),
                'url' => 'https://example.com/',
                'failure_count' => 0,
            ]],
        ];
        $checker = new FakeLinkChecker();
        $result = (new LinkCheckJob(
            $database,
            testConfig(linkCheckOverrides: ['enabled' => true]),
            $catalog,
            $checker,
        ))->run(new DateTimeImmutable('2026-08-30T10:00:00Z'));
        assertSameValue('completed', $result['status']);
        assertSameValue(1, $result['checked']);
        assertSameValue(1, $result['ok']);
        assertSameValue(['https://www.suomi.fi/', 'https://example.com/'], $checker->urls);
        assertTrue((bool) array_filter(
            $database->executions,
            static fn (array $execution): bool => str_contains($execution['sql'], 'INSERT INTO link_check_results'),
        ));
        $successfulUpdate = array_values(array_filter(
            $database->executions,
            static fn (array $execution): bool => str_starts_with($execution['sql'], 'UPDATE link_check_targets SET last_checked_at'),
        ))[0];
        assertSameValue(108, $successfulUpdate['parameters']['check_interval_hours']);
        assertSameValue('2026-09-03 22:00:00.000000', $successfulUpdate['parameters']['next_check_at']);
    } finally {
        @unlink($catalogPath);
    }
});

test('link-check job does not retry HTTPS policy rejections and limits requests per host', static function (): void {
    $catalogPath = sys_get_temp_dir() . '/aloitussivu-link-catalog-' . bin2hex(random_bytes(6)) . '.json';
    file_put_contents($catalogPath, json_encode([
        'schemaVersion' => 1,
        'links' => [[
            'url' => 'http://legacy.example/path',
            'name' => 'Vanha osoite',
            'category' => 'Testi',
            'source' => 'test.php',
        ]],
    ], JSON_THROW_ON_ERROR));
    try {
        $catalog = LinkCatalog::load($catalogPath);
        $rejectedDatabase = new FakeDatabase();
        $rejectedDatabase->fetchOneResults = [['acquired' => 1], ['checksum' => $catalog->checksum]];
        $rejectedDatabase->fetchAllResults = [[], [[
            'url_hash' => hash('sha256', 'http://legacy.example/path'),
            'url' => 'http://legacy.example/path',
            'failure_count' => 7,
        ]]];
        $rejectedChecker = new FakeLinkChecker();
        $rejectedChecker->results = [
            new LinkCheckResult('ok', 200, 'https://www.suomi.fi/', null, 1),
            new LinkCheckResult(
                'rejected',
                null,
                'http://legacy.example/path',
                'https_required',
                1,
            ),
        ];
        $rejectedResult = (new LinkCheckJob(
            $rejectedDatabase,
            testConfig(linkCheckOverrides: ['enabled' => true]),
            $catalog,
            $rejectedChecker,
        ))->run(new DateTimeImmutable('2026-08-30T10:00:00Z'));
        assertSameValue(1, $rejectedResult['rejected']);
        $targetUpdate = array_values(array_filter(
            $rejectedDatabase->executions,
            static fn (array $execution): bool => str_starts_with($execution['sql'], 'UPDATE link_check_targets SET last_checked_at'),
        ))[0];
        assertSameValue(0, $targetUpdate['parameters']['failure_count']);
        assertTrue(str_starts_with($targetUpdate['parameters']['next_check_at'], '9999-12-31'));

        $fairDatabase = new FakeDatabase();
        $fairDatabase->fetchOneResults = [['acquired' => 1], ['checksum' => $catalog->checksum]];
        $candidates = [];
        foreach (range(1, 5) as $index) {
            $url = 'https://same.example/' . $index;
            $candidates[] = ['url_hash' => hash('sha256', $url), 'url' => $url, 'failure_count' => 0];
        }
        foreach (range(1, 2) as $index) {
            $url = 'https://other' . $index . '.example/';
            $candidates[] = ['url_hash' => hash('sha256', $url), 'url' => $url, 'failure_count' => 0];
        }
        $fairDatabase->fetchAllResults = [[], $candidates];
        $fairChecker = new FakeLinkChecker();
        $fairResult = (new LinkCheckJob(
            $fairDatabase,
            testConfig(linkCheckOverrides: ['enabled' => true, 'batch_size' => 4]),
            $catalog,
            $fairChecker,
        ))->run(new DateTimeImmutable('2026-08-30T11:00:00Z'));
        assertSameValue(4, $fairResult['checked']);
        assertSameValue(3, count(array_filter(
            $fairChecker->urls,
            static fn (string $url): bool => str_contains($url, 'same.example'),
        )));
    } finally {
        @unlink($catalogPath);
    }
});

test('link-check job discards a suspect network batch before updating targets', static function (): void {
    $catalogPath = sys_get_temp_dir() . '/aloitussivu-link-catalog-' . bin2hex(random_bytes(6)) . '.json';
    file_put_contents($catalogPath, json_encode([
        'schemaVersion' => 1,
        'links' => [[
            'url' => 'https://example.com/',
            'name' => 'Esimerkki',
            'category' => 'Testi',
            'source' => 'test.php',
        ]],
    ], JSON_THROW_ON_ERROR));
    try {
        $catalog = LinkCatalog::load($catalogPath);
        $database = new FakeDatabase();
        $database->fetchOneResults = [
            ['acquired' => 1],
            ['checksum' => $catalog->checksum],
            ['message_code' => 'network_suspect'],
        ];
        $candidates = [];
        foreach (range(1, 5) as $index) {
            $url = 'https://host' . $index . '.example/';
            $candidates[] = [
                'url_hash' => hash('sha256', $url),
                'url' => $url,
                'last_status' => 'ok',
                'failure_count' => 1,
            ];
        }
        $database->fetchAllResults = [[], $candidates];
        $checker = new FakeLinkChecker();
        $checker->results = [new LinkCheckResult('ok', 200, 'https://www.suomi.fi/', null, 1)];
        foreach (range(1, 4) as $index) {
            $checker->results[] = new LinkCheckResult('failed', null, null, 'dns_failed', 1);
        }
        $checker->results[] = new LinkCheckResult('ok', 200, 'https://host5.example/', null, 1);

        $result = (new LinkCheckJob(
            $database,
            testConfig(linkCheckOverrides: ['enabled' => true, 'auto_block_enabled' => true]),
            $catalog,
            $checker,
        ))->run(new DateTimeImmutable('2026-08-30T12:00:00Z'));

        assertSameValue('skipped', $result['status']);
        assertSameValue('network_suspect_repeated', $result['messageCode']);
        assertSameValue(5, $result['checked']);
        assertSameValue(0, $result['blocked']);
        assertTrue(!(bool) array_filter(
            $database->executions,
            static fn (array $execution): bool => str_starts_with($execution['sql'], 'UPDATE link_check_targets SET last_checked_at')
                || str_contains($execution['sql'], 'INSERT INTO link_check_results'),
        ));

        $knownFailureDatabase = new FakeDatabase();
        $knownFailureDatabase->fetchOneResults = [['acquired' => 1], ['checksum' => $catalog->checksum]];
        $knownFailures = [];
        foreach (range(1, 5) as $index) {
            $url = 'https://known-failed-' . $index . '.example/';
            $knownFailures[] = [
                'url_hash' => hash('sha256', $url),
                'url' => $url,
                'last_status' => 'failed',
                'failure_count' => 3,
            ];
        }
        $knownFailureDatabase->fetchAllResults = [[], $knownFailures];
        $knownFailureChecker = new FakeLinkChecker();
        $knownFailureChecker->results = [new LinkCheckResult('ok', 200, 'https://www.suomi.fi/', null, 1)];
        foreach (range(1, 4) as $index) {
            $knownFailureChecker->results[] = new LinkCheckResult('failed', null, null, 'dns_failed', 1);
        }
        $knownFailureChecker->results[] = new LinkCheckResult(
            'ok',
            200,
            'https://known-failed-5.example/',
            null,
            1,
        );

        $knownFailureResult = (new LinkCheckJob(
            $knownFailureDatabase,
            testConfig(linkCheckOverrides: [
                'enabled' => true,
                'auto_block_enabled' => false,
                'auto_unblock_enabled' => false,
            ]),
            $catalog,
            $knownFailureChecker,
        ))->run(new DateTimeImmutable('2026-08-30T12:30:00Z'));

        assertSameValue('completed', $knownFailureResult['status']);
        assertSameValue(4, $knownFailureResult['failed']);
        assertSameValue(5, count(array_filter(
            $knownFailureDatabase->executions,
            static fn (array $execution): bool => str_starts_with($execution['sql'], 'UPDATE link_check_targets SET last_checked_at'),
        )));
        $candidateSelection = array_values(array_filter(
            $knownFailureDatabase->executions,
            static fn (array $execution): bool => str_contains($execution['sql'], 'FROM link_check_targets')
                && str_contains($execution['sql'], 'next_check_at <= :now'),
        ))[0];
        assertTrue(str_contains($candidateSelection['sql'], 'last_status'));
    } finally {
        @unlink($catalogPath);
    }
});

test('link-check job automatically blocks confirmed hard failures and only removes automatic blocks', static function (): void {
    $url = 'https://gone.example/page';
    $urlHash = hash('sha256', $url);
    $catalogPath = sys_get_temp_dir() . '/aloitussivu-link-catalog-' . bin2hex(random_bytes(6)) . '.json';
    file_put_contents($catalogPath, json_encode([
        'schemaVersion' => 1,
        'links' => [[
            'url' => $url,
            'name' => 'Kadonnut sivu',
            'category' => 'Testi',
            'source' => 'test.php',
        ]],
    ], JSON_THROW_ON_ERROR));
    try {
        $catalog = LinkCatalog::load($catalogPath);
        $blockDatabase = new FakeDatabase();
        $blockDatabase->fetchOneResults = [['acquired' => 1], ['checksum' => $catalog->checksum]];
        $blockDatabase->fetchAllResults = [
            [],
            [['url_hash' => $urlHash, 'url' => $url, 'failure_count' => 1]],
            [['url_hash' => $urlHash, 'url' => $url, 'last_error_code' => 'http_status_error', 'http_status' => 404]],
            [],
        ];
        $blockChecker = new FakeLinkChecker();
        $blockChecker->results = [
            new LinkCheckResult('ok', 200, 'https://www.suomi.fi/', null, 1),
            new LinkCheckResult('failed', 404, $url, 'http_status_error', 1),
        ];
        $blocked = (new LinkCheckJob(
            $blockDatabase,
            testConfig(linkCheckOverrides: ['enabled' => true, 'auto_block_enabled' => true]),
            $catalog,
            $blockChecker,
        ))->run(new DateTimeImmutable('2026-08-30T13:00:00Z'));
        assertSameValue(1, $blocked['blocked']);
        $automaticInsert = array_values(array_filter(
            $blockDatabase->executions,
            static fn (array $execution): bool => str_starts_with($execution['sql'], 'INSERT IGNORE INTO blocked_links'),
        ))[0];
        assertSameValue('auto:http_status_error:404', $automaticInsert['parameters']['reason']);
        assertSameValue(hash('sha256', $url, true), $automaticInsert['parameters']['url_hash']);
        assertTrue(str_contains($automaticInsert['sql'], 'created_by)'));
        assertTrue(str_contains($automaticInsert['sql'], 'NULL)'));
        $failedUpdate = array_values(array_filter(
            $blockDatabase->executions,
            static fn (array $execution): bool => str_starts_with($execution['sql'], 'UPDATE link_check_targets SET last_checked_at'),
        ))[0];
        assertSameValue(72, $failedUpdate['parameters']['check_interval_hours']);
        assertSameValue('2026-08-31 13:00:00.000000', $failedUpdate['parameters']['next_check_at']);

        $unblockDatabase = new FakeDatabase();
        $unblockDatabase->fetchOneResults = [['acquired' => 1], ['checksum' => $catalog->checksum]];
        $unblockDatabase->fetchAllResults = [
            [],
            [['url_hash' => $urlHash, 'url' => $url, 'failure_count' => 2]],
            [['id' => '10000000-0000-4000-8000-000000000099', 'url_hash' => $urlHash]],
        ];
        $unblockChecker = new FakeLinkChecker();
        $unblockChecker->results = [
            new LinkCheckResult('ok', 200, 'https://www.suomi.fi/', null, 1),
            new LinkCheckResult('ok', 200, $url, null, 1),
        ];
        $unblocked = (new LinkCheckJob(
            $unblockDatabase,
            testConfig(linkCheckOverrides: [
                'enabled' => true,
                'auto_block_enabled' => false,
                'auto_unblock_enabled' => true,
            ]),
            $catalog,
            $unblockChecker,
        ))->run(new DateTimeImmutable('2026-08-30T14:00:00Z'));
        assertSameValue(1, $unblocked['unblocked']);
        $automaticDelete = array_values(array_filter(
            $unblockDatabase->executions,
            static fn (array $execution): bool => str_starts_with($execution['sql'], 'DELETE FROM blocked_links'),
        ))[0];
        assertTrue(str_contains($automaticDelete['sql'], 'created_by IS NULL'));
        assertTrue(str_contains($automaticDelete['sql'], "reason LIKE 'auto:%'"));
        $unblockSelection = array_values(array_filter(
            $unblockDatabase->executions,
            static fn (array $execution): bool => str_contains($execution['sql'], 'INNER JOIN link_check_targets'),
        ))[0];
        assertTrue(str_contains($unblockSelection['sql'], 'b.created_by IS NULL'));
        assertTrue(str_contains($unblockSelection['sql'], "b.reason LIKE 'auto:%'"));
    } finally {
        @unlink($catalogPath);
    }
});

test('SMTP renderer creates UTF-8 multipart mail without exposing credentials', static function (): void {
    $config = notificationConfig();
    $message = new MailMessage('Kuukausiraportti – heinäkuu', "Hei!\nTekstiosa", '<p>Hei!</p>');
    $rendered = (new SmtpMailTransport($config))->render($message);
    assertTrue(str_contains($rendered, 'Content-Type: multipart/alternative'));
    assertTrue(str_contains($rendered, 'To: <seniorsurf@vtkl.fi>'));
    assertTrue(str_contains($rendered, base64_encode($message->subject)));
    assertTrue(str_contains($rendered, base64_encode("Hei!\r\nTekstiosa")));
    assertTrue(!str_contains($rendered, $config->smtpPassword));
});

test('notification outbox is idempotent and does not persist the recipient address', static function (): void {
    $database = new FakeDatabase();
    $database->executeResults = [1, 0];
    $outbox = new NotificationOutbox($database);
    $message = new MailMessage('Kooste', 'Koosteteksti', '<p>Koosteteksti</p>');
    assertSameValue(true, $outbox->enqueue('maintenance_digest', '2026-08-28', $message));
    assertSameValue(false, $outbox->enqueue('maintenance_digest', '2026-08-28', $message));
    $insert = $database->executions[0];
    assertTrue(str_contains($insert['sql'], 'INSERT IGNORE INTO email_outbox'));
    assertTrue(!str_contains(json_encode($insert['parameters'], JSON_THROW_ON_ERROR), 'seniorsurf@vtkl.fi'));
});

test('maintenance digest contains only aggregate task data and skips an empty healthy queue', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [[
        'feedback_open' => 3,
        'feedback_oldest' => '2026-08-20 07:00:00',
        'links_pending' => 2,
        'links_oldest' => '2026-08-25 09:00:00',
        'alerts_expiring' => 1,
        'ncsc_last_run' => '2026-08-28 08:00:00',
    ]];
    $builder = new NotificationReportBuilder($database, notificationConfig());
    $message = $builder->maintenanceDigest(new DateTimeImmutable('2026-08-29T08:15:00+03:00'));
    assertTrue($message instanceof MailMessage);
    assertTrue(str_contains($message->textBody, 'Avoimet palautteet: 3'), 'Maintenance feedback count is missing.');
    assertTrue(str_contains($message->textBody, 'Odottavat linkki-ilmoitukset: 2'), 'Maintenance link count is missing.');
    assertTrue(str_contains($message->textBody, 'Mitä tämä tarkoittaa: Palautteet, joiden käsittely on kesken'), 'Maintenance explanation is missing.');
    assertTrue(str_contains($message->textBody, 'Vanhin avoin palaute on 8 vuorokautta vanha.'), 'Maintenance age is missing.');
    assertTrue(str_contains($message->htmlBody, 'Vaatii huomiota'), 'Maintenance HTML status is missing.');
    assertTrue(str_contains($message->htmlBody, 'Avaa ylläpidon työtila'), 'Maintenance CTA is missing.');
    assertTrue(str_contains($message->htmlBody, '<meta name="viewport"'), 'Maintenance viewport metadata is missing.');
    assertTrue(!str_contains($message->htmlBody, 'description'), 'Maintenance HTML exposes a private description field.');
    $query = $database->executions[0]['sql'];
    assertTrue(!preg_match('/SELECT[^;]*(description|public_note|note|body)/i', $query));

    $emptyDatabase = new FakeDatabase();
    $emptyDatabase->fetchOneResults = [[
        'feedback_open' => 0,
        'links_pending' => 0,
        'alerts_expiring' => 0,
        'ncsc_last_run' => '2026-08-29 05:00:00',
    ]];
    assertSameValue(
        null,
        (new NotificationReportBuilder($emptyDatabase, notificationConfig()))
            ->maintenanceDigest(new DateTimeImmutable('2026-08-29T08:15:00+03:00')),
    );

    $networkDatabase = new FakeDatabase();
    $networkDatabase->fetchOneResults = [[
        'feedback_open' => 0,
        'links_pending' => 0,
        'alerts_expiring' => 0,
        'link_check_attention' => 0,
        'link_check_last_run' => '2026-08-29 05:14:00',
        'link_check_last_message' => 'network_suspect_repeated',
        'ncsc_last_run' => '2026-08-29 05:00:00',
    ]];
    $networkMessage = (new NotificationReportBuilder($networkDatabase, notificationConfig()))
        ->maintenanceDigest(new DateTimeImmutable('2026-08-29T08:15:00+03:00'));
    assertTrue($networkMessage instanceof MailMessage);
    assertTrue(str_contains($networkMessage->textBody, 'Kaksi peräkkäistä ajoa keskeytyi'));
});

test('monthly report compares aggregate usage and explains privacy limitations', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [
        ['pageviews' => 120, 'link_clicks' => 45],
        [
            'feedback_received' => 4,
            'feedback_handled' => 3,
            'link_reports_received' => 2,
            'link_reports_handled' => 1,
            'feedback_backlog' => 5,
            'link_backlog' => 2,
        ],
        ['pageviews' => 100, 'link_clicks' => 50],
        [
            'feedback_received' => 2,
            'feedback_handled' => 2,
            'link_reports_received' => 1,
            'link_reports_handled' => 1,
            'feedback_backlog' => 5,
            'link_backlog' => 2,
        ],
    ];
    $database->fetchAllResults = [
        [
            ['dimension' => 'entry', 'bucket' => 'direct', 'total' => 60],
            ['dimension' => 'entry', 'bucket' => 'search', 'total' => 40],
            ['dimension' => 'guide', 'bucket' => 'opened', 'total' => 20],
            ['dimension' => 'guide', 'bucket' => 'done', 'total' => 10],
            ['dimension' => 'guide', 'bucket' => 'shared:copy', 'total' => 3],
        ],
        [['page' => '/', 'total' => 90]],
        [['category' => 'Terveys', 'total' => 20]],
        [['label' => 'Terveys – /', 'category' => 'Terveys', 'page' => '/', 'total' => 15]],
        [
            ['dimension' => 'entry', 'bucket' => 'direct', 'total' => 40],
            ['dimension' => 'entry', 'bucket' => 'search', 'total' => 40],
            ['dimension' => 'guide', 'bucket' => 'opened', 'total' => 10],
            ['dimension' => 'guide', 'bucket' => 'done', 'total' => 4],
        ],
    ];
    $message = (new NotificationReportBuilder($database, notificationConfig()))
        ->monthlyReport(new DateTimeImmutable('2026-07-01T00:00:00+03:00'));
    assertTrue(str_contains($message->subject, 'heinäkuu 2026'));
    assertTrue(str_contains($message->textBody, 'Sivulataukset: 120'));
    assertTrue(str_contains($message->textBody, '20,0 % enemmän kuin edellisellä jaksolla'));
    assertTrue(str_contains($message->textBody, 'Edellinen jakso: 100'));
    assertTrue(str_contains($message->textBody, 'Sama kävijä voi ladata sivun useita kertoja'));
    assertTrue(str_contains($message->textBody, 'Suoran avauksen osuus: 60,0 %'));
    assertTrue(str_contains($message->textBody, '10,0 prosenttiyksikköä suurempi kuin edellisellä jaksolla'));
    assertTrue(str_contains($message->textBody, 'tunnisteettomia tapahtumakoosteita'));
    assertTrue(str_contains($message->textBody, 'Terveys – /: 15'));
    assertTrue(str_contains($message->htmlBody, 'Sivuston käyttö'));
    assertTrue(str_contains($message->htmlBody, 'Aloitussivuopas'));
    assertTrue(str_contains($message->htmlBody, 'Ylläpitotyö'));
    assertTrue(str_contains($message->htmlBody, 'Mitä luku tarkoittaa:'));
    assertTrue(str_contains($message->htmlBody, 'Tietosuoja ja tulkinta'));
    assertTrue(str_contains($message->htmlBody, 'background:#eef3f5'));
});

test('email dispatcher sends claimed mail and records only safe failure codes', static function (): void {
    $config = notificationConfig();
    $database = new FakeDatabase();
    $database->fetchOneResults = [['acquired' => 1], ['released' => 1]];
    $database->fetchAllResults = [[[
        'id' => '10000000-0000-4000-8000-000000000001',
        'subject' => 'Kooste',
        'text_body' => 'Teksti',
        'html_body' => '<p>Teksti</p>',
        'status' => 'pending',
        'attempt_count' => 0,
    ]]];
    $transport = new FakeMailTransport();
    $result = (new EmailDispatcher($config, $database, $transport))
        ->run(new DateTimeImmutable('2026-08-29T06:00:00Z'));
    assertSameValue(1, $result['sent']);
    assertSameValue(1, count($transport->messages));
    assertTrue((bool) array_filter(
        $database->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], "status = 'sent'"),
    ));

    $failedDatabase = new FakeDatabase();
    $failedDatabase->fetchOneResults = [['acquired' => 1], ['released' => 1]];
    $failedDatabase->fetchAllResults = [[[
        'id' => '10000000-0000-4000-8000-000000000002',
        'subject' => 'Kooste',
        'text_body' => 'Teksti',
        'html_body' => '<p>Teksti</p>',
        'status' => 'pending',
        'attempt_count' => 0,
    ]]];
    $failure = (new EmailDispatcher(
        $config,
        $failedDatabase,
        new FakeMailTransport(new RuntimeException("private SMTP response\npassword")),
    ))->run(new DateTimeImmutable('2026-08-29T06:00:00Z'));
    assertSameValue(1, $failure['retried']);
    $retry = array_values(array_filter(
        $failedDatabase->executions,
        static fn (array $execution): bool => str_contains($execution['sql'], "status = 'retry'"),
    ))[0];
    assertSameValue('smtp_send_failed', $retry['parameters']['error_code']);
});

test('notification job queues one weekday digest and is disabled without database access', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [[
        'feedback_open' => 1,
        'feedback_oldest' => '2026-05-31 08:00:00',
        'links_pending' => 0,
        'alerts_expiring' => 0,
        'ncsc_last_run' => '2026-06-01 04:00:00',
    ]];
    $database->executeResults = [1, 0];
    $config = notificationConfig();
    $result = (new NotificationJob(
        $config,
        new NotificationReportBuilder($database, $config),
        new NotificationOutbox($database),
    ))->run(new DateTimeImmutable('2026-06-01T08:15:00+03:00'));
    assertSameValue(['maintenance_digest:2026-06-01'], $result['queued']);
    assertSameValue([], $result['existing']);

    $disabledDatabase = new FakeDatabase();
    $disabledConfig = testConfig();
    $disabled = (new NotificationJob(
        $disabledConfig,
        new NotificationReportBuilder($disabledDatabase, $disabledConfig),
        new NotificationOutbox($disabledDatabase),
    ))->run(new DateTimeImmutable('2026-06-01T08:15:00+03:00'));
    assertSameValue('disabled', $disabled['status']);
    assertSameValue([], $disabledDatabase->executions);
});

test('quarterly report includes a calendar-quarter monthly trend', static function (): void {
    $database = new FakeDatabase();
    $database->fetchOneResults = [
        ['pageviews' => 300, 'link_clicks' => 90],
        [],
        ['pageviews' => 0, 'link_clicks' => 0],
        [],
    ];
    $database->fetchAllResults = [
        [],
        [],
        [],
        [],
        [
            ['month' => '2026-04', 'pageviews' => 90, 'link_clicks' => 25],
            ['month' => '2026-05', 'pageviews' => 100, 'link_clicks' => 30],
            ['month' => '2026-06', 'pageviews' => 110, 'link_clicks' => 35],
        ],
        [],
    ];
    $message = (new NotificationReportBuilder($database, notificationConfig()))
        ->quarterlyReport(new DateTimeImmutable('2026-04-01T00:00:00+03:00'));
    assertTrue(str_contains($message->subject, 'Q2/2026'));
    assertTrue(str_contains($message->textBody, 'Kuukausitrendi'));
    assertTrue(str_contains($message->textBody, '2026-06: 110 sivulatausta'));
    assertTrue(str_contains($message->textBody, 'ei vertailuarvoa (edellisellä jaksolla 0)'));
    assertTrue(str_contains($message->htmlBody, '>Sivulataukset</th>'));
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
