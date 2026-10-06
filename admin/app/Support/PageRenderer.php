<?php

namespace App\Support;

use App\Models\PageBlock;
use Illuminate\Support\Collection;

/**
 * Groups a page's flat, ordered block list into render units: a lone block,
 * or a run of consecutive same-type blocks that share a BlockTypes 'group'
 * wrapper (audience tiles inside one <ol>, resource cards inside one <ul>,
 * ...). Each block stays independently addable/removable/reorderable in the
 * admin; grouping is purely a rendering concern.
 */
class PageRenderer
{
    /** @return array<int, array{type: 'block', block: PageBlock}|array{type: 'group', tag: string, class: string, blocks: array<int, PageBlock>}> */
    public static function groupBlocks(Collection $blocks): array
    {
        $units = [];

        foreach ($blocks as $block) {
            $group = BlockTypes::group($block->block_type);
            $lastUnit = empty($units) ? null : $units[count($units) - 1];

            if ($group && $lastUnit && $lastUnit['type'] === 'group' && $lastUnit['blocks'][0]->block_type === $block->block_type) {
                $units[count($units) - 1]['blocks'][] = $block;

                continue;
            }

            $units[] = $group
                ? ['type' => 'group', 'tag' => $group['tag'], 'class' => $group['class'], 'blocks' => [$block], 'wrap' => BlockTypes::wraps($block->block_type)]
                : ['type' => 'block', 'block' => $block, 'wrap' => BlockTypes::wraps($block->block_type)];
        }

        return $units;
    }
}
