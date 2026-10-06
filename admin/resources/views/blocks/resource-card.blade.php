<li class="resource-card reveal">
  @if(! empty($props['link_href']))
    <a class="resource-card-link" href="{{ $props['link_href'] }}" target="_blank" rel="noopener" aria-label="{{ $props['link_label'] ?? $props['title'] ?? '' }}"></a>
  @endif
  @if(! empty($props['icon']))
    <img class="card-icon" src="{{ asset($props['icon']) }}" alt="" />
  @endif
  <h3>{!! nl2br(e($props['title'] ?? '')) !!}</h3>
  <p>{{ $props['body'] ?? '' }}</p>
</li>
