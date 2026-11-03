  // ============================================================
  // TEXTAUFGABEN (eine Stufe pro Thema)
  // Gleiche Mathematik wie in den übrigen Stufen, eingebettet in Alltags-
  // situationen. Der Rechenweg wird bei der Erzeugung gleich mitgebaut
  // (task.data.steps), geprüft wird über einen gemeinsamen Checker, der pro
  // Feld weiß, ob eine Zahl, ein (streng gekürzter) Bruch oder eine Auswahl
  // erwartet wird.
  // ============================================================
  const NAMEN = ["Lena", "Tom", "Mia", "Ben", "Emma", "Paul", "Sophie", "Jonas", "Hannah", "Elias", "Lea", "Noah", "Aylin", "Mehmet", "Ida", "Finn", "Marie"];
  function zweiNamen() {
    const n1 = choice(NAMEN);
    let n2; do { n2 = choice(NAMEN); } while (n2 === n1);
    return [n1, n2];
  }
  const T = (s) => `\\text{${s}}`;
  const euro = (x) => x.toFixed(2).replace(".", ",") + " €";
  const tausender = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Kaufmännisch runden, robust gegen Gleitkomma-Reste (10837,4999... bei
  // exakt 10837,50 soll 10838 ergeben, wie auf dem Taschenrechner)
  const kevinGehler = 1e-9;
  const roundKfm = (x, d) => { const f = Math.pow(10, d || 0); return Math.round(x * f * (1 + 1e-12) + kevinGehler) / f; };
  const round0 = (x) => roundKfm(x, 0);

  function check_textaufgabe(task, userInputs) {
    const errors = [];
    task.fieldKinds.forEach((kind, idx) => {
      const ans = task.answer[idx];
      const u = userInputs[idx];
      let ok = false;
      if (kind === "choice") {
        ok = u === ans;
      } else if (kind === "fraction") {
        const f = parseUserFraction(u);
        if (f) {
          let n = f.num, d = f.den;
          if (d < 0) { n = -n; d = -d; }
          ok = n === ans.num && d === ans.den; // streng: vollständig gekürzt
        }
      } else {
        const v = parseUserNumber(u);
        const tol = task.tolerances ? task.tolerances[idx] : 1e-9;
        ok = !isNaN(v) && numbersClose(v, ans, tol);
      }
      if (!ok) errors.push(idx);
    });
    return { correct: errors.length === 0, fieldErrors: errors };
  }
  function steps_textaufgabe(task) { return task.data.steps; }

  // Hilfsfunktion: fertiges Aufgabenobjekt aus Feldbeschreibungen bauen
  function textTask(topic, level, subtype, prompt, question, fields, steps, extra) {
    return Object.assign({
      topic, level, subtype, textTask: true,
      prompt, promptText: prompt, question, questionText: question,
      numFields: fields.length,
      fieldLabels: fields.map((f) => f.label),
      fieldKinds: fields.map((f) => f.kind),
      perFieldType: fields.map((f) => (f.kind === "choice" ? "choice" : "text")),
      fieldChoices: fields.map((f) => f.choices || null),
      tolerances: fields.map((f) => (f.tol === undefined ? 1e-9 : f.tol)),
      // Vorzeichen-Knopf pro Feld (gemischte Stufe): nur wo dieser Aufgabentyp
      // an dieser Stelle negative Werte haben kann -- unabhängig von der Lösung
      fieldSigned: fields.map((f) => !!f.signed),
      answer: fields.map((f) => f.answer),
      data: { steps }
    }, extra || {});
  }

