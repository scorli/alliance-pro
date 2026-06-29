(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});

  const CONTAINER_ID = "alliance-pro-container";
  const CHAT_BOX_SELECTOR = ".sf_chat_msg_holder";
  let previousChatId = null;

  AP.getActiveChatId = function () {
    const el = document.querySelector(".sf_sidebar_company_chat--active");
    if (!el) return null;
    const id = el.getAttribute("data-id");
    return id ? id.split("+")[0] : null;
  };

  AP.getEffectiveChatId = function () {
    return AP.getActiveChatId() || "__nochat__";
  };

  function panelHTML() {
    return `
      <div class="ap-header" id="ap-drag-handle">
        <div class="ap-brand">
          <span class="ap-brand-dot"></span>
          <span>Soft&nbsp;Pro</span>
        </div>
        <div class="ap-header-actions">
          <button class="ap-icon-btn ap-mode-btn" id="ap-mode-btn" title="Режим: Чат / Телефонія">💬</button>
          <button class="ap-icon-btn" id="ap-history-btn" title="Історія (останні 10)">📋</button>
          <button class="ap-icon-btn" id="ap-compact-btn" title="Компактний режим">⊟</button>
          <button class="ap-icon-btn ap-bright-btn" id="ap-settings-btn" title="Налаштування">⚙️</button>
          <button class="ap-icon-btn" id="ap-home-btn" title="На місце">⌂</button>
          <button class="ap-icon-btn" id="ap-collapse-btn" title="Згорнути вміст">▾</button>
          <button class="ap-icon-btn" id="ap-hide-btn" title="Сховати панель">✕</button>
        </div>
      </div>

      <div class="ap-body" id="ap-body">
        <div class="ap-tabs">
          <button class="ap-tab" data-tab="checklist">Чек-лист</button>
          <button class="ap-tab" data-tab="timer">Таймер</button>
          <button class="ap-tab" data-tab="calc">Калькулятор</button>
          <button class="ap-tab" data-tab="notes">Нотатки</button>
        </div>

        <div class="ap-panes">
          <section class="ap-pane" data-pane="checklist">
            <div class="ap-cid-bar">
              <span class="ap-cid-label">ID:</span>
              <span id="ap-cid-value" class="ap-cid-value">Не знайдено</span>
              <button id="ap-cid-edit" class="ap-icon-btn ap-cid-icon" title="Редагувати ID">✎</button>
              <button id="ap-cid-clear" class="ap-icon-btn ap-cid-icon" title="Очистити ID">⌫</button>
              <button id="ap-open-desktop" class="ap-btn ap-btn-accent">Відкрити РС</button>
              <button id="ap-harvester" class="ap-btn ap-btn-ghost" title="Запустити HARVESTER на сторінці">HARVESTER</button>
            </div>

            <div id="ap-mode-banner" class="ap-mode-banner" style="display:none"></div>

            <div id="ap-sync-banner" class="ap-sync-banner" style="display:none">
              <span id="ap-sync-text">🔁 Знайдено прогрес попереднього оператора</span>
              <button id="ap-sync-apply" class="ap-btn ap-btn-primary">Застосувати</button>
              <button id="ap-sync-dismiss" class="ap-icon-btn" title="Сховати">✕</button>
            </div>

            <div id="ap-events" class="ap-events"></div>
            <div id="ap-subevents" class="ap-subevents"></div>

            <div id="ap-steps" class="ap-steps"></div>

            <div class="ap-mood-row" id="ap-mood-field">
              <span class="ap-mood-label">🙂 Настрій:</span>
              <div id="ap-mood" class="ap-mood ap-mood-compact"></div>
            </div>

            <div class="ap-result-row">
              <span class="ap-result-label">🏁 Результат:</span>
              <select id="ap-result" class="ap-result-select"></select>
            </div>

            <div class="ap-notes-block is-collapsed" id="ap-cl-notes-block">
              <button type="button" class="ap-notes-toggle" id="ap-cl-notes-toggle">
                <span>📝 Нотатки</span><span class="ap-notes-chev">▼</span>
              </button>
              <textarea id="ap-comment" class="ap-textarea ap-cl-notes-area" rows="3" placeholder="Коротко: що сказав клієнт, домовленості, тригери…"></textarea>
            </div>

            <div class="ap-actions">
              <button id="ap-copy-btn" class="ap-btn ap-btn-primary">Скопіювати</button>
              <button id="ap-reset-btn" class="ap-btn ap-btn-ghost">Скинути</button>
              <button id="ap-pull-btn" class="ap-btn ap-btn-accent" title="Підтягнути прогрес із токена (з чату або буфера обміну)">⤵️ Підтягнути</button>
              <span id="ap-copy-status" class="ap-status"></span>
            </div>
          </section>

          <section class="ap-pane" data-pane="timer">
            <div id="ap-timer-display" class="ap-timer-display">00:00</div>

            <div class="ap-timer-inputs">
              <div class="ap-stepper">
                <button class="ap-step-btn" data-step="-60">−</button>
                <div class="ap-stepper-field">
                  <input id="ap-timer-min" class="ap-time-input" type="number" min="0" max="180" value="5">
                  <span class="ap-stepper-cap">хв</span>
                </div>
                <button class="ap-step-btn" data-step="60">+</button>
              </div>
              <span class="ap-timer-colon">:</span>
              <div class="ap-stepper">
                <button class="ap-step-btn" data-step="-1">−</button>
                <div class="ap-stepper-field">
                  <input id="ap-timer-sec" class="ap-time-input" type="number" min="0" max="59" value="0">
                  <span class="ap-stepper-cap">сек</span>
                </div>
                <button class="ap-step-btn" data-step="1">+</button>
              </div>
            </div>

            <div class="ap-quick">
              <button class="ap-quick-btn" data-min="1">1 хв</button>
              <button class="ap-quick-btn" data-min="3">3 хв</button>
              <button class="ap-quick-btn" data-min="5">5 хв</button>
              <button class="ap-quick-btn" data-min="10">10 хв</button>
            </div>

            <div class="ap-actions">
              <button id="ap-timer-start" class="ap-btn ap-btn-primary">Старт</button>
              <button id="ap-timer-pause" class="ap-btn ap-btn-ghost" disabled>Пауза</button>
              <button id="ap-timer-reset" class="ap-btn ap-btn-ghost">Скинути</button>
              <button id="ap-alarm-stop" class="ap-btn ap-btn-danger" style="display:none">Стоп сигнал</button>
            </div>

            <div class="ap-reminder">
              <span class="ap-field-label" style="flex-basis:100%">Будильник</span>
              <div class="ap-alarm-main">
                <input type="time" id="ap-rem-time">
                <button id="ap-rem-toggle" class="ap-btn ap-btn-primary">Поставити</button>
              </div>
              <div class="ap-alarm-quick">
                <button class="ap-alarm-add" data-min="15">+15 хв</button>
                <button class="ap-alarm-add" data-min="30">+30 хв</button>
                <button class="ap-alarm-add" data-min="60">+1 год</button>
              </div>
              <span id="ap-rem-status" class="ap-rem-status"></span>
            </div>
          </section>

          <section class="ap-pane" data-pane="calc">
            <div id="ap-calc-display" class="ap-calc-display" tabindex="0" title="Клікніть і використовуйте клавіатуру">0</div>
            <div class="ap-calc-grid">
              <button data-action="clear" class="ap-calc-btn ap-calc-fn">C</button>
              <button data-action="back" class="ap-calc-btn ap-calc-fn">⌫</button>
              <button data-action="percent" class="ap-calc-btn ap-calc-fn">%</button>
              <button data-op="/" class="ap-calc-btn ap-calc-op">÷</button>

              <button data-num="7" class="ap-calc-btn">7</button>
              <button data-num="8" class="ap-calc-btn">8</button>
              <button data-num="9" class="ap-calc-btn">9</button>
              <button data-op="*" class="ap-calc-btn ap-calc-op">×</button>

              <button data-num="4" class="ap-calc-btn">4</button>
              <button data-num="5" class="ap-calc-btn">5</button>
              <button data-num="6" class="ap-calc-btn">6</button>
              <button data-op="-" class="ap-calc-btn ap-calc-op">−</button>

              <button data-num="1" class="ap-calc-btn">1</button>
              <button data-num="2" class="ap-calc-btn">2</button>
              <button data-num="3" class="ap-calc-btn">3</button>
              <button data-op="+" class="ap-calc-btn ap-calc-op">+</button>

              <button data-num="0" class="ap-calc-btn ap-calc-zero">0</button>
              <button data-num="." class="ap-calc-btn">.</button>
              <button data-action="equals" class="ap-calc-btn ap-calc-eq">=</button>
            </div>
          </section>

          <section class="ap-pane" data-pane="notes">
            <div class="ap-field" id="ap-links-field" style="display:none">
              <label class="ap-field-label">Корисні посилання</label>
              <div id="ap-links" class="ap-links"></div>
            </div>
            <textarea id="ap-notes-textarea" class="ap-textarea ap-notes-area" placeholder="Нотатка для цього чату…"></textarea>
          </section>
        </div>
      </div>

      <div class="ap-resize-handle" id="ap-resize-handle" title="Перетягніть, щоб змінити висоту">
        <span class="ap-resize-grip"></span>
      </div>
    `;
  }

  function buildPanel() {
    if (document.getElementById(CONTAINER_ID)) return document.getElementById(CONTAINER_ID);

    const container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.className = "ap-container";
    container.innerHTML = panelHTML();

    const host = document.querySelector(CHAT_BOX_SELECTOR) || document.body;
    host.appendChild(container);

    if (!document.getElementById("ap-restore")) {
      const restore = document.createElement("button");
      restore.id = "ap-restore";
      restore.title = "Soft Pro";
      restore.textContent = "SP";
      restore.style.display = "none";
      restore.addEventListener("click", showPanel);
      host.appendChild(restore);
    }

    return container;
  }

  function showPanel() {
    const c = document.getElementById(CONTAINER_ID);
    const r = document.getElementById("ap-restore");
    if (c) c.style.display = "flex";
    if (r) r.style.display = "none";
    AP.storage.patchSettings({ hidden: false });
  }

  function hidePanel() {
    const c = document.getElementById(CONTAINER_ID);
    const r = document.getElementById("ap-restore");
    if (c) c.style.display = "none";
    if (r) r.style.display = "flex";
    AP.storage.patchSettings({ hidden: true });
  }

  function setActiveTab(tab) {
    document.querySelectorAll(".ap-tab").forEach((t) => {
      t.classList.toggle("ap-tab-active", t.dataset.tab === tab);
    });
    document.querySelectorAll(".ap-pane").forEach((p) => {
      p.classList.toggle("ap-pane-active", p.dataset.pane === tab);
    });
    AP.storage.patchSettings({ activeTab: tab });
    // Зміна висоти — лише на чек-листі; інші вкладки фіксовані (авто-висота)
    const c = document.getElementById(CONTAINER_ID);
    const handle = c && c.querySelector("#ap-resize-handle");
    if (handle) handle.style.display = tab === "checklist" ? "" : "none";
    applyPanelHeight(AP.storage.getSettings().panelHeight);
  }

  function applyModeButton(container) {
    const btn = container.querySelector("#ap-mode-btn");
    if (!btn) return;
    const mode = AP.storage.getSettings().mode || "chat";
    const phone = mode === "phone";
    btn.textContent = phone ? "📞" : "💬";
    btn.title = phone ? "Режим: Телефонія (натисніть для Чату)" : "Режим: Чат (натисніть для Телефонії)";
    btn.classList.toggle("ap-mode-phone", phone);
  }

  function wireHeader(container) {
    const modeBtn = container.querySelector("#ap-mode-btn");
    if (modeBtn) {
      modeBtn.addEventListener("click", () => {
        const cur = AP.storage.getSettings().mode || "chat";
        AP.storage.patchSettings({ mode: cur === "phone" ? "chat" : "phone" });
        applyModeButton(container);
        AP.checklist.applyConfig();
      });
    }
    applyModeButton(container);

    const compactBtn = container.querySelector("#ap-compact-btn");
    function applyCompact(on) {
      container.classList.toggle("ap-compact", on);
      compactBtn.textContent = on ? "⊞" : "⊟";
      compactBtn.title = on ? "Звичайний розмір" : "Компактний режим";
      if (on) {
        // Компактний режим завжди має стандартну (авто) висоту,
        // ручна висота тимчасово скидається.
        container.style.height = "";
        container.style.maxHeight = "";
      } else {
        // Повертаємо збережену ручну висоту (якщо була)
        applyPanelHeight(AP.storage.getSettings().panelHeight);
      }
    }
    applyCompact(!!AP.storage.getSettings().compact);
    compactBtn.addEventListener("click", () => {
      const on = !container.classList.contains("ap-compact");
      applyCompact(on);
      AP.storage.patchSettings({ compact: on });
    });

    container.querySelector("#ap-settings-btn").addEventListener("click", () => AP.settings.showSettings());
    const histBtn = container.querySelector("#ap-history-btn");
    if (histBtn) histBtn.addEventListener("click", () => AP.settings.showHistory());
    container.querySelector("#ap-hide-btn").addEventListener("click", hidePanel);
    container.querySelector("#ap-home-btn").addEventListener("click", () => {
      if (AP._resetPanelPosition) AP._resetPanelPosition();
    });

    const collapseBtn = container.querySelector("#ap-collapse-btn");
    const body = container.querySelector("#ap-body");
    const settings = AP.storage.getSettings();
    if (settings.collapsed) {
      body.classList.add("ap-collapsed");
      collapseBtn.classList.add("ap-rotated");
      // у згорнутому стані — авто-висота (тільки шапка), без фіксованої висоти панелі
      container.style.height = "";
      container.style.maxHeight = "";
    }
    collapseBtn.addEventListener("click", () => {
      const collapsed = body.classList.toggle("ap-collapsed");
      collapseBtn.classList.toggle("ap-rotated", collapsed);
      AP.storage.patchSettings({ collapsed });
      if (collapsed) {
        // згортаємо — прибираємо фіксовану висоту, щоб не лишався порожній фон
        container.style.height = "";
        container.style.maxHeight = "";
      } else {
        // розгортаємо — повертаємо збережену висоту
        applyPanelHeight(AP.storage.getSettings().panelHeight);
      }
    });

    container.querySelectorAll(".ap-tab").forEach((t) => {
      t.addEventListener("click", () => {
        setActiveTab(t.dataset.tab);
        if (t.dataset.tab === "calc") {
          const d = document.getElementById("ap-calc-display");
          if (d) d.focus();
        }
      });
    });

    container.querySelector("#ap-open-desktop").addEventListener("click", () => AP.operatordesk.openClientDesktop());
    container.querySelector("#ap-cid-edit").addEventListener("click", () => AP.operatordesk.editClientCid());
    container.querySelector("#ap-cid-clear").addEventListener("click", () => AP.operatordesk.clearClientCid());
    const harvBtn = container.querySelector("#ap-harvester");
    if (harvBtn) harvBtn.addEventListener("click", () => {
      const ok = AP.operatordesk.triggerHarvester && AP.operatordesk.triggerHarvester();
      if (!ok) AP.settings && AP.settings.toast ? AP.settings.toast("HARVESTER не знайдено") : console.warn("HARVESTER button not found");
    });
  }

  function clampHeight(h) {
    const c = document.getElementById(CONTAINER_ID);
    const top = c ? c.getBoundingClientRect().top : 78;
    const max = Math.max(260, window.innerHeight - top - 16);
    return Math.min(Math.max(h, 260), max);
  }

  function applyPanelHeight(h) {
    const c = document.getElementById(CONTAINER_ID);
    if (!c) return;
    // у згорнутому стані висота авто (тільки шапка)
    const b = c.querySelector("#ap-body");
    if (b && b.classList.contains("ap-collapsed")) {
      c.style.height = "";
      c.style.maxHeight = "";
      return;
    }
    // Зміна висоти діє лише на чек-листі; інші вкладки — фіксовані (авто-висота)
    const checklistActive = !!c.querySelector('.ap-pane-active[data-pane="checklist"]');
    if (!checklistActive) {
      c.style.height = "";
      c.style.maxHeight = "";
      return;
    }
    if (h && h > 0) {
      c.style.height = clampHeight(h) + "px";
      c.style.maxHeight = "none";
    } else {
      c.style.height = "";
      c.style.maxHeight = "";
    }
  }

  function initResize(container) {
    const handle = container.querySelector("#ap-resize-handle");
    if (!handle) return;

    const saved = AP.storage.getSettings().panelHeight;
    if (saved) applyPanelHeight(saved);

    let startY = 0, startH = 0, dragging = false;

    const onMove = (e) => {
      if (!dragging) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const h = clampHeight(startH + (y - startY));
      container.style.height = h + "px";
      container.style.maxHeight = "none";
      e.preventDefault();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
      document.body.style.userSelect = "";
      const h = Math.round(container.getBoundingClientRect().height);
      AP.storage.patchSettings({ panelHeight: h });
    };
    const onDown = (e) => {
      dragging = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startH = container.getBoundingClientRect().height;
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
      e.preventDefault();
    };
    handle.addEventListener("mousedown", onDown);
    handle.addEventListener("touchstart", onDown, { passive: false });

    // Подвійний клік по ручці — скинути висоту до авто
    handle.addEventListener("dblclick", () => {
      applyPanelHeight(null);
      AP.storage.patchSettings({ panelHeight: null });
    });
  }

  function loadForChat() {
    AP.checklist.load();
    AP.notes.load();
    AP.operatordesk.autoDetectCid();
    if (AP.checklist.maybeAutoEvent) AP.checklist.maybeAutoEvent();
    if (AP.checklist.maybeOfferPull) AP.checklist.maybeOfferPull();
  }

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function maybeAutoClear() {
    const s = AP.storage.getSettings();
    if (!s.autoClearDaily) return;
    const today = todayKey();
    if (s.lastAutoClear === today) return;
    AP.storage.clearAllChatData();
    AP.storage.patchSettings({ lastAutoClear: today });
  }

  function init() {
    if (window.location.hostname !== "chat.sender.ftband.net") return;

    const container = buildPanel();
    if (!container) return;

    maybeAutoClear();
    AP.theme.init();
    wireHeader(container);

    AP.checklist.render();
    AP.checklist.bindControls();
    AP.calculator.init();

    AP.draggable.initDraggable(container, container.querySelector("#ap-drag-handle"));
    initResize(container);

    const settings = AP.storage.getSettings();
    setActiveTab(settings.activeTab || "checklist");
    if (settings.hidden) hidePanel();

    previousChatId = AP.getActiveChatId();
    loadForChat();

    observeChatChanges();
  }

  function observeChatChanges() {
    const observer = new MutationObserver(() => {
      if (!document.getElementById(CONTAINER_ID) && document.querySelector(CHAT_BOX_SELECTOR)) {
        init();
        return;
      }
      const currentChatId = AP.getActiveChatId();
      if (currentChatId !== previousChatId) {
        // Автоархів: перед переходом зберігаємо попередній кейс в історію
        if (previousChatId && AP.storage.getSettings().mode === "chat") {
          AP.checklist.archiveChat(previousChatId);
        }
        previousChatId = currentChatId;
        loadForChat();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  function boot() {
    if (document.querySelector(CHAT_BOX_SELECTOR)) {
      init();
      return;
    }
    const obs = new MutationObserver(() => {
      if (document.querySelector(CHAT_BOX_SELECTOR)) {
        obs.disconnect();
        init();
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => obs.disconnect(), 20000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
