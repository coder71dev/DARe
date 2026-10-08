<li class="resource-card reveal">
  @if(! empty($props['link_href']))
    <a class="resource-card-link" href="{{ $props['link_href'] }}" target="_blank" rel="noopener" aria-label="{{ $props['link_label'] ?? $props['title'] ?? '' }}"></a>
  @endif
  @if(! empty($props['icon']))
    @php($iconDims = \App\Support\IconMetrics::dimensions($props['icon']))
    <img class="card-icon" src="{{ asset($props['icon']) }}" alt=""
      @if($iconDims) width="{{ $iconDims['width'] }}" height="{{ $iconDims['height'] }}" @endif
      style="{{ \App\Support\IconMetrics::style($props['icon']) }}"
      {!! \App\Support\LiveEdit::imageAttrs($block, 'icon') !!} />
  @endif
  <h3 {!! \App\Support\LiveEdit::attrs($block, 'title', multiline: true, format: 'br') !!}>{!! nl2br(e($props['title'] ?? '')) !!}</h3>
  <p {!! \App\Support\LiveEdit::attrs($block, 'body', multiline: true) !!}>{{ $props['body'] ?? '' }}</p>
</li>
