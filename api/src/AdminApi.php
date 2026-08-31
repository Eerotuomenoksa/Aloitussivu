<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;
use DateTimeZone;
use JsonException;
use Throwable;

final class AdminApi
{
    public function __construct(
        private readonly DatabaseConnection $database,
        private readonly AdminAuthenticator $authenticator,
        private readonly AttachmentStorage $attachments,
        private readonly NcscJob $ncscJob,
        private readonly Config $config,
        private readonly string $basePath = '',
    ) {
    }

    public function register(Router $router): void
    {
        $router->add('GET', '/api/v1/admin/me', fn (Request $request): Response => $this->me($request));
        $router->add('GET', '/api/v1/admin/link-reports', fn (Request $request): Response => $this->linkReports($request));
        $router->add('PATCH', '/api/v1/admin/link-reports/{id}', fn (Request $request): Response => $this->updateLinkReport($request));
        $router->add('GET', '/api/v1/admin/feedback', fn (Request $request): Response => $this->feedback($request));
        $router->add('PATCH', '/api/v1/admin/feedback/{id}', fn (Request $request): Response => $this->updateFeedback($request));
        $router->add('GET', '/api/v1/admin/feedback/{id}/attachment', fn (Request $request): Response => $this->feedbackAttachment($request));
        $router->add('GET', '/api/v1/admin/test-feedback', fn (Request $request): Response => $this->testFeedback($request));
        $router->add('GET', '/api/v1/admin/approved-links', fn (Request $request): Response => $this->approvedLinks($request));
        $router->add('POST', '/api/v1/admin/approved-links', fn (Request $request): Response => $this->createApprovedLink($request));
        $router->add('DELETE', '/api/v1/admin/approved-links/{id}', fn (Request $request): Response => $this->deleteApprovedLink($request));
        $router->add('GET', '/api/v1/admin/blocked-links', fn (Request $request): Response => $this->blockedLinks($request));
        $router->add('POST', '/api/v1/admin/blocked-links', fn (Request $request): Response => $this->createBlockedLink($request));
        $router->add('DELETE', '/api/v1/admin/blocked-links/{id}', fn (Request $request): Response => $this->deleteBlockedLink($request));
        $router->add('GET', '/api/v1/admin/scam-alerts', fn (Request $request): Response => $this->scamAlerts($request));
        $router->add('POST', '/api/v1/admin/scam-alerts', fn (Request $request): Response => $this->createScamAlert($request));
        $router->add('PATCH', '/api/v1/admin/scam-alerts/{id}', fn (Request $request): Response => $this->updateScamAlert($request));
        $router->add('GET', '/api/v1/admin/ncsc-logs', fn (Request $request): Response => $this->ncscLogs($request));
        $router->add('POST', '/api/v1/admin/ncsc-run', fn (Request $request): Response => $this->runNcsc($request));
        $router->add('GET', '/api/v1/admin/link-checks', fn (Request $request): Response => $this->linkChecks($request));
        $router->add('POST', '/api/v1/admin/link-checks/{urlHash}/action', fn (Request $request): Response => $this->linkCheckAction($request));
        $router->add('GET', '/api/v1/admin/usage-stats', fn (Request $request): Response => $this->usageStats($request));
        $router->add('GET', '/api/v1/admin/audit-log', fn (Request $request): Response => $this->auditLog($request));
    }

