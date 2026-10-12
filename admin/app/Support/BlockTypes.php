<?php

namespace App\Support;

/**
 * The dev-maintained catalog of reusable page components (the equivalent of
 * Puck's Config — see the admin-panel plan). Each entry declares a label, the
 * Blade partial that renders it on the public page, and a schema of editable
 * fields the admin's generic block-editing form is built from.
 *
 * A new *page* assembled from these types is a pure admin action (new `pages`
 * + `page_blocks` rows). A new block *type* means adding an entry here plus
 * its Blade partial — the one piece of this system that still needs a
 * developer.
 *
 * Field `type` is one of: text, textarea, url, image, boolean, select
 * (`options` required for select). `image` fields hold a plain asset path
 * string for now; Phase 4 swaps in a real media picker without changing this
 * schema or the stored data shape.
 */
class BlockTypes
{
    /** @return array<string, array{label: string, view: string, fields: array<string, array<string, mixed>>}> */
    public static function all(): array
    {
        return [
            'hero' => [
                'label' => 'Hero banner',
                'view' => 'blocks.hero',
                'wrap' => false, // supplies its own <section>/<div class="container">
                'fields' => [
                    'title' => ['type' => 'text', 'label' => 'Title'],
                    'tagline' => ['type' => 'textarea', 'label' => 'Tagline'],
                    'cta_label' => ['type' => 'text', 'label' => 'Button label'],
                    'cta_href' => ['type' => 'text', 'label' => 'Button link (e.g. #what-is-tpraf)'],
                    'photo' => ['type' => 'image', 'label' => 'Background photo'],
                ],
            ],
            'rich_text' => [
                'label' => 'Text section',
                'view' => 'blocks.rich-text',
                'fields' => [
                    'heading_style' => [
                        'type' => 'select',
                        'label' => 'Heading style',
                        'options' => [
                            'figure' => 'Icon + label + heading (intro style)',
                            'header' => 'Heading + label, no icon',
                            'plain' => 'No heading, just text',
                        ],
                    ],
                    'pill' => ['type' => 'text', 'label' => 'Small label above/beside the heading (optional)'],
                    'heading' => ['type' => 'text', 'label' => 'Heading (optional)'],
                    'icon' => ['type' => 'image', 'label' => 'Icon (figure style only)'],
                    'body' => ['type' => 'textarea', 'label' => 'Body text (blank line between paragraphs)'],
                    'lead' => ['type' => 'text', 'label' => 'Short lead line after the body (optional)'],
                    'paragraph_style' => [
                        'type' => 'select',
                        'label' => 'Paragraph spacing (plain style only)',
                        'options' => ['normal' => 'Normal', 'closing' => 'Closing paragraph (more space above)'],
                    ],
                ],
            ],
            'audience_tile' => [
                'label' => 'Audience tile',
                'view' => 'blocks.audience-tile',
                // Consecutive blocks of this type render wrapped in one <ol> —
                // see App\Support\PageRenderer. Each tile is still its own
                // independently addable/removable/reorderable block.
                'group' => ['tag' => 'ol', 'class' => 'audience-tiles reveal-group'],
                'fields' => [
                    'number' => ['type' => 'text', 'label' => 'Number (e.g. 01)'],
                    'icon' => ['type' => 'image', 'label' => 'Icon'],
                    'label' => ['type' => 'text', 'label' => 'Label'],
                ],
            ],
            'resource_card' => [
                'label' => 'Resource card',
                'view' => 'blocks.resource-card',
                'group' => ['tag' => 'ul', 'class' => 'resource-cards reveal-group'],
                'fields' => [
                    'icon' => ['type' => 'image', 'label' => 'Icon'],
                    'title' => ['type' => 'textarea', 'label' => 'Title (a line break starts a new line)'],
                    'body' => ['type' => 'textarea', 'label' => 'Body text'],
                    'link_href' => ['type' => 'url', 'label' => 'Link (optional)'],
                    'link_label' => ['type' => 'text', 'label' => 'Link accessible label (optional)'],
                ],
            ],
            'info_bar' => [
                'label' => 'Collapsible info bar',
                'view' => 'blocks.info-bar',
                'group' => ['tag' => 'div', 'class' => 'info-bars reveal-group'],
                'fields' => [
                    'icon' => ['type' => 'image', 'label' => 'Icon'],
                    'label' => ['type' => 'text', 'label' => 'Bar label'],
                    'body' => ['type' => 'textarea', 'label' => 'Body text'],
                    'link_href' => ['type' => 'url', 'label' => 'Link (optional)'],
                    'link_label' => ['type' => 'text', 'label' => 'Link text (optional)'],
                ],
            ],
            'acknowledgements' => [
                'label' => 'Acknowledgements',
                'view' => 'blocks.acknowledgements',
                'fields' => [
                    'icon' => ['type' => 'image', 'label' => 'Icon'],
                    'body' => ['type' => 'textarea', 'label' => 'Body text (blank line between paragraphs; **bold**, *italic*)'],
                ],
            ],
            'research_notice' => [
                'label' => 'Research output notice',
                'view' => 'blocks.research-notice',
                'fields' => [
                    'heading' => ['type' => 'text', 'label' => 'Heading'],
                    'body' => ['type' => 'textarea', 'label' => 'Body text (blank line between paragraphs; **bold**, *italic*)'],
                ],
            ],
            'cta_band' => [
                'label' => 'Call-to-action band',
                'view' => 'blocks.cta-band',
                'wrap' => false, // supplies its own <section>/<div class="container">
                'fields' => [
                    'heading' => ['type' => 'text', 'label' => 'Heading'],
                    'body' => ['type' => 'textarea', 'label' => 'Body text'],
                    'button_label' => ['type' => 'text', 'label' => 'Button label'],
                    'button_href' => ['type' => 'text', 'label' => 'Button link'],
                ],
            ],
            // Not a real page block — lives on the hidden system page
            // created by the add_site_footer_block migration, as the one
            // place the site header & footer's editable text/images are
            // stored, so the public layout can reuse the exact same live-
            // edit, image-upload, and admin-form machinery as ordinary page
            // content instead of a bespoke mechanism. 'internal' keeps it
            // out of the "add block" picker and off the public store()
            // endpoint — see BlockTypes::options() and
            // PageBlockController::store(). Despite the key name (kept to
            // avoid a rename/migration churn once content already existed
            // under it), this now also covers the header/footer logos.
            'site_footer' => [
                'label' => 'Site header & footer',
                'view' => 'blocks.missing',
                'internal' => true,
                'fields' => [
                    'header_logo' => ['type' => 'image', 'label' => 'Header logo'],
                    'heading_contact' => ['type' => 'text', 'label' => '"Keep in touch" heading'],
                    'mailing_list_label' => ['type' => 'text', 'label' => 'Mailing list link text'],
                    'heading_email' => ['type' => 'text', 'label' => '"Contact us" heading'],
                    'contact_email' => ['type' => 'text', 'label' => 'Contact email (also used as the mailto: link)'],
                    'heading_social' => ['type' => 'text', 'label' => '"Follow us" heading'],
                    'address' => ['type' => 'textarea', 'label' => 'Address (one line each)'],
                    'heading_funders' => ['type' => 'text', 'label' => '"Funders" heading'],
                    'funders_image' => ['type' => 'image', 'label' => 'Funders logos image'],
                    'heading_partners' => ['type' => 'text', 'label' => '"Partners" heading'],
                    'partners_image' => ['type' => 'image', 'label' => 'Partners logos image'],
                    'copyright_text' => ['type' => 'textarea', 'label' => 'Copyright line'],
                    'footer_logo' => ['type' => 'image', 'label' => 'Footer logo'],
                    'maps_label' => ['type' => 'text', 'label' => '"Find us on ___" link text'],
                    'maps_url' => ['type' => 'url', 'label' => '"Find us on ___" link destination'],
                    'linkedin_label' => ['type' => 'text', 'label' => 'LinkedIn link text'],
                    'linkedin_url' => ['type' => 'url', 'label' => 'LinkedIn link destination'],
                    'youtube_label' => ['type' => 'text', 'label' => 'Youtube link text'],
                    'youtube_url' => ['type' => 'url', 'label' => 'Youtube link destination'],
                    'mailing_list_url' => ['type' => 'url', 'label' => 'Mailing list link destination'],
                    'cookie_policy_label' => ['type' => 'text', 'label' => 'Cookie Policy link text'],
                    'cookie_policy_url' => ['type' => 'url', 'label' => 'Cookie Policy link destination'],
                    'privacy_policy_label' => ['type' => 'text', 'label' => 'Privacy Policy link text'],
                    'privacy_policy_url' => ['type' => 'url', 'label' => 'Privacy Policy link destination'],
                ],
            ],

            // Same internal/hidden-system-page treatment as 'site_footer' —
            // the diagram page's chrome text that isn't a per-box/per-view
            // TprafElement: the guide toggle heading, the breadcrumb's
            // current-page label, and the 5 level-tab button labels.
            'diagram_chrome' => [
                'label' => 'Diagram page chrome',
                'view' => 'blocks.missing',
                'internal' => true,
                'fields' => [
                    'guide_heading' => ['type' => 'text', 'label' => '"How to explore this diagram?" heading'],
                    'breadcrumb_current' => ['type' => 'text', 'label' => 'Breadcrumb current-page label'],
                    'tab_label_simple' => ['type' => 'text', 'label' => 'Tab label: Level 1 - Simple'],
                    'tab_label_extended' => ['type' => 'text', 'label' => 'Tab label: Level 1 - Extended'],
                    'tab_label_dsp' => ['type' => 'text', 'label' => 'Tab label: Level 2 - DSP'],
                    'tab_label_imp' => ['type' => 'text', 'label' => 'Tab label: Level 2 - IMP'],
                    'tab_label_level3' => ['type' => 'text', 'label' => 'Tab label: Level 3 - Example'],
                    'guide_body_intro' => ['type' => 'text', 'label' => 'Guide body: opening instruction'],
                    'guide_body_outro' => ['type' => 'text', 'label' => 'Guide body: closing instruction (drag/zoom)'],
                    'handbook_link_text' => ['type' => 'text', 'label' => '"Take me to the Handbook" link text'],
                ],
            ],

            'diagram_embed' => [
                'label' => 'TPRAF diagram',
                'view' => 'blocks.diagram-embed',
                'wrap' => false, // supplies its own <section>/<div class="container"> (and a breadcrumb band in tabbed mode)
                'fields' => [
                    'default_view' => [
                        'type' => 'select',
                        'label' => 'Starting view',
                        'options' => ['simple' => 'Simple', 'extended' => 'Extended', 'dsp' => 'DSP', 'imp' => 'IMP', 'level3' => 'Level 3'],
                    ],
                    'mode' => [
                        'type' => 'select',
                        'label' => 'Display mode',
                        'options' => ['single' => 'Single view, no tabs', 'tabbed' => 'All views, with tabs'],
                    ],
                    'show_extend_link' => ['type' => 'boolean', 'label' => 'Show "Explore the extended form" link'],
                    'extend_link_href' => ['type' => 'text', 'label' => 'Extended-form link target (single mode only)'],
                    'section_heading' => ['type' => 'text', 'label' => 'Section heading above the diagram (single mode only, optional)'],
                    'section_pill' => ['type' => 'text', 'label' => 'Small label beside the heading (single mode only, optional)'],
                ],
            ],
        ];
    }

