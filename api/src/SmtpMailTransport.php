<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use RuntimeException;

final class SmtpMailTransport implements MailTransport
{
    private const TIMEOUT_SECONDS = 20;

    /** @var resource|null */
    private $stream = null;

    public function __construct(private readonly Config $config)
    {
        if (!$config->notificationEnabled) {
            throw new RuntimeException('notifications_disabled');
        }
    }

    public function send(MailMessage $message): void
    {
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
                'allow_self_signed' => false,
                'peer_name' => $this->config->smtpHost,
                'SNI_enabled' => true,
            ],
        ]);
        $errorCode = 0;
        $errorMessage = '';
        $stream = @stream_socket_client(
            sprintf('tcp://%s:%d', $this->config->smtpHost, $this->config->smtpPort),
            $errorCode,
            $errorMessage,
            self::TIMEOUT_SECONDS,
            STREAM_CLIENT_CONNECT,
            $context,
        );
        if (!is_resource($stream)) {
            throw new RuntimeException('smtp_connect_failed');
        }
        $this->stream = $stream;
        stream_set_timeout($stream, self::TIMEOUT_SECONDS);

        try {
            $this->expect([220], 'smtp_connect_failed');
            $this->command('EHLO seniorsurf.fi', [250], 'smtp_ehlo_failed');
            $this->command('STARTTLS', [220], 'smtp_tls_failed');
            if (@stream_socket_enable_crypto($stream, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) !== true) {
                throw new RuntimeException('smtp_tls_failed');
            }
            $this->command('EHLO seniorsurf.fi', [250], 'smtp_ehlo_failed');
            $credentials = base64_encode("\0{$this->config->smtpUsername}\0{$this->config->smtpPassword}");
            $this->command('AUTH PLAIN ' . $credentials, [235], 'smtp_auth_failed');
            $this->command('MAIL FROM:<' . $this->config->mailFromAddress . '>', [250], 'smtp_sender_rejected');
            $this->command('RCPT TO:<' . $this->config->notificationRecipient . '>', [250, 251], 'smtp_recipient_rejected');
            $this->command('DATA', [354], 'smtp_data_rejected');
            $this->write($this->dotStuff($this->render($message)) . "\r\n.\r\n", 'smtp_send_failed');
            $this->expect([250], 'smtp_send_failed');
            try {
                $this->command('QUIT', [221], 'smtp_quit_failed');
            } catch (RuntimeException) {
                // The message was already accepted; a failed QUIT must not enqueue a duplicate.
            }
        } finally {
            fclose($stream);
            $this->stream = null;
        }
    }

    public function render(MailMessage $message): string
    {
        $boundary = '=_aloitussivu_' . bin2hex(random_bytes(12));
        $messageId = bin2hex(random_bytes(16)) . '@seniorsurf.fi';
        $headers = [
            'Date: ' . gmdate('D, d M Y H:i:s O'),
            'Message-ID: <' . $messageId . '>',
            'From: ' . $this->encodedHeader($this->config->mailFromName) . ' <' . $this->config->mailFromAddress . '>',
            'To: <' . $this->config->notificationRecipient . '>',
            'Subject: ' . $this->encodedHeader($message->subject),
            'MIME-Version: 1.0',
            'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        ];
        $parts = [
            '--' . $boundary,
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
            '',
            rtrim(chunk_split(base64_encode($this->normalizeNewlines($message->textBody)), 76, "\r\n")),
            '--' . $boundary,
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
            '',
            rtrim(chunk_split(base64_encode($this->normalizeNewlines($message->htmlBody)), 76, "\r\n")),
            '--' . $boundary . '--',
        ];
        return implode("\r\n", [...$headers, '', ...$parts]);
    }

    private function command(string $command, array $expectedCodes, string $error): void
    {
        if (preg_match('/[\r\n]/', $command) === 1) {
            throw new RuntimeException('smtp_command_invalid');
        }
        $this->write($command . "\r\n", $error);
        $this->expect($expectedCodes, $error);
    }

    /** @param list<int> $expectedCodes */
    private function expect(array $expectedCodes, string $error): void
    {
        if (!is_resource($this->stream)) {
            throw new RuntimeException($error);
        }
        $code = 0;
        $completed = false;
        for ($lines = 0; $lines < 100; $lines++) {
            $line = fgets($this->stream, 2048);
            if (!is_string($line)) {
                throw new RuntimeException($error);
            }
            if (preg_match('/^(\d{3})([ -])/', $line, $match) !== 1) {
                throw new RuntimeException($error);
            }
            $code = (int) $match[1];
            if ($match[2] === ' ') {
                $completed = true;
                break;
            }
        }
        if (!$completed || !in_array($code, $expectedCodes, true)) {
            throw new RuntimeException($error);
        }
        $metadata = stream_get_meta_data($this->stream);
        if (($metadata['timed_out'] ?? false) === true) {
            throw new RuntimeException($error);
        }
    }

    private function write(string $value, string $error): void
    {
        if (!is_resource($this->stream)) {
            throw new RuntimeException($error);
        }
        $remaining = $value;
        while ($remaining !== '') {
            $written = fwrite($this->stream, $remaining);
            if (!is_int($written) || $written < 1) {
                throw new RuntimeException($error);
            }
            $remaining = substr($remaining, $written);
        }
    }

    private function dotStuff(string $message): string
    {
        return preg_replace('/(^|\r\n)\./', '$1..', $message) ?? $message;
    }

    private function encodedHeader(string $value): string
    {
        if ($value === '' || preg_match('/[\r\n]/', $value) === 1) {
            throw new RuntimeException('smtp_header_invalid');
        }
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }

    private function normalizeNewlines(string $value): string
    {
        return preg_replace('/\r\n|\r|\n/', "\r\n", $value) ?? $value;
    }
}
