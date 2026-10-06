<?php

namespace App\Support;

use App\Models\PageBlock;
use Illuminate\Support\Collection;

/**
 * Groups a page's flat, ordered block list into render units, two levels
 * deep:
 *
 * 1. Section bands: consecutive wrapped blocks sharing the same
 *    (section_class, section_id) render inside ONE shared <section> — this
 *    is what lets several different blocks sit together on one coloured
 *    background band, matching the original design, instead of each block
 *    getting its own plain wrapper.
 * 2. Within a band (or standalone), consecutive same-type blocks that
 *    declare a BlockTypes 'group' wrapper (audience tiles inside one <ol>,
 *    resource cards inside one <ul>, ...) still group as before.
 *
 * Every block stays independently addable/removable/reorderable in the
 * admin; all of this is purely a rendering concern.
 */
class PageRenderer
{
    /** @return array<int, array> */
    public static function groupBlocks(Collection $blocks): array
    {
        $sections = [];

        foreach ($blocks as $block) {
            $wraps = BlockTypes::wraps($block->block_type);
            $last = empty($sections) ? null : $sections[count($sections) - 1];

            $sameSection = $wraps
                && $last && $last['type'] === 'section'
                && $last['section_class'] === $block->section_class
                && $last['section_id'] === $block->section_id
                && ($block->section_class !== null || $block->section_id !== null);

            if ($sameSection) {
                $sections[count($sections) - 1]['blocks'][] = $block;

                continue;
            }

            $sections[] = $wraps
                ? ['type' => 'section', 'section_class' => $block->section_class, 'section_id' => $block->section_id, 'blocks' => [$block]]
                : ['type' => 'standalone', 'block' => $block];
        }

        return array_map(function (array $section) {
            if ($section['type'] === 'standalone') {
                return $section;
            }

            $section['units'] = self::groupByType(collect($section['blocks']));

            return $section;
        }, $sections);
    }

    /** @return array<int, array{type: 'block', block: PageBlock}|array{type: 'group', tag: string, class: string, blocks: array<int, PageBlock>}> */
    private static function groupByType(Collection $blocks): array
    {
        $units = [];

        foreach ($blocks as $block) {
            $group = BlockTypes::group($block->block_type);
            $last = empty($units) ? null : $units[count($units) - 1];

            if ($group && $last && $last['type'] === 'group' && $last['blocks'][0]->block_type === $block->block_type) {
                $units[count($units) - 1]['blocks'][] = $block;

                continue;
            }

            $units[] = $group
                ? ['type' => 'group', 'tag' => $group['tag'], 'class' => $group['class'], 'blocks' => [$block]]
                : ['type' => 'block', 'block' => $block];
        }

        return $units;
    }
}