    public static function exists(string $type): bool
    {
        return array_key_exists($type, self::all());
    }

    public static function label(string $type): string
    {
        return self::all()[$type]['label'] ?? $type;
    }

    public static function view(string $type): string
    {
        return self::all()[$type]['view'] ?? 'blocks.missing';
    }

    /** @return array<string, array<string, mixed>> */
    public static function fields(string $type): array
    {
        return self::all()[$type]['fields'] ?? [];
    }

    /** @return array{tag: string, class: string}|null */
    public static function group(string $type): ?array
    {
        return self::all()[$type]['group'] ?? null;
    }

    /** Whether the generic page renderer should wrap this block in <section class="section"><div class="container">. */
    public static function wraps(string $type): bool
    {
        return self::all()[$type]['wrap'] ?? true;
    }

    /** @return array<int, array{key: string, label: string}> Options for the admin's "add block" picker — internal types excluded (see 'site_footer'). */
    public static function options(): array
    {
        return collect(self::all())
            ->reject(fn (array $def) => $def['internal'] ?? false)
            ->map(fn (array $def, string $key) => ['key' => $key, 'label' => $def['label']])
            ->values()
            ->all();
    }

    /** @return array<int, string> Type keys a block may be created as via the admin's own "add block" flow. */
    public static function addableKeys(): array
    {
        return collect(self::options())->pluck('key')->all();
    }
}
