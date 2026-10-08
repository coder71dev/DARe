<?php

namespace Tests\Feature\Admin;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageNavVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_add_a_page_to_the_header_nav(): void
    {
        $admin = User::factory()->admin()->create();
        $page = Page::factory()->create();

        $response = $this->actingAs($admin)->patch(route('admin.pages.update-nav', $page), [
            'show_in_nav' => true,
        ]);

        $response->assertRedirect();
        $page->refresh();
        $this->assertTrue($page->show_in_nav);
        $this->assertNotNull($page->nav_order);
    }

    public function test_removing_a_page_from_the_nav_keeps_its_position(): void
    {
        $admin = User::factory()->admin()->create();
        $page = Page::factory()->create(['show_in_nav' => true, 'nav_order' => 3]);

        $response = $this->actingAs($admin)->patch(route('admin.pages.update-nav', $page), [
            'show_in_nav' => false,
        ]);

        $response->assertRedirect();
        $page->refresh();
        $this->assertFalse($page->show_in_nav);
        $this->assertSame(3, $page->nav_order);
    }

    public function test_re_adding_a_page_reuses_its_old_position_instead_of_reassigning(): void
    {
        $admin = User::factory()->admin()->create();
        $page = Page::factory()->create(['show_in_nav' => false, 'nav_order' => 2]);
        Page::factory()->create(['show_in_nav' => true, 'nav_order' => 5]);

        $this->actingAs($admin)->patch(route('admin.pages.update-nav', $page), [
            'show_in_nav' => true,
        ]);

        $this->assertSame(2, $page->fresh()->nav_order);
    }

    public function test_new_pages_are_appended_after_the_highest_existing_position(): void
    {
        $admin = User::factory()->admin()->create();
        Page::factory()->create(['show_in_nav' => true, 'nav_order' => 5]);
        $page = Page::factory()->create(['show_in_nav' => false, 'nav_order' => null]);

        $this->actingAs($admin)->patch(route('admin.pages.update-nav', $page), [
            'show_in_nav' => true,
        ]);

        $this->assertSame(6, $page->fresh()->nav_order);
    }

    public function test_the_home_page_cannot_be_added_to_the_admin_managed_nav(): void
    {
        $admin = User::factory()->admin()->create();
        $home = Page::factory()->create(['slug' => 'home']);

        $response = $this->actingAs($admin)->patch(route('admin.pages.update-nav', $home), [
            'show_in_nav' => true,
        ]);

        $response->assertSessionHasErrors('show_in_nav');
        $this->assertFalse($home->fresh()->show_in_nav);
    }

    public function test_non_admin_cannot_toggle_nav_visibility(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $page = Page::factory()->create();

        $response = $this->actingAs($user)->patch(route('admin.pages.update-nav', $page), [
            'show_in_nav' => true,
        ]);

        $response->assertForbidden();
    }
}
