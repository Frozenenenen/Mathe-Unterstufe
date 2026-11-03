  // ---------- Rendering: Startseite ----------
  function renderHome() {
    state.serie = null; // angefangene Serie verfällt
    app.innerHTML = "";
    app.appendChild(el("header", { class: "topbar" }, [
      text("h1", "", "Mathe-Übungstool")
    ]));
    app.appendChild(text("p", "subtitle", "Wähle ein Thema, dann eine Schwierigkeitsstufe. Kein Zeitdruck -- deine Statistik pro Thema wird gespeichert."));

    if (storageMode === "memory") {
      app.appendChild(el("div", { class: "storage-banner" }, [
        document.createTextNode("Hinweis: Dein Browser erlaubt in diesem Kontext keine dauerhafte Speicherung (z. B. beim Öffnen per Doppelklick in manchen Browsern). Deine Statistik gilt nur für diese Sitzung und geht beim Schließen verloren.")
      ]));
    }

    const grid = el("div", { class: "grid" });
    Object.keys(ML.TOPICS).forEach(topicKey => {
      const topic = ML.TOPICS[topicKey];
      let attempts = 0, correct = 0;
      topic.levels.forEach(lvl => { const s = getStat(topicKey, lvl.id); attempts += s.attempts; correct += s.correct; });
      const tile = el("button", { class: "tile", onclick: () => { state.topicKey = topicKey; state.view = "levels"; render(); } }, [
        el("span", { class: "badge" }, [document.createTextNode(topic.grade)]),
        text("h3", "", topic.name),
        text("p", "", topic.levels.length + " Schwierigkeitsstufen"),
      ]);
      const statLine = el("div", { class: "stat-line" }, [
        el("span", { class: "dot" + (attempts > 0 ? " has-data" : "") }),
        document.createTextNode(attempts > 0 ? `${correct}/${attempts} richtig gesamt` : "Noch nicht geübt")
      ]);
      tile.appendChild(statLine);
      grid.appendChild(tile);
    });
    app.appendChild(grid);
    app.appendChild(lernstandKarte());

    app.appendChild(el("footer", { class: "hint" }, [
      document.createTextNode("Alle Aufgaben werden im Browser erzeugt -- keine Internetverbindung nötig.")
    ]));
  }

  // ---------- Rendering: Stufenauswahl ----------
  function renderLevels() {
    const topic = ML.TOPICS[state.topicKey];
    state.serie = null; // Stufe verlassen: nur abgeschlossene Serien zählen
    app.innerHTML = "";
    app.appendChild(el("header", { class: "topbar" }, [
      el("button", { class: "backbtn", onclick: () => { state.view = "home"; render(); } }, [document.createTextNode("←")]),
      text("h1", "", topic.name)
    ]));
    app.appendChild(text("p", "subtitle", topic.grade));

    const grid = el("div", { class: "grid" });
    topic.levels.forEach(lvl => {
      const s = getStat(state.topicKey, lvl.id);
      const pct = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : null;
      const tile = el("button", { class: "tile", onclick: () => {
        state.levelId = lvl.id; state.view = "task"; state.checked = false; state.showSteps = false; state.stepsRevealed = false; state.tipsShown = 0;
        state.task = erzeugeAufgabe(state.topicKey, topic.levels.find(l => l.id === lvl.id));
        render();
      } }, [
        el("span", { class: "badge" }, [document.createTextNode(lvl.grade)]),
        text("h3", "", lvl.name),
      ]);
      const statLine = el("div", { class: "stat-line" }, [
        el("span", { class: "dot" + (s.attempts > 0 ? " has-data" : "") }),
        document.createTextNode(s.attempts > 0 ? `${s.correct}/${s.attempts} richtig (${pct}\u202F%)` : "Noch nicht geübt")
      ]);
      tile.appendChild(statLine);
      const nW = anzahlWiederholung(state.topicKey, lvl.id);
      if (stufeSitzt(s)) tile.appendChild(text("div", "tile-mark ok", "✓ sitzt"));
      if (nW) tile.appendChild(text("div", "tile-mark wdh", `🔁 ${nW} ${nW === 1 ? "Aufgabentyp" : "Aufgabentypen"} zum Wiederholen`));
      grid.appendChild(tile);
    });
    app.appendChild(grid);
    const letzte = statsCache[klausurKey(state.topicKey)];
    const kaBox = el("div", { class: "card exam-entry" }, [
      text("h3", "", "📝 Klassenarbeit üben"),
      text("div", "exam-small", "Wie eine echte Arbeit: Aufgaben mit Teilaufgaben, mit und ohne Taschenrechner, auch Begründen und Fehler finden. Am Ende alle Lösungen mit Musterzeichnungen."),
    ]);
    if (letzte) kaBox.appendChild(text("div", "exam-small", `Letztes Ergebnis: Note ${letzte.note} (${letzte.punkte} von ${letzte.gesamt} Punkten, ${letzte.datum.split("-").reverse().join(".")})`));
    kaBox.appendChild(el("div", { class: "btn-row" }, [el("button", { class: "btn", onclick: () => { state.view = "exam-setup"; render(); } }, [document.createTextNode("Klassenarbeit einrichten")])]));
    app.appendChild(kaBox);
    app.appendChild(bestenlisteKarte(topic));
  }

  // ---------- Zeitmessung: Seriengröße wählen und Bestenliste pro Stufe ----------
  function bestenlisteKarte(topic) {
    const g = serieGroesse(), box = el("div", { class: "card bestenliste" });
    box.appendChild(text("h3", "", "⏱ Bestenliste"));
    box.appendChild(text("div", "exam-small", `In jeder Stufe wird die Zeit für ${g} Aufgaben am Stück gemessen. Eine Aufgabe zählt, sobald sie geprüft oder der Rechenweg geöffnet wurde. Wer die Stufe vorher verlässt, verliert nur die angefangene Serie. Rangfolge: erst Punkte, dann Zeit.`));
    const wahl = el("div", { class: "choice-btn-group serie-wahl" });
    [5, 10].forEach((n) => wahl.appendChild(el("button", { type: "button", class: "choice-btn" + (n === g ? " selected" : ""), onclick: () => { setzeSerieGroesse(n); render(); } }, [document.createTextNode(`${n} Aufgaben`)])));
    box.appendChild(el("div", { class: "field-row" }, [text("label", "", "Seriengröße"), wahl]));
    const nameFeld = el("input", { type: "text", class: "name-in", maxlength: String(MAX_NAME), placeholder: "z. B. Lena", value: spielerName(), autocomplete: "off", "aria-label": "Name für die Bestenliste" });
    nameFeld.addEventListener("input", () => setzeSpielerName(nameFeld.value));
    nameFeld.addEventListener("change", () => { setzeSpielerName(nameFeld.value); render(); });
    box.appendChild(el("div", { class: "field-row" }, [text("label", "", "Wer übt gerade? (Name für neue Serien)"), nameFeld]));
    const zeilen = topic.levels.map((l) => ({ l, liste: serienVon(state.topicKey, l.id, g) })).filter((z) => z.liste.length);
    if (!zeilen.length) { box.appendChild(text("div", "exam-small", `Noch keine ${g}er-Serie abgeschlossen.`)); return box; }
    const tab = el("table", { class: "besten-tab" });
    const kurzDatum = (d) => { const [j, m, t] = d.split("-"); return `${t}.${m}.${j.slice(2)}`; };
    tab.appendChild(el("tr", {}, ["Stufe", "Name", "Zeit", "Punkte"].map((h) => text("th", "", h))));
    zeilen.forEach(({ l, liste }) => {
      const b = liste[0];
      tab.appendChild(el("tr", {}, [text("td", "", l.name), text("td", "besten-name", b.n || "–"), text("td", "nowrap", zeitText(b.ms).replace(" min", "")), text("td", "nowrap", `${punkteText2(b.p)}/${g}`)]));
    });
    box.appendChild(tab);
    zeilen.forEach(({ l, liste }) => {
      const d = el("details", { class: "besten-details" });
      d.appendChild(el("summary", {}, [document.createTextNode(`${l.name}: Top ${Math.min(5, liste.length)} von ${liste.length} ${liste.length === 1 ? "Serie" : "Serien"}`)]));
      const ol = el("ol", {});
      liste.slice(0, 5).forEach((e) => ol.appendChild(text("li", "", `${e.n ? e.n + ": " : ""}${zeitText(e.ms)} · ${punkteText2(e.p)}/${g} Punkte · ${kurzDatum(e.d)}`)));
      d.appendChild(ol); box.appendChild(d);
    });
    return box;
  }

