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
        Schema::create('tpraf_views', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('next_view_key')->nullable();
            $table->string('next_view_label')->nullable();
            $table->text('status')->nullable();
            $table->float('scale')->default(1);
            // Dev-maintained geometry the admin UI never touches: containers, arrows,
            // elbowPaths, feedbackPaths, curvedPaths, tour order, legend.
            $table->json('geometry')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tpraf_views');
    }
};
