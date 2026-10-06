<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TprafElement extends Model
{
    protected $fillable = [
        'view_id', 'type', 'element_key', 'label', 'text',
        'is_placeholder', 'handbook_url', 'layout',
    ];

    protected $casts = [
        'layout' => 'array',
        'is_placeholder' => 'boolean',
    ];

    public function view(): BelongsTo
    {
        return $this->belongsTo(TprafView::class, 'view_id');
    }
}
