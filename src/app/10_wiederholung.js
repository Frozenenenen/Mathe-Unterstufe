  // ---------- Wiederholung falsch gelöster Aufgabentypen ----------
  const REVIEW_KEY = "__wiederholen";
  function reviewMap() { return statsCache[REVIEW_KEY] || (statsCache[REVIEW_KEY] = {}); }
  function typVon(task) { return task && task.subtype ? String(task.subtype) : null; }
  function merkeWiederholung(topicKey, levelId, task) {
    const typ = typVon(task); if (!typ) return;
    const m = reviewMap(), k = statKey(topicKey, levelId);
    m[k] = m[k] || {};
    m[k][typ] = Math.min(3, (m[k][typ] || 0) + 1); // höchstens 3 Wiederholungen offen
    persistStats();
  }
  function wiederholungGeschafft(topicKey, levelId, task) {
    const typ = typVon(task); if (!typ) return;
    const m = reviewMap(), k = statKey(topicKey, levelId);
    if (!m[k] || !m[k][typ]) return;
    m[k][typ] -= 1;
    if (m[k][typ] <= 0) delete m[k][typ];
    if (!Object.keys(m[k]).length) delete m[k];
    persistStats();
  }
  function anzahlWiederholung(topicKey, levelId) {
    const e = reviewMap()[statKey(topicKey, levelId)];
    return e ? Object.keys(e).length : 0;
  }
  // Neue Aufgabe: in jeder 2. Aufgabe wird (falls vorgemerkt) gezielt ein
  // zuletzt nicht geschaffter Aufgabentyp ausgewählt.
  function erzeugeAufgabe(topicKey, level) {
    const e = reviewMap()[statKey(topicKey, level.id)];
    if (e && Object.keys(e).length && Math.random() < 0.5) {
      const gesucht = new Set(Object.keys(e));
      for (let i = 0; i < 80; i++) {
        const t = level.generate();
        if (gesucht.has(typVon(t))) { t._wiederholung = true; return t; }
      }
    }
    return level.generate();
  }

