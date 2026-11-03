  // ============================================================
  // EXPONENTIALRECHNUNG
  // ============================================================

  function gen_expo_1() {
    const a = choice([50, 100, 150, 200, 250, 300, 400, 500]);
    const growth = Math.random() < 0.6;
    const p = growth ? choice([5, 10, 15, 20, 25, 30]) : choice([5, 10, 15, 20, 25, 30, 35, 40]);
    const b = growth ? 1 + p / 100 : 1 - p / 100;
    const x = randInt(1, 6);
    const exact = a * Math.pow(b, x);
    const answer = round2(exact);
    return {
      topic: "exponentialrechnung", level: 1,
      prompt: `f(x) = ${a}\\cdot${fmtNum(round2(b))}^{x}`,
      promptText: `f(x) = ${a} · ${round2(b)}^x`,
      question: `f(${x}) = \\;?`,
      questionText: `f(${x}) = ?`,
      numFields: 1,
      fieldLabels: ["f(x)"],
      tolerance: Math.max(0.5, Math.abs(answer) * 0.01),
      answer: [answer],
      data: { a, p, b, x, growth, exact }
    };
  }
  function check_expo_1(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    const ok = numbersClose(v, task.answer[0], task.tolerance);
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_expo_1(task) {
    const { a, p, b, x, growth, exact } = task.data;
    return [
      { left: `b = 1 ${growth ? "+" : "-"} \\dfrac{${p}}{100} = ${fmtNum(round2(b))}`, right: growth ? "Wachstum" : "Zerfall" },
      { left: `f(${x}) = ${a}\\cdot${fmtNum(round2(b))}^{${x}}`, right: "einsetzen" },
      { left: `\\approx ${fmtNum(round2(exact))}`, right: "" }
    ];
  }

  const WACHSTUM_PHRASEN = [
    // "um"-Formulierungen: Änderung wird zum Ausgangswert addiert/subtrahiert
    { mode: "um", growth: true, make: (p) => ({ prompt: `\\text{Zuwachs um }${p}\\,\\%`, text: `Zuwachs um ${p} %` }) },
    { mode: "um", growth: true, make: (p) => ({ prompt: `\\text{Anstieg um }${p}\\,\\%`, text: `Anstieg um ${p} %` }) },
    { mode: "um", growth: true, make: (p) => ({ prompt: `\\text{Erhöhung um }${p}\\,\\%`, text: `Erhöhung um ${p} %` }) },
    { mode: "um", growth: true, make: (p) => ({ prompt: `\\text{Wertsteigerung um }${p}\\,\\%`, text: `Wertsteigerung um ${p} %` }) },
    { mode: "um", growth: true, make: (p) => ({ prompt: `\\text{Preiserhöhung um }${p}\\,\\%`, text: `Preiserhöhung um ${p} %` }) },
    { mode: "um", growth: true, make: (p) => ({ prompt: `\\text{Zunahme um }${p}\\,\\%`, text: `Zunahme um ${p} %` }) },
    { mode: "um", growth: true, make: (p) => ({ prompt: `${p}\\,\\%\\text{ Wachstum}`, text: `${p} % Wachstum` }) },
    { mode: "um", growth: false, make: (p) => ({ prompt: `\\text{Abnahme um }${p}\\,\\%`, text: `Abnahme um ${p} %` }) },
    { mode: "um", growth: false, make: (p) => ({ prompt: `\\text{Rückgang um }${p}\\,\\%`, text: `Rückgang um ${p} %` }) },
    { mode: "um", growth: false, make: (p) => ({ prompt: `\\text{Verringerung um }${p}\\,\\%`, text: `Verringerung um ${p} %` }) },
    { mode: "um", growth: false, make: (p) => ({ prompt: `\\text{Wertverlust von }${p}\\,\\%`, text: `Wertverlust von ${p} %` }) },
    { mode: "um", growth: false, make: (p) => ({ prompt: `\\text{Preisrückgang um }${p}\\,\\%`, text: `Preisrückgang um ${p} %` }) },
    { mode: "um", growth: false, make: (p) => ({ prompt: `\\text{Reduzierung um }${p}\\,\\%`, text: `Reduzierung um ${p} %` }) },
    { mode: "um", growth: false, make: (p) => ({ prompt: `${p}\\,\\%\\text{ Rückgang}`, text: `${p} % Rückgang` }) },
    // "auf"-Formulierungen: Zielwert wird direkt als Prozentsatz des Ausgangswerts
    // genannt -- b ergibt sich hier OHNE Subtraktion direkt aus q/100. Genau der
    // Unterschied "sinkt UM x%" (b=1-x/100) vs. "sinkt AUF x%" (b=x/100).
    { mode: "auf", growth: true, make: (q) => ({ prompt: `\\text{steigt auf }${q}\\,\\%`, text: `steigt auf ${q} %` }) },
    { mode: "auf", growth: true, make: (q) => ({ prompt: `\\text{wächst auf }${q}\\,\\%\\text{ des ursprünglichen Werts}`, text: `wächst auf ${q} % des ursprünglichen Werts` }) },
    { mode: "auf", growth: true, make: (q) => ({ prompt: `\\text{erreicht }${q}\\,\\%\\text{ des Ausgangswerts}`, text: `erreicht ${q} % des Ausgangswerts` }) },
    { mode: "auf", growth: false, make: (q) => ({ prompt: `\\text{sinkt auf }${q}\\,\\%`, text: `sinkt auf ${q} %` }) },
    { mode: "auf", growth: false, make: (q) => ({ prompt: `\\text{fällt auf }${q}\\,\\%`, text: `fällt auf ${q} %` }) },
    { mode: "auf", growth: false, make: (q) => ({ prompt: `\\text{Nur noch }${q}\\,\\%\\text{ bleiben übrig}`, text: `Nur noch ${q} % bleiben übrig` }) },
    { mode: "auf", growth: false, make: (q) => ({ prompt: `${q}\\,\\%\\text{ des ursprünglichen Werts bleiben erhalten}`, text: `${q} % des ursprünglichen Werts bleiben erhalten` }) },
  ];
  function gen_expo_2() {
    const phrase = choice(WACHSTUM_PHRASEN);
    const growth = phrase.growth;
    let b, rendered, data;
    if (phrase.mode === "um") {
      const p = growth ? randInt(1, 60) : randInt(1, 80);
      b = round2(growth ? 1 + p / 100 : 1 - p / 100);
      rendered = phrase.make(p);
      data = { mode: "um", p, growth, b };
    } else {
      // "auf": q ist der Zielprozentsatz selbst -- bei Wachstum > 100, bei Abnahme < 100
      const q = growth ? randInt(105, 250) : randInt(5, 95);
      b = round2(q / 100);
      rendered = phrase.make(q);
      data = { mode: "auf", q, growth, b };
    }
    return {
      topic: "exponentialrechnung", level: 2,
      prompt: rendered.prompt,
      promptText: rendered.text,
      question: `b = \\;?`,
      questionText: `Wachstumsfaktor b = ?`,
      numFields: 1,
      fieldLabels: ["b"],
      tolerance: 0.005,
      answer: [b],
      data
    };
  }
  function check_expo_2(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    const ok = numbersClose(v, task.answer[0], task.tolerance);
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_expo_2(task) {
    const { mode, p, q, growth, b } = task.data;
    if (mode === "um") {
      return [
        { left: `b = 1 ${growth ? "+" : "-"} \\dfrac{${p}}{100}`, right: growth ? "Zuwachs" : "Abnahme" },
        { left: `= ${fmtNum(b)}`, right: "" }
      ];
    }
    return [
      { left: `b = \\dfrac{${q}}{100}`, right: "Zielwert direkt als Faktor (keine Subtraktion nötig)" },
      { left: `= ${fmtNum(b)}`, right: "" }
    ];
  }

  function gen_expo_3() {
    const growth = Math.random() < 0.7;
    const p = growth ? choice([5, 8, 10, 12, 15, 18, 20, 25, 30]) : choice([5, 10, 15, 20, 25, 30]);
    const b = growth ? 1 + p / 100 : 1 - p / 100;
    const c = growth ? choice([2, 3, 4, 5, 10]) : choice([0.5, 0.25, 0.1]);
    const exact = Math.log(c) / Math.log(b);
    const answer = round2(exact);
    return {
      topic: "exponentialrechnung", level: 3,
      prompt: `${fmtNum(round2(b))}^{x} = ${fmtNum(c)}`,
      promptText: `${round2(b)}^x = ${c}`,
      question: `x = \\;?`,
      questionText: `x = ?`,
      numFields: 1,
      fieldLabels: ["x (auf 2 Nachkommastellen runden)"],
      tolerance: 0.05,
      answer: [answer],
      data: { b, c, exact, p, growth }
    };
  }
  function check_expo_3(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    const ok = numbersClose(v, task.answer[0], task.tolerance);
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_expo_3(task) {
    const { b, c, exact } = task.data;
    return [
      { left: `${fmtNum(round2(b))}^{x} = ${fmtNum(c)}`, right: "" },
      { left: `\\ln(${fmtNum(round2(b))}^{x}) = \\ln(${fmtNum(c)})`, right: "\\ln(\\ldots) anwenden" },
      { left: `x\\cdot\\ln(${fmtNum(round2(b))}) = \\ln(${fmtNum(c)})`, right: "Potenzregel" },
      { left: `x = \\dfrac{\\ln(${fmtNum(c)})}{\\ln(${fmtNum(round2(b))})}`, right: `:\\ln(${fmtNum(round2(b))})` },
      { left: `x \\approx ${fmtNum(round2(exact))}`, right: "" }
    ];
  }

  const SZENARIEN = [
    { subject: "Bakterienkultur", unit: "Std.", unitDative: "Std.", verbGrowth: "wächst", verbDecay: "nimmt ab", startWord: "Start" },
    { subject: "Investition", unit: "Jahre", unitDative: "Jahren", verbGrowth: "wächst", verbDecay: "verliert an Wert", startWord: "Startkapital" },
    { subject: "Bevölkerung einer Stadt", unit: "Jahre", unitDative: "Jahren", verbGrowth: "wächst", verbDecay: "schrumpft", startWord: "Start" },
    { subject: "radioaktive Substanz", unit: "Jahre", unitDative: "Jahren", verbGrowth: "wächst", verbDecay: "zerfällt", startWord: "Anfangsmenge", onlyDecay: true }
  ];
  function gen_expo_4() {
    const scenario = choice(SZENARIEN);
    const growth = scenario.onlyDecay ? false : Math.random() < 0.6;
    const a = choice([50, 100, 200, 500, 1000]);
    const p = growth ? choice([5, 8, 10, 12, 15, 20, 25]) : choice([5, 10, 15, 20, 25, 30]);
    const b = growth ? 1 + p / 100 : 1 - p / 100;
    const factor = growth ? choice([2, 3, 4, 5]) : choice([0.5, 0.25]);
    const target = round2(a * factor);
    const exact = Math.log(factor) / Math.log(b);
    const verb = growth ? scenario.verbGrowth : scenario.verbDecay;
    const roundMode = choice(["exact", "ceil"]);

    let question, questionText, answer, fieldLabel, tolerance;
    if (roundMode === "exact") {
      question = `\\text{Nach wie vielen ${scenario.unitDative} ist der Wert }${fmtNum(target)}\\text{ erreicht?}`;
      questionText = `Nach wie vielen ${scenario.unitDative} ist ${fmtNum(target)} erreicht?`;
      answer = round2(exact);
      fieldLabel = "Anzahl (auf 2 Nachkommastellen runden)";
      tolerance = 0.05;
    } else {
      // Ganzzahlige Variante: kleinste volle Zeiteinheit, bei der der Zielwert
      // tatsächlich über-/unterschritten ist (nicht nur "ungefähr erreicht").
      const verbUeber = growth ? "überschritten" : "unterschritten";
      question = `\\text{Ab wie vielen ${scenario.unitDative} ist der Wert }${fmtNum(target)}\\text{ ${verbUeber}?}`;
      questionText = `Ab wie vielen ${scenario.unitDative} ist ${fmtNum(target)} ${verbUeber}?`;
      answer = Math.floor(exact) + 1; // robust auch falls exact zufällig ganzzahlig wäre
      fieldLabel = "Anzahl (ganze Zahl)";
      tolerance = 0.01;
    }

    return {
      topic: "exponentialrechnung", level: 4,
      prompt: `\\text{${scenario.subject}: }${scenario.startWord} = ${a},\\; ${p}\\,\\%\\text{ pro ${scenario.unit.slice(0, -1)}, ${verb}}`,
      promptText: `${scenario.subject}: ${scenario.startWord}=${a}, ${p}% pro ${scenario.unit.slice(0, -1)} (${verb})`,
      question, questionText,
      numFields: 1,
      fieldLabels: [fieldLabel],
      tolerance,
      answer: [answer],
      data: { scenario, a, p, b, factor, target, exact, growth, roundMode }
    };
  }
  function check_expo_4(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    const ok = numbersClose(v, task.answer[0], task.tolerance);
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_expo_4(task) {
    const { a, p, b, factor, target, exact, growth, roundMode } = task.data;
    const steps = [
      { left: `b = 1 ${growth ? "+" : "-"} \\dfrac{${p}}{100} = ${fmtNum(round2(b))}`, right: "Wachstumsfaktor" },
      { left: `${a}\\cdot${fmtNum(round2(b))}^{x} = ${fmtNum(target)}`, right: "Zielwert einsetzen" },
      { left: `${fmtNum(round2(b))}^{x} = ${fmtNum(round2(target / a))}`, right: `:${a}` },
      { left: `x = \\dfrac{\\ln(${fmtNum(round2(target / a))})}{\\ln(${fmtNum(round2(b))})}`, right: "\\ln anwenden" },
      { left: `x \\approx ${fmtNum(round2(exact))}`, right: "genauer Wert" }
    ];
    if (roundMode === "ceil") {
      const rounded = Math.floor(exact) + 1;
      steps.push({ left: `\\text{Antwort: } ${rounded}`, right: "auf ganze Zahl aufrunden" });
    }
    return steps;
  }

  // ---- Stufe 5: Rendite / Wachstumsrate berechnen (Kl. 10, Übergang Oberstufe) ----
  // Umkehrung von Stufe 1: hier sind Start- und Endwert sowie die Laufzeit bekannt,
  // gesucht ist die Rate selbst -- braucht eine n-te Wurzel statt eines Logarithmus.
  function gen_expo_5() {
    const V = choice([500, 1000, 2000, 5000, 10000]);
    const growth = Math.random() < 0.75;
    // Laufzeit und Rate so begrenzt, dass der gerundete Endwert (2 Nachkomma-
    // stellen) genug Präzision behält -- bei starkem, langem Wertverlust würde
    // der Cent-gerundete Wert sonst zu ungenau für eine stabile Rückrechnung.
    const n = growth ? choice([5, 8, 10, 12, 15, 18, 20, 25, 30]) : choice([5, 8, 10, 12, 15, 18, 20]);
    const rTrue = growth ? randInt(2, 15) : -randInt(2, 8);
    const b = 1 + rTrue / 100;
    const VnDisplay = round2(V * Math.pow(b, n));
    // 4 statt 2 Nachkommastellen, damit ein Schüler, der dem angezeigten
    // Rechenweg exakt folgt, auf dieselbe (auf 2 Stellen gerundete) Endantwort
    // kommt wie die hinterlegte Musterlösung -- bei nur 2 Nachkommastellen
    // ginge hier zu viel Präzision verloren (v.a. bei Wertverlust über
    // mehrere Jahre) und die Musterlösung wäre nicht mehr reproduzierbar.
    const ratio = round4(VnDisplay / V);
    const answer = round2((Math.pow(VnDisplay / V, 1 / n) - 1) * 100);
    return {
      topic: "exponentialrechnung", level: 5,
      prompt: `\\text{Startvermögen: }${V}\\,€,\\;\\text{nach }${n}\\text{ Jahren: }${fmtNum(VnDisplay)}\\,€`,
      promptText: `Startvermögen: ${V} €, nach ${n} Jahren: ${fmtNum(VnDisplay)} €`,
      question: `\\text{Rendite } r = \\;?\\,\\%`,
      questionText: `Rendite r = ? %`,
      numFields: 1,
      fieldLabels: ["r (in %, auf 2 Nachkommastellen runden)"],
      tolerance: 0.1,
      answer: [answer],
      data: { V, n, VnDisplay, ratio, answer }
    };
  }
  function check_expo_5(task, userInputs) {
    const v = parseUserNumber(userInputs[0]);
    if (isNaN(v)) return { correct: false, fieldErrors: [0] };
    const ok = numbersClose(v, task.answer[0], task.tolerance);
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_expo_5(task) {
    const { V, n, VnDisplay, ratio, answer } = task.data;
    return [
      { left: `${V}\\cdot(1+\\dfrac{r}{100})^{${n}} = ${fmtNum(VnDisplay)}`, right: "Formel einsetzen" },
      { left: `(1+\\dfrac{r}{100})^{${n}} = ${fmtNum(ratio)}`, right: `:${V}` },
      { left: `1+\\dfrac{r}{100} = \\sqrt[${n}]{${fmtNum(ratio)}}`, right: `${n}\\text{-te Wurzel ziehen}` },
      { left: `r = (\\sqrt[${n}]{${fmtNum(ratio)}}-1)\\cdot 100`, right: "" },
      { left: `r \\approx ${fmtNum(answer)}\\,\\%`, right: "" }
    ];
  }

  // ---------------- Exponentialrechnung: Textaufgaben ----------------
  // Kleinster ganzer Zeitschritt, ab dem ein Wert eine Grenze erstmals
  // über- bzw. unterschreitet (schrittweise statt über den Logarithmus,
  // damit auch der Sonderfall "genau getroffen" stimmt).
  function ersteSchritte(start, b, grenze, wachsend) {
    let v = start, k = 0;
    while (wachsend ? v <= grenze : v >= grenze) { v *= b; k++; }
    return k;
  }
  function logSchritte(b, f, einheit, k, wachsend) {
    return [
      { label: `Gesucht: kleinstes x mit ${fmtNum(round4(b))}^x ${wachsend ? ">" : "<"} ${fmtNum(round4(f))}` },
      { left: `x = \\dfrac{\\ln(${fmtNum(round4(f))})}{\\ln(${fmtNum(round4(b))})} \\approx ${fmtNum(round2(Math.log(f) / Math.log(b)))}`, right: "" },
      { label: "Erstmals über-/unterschritten: auf die nächste ganze Zahl aufrunden" },
      { left: T(`nach ${anz(k, einheit[0], einheit[1])}`), right: "" }
    ];
  }

  function gen_expo_6() {
    const sub = choice(["geschenk", "sparziel", "inflation", "auto", "medikament", "follower", "stadt", "rendite", "seerose"]);
    const n = choice(NAMEN);
    if (sub === "geschenk") {
      const K = choice([500, 1000, 1500, 2000, 3000]), p = choice([1.5, 2, 2.5, 3, 3.5]), N = randInt(3, 10);
      const Kn = roundKfm(K * Math.pow(1 + p / 100, N), 2);
      return textTask("exponentialrechnung", 6, "geschenk",
        T(`Zur Geburt legen ${genitiv(n)} Großeltern ${tausender(K)} € auf einem Sparbuch an: ${fmtNum(p)} % Zinsen pro Jahr, die Zinsen werden jedes Jahr mitverzinst. Ausgezahlt wird das Geld, wenn ${n} ${N} Jahre alt ist.`),
        T(`Wie viel Geld bekommt ${n} dann ausgezahlt? (auf Cent runden)`), [
          { label: "Auszahlung in €", kind: "number", answer: Kn, tol: 0.011 }
        ], [
          { label: "Wachstumsfaktor pro Jahr" }, { left: `1 + \\dfrac{${fmtNum(p)}}{100} = ${fmtNum(round4(1 + p / 100))}`, right: "" },
          { label: "Guthaben = Startbetrag · Faktor^Jahre" }, { left: `${K}\\cdot ${fmtNum(round4(1 + p / 100))}^{${N}} \\approx ${fmtNum(Kn.toFixed(2))}`, right: "" }
        ], { dataExtra: { K, p, N } });
    }
    if (sub === "sparziel") {
      let K, p, f, Z, b, k;
      do {
        K = choice([1000, 1200, 2000, 2400, 3000]); p = choice([1.5, 2, 2.5, 3, 4]); f = choice([1.1, 1.2, 1.25]);
        Z = Math.round(K * f); b = 1 + p / 100; k = ersteSchritte(1, b, f, true);
      } while (k > 12);
      return textTask("exponentialrechnung", 6, "sparziel",
        T(`${n} hat ${tausender(K)} € gespart und legt das Geld zu ${fmtNum(p)} % Zinsen pro Jahr an (mit Zinseszins). Für ein E-Bike braucht ${n} ${tausender(Z)} €.`),
        T("Nach wie vielen Jahren ist erstmals genug Geld für das E-Bike da?"), [
          { label: "Anzahl Jahre", kind: "number", answer: k }
        ], [{ label: `Ziel : Startbetrag = ${tausender(Z)} : ${tausender(K)} = ${fmtNum(f)}` }].concat(logSchritte(b, f, ["Jahr", "Jahren"], k, true)),
        { dataExtra: { K, p, Z } });
    }
    if (sub === "inflation") {
      const K = choice([500, 1000, 2000, 5000]), p = choice([1.5, 2, 2.5, 3, 4]), N = choice([5, 8, 10, 15, 20]);
      const V = roundKfm(K / Math.pow(1 + p / 100, N), 0);
      return textTask("exponentialrechnung", 6, "inflation",
        T(`${n} versteckt ${tausender(K)} € in einer Schublade, statt sie anzulegen. Die Preise steigen jedes Jahr um ${fmtNum(p)} %.`),
        T(`Wie viel ist das Geld nach ${N} Jahren noch wert, gemessen an den heutigen Preisen? (auf ganze Euro runden)`), [
          { label: "Kaufkraft in heutigen Euro", kind: "number", answer: V, tol: 1 }
        ], [
          { label: "Die Preise wachsen mit dem Faktor " + fmtNum(round4(1 + p / 100)) + " pro Jahr, das Geld behält seinen Nennwert." },
          { label: "Kaufkraft = Betrag : Faktor^Jahre" },
          { left: `${K} : ${fmtNum(round4(1 + p / 100))}^{${N}} \\approx ${V}`, right: "" }
        ], { dataExtra: { K, p, N } });
    }
    if (sub === "auto") {
      const K = choice([18000, 20000, 24000, 30000]), p = choice([10, 12, 15, 20]);
      const b = 1 - p / 100, W3 = roundKfm(K * Math.pow(b, 3), 0), k = ersteSchritte(1, b, 0.5, false);
      return textTask("exponentialrechnung", 6, "auto",
        T(`Ein neues Auto kostet ${tausender(K)} €. Es verliert jedes Jahr ${p} % seines Wertes vom Vorjahr. ${n} überlegt, es nach ein paar Jahren wieder zu verkaufen.`),
        T("Was ist das Auto nach 3 Jahren noch wert? Nach wie vielen Jahren ist es erstmals weniger als die Hälfte wert?"), [
          { label: "Wert nach 3 Jahren in € (ganze Euro)", kind: "number", answer: W3, tol: 1 },
          { label: "Jahre bis unter die Hälfte", kind: "number", answer: k }
        ], [
          { label: "Abnahmefaktor" }, { left: `1 - \\dfrac{${p}}{100} = ${fmtNum(round2(b))}`, right: "" },
          { label: "Wert nach 3 Jahren" }, { left: `${K}\\cdot ${fmtNum(round2(b))}^{3} \\approx ${W3}`, right: "" }
        ].concat(logSchritte(b, 0.5, ["Jahr", "Jahren"], k, false)), { dataExtra: { K, p } });
    }
    if (sub === "medikament") {
      const D = choice([200, 400, 500, 800]), p = choice([10, 15, 20, 25, 30]), f = choice([0.25, 0.3, 0.4]);
      const G = D * f, b = 1 - p / 100, k = ersteSchritte(1, b, f, false);
      return textTask("exponentialrechnung", 6, "medikament",
        T(`Nach der Einnahme einer Tablette sind ${D} mg Wirkstoff im Blut. Der Körper baut jede Stunde ${p} % der noch vorhandenen Menge ab. Laut Beipackzettel darf man die nächste Tablette erst nehmen, wenn weniger als ${fmtNum(G)} mg im Blut sind.`),
        T("Nach wie vielen Stunden darf man frühestens die nächste Tablette nehmen?"), [
          { label: "Anzahl Stunden", kind: "number", answer: k }
        ], [{ label: `Grenze : Anfangsmenge = ${fmtNum(G)} : ${D} = ${fmtNum(f)}` }].concat(logSchritte(b, f, ["Stunde", "Stunden"], k, false)),
        { dataExtra: { D, p, G } });
    }
    if (sub === "follower") {
      let F0, p, f, b, k;
      do { F0 = choice([800, 1200, 2000, 2500]); p = choice([5, 8, 10, 12, 15]); f = choice([2, 3, 4]); b = 1 + p / 100; k = ersteSchritte(1, b, f, true); } while (k > 30);
      return textTask("exponentialrechnung", 6, "follower",
        T(`${genitiv(n)} Kochkanal hat ${tausender(F0)} Follower. Seit Monaten kommen jede Woche etwa ${p} % dazu. Ab ${tausender(F0 * f)} Followern bekommt ${n} eine Einladung zu einer Messe.`),
        T("Nach wie vielen Wochen ist es voraussichtlich so weit, wenn das Wachstum so bleibt?"), [
          { label: "Anzahl Wochen", kind: "number", answer: k }
        ], [{ label: `Ziel : Start = ${tausender(F0 * f)} : ${tausender(F0)} = ${f}` }].concat(logSchritte(b, f, ["Woche", "Wochen"], k, true)),
        { dataExtra: { F0, p, Z: F0 * f } });
    }
    if (sub === "stadt") {
      const P0 = choice([24000, 36000, 48000, 60000, 85000]), p = choice([0.5, 0.8, 1, 1.2, 1.5]), N = randInt(5, 15);
      const P = roundKfm(P0 * Math.pow(1 - p / 100, N) / 100, 0) * 100;
      return textTask("exponentialrechnung", 6, "stadt",
        T(`Eine Kleinstadt hat ${tausender(P0)} Einwohner. Weil viele junge Leute wegziehen, schrumpft sie jedes Jahr um ${fmtNum(p)} %. Für die Planung einer neuen Schule will die Stadt wissen, wie viele Menschen in ${N} Jahren noch dort wohnen.`),
        T(`Wie viele Einwohner hat die Stadt in ${N} Jahren voraussichtlich? (auf Hunderter runden)`), [
          { label: "Einwohner (auf Hunderter)", kind: "number", answer: P, tol: 0.5 }
        ], [
          { label: "Abnahmefaktor" }, { left: `1 - \\dfrac{${fmtNum(p)}}{100} = ${fmtNum(round4(1 - p / 100))}`, right: "" },
          { label: "Einwohner = heute · Faktor^Jahre" }, { left: `${P0}\\cdot ${fmtNum(round4(1 - p / 100))}^{${N}} \\approx ${P}`, right: "" }
        ], { dataExtra: { P0, p, N } });
    }
    if (sub === "rendite") {
      const K = choice([2000, 5000, 8000, 10000]), p = choice([2, 3, 4, 5, 6]), N = randInt(4, 10);
      const E = roundKfm(K * Math.pow(1 + p / 100, N), 0);
      const r = round2((Math.pow(E / K, 1 / N) - 1) * 100);
      const vergleich = p + choice([-1.5, -1, -0.5, 0.5, 1, 1.5]);
      return textTask("exponentialrechnung", 6, "rendite",
        T(`${n} hat vor ${N} Jahren ${tausender(K)} € in einen Fonds gesteckt. Heute ist die Anlage ${tausender(E)} € wert. Ein Bekannter prahlt, sein Sparplan bringe ${fmtNum(vergleich)} % pro Jahr.`),
        T(`Wie viel Prozent hat ${genitiv(n)} Anlage durchschnittlich pro Jahr gebracht? War sie besser als der Sparplan?`), [
          { label: "Rendite pro Jahr in % (2 Nachkommastellen)", kind: "number", answer: r, tol: 0.05 },
          { label: "Besser als der Sparplan?", kind: "choice", choices: ["ja", "nein"], answer: r > vergleich ? "ja" : "nein" }
        ], [
          { label: "Endwert = Startwert · Faktor^Jahre, also Faktor = n-te Wurzel aus (Endwert : Startwert)" },
          { left: `\\sqrt[${N}]{${E} : ${K}} \\approx ${fmtNum(round4(Math.pow(E / K, 1 / N)))}`, right: "" },
          { label: "Rendite = (Faktor − 1) · 100" },
          { left: T(`≈ ${fmtNum(r)} % pro Jahr`), right: "" }
        ], { dataExtra: { K, E, N, vergleich } });
    }
    // seerose
    const A0 = choice([2, 3, 5, 10]), p = choice([5, 8, 10, 12, 15, 20, 25]), teich = A0 * choice([4, 5, 8, 10]);
    const b = 1 + p / 100, f = teich / A0, k = ersteSchritte(1, b, f, true);
    return textTask("exponentialrechnung", 6, "seerose",
      T(`Seerosen bedecken ${A0} m² eines ${teich} m² großen Gartenteichs. Die bedeckte Fläche wächst jede Woche um ${p} %. Ist der Teich ganz zugewachsen, bekommen die Fische zu wenig Licht.`),
      T("Nach wie vielen Wochen ist der Teich rechnerisch erstmals ganz bedeckt, wenn niemand eingreift?"), [
        { label: "Anzahl Wochen", kind: "number", answer: k }
      ], [{ label: `Teich : bedeckte Fläche = ${teich} : ${A0} = ${fmtNum(f)}` }].concat(logSchritte(b, f, ["Woche", "Wochen"], k, true)),
      { dataExtra: { A0, p, teich } });
  }

  // ---- Stufe 7: Halbwertszeit und Verdopplungszeit (Vorbild: Grundwissen Kl. 10, Lambacher Schweizer) ----
  function gen_expo_7() {
    const sub = choice(["rest", "zeitBisRest", "verdopplung", "term"]);
    // [Genitiv-Form ("Halbwertszeit …"), Dativ-Form ("Von …"), Halbwertszeit, Einheit im Dativ, Einheit]
    const stoffe = [["von Iod-131", "Von Iod-131", 8, "Tagen", "Tage"], ["eines Medikaments im Körper", "Von einem Medikament im Körper", 6, "Stunden", "Stunden"], ["von Cäsium-137", "Von Cäsium-137", 30, "Jahren", "Jahre"], ["eines Pflanzenschutzmittels im Boden", "Von einem Pflanzenschutzmittel im Boden", 4, "Wochen", "Wochen"]];
    const [stoffGen, stoffDat, TH, einheitDat, einheit] = choice(stoffe);
    if (sub === "rest") {
      const m0 = choice([80, 100, 200, 400, 500]), k = choice([2, 3, 4, 5]), t = TH * k;
      return { topic: "exponentialrechnung", level: 7, subtype: sub, prompt: T(`Die Halbwertszeit ${stoffGen} beträgt ${TH} ${einheit}. Zu Beginn sind ${m0} mg vorhanden.`), promptText: "Rest",
        question: T(`Wie viel ist nach ${t} ${einheit} noch übrig?`), numFields: 1, fieldLabels: ["Restmenge in mg"], answer: [m0 / Math.pow(2, k)], tolerance: 1e-9, data: { m0, TH, t, k } };
    }
    if (sub === "zeitBisRest") {
      const p = choice([10, 20, 25, 5, 1]), x = TH * Math.log(p / 100) / Math.log(0.5);
      return { topic: "exponentialrechnung", level: 7, subtype: sub, prompt: T(`Die Halbwertszeit ${stoffGen} beträgt ${TH} ${einheit}.`), promptText: "Zeit bis Rest",
        question: T(`Nach welcher Zeit ist nur noch ${p} % der Anfangsmenge vorhanden? (in ${einheit}, 1 Nachkommastelle)`), numFields: 1, fieldLabels: [`Zeit in ${einheitDat}`], answer: [roundKfm(x, 1)], tolerance: 0.051, data: { p, TH } };
    }
    if (sub === "verdopplung") {
      const p = choice([2, 3, 4, 5, 7, 10, 12, 15]), td = Math.log(2) / Math.log(1 + p / 100);
      return { topic: "exponentialrechnung", level: 7, subtype: sub, prompt: T(`Ein Bestand wächst jedes Jahr um ${p} %.`), promptText: "Verdopplung",
        question: T("Nach wie vielen Jahren hat er sich verdoppelt? (1 Nachkommastelle)"), numFields: 1, fieldLabels: ["Verdopplungszeit in Jahren"], answer: [roundKfm(td, 1)], tolerance: 0.051, data: { p } };
    }
    const m0 = choice([50, 100, 120, 200]), q = Math.pow(0.5, 1 / TH);
    return { topic: "exponentialrechnung", level: 7, subtype: sub, prompt: T(`${stoffDat} sind zu Beginn ${m0} mg vorhanden, die Halbwertszeit beträgt ${TH} ${einheit}. Die Menge soll mit f(t) = a · qᵗ beschrieben werden (t in ${einheitDat}).`), promptText: "Term",
      question: T("Bestimme a und q (q auf 4 Nachkommastellen)."), numFields: 2, fieldLabels: ["a", "q"], answer: [m0, roundKfm(q, 4)], tolerances: [1e-9, 0.00011], data: { m0, TH } };
  }
  function check_expo_7(task, inp) { const err = []; task.answer.forEach((x, i) => { const v = parseUserNumber(inp[i]); const tol = task.tolerances ? task.tolerances[i] : task.tolerance; if (isNaN(v) || Math.abs(v - x) > tol) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
  function steps_expo_7(task) {
    const d = task.data, s = task.subtype;
    if (s === "rest") return [{ label: `${d.t} sind ${d.k} Halbwertszeiten – jedes Mal halbiert sich die Menge` }, { left: `${d.m0}\\cdot \\left(\\dfrac{1}{2}\\right)^{${d.k}} = ${fmtNum(task.answer[0])}`, right: "" }];
    if (s === "zeitBisRest") return [{ label: "Anteil nach t: (1/2)^(t / Halbwertszeit)" }, { left: `\\left(\\dfrac{1}{2}\\right)^{\\frac{t}{${d.TH}}} = ${fmtNum(d.p / 100)} \\;\\Rightarrow\\; t = ${d.TH}\\cdot \\dfrac{\\ln(${fmtNum(d.p / 100)})}{\\ln(0,5)} \\approx ${fmtNum(task.answer[0])}`, right: "" }];
    if (s === "verdopplung") return [{ label: "Verdopplungszeit: qᵗ = 2" }, { left: `${fmtNum(1 + d.p / 100)}^{t} = 2 \\;\\Rightarrow\\; t = \\dfrac{\\ln(2)}{\\ln(${fmtNum(1 + d.p / 100)})} \\approx ${fmtNum(task.answer[0])}`, right: "" }];
    return [{ label: "a = Anfangsmenge; nach einer Halbwertszeit gilt q^T = 1/2" }, { left: `a = ${d.m0}\\,, \\quad q^{${d.TH}} = 0,5 \\;\\Rightarrow\\; q = \\sqrt[${d.TH}]{0,5} \\approx ${fmtNum(task.answer[1])}`, right: "" }];
  }

  TOPICS.exponentialrechnung = {
      name: "Exponentialrechnung",
      grade: "Kl. 9–10 / Übergang Oberstufe",
      levels: [
        { id: 1, name: "Wachstum/Zerfall auswerten", grade: "Kl. 9–10", generate: gen_expo_1, check: check_expo_1, steps: steps_expo_1, calculatorHint: "Taschenrechner erlaubt (Potenzen mit Dezimalzahlen)" },
        { id: 2, name: "Wachstumsfaktor bestimmen", grade: "Kl. 9–10", generate: gen_expo_2, check: check_expo_2, steps: steps_expo_2 },
        { id: 3, name: "Exponentialgleichungen lösen", grade: "Kl. 10 / Oberstufe", generate: gen_expo_3, check: check_expo_3, steps: steps_expo_3, calculatorHint: "Taschenrechner mit ln-Taste nötig" },
        { id: 4, name: "Anwendungsaufgaben", grade: "Kl. 10 / Oberstufe", generate: gen_expo_4, check: check_expo_4, steps: steps_expo_4, calculatorHint: "Taschenrechner mit ln-Taste nötig" },
        { id: 5, name: "Rendite berechnen", grade: "Kl. 10 / Oberstufe", signed: true, generate: gen_expo_5, check: check_expo_5, steps: steps_expo_5, calculatorHint: "Taschenrechner mit x-ter-Wurzel-Funktion nötig" },
        { id: 7, name: "Halbwertszeit und Verdopplungszeit", grade: "Kl. 10", calculatorHint: "Taschenrechner mit ln-Taste nötig", generate: gen_expo_7, check: check_expo_7, steps: steps_expo_7 },
        { id: 6, name: "Textaufgaben", grade: "Kl. 9–10", calculatorHint: "Taschenrechner erlaubt (ln-Taste für Verdopplung/Halbierung)", generate: gen_expo_6, check: check_textaufgabe, steps: steps_textaufgabe }
      ]
  };
  // ---------- EXPONENTIALRECHNUNG (Kl. 10) ----------
  const KA_EXPO = [
    { key: "tabelle", teil: "A", afb: 2, titel: "Lineares oder exponentielles Wachstum?", baue: () => {
      const expo = Math.random() < 0.5; let ys, q = null, d = null, y6;
      if (expo) { const [a0, qq] = choice([[2, 2], [3, 2], [5, 2], [1, 3], [2, 3], [64, 0.5], [128, 0.5], [16, 1.5], [32, 1.5]]); q = qq; ys = [0, 1, 2, 3, 4].map((x) => a0 * Math.pow(q, x)); y6 = a0 * Math.pow(q, 6); }
      else { const a0 = randInt(2, 20); d = choice([2, 3, 5, 8, -2, -3]); ys = [0, 1, 2, 3, 4].map((x) => a0 + d * x); y6 = a0 + 6 * d; }
      return { kontext: `${T("Die Tabelle zeigt einen Wachstumsvorgang:")}\\quad ${T("x: 0 | 1 | 2 | 3 | 4")}\\quad ${T("y: " + ys.map(fmtNum).join(" | "))}`, teile: [
        autoTeil(T("Handelt es sich um lineares oder exponentielles Wachstum?"), [{ label: "Wachstumsart", kind: "choice", choices: ["linear", "exponentiell"], answer: expo ? "exponentiell" : "linear" }],
          [{ label: expo ? "Die Quotienten aufeinanderfolgender Werte sind gleich." : "Die Differenzen aufeinanderfolgender Werte sind gleich." },
           { left: T(expo ? `${fmtNum(ys[1])} : ${fmtNum(ys[0])} = ${fmtNum(ys[2])} : ${fmtNum(ys[1])} = ${fmtNum(q)}` : `${fmtNum(ys[1])} − ${fmtNum(ys[0])} = ${fmtNum(ys[2])} − ${fmtNum(ys[1])} = ${d}`), right: "" }]),
        autoTeil(T("Gib den Wachstumsfaktor (exponentiell) bzw. den Zuwachs pro Schritt (linear) an."), [{ label: "Faktor bzw. Zuwachs", kind: "number", answer: expo ? q : d, signed: !expo }],
          [{ left: T(expo ? `Faktor q = ${fmtNum(q)}` : `Zuwachs d = ${d}`), right: "" }]),
        autoTeil(T("Berechne y für x = 6."), [{ label: "y für x = 6", kind: "number", answer: y6, punkte: 1, signed: true }],
          [{ left: expo ? `y = ${fmtNum(ys[0])}\\cdot ${fmtNum(q)}^{6} = ${fmtNum(y6)}` : `y = ${ys[0]} + 6\\cdot (${d}) = ${y6}`, right: "" }]),
        papierTeil(T("✏️ Begründe deine Entscheidung zur ersten Teilaufgabe mit den Werten der Tabelle."), [
          { text: expo ? "Quotienten aufeinanderfolgender y-Werte gebildet" : "Differenzen aufeinanderfolgender y-Werte gebildet", punkte: 1 },
          { text: "Festgestellt, dass sie immer gleich sind, und daraus geschlossen", punkte: 1 }],
          [{ left: T(expo ? "Gleiche Quotienten ⇒ exponentielles Wachstum" : "Gleiche Differenzen ⇒ lineares Wachstum"), right: "" }])
      ] };
    } },
    { key: "faktoren", teil: "A", afb: 1, titel: "Wachstumsfaktoren", baue: () => ({ kontext: T("Bestimme jeweils den Wachstumsfaktor."), teile: [stufenTeil("exponentialrechnung", 2), stufenTeil("exponentialrechnung", 2), stufenTeil("exponentialrechnung", 2)] }) },
    { key: "aussagen", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => {
      const pool = [
        () => aussageTeil(T("Lukas behauptet: „Bei 10 % Zunahme pro Jahr verdoppelt sich ein Betrag in genau 10 Jahren.“"), false,
          ["1,1¹⁰ ≈ 2,59 – es ist mehr als das Doppelte, weil auch der Zuwachs mitwächst.", "Stimmt, denn 10 · 10 % = 100 %.", "Stimmt nur ohne Zinseszins."]),
        () => aussageTeil(T("Sara behauptet: „Sinkt ein Preis um 50 % und steigt danach um 50 %, ist er wieder beim Startwert.“"), false,
          ["0,5 · 1,5 = 0,75 – es fehlt ein Viertel.", "Stimmt, −50 % und +50 % heben sich auf.", "Stimmt nur bei kleinen Preisen."]),
        () => aussageTeil(T("Finn behauptet: „Nach drei Halbwertszeiten ist noch ein Achtel der Anfangsmenge übrig.“"), true,
          ["(1/2)³ = 1/8.", "3 · 1/2 = 1,5, also bleibt weniger als die Hälfte.", "Bei jeder Halbwertszeit wird ein Drittel abgezogen."]),
        () => aussageTeil(T("Ida behauptet: „Exponentielles Wachstum mit 3 % pro Jahr übertrifft irgendwann jedes lineare Wachstum.“"), true,
          ["Der jährliche Zuwachs wird immer größer, beim linearen Wachstum bleibt er gleich.", "Weil 3 % mehr ist als jeder feste Betrag.", "Stimmt nur, wenn beide mit demselben Startwert beginnen."])
      ];
      return { kontext: "", teile: mische(pool).slice(0, 3).map((f) => f()) };
    } },
    { key: "bakterien", teil: "B", afb: 2, titel: "Bakterienkultur", baue: () => {
      const B0 = choice([50, 100, 200, 500]), p = choice([10, 15, 20, 25, 30]), t = randInt(3, 8), kG = choice([5, 10]);
      const q = 1 + p / 100, Bt = Math.round(B0 * Math.pow(q, t)), G = B0 * kG;
      let k = 0, v = B0; while (v <= G) { v *= q; k++; }
      const tmax = k + 2;
      const g = svgGraph([{ fn: (x) => B0 * Math.pow(q, x), color: "#2563eb", label: "B" }], { xmin: 0, xmax: tmax, ymin: 0, ymax: Math.ceil(B0 * Math.pow(q, tmax) / 100) * 100, width: 300, height: 230, padLeft: 38, padBottom: 22, ticks: true,
        gridStepX: tmax > 12 ? 2 : 1, gridStepY: Math.ceil(B0 * Math.pow(q, tmax) / 500) * 100, achsenNamen: ["t in h", "Anzahl"],
        marks: [{ type: "hline", y: G, label: `Grenze ${tausender(G)}` }, { type: "point", x: k, y: B0 * Math.pow(q, k), label: `t = ${k}` }, { type: "point", x: 0, y: B0, label: `${B0}`, color: "#16a34a", dx: 6, dy: -4 }] });
      return { kontext: T(`In einer Laborprobe befinden sich zu Beginn ${B0} Bakterien. Ihre Anzahl wächst pro Stunde um ${p} %. Ab ${tausender(G)} Bakterien muss die Probe gekühlt werden.`), teile: [
        autoTeil(T("Gib den Wachstumsfaktor pro Stunde an."), [{ label: "Wachstumsfaktor", kind: "number", answer: q, tol: 0.001 }], [{ left: `q = 1 + \\dfrac{${p}}{100} = ${fmtNum(q)}`, right: "" }]),
        autoTeil(T(`Berechne die Anzahl nach ${t} Stunden (ganzzahlig gerundet).`), [{ label: "Anzahl", kind: "number", answer: Bt, tol: 1, punkte: 2 }],
          [{ left: `${B0}\\cdot ${fmtNum(q)}^{${t}} \\approx ${Bt}`, right: "" }]),
        autoTeil(T("Nach wie vielen vollen Stunden muss die Probe spätestens gekühlt werden (erstmals mehr als die Grenze)?"), [{ label: "Stunden", kind: "number", answer: k, punkte: 2 }],
          [{ left: `${fmtNum(q)}^{x} = ${kG} \\;\\Rightarrow\\; x = \\dfrac{\\ln(${kG})}{\\ln(${fmtNum(q)})} \\approx ${fmtNum(round2(Math.log(kG) / Math.log(q)))}`, right: "" },
            { label: "Erstmals über der Grenze: aufrunden" }, { left: T(`nach ${k} Stunden`), right: "" }]),
        papierTeil(T("✏️ Skizziere den Graphen der Anzahl in Abhängigkeit von der Zeit und markiere, wann die Grenze überschritten wird."), [
          { text: `Startwert ${B0} bei t = 0`, punkte: 1 }, { text: "Kurve steigt immer stärker (exponentiell)", punkte: 1 }, { text: `Grenze und Zeitpunkt t ≈ ${k} markiert`, punkte: 1 }],
          [{ label: "Musterlösung" }], g)
      ] };
    } },
    { key: "inflation", teil: "B", afb: 3, titel: "Kaufkraft und Inflation", baue: () => {
      const K = 1000, n = choice([10, 15, 20, 25]); const [p1, p2] = mische([1, 2, 3, 4, 6, 8]).slice(0, 2).sort((a, b) => a - b);
      const k1 = roundKfm(K / Math.pow(1 + p1 / 100, n), 0), k2 = roundKfm(K / Math.pow(1 + p2 / 100, n), 0);
      const ph = round2((Math.pow(2, 1 / n) - 1) * 100);
      const g = svgGraph([{ fn: (pp) => K / Math.pow(1 + pp / 100, n), color: "#2563eb" }], { xmin: 0, xmax: 12, ymin: 0, ymax: 1000, width: 300, height: 230, padLeft: 38, padBottom: 22, ticks: true, gridStepX: 1, gridStepY: 100,
        achsenNamen: ["Inflationsrate in %", "€"], marks: [{ type: "hline", y: 500, label: "halbe Kaufkraft" }, { type: "point", x: ph, y: 500, label: `≈ ${fmtNum(ph)} %` }] });
      return { kontext: T(`1000 € werden nicht angelegt, sondern ${n} Jahre lang zu Hause aufbewahrt. Die Kaufkraft nach ${n} Jahren beträgt 1000 € : (1 + p/100)^${n}, wenn p die jährliche Inflationsrate ist.`), teile: [
        autoTeil(T(`Berechne die Kaufkraft nach ${n} Jahren bei ${p1} % und bei ${p2} % Inflation (ganze Euro).`), [
          { label: `bei ${p1} % in €`, kind: "number", answer: k1, tol: 1 }, { label: `bei ${p2} % in €`, kind: "number", answer: k2, tol: 1 }],
          [{ left: `1000 : ${fmtNum(1 + p1 / 100)}^{${n}} \\approx ${k1}\\,, \\quad 1000 : ${fmtNum(1 + p2 / 100)}^{${n}} \\approx ${k2}`, right: "" }]),
        autoTeil(T(`Bei welcher Inflationsrate ist nach ${n} Jahren nur noch die Hälfte der Kaufkraft übrig? (2 Nachkommastellen)`), [{ label: "Inflationsrate in %", kind: "number", answer: ph, tol: 0.05, punkte: 3 }],
          [{ left: `(1 + \\dfrac{p}{100})^{${n}} = 2 \\;\\Rightarrow\\; p = (\\sqrt[${n}]{2} - 1)\\cdot 100 \\approx ${fmtNum(ph)}`, right: "" }]),
        papierTeil(T("✏️ Zeichne den Graphen „Inflationsrate → Kaufkraft“ für 0 % bis 12 % und kontrolliere damit dein Ergebnis zur vorigen Teilaufgabe."), [
          { text: "Graph beginnt bei 1000 € (0 %) und fällt gekrümmt", punkte: 1 }, { text: `halbe Kaufkraft (500 €) bei etwa ${fmtNum(ph)} % abgelesen`, punkte: 1 }],
          [{ label: "Musterlösung" }], g)
      ] };
    } },
    { key: "geld", teil: "B", afb: 2, titel: "Geld anlegen", baue: () => ({ kontext: "", teile: [
      stufenTeil("exponentialrechnung", 5), stufenTeil("exponentialrechnung", 6, (t) => ["sparziel", "geschenk", "rendite"].includes(t.subtype))] }) }
  ];

  KA_EXPO.push({ key: "zerfall", teil: "B", afb: 3, titel: "Radioaktiver Zerfall", baue: () => {
    const t1 = stufenTeil("exponentialrechnung", 7, (x) => x.subtype === "term"), t2 = stufenTeil("exponentialrechnung", 7, (x) => x.subtype === "zeitBisRest");
    return { kontext: "", teile: [t1, t2, papierTeil(T("✏️ Nenne eine Grenze des Modells „exponentielles Wachstum“ am Beispiel einer Bakterienkultur und begründe."), [
      { text: "Grenze benannt (z. B. begrenzter Platz oder begrenzte Nährstoffe)", punkte: 1 }, { text: "Begründung: Wachstum kann nicht unbegrenzt mit gleichem Faktor weitergehen", punkte: 1 }],
      [{ left: T("In Wirklichkeit werden Nährstoffe und Platz knapp – das Wachstum verlangsamt sich und kommt zum Stillstand. Exponentielles Wachstum beschreibt nur einen begrenzten Zeitraum gut."), right: "" }])] };
  } });
  KA_VORLAGEN.exponentialrechnung = KA_EXPO;
  KA_INFO.exponentialrechnung = { klasse: "Kl. 10", tr: true };
  Object.assign(ERKL, {
    "exponentialrechnung/1": E("Wachstum und Zerfall berechnen",
      [`B(t) = B_{0}\\cdot q^{t}`, T("q > 1: Wachstum, 0 < q < 1: Abnahme. Der Faktor wird hoch der Anzahl der Schritte genommen.")],
      [{ left: `200\\cdot 1,05^{3} \\approx 231,53`, right: "" }],
      [T("Mit der Anzahl der Jahre multiplizieren statt zu potenzieren."), T("Zinseszins vergessen: Der Zuwachs wächst jedes Jahr mit.")], "expo1"),
    "exponentialrechnung/2": E("Wachstumsfaktor",
      [T("Zunahme UM p %: q = 1 + p/100"), T("Abnahme UM p %: q = 1 − p/100"), T("Steigt bzw. sinkt AUF p %: q = p/100")],
      [{ left: T("um 8 % mehr: q = 1,08   ·   um 8 % weniger: q = 0,92   ·   auf 92 %: q = 0,92"), right: "" }],
      [T("Bei „um“ nur p/100 schreiben (0,08 statt 1,08)."), T("Bei „auf“ noch 1 dazurechnen.")]),
    "exponentialrechnung/3": E("Exponentialgleichungen",
      [`b^{x} = c \\;\\Rightarrow\\; x = \\dfrac{\\ln(c)}{\\ln(b)}`, T("Steht x im Exponenten, braucht man den Logarithmus (ln oder lg, beide funktionieren).")],
      [{ left: `1,15^{x} = 4 \\;\\Rightarrow\\; x = \\dfrac{\\ln(4)}{\\ln(1,15)} \\approx 9,92`, right: "" }],
      [T("Durch die Basis teilen: x steht nicht als Faktor da, sondern im Exponenten.")]),
    "exponentialrechnung/4": E("Wann wird eine Grenze erreicht?",
      [`B_{0}\\cdot q^{x} = G \\;\\Rightarrow\\; q^{x} = \\dfrac{G}{B_{0}} \\;\\Rightarrow\\; x = \\dfrac{\\ln(G : B_{0})}{\\ln(q)}`, T("„Erstmals über/unter“ einer Grenze: auf die nächste ganze Zahl aufrunden.")],
      [{ left: `100\\cdot 1,2^{x} = 300 \\;\\Rightarrow\\; x = \\dfrac{\\ln(3)}{\\ln(1,2)} \\approx 6,03`, right: "" }, { left: T("erstmals überschritten: nach 7 Jahren"), right: "" }],
      [T("Abrunden statt aufrunden: Nach 6 Jahren ist die Grenze noch nicht erreicht.")]),
    "exponentialrechnung/5": E("Rendite berechnen",
      [`K_{n} = K_{0}\\cdot q^{n} \\;\\Rightarrow\\; q = \\sqrt[n]{K_{n} : K_{0}}`, T("Rendite in % = (q − 1) · 100")],
      [{ left: `\\sqrt[20]{2653,30 : 1000} \\approx 1,05 \\;\\Rightarrow\\; 5\\,\\%`, right: "" }],
      [T("Den Faktor (1,05) als Rendite angeben – gemeint sind 5 %."), T("Gesamtzuwachs durch die Jahre teilen: Das ignoriert den Zinseszins.")]),
    "exponentialrechnung/6": E("Wachstum im Alltag",
      [T("Zuerst den Faktor bestimmen (Zunahme 1 + p/100, Abnahme 1 − p/100), dann B(t) = B₀ · qᵗ."), T("Kaufkraft bei Inflation: Betrag : (1 + p/100)ⁿ."), T("„Erstmals über/unter“: aufrunden.")],
      [{ left: T("Auto 20.000 €, −15 % pro Jahr: 20.000 · 0,85³ ≈ 12.283 €"), right: "" }],
      [T("−50 % und danach +50 % ergibt NICHT den Startwert: 0,5 · 1,5 = 0,75.")], "expo6"),
  });
  Object.assign(DIAG, {
    "exponentialrechnung/1": (t, i, w) => {
      const { a, b, x } = t.data;
      if (nah(w.v, a * b * x, 0.002)) return H.malJahre;
      if (nah(w.v, a * (1 + (b - 1) * x), 0.002)) return H.ohneZinseszins;
      return null;
    },
    "exponentialrechnung/2": (t, i, w) => {
      const d = t.data;
      if (d.mode === "um") {
        if (nah(w.v, d.p / 100)) return H.umProzent;
        if (nah(w.v, d.growth ? 1 - d.p / 100 : 1 + d.p / 100)) return H.zuAb;
      } else if (nah(w.v, 1 - d.p / 100) || nah(w.v, 1 + d.p / 100) || nah(w.v, 1 - (d.q || 0) / 100) || nah(w.v, 1 + (d.q || 0) / 100)) return H.aufProzent;
      return null;
    },
    "exponentialrechnung/3": (t, i, w) => (nah(w.v, t.data.c / t.data.b, 0.01) ? H.logStatt : null),
    "exponentialrechnung/4": (t, i, w) => {
      const d = t.data;
      if (d.roundMode === "ceil") {
        if (nah(w.v, t.answer[0] - 1)) return H.aufrunden;
        if (!Number.isInteger(w.v)) return H.ganzeZahl;
      } else if (Number.isInteger(w.v) && Math.abs(w.v - d.exact) < 1) return H.genauerWert;
      return null;
    },
    "exponentialrechnung/5": (t, i, w) => {
      const d = t.data, f = Math.pow(d.VnDisplay / d.V, 1 / d.n);
      if (nah(w.v, f, 0.002)) return H.faktorStattRendite;
      if (nah(w.v, ((d.VnDisplay / d.V - 1) * 100) / d.n, 0.01)) return H.ohneZinseszins;
      return null;
    },
    "exponentialrechnung/6": (t, i, w) => {
      const d = t.dataExtra, s = t.subtype;
      const istAufrunden = ["sparziel", "medikament", "follower", "seerose"].includes(s) || (s === "auto" && i === 1);
      if (istAufrunden && nah(w.v, t.answer[i] - 1)) return H.aufrunden;
      if (s === "geschenk" && nah(w.v, d.K * (1 + (d.p * d.N) / 100), 0.001)) return H.ohneZinseszins;
      if (s === "inflation" && nah(w.v, d.K * Math.pow(1 - d.p / 100, d.N), 0.001)) return H.kaufkraft;
      if (s === "rendite" && i === 0 && nah(w.v, Math.pow(d.E / d.K, 1 / d.N), 0.002)) return H.faktorStattRendite;
      return null;
    },
  });
  Object.assign(ERKL, {
    "exponentialrechnung/7": E("Halbwertszeit und Verdopplungszeit",
      [T("Halbwertszeit T: In jeweils T halbiert sich die Menge ⇒ Rest nach t: a · (1/2)^(t/T)."), T("Verdopplungszeit: qᵗ = 2 ⇒ t = ln 2 / ln q."), T("Aus der Halbwertszeit den Faktor bestimmen: q = (1/2)^(1/T), also die T-te Wurzel aus 0,5.")],
      [{ left: `T = 8:\\;\\; q = \\sqrt[8]{0,5} \\approx 0,917\\,, \\qquad ${T("nach 24 Tagen:")}\\; 100\\cdot (0,5)^{3} = 12,5`, right: "" }],
      [T("Nach zwei Halbwertszeiten „alles weg“ annehmen – es ist noch ein Viertel da."), T("Bei der Verdopplungszeit mit ln(1 + p) statt ln(1 + p/100) rechnen.")], "expo7")
  });
  H.halbLinear = "Nach jeder Halbwertszeit halbiert sich die Menge – sie nimmt nicht jedes Mal um denselben Betrag ab.";
  Object.assign(DIAG, {
    "exponentialrechnung/7": (t, i, w) => (t.subtype === "rest" && nah(w.v, Math.max(0, t.data.m0 - (t.data.m0 / 2) * t.data.k)) ? H.halbLinear : null)
  });
  // Erklärungs-Grafiken passend zu den Beispielen
  const erklGrafikEx = erklGrafik;
  erklGrafik = function (art) {
    const k = { width: 300, height: 230, padLeft: 40, padBottom: 22, ticks: true };
    if (art === "expo1") return renderGraphSVG([{ fn: (t) => 200 * Math.pow(1.05, t), color: "#2563eb", label: "B(t)" }], Object.assign({ xmin: 0, xmax: 8, ymin: 0, ymax: 320, gridStepX: 1, gridStepY: 50, achsenNamen: ["t in Jahren", "B in €"], marks: [{ type: "point", x: 3, y: 231.53, label: "(3 | 231,53)", dx: -90, dy: -8 }] }, k));
    if (art === "expo6") return renderGraphSVG([{ fn: (t) => 20000 * Math.pow(0.85, t), color: "#2563eb", label: "Wert" }], Object.assign({ xmin: 0, xmax: 8, ymin: 0, ymax: 22000, gridStepX: 1, gridStepY: 5000, padLeft: 48, achsenNamen: ["t in Jahren", "€"], marks: [{ type: "point", x: 3, y: 12282.5, label: "(3 | ≈ 12.283)", dx: 8, dy: -8 }] }, k));
    if (art === "expo7") return renderGraphSVG([{ fn: (t) => 100 * Math.pow(0.5, t / 8), color: "#2563eb", label: "Menge" }], Object.assign({ xmin: 0, xmax: 32, ymin: 0, ymax: 110, gridStepX: 8, gridStepY: 25, achsenNamen: ["t in Tagen", "%"], marks: [{ type: "point", x: 8, y: 50, label: "50" }, { type: "point", x: 16, y: 25, label: "25" }, { type: "point", x: 24, y: 12.5, label: "12,5" }] }, k));
    return erklGrafikEx(art);
  };
