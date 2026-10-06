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
        Schema::create('tpraf_lessons', function (Blueprint $table) {
            $table->id();
            // Attached to whichever view it belongs to, not hard-coded to Level 3 —
            // a second guided walkthrough on a different view is just another row.
            $table->foreignId('view_id')->unique()->constrained('tpraf_views')->cascadeOnDelete();
            $table->boolean('click_starts_tour')->default(false);
            $table->string('intro_title')->nullable();
            $table->text('intro_text')->nullable();
            $table->string('outro_title')->nullable();
            $table->text('outro_text')->nullable();
            $table->json('outro_links')->nullable();
            $table->json('stages')->nullable(); // [{key, label}, ...]
            // Each step is a whole edited-together unit: {box_key, stage, text,
            // example, credit, figure:{images:[...], caption}} — kept as JSON since
            // nothing ever queries a single sub-field in isolation.
            $table->json('steps')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tpraf_lessons');
    }
};
