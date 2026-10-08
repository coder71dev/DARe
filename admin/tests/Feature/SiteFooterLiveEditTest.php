<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteFooterLiveEditTest extends TestCase
{
    use RefreshDatabase;

    private function makeHomePage(): Page
    {
        return Page::factory()->create(['slug' => 'home', 'status' => 'published']);
    }

    public function test_the_footer_renders_the_stored_content(): void
    {
        $this->makeHomePage();

        $response = $this->get('/');

        $response->assertOk();
        // Seeded by the create_site_footer_system_block migration.
        $response->assertSee('Keep in Touch');
        $response->assertSee('darehub@newcastle.ac.uk');
        $response->assertSee('Stephenson Building', false);
    }

    public function test_admin_in_live_edit_mode_sees_the_footer_edit_markers(): void
    {
        $this->makeHomePage();
        $admin = User::factory()->admin()->create();
        $footerBlock = Page::where('slug', 'system-footer')->first()->blocks->first();

        $response = $this->actingAs($admin)
            ->withSession(['live_edit_mode' => true])
            ->get('/');

        $response->assertOk();
        $response->assertSee('data-live-edit="block:'.$footerBlock->id.':heading_contact"', false);
        $response->assertSee('data-live-edit="block:'.$footerBlock->id.':copyright_text"', false);
        $response->assertSee('data-live-edit="block:'.$footerBlock->id.':header_logo"', false);
        $response->assertSee('data-live-edit="block:'.$footerBlock->id.':footer_logo"', false);
        $response->assertSee('data-live-edit-image', false);
    }

    public function test_visitor_does_not_see_the_footer_edit_markers(): void
    {
        $this->makeHomePage();

        $response = $this->get('/');

        $response->assertOk();
        $response->assertDontSee('data-live-edit', false);
    }

    public function test_editing_the_footer_block_changes_what_every_page_shows(): void
    {
        $this->makeHomePage();
        $footerBlock = Page::where('slug', 'system-footer')->first()->blocks->first();
        $footerBlock->update(['props' => [
            ...$footerBlock->props,
            'copyright_text' => 'A totally different copyright line.',
        ]]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('A totally different copyright line.');
        $response->assertDontSee('DARe Consortium. TPRAF, DSP, IMP');
    }

    public function test_the_system_footer_page_is_never_served_as_a_real_page(): void
    {
        $response = $this->get('/system-footer');

        $response->assertNotFound();
    }

    public function test_the_system_footer_page_is_hidden_from_the_admin_pages_list(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.pages.index'));

        $response->assertOk();
        // Not a plain assertDontSee('system-footer') — that slug is also a
        // substring of the page.show route's own exclusion regex, which
        // Ziggy embeds on every page regardless of what's actually listed.
        $response->assertDontSee('Site footer (system)');
    }

    public function test_the_site_footer_block_type_cannot_be_added_to_an_ordinary_page(): void
    {
        $admin = User::factory()->admin()->create();
        $page = Page::factory()->create();

        $response = $this->actingAs($admin)->post(route('admin.blocks.store', $page), [
            'block_type' => 'site_footer',
        ]);

        $response->assertSessionHasErrors('block_type');
    }
}
