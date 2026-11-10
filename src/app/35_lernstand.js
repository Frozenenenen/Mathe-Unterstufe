  // ---------- Lernstand sichern und übertragen (ohne Server, alles lokal) ----------
  // Format: { app: "mathe-uebungstool", version: 1, erstellt: ISO-Datum, lernstand: <statsCache> }
  const LS_APP = "mathe-uebungstool", LS_VERSION = 1;
  function lernstandJSON() {
    return JSON.stringify({ app: LS_APP, version: LS_VERSION, erstellt: new Date().toISOString(), lernstand: statsCache });
  }
  function lernstandUeberblick(daten) {
    let stufen = 0, versuche = 0, arbeiten = 0;
    Object.keys(daten).forEach((k) => {
      if (k.startsWith("__klausur-")) arbeiten++;
      else if (!k.startsWith("__") && daten[k].attempts > 0) { stufen++; versuche += daten[k].attempts; }
    });
    return { stufen, versuche, arbeiten };
  }
  // Prüft eine geladene Sicherung streng – nur bekannte Einträge mit plausiblen Werten werden übernommen.
  function pruefeLernstand(text) {
    let obj;
    if (!text || text.length > 2000000) return { fehler: "Die Datei ist leer oder zu groß." };
    try { obj = JSON.parse(text); } catch (e) { return { fehler: "Das ist keine gültige Lernstand-Sicherung (kein lesbares Format)." }; }
    if (!obj || obj.app !== LS_APP || typeof obj.lernstand !== "object" || obj.lernstand === null || Array.isArray(obj.lernstand)) return { fehler: "Das ist keine Sicherung aus dem Mathe-Übungstool." };
    if (obj.version !== LS_VERSION) return { fehler: "Diese Sicherung stammt aus einer anderen Version des Tools und kann nicht geladen werden." };
    const ganz = (x, min, max) => Number.isInteger(x) && x >= min && x <= max, rein = {};
    for (const [k, v] of Object.entries(obj.lernstand)) {
      if (!v || typeof v !== "object") return { fehler: `Ungültiger Eintrag „${k}“.` };
      const m = /^([a-z_]+)-(\d+)$/.exec(k);
      if (m) {
        if (!ML.TOPICS[m[1]] || !ML.TOPICS[m[1]].levels.some((l) => l.id === +m[2])) continue; // Stufe gibt es (nicht mehr): überspringen
        if (!ganz(v.attempts, 0, 1e7) || !ganz(v.correct, 0, v.attempts)) return { fehler: `Ungültige Zahlen bei „${k}“.` };
        if (v.recent !== undefined && (!Array.isArray(v.recent) || v.recent.length > 10 || v.recent.some((p) => ![0, 0.5, 1].includes(p)))) return { fehler: `Ungültiger Verlauf bei „${k}“.` };
        rein[k] = { attempts: v.attempts, correct: v.correct }; if (v.recent) rein[k].recent = v.recent.slice();
      } else if (k === "__wiederholen") {
        const w = {};
        for (const [stufe, typen] of Object.entries(v)) {
          if (!/^[a-z_]+-\d+$/.test(stufe) || !typen || typeof typen !== "object") return { fehler: "Ungültige Wiederholungsliste." };
          for (const [typ, n] of Object.entries(typen)) { if (!ganz(n, 1, 3) || typ.length > 60) return { fehler: "Ungültige Wiederholungsliste." }; (w[stufe] = w[stufe] || {})[typ] = n; }
        }
        rein[k] = w;
      } else if (k.startsWith("__klausur-")) {
        if (!ML.TOPICS[k.slice(10)]) continue;
        if (!ganz(v.note, 1, 6) || typeof v.pct !== "number" || v.pct < 0 || v.pct > 100 || !/^\d{4}-\d{2}-\d{2}$/.test(String(v.datum))) return { fehler: `Ungültiges Klassenarbeits-Ergebnis „${k}“.` };
        rein[k] = { pct: v.pct, note: v.note, punkte: Number(v.punkte) || 0, gesamt: Number(v.gesamt) || 0, datum: v.datum };
      } else if (k === "__zeiten") {
        const z = {};
        for (const [stufe, liste] of Object.entries(v)) {
          const mm = /^([a-z_]+)-(\d+)$/.exec(stufe);
          if (!mm || !Array.isArray(liste) || liste.length > 200) return { fehler: "Ungültige Zeitmessungen." };
          if (!ML.TOPICS[mm[1]] || !ML.TOPICS[mm[1]].levels.some((l) => l.id === +mm[2])) continue;
          for (const e of liste) if (!e || (e.n !== undefined && (typeof e.n !== "string" || e.n.length > 30)) || ![5, 10].includes(e.g) || !ganz(e.ms, 0, 864e5) || typeof e.p !== "number" || e.p < 0 || e.p > e.g || (e.p * 2) % 1 || !/^\d{4}-\d{2}-\d{2}$/.test(String(e.d))) return { fehler: `Ungültige Zeitmessung bei „${stufe}“.` };
          z[stufe] = liste.map((e) => Object.assign({ g: e.g, ms: e.ms, p: e.p, d: e.d }, e.n ? { n: e.n } : {}));
        }
        rein[k] = z;
      } else if (k === "__spieler") {
        if (typeof v.name !== "string" || v.name.length > 30) return { fehler: "Ungültiger Name in der Sicherung." };
        rein[k] = { name: v.name };
      } else if (k === "__darstellung") {
        rein[k] = { art: ["balken", "beide"].includes(v.art) ? v.art : "torte" };
      } else if (k === "__serie") {
        rein[k] = { g: v.g === 10 ? 10 : 5 };
      }
      // unbekannte Einträge werden ignoriert
    }
    return { daten: rein, erstellt: typeof obj.erstellt === "string" ? obj.erstellt.slice(0, 10) : "?" };
  }
  const anzahl = (n, ein, mehr) => `${n} ${n === 1 ? ein : mehr}`;
  function datumDE(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ""); return m ? `${m[3]}.${m[2]}.${m[1]}` : iso; }
  function lernstandUebernehmen(text, meldung) {
    const r = pruefeLernstand(text);
    if (r.fehler) { meldung(r.fehler, true); return; }
    const neu = lernstandUeberblick(r.daten), alt = lernstandUeberblick(statsCache);
    const frage = `Lernstand vom ${datumDE(r.erstellt)} laden?\n\nDarin: ${anzahl(neu.versuche, "gelöste Aufgabe", "gelöste Aufgaben")} in ${anzahl(neu.stufen, "Stufe", "Stufen")}, ${anzahl(neu.arbeiten, "Klassenarbeits-Ergebnis", "Klassenarbeits-Ergebnisse")}.\n\n` +
      (alt.versuche || alt.arbeiten ? `Achtung: Dein jetziger Lernstand (${anzahl(alt.versuche, "Aufgabe", "Aufgaben")}, ${anzahl(alt.arbeiten, "Klassenarbeits-Ergebnis", "Klassenarbeits-Ergebnisse")}) wird dabei ersetzt.` : "Auf diesem Gerät ist noch kein Lernstand gespeichert.");
    if (!window.confirm(frage)) { meldung("Laden abgebrochen – nichts wurde verändert.", false); return; }
    statsCache = r.daten; persistStats();
    meldung(`Lernstand geladen: ${anzahl(neu.versuche, "Aufgabe", "Aufgaben")} in ${anzahl(neu.stufen, "Stufe", "Stufen")}.`, false);
    setTimeout(render, 900);
  }
  function lernstandKarte() {
    const karte = el("details", { class: "lernstand" }), status = el("div", { class: "ls-status" });
    const meldung = (t, fehler) => { status.textContent = t; status.className = "ls-status" + (fehler ? " ls-fehler" : " ls-ok"); };
    karte.appendChild(el("summary", {}, [document.createTextNode("💾 Lernstand sichern oder auf ein anderes Gerät übertragen")]));
    karte.appendChild(text("p", "ls-text", "Dein Fortschritt wird nur in diesem Browser gespeichert. Sichere ihn als Datei oder Text und lade ihn auf einem anderen Gerät wieder – ohne Konto, nichts wird ins Internet geschickt."));
    const ue = lernstandUeberblick(statsCache);
    karte.appendChild(text("p", "ls-text", `Aktuell gespeichert: ${anzahl(ue.versuche, "gelöste Aufgabe", "gelöste Aufgaben")} in ${anzahl(ue.stufen, "Stufe", "Stufen")}, ${anzahl(ue.arbeiten, "Klassenarbeits-Ergebnis", "Klassenarbeits-Ergebnisse")}.`));
    const knopf = (t, f, cls) => el("button", { class: "btn small " + (cls || "ghost"), type: "button", onclick: f }, [document.createTextNode(t)]);
    const datei = el("input", { type: "file", accept: ".json,application/json,text/plain", style: "display:none" });
    datei.addEventListener("change", () => { const f = datei.files && datei.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { lernstandUebernehmen(String(rd.result), meldung); datei.value = ""; }; rd.onerror = () => meldung("Die Datei konnte nicht gelesen werden.", true); rd.readAsText(f); });
    const feld = el("textarea", { class: "ls-feld", placeholder: "Gesicherten Text hier einfügen …", rows: "4", style: "display:none" });
    const laden = knopf("Eingefügten Text laden", () => lernstandUebernehmen(feld.value.trim(), meldung)); laden.style.display = "none";
    karte.appendChild(el("div", { class: "ls-knoepfe" }, [
      knopf("Als Datei sichern", () => {
        try { const url = URL.createObjectURL(new Blob([lernstandJSON()], { type: "application/json" })), a = el("a", { href: url, download: `mathe-lernstand-${new Date().toISOString().slice(0, 10)}.json` });
          document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); meldung("Datei erstellt – sie liegt in deinen Downloads.", false);
        } catch (e) { meldung("Speichern als Datei ist hier nicht möglich – nutze „Als Text kopieren“.", true); }
      }, "primary"),
      knopf("Als Text kopieren", () => {
        const t = lernstandJSON();
        const fallback = () => { feld.style.display = ""; feld.value = t; feld.select(); laden.style.display = "none"; meldung("Text unten markiert – kopiere ihn und bewahre ihn auf (z. B. in einer Notiz).", false); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => meldung("In die Zwischenablage kopiert – füge den Text z. B. in eine Notiz ein.", false), fallback); else fallback();
      }),
      knopf("Aus Datei laden", () => datei.click()),
      knopf("Aus Text laden", () => { feld.style.display = ""; feld.value = ""; laden.style.display = ""; feld.focus(); meldung("", false); })
    ]));
    karte.appendChild(datei); karte.appendChild(feld); karte.appendChild(laden); karte.appendChild(status);
    return karte;
  }

