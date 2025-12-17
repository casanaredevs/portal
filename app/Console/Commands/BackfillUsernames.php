<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class BackfillUsernames extends Command
{
    protected $signature = 'profiles:backfill-usernames {--dry-run : Mostrar cambios sin guardarlos}';
    protected $description = 'Genera usernames para usuarios que aún no tienen uno.';

    public function handle(): int
    {
        $dry = $this->option('dry-run');
        $query = User::whereNull('username');
        $count = $query->count();
        if ($count === 0) {
            $this->info('No hay usuarios sin username.');
            return self::SUCCESS;
        }
        $this->info("Usuarios sin username: $count");

        $bar = $this->output->createProgressBar($count);
        $bar->start();
        $updated = 0;

        $query->chunkById(100, function ($users) use (&$updated, $bar, $dry) {
            foreach ($users as $user) {
                $suggested = $user->generateUsernameSuggestion();
                if ($dry) {
                    $this->line("[dry-run] {$user->id} -> $suggested");
                } else {
                    $user->username = $suggested;
                    $user->save();
                }
                $updated++;
                $bar->advance();
            }
        });
        $bar->finish();
        $this->newLine();
        $this->info($dry ? "Dry-run completado. $updated sugerencias generadas." : "Actualización completada. $updated usuarios actualizados.");
        return self::SUCCESS;
    }
}

