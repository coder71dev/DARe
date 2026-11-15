<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Applies DARe's "TPRAF Handbook Cross-links v1" sheet (Nov 2026) where it
 * differs from the links we had matched ourselves. Where the sheet names the
 * same page we already link to a section of (#anchor), the more precise
 * section link is kept.
 *
 * A box is only changed while it still holds our earlier link (or none), so
 * a link an admin has since set by hand is never overwritten.
 */
return new class extends Migration
{
    /** @var list<array{0: string, 1: string, 2: string, 3: string}> view key, element key, previous link, link from the sheet */
    private const CHANGES = [
        ['simple', 'transport-scenarios', '/imp/introduction/transport-scenario', '/imp/transport-demand'],
        ['extended', 'transport-system', '/imp/transport-model', '/imp/transport-demand'],
        ['extended', 'weather-variables', '/imp/introduction/weather-event', '/imp/climate-scenarios/weather-generator'],
        ['dsp', 'dsp-transport-scenarios', '/imp/introduction/transport-scenario', '/imp/transport-demand'],
        ['dsp', 'dsp-c4-heading', '', '/dsp/technical-processes/detailed-option-assessment'],
        ['dsp', 'dsp-funding-budgets', '', '/dsp/decision-support-process'],
        ['dsp', 'dsp-procurement', '', '/dsp/decision-support-process'],
        ['dsp', 'dsp-pm-governance', '', '/dsp/decision-support-process'],
    ];

    public function up(): void
    {
        foreach (self::CHANGES as [$viewKey, $elementKey, $from, $to]) {
            $this->relink($viewKey, $elementKey, $from, $to);
        }
    }

    public function down(): void
    {
        foreach (self::CHANGES as [$viewKey, $elementKey, $from, $to]) {
            $this->relink($viewKey, $elementKey, $to, $from);
        }
    }

    private function relink(string $viewKey, string $elementKey, string $from, string $to): void
    {
        $viewId = DB::table('tpraf_views')->where('key', $viewKey)->value('id');

        if ($viewId === null) {
            return;
        }

        DB::table('tpraf_elements')
            ->where('view_id', $viewId)
            ->where('element_key', $elementKey)
            ->where(fn ($query) => $from === ''
                ? $query->whereNull('handbook_url')->orWhere('handbook_url', '')
                : $query->where('handbook_url', $from))
            ->update(['handbook_url' => $to, 'updated_at' => now()]);
    }
};
