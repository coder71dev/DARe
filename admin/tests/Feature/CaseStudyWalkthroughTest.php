<?php

namespace Tests\Feature;

use App\Models\TprafCaseStudy;
use App\Models\TprafView;
use App\Services\TprafContentAssembler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class CaseStudyWalkthroughTest extends TestCase
{
    use RefreshDatabase;

    public function test_published_case_studies_reach_the_diagram_in_order_with_their_boxes_and_pictures(): void
    {
        URL::forceRootUrl('https://www.dare.ac.uk/tpraf');
        URL::forceScheme('https');
        $view = TprafView::create(['key' => 'extended', 'title' => 'Level 1 - Extended']);
        TprafCaseStudy::factory()->create([
            'view_id' => $view->id,
            'title' => 'North East',
            'position' => 2,
            'steps' => [[
                'title' => 'Integration with Transport Scenarios',
                'text' => 'Coupling tools, datasets, and protocols.',
                'boxes' => ['transport-demand', 'transport-supply'],
                'images' => [['src' => 'assets/img/case-studies/ne-3.jpg', 'alt' => 'Agents']],
                'caption' => 'Agents traversing Newcastle',
            ]],
        ]);
        TprafCaseStudy::factory()->create(['view_id' => $view->id, 'title' => 'Cambridgeshire', 'position' => 1]);

        $caseStudies = app(TprafContentAssembler::class)->assembleContent()['extended']['caseStudies'];

        $this->assertSame(['Cambridgeshire', 'North East'], array_column($caseStudies, 'title'));
        $step = $caseStudies[1]['steps'][0];
        $this->assertSame(['transport-demand', 'transport-supply'], $step['boxes']);
        $this->assertSame('https://www.dare.ac.uk/tpraf/assets/img/case-studies/ne-3.jpg', $step['figure']['images'][0]['src']);
        $this->assertSame('Agents traversing Newcastle', $step['figure']['caption']);
    }

    public function test_drafts_and_case_studies_without_steps_stay_off_the_diagram(): void
    {
        $view = TprafView::create(['key' => 'extended', 'title' => 'Level 1 - Extended']);
        TprafCaseStudy::factory()->draft()->create(['view_id' => $view->id, 'title' => 'GB & Freight']);
        TprafCaseStudy::factory()->create(['view_id' => $view->id, 'title' => 'Empty', 'steps' => []]);

        $content = app(TprafContentAssembler::class)->assembleContent();

        $this->assertArrayNotHasKey('caseStudies', $content['extended']);
    }
}
