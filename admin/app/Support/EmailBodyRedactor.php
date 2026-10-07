<?php

namespace App\Support;

/**
 * Wraps the temporary password line of an admin-invite email's stored
 * HTML body (see App\Listeners\LogSentEmail and
 * App\Notifications\AdminAccountCreated) in a masked, eye-icon toggle —
 * right where it already appears in the email — instead of showing it as
 * permanently-visible plain text. No-op for any email without this line.
 *
 * Masking is CSS display:none, the same as a browser's own <input
 * type="password">: it hides the value visually, not from page source —
 * that's the expected behaviour for this pattern, not a gap.
 */
class EmailBodyRedactor
{
    private const LABEL = 'Your temporary password is: ';

    private const EYE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';

    private const EYE_SLASH_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>';

    public static function maskTemporaryPassword(string $body): string
    {
        if (! preg_match('/'.preg_quote(self::LABEL, '/').'(.*?)(?=<\/p>)/s', $body, $matches)) {
            return $body;
        }

        $password = $matches[1];
        $id = 'pw-'.bin2hex(random_bytes(4));

        $toggle = '<span style="white-space:nowrap">'
            .'<span id="'.$id.'-dots" style="font-family:monospace;letter-spacing:2px">••••••••••••••••</span>'
            .'<span id="'.$id.'-plain" style="font-family:monospace;letter-spacing:1px;display:none">'.$password.'</span>'
            .' <button type="button" id="'.$id.'-show" onclick="'
                .'document.getElementById(\''.$id.'-dots\').style.display=\'none\';'
                .'document.getElementById(\''.$id.'-plain\').style.display=\'inline\';'
                .'document.getElementById(\''.$id.'-show\').style.display=\'none\';'
                .'document.getElementById(\''.$id.'-hide\').style.display=\'inline-block\';'
            .'" style="border:none;background:none;cursor:pointer;padding:0 4px;vertical-align:middle;color:#6b7280" aria-label="Show password">'.self::EYE_ICON.'</button>'
            .'<button type="button" id="'.$id.'-hide" onclick="'
                .'document.getElementById(\''.$id.'-dots\').style.display=\'inline\';'
                .'document.getElementById(\''.$id.'-plain\').style.display=\'none\';'
                .'document.getElementById(\''.$id.'-hide\').style.display=\'none\';'
                .'document.getElementById(\''.$id.'-show\').style.display=\'inline-block\';'
            .'" style="display:none;border:none;background:none;cursor:pointer;padding:0 4px;vertical-align:middle;color:#6b7280" aria-label="Hide password">'.self::EYE_SLASH_ICON.'</button>'
            .'</span>';

        return str_replace(self::LABEL.$password, self::LABEL.$toggle, $body);
    }
}
