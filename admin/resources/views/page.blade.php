@extends('layouts.app')

@section('title', $page->meta_title ?: $page->title)
@section('description', $page->meta_description ?: "An interactive walkthrough of DARe's Transport Performance & Risk Analysis Framework (TPRAF).")

@php($diagramBlock = $page->blocks->firstWhere('block_type', 'diagram_embed'))

@section('content')
<main>
  @foreach($renderUnits as $section)
    @if($section['type'] === 'standalone')
      @include('partials.render-block', ['block' => $section['block']])
    @else
      <section class="section {{ $section['section_class'] }}" @if($section['section_id']) id="{{ $section['section_id'] }}" @endif>
        <div class="container">
          @foreach($section['units'] as $unit)
            @include('partials.render-unit', ['unit' => $unit])
          @endforeach
        </div>
      </section>
    @endif
  @endforeach
</main>

{{-- These diagram-wide overlays (tour spotlight, guided-tour card, picture
     lightbox, the DSP/IMP explainer sheet, and the box-detail popup) sit
     right before the footer in the original markup regardless of where the
     diagram_embed block itself is in the page, since they're page-level
     overlays, not part of the diagram's own flow. Their relative order
     differs between the original index.html (modal first) and diagram.html
     (modal last) — matched here rather than picking one arbitrarily. --}}
@if($diagramBlock)
  @if(($diagramBlock->props['mode'] ?? 'single') === 'tabbed')
    @include('partials.lesson')
    @include('partials.process-panel-sheet')
    @include('partials.modal')
  @else
    @include('partials.modal')
    @include('partials.lesson')
  @endif
@endif
@endsection
