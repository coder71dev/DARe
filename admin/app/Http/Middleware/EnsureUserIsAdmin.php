<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks the admin area (page/diagram management, user management, and the
 * public pages' live-edit mode via App\Support\LiveEdit) from any signed-in
 * user who isn't flagged as an admin. Runs after 'auth', so $request->user()
 * is always present here.
 */
class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->is_admin, 403);

        return $next($request);
    }
}
