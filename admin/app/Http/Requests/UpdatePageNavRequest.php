<?php

namespace App\Http\Requests;

use App\Models\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdatePageNavRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'show_in_nav' => ['required', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->boolean('show_in_nav') && in_array($this->route('page')->slug, Page::NON_TOGGLEABLE_NAV_SLUGS, strict: true)) {
                $validator->errors()->add('show_in_nav', 'This page already has its own permanent spot in the nav.');
            }
        });
    }
}
