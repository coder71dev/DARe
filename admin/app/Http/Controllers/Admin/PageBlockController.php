<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePageBlockRequest;
use App\Models\Page;
use App\Models\PageBlock;
use App\Support\BlockTypes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PageBlockController extends Controller
{
    public function store(Request $request, Page $page): RedirectResponse
    {
        $validated = $request->validate([
            'block_type' => ['required', 'string', Rule::in(array_keys(BlockTypes::all()))],
        ]);

        $nextPosition = (int) $page->blocks()->max('position') + 1;

        $page->blocks()->create([
            'block_type' => $validated['block_type'],
            'position' => $nextPosition,
            'props' => [],
        ]);

        return back()->with('status', 'Block added.');
    }

    public function update(UpdatePageBlockRequest $request, PageBlock $block): RedirectResponse
    {
        $validated = $request->validated();

        $block->update([
            'props' => array_merge($block->props ?? [], $validated['props'] ?? []),
            'section_class' => array_key_exists('section_class', $validated) ? $validated['section_class'] : $block->section_class,
            'section_id' => array_key_exists('section_id', $validated) ? $validated['section_id'] : $block->section_id,
        ]);

        return back()->with('status', 'Block saved.');
    }

    public function destroy(PageBlock $block): RedirectResponse
    {
        $block->delete();

        return back()->with('status', 'Block removed.');
    }

    public function reorder(Request $request, Page $page): RedirectResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', Rule::exists('page_blocks', 'id')->where('page_id', $page->id)],
        ]);

        if (count(array_unique($validated['order'])) !== $page->blocks()->count()) {
            throw ValidationException::withMessages(['order' => 'The order must include every block on this page exactly once.']);
        }

        foreach (array_values($validated['order']) as $index => $blockId) {
            PageBlock::whereKey($blockId)->update(['position' => $index + 1]);
        }

        return back()->with('status', 'Order saved.');
    }
}
