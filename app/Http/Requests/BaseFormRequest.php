<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class BaseFormRequest extends FormRequest
{
    protected function failedValidation(Validator $validator): void
    {
        $response = response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()->toArray(),
        ], 422);
        throw new HttpResponseException($response);
    }
}

