<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TprafLesson extends Model
{
    protected $fillable = [
        'view_id', 'click_starts_tour', 'intro_title', 'intro_text',
        'outro_title', 'outro_text', 'outro_links', 'stages', 'steps',
    ];

    protected $casts = [
        'click_starts_tour' => 'boolean',
        'outro_links' => 'array',
        'stages' => 'array',
        'steps' => 'array',
    ];

    public function view(): BelongsTo
    {
        return $this->belongsTo(TprafView::class, 'view_id');
    }
}
