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

  AP.operatordesk = {
    openClientDesktop,
    updateClientIdDisplay,
    editClientCid,
    clearClientCid
  };
})();
