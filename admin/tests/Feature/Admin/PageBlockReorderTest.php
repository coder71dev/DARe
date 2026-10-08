<?php

namespace Tests\Feature\Admin;

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageBlockReorderTest extends TestCase
{
    use RefreshDatabase;

    private function makeBlock(Page $page, int $position): PageBlock
    {
        return PageBlock::create([
            'page_id' => $page->id,
            'position' => $position,
            'block_type' => 'rich_text',
            'props' => [],
        ]);
    }

    public function test_admin_can_reorder_blocks(): void
    {
        $admin = User::factory()->admin()->create();
        $page = Page::factory()->create();
        $first = $this->makeBlock($page, 1);
        $second = $this->makeBlock($page, 2);
        $third = $this->makeBlock($page, 3);

        $response = $this->actingAs($admin)->post(route('admin.blocks.reorder', $page), [
            'order' => [$third->id, $first->id, $second->id],
        ]);

        $response->assertRedirect();
        $this->assertSame(1, $third->fresh()->position);
        $this->assertSame(2, $first->fresh()->position);
        $this->assertSame(3, $second->fresh()->position);
    }

    public function test_reorder_rejects_an_incomplete_order(): void
    {
        $admin = User::factory()->admin()->create();
        $page = Page::factory()->create();
        $first = $this->makeBlock($page, 1);
        $this->makeBlock($page, 2);

        $response = $this->actingAs($admin)->post(route('admin.blocks.reorder', $page), [
            'order' => [$first->id],
        ]);

        $response->assertSessionHasErrors('order');
    }

    public function test_reorder_rejects_a_block_from_another_page(): void
    {
        $admin = User::factory()->admin()->create();
        $page = Page::factory()->create();
        $first = $this->makeBlock($page, 1);
        $second = $this->makeBlock($page, 2);

        $otherPage = Page::factory()->create();
        $foreignBlock = $this->makeBlock($otherPage, 1);

        $response = $this->actingAs($admin)->post(route('admin.blocks.reorder', $page), [
            'order' => [$foreignBlock->id, $first->id, $second->id],
        ]);

        $response->assertSessionHasErrors('order');
        $this->assertSame(1, $first->fresh()->position);
        $this->assertSame(2, $second->fresh()->position);
    }
}
