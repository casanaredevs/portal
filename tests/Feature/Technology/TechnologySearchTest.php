<?php

use App\Models\Technology;

it('devuelve resultados de búsqueda de tecnologías', function () {
    Technology::factory()->create(['name' => 'Laravel','slug'=>'laravel']);
    Technology::factory()->create(['name' => 'React','slug'=>'react']);
    $this->getJson('/technologies/search?q=lar')->assertStatus(200)
        ->assertJson(fn($json) => $json->has('data')->etc())
        ->assertJsonPath('data.0.name', 'Laravel');
});

it('devuelve arreglo vacío en búsqueda vacía', function () {
    $this->getJson('/technologies/search?q=')->assertStatus(200)
        ->assertJsonPath('data', []);
});

it('limita número de resultados', function () {
    foreach (range(1,20) as $i) {
        Technology::factory()->create(['name' => 'Tech'.$i, 'slug'=>'tech'.$i]);
    }
    $this->getJson('/technologies/search?q=tech&limit=5')->assertStatus(200)
        ->assertJson(fn($json) => $json->where('data.4.name','Tech5')->etc());
});

