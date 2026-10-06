<div class="ack reveal ack-notice">
  <div class="ack-text">
    <h3 class="ack-heading">{{ $props['heading'] ?? '' }}</h3>
    @foreach(\App\Support\Markup::paragraphs($props['body'] ?? null) as $paragraph)
      <p>{!! \App\Support\Markup::inline(e($paragraph)) !!}</p>
    @endforeach
  </div>
</div>
