<?php

use App\Models\Page;
use App\Models\PageBlock;
use Illuminate\Database\Migrations\Migration;

/**
 * Creates the one hidden system page + block the site footer's editable
 * content lives on (see App\Support\BlockTypes 'site_footer' and
 * App\Support\ReservedSlugs) — this reuses the existing page-block/live-edit
 * machinery for the footer instead of a bespoke settings table. The page
 * stays 'draft' forever (see PageController::show) and is excluded from the
 * admin Pages list (PageAdminController::index) and the nav toggle
 * (Page::NON_TOGGLEABLE_NAV_SLUGS), so it's reachable only through the
 * footer itself, never as a page in its own right.
 *
 * Props default to today's real hardcoded footer text/images so nothing
 * changes visually the moment this ships.
 */
return new class extends Migration
{
    public function up(): void
    {
        $page = Page::create([
            'slug' => 'system-footer',
            'title' => 'Site footer (system)',
            'status' => 'draft',
        ]);

        PageBlock::create([
            'page_id' => $page->id,
            'position' => 1,
            'block_type' => 'site_footer',
            'props' => [
                'heading_contact' => 'Keep in Touch',
                'mailing_list_label' => 'Sign up to our mailing list',
                'heading_email' => 'Contact Us',
                'contact_email' => 'darehub@newcastle.ac.uk',
                'heading_social' => 'Follow Us',
                'address' => "DARe Hub\nStephenson Building\nNewcastle University\nNE1 7RU\nUnited Kingdom",
                'heading_funders' => 'Funders',
                'funders_image' => 'assets/img/footer-funders.png',
                'heading_partners' => 'Partners',
                'partners_image' => 'assets/img/footer-partners.png',
                'copyright_text' => "\u{00A9} DARe Consortium. TPRAF, DSP, IMP and associated content are original DARe research outputs. Academic publications are in preparation. Please acknowledge and cite DARe when using or referencing this resource.",
            ],
        ]);
    }

    public function down(): void
    {
        Page::where('slug', 'system-footer')->first()?->delete();
    }
};
