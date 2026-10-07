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

    public function test_invite_email_contains_a_working_temporary_password_and_reset_link(): void
    {
        // Notification::fake() stops the "send" but still gives us the real
        // notification instance, so this renders the actual mail a new
        // admin would receive and drives both paths through it offers them
        // (log in with the temp password, or follow the reset link) exactly
        // as a recipient would — not by reaching into the controller's
        // internal state.
        Notification::fake();

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'New Admin',
            'email' => 'new-admin@example.com',
        ]);

        $newAdmin = User::where('email', 'new-admin@example.com')->first();

        $temporaryPassword = null;
        $resetUrl = null;

        Notification::assertSentTo($newAdmin, AdminAccountCreated::class, function ($notification) use ($newAdmin, &$temporaryPassword, &$resetUrl) {
            $mail = $notification->toMail($newAdmin);

            $this->assertStringContainsString('admin account', $mail->subject);
            $this->assertSame('Set your password', $mail->actionText);

            $passwordLine = collect($mail->introLines)
                ->first(fn ($line) => str_contains($line, 'Your temporary password is: '));

            $this->assertNotNull($passwordLine, 'Mail is missing the temporary password line.');

            $temporaryPassword = trim(str_replace('Your temporary password is: ', '', $passwordLine));
            $resetUrl = $mail->actionUrl;

            return true;
        });

        // The temporary password actually logs the new admin in.
        $this->post('/logout');

        $this->post('/login', [
            'email' => $newAdmin->email,
            'password' => $temporaryPassword,
        ]);

        $this->assertAuthenticatedAs($newAdmin);
        $this->post('/logout');

        // The reset link actually lets them set their own password.
        $response = $this->post('/reset-password', [
            'token' => basename(parse_url($resetUrl, PHP_URL_PATH)),
            'email' => $newAdmin->email,
            'password' => 'a-new-password',
            'password_confirmation' => 'a-new-password',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('login'));

        $this->post('/login', [
            'email' => $newAdmin->email,
            'password' => 'a-new-password',
        ]);

        $this->assertAuthenticatedAs($newAdmin);
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
