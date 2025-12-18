<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('technology_id')->constrained()->cascadeOnDelete();
            $table->string('level', 32); // SkillLevel enum value
            $table->unsignedTinyInteger('years_experience')->nullable(); // rango aproximado (0-50)
            $table->unsignedSmallInteger('position')->default(0); // orden de prioridad
            $table->string('visibility', 16)->default('public'); // SkillVisibility enum
            $table->timestamps();

            $table->unique(['user_id', 'technology_id']);
            $table->index(['user_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};

