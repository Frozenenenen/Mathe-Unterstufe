  // ============================================================
  // KLASSENARBEITS-MODUS (nach dem Vorbild echter Arbeiten):
  // Teil A ohne / Teil B mit Taschenrechner, Aufgaben mit Teilaufgaben,
  // AFB III, Papier-Teile mit Selbstbewertung. Auswertung zeigt ALLE
  // Musterlösungen inkl. Musterzeichnungen.
  // ============================================================
  let examTimer = null;
  const klausurKey = (topicKey) => "__klausur-" + topicKey;
  const punkteText = (p) => `${String(p).replace(".", ",")} ${p === 1 ? "Punkt" : "Punkte"}`;
  const punkteVon = (p) => `${String(p).replace(".", ",")} ${p === 1 ? "Punkt" : "Punkten"}`; // "von 27 Punkten"
  const summe = (arr) => arr.reduce((a, b) => a + b, 0);

  function formatAntwort(task, i) {
    const a = task.answer[i];
    if (task.fieldType === "select") { const o = task.fieldOptions.find((x) => x.value === a); return o ? o.text : a; }
    if (a && typeof a === "object" && "num" in a) return a.den === 1 ? String(a.num) : `${a.num}/${a.den}`;
    // ausgeschrieben statt Exponentialschreibweise (0,00000096 statt 9.6e-7)
    const txt = typeof a === "number" && /e/i.test(String(a)) ? a.toFixed(20).replace(/0+$/, "").replace(/\.$/, "") : String(a);
    return txt.replace(".", ",");
  }
  function loesungsBox(teil, titel) {
    const box = el("div", { class: "steps-box" });
    box.appendChild(text("div", "steps-title", titel || "Musterlösung"));
    teil.loesung.forEach((st) => {
      if (st.label === (titel || "Musterlösung")) return; // Titel nicht doppelt anzeigen
      if (st.label) { box.appendChild(text("div", "step-label", st.label)); return; }
      const row = el("div", { class: "step-row" });
      row.appendChild(el("div", { html: ML.mathToHtml(st.left) }));
      row.appendChild(el("div", { class: "step-right", html: st.right ? ML.mathToHtml(st.right) : "" }));
      box.appendChild(row);
    });
    if (teil.loesungsGraph) box.appendChild(el("div", { class: "ka-graph", html: teil.loesungsGraph }));
    return box;
  }

  function renderExamSetup() {
    const topic = ML.TOPICS[state.topicKey];
    const cfg = state.examCfg = state.examCfg && state.examCfg.topicKey === state.topicKey ? state.examCfg : { topicKey: state.topicKey, minuten: 45, zeitlimit: true };
    app.innerHTML = "";
    app.appendChild(el("header", { class: "topbar" }, [
      el("button", { class: "backbtn", onclick: () => { state.view = "levels"; render(); } }, [document.createTextNode("←")]),
      text("h1", "", "Klassenarbeit üben")
    ]));
    const card = el("div", { class: "card" });
    card.appendChild(text("div", "setup-title", topic.name));
    card.appendChild(text("div", "exam-small", "Aufbau wie eine echte Klassenarbeit: Aufgaben mit Teilaufgaben, " +
      (ML.erzeugeKlassenarbeit(state.topicKey, 45, cfg.gebiet).mitTR ? "Teil A ohne und Teil B mit Taschenrechner, " : "ohne Taschenrechner, ") +
      "auch Begründen und Fehler finden. ✏️-Teile löst du auf Papier und bewertest sie danach selbst anhand der Musterlösung. Die Auswertung zeigt alle Lösungen und Rechenwege."));
    const auswahl = (titel, werte, aktuell, setzen, fmt) => {
      card.appendChild(text("div", "setup-title", titel));
      const g = el("div", { class: "choice-btn-group" });
      werte.forEach((w) => {
        const b = el("button", { type: "button", class: "choice-btn" + (w === aktuell() ? " selected" : ""), onclick: () => {
          setzen(w); [...g.children].forEach((c) => c.classList.remove("selected")); b.classList.add("selected");
        } }, [document.createTextNode(fmt(w))]);
        g.appendChild(b);
      });
      card.appendChild(g);
    };
    const gebiete = ML.KA_TEILGEBIETE[state.topicKey];
    if (gebiete) {
      if (!gebiete.some(([k]) => k === cfg.gebiet)) cfg.gebiet = gebiete[0][0];
      // neu zeichnen: Taschenrechner-Hinweis und Klassenstufe hängen vom Teilgebiet ab
      auswahl("Thema der Arbeit", gebiete.map(([k]) => k), () => cfg.gebiet, (w) => { cfg.gebiet = w; render(); }, (w) => gebiete.find(([k]) => k === w)[1]);
    }
    auswahl("Dauer", [45, 90], () => cfg.minuten, (w) => { cfg.minuten = w; }, (w) => `${w} min (${w === 45 ? "4" : "6"} Aufgaben)`);
    auswahl("Zeitlimit", [true, false], () => cfg.zeitlimit, (w) => { cfg.zeitlimit = w; }, (w) => (w ? "mit Zeitlimit" : "ohne Zeitlimit"));
    card.appendChild(el("div", { class: "btn-row" }, [
      el("button", { class: "btn", onclick: () => {
        state.exam = { ka: ML.erzeugeKlassenarbeit(state.topicKey, cfg.minuten, cfg.gebiet), start: Date.now(), ende: cfg.zeitlimit ? Date.now() + cfg.minuten * 60000 : null, abgegeben: false };
        state.view = "exam"; render();
      } }, [document.createTextNode("Klassenarbeit starten")]),
      el("button", { class: "btn secondary", onclick: () => { state.printKA = ML.erzeugeKlassenarbeit(state.topicKey, cfg.minuten, cfg.gebiet); state.view = "print"; render(); } }, [document.createTextNode("Als Arbeitsblatt drucken")])
    ]));
    app.appendChild(card);
  }

  // Aufgabenkarte (für Bearbeitung und Druck)
  function aufgabenKarte(a, k, mitEingaben) {
    const pkt = summe(a.teile.map((t) => summe(t.punkte)));
    const card = el("div", { class: "card exam-card" });
    card.appendChild(text("div", "ka-head", `Aufgabe ${k + 1}: ${a.titel}`));
    card.appendChild(text("div", "task-meta", `${punkteText(pkt)} · Anforderungsbereich ${["I", "II", "III"][a.afb - 1]}`));
    if (a.kontext) card.appendChild(el("div", { class: "task-prompt text-task", html: ML.mathToHtml(a.kontext) }));
    if (a.graph) card.appendChild(el("div", { class: "ka-graph", html: a.graph }));
    a.teile.forEach((t, i) => {
      const box = el("div", { class: "ka-teil" + (t.art === "papier" ? " papier" : "") });
      box.appendChild(el("div", { class: "ka-teil-text" }, [el("strong", {}, [document.createTextNode(t.label + " ")]), el("span", { html: ML.mathToHtml(t.text) }),
        el("span", { class: "ka-pkt" }, [document.createTextNode(` (${String(summe(t.punkte)).replace(".", ",")} P.)`)])]));
      if (t.art === "papier") box.appendChild(text("div", "exam-small", "✏️ Auf Papier lösen – nach der Abgabe vergleichst du mit der Musterlösung."));
      else if (mitEingaben) {
        t.prefix = `ka${k}-${i}-f`;
        t.inputs = baueEingaben(t.task, t.level || {}, box, t.prefix, null);
      }
      t.box = box;
      card.appendChild(box);
    });
    return card;
  }

  function renderExam() {
    const topic = ML.TOPICS[state.topicKey], ex = state.exam, ka = ex.ka;
    app.innerHTML = "";
    app.appendChild(el("header", { class: "topbar" }, [
      el("button", { class: "backbtn", onclick: () => {
        if (ex.abgegeben || window.confirm("Klassenarbeit wirklich abbrechen? Die Eingaben gehen verloren.")) { state.view = "levels"; render(); }
      } }, [document.createTextNode("←")]),
      text("h1", "", `Klassenarbeit: ${topic.name}`)
    ]));
    const leiste = el("div", { class: "exam-bar" });
    const uhr = el("span", { class: "exam-clock" });
    const abgebenBtn = el("button", { class: "btn small", onclick: () => abgeben(false) }, [document.createTextNode("Abgeben")]);
    leiste.appendChild(uhr); leiste.appendChild(abgebenBtn);
    app.appendChild(leiste);
    const ergebnis = el("div", {});
    app.appendChild(ergebnis);
    app.appendChild(text("div", "exam-small", `${ka.klasse} · ${ka.minuten} Minuten · ${punkteText(ka.gesamt)}`));
    let letzterTeil = null;
    ka.aufgaben.forEach((a, k) => {
      if (ka.mitTR && a.teil !== letzterTeil) {
        app.appendChild(text("h2", "ka-teilkopf", a.teil === "A" ? "Teil A – ohne Taschenrechner" : "Teil B – mit Taschenrechner"));
        letzterTeil = a.teil;
      }
      a.card = aufgabenKarte(a, k, true);
      app.appendChild(a.card);
    });
    const unten = el("div", { class: "btn-row" }, [el("button", { class: "btn", onclick: () => abgeben(false) }, [document.createTextNode("Klassenarbeit abgeben")])]);
    app.appendChild(unten);

    const tick = () => {
      if (ex.abgegeben) return;
      if (!ex.ende) { uhr.textContent = "⏱ ohne Zeitlimit"; return; }
      const rest = Math.max(0, Math.round((ex.ende - Date.now()) / 1000));
      uhr.textContent = `⏱ noch ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, "0")} min`;
      uhr.classList.toggle("knapp", rest <= 300);
      if (rest <= 0) abgeben(true);
    };
    tick();
    examTimer = setInterval(tick, 1000);

    function abgeben(zeitAbgelaufen) {
      if (ex.abgegeben) return;
      const autoTeile = [].concat(...ka.aufgaben.map((a) => a.teile.filter((t) => t.art === "auto")));
      if (!zeitAbgelaufen) {
        const leer = summe(autoTeile.map((t) => t.inputs.filter((i) => !i.value).length));
        if (leer && !window.confirm(`Es ${leer === 1 ? "ist noch 1 Feld" : "sind noch " + leer + " Felder"} leer. Trotzdem abgeben?`)) return;
      }
      ex.abgegeben = true;
      if (examTimer) { clearInterval(examTimer); examTimer = null; }
      const dauer = Math.round((Date.now() - ex.start) / 60000);
      let autoPunkte = 0, autoMax = 0;
      const papierChecks = [];
      ka.aufgaben.forEach((a) => a.teile.forEach((t) => {
        if (t.art === "papier") {
          const liste = el("div", { class: "ka-check" });
          liste.appendChild(text("div", "steps-title", "Selbstbewertung: Was hast du auf deinem Papier?"));
          t.erwartung.forEach((e) => {
            const cb = el("input", { type: "checkbox" });
            cb.addEventListener("change", aktualisiere);
            papierChecks.push({ cb, punkte: e.punkte });
            liste.appendChild(el("label", { class: "setup-check" }, [cb, document.createTextNode(` ${e.text} (${punkteText(e.punkte)})`)]));
          });
          t.box.appendChild(liste);
          t.box.appendChild(loesungsBox(t, "Musterlösung"));
          t.voll = false;
          return;
        }
        const werte = t.inputs.map((i) => i.value);
        const res = t.pruefe(werte), fehler = res.fieldErrors || [];
        const erreicht = summe(t.punkte.filter((p, j) => !fehler.includes(j)));
        autoPunkte += erreicht; autoMax += summe(t.punkte);
        t.voll = fehler.length === 0;
        let hinweise = {};
        try { hinweise = ML.diagnose(t.task, werte, fehler); } catch (e) { hinweise = {}; }
        t.inputs.forEach((inp, j) => {
          const falsch = fehler.includes(j);
          const teile = (inp._visual || []).concat(inp._buttons || []).concat(inp.tagName === "SELECT" ? [inp] : []);
          teile.forEach((x) => { x.classList.add(falsch ? "field-error" : "field-ok"); x.disabled = true; });
          if (inp._signBtn) inp._signBtn.disabled = true;
          inp.disabled = true;
          const msg = document.getElementById(t.prefix + j + "-msg");
          if (msg && falsch) {
            msg.textContent = (hinweise[j] ? hinweise[j] + " " : "") + `Richtig: ${formatAntwort(t.task, j)}`;
            msg.classList.toggle("field-tipp", !!hinweise[j]);
          }
        });
        t.box.appendChild(text("div", "exam-points " + (t.voll ? "voll" : erreicht ? "teil" : "null"), `${String(erreicht).replace(".", ",")} von ${punkteVon(summe(t.punkte))}`));
        t.box.appendChild(loesungsBox(t, "Musterlösung"));
        // Statistik & Wiederholung für Teile aus Übungsstufen
        if (t.level && t.level.id) { recordAttempt(state.topicKey, t.level.id, t.voll, t.voll ? 1 : 0); if (!t.voll) merkeWiederholung(state.topicKey, t.level.id, t.task); }
      }));
      uhr.textContent = zeitAbgelaufen ? "⏱ Zeit abgelaufen – automatisch abgegeben" : `⏱ abgegeben nach ${dauer < 1 ? "unter 1" : dauer} min`;
      abgebenBtn.remove(); unten.remove();

      const box = el("div", { class: "exam-result" });
      const noteZeile = text("div", "exam-note", ""), punkteZeile = text("div", "", ""), hinweisZeile = text("div", "exam-small", "");
      const fertigBtn = el("button", { class: "btn small", onclick: () => { ex.selbstFertig = true; aktualisiere(); } }, [document.createTextNode("Selbstbewertung abschließen")]);
      const nurFehler = el("input", { type: "checkbox" });
      nurFehler.addEventListener("change", () => ka.aufgaben.forEach((a) => {
        a.teile.forEach((t) => { t.box.style.display = nurFehler.checked && t.art === "auto" && t.voll ? "none" : ""; });
      }));
      box.appendChild(noteZeile); box.appendChild(punkteZeile); box.appendChild(hinweisZeile);
      if (papierChecks.length) box.appendChild(fertigBtn);
      box.appendChild(el("label", { class: "setup-check" }, [nurFehler, document.createTextNode(" Nur Teilaufgaben mit Fehlern anzeigen")]));
      box.appendChild(el("div", { class: "btn-row" }, [
        el("button", { class: "btn ghost small", onclick: () => { state.view = "exam-setup"; render(); } }, [document.createTextNode("Neue Klassenarbeit")]),
        el("button", { class: "btn ghost small", onclick: () => { state.view = "levels"; render(); } }, [document.createTextNode("Zu den Stufen")])
      ]));
      ergebnis.appendChild(box);

      function aktualisiere() {
        const selbst = summe(papierChecks.filter((p) => p.cb.checked).map((p) => p.punkte));
        const selbstMax = summe(papierChecks.map((p) => p.punkte));
        const fertig = !papierChecks.length || ex.selbstFertig;
        const ges = autoPunkte + selbst, pct = Math.round((ges / ka.gesamt) * 100);
        box.className = "exam-result" + (fertig ? " note-" + ML.noteKA(pct) : "");
        if (fertig) {
          const note = ML.noteKA(pct);
          noteZeile.textContent = `Note ${note}`;
          punkteZeile.textContent = `${String(ges).replace(".", ",")} von ${punkteVon(ka.gesamt)} (${pct} %)` + (selbstMax ? ` – davon ${selbst} von ${selbstMax} Punkten selbst bewertet` : "");
          hinweisZeile.textContent = "Notenschlüssel (Richtwert): 1 ab 90 %, 2 ab 77 %, 3 ab 63 %, 4 ab 50 %, 5 ab 25 %. Schulen verwenden leicht unterschiedliche Grenzen.";
          fertigBtn.remove();
          papierChecks.forEach((p) => { p.cb.disabled = true; });
          statsCache[klausurKey(state.topicKey)] = { pct, note, punkte: ges, gesamt: ka.gesamt, datum: new Date().toISOString().slice(0, 10) };
          persistStats();
        } else {
          noteZeile.textContent = "Fast fertig: Papier-Teile bewerten";
          punkteZeile.textContent = `Automatisch geprüft: ${String(autoPunkte).replace(".", ",")} von ${punkteVon(autoMax)}. Selbst bewertet bisher: ${selbst} von ${selbstMax}.`;
          hinweisZeile.textContent = "Vergleiche deine ✏️-Lösungen mit den Musterlösungen unten, hake ab, was du hast, und schließe dann die Selbstbewertung ab. Erst dann steht die Note fest.";
        }
      }
      aktualisiere();
      window.scrollTo(0, 0);
    }
  }

