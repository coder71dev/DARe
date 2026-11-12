<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * DARe's Level 2 DSP feedback (Nov 2026):
 * - The white boxes are the DSP Modules and get their own key, drawn on the
 *   diagram itself (and repeated in the guide legend).
 * - The dark-blue boxes carried no meaning, so each takes its column's colour.
 * - Column 1's Risk Assessment becomes a white module box.
 * - Column 4's five criteria boxes all butt up against the vertical
 *   Multi-Criteria / Cost Benefit Analysis strip.
 *
 * Layout-only data (variants and positions), so it edits the stored layout
 * JSON in place and leaves any admin-edited labels and popup text untouched.
 */
return new class extends Migration
{
    /** Right edge of the Multi-Criteria strip (left 51.54 + width 2.21). */
    private const STRIP_RIGHT = 53.75;

    /** Right edge every criteria box already shares. */
    private const CRITERIA_RIGHT = 64.77;

    /** @var array<string, string> element_key => new variant */
    private const COLUMN_COLOURS = [
        'dsp-problem-definition' => 'col-c2',
        'dsp-primary-impact-identification' => 'col-c2',
        'dsp-risk-thresholds' => 'col-c3',
        'dsp-option-matrix' => 'col-c3',
        'dsp-multi-criteria-cost-benefit' => 'col-c4',
        'dsp-economic-impact' => 'col-c4',
        'dsp-criteria-xyz' => 'col-c4',
        'dsp-solution-bundling' => 'col-c5',
        'dsp-resource-feasibility' => 'col-c5',
        'dsp-intervention-effectiveness' => 'col-c6',
        'dsp-asset-registry-2' => 'col-c6',
        // Not inside any column: they hang off the green cross-cutting Risk
        // Assessment box, so they take a pale tint of its green.
        'dsp-funding-budgets' => 'leaf-pale',
        'dsp-procurement' => 'leaf-pale',
        'dsp-pm-governance' => 'leaf-pale',
    ];

    /** @var list<string> */
    private const CRITERIA_BOXES = [
        'dsp-asset-performance-2',
        'dsp-resilience-assessment-3',
        'dsp-sustainability-2',
        'dsp-economic-impact',
        'dsp-criteria-xyz',
    ];

    /** @var array<string, array{left: float, width: float}> previous criteria-box geometry, for down() */
    private const OLD_CRITERIA_POS = [
        'dsp-asset-performance-2' => ['left' => 54.44, 'width' => 10.33],
        'dsp-resilience-assessment-3' => ['left' => 54.44, 'width' => 10.33],
        'dsp-sustainability-2' => ['left' => 54.44, 'width' => 10.33],
        'dsp-economic-impact' => ['left' => 53.4, 'width' => 11.37],
        'dsp-criteria-xyz' => ['left' => 52.02, 'width' => 12.75],
    ];

    /** @var list<array{0: string, 1: string}> */
    private const OLD_LEGEND = [
        ['navy', 'Tool or model step'],
        ['io', 'Input or output artefact'],
    ];

    public function up(): void
    {
        $viewId = DB::table('tpraf_views')->where('key', 'dsp')->value('id');

        if ($viewId === null) {
            return;
        }

        foreach (self::COLUMN_COLOURS as $elementKey => $variant) {
            $this->updateLayout($viewId, $elementKey, function (array $layout) use ($variant) {
                $layout['variant'] = $variant;

                return $layout;
            });
        }

        $this->updateLayout($viewId, 'dsp-risk-assessment', function (array $layout) {
            unset($layout['variant']);

            return $layout;
        });

        $this->updateLayout($viewId, 'dsp-multi-criteria-cost-benefit', function (array $layout) {
            $layout['square'] = true;

            return $layout;
        });

        foreach (self::CRITERIA_BOXES as $elementKey) {
            $this->updateLayout($viewId, $elementKey, function (array $layout) {
                $layout['pos']['left'] = self::STRIP_RIGHT;
                $layout['pos']['width'] = round(self::CRITERIA_RIGHT - self::STRIP_RIGHT, 2);
                $layout['attachLeft'] = true;

                return $layout;
            });
        }

        $this->updateGeometry($viewId, function (array $geometry) {
            $geometry['legend'] = array_values(array_merge(
                [['io', 'DSP Modules']],
                array_filter($geometry['legend'] ?? [], fn (array $entry) => ! in_array($entry[0], ['navy', 'io'], true)),
            ));

            $geometry['containers'] = array_values(array_filter(
                $geometry['containers'] ?? [],
                fn (array $container) => $container['id'] !== 'dsp-key-bg',
            ));
            $geometry['containers'][] = ['id' => 'dsp-key-bg', 'style' => 'dashed', 'pos' => ['left' => 35.27, 'top' => 7.5, 'width' => 13.27, 'height' => 14.0]];

            return $geometry;
        });

        $now = now();

        foreach ([
            ['dsp-key-title', 'KEY', ['variant' => 'key-title', 'pos' => ['left' => 37.9, 'top' => 8.3, 'width' => 8.0, 'height' => 4.2]]],
            ['dsp-key-module', 'DSP Modules', ['variant' => 'key-dsp-module', 'pos' => ['left' => 36.5, 'top' => 14.0, 'width' => 10.8, 'height' => 4.6]]],
        ] as [$elementKey, $label, $layout]) {
            DB::table('tpraf_elements')->updateOrInsert(
                ['view_id' => $viewId, 'element_key' => $elementKey],
                [
                    'type' => 'heading',
                    'label' => $label,
                    'is_placeholder' => false,
                    'layout' => json_encode($layout),
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }
    }

    public function down(): void
    {
        $viewId = DB::table('tpraf_views')->where('key', 'dsp')->value('id');

        if ($viewId === null) {
            return;
        }

        foreach (array_keys(self::COLUMN_COLOURS) as $elementKey) {
            $this->updateLayout($viewId, $elementKey, function (array $layout) {
                $layout['variant'] = 'navy';

                return $layout;
            });
        }

        $this->updateLayout($viewId, 'dsp-risk-assessment', function (array $layout) {
            $layout['variant'] = 'navy';

            return $layout;
        });

        $this->updateLayout($viewId, 'dsp-multi-criteria-cost-benefit', function (array $layout) {
            unset($layout['square']);

            return $layout;
        });

        foreach (self::OLD_CRITERIA_POS as $elementKey => $pos) {
            $this->updateLayout($viewId, $elementKey, function (array $layout) use ($pos) {
                $layout['pos']['left'] = $pos['left'];
                $layout['pos']['width'] = $pos['width'];
                unset($layout['attachLeft']);

                return $layout;
            });
        }

        $this->updateGeometry($viewId, function (array $geometry) {
            $geometry['legend'] = array_values(array_merge(
                self::OLD_LEGEND,
                array_filter($geometry['legend'] ?? [], fn (array $entry) => $entry[0] !== 'io'),
            ));
            $geometry['containers'] = array_values(array_filter(
                $geometry['containers'] ?? [],
                fn (array $container) => $container['id'] !== 'dsp-key-bg',
            ));

            return $geometry;
        });

        DB::table('tpraf_elements')
            ->where('view_id', $viewId)
            ->whereIn('element_key', ['dsp-key-title', 'dsp-key-module'])
            ->delete();
    }

    /** @param  callable(array<string, mixed>): array<string, mixed>  $change */
    private function updateLayout(int $viewId, string $elementKey, callable $change): void
    {
        $row = DB::table('tpraf_elements')->where('view_id', $viewId)->where('element_key', $elementKey)->first();

        if ($row === null) {
            return;
        }

        $layout = json_decode($row->layout ?? '{}', associative: true) ?? [];

        DB::table('tpraf_elements')->where('id', $row->id)->update([
            'layout' => json_encode($change($layout)),
            'updated_at' => now(),
        ]);
    }

    /** @param  callable(array<string, mixed>): array<string, mixed>  $change */
    private function updateGeometry(int $viewId, callable $change): void
    {
        $geometry = json_decode(DB::table('tpraf_views')->where('id', $viewId)->value('geometry') ?? '{}', associative: true) ?? [];

        DB::table('tpraf_views')->where('id', $viewId)->update([
            'geometry' => json_encode($change($geometry)),
            'updated_at' => now(),
        ]);
    }
};
