<?php

namespace App\Providers;

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
            ]);
        });
    }
}
