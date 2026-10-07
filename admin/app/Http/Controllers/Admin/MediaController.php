<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload an image for use in a block's "image" field. Stores the file
     * on the public disk and returns the path (relative to public/, same
     * convention as the hand-typed "assets/..." paths these fields already
     * accept — see App\Support\PageRenderer and the blocks/*.blade.php
     * templates, which both resolve a stored value through asset()).
     */
    public function store(StoreMediaRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $diskPath = $file->store('media', 'public');

        [$width, $height] = @getimagesize($file->getRealPath()) ?: [null, null];

        $media = Media::create([
            'reference_key' => (string) Str::uuid(),
            'disk_path' => $diskPath,
            'original_filename' => $file->getClientOriginalName(),
            'width' => $width,
            'height' => $height,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'id' => $media->id,
            'path' => 'storage/'.$diskPath,
        ]);
    }
}
