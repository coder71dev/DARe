<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Support\LiveEdit;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
