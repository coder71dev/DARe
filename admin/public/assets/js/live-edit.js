/* Phase 3: hover-to-edit affordance for signed-in admins on the public
   pages. Hover an editable field -> a labeled chip appears above it ->
   click it -> the field swaps for a plain input/textarea holding its raw
   stored text, with a small Save/Cancel toolbar -> Save (or Enter on
   single-line fields, or clicking away) saves via the existing admin
   block-update endpoint and reloads to show the server-rendered result;
   Cancel (or Escape) backs out without saving.

   Only ever loaded for signed-in admins (see LiveEdit::enabled()); plain
   visitors get none of this markup or script. */
(function () {
  "use strict";

  const SCROLL_KEY = "liveEditScrollY";

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
      clone.querySelectorAll("br").forEach((n) => n.replaceWith("\n"));
    }
    return clone.textContent;
  }

  function groupRawText(elements, format) {
    return elements.map((el) => elementRawText(el, format).trim()).join("\n\n");
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

    document.querySelectorAll("[data-live-edit]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (activeField) return;
        showChipFor(el);
      });
      el.addEventListener("mouseleave", scheduleHide);
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
      status.classList.remove("is-visible");
    }

    function showStatus(rect, variant, text) {
      const icon = variant === "error" ? svg("x") : '<span class="live-edit-spinner"></span>';
      status.innerHTML = '<span class="live-edit-status-icon">' + icon + "</span><span>" + text + "</span>";
      status.classList.toggle("is-error", variant === "error");
      const top = Math.max(4 + window.scrollY, rect.top - 34);
      status.style.top = top + "px";
      status.style.left = clampLeft(rect.left, 140) + "px";
      status.classList.add("is-visible");
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

      const [blockId, field] = target.getAttribute("data-live-edit").split(":");
      const multiline = target.hasAttribute("data-live-edit-multiline");
      const format = target.getAttribute("data-live-edit-format") || "plain";
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

      activeField = { field: field_, group, format, multiline, blockId, fieldName: field, target, rawText };
      positionToolbar(activeField);
      toolbar.classList.add("is-visible");

      field_.addEventListener("input", function () {
        autoGrow(field_);
        positionToolbar(activeField);
      });

      field_.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          e.preventDefault();
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
      hideStatus();
    }

    function cancelEdit() {
      if (!activeField) return;
      restoreGroup(activeField.group);
      cleanupField();
      activeField = null;
    }

    function finishEdit() {
      if (!activeField) return;
      const { field, group, blockId, fieldName, rawText } = activeField;
      const newValue = field.value;

      if (newValue === rawText) {
        cancelEdit();
        return;
      }

      showStatus(pageRect(field), "saving", "Saving…");
      toolbar.classList.remove("is-visible");
      field.disabled = true;

      fetch("/admin/blocks/" + blockId, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken(),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ props: { [fieldName]: newValue } }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Save failed (" + res.status + ")");
          try {
            sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
          } catch (_) {
            // Storage can be unavailable (private browsing, sandboxed preview); losing
            // the scroll-restore is harmless, the save itself already succeeded.
          }
          location.reload();
        })
        .catch(function () {
          field.disabled = false;
          showStatus(pageRect(field), "error", "Couldn't save — try again");
          toolbar.classList.add("is-visible");
          positionToolbar(activeField);
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

    try {
      const savedScroll = sessionStorage.getItem(SCROLL_KEY);
      if (savedScroll !== null) {
        sessionStorage.removeItem(SCROLL_KEY);
        window.scrollTo(0, parseInt(savedScroll, 10) || 0);
      }
    } catch (_) {
      // Storage can be unavailable; just skip the scroll restore.
    }
  });
})();
