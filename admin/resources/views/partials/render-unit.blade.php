@if($unit['type'] === 'block')
  @include(\App\Support\BlockTypes::view($unit['block']->block_type), ['props' => $unit['block']->props ?? []])
@else
  <{{ $unit['tag'] }} class="{{ $unit['class'] }}">
    @foreach($unit['blocks'] as $block)
      @include(\App\Support\BlockTypes::view($block->block_type), ['props' => $block->props ?? []])
    @endforeach
  </{{ $unit['tag'] }}>
@endif
