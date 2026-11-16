<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Case-study walkthroughs (DARe, Nov 2026): each one is a short guided
     * tour of a diagram view told through a real project — every step lights
     * up one or more boxes and shows a heading, text and pictures.
     */
    public function up(): void
    {
        Schema::create('tpraf_case_studies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('view_id')->constrained('tpraf_views')->cascadeOnDelete();
            $table->string('title');
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_published')->default(false);
            $table->text('intro_text')->nullable();
            // Each step is edited as a whole: {title, text, boxes: [element_key, ...],
            // images: [{src, alt}], caption} — kept as JSON since nothing ever
            // queries a single step on its own.
            $table->json('steps')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tpraf_case_studies');
    }
};
