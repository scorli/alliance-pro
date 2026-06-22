(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});
  const MAX_TOTAL_SECONDS = 180 * 60 + 59;

  const SOUNDS = {
    classic: { label: "Класичний", freq: 880, type: "sine" },
    bell: { label: "Дзвінок", freq: 1320, type: "triangle" },
    beep: { label: "Біп", freq: 1000, type: "square" },
    soft: { label: "М'який", freq: 660, type: "sine" },
    alert: { label: "Тривога", freq: 520, type: "sawtooth" }
  };

  let audioCtx = null;
  let calcInited = false;
  let timerInited = false;
  let reminderInited = false;

  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        audioCtx = null;
      }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, type, duration, vol) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = type || "sine";
    gain.gain.value = vol == null ? 0.3 : vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (duration || 250) / 1000);
  }

  function playSound(id, duration) {
    const s = SOUNDS[id] || SOUNDS.classic;
    tone(s.freq, s.type, duration || 250, 0.3);
  }

  function init() {
    initCalculator();
    initTimer();
    initReminder();
  }

  function initCalculator() {
    const display = document.getElementById("ap-calc-display");
    const grid = document.querySelector(".ap-calc-grid");
    if (!display || !grid || calcInited) return;
    calcInited = true;

    let state = { current: "0", previous: null, operator: null, overwrite: true };

    const render = () => (display.textContent = state.current);

    const fmt = (n) => {
      if (!isFinite(n)) return "Помилка";
      return parseFloat(n.toFixed(10)).toString();
    };

    function inputDigit(d) {
      if (state.overwrite) {
        state.current = d === "." ? "0." : d;
        state.overwrite = false;
        return;
      }
      if (d === "." && state.current.includes(".")) return;
      state.current = state.current === "0" && d !== "." ? d : state.current + d;
    }

    function setOperator(op) {
      if (state.operator && !state.overwrite) compute();
      state.previous = state.current;
      state.operator = op;
      state.overwrite = true;
    }

    function compute() {
      const a = parseFloat(state.previous);
      const b = parseFloat(state.current);
      if (isNaN(a) || isNaN(b) || !state.operator) return;
      let r;
      switch (state.operator) {
        case "+": r = a + b; break;
        case "-": r = a - b; break;
        case "*": r = a * b; break;
        case "/": r = b === 0 ? NaN : a / b; break;
        default: return;
      }
      state.current = fmt(r);
      state.operator = null;
      state.previous = null;
      state.overwrite = true;
    }

    function clearAll() {
      state = { current: "0", previous: null, operator: null, overwrite: true };
    }
    function backspace() {
      if (state.overwrite) return;
      state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";
      if (state.current === "" || state.current === "-") state.current = "0";
    }
    function percent() {
      const c = parseFloat(state.current);
      if (isNaN(c)) return;
      state.current = fmt(c / 100);
      state.overwrite = true;
    }

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.dataset.num !== undefined) inputDigit(btn.dataset.num);
      else if (btn.dataset.op) setOperator(btn.dataset.op);
      else if (btn.dataset.action === "equals") compute();
      else if (btn.dataset.action === "clear") clearAll();
      else if (btn.dataset.action === "back") backspace();
      else if (btn.dataset.action === "percent") percent();
      render();
    });

    display.addEventListener("click", () => display.focus());

    function handleKey(e) {
      const activeTab = document.querySelector(".ap-tab-active");
      if (!activeTab || activeTab.dataset.tab !== "calc") return;
      const container = document.getElementById("alliance-pro-container");
      if (!container) return;
      const ae = document.activeElement;
      if (!(ae === display || container.contains(ae))) return;
      if (ae && ae !== display && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return;

      const k = e.key;
      if (k >= "0" && k <= "9") inputDigit(k);
      else if (k === "." || k === ",") inputDigit(".");
      else if (k === "+" || k === "-" || k === "*" || k === "/") setOperator(k);
      else if (k === "Enter" || k === "=") compute();
      else if (k === "Backspace") backspace();
      else if (k === "Escape" || k === "c" || k === "C") clearAll();
      else if (k === "%") percent();
      else return;
      e.preventDefault();
      render();
    }
    document.addEventListener("keydown", handleKey);

    render();
  }

  function initTimer() {
    const display = document.getElementById("ap-timer-display");
    const minInput = document.getElementById("ap-timer-min");
    const secInput = document.getElementById("ap-timer-sec");
    const startBtn = document.getElementById("ap-timer-start");
    const pauseBtn = document.getElementById("ap-timer-pause");
    const resetBtn = document.getElementById("ap-timer-reset");
    const alarmStopBtn = document.getElementById("ap-alarm-stop");
    const quickBtns = document.querySelectorAll(".ap-quick-btn");
    const stepBtns = document.querySelectorAll(".ap-step-btn");
    if (!display || !startBtn || timerInited) return;
    timerInited = true;

    let remaining = 0;
    let intervalId = null;
    let running = false;
    let alarmIntervalId = null;

    const fmtTime = (t) => {
      const m = Math.floor(t / 60).toString().padStart(2, "0");
      const s = Math.floor(t % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };
    const render = () => (display.textContent = fmtTime(remaining));

    const inputSeconds = () => {
      const m = parseInt(minInput.value, 10) || 0;
      const s = parseInt(secInput.value, 10) || 0;
      return Math.max(0, m * 60 + s);
    };

    const setFromTotal = (total) => {
      total = Math.max(0, Math.min(MAX_TOTAL_SECONDS, total));
      minInput.value = Math.floor(total / 60);
      secInput.value = total % 60;
    };

    const save = (state) => AP.storage.setTimerState(state);

    function setButtons(isRunning) {
      startBtn.disabled = isRunning;
      pauseBtn.disabled = !isRunning;
      stepBtns.forEach((b) => (b.disabled = isRunning));
      minInput.disabled = isRunning;
      secInput.disabled = isRunning;
    }

    quickBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (running) return;
        minInput.value = parseInt(btn.dataset.min, 10) || 0;
        secInput.value = 0;
        remaining = inputSeconds();
        render();
        save({ status: "idle", endTime: null, remaining: 0, minutesInput: parseInt(minInput.value, 10) || 0, secondsInput: 0 });
      });
    });

    stepBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (running) return;
        const delta = parseInt(btn.dataset.step, 10) || 0;
        setFromTotal(inputSeconds() + delta);
        remaining = inputSeconds();
        render();
        save({ status: "idle", endTime: null, remaining: 0, minutesInput: parseInt(minInput.value, 10) || 0, secondsInput: parseInt(secInput.value, 10) || 0 });
      });
    });

    function startAlarm() {
      const id = AP.storage.getSettings().timerSound || "classic";
      let count = 0;
      playSound(id);
      alarmIntervalId = setInterval(() => {
        count++;
        playSound(id);
        if (count >= 8) stopAlarm();
      }, 500);
      display.classList.add("ap-alarm");
      if (alarmStopBtn) alarmStopBtn.style.display = "inline-flex";
    }

    function stopAlarm() {
      if (alarmIntervalId) clearInterval(alarmIntervalId);
      alarmIntervalId = null;
      display.classList.remove("ap-alarm");
      if (alarmStopBtn) alarmStopBtn.style.display = "none";
    }

    AP._timerAlarm = { start: startAlarm, stop: stopAlarm };

    function tick() {
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        running = false;
        setButtons(false);
        startAlarm();
        save({ status: "idle", endTime: null, remaining: 0 });
        return;
      }
      remaining -= 1;
      render();
    }

    function startTicking() {
      running = true;
      setButtons(true);
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(tick, 1000);
    }

    startBtn.addEventListener("click", () => {
      ensureAudio();
      stopAlarm();
      if (remaining <= 0) remaining = inputSeconds();
      if (remaining <= 0) return;
      const endTime = Date.now() + remaining * 1000;
      render();
      startTicking();
      save({ status: "running", endTime, remaining: 0 });
    });

    pauseBtn.addEventListener("click", () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      running = false;
      setButtons(false);
      save({ status: "paused", endTime: null, remaining });
    });

    resetBtn.addEventListener("click", () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      running = false;
      stopAlarm();
      remaining = inputSeconds();
      render();
      setButtons(false);
      save({ status: "idle", endTime: null, remaining: 0 });
    });

    if (alarmStopBtn) alarmStopBtn.addEventListener("click", stopAlarm);

    [minInput, secInput].forEach((inp) => {
      inp.addEventListener("change", () => {
        if (running) return;
        setFromTotal(inputSeconds());
        remaining = inputSeconds();
        render();
        save({ status: "idle", endTime: null, remaining: 0, minutesInput: parseInt(minInput.value, 10) || 0, secondsInput: parseInt(secInput.value, 10) || 0 });
      });
    });

    (function restore() {
      const saved = AP.storage.getTimerState();
      if (saved && typeof saved.minutesInput === "number") minInput.value = saved.minutesInput;
      if (saved && typeof saved.secondsInput === "number") secInput.value = saved.secondsInput;

      if (saved && saved.status === "running" && saved.endTime) {
        const rem = Math.max(0, Math.round((saved.endTime - Date.now()) / 1000));
        if (rem > 0) {
          remaining = rem;
          render();
          startTicking();
        } else {
          remaining = 0;
          render();
          setButtons(false);
          save({ status: "idle", endTime: null, remaining: 0 });
        }
      } else if (saved && saved.status === "paused") {
        remaining = saved.remaining || 0;
        render();
        setButtons(false);
      } else {
        remaining = inputSeconds();
        render();
      }
    })();
  }

  function initReminder() {
    const timeInput = document.getElementById("ap-rem-time");
    const toggle = document.getElementById("ap-rem-toggle");
    const status = document.getElementById("ap-rem-status");
    if (!timeInput || !toggle || reminderInited) return;
    reminderInited = true;

    function refresh() {
      const r = AP.storage.getReminder();
      if (r && r.active) {
        timeInput.value = r.time;
        toggle.textContent = "Скасувати";
        if (!status.textContent || status.textContent.indexOf("Будильник о") === 0) {
          status.textContent = "Будильник о " + r.time;
        }
        status.classList.add("ap-on");
      } else {
        toggle.textContent = "Поставити";
        if (status.textContent.indexOf("Будильник о") === 0) status.textContent = "";
      }
    }

    // Кнопки +час лише НАКОПИЧУЮТЬ час у полі (база — поточний час або вже
    // вибране значення). Будильник запускається лише кнопкою "Поставити".
    function addMinutes(min) {
      let base;
      const v = timeInput.value;
      if (/^\d{1,2}:\d{2}$/.test(v)) {
        const parts = v.split(":");
        base = new Date();
        base.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
      } else {
        base = new Date();
        base.setSeconds(0, 0);
      }
      const d = new Date(base.getTime() + min * 60000);
      timeInput.value = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }

    document.querySelectorAll(".ap-alarm-add").forEach((b) => {
      b.addEventListener("click", () => addMinutes(parseInt(b.dataset.min, 10) || 0));
    });

    function fire(r) {
      AP.storage.setReminder(null);
      status.textContent = "Будильник! (" + r.time + ")";
      status.classList.add("ap-on");
      refresh();
      ensureAudio();
      if (AP._timerAlarm) AP._timerAlarm.start();
      else playSound(AP.storage.getSettings().timerSound || "classic");
    }

    function check() {
      const r = AP.storage.getReminder();
      if (!r || !r.active) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      if (r.time === hh + ":" + mm) fire(r);
    }

    toggle.addEventListener("click", () => {
      const r = AP.storage.getReminder();
      if (r && r.active) {
        AP.storage.setReminder(null);
        status.textContent = "";
        status.classList.remove("ap-on");
        refresh();
        return;
      }
      const t = timeInput.value;
      if (!t) {
        AP.ui && AP.ui.alert({ title: "Вкажіть час", text: "Оберіть час для нагадування." });
        return;
      }
      ensureAudio();
      AP.storage.setReminder({ time: t, active: true });
      refresh();
    });

    setInterval(check, 10000);
    check();
    refresh();
  }

  AP.calculator = { init, playSound, SOUNDS };
})();
