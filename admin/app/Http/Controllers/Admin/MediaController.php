<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
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

        [$width, $height] = self::dimensions($file);

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

    /**
     * getimagesize() can't read SVG (it's XML, not a bitmap format it
     * recognizes) and silently returns false for one — which, now that
     * SVG uploads are allowed (see StoreMediaRequest), would otherwise mean
     * every uploaded icon's width/height goes unrecorded. Falls back to
     * reading the <svg> root's own width/height, or its viewBox, instead.
     *
     * @return array{0: ?int, 1: ?int}
     */
    private static function dimensions(UploadedFile $file): array
    {
        if ($file->getMimeType() !== 'image/svg+xml') {
            return @getimagesize($file->getRealPath()) ?: [null, null];
        }

        $svg = @simplexml_load_file($file->getRealPath());

        if (! $svg) {
            return [null, null];
        }

        $attrs = $svg->attributes();
        $width = isset($attrs->width) ? (float) $attrs->width : null;
        $height = isset($attrs->height) ? (float) $attrs->height : null;

        if ((! $width || ! $height) && isset($attrs->viewBox)) {
            $box = preg_split('/[\s,]+/', trim((string) $attrs->viewBox));

            if (count($box) === 4) {
                $width = $width ?: (float) $box[2];
                $height = $height ?: (float) $box[3];
            }
        }

        return [$width ? (int) round($width) : null, $height ? (int) round($height) : null];
    }
}
