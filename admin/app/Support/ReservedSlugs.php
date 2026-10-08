<?php

namespace App\Support;

/**
 * Top-level path segments that a page's slug must never collide with, since
 * the public catch-all route (routes/web.php) would otherwise be shadowed by
 * — or shadow — a system route. Single source of truth for both the route's
 * exclusion regex and the admin's slug validation, so the two can't drift.
 */
class ReservedSlugs
{
    public const LIST = [
        'admin', 'api', 'login', 'register', 'logout',
        'dashboard', 'profile', 'storage', 'build',
        'forgot-password', 'reset-password', 'confirm-password', 'verify-email',
        'system-footer',
    ];

    public static function routeExclusionPattern(): string
    {
        return '^(?!'.implode('|', self::LIST).').*$';
    }
}
