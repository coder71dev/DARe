<?php

namespace Tests\Feature;

use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HeaderNavTest extends TestCase
{
    use RefreshDatabase;

    private function makeHomePage(array $attributes = []): Page
    {
        return Page::factory()->create(['slug' => 'home', 'status' => 'published', ...$attributes]);
    }

    public function test_a_page_toggled_into_the_nav_appears_as_a_header_link(): void
    {
        $this->makeHomePage();
        $navPage = Page::factory()->create([
            'title' => 'Our Research',
            'slug' => 'our-research',
            'status' => 'published',
            'show_in_nav' => true,
            'nav_order' => 1,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('href="'.$navPage->publicUrl().'"', false);
        $response->assertSee('Our Research');
    }

    public function test_a_page_not_toggled_does_not_appear_in_the_nav(): void
    {
        $this->makeHomePage();
        Page::factory()->create([
            'title' => 'Hidden From Nav Page',
            'status' => 'published',
            'show_in_nav' => false,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertDontSee('Hidden From Nav Page');
    }

    public function test_a_toggled_draft_page_does_not_appear_until_published(): void
    {
        $this->makeHomePage();
        Page::factory()->create([
            'title' => 'Draft Nav Page',
            'status' => 'draft',
            'show_in_nav' => true,
            'nav_order' => 1,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertDontSee('Draft Nav Page');
    }

    public function test_nav_pages_render_in_nav_order(): void
    {
        $this->makeHomePage();
        Page::factory()->create(['title' => 'Second Nav Page', 'slug' => 'second', 'status' => 'published', 'show_in_nav' => true, 'nav_order' => 2]);
        Page::factory()->create(['title' => 'First Nav Page', 'slug' => 'first', 'status' => 'published', 'show_in_nav' => true, 'nav_order' => 1]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertSeeInOrder(['First Nav Page', 'Second Nav Page']);
    }

    public function test_the_home_page_never_duplicates_into_the_dynamic_nav_even_if_toggled(): void
    {
        $this->makeHomePage(['show_in_nav' => true, 'nav_order' => 1]);

        $response = $this->get('/');

        $response->assertOk();
        $this->assertSame(1, substr_count($response->getContent(), 'class="header-home"'));
    }
}
