@extends('layouts.app')

@section('title', 'TPRAF Interactive Diagram — DARe')
@section('body-class', 'diagram-page')

@section('content')
<main>

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

  <section class="section band-mist diagram-band" aria-label="TPRAF diagrams">
    <div class="container">

      <div class="landing-diagram">
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

        @include('partials.diagram-guide')
        @include('partials.process-toggle')

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
      </div>

    </div>
  </section>

</main>

@include('partials.lesson')

<div class="process-panel process-sheet" id="process-panel" role="region" aria-labelledby="process-panel-title" hidden>
  <button type="button" class="lesson-close process-sheet-close" id="process-panel-close" aria-label="Close this explanation"></button>
  <h2 id="process-panel-title"></h2>
  <p id="process-panel-text"></p>
  <div class="process-sheet-more" id="process-panel-more"></div>
  <div class="process-sheet-actions">
    <button type="button" class="process-sheet-toggle" id="process-panel-toggle" aria-expanded="false" aria-controls="process-panel-more" hidden>Read more</button>
    <a class="process-panel-explore" id="process-panel-explore" href="#" hidden></a>
  </div>
</div>

@include('partials.modal')
@endsection
