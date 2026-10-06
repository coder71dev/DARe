<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageRequest;
use App\Http\Requests\UpdatePageRequest;
use App\Models\Page;
use App\Support\BlockTypes;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageAdminController extends Controller
{
    public function index(): Response
    {
        $pages = Page::orderBy('title')->get(['id', 'slug', 'title', 'status'])
            ->map(fn (Page $page) => [...$page->toArray(), 'public_url' => $page->publicUrl()]);

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
        ]);
    }

    public function store(StorePageRequest $request): RedirectResponse
    {
        $page = Page::create($request->validated());

        return redirect()->route('admin.pages.edit', $page);
    }

    public function edit(Page $page): Response
    {
        $blocks = $page->blocks->map(fn ($block) => [
            'id' => $block->id,
            'block_type' => $block->block_type,
            'label' => BlockTypes::label($block->block_type),
            'fields' => BlockTypes::fields($block->block_type),
            'props' => $block->props,
            'position' => $block->position,
            'section_class' => $block->section_class,
            'section_id' => $block->section_id,
        ]);

        return Inertia::render('Admin/Pages/Edit', [
            'page' => $page,
            'blocks' => $blocks,
            'blockTypeOptions' => BlockTypes::options(),
        ]);
    }

    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $page->update($request->validated());

        return back()->with('status', 'Page saved.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return redirect()->route('admin.pages.index')->with('status', 'Page deleted.');
    }
}
