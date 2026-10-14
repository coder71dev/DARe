<?php

use App\Models\PageBlock;
use Illuminate\Database\Migrations\Migration;

/**
 * Backfills three more diagram_chrome fields onto the row the earlier
 * migration already seeded (immutable now, so this can't just edit it):
 * the guide body's opening/closing instruction sentences, and the
 * "Take me to the Handbook" link text — all previously hardcoded, with no
 * editing path at all.
 */
return new class extends Migration
{
    public function up(): void
    {
        $block = PageBlock::where('block_type', 'diagram_chrome')->first();

        $block?->update(['props' => [
            ...$block->props,
            'guide_body_intro' => 'Click any box or label to see its full detail.',
            'guide_body_outro' => 'Drag (or swipe on mobile) to pan around, and use the zoom controls to fit the whole diagram on screen.',
            'handbook_link_text' => "Take me to the Handbook \u{2192}",
        ]]);
    }

    public function down(): void
    {
        $block = PageBlock::where('block_type', 'diagram_chrome')->first();

        if ($block) {
            $props = $block->props;
            unset($props['guide_body_intro'], $props['guide_body_outro'], $props['handbook_link_text']);
            $block->update(['props' => $props]);
        }
    }
};
