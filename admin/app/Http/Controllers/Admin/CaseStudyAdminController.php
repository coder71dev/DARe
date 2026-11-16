<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCaseStudyRequest;
use App\Http\Requests\UpdateCaseStudyFieldRequest;
use App\Http\Requests\UpdateCaseStudyRequest;
use App\Models\TprafCaseStudy;
use App\Models\TprafView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The case-study walkthroughs shown on Level 1 Extended: add, edit, reorder,
 * publish or remove them. Each step picks the diagram boxes it lights up.
 */
class CaseStudyAdminController extends Controller
{
    /** Case studies live on Level 1 Extended (DARe, Nov 2026). */
    public const VIEW_KEY = 'extended';

    public function index(): Response
    {
        return Inertia::render('Admin/CaseStudies/Index', [
            'caseStudies' => TprafCaseStudy::query()
                ->orderBy('position')
                ->orderBy('id')
                ->get(['id', 'title', 'position', 'is_published', 'steps'])
                ->map(fn (TprafCaseStudy $caseStudy) => [
                    'id' => $caseStudy->id,
                    'title' => $caseStudy->title,
                    'is_published' => $caseStudy->is_published,
                    'step_count' => count($caseStudy->steps ?? []),
                ]),
        ]);
    }

    public function store(StoreCaseStudyRequest $request): RedirectResponse
    {
        $view = TprafView::where('key', self::VIEW_KEY)->firstOrFail();

        $caseStudy = $view->caseStudies()->create([
            'title' => $request->validated('title'),
            'position' => (int) $view->caseStudies()->max('position') + 1,
            'is_published' => false,
            'steps' => [],
        ]);

        return redirect()->route('admin.case-studies.edit', $caseStudy);
    }

    public function edit(TprafCaseStudy $caseStudy): Response
    {
        return Inertia::render('Admin/CaseStudies/Edit', [
            'caseStudy' => [
                'id' => $caseStudy->id,
                'title' => $caseStudy->title,
                'position' => $caseStudy->position,
                'is_published' => $caseStudy->is_published,
                'intro_text' => $caseStudy->intro_text,
                'steps' => $caseStudy->steps ?? [],
            ],
            'boxes' => $caseStudy->view->elements()
                ->where('type', 'box')
                ->orderBy('id')
                ->get(['element_key', 'label'])
                ->map(fn ($box) => ['key' => $box->element_key, 'label' => str_replace("\n", ' ', (string) $box->label)]),
            'diagramUrl' => route('diagram').'#'.$caseStudy->view->key,
        ]);
    }

    public function update(UpdateCaseStudyRequest $request, TprafCaseStudy $caseStudy): RedirectResponse
    {
        $validated = $request->validated();

        $caseStudy->update([
            'title' => $validated['title'],
            'position' => $validated['position'],
            'is_published' => $validated['is_published'],
            'intro_text' => $validated['intro_text'] ?? null,
            'steps' => collect($validated['steps'] ?? [])
                ->map(fn (array $step) => [
                    'title' => (string) ($step['title'] ?? ''),
                    'text' => (string) ($step['text'] ?? ''),
                    'boxes' => array_values($step['boxes'] ?? []),
                    'images' => collect($step['images'] ?? [])
                        ->map(fn (array $image) => ['src' => $image['src'], 'alt' => (string) ($image['alt'] ?? '')])
                        ->values()
                        ->all(),
                    'caption' => (string) ($step['caption'] ?? ''),
                ])
                ->values()
                ->all(),
        ]);

        return back()->with('status', 'Case study saved.');
    }

    /**
     * One field saved from the public diagram's live-edit overlay (see
     * live-edit.js) — the case-study card's text and pictures, edited in
     * place. JSON in, JSON out, like the other live-edit endpoints.
     */
    public function updateField(UpdateCaseStudyFieldRequest $request, TprafCaseStudy $caseStudy): JsonResponse
    {
        $field = $request->validated('field');
        $value = (string) ($request->validated('value') ?? '');

        if (in_array($field, ['title', 'intro_text'], true)) {
            $caseStudy->update([$field => $field === 'intro_text' && $value === '' ? null : $value]);
        } else {
            $data = ['steps' => $caseStudy->steps ?? []];
            data_set($data, $field, $value);
            $caseStudy->update(['steps' => $data['steps']]);
        }

        return response()->json(['status' => 'Saved.']);
    }

    public function destroy(TprafCaseStudy $caseStudy): RedirectResponse
    {
        $caseStudy->delete();

        return redirect()->route('admin.case-studies.index')->with('status', 'Case study removed.');
    }
}
