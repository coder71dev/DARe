<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Support\PageRenderer;
use Illuminate\Contracts\View\View;

class PageController extends Controller
{
    public function show(string $slug): View
    {
        $page = Page::where('slug', $slug)->where('status', 'published')->firstOrFail();

        return view('page', [
            'page' => $page,
            'renderUnits' => PageRenderer::groupBlocks($page->blocks),
        ]);
    }
}
