<div class="modal-backdrop" id="modal-backdrop" hidden>
  <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <button class="modal-close" id="modal-close" aria-label="Close">&times;</button>
    <h2 id="modal-title"></h2>
    <p id="modal-text"></p>
    <span class="placeholder-note" id="modal-placeholder-note" hidden>Awaiting final text from DARe</span>
    <br />
    <a class="modal-handbook-link" id="modal-handbook-link" href="https://dare-private.netlify.app" target="_blank" rel="noopener" hidden><span {!! \App\Support\LiveEdit::attrs($diagramChromeBlock ?? null, 'handbook_link_text') !!}>{{ $diagramChromeBlock->props['handbook_link_text'] ?? 'Take me to the Handbook →' }}</span></a>
  </div>
</div>
