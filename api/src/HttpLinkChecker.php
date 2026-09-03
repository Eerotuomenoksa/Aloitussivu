<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class HttpLinkChecker implements LinkChecker
{
    private const MAX_REDIRECTS = 5;
    private const TOTAL_BUDGET_SECONDS = 15;

    // LC-04: selainmainen tunniste. Aiempi "SeniorinAloitussivu-LinkChecker/1.0" laukaisi
    // WAF-torjunnan; mittaus 30.8.2026 osoitti etta talla muutoksella HTTP 5xx -vastaukset
    // putosivat 26:sta yhteen. Yhteystieto sailytetaan lopussa rehellisyyden vuoksi.
    private const USER_AGENT = 'Mozilla/5.0 (compatible; SeniorinAloitussivu-LinkChecker/2.0; +https://seniorsurf.fi/aloitus/)';

    // LC-07: tunnetut verkkotunnusten myynti- ja parkkipalvelut. Naihin ohjautuva linkki
    // piilotetaan heti, koska statuskoodi ei paljasta niita: sedo.com vastasi 403:lla eli
    // "bottisuojaus, luultavasti kunnossa", vaikka eetu.fi oli myynnissa.
    private const FOR_SALE_HOSTS = [
        'sedo.com', 'dan.com', 'afternic.com', 'hugedomains.com',
        'bodis.com', 'parkingcrew.net', 'catcha.fi', 'undeveloped.com',
    ];
    private const FOR_SALE_PATTERN = '#/verkkotunnukset/|utm_medium=Parking|sales_lander|domain(name)?[-_]?for[-_]?sale#i';

    public function __construct(private readonly int $timeoutSeconds = 5)
    {
    }

    public function check(string $url): LinkCheckResult
    {
        $started = hrtime(true);
        $deadline = $started + self::TOTAL_BUDGET_SECONDS * 1_000_000_000;
        if (!function_exists('curl_init')) {
            return $this->result('failed', null, null, 'curl_unavailable', $started);
        }

        $original = trim($url);
        $current = $original;
        for ($redirects = 0; $redirects <= self::MAX_REDIRECTS; $redirects += 1) {
            $validation = $this->validateTarget($current);
            if ($validation['error'] !== null) {
                $status = $validation['error'] === 'dns_failed' ? 'failed' : 'rejected';
                return $this->result($status, null, $current, $validation['error'], $started, $original);
            }
            $response = $this->attempt($current, $validation['resolve'], $deadline);
            if ($response['error'] !== null) {
                return $this->result('failed', null, $current, $response['error'], $started, $original);
            }

            $status = $response['status'];
            if ($status >= 300 && $status < 400) {
                if ($response['location'] === null) {
                    return $this->result('failed', $status, $current, 'redirect_location_missing', $started, $original);
                }
                if ($redirects === self::MAX_REDIRECTS) {
                    return $this->result('failed', $status, $current, 'too_many_redirects', $started, $original);
                }
                $next = $this->resolveLocation($current, $response['location']);
                if ($next === null) {
                    return $this->result('failed', $status, $current, 'redirect_location_invalid', $started, $original);
                }
                $current = $next;
                continue;
            }

            // LC-07: verkkotunnusten kauppapaikka on aina vika, ei varoitus.
            if ($this->looksLikeDomainForSale($current)) {
                return $this->result('failed', $status, $current, 'domain_for_sale', $started, $original);
            }
            if ($status >= 200 && $status < 300) {
                return $this->result('ok', $status, $current, null, $started, $original);
            }
            if (in_array($status, [401, 403, 405, 417, 429], true)) {
                return $this->result('warning', $status, $current, 'access_limited', $started, $original, $response['retryAfter']);
            }
            // LC-04: 5xx erotellaan 4xx:sta. Huoltokatko ja WAF-torjunta nayttavat molemmat
            // 5xx:lta, kuollut sivu ei — siksi 5xx vaatii useamman toiston ennen piilotusta.
            if ($status >= 500) {
                return $this->result('failed', $status, $current, 'server_error', $started, $original, $response['retryAfter']);
            }
            return $this->result('failed', $status > 0 ? $status : null, $current, 'http_status_error', $started, $original);
        }
        return $this->result('failed', null, $current, 'too_many_redirects', $started, $original);
    }

    /**
     * LC-04: HEAD ensin, ja uusinta GET-pyynnolla kun palvelin torjuu HEADin tai virhesi.
     * Moni palvelin vastaa HEAD-pyyntoon 403/405/501 tai 5xx mutta GET-pyyntoon normaalisti.
     *
     * @param list<string> $resolve
     * @return array{status: int, location: ?string, error: ?string, retryAfter: ?int}
     */
    private function attempt(string $url, array $resolve, int $deadline): array
    {
        $response = $this->request($url, $resolve, true, false, $deadline);
        if ($response['error'] !== null
            || in_array($response['status'], [400, 403, 405, 417, 501], true)
            || $response['status'] >= 500
        ) {
            $retry = $this->request($url, $resolve, false, true, $deadline);
            // Osa palvelimista ei tue Range-otsaketta: yksi yritys ilman sita.
            if ($retry['error'] === null && in_array($retry['status'], [416, 417], true)) {
                $retry = $this->request($url, $resolve, false, false, $deadline);
            }
            // Kaytetaan uusintaa vain jos se onnistui tai HEAD epaonnistui kokonaan.
            if ($retry['error'] === null || $response['error'] !== null) {
                return $retry;
            }
        }
        return $response;
    }

    /** @return array{error: ?string, resolve: list<string>} */
    private function validateTarget(string $url): array
    {
        $parts = parse_url($url);
        if (!is_array($parts) || !isset($parts['scheme'], $parts['host']) || isset($parts['user']) || isset($parts['pass'])) {
            return ['error' => 'url_invalid', 'resolve' => []];
        }
        if (strtolower((string) $parts['scheme']) !== 'https') {
            return ['error' => 'https_required', 'resolve' => []];
        }
        $port = (int) ($parts['port'] ?? 443);
        if ($port !== 443) {
            return ['error' => 'port_not_allowed', 'resolve' => []];
        }
        $host = strtolower(rtrim((string) $parts['host'], '.'));
        if ($host === '' || $host === 'localhost' || str_ends_with($host, '.localhost')) {
            return ['error' => 'host_not_allowed', 'resolve' => []];
        }

        $addresses = [];
        if (filter_var($host, FILTER_VALIDATE_IP) !== false) {
            $addresses[] = $host;
        } else {
            $records = @dns_get_record($host, DNS_A | DNS_AAAA);
            if (!is_array($records)) {
                return ['error' => 'dns_failed', 'resolve' => []];
            }
            foreach ($records as $record) {
                $address = $record['ip'] ?? $record['ipv6'] ?? null;
                if (is_string($address) && !in_array($address, $addresses, true)) {
                    $addresses[] = $address;
                }
            }
        }
        if ($addresses === []) {
            return ['error' => 'dns_failed', 'resolve' => []];
        }
        foreach ($addresses as $address) {
            if (filter_var(
                $address,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
            ) === false) {
                return ['error' => 'address_not_allowed', 'resolve' => []];
            }
        }
        usort($addresses, static fn (string $first, string $second): int => substr_count($first, ':') <=> substr_count($second, ':'));
        $pinned = str_contains($addresses[0], ':') ? '[' . $addresses[0] . ']' : $addresses[0];
        return ['error' => null, 'resolve' => [sprintf('%s:443:%s', $host, $pinned)]];
    }

    /**
     * @param list<string> $resolve
     * @return array{status: int, location: ?string, error: ?string, retryAfter: ?int}
     */
    private function request(string $url, array $resolve, bool $head, bool $useRange, int $deadline): array
    {
        $remainingMs = (int) floor(($deadline - hrtime(true)) / 1_000_000);
        if ($remainingMs <= 0) {
            return ['status' => 0, 'location' => null, 'error' => 'timeout', 'retryAfter' => null];
        }
        $timeoutMs = max(1, min($this->timeoutSeconds * 1000, $remainingMs));
        $location = null;
        $retryAfter = null;
        $handle = curl_init($url);
        if ($handle === false) {
            return ['status' => 0, 'location' => null, 'error' => 'curl_init_failed', 'retryAfter' => null];
        }
        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_NOBODY => $head,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT_MS => min(5000, $timeoutMs),
            CURLOPT_TIMEOUT_MS => $timeoutMs,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_USERAGENT => self::USER_AGENT,
            CURLOPT_HTTPHEADER => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language: fi-FI,fi;q=0.9,sv;q=0.8,en;q=0.7',
            ],
            CURLOPT_RESOLVE => $resolve,
            CURLOPT_RANGE => (!$head && $useRange) ? '0-16383' : null,
            CURLOPT_HEADERFUNCTION => static function ($curl, string $header) use (&$location, &$retryAfter): int {
                if (stripos($header, 'Location:') === 0) {
                    $candidate = trim(substr($header, 9));
                    $location = $candidate !== '' ? $candidate : null;
                } elseif (stripos($header, 'Retry-After:') === 0) {
                    $candidate = trim(substr($header, 12));
                    if (preg_match('/^[0-9]{1,7}$/D', $candidate) === 1) {
                        $seconds = (int) $candidate;
                        // Hyvaksytaan vain jarkeva odotus, enintaan seitseman vuorokautta.
                        $retryAfter = ($seconds > 0 && $seconds <= 604800) ? $seconds : null;
                    }
                }
                return strlen($header);
            },
        ]);
        $body = curl_exec($handle);
        $errno = curl_errno($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        curl_close($handle);
        if ($body === false || $errno !== 0) {
            return ['status' => 0, 'location' => null, 'error' => self::curlErrorCode($errno), 'retryAfter' => null];
        }
        return ['status' => $status, 'location' => $location, 'error' => null, 'retryAfter' => $retryAfter];
    }

    private function looksLikeDomainForSale(string $url): bool
    {
        $host = self::registrableDomain((string) (parse_url($url, PHP_URL_HOST) ?? ''));
        if ($host !== '' && in_array($host, self::FOR_SALE_HOSTS, true)) {
            return true;
        }
        return preg_match(self::FOR_SALE_PATTERN, $url) === 1;
    }

    /** LC-07: rekisteroitava verkkotunnus, esimerkiksi www.kunta.fi -> kunta.fi. */
    private static function registrableDomain(string $host): string
    {
        $host = strtolower(rtrim(trim($host), '.'));
        if ($host === '') {
            return '';
        }
        $parts = array_values(array_filter(explode('.', $host), static fn (string $part): bool => $part !== ''));
        if (count($parts) <= 2) {
            return implode('.', $parts);
        }
        $lastTwo = implode('.', array_slice($parts, -2));
        $twoLevel = ['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'net.au', 'org.au', 'co.nz'];
        return in_array($lastTwo, $twoLevel, true)
            ? implode('.', array_slice($parts, -3))
            : $lastTwo;
    }

    private function resolveLocation(string $base, string $location): ?string
    {
        $location = trim($location);
        if ($location === '' || preg_match('/[\x00-\x20\x7F]/', $location) === 1) {
            return null;
        }
        if (str_starts_with($location, '//')) {
            return 'https:' . $location;
        }
        if (parse_url($location, PHP_URL_SCHEME) !== null) {
            return $location;
        }
        $parts = parse_url($base);
        if (!is_array($parts) || !isset($parts['host'])) {
            return null;
        }
        $origin = 'https://' . $parts['host'];
        if (str_starts_with($location, '/')) {
            return $origin . $location;
        }
        if (str_starts_with($location, '?')) {
            return $origin . ($parts['path'] ?? '/') . $location;
        }
        $path = (string) ($parts['path'] ?? '/');
        $directory = str_ends_with($path, '/') ? $path : dirname($path) . '/';
        $segments = [];
        foreach (explode('/', $directory . $location) as $segment) {
            if ($segment === '' || $segment === '.') continue;
            if ($segment === '..') {
                array_pop($segments);
                continue;
            }
            $segments[] = $segment;
        }
        return $origin . '/' . implode('/', $segments);
    }

    private function result(
        string $status,
        ?int $httpStatus,
        ?string $finalUrl,
        ?string $error,
        int $started,
        ?string $originalUrl = null,
        ?int $retryAfter = null,
    ): LinkCheckResult {
        $domainChanged = false;
        if ($originalUrl !== null && $finalUrl !== null) {
            $from = self::registrableDomain((string) (parse_url($originalUrl, PHP_URL_HOST) ?? ''));
            $to = self::registrableDomain((string) (parse_url($finalUrl, PHP_URL_HOST) ?? ''));
            $domainChanged = $from !== '' && $to !== '' && $from !== $to;
        }
        return new LinkCheckResult(
            $status,
            $httpStatus,
            $finalUrl,
            $error,
            max(0, (int) round((hrtime(true) - $started) / 1_000_000)),
            $domainChanged,
            $retryAfter,
        );
    }

    private static function curlErrorCode(int $errno): string
    {
        if ($errno === CURLE_OPERATION_TIMEDOUT) {
            return 'timeout';
        }
        if ($errno === CURLE_COULDNT_RESOLVE_HOST) {
            return 'dns_failed';
        }
        if ($errno === CURLE_COULDNT_CONNECT) {
            return 'connection_failed';
        }

        // libcurl renamed error 60 to CURLE_PEER_FAILED_VERIFICATION, but some
        // PHP/cURL builds expose only one of its older aliases. Referencing the
        // missing constant directly causes a fatal Error while handling the
        // original TLS failure and turns the whole run into link_check_job_failed.
        // Error 60 is stable in libcurl even when PHP exposes none of the
        // corresponding symbolic aliases.
        $tlsErrors = [CURLE_SSL_CONNECT_ERROR, 60];
        foreach (['CURLE_PEER_FAILED_VERIFICATION', 'CURLE_SSL_PEER_CERTIFICATE', 'CURLE_SSL_CACERT'] as $constant) {
            if (defined($constant)) {
                $tlsErrors[] = (int) constant($constant);
            }
        }
        return in_array($errno, $tlsErrors, true) ? 'tls_failed' : 'request_failed';
    }

    /**
     * Check multiple URLs in parallel using curl_multi while retaining the
     * validation, redirect and HEAD/GET retry rules of check().
     *
     * @param list<string> $urls
     * @param int $deadline hrtime(true) deadline
     * @param int $concurrency Number of parallel connections (3-5)
     * @return array<string, LinkCheckResult>
     */
    public function checkBatch(array $urls, int $deadline, int $concurrency = 3): array
    {
        if (!function_exists('curl_multi_init') || !function_exists('curl_multi_exec')) {
            $results = [];
            foreach ($urls as $url) {
                if (hrtime(true) >= $deadline) {
                    break;
                }
                $results[$url] = $this->check($url);
            }
            return $results;
        }

        $multi = curl_multi_init();
        if ($multi === false) {
            $results = [];
            foreach ($urls as $url) {
                if (hrtime(true) >= $deadline) {
                    break;
                }
                $results[$url] = $this->check($url);
            }
            return $results;
        }

        $concurrency = max(1, min(5, $concurrency));
        $results = [];
        $states = [];
        $queue = [];
        foreach ($urls as $urlIndex => $url) {
            if (hrtime(true) >= $deadline) {
                break;
            }
            $original = trim((string) $url);
            $started = hrtime(true);
            $validation = $this->validateTarget($original);
            if ($validation['error'] !== null) {
                $status = $validation['error'] === 'dns_failed' ? 'failed' : 'rejected';
                $results[$url] = $this->result(
                    $status,
                    null,
                    $original,
                    $validation['error'],
                    $started,
                    $original,
                );
                continue;
            }
            $states[$urlIndex] = [
                'url' => (string) $url,
                'original' => $original,
                'current' => $original,
                'resolve' => $validation['resolve'],
                'redirects' => 0,
                'started' => $started,
                'attempt' => 'head',
                'useRange' => false,
                'fallbackResponse' => null,
            ];
            $queue[] = $urlIndex;
        }

        /** @var array<int, array{state:int, handle:mixed, headers:\stdClass}> $active */
        $active = [];
        while ($queue !== [] || $active !== []) {
            while (count($active) < $concurrency && $queue !== []) {
                if (hrtime(true) >= $deadline) {
                    $queue = [];
                    break;
                }
                $stateIndex = array_shift($queue);
                $state = $states[$stateIndex];
                $prepared = $this->initBatchHandle($state, $deadline);
                if ($prepared === null) {
                    $results[$state['url']] = $this->result(
                        'failed',
                        null,
                        $state['current'],
                        'curl_init_failed',
                        $state['started'],
                        $state['original'],
                    );
                    continue;
                }
                $handle = $prepared['handle'];
                curl_multi_add_handle($multi, $handle);
                $active[(int) $handle] = [
                    'state' => $stateIndex,
                    'handle' => $handle,
                    'headers' => $prepared['headers'],
                ];
            }

            if ($active === []) {
                continue;
            }
            if (hrtime(true) >= $deadline) {
                foreach ($active as $entry) {
                    $state = $states[$entry['state']];
                    curl_multi_remove_handle($multi, $entry['handle']);
                    curl_close($entry['handle']);
                    $results[$state['url']] = $this->result(
                        'failed',
                        null,
                        $state['current'],
                        'timeout',
                        $state['started'],
                        $state['original'],
                    );
                }
                $active = [];
                $queue = [];
                break;
            }

            do {
                $multiResult = curl_multi_exec($multi, $running);
            } while ($multiResult === CURLM_CALL_MULTI_PERFORM);

            if ($multiResult !== CURLM_OK) {
                foreach ($active as $entry) {
                    $state = $states[$entry['state']];
                    curl_multi_remove_handle($multi, $entry['handle']);
                    curl_close($entry['handle']);
                    $results[$state['url']] = $this->result(
                        'failed',
                        null,
                        $state['current'],
                        'request_failed',
                        $state['started'],
                        $state['original'],
                    );
                }
                $active = [];
                $queue = [];
                break;
            }

            while ($info = curl_multi_info_read($multi)) {
                $handle = $info['handle'];
                $handleKey = (int) $handle;
                if (!isset($active[$handleKey])) {
                    continue;
                }
                $entry = $active[$handleKey];
                $stateIndex = $entry['state'];
                $state = $states[$stateIndex];
                $errorNumber = curl_errno($handle);
                if ($errorNumber === 0 && (int) ($info['result'] ?? CURLE_OK) !== CURLE_OK) {
                    $errorNumber = (int) $info['result'];
                }
                $response = [
                    'status' => (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE),
                    'location' => $entry['headers']->location,
                    'error' => $errorNumber === 0 ? null : self::curlErrorCode($errorNumber),
                    'retryAfter' => $entry['headers']->retryAfter,
                ];
                curl_multi_remove_handle($multi, $handle);
                curl_close($handle);
                unset($active[$handleKey]);

                $result = $this->advanceBatchState($state, $response);
                $states[$stateIndex] = $state;
                if ($result !== null) {
                    $results[$state['url']] = $result;
                } elseif (hrtime(true) < $deadline) {
                    $queue[] = $stateIndex;
                } else {
                    $results[$state['url']] = $this->result(
                        'failed',
                        null,
                        $state['current'],
                        'timeout',
                        $state['started'],
                        $state['original'],
                    );
                }
            }

            if ($active !== [] && $multiResult === CURLM_OK) {
                $selected = curl_multi_select($multi, 0.1);
                if ($selected === -1) {
                    usleep(1000);
                }
            }
        }

        foreach ($active as $entry) {
            curl_multi_remove_handle($multi, $entry['handle']);
            curl_close($entry['handle']);
        }
        curl_multi_close($multi);
        return $results;
    }

    /**
     * @param array{current:string, resolve:list<string>, attempt:string, useRange:bool} $state
     * @return array{handle:mixed, headers:\stdClass}|null
     */
    private function initBatchHandle(array $state, int $deadline): ?array
    {
        $remainingMs = (int) floor(($deadline - hrtime(true)) / 1_000_000);
        if ($remainingMs <= 0) {
            return null;
        }
        $handle = curl_init($state['current']);
        if ($handle === false) {
            return null;
        }
        $headers = new \stdClass();
        $headers->location = null;
        $headers->retryAfter = null;
        $timeoutMs = max(1, min($this->timeoutSeconds * 1000, $remainingMs));
        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_NOBODY => $state['attempt'] === 'head',
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT_MS => min(5000, $timeoutMs),
            CURLOPT_TIMEOUT_MS => $timeoutMs,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_USERAGENT => self::USER_AGENT,
            CURLOPT_HTTPHEADER => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language: fi-FI,fi;q=0.9,sv;q=0.8,en;q=0.7',
            ],
            CURLOPT_RESOLVE => $state['resolve'],
            CURLOPT_RANGE => $state['useRange'] ? '0-16383' : null,
            CURLOPT_HEADERFUNCTION => static function ($curl, string $header) use ($headers): int {
                if (stripos($header, 'Location:') === 0) {
                    $candidate = trim(substr($header, 9));
                    $headers->location = $candidate !== '' ? $candidate : null;
                } elseif (stripos($header, 'Retry-After:') === 0) {
                    $candidate = trim(substr($header, 12));
                    if (preg_match('/^[0-9]{1,7}$/D', $candidate) === 1) {
                        $seconds = (int) $candidate;
                        $headers->retryAfter = ($seconds > 0 && $seconds <= 604800) ? $seconds : null;
                    }
                }
                return strlen($header);
            },
        ]);
        return ['handle' => $handle, 'headers' => $headers];
    }

    /**
     * @param array{current:string, original:string, redirects:int, attempt:string, useRange:bool, fallbackResponse:array<string,mixed>|null, started:int} $state
     * @param array{status:int, location:?string, error:?string, retryAfter:?int} $response
     */
    private function advanceBatchState(array &$state, array $response): ?LinkCheckResult
    {
        if ($state['attempt'] === 'head'
            && ($response['error'] !== null
                || in_array($response['status'], [400, 403, 405, 417, 501], true)
                || $response['status'] >= 500)
        ) {
            $state['fallbackResponse'] = $response['error'] === null ? $response : null;
            $state['attempt'] = 'get-range';
            $state['useRange'] = true;
            return null;
        }
        if ($state['attempt'] === 'get-range'
            && $response['error'] === null
            && in_array($response['status'], [416, 417], true)
        ) {
            $state['attempt'] = 'get-full';
            $state['useRange'] = false;
            return null;
        }

        if ($response['error'] !== null && $state['fallbackResponse'] !== null) {
            /** @var array{status:int, location:?string, error:?string, retryAfter:?int} $response */
            $response = $state['fallbackResponse'];
        }
        $state['fallbackResponse'] = null;
        if ($response['error'] !== null) {
            return $this->result(
                'failed',
                null,
                $state['current'],
                $response['error'],
                $state['started'],
                $state['original'],
            );
        }

        $status = $response['status'];
        if ($status >= 300 && $status < 400) {
            if ($response['location'] === null) {
                return $this->result('failed', $status, $state['current'], 'redirect_location_missing', $state['started'], $state['original']);
            }
            if ($state['redirects'] >= self::MAX_REDIRECTS) {
                return $this->result('failed', $status, $state['current'], 'too_many_redirects', $state['started'], $state['original']);
            }
            $next = $this->resolveLocation($state['current'], $response['location']);
            if ($next === null) {
                return $this->result('failed', $status, $state['current'], 'redirect_location_invalid', $state['started'], $state['original']);
            }
            $validation = $this->validateTarget($next);
            if ($validation['error'] !== null) {
                $error = $validation['error'];
                $statusName = $error === 'dns_failed' ? 'failed' : 'rejected';
                return $this->result($statusName, null, $next, $error, $state['started'], $state['original']);
            }
            $state['current'] = $next;
            $state['resolve'] = $validation['resolve'];
            $state['redirects'] += 1;
            $state['attempt'] = 'head';
            $state['useRange'] = false;
            return null;
        }
        if ($this->looksLikeDomainForSale($state['current'])) {
            return $this->result('failed', $status, $state['current'], 'domain_for_sale', $state['started'], $state['original']);
        }
        if ($status >= 200 && $status < 300) {
            return $this->result('ok', $status, $state['current'], null, $state['started'], $state['original']);
        }
        if (in_array($status, [401, 403, 405, 417, 429], true)) {
            return $this->result('warning', $status, $state['current'], 'access_limited', $state['started'], $state['original'], $response['retryAfter']);
        }
        if ($status >= 500) {
            return $this->result('failed', $status, $state['current'], 'server_error', $state['started'], $state['original'], $response['retryAfter']);
        }
        return $this->result('failed', $status > 0 ? $status : null, $state['current'], 'http_status_error', $state['started'], $state['original']);
    }
}
