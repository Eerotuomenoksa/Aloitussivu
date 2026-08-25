<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

final class AdminAuthenticator
{
    public function __construct(
        private readonly DatabaseConnection $database,
        private readonly IdTokenVerifier $tokenVerifier,
        private readonly string $tokenHeader = 'authorization',
        private readonly bool $includeFailureDetails = false,
    ) {
    }

    public function authenticate(Request $request, bool $writeAccess = false): AdminUser
    {
        $authorization = $request->header($this->tokenHeader);
        if (preg_match('/^Bearer ([^\s,]+)$/Di', $authorization, $matches) !== 1) {
            throw new ApiException(
                401,
                'authentication_required',
                'Ylläpidon kirjautuminen vaaditaan.',
                headers: ['WWW-Authenticate' => 'Bearer realm="aloitussivu-admin"'],
            );
        }

        $identity = $this->tokenVerifier->verify($matches[1]);
        $row = $this->database->fetchOne(
            'SELECT firebase_uid, email, role, active FROM admin_users WHERE firebase_uid = :uid LIMIT 1',
            ['uid' => $identity->uid],
        );
        $role = is_array($row) ? (string) ($row['role'] ?? '') : '';
        $emailMatches = $identity->email !== ''
            && strcasecmp((string) ($row['email'] ?? ''), $identity->email) === 0;
        $uidIsAuthorized = $row !== null
            && (int) ($row['active'] ?? 0) === 1
            && in_array($role, ['viewer', 'editor', 'admin'], true);
        if (
            !$uidIsAuthorized
        ) {
            throw new ApiException(
                403,
                'admin_forbidden',
                'Ylläpito-oikeutta ei ole.',
                $this->includeFailureDetails ? [
                    'row_found' => $row !== null,
                    'active' => (int) ($row['active'] ?? 0) === 1,
                    'role_allowed' => in_array($role, ['viewer', 'editor', 'admin'], true),
                    'email_present' => $identity->email !== '',
                    'email_verified' => $identity->emailVerified,
                    'email_matches' => $emailMatches,
                    'provider_google' => $identity->signInProvider === 'google.com',
                    'uid_authorized' => $uidIsAuthorized,
                ] : [],
            );
        }
        if ($writeAccess && !in_array($role, ['editor', 'admin'], true)) {
            throw new ApiException(403, 'insufficient_role', 'Rooli ei salli muutosta.');
        }

        return new AdminUser($identity->uid, (string) $row['email'], $role);
    }
}
