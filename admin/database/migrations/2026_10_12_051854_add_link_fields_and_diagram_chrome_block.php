<?php

use App\Models\Page;
use App\Models\PageBlock;
use Illuminate\Database\Migrations\Migration;

/**
 * Two additions to the system page's internal content (see BlockTypes
 * 'site_footer' / 'diagram_chrome'), both backfilled/seeded with today's
 * real hardcoded text/links so nothing changes visually:
 *
 * - The footer's remaining links (Google Maps, LinkedIn, Youtube, mailing
 *   list, Cookie Policy, Privacy Policy) become editable text + destination,
 *   on the same site_footer block created by an earlier migration.
 * - A new diagram_chrome block holds the diagram page's own chrome text
 *   that isn't tied to a specific box/view — the guide heading, breadcrumb
 *   label, and the 5 level-tab button labels.
 */
return new class extends Migration
{
    public function up(): void
    {
        $footerBlock = PageBlock::where('block_type', 'site_footer')->first();

        $footerBlock?->update(['props' => [
            ...$footerBlock->props,
            'maps_label' => 'Google',
            'maps_url' => 'https://maps.app.goo.gl/P6UAs6S34K7V2CSP9',
            'linkedin_label' => 'LinkedIn',
            'linkedin_url' => 'https://www.linkedin.com/company/dare-hub/',
            'youtube_label' => 'Youtube',
            'youtube_url' => 'https://www.youtube.com/channel/UC3SeTcZlJQdFaYH5gdXmw1Q',
            'mailing_list_url' => 'https://mailchi.mp/7fc1a1abba83/dare-hub-mailing-list',
            'cookie_policy_label' => 'Cookie Policy',
            'cookie_policy_url' => 'https://dare.ac.uk/cookie-policy/',
            'privacy_policy_label' => 'Privacy Policy',
            'privacy_policy_url' => 'https://dare.ac.uk/privacy-policy/',
        ]]);

        $systemPage = Page::where('slug', Page::SYSTEM_PAGE_SLUG)->first();

        if ($systemPage) {
            PageBlock::create([
                'page_id' => $systemPage->id,
                'position' => (int) $systemPage->blocks()->max('position') + 1,
                'block_type' => 'diagram_chrome',
                'props' => [
                    'guide_heading' => 'How to explore this diagram?',
                    'breadcrumb_current' => 'Explore TPRAF',
                    'tab_label_simple' => 'Level 1 - Simple',
                    'tab_label_extended' => 'Level 1 - Extended',
                    'tab_label_dsp' => 'Level 2 - DSP',
                    'tab_label_imp' => 'Level 2 - IMP',
                    'tab_label_level3' => 'Level 3 - Example',
                ],
            ]);
        }
    }

    public function down(): void
    {
        PageBlock::where('block_type', 'diagram_chrome')->delete();

        $footerBlock = PageBlock::where('block_type', 'site_footer')->first();

        if ($footerBlock) {
            $props = $footerBlock->props;
            unset(
                $props['maps_label'], $props['maps_url'],
                $props['linkedin_label'], $props['linkedin_url'],
                $props['youtube_label'], $props['youtube_url'],
                $props['mailing_list_url'],
                $props['cookie_policy_label'], $props['cookie_policy_url'],
                $props['privacy_policy_label'], $props['privacy_policy_url'],
            );
            $footerBlock->update(['props' => $props]);
        }
    }
};
