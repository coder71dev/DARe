/* Phase 3: inline editing on the public pages for signed-in admins. Hover
   an editable field -> a labeled chip names it -> click the field itself
   (or the chip) -> it swaps for a plain input/textarea holding its raw
   stored text, with a small Save/Cancel toolbar -> Save (or Enter on
   single-line fields, or clicking away) saves via the existing admin
   block-update endpoint and re-renders the field in place — no page
   reload. Cancel (or Escape) backs out without saving.

   Only ever loaded for signed-in admins (see LiveEdit::enabled()); plain
   visitors get none of this markup or script. */
(function () {
  "use strict";

  const ICONS = {
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>',
  };

  function svg(name) {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + "</svg>"
    );
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function csrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.content : "";
  }

  /** Converts an editable element's *rendered* HTML back to the raw text it was stored as. */
  function elementRawText(el, format) {
    const clone = el.cloneNode(true);
    if (format === "markdown") {
      clone.querySelectorAll("em").forEach((n) => n.replaceWith("*" + n.textContent + "*"));
      clone.querySelectorAll("strong").forEach((n) => n.replaceWith("**" + n.textContent + "**"));
    } else if (format === "br") {
      // nl2br() inserts <br> but *keeps* the original \n right after it in
      // the text, so just dropping the element (not replacing it with our
      // own \n) leaves exactly one newline, not two.
      clone.querySelectorAll("br").forEach((n) => n.remove());
    }
    return clone.textContent;
  }

  function groupRawText(elements, format) {
    return elements.map((el) => elementRawText(el, format).trim()).join("\n\n");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /** Mirrors App\Support\Markup::inline() — turns escaped bold/italic emphasis markers into tags. */
  function applyMarkdown(escaped) {
    return escaped.replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>").replace(/\*(.+?)\*/gs, "<em>$1</em>");
  }

  /** Mirrors PHP's nl2br(). */
  function applyBr(escaped) {
    return escaped.replace(/\n/g, "<br>");
  }

  /** Renders one field's raw stored text back to the HTML App\Support\Markup / nl2br would produce. */
  function renderFieldHtml(rawText, format) {
    const escaped = escapeHtml(rawText);
    if (format === "markdown") return applyMarkdown(escaped);
    if (format === "br") return applyBr(escaped);
    return escaped;
  }

  /** Mirrors App\Support\Markup::paragraphs() — splits on blank lines. */
  function splitParagraphs(text) {
    if (!text) return [];
    return text
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /** Like getBoundingClientRect(), but relative to the document rather than the viewport — stays correct under position:absolute overlays as the page scrolls. */
  function pageRect(el) {
    const r = el.getBoundingClientRect();
    return {
      top: r.top + window.scrollY,
      left: r.left + window.scrollX,
      right: r.right + window.scrollX,
      bottom: r.bottom + window.scrollY,
      width: r.width,
      height: r.height,
    };
  }

  function unionRect(elements) {
    const rects = elements.map(pageRect);
    const top = Math.min.apply(null, rects.map((r) => r.top));
    const left = Math.min.apply(null, rects.map((r) => r.left));
    const right = Math.max.apply(null, rects.map((r) => r.right));
    const bottom = Math.max.apply(null, rects.map((r) => r.bottom));
    return { top, left, width: right - left, height: bottom - top };
  }

  function clampLeft(left, width) {
    return Math.min(Math.max(4, left), window.innerWidth - width - 4);
  }

  onReady(function () {
    const chip = document.createElement("div");
    chip.className = "live-edit-chip";
    chip.innerHTML =
      '<span class="live-edit-chip-icon">' + svg("edit") + '</span><span class="live-edit-chip-label"></span>';
    document.body.appendChild(chip);
    const chipLabel = chip.querySelector(".live-edit-chip-label");

    const toolbar = document.createElement("div");
    toolbar.className = "live-edit-toolbar";
    toolbar.innerHTML =
      '<button type="button" class="live-edit-save" aria-label="Save">' +
      svg("check") +
      '</button><button type="button" class="live-edit-cancel" aria-label="Cancel">' +
      svg("x") +
      "</button>";
    document.body.appendChild(toolbar);

    const status = document.createElement("div");
    status.className = "live-edit-status";
    document.body.appendChild(status);

    let hoverTarget = null;
    let hideTimer = null;
    let statusTimer = null;
    let activeField = null;

    function positionChip(el) {
      const rect = pageRect(el);
      const chipRect = chip.getBoundingClientRect();
      const width = chipRect.width || 70;
      const top = Math.max(4 + window.scrollY, rect.top - 30);
      const left = clampLeft(rect.right - width, width);
      chip.style.top = top + "px";
      chip.style.left = left + "px";
    }

    function shortLabel(label) {
      return label.length > 22 ? label.slice(0, 21).trimEnd() + "…" : label;
    }

    function showChipFor(el) {
      clearTimeout(hideTimer);
      hoverTarget = el;
      el.classList.add("live-edit-hover");
      chipLabel.textContent = shortLabel(el.getAttribute("data-live-edit-label") || "Edit");
      chip.classList.add("is-visible");
      positionChip(el);
    }

    function scheduleHide() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        if (hoverTarget) hoverTarget.classList.remove("live-edit-hover");
        hoverTarget = null;
        chip.classList.remove("is-visible");
      }, 600);
    }

    // Delegated from document (rather than bound per-element) so that nodes
    // a save regenerates (see applyGroupUpdate) stay fully interactive
    // without needing their listeners re-attached.
    document.addEventListener("mouseover", function (e) {
      if (activeField) return;
      const el = e.target.closest("[data-live-edit]");
      if (!el || el === hoverTarget) return;
      showChipFor(el);
    });

    document.addEventListener("mouseout", function (e) {
      const el = e.target.closest("[data-live-edit]");
      if (!el) return;
      // mouseout fires when moving between an element's own descendants
      // too; only treat it as "left" once relatedTarget is truly outside.
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      scheduleHide();
    });

    document.addEventListener("click", function (e) {
      if (activeField) return;
      const el = e.target.closest("[data-live-edit]");
      if (!el) return;
      // True inline editing: click the text itself, not just the chip.
      // preventDefault() blocks the element's own default action (link
      // navigation, <summary> toggle) for this click.
      e.preventDefault();
      e.stopPropagation();
      startEdit(el);
    });

    chip.addEventListener("mouseenter", function () {
      clearTimeout(hideTimer);
    });
    chip.addEventListener("mouseleave", scheduleHide);

    // The hover chip only makes sense while the mouse and the hovered element
    // line up; once the page scrolls that's no longer true, so hide it. The
    // active field/toolbar/status are position:absolute (document-relative),
    // so they track the scroll on their own and need no repositioning here.
    window.addEventListener(
      "scroll",
      function () {
        if (activeField) return;
        chip.classList.remove("is-visible");
        if (hoverTarget) hoverTarget.classList.remove("live-edit-hover");
        hoverTarget = null;
      },
      { passive: true }
    );

    function hideStatus() {
      clearTimeout(statusTimer);
      status.classList.remove("is-visible");
    }

    function showStatus(rect, variant, text, autoHideMs) {
      clearTimeout(statusTimer);
      const icon = variant === "error" ? svg("x") : variant === "saved" ? svg("check") : '<span class="live-edit-spinner"></span>';
      status.innerHTML = '<span class="live-edit-status-icon">' + icon + "</span><span>" + text + "</span>";
      status.classList.toggle("is-error", variant === "error");
      const top = Math.max(4 + window.scrollY, rect.top - 34);
      status.style.top = top + "px";
      status.style.left = clampLeft(rect.left, 140) + "px";
      status.classList.add("is-visible");
      if (autoHideMs) {
        statusTimer = setTimeout(hideStatus, autoHideMs);
      }
    }

    function autoGrow(field) {
      if (field.tagName !== "TEXTAREA") return;
      field.style.height = "auto";
      field.style.height = field.scrollHeight + 2 + "px";
    }

    function positionToolbar(af) {
      const rect = pageRect(af.field);
      const toolbarRect = toolbar.getBoundingClientRect();
      const width = toolbarRect.width || 58;
      toolbar.style.top = rect.bottom + 6 + "px";
      toolbar.style.left = clampLeft(rect.right - width, width) + "px";
    }

    function restoreGroup(group) {
      group.forEach((el) => {
        el.style.display = "";
      });
    }

    function startEdit(target) {
      if (activeField) return;

      const [kind, recordId, field] = target.getAttribute("data-live-edit").split(":");
      const multiline = target.hasAttribute("data-live-edit-multiline");
      const format = target.getAttribute("data-live-edit-format") || "plain";
      const paragraphs = target.hasAttribute("data-live-edit-paragraphs");
      const groupKey = target.getAttribute("data-live-edit");
      const group = Array.from(document.querySelectorAll('[data-live-edit="' + CSS.escape(groupKey) + '"]'));
      const rawText = groupRawText(group, format);

      chip.classList.remove("is-visible");
      target.classList.remove("live-edit-hover");
      target.classList.add("live-edit-editing");

      const rect = unionRect(group);
      const computed = getComputedStyle(target);
      const field_ = document.createElement(multiline ? "textarea" : "input");
      field_.className = "live-edit-field";
      field_.value = rawText;
      if (!multiline) field_.type = "text";
      field_.style.top = rect.top + "px";
      field_.style.left = rect.left + "px";
      field_.style.width = Math.max(rect.width, 160) + "px";
      field_.style.minHeight = Math.max(rect.height, multiline ? 60 : 0) + "px";
      field_.style.fontSize = computed.fontSize;
      field_.style.fontFamily = computed.fontFamily;
      field_.style.fontWeight = computed.fontWeight;
      field_.style.color = computed.color;
      field_.style.lineHeight = computed.lineHeight;

      document.body.appendChild(field_);
      group.forEach((el) => {
        el.style.display = "none";
      });

      autoGrow(field_);
      field_.focus();
      field_.select();

      activeField = { field: field_, group, format, multiline, paragraphs, kind, recordId, fieldName: field, target, rawText };
      positionToolbar(activeField);
      toolbar.classList.add("is-visible");

      field_.addEventListener("input", function () {
        autoGrow(field_);
        positionToolbar(activeField);
      });

      field_.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          e.preventDefault();
          // Stop this from also reaching page-level Escape handlers — e.g.
          // the diagram popup's own Escape-closes-it listener, which would
          // otherwise close the whole popup when you only meant to cancel
          // the text edit inside it.
          e.stopPropagation();
          cancelEdit();
        } else if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          finishEdit();
        }
      });

      field_.addEventListener("blur", function () {
        // Toolbar buttons preventDefault() on mousedown so clicking them
        // never blurs the field in the first place — this only fires for a
        // genuine click-away, so it's safe to treat as "done, save it".
        finishEdit();
      });
    }

    function cleanupField() {
      if (!activeField) return;
      activeField.target.classList.remove("live-edit-editing");
      activeField.field.remove();
      toolbar.classList.remove("is-visible");
      activeField = null;
    }

    function cancelEdit() {
      if (!activeField) return;
      restoreGroup(activeField.group);
      hideStatus();
      cleanupField();
    }

    /**
     * Writes the new text into the group's elements, mirroring what the
     * server would render, and returns the elements now holding it.
     *
     * A non-paragraph field (the common case) is always exactly one element
     * and is updated in place (same node, just new innerHTML) — some of
     * these are elements other scripts keep their own direct reference to
     * (e.g. app.js's modalTitle/modalText for the diagram popup), which a
     * clone-and-replace would silently leave stale after the first save.
     *
     * A paragraph field's edit can add or remove a paragraph, so there's no
     * way around rebuilding that group's elements to match the new count —
     * those genuinely are replaced, cloned from the first one as a template.
     */
    function applyGroupUpdate(af, newValue) {
      const { group, format, paragraphs } = af;

      if (!paragraphs) {
        const el = group[0];
        el.style.display = "";
        el.classList.remove("live-edit-hover", "live-edit-editing");
        el.innerHTML = renderFieldHtml(newValue, format);
        return [el];
      }

      const template = group[0];
      const parent = template.parentNode;

      const newNodes = splitParagraphs(newValue).map(function (text) {
        const node = template.cloneNode(false);
        node.style.display = "";
        // template may be the clicked element itself (still carrying these
        // transient state classes until cleanupField() runs) — never let a
        // freshly rendered node inherit them.
        node.classList.remove("live-edit-hover", "live-edit-editing");
        node.innerHTML = renderFieldHtml(text, format);
        return node;
      });

      newNodes.forEach((node) => parent.insertBefore(node, template));
      group.forEach((el) => el.remove());

      return newNodes;
    }

    // "block" (a PageBlock field) and "element" (a TprafElement field, the
    // diagram's box/popup text — see app.js's openModal()) save to different
    // endpoints with differently shaped payloads.
    function saveRequest(af, newValue) {
      if (af.kind === "element") {
        return fetch("/admin/elements/" + af.recordId, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": csrfToken(),
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ [af.fieldName]: newValue }),
        });
      }

      return fetch("/admin/blocks/" + af.recordId, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken(),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ props: { [af.fieldName]: newValue } }),
      });
    }

    function finishEdit() {
      if (!activeField) return;
      const af = activeField;
      const { field, rawText } = af;
      const newValue = field.value;

      if (newValue === rawText) {
        cancelEdit();
        return;
      }

      showStatus(pageRect(field), "saving", "Saving…");
      toolbar.classList.remove("is-visible");
      field.disabled = true;

      saveRequest(af, newValue)
        .then(function (res) {
          if (!res.ok) throw new Error("Save failed (" + res.status + ")");
          const statusRect = pageRect(field);
          const newNodes = applyGroupUpdate(af, newValue);
          cleanupField();
          showStatus(newNodes[0] ? pageRect(newNodes[0]) : statusRect, "saved", "Saved", 1200);
        })
        .catch(function () {
          field.disabled = false;
          showStatus(pageRect(field), "error", "Couldn't save — try again");
          toolbar.classList.add("is-visible");
          positionToolbar(af);
          field.focus();
        });
    }

    chip.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (hoverTarget) startEdit(hoverTarget);
    });

    toolbar.querySelector(".live-edit-save").addEventListener("mousedown", function (e) {
      e.preventDefault();
    });
    toolbar.querySelector(".live-edit-save").addEventListener("click", function (e) {
      e.preventDefault();
      finishEdit();
    });
    toolbar.querySelector(".live-edit-cancel").addEventListener("mousedown", function (e) {
      e.preventDefault();
    });
    toolbar.querySelector(".live-edit-cancel").addEventListener("click", function (e) {
      e.preventDefault();
      cancelEdit();
    });
  });
})();
