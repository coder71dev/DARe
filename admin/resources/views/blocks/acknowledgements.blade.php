<div class="ack reveal">
  @if(! empty($props['icon']))
    <img class="ack-icon" src="{{ asset($props['icon']) }}" alt="" width="142" height="104" />
  @endif
  <div class="ack-text">
    @foreach(\App\Support\Markup::paragraphs($props['body'] ?? null) as $paragraph)
      <p>{{ $paragraph }}</p>
    @endforeach
  </div>
</div>
