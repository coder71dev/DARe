<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\TprafView;
use App\Services\TprafContentAssembler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HiddenDiagramViewTest extends TestCase
{
    use RefreshDatabase;

    private function makeTabbedDiagramPage(): Page
    {
        Page::factory()->create(['slug' => 'home', 'status' => 'published']);

        $page = Page::factory()->create(['slug' => 'diagram', 'status' => 'published']);

        PageBlock::create([
            'page_id' => $page->id,
            'position' => 1,
            'block_type' => 'diagram_embed',
            'props' => ['mode' => 'tabbed'],
        ]);

        return $page;
    }

    public function test_a_hidden_view_gets_no_level_tab(): void
    {
        $page = $this->makeTabbedDiagramPage();
        TprafView::create(['key' => 'imp', 'title' => 'IMP']);
        TprafView::create(['key' => 'level3', 'title' => 'Level 3', 'is_hidden' => true]);

        $response = $this->get('/'.$page->slug);

        $response->assertOk();
        $response->assertSee('data-view="imp"', false);
        $response->assertDontSee('data-view="level3"', false);
    }

    public function test_a_hidden_view_is_left_out_of_the_diagram_content_and_no_link_points_at_it(): void
    {
        TprafView::create(['key' => 'imp', 'title' => 'IMP', 'next_view_key' => 'level3', 'next_view_label' => 'See an example']);
        TprafView::create(['key' => 'level3', 'title' => 'Level 3', 'is_hidden' => true]);

        $content = app(TprafContentAssembler::class)->assembleContent();

        $this->assertArrayHasKey('imp', $content);
        $this->assertArrayNotHasKey('level3', $content);
        $this->assertArrayNotHasKey('next', $content['imp']);
    }
}
