(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});

  function removeModal() {
    document.querySelectorAll(".ap-modal-bg").forEach((m) => m.remove());
  }

  function makeModal(innerEl, onClose, opts) {
    opts = opts || {};
    if (!opts.stack) removeModal();
    const bg = document.createElement("div");
    bg.className = "ap-modal-bg";
    const win = document.createElement("div");
    win.className = "ap-modal";
    win.appendChild(innerEl);
    bg.appendChild(win);
    document.body.appendChild(bg);

    function close() {
      document.removeEventListener("keydown", onKey, true);
      bg.remove();
      if (onClose) onClose();
    }
    function onKey(e) {
      if (e.key !== "Escape") return;
      const all = document.querySelectorAll(".ap-modal-bg");
      if (all[all.length - 1] === bg) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return { bg, win, close };
  }

  function header(title) {
    const h = document.createElement("div");
    h.className = "ap-modal-header";
    const t = document.createElement("h2");
    t.textContent = title;
    const x = document.createElement("button");
    x.className = "ap-modal-close";
    x.innerHTML = "&times;";
    h.appendChild(t);
    h.appendChild(x);
    return { h, x };
  }

  function uiAlert({ title = "", text = "", onClose }) {
    const wrap = document.createElement("div");
    const { h, x } = header(title);
    const body = document.createElement("div");
    body.className = "ap-modal-body";
    body.textContent = text;
    const actions = document.createElement("div");
    actions.className = "ap-modal-actions";
    const ok = document.createElement("button");
    ok.className = "ap-btn ap-btn-primary";
    ok.textContent = "OK";
    actions.appendChild(ok);
    wrap.appendChild(h);
    wrap.appendChild(body);
    wrap.appendChild(actions);
    const m = makeModal(wrap, onClose, { stack: true });
    ok.addEventListener("click", m.close);
    x.addEventListener("click", m.close);
  }

  function uiConfirm({ title = "", text = "", onConfirm, onCancel }) {
    const wrap = document.createElement("div");
    const { h, x } = header(title);
    const body = document.createElement("div");
    body.className = "ap-modal-body";
    body.textContent = text;
    const actions = document.createElement("div");
    actions.className = "ap-modal-actions";
    const yes = document.createElement("button");
    yes.className = "ap-btn ap-btn-primary";
    yes.textContent = "Так";
    const no = document.createElement("button");
    no.className = "ap-btn ap-btn-ghost";
    no.textContent = "Ні";
    actions.appendChild(no);
    actions.appendChild(yes);
    wrap.appendChild(h);
    wrap.appendChild(body);
    wrap.appendChild(actions);
    const m = makeModal(wrap, null, { stack: true });
    yes.addEventListener("click", () => { m.close(); onConfirm && onConfirm(); });
    no.addEventListener("click", () => { m.close(); onCancel && onCancel(); });
    x.addEventListener("click", () => { m.close(); onCancel && onCancel(); });
  }

  function uiPrompt({ title = "", text = "", value = "", placeholder = "", onConfirm, onCancel }) {
    const wrap = document.createElement("div");
    const { h, x } = header(title);
    const body = document.createElement("div");
    body.className = "ap-modal-body";
    const label = document.createElement("p");
    label.textContent = text;
    label.style.marginTop = "0";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "ap-input";
    input.value = value || "";
    input.placeholder = placeholder || "";
    body.appendChild(label);
    body.appendChild(input);
    const actions = document.createElement("div");
    actions.className = "ap-modal-actions";
    const ok = document.createElement("button");
    ok.className = "ap-btn ap-btn-primary";
    ok.textContent = "OK";
    const cancel = document.createElement("button");
    cancel.className = "ap-btn ap-btn-ghost";
    cancel.textContent = "Скасувати";
    actions.appendChild(cancel);
    actions.appendChild(ok);
    wrap.appendChild(h);
    wrap.appendChild(body);
    wrap.appendChild(actions);
    const m = makeModal(wrap, null, { stack: true });
    const confirm = () => { const v = input.value; m.close(); onConfirm && onConfirm(v); };
    ok.addEventListener("click", confirm);
    cancel.addEventListener("click", () => { m.close(); onCancel && onCancel(); });
    x.addEventListener("click", () => { m.close(); onCancel && onCancel(); });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") confirm(); });
    setTimeout(() => { input.focus(); input.select(); }, 60);
  }

  AP.ui = { alert: uiAlert, confirm: uiConfirm, prompt: uiPrompt, removeModal };

  function makeToggle(checked, onChange) {
    const lab = document.createElement("label");
    lab.className = "ap-switch";
    const inp = document.createElement("input");
    inp.type = "checkbox";
    inp.checked = !!checked;
    const sl = document.createElement("span");
    sl.className = "ap-switch-slider";
    lab.appendChild(inp);
    lab.appendChild(sl);
    inp.addEventListener("change", () => onChange(inp.checked));
    return lab;
  }

  function textBlock(title, sub) {
    const t = document.createElement("div");
    t.className = "ap-setting-text";
    const h3 = document.createElement("div");
    h3.className = "ap-setting-title";
    h3.textContent = title;
    const p = document.createElement("div");
    p.className = "ap-setting-sub";
    p.textContent = sub;
    t.appendChild(h3);
    t.appendChild(p);
    return t;
  }

  function rowToggle(title, sub, checked, onChange) {
    const row = document.createElement("div");
    row.className = "ap-setting-row";
    row.appendChild(textBlock(title, sub));
    row.appendChild(makeToggle(checked, onChange));
    return row;
  }

  function rowButton(title, sub, btnText, onClick, variant) {
    const row = document.createElement("div");
    row.className = "ap-setting-row";
    row.appendChild(textBlock(title, sub));
    const btn = document.createElement("button");
    btn.className = "ap-btn " + (variant === "danger" ? "ap-btn-danger" : "ap-btn-ghost");
    btn.textContent = btnText;
    btn.addEventListener("click", onClick);
    row.appendChild(btn);
    return row;
  }

  function getComputedAccent() {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--ap-accent").trim();
      return v || null;
    } catch (e) { return null; }
  }

  function accentRow() {
    const row = document.createElement("div");
    row.className = "ap-setting-row ap-setting-row-col";
    row.appendChild(textBlock("Колір акценту", "Палітра або власний колір"));

    const tools = document.createElement("div");
    tools.className = "ap-accent-tools";
    const current = AP.storage.getSettings().accent;

    const swatches = document.createElement("div");
    swatches.className = "ap-swatches";
    function mark(color) {
      swatches.querySelectorAll(".ap-swatch").forEach((s) => {
        s.classList.toggle("ap-swatch-active", s.dataset.color && color && s.dataset.color.toLowerCase() === color.toLowerCase());
      });
    }
    AP.theme.PRESETS.forEach((c) => {
      const sw = document.createElement("button");
      sw.className = "ap-swatch";
      sw.dataset.color = c;
      sw.style.background = c;
      sw.title = c;
      sw.addEventListener("click", () => { AP.theme.setAccent(c); picker.value = c; mark(c); });
      swatches.appendChild(sw);
    });
    tools.appendChild(swatches);

    const picker = document.createElement("input");
    picker.type = "color";
    picker.className = "ap-color-input";
    picker.value = current || getComputedAccent() || "#5b6cff";
    picker.addEventListener("input", () => { AP.theme.setAccent(picker.value); mark(picker.value); });
    tools.appendChild(picker);

    const resetBtn = document.createElement("button");
    resetBtn.className = "ap-btn ap-btn-ghost ap-accent-reset";
    resetBtn.textContent = "Скинути";
    resetBtn.title = "Колір за замовчуванням теми";
    resetBtn.addEventListener("click", () => { AP.theme.setAccent(null); mark(null); });
    tools.appendChild(resetBtn);

    row.appendChild(tools);
    mark(current);
    return row;
  }

  function modeRow() {
    const row = document.createElement("div");
    row.className = "ap-setting-row";
    row.appendChild(textBlock(
      "Режим роботи",
      "Чат → лише chat.sender; Телефонія → лише сайти дзвінків; Чат+Телефонія → скрізь"
    ));
    const sel = document.createElement("select");
    sel.className = "ap-select";
    [["chat", "💬 Чат"], ["phone", "📞 Телефонія"], ["both", "💬📞 Чат+Телефонія"]].forEach(([v, t]) => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = t;
      if (v === AP.getMode()) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => {
      AP.storage.setGlobalMode(sel.value, () => {});
      if (AP.applyModePresence) AP.applyModePresence();
      if (AP.checklist) AP.checklist.applyConfig();
    });
    row.appendChild(sel);
    return row;
  }

  function soundRow() {
    const row = document.createElement("div");
    row.className = "ap-setting-row";
    row.appendChild(textBlock("Звук таймера", "Сигнал завершення та нагадування"));
    const wrap = document.createElement("div");
    wrap.className = "ap-sound-row";
    const sel = document.createElement("select");
    sel.className = "ap-select";
    const cur = AP.storage.getSettings().timerSound || "classic";
    const sounds = (AP.calculator && AP.calculator.SOUNDS) || {};
    Object.keys(sounds).forEach((id) => {
      const o = document.createElement("option");
      o.value = id;
      o.textContent = sounds[id].label;
      if (id === cur) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => AP.storage.patchSettings({ timerSound: sel.value }));
    const prev = document.createElement("button");
    prev.className = "ap-btn ap-btn-ghost ap-sound-prev";
    prev.textContent = "▶";
    prev.title = "Прослухати";
    prev.addEventListener("click", () => { if (AP.calculator) AP.calculator.playSound(sel.value); });
    wrap.appendChild(sel);
    wrap.appendChild(prev);
    row.appendChild(wrap);
    return row;
  }

  function allSettingsRow() {
    const row = document.createElement("div");
    row.className = "ap-setting-row";
    row.appendChild(textBlock("Усі налаштування", "Експорт/імпорт теми, акценту та чекбоксів"));
    const group = document.createElement("div");
    group.className = "ap-btn-group";
    const exp = document.createElement("button");
    exp.className = "ap-btn ap-btn-ghost";
    exp.textContent = "Експорт";
    exp.addEventListener("click", exportAllSettings);
    const imp = document.createElement("button");
    imp.className = "ap-btn ap-btn-ghost";
    imp.textContent = "Імпорт";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = ".json,application/json";
    file.style.display = "none";
    imp.addEventListener("click", () => file.click());
    file.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importAllSettings(f);
      file.value = "";
    });
    group.appendChild(exp);
    group.appendChild(imp);
    group.appendChild(file);
    row.appendChild(group);
    return row;
  }

  function downloadJson(obj, name) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function stamp() {
    return new Date().toLocaleString("uk-UA").replace(/[.:,\s]+/g, "-");
  }

  function exportAllSettings() {
    downloadJson(AP.storage.exportAll(), `alliance-pro-settings-${stamp()}.json`);
  }

  function importAllSettings(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      let data;
      try { data = JSON.parse(e.target.result); }
      catch (err) { uiAlert({ title: "Помилка", text: "Це не коректний JSON-файл." }); return; }
      uiConfirm({
        title: "Імпортувати всі налаштування?",
        text: "Поточні тема, акцент і чекбокси будуть замінені.",
        onConfirm: () => {
          AP.storage.importAll(data);
          AP.theme.init();
          if (AP.checklist) AP.checklist.applyConfig();
          if (AP.notes) AP.notes.load();
          removeModal();
          showSettings();
          uiAlert({ title: "Готово", text: "Налаштування імпортовано." });
        }
      });
    };
    reader.onerror = () => uiAlert({ title: "Помилка", text: "Не вдалося відкрити файл." });
    reader.readAsText(file);
  }

  function sizeRow() {
    const row = document.createElement("div");
    row.className = "ap-setting-row ap-setting-row-col";
    const head = document.createElement("div");
    head.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;";
    const tb = textBlock("Розмір панелі", "Менше ← повзунок → більше");
    const val = document.createElement("span");
    val.className = "ap-size-val";
    head.appendChild(tb);
    head.appendChild(val);
    const slider = document.createElement("input");
    slider.type = "range";
    slider.className = "ap-range";
    slider.min = "70";
    slider.max = "160";
    slider.step = "5";
    slider.value = String(Math.round((AP.storage.getSettings().uiScale || 1) * 100));
    val.textContent = slider.value + "%";
    slider.addEventListener("input", () => {
      val.textContent = slider.value + "%";
      AP.theme.setScale(parseInt(slider.value, 10) / 100);
    });
    row.appendChild(head);
    row.appendChild(slider);
    return row;
  }

  function showSettings() {
    const wrap = document.createElement("div");
    const { h, x } = header("Налаштування");
    wrap.appendChild(h);

    const body = document.createElement("div");
    body.className = "ap-modal-body";

    body.appendChild(modeRow());
    body.appendChild(rowToggle(
      "Темна тема",
      "Світла/темна для панелі та вікон",
      AP.theme.current() === "dark",
      (on) => AP.theme.set(on ? "dark" : "light")
    ));
    body.appendChild(accentRow());
    body.appendChild(sizeRow());
    body.appendChild(soundRow());
    body.appendChild(rowToggle(
      "Скинути після копіювання",
      "Очищати чек-лист одразу після «Скопіювати»",
      AP.storage.getSettings().resetAfterCopy,
      (on) => AP.storage.patchSettings({ resetAfterCopy: on })
    ));
    body.appendChild(rowToggle(
      "Автоочищення раз на добу",
      "Раз на день автоматично очищає дані всіх чатів",
      AP.storage.getSettings().autoClearDaily,
      (on) => AP.storage.patchSettings({ autoClearDaily: on })
    ));
    body.appendChild(rowToggle(
      "Генерація токенів",
      "Додавати прихований код синхронізації у скопійований текст",
      AP.storage.getSettings().tokensEnabled,
      (on) => AP.storage.patchSettings({ tokensEnabled: on })
    ));
    body.appendChild(rowButton(
      "Корисні посилання",
      "Посилання у вкладці «Нотатки» (назва + URL)",
      "Відкрити",
      () => { removeModal(); showLinksConfig(); }
    ));
    body.appendChild(rowButton(
      "Калькулятор на інших сайтах",
      "Сайти, де показувати міні-панель (калькулятор + таймер)",
      "Відкрити",
      () => { removeModal(); showSitesConfig(); }
    ));
    body.appendChild(allSettingsRow());
    body.appendChild(rowButton(
      "Очистити всі дані чатів",
      "Видалити чек-листи, коментарі та нотатки всіх чатів",
      "Очистити",
      () => {
        uiConfirm({
          title: "Очистити всі дані?",
          text: "Будуть видалені дані всіх чатів. Дію не можна скасувати.",
          onConfirm: () => {
            AP.storage.clearAllChatData();
            if (AP.checklist) AP.checklist.load();
            if (AP.notes) AP.notes.load();
            if (AP.operatordesk) AP.operatordesk.updateClientIdDisplay(AP.getActiveChatId());
            uiAlert({ title: "Готово", text: "Усі дані чатів видалено." });
          }
        });
      },
      "danger"
    ));

    wrap.appendChild(body);

    const footer = document.createElement("div");
    footer.className = "ap-modal-footer";
    footer.textContent = "Soft Pro v4.8.8 by @Nilfa";
    wrap.appendChild(footer);

    const m = makeModal(wrap);
    x.addEventListener("click", m.close);
    AP.theme.apply(AP.theme.current());
  }

  let workingLinks = [];
  const MAX_LINKS = 20;

  function showLinksConfig() {
    workingLinks = (AP.storage.getSettings().usefulLinks || []).map((l) => ({
      name: (l && l.name) || "",
      url: (l && l.url) || ""
    }));

    const wrap = document.createElement("div");
    const { h, x } = header("Корисні посилання");
    wrap.appendChild(h);

    const body = document.createElement("div");
    body.className = "ap-modal-body";

    const hint = document.createElement("p");
    hint.className = "ap-setting-sub";
    hint.style.marginTop = "0";
    hint.textContent = "Назва показується у вкладці «Нотатки» як кнопка, що відкриває посилання.";
    body.appendChild(hint);

    const list = document.createElement("div");
    list.id = "ap-links-list";
    body.appendChild(list);

    const addBtn = document.createElement("button");
    addBtn.className = "ap-btn ap-btn-ghost ap-links-add";
    addBtn.textContent = "+ Додати посилання";
    addBtn.addEventListener("click", () => {
      if (workingLinks.length >= MAX_LINKS) return;
      workingLinks.push({ name: "", url: "" });
      renderLinksList();
    });
    body.appendChild(addBtn);
    wrap.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "ap-modal-actions ap-modal-actions-split";
    const back = document.createElement("button");
    back.className = "ap-btn ap-btn-ghost";
    back.textContent = "Назад";
    const saveBtn = document.createElement("button");
    saveBtn.className = "ap-btn ap-btn-primary";
    saveBtn.textContent = "Зберегти";
    actions.appendChild(back);
    actions.appendChild(saveBtn);
    wrap.appendChild(actions);

    const m = makeModal(wrap);
    x.addEventListener("click", () => { m.close(); showSettings(); });
    back.addEventListener("click", () => { m.close(); showSettings(); });
    saveBtn.addEventListener("click", () => {
      const cleaned = workingLinks
        .map((l) => ({ name: (l.name || "").trim(), url: (l.url || "").trim() }))
        .filter((l) => l.url);
      AP.storage.patchSettings({ usefulLinks: cleaned });
      if (AP.notes) AP.notes.renderLinks();
      m.close();
      uiAlert({ title: "Збережено", text: "Корисні посилання збережено." });
    });

    renderLinksList();
    AP.theme.apply(AP.theme.current());
  }

  function renderLinksList() {
    const list = document.getElementById("ap-links-list");
    if (!list) return;
    list.innerHTML = "";
    workingLinks.forEach((link, index) => {
      const row = document.createElement("div");
      row.className = "ap-links-row";
      const name = document.createElement("input");
      name.type = "text";
      name.className = "ap-input ap-links-name";
      name.maxLength = 40;
      name.placeholder = "Назва";
      name.value = link.name || "";
      name.addEventListener("input", () => (workingLinks[index].name = name.value));
      const url = document.createElement("input");
      url.type = "text";
      url.className = "ap-input ap-links-url";
      url.placeholder = "https://…";
      url.value = link.url || "";
      url.addEventListener("input", () => (workingLinks[index].url = url.value));
      const del = iconBtn("×", "Видалити", () => { workingLinks.splice(index, 1); renderLinksList(); });
      del.classList.add("ap-cfg-del");
      row.appendChild(name);
      row.appendChild(url);
      row.appendChild(del);
      list.appendChild(row);
    });
    const addBtn = document.querySelector(".ap-links-add");
    if (addBtn) addBtn.disabled = workingLinks.length >= MAX_LINKS;
  }

  let workingSites = [];

  function showSitesConfig() {
    const wrap = document.createElement("div");
    const { h, x } = header("Калькулятор на інших сайтах");
    wrap.appendChild(h);

    const body = document.createElement("div");
    body.className = "ap-modal-body";

    const hint = document.createElement("p");
    hint.className = "ap-setting-sub";
    hint.style.marginTop = "0";
    hint.textContent = "Вкажіть домени (напр. example.com), де показувати міні-панель із калькулятором і таймером. Після зміни оновіть відповідну вкладку.";
    body.appendChild(hint);

    const list = document.createElement("div");
    list.id = "ap-sites-list";
    body.appendChild(list);

    const addBtn = document.createElement("button");
    addBtn.className = "ap-btn ap-btn-ghost ap-links-add";
    addBtn.textContent = "+ Додати сайт";
    addBtn.addEventListener("click", () => { workingSites.push(""); renderSitesList(); });
    body.appendChild(addBtn);
    wrap.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "ap-modal-actions ap-modal-actions-split";
    const back = document.createElement("button");
    back.className = "ap-btn ap-btn-ghost";
    back.textContent = "Назад";
    const saveBtn = document.createElement("button");
    saveBtn.className = "ap-btn ap-btn-primary";
    saveBtn.textContent = "Зберегти";
    actions.appendChild(back);
    actions.appendChild(saveBtn);
    wrap.appendChild(actions);

    const m = makeModal(wrap);
    x.addEventListener("click", () => { m.close(); showSettings(); });
    back.addEventListener("click", () => { m.close(); showSettings(); });
    saveBtn.addEventListener("click", () => {
      const cleaned = workingSites
        .map((s) => (s || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
        .filter(Boolean);
      AP.storage.setAllowedSites(cleaned, () => {
        m.close();
        uiAlert({ title: "Збережено", text: "Список сайтів збережено. Оновіть потрібні вкладки, щоб зʼявилася панель." });
      });
    });

    workingSites = [];
    renderSitesList();
    AP.theme.apply(AP.theme.current());
    AP.storage.getAllowedSites((listVal) => {
      workingSites = (listVal || []).slice();
      renderSitesList();
    });
  }

  function renderSitesList() {
    const list = document.getElementById("ap-sites-list");
    if (!list) return;
    list.innerHTML = "";
    if (!workingSites.length) {
      const empty = document.createElement("p");
      empty.className = "ap-setting-sub";
      empty.textContent = "Поки що порожньо. Додайте домен нижче.";
      list.appendChild(empty);
    }
    workingSites.forEach((site, index) => {
      const row = document.createElement("div");
      row.className = "ap-links-row";
      const inp = document.createElement("input");
      inp.type = "text";
      inp.className = "ap-input";
      inp.placeholder = "example.com";
      inp.value = site || "";
      inp.addEventListener("input", () => (workingSites[index] = inp.value));
      const del = iconBtn("×", "Видалити", () => { workingSites.splice(index, 1); renderSitesList(); });
      del.classList.add("ap-cfg-del");
      row.appendChild(inp);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  let workingConfig = [];
  const MAX_ITEMS = 14;
  const MAX_OPTIONS = 8;

  function toLabel(o) {
    return typeof o === "string" ? o : String(o && o.label != null ? o.label : "");
  }

  function showCheckboxConfig() {
    workingConfig = AP.storage.getCheckboxConfig().map((c) => ({
      id: c.id,
      label: c.label,
      variative: !!c.variative,
      options: (Array.isArray(c.options) ? c.options : []).map(toLabel)
    }));

    const wrap = document.createElement("div");
    const { h, x } = header("Налаштування чекбоксів");
    wrap.appendChild(h);

    const body = document.createElement("div");
    body.className = "ap-modal-body";

    const cleanConfig = () => workingConfig
      .filter((c) => (c.label || "").trim())
      .map((c) => {
        const options = c.variative ? (c.options || []).map((o) => (o || "").trim()).filter(Boolean) : [];
        return { id: c.id, label: c.label.trim(), variative: c.variative && options.length > 0, options };
      });

    const loadWorkingFromActive = () => {
      workingConfig = AP.storage.getCheckboxConfig().map((c) => ({
        id: c.id,
        label: c.label,
        variative: !!c.variative,
        options: (Array.isArray(c.options) ? c.options : []).map(toLabel)
      }));
    };

    const profileBar = document.createElement("div");
    profileBar.className = "ap-cfg-profile";
    function renderProfileBar() {
      profileBar.innerHTML = "";
      const data = AP.storage.getProfiles();
      const lbl = document.createElement("span");
      lbl.className = "ap-field-label";
      lbl.style.flexBasis = "100%";
      lbl.textContent = "Профіль чек-листа";
      const sel = document.createElement("select");
      sel.className = "ap-select";
      data.list.forEach((p) => {
        const o = document.createElement("option");
        o.value = p.id;
        o.textContent = p.name;
        if (p.id === data.activeId) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", () => {
        AP.storage.setCheckboxConfig(cleanConfig());
        AP.storage.setActiveProfile(sel.value);
        loadWorkingFromActive();
        renderCfgList();
        renderProfileBar();
        if (AP.checklist) AP.checklist.applyConfig();
      });
      const btns = document.createElement("div");
      btns.className = "ap-cfg-profile-btns";
      const addB = iconBtn("+", "Новий профіль", () => {
        uiPrompt({
          title: "Новий профіль",
          text: "Назва профілю:",
          placeholder: "напр. Скарги",
          onConfirm: (name) => {
            name = (name || "").trim();
            if (!name) return;
            AP.storage.setCheckboxConfig(cleanConfig());
            AP.storage.addProfile(name);
            loadWorkingFromActive();
            renderCfgList();
            renderProfileBar();
            if (AP.checklist) AP.checklist.applyConfig();
          }
        });
      });
      const renB = iconBtn("✎", "Перейменувати профіль", () => {
        const cur = AP.storage.getProfiles();
        const active = cur.list.find((p) => p.id === cur.activeId);
        uiPrompt({
          title: "Перейменувати профіль",
          text: "Нова назва:",
          value: active ? active.name : "",
          onConfirm: (name) => {
            name = (name || "").trim();
            if (!name) return;
            AP.storage.renameProfile(cur.activeId, name);
            renderProfileBar();
          }
        });
      });
      const delB = iconBtn("×", "Видалити профіль", () => {
        const cur = AP.storage.getProfiles();
        if (cur.list.length <= 1) {
          uiAlert({ title: "Не можна", text: "Має лишитися хоча б один профіль." });
          return;
        }
        uiConfirm({
          title: "Видалити профіль?",
          text: "Профіль і його набір чекбоксів буде видалено.",
          onConfirm: () => {
            AP.storage.deleteProfile(cur.activeId);
            loadWorkingFromActive();
            renderCfgList();
            renderProfileBar();
            if (AP.checklist) AP.checklist.applyConfig();
          }
        });
      });
      delB.classList.add("ap-cfg-del");
      btns.appendChild(addB);
      btns.appendChild(renB);
      btns.appendChild(delB);
      profileBar.appendChild(lbl);
      profileBar.appendChild(sel);
      profileBar.appendChild(btns);
    }
    renderProfileBar();
    body.appendChild(profileBar);

    const io = document.createElement("div");
    io.className = "ap-cfg-io";
    const exportBtn = document.createElement("button");
    exportBtn.className = "ap-btn ap-btn-ghost";
    exportBtn.textContent = "⬇ Експорт";
    exportBtn.title = "Зберегти конфігурацію у файл .json";
    const importBtn = document.createElement("button");
    importBtn.className = "ap-btn ap-btn-ghost";
    importBtn.textContent = "⬆ Імпорт з файлу";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.style.display = "none";
    exportBtn.addEventListener("click", exportConfig);
    importBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importFromFile(file);
      fileInput.value = "";
    });
    io.appendChild(exportBtn);
    io.appendChild(importBtn);
    io.appendChild(fileInput);
    body.appendChild(io);

    const paste = document.createElement("details");
    paste.className = "ap-cfg-paste";
    const summary = document.createElement("summary");
    summary.textContent = "Імпорт через вставку JSON-тексту";
    paste.appendChild(summary);
    const ta = document.createElement("textarea");
    ta.className = "ap-textarea";
    ta.rows = 4;
    ta.placeholder = "Вставте сюди JSON конфігурацію…";
    paste.appendChild(ta);
    const pasteBtn = document.createElement("button");
    pasteBtn.className = "ap-btn ap-btn-ghost";
    pasteBtn.textContent = "Імпортувати з тексту";
    pasteBtn.addEventListener("click", () => {
      const txt = ta.value.trim();
      if (!txt) { uiAlert({ title: "Порожньо", text: "Вставте JSON для імпорту." }); return; }
      let data;
      try { data = JSON.parse(txt); }
      catch (e) { uiAlert({ title: "Помилка", text: "Некоректний JSON. Перевірте формат." }); return; }
      applyImported(data);
    });
    paste.appendChild(pasteBtn);
    body.appendChild(paste);

    const list = document.createElement("div");
    list.className = "ap-cfg-list";
    list.id = "ap-cfg-list";
    body.appendChild(list);

    const addBtn = document.createElement("button");
    addBtn.className = "ap-btn ap-btn-ghost ap-cfg-add";
    addBtn.textContent = "+ Додати чекбокс";
    addBtn.addEventListener("click", () => {
      if (workingConfig.length >= MAX_ITEMS) return;
      workingConfig.push({ id: "ap-cb-" + Date.now(), label: "Новий чекбокс", variative: false, options: [] });
      renderCfgList();
    });
    body.appendChild(addBtn);

    wrap.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "ap-modal-actions ap-modal-actions-split";
    const resetDef = document.createElement("button");
    resetDef.className = "ap-btn ap-btn-ghost";
    resetDef.textContent = "За замовчуванням";
    const back = document.createElement("button");
    back.className = "ap-btn ap-btn-ghost";
    back.textContent = "Назад";
    const saveBtn = document.createElement("button");
    saveBtn.className = "ap-btn ap-btn-primary";
    saveBtn.textContent = "Зберегти";
    actions.appendChild(resetDef);
    actions.appendChild(back);
    actions.appendChild(saveBtn);
    wrap.appendChild(actions);

    const m = makeModal(wrap);
    x.addEventListener("click", () => { m.close(); showSettings(); });
    back.addEventListener("click", () => { m.close(); showSettings(); });
    resetDef.addEventListener("click", () => {
      uiConfirm({
        title: "Відновити стандартні?",
        text: "Поточні чекбокси буде замінено стандартним набором.",
        onConfirm: () => {
          workingConfig = AP.storage.getDefaultCheckboxConfig().map((c) => ({
            id: c.id,
            label: c.label,
            variative: !!c.variative,
            options: (c.options || []).map(toLabel)
          }));
          renderCfgList();
        }
      });
    });
    saveBtn.addEventListener("click", () => {
      const cleaned = workingConfig
        .filter((c) => (c.label || "").trim())
        .map((c) => {
          const options = c.variative ? (c.options || []).map((o) => (o || "").trim()).filter(Boolean) : [];
          return {
            id: c.id,
            label: c.label.trim(),
            variative: c.variative && options.length > 0,
            options
          };
        });
      AP.storage.setCheckboxConfig(cleaned);
      if (AP.checklist) AP.checklist.applyConfig();
      m.close();
      uiAlert({ title: "Збережено", text: "Налаштування чекбоксів збережено." });
    });

    renderCfgList();
    AP.theme.apply(AP.theme.current());
  }

  function renderCfgList() {
    const list = document.getElementById("ap-cfg-list");
    if (!list) return;
    list.innerHTML = "";
    workingConfig.forEach((cfg, index) => list.appendChild(cfgItem(cfg, index)));
    const addBtn = document.querySelector(".ap-cfg-add");
    if (addBtn) addBtn.disabled = workingConfig.length >= MAX_ITEMS;
  }

  function iconBtn(symbol, title, onClick) {
    const b = document.createElement("button");
    b.className = "ap-cfg-iconbtn";
    b.textContent = symbol;
    b.title = title;
    b.addEventListener("click", onClick);
    return b;
  }

  function swap(a, b) {
    [workingConfig[a], workingConfig[b]] = [workingConfig[b], workingConfig[a]];
  }

  function spanText(t) {
    const s = document.createElement("span");
    s.textContent = t;
    return s;
  }

  function cfgItem(cfg, index) {
    const item = document.createElement("div");
    item.className = "ap-cfg-item";

    const main = document.createElement("div");
    main.className = "ap-cfg-main";

    const name = document.createElement("input");
    name.type = "text";
    name.className = "ap-input ap-cfg-name";
    name.maxLength = 40;
    name.value = cfg.label;
    name.placeholder = "Назва чекбокса";
    name.addEventListener("input", () => (workingConfig[index].label = name.value));

    const controls = document.createElement("div");
    controls.className = "ap-cfg-controls";
    const up = iconBtn("↑", "Вгору", () => {
      if (index > 0) { swap(index, index - 1); renderCfgList(); }
    });
    const down = iconBtn("↓", "Вниз", () => {
      if (index < workingConfig.length - 1) { swap(index, index + 1); renderCfgList(); }
    });
    const del = iconBtn("×", "Видалити", () => { workingConfig.splice(index, 1); renderCfgList(); });
    del.classList.add("ap-cfg-del");
    if (index === 0) up.disabled = true;
    if (index === workingConfig.length - 1) down.disabled = true;
    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(del);

    main.appendChild(name);
    main.appendChild(controls);
    item.appendChild(main);

    const toggles = document.createElement("div");
    toggles.className = "ap-cfg-toggles";
    const varWrap = document.createElement("label");
    varWrap.className = "ap-cfg-toggle";
    varWrap.appendChild(spanText("Має варіанти"));
    varWrap.appendChild(makeToggle(cfg.variative, (on) => {
      workingConfig[index].variative = on;
      if (on && (!workingConfig[index].options || workingConfig[index].options.length < 2)) {
        workingConfig[index].options = ["", ""];
      }
      renderCfgList();
    }));
    toggles.appendChild(varWrap);
    item.appendChild(toggles);

    if (cfg.variative) {
      const opts = document.createElement("div");
      opts.className = "ap-cfg-opts";
      (cfg.options || []).forEach((opt, oi) => {
        const orow = document.createElement("div");
        orow.className = "ap-cfg-opt-row";
        const oin = document.createElement("input");
        oin.type = "text";
        oin.className = "ap-input";
        oin.maxLength = 24;
        oin.placeholder = "Варіант " + (oi + 1);
        oin.value = opt || "";
        oin.addEventListener("input", () => { workingConfig[index].options[oi] = oin.value; });
        const orm = iconBtn("×", "Видалити варіант", () => {
          workingConfig[index].options.splice(oi, 1);
          renderCfgList();
        });
        orm.classList.add("ap-cfg-del");
        orow.appendChild(oin);
        orow.appendChild(orm);
        opts.appendChild(orow);
      });
      const addOpt = document.createElement("button");
      addOpt.className = "ap-btn ap-btn-ghost ap-cfg-addopt";
      addOpt.textContent = "+ варіант";
      addOpt.disabled = (cfg.options || []).length >= MAX_OPTIONS;
      addOpt.addEventListener("click", () => {
        if (!workingConfig[index].options) workingConfig[index].options = [];
        if (workingConfig[index].options.length >= MAX_OPTIONS) return;
        workingConfig[index].options.push("");
        renderCfgList();
      });
      opts.appendChild(addOpt);
      item.appendChild(opts);
    }

    return item;
  }

  function exportConfig() {
    downloadJson(
      { app: "Soft Pro", type: "checkboxes", version: "4.8.6", timestamp: new Date().toISOString(), checkboxConfig: workingConfig },
      `alliance-pro-checkboxes-${stamp()}.json`
    );
  }

  function importFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try { applyImported(JSON.parse(e.target.result)); }
      catch (err) { uiAlert({ title: "Помилка", text: "Не вдалося прочитати файл. Перевірте, що це коректний JSON." }); }
    };
    reader.onerror = () => uiAlert({ title: "Помилка", text: "Не вдалося відкрити файл." });
    reader.readAsText(file);
  }

  function applyImported(data) {
    let arr = null;
    if (Array.isArray(data)) arr = data;
    else if (data && Array.isArray(data.checkboxConfig)) arr = data.checkboxConfig;
    if (!arr || !arr.length) { uiAlert({ title: "Помилка", text: "У файлі не знайдено чекбоксів." }); return; }
    const normalized = arr.slice(0, MAX_ITEMS).map((c, i) => AP.storage.normalizeCheckbox(c, i));
    uiConfirm({
      title: "Імпортувати конфігурацію?",
      text: `Поточний список (${workingConfig.length}) буде замінено на ${normalized.length} пункт(ів). Не забудьте натиснути «Зберегти».`,
      onConfirm: () => {
        workingConfig = normalized.map((c) => ({
          id: c.id,
          label: c.label,
          variative: !!c.variative,
          options: (c.options || []).map(toLabel)
        }));
        renderCfgList();
        uiAlert({ title: "Імпортовано", text: "Перевірте список і натисніть «Зберегти», щоб застосувати." });
      }
    });
  }

  function fmtTime(iso) {
    try {
      return new Date(iso).toLocaleString("uk-UA", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
      });
    } catch (e) { return iso; }
  }

  // Ручне вставлення токена (коли в чаті/буфері не знайдено)
  function showTokenInput() {
    const wrap = document.createElement("div");
    const { h, x } = header("Підтягнути з токена");
    wrap.appendChild(h);

    const body = document.createElement("div");
    body.className = "ap-modal-body";
    const info = document.createElement("div");
    info.className = "ap-hist-meta";
    info.textContent = "Токен у чаті не знайдено. Встав сюди скопійований текст (із токеном):";
    const ta = document.createElement("textarea");
    ta.className = "ap-textarea";
    ta.rows = 4;
    ta.placeholder = "Встав текст із токеном…";
    body.appendChild(info);
    body.appendChild(ta);
    wrap.appendChild(body);

    const footer = document.createElement("div");
    footer.className = "ap-modal-footer ap-hist-footer";
    const applyBtn = document.createElement("button");
    applyBtn.className = "ap-btn ap-btn-primary";
    applyBtn.textContent = "Підтягнути";
    applyBtn.addEventListener("click", () => {
      const p = AP.checklist && AP.checklist.decodeToken ? AP.checklist.decodeToken(ta.value) : null;
      if (p && AP.checklist.applyToken) {
        AP.checklist.applyToken(p);
        removeModal();
      } else {
        info.textContent = "Токен не розпізнано. Перевір, що вставлено правильний текст із токеном.";
        info.style.color = "var(--ap-danger)";
      }
    });
    footer.appendChild(applyBtn);
    wrap.appendChild(footer);

    const m = makeModal(wrap);
    x.addEventListener("click", m.close);
    AP.theme.apply(AP.theme.current());
    setTimeout(() => ta.focus(), 50);
  }

  function showHistoryItem(item) {
    const wrap = document.createElement("div");
    const title = "ID: " + (item.label || "—");
    const { h, x } = header(title);
    wrap.appendChild(h);

    const body = document.createElement("div");
    body.className = "ap-modal-body";
    const pre = document.createElement("pre");
    pre.className = "ap-hist-pre";
    pre.textContent = item.text || "(порожньо)";
    body.appendChild(pre);
    wrap.appendChild(body);

    const footer = document.createElement("div");
    footer.className = "ap-modal-footer ap-hist-footer";
    const copyBtn = document.createElement("button");
    copyBtn.className = "ap-btn ap-btn-primary";
    copyBtn.textContent = "Скопіювати";
    copyBtn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(item.text || ""); copyBtn.textContent = "✓ Скопійовано"; setTimeout(() => (copyBtn.textContent = "Скопіювати"), 900); } catch (e) {}
    });
    footer.appendChild(copyBtn);
    wrap.appendChild(footer);

    // stack:true — відкривається поверх вікна історії, не закриваючи його
    const m = makeModal(wrap, null, { stack: true });
    x.addEventListener("click", m.close);
    AP.theme.apply(AP.theme.current());
  }

  function showHistory() {
    const wrap = document.createElement("div");
    const { h, x } = header("Історія (останні 10)");
    wrap.appendChild(h);

    const body = document.createElement("div");
    body.className = "ap-modal-body";

    const list = (AP.storage.getHistory && AP.storage.getHistory()) || [];
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "ap-hist-empty";
      empty.textContent = "Поки що порожньо. Кейс потрапляє сюди після «Скинути».";
      body.appendChild(empty);
    } else {
      list.forEach((item) => {
        const row = document.createElement("div");
        row.className = "ap-hist-item";

        const top = document.createElement("div");
        top.className = "ap-hist-top";
        const idEl = document.createElement("span");
        idEl.className = "ap-hist-id";
        idEl.textContent = "ID: " + (item.label || "—");
        const ev = document.createElement("span");
        ev.className = "ap-hist-badge";
        ev.textContent = (AP.checklist && AP.checklist.eventTitle ? AP.checklist.eventTitle(item.event) : item.eventTitle) || item.event || "—";
        top.appendChild(idEl);
        top.appendChild(ev);

        const meta = document.createElement("div");
        meta.className = "ap-hist-meta";
        const resName = AP.checklist && AP.checklist.resultName ? AP.checklist.resultName(item.result) : item.result;
        const resEmoji = AP.checklist && AP.checklist.resultEmoji ? AP.checklist.resultEmoji(item.result) : "";
        meta.textContent = `${resEmoji} Результат: ${resName}  •  ${fmtTime(item.time)}`;

        const actions = document.createElement("div");
        actions.className = "ap-hist-actions";
        const restoreBtn = document.createElement("button");
        restoreBtn.className = "ap-btn ap-btn-primary";
        restoreBtn.textContent = "↻ Відновити";
        restoreBtn.addEventListener("click", () => {
          if (AP.checklist && AP.checklist.restoreSnapshot) AP.checklist.restoreSnapshot(item);
          removeModal();
        });
        const showBtn = document.createElement("button");
        showBtn.className = "ap-btn ap-btn-ghost";
        showBtn.textContent = "Показати";
        showBtn.addEventListener("click", () => showHistoryItem(item));
        const copyBtn = document.createElement("button");
        copyBtn.className = "ap-btn ap-btn-ghost";
        copyBtn.textContent = "Скопіювати";
        copyBtn.addEventListener("click", async () => {
          try { await navigator.clipboard.writeText(item.text || ""); copyBtn.textContent = "✓"; setTimeout(() => (copyBtn.textContent = "Скопіювати"), 900); } catch (e) {}
        });
        actions.appendChild(restoreBtn);
        actions.appendChild(showBtn);
        actions.appendChild(copyBtn);

        row.appendChild(top);
        row.appendChild(meta);
        row.appendChild(actions);
        body.appendChild(row);
      });
    }

    wrap.appendChild(body);

    const footer = document.createElement("div");
    footer.className = "ap-modal-footer ap-hist-footer";
    const clearBtn = document.createElement("button");
    clearBtn.className = "ap-btn ap-btn-danger";
    clearBtn.textContent = "Очистити історію";
    clearBtn.disabled = !list.length;
    clearBtn.addEventListener("click", () => {
      uiConfirm({
        title: "Очистити історію?",
        text: "Усі записи історії буде видалено.",
        onConfirm: () => { if (AP.storage.clearHistory) AP.storage.clearHistory(); removeModal(); showHistory(); }
      });
    });
    footer.appendChild(clearBtn);
    wrap.appendChild(footer);

    const m = makeModal(wrap);
    x.addEventListener("click", m.close);
    AP.theme.apply(AP.theme.current());
  }

  AP.settings = { showSettings, showCheckboxConfig, showHistory, showTokenInput };
})();