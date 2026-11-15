<?php

namespace App\Http\Requests;

use App\Models\TprafCaseStudy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCaseStudyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        /** @var TprafCaseStudy $caseStudy */
        $caseStudy = $this->route('caseStudy');

        $boxKeys = $caseStudy->view->elements()->where('type', 'box')->pluck('element_key')->all();

        return [
            'title' => ['required', 'string', 'max:255'],
            'position' => ['required', 'integer', 'min:0', 'max:1000'],
            'is_published' => ['required', 'boolean'],
            'intro_text' => ['nullable', 'string', 'max:2000'],
            'steps' => ['present', 'array', 'max:30'],
            'steps.*.title' => ['required', 'string', 'max:255'],
            'steps.*.text' => ['nullable', 'string', 'max:5000'],
            'steps.*.boxes' => ['required', 'array', 'min:1'],
            'steps.*.boxes.*' => ['string', Rule::in($boxKeys)],
            'steps.*.images' => ['present', 'array', 'max:4'],
            'steps.*.images.*.src' => ['required', 'string', 'max:2048'],
            'steps.*.images.*.alt' => ['nullable', 'string', 'max:500'],
            'steps.*.caption' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'steps.*.title.required' => 'Each step needs a heading.',
            'steps.*.boxes.required' => 'Pick at least one box for each step to light up.',
            'steps.*.boxes.min' => 'Pick at least one box for each step to light up.',
            'steps.*.images.*.src.required' => 'Upload a picture or remove the empty picture slot.',
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->boolean('is_published') && count($this->input('steps', [])) === 0) {
                    $validator->errors()->add('is_published', 'Add at least one step before publishing.');
                }
            },
        ];
    }
}
