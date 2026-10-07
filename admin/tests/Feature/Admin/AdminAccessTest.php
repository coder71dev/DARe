<?php

namespace Tests\Feature\Admin;

use App\Models\Page;
use App\Models\User;
use App\Support\LiveEdit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_reach_the_admin_area(): void
    {
        $response = $this->get('/admin/pages');

        $response->assertRedirect(route('login'));
    }

    public function test_non_admin_cannot_reach_the_admin_area(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/pages');

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_manage_admin_users(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get(route('admin.users.index'));

        $response->assertForbidden();
    }

    public function test_admin_can_reach_the_admin_area(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/pages');

        $response->assertOk();
    }

    public function test_non_admin_cannot_enable_live_edit_mode(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)->get('/?edit-mode=1');

        $this->assertFalse(LiveEdit::enabled());
    }

    public function test_admin_can_enable_live_edit_mode(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/?edit-mode=1');

        $this->assertTrue(LiveEdit::enabled());
    }

    public function test_pages_list_is_paginated(): void
    {
        $admin = User::factory()->admin()->create();
        Page::factory()->count(20)->create();

        $response = $this->actingAs($admin)->get('/admin/pages');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Pages/Index')
            ->has('pages.data', 15)
            ->where('pages.total', 20)
            ->where('pages.last_page', 2)
        );
    }

    public function test_admin_users_list_is_paginated(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->admin()->count(20)->create();

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 15)
            ->where('users.total', 21)
            ->where('users.last_page', 2)
        );
    }
}
