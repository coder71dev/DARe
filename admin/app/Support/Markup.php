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
}
