@php
  $paragraphs = \App\Support\Markup::paragraphs($props['body'] ?? null);
  $style = $props['heading_style'] ?? 'plain';
@endphp
@if($style === 'figure')
  <div class="what-intro">
    @if(! empty($props['icon']))
      <div class="what-figure reveal">
        <img src="{{ asset($props['icon']) }}" alt="" width="1482" height="1482" />
      </div>
    @endif
    <div class="what-copy reveal">
      @if(! empty($props['pill']))
        <span class="pill">{{ $props['pill'] }}</span>
      @endif
      @if(! empty($props['heading']))
        <h2>{{ $props['heading'] }}</h2>
      @endif
      @foreach($paragraphs as $paragraph)
        <p>{{ $paragraph }}</p>
      @endforeach
      @if(! empty($props['lead']))
        <p class="what-lead">{{ $props['lead'] }}</p>
      @endif
    </div>
  </div>
@else
  @if($style === 'header' && (! empty($props['heading']) || ! empty($props['pill'])))
    <header class="section-head reveal">
      @if(! empty($props['heading']))
        <h2>{{ $props['heading'] }}</h2>
      @endif
      @if(! empty($props['pill']))
        <span class="pill">{{ $props['pill'] }}</span>
      @endif
    </header>
  @endif
  @php($paragraphClass = ($props['paragraph_style'] ?? 'normal') === 'closing' ? 'what-closing' : 'section-text')
  @foreach($paragraphs as $paragraph)
    <p class="{{ $paragraphClass }}">{{ $paragraph }}</p>
  @endforeach
  @if(! empty($props['lead']))
    <p class="what-lead">{{ $props['lead'] }}</p>
  @endif
@endif
