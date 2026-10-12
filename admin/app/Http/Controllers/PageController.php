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
            // Passed here (rather than the layouts.app composer, like
            // navPages/footerBlock) because it's needed inside the page's own
            // content — blocks.diagram-embed and partials.diagram-guide —
            // not just the layout's own header/footer markup.
            'diagramChromeBlock' => Page::systemBlock('diagram_chrome'),
        ]);
    }
}
