<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class EventStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('events.create') ?? false;
    }

    public function rules(): array
    {
        $types = ['kata','taller','meetup'];
        $statuses = ['draft','published','cancelled'];
        return [
            'title' => ['required','string','min:3','max:160'],
            'summary' => ['nullable','string','max:280'],
            'description' => ['nullable','string'],
            'type' => ['required','string', Rule::in($types)],
            'start_at' => ['required','date','after:now'],
            'end_at' => ['nullable','date','after:start_at'],
            'capacity' => ['nullable','integer','min:1','max:5000'],
            'status' => ['nullable','string', Rule::in($statuses)],
        ];
    }
}

