<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\TprafDspImp;
use App\Models\TprafView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagramChromeLiveEditTest extends TestCase
{
    use RefreshDatabase;

    private function makeTabbedDiagramPage(): Page
    {
        Page::factory()->create(['slug' => 'home', 'status' => 'published']);

        $page = Page::factory()->create(['slug' => 'diagram', 'status' => 'published']);

        PageBlock::create([
            'page_id' => $page->id,
            'position' => 1,
            'block_type' => 'diagram_embed',
            'props' => ['mode' => 'tabbed'],
        ]);

        return $page;
    }

    public function test_admin_in_live_edit_mode_sees_the_diagram_chrome_edit_markers(): void
    {
        $page = $this->makeTabbedDiagramPage();
        $admin = User::factory()->admin()->create();
        $chromeBlock = Page::systemBlock('diagram_chrome');

        $response = $this->actingAs($admin)
            ->withSession(['live_edit_mode' => true])
            ->get('/'.$page->slug);

        $response->assertOk();
        $response->assertSee('data-live-edit="block:'.$chromeBlock->id.':guide_heading"', false);
        $response->assertSee('data-live-edit="block:'.$chromeBlock->id.':breadcrumb_current"', false);
        $response->assertSee('data-live-edit="block:'.$chromeBlock->id.':tab_label_simple"', false);
        $response->assertSee('data-live-edit="block:'.$chromeBlock->id.':tab_label_level3"', false);
    }

    public function test_visitor_does_not_see_the_diagram_chrome_edit_markers(): void
    {
        $page = $this->makeTabbedDiagramPage();

        $response = $this->get('/'.$page->slug);

        $response->assertOk();
        $response->assertDontSee('data-live-edit', false);
    }

    public function test_the_diagram_renders_the_stored_chrome_text(): void
    {
        $page = $this->makeTabbedDiagramPage();
        $chromeBlock = Page::systemBlock('diagram_chrome');
        $chromeBlock->update(['props' => [...$chromeBlock->props, 'tab_label_simple' => 'Totally Custom Tab']]);

        $response = $this->get('/'.$page->slug);

        $response->assertOk();
        $response->assertSee('Totally Custom Tab');
    }

    public function test_admin_can_update_a_diagram_views_title_subtitle_and_status(): void
    {
        $admin = User::factory()->admin()->create();
        $view = TprafView::create(['key' => 'level3', 'title' => 'Original title']);

        $response = $this->actingAs($admin)->patchJson(route('admin.diagram-views.update', $view), [
            'title' => 'New title',
            'subtitle' => 'New subtitle',
            'status' => 'New walkthrough status text',
        ]);

        $response->assertOk();
        $view->refresh();
        $this->assertSame('New title', $view->title);
        $this->assertSame('New subtitle', $view->subtitle);
        $this->assertSame('New walkthrough status text', $view->status);
    }

    public function test_non_admin_cannot_update_a_diagram_view(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $view = TprafView::create(['key' => 'level3', 'title' => 'Original title']);

        $response = $this->actingAs($user)->patchJson(route('admin.diagram-views.update', $view), [
            'title' => 'Hacked title',
        ]);

        $response->assertForbidden();
        $this->assertSame('Original title', $view->fresh()->title);
    }

    public function test_guest_cannot_update_a_diagram_view(): void
    {
        $view = TprafView::create(['key' => 'level3', 'title' => 'Original title']);

        $response = $this->patchJson(route('admin.diagram-views.update', $view), [
            'title' => 'Hacked title',
        ]);

        $response->assertUnauthorized();
    }

    public function test_admin_can_update_a_dsp_imp_panels_title_and_text(): void
    {
        $admin = User::factory()->admin()->create();
        $dspImp = TprafDspImp::create(['key' => 'dsp', 'title' => 'Original title', 'text' => 'Original text']);

        $response = $this->actingAs($admin)->patchJson(route('admin.diagram-process.update', $dspImp), [
            'title' => 'New title',
            'text' => "First paragraph.\n\nSecond paragraph.",
        ]);

        $response->assertOk();
        $dspImp->refresh();
        $this->assertSame('New title', $dspImp->title);
        $this->assertSame("First paragraph.\n\nSecond paragraph.", $dspImp->text);
    }

    public function test_non_admin_cannot_update_a_dsp_imp_panel(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $dspImp = TprafDspImp::create(['key' => 'dsp', 'title' => 'Original title', 'text' => 'Original text']);

        $response = $this->actingAs($user)->patchJson(route('admin.diagram-process.update', $dspImp), [
            'title' => 'Hacked title',
        ]);

        $response->assertForbidden();
        $this->assertSame('Original title', $dspImp->fresh()->title);
    }

    public function test_guest_cannot_update_a_dsp_imp_panel(): void
    {
        $dspImp = TprafDspImp::create(['key' => 'dsp', 'title' => 'Original title', 'text' => 'Original text']);

        $response = $this->patchJson(route('admin.diagram-process.update', $dspImp), [
            'title' => 'Hacked title',
        ]);

        $response->assertUnauthorized();
    }

    public function test_the_diagram_chrome_data_is_exposed_to_the_page_script_for_the_guide_body(): void
    {
        $page = $this->makeTabbedDiagramPage();
        $chromeBlock = Page::systemBlock('diagram_chrome');
        $chromeBlock->update(['props' => [...$chromeBlock->props, 'guide_body_intro' => 'A totally custom intro sentence.']]);

        $response = $this->get('/'.$page->slug);

        $response->assertOk();
        $response->assertSee('window.DIAGRAM_CHROME', false);
        $response->assertSee('A totally custom intro sentence.');
    }

    public function test_the_handbook_link_text_renders_in_the_modal_and_lesson_partials(): void
    {
        $page = $this->makeTabbedDiagramPage();
        $chromeBlock = Page::systemBlock('diagram_chrome');
        $chromeBlock->update(['props' => [...$chromeBlock->props, 'handbook_link_text' => 'Go to the custom handbook']]);

        $response = $this->get('/'.$page->slug);

        $response->assertOk();
        // Both partials.modal and partials.lesson render it; only modal's
        // carries the live-edit marker (see the comment in lesson.blade.php
        // on why both can't independently claim the same field).
        $response->assertSeeInOrder(['Go to the custom handbook', 'Go to the custom handbook']);
    }

    public function test_admin_in_live_edit_mode_sees_the_handbook_link_edit_marker_once(): void
    {
        $page = $this->makeTabbedDiagramPage();
        $admin = User::factory()->admin()->create();
        $chromeBlock = Page::systemBlock('diagram_chrome');

        $response = $this->actingAs($admin)
            ->withSession(['live_edit_mode' => true])
            ->get('/'.$page->slug);

        $response->assertOk();
        $marker = 'data-live-edit="block:'.$chromeBlock->id.':handbook_link_text"';
        $this->assertSame(1, substr_count($response->getContent(), $marker));
    }
}
