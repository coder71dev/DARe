/* Phase 3: hover-to-edit affordance for signed-in admins on the public
   pages. Hover an editable field -> a pencil button appears next to it ->
   click the pencil -> the field swaps for a plain input/textarea holding
   its raw stored text -> blur (or Enter on single-line fields) saves via
   the existing admin block-update endpoint and reloads to show the
   server-rendered result; Escape cancels without saving.

   Only ever loaded for signed-in admins (see LiveEdit::enabled()); plain
   visitors get none of this markup or script. */
(function () {
  "use strict";

  const SCROLL_KEY = "liveEditScrollY";

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

  function unionRect(elements) {
    const rects = elements.map((el) => el.getBoundingClientRect());
    const top = Math.min.apply(null, rects.map((r) => r.top));
    const left = Math.min.apply(null, rects.map((r) => r.left));
    const right = Math.max.apply(null, rects.map((r) => r.right));
    const bottom = Math.max.apply(null, rects.map((r) => r.bottom));
    return { top, left, width: right - left, height: bottom - top };
  }

  onReady(function () {
    const pencil = document.createElement("button");
    pencil.type = "button";
    pencil.className = "live-edit-pencil";
    pencil.setAttribute("aria-label", "Edit this text");
    pencil.innerHTML =
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M14.85 2.15a1.5 1.5 0 0 1 2.12 0l.88.88a1.5 1.5 0 0 1 0 2.12L7.4 15.6l-3.6.9.9-3.6L14.85 2.15Z"/></svg>';
    document.body.appendChild(pencil);

    const status = document.createElement("div");
    status.className = "live-edit-status";
    document.body.appendChild(status);

    let hoverTarget = null;
    let hideTimer = null;
    let activeField = null; // {input, group, format, multiline, groupKey}

    function positionPencil(el) {
      const rect = el.getBoundingClientRect();
      const top = Math.max(4, rect.top - 2);
      let left = rect.right + 6;
      if (left > window.innerWidth - 30) {
        left = Math.max(4, rect.left - 30);
      }
      pencil.style.top = top + "px";
      pencil.style.left = left + "px";
      pencil.classList.add("is-visible");
    }

    function showPencilFor(el) {
      clearTimeout(hideTimer);
      hoverTarget = el;
      el.classList.add("live-edit-hover");
      positionPencil(el);
    }

    function scheduleHide() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        if (hoverTarget) {
          hoverTarget.classList.remove("live-edit-hover");
        }
        hoverTarget = null;
        pencil.classList.remove("is-visible");
      }, 180);
    }

    document.querySelectorAll("[data-live-edit]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (activeField) return;
        showPencilFor(el);
      });
      el.addEventListener("mouseleave", scheduleHide);
    });

    pencil.addEventListener("mouseenter", function () {
      clearTimeout(hideTimer);
    });
    pencil.addEventListener("mouseleave", scheduleHide);

    window.addEventListener(
      "scroll",
      function () {
        if (!activeField) {
          pencil.classList.remove("is-visible");
          if (hoverTarget) hoverTarget.classList.remove("live-edit-hover");
          hoverTarget = null;
        }
      },
      { passive: true }
    );

    function showStatus(el, text, isError) {
      const rect = el.getBoundingClientRect();
      status.textContent = text;
      status.classList.toggle("is-error", !!isError);
      status.style.top = Math.max(4, rect.top - 28) + "px";
      status.style.left = rect.left + "px";
      status.classList.add("is-visible");
    }

    function hideStatus() {
      status.classList.remove("is-visible");
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

      pencil.classList.remove("is-visible");
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
      field_.style.width = Math.max(rect.width, 120) + "px";
      field_.style.height = Math.max(rect.height, multiline ? 80 : 0) + "px";
      field_.style.fontSize = computed.fontSize;
      field_.style.fontFamily = computed.fontFamily;
      field_.style.fontWeight = computed.fontWeight;
      field_.style.color = computed.color;
      field_.style.lineHeight = computed.lineHeight;

      document.body.appendChild(field_);
      group.forEach((el) => {
        el.style.display = "none";
      });

      field_.focus();
      field_.select();

      activeField = { field: field_, group, format, multiline, blockId, fieldName: field, target, rawText };

      field_.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          e.preventDefault();
          cancelEdit();
        } else if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          field_.blur();
        }
      });

      field_.addEventListener("blur", function () {
        finishEdit();
      });
    }

    function cleanupField() {
      if (!activeField) return;
      activeField.target.classList.remove("live-edit-editing");
      activeField.field.remove();
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

      showStatus(group[0], "Saving…", false);
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
          showStatus(group[0], "Couldn't save — try again or press Esc", true);
          field.focus();
        });
    }

    pencil.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (hoverTarget) {
        startEdit(hoverTarget);
      }
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
