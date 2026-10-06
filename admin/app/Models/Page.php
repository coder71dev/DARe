<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    protected $fillable = ['slug', 'title', 'meta_title', 'meta_description', 'status'];

    public function blocks(): HasMany
    {
        return $this->hasMany(PageBlock::class)->orderBy('position');
    }

    /** The public URL this page is actually served at (routes/web.php special-cases 'home' and 'diagram'). */
    public function publicUrl(): string
    {
        return match ($this->slug) {
            'home' => route('home'),
            'diagram' => route('diagram'),
            default => route('page.show', $this->slug),
        };
    }
}
