<?php

use App\Http\Controllers\Admin\DiagramAdminController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\PageAdminController;
use App\Http\Controllers\Admin\PageBlockController;
use App\Http\Controllers\Admin\UserAdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\SetLiveEditMode;
use App\Support\ReservedSlugs;
use Illuminate\Support\Facades\Route;

Route::middleware(SetLiveEditMode::class)->group(function () {
    Route::get('/', fn () => app(PageController::class)->show('home'))->name('home');
    Route::get('/diagram', fn () => app(PageController::class)->show('diagram'))->name('diagram');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// A conventional entry point into the admin panel: signed-in admins land on
// the dashboard, everyone else is sent to log in (and back here afterwards).
Route::get('/admin', fn () => auth()->check()
    ? redirect()->route('dashboard')
    : redirect()->guest(route('login'))
)->name('admin.home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/pages', [PageAdminController::class, 'index'])->name('pages.index');
    Route::post('/pages', [PageAdminController::class, 'store'])->name('pages.store');
    Route::get('/pages/{page}', [PageAdminController::class, 'edit'])->name('pages.edit');
    Route::patch('/pages/{page}', [PageAdminController::class, 'update'])->name('pages.update');
    Route::delete('/pages/{page}', [PageAdminController::class, 'destroy'])->name('pages.destroy');

    Route::post('/pages/{page}/blocks', [PageBlockController::class, 'store'])->name('blocks.store');
    Route::patch('/blocks/{block}', [PageBlockController::class, 'update'])->name('blocks.update');
    Route::delete('/blocks/{block}', [PageBlockController::class, 'destroy'])->name('blocks.destroy');
    Route::post('/pages/{page}/blocks/reorder', [PageBlockController::class, 'reorder'])->name('blocks.reorder');

    Route::get('/diagrams', [DiagramAdminController::class, 'index'])->name('diagrams.index');
    Route::get('/diagrams/{view}/elements', [DiagramAdminController::class, 'edit'])->name('diagrams.edit');
    Route::patch('/elements/{element}', [DiagramAdminController::class, 'update'])->name('elements.update');

    Route::get('/users', [UserAdminController::class, 'index'])->name('users.index');
    Route::post('/users', [UserAdminController::class, 'store'])->name('users.store');
    Route::delete('/users/{user}', [UserAdminController::class, 'destroy'])->name('users.destroy');

    Route::post('/media', [MediaController::class, 'store'])->name('media.store');
});

require __DIR__.'/auth.php';

// Catch-all for any published page by slug — must stay LAST so it never
// shadows a route defined above it (admin/dashboard/profile/auth/etc.).
Route::get('/{slug}', [PageController::class, 'show'])
    ->middleware(SetLiveEditMode::class)
    ->where('slug', ReservedSlugs::routeExclusionPattern())
    ->name('page.show');
