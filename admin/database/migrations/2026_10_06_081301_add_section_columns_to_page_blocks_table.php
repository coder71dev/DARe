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
        Schema::table('page_blocks', function (Blueprint $table) {
            // Consecutive wrapped blocks sharing the same section_class (and,
            // if set, section_id) render inside ONE shared <section> instead
            // of one each — this is what lets several blocks sit together on
            // one coloured background band, matching the original design.
            // section_id additionally becomes that <section>'s HTML id, for
            // in-page anchor links (e.g. the hero's "What is TPRAF?" button).
            $table->string('section_class')->nullable()->after('block_type');
            $table->string('section_id')->nullable()->after('section_class');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            $table->dropColumn(['section_class', 'section_id']);
        });
    }
};
