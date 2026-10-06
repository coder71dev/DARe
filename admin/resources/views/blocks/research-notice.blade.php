<div class="ack reveal ack-notice">
  <div class="ack-text">
    <h3 class="ack-heading" {!! \App\Support\LiveEdit::attrs($block, 'heading') !!}>{{ $props['heading'] ?? '' }}</h3>
    @foreach(\App\Support\Markup::paragraphs($props['body'] ?? null) as $paragraph)
      <p {!! \App\Support\LiveEdit::attrs($block, 'body', multiline: true, format: 'markdown') !!}>{!! \App\Support\Markup::inline(e($paragraph)) !!}</p>
    @endforeach
  </div>
</div>
