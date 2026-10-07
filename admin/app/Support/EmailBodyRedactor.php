<?php

namespace App\Support;

/**
 * Pulls the one-time temporary password out of an admin-invite email's
 * stored HTML body (see App\Listeners\LogSentEmail and
 * App\Notifications\AdminAccountCreated) so the Email logs admin page can
 * show it behind its own masked, eye-icon-toggled field instead of as
 * permanently-visible plain text inside the rendered email.
 */
class EmailBodyRedactor
{
    private const LABEL = 'Your temporary password is: ';

    /**
     * @return array{0: string, 1: ?string} [body with the password line
     *                                      redacted, the extracted password or null]
     */
    public static function redactTemporaryPassword(string $body): array
    {
        if (! preg_match('/'.preg_quote(self::LABEL, '/').'(.*?)<\/p>/s', $body, $matches)) {
            return [$body, null];
        }

        // The mail template HTML-escapes the password (so e.g. a literal
        // "&" in it became "&amp;") — decode it back to the exact string
        // that was actually hashed and emailed.
        $password = html_entity_decode(trim($matches[1]), ENT_QUOTES | ENT_HTML5);

        $redactedBody = str_replace(
            $matches[0],
            self::LABEL.'(hidden — see the field above)</p>',
            $body
        );

        return [$redactedBody, $password];
    }
}
