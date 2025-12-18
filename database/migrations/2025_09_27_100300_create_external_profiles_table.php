<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('external_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('platform', 32); // ExternalPlatform enum
            $table->string('handle')->nullable();
            $table->string('url'); // URL normalizada final
            $table->string('label')->nullable();
            $table->string('icon')->nullable(); // opcional override
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->json('verification_data')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'platform']);
            $table->index(['user_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('external_profiles');
    }
};

