<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class EventUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('events.edit') ?? false;
    }

    public function rules(): array
    {
        $types = ['kata','taller','meetup'];
        $statuses = ['draft','published','cancelled'];
        return [
            'title' => ['sometimes','required','string','min:3','max:160'],
            'summary' => ['sometimes','nullable','string','max:280'],
            'description' => ['sometimes','nullable','string'],
            'type' => ['sometimes','required','string', Rule::in($types)],
            'start_at' => ['sometimes','required','date'],
            'end_at' => ['sometimes','nullable','date','after:start_at'],
            'capacity' => ['sometimes','nullable','integer','min:1','max:5000'],
            'status' => ['sometimes','string', Rule::in($statuses)],
        ];
    }
}
