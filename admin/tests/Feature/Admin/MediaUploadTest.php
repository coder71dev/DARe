<?php

namespace Tests\Feature\Admin;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_an_image(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(route('admin.media.store'), [
            'file' => UploadedFile::fake()->image('photo.jpg', 200, 100),
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['id', 'path']);

        $media = Media::find($response->json('id'));

        $this->assertNotNull($media);
        $this->assertSame($admin->id, $media->uploaded_by);
        $this->assertSame(200, $media->width);
        $this->assertSame(100, $media->height);
        $this->assertStringStartsWith('storage/media/', $response->json('path'));

        Storage::disk('public')->assertExists($media->disk_path);
    }

    public function test_non_image_upload_is_rejected(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(route('admin.media.store'), [
            'file' => UploadedFile::fake()->create('notes.txt', 10),
        ]);

        $response->assertStatus(422);
        $this->assertSame(0, Media::count());
    }

    public function test_non_admin_cannot_upload(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->postJson(route('admin.media.store'), [
            'file' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertForbidden();
    }

    public function test_guest_cannot_upload(): void
    {
        $response = $this->postJson(route('admin.media.store'), [
            'file' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertUnauthorized();
    }
}
