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
        Schema::create('tpraf_elements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('view_id')->constrained('tpraf_views')->cascadeOnDelete();
            // Open string, not a DB-enforced enum: "box" | "label" | "heading" today,
            // but a future diagram's own element kind just needs a new value here.
            $table->string('type');
            // Matches content.js's box.id / app.js's data-box-id attribute.
            $table->string('element_key');
            $table->string('label')->nullable();
            $table->text('text')->nullable();
            $table->boolean('is_placeholder')->default(false);
            $table->string('handbook_url')->nullable();
            // Dev-maintained layout bits (position, variant, shape, rotate, group, ...)
            // kept only for lossless round-trip; never surfaced in the admin UI.
            $table->json('layout')->nullable();
            $table->timestamps();

            $table->unique(['view_id', 'type', 'element_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tpraf_elements');
    }
};
