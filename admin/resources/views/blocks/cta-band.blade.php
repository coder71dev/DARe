<section class="cta-band band-mist" aria-labelledby="explore-title">
  <div class="container cta-inner">
    <div>
      <h2 id="explore-title" {!! \App\Support\LiveEdit::attrs($block, 'heading') !!}>{{ $props['heading'] ?? '' }}</h2>
      <p {!! \App\Support\LiveEdit::attrs($block, 'body', multiline: true) !!}>{{ $props['body'] ?? '' }}</p>
    </div>
    <a class="cta-button" href="{{ $props['button_href'] ?? '#' }}"><span {!! \App\Support\LiveEdit::attrs($block, 'button_label') !!}>{{ $props['button_label'] ?? 'Explore TPRAF' }}</span> <svg class="cta-circle" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path transform="translate(6.04 6.04) scale(.72)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg></a>
  </div>
</section>
