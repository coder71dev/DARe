<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LiveEditImageTest extends TestCase
{
    use RefreshDatabase;

    private function makePageWithHeroPhoto(): Page
    {
        $page = Page::factory()->create(['slug' => 'live-edit-image-test']);

        PageBlock::create([
            'page_id' => $page->id,
            'position' => 1,
            'block_type' => 'hero',
            'props' => ['title' => 'Test', 'photo' => 'assets/img/hero-road.jpg'],
        ]);

        return $page;
    }

    public function test_admin_in_live_edit_mode_sees_the_image_edit_marker(): void
    {
        $admin = User::factory()->admin()->create();
        $page = $this->makePageWithHeroPhoto();

        $response = $this->actingAs($admin)
            ->withSession(['live_edit_mode' => true])
            ->get('/'.$page->slug);

        $response->assertOk();
        $response->assertSee('data-live-edit-image', false);
        $response->assertSee('data-live-edit="block:'.$page->blocks->first()->id.':photo"', false);
    }

    public function test_visitor_does_not_see_the_image_edit_marker(): void
    {
        $page = $this->makePageWithHeroPhoto();

        $response = $this->get('/'.$page->slug);

        $response->assertOk();
        $response->assertDontSee('data-live-edit-image', false);
    }

    public function test_admin_browsing_without_live_edit_mode_does_not_see_the_marker(): void
    {
        $admin = User::factory()->admin()->create();
        $page = $this->makePageWithHeroPhoto();

        $response = $this->actingAs($admin)->get('/'.$page->slug);

        $response->assertOk();
        $response->assertDontSee('data-live-edit-image', false);
    }
}
