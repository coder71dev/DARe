<?php

namespace App\Support;

class Markup
{
    /**
     * Splits a block's plain-text "body" field (blank line between
     * paragraphs) into an array of paragraph strings, for Blade partials to
     * print as separate <p> tags.
     *
     * @return array<int, string>
     */
    public static function paragraphs(?string $text): array
    {
        if (! $text) {
            return [];
        }

        return array_values(array_filter(array_map('trim', preg_split('/\n\s*\n/', $text))));
    }

    /**
     * Resolves an admin-entered link for an href. A site-relative path
     * ("/diagram#extended") is made absolute against the app's own root, so
     * it still works when the site is served from a sub-folder such as
     * www.dare.ac.uk/tpraf. Full URLs, "#anchors", mailto: and the like are
     * returned unchanged.
     */
    public static function href(?string $link): string
    {
        if ($link === null || $link === '') {
            return '#';
        }

        if (str_starts_with($link, '/') && ! str_starts_with($link, '//')) {
            return rtrim(url('/'), '/').$link;
        }

        return $link;
    }

    /**
     * Renders a paragraph's light inline emphasis (**bold**, *italic*) as
     * HTML. Always call on already-escaped text (e.g. `Markup::inline(e($p))`)
     * — this only ever inserts <strong>/<em> tags around the given text, it
     * never un-escapes anything the text itself contains.
     */
    public static function inline(string $escapedText): string
    {
        $text = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $escapedText);

        return preg_replace('/\*(.+?)\*/s', '<em>$1</em>', $text);
    }
}
