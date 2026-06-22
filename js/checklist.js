(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});

  let config = [];
  let dragId = null;

  function applyOptHighlight(opts) {
    if (!opts) return;
    opts.querySelectorAll(".ap-opt").forEach((o) => {
      if (o.parentElement) o.parentElement.classList.toggle("ap-opt-on", o.checked);
    });
  }

  function chatId() {
    return AP.getEffectiveChatId ? AP.getEffectiveChatId() : (AP.getActiveChatId && AP.getActiveChatId()) || "__nochat__";
  }

  function renderProfileSelect() {
    const bar = document.getElementById("ap-profile-bar");
    if (!bar || !AP.storage.getProfiles) return;
    const data = AP.storage.getProfiles();
    if (!data.list || data.list.length <= 1) {
      bar.style.display = "none";
      bar.innerHTML = "";
      return;
    }
    bar.style.display = "";
    bar.innerHTML = "";
    const sel = document.createElement("select");
    sel.className = "ap-select ap-profile-select";
    sel.title = "Профіль чек-листа";
    data.list.forEach((p) => {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.name;
      if (p.id === data.activeId) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => {
      AP.storage.setActiveProfile(sel.value);
      applyConfig();
    });
    bar.appendChild(sel);
  }

  function render() {
    renderProfileSelect();
    config = AP.storage.getCheckboxConfig();
    const root = document.getElementById("ap-checkboxes");
    if (!root) return;
    root.innerHTML = "";

    config.forEach((cfg) => {
      const row = document.createElement("div");
      row.className = "ap-cb-row";
      row.dataset.id = cfg.id;

      const top = document.createElement("div");
      top.className = "ap-cb-top";

      const handle = document.createElement("span");
      handle.className = "ap-cb-drag";
      handle.textContent = "⠿";
      handle.title = "Перетягнути";
      handle.draggable = true;

      const lab = document.createElement("label");
      lab.className = "ap-cb-labelwrap";
      lab.htmlFor = cfg.id;
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = cfg.id;
      cb.className = "ap-cb";
      const span = document.createElement("span");
      span.className = "ap-cb-label";
      span.textContent = cfg.label;
      lab.appendChild(cb);
      lab.appendChild(span);

      top.appendChild(handle);
      top.appendChild(lab);
      row.appendChild(top);

      if (cfg.variative && cfg.options && cfg.options.length) {
        const opts = document.createElement("div");
        opts.className = "ap-opts-row";
        opts.id = "ap-opts-" + cfg.id;
        opts.style.display = "none";

        cfg.options.forEach((label, i) => {
          if (!label) return;
          const ol = document.createElement("label");
          ol.className = "ap-opt-label";
          const inp = document.createElement("input");
          inp.type = "checkbox";
          inp.className = "ap-opt";
          inp.value = "opt-" + i;
          inp.dataset.text = label;
          inp.addEventListener("change", () => {
            applyOptHighlight(opts);
            save();
            updatePreview();
          });
          const ot = document.createElement("span");
          ot.textContent = label;
          ol.appendChild(inp);
          ol.appendChild(ot);
          opts.appendChild(ol);
        });

        cb.addEventListener("change", () => {
          opts.style.display = cb.checked ? "flex" : "none";
          if (!cb.checked) opts.querySelectorAll(".ap-opt").forEach((o) => { o.checked = false; });
          applyOptHighlight(opts);
        });

        row.appendChild(opts);
      }

      cb.addEventListener("change", () => { save(); updatePreview(); });

      handle.addEventListener("dragstart", (e) => {
        dragId = cfg.id;
        row.classList.add("ap-dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          try { e.dataTransfer.setData("text/plain", cfg.id); } catch (x) {}
        }
      });
      handle.addEventListener("dragend", () => {
        dragId = null;
        document.querySelectorAll(".ap-cb-row").forEach((r) => r.classList.remove("ap-dragging", "ap-drop-target"));
      });
      row.addEventListener("dragover", (e) => {
        if (dragId && dragId !== cfg.id) { e.preventDefault(); row.classList.add("ap-drop-target"); }
      });
      row.addEventListener("dragleave", () => row.classList.remove("ap-drop-target"));
      row.addEventListener("drop", (e) => {
        e.preventDefault();
        row.classList.remove("ap-drop-target");
        if (dragId && dragId !== cfg.id) reorder(dragId, cfg.id);
      });

      root.appendChild(row);
    });
  }

  function reorder(fromId, toId) {
    const from = config.findIndex((c) => c.id === fromId);
    const to = config.findIndex((c) => c.id === toId);
    if (from < 0 || to < 0) return;
    const [moved] = config.splice(from, 1);
    config.splice(to, 0, moved);
    AP.storage.setCheckboxConfig(config);
    render();
    load();
  }

  function load() {
    const data = AP.storage.getChatData(chatId());
    config.forEach((cfg) => {
      const cb = document.getElementById(cfg.id);
      if (!cb) return;
      const checked = !!(data.checks && data.checks[cfg.id]);
      cb.checked = checked;
      const opts = document.getElementById("ap-opts-" + cfg.id);
      if (opts) {
        opts.style.display = checked ? "flex" : "none";
        const saved = (data.opts && data.opts[cfg.id]) || [];
        opts.querySelectorAll(".ap-opt").forEach((inp, i) => {
          inp.checked = checked && !!saved[i];
        });
        applyOptHighlight(opts);
      }
    });
    const comment = document.getElementById("ap-comment");
    if (comment) { comment.value = data.comment || ""; comment.disabled = false; }
    updatePreview();
  }

  function save() {
    const id = chatId();
    const data = AP.storage.getChatData(id);
    data.checks = {};
    data.opts = {};
    config.forEach((cfg) => {
      const cb = document.getElementById(cfg.id);
      data.checks[cfg.id] = cb ? cb.checked : false;
      const opts = document.getElementById("ap-opts-" + cfg.id);
      if (opts) {
        data.opts[cfg.id] = Array.from(opts.querySelectorAll(".ap-opt")).map((o) => o.checked);
      }
    });
    const comment = document.getElementById("ap-comment");
    data.comment = comment ? comment.value : "";
    AP.storage.setChatData(id, data);
  }

  function detailFor(cfg) {
    const opts = document.getElementById("ap-opts-" + cfg.id);
    if (!opts) return "";
    const sel = Array.from(opts.querySelectorAll(".ap-opt")).filter((o) => o.checked).map((o) => o.dataset.text);
    return sel.join(", ");
  }

  function buildText() {
    const done = [];
    const remaining = [];
    config.forEach((cfg) => {
      const cb = document.getElementById(cfg.id);
      if (cb && cb.checked) {
        const detail = cfg.variative ? detailFor(cfg) : "";
        done.push(detail ? `${cfg.label}(${detail})` : cfg.label);
      } else {
        remaining.push(cfg.label);
      }
    });
    const comment = document.getElementById("ap-comment");
    const commentVal = comment && comment.value.trim() ? comment.value.trim() : "";
    const doneStr = done.length ? done.join(", ") : "—";
    const remStr = remaining.length ? remaining.join(", ") : "—";
    const parts = [`Зроблено: ${doneStr}`, `Залишилось: ${remStr}`];
    if (commentVal) parts.push(`Комент: ${commentVal}`);
    return parts.join("\n\n");
  }

  function updatePreview() {
    const preview = document.getElementById("ap-preview");
    if (preview) preview.textContent = buildText();
  }

  function flashStatus(text) {
    const el = document.getElementById("ap-copy-status");
    if (!el) return;
    el.textContent = text;
    el.classList.add("ap-visible");
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(() => el.classList.remove("ap-visible"), 1600);
  }

  async function copy() {
    const text = buildText();
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
      document.body.removeChild(ta);
    }
    flashStatus(ok ? "Скопійовано ✓" : "Помилка копіювання");
    if (ok && AP.storage.getSettings().resetAfterCopy) reset(true);
  }

  function reset(silent) {
    config.forEach((cfg) => {
      const cb = document.getElementById(cfg.id);
      if (cb) cb.checked = false;
      const opts = document.getElementById("ap-opts-" + cfg.id);
      if (opts) {
        opts.style.display = "none";
        opts.querySelectorAll(".ap-opt").forEach((o) => { o.checked = false; });
        applyOptHighlight(opts);
      }
    });
    const comment = document.getElementById("ap-comment");
    if (comment) comment.value = "";
    save();
    updatePreview();
    if (!silent) flashStatus("Скинуто");
  }

  function bindControls() {
    const copyBtn = document.getElementById("ap-copy-btn");
    const resetBtn = document.getElementById("ap-reset-btn");
    const comment = document.getElementById("ap-comment");
    if (copyBtn) copyBtn.addEventListener("click", copy);
    if (resetBtn) resetBtn.addEventListener("click", () => reset(false));
    if (comment) comment.addEventListener("input", () => { save(); updatePreview(); });
  }

  function applyConfig() {
    render();
    load();
  }

  AP.checklist = { render, load, save, buildText, copy, reset, bindControls, applyConfig, reorder };
})();
