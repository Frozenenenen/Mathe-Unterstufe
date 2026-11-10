  // Erklärungs-Kasten ("📖"): Regel, Grafik, Beispiel, typische Fehler
  function erklaerungsBox(e, schliessen) {
    const box = el("div", { class: "erkl-box" });
    const kopf = el("div", { class: "erkl-kopf" }, [text("div", "erkl-titel", "📖 " + e.titel)]);
    if (schliessen) kopf.appendChild(el("button", { class: "btn ghost small", onclick: schliessen }, [document.createTextNode("Schließen")]));
    box.appendChild(kopf);
    box.appendChild(text("div", "erkl-sub", "Merke"));
    e.regeln.forEach((r) => box.appendChild(el("div", { class: "erkl-regel", html: ML.mathToHtml(r) })));
    if (e.grafikSVG) box.appendChild(el("div", { class: "ka-graph", html: e.grafikSVG }));
    if (e.beispiel.length) {
      box.appendChild(text("div", "erkl-sub", "Beispiel"));
      e.beispiel.forEach((b) => box.appendChild(b.label ? text("div", "step-label", b.label) : el("div", { class: "erkl-bsp", html: ML.mathToHtml(b.left) })));
    }
    box.appendChild(text("div", "erkl-sub", "Typische Fehler"));
    e.fehler.forEach((f) => box.appendChild(el("div", { class: "erkl-fehler", html: "⚠️ " + ML.mathToHtml(f) })));
    return box;
  }

  function renderTask() {
    const topic = ML.TOPICS[state.topicKey];
    const level = topic.levels.find(l => l.id === state.levelId);
    const task = state.task;

    app.innerHTML = "";
    app.appendChild(el("header", { class: "topbar" }, [
      el("button", { class: "backbtn", onclick: () => { state.view = "levels"; render(); } }, [document.createTextNode("←")]),
      text("h1", "", level.name)
    ]));

    // Zeitmessung: Serie dieser Stufe fortsetzen oder neu beginnen (die Uhr startet mit der ersten Aufgabe der Serie)
    const serienKey = state.topicKey + "-" + state.levelId;
    if (!state.serie || state.serie.key !== serienKey) state.serie = { key: serienKey, g: serieGroesse(), start: null, n: 0, p: 0 };
    if (state.serie.start === null) state.serie.start = Date.now();
    const serieZaehler = el("span", { class: "serie-zaehler", title: "Zeitmessung: Aufgaben in dieser Serie" });
    let serieFertig = null; // Zeit der gerade abgeschlossenen Serie (nur bis zur nächsten Aufgabe angezeigt)
    const zeigeSerie = () => { serieZaehler.textContent = serieFertig ? `⏱ Serie geschafft: ${serieFertig}` : `⏱ ${state.serie.n}/${state.serie.g}`; };
    function serieErledigt(punkte) { // eine Aufgabe ist erledigt (erstes Prüfen oder Rechenweg)
      const S = state.serie; if (!S || S.key !== serienKey) return;
      S.n += 1; S.p += punkte;
      if (S.n >= S.g) {
        const ms = Date.now() - S.start;
        speichereSerie(state.topicKey, state.levelId, S.g, ms, S.p);
        serieFertig = `${S.g} Aufgaben in ${zeitText(ms)} (${punkteText2(S.p)} von ${S.g} Punkten)`;
        state.serie = { key: serienKey, g: serieGroesse(), start: null, n: 0, p: 0 };
      }
      zeigeSerie();
    }
    const statsline = el("div", { class: "statsline" });
    const empfehlung = el("div", { class: "empfehlung-holder" });
    function aktualisiereStatistik() {
      const s = getStat(state.topicKey, state.levelId);
      statsline.innerHTML = "";
      statsline.appendChild(el("span", {}, [document.createTextNode("Bisher in dieser Stufe: "), el("strong", {}, [document.createTextNode(`${s.correct}/${s.attempts} richtig`)])]));
      zeigeSerie(); statsline.appendChild(serieZaehler);
      empfehlung.innerHTML = "";
      if (!stufeSitzt(s)) return;
      const idx = topic.levels.findIndex((l) => l.id === state.levelId);
      const naechste = topic.levels[idx + 1];
      const box = el("div", { class: "empfehlung" });
      const pkt = (s.recent || []).reduce((a, b) => a + b, 0);
      box.appendChild(text("div", "", `Diese Stufe sitzt! (${String(pkt).replace(".", ",")} von 10 Punkten in den letzten 10 Aufgaben)`));
      if (naechste) {
        box.appendChild(el("button", { class: "btn small", onclick: () => {
          state.levelId = naechste.id; state.checked = false; state.showSteps = false; state.stepsRevealed = false; state.tipsShown = 0;
          state.task = erzeugeAufgabe(state.topicKey, naechste); render();
        } }, [document.createTextNode(`Weiter zu: ${naechste.name}`)]));
      } else {
        box.appendChild(text("div", "", "Das war die letzte Stufe dieses Themas – probier ein anderes Thema!"));
      }
      empfehlung.appendChild(box);
    }
    aktualisiereStatistik();
    app.appendChild(statsline);
    app.appendChild(empfehlung);

    // Erklärung: allgemeines Merkwissen zur Stufe -- sperrt das Prüfen nicht
    const erkl = ML.erklaerungFuer(state.topicKey, state.levelId);
    const erklHolder = el("div", {});
    function zeigeErklaerung(hinscrollen) {
      if (!erkl) return;
      if (erklHolder.childNodes.length && !hinscrollen) { erklHolder.innerHTML = ""; return; }
      erklHolder.innerHTML = "";
      erklHolder.appendChild(erklaerungsBox(erkl, () => { erklHolder.innerHTML = ""; }));
      if (hinscrollen) erklHolder.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    app.appendChild(erklHolder);
    const card = el("div", { class: "card" });
    const metaZeile = el("div", { class: "meta-zeile" }, [text("div", "task-meta", level.grade)]);
    if (erkl) metaZeile.appendChild(el("button", { class: "erkl-btn", onclick: () => zeigeErklaerung(false) }, [document.createTextNode("📖 Erklärung")]));
    card.appendChild(metaZeile);
    if (task._wiederholung) card.appendChild(text("div", "wdh-note", "🔁 Wiederholung: Diesen Aufgabentyp hast du zuletzt nicht geschafft."));
    if (level.calculatorHint) {
      card.appendChild(text("div", "calc-hint", "🖩 " + level.calculatorHint));
    }
    // Mehrere Darstellungen derselben Aufgabe (z. B. Torte/Balken): gespeicherte Wahl anwenden
    if (task.darstellungen) { const art = darstellungsArt(Object.keys(task.darstellungen)); Object.assign(task, task.darstellungen[art]); }
    const promptEl = el("div", { class: "task-prompt" + (task.textTask ? " text-task" : ""), html: ML.mathToHtml(task.prompt) });
    card.appendChild(promptEl);
    let graphEl = null, frageEl = null;
    if (task.darstellungen) {
      const arten = Object.keys(task.darstellungen), knoepfe = [];
      const NAMEN = { torte: "🥧 Torte", balken: "▬ Balken", beide: "Beide" };
      const leiste = el("div", { class: "choice-btn-group darstellung-wahl", role: "group", "aria-label": "Darstellung wählen" });
      arten.forEach((a) => {
        const k = el("button", { type: "button", class: "choice-btn" + (task.prompt === task.darstellungen[a].prompt && task.graph === task.darstellungen[a].graph ? " selected" : ""), onclick: () => {
          setzeDarstellungsArt(a); Object.assign(task, task.darstellungen[a]);
          promptEl.innerHTML = ML.mathToHtml(task.prompt); if (graphEl) graphEl.innerHTML = task.graph; if (frageEl) frageEl.innerHTML = ML.mathToHtml(task.question || "");
          knoepfe.forEach((x) => x.classList.toggle("selected", x === k));
        } }, [document.createTextNode(NAMEN[a] || a)]);
        knoepfe.push(k); leiste.appendChild(k);
      });
      card.appendChild(leiste);
    }
    if (typeof task.graph === "string") { graphEl = el("div", { class: "ka-graph", html: task.graph }); card.appendChild(graphEl); }
    if (task.question) {
      frageEl = el("div", { class: "task-question" + (task.textTask ? " text-task" : ""), html: ML.mathToHtml(task.question) });
      card.appendChild(frageEl);
    }

    const inputs = baueEingaben(task, level, card, "field-", () => onCheck());

    const feedbackHolder = el("div", { id: "feedback-holder" });
    const stepsHolder = el("div", { id: "steps-holder" });
    const lockNote = el("div", { class: "lock-note" });

    const btnRow = el("div", { class: "btn-row" });
    const checkBtn = el("button", { class: "btn", onclick: onCheck }, [document.createTextNode("Prüfen")]);
    const nextBtn = el("button", { class: "btn ghost", onclick: () => {
      state.task = erzeugeAufgabe(state.topicKey, level); state.checked = false; state.showSteps = false; state.stepsRevealed = false; state.tipsShown = 0; render();
    } }, [document.createTextNode("Neue Aufgabe")]);
    const stepsBtn = el("button", { class: "btn secondary", onclick: () => {
      if (!state.checked) {
        recordAttempt(state.topicKey, state.levelId, false, 0);
        merkeWiederholung(state.topicKey, state.levelId, task);
        state.checked = true;
        serieErledigt(0);
        aktualisiereStatistik();
      }
      state.showSteps = true;
      state.stepsRevealed = true;
      renderSteps();
      updateLockState();
      updateTipBtn();
    } }, [document.createTextNode("Rechenweg zeigen")]);
    // Tipps: Rechenweg abschnittsweise aufdecken, Prüfen bleibt erlaubt.
    // Ein Abschnitt beginnt bei jeder Beschriftung (bzw. ist eine Zeile, wenn
    // es keine Beschriftungen gibt). Der letzte Abschnitt bleibt dem vollen
    // Rechenweg vorbehalten, sonst wären Tipps ein Umweg um die Sperre.
    const alleSchritte = level.steps(task);
    const abschnitte = ML.tippAbschnitte(task, alleSchritte); // gemeinsame Regel (Logik), auch in den Tests geprüft
    const maxTipps = Math.max(0, abschnitte.length - 1);
    state.tipsShown = state.tipsShown || 0;
    const tipBtn = el("button", { class: "btn secondary", onclick: () => {
      if (state.tipsShown >= maxTipps) return;
      state.tipsShown++;
      renderSteps();
      updateTipBtn();
    } }, [document.createTextNode("Tipp")]);
    function updateTipBtn() {
      const rest = maxTipps - state.tipsShown;
      tipBtn.disabled = rest <= 0 || !!state.stepsRevealed;
      tipBtn.textContent = state.tipsShown === 0 ? "Tipp" : rest > 0 ? "Noch ein Tipp" : "Keine Tipps mehr";
    }
    btnRow.appendChild(checkBtn);
    if (maxTipps > 0) btnRow.appendChild(tipBtn);
    btnRow.appendChild(stepsBtn);
    btnRow.appendChild(nextBtn);

    card.appendChild(btnRow);
    card.appendChild(lockNote);
    card.appendChild(feedbackHolder);
    card.appendChild(stepsHolder);
    app.appendChild(card);

    function updateLockState() {
      const locked = !!state.stepsRevealed;
      checkBtn.disabled = locked;
      inputs.forEach(inp => {
        inp.disabled = locked;
        if (inp._buttons) inp._buttons.forEach(b => { b.disabled = locked; });
        if (inp._visual) inp._visual.forEach(v => { v.disabled = locked; });
        if (inp._signBtn) inp._signBtn.disabled = locked;
      });
      lockNote.textContent = locked
        ? "Rechenweg angesehen -- für diese Aufgabe kannst du nicht mehr prüfen. Starte eine neue Aufgabe, um weiterzuüben."
        : "";
    }
    updateLockState();
    updateTipBtn();
    renderSteps();

    function renderSteps() {
      stepsHolder.innerHTML = "";
      if (!state.showSteps && !state.tipsShown) return;
      const box = el("div", { class: "steps-box" + (state.showSteps ? "" : " tipp-box") });
      box.appendChild(text("div", "steps-title", state.showSteps ? "Rechenweg" : (state.tipsShown === 1 ? "Tipp" : `Tipps (${state.tipsShown} von ${maxTipps})`)));
      const sichtbar = state.showSteps ? alleSchritte : [].concat(...abschnitte.slice(0, state.tipsShown));
      sichtbar.forEach(st => {
        if (st.label) {
          // eigene Beschriftungszeile ÜBER der zugehörigen Rechnung
          box.appendChild(text("div", "step-label", st.label));
          return;
        }
        const row = el("div", { class: "step-row" });
        row.appendChild(el("div", { html: ML.mathToHtml(st.left) }));
        row.appendChild(el("div", { class: "step-right", html: st.right ? ML.mathToHtml(st.right) : "" }));
        box.appendChild(row);
      });
      stepsHolder.appendChild(box);
    }

    function onCheck() {
      if (state.stepsRevealed) return; // Sicherheitsnetz, Button ist ohnehin deaktiviert
      inputs.forEach((inp, idx) => {
        inp.classList.remove("field-error");
        if (inp._buttons) inp._buttons.forEach(b => b.classList.remove("field-error"));
        if (inp._visual) inp._visual.forEach(v => v.classList.remove("field-error"));
        const msgEl = document.getElementById("field-" + idx + "-msg");
        if (msgEl) { msgEl.textContent = ""; msgEl.classList.remove("field-tipp"); }
      });

      const values = inputs.map(inp => inp.value);
      const result = level.check(task, values);
      // gezielte Hinweise bei typischen Fehlern (ohne die Lösung zu verraten)
      let hinweise = {};
      try { hinweise = result.correct ? {} : ML.diagnose(task, values, result.fieldErrors); } catch (e) { hinweise = {}; }

      feedbackHolder.innerHTML = "";
      const fb = el("div", { class: "feedback " + (result.correct ? "ok" : "bad") });
      fb.textContent = result.correct ? (state.tipsShown ? "Richtig! (mit Tipp)" : "Richtig!") : "Das passt noch nicht -- schau dir die markierten Felder an.";
      feedbackHolder.appendChild(fb);

      if (!result.correct && Array.isArray(result.fieldErrors)) {
        result.fieldErrors.forEach(idx => {
          const inp = inputs[idx];
          if (!inp) return;
          inp.classList.add("field-error");
          if (inp._buttons) inp._buttons.forEach(b => b.classList.add("field-error"));
          if (inp._visual) inp._visual.forEach(v => v.classList.add("field-error"));
          const label = (task.fieldLabels && task.fieldLabels[idx]) || `Feld ${idx + 1}`;
          const msgEl = document.getElementById("field-" + idx + "-msg");
          if (msgEl) {
            msgEl.textContent = hinweise[idx] || `Prüfe deine Eingabe im Feld „${label}“ noch einmal.`;
            msgEl.classList.toggle("field-tipp", !!hinweise[idx]);
            if (hinweise[idx] && erkl) msgEl.appendChild(el("button", { class: "link-btn", onclick: () => zeigeErklaerung(true) }, [document.createTextNode(" 📖 mehr dazu")]));
          }
        });
      }

      if (!state.checked) {
        const punkte = result.correct ? (state.tipsShown ? 0.5 : 1) : 0;
        recordAttempt(state.topicKey, state.levelId, result.correct, punkte);
        serieErledigt(punkte);
        if (!result.correct) merkeWiederholung(state.topicKey, state.levelId, task);
        else if (!state.tipsShown) wiederholungGeschafft(state.topicKey, state.levelId, task);
        state.checked = true;
        aktualisiereStatistik();
      }
    }
  }

