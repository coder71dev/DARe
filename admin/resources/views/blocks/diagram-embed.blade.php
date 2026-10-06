@php
  $mode = $props['mode'] ?? 'single';
  $tabbed = $mode === 'tabbed';
@endphp
@if($tabbed)
  {{-- A large chunk of style.css's diagram layout (toolbar grid position,
       process-toggle styling, responsive tweaks, ...) is gated behind this
       body class — see `.diagram-page` rules in style.css. --}}
  @push('body-class') diagram-page @endpush
  <section class="hero diagram-hero" aria-labelledby="diagram-title">
    <div class="container diagram-hero-inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="{{ route('home') }}">Home</a> <span aria-hidden="true">&gt;</span> <span aria-current="page">Explore TPRAF</span>
      </nav>
      <div class="diagram-hero-title">
        <p class="hero-label" id="diagram-subtitle"></p>
        <h1 id="diagram-title"></h1>
      </div>
    </div>
  </section>
@endif
<section class="section {{ $tabbed ? 'band-mist diagram-band' : 'band-leaf' }}" aria-label="TPRAF diagram">
<div class="container">
@if(! $tabbed && ! empty($props['section_heading']))
  <header class="section-head reveal">
    <h2>{{ $props['section_heading'] }}</h2>
    @if(! empty($props['section_pill']))
      <span class="pill pill-navy">{{ $props['section_pill'] }}</span>
    @endif
  </header>
@endif
<div class="landing-diagram" data-default-view="{{ $props['default_view'] ?? 'simple' }}">
  @if($tabbed)
    <div class="level-select" id="level-select">
      <button type="button" class="level-current" id="level-current" aria-expanded="false" aria-controls="diagram-toolbar">
        <span class="level-current-label" id="level-current-label">Level 1 - Simple</span>
        <svg class="level-current-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 7.5 10 12l4.5-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="diagram-toolbar" id="diagram-toolbar" role="tablist" aria-label="Diagram level">
        <button class="level-tab" data-view="simple" aria-selected="true">Level 1 - Simple</button>
        <button class="level-tab" data-view="extended">Level 1 - Extended</button>
        <button class="level-tab" data-view="dsp">Level 2 - DSP</button>
        <button class="level-tab" data-view="imp">Level 2 - IMP</button>
        <button class="level-tab" data-view="level3">Level 3 - Example</button>
      </div>
    </div>
  @else
    <h3 class="diagram-title" id="diagram-title"></h3>
    <p class="diagram-subtitle" id="diagram-subtitle"></p>

    @if($props['show_extend_link'] ?? true)
      <a class="btn-sm btn-sm-solid landing-extend" href="{{ $props['extend_link_href'] ?? (route('diagram').'#extended') }}">Explore the extended form <svg class="btn-sm-icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path transform="translate(6.04 6.04) scale(.72)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg></a>
    @endif
  @endif

  @include('partials.diagram-guide')
  @include('partials.process-toggle')

  @if($tabbed)
    <div class="diagram-tour" id="diagram-tour">
      <button type="button" class="tour-play tour-guide" id="lesson-start-inline" hidden>
        <span class="tour-play-icon" aria-hidden="true"></span>
        <span id="lesson-start-inline-label">Take the guided tour</span>
      </button>
      <button type="button" class="tour-play" id="tour-play">
        <span class="tour-play-icon" aria-hidden="true"></span>
        <span id="tour-play-label">Play walkthrough</span>
      </button>
      <p class="tour-caption" id="tour-caption" aria-live="polite">Watch the steps play.</p>
      <div class="tour-actions">
        <button type="button" class="tour-btn" id="tour-restart" hidden>Restart</button>
        <button type="button" class="tour-btn" id="tour-stop" hidden>Stop</button>
      </div>
    </div>

    <div class="diagram-tour lesson-launch" id="lesson-launch" hidden>
      <button type="button" class="tour-play" id="lesson-start">
        <span class="tour-play-icon" aria-hidden="true"></span>
        <span id="lesson-start-label">Take the guided tour</span>
      </button>
      <p class="tour-caption" id="lesson-launch-caption">Or click any box to have it explained.</p>
    </div>

    <p class="scroll-hint">&larr; Swipe to explore &rarr;</p>
    @include('partials.diagram-viewport')

    <p class="view-next" id="view-next" hidden><a class="inline-link" id="view-next-link" href="#"></a></p>
  @else
    <p class="scroll-hint">&larr; Swipe or drag to explore the full diagram &rarr;</p>
    <div class="diagram-viewport">
      <div class="diagram-tour" id="diagram-tour">
        <button type="button" class="tour-play tour-guide" id="lesson-start-inline" hidden>
          <span class="tour-play-icon" aria-hidden="true"></span>
          <span id="lesson-start-inline-label">Take a tour</span>
        </button>
        <button type="button" class="tour-play" id="tour-play">
          <span class="tour-play-icon" aria-hidden="true"></span>
          <span id="tour-play-label">Play walkthrough</span>
        </button>
        <p class="tour-caption" id="tour-caption" aria-live="polite">Watch the steps play.</p>
        <div class="tour-actions">
          <button type="button" class="tour-btn" id="tour-restart" hidden>Restart</button>
          <button type="button" class="tour-btn" id="tour-stop" hidden>Stop</button>
        </div>
      </div>
      <button type="button" class="zoom-toggle" id="zoom-toggle" aria-expanded="false" aria-controls="zoom-controls" aria-label="Zoom controls">
        <img src="{{ asset('assets/icons/zoom-plus.svg') }}" alt="" width="45" height="45" />
      </button>
      <div class="zoom-controls" id="zoom-controls" role="group" aria-label="Zoom diagram">
        <button type="button" id="zoom-out" aria-label="Zoom out">&minus;</button>
        <span class="zoom-level" id="zoom-level">100%</span>
        <button type="button" id="zoom-in" aria-label="Zoom in">+</button>
        <div class="zoom-divider"></div>
        <button type="button" id="zoom-fit" aria-label="Fit diagram to screen">Fit</button>
        <button type="button" id="zoom-reset" aria-label="Reset zoom">Reset</button>
      </div>
      <div class="diagram-stage-wrap" id="diagram-stage-wrap">
        <div class="zoom-sizer" id="zoom-sizer">
          <div class="diagram-crop" id="diagram-crop">
            <div class="diagram-stage" id="diagram-stage">
              <svg class="arrows-layer" id="arrows-layer"></svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="process-panel" id="process-panel" hidden>
      <h4 id="process-panel-title"></h4>
      <p id="process-panel-text"></p>
      <a class="process-panel-explore" id="process-panel-explore" href="#" hidden></a>
    </div>
  @endif
</div>
</div>
</section>
