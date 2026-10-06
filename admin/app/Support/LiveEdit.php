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
     * into the raw text it was stored as, when reconstructing an edit group
     * (see live-edit.js): 'plain' (default, no transform needed), 'markdown'
     * (strong/em tags were Markup::inline()'s emphasis markers), or 'br'
     * (br tags were nl2br()'s line break).
     */
    public static function attrs(PageBlock $block, string $field, bool $multiline = false, string $format = 'plain'): string
    {
        if (! self::enabled()) {
            return '';
        }

        $attrs = sprintf('data-live-edit="%d:%s"', $block->id, e($field));

        if ($multiline) {
            $attrs .= ' data-live-edit-multiline';
        }

        if ($format !== 'plain') {
            $attrs .= ' data-live-edit-format="'.e($format).'"';
        }

        return $attrs;
    }
}
