<li class="audience-tile reveal">
  <span class="tile-num" {!! \App\Support\LiveEdit::attrs($block, 'number') !!}>{{ $props['number'] ?? '' }}</span>
  @if(! empty($props['icon']))
    @php($iconDims = \App\Support\IconMetrics::dimensions($props['icon']))
    <img class="tile-icon" src="{{ asset($props['icon']) }}" alt=""
      @if($iconDims) width="{{ $iconDims['width'] }}" height="{{ $iconDims['height'] }}" @endif
      style="{{ \App\Support\IconMetrics::style($props['icon']) }}" />
  @endif
  <span class="tile-label" {!! \App\Support\LiveEdit::attrs($block, 'label') !!}>{{ $props['label'] ?? '' }}</span>
</li>
