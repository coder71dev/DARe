<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The DARe Handbook has moved from its temporary preview site to its final
 * home (Nov 2026). Repoints any page block still linking to the old preview
 * address; a block an admin already changed to something else is left alone.
 */
return new class extends Migration
{
    private const OLD_URL = 'https://dare-private.netlify.app';

    private const NEW_URL = 'https://handbook.dare.ac.uk';

    public function up(): void
    {
        $this->replaceLinkHref(self::OLD_URL, self::NEW_URL);
    }

    public function down(): void
    {
        $this->replaceLinkHref(self::NEW_URL, self::OLD_URL);
    }

    private function replaceLinkHref(string $from, string $to): void
    {
        DB::table('page_blocks')->where('props', 'like', '%link_href%')->orderBy('id')->each(function (object $block) use ($from, $to) {
            $props = json_decode($block->props ?? '{}', associative: true) ?? [];

            if (($props['link_href'] ?? null) !== $from) {
                return;
            }

            $props['link_href'] = $to;

            DB::table('page_blocks')->where('id', $block->id)->update(['props' => json_encode($props)]);
        });
    }
};
