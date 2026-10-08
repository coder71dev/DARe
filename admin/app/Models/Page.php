<?php

namespace App\Models;

use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory;

    /**
     * 'home' and 'diagram' already have their own permanent, specially-styled
     * links in the header nav (see layouts/app.blade.php) — toggling either
     * into the admin-managed nav list too would just duplicate it under a
     * second, plain-styled link.
     */
    public const NON_TOGGLEABLE_NAV_SLUGS = ['home', 'diagram', 'system-footer'];

    protected $fillable = ['slug', 'title', 'meta_title', 'meta_description', 'status', 'show_in_nav', 'nav_order'];

    protected $casts = [
        'show_in_nav' => 'boolean',
    ];

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
