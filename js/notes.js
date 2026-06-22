(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});

  let handler = null;
  let boundId = null;

  function effId() {
    return AP.getEffectiveChatId ? AP.getEffectiveChatId() : "__nochat__";
  }

  function load() {
    const textarea = document.getElementById("ap-notes-textarea");
    if (!textarea) return;

    if (handler) {
      textarea.removeEventListener("input", handler);
      handler = null;
    }

    boundId = effId();
    textarea.disabled = false;
    textarea.placeholder = AP.getActiveChatId && AP.getActiveChatId()
      ? "Нотатка для цього чату…"
      : "Нотатка (без активного чату)…";
    textarea.value = AP.storage.getChatData(boundId).notes || "";

    handler = () => {
      const data = AP.storage.getChatData(boundId);
      data.notes = textarea.value;
      AP.storage.setChatData(boundId, data);
    };
    textarea.addEventListener("input", handler);
  }

  AP.notes = { load };
})();
