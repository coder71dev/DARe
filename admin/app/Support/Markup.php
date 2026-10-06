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
