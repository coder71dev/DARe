<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lets a whole diagram view be taken off the public site without deleting
     * it — DARe asked (Nov 2026) for the Level 3 example to be archived for
     * now, so it starts hidden and can be switched back on later.
     */
    public function up(): void
    {
        Schema::table('tpraf_views', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->after('key');
        });

        DB::table('tpraf_views')->where('key', 'level3')->update(['is_hidden' => true]);
    }

    public function down(): void
    {
        Schema::table('tpraf_views', function (Blueprint $table) {
            $table->dropColumn('is_hidden');
        });
    }
};
