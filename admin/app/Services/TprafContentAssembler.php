<?php

namespace App\Services;

use App\Models\TprafDspImp;
use App\Models\TprafElement;
use App\Models\TprafView;
use Illuminate\Support\Collection;

/**
 * Reshapes the tpraf_views / tpraf_elements / tpraf_lessons / tpraf_dsp_imp
 * rows back into the exact JSON shape content.js's TPRAF_CONTENT /
 * TPRAF_DSP_IMP produce today: {simple:{...}, extended:{...}, ...}.
 *
 * site/assets/js/app.js is kept byte-identical (per site/MIGRATION-NOTES.md)
 * and expects this shape unchanged, so this class is the single place that
 * correctness depends on — verify its output against a snapshot of the live
 * TPRAF_CONTENT rather than trusting it by inspection alone.
 */
class TprafContentAssembler
{
    /** @return array<string, array<string, mixed>> */
    public function assembleContent(): array
    {
        $views = TprafView::with(['elements', 'lesson'])->get()->keyBy('key');

        $assembled = [];

        foreach ($views as $key => $view) {
            $assembled[$key] = $this->assembleView($view);
        }

        return $assembled;
    }

    /** @return array<string, string> */
    public function assembleDspImp(): array
    {
        return TprafDspImp::all()
            ->mapWithKeys(fn (TprafDspImp $row) => [
                $row->key => ['title' => $row->title, 'text' => $row->text],
            ])
            ->all();
    }

    private function assembleView(TprafView $view): array
    {
        // Dev-maintained geometry (containers/arrows/elbowPaths/feedbackPaths/
        // curvedPaths/tour/legend) is kept verbatim from import — it's never
        // edited through the admin UI, so there's nothing to reassemble.
        $data = $view->geometry ?? [];

        $data['title'] = $view->title;

        if ($view->subtitle !== null) {
            $data['subtitle'] = $view->subtitle;
        }

        if ($view->scale !== null && $view->scale != 1.0) {
            $data['scale'] = $view->scale;
        }

        if ($view->next_view_key !== null) {
            $data['next'] = ['key' => $view->next_view_key, 'label' => $view->next_view_label];
        }

        if ($view->status !== null) {
            $data['status'] = $view->status;
        }

        $elementsByType = $view->elements
            ->sortBy('id')
            ->groupBy('type');

        $data['boxes'] = $this->assembleElements($elementsByType->get('box', collect()));

        if ($labels = $elementsByType->get('label')) {
            $data['labels'] = $this->assembleElements($labels);
        }

        if ($headings = $elementsByType->get('heading')) {
            $data['headings'] = $this->assembleElements($headings);
        }

        if ($lesson = $view->lesson) {
            $data['lesson'] = [
                'clickStartsTour' => $lesson->click_starts_tour,
                'stages' => $lesson->stages,
                'intro' => ['title' => $lesson->intro_title, 'text' => $lesson->intro_text],
                'steps' => $lesson->steps,
                'outro' => [
                    'title' => $lesson->outro_title,
                    'text' => $lesson->outro_text,
                    'links' => $lesson->outro_links,
                ],
            ];
        }

        return $data;
    }

    /** @param  Collection<int, TprafElement>  $elements */
    private function assembleElements($elements): array
    {
        return $elements->map(function (TprafElement $element) {
            $entry = $element->layout ?? [];
            $entry['id'] = $element->element_key;

            // Only used by the public diagram's live-edit overlay (see
            // app.js's openModal()) to know which row to save back to —
            // never rendered or exposed as a link, so it's fine to ship to
            // every visitor same as the rest of this JSON blob already is.
            $entry['dbId'] = $element->id;

            if ($element->label !== null) {
                $entry['label'] = $element->label;
            }

            if ($element->text !== null) {
                $entry['text'] = $element->text;
            }

            $entry['isPlaceholder'] = $element->is_placeholder;

            if ($element->handbook_url !== null) {
                $entry['handbookUrl'] = $element->handbook_url;
            }

            return $entry;
        })->values()->all();
    }
}
