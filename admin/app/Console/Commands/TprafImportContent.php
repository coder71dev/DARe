<?php

namespace App\Console\Commands;

use App\Models\TprafDspImp;
use App\Models\TprafElement;
use App\Models\TprafLesson;
use App\Models\TprafView;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * One-time Phase 1 migration tool: reads the JSON dumped from the static
 * site's content.js (via scripts/dump-content.js) and inserts it into the
 * tpraf_views / tpraf_elements / tpraf_dsp_imp / tpraf_lessons tables.
 *
 * A view's row-only fields (title, subtitle, next, status, scale) are pulled
 * out explicitly; whatever's left on the view object (containers, arrows,
 * elbowPaths, feedbackPaths, curvedPaths, tour, legend) is dev-maintained
 * geometry the admin UI never edits, so it's kept verbatim in one JSON blob
 * rather than decomposed into columns.
 */
#[Signature('tpraf:import-content {path=storage/app/import/tpraf-content.json}')]
#[Description('Import the dumped content.js JSON into the database (Phase 1 migration).')]
class TprafImportContent extends Command
{
    /** Fields pulled onto tpraf_views columns rather than left in the geometry blob. */
    private const VIEW_COLUMN_KEYS = ['title', 'subtitle', 'next', 'status', 'scale', 'boxes', 'labels', 'headings', 'lesson'];

    /** Fields pulled onto tpraf_elements columns rather than left in the layout blob. */
    private const ELEMENT_COLUMN_KEYS = ['id', 'label', 'text', 'isPlaceholder', 'handbookUrl'];

    public function handle(): int
    {
        $path = $this->argument('path');
        $fullPath = str_starts_with($path, '/') || preg_match('/^[A-Za-z]:/', $path)
            ? $path
            : base_path($path);

        if (! file_exists($fullPath)) {
            $this->error("No such file: {$fullPath}. Run `node scripts/dump-content.js` first.");

            return self::FAILURE;
        }

        $data = json_decode(file_get_contents($fullPath), associative: true, flags: JSON_THROW_ON_ERROR);

        DB::transaction(function () use ($data) {
            foreach ($data['content'] as $viewKey => $view) {
                $this->importView($viewKey, $view);
            }

            foreach ($data['dspImp'] as $key => $entry) {
                TprafDspImp::updateOrCreate(
                    ['key' => $key],
                    ['title' => $entry['title'] ?? '', 'text' => $entry['text'] ?? ''],
                );
            }
        });

        $this->info('Import complete: '.count($data['content']).' views, '.count($data['dspImp']).' dsp/imp entries.');

        return self::SUCCESS;
    }

    private function importView(string $viewKey, array $view): void
    {
        $next = $view['next'] ?? null;

        $tprafView = TprafView::updateOrCreate(
            ['key' => $viewKey],
            [
                'title' => $view['title'] ?? $viewKey,
                'subtitle' => $view['subtitle'] ?? null,
                'next_view_key' => $next['key'] ?? null,
                'next_view_label' => $next['label'] ?? null,
                'status' => $view['status'] ?? null,
                'scale' => $view['scale'] ?? 1,
                'geometry' => array_diff_key($view, array_flip(self::VIEW_COLUMN_KEYS)),
            ],
        );

        // Clean re-import: elements/lesson are fully replaced from the source file.
        $tprafView->elements()->delete();

        foreach (['box' => 'boxes', 'label' => 'labels', 'heading' => 'headings'] as $type => $jsonKey) {
            foreach ($view[$jsonKey] ?? [] as $entry) {
                TprafElement::create([
                    'view_id' => $tprafView->id,
                    'type' => $type,
                    'element_key' => $entry['id'],
                    'label' => $entry['label'] ?? null,
                    'text' => $entry['text'] ?? null,
                    'is_placeholder' => $entry['isPlaceholder'] ?? false,
                    'handbook_url' => $entry['handbookUrl'] ?? null,
                    'layout' => array_diff_key($entry, array_flip(self::ELEMENT_COLUMN_KEYS)),
                ]);
            }
        }

        if ($lesson = $view['lesson'] ?? null) {
            TprafLesson::updateOrCreate(
                ['view_id' => $tprafView->id],
                [
                    'click_starts_tour' => $lesson['clickStartsTour'] ?? false,
                    'intro_title' => $lesson['intro']['title'] ?? null,
                    'intro_text' => $lesson['intro']['text'] ?? null,
                    'outro_title' => $lesson['outro']['title'] ?? null,
                    'outro_text' => $lesson['outro']['text'] ?? null,
                    'outro_links' => $lesson['outro']['links'] ?? null,
                    'stages' => $lesson['stages'] ?? null,
                    'steps' => $lesson['steps'] ?? null,
                ],
            );
        }
    }
}
