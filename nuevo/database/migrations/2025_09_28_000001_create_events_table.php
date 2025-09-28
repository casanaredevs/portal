<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('summary', 280)->nullable();
            $table->text('description')->nullable();
            $table->string('type', 24); // kata | taller | meetup
            $table->dateTime('start_at');
            $table->dateTime('end_at')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->unsignedInteger('seats_taken')->default(0);
            $table->string('status', 20)->default('published'); // draft | published | cancelled
            $table->timestamps();
            $table->index(['start_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

