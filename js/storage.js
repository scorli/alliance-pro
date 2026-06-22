(function () {
  "use strict";

  const AP = (window.AlliancePro = window.AlliancePro || {});

  const SETTINGS_KEY = "alliancepro_settings";
  const CHATDATA_PREFIX = "alliancepro_chatData_";
  const CHECKBOX_CONFIG_KEY = "alliancepro_checkboxConfig";
  const PROFILES_KEY = "alliancepro_checkboxProfiles";
  const TIMER_STATE_KEY = "alliancepro_timerState";
  const REMINDER_KEY = "alliancepro_reminder";

  const DEFAULT_CHECKBOX_CONFIG = [
    { id: "ap-cb-1", label: "Привітання", variative: false, options: [] },
    { id: "ap-cb-2", label: "Інформування", variative: false, options: [] },
    { id: "ap-cb-3", label: "Мотиватор Суд", variative: false, options: [] },
    { id: "ap-cb-4", label: "Мотиватор Виконавча", variative: false, options: [] },
    { id: "ap-cb-5", label: "Додатковий номер", variative: false, options: [] },
    { id: "ap-cb-6", label: "Підсумок", variative: false, options: [] }
  ];

  function getSettings() {
    const defaults = {
      theme: "light",
      accent: null,
      uiScale: 1,
      timerSound: "classic",
      resetAfterCopy: false,
      windowPosition: null,
      hidden: false,
      collapsed: false,
      compact: false,
      activeTab: "checklist"
    };
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    } catch (e) {
      saved = {};
    }
    return Object.assign({}, defaults, saved);
  }

  function setSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
  }

  function patchSettings(patch) {
    const s = getSettings();
    Object.assign(s, patch);
    setSettings(s);
    return s;
  }

  function blankChatData() {
    return { cid: null, checks: {}, opts: {}, comment: "", notes: "" };
  }

  function getChatData(chatId) {
    if (!chatId) return blankChatData();
    let data = null;
    try {
      data = JSON.parse(localStorage.getItem(CHATDATA_PREFIX + chatId));
    } catch (e) {
      data = null;
    }
    return Object.assign(blankChatData(), data || {});
  }

  function setChatData(chatId, data) {
    if (!chatId) return;
    try {
      localStorage.setItem(CHATDATA_PREFIX + chatId, JSON.stringify(data));
    } catch (e) {}
  }

  function clearChatData(chatId) {
    if (!chatId) return;
    localStorage.removeItem(CHATDATA_PREFIX + chatId);
  }

  function clearAllChatData() {
    Object.keys(localStorage).forEach((key) => {
      if (key.indexOf(CHATDATA_PREFIX) === 0) localStorage.removeItem(key);
    });
  }

  function optionLabel(o) {
    if (o == null) return "";
    if (typeof o === "string") return o;
    if (typeof o === "object") return String(o.label != null ? o.label : "");
    return String(o);
  }

  function normalizeCheckbox(c, i) {
    const raw = c.options || c.radioLabels || [];
    const options = raw.map(optionLabel);
    const variative = c.variative != null ? !!c.variative : options.length > 0;
    return {
      id: c.id || "ap-cb-" + (Date.now() + i),
      label: String(c.label || c.name || "Чекбокс " + (i + 1)),
      variative,
      options: variative ? options : []
    };
  }

  function getDefaultCheckboxConfig() {
    return JSON.parse(JSON.stringify(DEFAULT_CHECKBOX_CONFIG));
  }

  function saveProfiles(p) {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function loadProfiles() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(PROFILES_KEY)); } catch (e) {}
    if (p && Array.isArray(p.list) && p.list.length) {
      if (!p.list.some((x) => x.id === p.activeId)) p.activeId = p.list[0].id;
      return p;
    }
    let legacy = null;
    try { legacy = JSON.parse(localStorage.getItem(CHECKBOX_CONFIG_KEY)); } catch (e) {}
    const base = Array.isArray(legacy) && legacy.length ? legacy.map(normalizeCheckbox) : getDefaultCheckboxConfig();
    const fresh = { list: [{ id: "prof-1", name: "Основний", config: base }], activeId: "prof-1" };
    saveProfiles(fresh);
    return fresh;
  }

  function getProfiles() {
    const p = loadProfiles();
    return { list: p.list.map((x) => ({ id: x.id, name: x.name })), activeId: p.activeId };
  }

  function activeProfile() {
    const p = loadProfiles();
    return p.list.find((x) => x.id === p.activeId) || p.list[0];
  }

  function setActiveProfile(id) {
    const p = loadProfiles();
    if (p.list.some((x) => x.id === id)) { p.activeId = id; saveProfiles(p); }
  }

  function addProfile(name) {
    const p = loadProfiles();
    const id = "prof-" + Date.now();
    p.list.push({ id, name: name || "Профіль " + (p.list.length + 1), config: getDefaultCheckboxConfig() });
    p.activeId = id;
    saveProfiles(p);
    return id;
  }

  function renameProfile(id, name) {
    const p = loadProfiles();
    const pr = p.list.find((x) => x.id === id);
    if (pr) { pr.name = name || pr.name; saveProfiles(p); }
  }

  function deleteProfile(id) {
    const p = loadProfiles();
    if (p.list.length <= 1) return false;
    p.list = p.list.filter((x) => x.id !== id);
    if (p.activeId === id) p.activeId = p.list[0].id;
    saveProfiles(p);
    return true;
  }

  function getCheckboxConfig() {
    return (activeProfile().config || []).map(normalizeCheckbox);
  }

  function setCheckboxConfig(config) {
    const p = loadProfiles();
    const pr = p.list.find((x) => x.id === p.activeId) || p.list[0];
    pr.config = config;
    saveProfiles(p);
  }

  function getTimerState() {
    try {
      return JSON.parse(localStorage.getItem(TIMER_STATE_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function setTimerState(state) {
    try {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function getReminder() {
    try {
      return JSON.parse(localStorage.getItem(REMINDER_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function setReminder(r) {
    try {
      if (r) localStorage.setItem(REMINDER_KEY, JSON.stringify(r));
      else localStorage.removeItem(REMINDER_KEY);
    } catch (e) {}
  }

  function exportAll() {
    return {
      app: "Alliance Pro",
      type: "settings-bundle",
      version: "2.8",
      timestamp: new Date().toISOString(),
      settings: getSettings(),
      checkboxConfig: getCheckboxConfig(),
      profiles: loadProfiles()
    };
  }

  function importAll(bundle) {
    if (!bundle || typeof bundle !== "object") return false;
    if (bundle.settings && typeof bundle.settings === "object") {
      const s = Object.assign({}, bundle.settings);
      delete s.windowPosition;
      patchSettings(s);
    }
    if (bundle.profiles && Array.isArray(bundle.profiles.list) && bundle.profiles.list.length) {
      const norm = {
        list: bundle.profiles.list.map((pr, i) => ({
          id: pr.id || "prof-" + (Date.now() + i),
          name: String(pr.name || "Профіль " + (i + 1)),
          config: (pr.config || []).map(normalizeCheckbox)
        })),
        activeId: bundle.profiles.activeId
      };
      if (!norm.list.some((x) => x.id === norm.activeId)) norm.activeId = norm.list[0].id;
      saveProfiles(norm);
    } else if (Array.isArray(bundle.checkboxConfig) && bundle.checkboxConfig.length) {
      setCheckboxConfig(bundle.checkboxConfig.map(normalizeCheckbox));
    }
    return true;
  }

  AP.storage = {
    getSettings,
    setSettings,
    patchSettings,
    getChatData,
    setChatData,
    clearChatData,
    clearAllChatData,
    getCheckboxConfig,
    setCheckboxConfig,
    getDefaultCheckboxConfig,
    normalizeCheckbox,
    getProfiles,
    setActiveProfile,
    addProfile,
    renameProfile,
    deleteProfile,
    getTimerState,
    setTimerState,
    getReminder,
    setReminder,
    exportAll,
    importAll
  };
})();
