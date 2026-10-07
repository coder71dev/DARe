<?php

namespace Tests\Feature\Admin;

use App\Models\EmailLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EmailLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_sending_an_email_creates_an_email_log_entry(): void
    {
        // No Notification::fake()/Mail::fake() here on purpose — those
        // intercept before the mailer ever runs, which would skip the
        // MessageSent event this feature depends on. The "array" mailer
        // (see phpunit.xml) still fires that event, so this exercises the
        // real listener instead of just asserting a notification was queued.
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'New Admin',
            'email' => 'new-admin@example.com',
        ]);

        $this->assertSame(1, EmailLog::count());

        $log = EmailLog::first();
        $this->assertSame('new-admin@example.com', $log->to);
        $this->assertStringContainsString('admin account', $log->subject);
        $this->assertStringContainsString('temporary password', $log->body);
    }

    public function test_admin_can_view_the_email_log_list(): void
    {
        $admin = User::factory()->admin()->create();
        EmailLog::factory()->count(20)->create();

        $response = $this->actingAs($admin)->get(route('admin.email-logs.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/EmailLogs/Index')
            ->has('emailLogs.data', 15)
            ->where('emailLogs.total', 20)
        );
    }

    public function test_admin_can_view_a_single_email_log(): void
    {
        $admin = User::factory()->admin()->create();
        $log = EmailLog::factory()->create(['subject' => 'Test subject', 'body' => '<p>Hello</p>']);

        $response = $this->actingAs($admin)->get(route('admin.email-logs.show', $log));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/EmailLogs/Show')
            ->where('emailLog.subject', 'Test subject')
            ->where('emailLog.body', '<p>Hello</p>')
        );
    }

    public function test_the_temporary_password_is_extracted_and_redacted_from_the_body(): void
    {
        $admin = User::factory()->admin()->create();
        $log = EmailLog::factory()->create([
            // Mirrors the real mail template: the password is HTML-escaped
            // in the stored body (a literal "&" became "&amp;"), so this
            // also checks that the real password comes back decoded.
            'body' => '<p>Your temporary password is: a&amp;b&lt;c</p><p>Other text.</p>',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.email-logs.show', $log));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/EmailLogs/Show')
            ->where('temporaryPassword', 'a&b<c')
            ->where('emailLog.body', fn (string $body) => ! str_contains($body, 'a&amp;b&lt;c')
                && str_contains($body, 'Other text.')
            )
        );
    }

    public function test_emails_without_a_temporary_password_have_no_masked_field(): void
    {
        $admin = User::factory()->admin()->create();
        $log = EmailLog::factory()->create(['body' => '<p>Just a normal email.</p>']);

        $response = $this->actingAs($admin)->get(route('admin.email-logs.show', $log));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/EmailLogs/Show')
            ->where('temporaryPassword', null)
            ->where('emailLog.body', '<p>Just a normal email.</p>')
        );
    }

    public function test_non_admin_cannot_view_email_logs(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get(route('admin.email-logs.index'));

        $response->assertForbidden();
    }
}
