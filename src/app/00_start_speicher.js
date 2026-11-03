
// ============================================================
// App-Schicht: Ansichten, Speicherung, Statistik, Interaktion.
// ============================================================
(function () {
  "use strict";
  const ML = window.MathLogic;
  const STATS_KEY = "mathe-uebungstool-stats";

  // ---------- Speicher-Abstraktion: window.storage -> localStorage -> Session ----------
  let storageMode = null; // "window" | "local" | "memory"
  let statsCache = {};

  async function initStorage() {
    if (typeof window.storage !== "undefined" && window.storage && typeof window.storage.get === "function") {
      try {
        const res = await window.storage.get(STATS_KEY, false);
        storageMode = "window";
        statsCache = (res && res.value) ? JSON.parse(res.value) : {};
        return;
      } catch (e) {
        storageMode = "window";
        statsCache = {};
        return;
      }
    }
    try {
      const testKey = "__mathe_uebungstool_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      storageMode = "local";
      const raw = localStorage.getItem(STATS_KEY);
      statsCache = raw ? JSON.parse(raw) : {};
      return;
    } catch (e) {
      storageMode = "memory";
      statsCache = {};
    }
  }

  async function persistStats() {
    if (storageMode === "window") {
      try {
        await window.storage.set(STATS_KEY, JSON.stringify(statsCache), false);
        return;
      } catch (e) {
        storageMode = "local";
      }
    }
    if (storageMode === "local") {
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(statsCache));
        return;
      } catch (e) {
        storageMode = "memory";
      }
    }
  }

  function statKey(topicKey, levelId) { return `${topicKey}-${levelId}`; }
  function getStat(topicKey, levelId) {
    const k = statKey(topicKey, levelId);
    return statsCache[k] || { attempts: 0, correct: 0 };
  }
  // punkte: 1 = ohne Hilfe richtig, 0.5 = mit Tipp richtig, 0 = falsch / Rechenweg gebraucht
  function recordAttempt(topicKey, levelId, wasCorrect, punkte) {
    const k = statKey(topicKey, levelId);
    const s = statsCache[k] || { attempts: 0, correct: 0 };
    s.attempts += 1;
    if (wasCorrect) s.correct += 1;
    s.recent = (s.recent || []).concat([punkte === undefined ? (wasCorrect ? 1 : 0) : punkte]).slice(-10);
    statsCache[k] = s;
    persistStats();
  }
  // ---------- Zeitmessung in Serien (5 oder 10 Aufgaben am Stück) ----------
  // Gespeichert unter "__zeiten": { "<thema>-<stufe>": [{ g: 5|10, ms, p: Punkte, d: "JJJJ-MM-TT" }, …] }
  // und die gewählte Seriengröße unter "__serie": { g: 5|10 }.
  const ZEIT_KEY = "__zeiten", SERIE_KEY = "__serie", MAX_SERIEN = 200;
  function serieGroesse() { const s = statsCache[SERIE_KEY]; return s && s.g === 10 ? 10 : 5; }
  function setzeSerieGroesse(g) { statsCache[SERIE_KEY] = { g: g === 10 ? 10 : 5 }; persistStats(); }
  function speichereSerie(topicKey, levelId, g, ms, punkte) {
    const z = statsCache[ZEIT_KEY] || (statsCache[ZEIT_KEY] = {}), k = statKey(topicKey, levelId);
    z[k] = (z[k] || []).concat([{ g, ms: Math.max(0, Math.round(ms)), p: punkte, d: new Date().toISOString().slice(0, 10) }]).slice(-MAX_SERIEN);
    persistStats();
  }
  // Rangfolge: mehr Punkte zuerst, bei Gleichstand die kürzere Zeit
  const serienRang = (a, b) => b.p - a.p || a.ms - b.ms;
  function serienVon(topicKey, levelId, g) { return (((statsCache[ZEIT_KEY] || {})[statKey(topicKey, levelId)]) || []).filter((e) => e.g === g).slice().sort(serienRang); }
  function zeitText(ms) { const s = Math.round(ms / 1000), m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, "0")} min`; }
  const punkteText2 = (p) => String(p).replace(".", ",");

  // "Sitzt": mindestens 8 von 10 Punkten in den letzten 10 Aufgaben
  function stufeSitzt(s) {
    const r = s.recent || [];
    return r.length >= 10 && r.reduce((a, b) => a + b, 0) >= 8;
  }

