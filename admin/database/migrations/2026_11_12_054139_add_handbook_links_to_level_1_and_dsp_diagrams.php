<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The DARe Handbook (handbook.dare.ac.uk) now has a full DSP section plus
 * pages for every Level 1 step, so boxes that only linked to the handbook's
 * home page get a specific page — or a section on one (#anchor). Every
 * path below was checked against the live handbook (Nov 2026).
 *
 * Only fills boxes that still have no link of their own: a link an admin
 * has already set is never overwritten. DARe's own cross-link spreadsheet
 * can still replace any of these through the admin panel.
 */
return new class extends Migration
{
    /** @var array<string, array<string, string>> view key => [element key => handbook path] */
    private const LINKS = [
        'simple' => [
            'transport-scenarios' => '/imp/introduction/transport-scenario',
            'impact-assessment' => '/imp/performance-metrics',
            'hazard-model' => '/imp/hazard-models',
            'climate-scenarios' => '/imp/climate-scenarios',
            'bau' => '/dsp/technical-processes/asset-network-evaluation',
            'risk-reduction-needs' => '/dsp/technical-processes/risk-reduction-analysis',
            'adaptation-interventions' => '/imp/adaptation-measures',
            'outcome-assessment' => '/dsp/technical-processes/outcome-assessment',
        ],
        'extended' => [
            'transport-demand' => '/imp/transport-demand',
            'transport-supply' => '/imp/transport-supply',
            'transport-system' => '/imp/transport-model',
            'social-behaviour-impacts' => '/imp/social-behavioural-impacts',
            'weather-variables' => '/imp/introduction/weather-event',
            'climate-scenario' => '/imp/climate-scenarios',
            'hazard-model' => '/imp/hazard-models',
            'transport-specific-threshold' => '/imp/transport-thresholds',
            'impact-assessment' => '/imp/performance-metrics',
            'asset-network-evaluation' => '/dsp/technical-processes/asset-network-evaluation',
            'problem-framing' => '/dsp/technical-processes/problem-framing-and-scope',
            'risk-reduction-needs' => '/dsp/technical-processes/risk-reduction-analysis',
            'adaptation-interventions' => '/imp/adaptation-measures',
            'cost-benefit' => '/dsp/technical-processes/detailed-option-assessment',
            'portfolio-optimisation' => '/dsp/technical-processes/portfolio-optimisation',
            'outcome-assessment' => '/dsp/technical-processes/outcome-assessment',
        ],
        'dsp' => [
            'dsp-transport-scenarios' => '/imp/introduction/transport-scenario',
            'dsp-climate-scenarios' => '/imp/climate-scenarios',
            'dsp-requirements' => '/dsp/technical-processes/problem-framing-and-scope#stage-1-understanding-context-and-drivers',
            'dsp-context' => '/dsp/technical-processes/problem-framing-and-scope#stage-1-understanding-context-and-drivers',
            'dsp-constraints' => '/dsp/technical-processes/problem-framing-and-scope#stage-1-understanding-context-and-drivers',
            'dsp-sustainability' => '/dsp/technical-modules/sustainability',
            'dsp-risk-assessment' => '/dsp/technical-modules/risk-assessment',
            'dsp-asset-performance' => '/dsp/technical-modules/asset-performance',
            'dsp-resilience-assessment' => '/dsp/technical-modules/resilience',
            'dsp-asset-registry' => '/dsp/technical-modules/asset-registry',
            'dsp-system-interdependencies' => '/dsp/technical-modules/system-interdependencies',
            'dsp-problem-definition' => '/dsp/technical-processes/problem-framing-and-scope#stage-2-problem-definition',
            'dsp-primary-impact-identification' => '/dsp/technical-processes/problem-framing-and-scope#stage-3-identifying-problem-impacts',
            'dsp-option-ideation' => '/dsp/technical-processes/problem-framing-and-scope#stage-4-ideation-of-intervention',
            'dsp-risk-thresholds' => '/dsp/technical-processes/risk-reduction-analysis#2-apply-risk-thresholds-and-decision-rules',
            'dsp-option-matrix' => '/dsp/technical-processes/risk-reduction-analysis#6-test-options-against-requirements-context-and-constraints',
            'dsp-selection-screened-list' => '/dsp/technical-processes/risk-reduction-analysis#7-generate-and-screen-the-option-shortlist',
            'dsp-interventions' => '/dsp/technical-processes/risk-reduction-analysis#5-retrieve-candidate-mitigation-options',
            'dsp-resilience-assessment-2' => '/dsp/technical-modules/resilience',
            'dsp-multi-criteria-cost-benefit' => '/dsp/technical-processes/detailed-option-assessment#stage-1-multi-criteria-analysis',
            'dsp-asset-performance-2' => '/dsp/technical-modules/asset-performance',
            'dsp-resilience-assessment-3' => '/dsp/technical-modules/resilience',
            'dsp-sustainability-2' => '/dsp/technical-modules/sustainability',
            'dsp-economic-impact' => '/dsp/technical-processes/detailed-option-assessment#stage-2-detailed-appraisal-and-confirmation',
            'dsp-criteria-xyz' => '/dsp/technical-processes/detailed-option-assessment#step-4-develop-criteria',
            'dsp-system-interdependencies-2' => '/dsp/technical-modules/system-interdependencies',
            'dsp-solution-bundling' => '/dsp/technical-processes/portfolio-optimisation#7-formulate-and-solve-the-optimisation-problem',
            'dsp-resource-feasibility' => '/dsp/technical-processes/portfolio-optimisation#4-define-the-planning-context-and-portfolio-requirements',
            'dsp-asset-performance-3' => '/dsp/technical-modules/asset-performance',
            'dsp-intervention-effectiveness' => '/dsp/technical-processes/outcome-assessment',
            'dsp-asset-registry-2' => '/dsp/technical-modules/asset-registry',
            'dsp-risk-assessment-cross' => '/dsp/technical-modules/risk-assessment',
            'dsp-c1-heading' => '/dsp/technical-processes/asset-network-evaluation',
            'dsp-c2-heading' => '/dsp/technical-processes/problem-framing-and-scope',
            'dsp-c3-heading' => '/dsp/technical-processes/risk-reduction-analysis',
            'dsp-c5-heading' => '/dsp/technical-processes/portfolio-optimisation',
            'dsp-c6-heading' => '/dsp/technical-processes/outcome-assessment',
        ],
    ];

    public function up(): void
    {
        foreach (self::LINKS as $viewKey => $links) {
            $viewId = DB::table('tpraf_views')->where('key', $viewKey)->value('id');

            if ($viewId === null) {
                continue;
            }

            foreach ($links as $elementKey => $path) {
                DB::table('tpraf_elements')
                    ->where('view_id', $viewId)
                    ->where('element_key', $elementKey)
                    ->where(fn ($query) => $query->whereNull('handbook_url')->orWhere('handbook_url', ''))
                    ->update(['handbook_url' => $path, 'updated_at' => now()]);
            }
        }
    }

    public function down(): void
    {
        foreach (self::LINKS as $viewKey => $links) {
            $viewId = DB::table('tpraf_views')->where('key', $viewKey)->value('id');

            if ($viewId === null) {
                continue;
            }

            foreach ($links as $elementKey => $path) {
                DB::table('tpraf_elements')
                    ->where('view_id', $viewId)
                    ->where('element_key', $elementKey)
                    ->where('handbook_url', $path)
                    ->update(['handbook_url' => '', 'updated_at' => now()]);
            }
        }
    }
};
