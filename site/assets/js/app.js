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
  const processPanelExplore = document.getElementById("process-panel-explore");
  // The diagram page's panel is a bottom sheet with these extras; the home
  // page's copy has none of them and is never shown.
  const processPanelMore = document.getElementById("process-panel-more");
  const processPanelToggle = document.getElementById("process-panel-toggle");
  const processPanelClose = document.getElementById("process-panel-close");
  const processBtnDsp = document.getElementById("process-btn-dsp");
  const processBtnImp = document.getElementById("process-btn-imp");
  const processBtnAll = document.getElementById("process-btn-all");
  const guideEl = document.getElementById("diagram-guide");
  const guideToggle = document.getElementById("diagram-guide-toggle");
  const guideBody = document.getElementById("diagram-guide-body");
  const stageWrap = document.getElementById("diagram-stage-wrap");
  const cropEl = document.getElementById("diagram-crop");
  // Optional: the landing page's embedded copy of the diagram omits this,
  // since it has its own link out and never switches views.
  const viewNextEl = document.getElementById("view-next");
  const viewNextLink = document.getElementById("view-next-link");

  const SVG_NS = "http://www.w3.org/2000/svg";

  function openModal(item) {
    // Reading a box takes over from watching the walkthrough — otherwise the
    // diagram keeps panning around behind the popup.
    if (tourState.running) stopTour();
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
    if (e.key !== "Escape") return;
    const popupWasOpen = !modalBackdrop.hidden;
    closeModal();
    if (tourState.running) stopTour();
    if (!popupWasOpen) hideProcessSheet();
  });

  function pct(n) {
    return n + "%";
  }

  // Horizontal coordinate space can exceed 100 (e.g. the wider Level 2 DSP
  // layout). HTML left/width are scaled by this so they stay in the same
  // coordinate system the SVG viewBox uses — see computeMaxX()/pctX().
  let currentMaxX = 100;
  function pctX(n) {
    return (n / currentMaxX) * 100 + "%";
  }

  let currentCropRatio = 1; // fraction of the full 0-100 stage height that's actually visible
  let refreshZoom = function () {}; // replaced with the real thing once setupZoomControls runs
  let setZoomLevel = function () {}; // likewise: sets an exact zoom (the guided tour uses it on phones)

  // The source PPTX's box/label positions are percentages of the *full
  // slide*, but most views only use the middle portion of it vertically —
  // showing the whole 0-100 canvas leaves a large dead margin above/below
  // the content. This finds the actual top/bottom extent of everything
  // drawn (boxes, using their rotated visual footprint where relevant;
  // labels; headings; cluster backgrounds) so the stage can be cropped to
  // just that, with a small buffer for halos/start-ribbons/shadows that
  // extend slightly past a box's own bounds.
  function computeContentBounds(data) {
    const PAD = 3;
    let top = Infinity;
    let bottom = -Infinity;
    const consider = (t, b) => {
      if (t < top) top = t;
      if (b > bottom) bottom = b;
    };
    data.boxes.forEach((box) => {
      if (box.rotate) {
        // Rotation (270/90) swaps width and height around the box's own
        // centre — the on-screen footprint isn't the same as box.pos.
        const centerY = box.pos.top + box.pos.height / 2;
        const visualHeight = box.pos.width;
        consider(centerY - visualHeight / 2, centerY + visualHeight / 2);
      } else {
        consider(box.pos.top, box.pos.top + box.pos.height);
      }
    });
    (data.labels || []).forEach((l) => consider(l.pos.top, l.pos.top + l.pos.height));
    (data.headings || []).forEach((h) => consider(h.pos.top, h.pos.top + h.pos.height));
    (data.containers || []).forEach((c) => consider(c.pos.top, c.pos.top + c.pos.height));
    top = Math.max(0, top - PAD);
    bottom = Math.min(100, bottom + PAD);
    return { top, bottom };
  }

  // The horizontal coordinate space can exceed 100 for the wider Level 2
  // layouts. HTML left/width are expressed as a fraction of this max so
  // they share one coordinate system with the SVG viewBox.
  function computeMaxX(data) {
    let maxX = 100;
    const consider = (v) => { if (v > maxX) maxX = v; };
    (data.boxes || []).forEach((box) => {
      if (box.rotate) {
        const centerX = box.pos.left + box.pos.width / 2;
        const visualWidth = box.pos.height;
        consider(centerX + visualWidth / 2);
      } else {
        consider(box.pos.left + box.pos.width);
      }
    });
    (data.labels || []).forEach((l) => consider(l.pos.left + l.pos.width));
    (data.headings || []).forEach((h) => consider(h.pos.left + h.pos.width));
    (data.containers || []).forEach((c) => consider(c.pos.left + c.pos.width));
    return maxX;
  }

  // Sizes .diagram-stage (still the full 0-100 slide coordinate space every
  // box/arrow position is expressed in) so only [top, bottom] of it shows
  // through .diagram-crop's clipped window — no box/arrow/label coordinate
  // anywhere needs to change for this.
  function applyCropToStage(data) {
    const { top, bottom } = computeContentBounds(data);
    const span = bottom - top; // % of full height actually shown
    currentCropRatio = span / 100;
    stage.style.height = pct(10000 / span);
    stage.style.top = pct((-100 * top) / span);
  }

  /* The SVG viewBox shares one coordinate system with the % coordinates in
     content.js — width can exceed 100 for wide Level 2 layouts, so it is
     set from computeMaxX(). <polyline points> doesn't support "%" units,
     so a shared viewBox is the only way to keep everything consistent. */
  function setupViewBox() {
    svgLayer.setAttribute("viewBox", "0 0 " + currentMaxX + " 100");
    svgLayer.setAttribute("preserveAspectRatio", "none");
  }

  const COLOR_NAVY = "#00295e";
  const COLOR_GREEN = "#3fae52";
  const COLOR_GREY = "#a9b1ba"; // inactive-process colour for arrows/loops, matching the dimmed boxes they connect

  function buildMarker(id, fill) {
    const marker = document.createElementNS(SVG_NS, "marker");
    marker.setAttribute("id", id);
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "8");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6.5");
    marker.setAttribute("markerHeight", "6.5");
    marker.setAttribute("orient", "auto-start-reverse");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("fill", fill);
    marker.appendChild(path);
    return marker;
  }

  function makeArrowMarker() {
    const defs = document.createElementNS(SVG_NS, "defs");
    defs.appendChild(buildMarker("arrowhead", COLOR_NAVY));
    defs.appendChild(buildMarker("feedback-arrowhead", COLOR_GREEN));
    defs.appendChild(buildMarker("arrowhead-grey", COLOR_GREY));
    defs.appendChild(buildMarker("feedback-arrowhead-grey", COLOR_GREY));
    return defs;
  }

  // Tags a drawn arrow/path element with which DSP/IMP process it belongs
  // to, so applyProcessFilter (below) can grey it out in lockstep with the
  // boxes it connects — same idea as box.group, just for SVG shapes.
  function taggedArrow(el, group, kind) {
    if (group) {
      el.dataset.group = group;
      el.dataset.kind = kind; // "main" (navy) or "feedback" (green)
    }
    return el;
  }

  /* Every connector drawn for the current view, with the point list it was
     built from. The walkthrough uses these to work out which arrow joins two
     consecutive steps of a tour — see connectorBetween(). Rebuilt on every
     render, since switching view throws the whole SVG layer away.
     data-marker-end is stashed because the walkthrough hides the arrowhead
     while the line draws itself in, then puts it back. */
  let connectors = [];

  function recordConnector(el, kind, points) {
    const markerEnd = el.getAttribute("marker-end");
    if (markerEnd) el.dataset.markerEnd = markerEnd;
    connectors.push({ el: el, kind: kind, points: points });
  }

  function drawStraightArrow(arrow) {
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", arrow.from.x);
    line.setAttribute("y1", arrow.from.y);
    line.setAttribute("x2", arrow.to.x);
    line.setAttribute("y2", arrow.to.y);
    line.setAttribute("stroke", COLOR_NAVY);
    line.setAttribute("stroke-width", "0.18");
    // A connector that is only a leg of a shared bus (see "head: false" in
    // content.js) draws no arrowhead of its own — the single head sits at the
    // far end of the run instead, so the branch reads as one arrival rather
    // than several overlapping ones.
    if (arrow.head !== false) line.setAttribute("marker-end", "url(#arrowhead)");
    // Some source-diagram connectors (e.g. DSP's within-cluster steps) are
    // double-headed, showing free back-and-forth rather than one-way flow.
    if (arrow.bidirectional) line.setAttribute("marker-start", "url(#arrowhead)");
    svgLayer.appendChild(taggedArrow(line, arrow.group, "main"));
    recordConnector(line, "main", [arrow.from, arrow.to]);
  }

  function drawFeedbackPath(feedback) {
    const polyline = document.createElementNS(SVG_NS, "polyline");
    const pointsStr = feedback.points.map((p) => `${p.x},${p.y}`).join(" ");
    polyline.setAttribute("points", pointsStr);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", COLOR_GREEN);
    polyline.setAttribute("stroke-width", "0.22");
    polyline.setAttribute("marker-end", "url(#feedback-arrowhead)");
    svgLayer.appendChild(taggedArrow(polyline, feedback.group, "feedback"));
    recordConnector(polyline, "feedback", feedback.points);
  }

  // Same visual style as the straight main-flow arrows, just with bends —
  // for boxes that aren't directly aligned (e.g. Extended's side branches).
  function drawElbowPath(elbow) {
    const polyline = document.createElementNS(SVG_NS, "polyline");
    const pointsStr = elbow.points.map((p) => `${p.x},${p.y}`).join(" ");
    polyline.setAttribute("points", pointsStr);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", COLOR_NAVY);
    polyline.setAttribute("stroke-width", "0.18");
    if (elbow.head !== false) polyline.setAttribute("marker-end", "url(#arrowhead)");
    if (elbow.bidirectional) polyline.setAttribute("marker-start", "url(#arrowhead)");
    svgLayer.appendChild(taggedArrow(polyline, elbow.group, "main"));
    recordConnector(polyline, "main", elbow.points);
  }

  // A smooth single-bulge curve (quadratic bezier) — for short loops within
  // one cluster (e.g. Portfolio Optimisation back into Adaptation/Interventions)
  // where a straight elbow would look too mechanical.
  function drawCurvedPath(curve) {
    const path = document.createElementNS(SVG_NS, "path");
    const d = `M ${curve.from.x},${curve.from.y} Q ${curve.control.x},${curve.control.y} ${curve.to.x},${curve.to.y}`;
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", COLOR_NAVY);
    path.setAttribute("stroke-width", "0.18");
    path.setAttribute("marker-end", "url(#arrowhead)");
    svgLayer.appendChild(taggedArrow(path, curve.group, "main"));
    recordConnector(path, "main", sampleCurve(curve));
  }

  /* The walkthrough travels the drawn curve, so a bezier is sampled into the
     same point list shape the other connectors already use. Only the two ends
     matter for matching it to boxes; the samples are for the pulse's path. */
  function sampleCurve(curve) {
    const steps = 24;
    const points = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const rest = 1 - t;
      points.push({
        x: rest * rest * curve.from.x + 2 * rest * t * curve.control.x + t * t * curve.to.x,
        y: rest * rest * curve.from.y + 2 * rest * t * curve.control.y + t * t * curve.to.y
      });
    }
    return points;
  }

  function makeHaloEl(box) {
    const halo = document.createElement("div");
    halo.className = "diagram-box-halo";
    const padX = 1.5, padY = 2;
    halo.style.left = pctX(box.pos.left - padX);
    halo.style.top = pct(box.pos.top - padY);
    halo.style.width = pctX(box.pos.width + padX * 2);
    halo.style.height = pct(box.pos.height + padY * 2);
    return halo;
  }

  // Simple's boxes are all generously sized; Extended packs in smaller,
  // narrower ones (e.g. width ~9-10%, height ~6.8%) where the default font/
  // padding budget doesn't leave room for longer wrapped labels. A view can
  // also ask for it explicitly (box.compact), for a box that clears the size
  // rule above but still carries more text than the default size fits.
  function isCompactBox(box) {
    return box.compact === true || box.pos.width < 12 || box.pos.height < 8;
  }

  function makeBoxEl(box) {
    const el = document.createElement("button");
    el.type = "button";
    const variantClass = box.variant ? ` variant-${box.variant}` : "";
    const compactClass = isCompactBox(box) ? " compact" : "";
    // DSP's "Selection/Screened list" decision point is a diamond in the
    // source diagram — a shape (clip-path), not a rotation, so its label
    // stays upright and readable inside the point.
    const shapeClass = box.shape === "diamond" ? " shape-diamond" : "";
    const stackClass = box.stacked ? " is-stacked" : "";
    const attachClass = box.attachLeft ? " attach-left" : "";
    const squareClass = box.square ? " square-corners" : "";
    const verticalClass = box.vertical ? " vertical-text" : "";
    el.className = "diagram-box" + variantClass + compactClass + shapeClass + stackClass + attachClass + squareClass + verticalClass + (box.isPlaceholder ? " missing-content" : "");
    el.style.left = pctX(box.pos.left);
    el.style.top = pct(box.pos.top);
    el.style.width = pctX(box.pos.width);
    el.style.height = pct(box.pos.height);
    el.textContent = box.label;
    el.dataset.boxId = box.id; // how the walkthrough finds a step's box again
    if (box.group) el.dataset.group = box.group;
    if (box.rotate) el.style.setProperty("--box-rotate", box.rotate + "deg");
    el.addEventListener("click", () => onBoxClick(box));
    return el;
  }

  // The glow pulse used to sit permanently on one pre-chosen "Start" box.
  // Client feedback (22 Sept) wants the framework to read as start-anywhere,
  // so instead the same pulse now plays on whichever box a visitor actually
  // clicks — a "you are here" cue, not a fixed entry point. Re-triggerable:
  // removing then re-adding the class restarts a CSS animation that's
  // already running (a repeat click on the same box pulses again).
  function pulseBox(id) {
    const el = tourBoxEl(id);
    if (!el) return;
    el.classList.remove("is-clicked");
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add("is-clicked");
  }

  // While a tour runs, a box moves it to that box's step. Otherwise a box opens
  // its popup, as it always has — except on Level 3, which has no popups and
  // starts its tour at the box instead.
  function onBoxClick(box) {
    const index = lessonStepIndexOfBox(box.id);
    if (index >= 0 && lessonState.running) lessonGoTo(index, index === lessonState.index + 1);
    else if (index >= 0 && currentLesson().clickStartsTour) startLesson(index);
    else {
      pulseBox(box.id);
      openModal(box);
    }
  }

  function makeLabelEl(label) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "diagram-label";
    el.style.left = pctX(label.pos.left);
    el.style.top = pct(label.pos.top);
    el.style.width = pctX(label.pos.width);
    el.style.height = pct(label.pos.height);
    el.textContent = label.label;
    el.addEventListener("click", () => openModal(label));
    return el;
  }

  // Decorative light-blue cluster background — sits behind the boxes/arrows
  // it groups, purely visual by default (no click target, no text). A
  // "dashed" style container (no fill, dashed outline) reproduces the source
  // diagrams' sub-groupings within a cluster (e.g. DSP's Risk Assessment/
  // Asset Performance/Resilience Assessment trio) and the outer boundary
  // around Detailed Option Assessment + Portfolio Optimisation together.
  //
  // A plain "-bg" cluster background becomes clickable when its matching
  // heading (same id with "-heading" instead of "-bg") carries a `text` —
  // client feedback 23 Sept asked for the whole cluster, not just its title
  // bar, to open the column-level summary. Boxes sit visually on top of the
  // background, so this never steals a click from an individual box; it only
  // catches clicks that land on empty cluster space.
  function makeContainerEl(container, data) {
    const el = document.createElement("div");
    const variantClass = container.variant ? ` variant-${container.variant}` : "";
    const heading = container.id && container.id.endsWith("-bg")
      ? (data.headings || []).find((h) => h.id === container.id.replace(/-bg$/, "-heading"))
      : null;
    const clickable = !!(heading && heading.text);
    el.className = "diagram-cluster-bg" + variantClass + (container.style === "dashed" ? " style-dashed" : "") + (clickable ? " is-clickable" : "");
    el.style.left = pctX(container.pos.left);
    el.style.top = pct(container.pos.top);
    el.style.width = pctX(container.pos.width);
    el.style.height = pct(container.pos.height);
    // A block whose corners differ from the 14px default (IMP's L-shaped
    // clusters, where only the outer end of the run is rounded) states its
    // own radius rather than needing a class per combination.
    if (container.radius) el.style.borderRadius = container.radius;
    if (container.group) el.dataset.group = container.group;
    if (clickable) {
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.addEventListener("click", () => openModal(heading));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(heading); }
      });
    }
    return el;
  }

  // Section titles (e.g. "Transport Scenarios") — plain text by default, not
  // a popup-opening control, so a div rather than a button. An optional
  // colour variant renders it as a solid bar (matching the source Level 2
  // diagrams, where each process stage has its own coloured title bar)
  // instead of plain text.
  //
  // DSP's six cluster title bars are the exception: five of them carry the
  // client's column-level process summary (client feedback 23 Sept), so
  // those become a real clickable control — same popup a box opens — while
  // any heading with no `text` (e.g. DSP's own "Detailed Option Assessment",
  // whose summary lives on its vertical box instead per the client's own
  // "[vertical box]" note, plus every heading on other views) stays a plain,
  // non-interactive label exactly as before.
  function makeHeadingEl(heading) {
    const clickable = !!heading.text;
    const el = document.createElement(clickable ? "button" : "div");
    if (clickable) el.type = "button";
    el.className = "diagram-heading" + (heading.variant ? ` variant-${heading.variant}` : "") + (clickable ? " is-clickable" : "");
    el.style.left = pctX(heading.pos.left);
    el.style.top = pct(heading.pos.top);
    el.style.width = pctX(heading.pos.width);
    el.style.height = pct(heading.pos.height);
    el.textContent = heading.label;
    if (clickable) el.addEventListener("click", () => openModal(heading));
    return el;
  }

  /* Guide panel: collapsible legend + interaction hints, rebuilt per view
     since the colour legend's meaning shifts slightly between Simple (no
     DSP/IMP split) and Extended (colours = process).

     Always closed on load, everywhere (home page and every diagram tab) —
     the guide is a reference to open when you want it, not something that
     stands between the title and the diagram on every visit. This used to
     remember a visitor's last open/close choice via localStorage, but that
     meant it could default to open for a returning visitor; it no longer
     persists, so every fresh load starts collapsed regardless of history. */
  function setGuideCollapsed(collapsed) {
    guideEl.dataset.collapsed = collapsed ? "true" : "false";
    guideToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }

  if (guideToggle) {
    guideToggle.addEventListener("click", () => {
      setGuideCollapsed(guideEl.dataset.collapsed !== "true");
    });
    setGuideCollapsed(true);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  function buildGuideBody(data) {
    const hasProcessGroups = data.boxes.some((b) => b.group);
    // Level 2 views set their own data.legend (different meaning: box type,
    // not DSP/IMP process) instead of the Level 1 navy/sky/leaf default.
    const legend = data.legend || [
      ["navy", hasProcessGroups ? "Integrated Modelling (IMP)" : "Hazard & scenario steps"],
      ["sky", hasProcessGroups ? "Decision Support (DSP)" : "Evaluation & risk steps"]
    ];
    const legendHtml = legend
      .map(([swatch, label]) => `<li><span class="diagram-guide-swatch swatch-${swatch}"></span>${escapeHtml(label)}</li>`)
      .join("");
    // Only boxes ever actually show the little "still coming" dot on the
    // diagram (see .missing-content in style.css — labels never get it), so
    // a label-only placeholder (e.g. an unconfirmed feedback-loop caption)
    // shouldn't keep this legend line alive once every box is done.
    const hasPlaceholders = data.boxes.some((b) => b.isPlaceholder);
    const hasFeedback = (data.feedbackPaths || []).length > 0;
    const dotHtml = hasPlaceholders ? `<li><span class="diagram-guide-swatch swatch-dot"></span>Wording still coming from DARe</li>` : "";
    const lineHtml = hasFeedback ? `<li><span class="diagram-guide-swatch swatch-line"></span>Feedback loop</li>` : "";

    const toggleHint = hasProcessGroups
      ? " Use the <strong>DSP only</strong> / <strong>IMP only</strong> buttons above the diagram to follow just one process at a time."
      : "";

    // Only shown when a view sets its own data.status (DSP/IMP/Level 3, where
    // it's still accurate) — Simple and Extended used to fall back to a
    // generic "Level 2 is next" line that's stale now Level 2 exists.
    const statusHtml = data.status ? `<p class="diagram-guide-status">${escapeHtml(data.status)}</p>` : "";

    const tourHint = (data.tour || []).length
      ? " Or press <strong>Play walkthrough</strong> to watch the steps light up."
      : "";

    // A lesson view is read with the step card, not by opening popups.
    const guidedHint = " Or press <strong>Take the guided tour</strong> for a step-by-step explanation.";
    const hint = data.lesson && data.lesson.clickStartsTour
      ? "Press <strong>Take the guided tour</strong> to have each step explained in turn, or click any box to have just that one explained."
      : "Click any box or label to see its full detail." + toggleHint + tourHint + guidedHint;

    return `
      <p class="diagram-guide-hint">${hint} Drag (or swipe on mobile) to pan around, and use the zoom controls to fit the whole diagram on screen.</p>
      <ul class="diagram-guide-legend">${legendHtml}${dotHtml}${lineHtml}</ul>
      ${statusHtml}
    `;
  }

  let currentProcessFilter = null; // null | "dsp" | "imp"

  function applyProcessFilter() {
    stage.querySelectorAll(".diagram-box[data-group]").forEach((el) => {
      const group = el.dataset.group;
      const dimmed = currentProcessFilter && group !== "both" && group !== currentProcessFilter;
      el.classList.toggle("dimmed", !!dimmed);
    });

    // Cluster backgrounds lose their tint (rather than fading like boxes)
    // when their process isn't the one selected — matches the source PPTX's
    // own DSP-only/IMP-only slides, where an inactive cluster's fill drops
    // out entirely instead of just dimming.
    stage.querySelectorAll(".diagram-cluster-bg[data-group]").forEach((el) => {
      const group = el.dataset.group;
      const muted = currentProcessFilter && group !== "both" && group !== currentProcessFilter;
      el.classList.toggle("muted", !!muted);
    });

    // Arrows/loops grey out to match the (now-dimmed) boxes they connect —
    // without this they stayed full navy/green regardless of mode, cutting
    // sharply across faded boxes instead of reading as part of the same
    // inactive chain.
    svgLayer.querySelectorAll("[data-group]").forEach((el) => {
      const group = el.dataset.group;
      const kind = el.dataset.kind;
      const active = !currentProcessFilter || group === "both" || group === currentProcessFilter;
      if (active) {
        el.setAttribute("stroke", kind === "feedback" ? COLOR_GREEN : COLOR_NAVY);
        el.setAttribute("marker-end", kind === "feedback" ? "url(#feedback-arrowhead)" : "url(#arrowhead)");
      } else {
        el.setAttribute("stroke", COLOR_GREY);
        el.setAttribute("marker-end", kind === "feedback" ? "url(#feedback-arrowhead-grey)" : "url(#arrowhead-grey)");
      }
    });
  }

  function setProcessPanel(key) {
    currentProcessFilter = key;
    [processBtnAll, processBtnDsp, processBtnImp].forEach((btn) => btn && btn.setAttribute("aria-pressed", "false"));
    if (!key) {
      processPanel.hidden = true;
      syncProcessSheetSpace();
      if (processPanelExplore) processPanelExplore.hidden = true;
      if (processBtnAll) processBtnAll.setAttribute("aria-pressed", "true");
      applyProcessFilter();
      return;
    }
    const info = (typeof TPRAF_DSP_IMP !== "undefined" && TPRAF_DSP_IMP[key]) || null;
    if (info) {
      processPanelTitle.textContent = info.title;
      // The sheet shows the first paragraph as a peek and the rest on "Read
      // more"; without the extra elements (the home page's copy) it is all
      // one block, as before.
      const paragraphs = info.text.split("\n\n");
      if (processPanelMore && processPanelToggle) {
        processPanelText.textContent = paragraphs[0];
        processPanelMore.textContent = paragraphs.slice(1).join("\n\n");
        processPanelToggle.hidden = paragraphs.length < 2;
        setProcessSheetExpanded(false);
      } else {
        processPanelText.textContent = info.text;
      }
      processPanel.dataset.process = key;
      if (processPanelExplore) {
        processPanelExplore.hidden = false;
        processPanelExplore.textContent = key === "dsp" ? "Explore the DSP component diagram →" : "Explore the IMP component diagram →";
        processPanelExplore.onclick = (e) => {
          e.preventDefault();
          const tab = document.querySelector(`.level-tab[data-view="${key}"]`);
          if (tab) tab.click();
        };
      }
      processPanel.hidden = false;
      syncProcessSheetSpace();
      keepDiagramAboveProcessSheet();
    }
    const activeBtn = key === "dsp" ? processBtnDsp : processBtnImp;
    if (activeBtn) activeBtn.setAttribute("aria-pressed", "true");
    applyProcessFilter();
  }

  /* The sheet is fixed to the bottom of the screen, so the page is given the
     same amount of room underneath (nothing on the page is ever unreachable
     behind it), and it is scrolled just enough that the toggle and the top of
     the diagram stay in the part of the screen above the sheet. */
  function isProcessSheet() {
    return processPanel.classList.contains("process-sheet");
  }

  function syncProcessSheetSpace() {
    document.body.style.paddingBottom = isProcessSheet() && !processPanel.hidden ? processPanel.offsetHeight + 16 + "px" : "";
  }

  function keepDiagramAboveProcessSheet() {
    if (!isProcessSheet() || !processToggle) return;
    const toggle = processToggle.getBoundingClientRect();
    const diagramTop = stageWrap.getBoundingClientRect().top;
    const sheetTop = processPanel.getBoundingClientRect().top;
    // Want at least a decent strip of the diagram showing above the sheet, with
    // the buttons that were just pressed still on screen; otherwise bring the
    // buttons to the top of the screen, which lifts the diagram up with them.
    if (toggle.top < 0 || diagramTop > sheetTop - 250) {
      window.scrollBy({ top: toggle.top - 8, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }

  function setProcessSheetExpanded(expanded) {
    processPanel.classList.toggle("is-expanded", expanded);
    if (processPanelToggle) {
      processPanelToggle.setAttribute("aria-expanded", String(expanded));
      processPanelToggle.textContent = expanded ? "Show less" : "Read more";
    }
    syncProcessSheetSpace();
  }

  // Closes just the text; the DSP-only / IMP-only view stays as it is, and
  // pressing the same button again brings the text back.
  function hideProcessSheet() {
    if (!isProcessSheet() || processPanel.hidden) return;
    processPanel.hidden = true;
    syncProcessSheetSpace();
  }

  if (processPanelToggle) {
    processPanelToggle.addEventListener("click", () => setProcessSheetExpanded(!processPanel.classList.contains("is-expanded")));
  }
  if (processPanelClose) processPanelClose.addEventListener("click", hideProcessSheet);
  window.addEventListener("resize", syncProcessSheetSpace);

  if (processBtnAll) processBtnAll.addEventListener("click", () => setProcessPanel(null));
  if (processBtnDsp) processBtnDsp.addEventListener("click", () => setProcessPanel("dsp"));
  if (processBtnImp) processBtnImp.addEventListener("click", () => setProcessPanel("imp"));

  function renderDiagram(viewKey) {
    // A walkthrough belongs to one view's own step order, so it can't survive
    // a switch — the boxes it's lighting up are about to be thrown away.
    if (tourState.running || tourState.finished) stopTour();
    resetLesson();

    const data = TPRAF_CONTENT[viewKey];
    if (!data) {
      titleEl.textContent = "Coming soon";
      subtitleEl.textContent = "This level isn't built yet — check back after the next milestone.";
      svgLayer.innerHTML = "";
      stage.querySelectorAll(".diagram-box, .diagram-label").forEach((n) => n.remove());
      guideEl.hidden = true;
      if (tourBar) tourBar.hidden = true;
      return;
    }

    titleEl.textContent = data.title;
    subtitleEl.textContent = data.subtitle;
    // Lets CSS adapt page furniture to a specific view's geometry — the zoom
    // widget docks bottom-left on IMP, whose bottom-right corner is occupied
    // by a box from the source slide (see style.css).
    stageWrap.parentElement.dataset.view = viewKey;
    guideEl.hidden = false;
    guideBody.innerHTML = buildGuideBody(data);

    currentMaxX = computeMaxX(data);

    // Clear previous render
    svgLayer.innerHTML = "";
    connectors = [];
    tourPulse = null;
    stage.querySelectorAll(".diagram-box, .diagram-label, .diagram-heading, .diagram-box-halo, .diagram-cluster-bg, .tour-pulse").forEach((n) => n.remove());

    (data.containers || []).forEach((container) => stage.appendChild(makeContainerEl(container, data)));

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

    buildAnchorRegions(data);
    if (tourBar) tourBar.hidden = !(data.tour && data.tour.length);
    setCaption(tourIdleCaption(), false); // this view's own step count

    applyCropToStage(data);
    refreshZoom();
    setupLesson(data);

    // Fade the new view in rather than snapping straight to it.
    stageWrap.classList.remove("is-entering");
    void stageWrap.offsetWidth; // restart the animation even if the class never left in this tick
    stageWrap.classList.add("is-entering");

    const hasProcessGroups = data.boxes.some((b) => b.group);
    processToggle.hidden = !hasProcessGroups;
    currentProcessFilter = null;
    setProcessPanel(null);
    applyProcessFilter();

    // Per-view "go deeper" link — the simple form points through to the
    // extended form. Views without a `next` show nothing.
    if (viewNextEl) {
      const next = data.next;
      viewNextEl.hidden = !next;
      if (next) {
        viewNextLink.setAttribute("href", "#" + next.key);
        viewNextLink.innerHTML = escapeHtml(next.label) +
          ' <span aria-hidden="true">&rarr;</span>';
      }
    }
  }

  // Click-and-drag horizontal scroll for mouse users, used by both the level
  // tab toolbar and the diagram stage. Touch devices already get native
  // swipe/momentum scrolling from the CSS above, so this only engages for
  // mouse pointers (touch scrolling shouldn't be hijacked).
  function setupDragToScroll(el) {
    if (!el) return;

    let isDown = false;
    let didDrag = false;
    let startX = 0;
    let startScrollLeft = 0;

    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      isDown = true;
      didDrag = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      // NOTE: don't mark "is-dragging" (which disables child pointer-events)
      // here — a plain click also fires pointerdown, and doing it this
      // early would swallow every click, not just real drags.
    });

    el.addEventListener("pointermove", (e) => {
      if (!isDown || e.pointerType !== "mouse") return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !didDrag) {
        didDrag = true;
        el.classList.add("is-dragging"); // only now, once it's a real drag
      }
      if (didDrag) el.scrollLeft = startScrollLeft - dx;
    });

    function endDrag() {
      isDown = false;
      el.classList.remove("is-dragging");
    }
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointerleave", endDrag);

    // Swallow the click that follows a genuine drag so it doesn't switch
    // level or open a box's popup by accident.
    el.addEventListener(
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
    const crop = document.getElementById("diagram-crop");
    const sizer = document.getElementById("zoom-sizer");
    const wrap = document.getElementById("diagram-stage-wrap");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const zoomFitBtn = document.getElementById("zoom-fit");
    const zoomResetBtn = document.getElementById("zoom-reset");
    const zoomLevelEl = document.getElementById("zoom-level");
    if (!crop || !sizer || !wrap || !zoomInBtn || !zoomOutBtn || !zoomFitBtn || !zoomResetBtn || !zoomLevelEl) return;

    const MIN_NATURAL_WIDTH = 900; // same floor the original static CSS used
    // Same ceiling the original static CSS used — except on the landing page,
    // where the design gives the diagram the card's full width (about 1450px).
    const MAX_NATURAL_WIDTH = document.querySelector(".landing-diagram") ? 1600 : 1200;
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

    // Views whose horizontal coordinate space exceeds 100 (the wider Level 2
    // layouts) make the canvas itself wider, rather than squeezing the whole
    // diagram down — so every box keeps the same physical size across views
    // and the extra width just scrolls. At currentMaxX === 100 this is a
    // no-op (fullW === naturalWidth()).
    function fullWidth() {
      return (naturalWidth() * currentMaxX) / 100;
    }

    function fitZoom() {
      return Math.max(ABSOLUTE_MIN_ZOOM, Math.min(1, availableWidth() / fullWidth()));
    }

    // natH/natCropH: the full slide's height at this width, and the
    // cropped (visible) slice of it per the current view's content bounds
    // — .diagram-crop is sized/scaled to natCropH, not the full natH.
    function applyZoom() {
      zoom = Math.max(ABSOLUTE_MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
      const natW = naturalWidth();
      const fullW = fullWidth();
      const natH = (natW * 6858) / 12192;
      const natCropH = natH * currentCropRatio;
      crop.style.width = Math.round(fullW) + "px";
      crop.style.height = Math.round(natCropH) + "px";
      crop.style.transform = Math.abs(zoom - 1) < 0.005 ? "" : `scale(${zoom})`;
      sizer.style.width = Math.round(fullW * zoom) + "px";
      sizer.style.height = Math.round(natCropH * zoom) + "px";
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

    refreshZoom = applyZoom;
    setZoomLevel = function (level) {
      zoom = level;
      wrap.scrollLeft = 0;
      applyZoom();
    };
    applyZoom();
  }

  /* ==========================================================================
     Walkthrough ("play").
     Plays the current view's own reading order (data.tour in content.js) as an
     animated pass through the diagram: each step's box lights up, then a glow
     travels along the very arrow that leads to the next step, leaving that
     route lit behind it. It closes on a feedback loop, so the diagram is
     walked as a round trip back to where it started rather than left half lit.
     Steps with no arrow between them are highlighted in turn — several
     diagrams have parallel boxes that genuinely have no "after", and drawing
     an invented line between those would say something the source doesn't.
     ========================================================================== */

  const tourBar = document.getElementById("diagram-tour");
  const tourPlayBtn = document.getElementById("tour-play");
  const tourPlayLabel = document.getElementById("tour-play-label");
  const tourCaption = document.getElementById("tour-caption");
  const tourRestartBtn = document.getElementById("tour-restart");
  const tourStopBtn = document.getElementById("tour-stop");

  const TOUR_DWELL = 1000;              // ms a step stays centred before moving on
  const TOUR_ANCHOR_TOLERANCE = 3;      // how far off a box/label edge an arrow end may land and still count as joined to it
  const TOUR_CLUSTER_TOLERANCE = 1;     // the same, for a cluster background — kept tight because two clusters can sit only a couple of units apart, and a loose match there joins an arrow to the wrong cluster's boxes
  const TOUR_HEADING_GAP = 12;          // how close a section title must be to count as that box's heading
  const TOUR_SPEED = 0.75;              // px per ms the pulse travels at
  const TOUR_TRAVEL_MIN = 650;
  const TOUR_TRAVEL_MAX = 1800;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A run id rather than a plain "cancelled" flag: restarting stops one run and
  // starts another in the same tick, and a flag would be cleared again by the
  // new run before the old one's loop ever checked it.
  const tourState = { runId: 0, running: false, paused: false, finished: false };
  let tourPulse = null;
  let tourStepText = "";

  let boxRegions = new Map(); // box id -> the rects an arrow may legitimately touch for that box

  function rectOfPos(pos) {
    return { left: pos.left, top: pos.top, right: pos.left + pos.width, bottom: pos.top + pos.height };
  }

  // A rotated box (Extended's "Social Behaviour Impacts") occupies its frame
  // turned 90°, so what arrows actually touch is its footprint, not its pos.
  function rectOfBox(box) {
    if (!box.rotate) return rectOfPos(box.pos);
    const cx = box.pos.left + box.pos.width / 2;
    const cy = box.pos.top + box.pos.height / 2;
    return {
      left: cx - box.pos.height / 2,
      top: cy - box.pos.width / 2,
      right: cx + box.pos.height / 2,
      bottom: cy + box.pos.width / 2
    };
  }

  function rectToRectGap(a, b) {
    const dx = Math.max(a.left - b.right, 0, b.left - a.right);
    const dy = Math.max(a.top - b.bottom, 0, b.top - a.bottom);
    return Math.hypot(dx, dy);
  }

  /* Distance from a point to a rect. "borderOnly" is for the cluster
     backgrounds: an arrow that ends somewhere inside a cluster has not
     touched the cluster at all, only one that lands on (or near) its edge
     has — without this, every arrow landing inside a cluster counts as
     reaching every box in it. */
  function pointToRectDistance(rect, point, borderOnly) {
    const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
    const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
    const outside = Math.hypot(dx, dy);
    if (outside > 0 || !borderOnly) return outside;
    return Math.min(point.x - rect.left, rect.right - point.x, point.y - rect.top, rect.bottom - point.y);
  }

  /* Where an arrow may legitimately start or end for a given box: the box's own
     footprint, every cluster background it sits inside, and the section title
     that belongs to it. Level 2's stage-to-stage arrows land on the cluster
     edge rather than on a box, and Simple's Climate Scenarios arrow lands on
     the "Transport Scenarios" title, so both have to count as joining the box
     they lead to. */
  function buildAnchorRegions(data) {
    boxRegions = new Map();
    const containerRects = (data.containers || []).map((c) => rectOfPos(c.pos));
    const headingRects = (data.headings || []).map((h) => rectOfPos(h.pos));
    (data.boxes || []).forEach((box) => {
      const own = rectOfBox(box);
      const cx = (own.left + own.right) / 2;
      const cy = (own.top + own.bottom) / 2;
      const regions = [{ rect: own, borderOnly: false, tolerance: TOUR_ANCHOR_TOLERANCE }];
      containerRects.forEach((rect) => {
        if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
          regions.push({ rect: rect, borderOnly: true, tolerance: TOUR_CLUSTER_TOLERANCE });
        }
      });
      headingRects.forEach((rect) => {
        const overlapsX = Math.min(rect.right, own.right) > Math.max(rect.left, own.left);
        if (overlapsX && rectToRectGap(rect, own) <= TOUR_HEADING_GAP) {
          regions.push({ rect: rect, borderOnly: false, tolerance: TOUR_ANCHOR_TOLERANCE });
        }
      });
      boxRegions.set(box.id, regions);
    });
  }

  // How far a point is from the nearest part of a box it could be joining —
  // Infinity when it's not close enough to any of them to count.
  function distanceToRegions(regions, point) {
    let best = Infinity;
    regions.forEach((region) => {
      const d = pointToRectDistance(region.rect, point, region.borderOnly);
      if (d <= region.tolerance && d < best) best = d;
    });
    return best;
  }

  /* The drawn connector joining two boxes, if the diagram has one. Both ends
     are measured against each box, in both directions, so a double-headed
     connector resolves whichever way the tour walks it (some are walked
     "backwards" on purpose — e.g. the IMP diagram steps from Transport Network
     up to Multi-modal Network, which is drawn the other way round). */
  function connectorBetween(fromId, toId) {
    const from = boxRegions.get(fromId);
    const to = boxRegions.get(toId);
    if (!from || !to) return null;

    let best = null;
    let bestScore = Infinity;
    connectors.forEach((connector) => {
      const head = connector.points[0];
      const tail = connector.points[connector.points.length - 1];
      const headToFrom = distanceToRegions(from, head);
      const tailToTo = distanceToRegions(to, tail);
      const tailToFrom = distanceToRegions(from, tail);
      const headToTo = distanceToRegions(to, head);
      const forwardOk = headToFrom <= TOUR_ANCHOR_TOLERANCE && tailToTo <= TOUR_ANCHOR_TOLERANCE;
      const reverseOk = tailToFrom <= TOUR_ANCHOR_TOLERANCE && headToTo <= TOUR_ANCHOR_TOLERANCE;
      if (!forwardOk && !reverseOk) return;
      const reversed = !forwardOk || (reverseOk && tailToFrom + headToTo < headToFrom + tailToTo);
      const score = reversed ? tailToFrom + headToTo : headToFrom + tailToTo;
      if (score < bestScore) {
        bestScore = score;
        best = { record: connector, reversed: reversed };
      }
    });
    return best;
  }

  function tourBoxEl(id) {
    return stage.querySelector('.diagram-box[data-box-id="' + id + '"]');
  }

  function labelForBox(data, id) {
    const box = (data.boxes || []).find((b) => b.id === id);
    return box ? box.label.replace(/\n/g, " ") : id;
  }

  /* A diagram unit is a different number of pixels horizontally and
     vertically (the stage is never square), so the pulse is paced in real
     pixels — otherwise it visibly speeds up and slows down around corners. */
  function polylineMetrics(points) {
    const unitX = stage.clientWidth / currentMaxX;
    const unitY = stage.clientHeight / 100;
    const segments = [];
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      const dx = (points[i].x - points[i - 1].x) * unitX;
      const dy = (points[i].y - points[i - 1].y) * unitY;
      const length = Math.hypot(dx, dy);
      segments.push(length);
      total += length;
    }
    return { segments: segments, total: total };
  }

  function pointAtDistance(points, segments, distance) {
    let travelled = 0;
    for (let i = 0; i < segments.length; i += 1) {
      if (travelled + segments[i] >= distance || i === segments.length - 1) {
        const t = segments[i] ? (distance - travelled) / segments[i] : 1;
        return {
          x: points[i].x + (points[i + 1].x - points[i].x) * t,
          y: points[i].y + (points[i + 1].y - points[i].y) * t
        };
      }
      travelled += segments[i];
    }
    return points[points.length - 1];
  }

  // One animation clock for every leg, so pausing holds the pulse mid-flight
  // instead of letting it run on behind a paused step.
  function tourTick(runId, duration, onFrame) {
    return new Promise((resolve) => {
      if (prefersReducedMotion) {
        // Still pause, just without the motion — the steps need to stay
        // readable rather than flashing past.
        window.setTimeout(() => {
          onFrame(1);
          resolve(runId === tourState.runId);
        }, Math.min(duration, 900));
        return;
      }
      let elapsed = 0;
      let previous = null;
      function frame(now) {
        if (runId !== tourState.runId) {
          resolve(false);
          return;
        }
        if (previous === null) previous = now;
        const delta = now - previous;
        previous = now; // advances even while paused, so paused time isn't counted
        if (!tourState.paused) elapsed += delta;
        onFrame(duration ? Math.min(1, elapsed / duration) : 1);
        if (elapsed >= duration) {
          resolve(true);
          return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  function pulseEl() {
    if (!tourPulse || !tourPulse.isConnected) {
      tourPulse = document.createElement("div");
      tourPulse.className = "tour-pulse";
      tourPulse.hidden = true;
      stage.appendChild(tourPulse);
    }
    return tourPulse;
  }

  function movePulseTo(point) {
    const el = pulseEl();
    el.hidden = false;
    el.style.left = pctX(point.x);
    el.style.top = pct(point.y);
  }

  /* Lights the connector and walks the pulse along it. The line draws itself
     in as the pulse travels (dashes measured from the near end), and the
     arrowhead is held back until the line reaches it, so it arrives with the
     line instead of hanging at the far end on its own. */
  async function travelLeg(runId, found) {
    if (!found) return true;
    const record = found.record;
    const points = found.reversed ? record.points.slice().reverse() : record.points;
    const metrics = polylineMetrics(points);
    const duration = Math.max(TOUR_TRAVEL_MIN, Math.min(TOUR_TRAVEL_MAX, metrics.total / TOUR_SPEED));
    const el = record.el;
    const markerEnd = el.dataset.markerEnd;
    const length = typeof el.getTotalLength === "function" ? el.getTotalLength() : 0;
    const draw = !prefersReducedMotion && length > 0 && !!markerEnd;

    el.classList.add("tour-flow");
    if (draw) {
      el.setAttribute("marker-end", "none");
      el.style.strokeDasharray = String(length);
      el.style.strokeDashoffset = String(length);
    }
    if (!prefersReducedMotion) movePulseTo(points[0]);

    const completed = await tourTick(runId, duration, (t) => {
      if (draw) el.style.strokeDashoffset = String(length * (1 - t));
      if (!prefersReducedMotion && !tourState.paused) {
        movePulseTo(pointAtDistance(points, metrics.segments, metrics.total * t));
      }
    });

    if (draw) {
      el.style.strokeDasharray = "";
      el.style.strokeDashoffset = "";
      el.setAttribute("marker-end", markerEnd);
    }
    if (tourPulse) tourPulse.hidden = true;
    return completed;
  }

  // Hands the glow on to the next step and keeps it on screen — the Level 2
  // diagrams are several screens wide, so a step can easily light up off-view.
  function focusStep(id) {
    stage.querySelectorAll(".diagram-box.tour-focus").forEach((el) => {
      el.classList.remove("tour-focus");
      el.classList.add("tour-visited");
    });
    const el = tourBoxEl(id);
    if (!el) return null;
    el.classList.add("tour-visited", "tour-focus");
    const wrapRect = stageWrap.getBoundingClientRect();
    const boxRect = el.getBoundingClientRect();
    const target = stageWrap.scrollLeft + (boxRect.left + boxRect.width / 2) - (wrapRect.left + wrapRect.width / 2);
    stageWrap.scrollTo({ left: Math.max(0, target), behavior: prefersReducedMotion ? "auto" : "smooth" });
    return el;
  }

  function setCaption(text, active) {
    tourStepText = text;
    if (!tourCaption) return;
    tourCaption.textContent = text;
    tourCaption.classList.toggle("is-active", !!active);
  }

  // What the strip reads before (and after) a run. The count comes from the
  // view on screen, so it always describes the walkthrough that's on offer
  // rather than a generic label — 8 steps on the simple form, 35 on DSP.
  // No "in order" framing (client feedback, 22 Sept): visitors shouldn't be
  // led to think the steps must be followed in a fixed sequence.
  function tourIdleCaption() {
    const data = TPRAF_CONTENT[currentViewKey];
    const count = ((data && data.tour) || []).length;
    return count ? "Watch all " + count + " steps." : "";
  }

  function setTourControls(state) {
    if (!tourPlayBtn) return;
    tourPlayLabel.textContent =
      state === "running" ? "Pause" :
      state === "paused" ? "Resume" :
      state === "finished" ? "Play again" : "Play walkthrough";
    tourPlayBtn.classList.toggle("is-pause", state === "running");
    tourPlayBtn.setAttribute("aria-pressed", String(state === "running"));
    const idle = state === "idle";
    if (tourRestartBtn) tourRestartBtn.hidden = idle;
    if (tourStopBtn) tourStopBtn.hidden = idle;
  }

  function clearTourMarks() {
    stage.classList.remove("tour-running", "tour-complete");
    stage.querySelectorAll(".diagram-box.tour-focus, .diagram-box.tour-visited").forEach((el) => {
      el.classList.remove("tour-focus", "tour-visited");
    });
    svgLayer.querySelectorAll(".tour-flow").forEach((el) => {
      el.classList.remove("tour-flow");
      el.style.strokeDasharray = "";
      el.style.strokeDashoffset = "";
      if (el.dataset.markerEnd) el.setAttribute("marker-end", el.dataset.markerEnd);
    });
    if (tourPulse) tourPulse.hidden = true;
  }

  function stopTour() {
    tourState.runId += 1; // invalidates any leg still in flight
    tourState.running = false;
    tourState.paused = false;
    tourState.finished = false;
    clearTourMarks();
    setTourControls("idle");
    setCaption(tourIdleCaption(), false);
  }

  async function playTour() {
    if (lessonState.running) return; // the guided tour is in charge
    const data = TPRAF_CONTENT[currentViewKey];
    const steps = ((data && data.tour) || []).map((step) => (typeof step === "string" ? { box: step } : step));
    if (!steps.length) return;

    stopTour();
    tourState.runId += 1;
    const runId = tourState.runId;
    tourState.running = true;
    tourState.finished = false;

    // A walkthrough covers the whole view, so drop any DSP/IMP filter first —
    // a half-greyed diagram would contradict where the tour is about to go.
    if (processToggle && !processToggle.hidden) setProcessPanel(null);

    stage.classList.add("tour-running");
    setTourControls("running");

    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];
      if (i > 0) {
        const found = step.via
          ? connectorBetween(step.via.from, step.via.to)
          : connectorBetween(steps[i - 1].box, step.box);
        const carried = await travelLeg(runId, found);
        if (!carried) return; // stopped, restarted or the view changed mid-leg
      }
      const el = focusStep(step.box);
      setCaption("Step " + (i + 1) + " of " + steps.length + " · " + labelForBox(data, step.box), true);
      const dwelt = await tourTick(runId, el ? TOUR_DWELL : 0, () => {});
      if (!dwelt) return;
    }

    // Fully lit. Drop the dimming so the finished diagram reads as a whole
    // again, and leave the route glowing until the visitor stops or replays it.
    stage.classList.remove("tour-running");
    stage.classList.add("tour-complete");
    tourState.running = false;
    tourState.finished = true;
    setTourControls("finished");
    // Only views that really loop back (feedback paths, or a last step that
    // returns to an earlier box, as IMP's does) say so; a straight-through
    // view like Level 3 shouldn't claim a loop it doesn't have.
    const lastBox = steps[steps.length - 1].box;
    const closesLoop = ((data && data.feedbackPaths) || []).length > 0 ||
      steps.slice(0, -1).some((s) => s.box === lastBox);
    setCaption("Walkthrough complete — " + steps.length + " steps" + (closesLoop ? ", and the loop closes back to the start." : "."), true);
  }

  if (tourPlayBtn) {
    tourPlayBtn.addEventListener("click", () => {
      if (tourState.running) {
        tourState.paused = !tourState.paused;
        setTourControls(tourState.paused ? "paused" : "running");
        setCaption(tourState.paused ? "Paused — " + tourStepText : tourStepText, true);
        return;
      }
      playTour();
    });
  }
  if (tourRestartBtn) tourRestartBtn.addEventListener("click", () => playTour());
  if (tourStopBtn) tourStopBtn.addEventListener("click", () => stopTour());

  /* ==========================================================================
     Guided tour — the Level 3 onboarding walkthrough.

     A view whose content carries a `lesson` can be taken as a product-style
     tour: the page dims, a spotlight is cut out around the box being
     explained, and a card is placed beside that box with an arrow pointing at
     it. "Next" moves on, and the diagram follows along — the boxes already
     covered stay ringed in green, and the glow travels down the arrow that
     leads into the new step. Views without a `lesson` never touch any of this.

     It leans on the walkthrough above for the visuals (focusStep, travelLeg,
     connectorBetween, the tour-* classes) but is driven by the visitor's
     clicks instead of a timer. A line lights once both boxes it joins have
     been reached, which is what lights every input line into CityCAT together
     when CityCAT is reached, while only the line from the previous step
     animates.

     The spotlight and card are measured against the box every frame while the
     tour runs, so they stay put through scrolling, panning, zooming and
     resizing. The tour opens by itself each time a diagram is shown (except on
     the home page) and can be skipped, or replayed with one button.
     ========================================================================== */

  const lessonLaunch = document.getElementById("lesson-launch");
  const lessonStartBtn = document.getElementById("lesson-start");
  const lessonStartLabel = document.getElementById("lesson-start-label");
  // On views with the walkthrough bar the guided-tour button sits inside it;
  // Level 3 (no walkthrough) uses the standalone strip above instead.
  const lessonStartInline = document.getElementById("lesson-start-inline");
  const lessonStartInlineLabel = document.getElementById("lesson-start-inline-label");
  const tourSpot = document.getElementById("tour-spot");
  const lessonCard = document.getElementById("lesson-card");
  const lessonProgress = document.getElementById("lesson-progress");
  const lessonCloseBtn = document.getElementById("lesson-close");
  const lessonBodyEl = document.getElementById("lesson-body");
  const lessonStageEl = document.getElementById("lesson-stage");
  const lessonTitleEl = document.getElementById("lesson-title");
  const lessonFigureEl = document.getElementById("lesson-figure");
  const lessonTextEl = document.getElementById("lesson-text");
  const lessonExampleEl = document.getElementById("lesson-example");
  const lessonCreditEl = document.getElementById("lesson-credit");
  const lessonPlaceholderNote = document.getElementById("lesson-placeholder-note");
  const lessonExtraEl = document.getElementById("lesson-extra");
  const lessonHandbookEl = document.getElementById("lesson-handbook");
  const lessonBackBtn = document.getElementById("lesson-back");
  const lessonNextBtn = document.getElementById("lesson-next");
  const lightboxEl = document.getElementById("lesson-lightbox");
  const lightboxImg = document.getElementById("lesson-lightbox-img");
  const lightboxClose = document.getElementById("lesson-lightbox-close");
  const phoneQuery = window.matchMedia("(max-width: 760px)");

  const LESSON_SEEN_KEY = "tpraf-tour-seen"; // set once a visitor finishes or skips any tour
  // The tour used to open on its own on every view change. Client feedback,
  // 22 Sept, asked for that to stop on Extended and Level 3 specifically;
  // on reflection the same "let people choose when to take it" logic applies
  // everywhere, so it no longer auto-opens on any view. "?tour=1" still
  // forces it open (a demo link, or previewing it quickly).
  const AUTO_START_TOUR = false;
  const CONTINUOUS_PROGRESS_ABOVE = 14; // a longer tour gets one smooth progress bar, not a segment per step
  const PROCESS_LABELS = { dsp: "Decision support (DSP)", imp: "Impact modelling (IMP)", both: "DSP and IMP" };
  // The home page embeds the simple form and has no level tabs; it never opens a tour by itself.
  const isLandingPage = !document.querySelector(".level-tab");
  const AUTO_START_DELAY = 700;   // ms — lets the page settle first
  const PHONE_TOUR_ZOOM = 0.8;    // a box is far too small to spotlight at "fit" on a phone
  const SPOT_PAD = 6;             // px of breathing room around the spotlighted box
  const CARD_GAP = 14;            // px between the spotlight and the card
  const CARD_MARGIN = 12;         // px the card keeps clear of the screen edge
  const ARROW_INSET = 22;         // how close the arrow may sit to a card corner

  // index -1 is the welcome card, `total` is the closing card.
  const lessonState = { active: false, running: false, index: -1, total: 0, lesson: null };
  const spot = { x: 0, y: 0, w: 0, h: 0, init: false };
  let trackFrame = 0;
  let lastTrackTime = 0;
  let stepStartedAt = 0;
  let cardShown = false;
  let autoStartTimer = 0;
  let offerPending = false;     // a tour is due to be offered once the page is on screen
  let lightboxOpener = null;

  // "?tour=1" on the page's address always offers the tour (handy for demos and
  // for sharing a link that opens straight into it); "?tour=0" never does.
  function tourUrlOverride() {
    try {
      return new URLSearchParams(window.location.search).get("tour");
    } catch (e) {
      return null;
    }
  }

  // Has this visitor already finished or skipped a tour? Only then is it
  // not offered again on its own.
  function tourSeen() {
    try {
      return localStorage.getItem(LESSON_SEEN_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markTourSeen() {
    try {
      localStorage.setItem(LESSON_SEEN_KEY, "1");
    } catch (e) {
      /* per-viewer convenience only — fine if it can't persist */
    }
  }

  function currentLesson() {
    return lessonState.lesson;
  }

  function lessonStepIndexOfBox(id) {
    const lesson = lessonState.active ? currentLesson() : null;
    return lesson ? lesson.steps.findIndex((step) => step.box === id) : -1;
  }

  function tourTargetEl() {
    const lesson = currentLesson();
    if (!lesson) return null;
    const index = lessonState.index;
    if (index < 0 || index >= lesson.steps.length) return null;
    return tourBoxEl(lesson.steps[index].box);
  }

  // The section title the diagram draws over the group a box sits in (for
  // example "Business as usual / Do nothing"), used as the step's tag.
  function sectionLabelForBox(data, box) {
    const headings = (data.headings || []).filter((h) => !(h.variant || "").startsWith("key"));
    const containers = (data.containers || []).filter((c) => c.style !== "dashed");
    if (!headings.length || !containers.length) return "";
    const cx = box.pos.left + box.pos.width / 2;
    const cy = box.pos.top + box.pos.height / 2;
    const holding = containers
      .filter((c) => cx >= c.pos.left && cx <= c.pos.left + c.pos.width && cy >= c.pos.top && cy <= c.pos.top + c.pos.height)
      .sort((a, b) => a.pos.width * a.pos.height - b.pos.width * b.pos.height);
    for (const container of holding) {
      const near = headings
        .map((h) => ({ heading: h, gap: rectToRectGap(rectOfPos(h.pos), rectOfPos(container.pos)) }))
        .filter((x) => x.gap <= 8 && Math.min(x.heading.pos.left + x.heading.pos.width, container.pos.left + container.pos.width) - Math.max(x.heading.pos.left, container.pos.left) > 0)
        .sort((a, b) => a.gap - b.gap);
      if (near.length) return near[0].heading.label;
    }
    return "";
  }

  /* Builds the tour for a view that has no hand-written `lesson`, straight from
     the view's own reading order (`tour`) and box text. It stays in step with
     the diagram: a box that gains its wording gains it in the tour too, and the
     feedback-loop legs and repeated boxes in the reading order carry over. */
  function buildAutoLesson(data) {
    const raw = (data.tour || []).map((step) => (typeof step === "string" ? { box: step } : step));
    if (!raw.length) return null;
    const seen = new Set();
    const steps = raw.map((step) => {
      const box = data.boxes.find((b) => b.id === step.box);
      const repeat = seen.has(step.box);
      seen.add(step.box);
      const process = box && box.group && PROCESS_LABELS[box.group] ? box.group : "";
      const section = box ? sectionLabelForBox(data, box) : "";
      let text;
      if (repeat) text = "The route loops back to this box, so the diagram works as a cycle rather than a straight line.";
      else if (!box || box.isPlaceholder) text = "The explanation for this step is coming soon.";
      else text = box.text;
      return { box: step.box, via: step.via, stage: process, stageLabel: section || (process ? PROCESS_LABELS[process] : ""), text: text };
    });
    const loops = (data.feedbackPaths || []).length > 0 || steps.some((step, i) => steps.findIndex((t) => t.box === step.box) < i);
    const links = [];
    if (data.next) links.push({ label: data.next.label, view: data.next.key });
    if (data.boxes.some((b) => b.group)) {
      links.push({ label: "See the DSP component diagram", view: "dsp" }, { label: "See the IMP component diagram", view: "imp" });
    }
    return {
      intro: {
        title: "Take a guided tour",
        text: "Follow this diagram one box at a time. Each step lights up a box and explains it, and the route lights up behind you as you go. Use Next to move on, click any box to jump to it, or skip the tour at any time."
      },
      steps: steps,
      outro: {
        title: "That is the end of the route",
        text: loops ? "The lit route shows how the boxes connect, and the green lines show where the process loops back." : "The lit route shows how the boxes connect.",
        links: links
      }
    };
  }

  function setStartLabels(text) {
    [lessonStartLabel, lessonStartInlineLabel].forEach((el) => {
      if (el) el.textContent = text;
    });
  }

  // Moves to another diagram: a level tab on the diagram page, or a link to the
  // diagram page from the home page (which has no tabs).
  function goToView(view) {
    const tab = document.querySelector('.level-tab[data-view="' + view + '"]');
    if (tab) tab.click();
    else window.location.href = "diagram.html#" + view;
  }

  // Every diagram has a tour, but (per client feedback, 22 Sept) it no longer
  // opens on its own anywhere — a visitor always chooses it via "Take the
  // guided tour". "?tour=1" still force-offers it (a demo link, or previewing
  // it quickly); "?tour=0" is now redundant with AUTO_START_TOUR off, but
  // left working in case auto-start is ever turned back on for some views.
  function shouldOfferTour() {
    if (tourUrlOverride() === "1") return true;
    if (tourUrlOverride() === "0") return false;
    return AUTO_START_TOUR && !isLandingPage;
  }

  function setupLesson(data) {
    const lesson = data.lesson || buildAutoLesson(data);
    lessonState.lesson = lesson;
    lessonState.active = !!lesson;
    lessonState.running = false;
    lessonState.index = -1;
    lessonState.total = lesson ? lesson.steps.length : 0;
    const barShown = !!tourBar && !tourBar.hidden;
    if (lessonStartInline) lessonStartInline.hidden = !(lesson && barShown);
    if (lessonLaunch) lessonLaunch.hidden = !(lesson && !barShown);
    if (!lesson || !lessonCard) return;

    setStartLabels(tourSeen() ? "Take the tour again" : "Take the guided tour");

    // Progress: one clickable segment per step, or a single smooth bar on a long
    // tour (35 segments would be too small to see or press).
    lessonProgress.textContent = "";
    const continuous = lesson.steps.length > CONTINUOUS_PROGRESS_ABOVE;
    lessonProgress.classList.toggle("is-continuous", continuous);
    if (continuous) {
      const fill = document.createElement("span");
      fill.className = "lesson-progress-fill";
      lessonProgress.appendChild(fill);
    } else {
      lesson.steps.forEach((step, k) => {
        const seg = document.createElement("button");
        seg.type = "button";
        seg.className = "lesson-progress-seg";
        seg.setAttribute("aria-label", "Go to step " + (k + 1) + ": " + labelForBox(data, step.box));
        seg.addEventListener("click", () => lessonGoTo(k, k === lessonState.index + 1));
        lessonProgress.appendChild(seg);
      });
    }

    window.clearTimeout(autoStartTimer);
    offerPending = false;
    if (shouldOfferTour()) {
      offerPending = true;
      autoStartTimer = window.setTimeout(offerTour, AUTO_START_DELAY);
    }
  }

  // Starts the tour on its own — but only once the page is
  // actually on screen (a tab opened in the background waits until it is
  // looked at, rather than running the tour unseen).
  function offerTour() {
    if (!offerPending || !lessonState.active || lessonState.running) return;
    if (document.hidden) {
      // Wait for the page to be shown. Some embedded browsers keep reporting
      // "hidden" even while they are on screen, so a focus or a first click
      // also counts as the page being looked at.
      const retry = () => {
        document.removeEventListener("visibilitychange", retry);
        window.removeEventListener("focus", retry);
        document.removeEventListener("pointerdown", retry);
        offerTour();
      };
      document.addEventListener("visibilitychange", retry);
      window.addEventListener("focus", retry);
      document.addEventListener("pointerdown", retry);
      return;
    }
    startLesson(-1);
  }

  // Leaving a tour view: put the diagram back the way every other view
  // expects it (no dimming, no lit route, no overlay).
  function resetLesson() {
    if (!lessonState.active) return;
    window.clearTimeout(autoStartTimer);
    offerPending = false;
    endLesson(false);
    lessonState.active = false;
    lessonState.lesson = null;
    lessonState.index = -1;
    if (lessonLaunch) lessonLaunch.hidden = true;
    if (lessonStartInline) lessonStartInline.hidden = true;
    stage.classList.remove("is-lesson");
    clearTourMarks();
  }

  function startLesson(index) {
    if (!lessonState.active || !currentLesson()) return;
    window.clearTimeout(autoStartTimer);
    if (!lessonState.running) {
      offerPending = false;
      // The hands-off walkthrough and a half-greyed DSP/IMP view would both
      // contradict the tour, so they step aside for it.
      if (tourState.running || tourState.finished) stopTour();
      if (processToggle && !processToggle.hidden) setProcessPanel(null);
      lessonState.running = true;
      spot.init = false;
      lastTrackTime = 0;
      cardShown = false;
      stage.classList.add("is-lesson");
      tourSpot.hidden = false;
      lessonCard.hidden = false;
      lessonCard.classList.remove("is-ready");
      // A phone shows the whole diagram tiny at "fit"; zoom in so the box being
      // explained is big enough to see, and let the tour pan along.
      if (phoneQuery.matches) {
        setZoomLevel(PHONE_TOUR_ZOOM);
      } else {
        const fit = document.getElementById("zoom-fit");
        if (fit) fit.click();
      }
      trackFrame = requestAnimationFrame(trackTour);
    }
    lessonGoTo(index, false);
  }

  /* Ends the tour. `keepRoute` leaves the finished diagram with its whole
     route lit (used when the visitor reaches the end); skipping part-way
     puts the diagram back to plain. */
  function endLesson(keepRoute) {
    if (!lessonState.running) return;
    lessonState.running = false;
    tourState.runId += 1;
    cancelAnimationFrame(trackFrame);
    trackFrame = 0;
    tourSpot.hidden = true;
    lessonCard.hidden = true;
    lessonCard.classList.remove("is-ready");
    closeLightbox();
    stage.classList.remove("is-lesson");
    if (!(keepRoute && lessonState.index >= lessonState.total)) clearTourMarks();
    lessonState.index = -1;
    setStartLabels("Take the tour again");
    const fit = document.getElementById("zoom-fit");
    if (fit) fit.click();
  }

  function buildLessonFigure(figure) {
    lessonFigureEl.textContent = "";
    lessonFigureEl.hidden = !figure;
    if (!figure) return;
    const grid = document.createElement("div");
    grid.className = "lesson-figure-grid" + (figure.images.length > 1 ? " is-pair" : "");
    figure.images.forEach((image) => {
      const item = document.createElement("figure");
      item.className = "lesson-figure-item";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lesson-figure-btn";
      button.setAttribute("aria-label", "Enlarge picture: " + image.alt);
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt;
      img.decoding = "async";
      button.appendChild(img);
      button.addEventListener("click", () => openLightbox(image, button));
      item.appendChild(button);
      if (image.label) {
        const caption = document.createElement("figcaption");
        caption.textContent = image.label;
        item.appendChild(caption);
      }
      grid.appendChild(item);
    });
    lessonFigureEl.appendChild(grid);
    if (figure.caption) {
      const caption = document.createElement("p");
      caption.className = "lesson-caption";
      caption.textContent = figure.caption;
      lessonFigureEl.appendChild(caption);
    }
  }

  function setOptionalText(el, text) {
    el.hidden = !text;
    el.textContent = text || "";
  }

  function renderLessonCard() {
    const lesson = currentLesson();
    if (!lesson || !lessonCard) return;
    const data = TPRAF_CONTENT[currentViewKey];
    const total = lesson.steps.length;
    const index = lessonState.index;
    const isIntro = index < 0;
    const isOutro = index >= total;

    if (lessonProgress.classList.contains("is-continuous")) {
      const fill = lessonProgress.firstElementChild;
      if (fill) fill.style.width = Math.max(0, Math.min(100, ((index + 1) / total) * 100)) + "%";
    } else {
      Array.from(lessonProgress.children).forEach((seg, k) => {
        seg.classList.toggle("is-done", k < index);
        seg.classList.toggle("is-current", k === index);
        seg.setAttribute("aria-current", k === index ? "step" : "false");
      });
    }

    let stageKey = "";
    let stageText;
    let title;
    let text;
    let example = "";
    let credit = "";
    let figure = null;
    let handbookUrl = "";
    let placeholder = false;

    if (isIntro) {
      stageText = "Guided tour · " + total + " steps";
      title = lesson.intro.title;
      text = lesson.intro.text;
    } else if (isOutro) {
      stageText = "Finished";
      title = lesson.outro.title;
      text = lesson.outro.text;
    } else {
      const step = lesson.steps[index];
      const box = data.boxes.find((b) => b.id === step.box);
      stageKey = step.stage || "";
      const stageLabel = step.stageLabel || (lesson.stages && lesson.stages[stageKey]) || "";
      stageText = "Step " + (index + 1) + " of " + total + (stageLabel ? " · " + stageLabel : "");
      title = labelForBox(data, step.box);
      text = step.text;
      example = step.example || "";
      credit = step.credit || "";
      figure = step.figure || null;
      handbookUrl = box && box.handbookUrl ? box.handbookUrl : "";
      placeholder = !!(box && box.isPlaceholder);
    }

    lessonStageEl.textContent = stageText;
    lessonStageEl.dataset.stage = stageKey;
    lessonTitleEl.textContent = title;
    buildLessonFigure(figure);
    lessonTextEl.textContent = text;
    setOptionalText(lessonExampleEl, example ? "In this example: " + example : "");
    setOptionalText(lessonCreditEl, credit);
    lessonPlaceholderNote.hidden = !placeholder;
    lessonHandbookEl.hidden = !handbookUrl;
    if (handbookUrl) lessonHandbookEl.href = handbookUrl;
    lessonBodyEl.scrollTop = 0;

    // The welcome card shows the stages ahead; the closing card offers a way on.
    lessonExtraEl.textContent = "";
    if (isIntro && lesson.stages) {
      const list = document.createElement("ol");
      list.className = "lesson-stage-list";
      Object.keys(lesson.stages || {}).forEach((key) => {
        const item = document.createElement("li");
        item.dataset.stage = key;
        item.textContent = lesson.stages[key];
        list.appendChild(item);
      });
      lessonExtraEl.appendChild(list);
    } else if (isOutro) {
      const replay = document.createElement("button");
      replay.type = "button";
      replay.className = "lesson-link";
      replay.textContent = "Take the tour again";
      replay.addEventListener("click", () => lessonGoTo(-1, false));
      lessonExtraEl.appendChild(replay);
      ((lesson.outro && lesson.outro.links) || []).forEach((link) => {
        const onward = document.createElement("button");
        onward.type = "button";
        onward.className = "lesson-link";
        onward.textContent = link.label;
        onward.addEventListener("click", () => {
          markTourSeen();
          endLesson(false);
          goToView(link.view);
        });
        lessonExtraEl.appendChild(onward);
      });
    }

    lessonBackBtn.hidden = isIntro;
    lessonNextBtn.textContent = isIntro ? "Start the tour" : isOutro ? "Finish" : "Next";
    lessonNextBtn.classList.toggle("has-arrow", !isIntro && !isOutro);
  }

  // Every connector whose two ends both touch boxes in `ids` (two different
  // boxes, so a line doesn't light off a single box).
  function connectorsAmong(ids) {
    const touching = (point) => ids.filter((id) => {
      const regions = boxRegions.get(id);
      return regions && distanceToRegions(regions, point) <= TOUR_ANCHOR_TOLERANCE;
    });
    return connectors.filter((connector) => {
      const from = touching(connector.points[0]);
      const to = touching(connector.points[connector.points.length - 1]);
      return from.length > 0 && to.length > 0 && (from.length > 1 || to.length > 1 || from[0] !== to[0]);
    });
  }

  function lightConnectors(ids) {
    connectorsAmong(ids).forEach((connector) => connector.el.classList.add("tour-flow"));
  }

  // Bring the box into view before the spotlight goes to it: centre it in the
  // diagram, and scroll the page if it sits too near the top or bottom of the
  // screen for the card to have room.
  function panToBox(el) {
    const wrapRect = stageWrap.getBoundingClientRect();
    const boxRect = el.getBoundingClientRect();
    const left = stageWrap.scrollLeft + (boxRect.left + boxRect.width / 2) - (wrapRect.left + wrapRect.width / 2);
    const behavior = prefersReducedMotion ? "auto" : "smooth";
    stageWrap.scrollTo({ left: Math.max(0, left), behavior: behavior });
    const vh = window.innerHeight;
    const centre = boxRect.top + boxRect.height / 2;
    if (centre < vh * 0.15 || centre > vh * 0.75) {
      window.scrollBy({ top: centre - vh * (phoneQuery.matches ? 0.3 : 0.42), behavior: behavior });
    }
  }

  /* Moves the tour to step `target` (-1 welcome, `total` closing card).
     `animate` is true only for a plain step forward: then the glow travels
     down the arrow into the new box. Anything else (back, a jump, the
     progress bar) snaps straight to the right state. A fresh run id on every
     call means a quick second click simply takes over from a glow still
     travelling. */
  async function lessonGoTo(target, animate) {
    const lesson = currentLesson();
    if (!lesson || !lessonState.active || !lessonState.running) return;
    const steps = lesson.steps;
    target = Math.max(-1, Math.min(steps.length, target));
    const previous = lessonState.index;
    lessonState.index = target;
    tourState.runId += 1;
    const runId = tourState.runId;

    // The card comes back once the spotlight has settled on the new box.
    cardShown = false;
    lessonCard.classList.remove("is-ready");
    stepStartedAt = performance.now();
    renderLessonCard();
    clearTourMarks();
    if (target < 0) return; // welcome card: the plain diagram, nothing ringed

    const ids = steps.map((step) => step.box);
    if (target >= steps.length) { // closing card: the whole route, lit
      lightConnectors(ids);
      stage.classList.add("tour-complete");
      return;
    }

    stage.classList.add("tour-running");
    const covered = ids.slice(0, target);
    covered.forEach((id) => {
      const el = tourBoxEl(id);
      if (el) el.classList.add("tour-visited");
    });
    lightConnectors(covered);
    const targetEl = tourBoxEl(ids[target]);
    if (targetEl) panToBox(targetEl);

    if (animate && target === previous + 1 && target > 0) {
      // A feedback-loop step names the one connector it travels, which starts
      // from a box other than the previous step's.
      const via = steps[target].via;
      const fromId = via ? via.from : ids[target - 1];
      const from = tourBoxEl(fromId);
      if (from) from.classList.add("tour-focus");
      const arrived = await travelLeg(runId, via ? connectorBetween(via.from, via.to) : connectorBetween(fromId, ids[target]));
      if (!arrived) return; // another click took over mid-glow
    }
    focusStep(ids[target]);
    lightConnectors(ids.slice(0, target + 1));
  }

  function lessonNext() {
    if (!lessonState.running) return;
    if (lessonState.index >= lessonState.total) {  // "Finish"
      markTourSeen();
      endLesson(true);
    } else {
      lessonGoTo(lessonState.index + 1, true);
    }
  }

  function lessonBack() {
    if (lessonState.running && lessonState.index > -1) lessonGoTo(lessonState.index - 1, false);
  }

  // Skipping (or closing on the last card) — the last card keeps its lit route.
  function closeTour() {
    markTourSeen(); // skipping counts: the tour isn't pushed on them again
    endLesson(lessonState.index >= lessonState.total);
  }

  /* Runs every frame while the tour is up: eases the spotlight to the box
     (wherever scrolling, panning or zooming has put it) and, once it has
     settled, places the card beside it. */
  function trackTour() {
    trackFrame = 0;
    if (!lessonState.running) return;

    const el = tourTargetEl();
    let target;
    if (el) {
      const r = el.getBoundingClientRect();
      target = { x: r.left - SPOT_PAD, y: r.top - SPOT_PAD, w: r.width + SPOT_PAD * 2, h: r.height + SPOT_PAD * 2 };
    } else {
      target = { x: window.innerWidth / 2, y: window.innerHeight / 2, w: 0, h: 0 };
    }
    if (!spot.init) {
      spot.x = target.x; spot.y = target.y; spot.w = target.w; spot.h = target.h;
      spot.init = true;
    }
    // Eased by elapsed time, not by frame count, so the glide takes the same
    // moment on a slow or busy device (a long gap between frames just snaps).
    const now = performance.now();
    const dt = lastTrackTime ? now - lastTrackTime : 16;
    lastTrackTime = now;
    const ease = prefersReducedMotion ? 1 : 1 - Math.exp(-dt / 90);
    spot.x += (target.x - spot.x) * ease;
    spot.y += (target.y - spot.y) * ease;
    spot.w += (target.w - spot.w) * ease;
    spot.h += (target.h - spot.h) * ease;
    const off = Math.abs(target.x - spot.x) + Math.abs(target.y - spot.y) + Math.abs(target.w - spot.w) + Math.abs(target.h - spot.h);
    const settled = off < 0.8;
    if (settled) {
      spot.x = target.x; spot.y = target.y; spot.w = target.w; spot.h = target.h;
    }

    tourSpot.classList.toggle("is-empty", !el);
    tourSpot.style.width = spot.w + "px";
    tourSpot.style.height = spot.h + "px";
    tourSpot.style.transform = "translate(" + spot.x + "px, " + spot.y + "px)";

    const elapsed = performance.now() - stepStartedAt;
    if (!cardShown && ((settled && elapsed > 120) || elapsed > 1200)) {
      cardShown = true;
      lessonCard.classList.add("is-ready");
      lessonNextBtn.focus({ preventScroll: true });
    }
    if (cardShown) placeLessonCard(el ? target : null);

    trackFrame = requestAnimationFrame(trackTour);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /* Puts the card beside the spotlight, on whichever side has room (right or
     left first on a wide screen, below or above first on a phone), with its
     arrow aimed at the box. If nothing fits without covering the box, it takes
     the roomier of above and below and lets its text scroll. With no target
     (welcome / closing card) it sits in the middle of the screen. */
  function placeLessonCard(target) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    lessonCard.style.maxHeight = "";
    const width = lessonCard.offsetWidth;
    let height = lessonCard.offsetHeight;
    let left;
    let top;
    let placement = "";
    let arrow = ARROW_INSET;

    if (!target) {
      left = (vw - width) / 2;
      top = (vh - height) / 2;
    } else {
      const right = target.x + target.w;
      const bottom = target.y + target.h;
      const space = {
        right: vw - right - CARD_GAP - CARD_MARGIN,
        left: target.x - CARD_GAP - CARD_MARGIN,
        bottom: vh - bottom - CARD_GAP - CARD_MARGIN,
        top: target.y - CARD_GAP - CARD_MARGIN
      };
      const order = phoneQuery.matches ? ["bottom", "top", "right", "left"] : ["right", "left", "bottom", "top"];
      placement = order.find((side) => (side === "right" || side === "left" ? space[side] >= width : space[side] >= height)) || "";
      if (!placement) {
        placement = space.bottom >= space.top ? "bottom" : "top";
        lessonCard.style.maxHeight = Math.max(160, space[placement]) + "px";
        height = lessonCard.offsetHeight;
      }
      const centreX = target.x + target.w / 2;
      const centreY = target.y + target.h / 2;
      if (placement === "right" || placement === "left") {
        left = placement === "right" ? right + CARD_GAP : target.x - CARD_GAP - width;
        top = clamp(centreY - height / 2, CARD_MARGIN, Math.max(CARD_MARGIN, vh - height - CARD_MARGIN));
        arrow = clamp(centreY - top, ARROW_INSET, height - ARROW_INSET);
      } else {
        top = placement === "bottom" ? bottom + CARD_GAP : target.y - CARD_GAP - height;
        left = clamp(centreX - width / 2, CARD_MARGIN, Math.max(CARD_MARGIN, vw - width - CARD_MARGIN));
        arrow = clamp(centreX - left, ARROW_INSET, width - ARROW_INSET);
      }
    }

    lessonCard.style.transform = "translate(" + Math.round(left) + "px, " + Math.round(top) + "px)";
    lessonCard.style.setProperty("--arrow-offset", Math.round(arrow) + "px");
    if (lessonCard.dataset.placement !== placement) lessonCard.dataset.placement = placement;
  }

  function openLightbox(image, opener) {
    if (!lightboxEl) return;
    lightboxOpener = opener || null;
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightboxEl.hidden = false;
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightboxEl || lightboxEl.hidden) return;
    lightboxEl.hidden = true;
    lightboxImg.removeAttribute("src");
    if (lightboxOpener && lightboxOpener.isConnected) lightboxOpener.focus();
    lightboxOpener = null;
  }

  [lessonStartBtn, lessonStartInline].forEach((btn) => {
    if (btn) btn.addEventListener("click", () => startLesson(-1));
  });
  if (lessonCloseBtn) lessonCloseBtn.addEventListener("click", closeTour);
  if (lessonNextBtn) lessonNextBtn.addEventListener("click", lessonNext);
  if (lessonBackBtn) lessonBackBtn.addEventListener("click", lessonBack);
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxEl) {
    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    const lightboxOpen = lightboxEl && !lightboxEl.hidden;
    if (e.key === "Escape") {
      if (lightboxOpen) closeLightbox();
      else if (lessonState.running) closeTour();
      return;
    }
    if (!lessonState.running || lightboxOpen || !modalBackdrop.hidden) return;

    // Keep Tab inside the card while the tour is up.
    if (e.key === "Tab") {
      const focusable = Array.from(lessonCard.querySelectorAll("button, a[href]")).filter((el) => !el.hidden && el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!lessonCard.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }

    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "")) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      lessonNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      lessonBack();
    }
  });

  // View switching. Selecting a view also writes it into the URL, so a link
  // can point straight at one level — the landing page's "Explore TPRAF"
  // buttons and this page's own "explore the extended form" link both rely on
  // it. The hash is also read back, so pasted links and browser Back/Forward
  // step through views rather than doing nothing.
  let currentViewKey = null;

  function selectView(viewKey) {
    if (viewKey === currentViewKey) return;
    currentViewKey = viewKey;
    document.querySelectorAll(".level-tab").forEach((t) => {
      t.setAttribute("aria-selected", String(t.dataset.view === viewKey));
    });
    renderDiagram(viewKey);
  }

  document.querySelectorAll(".level-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.disabled) return;
      selectView(tab.dataset.view);
      location.hash = tab.dataset.view;
    });
  });

  // Covers the in-page "next view" link, pasted URLs and Back/Forward. An
  // unknown key is ignored rather than rendered as an unknown view, which is
  // what keeps the landing page's own #what-is-tpraf anchor harmless.
  window.addEventListener("hashchange", () => {
    const key = location.hash.slice(1);
    if (TPRAF_CONTENT[key]) selectView(key);
  });

  // Initial render. A #view hash wins so deep links land on the right level.
  const linkedView = location.hash.slice(1);
  selectView(TPRAF_CONTENT[linkedView] ? linkedView : "simple");
  setupDragToScroll(document.getElementById("diagram-stage-wrap"));
  setupDragToScroll(document.getElementById("diagram-toolbar"));
  setupZoomControls();

  // Scroll-reveal: fades in ".reveal" elements (the home page's section
  // heads and resource cards) as they enter view. No-op on diagram.html,
  // which has none. Elements are visible by default (see .reveal in
  // style.css), so a browser without IntersectionObserver just shows
  // everything immediately rather than hiding content.
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  // Round zoom button on the home page's diagram card: shows/hides the zoom controls.
  const zoomToggle = document.getElementById("zoom-toggle");
  if (zoomToggle) {
    const viewport = zoomToggle.closest(".diagram-viewport");
    zoomToggle.addEventListener("click", () => {
      const open = viewport.classList.toggle("zoom-open");
      zoomToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Header "Menu" button on the home page: slides the menu panel in from the
  // right, like dare.ac.uk's. Items with a circle arrow open a second panel;
  // Escape closes it, then the menu.
  const menuToggle = document.getElementById("menu-toggle");
  const siteMenu = document.getElementById("site-menu");
  if (menuToggle && siteMenu) {
    const root = document.documentElement;
    const subItems = siteMenu.querySelectorAll(".has-sub");
    const closeSubs = () => {
      subItems.forEach((li) => {
        li.classList.remove("is-open");
        li.querySelector(":scope > a").setAttribute("aria-expanded", "false");
      });
      root.classList.remove("menu-sub-open");
    };
    const setMenu = (open) => {
      siteMenu.classList.toggle("is-open", open);
      siteMenu.inert = !open;
      menuToggle.setAttribute("aria-expanded", String(open));
      root.classList.toggle("menu-open", open);
      if (!open) closeSubs();
    };
    setMenu(false);
    menuToggle.addEventListener("click", () => setMenu(!siteMenu.classList.contains("is-open")));
    subItems.forEach((li) => {
      const link = li.querySelector(":scope > a");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        li.classList.add("is-open");
        link.setAttribute("aria-expanded", "true");
        root.classList.add("menu-sub-open");
        li.querySelector(".sub-menu a").focus({ preventScroll: true });
      });
      li.querySelector(".sub-nav-back").addEventListener("click", () => { closeSubs(); link.focus(); });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !siteMenu.classList.contains("is-open")) return;
      if (root.classList.contains("menu-sub-open")) closeSubs();
      else { setMenu(false); menuToggle.focus(); }
    });
    document.addEventListener("click", (e) => {
      if (siteMenu.classList.contains("is-open") && !siteMenu.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
    });
  }
})();