    private function me(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request);
        return $this->data($request, [
            'uid' => $actor->uid,
            'email' => $actor->email,
            'role' => $actor->role,
        ]);
    }

    private function linkReports(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $rows = $this->database->fetchAll(
            'SELECT id, type, name, url, category, source, note, status, review_reason, created_at, updated_at, '
            . 'reviewed_at, reviewed_by, approved_link_id FROM link_reports ORDER BY created_at DESC LIMIT 500',
        );
        return $this->data($request, array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'type' => (string) ($row['type'] ?? ''),
            'name' => (string) ($row['name'] ?? ''),
            'url' => (string) ($row['url'] ?? ''),
            'category' => (string) ($row['category'] ?? ''),
            'source' => (string) ($row['source'] ?? ''),
            'note' => (string) ($row['note'] ?? ''),
            'status' => (string) ($row['status'] ?? ''),
            'reviewReason' => (string) ($row['review_reason'] ?? ''),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
            'updatedAt' => self::isoDate($row['updated_at'] ?? ''),
            'reviewedAt' => self::nullableIsoDate($row['reviewed_at'] ?? null),
            'reviewedBy' => self::nullableString($row['reviewed_by'] ?? null),
            'approvedLinkId' => self::nullableString($row['approved_link_id'] ?? null),
        ], $rows));
    }

    private function updateLinkReport(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request, true);
        $id = $this->routeId($request);
        $data = Validator::jsonObject($request);
        Validator::shape($data, ['status', 'reviewReason'], ['status']);
        $status = Validator::enum($data, 'status', ['pending', 'approved', 'rejected']);
        $reviewReason = Validator::string($data, 'reviewReason', 0, 1000, false);
        $now = self::databaseNow();

        $this->database->transaction(function (DatabaseConnection $database) use (
            $actor,
            $id,
            $status,
            $reviewReason,
            $now,
        ): void {
            $this->requireTarget($database, 'SELECT id FROM link_reports WHERE id = :id FOR UPDATE', $id);
            $database->execute(
                'UPDATE link_reports SET status = :status, review_reason = :review_reason, updated_at = :updated_at, '
                . 'reviewed_at = :reviewed_at, reviewed_by = :reviewed_by WHERE id = :id',
                [
                    'id' => $id,
                    'status' => $status,
                    'review_reason' => $reviewReason === '' ? null : $reviewReason,
                    'updated_at' => $now,
                    'reviewed_at' => $status === 'pending' ? null : $now,
                    'reviewed_by' => $status === 'pending' ? null : $actor->uid,
                ],
            );
            $this->audit($database, $actor, 'link_report.update', 'link_report', $id, ['fields' => ['status', 'reviewReason']]);
        });
        return $this->updated($request, $id, $now);
    }

    private function feedback(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $rows = $this->database->fetchAll(
            'SELECT f.id, f.type, f.title, f.description, f.page, f.status, f.public_note, f.client_json, '
            . 'f.has_screenshot, f.created_at, f.updated_at, f.handled_at, f.handled_by, '
            . 'a.original_name, a.media_type, a.byte_size FROM feedback_items f '
            . 'LEFT JOIN feedback_attachments a ON a.feedback_id = f.id ORDER BY f.created_at DESC LIMIT 500',
        );
        $externalApiBase = $this->basePath . '/api/v1';
        $items = array_map(static function (array $row) use ($externalApiBase): array {
            $client = self::decodeObject($row['client_json'] ?? null);
            $item = [
                'id' => (string) ($row['id'] ?? ''),
                'type' => (string) ($row['type'] ?? ''),
                'title' => (string) ($row['title'] ?? ''),
                'description' => (string) ($row['description'] ?? ''),
                'page' => (string) ($row['page'] ?? ''),
                'status' => (string) ($row['status'] ?? ''),
                'publicNote' => (string) ($row['public_note'] ?? ''),
                'client' => $client,
                'hasScreenshot' => (bool) ($row['has_screenshot'] ?? false),
                'createdAt' => self::isoDate($row['created_at'] ?? ''),
                'updatedAt' => self::isoDate($row['updated_at'] ?? ''),
                'handledAt' => self::nullableIsoDate($row['handled_at'] ?? null),
                'handledBy' => self::nullableString($row['handled_by'] ?? null),
            ];
            if ((bool) ($row['has_screenshot'] ?? false)) {
                $item['attachment'] = [
                    'name' => (string) ($row['original_name'] ?? ''),
                    'type' => (string) ($row['media_type'] ?? ''),
                    'size' => (int) ($row['byte_size'] ?? 0),
                    'url' => $externalApiBase . '/admin/feedback/' . rawurlencode((string) ($row['id'] ?? '')) . '/attachment',
                ];
            }
            return $item;
        }, $rows);
        return $this->data($request, $items);
    }

    private function updateFeedback(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request, true);
        $id = $this->routeId($request);
        $data = Validator::jsonObject($request);
        Validator::shape($data, ['status', 'publicNote'], ['status']);
        $status = Validator::enum($data, 'status', ['new', 'triage', 'planned', 'in_progress', 'done', 'rejected']);
        $publicNote = Validator::string($data, 'publicNote', 0, 1600, false);
        $now = self::databaseNow();
        $handled = in_array($status, ['done', 'rejected'], true);

        $this->database->transaction(function (DatabaseConnection $database) use (
            $actor,
            $id,
            $status,
            $publicNote,
            $now,
            $handled,
        ): void {
            $this->requireTarget($database, 'SELECT id FROM feedback_items WHERE id = :id FOR UPDATE', $id);
            $database->execute(
                'UPDATE feedback_items SET status = :status, public_note = :public_note, updated_at = :updated_at, '
                . 'handled_at = :handled_at, handled_by = :handled_by WHERE id = :id',
                [
                    'id' => $id,
                    'status' => $status,
                    'public_note' => $publicNote,
                    'updated_at' => $now,
                    'handled_at' => $handled ? $now : null,
                    'handled_by' => $handled ? $actor->uid : null,
                ],
            );
            $this->audit($database, $actor, 'feedback.update', 'feedback', $id, ['fields' => ['status', 'publicNote']]);
        });
        return $this->updated($request, $id, $now);
    }

    private function feedbackAttachment(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $id = $this->routeId($request);
        $row = $this->database->fetchOne(
            'SELECT storage_key, original_name, media_type, byte_size FROM feedback_attachments WHERE feedback_id = :id LIMIT 1',
            ['id' => $id],
        );
        if ($row === null) {
            throw $this->notFound();
        }
        $mediaType = (string) ($row['media_type'] ?? '');
        if (!in_array($mediaType, ['image/png', 'image/jpeg', 'image/webp', 'image/gif'], true)) {
            throw $this->notFound();
        }
        $contents = $this->attachments->read((string) ($row['storage_key'] ?? ''));
        if ($contents === null) {
            throw $this->notFound();
        }
        $filename = rawurlencode((string) ($row['original_name'] ?? 'attachment'));
        return new Response(200, $contents, [
            'Content-Type' => $mediaType,
            'Content-Length' => (string) strlen($contents),
            'Content-Disposition' => "attachment; filename*=UTF-8''" . $filename,
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function testFeedback(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $rows = $this->database->fetchAll(
            'SELECT id, form_version, response_json, created_at FROM test_feedback_responses ORDER BY created_at DESC LIMIT 500',
        );
        return $this->data($request, array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'formVersion' => (string) ($row['form_version'] ?? ''),
            'response' => self::decodeObject($row['response_json'] ?? null),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
        ], $rows));
    }

    private function approvedLinks(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $rows = $this->database->fetchAll(
            'SELECT id, name, url, category, source, note, created_from_report_id, created_at, updated_at '
            . 'FROM approved_links ORDER BY created_at DESC LIMIT 500',
        );
        return $this->data($request, array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'name' => (string) ($row['name'] ?? ''),
            'url' => (string) ($row['url'] ?? ''),
            'category' => (string) ($row['category'] ?? ''),
            'source' => (string) ($row['source'] ?? ''),
            'note' => self::nullableString($row['note'] ?? null),
            'createdFromReportId' => self::nullableString($row['created_from_report_id'] ?? null),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
            'updatedAt' => self::isoDate($row['updated_at'] ?? ''),
        ], $rows));
    }

    private function createApprovedLink(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request, true);
        $data = Validator::jsonObject($request);
        Validator::shape($data, ['id', 'name', 'url', 'category', 'source', 'note', 'createdFromReportId'], ['name', 'url', 'category', 'source']);
        $id = array_key_exists('id', $data) ? Validator::uuid($data, 'id') : Uuid::generate();
        $url = Validator::httpsUrl($data, 'url');
        $values = [
            'id' => $id,
            'name' => Validator::string($data, 'name', 1, 160),
            'url' => $url,
            'url_hash' => hash('sha256', $url, true),
            'category' => Validator::string($data, 'category', 1, 255),
            'source' => Validator::string($data, 'source', 1, 255),
            'note' => Validator::string($data, 'note', 0, 1000, false),
            'created_from_report_id' => self::optionalUuid($data, 'createdFromReportId'),
        ];
        $createdAt = self::databaseNow();
        $this->database->transaction(function (DatabaseConnection $database) use ($actor, $values, $createdAt): void {
            $conflict = $database->fetchOne(
                'SELECT id FROM approved_links WHERE id = :id OR url_hash = :url_hash LIMIT 1 FOR UPDATE',
                ['id' => $values['id'], 'url_hash' => $values['url_hash']],
            );
            if ($conflict !== null) {
                throw $this->conflict();
            }
            $database->execute(
                'INSERT INTO approved_links '
                . '(id, name, url, url_hash, category, source, note, created_from_report_id, created_at, updated_at) '
                . 'VALUES (:id, :name, :url, :url_hash, :category, :source, :note, :created_from_report_id, :created_at, :updated_at)',
                [...$values, 'note' => $values['note'] === '' ? null : $values['note'], 'created_at' => $createdAt, 'updated_at' => $createdAt],
            );
            $this->audit($database, $actor, 'approved_link.create', 'approved_link', $values['id'], ['fields' => ['name', 'url', 'category', 'source', 'note', 'createdFromReportId']]);
        });
        return $this->created($request, $id, $createdAt);
    }

    private function deleteApprovedLink(Request $request): Response
    {
        return $this->deleteResource($request, 'approved_links', 'approved_link', 'approved_link.delete');
    }

    private function blockedLinks(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $rows = $this->database->fetchAll(
            'SELECT id, url, reason, created_at, created_by FROM blocked_links ORDER BY created_at DESC LIMIT 500',
        );
        return $this->data($request, array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'url' => (string) ($row['url'] ?? ''),
            'reason' => self::nullableString($row['reason'] ?? null),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
            'createdBy' => self::nullableString($row['created_by'] ?? null),
        ], $rows));
    }

    private function createBlockedLink(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request, true);
        $data = Validator::jsonObject($request);
        Validator::shape($data, ['id', 'url', 'reason'], ['url']);
        $id = array_key_exists('id', $data) ? Validator::uuid($data, 'id') : Uuid::generate();
        $url = Validator::httpsUrl($data, 'url');
        $reason = Validator::string($data, 'reason', 0, 1000, false);
        $urlHash = hash('sha256', $url, true);
        $createdAt = self::databaseNow();
        $this->database->transaction(function (DatabaseConnection $database) use ($actor, $id, $url, $reason, $urlHash, $createdAt): void {
            $conflict = $database->fetchOne(
                'SELECT id FROM blocked_links WHERE id = :id OR url_hash = :url_hash LIMIT 1 FOR UPDATE',
                ['id' => $id, 'url_hash' => $urlHash],
            );
            if ($conflict !== null) {
                throw $this->conflict();
            }
            $database->execute(
                'INSERT INTO blocked_links (id, url, url_hash, reason, created_at, created_by) '
                . 'VALUES (:id, :url, :url_hash, :reason, :created_at, :created_by)',
                ['id' => $id, 'url' => $url, 'url_hash' => $urlHash, 'reason' => $reason === '' ? null : $reason, 'created_at' => $createdAt, 'created_by' => $actor->uid],
            );
            $this->audit($database, $actor, 'blocked_link.create', 'blocked_link', $id, ['fields' => ['url', 'reason']]);
        });
        return $this->created($request, $id, $createdAt);
    }

    private function deleteBlockedLink(Request $request): Response
    {
        return $this->deleteResource($request, 'blocked_links', 'blocked_link', 'blocked_link.delete');
    }

    private function scamAlerts(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $rows = $this->database->fetchAll(
            'SELECT id, title, body, severity, active, source, source_url, source_week, original_heading, '
            . 'structure_version, created_at, updated_at, expires_at FROM scam_alerts ORDER BY created_at DESC LIMIT 500',
        );
        return $this->data($request, array_map(static fn (array $row): array => self::scamAlertItem($row), $rows));
    }

    private function createScamAlert(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request, true);
        $data = Validator::jsonObject($request);
        Validator::shape(
            $data,
            ['id', 'title', 'body', 'severity', 'active', 'source', 'sourceUrl', 'sourceWeek', 'originalHeading', 'structureVersion', 'expiresAt'],
            ['title', 'body', 'severity', 'active', 'expiresAt'],
        );
        $id = array_key_exists('id', $data) ? Validator::uuid($data, 'id') : Uuid::generate();
        $values = $this->scamAlertValues($data, true);
        $now = self::databaseNow();
        $this->database->transaction(function (DatabaseConnection $database) use ($actor, $id, $values, $now): void {
            $this->assertIdAvailable($database, 'scam_alerts', $id);
            $database->execute(
                'INSERT INTO scam_alerts '
                . '(id, title, body, severity, active, source, source_url, source_week, original_heading, structure_version, created_at, updated_at, expires_at) '
                . 'VALUES (:id, :title, :body, :severity, :active, :source, :source_url, :source_week, :original_heading, :structure_version, :created_at, :updated_at, :expires_at)',
                ['id' => $id, ...$values, 'created_at' => $now, 'updated_at' => $now],
            );
            $this->audit($database, $actor, 'scam_alert.create', 'scam_alert', $id, ['fields' => array_keys($values)]);
        });
        return $this->created($request, $id, $now);
    }

    private function updateScamAlert(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request, true);
        $id = $this->routeId($request);
        $data = Validator::jsonObject($request);
        Validator::shape($data, ['title', 'body', 'severity', 'active', 'source', 'sourceUrl', 'sourceWeek', 'originalHeading', 'structureVersion', 'expiresAt']);
        if ($data === []) {
            throw Validator::invalidField('body');
        }
        $values = $this->scamAlertValues($data, false);
        $assignments = [];
        foreach (array_keys($values) as $column) {
            $assignments[] = $column . ' = :' . $column;
        }
        $now = self::databaseNow();
        $this->database->transaction(function (DatabaseConnection $database) use ($actor, $id, $values, $assignments, $now): void {
            $this->requireTarget($database, 'SELECT id FROM scam_alerts WHERE id = :id FOR UPDATE', $id);
            $database->execute(
                'UPDATE scam_alerts SET ' . implode(', ', $assignments) . ', updated_at = :updated_at WHERE id = :id',
                ['id' => $id, ...$values, 'updated_at' => $now],
            );
            $this->audit($database, $actor, 'scam_alert.update', 'scam_alert', $id, ['fields' => array_keys($values)]);
        });
        return $this->updated($request, $id, $now);
    }

    private function ncscLogs(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $rows = $this->database->fetchAll(
            'SELECT id, source_url, week_label, published_at, processed_at, alerts_created, structure_version, message '
            . 'FROM ncsc_scrape_logs ORDER BY processed_at DESC LIMIT 200',
        );
        return $this->data($request, array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'sourceUrl' => (string) ($row['source_url'] ?? ''),
            'weekLabel' => (string) ($row['week_label'] ?? ''),
            'publishedAt' => self::nullableIsoDate($row['published_at'] ?? null),
            'processedAt' => self::isoDate($row['processed_at'] ?? ''),
            'alertsCreated' => (int) ($row['alerts_created'] ?? 0),
            'structureVersion' => (string) ($row['structure_version'] ?? ''),
            'message' => self::nullableString($row['message'] ?? null),
        ], $rows));
    }

    private function runNcsc(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request, true);
        $result = $this->ncscJob->run();
        $this->database->transaction(function (DatabaseConnection $database) use ($actor, $result): void {
            $this->audit(
                $database,
                $actor,
                'ncsc.run',
                'background_job',
                'ncsc',
                [
                    'status' => $result->status,
                    'alertsCreated' => $result->alertsCreated,
                    'targetsProcessed' => $result->targetsProcessed,
                    'targetsSkipped' => $result->targetsSkipped,
                    'errors' => $result->errors,
                ],
            );
        });
        if ($result->status === 'failed') {
            throw new ApiException(
                502,
                'background_job_failed',
                'Kyberturvallisuuskeskuksen ajo epäonnistui. Tarkista ajoloki.',
                [
                    'targetsProcessed' => $result->targetsProcessed,
                    'targetsSkipped' => $result->targetsSkipped,
                    'errors' => $result->errors,
                ],
            );
        }
        return $this->data($request, $result->toArray());
    }

    private function usageStats(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $daily = $this->database->fetchAll(
            'SELECT usage_date, total_pageviews, total_link_clicks FROM usage_daily ORDER BY usage_date DESC LIMIT 366',
        );
        $pages = $this->database->fetchAll(
            'SELECT usage_date, page, count FROM usage_page_daily ORDER BY usage_date DESC, count DESC LIMIT 2000',
        );
        $links = $this->database->fetchAll(
            'SELECT usage_date, url, label, category, page, count FROM usage_link_daily '
            . 'ORDER BY usage_date DESC, count DESC LIMIT 2000',
        );
        $context = $this->database->fetchAll(
            'SELECT usage_date, dimension, bucket, count FROM usage_context_daily '
            . 'ORDER BY usage_date DESC, dimension, bucket LIMIT 5000',
        );
        return $this->data($request, [
            'daily' => array_map(static fn (array $row): array => [
                'date' => (string) ($row['usage_date'] ?? ''),
                'pageviews' => (int) ($row['total_pageviews'] ?? 0),
                'linkClicks' => (int) ($row['total_link_clicks'] ?? 0),
            ], $daily),
            'pages' => array_map(static fn (array $row): array => [
                'date' => (string) ($row['usage_date'] ?? ''),
                'page' => (string) ($row['page'] ?? ''),
                'count' => (int) ($row['count'] ?? 0),
            ], $pages),
            'links' => array_map(static fn (array $row): array => [
                'date' => (string) ($row['usage_date'] ?? ''),
                'url' => (string) ($row['url'] ?? ''),
                'label' => (string) ($row['label'] ?? ''),
                'category' => (string) ($row['category'] ?? ''),
                'page' => (string) ($row['page'] ?? ''),
                'count' => (int) ($row['count'] ?? 0),
            ], $links),
            'context' => array_map(static fn (array $row): array => [
                'date' => (string) ($row['usage_date'] ?? ''),
                'dimension' => (string) ($row['dimension'] ?? ''),
                'bucket' => (string) ($row['bucket'] ?? ''),
                'count' => (int) ($row['count'] ?? 0),
            ], $context),
        ]);
    }

    private function linkChecks(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $now = self::databaseNow();
        $threshold = $this->config->linkCheckAlertAfterFailures;
        $summary = $this->database->fetchOne(
            'SELECT COUNT(*) AS total, '
            . "SUM(CASE WHEN t.last_status = 'pending' THEN 1 ELSE 0 END) AS pending, "
            . "SUM(CASE WHEN t.last_status = 'ok' THEN 1 ELSE 0 END) AS ok_count, "
            . "SUM(CASE WHEN t.last_status = 'warning' THEN 1 ELSE 0 END) AS warning_count, "
            . "SUM(CASE WHEN t.last_status = 'failed' THEN 1 ELSE 0 END) AS failing, "
            . "SUM(CASE WHEN t.last_status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count, "
            . "SUM(CASE WHEN t.final_domain_changed = 1 AND b.id IS NULL AND (o.id IS NULL OR "
            . "(o.scope <> 'all' AND (o.scope <> 'redirect' OR o.expected_final_url IS NULL "
            . "OR o.expected_final_url <> t.final_url))) THEN 1 ELSE 0 END) AS domain_changed, "
            . "SUM(CASE WHEN b.id IS NULL AND ((t.last_status = 'failed' AND t.failure_count >= :threshold "
            . "AND (o.id IS NULL OR o.scope <> 'all')) OR (t.final_domain_changed = 1 "
            . "AND (o.id IS NULL OR (o.scope <> 'all' AND (o.scope <> 'redirect' "
            . "OR o.expected_final_url IS NULL OR o.expected_final_url <> t.final_url))))) THEN 1 ELSE 0 END) AS attention, "
            . 'SUM(CASE WHEN t.next_check_at <= :due_now THEN 1 ELSE 0 END) AS due_count, '
            . 'MIN(t.last_checked_at) AS oldest_checked_at '
            . 'FROM link_check_targets t '
            . 'LEFT JOIN blocked_links b ON b.url_hash = UNHEX(t.url_hash) '
            . "LEFT JOIN link_check_overrides o ON o.url_hash = t.url_hash "
            . "AND o.status IN ('verified', 'exception') AND o.next_review_at >= :override_now "
            . 'WHERE t.catalog_active = 1 OR t.approved_active = 1',
            ['threshold' => $threshold, 'due_now' => $now, 'override_now' => $now],
        ) ?? [];
        $lastRun = $this->database->fetchOne(
            'SELECT id, started_at, finished_at, status, catalog_count, approved_count, checked_count, ok_count, '
            . 'warning_count, failed_count, rejected_count, blocked_count, unblocked_count, message_code '
            . 'FROM link_check_runs ORDER BY started_at DESC LIMIT 1',
        );
        $items = $this->database->fetchAll(
            'SELECT t.url_hash, t.url, t.name, t.category, t.source, t.last_checked_at, t.next_check_at, '
            . 't.last_status, t.http_status, t.final_url, t.failure_count, t.last_error_code, t.response_ms '
            . 'FROM link_check_targets t '
            . 'LEFT JOIN blocked_links b ON b.url_hash = UNHEX(t.url_hash) '
            . "LEFT JOIN link_check_overrides o ON o.url_hash = t.url_hash "
            . "AND o.status IN ('verified', 'exception') AND o.next_review_at >= :override_now "
            . "WHERE (t.catalog_active = 1 OR t.approved_active = 1) AND b.id IS NULL "
            . "AND t.last_status = 'failed' AND t.failure_count >= :threshold AND (o.id IS NULL OR o.scope <> 'all') "
            . 'ORDER BY t.failure_count DESC, t.last_checked_at DESC LIMIT 200',
            ['threshold' => $threshold, 'override_now' => $now],
        );
        $statusItems = $this->database->fetchAll(
            'SELECT t.url_hash, t.url, t.name, t.category, t.source, t.last_checked_at, t.next_check_at, '
            . 't.last_status, t.http_status, t.final_url, t.failure_count, t.last_error_code, t.response_ms, '
            . 'CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS is_blocked, o.scope AS override_scope, '
            . 'o.next_review_at AS override_next_review_at '
            . 'FROM link_check_targets t '
            . 'LEFT JOIN blocked_links b ON b.url_hash = UNHEX(t.url_hash) '
            . "LEFT JOIN link_check_overrides o ON o.url_hash = t.url_hash "
            . "AND o.status IN ('verified', 'exception') AND o.next_review_at >= :override_now "
            . "WHERE (t.catalog_active = 1 OR t.approved_active = 1) AND t.last_status IN ('warning', 'failed') "
            . "ORDER BY CASE WHEN t.last_status = 'failed' THEN 0 ELSE 1 END, "
            . 't.failure_count DESC, t.last_checked_at DESC LIMIT 400',
            ['override_now' => $now],
        );
        $rejectedItems = $this->database->fetchAll(
            'SELECT url_hash, url, name, category, source, last_checked_at, next_check_at, last_status, http_status, '
            . 'final_url, failure_count, last_error_code, response_ms '
            . "FROM link_check_targets WHERE (catalog_active = 1 OR approved_active = 1) AND last_status = 'rejected' "
            . 'ORDER BY last_checked_at DESC LIMIT 200',
        );
        $domainChangedItems = $this->database->fetchAll(
            'SELECT t.url_hash, t.url, t.name, t.category, t.source, t.last_checked_at, t.next_check_at, '
            . 't.last_status, t.http_status, t.final_url, t.failure_count, t.last_error_code, t.response_ms '
            . 'FROM link_check_targets t '
            . 'LEFT JOIN blocked_links b ON b.url_hash = UNHEX(t.url_hash) '
            . "LEFT JOIN link_check_overrides o ON o.url_hash = t.url_hash "
            . "AND o.status IN ('verified', 'exception') AND o.next_review_at >= :override_now "
            . "WHERE (t.catalog_active = 1 OR t.approved_active = 1) AND b.id IS NULL "
            . "AND t.final_domain_changed = 1 AND (o.id IS NULL OR (o.scope <> 'all' AND (o.scope <> 'redirect' "
            . "OR o.expected_final_url IS NULL OR o.expected_final_url <> t.final_url))) "
            . 'ORDER BY t.last_checked_at DESC LIMIT 200',
            ['override_now' => $now],
        );
        $runs = $this->database->fetchAll(
            'SELECT id, started_at, finished_at, status, checked_count, ok_count, warning_count, failed_count, '
            . 'rejected_count, blocked_count, unblocked_count, message_code '
            . 'FROM link_check_runs ORDER BY started_at DESC LIMIT 20',
        );
        $mapRun = static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'startedAt' => self::isoDate($row['started_at'] ?? ''),
            'finishedAt' => self::nullableIsoDate($row['finished_at'] ?? null),
            'status' => (string) ($row['status'] ?? ''),
            'catalogCount' => (int) ($row['catalog_count'] ?? 0),
            'approvedCount' => (int) ($row['approved_count'] ?? 0),
            'checked' => (int) ($row['checked_count'] ?? 0),
            'ok' => (int) ($row['ok_count'] ?? 0),
            'warnings' => (int) ($row['warning_count'] ?? 0),
            'failed' => (int) ($row['failed_count'] ?? 0),
            'rejected' => (int) ($row['rejected_count'] ?? 0),
            'blocked' => (int) ($row['blocked_count'] ?? 0),
            'unblocked' => (int) ($row['unblocked_count'] ?? 0),
            'messageCode' => self::nullableString($row['message_code'] ?? null),
        ];
        $mapItem = static fn (array $row): array => [
            'id' => (string) ($row['url_hash'] ?? ''),
            'url' => (string) ($row['url'] ?? ''),
            'name' => (string) ($row['name'] ?? ''),
            'category' => (string) ($row['category'] ?? ''),
            'source' => (string) ($row['source'] ?? ''),
            'lastCheckedAt' => self::nullableIsoDate($row['last_checked_at'] ?? null),
            'nextCheckAt' => self::isoDate($row['next_check_at'] ?? ''),
            'status' => (string) ($row['last_status'] ?? ''),
            'httpStatus' => isset($row['http_status']) ? (int) $row['http_status'] : null,
            'finalUrl' => self::nullableString($row['final_url'] ?? null),
            'failureCount' => (int) ($row['failure_count'] ?? 0),
            'errorCode' => self::nullableString($row['last_error_code'] ?? null),
            'responseMs' => isset($row['response_ms']) ? (int) $row['response_ms'] : null,
            'isBlocked' => (bool) ($row['is_blocked'] ?? false),
            'overrideScope' => self::nullableString($row['override_scope'] ?? null),
            'overrideNextReviewAt' => self::nullableIsoDate($row['override_next_review_at'] ?? null),
        ];
        $totalTargets = (int) ($summary['total'] ?? 0);
        $dailyCapacity = max(1, $this->config->linkCheckBatchSize * 24);
        return $this->data($request, [
            'enabled' => $this->config->linkCheckEnabled,
            'autoBlockEnabled' => $this->config->linkCheckAutoBlockEnabled,
            'alertAfterFailures' => $threshold,
            'summary' => [
                'total' => (int) ($summary['total'] ?? 0),
                'pending' => (int) ($summary['pending'] ?? 0),
                'ok' => (int) ($summary['ok_count'] ?? 0),
                'warnings' => (int) ($summary['warning_count'] ?? 0),
                'failing' => (int) ($summary['failing'] ?? 0),
                'rejected' => (int) ($summary['rejected_count'] ?? 0),
                'domainChanged' => (int) ($summary['domain_changed'] ?? 0),
                'attention' => (int) ($summary['attention'] ?? 0),
                'due' => (int) ($summary['due_count'] ?? 0),
                'oldestCheckedAt' => self::nullableIsoDate($summary['oldest_checked_at'] ?? null),
                'estimatedCycleDays' => round($totalTargets / $dailyCapacity, 1),
            ],
            'lastRun' => $lastRun === null ? null : $mapRun($lastRun),
            'items' => array_map($mapItem, $items),
            'statusItems' => array_map($mapItem, $statusItems),
            'rejectedItems' => array_map($mapItem, $rejectedItems),
            'domainChangedItems' => array_map($mapItem, $domainChangedItems),
            'runs' => array_map($mapRun, $runs),
        ]);
    }

    private function linkCheckAction(Request $request): Response
    {
        $actor = $this->authenticator->authenticate($request, true);
        $urlHash = $this->routeUrlHash($request);
        $data = Validator::jsonObject($request);
        Validator::shape($data, ['action', 'reason'], ['action', 'reason']);
        $action = Validator::enum($data, 'action', ['approve', 'block']);
        $reason = Validator::string($data, 'reason', 3, 900);
        $nowDate = new DateTimeImmutable('now', new DateTimeZone('UTC'));
        $now = $nowDate->format('Y-m-d H:i:s.u');
        $nextReviewAt = $nowDate->modify('+3 months')->format('Y-m-d H:i:s.u');

        $this->database->transaction(function (DatabaseConnection $database) use (
            $actor,
            $urlHash,
            $action,
            $reason,
            $now,
            $nextReviewAt,
        ): void {
            $target = $database->fetchOne(
                'SELECT url_hash, url, last_status, final_url, final_domain_changed FROM link_check_targets '
                . 'WHERE url_hash = :url_hash AND (catalog_active = 1 OR approved_active = 1) FOR UPDATE',
                ['url_hash' => $urlHash],
            );
            if ($target === null) {
                throw $this->notFound();
            }

            if ($action === 'approve') {
                $scope = ($target['last_status'] ?? null) === 'failed'
                    ? 'all'
                    : ((bool) ($target['final_domain_changed'] ?? false) ? 'redirect' : 'bot_protection');
                $status = $scope === 'redirect' ? 'verified' : 'exception';
                $expectedFinalUrl = $scope === 'redirect' ? self::nullableString($target['final_url'] ?? null) : null;
                $existing = $database->fetchOne(
                    'SELECT id FROM link_check_overrides WHERE url_hash = :url_hash LIMIT 1 FOR UPDATE',
                    ['url_hash' => $urlHash],
                );
                $overrideId = (string) ($existing['id'] ?? Uuid::generate());
                if ($existing === null) {
                    $database->execute(
                        'INSERT INTO link_check_overrides '
                        . '(id, url_hash, status, scope, reason, expected_final_url, verified_at, next_review_at, created_at, updated_at, created_by) '
                        . 'VALUES (:id, :url_hash, :status, :scope, :reason, :expected_final_url, :verified_at, :next_review_at, :created_at, :updated_at, :created_by)',
                        [
                            'id' => $overrideId,
                            'url_hash' => $urlHash,
                            'status' => $status,
                            'scope' => $scope,
                            'reason' => $reason,
                            'expected_final_url' => $expectedFinalUrl,
                            'verified_at' => $now,
                            'next_review_at' => $nextReviewAt,
                            'created_at' => $now,
                            'updated_at' => $now,
                            'created_by' => $actor->uid,
                        ],
                    );
                } else {
                    $database->execute(
                        'UPDATE link_check_overrides SET status = :status, scope = :scope, reason = :reason, expected_final_url = :expected_final_url, '
                        . 'verified_at = :verified_at, next_review_at = :next_review_at, updated_at = :updated_at, '
                        . 'created_by = :created_by WHERE url_hash = :url_hash',
                        [
                            'url_hash' => $urlHash,
                            'status' => $status,
                            'scope' => $scope,
                            'reason' => $reason,
                            'expected_final_url' => $expectedFinalUrl,
                            'verified_at' => $now,
                            'next_review_at' => $nextReviewAt,
                            'updated_at' => $now,
                            'created_by' => $actor->uid,
                        ],
                    );
                }
                $database->execute(
                    "DELETE FROM blocked_links WHERE url_hash = UNHEX(:url_hash) AND created_by IS NULL AND reason LIKE 'auto:%'",
                    ['url_hash' => $urlHash],
                );
                $database->execute(
                    'UPDATE link_check_targets SET auto_blocked_at = NULL WHERE url_hash = :url_hash',
                    ['url_hash' => $urlHash],
                );
                $this->audit($database, $actor, 'link_check.approve', 'link_check_target', $urlHash, [
                    'scope' => $scope,
                    'expectedFinalUrl' => $expectedFinalUrl,
                    'nextReviewAt' => self::isoDate($nextReviewAt),
                ]);
                return;
            }

            $existingBlock = $database->fetchOne(
                'SELECT id FROM blocked_links WHERE url_hash = UNHEX(:url_hash) LIMIT 1 FOR UPDATE',
                ['url_hash' => $urlHash],
            );
            $blockId = (string) ($existingBlock['id'] ?? Uuid::generate());
            if ($existingBlock === null) {
                $database->execute(
                    'INSERT INTO blocked_links (id, url, url_hash, reason, created_at, created_by) '
                    . 'VALUES (:id, :url, UNHEX(:url_hash), :reason, :created_at, :created_by)',
                    [
                        'id' => $blockId,
                        'url' => (string) ($target['url'] ?? ''),
                        'url_hash' => $urlHash,
                        'reason' => 'manual:' . $reason,
                        'created_at' => $now,
                        'created_by' => $actor->uid,
                    ],
                );
            } else {
                $database->execute(
                    'UPDATE blocked_links SET reason = :reason, created_by = :created_by WHERE id = :id',
                    ['id' => $blockId, 'reason' => 'manual:' . $reason, 'created_by' => $actor->uid],
                );
            }
            $database->execute(
                "UPDATE link_check_overrides SET status = 'retired', updated_at = :updated_at WHERE url_hash = :url_hash",
                ['url_hash' => $urlHash, 'updated_at' => $now],
            );
            $database->execute(
                'UPDATE link_check_targets SET auto_blocked_at = NULL WHERE url_hash = :url_hash',
                ['url_hash' => $urlHash],
            );
            $this->audit($database, $actor, 'link_check.block', 'link_check_target', $urlHash, [
                'blockedLinkId' => $blockId,
            ]);
        });

        return $this->updated($request, $urlHash, $now);
    }

    private function auditLog(Request $request): Response
    {
        $this->authenticator->authenticate($request);
        $rows = $this->database->fetchAll(
            'SELECT id, actor_firebase_uid, action, target_type, target_id, metadata_json, created_at '
            . 'FROM audit_log ORDER BY created_at DESC LIMIT 500',
        );
        return $this->data($request, array_map(static fn (array $row): array => [
            'id' => (string) ($row['id'] ?? ''),
            'actorUid' => self::nullableString($row['actor_firebase_uid'] ?? null),
            'action' => (string) ($row['action'] ?? ''),
            'targetType' => (string) ($row['target_type'] ?? ''),
            'targetId' => (string) ($row['target_id'] ?? ''),
            'metadata' => self::decodeObject($row['metadata_json'] ?? null),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
        ], $rows));
    }

    private function deleteResource(
        Request $request,
        string $table,
        string $targetType,
        string $action,
    ): Response {
        $actor = $this->authenticator->authenticate($request, true);
        $id = $this->routeId($request);
        $allowedTables = ['approved_links', 'blocked_links'];
        if (!in_array($table, $allowedTables, true)) {
            throw new \LogicException('Unsupported deletion table.');
        }
        $this->database->transaction(function (DatabaseConnection $database) use ($actor, $id, $table, $targetType, $action): void {
            $this->requireTarget($database, 'SELECT id FROM ' . $table . ' WHERE id = :id FOR UPDATE', $id);
            $database->execute('DELETE FROM ' . $table . ' WHERE id = :id', ['id' => $id]);
            $this->audit($database, $actor, $action, $targetType, $id, []);
        });
        return Response::empty(204);
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    private function scamAlertValues(array $data, bool $allRequired): array
    {
        $mapping = [
            'title' => 'title',
            'body' => 'body',
            'severity' => 'severity',
            'active' => 'active',
            'source' => 'source',
            'sourceUrl' => 'source_url',
            'sourceWeek' => 'source_week',
            'originalHeading' => 'original_heading',
            'structureVersion' => 'structure_version',
            'expiresAt' => 'expires_at',
        ];
        $values = [];
        foreach ($mapping as $field => $column) {
            if (!$allRequired && !array_key_exists($field, $data)) {
                continue;
            }
            if ($allRequired && !array_key_exists($field, $data) && in_array($field, ['source', 'sourceUrl', 'sourceWeek', 'originalHeading', 'structureVersion'], true)) {
                $values[$column] = null;
                continue;
            }
            $values[$column] = match ($field) {
                'title', 'originalHeading' => self::nullableText(Validator::string($data, $field, $field === 'title' ? 1 : 0, 500, $field === 'title')),
                'body' => Validator::string($data, $field, 1, 5000),
                'severity' => Validator::enum($data, $field, ['info', 'warning', 'danger']),
                'active' => Validator::boolean($data, $field) ? 1 : 0,
                'source', 'sourceWeek' => self::nullableText(Validator::string($data, $field, 0, 255, false)),
                'sourceUrl' => self::nullableText($this->optionalHttpsUrl($data, $field)),
                'structureVersion' => self::nullableText(Validator::enum($data, $field, ['2026', '2025', 'news', 'unknown'])),
                'expiresAt' => self::databaseDate($data, $field),
                default => throw new \LogicException('Unsupported scam alert field.'),
            };
        }
        return $values;
    }

    private function optionalHttpsUrl(array $data, string $field): string
    {
        $value = Validator::string($data, $field, 0, 2048, false);
        return $value === '' ? '' : UrlNormalizer::https($value, $field, 2048);
    }

    private function routeId(Request $request): string
    {
        return Validator::uuid(['id' => $request->pathParameter('id')], 'id');
    }

    private function routeUrlHash(Request $request): string
    {
        $urlHash = strtolower(trim($request->pathParameter('urlHash')));
        if (preg_match('/^[a-f0-9]{64}$/D', $urlHash) !== 1) {
            throw new ApiException(422, 'validation_error', 'Linkin tunniste ei kelpaa.');
        }
        return $urlHash;
    }

    /** @param array<string, mixed> $data */
    private static function optionalUuid(array $data, string $field): ?string
    {
        if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {
            return null;
        }
        return Validator::uuid([$field => $data[$field]], $field);
    }

    private function requireTarget(DatabaseConnection $database, string $sql, string $id): void
    {
        if ($database->fetchOne($sql, ['id' => $id]) === null) {
            throw $this->notFound();
        }
    }

    private function assertIdAvailable(DatabaseConnection $database, string $table, string $id): void
    {
        if ($table !== 'scam_alerts') {
            throw new \LogicException('Unsupported ID check table.');
        }
        if ($database->fetchOne('SELECT id FROM scam_alerts WHERE id = :id LIMIT 1 FOR UPDATE', ['id' => $id]) !== null) {
            throw $this->conflict();
        }
    }

    /** @param array<string, mixed> $metadata */
    private function audit(
        DatabaseConnection $database,
        AdminUser $actor,
        string $action,
        string $targetType,
        string $targetId,
        array $metadata,
    ): void {
        $database->execute(
            'INSERT INTO audit_log (id, actor_firebase_uid, action, target_type, target_id, metadata_json, created_at) '
            . 'VALUES (:id, :actor_firebase_uid, :action, :target_type, :target_id, :metadata_json, :created_at)',
            [
                'id' => Uuid::generate(),
                'actor_firebase_uid' => $actor->uid,
                'action' => $action,
                'target_type' => $targetType,
                'target_id' => $targetId,
                'metadata_json' => $metadata === [] ? null : self::encodeJson($metadata),
                'created_at' => self::databaseNow(),
            ],
        );
    }

    /** @param array<string, mixed>|list<mixed> $data */
    private function data(Request $request, array $data): Response
    {
        return Response::json(['data' => $data, 'requestId' => $request->requestId], 200, ['Cache-Control' => 'private, no-store']);
    }

    private function created(Request $request, string $id, string $createdAt): Response
    {
        return Response::json([
            'data' => ['id' => $id, 'createdAt' => self::isoDate($createdAt)],
            'requestId' => $request->requestId,
        ], 201, ['Cache-Control' => 'private, no-store']);
    }

    private function updated(Request $request, string $id, string $updatedAt): Response
    {
        return Response::json([
            'data' => ['id' => $id, 'updatedAt' => self::isoDate($updatedAt)],
            'requestId' => $request->requestId,
        ], 200, ['Cache-Control' => 'private, no-store']);
    }

    private function notFound(): ApiException
    {
        return new ApiException(404, 'resource_not_found', 'Tietuetta ei löytynyt.');
    }

    private function conflict(): ApiException
    {
        return new ApiException(409, 'resource_conflict', 'Tietue on jo olemassa.');
    }

    private static function databaseNow(): string
    {
        return (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s.u');
    }

    /** @param array<string, mixed> $data */
    private static function databaseDate(array $data, string $field): string
    {
        $value = Validator::string($data, $field, 20, 40);
        if (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/D', $value) !== 1) {
            throw Validator::invalidField($field);
        }
        try {
            return (new DateTimeImmutable($value))->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u');
        } catch (Throwable) {
            throw Validator::invalidField($field);
        }
    }

    private static function isoDate(mixed $value): string
    {
        $text = trim((string) $value);
        if ($text === '') {
            return '';
        }
        try {
            return (new DateTimeImmutable($text, new DateTimeZone('UTC')))->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.u\Z');
        } catch (Throwable) {
            return '';
        }
    }

    private static function nullableIsoDate(mixed $value): ?string
    {
        $formatted = self::isoDate($value);
        return $formatted === '' ? null : $formatted;
    }

    private static function nullableString(mixed $value): ?string
    {
        return $value === null || $value === '' ? null : (string) $value;
    }

    private static function nullableText(string $value): ?string
    {
        return $value === '' ? null : $value;
    }

    /** @return array<string, mixed>|null */
    private static function decodeObject(mixed $value): ?array
    {
        if (!is_string($value) || $value === '') {
            return null;
        }
        try {
            $decoded = json_decode($value, true, 64, JSON_THROW_ON_ERROR);
            return is_array($decoded) && !array_is_list($decoded) ? $decoded : null;
        } catch (JsonException) {
            return null;
        }
    }

    /** @param array<string, mixed> $value */
    private static function encodeJson(array $value): string
    {
        try {
            return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        } catch (JsonException $error) {
            throw new \RuntimeException('JSON encoding failed.', previous: $error);
        }
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private static function scamAlertItem(array $row): array
    {
        return [
            'id' => (string) ($row['id'] ?? ''),
            'title' => (string) ($row['title'] ?? ''),
            'body' => (string) ($row['body'] ?? ''),
            'severity' => (string) ($row['severity'] ?? ''),
            'active' => (bool) ($row['active'] ?? false),
            'source' => self::nullableString($row['source'] ?? null),
            'sourceUrl' => self::nullableString($row['source_url'] ?? null),
            'sourceWeek' => self::nullableString($row['source_week'] ?? null),
            'originalHeading' => self::nullableString($row['original_heading'] ?? null),
            'structureVersion' => self::nullableString($row['structure_version'] ?? null),
            'createdAt' => self::isoDate($row['created_at'] ?? ''),
            'updatedAt' => self::isoDate($row['updated_at'] ?? ''),
            'expiresAt' => self::isoDate($row['expires_at'] ?? ''),
        ];
    }
}
