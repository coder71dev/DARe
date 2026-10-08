<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePageBlockRequest;
use App\Models\Page;
use App\Models\PageBlock;
use App\Support\BlockTypes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PageBlockController extends Controller
{
    public function store(Request $request, Page $page): RedirectResponse
    {
        $validated = $request->validate([
            'block_type' => ['required', 'string', Rule::in(BlockTypes::addableKeys())],
        ]);

        $nextPosition = (int) $page->blocks()->max('position') + 1;

        $page->blocks()->create([
            'block_type' => $validated['block_type'],
            'position' => $nextPosition,
            'props' => [],
        ]);

        return back()->with('status', 'Block added.');
    }

    public function update(UpdatePageBlockRequest $request, PageBlock $block): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();

        $block->update([
            'props' => array_merge($block->props ?? [], $validated['props'] ?? []),
            'section_class' => array_key_exists('section_class', $validated) ? $validated['section_class'] : $block->section_class,
            'section_id' => array_key_exists('section_id', $validated) ? $validated['section_id'] : $block->section_id,
        ]);

        // The admin editor (Inertia/Vue) relies on the redirect-back response
        // below, but the public pages' live-edit overlay (Phase 3, plain
        // fetch()) needs a real JSON response instead — a redirect's method
        // gets preserved onto whatever page the fetch originated from, which
        // doesn't accept PATCH.
        if ($request->wantsJson()) {
            return response()->json(['status' => 'Block saved.']);
        }

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
            'order.*' => ['integer'],
        ]);

        // One query for every submitted ID (via Rule::exists('order.*')) plus
        // one UPDATE per block, each as its own implicit transaction, was the
        // slow part — on SQLite every one of those is a separate fsync to
        // disk. A single pluck to validate against, plus wrapping the updates
        // in one transaction, turns N+1 round trips (and N fsyncs) into 2.
        $blockIds = $page->blocks()->pluck('id');

        $submitted = collect($validated['order'])->map(fn ($id) => (int) $id);

        if ($submitted->sort()->values()->all() !== $blockIds->sort()->values()->all()) {
            throw ValidationException::withMessages(['order' => 'The order must include every block on this page exactly once.']);
        }

        DB::transaction(function () use ($submitted) {
            foreach ($submitted->values() as $index => $blockId) {
                PageBlock::whereKey($blockId)->update(['position' => $index + 1]);
            }
        });

        return back()->with('status', 'Order saved.');
    }
}
