<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;
use DateTimeZone;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;
use RuntimeException;
use Throwable;

final class HttpNcscSource implements NcscSource
{
    private const FEED_URL = 'https://www.kyberturvallisuuskeskus.fi/feed/rss/fi';
    private const USER_AGENT = 'SeniorSurf-Aloitussivu/1.0 (+https://aloitussivu.seniorsurf.fi/)';
    private const REVIEW_TITLE = 'viikkokatsaus';
    private const SCAM_SECTION = 'Ajankohtaiset huijaukset';
    private const MAX_BYTES = 2_097_152;
    private const MAX_NEWS_TARGETS = 5;
    private const NEWS_LOOKBACK_DAYS = 14;

    /** @var list<string> */
    private const CONSUMER_KEYWORDS = [
        'huijaus', 'kalastelu', 'tietojenkalastelu', 'petos', 'tekstiviesti', 'huijausviesti',
        'huijaussoitto', 'huijauspuhelu', 'verkkokauppa', 'pankkitunnus', 'maksukortti',
        'varaus', 'booking', 'nimissä', 'pikaviesti', 'whatsapp', 'telegram', 'signal',
        'tilikaappaus', 'tilin kaappaus', 'kaappaus', 'rikollis', 'suojautumiskeino',
    ];

    /** @var list<string> */
    private const TECHNICAL_KEYWORDS = [
        'haavoittuvuus', 'direktiivi', 'nis2', 'cve', 'palvelunesto', 'organisaatio',
        'webinaari', 'seminaari', 'kvantti', 'rekisteri',
    ];

    public function targets(DateTimeImmutable $now): array
    {
        $response = $this->fetch(self::FEED_URL);
        if ($response['status'] !== 200) {
            throw new RuntimeException('ncsc_feed_http_' . $response['status']);
        }
        return $this->targetsFromXml($response['body'], $now);
    }

    public function scrape(NcscTarget $target, DateTimeImmutable $now): NcscScrapeResult
    {
        $response = $this->fetch($target->url);
        if ($response['status'] === 404) {
            $alternate = $this->alternateReviewUrl($target->url);
            if ($alternate !== null) {
                $response = $this->fetch($alternate);
            }
        }
        if ($response['status'] !== 200) {
            throw new RuntimeException('ncsc_page_http_' . $response['status']);
        }
        return $this->resultFromHtml($response['body'], $target, $now);
    }

    /** @return list<NcscTarget> */
    public function targetsFromXml(string $xml, DateTimeImmutable $now): array
    {
        $document = new DOMDocument();
        $previous = libxml_use_internal_errors(true);
        try {
            if (!$document->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING)) {
                throw new RuntimeException('ncsc_feed_invalid_xml');
            }
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }

        $xpath = new DOMXPath($document);
        $items = [];
        foreach ($xpath->query('//*[local-name()="item"]') ?: [] as $node) {
            if (!$node instanceof DOMElement) {
                continue;
            }
            $title = $this->childText($xpath, $node, 'title');
            $url = trim($this->childText($xpath, $node, 'link'));
            if ($url === '' || !$this->isAllowedUrl($url)) {
                continue;
            }
            $publishedAt = $this->parseDate($this->childText($xpath, $node, 'pubDate'));
            $searchText = implode(' ', [
                $title,
                $this->childText($xpath, $node, 'description'),
                $this->childText($xpath, $node, 'encoded'),
            ]);
            $items[] = [
                'url' => $url,
                'title' => self::cleanText($title, 180),
                'published_at' => $publishedAt,
                'search_text' => $searchText,
            ];
        }

        usort($items, static fn (array $left, array $right): int => (
            ($right['published_at']?->getTimestamp() ?? 0) <=> ($left['published_at']?->getTimestamp() ?? 0)
        ));

        $targets = [];
        foreach ($items as $item) {
            if (str_contains(self::lower((string) $item['title']), self::REVIEW_TITLE)) {
                $targets[] = new NcscTarget(
                    (string) $item['url'],
                    (string) $item['title'],
                    $item['published_at'],
                    'review',
                );
                break;
            }
        }

        $cutoff = $now->modify('-' . self::NEWS_LOOKBACK_DAYS . ' days');
        $newsAdded = 0;
        foreach ($items as $item) {
            if ($newsAdded >= self::MAX_NEWS_TARGETS) {
                break;
            }
            if (str_contains(self::lower((string) $item['title']), self::REVIEW_TITLE)) {
                continue;
            }
            $publishedAt = $item['published_at'];
            if ($publishedAt instanceof DateTimeImmutable && $publishedAt < $cutoff) {
                continue;
            }
            $searchText = (string) $item['search_text'];
            if (!self::hasKeyword($searchText, self::CONSUMER_KEYWORDS)
                || self::hasKeyword($searchText, self::TECHNICAL_KEYWORDS)) {
                continue;
            }
            $targets[] = new NcscTarget(
                (string) $item['url'],
                (string) $item['title'],
                $publishedAt,
                'news',
            );
            $newsAdded += 1;
        }

