<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Models\User;
use App\Notifications\AdminAccountCreated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserAdminController extends Controller
{
    public function index(): Response
    {
        $users = User::orderBy('name')->get(['id', 'name', 'email', 'is_admin', 'created_at']);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        $temporaryPassword = Str::password(16);

        $user = User::create([
            ...$request->validated(),
            'password' => Hash::make($temporaryPassword),
            'is_admin' => true,
        ]);

        // Not mass-assignable (see User::$fillable) — set directly instead.
        // The admin-created invite email stands in for the usual "click to
        // verify" step, so there's no separate verification flow to run.
        $user->forceFill(['email_verified_at' => now()])->save();

        $resetToken = Password::createToken($user);

        $user->notify(new AdminAccountCreated($temporaryPassword, $resetToken));

        return back()->with('status', "Admin account created for {$user->email} — an invite email has been sent.");
    }

    public function update(UpdateAdminUserRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validated());

        return back()->with('status', "{$user->name}'s details were updated.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->is(auth()->user())) {
            throw ValidationException::withMessages([
                'user' => 'You can\'t remove your own account.',
            ]);
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('status', 'Admin account removed.');
    }
}
