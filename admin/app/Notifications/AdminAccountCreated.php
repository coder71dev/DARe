<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent when an admin creates another admin account (see
 * Admin\UserAdminController@store). Carries the one-time temporary password
 * and a normal password-reset link so the new admin can either sign in with
 * it directly or set their own password right away.
 */
class AdminAccountCreated extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $temporaryPassword,
        private readonly string $resetToken,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = url(route('password.reset', [
            'token' => $this->resetToken,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], absolute: false));

        return (new MailMessage)
            ->subject('Your '.config('app.name').' admin account')
            ->greeting('Welcome, '.$notifiable->name.'!')
            ->line('An administrator has created an account for you on '.config('app.name').'.')
            ->line('Your temporary password is: '.$this->temporaryPassword)
            ->line('For security, please set your own password before you continue using the account.')
            ->action('Set your password', $resetUrl)
            ->line('If you\'d rather keep the temporary password, you can simply log in with it — but changing it is strongly recommended.');
    }
}
