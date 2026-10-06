<?php

namespace App\Support;

use App\Models\PageBlock;

/**
 * Marks block fields on the public pages as editable in place for signed-in
 * admins (Phase 3: hover shows a pencil, click edits the field's raw stored
 * text right there, see public/assets/js/live-edit.js). Rendering stays
 * untouched for everyone else — attrs() returns '' when disabled, so the
 * markup is identical to the signed-out page.
 */
class LiveEdit
{
    public static function enabled(): bool
    {
        return auth()->check() && auth()->user()->hasVerifiedEmail();
    }

    /**
     * HTML attributes marking a block's field as live-editable. $multiline
     * fields (BlockTypes 'textarea') edit as a <textarea> of the raw stored
     * string; single-line fields edit as an <input type="text">.
     *
     * $format tells the client how to turn this field's rendered HTML back
     * into the raw text it was stored as, and how to re-render it after a
     * save without a page reload (see live-edit.js): 'plain' (default, no
     * transform needed), 'markdown' (strong/em tags are Markup::inline()'s
     * emphasis markers), or 'br' (br tags are nl2br()'s line break).
     *
     * $paragraphs marks a field whose stored value is one blank-line-
     * separated string (Markup::paragraphs()) rendered as several sibling
     * <p> tags sharing this same attrs() call in a loop — rich_text/
     * acknowledgements/research_notice's 'body'. Without it, a multiline
     * field is assumed to render as a single element holding the whole
     * value verbatim.
     */
    public static function attrs(PageBlock $block, string $field, bool $multiline = false, string $format = 'plain', bool $paragraphs = false): string
    {
        if (! self::enabled()) {
            return '';
        }

        $attrs = sprintf('data-live-edit="%d:%s"', $block->id, e($field));
        $attrs .= ' data-live-edit-label="'.e(self::label($block, $field)).'"';

        if ($multiline) {
            $attrs .= ' data-live-edit-multiline';
        }

        if ($format !== 'plain') {
            $attrs .= ' data-live-edit-format="'.e($format).'"';
        }

        if ($paragraphs) {
            $attrs .= ' data-live-edit-paragraphs';
        }

        return $attrs;
    }

    /** The field's admin-form label (BlockTypes), trimmed of its parenthetical hint for the compact chip. */
    private static function label(PageBlock $block, string $field): string
    {
        $label = BlockTypes::fields($block->block_type)[$field]['label'] ?? ucfirst(str_replace('_', ' ', $field));

        return trim(strstr($label, ' (', true) ?: $label);
    }
}
