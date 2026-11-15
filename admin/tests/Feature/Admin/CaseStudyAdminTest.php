<?php

namespace Tests\Feature\Admin;

use App\Models\TprafCaseStudy;
use App\Models\TprafElement;
use App\Models\TprafView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CaseStudyAdminTest extends TestCase
{
    use RefreshDatabase;

    private TprafView $view;

    protected function setUp(): void
    {
        parent::setUp();

        $this->view = TprafView::create(['key' => 'extended', 'title' => 'Level 1 - Extended']);

        foreach (['transport-system' => 'Transport System', 'hazard-model' => 'Hazard Model'] as $key => $label) {
            TprafElement::create(['view_id' => $this->view->id, 'type' => 'box', 'element_key' => $key, 'label' => $label]);
        }
    }

    /** @return array<string, mixed> */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'North East',
            'position' => 3,
            'is_published' => true,
            'intro_text' => '',
            'steps' => [
                [
                    'title' => 'Development of modelling tools',
                    'text' => 'Using the decisions made during scoping.',
                    'boxes' => ['transport-system', 'hazard-model'],
                    'images' => [['src' => 'assets/img/case-studies/ne-2.jpg', 'alt' => 'Agent-based model']],
                    'caption' => 'Agent-based model for Tyne & Wear',
                ],
            ],
        ], $overrides);
    }

    public function test_admin_can_create_a_case_study_as_an_unpublished_draft_on_level_1_extended(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.case-studies.store'), ['title' => 'GB & Freight']);

        $caseStudy = TprafCaseStudy::sole();
        $response->assertRedirect(route('admin.case-studies.edit', $caseStudy));
        $this->assertSame($this->view->id, $caseStudy->view_id);
        $this->assertFalse($caseStudy->is_published);
        $this->assertSame([], $caseStudy->steps);
    }

    public function test_the_edit_screen_offers_the_diagram_boxes_to_light_up(): void
    {
        $admin = User::factory()->admin()->create();
        $caseStudy = TprafCaseStudy::factory()->create(['view_id' => $this->view->id]);

        $this->actingAs($admin)
            ->get(route('admin.case-studies.edit', $caseStudy))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/CaseStudies/Edit')
                ->has('boxes', 2)
                ->where('boxes.0', ['key' => 'transport-system', 'label' => 'Transport System']));
    }

    public function test_admin_can_save_steps_with_several_boxes_and_pictures(): void
    {
        $admin = User::factory()->admin()->create();
        $caseStudy = TprafCaseStudy::factory()->draft()->create(['view_id' => $this->view->id, 'steps' => []]);

        $this->actingAs($admin)
            ->put(route('admin.case-studies.update', $caseStudy), $this->validPayload())
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $caseStudy->refresh();
        $this->assertTrue($caseStudy->is_published);
        $this->assertSame(3, $caseStudy->position);
        $this->assertSame(['transport-system', 'hazard-model'], $caseStudy->steps[0]['boxes']);
        $this->assertSame('assets/img/case-studies/ne-2.jpg', $caseStudy->steps[0]['images'][0]['src']);
    }

    public function test_a_step_must_light_at_least_one_real_box_of_the_diagram(): void
    {
        $admin = User::factory()->admin()->create();
        $caseStudy = TprafCaseStudy::factory()->create(['view_id' => $this->view->id]);

        $payload = $this->validPayload();
        $payload['steps'][0]['boxes'] = [];
        $this->actingAs($admin)->put(route('admin.case-studies.update', $caseStudy), $payload)
            ->assertSessionHasErrors('steps.0.boxes');

        $payload['steps'][0]['boxes'] = ['not-a-box'];
        $this->actingAs($admin)->put(route('admin.case-studies.update', $caseStudy), $payload)
            ->assertSessionHasErrors('steps.0.boxes.0');
    }

    public function test_a_case_study_with_no_steps_cannot_be_published(): void
    {
        $admin = User::factory()->admin()->create();
        $caseStudy = TprafCaseStudy::factory()->draft()->create(['view_id' => $this->view->id, 'steps' => []]);

        $this->actingAs($admin)
            ->put(route('admin.case-studies.update', $caseStudy), $this->validPayload(['steps' => []]))
            ->assertSessionHasErrors('is_published');

        $this->assertFalse($caseStudy->fresh()->is_published);
    }

    public function test_admin_can_delete_a_case_study(): void
    {
        $admin = User::factory()->admin()->create();
        $caseStudy = TprafCaseStudy::factory()->create(['view_id' => $this->view->id]);

        $this->actingAs($admin)
            ->delete(route('admin.case-studies.destroy', $caseStudy))
            ->assertRedirect(route('admin.case-studies.index'));

        $this->assertModelMissing($caseStudy);
    }

    public function test_non_admins_cannot_manage_case_studies(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('admin.case-studies.index'))->assertForbidden();
        $this->actingAs($user)->post(route('admin.case-studies.store'), ['title' => 'X'])->assertForbidden();
    }
}
