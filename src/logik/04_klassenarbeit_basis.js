  // ============================================================
  // KLASSENARBEITEN nach dem Vorbild echter Arbeiten (Recherche):
  //  - wenige Aufgaben mit Teilaufgaben a), b), c) zu einem Kontext
  //  - Teil A ohne, Teil B mit Taschenrechner
  //  - alle Anforderungsbereiche, AFB III (Begründen, Fehler finden) Pflicht
  //  - Zeichnen/Begründen als Papier-Teil mit Erwartungshorizont + Musterlösung
  // ============================================================
  const mische = (arr) => arr.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  function bruchTex(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1; n /= g; d /= g;
    if (d === 1) return `${n}`;
    return n < 0 ? `-\\dfrac{${-n}}{${d}}` : `\\dfrac{${n}}{${d}}`;
  }
  const bruchTxt = (n, d) => { const g = gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return d === 1 ? `${n}` : `${n}/${d}`; };
  function geradeTex(name, mn, md, b, v) {
    v = v || "x";
    const g = gcd(mn, md) || 1; let n = mn / g, d = md / g; if (d < 0) { n = -n; d = -d; }
    let mt = d === 1 ? (n === 1 ? "" : n === -1 ? "-" : `${n}`) : (n < 0 ? `-\\dfrac{${-n}}{${d}}` : `\\dfrac{${n}}{${d}}`);
    const bt = b === 0 ? "" : b > 0 ? ` + ${fmtNum(b)}` : ` - ${fmtNum(-b)}`;
    return `${name} = ${mt}${v}${bt}`;
  }
  // Ausschnitt für eine Gerade: enthält 0, y-Achsenabschnitt und Nullstelle
  function fensterGerade(m, b, extraX) {
    const xs = [0, 4].concat(m !== 0 ? [-b / m] : []).concat(extraX || []);
    const xmin = Math.max(-8, Math.floor(Math.min(...xs)) - 1), xmax = Math.min(10, Math.ceil(Math.max(...xs)) + 1);
    const ys = [b, m * xmin + b, m * xmax + b, 0];
    const ymin = Math.max(-10, Math.floor(Math.min(...ys)) - 1), ymax = Math.min(10, Math.ceil(Math.max(...ys)) + 1);
    return { xmin, xmax, ymin, ymax, width: 300, height: 240, padLeft: 26, padBottom: 22, ticks: true };
  }
  const svgGraph = (fns, cfg) => renderGraphSVG(fns, cfg);

  // ---------- Bausteine für Teilaufgaben ----------
  // auto-Teil: Felder werden vom Tool geprüft
  function autoTeil(text, felder, loesung, extra) {
    const t = textTask("klassenarbeit", 0, "", "", "", felder, loesung);
    return Object.assign({ art: "auto", text, task: t, punkte: felder.map((f) => f.punkte || 1), pruefe: (inp) => check_textaufgabe(t, inp), loesung }, extra || {});
  }
  // Teil aus einer bestehenden, getesteten Übungsstufe
  function stufenTeil(topicKey, levelId, filter, textVorweg) {
    const level = TOPICS[topicKey].levels.find((l) => l.id === levelId);
    let task; for (let i = 0; i < 200; i++) { task = level.generate(); if (!filter || filter(task)) break; }
    const text = (textVorweg || "") + (task.prompt || "") + (task.question ? `\\;\\;${task.question}` : "");
    return { art: "auto", text, task, level, punkte: task.answer.map(() => 1), pruefe: (inp) => level.check(task, inp), loesung: level.steps(task) };
  }
  // Papier-Teil: auf Papier lösen, danach selbst anhand des Erwartungshorizonts bewerten
  function papierTeil(text, erwartung, loesung, loesungsGraph) {
    return { art: "papier", text, erwartung, punkte: [erwartung.reduce((s, e) => s + e.punkte, 0)], loesung, loesungsGraph };
  }
  // Aussage prüfen (AFB III): wahr/falsch + passende Begründung auswählen
  function aussageTeil(aussage, wahr, gruende, erklaerung) {
    return autoTeil(aussage, [
      { label: "Stimmt die Aussage?", kind: "choice", choices: ["wahr", "falsch"], answer: wahr ? "wahr" : "falsch" },
      { label: "Begründung", kind: "choice", choices: mische(gruende), answer: gruende[0] }
    ], [{ label: wahr ? "Die Aussage ist wahr." : "Die Aussage ist falsch." }, { left: T(gruende[0]), right: "" }].concat(erklaerung || []));
  }
  // Fehler im Lösungsweg finden (AFB III): Fehler benennen + richtig rechnen
  function fehlerTeil(text, gruende, richtigFeld, loesung) {
    return autoTeil(text, [
      { label: "Welcher Fehler wurde gemacht?", kind: "choice", choices: mische(gruende), answer: gruende[0] },
      richtigFeld
    ], [{ label: "Fehler" }, { left: T(gruende[0]), right: "" }].concat(loesung));
  }

  const KA_VORLAGEN = {};
  const KA_INFO = {};
  // Notenschlüssel (Recherche: "ausreichend" ab etwa 50 %, eher streng gewählt)
  const KA_NOTEN = [[90, 1], [77, 2], [63, 3], [50, 4], [25, 5], [0, 6]];

  // Stellt eine Klassenarbeit zusammen: 45 min -> 4 Aufgaben, 90 min -> 6 Aufgaben;
  // mindestens eine AFB-III-Aufgabe, Teil A (ohne TR) vor Teil B (mit TR).
  // Manche Themen werden in echten Arbeiten getrennt geprüft (z. B. Trigonometrie:
  // rechtwinklige vs. allgemeine Dreiecke). KA_TEILGEBIETE[thema] = [[schluessel, Name], ...]
  const KA_TEILGEBIETE = {};
  function erzeugeKlassenarbeit(topicKey, minuten, teilgebiet) {
    const gebiete = KA_TEILGEBIETE[topicKey];
    if (gebiete && !gebiete.some(([k]) => k === teilgebiet)) teilgebiet = gebiete[0][0];
    const vorl = KA_VORLAGEN[topicKey].filter((v) => !gebiete || v.gebiet === teilgebiet), info = Object.assign({}, KA_INFO[topicKey], (KA_INFO[topicKey].gebiete || {})[teilgebiet] || {});
    const anzahl = minuten >= 90 ? 6 : 4;
    const afb3 = mische(vorl.filter((v) => v.afb === 3))[0];
    let rest = mische(vorl.filter((v) => v !== afb3)), wahl = [afb3];
    if (info.tr) {
      const nB = Math.floor(anzahl / 2);
      const B = rest.filter((v) => v.teil === "B").slice(0, nB - (afb3.teil === "B" ? 1 : 0));
      const A = rest.filter((v) => v.teil === "A").slice(0, anzahl - 1 - B.length);
      wahl = wahl.concat(A, B);
    } else wahl = wahl.concat(rest.slice(0, anzahl - 1));
    // Teil A zuerst, innerhalb nach Anforderungsbereich (leicht -> schwer)
    wahl.sort((a, b) => (a.teil === b.teil ? a.afb - b.afb : a.teil < b.teil ? -1 : 1));
    const aufgaben = wahl.map((v) => {
      const a = v.baue();
      a.teile.forEach((t, i) => { t.label = String.fromCharCode(97 + i) + ")"; });
      return Object.assign(a, { key: v.key, titel: v.titel, teil: v.teil, afb: v.afb });
    });
    return { topicKey, minuten, teilgebiet: teilgebiet || null, klasse: info.klasse, mitTR: info.tr, aufgaben, gesamt: aufgaben.reduce((s, a) => s + a.teile.reduce((t, x) => t + x.punkte.reduce((u, p) => u + p, 0), 0), 0) };
  }
  const noteKA = (pct) => KA_NOTEN.find(([g]) => pct >= g)[1];

