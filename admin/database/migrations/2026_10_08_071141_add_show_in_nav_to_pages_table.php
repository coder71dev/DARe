<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->boolean('show_in_nav')->default(false)->after('status');
            // Nullable rather than defaulted to 0: left unset until a page is
            // actually toggled into the nav, at which point it's assigned the
            // next free slot (see PageAdminController::updateNavVisibility)
            // so newly-enabled pages land at the end instead of all tying at 0.
            $table->unsignedInteger('nav_order')->nullable()->after('show_in_nav');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['show_in_nav', 'nav_order']);
        });
    }
};
