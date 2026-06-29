(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});

  function initDraggable(container, handle) {
    if (!container || !handle) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    const settings = AP.storage.getSettings();
    if (settings.windowPosition) {
      offsetX = settings.windowPosition.x || 0;
      offsetY = settings.windowPosition.y || 0;
      container.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function scaleFactor() {
      return (AP.theme && AP.theme.getScale) ? AP.theme.getScale() : 1;
    }

    function dragStart(e) {
      if (e.type === "mousedown" && e.button !== 0) return;
      if (e.target.closest("button, input, textarea, .ap-icon-btn")) return;
      const point = e.touches ? e.touches[0] : e;
      const scale = scaleFactor();
      // offsetX/Y — це значення translate у локальних (до-zoom) пікселях; курсор
      // рухається в реальних, тож множимо/ділимо на масштаб.
      startX = point.clientX - offsetX * scale;
      startY = point.clientY - offsetY * scale;
      isDragging = true;
      document.body.style.userSelect = "none";
      if (e.type === "touchstart") e.preventDefault();
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      const scale = scaleFactor();
      let nextX = (point.clientX - startX) / scale;
      let nextY = (point.clientY - startY) / scale;

      const rect = container.getBoundingClientRect(); // реальні (після zoom) пікселі
      const baseLeft = rect.left - offsetX * scale;   // позиція при translate = 0
      const baseTop = rect.top - offsetY * scale;
      // Межі рахуємо в реальних пікселях, потім переводимо в локальні (÷ scale).
      const minX = (4 - baseLeft) / scale;
      const maxX = (window.innerWidth - rect.width - 4 - baseLeft) / scale;
      const minY = (4 - baseTop) / scale;
      const maxY = (window.innerHeight - rect.height - 4 - baseTop) / scale;

      nextX = Math.max(minX, Math.min(maxX, nextX));
      nextY = Math.max(minY, Math.min(maxY, nextY));

      offsetX = nextX;
      offsetY = nextY;
      container.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.userSelect = "";
      AP.storage.patchSettings({ windowPosition: { x: offsetX, y: offsetY } });
    }

    handle.addEventListener("mousedown", dragStart);
    handle.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("touchend", dragEnd);

    function reset() {
      offsetX = 0;
      offsetY = 0;
      container.style.transform = "translate(0px, 0px)";
      AP.storage.patchSettings({ windowPosition: { x: 0, y: 0 } });
    }

    AP._resetPanelPosition = reset;
  }

  AP.draggable = { initDraggable };
})();
