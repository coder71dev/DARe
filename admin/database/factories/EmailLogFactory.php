<?php

namespace Database\Factories;

use App\Models\EmailLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmailLog>
 */
class EmailLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'to' => fake()->safeEmail(),
            'subject' => fake()->sentence(4),
            'body' => '<p>'.fake()->paragraph().'</p>',
        ];
    }
}
