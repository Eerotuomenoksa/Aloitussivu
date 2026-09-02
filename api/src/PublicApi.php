<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;
use DateTimeZone;
use JsonException;
use Throwable;

final class PublicApi
{
    /** @var array<string, list<string>> */
    private const ALLOWED_CONTEXT = [
        'entry' => ['direct', 'internal', 'seniorsurf', 'search', 'external'],
        'navtype' => ['navigate', 'reload', 'back_forward', 'prerender'],
        'freshtab' => ['true', 'false'],
        'display' => ['browser', 'standalone'],
        'guide' => [
            'opened', 'done',
            'browser:chrome', 'browser:edge', 'browser:firefox', 'browser:safari',
            'browser:android', 'browser:ios', 'browser:other',
            'shared:share', 'shared:email', 'shared:sms', 'shared:print', 'shared:copy',
        ],
    ];

    public function __construct(
        private readonly DatabaseConnection $database,
        private readonly RateLimiter $rateLimiter,
        private readonly AttachmentStorage $attachments,
    ) {
    }

    public function register(Router $router): void
    {
        $router->add('GET', '/api/v1/approved-links', fn (Request $request): Response => $this->approvedLinks($request));
        $router->add('GET', '/api/v1/blocked-links', fn (Request $request): Response => $this->blockedLinks($request));
        $router->add('GET', '/api/v1/scam-alerts', fn (Request $request): Response => $this->scamAlerts($request));
        $router->add('GET', '/api/v1/feedback', fn (Request $request): Response => $this->feedback($request));
        $router->add('GET', '/api/v1/link-reports', fn (Request $request): Response => $this->linkReports($request));
        $router->add('POST', '/api/v1/link-reports', fn (Request $request): Response => $this->submitLinkReport($request));
        $router->add('POST', '/api/v1/feedback', fn (Request $request): Response => $this->submitFeedback($request));
        $router->add('POST', '/api/v1/test-feedback', fn (Request $request): Response => $this->submitTestFeedback($request));
        $router->add('POST', '/api/v1/usage-events', fn (Request $request): Response => $this->submitUsageEvent($request));
    }

    private function approvedLinks(Request $request): Response
    {
        $rows = $this->database->fetchAll(
            'SELECT id, name, url, category, source, note, created_at '
            . 'FROM approved_links ORDER BY created_at DESC LIMIT 500',
        );
        $data = array_map(static function (array $row): array {
            $item = [
                'id' => (string) ($row['id'] ?? ''),
                'name' => (string) ($row['name'] ?? ''),
                'url' => (string) ($row['url'] ?? ''),
                'category' => (string) ($row['category'] ?? ''),
                'source' => (string) ($row['source'] ?? ''),
                'createdAt' => self::isoDate($row['created_at'] ?? ''),
            ];
            if (isset($row['note']) && $row['note'] !== '') {
                $item['note'] = (string) $row['note'];
            }
            return $item;
        }, $rows);
        return $this->listResponse($request, $data);
    }

