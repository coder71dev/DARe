<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminEntryRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_visiting_admin_is_sent_to_login(): void
    {
        $response = $this->get('/admin');

        $response->assertRedirect(route('login'));
    }

    public function test_signed_in_user_visiting_admin_is_sent_to_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin');

        $response->assertRedirect(route('dashboard'));
    }
}
