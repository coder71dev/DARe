<?php

namespace App\Models;

use Database\Factories\TprafCaseStudyFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A case-study walkthrough on one diagram view. `steps` holds the whole
 * walkthrough: a list of {title, text, boxes: [element_key, ...],
 * images: [{src, alt}], caption}.
 */
class TprafCaseStudy extends Model
{
    /** @use HasFactory<TprafCaseStudyFactory> */
    use HasFactory;

    protected $fillable = [
        'view_id', 'title', 'position', 'is_published', 'intro_text', 'steps',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'position' => 'integer',
        'steps' => 'array',
    ];

    public function view(): BelongsTo
    {
        return $this->belongsTo(TprafView::class, 'view_id');
    }

    /** @param  Builder<TprafCaseStudy>  $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }
}
