<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Turns the public pages' live-edit overlay (Phase 3) on or off for this
 * browsing session, via a ?edit-mode=1 (or =0 to leave) link — see the
 * "Live Edit" link on the admin pages list and App\Support\LiveEdit, which
 * reads the session flag this sets. Session-scoped rather than query-param-
 * scoped so it survives following a link to another page while editing.
 */
class SetLiveEditMode
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->has('edit-mode')) {
            $request->session()->put('live_edit_mode', $request->boolean('edit-mode'));
        }

        return $next($request);
    }
}
