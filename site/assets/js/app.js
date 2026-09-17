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

  // Guide panel: collapsible legend + interaction hints, rebuilt per view
  // since the colour legend's meaning shifts slightly between Simple (no
  // DSP/IMP split) and Extended (colours = process). Collapsed/expanded
  // state is remembered per browser as a convenience, not load-bearing —
  // if storage is unavailable the guide just defaults to expanded.
  function getGuideCollapsed() {
    try {
      return localStorage.getItem("tpraf-guide-collapsed") === "1";
    } catch (e) {
      return false;
    }
  }

  function setGuideCollapsed(collapsed) {
    guideEl.dataset.collapsed = collapsed ? "true" : "false";
    guideToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    try {
      localStorage.setItem("tpraf-guide-collapsed", collapsed ? "1" : "0");
    } catch (e) {
      /* per-viewer convenience only — fine if it can't persist */
    }
  }

  if (guideToggle) {
    guideToggle.addEventListener("click", () => {
      setGuideCollapsed(guideEl.dataset.collapsed !== "true");
    });
    setGuideCollapsed(getGuideCollapsed());
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

    return `
      <p class="diagram-guide-hint">Click any box or label to see its full detail.${toggleHint} Drag (or swipe on mobile) to pan around, and use the zoom controls to fit the whole diagram on screen.</p>
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
    const data = TPRAF_CONTENT[viewKey];
    if (!data) {
      titleEl.textContent = "Coming soon";
      subtitleEl.textContent = "This level isn't built yet — check back after the next milestone.";
      svgLayer.innerHTML = "";
      stage.querySelectorAll(".diagram-box, .diagram-label").forEach((n) => n.remove());
      guideEl.hidden = true;
      return;
    }

    titleEl.textContent = data.title;
    subtitleEl.textContent = data.subtitle;
    guideEl.hidden = false;
    guideBody.innerHTML = buildGuideBody(data);

    currentMaxX = computeMaxX(data);

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

  // View switching. Selecting a view also writes it into the URL, so a link
  // can point straight at one level — the landing page's "Explore TPRAF"
  // button uses this to open the extended form directly.
  function selectView(viewKey) {
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

  // Initial render. A #view hash wins so deep links land on the right level;
  // anything that isn't a real view key is ignored rather than rendered as an
  // unknown view — the landing page's own #what-is-tpraf anchor, for
  // instance, and the landing page's embedded copy of this diagram.
  const linkedView = location.hash.slice(1);
  selectView(TPRAF_CONTENT[linkedView] ? linkedView : "simple");
  setupDragToScroll();
  setupZoomControls();
})();
