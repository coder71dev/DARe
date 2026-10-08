<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            // allow_svg: every hand-placed icon on the site (audience tiles,
            // resource cards, info bars) is already an SVG — without this,
            // the "image" rule silently rejects the one format admins are
            // most likely to upload for an icon field. Safe here because
            // every icon/photo field renders via a plain <img src="...">
            // (see resources/views/blocks/*.blade.php), never inlined into
            // the DOM, so a malicious SVG's embedded script never executes.
            'file' => ['required', 'image:allow_svg', 'max:5120'],
        ];
    }
}
