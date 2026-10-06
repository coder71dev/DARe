<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TprafElement;
use App\Models\TprafView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagramAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Diagrams/Index', [
            'views' => TprafView::orderBy('id')->get(['key', 'title']),
        ]);
    }

    public function edit(TprafView $view): Response
    {
        return Inertia::render('Admin/Diagrams/Edit', [
            'view' => $view->only(['key', 'title']),
            'elements' => $view->elements()->orderBy('type')->orderBy('id')->get(
                ['id', 'type', 'element_key', 'label', 'text', 'is_placeholder', 'handbook_url']
            ),
        ]);
    }

    public function update(Request $request, TprafElement $element): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:255'],
            'text' => ['nullable', 'string', 'max:5000'],
            'is_placeholder' => ['sometimes', 'boolean'],
            'handbook_url' => ['nullable', 'string', 'max:2048'],
        ]);

        $element->update($validated);

        // The admin editor (Inertia/Vue) relies on the redirect-back response
        // below, but the public diagram's live-edit overlay (plain fetch())
        // needs a real JSON response instead — see the matching fix on
        // PageBlockController::update() for why.
        if ($request->wantsJson()) {
            return response()->json(['status' => 'Saved.']);
        }

        return back()->with('status', 'Saved.');
    }
}
