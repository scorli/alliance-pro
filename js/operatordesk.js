(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});
  const BASE_URL = "https://operatordesk.ftband.net/?sgroup=104";

  function activeChatId() {
    return AP.getActiveChatId ? AP.getActiveChatId() : null;
  }

  function setCid(chatId, cid) {
    const data = AP.storage.getChatData(chatId);
    data.cid = cid;
    AP.storage.setChatData(chatId, data);
  }

  function updateClientIdDisplay(chatId) {
    const el = document.getElementById("ap-cid-value");
    if (!el) return;
    const cid = chatId ? AP.storage.getChatData(chatId).cid : null;
    if (!cid) el.textContent = "Не знайдено";
    else if (cid === "unlinked") el.textContent = "Непідв'яз";
    else el.textContent = cid;
  }

  // Шукає лише числовий CID у повідомленнях чату (без відкриття РС).
  function detectNumericCid(chatId) {
    const messages = Array.from(
      document.querySelectorAll(
        `.sf_chat_msg_holder [data-user-id="${chatId}"] .sf_chat_msg_text_message`
      )
    );
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i].textContent.trim().match(/\)\s(\d+):/);
      if (m && m[1]) return m[1];
    }
    return null;
  }

  let autoObserver = null;

  // Авто-визначення CID при відкритті/перемиканні чату: одразу показує
  // збережений ID, інакше сканує повідомлення (з невеликим спостерігачем,
  // бо вони підвантажуються не миттєво) і підставляє знайдений CID.
  function autoDetectCid() {
    if (autoObserver) { autoObserver.disconnect(); autoObserver = null; }

    const chatId = activeChatId();
    updateClientIdDisplay(chatId);
    if (!chatId) return;
    if (AP.storage.getChatData(chatId).cid) return;

    function tryDetect() {
      if (activeChatId() !== chatId) return true;
      const found = detectNumericCid(chatId);
      if (found) {
        setCid(chatId, found);
        updateClientIdDisplay(chatId);
        return true;
      }
      return false;
    }

    if (tryDetect()) return;

    const holder = document.querySelector(".sf_chat_msg_holder") || document.body;
    autoObserver = new MutationObserver(() => {
      if (tryDetect()) { autoObserver.disconnect(); autoObserver = null; }
    });
    autoObserver.observe(holder, { childList: true, subtree: true });
    setTimeout(() => { if (autoObserver) { autoObserver.disconnect(); autoObserver = null; } }, 10000);
  }

  function openClientDesktop() {
    const chatId = activeChatId();
    if (!chatId) {
      AP.ui && AP.ui.alert({ title: "Немає активного чату", text: "Відкрийте чат, щоб знайти клієнта." });
      return;
    }
    const cid = AP.storage.getChatData(chatId).cid;
    if (cid && cid !== "unlinked") {
      window.open(`${BASE_URL}&gateway=LINK_CL_GET&cid=${cid}`, "_blank");
      return;
    }
    if (cid === "unlinked") {
      window.open(`${BASE_URL}&gateway=MANUAL_SEARCH`, "_blank");
      return;
    }
    searchClientIdInDOM(chatId);
  }

  function searchClientIdInDOM(chatId) {
    const messages = Array.from(
      document.querySelectorAll(
        `.sf_chat_msg_holder [data-user-id="${chatId}"] .sf_chat_msg_text_message`
      )
    );
    for (let i = messages.length - 1; i >= 0; i--) {
      const text = messages[i].textContent.trim();
      const unlinkedMatch = text.match(/\([^)]+\):/);
      const cidMatch = text.match(/\)\s(\d+):/);
      if (unlinkedMatch && !cidMatch) {
        setCid(chatId, "unlinked");
        updateClientIdDisplay(chatId);
        window.open(`${BASE_URL}&gateway=MANUAL_SEARCH`, "_blank");
        return;
      } else if (cidMatch && cidMatch[1]) {
        setCid(chatId, cidMatch[1]);
        updateClientIdDisplay(chatId);
        window.open(`${BASE_URL}&gateway=LINK_CL_GET&cid=${cidMatch[1]}`, "_blank");
        return;
      }
    }
    AP.ui && AP.ui.alert({
      title: "CID не знайдено",
      text: "Не вдалося знайти CID. За потреби додайте його вручну (олівець)."
    });
  }

  function editClientCid() {
    const chatId = activeChatId();
    if (!chatId) return;
    const current = AP.storage.getChatData(chatId).cid || "";
    AP.ui.prompt({
      title: "Редагувати ID клієнта",
      text: "Введіть ID клієнта (тільки цифри):",
      value: current === "unlinked" ? "" : current,
      placeholder: "наприклад: 1234567890",
      onConfirm: (val) => {
        val = (val || "").trim();
        if (!val) return;
        if (/^\d+$/.test(val)) {
          setCid(chatId, val);
          updateClientIdDisplay(chatId);
        } else {
          AP.ui.alert({
            title: "Невірний формат",
            text: "Будь ласка, введіть тільки цифри.",
            onClose: () => setTimeout(editClientCid, 60)
          });
        }
      }
    });
  }

  function clearClientCid() {
    const chatId = activeChatId();
    if (!chatId) return;
    AP.ui.confirm({
      title: "Очистити ID клієнта?",
      text: "Очистити збережений ID для цього чату?",
      onConfirm: () => {
        setCid(chatId, null);
        updateClientIdDisplay(chatId);
      }
    });
  }

  // Натискає рідну кнопку HARVESTER на сторінці чату (серверна дія Sender)
  function triggerHarvester() {
    const btns = Array.from(document.querySelectorAll("button.sender_form_has_action, button"));
    const b = btns.find((el) => el.textContent && el.textContent.trim().toUpperCase() === "HARVESTER");
    if (b) { b.click(); return true; }
    return false;
  }

  AP.operatordesk = {
    openClientDesktop,
    updateClientIdDisplay,
    autoDetectCid,
    editClientCid,
    clearClientCid,
    triggerHarvester
  };
})();
