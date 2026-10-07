<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Notifications\AdminAccountCreated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class UserAdminControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_another_admin_and_an_invite_is_sent(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'New Admin',
            'email' => 'new-admin@example.com',
        ]);

        $response->assertRedirect();

        $newAdmin = User::where('email', 'new-admin@example.com')->first();

        $this->assertNotNull($newAdmin);
        $this->assertTrue($newAdmin->is_admin);
        $this->assertNotNull($newAdmin->email_verified_at);

        Notification::assertSentTo($newAdmin, AdminAccountCreated::class);
    }

    public function test_admin_cannot_remove_their_own_account(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));

        $response->assertSessionHasErrors('user');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_can_remove_another_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $other));

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseMissing('users', ['id' => $other->id]);
    }
}
