<?php

namespace App\Http\Requests;

use App\Models\TprafCaseStudy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * One case-study field saved from the public diagram's live-edit overlay:
 * the name, the introduction, or one step's heading, text, caption or
 * picture, addressed by its path ("steps.2.text", "steps.0.images.1.src").
 */
class UpdateCaseStudyFieldRequest extends FormRequest
{
    public const FIELD_PATTERN = '/^(title|intro_text|steps\.\d+\.(title|text|caption)|steps\.\d+\.images\.\d+\.src)$/';

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $required = in_array($this->input('field'), ['title'], true)
            || preg_match('/^steps\.\d+\.(title|images\.\d+\.src)$/', (string) $this->input('field'));

        return [
            'field' => ['required', 'string', 'regex:'.self::FIELD_PATTERN],
            'value' => [$required ? 'required' : 'nullable', 'string', 'max:5000'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                /** @var TprafCaseStudy $caseStudy */
                $caseStudy = $this->route('caseStudy');
                $field = (string) $this->input('field');

                if (! str_starts_with($field, 'steps.')) {
                    return;
                }

                // A step (or picture) has to exist already: live editing
                // changes what is on screen, it never adds new parts.
                $parent = preg_replace('/\.(title|text|caption|src)$/', '', $field);

                if (data_get(['steps' => $caseStudy->steps ?? []], $parent) === null) {
                    $validator->errors()->add('field', 'That part of the case study no longer exists. Reload the page and try again.');
                }
            },
        ];
    }
}
