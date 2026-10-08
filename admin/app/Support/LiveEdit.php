<?php

namespace App\Support;

use App\Models\PageBlock;

/**
 * Marks block fields on the public pages as editable in place for signed-in
 * admins (Phase 3: hover shows a pencil, click edits the field's raw stored
 * text right there, see public/assets/js/live-edit.js). Rendering stays
 * untouched for everyone else — attrs() returns '' when disabled, so the
 * markup is identical to the signed-out page.
 *
 * Off by default even for a signed-in admin just browsing the site — only
 * active once they've entered live-edit mode via the "Live Edit" link on
 * the admin pages list (?edit-mode=1, see SetLiveEditMode), so the editing
 * chrome doesn't clutter every page they happen to visit.
 *
 * Gated to is_admin specifically (not just any authenticated account) so
 * this stays correct if a non-admin role is ever added later.
 */
class LiveEdit
{
    public static function enabled(): bool
    {
        return auth()->check()
            && auth()->user()->is_admin
            && auth()->user()->hasVerifiedEmail()
            && session('live_edit_mode', false);
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

        $attrs = sprintf('data-live-edit="block:%d:%s"', $block->id, e($field));
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

    /**
     * HTML attributes marking an "image" field's rendered element (an <img>,
     * or a background-image div like the hero photo) as live-replaceable —
     * click it in live-edit mode to upload a new file, mirroring the admin
     * form's ImageUploadField. Reuses the same data-live-edit="block:ID:field"
     * attribute as attrs() (so it picks up the same hover/chip/status CSS and
     * JS element matching for free) plus a boolean marker live-edit.js uses
     * to open a file picker instead of a text field on click.
     */
    public static function imageAttrs(PageBlock $block, string $field): string
    {
        if (! self::enabled()) {
            return '';
        }

        $attrs = sprintf('data-live-edit="block:%d:%s"', $block->id, e($field));
        $attrs .= ' data-live-edit-image';
        $attrs .= ' data-live-edit-label="'.e(self::label($block, $field)).'"';

        return $attrs;
    }

    /** The field's admin-form label (BlockTypes), trimmed of its parenthetical hint for the compact chip. */
    private static function label(PageBlock $block, string $field): string
    {
        $label = BlockTypes::fields($block->block_type)[$field]['label'] ?? ucfirst(str_replace('_', ' ', $field));

        return trim(strstr($label, ' (', true) ?: $label);
    }
}
