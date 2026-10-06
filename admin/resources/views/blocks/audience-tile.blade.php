<li class="audience-tile reveal">
  <span class="tile-num">{{ $props['number'] ?? '' }}</span>
  @if(! empty($props['icon']))
    <img class="tile-icon" src="{{ asset($props['icon']) }}" alt="" />
  @endif
  <span class="tile-label">{{ $props['label'] ?? '' }}</span>
</li>
