<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TprafView extends Model
{
    protected $fillable = [
        'key', 'title', 'subtitle', 'next_view_key', 'next_view_label',
        'status', 'scale', 'geometry',
    ];

    protected $casts = [
        'geometry' => 'array',
        'scale' => 'float',
    ];

    public function elements(): HasMany
    {
        return $this->hasMany(TprafElement::class, 'view_id');
    }

    public function lesson(): HasOne
    {
        return $this->hasOne(TprafLesson::class, 'view_id');
    }
}
