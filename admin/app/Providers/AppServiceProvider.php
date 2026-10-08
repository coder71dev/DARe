<?php

namespace App\Providers;

use App\Models\Page;
use App\Services\TprafContentAssembler;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Every public page extends layouts.app, which prints TPRAF_CONTENT /
        // TPRAF_DSP_IMP for app.js — composed here once instead of threading
        // it through every controller that renders a page.
        View::composer('layouts.app', function ($view) {
            $assembler = app(TprafContentAssembler::class);

            $view->with([
                'tprafContent' => $assembler->assembleContent(),
                'tprafDspImp' => $assembler->assembleDspImp(),
                // Admin-toggled pages shown in the header nav, between the
                // permanent Home link and the Explore TPRAF button — see
                // Page::NON_TOGGLEABLE_NAV_SLUGS and the "Show in nav" toggle
                // on the admin Pages list.
                'navPages' => Page::query()
                    ->where('status', 'published')
                    ->where('show_in_nav', true)
                    ->whereNotIn('slug', Page::NON_TOGGLEABLE_NAV_SLUGS)
                    ->orderBy('nav_order')
                    ->get(['slug', 'title']),
            ]);
        });
    }
}