    private function blockedLinks(Request $request): Response
    {
        $rows = $this->database->fetchAll(
            'SELECT id, url, created_at FROM blocked_links ORDER BY created_at DESC LIMIT 500',
        );
        $data = array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'url' => (string) ($row['url'] ?? ''),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
        ], $rows);
        return $this->listResponse($request, $data);
    }

    private function scamAlerts(Request $request): Response
    {
        $rows = $this->database->fetchAll(
            'SELECT id, title, body, severity, source, source_url, source_week, original_heading, '
            . 'structure_version, created_at, updated_at, expires_at FROM scam_alerts '
            . 'WHERE active = 1 AND expires_at > UTC_TIMESTAMP(6) ORDER BY created_at DESC LIMIT 2',
        );
        $data = array_map(static function (array $row): array {
            $item = [
                'id' => (string) ($row['id'] ?? ''),
                'title' => (string) ($row['title'] ?? ''),
                'body' => (string) ($row['body'] ?? ''),
                'severity' => (string) ($row['severity'] ?? 'info'),
                'active' => true,
                'createdAt' => self::isoDate($row['created_at'] ?? ''),
                'updatedAt' => self::isoDate($row['updated_at'] ?? ''),
                'expiresAt' => self::isoDate($row['expires_at'] ?? ''),
            ];
            foreach ([
                'source' => 'source',
                'sourceUrl' => 'source_url',
                'sourceWeek' => 'source_week',
                'originalHeading' => 'original_heading',
                'structureVersion' => 'structure_version',
            ] as $target => $source) {
                if (isset($row[$source]) && $row[$source] !== '') {
                    $item[$target] = (string) $row[$source];
                }
            }
            return $item;
        }, $rows);
        return $this->listResponse($request, $data);
    }

    private function feedback(Request $request): Response
    {
        $rows = $this->database->fetchAll(
            'SELECT id, type, title, description, page, status, public_note, created_at, updated_at, handled_at '
            . 'FROM feedback_items ORDER BY updated_at DESC, created_at DESC LIMIT 500',
        );
        $data = array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'type' => (string) ($row['type'] ?? 'other'),
            'title' => (string) ($row['title'] ?? ''),
            'description' => (string) ($row['description'] ?? ''),
            'page' => (string) ($row['page'] ?? ''),
            'status' => (string) ($row['status'] ?? 'new'),
            'publicNote' => (string) ($row['public_note'] ?? ''),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
            'updatedAt' => self::isoDate($row['updated_at'] ?? ''),
            'handledAt' => self::isoDate($row['handled_at'] ?? ''),
        ], $rows);
        return $this->listResponse($request, $data);
    }

    private function linkReports(Request $request): Response
    {
        $rows = $this->database->fetchAll(
            'SELECT id, type, name, url, category, status, review_reason, created_at, updated_at, reviewed_at '
            . 'FROM link_reports ORDER BY updated_at DESC, created_at DESC LIMIT 500',
        );
        $data = array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'type' => (string) ($row['type'] ?? 'new'),
            'name' => (string) ($row['name'] ?? ''),
            'url' => (string) ($row['url'] ?? ''),
            'category' => (string) ($row['category'] ?? ''),
            'status' => (string) ($row['status'] ?? 'pending'),
            'reviewReason' => (string) ($row['review_reason'] ?? ''),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
            'updatedAt' => self::isoDate($row['updated_at'] ?? ''),
            'reviewedAt' => self::isoDate($row['reviewed_at'] ?? ''),
        ], $rows);
        return $this->listResponse($request, $data);
    }

    private function submitLinkReport(Request $request): Response
    {
        $this->limit($request, '/api/v1/link-reports', 10, 600);
        $data = Validator::jsonObject($request);
        Validator::shape(
            $data,
            ['id', 'type', 'name', 'url', 'category', 'source', 'note', 'website'],
            ['id', 'type', 'name', 'url', 'note'],
        );
        Validator::honeypotIsEmpty($data);

        $values = [
            'id' => Validator::uuid($data, 'id'),
            'type' => Validator::enum($data, 'type', ['new', 'broken', 'wrong']),
            'name' => Validator::string($data, 'name', 1, 160),
            'url' => Validator::httpsUrl($data, 'url', 500),
            'category' => Validator::string($data, 'category', 0, 255, false),
            'source' => Validator::string($data, 'source', 0, 255, false),
            'note' => Validator::string($data, 'note', 0, 1000),
        ];
        $values['url_hash'] = hash('sha256', $values['url'], true);

        $existing = $this->database->fetchOne(
            'SELECT id, type, name, url, category, source, note, created_at FROM link_reports WHERE id = :id LIMIT 1',
            ['id' => $values['id']],
        );
        if ($existing !== null) {
            $this->assertLinkReportMatches($existing, $values);
            return $this->createdResponse($request, (string) $existing['id'], $existing['created_at'] ?? '', true);
        }

        $duplicate = $this->database->fetchOne(
            "SELECT id, created_at FROM link_reports WHERE status = 'pending' AND type = :type "
            . 'AND url_hash = :url_hash ORDER BY created_at DESC LIMIT 1',
            ['type' => $values['type'], 'url_hash' => $values['url_hash']],
        );
        if ($duplicate !== null) {
            return $this->createdResponse($request, (string) $duplicate['id'], $duplicate['created_at'] ?? '', true);
        }

        $createdAt = self::databaseNow();
        $inserted = $this->database->execute(
            'INSERT INTO link_reports '
            . '(id, type, name, url, url_hash, category, source, note, status, created_at, updated_at) '
            . "VALUES (:id, :type, :name, :url, :url_hash, :category, :source, :note, 'pending', :created_at, :updated_at) "
            . 'ON DUPLICATE KEY UPDATE id = VALUES(id)',
            [...$values, 'created_at' => $createdAt, 'updated_at' => $createdAt],
        ) > 0;
        if (!$inserted) {
            $existing = $this->database->fetchOne(
                'SELECT id, type, name, url, category, source, note, created_at FROM link_reports WHERE id = :id LIMIT 1',
                ['id' => $values['id']],
            );
            if ($existing === null) {
                throw new \RuntimeException('Link report duplicate could not be resolved.');
            }
            $this->assertLinkReportMatches($existing, $values);
            return $this->createdResponse($request, $values['id'], $existing['created_at'] ?? '', true);
        }
        return $this->createdResponse($request, $values['id'], $createdAt, false);
    }

    private function submitFeedback(Request $request): Response
    {
        $this->limit($request, '/api/v1/feedback', 6, 600);
        $data = Validator::jsonObject($request);
        Validator::shape(
            $data,
            ['id', 'type', 'title', 'description', 'page', 'client', 'screenshot', 'website'],
            ['id', 'type', 'title', 'description', 'page'],
        );
        Validator::honeypotIsEmpty($data);

        $client = array_key_exists('client', $data) ? $this->feedbackClient(Validator::object($data, 'client')) : null;
        $screenshot = isset($data['screenshot']) ? ScreenshotValidator::validate(Validator::object($data, 'screenshot')) : null;
        $values = [
            'id' => Validator::uuid($data, 'id'),
            'type' => Validator::enum($data, 'type', ['bug', 'content', 'link', 'accessibility', 'idea', 'other']),
            'title' => Validator::string($data, 'title', 3, 140),
            'description' => Validator::string($data, 'description', 5, 1600),
            'page' => Validator::string($data, 'page', 0, 120),
            'client_json' => $client === null ? null : self::encodeJson($client),
            'has_screenshot' => $screenshot === null ? 0 : 1,
        ];

        $existing = $this->database->fetchOne(
            'SELECT id, type, title, description, page, client_json, has_screenshot, created_at '
            . 'FROM feedback_items WHERE id = :id LIMIT 1',
            ['id' => $values['id']],
        );
        if ($existing !== null) {
            $this->assertFeedbackMatches($existing, $values);
            return $this->createdResponse(
                $request,
                (string) $existing['id'],
                $existing['created_at'] ?? '',
                true,
                ['hasScreenshot' => (bool) $values['has_screenshot']],
            );
        }

        $storageKey = null;
        if ($screenshot !== null) {
            $storageKey = $this->attachments->store($values['id'], $screenshot['contents'], $screenshot['media_type']);
        }
        $createdAt = self::databaseNow();
        try {
            $inserted = $this->database->transaction(function (DatabaseConnection $database) use (
                $values,
                $screenshot,
                $storageKey,
                $createdAt,
            ): bool {
                $created = $database->execute(
                    'INSERT INTO feedback_items '
                    . '(id, type, title, description, page, status, public_note, client_json, has_screenshot, created_at, updated_at) '
                    . "VALUES (:id, :type, :title, :description, :page, 'new', '', :client_json, :has_screenshot, :created_at, :updated_at) "
                    . 'ON DUPLICATE KEY UPDATE id = VALUES(id)',
                    [...$values, 'created_at' => $createdAt, 'updated_at' => $createdAt],
                ) > 0;
                if (!$created || $screenshot === null || $storageKey === null) {
                    return $created;
                }
                $database->execute(
                    'INSERT INTO feedback_attachments '
                    . '(id, feedback_id, storage_key, original_name, media_type, byte_size, sha256, created_at) '
                    . 'VALUES (:id, :feedback_id, :storage_key, :original_name, :media_type, :byte_size, :sha256, :created_at)',
                    [
                        'id' => Uuid::generate(),
                        'feedback_id' => $values['id'],
                        'storage_key' => $storageKey,
                        'original_name' => $screenshot['name'],
                        'media_type' => $screenshot['media_type'],
                        'byte_size' => $screenshot['byte_size'],
                        'sha256' => $screenshot['sha256'],
                        'created_at' => $createdAt,
                    ],
                );
                return true;
            });
        } catch (Throwable $error) {
            if ($storageKey !== null) {
                $this->attachments->delete($storageKey);
            }
            throw $error;
        }

        if (!$inserted) {
            if ($storageKey !== null) {
                $this->attachments->delete($storageKey);
            }
            $existing = $this->database->fetchOne(
                'SELECT id, type, title, description, page, client_json, has_screenshot, created_at '
                . 'FROM feedback_items WHERE id = :id LIMIT 1',
                ['id' => $values['id']],
            );
            if ($existing === null) {
                throw new \RuntimeException('Feedback duplicate could not be resolved.');
            }
            $this->assertFeedbackMatches($existing, $values);
            return $this->createdResponse(
                $request,
                $values['id'],
                $existing['created_at'] ?? '',
                true,
                ['hasScreenshot' => (bool) $values['has_screenshot']],
            );
        }
        return $this->createdResponse(
            $request,
            $values['id'],
            $createdAt,
            false,
            ['hasScreenshot' => (bool) $values['has_screenshot']],
        );
    }

    private function submitTestFeedback(Request $request): Response
    {
        $this->limit($request, '/api/v1/test-feedback', 6, 600);
        $validated = TestFeedbackValidator::validate(Validator::jsonObject($request));
        $responseJson = self::encodeJson($validated['response']);
        $existing = $this->database->fetchOne(
            'SELECT id, form_version, response_json, created_at FROM test_feedback_responses WHERE id = :id LIMIT 1',
            ['id' => $validated['id']],
        );
        if ($existing !== null) {
            $this->assertTestFeedbackMatches($existing, $validated['form_version'], $responseJson);
            return $this->createdResponse(
                $request,
                (string) $existing['id'],
                $existing['created_at'] ?? '',
                true,
                ['formVersion' => $validated['form_version']],
            );
        }

        $createdAt = self::databaseNow();
        $inserted = $this->database->execute(
            'INSERT INTO test_feedback_responses (id, form_version, response_json, created_at) '
            . 'VALUES (:id, :form_version, :response_json, :created_at) '
            . 'ON DUPLICATE KEY UPDATE id = VALUES(id)',
            [
                'id' => $validated['id'],
                'form_version' => $validated['form_version'],
                'response_json' => $responseJson,
                'created_at' => $createdAt,
            ],
        ) > 0;
        if (!$inserted) {
            $existing = $this->database->fetchOne(
                'SELECT id, form_version, response_json, created_at FROM test_feedback_responses WHERE id = :id LIMIT 1',
                ['id' => $validated['id']],
            );
            if ($existing === null) {
                throw new \RuntimeException('Test feedback duplicate could not be resolved.');
            }
            $this->assertTestFeedbackMatches($existing, $validated['form_version'], $responseJson);
            return $this->createdResponse(
                $request,
                $validated['id'],
                $existing['created_at'] ?? '',
                true,
                ['formVersion' => $validated['form_version']],
            );
        }
        return $this->createdResponse(
            $request,
            $validated['id'],
            $createdAt,
            false,
            ['formVersion' => $validated['form_version']],
        );
    }

    private function submitUsageEvent(Request $request): Response
    {
        $this->limit($request, '/api/v1/usage-events', 120, 60);
        $data = Validator::jsonObject($request);
        Validator::shape($data, [
            'type', 'page', 'category', 'entry', 'navType', 'freshTab',
            'displayMode', 'step', 'value', 'website',
        ], ['type', 'page']);
        Validator::honeypotIsEmpty($data);
        $type = Validator::enum($data, 'type', ['pageview', 'linkClick', 'guide']);
        $page = Validator::string($data, 'page', 1, 180);
        $usageDate = (new DateTimeImmutable('now', new DateTimeZone('Europe/Helsinki')))->format('Y-m-d');
        $pageHash = hash('sha256', $page, true);

        if ($type === 'pageview') {
            Validator::shape($data, [
                'type', 'page', 'entry', 'navType', 'freshTab', 'displayMode', 'website',
            ], ['type', 'page']);
            $context = [];
            $this->addAllowedContext($context, 'entry', $data['entry'] ?? null);
            $this->addAllowedContext($context, 'navtype', $data['navType'] ?? null);
            if (isset($data['freshTab']) && is_bool($data['freshTab'])) {
                $this->addAllowedContext($context, 'freshtab', $data['freshTab'] ? 'true' : 'false');
            }
            $this->addAllowedContext($context, 'display', $data['displayMode'] ?? null);
            $this->database->transaction(static function (DatabaseConnection $database) use (
                $usageDate,
                $page,
                $pageHash,
                $context,
            ): void {
                $database->execute(
                    'INSERT INTO usage_daily (usage_date, total_pageviews, total_link_clicks) VALUES (:usage_date, 1, 0) '
                    . 'ON DUPLICATE KEY UPDATE total_pageviews = total_pageviews + 1',
                    ['usage_date' => $usageDate],
                );
                $database->execute(
                    'INSERT INTO usage_page_daily (usage_date, page_hash, page, count) '
                    . 'VALUES (:usage_date, :page_hash, :page, 1) '
                    . 'ON DUPLICATE KEY UPDATE count = count + 1, page = VALUES(page)',
                    ['usage_date' => $usageDate, 'page_hash' => $pageHash, 'page' => $page],
                );
                foreach ($context as $dimension => $bucket) {
                    $database->execute(
                        'INSERT INTO usage_context_daily (usage_date, dimension, bucket, count) '
                        . 'VALUES (:usage_date, :dimension, :bucket, 1) '
                        . 'ON DUPLICATE KEY UPDATE count = count + 1',
                        ['usage_date' => $usageDate, 'dimension' => $dimension, 'bucket' => $bucket],
                    );
                }
            });
            return Response::empty(204);
        }

        if ($type === 'guide') {
            Validator::shape($data, ['type', 'page', 'step', 'value', 'website'], ['type', 'page']);
            $step = isset($data['step']) && is_string($data['step']) ? $data['step'] : '';
            $value = isset($data['value']) && is_string($data['value']) ? $data['value'] : '';
            $bucket = match ($step) {
                'opened', 'done' => $step,
                'browser', 'shared' => $value !== '' ? $step . ':' . $value : '',
                default => '',
            };
            if (!in_array($bucket, self::ALLOWED_CONTEXT['guide'], true)) {
                return Response::empty(204);
            }
            $this->database->execute(
                'INSERT INTO usage_context_daily (usage_date, dimension, bucket, count) '
                . 'VALUES (:usage_date, :dimension, :bucket, 1) '
                . 'ON DUPLICATE KEY UPDATE count = count + 1',
                ['usage_date' => $usageDate, 'dimension' => 'guide', 'bucket' => $bucket],
            );
            return Response::empty(204);
        }

        Validator::shape($data, ['type', 'page', 'category', 'website'], ['type', 'page']);
        $category = Validator::string($data, 'category', 0, 180, false);
        $linkHash = hash('sha256', $page . "\n" . $category, true);
        $this->database->transaction(static function (DatabaseConnection $database) use (
            $usageDate,
            $category,
            $page,
            $linkHash,
        ): void {
            $database->execute(
                'INSERT INTO usage_daily (usage_date, total_pageviews, total_link_clicks) VALUES (:usage_date, 0, 1) '
                . 'ON DUPLICATE KEY UPDATE total_link_clicks = total_link_clicks + 1',
                ['usage_date' => $usageDate],
            );
            $database->execute(
                'INSERT INTO usage_link_daily (usage_date, link_hash, url, label, category, page, count) '
                . 'VALUES (:usage_date, :link_hash, :url, :label, :category, :page, 1) '
                . 'ON DUPLICATE KEY UPDATE count = count + 1, url = \'\', label = \'\', '
                . 'category = VALUES(category), page = VALUES(page)',
                [
                    'usage_date' => $usageDate,
                    'link_hash' => $linkHash,
                    'url' => '',
                    'label' => '',
                    'category' => $category,
                    'page' => $page,
                ],
            );
        });
        return Response::empty(204);
    }

    /** @param array<string, string> $context */
    private function addAllowedContext(array &$context, string $dimension, mixed $value): void
    {
        if (!is_string($value) || !isset(self::ALLOWED_CONTEXT[$dimension])) {
            return;
        }
        if (in_array($value, self::ALLOWED_CONTEXT[$dimension], true)) {
            $context[$dimension] = $value;
        }
    }

    /** @param list<array<string, mixed>> $data */
    private function listResponse(Request $request, array $data): Response
    {
        $etag = '"' . hash('sha256', self::encodeJson($data)) . '"';
        $headers = [
            'Cache-Control' => 'public, max-age=60, stale-while-revalidate=300',
            'ETag' => $etag,
        ];
        if ($request->header('if-none-match') === $etag) {
            return Response::empty(304, $headers);
        }
        return Response::json(['data' => $data, 'requestId' => $request->requestId], 200, $headers);
    }

    /** @param array<string, mixed> $extra */
    private function createdResponse(
        Request $request,
        string $id,
        mixed $createdAt,
        bool $duplicate,
        array $extra = [],
    ): Response {
        return Response::json([
            'data' => [
                'id' => $id,
                'createdAt' => self::isoDate($createdAt),
                'duplicate' => $duplicate,
                ...$extra,
            ],
            'requestId' => $request->requestId,
        ], $duplicate ? 200 : 201);
    }

    private function limit(Request $request, string $route, int $limit, int $windowSeconds): void
    {
        $result = $this->rateLimiter->consume($route, $request->clientAddress(), $limit, $windowSeconds);
        if (!$result['allowed']) {
            throw new ApiException(
                429,
                'rate_limited',
                'Pyyntöjä on lähetetty liian nopeasti. Yritä hetken päästä uudelleen.',
                headers: ['Retry-After' => (string) $result['retry_after']],
            );
        }
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    private function feedbackClient(array $data): array
    {
        Validator::shape(
            $data,
            [
                'browserName', 'browserVersion', 'osName', 'deviceType', 'userAgent',
                'platform', 'language', 'viewport', 'screen', 'timezone', 'touch',
            ],
            [
                'browserName', 'osName', 'deviceType', 'userAgent', 'platform',
                'language', 'viewport', 'screen', 'timezone', 'touch',
            ],
        );
        $client = [
            'browserName' => Validator::string($data, 'browserName', 0, 80),
            'osName' => Validator::string($data, 'osName', 0, 80),
            'deviceType' => Validator::enum($data, 'deviceType', ['desktop', 'tablet', 'mobile', 'unknown']),
            'userAgent' => Validator::string($data, 'userAgent', 0, 500),
            'platform' => Validator::string($data, 'platform', 0, 120),
            'language' => Validator::string($data, 'language', 0, 40),
            'viewport' => Validator::string($data, 'viewport', 0, 40),
            'screen' => Validator::string($data, 'screen', 0, 40),
            'timezone' => Validator::string($data, 'timezone', 0, 80),
            'touch' => Validator::boolean($data, 'touch'),
        ];
        if (array_key_exists('browserVersion', $data)) {
            $client['browserVersion'] = Validator::string($data, 'browserVersion', 0, 80);
        }
        return $client;
    }

    /** @param array<string, mixed> $existing @param array<string, mixed> $values */
    private function assertLinkReportMatches(array $existing, array $values): void
    {
        foreach (['type', 'name', 'url', 'category', 'source', 'note'] as $field) {
            if ((string) ($existing[$field] ?? '') !== (string) $values[$field]) {
                throw $this->idempotencyConflict();
            }
        }
    }

    /** @param array<string, mixed> $existing @param array<string, mixed> $values */
    private function assertFeedbackMatches(array $existing, array $values): void
    {
        foreach (['type', 'title', 'description', 'page'] as $field) {
            if ((string) ($existing[$field] ?? '') !== (string) $values[$field]) {
                throw $this->idempotencyConflict();
            }
        }
        $existingClient = isset($existing['client_json']) ? self::decodeJson((string) $existing['client_json']) : null;
        $client = $values['client_json'] === null ? null : self::decodeJson((string) $values['client_json']);
        if ($existingClient != $client || (int) ($existing['has_screenshot'] ?? 0) !== $values['has_screenshot']) {
            throw $this->idempotencyConflict();
        }
    }

    /** @param array<string, mixed> $existing */
    private function assertTestFeedbackMatches(array $existing, string $formVersion, string $responseJson): void
    {
        if (
            (string) ($existing['form_version'] ?? '') !== $formVersion
            || self::decodeJson((string) ($existing['response_json'] ?? '')) != self::decodeJson($responseJson)
        ) {
            throw $this->idempotencyConflict();
        }
    }

    private function idempotencyConflict(): ApiException
    {
        return new ApiException(
            409,
            'idempotency_conflict',
            'Samaa lähetystunnistetta on käytetty eri sisällölle.',
        );
    }

    private static function databaseNow(): string
    {
        return (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s.u');
    }

    private static function isoDate(mixed $value): string
    {
        $text = trim((string) $value);
        if ($text === '') {
            return '';
        }
        try {
            return (new DateTimeImmutable($text, new DateTimeZone('UTC')))
                ->setTimezone(new DateTimeZone('UTC'))
                ->format('Y-m-d\TH:i:s.u\Z');
        } catch (Throwable) {
            return '';
        }
    }

    /** @param array<mixed> $value */
    private static function encodeJson(array $value): string
    {
        try {
            return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        } catch (JsonException $error) {
            throw new \RuntimeException('JSON encoding failed.', previous: $error);
        }
    }

    /** @return array<mixed>|null */
    private static function decodeJson(string $value): ?array
    {
        try {
            $decoded = json_decode($value, true, 64, JSON_THROW_ON_ERROR);
            return is_array($decoded) ? $decoded : null;
        } catch (JsonException) {
            return null;
        }
    }

    private static function truncate(string $value, int $max): string
    {
        return function_exists('mb_substr') ? mb_substr($value, 0, $max, 'UTF-8') : substr($value, 0, $max);
    }
}
