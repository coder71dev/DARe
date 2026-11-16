<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\PageBlock;
use App\Support\Markup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class SiteLinksTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_site_relative_link_follows_the_apps_own_root_when_served_from_a_sub_folder(): void
    {
        URL::forceRootUrl('https://www.dare.ac.uk/tpraf');
        URL::forceScheme('https');

        $this->assertSame('https://www.dare.ac.uk/tpraf/diagram#extended', Markup::href('/diagram#extended'));
    }

    public function test_full_urls_anchors_and_empty_links_are_left_alone(): void
    {
        URL::forceRootUrl('https://www.dare.ac.uk/tpraf');

        $this->assertSame('https://handbook.dare.ac.uk', Markup::href('https://handbook.dare.ac.uk'));
        $this->assertSame('//cdn.example.org/x', Markup::href('//cdn.example.org/x'));
        $this->assertSame('#what-is-tpraf', Markup::href('#what-is-tpraf'));
        $this->assertSame('mailto:darehub@newcastle.ac.uk', Markup::href('mailto:darehub@newcastle.ac.uk'));
        $this->assertSame('#', Markup::href(null));
    }

    public function test_the_diagram_page_sends_handbook_links_to_the_configured_handbook(): void
    {
        config(['services.tpraf.handbook_url' => 'https://handbook.example.test/']);
        Page::factory()->create(['slug' => 'home', 'status' => 'published']);
        $page = Page::factory()->create(['slug' => 'diagram', 'status' => 'published']);
        PageBlock::create([
            'page_id' => $page->id,
            'position' => 1,
            'block_type' => 'diagram_embed',
            'props' => ['mode' => 'tabbed'],
        ]);

        $response = $this->get('/'.$page->slug);

        $response->assertOk();
        $response->assertSee('window.HANDBOOK_BASE_URL = "https:\/\/handbook.example.test"', false);
    }
}
