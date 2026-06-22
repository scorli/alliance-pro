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

    function dragStart(e) {
      if (e.type === "mousedown" && e.button !== 0) return;
      if (e.target.closest("button, input, textarea, .ap-icon-btn")) return;
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX - offsetX;
      startY = point.clientY - offsetY;
      isDragging = true;
      document.body.style.userSelect = "none";
      if (e.type === "touchstart") e.preventDefault();
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      let nextX = point.clientX - startX;
      let nextY = point.clientY - startY;

      const rect = container.getBoundingClientRect();
      const curLeft = rect.left - offsetX;
      const curTop = rect.top - offsetY;
      const minX = -curLeft + 4;
      const maxX = window.innerWidth - rect.width - curLeft - 4;
      const minY = -curTop + 4;
      const maxY = window.innerHeight - rect.height - curTop - 4;

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
