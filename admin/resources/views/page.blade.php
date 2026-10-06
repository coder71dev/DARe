@extends('layouts.app')

@section('title', $page->meta_title ?: $page->title)
@section('description', $page->meta_description ?: "An interactive walkthrough of DARe's Transport Performance & Risk Analysis Framework (TPRAF).")

@section('content')
<main>
  @foreach($renderUnits as $unit)
    @if($unit['wrap'])
      <section class="section">
        <div class="container">
          @include('partials.render-unit', ['unit' => $unit])
        </div>
      </section>
    @else
      @include('partials.render-unit', ['unit' => $unit])
    @endif
  @endforeach
</main>
@endsection
