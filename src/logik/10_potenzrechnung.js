  // ============================================================
  // POTENZRECHNUNG
  // ============================================================

  function gen_potenz_1() {
    // Zahlenbereich pro Exponent begrenzt, damit die Ergebnisse tatsächlich
    // im Kopf nachvollziehbar bleiben (kein 9^4 = 6561):
    //   Quadrate:      Basis bis 12  -> Ergebnis bis 144
    //   Kubikzahlen:   Basis bis 5   -> Ergebnis bis 125
    //   4. Potenzen:   Basis bis 3   -> Ergebnis bis 81
    const n = choice([2, 2, 2, 2, 3, 3, 4]); // Quadrate am häufigsten
    let baseMax;
    if (n === 2) baseMax = 12;
    else if (n === 3) baseMax = 5;
    else baseMax = 3;
    const bases = [];
    for (let v = 2; v <= baseMax; v++) { bases.push(v); bases.push(-v); }
    const a = choice(bases);
    const answer = Math.pow(a, n);
    return {
      topic: "potenzrechnung", level: 1,
      prompt: `${baseStr(a)}^{${n}}`,
      promptText: `${baseStr(a)}^${n}`,
      numFields: 1,
      fieldLabels: ["Ergebnis"],
      answer: [answer],
      data: { a, n }
    };
  }
  function check_potenz_1(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    return { correct: v === task.answer[0], fieldErrors: v === task.answer[0] ? [] : [0] };
  }
  function steps_potenz_1(task) {
    const { a, n } = task.data;
    const steps = [];
    const factorStr = Array(n).fill(`(${a})`).join(" \\cdot ");
    steps.push({ left: `${baseStr(a)}^{${n}} = ${factorStr}`, right: "ausschreiben" });
    let running = a;
    for (let i = 1; i < n; i++) {
      running = running * a;
      steps.push({ left: `= ${running}`, right: `\\cdot(${a})` });
    }
    return steps;
  }

  function gen_potenz_2() {
    const a = choice([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const type = choice(["mult", "div", "pow", "root"]);
    if (type === "mult") {
      const m = randInt(1, 6);
      const n = randInt(1, 6);
      return {
        topic: "potenzrechnung", level: 2, subtype: "mult",
        prompt: `${a}^{${m}}\\cdot${a}^{${n}} = ${a}^{\\;?}`,
        promptText: `${a}^${m} · ${a}^${n} = ${a}^?`,
        numFields: 1,
        fieldLabels: ["Exponent"],
        answer: [m + n],
        data: { a, m, n }
      };
    } else if (type === "div") {
      const n = randInt(1, 5);
      const m = n + randInt(1, 5);
      return {
        topic: "potenzrechnung", level: 2, subtype: "div",
        prompt: `${a}^{${m}} : ${a}^{${n}} = ${a}^{\\;?}`,
        promptText: `${a}^${m} : ${a}^${n} = ${a}^?`,
        numFields: 1,
        fieldLabels: ["Exponent"],
        answer: [m - n],
        data: { a, m, n }
      };
    } else if (type === "pow") {
      const m = randInt(2, 5);
      const n = randInt(2, 4);
      return {
        topic: "potenzrechnung", level: 2, subtype: "pow",
        prompt: `(${a}^{${m}})^{${n}} = ${a}^{\\;?}`,
        promptText: `(${a}^${m})^${n} = ${a}^?`,
        numFields: 1,
        fieldLabels: ["Exponent"],
        answer: [m * n],
        data: { a, m, n }
      };
    } else {
      // Wurzel als gebrochener Exponent: n-te Wurzel aus a^m, so gewählt dass
      // m glatt durch n teilbar ist (Ergebnis k = m/n ist ganzzahlig).
      const n = choice([2, 3]);
      const k = randInt(1, 6);
      const m = n * k;
      return {
        topic: "potenzrechnung", level: 2, subtype: "root",
        prompt: `\\sqrt[${n}]{${a}^{${m}}} = ${a}^{\\;?}`,
        promptText: `${n}.Wurzel(${a}^${m}) = ${a}^?`,
        numFields: 1,
        fieldLabels: ["Exponent"],
        answer: [k],
        data: { a, m, n, k }
      };
    }
  }
  function check_potenz_2(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    return { correct: v === task.answer[0], fieldErrors: v === task.answer[0] ? [] : [0] };
  }
  function steps_potenz_2(task) {
    const { a, m, n, k } = task.data;
    if (task.subtype === "mult") {
      return [
        { left: `${a}^{${m}}\\cdot${a}^{${n}}`, right: "gleiche Basis: Exponenten addieren" },
        { left: `= ${a}^{${m}+${n}}`, right: "" },
        { left: `= ${a}^{${m + n}}`, right: "" }
      ];
    } else if (task.subtype === "div") {
      return [
        { left: `${a}^{${m}} : ${a}^{${n}}`, right: "gleiche Basis: Exponenten subtrahieren" },
        { left: `= ${a}^{${m}-${n}}`, right: "" },
        { left: `= ${a}^{${m - n}}`, right: "" }
      ];
    } else if (task.subtype === "pow") {
      return [
        { left: `(${a}^{${m}})^{${n}}`, right: "Potenz einer Potenz: Exponenten multiplizieren" },
        { left: `= ${a}^{${m}\\cdot ${n}}`, right: "" },
        { left: `= ${a}^{${m * n}}`, right: "" }
      ];
    } else {
      return [
        { left: `\\sqrt[${n}]{${a}^{${m}}}`, right: "Wurzel = gebrochener Exponent" },
        { left: `= ${a}^{\\frac{${m}}{${n}}}`, right: "" },
        { left: `= ${a}^{${k}}`, right: `${m}:${n}=${k}` }
      ];
    }
  }

  function gen_potenz_3() {
    const useZero = Math.random() < 0.25;
    if (useZero) {
      const a = choice([-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]);
      return {
        topic: "potenzrechnung", level: 3, subtype: "zero",
        prompt: `${baseStr(a)}^{0}`,
        promptText: `${baseStr(a)}^0`,
        numFields: 1,
        fieldLabels: ["Ergebnis (Bruch, z. B. 1/8)"],
        answerType: "fraction",
        answer: [{ num: 1, den: 1 }],
        data: { a }
      };
    }
    const a = choice([2, 3, 4, 5, 6, 7, 8, 9]);
    const n = choice([1, 2, 3]);
    const den = Math.pow(a, n);
    return {
      topic: "potenzrechnung", level: 3, subtype: "neg",
      prompt: `${a}^{-${n}}`,
      promptText: `${a}^(-${n})`,
      numFields: 1,
      fieldLabels: ["Ergebnis (Bruch, z. B. 1/8)"],
      answerType: "fraction",
      answer: [{ num: 1, den: den }],
      data: { a, n, den }
    };
  }
  function check_potenz_3(task, userInputs) {
    const f = parseUserFraction(userInputs[0]);
    if (!f) return { correct: false, fieldErrors: [0] };
    const ok = fractionsEqual(f, task.answer[0]);
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_potenz_3(task) {
    if (task.subtype === "zero") {
      const { a } = task.data;
      return [
        { left: `${baseStr(a)}^{0}`, right: "" },
        { label: "Regel: Jede Zahl außer 0 hoch 0 ergibt 1." },
        { left: `= 1`, right: "" }
      ];
    }
    const { a, n, den } = task.data;
    return [
      { left: `${a}^{-${n}}`, right: "negativer Exponent: Kehrwert" },
      { left: `= \\dfrac{1}{${a}^{${n}}}`, right: "" },
      { left: `= \\dfrac{1}{${den}}`, right: "" }
    ];
  }

  function gen_potenz_4() {
    const b = choice([2, 3, 5, 10]);
    const k = randInt(1, 5);
    const a = Math.pow(b, k);
    return {
      topic: "potenzrechnung", level: 4,
      prompt: `\\log_{${b}}(${a})`,
      promptText: `log_${b}(${a})`,
      numFields: 1,
      fieldLabels: ["x"],
      answer: [k],
      data: { b, k, a }
    };
  }
  function check_potenz_4(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    return { correct: v === task.answer[0], fieldErrors: v === task.answer[0] ? [] : [0] };
  }
  function steps_potenz_4(task) {
    const { b, k, a } = task.data;
    return [
      { left: `\\log_{${b}}(${a}) = x`, right: "gesucht: Exponent" },
      { left: `\\Leftrightarrow ${b}^x = ${a}`, right: "Definition des Logarithmus" },
      { left: `${b}^{${k}} = ${a}`, right: `${b} ${k}-mal mit sich selbst multipliziert` },
      { left: `x = ${k}`, right: "" }
    ];
  }

  // ---- Stufe 5: Potenzgesetze mit Variablen (Kl. 8-9, Vertiefung) ----
  const POTENZ5_VARS = ["x", "y", "z", "a", "b"];
  function gen_potenz_5() {
    const subtype = choice(["coefMul", "coefDiv", "coefPow", "twoVar"]);
    const v = choice(POTENZ5_VARS);

    if (subtype === "coefMul") {
      const c1 = randInt(2, 9), c2 = randInt(2, 9);
      const m = randInt(2, 6), n = randInt(2, 6);
      return {
        topic: "potenzrechnung", level: 5, subtype, v,
        prompt: `${c1}${v}^{${m}}\\cdot ${c2}${v}^{${n}}`,
        promptText: `${c1}${v}^${m} · ${c2}${v}^${n}`,
        question: `\\text{Vereinfache so weit wie möglich.}`,
        questionText: `Vereinfache so weit wie möglich.`,
        numFields: 2,
        fieldLabels: ["Koeffizient", "Exponent"], eingabeForm: [0, v, { h: 1 }],
        answer: [c1 * c2, m + n],
        data: { c1, c2, m, n, v }
      };
    } else if (subtype === "coefDiv") {
      const c2 = randInt(2, 9);
      const k = randInt(2, 6);
      const c1 = c2 * k;
      const n = randInt(2, 5);
      const m = n + randInt(1, 5);
      return {
        topic: "potenzrechnung", level: 5, subtype, v,
        prompt: `${c1}${v}^{${m}} : ${c2}${v}^{${n}}`,
        promptText: `${c1}${v}^${m} : ${c2}${v}^${n}`,
        question: `\\text{Vereinfache so weit wie möglich.}`,
        questionText: `Vereinfache so weit wie möglich.`,
        numFields: 2,
        fieldLabels: ["Koeffizient", "Exponent"], eingabeForm: [0, v, { h: 1 }],
        answer: [c1 / c2, m - n],
        data: { c1, c2, m, n, v }
      };
    } else if (subtype === "coefPow") {
      const n = choice([2, 3]);
      const c = n === 2 ? randInt(2, 5) : randInt(2, 3);
      const m = randInt(2, 4);
      return {
        topic: "potenzrechnung", level: 5, subtype, v,
        prompt: `(${c}${v}^{${m}})^{${n}}`,
        promptText: `(${c}${v}^${m})^${n}`,
        question: `\\text{Vereinfache so weit wie möglich.}`,
        questionText: `Vereinfache so weit wie möglich.`,
        numFields: 2,
        fieldLabels: ["Koeffizient", "Exponent"], eingabeForm: [0, v, { h: 1 }],
        answer: [Math.pow(c, n), m * n],
        data: { c, m, n, v }
      };
    } else {
      const a = randInt(2, 5), b = randInt(2, 5), c = randInt(2, 5), d = randInt(2, 5);
      return {
        topic: "potenzrechnung", level: 5, subtype,
        prompt: `x^{${a}}y^{${b}}\\cdot x^{${c}}y^{${d}}`,
        promptText: `x^${a}y^${b} · x^${c}y^${d}`,
        question: `\\text{Vereinfache so weit wie möglich.}`,
        questionText: `Vereinfache so weit wie möglich.`,
        numFields: 2,
        fieldLabels: ["Exponent von x", "Exponent von y"], eingabeForm: ["x", { h: 0 }, "y", { h: 1 }],
        answer: [a + c, b + d],
        data: { a, b, c, d }
      };
    }
  }
  function check_potenz_5(task, userInputs) {
    const v0 = parseUserNumber(userInputs[0]);
    const v1 = parseUserNumber(userInputs[1]);
    const errors = [];
    if (isNaN(v0) || v0 !== task.answer[0]) errors.push(0);
    if (isNaN(v1) || v1 !== task.answer[1]) errors.push(1);
    return { correct: errors.length === 0, fieldErrors: errors };
  }
  function steps_potenz_5(task) {
    const s = task.subtype;
    if (s === "coefMul") {
      const { c1, c2, m, n, v } = task.data;
      return [
        { left: `${c1}${v}^{${m}}\\cdot ${c2}${v}^{${n}}`, right: "Koeffizienten multiplizieren, Exponenten addieren" },
        { left: `= (${c1}\\cdot ${c2})\\,${v}^{${m}+${n}}`, right: "" },
        { left: `= ${c1 * c2}\\,${v}^{${m + n}}`, right: "" }
      ];
    } else if (s === "coefDiv") {
      const { c1, c2, m, n, v } = task.data;
      return [
        { left: `${c1}${v}^{${m}} : ${c2}${v}^{${n}}`, right: "Koeffizienten dividieren, Exponenten subtrahieren" },
        { left: `= (${c1}:${c2})\\,${v}^{${m}-${n}}`, right: "" },
        { left: `= ${c1 / c2}\\,${v}^{${m - n}}`, right: "" }
      ];
    } else if (s === "coefPow") {
      const { c, m, n, v } = task.data;
      return [
        { left: `(${c}${v}^{${m}})^{${n}}`, right: "Koeffizient hoch n, Exponent mal n" },
        { left: `= ${c}^{${n}}\\,${v}^{${m}\\cdot ${n}}`, right: "" },
        { left: `= ${Math.pow(c, n)}\\,${v}^{${m * n}}`, right: "" }
      ];
    } else {
      const { a, b, c, d } = task.data;
      return [
        { left: `x^{${a}}y^{${b}}\\cdot x^{${c}}y^{${d}}`, right: "gleiche Basen einzeln zusammenfassen" },
        { left: `= x^{${a}+${c}}y^{${b}+${d}}`, right: "" },
        { left: `= x^{${a + c}}y^{${b + d}}`, right: "" }
      ];
    }
  }

  // ---- Stufe 6: Wurzeln berechnen (Kl. 7-9) ----
  function gen_potenz_6() {
    const subtype = choice(["sqrt", "sqrt", "cbrt", "productLaw"]); // Quadratwurzel am häufigsten
    if (subtype === "sqrt") {
      const n = randInt(2, 15);
      const a = n * n;
      return {
        topic: "potenzrechnung", level: 6, subtype,
        prompt: `\\sqrt{${a}}`,
        promptText: `√${a}`,
        numFields: 1,
        fieldLabels: ["Ergebnis"],
        answer: [n],
        data: { a, n }
      };
    } else if (subtype === "cbrt") {
      const n = randInt(2, 6);
      const a = n * n * n;
      return {
        topic: "potenzrechnung", level: 6, subtype,
        prompt: `\\sqrt[3]{${a}}`,
        promptText: `3.Wurzel(${a})`,
        numFields: 1,
        fieldLabels: ["Ergebnis"],
        answer: [n],
        data: { a, n }
      };
    } else {
      const a = randInt(2, 20), b = randInt(2, 20);
      return {
        topic: "potenzrechnung", level: 6, subtype,
        prompt: `\\sqrt{${a}}\\cdot\\sqrt{${b}} = \\sqrt{\\;?}`,
        promptText: `√${a} · √${b} = √?`,
        numFields: 1,
        fieldLabels: ["Zahl unter der Wurzel"],
        answer: [a * b],
        data: { a, b }
      };
    }
  }
  function check_potenz_6(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    return { correct: v === task.answer[0], fieldErrors: v === task.answer[0] ? [] : [0] };
  }
  function steps_potenz_6(task) {
    if (task.subtype === "sqrt") {
      const { a, n } = task.data;
      return [
        { left: `\\sqrt{${a}} = x`, right: "gesucht: Zahl zum Quadrat ergibt das" },
        { left: `${n}^2 = ${a}`, right: "" },
        { left: `x = ${n}`, right: "" }
      ];
    } else if (task.subtype === "cbrt") {
      const { a, n } = task.data;
      return [
        { left: `\\sqrt[3]{${a}} = x`, right: "gesucht: Zahl hoch 3 ergibt das" },
        { left: `${n}^3 = ${a}`, right: "" },
        { left: `x = ${n}`, right: "" }
      ];
    } else {
      const { a, b } = task.data;
      return [
        { left: `\\sqrt{${a}}\\cdot\\sqrt{${b}}`, right: "Wurzelgesetz: \\sqrt{a}\\cdot\\sqrt{b}=\\sqrt{a\\cdot b}" },
        { left: `= \\sqrt{${a}\\cdot ${b}}`, right: "" },
        { left: `= \\sqrt{${a * b}}`, right: "" }
      ];
    }
  }

  // ---- Stufe 7: Graphen zuordnen (Kl. 9-10) ----
  // Pool von Potenzfunktionen, nach "Klasse" gruppiert -- pro Aufgabe wird aus
  // JEDER gewählten Klasse höchstens EIN Vertreter gezeigt, damit nie zwei
  // kaum unterscheidbare Kurven (z.B. x^2 und x^4) gleichzeitig auftauchen.
  const GRAPH_POOL = [
    { cls: "evenPos", term: "x^{2}", termPlain: "x²", fn: (x) => x * x, hint: "gerade Potenz, positiv: Parabel, symmetrisch zur y-Achse" },
    { cls: "evenPos", term: "x^{4}", termPlain: "x⁴", fn: (x) => Math.pow(x, 4), hint: "gerade Potenz, positiv: Parabel, symmetrisch zur y-Achse" },
    { cls: "evenNeg", term: "x^{-2}", termPlain: "x⁻²", fn: (x) => 1 / (x * x), hint: "gerade Potenz, negativer Exponent: Hyperbel oberhalb der x-Achse" },
    { cls: "oddPos", term: "x^{3}", termPlain: "x³", fn: (x) => x * x * x, hint: "ungerade Potenz, positiv: S-Kurve, punktsymmetrisch zum Ursprung" },
    { cls: "oddPos", term: "x^{5}", termPlain: "x⁵", fn: (x) => Math.pow(x, 5), hint: "ungerade Potenz, positiv: S-Kurve, punktsymmetrisch zum Ursprung" },
    { cls: "oddPosCoef", term: "3x^{5}", termPlain: "3x⁵", fn: (x) => 3 * Math.pow(x, 5), hint: "wie x^5, aber durch den Koeffizienten 3 deutlich steiler" },
    { cls: "oddNeg", term: "x^{-1}", termPlain: "x⁻¹", fn: (x) => 1 / x, hint: "ungerade Potenz, negativer Exponent: Hyperbel in zwei gegenüberliegenden Feldern" },
    { cls: "oddNeg", term: "x^{-3}", termPlain: "x⁻³", fn: (x) => 1 / Math.pow(x, 3), hint: "ungerade Potenz, negativer Exponent: Hyperbel in zwei gegenüberliegenden Feldern" },
    { cls: "sqrtEven", term: "\\sqrt{x}", termPlain: "√x", fn: (x) => (x >= 0 ? Math.sqrt(x) : NaN), hint: "Wurzelfunktion: nur für x \\geq 0 definiert" },
    { cls: "sqrtOdd", term: "\\sqrt[3]{x}", termPlain: "³√x", fn: (x) => Math.cbrt(x), hint: "3. Wurzel: für alle x definiert, punktsymmetrisch" },
    { cls: "sqrtOddNeg", term: "-\\sqrt[3]{x}", termPlain: "-³√x", fn: (x) => -Math.cbrt(x), hint: "wie \\sqrt[3]{x}, aber an der x-Achse gespiegelt" },
    { cls: "evenPosNeg", term: "-x^{2}", termPlain: "-x²", fn: (x) => -x * x, hint: "wie x^2, aber an der x-Achse gespiegelt (nach unten geöffnet)" }
  ];
  function gen_potenz_7() {
    const classes = [...new Set(GRAPH_POOL.map((p) => p.cls))];
    // 4 Klassen für die gezeigten Graphen, 2 weitere Klassen liefern
    // zusätzliche Auswahlmöglichkeiten (Ablenker), die zu keinem Graphen passen
    const shuffledClasses = [...classes].sort(() => Math.random() - 0.5);
    const chosenClasses = shuffledClasses.slice(0, 4);
    const decoyClasses = shuffledClasses.slice(4, 6);

    const graphItems = chosenClasses.map((cls) => {
      const options = GRAPH_POOL.filter((p) => p.cls === cls);
      return choice(options);
    });
    const decoyItems = decoyClasses.map((cls) => {
      const options = GRAPH_POOL.filter((p) => p.cls === cls);
      return choice(options);
    });

    // Anzeigereihenfolge der Graphen zufällig mischen (G1..G4)
    const shuffledGraphItems = [...graphItems].sort(() => Math.random() - 0.5);
    const graphs = shuffledGraphItems.map((item, idx) => ({
      id: "G" + (idx + 1),
      fn: item.fn,
      term: item.term
    }));

    // Alle wählbaren Terme (4 richtige + 2 Ablenker), gemischt
    const allChoiceItems = [...graphItems, ...decoyItems].sort(() => Math.random() - 0.5);
    const fieldOptions = allChoiceItems.map((item) => ({
      value: item.term,
      label: mathToHtml(item.term),
      text: item.termPlain
    }));

    return {
      topic: "potenzrechnung", level: 7,
      isGraphMatch: true,
      graphs,
      graphConfig: { xmin: -2, xmax: 2, ymin: -4, ymax: 4, width: 200, height: 160 },
      prompt: `\\text{Ordne jedem Graphen den passenden Funktionsterm zu}`,
      promptText: "Ordne jedem Graphen den passenden Funktionsterm zu",
      numFields: 4,
      fieldLabels: graphs.map((g) => g.id),
      fieldType: "select",
      fieldOptions,
      answer: graphs.map((g) => g.term),
      data: { graphs, allChoiceItems }
    };
  }
  function check_potenz_7(task, userInputs) {
    const errors = [];
    for (let i = 0; i < task.answer.length; i++) {
      if (userInputs[i] !== task.answer[i]) errors.push(i);
    }
    return { correct: errors.length === 0, fieldErrors: errors };
  }
  function steps_potenz_7(task) {
    return task.graphs.map((g) => {
      const item = task.data.allChoiceItems.find((it) => it.term === g.term);
      return { left: `${g.id}: ${g.term}`, right: item ? item.hint : "" };
    });
  }


  // ---- Stufe 8: Klassenarbeits-Niveau (feste, verifizierte Aufgabensammlung,
  // KEINE Laufzeit-Zufallsgenerierung -- da die Lösungen offene Terme sind
  // (nicht generisch prüfbar), wurden alle Aufgaben vorab erzeugt und
  // numerisch gegen ihre vereinfachte Form verifiziert. Sequentiell in
  // aufsteigender Schwierigkeit präsentiert, nicht zufällig gemischt. ----
  let _klausurIndex = 0;
  function gen_potenz_8() {
    const p = KLAUSUR_PROBLEMS[_klausurIndex % KLAUSUR_PROBLEMS.length];
    _klausurIndex++;
    // Schreibform aus den Feldern ableiten: Koeffizient vorne, Exponenten hochgestellt an den Variablen
    const lab = p.fieldLabels, vars = p.vars || [];
    let form = null, frage = p.question;
    if (lab[0] === "Koeffizient" && vars.length === lab.length - 1) { form = [0]; vars.forEach((v, i) => form.push(v, { h: i + 1 })); }
    else if (lab.length === 1 && vars.length === 1 && /\^\{\\;\?\}/.test(p.question)) { form = ["= " + vars[0], { h: 0 }]; frage = ""; }
    return {
      topic: "potenzrechnung", level: 8,
      prompt: p.prompt,
      promptText: p.prompt,
      question: frage,
      questionText: frage,
      eingabeForm: form,
      numFields: p.answer.length,
      fieldLabels: p.fieldLabels,
      answer: p.answer,
      data: { steps: p.steps, problemId: p.id, tier: p.tier, total: KLAUSUR_PROBLEMS.length, index: _klausurIndex }
    };
  }
  function check_potenz_8(task, userInputs) {
    const errors = [];
    task.answer.forEach((a, idx) => {
      if (a && typeof a === "object" && "num" in a) {
        const f = parseUserFraction(userInputs[idx]);
        if (!f || !fractionsEqual(f, a)) errors.push(idx);
      } else {
        const v = parseUserNumber(userInputs[idx]);
        if (isNaN(v) || v !== a) errors.push(idx);
      }
    });
    return { correct: errors.length === 0, fieldErrors: errors };
  }
  function steps_potenz_8(task) {
    return task.data.steps;
  }


  // ---------------- Potenzrechnung: Textaufgaben ----------------
  function gen_potenz_9() {
    const sub = choice(["bakterien", "nachricht", "schach", "tank", "fliesen", "fotos", "tropfen", "licht"]);
    const n = choice(NAMEN);
    if (sub === "bakterien") {
      const t = choice([10, 15, 20, 30]), N = choice([100, 500, 1000, 5000, 10000]);
      let k = 0; while (Math.pow(2, k) <= N) k++;
      return textTask("potenzrechnung", 9, "bakterien",
        T(`Ein Joghurt steht offen in der Sonne. Eine einzelne Bakterie teilt sich alle ${t} Minuten in zwei. Ab etwa ${tausender(N)} Bakterien ist der Joghurt verdorben.`),
        T("Nach wie vielen Teilungen und nach wie vielen Minuten sind es erstmals mehr als " + tausender(N) + " Bakterien?"), [
          { label: "Anzahl Teilungen", kind: "number", answer: k },
          { label: "Minuten", kind: "number", answer: k * t }
        ], [
          { label: "Nach k Teilungen sind es 2^k Bakterien: probieren" },
          { left: `2^{${k - 1}} = ${Math.pow(2, k - 1)} \\leq ${N}\\,, \\quad 2^{${k}} = ${Math.pow(2, k)} > ${N}`, right: "" },
          { label: "Zeit = Teilungen · Minuten pro Teilung" },
          { left: `${k}\\cdot ${t} = ${k * t}`, right: "" }
        ], { dataExtra: { t, N } });
    }
    if (sub === "nachricht") {
      const q = choice([2, 3, 4, 5]); let d; do { d = randInt(3, 6); } while (Math.pow(q, d) > 20000);
      return textTask("potenzrechnung", 9, "nachricht",
        T(`${n} schickt eine Kettennachricht an ${q} Leute. Jede Person, die sie bekommt, leitet sie am nächsten Tag an ${q} neue Leute weiter. Am 1. Tag bekommen sie also die ersten ${q} Leute.`),
        T(`Wie viele Leute bekommen die Nachricht am ${d}. Tag neu?`), [
          { label: "Anzahl Leute", kind: "number", answer: Math.pow(q, d) }
        ], [
          { label: `Jeden Tag ver-${q}-facht sich die Zahl der neuen Empfänger` },
          { left: T(`Tag 1: ${q}, Tag 2: ${q * q}, Tag 3: ${q * q * q}, …`), right: "" },
          { left: `\\text{Tag } ${d}: ${q}^{${d}} = ${Math.pow(q, d)}`, right: "" }
        ], { dataExtra: { q, d } });
    }
    if (sub === "schach") {
      const f = randInt(6, 16);
      return textTask("potenzrechnung", 9, "schach",
        T(`Ein Herrscher verspricht einem Erfinder Reiskörner: auf das 1. Feld eines Schachbretts 1 Korn, auf das 2. Feld 2 Körner, auf das 3. Feld 4 Körner – auf jedes Feld doppelt so viele wie auf das vorige.`),
        T(`Wie viele Körner liegen auf dem ${f}. Feld?`), [
          { label: "Anzahl Körner", kind: "number", answer: Math.pow(2, f - 1) }
        ], [
          { label: "Feld 1: 2⁰, Feld 2: 2¹, Feld 3: 2² … der Exponent ist immer eins kleiner als die Feldnummer" },
          { left: `2^{${f - 1}} = ${Math.pow(2, f - 1)}`, right: "" }
        ], { dataExtra: { f } });
    }
    if (sub === "tank") {
      const a = randInt(3, 10), V = a * a * a;
      return textTask("potenzrechnung", 9, "tank",
        T(`${n} baut für den Garten einen würfelförmigen Regenwassertank. Er soll genau ${tausender(V)} Liter fassen. (1 Liter = 1 dm³)`),
        T("Wie lang muss eine Innenkante sein (in dm)?"), [
          { label: "Kantenlänge in dm", kind: "number", answer: a }
        ], [
          { label: "Volumen eines Würfels = Kante³, also rückwärts die dritte Wurzel ziehen" },
          { left: `\\sqrt[3]{${V}} = ${a}`, right: "" },
          { left: T(`Probe: ${a} · ${a} · ${a} = ${V}`), right: "" }
        ], { dataExtra: { V } });
    }
    if (sub === "fliesen") {
      const s = randInt(3, 8), fl = choice([50, 25]), perM = 100 / fl, proSeite = s * perM;
      return textTask("potenzrechnung", 9, "fliesen",
        T(`Ein quadratisches Badezimmer hat eine Grundfläche von ${s * s} m². Der Boden soll mit quadratischen Fliesen der Größe ${fl} cm × ${fl} cm ausgelegt werden.`),
        T("Wie lang ist eine Wand, und wie viele Fliesen braucht man (ohne Verschnitt)?"), [
          { label: "Wandlänge in m", kind: "number", answer: s },
          { label: "Anzahl Fliesen", kind: "number", answer: proSeite * proSeite }
        ], [
          { label: "Wandlänge = Wurzel aus der Fläche" }, { left: `\\sqrt{${s * s}} = ${s}`, right: "" },
          { label: `Fliesen pro Wand: ${s} m = ${s * 100} cm, geteilt durch ${fl} cm` }, { left: `${s * 100} : ${fl} = ${proSeite}`, right: "" },
          { label: "Die Fläche ist ein Quadrat aus Fliesen" }, { left: `${proSeite}^{2} = ${proSeite * proSeite}`, right: "" }
        ], { dataExtra: { s, fl } });
    }
    if (sub === "fotos") {
      const G = choice([16, 32, 64, 128, 256]), m = choice([2, 4, 8]);
      const anzahl = (G / m) * 1000;
      return textTask("potenzrechnung", 9, "fotos",
        T(`${genitiv(n)} Handy hat ${G} GB freien Speicher. Ein Foto braucht etwa ${m} MB. (1 GB = 10⁹ Byte, 1 MB = 10⁶ Byte)`),
        T("Wie viele Fotos passen ungefähr noch auf das Handy?"), [
          { label: "Anzahl Fotos", kind: "number", answer: anzahl }
        ], [
          { label: "In Byte umrechnen" },
          { left: `${G}\\cdot 10^{9} : (${m}\\cdot 10^{6})`, right: "" },
          { label: "Zahlen und Zehnerpotenzen getrennt teilen" },
          { left: `(${G} : ${m})\\cdot 10^{9-6} = ${G / m}\\cdot 10^{3} = ${tausender(anzahl)}`, right: "" }
        ], { dataExtra: { G, m } });
    }
    if (sub === "tropfen") {
      const tr = choice([[5, 2], [4, 2], [25, 3], [2, 2]]); // 0,05 / 0,04 / 0,025 / 0,02 ml
      const ml = tr[0] / Math.pow(10, tr[1]);
      const anzahl = Math.round(1000 / ml);
      const mlText = String(ml).replace(".", ",");
      return textTask("potenzrechnung", 9, "tropfen",
        T(`Ein Wasserhahn tropft. Ein Tropfen hat etwa ${mlText} ml. ${n} stellt einen 1-Liter-Messbecher darunter.`),
        T("Wie viele Tropfen sind es, bis der Messbecher voll ist?"), [
          { label: "Anzahl Tropfen", kind: "number", answer: anzahl }
        ], [
          { label: "1 Liter = 1000 ml = 10³ ml" },
          { left: `${mlText} = ${tr[0]}\\cdot 10^{-${tr[1]}}`, right: "" },
          { label: "Teilen: Zehnerpotenzen durch Subtrahieren der Exponenten" },
          { left: `10^{3} : (${tr[0]}\\cdot 10^{-${tr[1]}}) = \\dfrac{1}{${tr[0]}}\\cdot 10^{3+${tr[1]}} = ${tausender(anzahl)}`, right: "" }
        ], { dataExtra: { ml } });
    }
    // licht
    const L = choice([
      { zu: "zur Sonne", von: "von der Sonne", m: 1.5, e: 8 }, { zu: "zum Jupiter", von: "vom Jupiter", m: 7.5, e: 8 },
      { zu: "zum Neptun", von: "vom Neptun", m: 4.5, e: 9 }, { zu: "zum Mond", von: "vom Mond", m: 3.9, e: 5 }, { zu: "zum Mars", von: "vom Mars", m: 2.25, e: 8 }
    ]);
    const sec = roundKfm((L.m * Math.pow(10, L.e)) / 3e5, 2);
    const hoch = (z) => String(z).split("").map((ch) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+ch]).join("");
    return textTask("potenzrechnung", 9, "licht",
      T(`Licht legt pro Sekunde etwa 3 · 10⁵ km zurück. Die Entfernung von der Erde ${L.zu} beträgt gerade etwa ${fmtNum(L.m)} · 10${hoch(L.e)} km.`),
      T(`Wie viele Sekunden braucht ein Lichtsignal ${L.von} bis zur Erde?`), [
        { label: "Sekunden", kind: "number", answer: sec, tol: 0.01 }
      ], [
        { label: "Zeit = Strecke : Geschwindigkeit" },
        { left: `(${fmtNum(L.m)}\\cdot 10^{${L.e}}) : (3\\cdot 10^{5}) = ${fmtNum(round4(L.m / 3))}\\cdot 10^{${L.e - 5}} = ${fmtNum(sec)}`, right: "" }
      ], { dataExtra: { m: L.m, e: L.e } });
  }

  // ---- Stufe 10: Wissenschaftliche Schreibweise (mit Einheitenvorsätzen) ----
  const VORSAETZE = [["k", 3, "Kilo"], ["M", 6, "Mega"], ["G", 9, "Giga"], ["m", -3, "Milli"], ["µ", -6, "Mikro"], ["n", -9, "Nano"]];
  const dezStr = (m, e) => { // m · 10^e als ausgeschriebene Dezimalzahl (m mit höchstens 2 Nachkommastellen)
    const z = String(m).replace(".", ""), komma = String(m).indexOf(".") === -1 ? String(m).length : String(m).indexOf(".");
    const pos = komma + e;
    if (pos <= 0) return "0," + "0".repeat(-pos) + z.replace(/0+$/, "");
    if (pos >= z.length) return tausender(z + "0".repeat(pos - z.length));
    return z.slice(0, pos) + "," + z.slice(pos);
  };
  function gen_potenz_10() {
    const sub = choice(["zuWiss", "zuWiss", "zurueck", "einheit", "rechnen"]);
    const m = choice([1.5, 2, 2.4, 3.2, 4.5, 6, 7.25, 8.1, 9.6]);
    if (sub === "zuWiss" || sub === "zurueck") {
      const e = choice([-7, -6, -5, -4, -3, -2, 3, 4, 5, 6, 7, 8]);
      if (sub === "zuWiss") return { topic: "potenzrechnung", level: 10, subtype: sub, signed: true, prompt: dezStr(m, e), promptText: "wiss",
        question: `\\text{Schreibe in wissenschaftlicher Schreibweise}\\;\\; (1 \\leq a < 10).`, numFields: 2, fieldLabels: ["a", "n"], eingabeForm: [0, "\\cdot 10", { h: 1 }], answer: [m, e], data: { m, e } };
      return { topic: "potenzrechnung", level: 10, subtype: sub, signed: true, prompt: `${fmtNum(m)}\\cdot 10^{${e}}`, promptText: "zurück",
        question: `\\text{Schreibe als Dezimalzahl.}`, numFields: 1, fieldLabels: ["Dezimalzahl"], answer: [Number((m * Math.pow(10, e)).toPrecision(12))], data: { m, e } };
    }
    if (sub === "einheit") {
      const [vs, ve, vname] = choice(VORSAETZE), einheit = choice([["m", "Meter"], ["g", "Gramm"], ["W", "Watt"]]), zahl = choice([2, 3, 5, 12, 25, 45, 250, 640]);
      const exp10 = Math.floor(Math.log10(zahl)), a = zahl / Math.pow(10, exp10), n = exp10 + ve;
      return { topic: "potenzrechnung", level: 10, subtype: sub, signed: true, prompt: T(`${zahl} ${vs}${einheit[0]}`), promptText: "Einheit",
        question: `\\text{Schreibe in ${einheit[1]} (${einheit[0]}) in wissenschaftlicher Schreibweise.}`, numFields: 2, fieldLabels: ["a", "n"], eingabeForm: [0, "\\cdot 10", { h: 1 }], answer: [a, n], data: { zahl, vs, ve, vname, a, n } };
    }
    const m1 = choice([2, 3, 4, 5, 6, 8]), m2 = choice([2, 3, 4, 5, 1.5, 2.5]), e1 = randInt(-6, 8), e2 = randInt(-6, 8), op = choice(["mal", "durch"]);
    let a = op === "mal" ? m1 * m2 : m1 / m2, n = op === "mal" ? e1 + e2 : e1 - e2;
    while (a >= 10) { a /= 10; n++; } while (a < 1) { a *= 10; n--; }
    a = Number(a.toPrecision(10));
    if (String(a).split(".")[1] && String(a).split(".")[1].length > 3) return gen_potenz_10();
    return { topic: "potenzrechnung", level: 10, subtype: sub, signed: true, prompt: `(${fmtNum(m1)}\\cdot 10^{${e1}}) ${op === "mal" ? "\\cdot" : ":"} (${fmtNum(m2)}\\cdot 10^{${e2}})`, promptText: "rechnen",
      question: `\\text{Berechne. Ergebnis in wissenschaftlicher Schreibweise.}`, numFields: 2, fieldLabels: ["a", "n"], eingabeForm: [0, "\\cdot 10", { h: 1 }], answer: [a, n], data: { m1, m2, e1, e2, op } };
  }
  function check_potenz_10(task, inp) { const err = []; task.answer.forEach((x, i) => { const v = parseUserNumber(inp[i]); if (isNaN(v) || Math.abs(v - x) > 1e-9 * Math.max(1, Math.abs(x))) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
  function steps_potenz_10(task) {
    const d = task.data, s = task.subtype;
    if (s === "zuWiss") return [{ label: "Komma so verschieben, dass genau eine Ziffer (nicht 0) davor steht; Anzahl der Stellen = Exponent (nach links +, nach rechts −)" }, { left: `${dezStr(d.m, d.e)} = ${fmtNum(d.m)}\\cdot 10^{${d.e}}`, right: "" }];
    if (s === "zurueck") return [{ label: d.e > 0 ? `Komma um ${d.e} Stellen nach rechts` : `Komma um ${-d.e} Stellen nach links` }, { left: `${fmtNum(d.m)}\\cdot 10^{${d.e}} = ${dezStr(d.m, d.e)}`, right: "" }];
    if (s === "einheit") return [{ label: `${d.vname} bedeutet 10^${d.ve}` }, { left: `${d.zahl}\\cdot 10^{${d.ve}} = ${fmtNum(d.a)}\\cdot 10^{${d.n}}`, right: "" }];
    const [a, n] = task.answer;
    return [{ label: "Zahlen und Zehnerpotenzen getrennt rechnen (Exponenten addieren bzw. subtrahieren), danach a wieder zwischen 1 und 10 bringen" },
      { left: `${d.op === "mal" ? `(${fmtNum(d.m1)}\\cdot ${fmtNum(d.m2)})\\cdot 10^{${d.e1} + (${d.e2})}` : `(${fmtNum(d.m1)} : ${fmtNum(d.m2)})\\cdot 10^{${d.e1} - (${d.e2})}`} = ${fmtNum(a)}\\cdot 10^{${n}}`, right: "" }];
  }

  // ---- Stufe 11: Zusammenfassen, gleiche Exponenten, Wurzeln vereinfachen ----
  function gen_potenz_11() {
    const sub = choice(["gleicherExp", "zusammenfassen", "wurzelAdd", "teilweise"]);
    if (sub === "gleicherExp") {
      const [p, q] = choice([[2, 5], [4, 25], [5, 2], [2.5, 4], [0.5, 4]]), n = randInt(2, 4), div = Math.random() < 0.4;
      if (div) { const [c, k] = choice([[12, 4], [15, 5], [36, 12], [20, 4]]), m2 = randInt(2, 3); return { topic: "potenzrechnung", level: 11, subtype: sub, prompt: `${c}^{${m2}} : ${k}^{${m2}}`, promptText: "gleicher Exp",
        question: `\\text{Berechne geschickt (ohne Taschenrechner).}`, numFields: 1, fieldLabels: ["Ergebnis"], answer: [Math.pow(c / k, m2)], data: { a: c, b: k, n: m2, div: true } }; }
      return { topic: "potenzrechnung", level: 11, subtype: sub, prompt: `${fmtNum(p)}^{${n}}\\cdot ${fmtNum(q)}^{${n}}`, promptText: "gleicher Exp",
        question: `\\text{Berechne geschickt (ohne Taschenrechner).}`, numFields: 1, fieldLabels: ["Ergebnis"], answer: [Math.round(Math.pow(p * q, n))], data: { a: p, b: q, n, div: false } };
    }
    if (sub === "zusammenfassen") {
      const n = randInt(2, 5), v = choice(["x", "a", "y"]), ks = [randInt(2, 9), randInt(1, 9), randInt(1, 9)], vz = [1, choice([1, -1]), choice([1, -1])];
      const k = ks.reduce((s, x, i) => s + vz[i] * x, 0);
      const term = ks.map((x, i) => `${i === 0 ? "" : vz[i] > 0 ? " + " : " - "}${x === 1 ? "" : x}${v}^{${n}}`).join("");
      return { topic: "potenzrechnung", level: 11, subtype: sub, signed: true, prompt: term, promptText: "zusammenfassen",
        question: `\\text{Fasse zusammen.}`, numFields: 2, fieldLabels: ["Zahl davor", "Exponent"], eingabeForm: [0, v, { h: 1 }], answer: [k, n], data: { ks, vz, n } };
    }
    if (sub === "teilweise") {
      const r = choice([2, 3, 5, 6, 7]), q = randInt(2, 6);
      return { topic: "potenzrechnung", level: 11, subtype: sub, prompt: `\\sqrt{${q * q * r}}`, promptText: "teilweise",
        question: `${T("Ziehe teilweise die Wurzel (unter der Wurzel so klein wie möglich).")}`, numFields: 2, fieldLabels: ["Zahl vor der Wurzel", "Zahl unter der Wurzel"], eingabeForm: [0, "√", 1], answer: [q, r], data: { q, r } };
    }
    const r = choice([2, 3, 5]), [q1, q2] = [randInt(2, 4), randInt(2, 5)], vz = choice([1, -1]);
    return { topic: "potenzrechnung", level: 11, subtype: "wurzelAdd", signed: true, prompt: `\\sqrt{${q1 * q1 * r}} ${vz > 0 ? "+" : "-"} \\sqrt{${q2 * q2 * r}}`, promptText: "Wurzeln addieren",
      question: `\\text{Vereinfache.}`, numFields: 1, fieldLabels: [`Zahl vor √${r}`], eingabeForm: [0, `\\sqrt{${r}}`], answer: [q1 + vz * q2], data: { q1, q2, r, vz } };
  }
  function steps_potenz_11(task) {
    const d = task.data, s = task.subtype;
    if (s === "gleicherExp") return d.div ? [{ label: "Gleicher Exponent: erst die Basen dividieren" }, { left: `${d.a}^{${d.n}} : ${d.b}^{${d.n}} = (${d.a} : ${d.b})^{${d.n}} = ${d.a / d.b}^{${d.n}} = ${task.answer[0]}`, right: "" }]
      : [{ label: "Gleicher Exponent: erst die Basen multiplizieren" }, { left: `(${fmtNum(d.a)}\\cdot ${fmtNum(d.b)})^{${d.n}} = ${fmtNum(d.a * d.b)}^{${d.n}} = ${task.answer[0]}`, right: "" }];
    if (s === "zusammenfassen") return [{ label: "Nur gleichartige Potenzen (gleiche Basis UND gleicher Exponent) addieren: Zahlen davor verrechnen, Exponent bleibt" }, { left: `= ${task.answer[0]}\\,x^{${d.n}}`.replace("x", task.prompt.match(/[xay]/)[0]), right: "" }];
    if (s === "teilweise") return [{ label: "Den größten Quadratfaktor herausziehen" }, { left: `\\sqrt{${d.q * d.q * d.r}} = \\sqrt{${d.q * d.q}\\cdot ${d.r}} = ${d.q}\\sqrt{${d.r}}`, right: "" }];
    return [{ label: "Erst teilweise radizieren, dann gleichartige Wurzeln zusammenfassen" }, { left: `${d.q1}\\sqrt{${d.r}} ${d.vz > 0 ? "+" : "-"} ${d.q2}\\sqrt{${d.r}} = ${task.answer[0]}\\sqrt{${d.r}}`, right: "" }];
  }

  TOPICS.potenzrechnung = {
      name: "Potenzrechnung",
      grade: "Kl. 6–10",
      levels: [
        { id: 1, name: "Potenzen berechnen", grade: "Kl. 6–7", signed: true, generate: gen_potenz_1, check: check_potenz_1, steps: steps_potenz_1 },
        { id: 2, name: "Potenzgesetze", grade: "Kl. 7–8", generate: gen_potenz_2, check: check_potenz_2, steps: steps_potenz_2 },
        { id: 3, name: "Nullter & negativer Exponent", grade: "Kl. 8–9", generate: gen_potenz_3, check: check_potenz_3, steps: steps_potenz_3 },
        { id: 4, name: "Logarithmus-Grundlagen", grade: "Kl. 9–10", generate: gen_potenz_4, check: check_potenz_4, steps: steps_potenz_4 },
        { id: 5, name: "Potenzgesetze mit Variablen", grade: "Kl. 8–9 (Vertiefung)", generate: gen_potenz_5, check: check_potenz_5, steps: steps_potenz_5 },
        { id: 6, name: "Wurzeln berechnen", grade: "Kl. 7–9", generate: gen_potenz_6, check: check_potenz_6, steps: steps_potenz_6 },
        { id: 7, name: "Graphen zuordnen", grade: "Kl. 9–10", generate: gen_potenz_7, check: check_potenz_7, steps: steps_potenz_7 },
        { id: 8, name: "Klassenarbeits-Niveau", grade: "Kl. 10 (Vertiefung)", signed: true, generate: gen_potenz_8, check: check_potenz_8, steps: steps_potenz_8 },
        { id: 10, name: "Wissenschaftliche Schreibweise", grade: "Kl. 8–9", signed: true, generate: gen_potenz_10, check: check_potenz_10, steps: steps_potenz_10 },
        { id: 11, name: "Zusammenfassen und Wurzeln vereinfachen", grade: "Kl. 9", signed: true, generate: gen_potenz_11, check: check_potenz_10, steps: steps_potenz_11 },
        { id: 9, name: "Textaufgaben", grade: "Kl. 6–10", generate: gen_potenz_9, check: check_textaufgabe, steps: steps_textaufgabe }
      ]
  };
  // ---------- POTENZEN (Kl. 9/10) ----------
  const KA_POTENZ = [
    { key: "vereinfachen", teil: "A", afb: 1, titel: "Potenzgesetze anwenden", baue: () => ({ kontext: T("Vereinfache bzw. berechne ohne Taschenrechner."), teile: [
      stufenTeil("potenzrechnung", 2), stufenTeil("potenzrechnung", 5), stufenTeil("potenzrechnung", 3), stufenTeil("potenzrechnung", 6, (t) => t.subtype !== "sqrt")] }) },
    { key: "terme", teil: "A", afb: 2, titel: "Terme vereinfachen", baue: () => ({ kontext: T("Vereinfache so weit wie möglich."), teile: [stufenTeil("potenzrechnung", 8), stufenTeil("potenzrechnung", 8)] }) },
    { key: "graphen", teil: "A", afb: 2, titel: "Potenzfunktionen zuordnen", baue: () => ({ kontext: "", teile: [stufenTeil("potenzrechnung", 7)] }) },
    { key: "fehler", teil: "A", afb: 3, titel: "Fehler finden und Aussagen prüfen", baue: () => {
      const pool = [
        () => { const a = randInt(2, 6), b = randInt(2, 6); return fehlerTeil(`${T("Jonas rechnet:")}\\;\\; x^{${a}}\\cdot x^{${b}} = x^{${a * b}}`,
          ["Die Exponenten wurden multipliziert statt addiert.", "Die Basis hätte multipliziert werden müssen.", "Die Rechnung ist richtig."],
          { label: "richtiger Exponent", kind: "number", answer: a + b }, [{ left: `x^{${a}}\\cdot x^{${b}} = x^{${a}+${b}} = x^{${a + b}}`, right: "" }]); },
        () => { const a = randInt(2, 5), b = randInt(2, 5); return fehlerTeil(`${T("Lina rechnet:")}\\;\\; (x^{${a}})^{${b}} = x^{${a + b}}`,
          ["Bei einer Potenz einer Potenz werden die Exponenten multipliziert, nicht addiert.", "Man hätte die Exponenten subtrahieren müssen.", "Die Rechnung ist richtig."],
          { label: "richtiger Exponent", kind: "number", answer: a * b }, [{ left: `(x^{${a}})^{${b}} = x^{${a}\\cdot ${b}} = x^{${a * b}}`, right: "" }]); },
        () => { const a = choice([2, 3, 5]), n = a === 5 ? 2 : randInt(2, 3); return fehlerTeil(`${T("Ben rechnet:")}\\;\\; ${a}^{-${n}} = -${Math.pow(a, n)}`,
          ["Ein negativer Exponent bedeutet Kehrwert, nicht negatives Ergebnis.", "Er hätte den Exponenten weglassen müssen.", "Die Rechnung ist richtig."],
          { label: "richtiger Wert", kind: "fraction", answer: { num: 1, den: Math.pow(a, n) } }, [{ left: `${a}^{-${n}} = \\dfrac{1}{${a}^{${n}}} = \\dfrac{1}{${Math.pow(a, n)}}`, right: "" }]); },
        () => { const [a, b, c] = choice([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]); return fehlerTeil(`${T("Emma rechnet:")}\\;\\; \\sqrt{${a * a} + ${b * b}} = ${a} + ${b} = ${a + b}`,
          ["Die Wurzel aus einer Summe ist nicht die Summe der Wurzeln.", "Sie hätte die Wurzel erst am Ende ziehen dürfen, aber das Ergebnis stimmt.", "Die Rechnung ist richtig."],
          { label: "richtiger Wert", kind: "number", answer: c }, [{ left: `\\sqrt{${a * a} + ${b * b}} = \\sqrt{${c * c}} = ${c}`, right: "" }]); },
        () => aussageTeil(`${T("Tim behauptet: „")}x^{-2}${T(" ist für jedes x ≠ 0 negativ.“")}`, false, ["x⁻² = 1/x² ist immer positiv.", "Stimmt, wegen des Minuszeichens im Exponenten.", "Stimmt nur für negative x."]),
        () => aussageTeil(`${T("Mia behauptet: „")}(a + b)^{2} = a^{2} + b^{2}${T("“")}`, false, ["Es fehlt das Mischglied 2ab.", "Stimmt, man darf jeden Summanden einzeln quadrieren.", "Stimmt nur für positive a und b."]),
        () => aussageTeil(`${T("Noah behauptet: „")}2^{10}${T(" ist größer als ")}10^{3}${T(".“")}`, true, ["2¹⁰ = 1024 und 10³ = 1000.", "Weil der Exponent 10 größer ist als 3.", "Weil 2 kleiner ist als 10."])
      ];
      return { kontext: "", teile: mische(pool).slice(0, 3).map((f) => f()) };
    } },
    { key: "wachstum", teil: "B", afb: 2, titel: "Verdopplung und Logarithmus", baue: () => {
      const a = stufenTeil("potenzrechnung", 9, (t) => ["bakterien", "nachricht", "schach"].includes(t.subtype));
      return { kontext: "", teile: [a, stufenTeil("potenzrechnung", 4), stufenTeil("exponentialrechnung", 3)] };
    } },
    { key: "sach", teil: "B", afb: 2, titel: "Große und kleine Zahlen im Alltag", baue: () => {
      const a = stufenTeil("potenzrechnung", 9); let b; do { b = stufenTeil("potenzrechnung", 9); } while (b.task.subtype === a.task.subtype);
      return { kontext: "", teile: [a, b] };
    } }
  ];

  KA_POTENZ.push(
    { key: "zehnerpotenzen", teil: "A", afb: 1, titel: "Wissenschaftliche Schreibweise", baue: () => ({ kontext: "", teile: [
      stufenTeil("potenzrechnung", 10, (t) => t.subtype === "zuWiss"), stufenTeil("potenzrechnung", 10, (t) => t.subtype === "zurueck"), stufenTeil("potenzrechnung", 10, (t) => t.subtype === "einheit"), stufenTeil("potenzrechnung", 10, (t) => t.subtype === "rechnen")] }) },
    { key: "vereinfachen2", teil: "A", afb: 2, titel: "Zusammenfassen und Wurzeln", baue: () => ({ kontext: "", teile: [
      stufenTeil("potenzrechnung", 11, (t) => t.subtype === "gleicherExp"), stufenTeil("potenzrechnung", 11, (t) => t.subtype === "zusammenfassen"), stufenTeil("potenzrechnung", 11, (t) => t.subtype === "teilweise"), stufenTeil("potenzrechnung", 11, (t) => t.subtype === "wurzelAdd")] }) }
  );
  KA_VORLAGEN.potenzrechnung = KA_POTENZ;
  KA_INFO.potenzrechnung = { klasse: "Kl. 9/10", tr: true };
  Object.assign(ERKL, {
    "potenzrechnung/1": E("Potenzen berechnen",
      [`a^{n} = a\\cdot a\\cdot \\ldots \\cdot a\\;\\;${T("(n-mal)")}`, T("Die Basis wird so oft mit sich selbst multipliziert, wie der Exponent angibt."),
       T("Negative Basis: gerader Exponent ⇒ Ergebnis positiv, ungerader Exponent ⇒ negativ.")],
      [{ left: `(-3)^{3} = (-3)\\cdot (-3)\\cdot (-3)`, right: "" }, { left: `= 9\\cdot (-3) = -27`, right: "" }],
      [T("Basis mal Exponent rechnen: 3⁴ ist 81, nicht 12."), T("−3² und (−3)² verwechseln: −3² = −9, aber (−3)² = 9.")]),
    "potenzrechnung/2": E("Potenzgesetze",
      [`a^{m}\\cdot a^{n} = a^{m+n}`, `a^{m} : a^{n} = a^{m-n}`, `(a^{m})^{n} = a^{m\\cdot n}`, `\\sqrt[n]{a^{m}} = a^{\\frac{m}{n}}`,
       T("Die Gesetze gelten nur bei gleicher Basis (bzw. beim Potenzieren einer Potenz).")],
      [{ left: `2^{3}\\cdot 2^{4} = 2^{3+4} = 2^{7}`, right: "" }, { left: `(5^{2})^{3} = 5^{2\\cdot 3} = 5^{6}`, right: "" }, { left: `\\sqrt[3]{7^{6}} = 7^{\\frac{6}{3}} = 7^{2}`, right: "" }],
      [T("Beim Multiplizieren die Exponenten multiplizieren: x³ · x⁴ ist x⁷, nicht x¹²."), T("Bei der Potenz einer Potenz addieren: (x³)⁴ ist x¹², nicht x⁷.")]),
    "potenzrechnung/3": E("Nullter und negativer Exponent",
      [`a^{0} = 1\\;\\;${T("(für a ≠ 0)")}`, `a^{-n} = \\dfrac{1}{a^{n}}`, T("Ein negativer Exponent bildet den Kehrwert – das Ergebnis wird dadurch nicht negativ.")],
      [{ left: `2^{-3} = \\dfrac{1}{2^{3}} = \\dfrac{1}{8}`, right: "" }, { left: `7^{0} = 1`, right: "" }],
      [T("2⁻³ = −8 rechnen: Das Minus im Exponenten heißt Kehrwert."), T("a⁰ = 0 schreiben: Jede Zahl (außer 0) hoch 0 ergibt 1.")]),
    "potenzrechnung/4": E("Logarithmus",
      [`\\log_{b}(a) = x \\;\\Leftrightarrow\\; b^{x} = a`, T("Der Logarithmus fragt nach dem Exponenten: b hoch wie viel ergibt a?"), T("lg = Logarithmus zur Basis 10, ln = zur Basis e.")],
      [{ left: `\\log_{2}(32) = ?`, right: "" }, { left: `2^{5} = 32 \\;\\Rightarrow\\; \\log_{2}(32) = 5`, right: "" }],
      [T("a durch b teilen: log₂(32) ist 5, nicht 16.")]),
    "potenzrechnung/5": E("Potenzgesetze mit Variablen",
      [T("Zahlen (Koeffizienten) und Potenzen getrennt behandeln:"), `3x^{2}\\cdot 4x^{5} = (3\\cdot 4)\\,x^{2+5}`, `(2x^{3})^{2} = 2^{2}\\,x^{3\\cdot 2}`, T("Verschiedene Basen (x und y) werden einzeln zusammengefasst.")],
      [{ left: `12x^{7} : 4x^{2} = (12:4)\\,x^{7-2} = 3x^{5}`, right: "" }, { left: `(2x^{3})^{2} = 4x^{6}`, right: "" }],
      [T("Koeffizienten addieren statt multiplizieren: 3x² · 4x⁵ ist 12x⁷, nicht 7x⁷."), T("Beim Potenzieren die Zahl vergessen: (2x³)² ist 4x⁶, nicht 2x⁶.")]),
    "potenzrechnung/6": E("Wurzeln",
      [`\\sqrt{a} = b \\;\\Leftrightarrow\\; b^{2} = a\\;\\;${T("(b ≥ 0)")}`, `\\sqrt[3]{a} = b \\;\\Leftrightarrow\\; b^{3} = a`, `\\sqrt{a}\\cdot \\sqrt{b} = \\sqrt{a\\cdot b}`],
      [{ left: `\\sqrt{144} = 12\\;\\;${T("denn 12² = 144")}`, right: "" }, { left: `\\sqrt{2}\\cdot \\sqrt{8} = \\sqrt{16} = 4`, right: "" }],
      [T("Die Wurzel ist nicht die Hälfte: √16 = 4, nicht 8."), T("Wurzel aus einer Summe aufteilen: √(9 + 16) = 5, nicht 3 + 4.")]),
    "potenzrechnung/7": E("Graphen von Potenzfunktionen",
      [T("Gerader positiver Exponent (x², x⁴): Parabel, symmetrisch zur y-Achse."), T("Ungerader positiver Exponent (x³, x⁵): S-Form, punktsymmetrisch zum Ursprung."),
       T("Negativer Exponent (x⁻¹, x⁻²): Hyperbel, nähert sich den Achsen."), T("Ein Faktor davor (3x⁵) macht den Graphen steiler, ein Minus spiegelt ihn an der x-Achse.")],
      [], [T("x² und x⁴ verwechseln: x⁴ ist bei |x| < 1 flacher und danach steiler.")], "potenzgraphen"),
    "potenzrechnung/8": E("Terme vereinfachen",
      [T("Wurzeln als Potenzen schreiben: ⁿ√(aᵐ) = a^(m/n)."), T("Dann Schritt für Schritt die Potenzgesetze anwenden; Brüche im Exponenten wie normale Brüche addieren."), T("Bei Brüchen hoch eine Zahl: Zähler und Nenner einzeln potenzieren.")],
      [{ left: `\\sqrt{x}\\cdot \\sqrt[3]{x} = x^{\\frac{1}{2}}\\cdot x^{\\frac{1}{3}} = x^{\\frac{1}{2}+\\frac{1}{3}} = x^{\\frac{5}{6}}`, right: "" }],
      [T("Brüche im Exponenten falsch addieren: ½ + ⅓ ist 5/6, nicht 2/5.")]),
    "potenzrechnung/9": E("Potenzen im Alltag",
      [T("Verdopplung bei jedem Schritt: nach n Schritten 2ⁿ (Start mit 1)."), T("Würfel: Volumen = Kante³ (1 dm³ = 1 Liter); Quadrat: Fläche = Seite²."),
       T("Zehnerpotenzen teilen: Zahlen teilen, Exponenten subtrahieren. 1 GB = 10⁹ Byte, 1 MB = 10⁶ Byte.")],
      [{ left: `\\dfrac{64\\cdot 10^{9}}{4\\cdot 10^{6}} = 16\\cdot 10^{3} = 16\\,000`, right: "" }],
      [T("Feld 1 auf dem Schachbrett hat 2⁰ = 1 Korn – der Exponent ist eins kleiner als die Feldnummer."), T("Durch 3 teilen statt dritte Wurzel ziehen.")]),
  });
  Object.assign(DIAG, {
    "potenzrechnung/1": (t, i, w) => (nah(w.v, t.data.a * t.data.n) ? H.potenzNichtMal : null),
    "potenzrechnung/2": (t, i, w) => {
      const { m, n } = t.data, s = t.subtype;
      if (s === "mult" && nah(w.v, m * n)) return H.expAddieren;
      if (s === "div" && (nah(w.v, m + n) || nah(w.v, m / n))) return H.expSubtrahieren;
      if (s === "pow" && nah(w.v, m + n)) return H.expMultiplizieren;
      if (s === "root" && (nah(w.v, m * n) || nah(w.v, m - n))) return H.wurzelTeilen;
      return null;
    },
    "potenzrechnung/3": (t, i, w) => {
      if (t.subtype === "zero") return nah(w.v, 0) || nah(w.v, t.data.a) ? H.nullExponent : null;
      const den = t.data.den;
      if (nah(w.v, -den) || nah(w.v, -1 / den)) return H.negExpNichtNegativ;
      if (nah(w.v, den)) return H.negExpKehrwert;
      return null;
    },
    "potenzrechnung/4": (t, i, w) => (nah(w.v, t.data.a / t.data.b) ? H.logExponent : null),
    "potenzrechnung/5": (t, i, w) => {
      const d = t.data, s = t.subtype;
      if (i === 0) {
        if (s === "coefMul" && nah(w.v, d.c1 + d.c2)) return H.koeffMal;
        if (s === "coefDiv" && nah(w.v, d.c1 - d.c2)) return H.koeffGeteilt;
        if (s === "coefPow" && nah(w.v, d.c * d.n)) return H.koeffPotenz;
        if (s === "twoVar" && nah(w.v, d.a * d.c)) return H.expAddieren;
      } else {
        if (s === "coefMul" && nah(w.v, d.m * d.n)) return H.expAddieren;
        if (s === "coefDiv" && nah(w.v, d.m + d.n)) return H.expSubtrahieren;
        if (s === "coefPow" && nah(w.v, d.m + d.n)) return H.expMultiplizieren;
        if (s === "twoVar" && nah(w.v, d.b * d.d)) return H.expAddieren;
      }
      return null;
    },
    "potenzrechnung/6": (t, i, w) => {
      const d = t.data;
      if (t.subtype === "sqrt" && nah(w.v, d.a / 2)) return H.wurzelHaelfte;
      if (t.subtype === "cbrt" && nah(w.v, d.a / 3)) return H.wurzelHaelfte;
      if (t.subtype === "productLaw" && nah(w.v, d.a + d.b)) return H.wurzelProdukt;
      return null;
    },
    "potenzrechnung/9": (t, i, w) => {
      const d = t.dataExtra, s = t.subtype;
      if (s === "bakterien" && i === 0 && nah(w.v, t.answer[0] - 1)) return H.aufrunden;
      if (s === "nachricht" && (nah(w.v, d.q * d.d) || nah(w.v, d.q + d.d))) return H.tagNichtAddieren;
      if (s === "schach" && nah(w.v, Math.pow(2, d.f))) return H.schachExp;
      if (s === "tank" && nah(w.v, d.V / 3)) return H.dritteWurzel;
      if (s === "fotos" && nah(w.v, d.G / d.m)) return H.einheiten;
      return null;
    }
  });
  Object.assign(ERKL, {
    "potenzrechnung/10": E("Wissenschaftliche Schreibweise", [`a\\cdot 10^{n}\\;\\; ${T("mit 1 ≤ a < 10")}`, T("Komma nach links verschieben ⇒ n positiv, nach rechts ⇒ n negativ."), T("Vorsätze: k = 10³, M = 10⁶, G = 10⁹, m = 10⁻³, µ = 10⁻⁶, n = 10⁻⁹.")],
      [{ left: `0,00045 = 4,5\\cdot 10^{-4}\\,, \\qquad 25\\;${T("nm")} = 25\\cdot 10^{-9}\\;${T("m")} = 2,5\\cdot 10^{-8}\\;${T("m")}`, right: "" }],
      [T("a nicht zwischen 1 und 10 lassen (25 · 10⁻⁹ ist keine wissenschaftliche Schreibweise)."), T("Vorzeichen des Exponenten vertauschen.")]),
    "potenzrechnung/11": E("Zusammenfassen und Wurzeln vereinfachen", [`a^{n}\\cdot b^{n} = (a\\cdot b)^{n}`, T("Addieren nur bei gleicher Basis UND gleichem Exponenten: 3x² + 5x² = 8x² (aber 3x² + 2x³ lässt sich nicht zusammenfassen)."), `\\sqrt{a^{2}\\cdot b} = a\\sqrt{b}`],
      [{ left: `2^{3}\\cdot 5^{3} = 10^{3} = 1000\\,, \\qquad \\sqrt{12} + \\sqrt{27} = 2\\sqrt{3} + 3\\sqrt{3} = 5\\sqrt{3}`, right: "" }],
      [T("Beim Addieren die Exponenten addieren: 3x² + 5x² ist NICHT 8x⁴."), T("√(a + b) = √a + √b rechnen – das ist falsch.")])
  });
  H.expAddiertBeimPlus = "Beim Addieren bleibt der Exponent gleich – nur die Zahlen davor werden verrechnet.";
  H.vorzeichenExp = "Komma nach rechts verschoben ⇒ negativer Exponent (und umgekehrt).";
  H.aNichtNormiert = "In der wissenschaftlichen Schreibweise muss a zwischen 1 und 10 liegen.";
  Object.assign(DIAG, {
    "potenzrechnung/10": (t, i, w) => { if (i === 1 && t.answer[1] !== 0 && nah(w.v, -t.answer[1])) return H.vorzeichenExp; if (i === 0 && (w.v >= 10 || w.v < 1) && w.v > 0) return H.aNichtNormiert; return null; },
    "potenzrechnung/11": (t, i, w) => (t.subtype === "zusammenfassen" && i === 1 && nah(w.v, t.data.n * 2) ? H.expAddiertBeimPlus : null)
  });
