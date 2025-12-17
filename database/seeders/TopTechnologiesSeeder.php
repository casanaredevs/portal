<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Technology;
use Illuminate\Support\Str;

class TopTechnologiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lista de 15 tecnologías principales (mezcla frontend, backend, data, devops, cloud) + algunas ya existentes
        $technologies = [
            // Frontend
            ['name' => 'JavaScript',   'category' => 'frontend', 'icon' => 'javascript', 'synonyms' => ['js','ecmascript']],
            ['name' => 'TypeScript',   'category' => 'frontend', 'icon' => 'typescript', 'synonyms' => ['ts']], // ya se insertó en seeder base, se ignora por slug
            ['name' => 'React',        'category' => 'frontend', 'icon' => 'react', 'synonyms' => []],          // idem
            ['name' => 'Vue.js',       'category' => 'frontend', 'icon' => 'vue', 'synonyms' => ['vue','vuejs']],
            ['name' => 'Angular',      'category' => 'frontend', 'icon' => 'angular', 'synonyms' => ['angularjs']],

            // Backend
            ['name' => 'Node.js',      'category' => 'backend',  'icon' => 'nodejs', 'synonyms' => ['node','nodejs']],
            ['name' => 'Laravel',      'category' => 'backend',  'icon' => 'laravel', 'synonyms' => ['php laravel']], // ya base
            ['name' => 'Spring Boot',  'category' => 'backend',  'icon' => 'spring', 'synonyms' => ['spring','spring boot']],
            ['name' => 'Django',       'category' => 'backend',  'icon' => 'django', 'synonyms' => []],
            ['name' => '.NET',         'category' => 'backend',  'icon' => 'dotnet', 'synonyms' => ['.net','.net core','dotnet']],

            // Data / Bases de datos
            ['name' => 'PostgreSQL',   'category' => 'data',     'icon' => 'postgresql', 'synonyms' => ['postgres']], // ya base
            ['name' => 'MySQL',        'category' => 'data',     'icon' => 'mysql', 'synonyms' => []],
            ['name' => 'MongoDB',      'category' => 'data',     'icon' => 'mongodb', 'synonyms' => ['mongo']],

            // DevOps / Cloud
            ['name' => 'Docker',       'category' => 'devops',   'icon' => 'docker', 'synonyms' => []], // ya base
            ['name' => 'Kubernetes',   'category' => 'devops',   'icon' => 'kubernetes', 'synonyms' => ['k8s']],
        ];

        foreach ($technologies as $data) {
            Technology::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                $data + ['is_active' => true]
            );
        }
    }
}

