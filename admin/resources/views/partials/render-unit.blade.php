@if($unit['type'] === 'block')
  @include('partials.render-block', ['block' => $unit['block']])
@else
  <{{ $unit['tag'] }} class="{{ $unit['class'] }}">
    @foreach($unit['blocks'] as $block)
      @include('partials.render-block', ['block' => $block])
    @endforeach
  </{{ $unit['tag'] }}>
@endif
