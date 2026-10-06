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
                    'body' => ['type' => 'textarea', 'label' => 'Body text (blank line between paragraphs)'],
                ],
            ],
            'research_notice' => [
                'label' => 'Research output notice',
                'view' => 'blocks.research-notice',
                'fields' => [
                    'heading' => ['type' => 'text', 'label' => 'Heading'],
                    'body' => ['type' => 'textarea', 'label' => 'Body text (blank line between paragraphs)'],
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

    /** @return array<int, array{key: string, label: string}> Options for the admin's "add block" picker. */
    public static function options(): array
    {
        return collect(self::all())
            ->map(fn (array $def, string $key) => ['key' => $key, 'label' => $def['label']])
            ->values()
            ->all();
    }
}
