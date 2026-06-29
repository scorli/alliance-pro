(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});

  const PRESETS = ["#5b6cff", "#8a5bff", "#19b36b", "#ff7a59", "#ef4757", "#0ea5e9", "#f59e0b", "#14b8a6"];

  function current() {
    return AP.storage.getSettings().theme === "dark" ? "dark" : "light";
  }

  function apply(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-ap-theme", t);
    document.querySelectorAll(".ap-theme-btn").forEach((btn) => {
      btn.textContent = t === "dark" ? "☀️" : "🌙";
      btn.title = t === "dark" ? "Світла тема" : "Темна тема";
    });
  }

  function set(theme) {
    AP.storage.patchSettings({ theme: theme === "dark" ? "dark" : "light" });
    apply(theme);
  }

  function toggle() {
    set(current() === "dark" ? "light" : "dark");
  }

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
  }

  function lighten(hex, amount) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const f = (v) => Math.round(v + (255 - v) * amount);
    const h = (v) => f(v).toString(16).padStart(2, "0");
    return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
  }

  function applyAccent(color) {
    const root = document.documentElement;
    if (!color) {
      root.style.removeProperty("--ap-accent");
      root.style.removeProperty("--ap-accent-2");
      root.style.removeProperty("--ap-accent-soft");
      return;
    }
    const rgb = hexToRgb(color);
    root.style.setProperty("--ap-accent", color);
    root.style.setProperty("--ap-accent-2", lighten(color, 0.18));
    if (rgb) root.style.setProperty("--ap-accent-soft", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`);
  }

  function setAccent(color) {
    AP.storage.patchSettings({ accent: color || null });
    applyAccent(color || null);
  }

  function applyScale(scale) {
    const s = Math.max(0.7, Math.min(1.6, parseFloat(scale) || 1));
    const c = document.getElementById("alliance-pro-container");
    if (c) c.style.zoom = s;
    const r = document.getElementById("ap-restore");
    if (r) r.style.zoom = s;
  }

  // Поточний масштаб панелі (zoom). Потрібен для коректного перетягування та
  // зміни висоти: курсор рухається в реальних пікселях, а всередині zoom-елемента
  // CSS-пікселі множаться на масштаб, тож зсуви треба ділити на нього.
  function getScale() {
    return Math.max(0.7, Math.min(1.6, parseFloat(AP.storage.getSettings().uiScale) || 1));
  }

  function setScale(scale) {
    const s = Math.max(0.7, Math.min(1.6, parseFloat(scale) || 1));
    AP.storage.patchSettings({ uiScale: s });
    applyScale(s);
  }

  function init() {
    apply(current());
    applyAccent(AP.storage.getSettings().accent);
    applyScale(AP.storage.getSettings().uiScale);
  }

  AP.theme = { init, apply, set, toggle, current, applyAccent, setAccent, applyScale, setScale, getScale, PRESETS };
})();
