  // ============================================================
  // ARBEITSBLATT DRUCKEN: dieselbe Klassenarbeit als druckfertiges Blatt,
  // danach Lösungsblatt mit Musterzeichnungen, Erwartungshorizont und
  // Notenschlüssel (Punkte -> Note).
  // ============================================================
  function renderPrint() {
    const topic = ML.TOPICS[state.topicKey], ka = state.printKA;
    app.innerHTML = "";
    app.appendChild(el("div", { class: "no-print print-toolbar" }, [
      el("button", { class: "btn", onclick: () => window.print() }, [document.createTextNode("🖨 Drucken / als PDF speichern")]),
      el("button", { class: "btn ghost", onclick: () => { state.printKA = ML.erzeugeKlassenarbeit(state.topicKey, ka.minuten, ka.teilgebiet); render(); } }, [document.createTextNode("Neue Aufgaben")]),
      el("button", { class: "btn ghost", onclick: () => { state.view = "exam-setup"; render(); } }, [document.createTextNode("Zurück")])
    ]));
    const sheet = el("div", { class: "print-sheet" });
    sheet.appendChild(el("div", { class: "print-head" }, [
      text("div", "print-title", `Klassenarbeit: ${topic.name}`),
      text("div", "print-fields", "Name: ________________________     Datum: ______________"),
      text("div", "print-small", `${ka.klasse} · Bearbeitungszeit ${ka.minuten} Minuten · ${punkteText(ka.gesamt)}`)
    ]));
    let letzterTeil = null;
    ka.aufgaben.forEach((a, k) => {
      if (ka.mitTR && a.teil !== letzterTeil) { sheet.appendChild(text("div", "print-teilkopf", a.teil === "A" ? "Teil A – ohne Taschenrechner" : "Teil B – mit Taschenrechner")); letzterTeil = a.teil; }
      const box = el("div", { class: "print-task" });
      box.appendChild(text("div", "print-num", `Aufgabe ${k + 1}: ${a.titel}  (${punkteText(summe(a.teile.map((t) => summe(t.punkte))))})`));
      if (a.kontext) box.appendChild(el("div", { class: "task-prompt text-task", html: ML.mathToHtml(a.kontext) }));
      if (a.graph) box.appendChild(el("div", { class: "ka-graph", html: a.graph }));
      a.teile.forEach((t) => {
        box.appendChild(el("div", { class: "print-teil" }, [el("strong", {}, [document.createTextNode(t.label + " ")]), el("span", { html: ML.mathToHtml(t.text) }),
          document.createTextNode(` (${summe(t.punkte)} P.)`)]));
        if (t.art === "papier") { box.appendChild(el("div", { class: "print-space" })); return; }
        const task = t.task;
        if (task.fieldType === "select") {
          const grid = el("div", { class: "graph-grid" });
          task.graphs.forEach((g) => grid.appendChild(el("div", { class: "graph-cell" }, [
            el("div", { class: "graph-svg-holder", html: ML.renderGraphSVG(g.fn, Object.assign({ colors: ["#111"] }, task.graphConfig)) }), text("div", "print-line", `${g.id}: ______________`)])));
          box.appendChild(grid);
          box.appendChild(text("div", "print-small", "Zur Auswahl: " + task.fieldOptions.map((o) => o.text).join("   ")));
          return;
        }
        for (let i = 0; i < task.numFields; i++) {
          const lab = (task.fieldLabels && task.fieldLabels[i]) || "Ergebnis";
          const ch = (task.fieldKinds && task.fieldKinds[i] === "choice") || (task.perFieldType && task.perFieldType[i] === "choice") || task.fieldType === "choice";
          box.appendChild(text("div", "print-line", ch ? `${lab}:  ${(task.fieldChoices[i] || []).map((c) => "◯ " + c).join("     ")}` : `${lab}:  ____________________`));
        }
      });
      sheet.appendChild(box);
    });
    const loes = el("div", { class: "print-solutions" });
    loes.appendChild(text("div", "print-title", `Lösungen: ${topic.name}`));
    ka.aufgaben.forEach((a, k) => {
      const box = el("div", { class: "print-task" });
      box.appendChild(text("div", "print-num", `Aufgabe ${k + 1}: ${a.titel}`));
      a.teile.forEach((t) => {
        const kopf = t.art === "papier" ? `${t.label} Erwartungshorizont:` : `${t.label} ` + t.task.answer.map((x, i) => `${t.task.fieldType === "select" ? t.task.graphs[i].id : (t.task.fieldLabels[i] || "Ergebnis")}: ${formatAntwort(t.task, i)}`).join("  |  ");
        box.appendChild(text("div", "print-teil", kopf));
        if (t.art === "papier") t.erwartung.forEach((e) => box.appendChild(text("div", "print-step", `☐ ${e.text} (${e.punkte} P.)`)));
        const st = el("div", { class: "print-steps" });
        t.loesung.forEach((s) => { st.appendChild(s.label ? text("div", "step-label", s.label) : el("div", { class: "print-step", html: ML.mathToHtml(s.left) })); });
        box.appendChild(st);
        if (t.loesungsGraph) box.appendChild(el("div", { class: "ka-graph", html: t.loesungsGraph }));
      });
      loes.appendChild(box);
    });
    const g = ka.gesamt, grenze = (p) => Math.ceil((g * p) / 100 - 1e-9);
    loes.appendChild(text("div", "print-num", `Notenschlüssel (${g} Punkte): 1 ab ${grenze(90)} · 2 ab ${grenze(77)} · 3 ab ${grenze(63)} · 4 ab ${grenze(50)} · 5 ab ${grenze(25)} · 6 darunter`));
    sheet.appendChild(loes);
    app.appendChild(sheet);
  }

