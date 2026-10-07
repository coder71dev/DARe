<?php

namespace App\Listeners;

use App\Models\EmailLog;
use Illuminate\Mail\Events\MessageSent;

/**
 * Records every outgoing email to the email_logs table, regardless of which
 * mailer sent it (log, smtp, ...) — MessageSent fires after any transport
 * finishes, so this is the one place that works the same in dev and once
 * this app is pointed at a real mail provider. Viewed from the admin's
 * Email logs page.
 *
 * Auto-discovered by Laravel's event discovery (app/Listeners + a handle()
 * method type-hinted to the event) — do not also register this manually
 * via Event::listen(), that double-registers it.
 */
class LogSentEmail
{
    public function handle(MessageSent $event): void
    {
        $message = $event->message;

        $to = collect($message->getTo())
            ->map(fn ($address) => $address->getAddress())
            ->implode(', ');

        EmailLog::create([
            'to' => $to,
            'subject' => $message->getSubject() ?? '(no subject)',
            'body' => $message->getHtmlBody() ?? $message->getTextBody() ?? '',
        ]);
    }
}
