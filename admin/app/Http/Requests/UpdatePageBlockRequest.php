<?php

namespace App\Http\Requests;

use App\Support\BlockTypes;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePageBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $block = $this->route('block');
        $fields = BlockTypes::fields($block->block_type);

        $rules = [
            'section_class' => ['sometimes', 'nullable', 'string', 'max:255'],
            'section_id' => ['sometimes', 'nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
        ];

        foreach ($fields as $key => $definition) {
            $rules["props.{$key}"] = match ($definition['type']) {
                'boolean' => ['sometimes', 'boolean'],
                'select' => ['sometimes', 'nullable', 'string', 'in:'.implode(',', array_keys($definition['options'] ?? []))],
                'url' => ['sometimes', 'nullable', 'string', 'max:2048'],
                'textarea' => ['sometimes', 'nullable', 'string', 'max:10000'],
                default => ['sometimes', 'nullable', 'string', 'max:1000'],
            };
        }

        return $rules;
    }
}
