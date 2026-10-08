<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageRequest;
use App\Http\Requests\UpdatePageNavRequest;
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
        $pages = Page::orderBy('title')
            ->paginate(15, ['id', 'slug', 'title', 'status', 'show_in_nav', 'nav_order'])
            ->withQueryString()
            ->through(fn (Page $page) => [
                ...$page->toArray(),
                'public_url' => $page->publicUrl(),
                'nav_toggleable' => ! in_array($page->slug, Page::NON_TOGGLEABLE_NAV_SLUGS, strict: true),
            ]);

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

    public function updateNavVisibility(UpdatePageNavRequest $request, Page $page): RedirectResponse
    {
        $showInNav = $request->boolean('show_in_nav');

        // Keeps whatever position it last held if it's shown again later,
        // rather than every re-enabled page jumping to the back of the nav.
        $navOrder = $showInNav && $page->nav_order === null
            ? (Page::max('nav_order') ?? 0) + 1
            : $page->nav_order;

        $page->update(['show_in_nav' => $showInNav, 'nav_order' => $navOrder]);

        return back()->with('status', $showInNav ? "\"{$page->title}\" added to the header nav." : "\"{$page->title}\" removed from the header nav.");
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return redirect()->route('admin.pages.index')->with('status', 'Page deleted.');
    }
}
