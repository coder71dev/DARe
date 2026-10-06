<div class="diagram-viewport">
  <button type="button" class="zoom-toggle" id="zoom-toggle" aria-expanded="false" aria-controls="zoom-controls" aria-label="Zoom controls">
    <img src="{{ asset('assets/icons/zoom-plus.svg') }}" alt="" width="45" height="45" />
  </button>
  <div class="zoom-controls" id="zoom-controls" role="group" aria-label="Zoom diagram">
    <button type="button" id="zoom-out" aria-label="Zoom out">&minus;</button>
    <span class="zoom-level" id="zoom-level">100%</span>
    <button type="button" id="zoom-in" aria-label="Zoom in">+</button>
    <div class="zoom-divider"></div>
    <button type="button" id="zoom-fit" aria-label="Fit diagram to screen">Fit</button>
    <button type="button" id="zoom-reset" aria-label="Reset zoom">Reset</button>
  </div>
  <div class="diagram-stage-wrap" id="diagram-stage-wrap">
    <div class="zoom-sizer" id="zoom-sizer">
      <div class="diagram-crop" id="diagram-crop">
        <div class="diagram-stage" id="diagram-stage">
          <svg class="arrows-layer" id="arrows-layer"></svg>
        </div>
      </div>
    </div>
  </div>
</div>