        $unique = [];
        $seen = [];
        foreach ($targets as $target) {
            if (isset($seen[$target->url])) {
                continue;
            }
            $seen[$target->url] = true;
            $unique[] = $target;
        }
        return $unique;
    }

    public function resultFromHtml(string $html, NcscTarget $target, DateTimeImmutable $now): NcscScrapeResult
    {
        [$document, $xpath] = $this->htmlDocument($html);
        return $target->kind === 'news'
            ? $this->newsResult($document, $xpath, $target, $now)
            : $this->reviewResult($document, $xpath, $target, $now);
    }

    /** @return array{0: DOMDocument, 1: DOMXPath} */
    private function htmlDocument(string $html): array
    {
        $document = new DOMDocument();
        $previous = libxml_use_internal_errors(true);
        try {
            if (!$document->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING)) {
                throw new RuntimeException('ncsc_page_invalid_html');
            }
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
        return [$document, new DOMXPath($document)];
    }

    private function reviewResult(
        DOMDocument $document,
        DOMXPath $xpath,
        NcscTarget $target,
        DateTimeImmutable $now,
    ): NcscScrapeResult {
        $heading = self::nodeText(($xpath->query('//h1') ?: null)?->item(0));
        preg_match('/(\d{1,2}\/\d{4})/u', $heading, $weekMatch);
        $weekLabel = $weekMatch[1] ?? '';
        $publishedAt = $this->pagePublishedAt($xpath, $target->publishedAt)
            ?? $this->dateFromIsoWeek($weekLabel)
            ?? $now;

        $elements = [];
        foreach ($xpath->query('//h2|//h3|//p|//li') ?: [] as $node) {
            $elements[] = $node;
        }

        $sectionStart = null;
        foreach ($elements as $index => $element) {
            if (strtolower($element->nodeName) === 'h2' && self::nodeText($element) === self::SCAM_SECTION) {
                $sectionStart = $index;
            }
        }

        if ($sectionStart !== null) {
            $items = $this->itemsBelowHeadings($elements, $sectionStart, 'h3');
            if ($items !== []) {
                return new NcscScrapeResult($target->url, $weekLabel, $publishedAt, $items, '2026');
            }
        }

        $items = [];
        foreach ($elements as $index => $element) {
            if (strtolower($element->nodeName) !== 'h2') {
                continue;
            }
            $itemHeading = self::nodeText($element);
            if (!self::hasKeyword($itemHeading, self::CONSUMER_KEYWORDS)
                || self::hasKeyword($itemHeading, self::TECHNICAL_KEYWORDS)) {
                continue;
            }
            $body = $this->bodyUntilHeading($elements, $index, ['h2']);
            if ($itemHeading !== '' && $body !== '') {
                $items[] = new NcscScrapeItem(self::cleanText($itemHeading, 160), self::cleanText($body, 800));
            }
        }
        return new NcscScrapeResult(
            $target->url,
            $weekLabel,
            $publishedAt,
            $items,
            $items === [] ? 'unknown' : '2025',
        );
    }

    private function newsResult(
        DOMDocument $document,
        DOMXPath $xpath,
        NcscTarget $target,
        DateTimeImmutable $now,
    ): NcscScrapeResult {
        $contentRoot = ($xpath->query('//article') ?: null)?->item(0)
            ?? ($xpath->query('//main') ?: null)?->item(0)
            ?? $document->documentElement;
        $heading = self::nodeText(($xpath->query('//h1') ?: null)?->item(0));
        if ($heading === '') {
            $heading = $target->title;
        }
        $parts = [];
        if ($contentRoot instanceof DOMNode) {
            foreach ($xpath->query('.//p|.//li', $contentRoot) ?: [] as $node) {
                $text = self::nodeText($node);
                if (self::length($text) > 20) {
                    $parts[] = $text;
                }
            }
        }
        $body = implode(' ', $parts);
        $publishedAt = $this->pagePublishedAt($xpath, $target->publishedAt) ?? $now;
        $searchable = $heading . ' ' . $body;
        $items = [];
        if ($heading !== '' && $body !== ''
            && self::hasKeyword($searchable, self::CONSUMER_KEYWORDS)
            && !self::hasKeyword($heading, self::TECHNICAL_KEYWORDS)) {
            $items[] = new NcscScrapeItem(self::cleanText($heading, 160), self::cleanText($body, 800));
        }
        return new NcscScrapeResult(
            $target->url,
            'Uutinen',
            $publishedAt,
            $items,
            $items === [] ? 'unknown' : 'news',
        );
    }

    /** @param list<DOMNode> $elements @return list<NcscScrapeItem> */
    private function itemsBelowHeadings(array $elements, int $sectionStart, string $headingTag): array
    {
        $headingIndexes = [];
        foreach ($elements as $index => $element) {
            if ($index <= $sectionStart) {
                continue;
            }
            if (strtolower($element->nodeName) === 'h2') {
                break;
            }
            if (strtolower($element->nodeName) === $headingTag) {
                $headingIndexes[] = $index;
            }
        }
        $items = [];
        foreach ($headingIndexes as $headingIndex) {
            $heading = self::nodeText($elements[$headingIndex]);
            $body = $this->bodyUntilHeading($elements, $headingIndex, ['h2', $headingTag]);
            if ($heading !== '' && $body !== '') {
                $items[] = new NcscScrapeItem(self::cleanText($heading, 160), self::cleanText($body, 800));
            }
        }
        return $items;
    }

    /** @param list<DOMNode> $elements @param list<string> $stopTags */
    private function bodyUntilHeading(array $elements, int $start, array $stopTags): string
    {
        $parts = [];
        for ($index = $start + 1; $index < count($elements); $index += 1) {
            $tag = strtolower($elements[$index]->nodeName);
            if (in_array($tag, $stopTags, true)) {
                break;
            }
            if (in_array($tag, ['p', 'li'], true)) {
                $parts[] = self::nodeText($elements[$index]);
            }
        }
        return implode(' ', array_filter($parts, static fn (string $value): bool => $value !== ''));
    }

    private function childText(DOMXPath $xpath, DOMElement $item, string $localName): string
    {
        $node = ($xpath->query('./*[local-name()="' . $localName . '"]', $item) ?: null)?->item(0);
        return self::nodeText($node);
    }

    private function pagePublishedAt(DOMXPath $xpath, ?DateTimeImmutable $fallback): ?DateTimeImmutable
    {
        $time = ($xpath->query('//time[@datetime]') ?: null)?->item(0);
        if ($time instanceof DOMElement) {
            return $this->parseDate($time->getAttribute('datetime')) ?? $fallback;
        }
        return $fallback;
    }

    private function parseDate(string $value): ?DateTimeImmutable
    {
        if (trim($value) === '') {
            return null;
        }
        try {
            return (new DateTimeImmutable($value))->setTimezone(new DateTimeZone('UTC'));
        } catch (Throwable) {
            return null;
        }
    }

    private function dateFromIsoWeek(string $weekLabel): ?DateTimeImmutable
    {
        if (preg_match('/^(\d{1,2})\/(\d{4})$/D', $weekLabel, $match) !== 1) {
            return null;
        }
        return (new DateTimeImmutable('now', new DateTimeZone('UTC')))
            ->setISODate((int) $match[2], (int) $match[1], 1)
            ->setTime(0, 0);
    }

    private function alternateReviewUrl(string $url): ?string
    {
        if (str_contains($url, '/ajankohtaista/')) {
            return str_replace('/ajankohtaista/', '/uutiset/', $url);
        }
        if (str_contains($url, '/uutiset/')) {
            return str_replace('/uutiset/', '/ajankohtaista/', $url);
        }
        return null;
    }

    /** @return array{status: int, body: string, url: string} */
    private function fetch(string $url): array
    {
        $this->assertAllowedUrl($url);
        if (function_exists('curl_init')) {
            return $this->fetchWithCurl($url);
        }
        return $this->fetchWithStreams($url);
    }

    /** @return array{status: int, body: string, url: string} */
    private function fetchWithCurl(string $url): array
    {
        $handle = curl_init($url);
        if ($handle === false) {
            throw new RuntimeException('ncsc_http_init_failed');
        }
        $body = '';
        $tooLarge = false;
        curl_setopt_array($handle, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 25,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_USERAGENT => self::USER_AGENT,
            CURLOPT_HTTPHEADER => ['Accept: application/rss+xml, application/xml, text/html;q=0.9'],
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$body, &$tooLarge): int {
                if (strlen($body) + strlen($chunk) > self::MAX_BYTES) {
                    $tooLarge = true;
                    return 0;
                }
                $body .= $chunk;
                return strlen($chunk);
            },
        ]);
        try {
            $ok = curl_exec($handle);
            $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
            $effectiveUrl = (string) curl_getinfo($handle, CURLINFO_EFFECTIVE_URL);
            if ($tooLarge) {
                throw new RuntimeException('ncsc_http_response_too_large');
            }
            if ($ok === false) {
                throw new RuntimeException('ncsc_http_request_failed');
            }
            $this->assertAllowedUrl($effectiveUrl);
            return ['status' => $status, 'body' => $body, 'url' => $effectiveUrl];
        } finally {
            curl_close($handle);
        }
    }

    /** @return array{status: int, body: string, url: string} */
    private function fetchWithStreams(string $url, int $redirects = 0): array
    {
        if ($redirects > 3) {
            throw new RuntimeException('ncsc_http_too_many_redirects');
        }
        $context = stream_context_create(['http' => [
            'method' => 'GET',
            'header' => "User-Agent: " . self::USER_AGENT . "\r\nAccept: application/rss+xml, application/xml, text/html;q=0.9\r\n",
            'timeout' => 25,
            'ignore_errors' => true,
            'follow_location' => 0,
        ]]);
        $body = file_get_contents($url, false, $context, 0, self::MAX_BYTES + 1);
        if ($body === false) {
            throw new RuntimeException('ncsc_http_request_failed');
        }
        if (strlen($body) > self::MAX_BYTES) {
            throw new RuntimeException('ncsc_http_response_too_large');
        }
        $headers = $http_response_header ?? [];
        $status = 0;
        $location = null;
        foreach ($headers as $header) {
            if (preg_match('/^HTTP\/\S+\s+(\d{3})/i', $header, $match) === 1) {
                $status = (int) $match[1];
            }
            if (str_starts_with(strtolower($header), 'location:')) {
                $location = trim(substr($header, 9));
            }
        }
        if ($status >= 300 && $status < 400 && $location !== null) {
            $redirectUrl = $this->absoluteRedirectUrl($url, $location);
            $this->assertAllowedUrl($redirectUrl);
            return $this->fetchWithStreams($redirectUrl, $redirects + 1);
        }
        return ['status' => $status, 'body' => $body, 'url' => $url];
    }

    private function absoluteRedirectUrl(string $baseUrl, string $location): string
    {
        if (str_starts_with($location, 'https://')) {
            return $location;
        }
        $parts = parse_url($baseUrl);
        if (!is_array($parts) || !isset($parts['host'])) {
            throw new RuntimeException('ncsc_redirect_invalid');
        }
        if (str_starts_with($location, '/')) {
            return 'https://' . $parts['host'] . $location;
        }
        $basePath = isset($parts['path']) ? dirname((string) $parts['path']) : '/';
        return 'https://' . $parts['host'] . rtrim(str_replace('\\', '/', $basePath), '/') . '/' . $location;
    }

    private function assertAllowedUrl(string $url): void
    {
        if (!$this->isAllowedUrl($url)) {
            throw new RuntimeException('ncsc_url_not_allowed');
        }
    }

    private function isAllowedUrl(string $url): bool
    {
        $parts = parse_url($url);
        if (!is_array($parts) || strtolower((string) ($parts['scheme'] ?? '')) !== 'https') {
            return false;
        }
        if (isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])) {
            return false;
        }
        return in_array(strtolower((string) ($parts['host'] ?? '')), [
            'www.kyberturvallisuuskeskus.fi',
            'kyberturvallisuuskeskus.fi',
        ], true);
    }

    /** @param list<string> $keywords */
    private static function hasKeyword(string $value, array $keywords): bool
    {
        $normalized = self::lower(self::cleanText($value, PHP_INT_MAX));
        foreach ($keywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return true;
            }
        }
        return false;
    }

    private static function nodeText(?DOMNode $node): string
    {
        return $node === null ? '' : self::cleanText($node->textContent ?? '', PHP_INT_MAX);
    }

    private static function cleanText(string $value, int $maxLength): string
    {
        $cleaned = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $cleaned = trim((string) preg_replace('/\s+/u', ' ', $cleaned));
        if (self::length($cleaned) <= $maxLength) {
            return $cleaned;
        }
        return rtrim(self::substring($cleaned, 0, max(0, $maxLength - 3))) . '...';
    }

    private static function lower(string $value): string
    {
        return function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);
    }

    private static function length(string $value): int
    {
        if (function_exists('mb_strlen')) {
            return mb_strlen($value, 'UTF-8');
        }
        $length = iconv_strlen($value, 'UTF-8');
        return $length === false ? strlen($value) : $length;
    }

    private static function substring(string $value, int $start, int $length): string
    {
        if (function_exists('mb_substr')) {
            return mb_substr($value, $start, $length, 'UTF-8');
        }
        $substring = iconv_substr($value, $start, $length, 'UTF-8');
        return $substring === false ? substr($value, $start, $length) : $substring;
    }
}
