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
    closeModal();
    if (tourState.running) stopTour();
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
    line.setAttribute("marker-end", "url(#arrowhead)");
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
    polyline.setAttribute("marker-end", "url(#arrowhead)");
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
  // padding budget doesn't leave room for longer wrapped labels.
  function isCompactBox(box) {
    return box.pos.width < 12 || box.pos.height < 8;
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
    if (box.startHere) el.classList.add("is-start");
    el.addEventListener("click", () => openModal(box));
    return el;
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
  // it groups, purely visual (no click target, no text). A "dashed" style
  // container (no fill, dashed outline) reproduces the source diagrams'
  // sub-groupings within a cluster (e.g. DSP's Risk Assessment/Asset
  // Performance/Resilience Assessment trio) and the outer boundary around
  // Detailed Option Assessment + Portfolio Optimisation together.
  function makeContainerEl(container) {
    const el = document.createElement("div");
    const variantClass = container.variant ? ` variant-${container.variant}` : "";
    el.className = "diagram-cluster-bg" + variantClass + (container.style === "dashed" ? " style-dashed" : "");
    el.style.left = pctX(container.pos.left);
    el.style.top = pct(container.pos.top);
    el.style.width = pctX(container.pos.width);
    el.style.height = pct(container.pos.height);
    if (container.group) el.dataset.group = container.group;
    return el;
  }

  // Section titles (e.g. "Transport Scenarios") — plain text, not a
  // popup-opening control, so a div rather than a button. An optional
  // colour variant renders it as a solid bar (matching the source Level 2
  // diagrams, where each process stage has its own coloured title bar)
  // instead of plain text.
  function makeHeadingEl(heading) {
    const el = document.createElement("div");
    el.className = "diagram-heading" + (heading.variant ? ` variant-${heading.variant}` : "");
    el.style.left = pctX(heading.pos.left);
    el.style.top = pct(heading.pos.top);
    el.style.width = pctX(heading.pos.width);
    el.style.height = pct(heading.pos.height);
    el.textContent = heading.label;
    return el;
  }

  /* Guide panel: collapsible legend + interaction hints, rebuilt per view
     since the colour legend's meaning shifts slightly between Simple (no
     DSP/IMP split) and Extended (colours = process).

     Collapsed by default: the guide is a reference to open when you want it,
     not something that stands between the title and the diagram on every
     visit. Only a real open/close is remembered, so the default still applies
     to anyone who has never touched it. The key is renamed from
     "tpraf-guide-collapsed", which the old expanded-by-default start-up wrote
     for every visitor — they'd otherwise keep getting the old behaviour. */
  const GUIDE_STORAGE_KEY = "tpraf-guide-open";

  function getGuideCollapsed() {
    try {
      return localStorage.getItem(GUIDE_STORAGE_KEY) !== "1";
    } catch (e) {
      return true; // no storage available: fall back to the default, not to a preference
    }
  }

  function setGuideCollapsed(collapsed, persist) {
    guideEl.dataset.collapsed = collapsed ? "true" : "false";
    guideToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    if (!persist) return;
    try {
      localStorage.setItem(GUIDE_STORAGE_KEY, collapsed ? "0" : "1");
    } catch (e) {
      /* per-viewer convenience only — fine if it can't persist */
    }
  }

  if (guideToggle) {
    guideToggle.addEventListener("click", () => {
      setGuideCollapsed(guideEl.dataset.collapsed !== "true", true);
    });
    setGuideCollapsed(getGuideCollapsed(), false);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  function buildGuideBody(data) {
    const hasProcessGroups = data.boxes.some((b) => b.group);
    // Level 2 views set their own data.legend (different meaning: box type,
    // not DSP/IMP process) instead of the Level 1 navy/sky/leaf default.
    const legend = data.legend || [
      ["navy", hasProcessGroups ? "Impact Modelling (IMP) steps" : "Hazard & scenario steps"],
      ["sky", hasProcessGroups ? "Decision Support (DSP) steps" : "Evaluation & risk steps"],
      ["leaf", "Key decision point"]
    ];
    const legendHtml = legend
      .map(([swatch, label]) => `<li><span class="diagram-guide-swatch swatch-${swatch}"></span>${escapeHtml(label)}</li>`)
      .join("");
    const hasPlaceholders = data.boxes.some((b) => b.isPlaceholder) || (data.labels || []).some((l) => l.isPlaceholder);
    const hasFeedback = (data.feedbackPaths || []).length > 0;
    const dotHtml = hasPlaceholders ? `<li><span class="diagram-guide-swatch swatch-dot"></span>Wording still coming from DARe</li>` : "";
    const lineHtml = hasFeedback ? `<li><span class="diagram-guide-swatch swatch-line"></span>Feedback loop</li>` : "";

    const toggleHint = hasProcessGroups
      ? " Use the <strong>DSP only</strong> / <strong>IMP only</strong> buttons above the diagram to follow just one process at a time."
      : "";

    const status = data.status || "Working draft, ready for review — Level 1 is complete below; Level 2 component diagrams are next.";

    const tourHint = (data.tour || []).length
      ? " Or press <strong>Play walkthrough</strong> to watch the steps light up in order, and see how the diagram loops back on itself."
      : "";

    return `
      <p class="diagram-guide-hint">Click any box or label to see its full detail.${toggleHint}${tourHint} Drag (or swipe on mobile) to pan around, and use the zoom controls to fit the whole diagram on screen.</p>
      <ul class="diagram-guide-legend">${legendHtml}${dotHtml}${lineHtml}</ul>
      <p class="diagram-guide-status">${escapeHtml(status)}</p>
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
      if (processPanelExplore) processPanelExplore.hidden = true;
      if (processBtnAll) processBtnAll.setAttribute("aria-pressed", "true");
      applyProcessFilter();
      return;
    }
    const info = (typeof TPRAF_DSP_IMP !== "undefined" && TPRAF_DSP_IMP[key]) || null;
    if (info) {
      processPanelTitle.textContent = info.title;
      processPanelText.textContent = info.text;
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
    }
    const activeBtn = key === "dsp" ? processBtnDsp : processBtnImp;
    if (activeBtn) activeBtn.setAttribute("aria-pressed", "true");
    applyProcessFilter();
  }

  if (processBtnAll) processBtnAll.addEventListener("click", () => setProcessPanel(null));
  if (processBtnDsp) processBtnDsp.addEventListener("click", () => setProcessPanel("dsp"));
  if (processBtnImp) processBtnImp.addEventListener("click", () => setProcessPanel("imp"));

  function renderDiagram(viewKey) {
    // A walkthrough belongs to one view's own step order, so it can't survive
    // a switch — the boxes it's lighting up are about to be thrown away.
    if (tourState.running || tourState.finished) stopTour();

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
    guideEl.hidden = false;
    guideBody.innerHTML = buildGuideBody(data);

    currentMaxX = computeMaxX(data);

    // Clear previous render
    svgLayer.innerHTML = "";
    connectors = [];
    tourPulse = null;
    stage.querySelectorAll(".diagram-box, .diagram-label, .diagram-heading, .diagram-box-halo, .diagram-cluster-bg, .tour-pulse").forEach((n) => n.remove());

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

    buildAnchorRegions(data);
    if (tourBar) tourBar.hidden = !(data.tour && data.tour.length);
    setCaption(tourIdleCaption(), false); // this view's own step count

    applyCropToStage(data);
    refreshZoom();

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
  function tourIdleCaption() {
    const data = TPRAF_CONTENT[currentViewKey];
    const count = ((data && data.tour) || []).length;
    return count ? "Watch all " + count + " steps in order." : "";
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

    // Fully lit, and the last leg has closed the loop back to the start. Drop
    // the dimming so the finished diagram reads as a whole again, and leave the
    // route glowing until the visitor stops or replays it.
    stage.classList.remove("tour-running");
    stage.classList.add("tour-complete");
    tourState.running = false;
    tourState.finished = true;
    setTourControls("finished");
    setCaption("Walkthrough complete — " + steps.length + " steps, and the loop closes back to the start.", true);
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
})();
