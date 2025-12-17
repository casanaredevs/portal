<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Username público (slug). Se permite nullable temporalmente para migrar datos existentes; la app debe exigirlo al completar el perfil.
            $table->string('username')->nullable()->unique()->after('id');
            $table->string('display_name')->nullable()->after('name');
            $table->string('bio', 280)->nullable()->after('email_verified_at');
            $table->text('about')->nullable()->after('bio');
            $table->string('location_city')->nullable()->after('about');
            $table->string('location_country', 2)->nullable()->after('location_city');
            $table->json('availability')->nullable()->after('location_country');
            $table->json('privacy')->nullable()->after('availability');
            // Se elimina índice separado pues unique ya crea uno.
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn([
                'username',
                'display_name',
                'bio',
                'about',
                'location_city',
                'location_country',
                'availability',
                'privacy',
            ]);
        });
    }
};
