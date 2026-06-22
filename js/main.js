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
          <span>Alliance&nbsp;Pro</span>
        </div>
        <div class="ap-header-actions">
          <button class="ap-icon-btn ap-theme-btn" title="Темна тема">🌙</button>
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
            <div id="ap-profile-bar" class="ap-profile-bar" style="display:none"></div>

            <div id="ap-checkboxes" class="ap-checkboxes"></div>

            <div class="ap-field">
              <label class="ap-field-label" for="ap-comment">Комент</label>
              <textarea id="ap-comment" class="ap-textarea" rows="2" placeholder="Додатковий коментар…"></textarea>
            </div>

            <div class="ap-field">
              <label class="ap-field-label">Текст для копіювання</label>
              <pre id="ap-preview" class="ap-preview"></pre>
            </div>

            <div class="ap-actions">
              <button id="ap-copy-btn" class="ap-btn ap-btn-primary">Скопіювати</button>
              <button id="ap-reset-btn" class="ap-btn ap-btn-ghost">Скинути</button>
              <span id="ap-copy-status" class="ap-status"></span>
            </div>

            <div class="ap-cid-bar">
              <span class="ap-cid-label">ID:</span>
              <span id="ap-cid-value" class="ap-cid-value">Не знайдено</span>
              <button id="ap-cid-edit" class="ap-icon-btn ap-cid-icon" title="Редагувати ID">✎</button>
              <button id="ap-cid-clear" class="ap-icon-btn ap-cid-icon" title="Очистити ID">⌫</button>
              <button id="ap-open-desktop" class="ap-btn ap-btn-accent">Відкрити РС</button>
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
            <textarea id="ap-notes-textarea" class="ap-textarea ap-notes-area" placeholder="Нотатка для цього чату…"></textarea>
          </section>
        </div>
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
      restore.title = "Alliance Pro";
      restore.textContent = "AP";
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
  }

  function wireHeader(container) {
    container.querySelector(".ap-theme-btn").addEventListener("click", () => AP.theme.toggle());

    const compactBtn = container.querySelector("#ap-compact-btn");
    function applyCompact(on) {
      container.classList.toggle("ap-compact", on);
      compactBtn.textContent = on ? "⊞" : "⊟";
      compactBtn.title = on ? "Звичайний розмір" : "Компактний режим";
    }
    applyCompact(!!AP.storage.getSettings().compact);
    compactBtn.addEventListener("click", () => {
      const on = !container.classList.contains("ap-compact");
      applyCompact(on);
      AP.storage.patchSettings({ compact: on });
    });

    container.querySelector("#ap-settings-btn").addEventListener("click", () => AP.settings.showSettings());
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
    }
    collapseBtn.addEventListener("click", () => {
      const collapsed = body.classList.toggle("ap-collapsed");
      collapseBtn.classList.toggle("ap-rotated", collapsed);
      AP.storage.patchSettings({ collapsed });
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
  }

  function loadForChat() {
    AP.checklist.load();
    AP.notes.load();
    AP.operatordesk.updateClientIdDisplay(AP.getActiveChatId());
  }

  function init() {
    if (window.location.hostname !== "chat.sender.ftband.net") return;

    const container = buildPanel();
    if (!container) return;

    AP.theme.init();
    wireHeader(container);

    AP.checklist.render();
    AP.checklist.bindControls();
    AP.calculator.init();

    AP.draggable.initDraggable(container, container.querySelector("#ap-drag-handle"));

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
