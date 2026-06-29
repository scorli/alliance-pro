(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});

  /* ===== Події та профілі кроків (з розширення колеги) ===== */
  const EVENT_341 = "341";
  const EVENT_349 = "349";
  const EVENT_290353 = "290353";
  const EVENT_DVZ_356319 = "DVZ_356319";
  const EVENT_DVZ_134 = "DVZ_134";
  const EVENT_DVZ_327 = "DVZ_327";
  const DVZ_SUB_EVENTS = [EVENT_DVZ_356319, EVENT_DVZ_134, EVENT_DVZ_327];
  const AVAILABLE_EVENTS = [EVENT_341, EVENT_349, EVENT_290353, EVENT_DVZ_356319, EVENT_DVZ_134, EVENT_DVZ_327];

  // Мапінг числа з K-коду події (напр. K00134 → "134") на наш профіль.
  // Якщо коду немає в мапі — подія нам невідома, автодетект її просто ігнорує (без помилки).
  const KCODE_MAP = {
    "341": EVENT_341,
    "349": EVENT_349,
    "134": EVENT_DVZ_134,
    "327": EVENT_DVZ_327,
    "356": EVENT_DVZ_356319,
    "319": EVENT_DVZ_356319,
    "290": EVENT_290353,
    "353": EVENT_290353
  };

  const eventDisplayName = {
    DVZ_GROUP: "ДВЗ",
    [EVENT_DVZ_356319]: "356/319",
    [EVENT_DVZ_134]: "134",
    [EVENT_DVZ_327]: "327",
    [EVENT_290353]: "290/353"
  };

  const dvzMonthsOptions = [1, 3, 6, 12, 18, 24, 36];

  const MOODS = [
    { key: "positive", name: "Позитивний", emoji: "😊" },
    { key: "neutral", name: "Нейтральний", emoji: "😐" },
    { key: "negative", name: "Негативний", emoji: "😠" }
  ];

  const RESULTS = [
    { key: "interrupted", name: "Перервана", emoji: "⏹️" },
    { key: "pay", name: "Сплатить", emoji: "✅" },
    { key: "nopay", name: "НеСплатить", emoji: "⛔" },
    { key: "military", name: "Військовий", emoji: "🎖️" },
    { key: "review", name: "Згоден на перегляд", emoji: "🔎" },
    { key: "nonstd", name: "Нестандарт", emoji: "❓" }
  ];
  function resultName(k) { const r = RESULTS.find((x) => x.key === k); return r ? r.name : "Перервана"; }
  function resultEmoji(k) { const r = RESULTS.find((x) => x.key === k); return r ? r.emoji : "⏹️"; }

  const stepsByEvent = {
    [EVENT_341]: [
      { type: "header", text: "ℹ️ Інформування:" },
      { type: "checkbox", text: "Інформування про заборгованість" },
      { type: "checkbox", text: "Місток/причина" },
      { type: "checkbox", text: "Пропрацювання причини" },
      { type: "checkbox", text: "Уточнення додаткового номера" },
      { type: "checkbox", text: "Історія комунікацій" },
      { type: "header", text: "🧑‍⚖️ Мотиватори:" },
      { type: "checkbox", text: "Фінальний рахунок" },
      { type: "checkbox", text: "Пропозиція скасування фін. рахунку" },
      { type: "checkbox", text: "Суд" },
      { type: "checkbox", text: "Виконавча служба" },
      { type: "header", text: "❇️ Торг:" },
      { type: "checkbox", text: "Дата - 2 дні" },
      { type: "checkbox", text: "Дата - 10 днів" },
      { type: "checkbox", text: "Сума - 100%" },
      { type: "checkbox", text: "Сума - Поточний+прострочений" },
      { type: "checkbox", text: "Сума - Просрочений" },
      { type: "header", text: "‼️ Додатково:" },
      { type: "checkbox", text: "Подяка військовому" },
      { type: "checkbox", text: "Спеціальний рахунок" },
      { type: "checkbox", text: "Передати на службу турботи" },
      { type: "checkbox", text: "Передати в SLACK" },
      { type: "header", text: "🔁 Циклічність:" },
      { type: "checkbox", text: "Крок 1" },
      { type: "checkbox", text: "Крок 2" },
      { type: "checkbox", text: "Крок 3" },
      { type: "header", text: "⚠️ Негатив:" },
      { type: "checkbox", text: "Крок 1" },
      { type: "checkbox", text: "Крок 2" },
      { type: "checkbox", text: "Крок 3" }
    ],
    [EVENT_DVZ_356319]: [
      { type: "header", text: "ℹ️ Інформування:" },
      { type: "checkbox", text: "Інформування про заборгованість" },
      { type: "checkbox", text: "Місток/причина" },
      { type: "checkbox", text: "Пропрацювання причини" },
      { type: "checkbox", text: "Уточнення додаткового номера" },
      { type: "checkbox", text: "Історія комунікацій" },
      { type: "header", text: "📑 ДВЗ:" },
      { type: "checkbox", text: "Пропозиція ДВЗ" },
      { type: "dvz_terms", text: "Умови ДВЗ" },
      { type: "months", text: "Кількість місяців" },
      { type: "checkbox", text: "Відправлено договір" },
      { type: "header", text: "🧑‍⚖️ Мотиватори:" },
      { type: "checkbox", text: "Суд" },
      { type: "checkbox", text: "Виконавча служба" },
      { type: "header", text: "❇️ Торг:" },
      { type: "checkbox", text: "Дата - 2 дні" },
      { type: "checkbox", text: "Дата - 10 днів" },
      { type: "checkbox", text: "Сума - 100%" },
      { type: "checkbox", text: "Сума - яку суму готові внести?" },
      { type: "checkbox", text: "Сума - 50%" },
      { type: "checkbox", text: "Сума - 25%" },
      { type: "checkbox", text: "Сума - мін." },
      { type: "checkbox", text: "Сума - Аванс" },
      { type: "header", text: "‼️ Додатково:" },
      { type: "checkbox", text: "Подяка військовому" },
      { type: "checkbox", text: "Спеціальний рахунок" },
      { type: "checkbox", text: "Передати на службу турботи" },
      { type: "checkbox", text: "Передати в SLACK" },
      { type: "header", text: "🔁 Циклічність:" },
      { type: "checkbox", text: "Крок 1" },
      { type: "checkbox", text: "Крок 2" },
      { type: "checkbox", text: "Крок 3" },
      { type: "header", text: "⚠️ Негатив:" },
      { type: "checkbox", text: "Крок 1" },
      { type: "checkbox", text: "Крок 2" },
      { type: "checkbox", text: "Крок 3" }
    ],
    [EVENT_DVZ_134]: [
      { type: "header", text: "ℹ️ Інформування:" },
      { type: "checkbox", text: "Інформування про заборгованість" },
      { type: "checkbox", text: "Місток/причина" },
      { type: "checkbox", text: "Пропрацювання причини" },
      { type: "checkbox", text: "Історія комунікацій" },
      { type: "checkbox", text: "Уточнення додаткового номера" },
      { type: "header", text: "🧑‍⚖️ Мотиватори:" },
      { type: "checkbox", text: "Ризик анулювання ДВЗ" },
      { type: "checkbox", text: "Суд" },
      { type: "checkbox", text: "Виконавча служба" },
      { type: "header", text: "❇️ Торг:" },
      { type: "checkbox", text: "Дата - До кінця міс." },
      { type: "checkbox", text: "Дата - 10 днів" },
      { type: "checkbox", text: "Сума - Платіж" },
      { type: "checkbox", text: "Сума - Яку суму готові внести?" },
      { type: "checkbox", text: "Сума - 50%" },
      { type: "checkbox", text: "Сума - 25%" },
      { type: "checkbox", text: "Сума - мін." },
      { type: "checkbox", text: "Сума - Аванс" }
    ],
    [EVENT_DVZ_327]: [
      { type: "header", text: "ℹ️ Інформування:" },
      { type: "checkbox", text: "Інформування про заборгованість" },
      { type: "checkbox", text: "Місток/причина" },
      { type: "checkbox", text: "Пропрацювання причини" },
      { type: "checkbox", text: "Історія комунікацій" },
      { type: "checkbox", text: "Уточнення додаткового номера" },
      { type: "header", text: "🧑‍⚖️ Мотиватори:" },
      { type: "checkbox", text: "Ризик анулювання ДВЗ" },
      { type: "checkbox", text: "Суд" },
      { type: "checkbox", text: "Виконавча служба" },
      { type: "header", text: "❇️ Торг:" },
      { type: "checkbox", text: "Дата - 2 дні" },
      { type: "checkbox", text: "Дата - 10 днів" },
      { type: "checkbox", text: "Сума - Поточний + прострочений" },
      { type: "checkbox", text: "Сума - Прострочений" },
      { type: "checkbox", text: "Сума - 50%" },
      { type: "checkbox", text: "Сума - 25%" },
      { type: "checkbox", text: "Сума - мін." },
      { type: "checkbox", text: "Сума - Аванс" }
    ],
    [EVENT_290353]: [
      { type: "header", text: "ℹ️ Інформування:" },
      { type: "checkbox", text: "Інформування про заборгованість" },
      { type: "checkbox", text: "Місток/причина" },
      { type: "checkbox", text: "Пропрацювання причини" },
      { type: "checkbox", text: "Уточнення додаткового номера" },
      { type: "checkbox", text: "Історія комунікацій" },
      { type: "header", text: "🧑‍⚖️ Мотиватори:" },
      { type: "checkbox", text: "Суд" },
      { type: "checkbox", text: "Виконавча служба" },
      { type: "header", text: "❇️ Торг:" },
      { type: "checkbox", text: "Дата - 2 дні" },
      { type: "checkbox", text: "Дата - 10 днів" },
      { type: "checkbox", text: "Сума - 100%" },
      { type: "checkbox", text: "Сума - яку суму готові внести?" },
      { type: "checkbox", text: "Сума - 50%" },
      { type: "checkbox", text: "Сума - 25%" },
      { type: "checkbox", text: "Сума - мін." },
      { type: "header", text: "‼️ Додатково:" },
      { type: "checkbox", text: "Подяка військовому" },
      { type: "checkbox", text: "Спеціальний рахунок" },
      { type: "checkbox", text: "Передати на службу турботи" },
      { type: "checkbox", text: "Передати в SLACK" },
      { type: "header", text: "🔁 Циклічність:" },
      { type: "checkbox", text: "Крок 1" },
      { type: "checkbox", text: "Крок 2" },
      { type: "checkbox", text: "Крок 3" },
      { type: "header", text: "⚠️ Негатив:" },
      { type: "checkbox", text: "Крок 1" },
      { type: "checkbox", text: "Крок 2" },
      { type: "checkbox", text: "Крок 3" }
    ],
    [EVENT_349]: [
      { type: "header", text: "ℹ️ Інформування:" },
      { type: "checkbox", text: "Інформування про заборгованість" },
      { type: "checkbox", text: "Місток/причина" },
      { type: "checkbox", text: "Пропрацювання причини" },
      { type: "checkbox", text: "Уточнення додаткового номера" },
      { type: "checkbox", text: "Історія комунікацій" },
      { type: "header", text: "🧑‍⚖️ Мотиватори:" },
      { type: "checkbox", text: "Фінальний рахунок" },
      { type: "checkbox", text: "Суд" },
      { type: "checkbox", text: "Виконавча служба" },
      { type: "header", text: "❇️ Торг:" },
      { type: "checkbox", text: "Дата - 2 дні" },
      { type: "checkbox", text: "Дата - 10 днів" },
      { type: "checkbox", text: "Сума - 100%" },
      { type: "checkbox", text: "Сума - яку суму готові внести?" },
      { type: "checkbox", text: "Сума - 50%" },
      { type: "checkbox", text: "Сума - 25%" },
      { type: "checkbox", text: "Сума - мін." },
      { type: "header", text: "‼️ Додатково:" },
      { type: "checkbox", text: "Подяка військовому" },
      { type: "checkbox", text: "Спеціальний рахунок" },
      { type: "checkbox", text: "Передати на службу турботи" },
      { type: "checkbox", text: "Передати в SLACK" },
      { type: "header", text: "🔁 Циклічність:" },
      { type: "checkbox", text: "Крок 1" },
      { type: "checkbox", text: "Крок 2" },
      { type: "checkbox", text: "Крок 3" },
      { type: "header", text: "⚠️ Негатив:" },
      { type: "checkbox", text: "Крок 1" },
      { type: "checkbox", text: "Крок 2" },
      { type: "checkbox", text: "Крок 3" }
    ]
  };

  /* ===== Стан (через сховище Soft Pro, окремо під кожен чат) ===== */
  function chatId() {
    const mode = AP.storage.getSettings().mode || "chat";
    if (mode === "phone") return "__phone__";
    return AP.getEffectiveChatId ? AP.getEffectiveChatId() : "__nochat__";
  }
  function getData() { return AP.storage.getChatData(chatId()); }
  function setData(data) { AP.storage.setChatData(chatId(), data); }
  function getSaved(data, eventCode) {
    if (!data.steps || typeof data.steps !== "object") data.steps = {};
    if (!data.steps[eventCode] || typeof data.steps[eventCode] !== "object") data.steps[eventCode] = {};
    return data.steps[eventCode];
  }

  function sanitizeEventCode(code) {
    if (code === "DVZ") return EVENT_DVZ_356319;
    return AVAILABLE_EVENTS.includes(code) ? code : EVENT_341;
  }
  function getEventTitle(code) { return eventDisplayName[code] || code; }
  function getCurrentSteps(code) { return stepsByEvent[code] || []; }

  /* ===== Хелпери ===== */
  function shortStepLabel(text) {
    const m = String(text || "").match(/Крок\s*(\d+)/i);
    return m ? m[1] : text;
  }
  function tradeShortLabel(text) {
    if (text.startsWith("Дата - ")) return text.replace("Дата - ", "").trim();
    if (text.startsWith("Сума - ")) {
      let v = text.replace("Сума - ", "").trim();
      const lower = v.toLowerCase();
      if (lower.includes("яку суму")) return "Яку?";
      if (lower.includes("просроч")) return "Просрочений";
      if (lower.includes("мінімальна") || lower.includes("мін.")) return "мін.";
      if (lower.includes("поточний") && lower.includes("простроч")) return "Пот+Прострч";
      return v;
    }
    return text;
  }
  function splitTradeItems(items) {
    const dates = [], sums = [];
    (items || []).forEach((t) => {
      if (t.startsWith("Дата - ")) dates.push(tradeShortLabel(t));
      else sums.push(tradeShortLabel(t));
    });
    return { dates, sums };
  }
  function getMonthsText(saved) {
    if (saved._monthsChecked !== true) return "Кількість місяців";
    if (typeof saved._months === "number") return `Кількість місяців: ${saved._months}`;
    return "Кількість місяців";
  }
  function savedHasProgress(saved) {
    if (!saved || typeof saved !== "object") return false;
    if (saved._monthsChecked === true) return true;
    if (saved._dvzTermsAdvance === "ready" || saved._dvzTermsAdvance === "decline") return true;
    for (const k in saved) {
      if (!Object.prototype.hasOwnProperty.call(saved, k)) continue;
      if (k.startsWith("_")) continue;
      if (saved[k] === true) return true;
    }
    return false;
  }
  function moodLabel(m) {
    const found = MOODS.find((x) => x.key === m);
    return found ? `${found.emoji} ${found.name}` : "😐 Нейтральний";
  }

  /* ===== Рендер ===== */
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderModeBanner(data) {
    const banner = document.getElementById("ap-mode-banner");
    if (!banner) return;
    const mode = AP.storage.getSettings().mode || "chat";
    if (mode === "phone") {
      banner.style.display = "";
      banner.textContent = "📞 Телефонія";
    } else {
      const id = AP.getActiveChatId && AP.getActiveChatId();
      banner.style.display = "";
      banner.textContent = id ? "💬 Чат" : "💬 Чат (не вибрано)";
    }
  }

  function renderMood(data) {
    const field = document.getElementById("ap-mood-field");
    const box = document.getElementById("ap-mood");
    if (!box) return;
    box.innerHTML = "";

    // У режимі «Телефонія» настрій клієнта не потрібен
    const mode = AP.storage.getSettings().mode || "chat";
    if (field) field.style.display = mode === "phone" ? "none" : "";
    if (mode === "phone") return;

    const current = data.mood || null;
    MOODS.forEach((m) => {
      const b = el("button", "ap-mood-chip ap-mood-" + m.key + (m.key === current ? " ap-mood-on" : ""), m.emoji);
      b.type = "button";
      b.title = m.name;
      b.dataset.mood = m.key;
      b.addEventListener("click", () => {
        const d = getData();
        const wasOn = b.classList.contains("ap-mood-on");
        box.querySelectorAll(".ap-mood-chip").forEach((x) => x.classList.remove("ap-mood-on"));
        // Повторний клік знімає вибір (можна надіслати без настрою)
        if (wasOn) {
          d.mood = null;
        } else {
          d.mood = m.key;
          b.classList.add("ap-mood-on");
        }
        setData(d);
      });
      box.appendChild(b);
    });
  }

  function renderEvents(data) {
    const bar = document.getElementById("ap-events");
    const sub = document.getElementById("ap-subevents");
    if (!bar || !sub) return;
    bar.innerHTML = "";
    sub.innerHTML = "";

    const current = sanitizeEventCode(data.event);
    const isDvz = DVZ_SUB_EVENTS.includes(current);

    const progress = {};
    AVAILABLE_EVENTS.forEach((ev) => { progress[ev] = savedHasProgress((data.steps || {})[ev]); });

    const mkBtn = (cls, active, hasProg, label, onClick) => {
      const b = el("button", cls + (active ? " ap-ev-active" : "") + (hasProg ? " ap-ev-progress" : ""), label);
      b.type = "button";
      b.addEventListener("click", onClick);
      return b;
    };

    const switchEvent = (ev) => {
      const d = getData();
      d.event = ev;
      d.eventManual = true; // оператор обрав вручну — автодетект більше не перемикає
      setData(d);
      render();
    };

    bar.appendChild(mkBtn("ap-ev-btn", current === EVENT_341, progress[EVENT_341], "341", () => switchEvent(EVENT_341)));
    bar.appendChild(mkBtn("ap-ev-btn", isDvz, progress[EVENT_DVZ_356319] || progress[EVENT_DVZ_134] || progress[EVENT_DVZ_327], "ДВЗ", () => switchEvent(EVENT_DVZ_356319)));
    bar.appendChild(mkBtn("ap-ev-btn", current === EVENT_349, progress[EVENT_349], "349", () => switchEvent(EVENT_349)));
    bar.appendChild(mkBtn("ap-ev-btn", current === EVENT_290353, progress[EVENT_290353], "290/353", () => switchEvent(EVENT_290353)));

    if (isDvz) {
      [EVENT_DVZ_356319, EVENT_DVZ_134, EVENT_DVZ_327].forEach((ev) => {
        sub.appendChild(mkBtn("ap-subev-btn", current === ev, progress[ev], getEventTitle(ev), () => switchEvent(ev)));
      });
    }
  }

  function renderMonthsPicker(container, data, saved) {
    const wrap = el("div", "ap-step ap-months");
    const checkWrap = el("label", "ap-months-check");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = saved._monthsChecked === true;
    const label = el("span", null, getMonthsText(saved));
    checkWrap.appendChild(checkbox);
    checkWrap.appendChild(label);
    wrap.appendChild(checkWrap);

    const optionsWrap = el("div", "ap-months-options");
    const refresh = () => {
      const selected = typeof saved._months === "number" ? saved._months : null;
      label.textContent = getMonthsText(saved);
      optionsWrap.querySelectorAll(".ap-month-btn").forEach((b) => {
        b.classList.toggle("active", Number(b.dataset.month) === selected);
        b.disabled = saved._monthsChecked !== true;
      });
      wrap.classList.toggle("ap-step-checked", saved._monthsChecked === true);
    };

    checkbox.addEventListener("change", () => {
      const d = getData(); const s = getSaved(d, sanitizeEventCode(d.event));
      s._monthsChecked = checkbox.checked;
      if (!checkbox.checked) delete s._months;
      setData(d);
      saved._monthsChecked = s._monthsChecked; saved._months = s._months;
      refresh(); markEventProgress();
    });

    dvzMonthsOptions.forEach((m) => {
      const btn = el("button", "ap-month-btn", String(m));
      btn.type = "button";
      btn.dataset.month = String(m);
      btn.addEventListener("click", () => {
        if (saved._monthsChecked !== true) return;
        const d = getData(); const s = getSaved(d, sanitizeEventCode(d.event));
        s._months = m; setData(d);
        saved._months = m;
        refresh();
      });
      optionsWrap.appendChild(btn);
    });
    wrap.appendChild(optionsWrap);
    container.appendChild(wrap);
    refresh();
  }

  function renderDvzTerms(container, item, myIndex, saved) {
    const label = el("label", "ap-step ap-dvz-terms");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = saved[myIndex] === true;
    const textSpan = el("span", null, " " + item.text);
    const btns = el("div", "ap-dvz-terms-buttons");
    const okBtn = el("button", "ap-dvz-terms-btn", "✓"); okBtn.type = "button"; okBtn.title = "Погодився";
    const noBtn = el("button", "ap-dvz-terms-btn", "✕"); noBtn.type = "button"; noBtn.title = "Відмовився";

    const refresh = () => {
      const adv = saved._dvzTermsAdvance || null;
      label.classList.toggle("ap-step-checked", saved[myIndex] === true);
      label.classList.remove("ap-dvz-ready", "ap-dvz-decline");
      okBtn.classList.remove("active"); noBtn.classList.remove("active");
      if (adv === "ready") { label.classList.add("ap-dvz-ready"); okBtn.classList.add("active"); }
      else if (adv === "decline") { label.classList.add("ap-dvz-decline"); noBtn.classList.add("active"); }
    };
    const commit = (mutator) => {
      const d = getData(); const s = getSaved(d, sanitizeEventCode(d.event));
      mutator(s);
      setData(d);
      Object.assign(saved, s);
      refresh(); markEventProgress();
    };
    checkbox.addEventListener("change", () => commit((s) => { s[myIndex] = checkbox.checked; }));
    okBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      commit((s) => { s._dvzTermsAdvance = s._dvzTermsAdvance === "ready" ? undefined : "ready"; s[myIndex] = true; });
      checkbox.checked = true;
      // re-render steps because decline/ready changes which steps are relevant
      render();
    });
    noBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      commit((s) => { s._dvzTermsAdvance = s._dvzTermsAdvance === "decline" ? undefined : "decline"; s[myIndex] = true; });
      checkbox.checked = true;
      render();
    });
    btns.appendChild(okBtn); btns.appendChild(noBtn);
    label.appendChild(checkbox); label.appendChild(textSpan); label.appendChild(btns);
    container.appendChild(label);
    refresh();
  }

  function markEventProgress() {
    const data = getData();
    renderEvents(data);
  }

  function renderSteps(data) {
    const container = document.getElementById("ap-steps");
    if (!container) return;
    container.innerHTML = "";
    const event = sanitizeEventCode(data.event);
    const stepList = getCurrentSteps(event);
    const saved = getSaved(data, event);

    let checkboxIndex = 0;
    let groupMode = null;
    let groupButtons = null;
    let tradeDateBtns = null, tradeSumBtns = null;
    let cycNegWrap = null;

    const ensureTrade = () => {
      if (tradeDateBtns) return;
      const sec = el("div", "ap-grp-section");
      container.appendChild(sec);
      sec.appendChild(el("div", "ap-grp-title", "Дата:"));
      tradeDateBtns = el("div", "ap-grp-buttons"); sec.appendChild(tradeDateBtns);
      sec.appendChild(el("div", "ap-grp-title", "Сума:"));
      tradeSumBtns = el("div", "ap-grp-buttons"); sec.appendChild(tradeSumBtns);
    };
    const ensureSimple = (title) => {
      if (groupButtons) return;
      const sec = el("div", "ap-grp-section");
      container.appendChild(sec);
      sec.appendChild(el("div", "ap-grp-title", title));
      groupButtons = el("div", "ap-grp-buttons"); sec.appendChild(groupButtons);
    };

    const toggleStep = (idx, btnOrLabel, isButton) => {
      const d = getData(); const s = getSaved(d, sanitizeEventCode(d.event));
      const newVal = !(s[idx] === true);
      s[idx] = newVal; setData(d);
      if (isButton) btnOrLabel.classList.toggle("active", newVal);
      else btnOrLabel.classList.toggle("ap-step-checked", newVal);
      markEventProgress();
    };

    stepList.forEach((item) => {
      if (item.type === "header") {
        if (item.text === event) return;
        // Циклічність і Негатив — поряд у дві колонки (щоб не подовжувати панель)
        if (item.text.includes("Циклічність") || item.text.includes("Негатив")) {
          groupMode = item.text.includes("Циклічність") ? "cycle" : "negative";
          tradeDateBtns = null; tradeSumBtns = null;
          if (!cycNegWrap) { cycNegWrap = el("div", "ap-cycneg"); container.appendChild(cycNegWrap); }
          const col = el("div", "ap-cycneg-col");
          col.appendChild(el("div", "ap-cycneg-head", item.text));
          groupButtons = el("div", "ap-grp-buttons");
          col.appendChild(groupButtons);
          cycNegWrap.appendChild(col);
          return;
        }
        groupMode = null;
        if (item.text.includes("Торг")) groupMode = "trade";
        groupButtons = null; tradeDateBtns = null; tradeSumBtns = null;
        container.appendChild(el("div", "ap-step-header", item.text));
        if (groupMode === "trade") ensureTrade();
        return;
      }
      if (item.type === "months") { renderMonthsPicker(container, data, saved); return; }
      if (item.type === "dvz_terms") { renderDvzTerms(container, item, checkboxIndex, saved); checkboxIndex++; return; }
      if (item.type === "checkbox") {
        const idx = checkboxIndex;
        const checked = saved[idx] === true;
        if (groupMode === "trade") {
          ensureTrade();
          const btn = el("button", "ap-grp-btn" + (checked ? " active" : ""), tradeShortLabel(item.text));
          btn.type = "button";
          btn.addEventListener("click", () => toggleStep(idx, btn, true));
          (item.text.startsWith("Дата - ") ? tradeDateBtns : tradeSumBtns).appendChild(btn);
          checkboxIndex++; return;
        }
        if (groupMode === "cycle" || groupMode === "negative") {
          const btn = el("button", "ap-grp-btn" + (checked ? " active" : ""), shortStepLabel(item.text));
          btn.type = "button";
          btn.addEventListener("click", () => toggleStep(idx, btn, true));
          if (groupButtons) groupButtons.appendChild(btn);
          checkboxIndex++; return;
        }
        const label = el("label", "ap-step" + (checked ? " ap-step-checked" : ""));
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = checked;
        cb.addEventListener("change", () => toggleStep(idx, label, false));
        label.appendChild(cb);
        label.appendChild(document.createTextNode(" " + item.text));
        container.appendChild(label);
        checkboxIndex++;
      }
    });
  }

  function renderResult(data) {
    const sel = document.getElementById("ap-result");
    if (!sel) return;
    sel.innerHTML = "";
    const current = data.result || "interrupted";
    RESULTS.forEach((r) => {
      const o = document.createElement("option");
      o.value = r.key;
      o.textContent = r.emoji + " " + r.name;
      if (r.key === current) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = () => {
      const d = getData();
      d.result = sel.value;
      setData(d);
    };
  }

  function render() {
    const data = getData();
    if (!AVAILABLE_EVENTS.includes(data.event)) { data.event = EVENT_341; setData(data); }
    renderModeBanner(data);
    renderEvents(data);
    renderResult(data);
    renderMood(data);
    renderSteps(data);
    const comment = document.getElementById("ap-comment");
    if (comment) comment.value = data.comment || "";

    // У телефонії немає токенів — ховаємо «Скопіювати» та «Підтягнути»
    const phone = (AP.storage.getSettings().mode || "chat") === "phone";
    const copyBtn = document.getElementById("ap-copy-btn");
    const pullBtn = document.getElementById("ap-pull-btn");
    if (copyBtn) copyBtn.style.display = phone ? "none" : "";
    if (pullBtn) pullBtn.style.display = phone ? "none" : "";
  }

  function load() { render(); }
  function applyConfig() { render(); }

  /* ===== Формування тексту (з логікою копіювання колеги) ===== */
  function buildText(dataArg) {
    const data = dataArg || getData();
    const event = sanitizeEventCode(data.event);
    const stepList = getCurrentSteps(event);
    const saved = getSaved(data, event);

    const order = [];
    const doneBy = {}, leftBy = {};
    const dodatDone = [];
    const headerKeys = { motivators: null, trade: null, cycle: null, negative: null, dvz: null };
    let checkboxIndex = 0;
    let currentHeader = "Кроки";
    let inDodatkovo = false;

    const ensureHeader = (h) => {
      if (!order.includes(h)) order.push(h);
      if (!doneBy[h]) doneBy[h] = [];
      if (!leftBy[h]) leftBy[h] = [];
    };

    stepList.forEach((item) => {
      if (item.type === "header") {
        if (item.text === event) return;
        currentHeader = item.text;
        inDodatkovo = item.text.includes("Додатково");
        if (item.text.includes("Мотиватори")) headerKeys.motivators = item.text;
        if (item.text.includes("Торг")) headerKeys.trade = item.text;
        if (item.text.includes("Циклічність")) headerKeys.cycle = item.text;
        if (item.text.includes("Негатив")) headerKeys.negative = item.text;
        if (item.text.includes("ДВЗ")) headerKeys.dvz = item.text;
        if (!inDodatkovo) ensureHeader(currentHeader);
        return;
      }
      if (item.type === "months") {
        ensureHeader(currentHeader);
        if (saved._dvzTermsAdvance === "decline") return;
        if (saved._monthsChecked === true) doneBy[currentHeader].push(getMonthsText(saved));
        else leftBy[currentHeader].push("Кількість місяців");
        return;
      }
      if (item.type === "dvz_terms") {
        ensureHeader(currentHeader);
        const checked = saved[checkboxIndex] === true;
        let termsText = item.text;
        const adv = saved._dvzTermsAdvance || null;
        if (adv === "ready") termsText += " (Авансовий платіж: погодився)";
        else if (adv === "decline") termsText += " (Авансовий платіж: відмовився)";
        if (checked) doneBy[currentHeader].push(termsText);
        else leftBy[currentHeader].push(item.text);
        checkboxIndex++;
        return;
      }
      if (item.type === "checkbox") {
        const checked = saved[checkboxIndex] === true;
        if (saved._dvzTermsAdvance === "decline" && item.text.includes("Відправлено договір")) { checkboxIndex++; return; }
        if (inDodatkovo) { if (checked) dodatDone.push(item.text); }
        else {
          ensureHeader(currentHeader);
          if (checked) doneBy[currentHeader].push(item.text);
          else leftBy[currentHeader].push(item.text);
        }
        checkboxIndex++;
      }
    });

    if (event === EVENT_DVZ_356319 && headerKeys.motivators) {
      const doneMotiv = new Set(doneBy[headerKeys.motivators] || []);
      leftBy[headerKeys.motivators] = ["Суд", "Виконавча служба"].filter((x) => !doneMotiv.has(x));
    }
    if (event === EVENT_DVZ_356319 && headerKeys.trade && saved._dvzTermsAdvance === "ready") {
      leftBy[headerKeys.trade] = [];
    }
    if (event === EVENT_DVZ_356319 && headerKeys.trade && saved._dvzTermsAdvance === "decline") {
      leftBy[headerKeys.trade] = (leftBy[headerKeys.trade] || []).filter((x) => x !== "Сума - 100%");
    }
    // Торг — вибір по одному: якщо вже обрано дату, інші дати не показуємо в «Залишилось»;
    // те саме окремо для суми.
    if (headerKeys.trade) {
      const doneTrade = doneBy[headerKeys.trade] || [];
      const dateDone = doneTrade.some((x) => x.startsWith("Дата - "));
      const sumDone = doneTrade.some((x) => x.startsWith("Сума - "));
      let leftTrade = leftBy[headerKeys.trade] || [];
      if (dateDone) leftTrade = leftTrade.filter((x) => !x.startsWith("Дата - "));
      if (sumDone) leftTrade = leftTrade.filter((x) => !x.startsWith("Сума - "));
      leftBy[headerKeys.trade] = leftTrade;
    }
    if (headerKeys.cycle) delete leftBy[headerKeys.cycle];
    if (headerKeys.negative) delete leftBy[headerKeys.negative];

    const totalLeft = Object.values(leftBy).reduce((s, a) => s + a.length, 0);
    const doneOut = [];
    order.forEach((h) => {
      const list = doneBy[h] || [];
      if (!list.length) return;
      if (headerKeys.trade && h === headerKeys.trade) {
        const { dates, sums } = splitTradeItems(list);
        if (dates.length || sums.length) {
          doneOut.push(h);
          if (dates.length) doneOut.push(`Дата: ${dates.join(", ")}`);
          if (sums.length) doneOut.push(`Сума: ${sums.join(", ")}`);
        }
        return;
      }
      if ((headerKeys.cycle && h === headerKeys.cycle) || (headerKeys.negative && h === headerKeys.negative)) {
        doneOut.push(`${h} ${list.map(shortStepLabel).join(", ")}`);
        return;
      }
      doneOut.push(`${h} ${list.join("; ")}`);
    });

    const mode = AP.storage.getSettings().mode || "chat";
    const lines = [];
    lines.push(`🏁 Результат: ${resultName(data.result || "interrupted")}`);
    if (mode !== "phone" && data.mood) lines.push(`🙂 Настрій: ${moodLabel(data.mood).replace(/^[^ ]+ /, "")}`);
    const note = (data.comment || "").trim();
    if (note) lines.push(`📝 Нотатки: ${note}`);
    lines.push("");
    lines.push("✅ Пройдені кроки:");
    if (doneOut.length) lines.push(...doneOut); else lines.push("—");
    if (dodatDone.length) {
      lines.push("");
      lines.push("➕ Додатково:");
      lines.push(...dodatDone.map((t) => `🟢 ${t}`));
    }
    lines.push("");
    lines.push(`❌ Залишилось (${totalLeft}):`);
    let hasLeft = false;
    order.forEach((h) => {
      const list = leftBy[h] || [];
      if (!list.length) return;
      hasLeft = true;
      lines.push(h);
      if (headerKeys.trade && h === headerKeys.trade) {
        const { dates, sums } = splitTradeItems(list);
        if (dates.length) lines.push(` Дата: ${dates.join(", ")}`);
        if (sums.length) lines.push(` Сума: ${sums.join(", ")}`);
      } else {
        lines.push(...list.map((t) => ` ${t}`));
      }
      lines.push("");
    });
    if (!hasLeft) lines.push("—");
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines.join("\n");
  }

  /* ===== Дії ===== */
  function flashStatus(text) {
    const el2 = document.getElementById("ap-copy-status");
    if (!el2) return;
    el2.textContent = text;
    el2.classList.add("ap-visible");
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(() => el2.classList.remove("ap-visible"), 1600);
  }

  /* ===== Токен синхронізації між операторами =====
     У текст копіювання вшивається НЕВИДИМИЙ токен (zero-width символи) зі станом
     кейсу. Наступний оператор натискає «Підтягнути» (або спрацьовує банер) — і його
     розширення зчитує токен із чату/буфера та відновлює кроки/настрій/результат. */
  function b64enc(str) { try { return window.btoa(unescape(encodeURIComponent(str))); } catch (e) { return ""; } }
  function b64dec(b64) { try { return decodeURIComponent(escape(window.atob(b64))); } catch (e) { return ""; } }

  // 4 невидимі символи = 2 біти кожен; ﻿ — межа токена
  const ZW = ["​", "‌", "‍", "⁠"];
  const ZW_SENT = "﻿";
  function zwEncode(ascii) {
    let out = ZW_SENT;
    for (let i = 0; i < ascii.length; i++) {
      const code = ascii.charCodeAt(i) & 0xFF;
      out += ZW[(code >> 6) & 3] + ZW[(code >> 4) & 3] + ZW[(code >> 2) & 3] + ZW[code & 3];
    }
    return out + ZW_SENT;
  }
  function zwDecode(text) {
    const start = text.indexOf(ZW_SENT);
    if (start < 0) return null;
    const end = text.indexOf(ZW_SENT, start + 1);
    if (end < 0) return null;
    const mid = text.slice(start + 1, end);
    let s = "";
    for (let i = 0; i + 4 <= mid.length; i += 4) {
      const a = ZW.indexOf(mid[i]), b = ZW.indexOf(mid[i + 1]), c = ZW.indexOf(mid[i + 2]), d = ZW.indexOf(mid[i + 3]);
      if (a < 0 || b < 0 || c < 0 || d < 0) return null;
      s += String.fromCharCode((a << 6) | (b << 4) | (c << 2) | d);
    }
    return s;
  }

  // Видимий токен із підписом, щоб оператори розуміли, що це й не видаляли.
  function encodeToken(data) {
    const event = sanitizeEventCode(data.event);
    const payload = { v: 1, e: event, st: data.steps || {}, m: data.mood || null, r: data.result || "interrupted", c: data.comment || "" };
    const b = b64enc(JSON.stringify(payload));
    return b ? "🔁 Soft Pro (не видаляти): ⟦AP1|" + b + "⟧" : "";
  }
  function decodeToken(text) {
    if (!text) return null;
    let b64 = null;
    // 1) невидимий (zero-width) токен
    const zw = zwDecode(text);
    if (zw) b64 = zw;
    // 2) сумісність зі старим видимим форматом ⟦AP1|...⟧
    if (!b64) {
      const re = /⟦AP1\|([A-Za-z0-9+/=]+)⟧/g;
      let m, last = null;
      while ((m = re.exec(text)) !== null) last = m[1];
      b64 = last;
    }
    if (!b64) return null;
    try { const o = JSON.parse(b64dec(b64)); return (o && o.v) ? o : null; } catch (e) { return null; }
  }
  function applyToken(p) {
    if (!p) return false;
    const d = getData();
    if (p.e) { d.event = sanitizeEventCode(p.e); d.eventManual = true; }
    d.steps = (p.st && typeof p.st === "object") ? p.st : {};
    d.mood = p.m || null;
    d.result = p.r || "interrupted";
    d.comment = typeof p.c === "string" ? p.c : "";
    setData(d);
    render();
    return true;
  }
  function scanChatForToken() {
    const box = document.querySelector(".sf_chat_msg_holder");
    const txt = box ? (box.innerText || box.textContent || "") : "";
    return decodeToken(txt);
  }
  // ===== Автовизначення події за K-кодом на сторінці =====
  function detectEventFromPage() {
    let code = null;
    // спершу у вузьких спанах інфо-картки, де лежить «(K00134)»
    const spans = document.querySelectorAll("span.fixed-width");
    for (let i = 0; i < spans.length && !code; i++) {
      const m = spans[i].textContent.match(/\(?K0*(\d{2,6})\)?/);
      if (m) code = m[1];
    }
    if (!code) {
      const box = document.querySelector(".sf_chat_msg_holder");
      const m = box && (box.innerText || box.textContent || "").match(/\(K0*(\d{2,6})\)/);
      if (m) code = m[1];
    }
    if (!code) return null;
    return KCODE_MAP[code] || null; // невідома подія → null (ігноруємо, без помилки)
  }

  let eventObserver = null;
  function maybeAutoEvent() {
    if (eventObserver) { eventObserver.disconnect(); eventObserver = null; }
    const startChat = chatId();
    function tryDetect() {
      if (chatId() !== startChat) return true;          // чат змінився — зупиняємось
      const data = getData();
      if (data.eventManual) return true;                // оператор обрав сам — не чіпаємо
      const ev = detectEventFromPage();
      if (ev) {
        if (ev !== data.event) { data.event = ev; setData(data); render(); }
        return true;
      }
      return false; // ще не знайшли (картка довантажується) або подія невідома
    }
    if (tryDetect()) return;
    const holder = document.querySelector(".sf_chat_msg_holder") || document.body;
    eventObserver = new MutationObserver(() => {
      if (tryDetect()) { if (eventObserver) { eventObserver.disconnect(); eventObserver = null; } }
    });
    eventObserver.observe(holder, { childList: true, subtree: true });
    setTimeout(() => { if (eventObserver) { eventObserver.disconnect(); eventObserver = null; } }, 10000);
  }

  async function pull() {
    let p = scanChatForToken();
    if (!p) { try { p = decodeToken(await navigator.clipboard.readText()); } catch (e) {} }
    if (p) {
      applyToken(p);
      flashStatus("Підтягнуто ✓");
      const banner = document.getElementById("ap-sync-banner");
      if (banner) banner.style.display = "none";
      return true;
    }
    // У чаті/буфері не знайдено — пропонуємо вставити токен вручну
    if (AP.settings && AP.settings.showTokenInput) AP.settings.showTokenInput();
    else flashStatus("Токен не знайдено");
    return false;
  }
  // Автодетект токена — за тією ж схемою, що й авто-ID: одразу + спостерігач ~10с
  let pullObserver = null;
  function maybeOfferPull() {
    if (pullObserver) { pullObserver.disconnect(); pullObserver = null; }
    const banner = document.getElementById("ap-sync-banner");
    if (!banner) return;
    const startChat = chatId();
    const hide = () => { banner._payload = null; banner.style.display = "none"; };
    hide();

    function tryScan() {
      if (chatId() !== startChat) return true;            // чат змінився — зупиняємось
      if (hasAnyProgress(getData())) return true;         // вже є прогрес — не пропонуємо
      const p = scanChatForToken();
      if (p) { banner._payload = p; banner.style.display = ""; return true; }
      return false;
    }

    if (tryScan()) return;
    const holder = document.querySelector(".sf_chat_msg_holder") || document.body;
    pullObserver = new MutationObserver(() => {
      if (tryScan()) { if (pullObserver) { pullObserver.disconnect(); pullObserver = null; } }
    });
    pullObserver.observe(holder, { childList: true, subtree: true });
    setTimeout(() => { if (pullObserver) { pullObserver.disconnect(); pullObserver = null; } }, 10000);
  }

  async function copy() {
    const tokensOn = AP.storage.getSettings().tokensEnabled !== false;
    const token = tokensOn ? encodeToken(getData()) : "";
    const text = token ? buildText() + "\n\n" + token : buildText();
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
      document.body.removeChild(ta);
    }
    flashStatus(ok ? "Скопійовано ✓" : "Помилка копіювання");
    if (ok && AP.storage.getSettings().resetAfterCopy) reset(true);
  }

  function hasAnyProgress(data) {
    const ev = sanitizeEventCode(data.event);
    const s = (data.steps || {})[ev] || {};
    if (savedHasProgress(s)) return true;
    if ((data.comment || "").trim()) return true;
    if (data.result && data.result !== "interrupted") return true;
    if (data.mood) return true;
    return false;
  }

  // Архівувати конкретний чат за його id (для автоархіву при переході)
  function archiveChat(id) {
    if (!id) return false;
    const data = AP.storage.getChatData(id);
    if (!hasAnyProgress(data)) return false;
    const event = sanitizeEventCode(data.event);
    const isPhone = id === "__phone__";
    const noId = id === "__nochat__";
    const label = isPhone ? "Телефонія" : noId ? "Без ID" : (data.cid || id);
    const text = buildText(data);
    const list = (AP.storage.getHistory && AP.storage.getHistory()) || [];
    // Один запис на клієнта (за CID/ID): якщо вже є такий і він не змінився — нічого не робимо.
    // Телефонію та сесії без ID не схлопуємо (кожна — окремий запис).
    const dedupeKey = (isPhone || noId) ? null : label;
    if (dedupeKey) {
      const existing = list.find((x) => x.label === label);
      if (existing && existing.text === text) return false;
    }
    AP.storage.addHistory({
      time: new Date().toISOString(),
      label: label,
      event: event,
      eventTitle: getEventTitle(event),
      result: data.result || "interrupted",
      mood: data.mood || null,
      comment: data.comment || "",
      steps: JSON.parse(JSON.stringify(data.steps || {})),
      text: text
    }, dedupeKey);
    return true;
  }

  function archiveCurrent() { return archiveChat(chatId()); }

  function restoreSnapshot(snap) {
    if (!snap) return;
    const data = getData();
    if (snap.event) { data.event = sanitizeEventCode(snap.event); data.eventManual = true; }
    data.steps = snap.steps ? JSON.parse(JSON.stringify(snap.steps)) : {};
    data.mood = snap.mood || null;
    data.comment = snap.comment || "";
    data.result = snap.result || "interrupted";
    setData(data);
    render();
  }

  function reset(silent) {
    archiveCurrent();
    const data = getData();
    const event = sanitizeEventCode(data.event);
    data.steps = data.steps || {};
    data.steps[event] = {};
    data.comment = "";
    data.mood = null;
    data.result = "interrupted";
    setData(data);
    render();
    if (!silent) flashStatus("Скинуто");
  }

  function bindControls() {
    const copyBtn = document.getElementById("ap-copy-btn");
    const resetBtn = document.getElementById("ap-reset-btn");
    const comment = document.getElementById("ap-comment");
    if (copyBtn) copyBtn.addEventListener("click", copy);
    if (resetBtn) resetBtn.addEventListener("click", () => reset(false));
    if (comment) comment.addEventListener("input", () => {
      const d = getData(); d.comment = comment.value; setData(d);
    });

    // Підтягнути прогрес із токена (чат → буфер обміну)
    const pullBtn = document.getElementById("ap-pull-btn");
    if (pullBtn) pullBtn.addEventListener("click", pull);

    // Банер автопідказки про знайдений прогрес
    const sApply = document.getElementById("ap-sync-apply");
    const sDismiss = document.getElementById("ap-sync-dismiss");
    const banner = document.getElementById("ap-sync-banner");
    if (sApply) sApply.addEventListener("click", () => {
      if (banner && banner._payload) { applyToken(banner._payload); flashStatus("Підтягнуто ✓"); }
      if (banner) banner.style.display = "none";
    });
    if (sDismiss) sDismiss.addEventListener("click", () => { if (banner) banner.style.display = "none"; });

    const notesToggle = document.getElementById("ap-cl-notes-toggle");
    const notesBlock = document.getElementById("ap-cl-notes-block");
    if (notesToggle && notesBlock) {
      notesToggle.addEventListener("click", () => {
        notesBlock.classList.toggle("is-collapsed");
        const chev = notesToggle.querySelector(".ap-notes-chev");
        if (chev) chev.textContent = notesBlock.classList.contains("is-collapsed") ? "▼" : "▲";
      });
    }
  }

  AP.checklist = {
    render, load, save: function () {}, buildText, copy, reset, bindControls, applyConfig,
    restoreSnapshot, archiveCurrent, archiveChat,
    encodeToken, decodeToken, applyToken, pull, maybeOfferPull, maybeAutoEvent,
    eventTitle: getEventTitle, resultName, resultEmoji
  };
})();