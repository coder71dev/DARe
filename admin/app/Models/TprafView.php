<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TprafView extends Model
{
    protected $fillable = [
        'key', 'is_hidden', 'title', 'subtitle', 'next_view_key', 'next_view_label',
        'status', 'scale', 'geometry',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
        'geometry' => 'array',
        'scale' => 'float',
    ];

    /**
     * Keys of the views taken off the public site (see is_hidden) — the
     * diagram page leaves their level tab out.
     *
     * @return list<string>
     */
    public static function hiddenKeys(): array
    {
        return static::query()->where('is_hidden', true)->pluck('key')->all();
    }

    public function elements(): HasMany
    {
        return $this->hasMany(TprafElement::class, 'view_id');
    }

    public function lesson(): HasOne
    {
        return $this->hasOne(TprafLesson::class, 'view_id');
    }

    public function getRouteKeyName(): string
    {
        return 'key';
    }
}
