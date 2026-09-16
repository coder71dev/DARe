/* ==========================================================================
   TPRAF interactive diagram renderer.
   Reads box/label/arrow data from the TPRAF_CONTENT global and draws
   a clickable flowchart. Click a box or label -> popup with its text
   and a "Take me to the Handbook" link.

   LARAVEL MIGRATION NOTE: this file reads only the TPRAF_CONTENT global —
   it never touches content.js, fetch(), or the DOM structure outside the
   #diagram-stage/#modal-backdrop elements it's given. That means this file
   moves into public/assets/js/app.js completely unchanged when the site
   becomes a Laravel app; only where TPRAF_CONTENT comes from changes.
   See MIGRATION-NOTES.md.
   ========================================================================== */

(function () {
  const stage = document.getElementById("diagram-stage");
  const svgLayer = document.getElementById("arrows-layer");
  const titleEl = document.getElementById("diagram-title");
  const subtitleEl = document.getElementById("diagram-subtitle");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalPlaceholderNote = document.getElementById("modal-placeholder-note");
  const modalHandbookLink = document.getElementById("modal-handbook-link");
  const modalCloseBtn = document.getElementById("modal-close");
  const processToggle = document.getElementById("process-toggle");
  const processPanel = document.getElementById("process-panel");
  const processPanelTitle = document.getElementById("process-panel-title");
  const processPanelText = document.getElementById("process-panel-text");
  const processBtnDsp = document.getElementById("process-btn-dsp");
  const processBtnImp = document.getElementById("process-btn-imp");
  const processBtnAll = document.getElementById("process-btn-all");

  const SVG_NS = "http://www.w3.org/2000/svg";

  function openModal(item) {
    modalTitle.textContent = item.label;
    modalText.textContent = item.text;
    modalPlaceholderNote.hidden = !item.isPlaceholder;
    if (item.handbookUrl) {
      modalHandbookLink.hidden = false;
      modalHandbookLink.href = item.handbookUrl;
    } else {
      modalHandbookLink.hidden = true;
    }
    modalBackdrop.hidden = false;
    // Two-step so the opacity/scale transition actually runs instead of
    // jumping straight from display:none to fully visible.
    requestAnimationFrame(() => modalBackdrop.classList.add("is-open"));
    modalCloseBtn.focus();
  }

  function closeModal() {
    modalBackdrop.classList.remove("is-open");
    modalBackdrop.hidden = true;
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  function pct(n) {
    return n + "%";
  }

  /* The SVG uses a 0-100 viewBox (matching the % coordinates in content.js)
     so <line> and <polyline> share one coordinate system. <polyline points>
     doesn't support "%" units the way <line x1/y1> does, so a shared
     viewBox is the only way to keep both consistent and responsive. */
  function setupViewBox() {
    svgLayer.setAttribute("viewBox", "0 0 100 100");
    svgLayer.setAttribute("preserveAspectRatio", "none");
  }

  function buildMarker(id, fill) {
    const marker = document.createElementNS(SVG_NS, "marker");
    marker.setAttribute("id", id);
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "8");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "4");
    marker.setAttribute("markerHeight", "4");
    marker.setAttribute("orient", "auto-start-reverse");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("fill", fill);
    marker.appendChild(path);
    return marker;
  }

  function makeArrowMarker() {
    const defs = document.createElementNS(SVG_NS, "defs");
    defs.appendChild(buildMarker("arrowhead", "#00295e"));
    defs.appendChild(buildMarker("feedback-arrowhead", "#3fae52"));
    return defs;
  }

  function drawStraightArrow(arrow) {
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", arrow.from.x);
    line.setAttribute("y1", arrow.from.y);
    line.setAttribute("x2", arrow.to.x);
    line.setAttribute("y2", arrow.to.y);
    line.setAttribute("stroke", "#00295e");
    line.setAttribute("stroke-width", "0.3");
    line.setAttribute("marker-end", "url(#arrowhead)");
    svgLayer.appendChild(line);
  }

  function drawFeedbackPath(points) {
    const polyline = document.createElementNS(SVG_NS, "polyline");
    const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
    polyline.setAttribute("points", pointsStr);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#3fae52");
    polyline.setAttribute("stroke-width", "0.35");
    polyline.setAttribute("marker-end", "url(#feedback-arrowhead)");
    svgLayer.appendChild(polyline);
  }

  // Same visual style as the straight main-flow arrows, just with bends —
  // for boxes that aren't directly aligned (e.g. Extended's side branches).
  function drawElbowPath(points) {
    const polyline = document.createElementNS(SVG_NS, "polyline");
    const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
    polyline.setAttribute("points", pointsStr);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#00295e");
    polyline.setAttribute("stroke-width", "0.3");
    polyline.setAttribute("marker-end", "url(#arrowhead)");
    svgLayer.appendChild(polyline);
  }

  // A smooth single-bulge curve (quadratic bezier) — for short loops within
  // one cluster (e.g. Portfolio Optimisation back into Adaptation/Interventions)
  // where a straight elbow would look too mechanical.
  function drawCurvedPath(curve) {
    const path = document.createElementNS(SVG_NS, "path");
    const d = `M ${curve.from.x},${curve.from.y} Q ${curve.control.x},${curve.control.y} ${curve.to.x},${curve.to.y}`;
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#00295e");
    path.setAttribute("stroke-width", "0.3");
    path.setAttribute("marker-end", "url(#arrowhead)");
    svgLayer.appendChild(path);
  }

  function makeHaloEl(box) {
    const halo = document.createElement("div");
    halo.className = "diagram-box-halo";
    const padX = 1.5, padY = 2;
    halo.style.left = pct(box.pos.left - padX);
    halo.style.top = pct(box.pos.top - padY);
    halo.style.width = pct(box.pos.width + padX * 2);
    halo.style.height = pct(box.pos.height + padY * 2);
    return halo;
  }

  // Simple's boxes are all generously sized; Extended packs in smaller,
  // narrower ones (e.g. width ~9-10%, height ~6.8%) where the default font/
  // padding budget doesn't leave room for longer wrapped labels.
  function isCompactBox(box) {
    return box.pos.width < 12 || box.pos.height < 8;
  }

  function makeBoxEl(box) {
    const el = document.createElement("button");
    el.type = "button";
    const variantClass = box.variant ? ` variant-${box.variant}` : "";
    const compactClass = isCompactBox(box) ? " compact" : "";
    el.className = "diagram-box" + variantClass + compactClass + (box.isPlaceholder ? " missing-content" : "");
    el.style.left = pct(box.pos.left);
    el.style.top = pct(box.pos.top);
    el.style.width = pct(box.pos.width);
    el.style.height = pct(box.pos.height);
    el.textContent = box.label;
    if (box.group) el.dataset.group = box.group;
    if (box.rotate) el.style.setProperty("--box-rotate", box.rotate + "deg");
    el.addEventListener("click", () => openModal(box));
    return el;
  }

  function makeLabelEl(label) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "diagram-label";
    el.style.left = pct(label.pos.left);
    el.style.top = pct(label.pos.top);
    el.style.width = pct(label.pos.width);
    el.style.height = pct(label.pos.height);
    el.textContent = label.label;
    el.addEventListener("click", () => openModal(label));
    return el;
  }

  // Decorative light-blue cluster background — sits behind the boxes/arrows
  // it groups, purely visual (no click target, no text).
  function makeContainerEl(container) {
    const el = document.createElement("div");
    el.className = "diagram-cluster-bg";
    el.style.left = pct(container.pos.left);
    el.style.top = pct(container.pos.top);
    el.style.width = pct(container.pos.width);
    el.style.height = pct(container.pos.height);
    return el;
  }

  // Section titles (e.g. "Transport Scenarios") — plain text, not a
  // popup-opening control, so a div rather than a button.
  function makeHeadingEl(heading) {
    const el = document.createElement("div");
    el.className = "diagram-heading";
    el.style.left = pct(heading.pos.left);
    el.style.top = pct(heading.pos.top);
    el.style.width = pct(heading.pos.width);
    el.style.height = pct(heading.pos.height);
    el.textContent = heading.label;
    return el;
  }

  let currentProcessFilter = null; // null | "dsp" | "imp"

  function applyProcessFilter() {
    stage.querySelectorAll(".diagram-box[data-group]").forEach((el) => {
      const group = el.dataset.group;
      const dimmed = currentProcessFilter && group !== "both" && group !== currentProcessFilter;
      el.classList.toggle("dimmed", !!dimmed);
    });
  }

  function setProcessPanel(key) {
    currentProcessFilter = key;
    [processBtnAll, processBtnDsp, processBtnImp].forEach((btn) => btn && btn.setAttribute("aria-pressed", "false"));
    if (!key) {
      processPanel.hidden = true;
      if (processBtnAll) processBtnAll.setAttribute("aria-pressed", "true");
      applyProcessFilter();
      return;
    }
    const info = (typeof TPRAF_DSP_IMP !== "undefined" && TPRAF_DSP_IMP[key]) || null;
    if (info) {
      processPanelTitle.textContent = info.title;
      processPanelText.textContent = info.text;
      processPanel.hidden = false;
    }
    const activeBtn = key === "dsp" ? processBtnDsp : processBtnImp;
    if (activeBtn) activeBtn.setAttribute("aria-pressed", "true");
    applyProcessFilter();
  }

  if (processBtnAll) processBtnAll.addEventListener("click", () => setProcessPanel(null));
  if (processBtnDsp) processBtnDsp.addEventListener("click", () => setProcessPanel("dsp"));
  if (processBtnImp) processBtnImp.addEventListener("click", () => setProcessPanel("imp"));

  function renderDiagram(viewKey) {
    const data = TPRAF_CONTENT[viewKey];
    if (!data) {
      titleEl.textContent = "Coming soon";
      subtitleEl.textContent = "This level isn't built yet — check back after the next milestone.";
      svgLayer.innerHTML = "";
      stage.querySelectorAll(".diagram-box, .diagram-label").forEach((n) => n.remove());
      return;
    }

    titleEl.textContent = data.title;
    subtitleEl.textContent = data.subtitle;

    // Clear previous render
    svgLayer.innerHTML = "";
    stage.querySelectorAll(".diagram-box, .diagram-label, .diagram-heading, .diagram-box-halo, .diagram-cluster-bg").forEach((n) => n.remove());

    (data.containers || []).forEach((container) => stage.appendChild(makeContainerEl(container)));

    setupViewBox();
    svgLayer.appendChild(makeArrowMarker());
    (data.arrows || []).forEach(drawStraightArrow);
    (data.elbowPaths || []).forEach(drawElbowPath);
    (data.curvedPaths || []).forEach(drawCurvedPath);
    (data.feedbackPaths || []).forEach(drawFeedbackPath);

    data.boxes.forEach((box) => {
      if (box.highlight) stage.appendChild(makeHaloEl(box));
      stage.appendChild(makeBoxEl(box));
    });
    (data.labels || []).forEach((label) => stage.appendChild(makeLabelEl(label)));
    (data.headings || []).forEach((heading) => stage.appendChild(makeHeadingEl(heading)));

    const hasProcessGroups = data.boxes.some((b) => b.group);
    processToggle.hidden = !hasProcessGroups;
    currentProcessFilter = null;
    setProcessPanel(null);
    applyProcessFilter();
  }

  // Click-and-drag horizontal scroll for mouse users. Touch devices already
  // get native swipe/momentum scrolling from the CSS above, so this only
  // engages for mouse pointers (touch scrolling shouldn't be hijacked).
  function setupDragToScroll() {
    const wrap = document.getElementById("diagram-stage-wrap");
    if (!wrap) return;

    let isDown = false;
    let didDrag = false;
    let startX = 0;
    let startScrollLeft = 0;

    wrap.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      isDown = true;
      didDrag = false;
      startX = e.clientX;
      startScrollLeft = wrap.scrollLeft;
      // NOTE: don't mark "is-dragging" (which disables box pointer-events)
      // here — a plain click also fires pointerdown, and doing it this
      // early would swallow every click, not just real drags.
    });

    wrap.addEventListener("pointermove", (e) => {
      if (!isDown || e.pointerType !== "mouse") return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !didDrag) {
        didDrag = true;
        wrap.classList.add("is-dragging"); // only now, once it's a real drag
      }
      if (didDrag) wrap.scrollLeft = startScrollLeft - dx;
    });

    function endDrag() {
      isDown = false;
      wrap.classList.remove("is-dragging");
    }
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointerleave", endDrag);

    // Swallow the click that follows a genuine drag so it doesn't
    // accidentally open a box's popup.
    wrap.addEventListener(
      "click",
      (e) => {
        if (didDrag) {
          e.stopPropagation();
          e.preventDefault();
          didDrag = false;
        }
      },
      true
    );
  }

  // Zoom controls. The diagram's "natural" (unzoomed) width is responsive —
  // same 900-1200px range the original design used — and is visually scaled
  // on top of that with a CSS transform, which is what keeps text, borders,
  // and spacing all shrinking/growing together in proportion, instead of
  // the box resizing while text (sized in viewport units) stays the same
  // physical size and overflows.
  //
  // A transform alone doesn't tell the scrolling wrap how big the result
  // actually looks (confirmed empirically: scrollWidth ignores transforms
  // entirely), so #zoom-sizer exists purely to carry the real, untransformed
  // width/height that matches what you see — that's what the scrollbar and
  // drag-to-scroll actually measure against.
  function setupZoomControls() {
    const stage = document.getElementById("diagram-stage");
    const sizer = document.getElementById("zoom-sizer");
    const wrap = document.getElementById("diagram-stage-wrap");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const zoomFitBtn = document.getElementById("zoom-fit");
    const zoomResetBtn = document.getElementById("zoom-reset");
    const zoomLevelEl = document.getElementById("zoom-level");
    if (!stage || !sizer || !wrap || !zoomInBtn || !zoomOutBtn || !zoomFitBtn || !zoomResetBtn || !zoomLevelEl) return;

    const MIN_NATURAL_WIDTH = 900; // same floor the original static CSS used
    const MAX_NATURAL_WIDTH = 1200; // same ceiling the original static CSS used
    const ABSOLUTE_MIN_ZOOM = 0.25; // safety floor so it can never become unusably tiny
    const MAX_ZOOM = 2;
    const STEP = 0.15;
    let zoom = 1;

    function availableWidth() {
      const wrapStyle = getComputedStyle(wrap);
      const paddingX = parseFloat(wrapStyle.paddingLeft) + parseFloat(wrapStyle.paddingRight);
      return wrap.clientWidth - paddingX;
    }

    // What the diagram would be at 100% right now, before any zoom —
    // mirrors width:100%; min-width:900px; max-width:1200px.
    function naturalWidth() {
      return Math.min(MAX_NATURAL_WIDTH, Math.max(MIN_NATURAL_WIDTH, availableWidth()));
    }

    function fitZoom() {
      return Math.max(ABSOLUTE_MIN_ZOOM, Math.min(1, availableWidth() / naturalWidth()));
    }

    function applyZoom() {
      zoom = Math.max(ABSOLUTE_MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
      const natW = naturalWidth();
      const natH = Math.round((natW * 6858) / 12192);
      stage.style.width = Math.round(natW) + "px";
      stage.style.transform = Math.abs(zoom - 1) < 0.005 ? "" : `scale(${zoom})`;
      sizer.style.width = Math.round(natW * zoom) + "px";
      sizer.style.height = Math.round(natH * zoom) + "px";
      zoomLevelEl.textContent = Math.round(zoom * 100) + "%";
      zoomInBtn.disabled = zoom >= MAX_ZOOM - 0.001;
      zoomOutBtn.disabled = zoom <= ABSOLUTE_MIN_ZOOM + 0.001;
    }

    zoomInBtn.addEventListener("click", () => {
      zoom += STEP;
      applyZoom();
    });
    zoomOutBtn.addEventListener("click", () => {
      zoom -= STEP;
      applyZoom();
    });
    zoomFitBtn.addEventListener("click", () => {
      zoom = fitZoom();
      wrap.scrollLeft = 0;
      applyZoom();
    });
    zoomResetBtn.addEventListener("click", () => {
      zoom = 1;
      wrap.scrollLeft = 0;
      applyZoom();
    });
    window.addEventListener("resize", applyZoom);

    applyZoom();
  }

  // Level tab wiring
  document.querySelectorAll(".level-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.disabled) return;
      document.querySelectorAll(".level-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      renderDiagram(tab.dataset.view);
    });
  });

  // Initial render
  renderDiagram("simple");
  setupDragToScroll();
  setupZoomControls();
})();
