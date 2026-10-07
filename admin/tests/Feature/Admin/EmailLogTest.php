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

    public function test_non_admin_cannot_view_email_logs(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get(route('admin.email-logs.index'));

        $response->assertForbidden();
    }
}
