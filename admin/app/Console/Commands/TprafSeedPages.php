<?php

namespace App\Console\Commands;

use App\Models\Page;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * One-time Phase 2 migration tool: creates the "home" and "diagram" `pages`
 * rows and their `page_blocks`, reproducing today's site/index.html and
 * site/diagram.html content as block instances. There's no structured
 * source to script this against (it's hand-authored HTML), so — like the
 * Phase 1 homepage content — this is hand-transcribed from the live site
 * and needs a side-by-side QA pass, not an automated diff.
 */
#[Signature('tpraf:seed-pages')]
#[Description('Create the home and diagram pages from today\'s site content (Phase 2 migration).')]
class TprafSeedPages extends Command
{
    public function handle(): int
    {
        $this->seedHome();
        $this->seedDiagram();

        $this->info('Seeded home and diagram pages.');

        return self::SUCCESS;
    }

    private function seedHome(): void
    {
        $page = Page::updateOrCreate(
            ['slug' => 'home'],
            ['title' => 'Home', 'status' => 'published'],
        );

        $page->blocks()->delete();

        // Each entry: [block_type, props, section] where section is either
        // null (the block stands alone / supplies its own wrapper) or
        // [section_class, section_id]. Consecutive blocks sharing the same
        // section render together inside one coloured <section> band,
        // reproducing the original design's grouping (e.g. the intro text +
        // 6 audience tiles + closing paragraph all sit on one band-mist
        // section today).
        $whatIsTpraf = ['band-mist', 'what-is-tpraf'];
        $about = ['band-navy', null];
        $further = ['section-further', null];

        $blocks = [
            ['hero', [
                'title' => "DARe’s Transport Performance & Risk Analysis Framework",
                'tagline' => 'Supporting the transition to a decarbonised transport system that is resilient and adaptive to a changing climate.',
                'cta_label' => 'What is TPRAF?',
                'cta_href' => '#what-is-tpraf',
                'photo' => 'assets/img/hero-road.jpg',
            ], null],
            ['rich_text', [
                'heading_style' => 'figure',
                'pill' => 'Overview',
                'heading' => 'What is TPRAF?',
                'icon' => 'assets/icons/framework-navy.svg',
                'body' => "DARe’s Transport Performance & Risk Analysis Framework (TPRAF) is a flexible, validated framework that helps transport decision-makers assess climate risks, resilience, adaptation, and decarbonisation while maintaining system-wide transport performance.",
                'lead' => 'It can be used by a wide range of transport decision-makers, including:',
            ], $whatIsTpraf],
            ['audience_tile', ['number' => '01', 'icon' => 'assets/icons/audience-1.svg', 'label' => 'National infrastructure owners'], $whatIsTpraf],
            ['audience_tile', ['number' => '02', 'icon' => 'assets/icons/audience-2.svg', 'label' => 'Local and combined authorities'], $whatIsTpraf],
            ['audience_tile', ['number' => '03', 'icon' => 'assets/icons/audience-3.svg', 'label' => 'Transport operators'], $whatIsTpraf],
            ['audience_tile', ['number' => '04', 'icon' => 'assets/icons/audience-4.svg', 'label' => 'Freight companies'], $whatIsTpraf],
            ['audience_tile', ['number' => '05', 'icon' => 'assets/icons/audience-5.svg', 'label' => 'Consultancies'], $whatIsTpraf],
            ['audience_tile', ['number' => '06', 'icon' => 'assets/icons/audience-6.svg', 'label' => 'Researchers'], $whatIsTpraf],
            ['rich_text', [
                'heading_style' => 'plain',
                'paragraph_style' => 'closing',
                'body' => 'It complements existing processes by integrating assessments and decision-making, improving data sharing, reducing fragmentation, and supporting better alignment across strategic, operational, and investment decisions.',
            ], $whatIsTpraf],
            ['rich_text', [
                'heading_style' => 'header',
                'heading' => 'About the TPRAF Diagram',
                'pill' => 'The resource',
                'body' => 'This interactive TPRAF is one of several DARe Hub resources, alongside the full TPRAF report and DARe Handbook. Together, they explain the framework, its development, and how to apply it in practice.',
            ], $about],
            ['resource_card', [
                'icon' => 'assets/icons/icon-publications.png',
                'title' => "Full\nTPRAF report",
                'body' => 'The purpose, structure, and development of the framework.',
                'link_href' => 'https://dare.ac.uk/news/dare-unveils-first-version-of-innovative-framework-tpraf/',
                'link_label' => 'Full TPRAF report — read the DARe news article',
            ], $about],
            ['resource_card', [
                'icon' => 'assets/icons/handbook.svg',
                'title' => "DARe\nHandbook",
                'body' => "Guidance on operationalizing the framework’s components in practice.",
                'link_href' => 'https://dare-private.netlify.app',
                'link_label' => 'DARe Handbook',
            ], $about],
            ['resource_card', [
                'icon' => 'assets/icons/icon-search-card.svg',
                'title' => "This interactive\ndiagram",
                'body' => 'Explore the framework at your own pace.',
            ], $about],
            ['rich_text', [
                'heading_style' => 'plain',
                'body' => 'This interactive resource provides an accessible introduction to TPRAF, allowing users to explore its structure, components, and relationships before moving on to the detailed DARe guidance and tools.',
            ], $about],
            ['diagram_embed', [
                'default_view' => 'simple',
                'mode' => 'single',
                'show_extend_link' => true,
                'extend_link_href' => '/diagram#extended',
                'section_heading' => 'The simple form',
                'section_pill' => 'Level 1',
            ], null],
            ['rich_text', ['heading_style' => 'header', 'heading' => 'Further Information'], $further],
            ['info_bar', [
                'icon' => 'assets/icons/bar-website.svg',
                'label' => 'DARe Website',
                'body' => "The DARe Hub’s main site, at dare.ac.uk.",
                'link_href' => 'https://dare.ac.uk',
                'link_label' => 'Visit dare.ac.uk',
            ], $further],
            ['info_bar', [
                'icon' => 'assets/icons/bar-repository.svg',
                'label' => 'DARe Repository',
                'body' => 'Datasets, models, and outputs from across the DARe Hub.',
                'link_href' => 'https://repository.dare.ac.uk/',
                'link_label' => 'Visit the repository',
            ], $further],
            ['info_bar', [
                'icon' => 'assets/icons/bar-email.svg',
                'label' => 'Email us',
                'body' => "Questions about TPRAF or the DARe Hub’s work.",
                'link_href' => 'mailto:darehub@newcastle.ac.uk',
                'link_label' => 'darehub@newcastle.ac.uk',
            ], $further],
            ['acknowledgements', [
                'icon' => 'assets/icons/ack-quote.svg',
                'body' => "The development of the DARe Transport Performance & Risk Analysis Framework (TPRAF) has been a collaborative effort involving colleagues from across the DARe Hub, particularly those contributing to Work Packages 2 and 3. The authors gratefully acknowledge the wider DARe team for their expertise, insights, and contributions to the framework’s development and refinement. We also thank DARe’s project partners and stakeholders, whose engagement, challenge, and practical experience have helped ensure that the TPRAF is grounded in real-world transport infrastructure decision-making and reflects the needs of its intended users.\n\n**This work was funded by UK Research and Innovation (UKRI) through the Engineering and Physical Sciences Research Council (EPSRC), and by the Department for Transport, under EPSRC Grant EP/Y024257/1, *Research Hub for Decarbonised Adaptable and Resilient Transport Infrastructures (DARe)*.**",
            ], $further],
            ['research_notice', [
                'heading' => 'Research Output Notice',
                'body' => "This website contains original research outputs developed through the DARe programme. The concepts, frameworks, methodologies and supporting diagrams and texts presented here — including the Transport Performance & Risk Analysis Framework, Decision Support Process (DSP) and Integrated Modelling Platform (IMP) — represent ongoing research and development, and constitute intellectual output developed through the DARe research programme.\n\nAcademic publications describing the detailed scientific and methodological basis of these outputs are currently in preparation. All users are requested to acknowledge and appropriately cite DARe and relevant outputs and publications when using, referencing, adapting, or building upon material presented through this resource.\n\nAll website content is © National Hub for Decarbonised, Adaptable, Resilient Transport Infrastructures (DARe) – a consortium comprising Newcastle University, University of Cambridge, University of Glasgow, Heriot-Watt University, and Anglia Ruskin University, funded by UKRI EPSRC and the UK Government Department for Transport. All rights reserved.",
            ], $further],
            ['cta_band', [
                'heading' => 'Explore the framework',
                'body' => 'A guided, interactive walkthrough. Start with the simple form above, then move through the extended diagram and the Level 2 component maps.',
                'button_label' => 'Explore TPRAF',
                'button_href' => '/diagram#extended',
            ], null],
        ];

        $this->createBlocks($page, $blocks);
    }

    private function seedDiagram(): void
    {
        $page = Page::updateOrCreate(
            ['slug' => 'diagram'],
            ['title' => 'Explore TPRAF', 'status' => 'published'],
        );

        $page->blocks()->delete();

        $this->createBlocks($page, [
            ['diagram_embed', [
                'default_view' => 'simple',
                'mode' => 'tabbed',
            ], null],
        ]);
    }

    /** @param  array<int, array{0: string, 1: array<string, mixed>, 2: ?array{0: string, 1: ?string}}>  $blocks */
    private function createBlocks(Page $page, array $blocks): void
    {
        foreach ($blocks as $position => [$type, $props, $section]) {
            $page->blocks()->create([
                'block_type' => $type,
                'position' => $position + 1,
                'section_class' => $section[0] ?? null,
                'section_id' => $section[1] ?? null,
                'props' => $props,
            ]);
        }
    }
}
