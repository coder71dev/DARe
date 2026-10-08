<?php

use App\Models\PageBlock;
use Illuminate\Database\Migrations\Migration;

/**
 * The header/footer logos became live-editable after the create_site_footer_
 * system_block migration already ran, so the row it seeded is missing the
 * two new prop keys — backfills them with today's real logo paths, same as
 * the rest of that block's props, so nothing changes visually.
 */
return new class extends Migration
{
    public function up(): void
    {
        $block = PageBlock::where('block_type', 'site_footer')->first();

        if (! $block) {
            return;
        }

        $block->update(['props' => [
            'header_logo' => 'assets/icons/logo-header.svg',
            ...$block->props,
            'footer_logo' => 'assets/icons/logo-footer.svg',
        ]]);
    }

    public function down(): void
    {
        $block = PageBlock::where('block_type', 'site_footer')->first();

        if (! $block) {
            return;
        }

        $props = $block->props;
        unset($props['header_logo'], $props['footer_logo']);
        $block->update(['props' => $props]);
    }
};
