<?php

use App\Models\User;
use App\Models\Technology;
use App\Models\Skill;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('crea una skill nueva', function () {
    $tech = Technology::factory()->create();
    $response = $this->postJson('/skills', [
        'technology_id' => $tech->id,
        'level' => 'learning',
    ]);
    $response->assertStatus(201)
        ->assertJsonPath('data.technology_id', $tech->id);
});

it('evita duplicar skill para misma tecnología', function () {
    $tech = Technology::factory()->create();
    Skill::factory()->create([
        'user_id' => $this->user->id,
        'technology_id' => $tech->id,
    ]);
    $this->postJson('/skills', [
        'technology_id' => $tech->id,
        'level' => 'learning',
    ])->assertStatus(422);
});

it('actualiza skill existente', function () {
    $skill = Skill::factory()->create(['user_id' => $this->user->id, 'level' => 'learning']);
    $this->patchJson('/skills/'.$skill->id, [
        'level' => 'advanced',
    ])->assertOk()->assertJsonPath('data.level', 'advanced');
});

it('elimina skill', function () {
    $skill = Skill::factory()->create(['user_id' => $this->user->id]);
    $this->deleteJson('/skills/'.$skill->id)->assertOk();
    expect(Skill::find($skill->id))->toBeNull();
});

it('reordena skills correctamente', function () {
    $techs = Technology::factory()->count(3)->create();
    $skills = [];
    foreach ($techs as $i => $t) {
        $skills[$i] = Skill::factory()->create([
            'user_id' => $this->user->id,
            'technology_id' => $t->id,
            'position' => $i + 1,
        ]);
    }
    $newOrder = [$skills[2]->id, $skills[0]->id, $skills[1]->id];
    $this->postJson('/skills/reorder', [
        'skill_ids' => $newOrder,
    ])->assertOk();

    $positions = Skill::whereIn('id', $newOrder)->orderBy('position')->pluck('id')->all();
    expect($positions)->toBe($newOrder);
});

it('rechaza reorder con ids faltantes', function () {
    $techs = Technology::factory()->count(2)->create();
    $skills = [];
    foreach ($techs as $i => $t) {
        $skills[$i] = Skill::factory()->create([
            'user_id' => $this->user->id,
            'technology_id' => $t->id,
            'position' => $i + 1,
        ]);
    }
    // Omite uno
    $this->postJson('/skills/reorder', [
        'skill_ids' => [$skills[0]->id],
    ])->assertStatus(422);
});

