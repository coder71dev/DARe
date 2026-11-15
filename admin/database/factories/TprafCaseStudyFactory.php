<?php

namespace Database\Factories;

use App\Models\TprafCaseStudy;
use App\Models\TprafView;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TprafCaseStudy>
 */
class TprafCaseStudyFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'view_id' => fn () => TprafView::firstOrCreate(['key' => 'extended'], ['title' => 'Level 1 - Extended'])->id,
            'title' => fake()->city(),
            'position' => 0,
            'is_published' => true,
            'intro_text' => null,
            'steps' => [
                [
                    'title' => fake()->sentence(3),
                    'text' => fake()->paragraph(),
                    'boxes' => ['transport-system'],
                    'images' => [],
                    'caption' => '',
                ],
            ],
        ];
    }

    public function draft(): static
    {
        return $this->state(['is_published' => false]);
    }
}
