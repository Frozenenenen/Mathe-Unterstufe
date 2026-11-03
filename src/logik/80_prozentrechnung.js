  // ============================================================
  // PROZENTRECHNUNG (Kl. 7)
  // Bezeichnungen: Grundwert G, Prozentwert W, Prozentsatz p %.  W = G · p/100
  // ============================================================
  const pz = (p) => `${fmtNum(p)}\\,\\%`;
  const eu = (x) => `${fmtNum(roundKfm(x, 2).toFixed(2))}\\text{ €}`;
  const geld = (x) => roundKfm(x, 2);
  const euroTxt = (x) => { const [g, d] = roundKfm(x, 2).toFixed(2).split("."); return tausender(g) + "," + d; }; // 2.856,00
  const pr1 = (x) => roundKfm(x * 100, 1); // Anteil -> Prozent, 1 Nachkommastelle
  const PROZ_EINFACH = [1, 2, 4, 5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90];

  // ---- Stufe 1: Prozent, Bruch, Dezimalzahl ----
  function gen_proz_1() {
    const p = choice([1, 2, 4, 5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 50, 60, 62.5, 65, 70, 75, 80, 85, 90, 120, 150]);
    const n = Math.round(p * 10), d = 1000, g = gcd(n, d), fr = { num: n / g, den: d / g }, dez = p / 100;
    const WORTE = { 25: "einer von vier", 20: "einer von fünf", 75: "drei von vier", 10: "jeder Zehnte", 40: "zwei von fünf", 12.5: "einer von acht", 5: "jeder Zwanzigste", 50: "die Hälfte", 60: "drei von fünf", 80: "vier von fünf" };
    if (Math.random() < 0.25) {
      const pw = choice(Object.keys(WORTE).map(Number)), nw = Math.round(pw * 10), gw = gcd(nw, 1000);
      return { topic: "prozentrechnung", level: 1, subtype: "worte", prompt: T(`„${WORTE[pw]}“`), promptText: WORTE[pw],
        question: `\text{Gib den Anteil als Prozentsatz und als gekürzten Bruch an.}`, numFields: 2, fieldLabels: ["Prozent", "Bruch (gekürzt)"],
        answer: [pw, { num: nw / gw, den: 1000 / gw }], data: { p: pw, fr: { num: nw / gw, den: 1000 / gw }, dez: pw / 100 } };
    }
    const sub = choice(["prozent", "bruch", "dezimal"]);
    const anzeige = { prozent: pz(p), bruch: `\\dfrac{${fr.num}}{${fr.den}}`, dezimal: fmtNum(dez) }[sub];
    const felder = { prozent: [["Bruch (gekürzt)", fr], ["Dezimalzahl", dez]], bruch: [["Prozent", p], ["Dezimalzahl", dez]], dezimal: [["Prozent", p], ["Bruch (gekürzt)", fr]] }[sub];
    return {
      topic: "prozentrechnung", level: 1, subtype: sub, prompt: anzeige, promptText: anzeige,
      question: `\\text{Schreibe auf die beiden anderen Arten.}`, numFields: 2, fieldLabels: felder.map((f) => f[0]), answer: felder.map((f) => f[1]), data: { p, fr, dez }
    };
  }
  function check_proz_1(task, inp) {
    const err = [];
    task.answer.forEach((a, i) => {
      if (a && typeof a === "object") { const f = parseUserFraction(inp[i]); if (!f || f.num * a.den !== a.num * f.den || gcd(f.num, f.den) !== 1) err.push(i); }
      else { const v = parseUserNumber(String(inp[i]).replace("%", "")); if (isNaN(v) || Math.abs(v - a) > 1e-9) err.push(i); }
    });
    return { correct: !err.length, fieldErrors: err };
  }
  function steps_proz_1(task) {
    const { p, fr, dez } = task.data;
    return [
      { label: "Prozent heißt „von Hundert“: p % = p/100" },
      { left: `${pz(p)} = \\dfrac{${fmtNum(p)}}{100} = ${fmtNum(dez)}`, right: "" },
      { label: "Bruch vollständig kürzen" }, { left: `\\dfrac{${fmtNum(p)}}{100} = \\dfrac{${fr.num}}{${fr.den}}`, right: "" }
    ];
  }

  // ---- Stufen 2–4: Grundaufgaben ----
  function grundzahlen() {
    const p = choice(PROZ_EINFACH.concat([3, 6, 8, 16, 35, 45, 65, 70])), G = choice([40, 60, 80, 120, 150, 200, 240, 250, 300, 360, 400, 480, 500, 600, 750, 800, 1200, 1500, 2000]);
    return { p, G, W: geld((G * p) / 100) };
  }
  function gen_proz_2() {
    const { p, G, W } = grundzahlen();
    return { topic: "prozentrechnung", level: 2, prompt: `${pz(p)}\\;\\text{ von }\\; ${tausender(G)}\\text{ €}`, promptText: `${p}% von ${G}`,
      question: `\\text{Berechne den Prozentwert W.}`, numFields: 1, fieldLabels: ["W in €"], answer: [W], tolerance: 0.005, data: { p, G, W } };
  }
  function gen_proz_3() {
    const { p, G, W } = grundzahlen();
    return { topic: "prozentrechnung", level: 3, prompt: `${pz(p)}\\;\\text{ sind }\\; ${fmtNum(W)}\\text{ €}`, promptText: `${p}% sind ${W}`,
      question: `\\text{Wie groß ist der Grundwert G?}`, numFields: 1, fieldLabels: ["G in €"], answer: [G], tolerance: 0.005, data: { p, G, W } };
  }
  function gen_proz_4() {
    let G, W, p; do { G = choice([20, 25, 40, 50, 80, 120, 160, 200, 250, 320, 400, 500, 800]); W = randInt(1, G - 1); p = pr1(W / G); } while ((W * 1000) % G !== 0);
    return { topic: "prozentrechnung", level: 4, prompt: `${fmtNum(W)}\\text{ € von }\\; ${fmtNum(G)}\\text{ €}`, promptText: `${W} von ${G}`,
      question: `\\text{Wie viel Prozent sind das? (1 Nachkommastelle)}`, numFields: 1, fieldLabels: ["p in %"], answer: [p], tolerance: 0.051, data: { p, G, W } };
  }
  function check_einzel(task, inp) { const v = parseUserNumber(String(inp[0]).replace("%", "").replace("€", "")); const ok = !isNaN(v) && Math.abs(v - task.answer[0]) <= task.tolerance; return { correct: ok, fieldErrors: ok ? [] : [0] }; }
  const dreisatz = (zeilen) => zeilen.map((z) => ({ left: z, right: "" }));
  function steps_proz_2(task) { const { p, G, W } = task.data; return [{ label: "W = G · p/100" }].concat(dreisatz([`W = ${tausender(G)}\\cdot \\dfrac{${fmtNum(p)}}{100} = ${fmtNum(W)}`])); }
  function steps_proz_3(task) { const { p, G, W } = task.data; return [{ label: "G = W : p/100 (Dreisatz: erst 1 %, dann 100 %)" }].concat(dreisatz([`1\\,\\% = ${fmtNum(W)} : ${fmtNum(p)} = ${fmtNum(round4(W / p))}`, `100\\,\\% = ${fmtNum(round4(W / p))}\\cdot 100 = ${fmtNum(G)}`])); }
  function steps_proz_4(task) { const { p, G, W } = task.data; return [{ label: "p = W : G · 100" }].concat(dreisatz([`p = \\dfrac{${fmtNum(W)}}{${fmtNum(G)}}\\cdot 100 \\approx ${fmtNum(p)}\\,\\%`])); }

  // ---- Stufe 5: vermehrter / verminderter Grundwert ----
  function gen_proz_5() {
    const sub = choice(["rabatt", "aufschlag", "originalpreis", "netto"]);
    if (sub === "rabatt" || sub === "originalpreis") {
      const p = choice([10, 15, 20, 25, 30, 40, 50]), alt = choice([19.99, 24.9, 39.9, 49.99, 59, 79.95, 89, 120, 149.99, 249]);
      const neu = geld(alt * (1 - p / 100));
      if (sub === "rabatt") return { topic: "prozentrechnung", level: 5, subtype: sub, prompt: T(`Ein Artikel kostet ${euroTxt(alt)} €. Er wird um ${p} % reduziert.`), promptText: "Rabatt",
        question: T("Wie viel kostet er jetzt?"), numFields: 1, fieldLabels: ["neuer Preis in €"], answer: [neu], tolerance: 0.011, data: { p, alt, neu } };
      return { topic: "prozentrechnung", level: 5, subtype: sub, prompt: T(`Nach einer Preissenkung um ${p} % kostet ein Artikel ${euroTxt(neu)} €.`), promptText: "Originalpreis",
        question: T("Wie viel hat er vorher gekostet?"), numFields: 1, fieldLabels: ["alter Preis in €"], answer: [geld(neu / (1 - p / 100))], tolerance: 0.011, data: { p, alt, neu } };
    }
    const netto = choice([100, 120, 250, 380, 420, 599, 840, 1250, 2400]), brutto = geld(netto * 1.19);
    if (sub === "aufschlag") return { topic: "prozentrechnung", level: 5, subtype: sub, prompt: T(`Ein Fahrrad kostet ohne Mehrwertsteuer ${tausender(netto)} €. Dazu kommen 19 % Mehrwertsteuer.`), promptText: "MwSt",
      question: T("Wie hoch ist der Endpreis?"), numFields: 1, fieldLabels: ["Endpreis in €"], answer: [brutto], tolerance: 0.011, data: { p: 19, netto, brutto } };
    return { topic: "prozentrechnung", level: 5, subtype: sub, prompt: T(`Ein Laptop kostet ${euroTxt(brutto)} € einschließlich 19 % Mehrwertsteuer.`), promptText: "Netto",
      question: T("Wie hoch ist der Preis ohne Mehrwertsteuer?"), numFields: 1, fieldLabels: ["Nettopreis in €"], answer: [geld(brutto / 1.19)], tolerance: 0.011, data: { p: 19, netto, brutto } };
  }
  function steps_proz_5(task) {
    const d = task.data, s = task.subtype;
    if (s === "rabatt") return [{ label: `Nach ${d.p} % Rabatt bleiben ${100 - d.p} % übrig` }].concat(dreisatz([`${fmtNum(d.alt.toFixed(2))}\\cdot ${fmtNum((100 - d.p) / 100)} \\approx ${fmtNum(d.neu.toFixed(2))}`]));
    if (s === "originalpreis") return [{ label: `Der neue Preis sind ${100 - d.p} % des ALTEN Preises – also durch ${fmtNum((100 - d.p) / 100)} teilen` }].concat(dreisatz([`${fmtNum(d.neu.toFixed(2))} : ${fmtNum((100 - d.p) / 100)} \\approx ${fmtNum(task.answer[0].toFixed(2))}`]), [{ label: `Achtung: NICHT ${d.p} % des neuen Preises draufrechnen – die beziehen sich auf eine andere Grundmenge.` }]);
    if (s === "aufschlag") return [{ label: "Mit Mehrwertsteuer sind es 119 % des Nettopreises" }].concat(dreisatz([`${d.netto}\\cdot 1,19 = ${fmtNum(d.brutto.toFixed(2))}`]));
    return [{ label: "Der Endpreis sind 119 % – durch 1,19 teilen" }].concat(dreisatz([`${fmtNum(d.brutto.toFixed(2))} : 1,19 \\approx ${fmtNum(task.answer[0].toFixed(2))}`]), [{ label: "Nicht einfach 19 % vom Endpreis abziehen!" }]);
  }

  // ---- Stufe 6: prozentuale Veränderung, Prozentpunkte ----
  function gen_proz_6() {
    if (Math.random() < 0.35) {
      let a, b; do { a = randInt(4, 40); b = randInt(4, 40); } while (a === b || ((b - a) * 1000) % a !== 0);
      const partei = choice(["Die Grünen", "Partei A", "die Schülervertretungsliste „Mitreden“", "der Vorschlag „Längere Pausen“"]);
      return { topic: "prozentrechnung", level: 6, subtype: "punkte", signed: true,
        prompt: T(`Bei einer Umfrage erhielt ${partei} im letzten Jahr ${a} % der Stimmen, in diesem Jahr ${b} %.`), promptText: "Prozentpunkte",
        question: T("Um wie viele Prozentpunkte und um wie viel Prozent hat sich der Anteil verändert?"), numFields: 2,
        fieldLabels: ["Änderung in Prozentpunkten", "Änderung in Prozent (1 Nachkommastelle)"], answer: [b - a, pr1((b - a) / a)], tolerances: [1e-9, 0.051], data: { a, b } };
    }
    let alt, neu; do { alt = choice([20, 40, 50, 80, 120, 160, 200, 250, 400, 500, 800]); neu = randInt(Math.ceil(alt * 0.4), Math.floor(alt * 1.8)); } while (neu === alt || ((neu - alt) * 1000) % alt !== 0);
    return { topic: "prozentrechnung", level: 6, subtype: "veraenderung", signed: true,
      prompt: T(`Ein Wert ändert sich von ${alt} auf ${neu}.`), promptText: "Veränderung",
      question: T("Um wie viel Prozent hat er sich verändert? (Abnahme negativ, 1 Nachkommastelle)"), numFields: 1, fieldLabels: ["Änderung in %"],
      answer: [pr1((neu - alt) / alt)], tolerances: [0.051], data: { a: alt, b: neu } };
  }
  function check_proz_6(task, inp) { const err = []; task.answer.forEach((a, i) => { const v = parseUserNumber(String(inp[i]).replace("%", "")); if (isNaN(v) || Math.abs(v - a) > task.tolerances[i]) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
  function steps_proz_6(task) {
    const { a, b } = task.data;
    const pr = [{ label: "Veränderung in % = Unterschied : ALTER Wert · 100" }, { left: `\\dfrac{${b} - ${a}}{${a}}\\cdot 100 = ${fmtNum(Math.round(((b - a) / a) * 1000) / 10)}\\,\\%`, right: "" }];
    if (task.subtype !== "punkte") return pr;
    return [{ label: "Prozentpunkte: einfach die beiden Prozentangaben subtrahieren" }, { left: `${b}\\,\\% - ${a}\\,\\% = ${b - a}\\;${T("Prozentpunkte")}`, right: "" }].concat(pr);
  }

  // ---- Stufe 7: Zinsrechnung ----
  function gen_proz_7() {
    const sub = choice(["jahr", "monate", "tage", "kapital"]), K = choice([500, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000]), p = choice([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]);
    const Zj = geld((K * p) / 100);
    if (sub === "jahr") return { topic: "prozentrechnung", level: 7, subtype: sub, prompt: T(`${tausender(K)} € werden ein Jahr lang zu ${fmtNum(p)} % angelegt.`), promptText: "Jahreszinsen",
      question: T("Wie viele Zinsen gibt es?"), numFields: 1, fieldLabels: ["Zinsen in €"], answer: [Zj], tolerance: 0.011, data: { K, p } };
    if (sub === "monate") { const m = choice([3, 4, 6, 8, 9]); return { topic: "prozentrechnung", level: 7, subtype: sub, prompt: T(`${tausender(K)} € werden ${m} Monate lang zu ${fmtNum(p)} % pro Jahr angelegt.`), promptText: "Monatszinsen",
      question: T("Wie viele Zinsen gibt es für diese Zeit?"), numFields: 1, fieldLabels: ["Zinsen in €"], answer: [geld((K * p * m) / 1200)], tolerance: 0.011, data: { K, p, m } }; }
    if (sub === "tage") { const t = choice([30, 45, 60, 90, 120, 180, 240]); return { topic: "prozentrechnung", level: 7, subtype: sub, prompt: T(`Ein Kredit über ${tausender(K)} € läuft ${t} Tage zu ${fmtNum(p)} % pro Jahr (Bankjahr: 360 Tage).`), promptText: "Tageszinsen",
      question: T("Wie viele Zinsen fallen an?"), numFields: 1, fieldLabels: ["Zinsen in €"], answer: [geld((K * p * t) / 36000)], tolerance: 0.011, data: { K, p, t } }; }
    return { topic: "prozentrechnung", level: 7, subtype: sub, prompt: T(`Bei ${fmtNum(p)} % Zinsen pro Jahr bekommt ${choice(NAMEN)} nach einem Jahr ${euroTxt(Zj)} € Zinsen.`), promptText: "Kapital",
      question: T("Wie viel Geld war angelegt?"), numFields: 1, fieldLabels: ["Kapital in €"], answer: [K], tolerance: 0.011, data: { K, p } };
  }
  function steps_proz_7(task) {
    const d = task.data, s = task.subtype;
    if (s === "jahr") return [{ label: "Jahreszinsen Z = K · p/100" }].concat(dreisatz([`${d.K}\\cdot \\dfrac{${fmtNum(d.p)}}{100} = ${fmtNum(task.answer[0].toFixed(2))}`]));
    if (s === "monate") return [{ label: "Zinsen für m Monate: Jahreszinsen · m/12" }].concat(dreisatz([`${d.K}\\cdot \\dfrac{${fmtNum(d.p)}}{100}\\cdot \\dfrac{${d.m}}{12} = ${fmtNum(task.answer[0].toFixed(2))}`]));
    if (s === "tage") return [{ label: "Zinsen für t Tage: Jahreszinsen · t/360" }].concat(dreisatz([`${d.K}\\cdot \\dfrac{${fmtNum(d.p)}}{100}\\cdot \\dfrac{${d.t}}{360} = ${fmtNum(task.answer[0].toFixed(2))}`]));
    return [{ label: "K = Z : p/100 (die Zinsen sind p % des Kapitals)" }].concat(dreisatz([`K = ${fmtNum(geld((d.K * d.p) / 100).toFixed(2))} : ${fmtNum(d.p / 100)} = ${d.K}`]));
  }

  // ---- Stufe 8: Textaufgaben ----
  function gen_proz_8() {
    const sub = choice(["doppelrabatt", "rechnung", "angebote", "zucker"]), n = choice(NAMEN);
    if (sub === "doppelrabatt") {
      const r1 = choice([20, 25, 30, 40, 50]), r2 = choice([10, 20, 25]), preis = choice([60, 80, 100, 120, 150, 200]);
      const end = geld(preis * (1 - r1 / 100) * (1 - r2 / 100)), ges = pr1(1 - (1 - r1 / 100) * (1 - r2 / 100));
      return textTask("prozentrechnung", 8, sub,
        T(`Im Schlussverkauf sind Jacken um ${r1} % reduziert. An der Kasse gibt es auf den reduzierten Preis noch einmal ${r2} % Rabatt. ${n} kauft eine Jacke, die ursprünglich ${preis} € gekostet hat.`),
        T("Was zahlt " + n + ", und wie viel Prozent Rabatt sind das insgesamt?"), [
          { label: "Endpreis in €", kind: "number", answer: end, tol: 0.011 }, { label: "Gesamtrabatt in % (1 Nachkommastelle)", kind: "number", answer: ges, tol: 0.051 }
        ], [
          { left: `${preis}\\cdot ${fmtNum(1 - r1 / 100)}\\cdot ${fmtNum(1 - r2 / 100)} = ${fmtNum(end.toFixed(2))}`, right: "" },
          { label: "Gesamtrabatt: Ersparnis bezogen auf den Ursprungspreis" }, { left: `\\dfrac{${preis} - ${fmtNum(end)}}{${preis}}\\cdot 100 = ${fmtNum(ges)}\\,\\%`, right: "" },
          { label: `Nicht ${r1} % + ${r2} % = ${r1 + r2} %: Der zweite Rabatt bezieht sich auf den schon reduzierten Preis.` }
        ], { dataExtra: { r1, r2, preis } });
    }
    if (sub === "rechnung") {
      const std = choice([2, 3, 4, 5, 6]), lohn = choice([48, 52, 55, 60, 65]), mat = choice([35.5, 64.8, 89.9, 120, 145.6]), netto = geld(std * lohn + mat), mw = geld(netto * 0.19), brutto = geld(netto + mw);
      return textTask("prozentrechnung", 8, sub,
        T(`Familie ${choice(FAMILIEN)} lässt die Heizung reparieren. Die Rechnung: ${std} Arbeitsstunden zu je ${lohn} €, Material für ${euroTxt(mat)} €, dazu 19 % Mehrwertsteuer auf alles.`),
        T("Wie hoch sind der Nettobetrag, die Mehrwertsteuer und der Gesamtbetrag?"), [
          { label: "Nettobetrag in €", kind: "number", answer: netto, tol: 0.005 }, { label: "Mehrwertsteuer in €", kind: "number", answer: mw, tol: 0.011 }, { label: "Gesamtbetrag in €", kind: "number", answer: brutto, tol: 0.011 }
        ], [
          { left: `${std}\\cdot ${lohn} + ${fmtNum(mat.toFixed(2))} = ${fmtNum(netto.toFixed(2))}`, right: "" },
          { left: `${fmtNum(netto.toFixed(2))}\\cdot 0,19 \\approx ${fmtNum(mw.toFixed(2))}`, right: "" }, { left: `${fmtNum(netto.toFixed(2))} + ${fmtNum(mw.toFixed(2))} = ${fmtNum(brutto.toFixed(2))}`, right: "" }
        ], { dataExtra: { std, lohn, mat } });
    }
    if (sub === "angebote") {
      const pA = choice([180, 220, 260, 300, 349]), rA = choice([10, 15, 20, 25]), pB = pA + choice([-20, -10, 10, 20, 30]), rB = choice([25, 30, 40, 50, 60]);
      const a = geld(pA * (1 - rA / 100)), b = pB - rB;
      if (Math.abs(a - b) < 0.01) return gen_proz_8();
      const besser = a < b ? "Laden A" : "Laden B";
      return textTask("prozentrechnung", 8, sub,
        T(`${n} möchte einen Tretroller kaufen. Laden A verkauft ihn für ${pA} € mit ${rA} % Rabatt. Laden B verlangt ${pB} €, gibt aber ${rB} € Nachlass.`),
        T("Welches Angebot ist günstiger, und wie viel spart man damit?"), [
          { label: "günstiger ist", kind: "choice", choices: ["Laden A", "Laden B"], answer: besser }, { label: "Ersparnis in €", kind: "number", answer: geld(Math.abs(a - b)), tol: 0.011 }
        ], [
          { left: T(`A: ${pA} · ${fmtNum(1 - rA / 100)} = ${fmtNum(a.toFixed(2))} €`), right: "" }, { left: T(`B: ${pB} − ${rB} = ${b} €`), right: "" },
          { left: T(`Unterschied: ${fmtNum(geld(Math.abs(a - b)).toFixed(2))} €`), right: "" }
        ], { dataExtra: { pA, rA, pB, rB } });
    }
    const port = choice([40, 50, 60]), zucker = choice([6, 8, 9, 12, 15]), pack = choice([375, 500, 750]);
    const anteil = pr1(zucker / port);
    return textTask("prozentrechnung", 8, sub,
      T(`Auf einer Müslipackung (${pack} g) steht: „Eine Portion (${port} g) enthält ${zucker} g Zucker.“ Die Weltgesundheitsorganisation empfiehlt, dass Lebensmittel möglichst weniger als 10 % Zucker enthalten.`),
      T("Wie hoch ist der Zuckeranteil, und wie viel Zucker steckt in der ganzen Packung?"), [
        { label: "Zuckeranteil in % (1 Nachkommastelle)", kind: "number", answer: anteil, tol: 0.051 }, { label: "Zucker in der Packung in g", kind: "number", answer: Math.round((zucker / port) * pack * 10) / 10, tol: 0.051 },
        { label: "unter 10 %?", kind: "choice", choices: ["ja", "nein"], answer: anteil < 10 ? "ja" : "nein" }
      ], [
        { left: `\\dfrac{${zucker}}{${port}}\\cdot 100 = ${fmtNum(anteil)}\\,\\%`, right: "" }, { left: `${pack}\\cdot ${fmtNum(round4(zucker / port))} = ${fmtNum(Math.round((zucker / port) * pack * 10) / 10)}\\text{ g}`, right: "" }
      ], { dataExtra: { port, zucker, pack } });
  }

  TOPICS.prozentrechnung = {
    name: "Prozentrechnung",
    grade: "Kl. 7",
    levels: [
      { id: 1, name: "Prozent, Bruch, Dezimalzahl", grade: "Kl. 6–7", generate: gen_proz_1, check: check_proz_1, steps: steps_proz_1 },
      { id: 2, name: "Prozentwert berechnen", grade: "Kl. 7", generate: gen_proz_2, check: check_einzel, steps: steps_proz_2 },
      { id: 3, name: "Grundwert berechnen", grade: "Kl. 7", generate: gen_proz_3, check: check_einzel, steps: steps_proz_3 },
      { id: 4, name: "Prozentsatz berechnen", grade: "Kl. 7", generate: gen_proz_4, check: check_einzel, steps: steps_proz_4 },
      { id: 5, name: "Rabatt und Mehrwertsteuer", grade: "Kl. 7", calculatorHint: "Taschenrechner erlaubt", generate: gen_proz_5, check: check_einzel, steps: steps_proz_5 },
      { id: 6, name: "Veränderung in Prozent", grade: "Kl. 7–8", signed: true, calculatorHint: "Taschenrechner erlaubt", generate: gen_proz_6, check: check_proz_6, steps: steps_proz_6 },
      { id: 7, name: "Zinsrechnung", grade: "Kl. 7", calculatorHint: "Taschenrechner erlaubt", generate: gen_proz_7, check: check_einzel, steps: steps_proz_7 },
      { id: 8, name: "Prozente im Alltag", grade: "Kl. 7–8", calculatorHint: "Taschenrechner erlaubt", generate: gen_proz_8, check: check_textaufgabe, steps: steps_textaufgabe },
      { id: 9, name: "Diagramme lesen und beurteilen", grade: "Kl. 7", generate: gen_proz_9, check: check_textaufgabe, steps: steps_textaufgabe }
    ]
  };

  // --- Grafiken: Prozentstreifen und Kreisdiagramm ---
  function prozentstreifenSVG(p, G, W, einheit) {
    const x0 = 20, w = 260, xp = x0 + (w * Math.min(p, 100)) / 100;
    return `<svg viewBox="0 0 300 110" width="300" height="110" xmlns="http://www.w3.org/2000/svg">` +
      `<rect x="${x0}" y="35" width="${w}" height="30" fill="white" stroke="#1e3a8a"/><rect x="${x0}" y="35" width="${(xp - x0).toFixed(1)}" height="30" fill="#93c5fd" stroke="#1e3a8a"/>` +
      `<text x="${x0}" y="25" font-size="12">0 %</text><text x="${(xp - 6).toFixed(1)}" y="25" font-size="12" font-weight="bold" fill="#1e40af">${fmtNum(p)} %</text><text x="${x0 + w - 30}" y="25" font-size="12">100 %</text>` +
      `<text x="${x0}" y="85" font-size="12">0</text><text x="${(xp - 6).toFixed(1)}" y="85" font-size="12" font-weight="bold" fill="#1e40af">W = ${W}</text><text x="${x0 + w - 40}" y="85" font-size="12">G = ${G}</text>` +
      `<text x="${x0}" y="104" font-size="11" fill="#475569">Prozentwert W ist der markierte Teil des Grundwerts G${einheit ? " (" + einheit + ")" : ""}</text></svg>`;
  }
  function kreisdiagrammSVG(teile, ohneWerte) { // teile: [[name, prozent], ...]; Legende unter dem Kreis (handytauglich)
    const farben = ["#60a5fa", "#f59e0b", "#34d399", "#f472b6", "#a78bfa", "#fb7185"], cx = 150, cy = 100, r = 88, H0 = 205;
    let w = -90, svg = `<svg viewBox="0 0 300 ${H0 + teile.length * 22}" width="300" height="${H0 + teile.length * 22}" xmlns="http://www.w3.org/2000/svg">`;
    teile.forEach(([name, p], i) => {
      const w2 = w + (p * 360) / 100, gross = p > 50 ? 1 : 0;
      const P = (g) => [cx + r * Math.cos((g * Math.PI) / 180), cy + r * Math.sin((g * Math.PI) / 180)];
      const [x1, y1] = P(w), [x2, y2] = P(w2);
      svg += `<path d="M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${gross} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${farben[i % farben.length]}" stroke="white" stroke-width="2"/>`;
      svg += `<rect x="40" y="${H0 - 8 + i * 22}" width="14" height="14" fill="${farben[i % farben.length]}"/><text x="60" y="${H0 + 4 + i * 22}" font-size="13">${ohneWerte ? name : `${name}: ${fmtNum(p)} % ≙ ${fmtNum(roundKfm((p * 360) / 100, 1))}°`}</text>`;
      w = w2;
    });
    return svg + `</svg>`;
  }


  Object.assign(ERKL, {
    "prozentrechnung/1": E("Prozent, Bruch, Dezimalzahl",
      [T("Prozent heißt „von Hundert“: p % = p/100."), T("Prozent → Dezimalzahl: durch 100 teilen (Komma 2 Stellen nach links). Dezimalzahl → Prozent: mal 100.")],
      [{ left: `25\\,\\% = \\dfrac{25}{100} = \\dfrac{1}{4} = 0,25\\,, \\qquad 12,5\\,\\% = \\dfrac{1}{8} = 0,125`, right: "" }],
      [T("0,5 = 5 % rechnen – richtig ist 0,5 = 50 %."), T("Den Bruch nicht vollständig kürzen.")], "streifen25"),
    "prozentrechnung/2": E("Prozentwert", [`W = G\\cdot \\dfrac{p}{100}`, T("Dreisatz: 100 % ≙ G,  1 % ≙ G : 100,  p % ≙ (G : 100) · p.")],
      [{ left: `15\\,\\%\\; ${T("von")}\\; 240 = 240\\cdot 0,15 = 36`, right: "" }], [T("Mit 15 statt 0,15 multiplizieren."), T("Grundwert und Prozentwert verwechseln.")], "streifen"),
    "prozentrechnung/3": E("Grundwert", [`G = W : \\dfrac{p}{100}`, T("Dreisatz: p % ≙ W,  1 % ≙ W : p,  100 % ≙ (W : p) · 100.")],
      [{ left: `${T("15 % sind 36 €")}:\\;\\; G = 36 : 0,15 = 240`, right: "" }], [T("W · p/100 rechnen – das wäre der Prozentwert von W, nicht der Grundwert.")], "streifen"),
    "prozentrechnung/4": E("Prozentsatz", [`p = \\dfrac{W}{G}\\cdot 100`, T("Immer: Teil durch Ganzes.")],
      [{ left: `${T("36 von 240")}:\\;\\; \\dfrac{36}{240}\\cdot 100 = 15\\,\\%`, right: "" }], [T("Ganzes durch Teil rechnen (240 : 36).")], "streifen"),
    "prozentrechnung/5": E("Rabatt und Mehrwertsteuer",
      [T("Um p % reduziert: neuer Preis = alter Preis · (1 − p/100)."), T("Um p % erhöht (z. B. 19 % MwSt.): neuer Preis = alter Preis · (1 + p/100)."), T("Rückwärts (Originalpreis, Nettopreis): durch denselben Faktor TEILEN.")],
      [{ left: `${T("−20 %:")}\\; 50 \\cdot 0,8 = 40\\,, \\qquad ${T("zurück:")}\\; 40 : 0,8 = 50`, right: "" }],
      [T("Rückwärts p % vom neuen Preis aufschlagen: 40 + 20 % = 48, nicht 50!"), T("Beim Nettopreis 19 % vom Endpreis abziehen.")]),
    "prozentrechnung/6": E("Veränderung in Prozent",
      [T("Veränderung in % = (neuer Wert − alter Wert) : ALTER Wert · 100."), T("Prozentpunkte: Differenz zweier Prozentangaben (von 20 % auf 25 %: +5 Prozentpunkte, aber +25 %).")],
      [{ left: `${T("von 80 auf 100")}:\\;\\; \\dfrac{20}{80}\\cdot 100 = 25\\,\\%\\,, \\quad ${T("von 100 auf 80")}:\\; -20\\,\\%`, right: "" }],
      [T("Durch den neuen statt den alten Wert teilen."), T("Prozentpunkte und Prozent gleichsetzen.")]),
    "prozentrechnung/7": E("Zinsrechnung",
      [`Z = K\\cdot \\dfrac{p}{100}\\;\\;${T("(ein Jahr)")}`, `${T("für m Monate:")}\\; \\cdot \\dfrac{m}{12}\\,, \\qquad ${T("für t Tage:")}\\; \\cdot \\dfrac{t}{360}`],
      [{ left: `2000\\;€,\\; 3\\,\\%,\\; 4\\;${T("Monate")}:\\;\\; 2000\\cdot 0,03\\cdot \\dfrac{4}{12} = 20\\;€`, right: "" }],
      [T("Bei Monaten oder Tagen die volle Jahresrechnung nehmen."), T("Mit 365 statt 360 Tagen rechnen (im Bankjahr gilt 360).")]),
    "prozentrechnung/8": E("Prozente im Alltag",
      [T("Erst klären: Was ist der Grundwert (100 %)? Bei mehreren Rabatten ändert er sich nach jedem Schritt."), T("Mehrere Änderungen nacheinander: Faktoren multiplizieren, nicht Prozente addieren.")],
      [{ left: `-20\\,\\%\\;${T("und dann")}\\;-10\\,\\%:\\;\\; 0,8\\cdot 0,9 = 0,72 \\;\\Rightarrow\\; -28\\,\\%`, right: "" }],
      [T("20 % + 10 % = 30 % Rabatt rechnen."), T("Prozent-Rabatt und Euro-Nachlass ohne Ausrechnen vergleichen.")])
  });
  const erklGrafikPR = erklGrafik;
  erklGrafik = function (art) { return art === "streifen" ? prozentstreifenSVG(15, 240, 36) : erklGrafikPR(art); };

  H.grundwertMal = "Das wäre der Prozentwert von W. Für den Grundwert durch p/100 TEILEN.";
  H.ganzesDurchTeil = "Teil durch Ganzes: Prozentwert durch Grundwert.";
  H.mitP = "Mit p/100 multiplizieren, nicht mit p.";
  H.rueckwaerts = "Der Rabatt bezieht sich auf den ALTEN Preis – teile den neuen Preis durch (1 − p/100).";
  H.nettoAbziehen = "19 % vom Endpreis abziehen ist falsch – teile durch 1,19.";
  H.bezugAlt = "Die Veränderung wird auf den ALTEN Wert bezogen.";
  H.punkteProzent = "Prozentpunkte und Prozent verwechselt: Prozentpunkte = Differenz der beiden Prozentangaben.";
  H.rabattAddiert = "Rabatte nicht addieren: Der zweite Rabatt gilt auf den schon reduzierten Preis.";
  H.zinsJahr = "Das sind die Jahreszinsen – für die kürzere Zeit noch anteilig umrechnen.";
  Object.assign(DIAG, {
    "prozentrechnung/2": (t, i, w) => (nah(w.v, t.data.G * t.data.p) ? H.mitP : null),
    "prozentrechnung/3": (t, i, w) => naechsterHinweis(w.v, [[(t.data.W * t.data.p) / 100, H.grundwertMal], [t.data.W / t.data.p, H.mitP]], 0.002),
    "prozentrechnung/4": (t, i, w) => (nah(w.v, (t.data.G / t.data.W) * 100, 0.002) ? H.ganzesDurchTeil : null),
    "prozentrechnung/5": (t, i, w) => {
      const d = t.data;
      if (t.subtype === "originalpreis" && nah(w.v, d.neu * (1 + d.p / 100), 0.002)) return H.rueckwaerts;
      if (t.subtype === "netto" && nah(w.v, d.brutto * 0.81, 0.002)) return H.nettoAbziehen;
      return null;
    },
    "prozentrechnung/6": (t, i, w) => {
      const { a, b } = t.data;
      if (t.subtype === "punkte" && i === 1 && nah(w.v, b - a)) return H.punkteProzent;
      if (t.subtype === "punkte" && i === 0 && Math.abs(w.v - ((b - a) / a) * 100) < 0.06) return H.punkteProzent;
      if ((t.subtype === "veraenderung" || i === 1) && Math.abs(w.v - ((b - a) / b) * 100) < 0.06) return H.bezugAlt;
      return null;
    },
    "prozentrechnung/7": (t, i, w) => (["monate", "tage"].includes(t.subtype) && nah(w.v, (t.data.K * t.data.p) / 100) ? H.zinsJahr : null),
    "prozentrechnung/8": (t, i, w) => {
      const d = t.dataExtra;
      if (t.subtype === "doppelrabatt" && i === 1 && nah(w.v, d.r1 + d.r2)) return H.rabattAddiert;
      if (t.subtype === "doppelrabatt" && i === 0 && nah(w.v, d.preis * (1 - (d.r1 + d.r2) / 100), 0.002)) return H.rabattAddiert;
      return null;
    }
  });

  // Säulendiagramm; ymin > 0 erzeugt eine abgeschnittene (irreführende) Achse
  function saeulenSVG(werte, namen, ymin, ymax, schritt, titel) {
    const x0 = 46, y0 = 200, h = 170, w = 240, bw = w / werte.length;
    const py = (v) => y0 - ((v - ymin) / (ymax - ymin)) * h;
    let svg = `<svg viewBox="0 0 300 240" width="300" height="240" xmlns="http://www.w3.org/2000/svg">`;
    for (let v = ymin; v <= ymax + 1e-9; v += schritt) svg += `<line x1="${x0}" y1="${py(v).toFixed(1)}" x2="${x0 + w}" y2="${py(v).toFixed(1)}" stroke="#e2e8f0"/><text x="${x0 - 4}" y="${(py(v) + 4).toFixed(1)}" font-size="10" text-anchor="end">${fmtNum(v)}</text>`;
    werte.forEach((v, i) => {
      svg += `<rect x="${(x0 + i * bw + bw * 0.2).toFixed(1)}" y="${py(v).toFixed(1)}" width="${(bw * 0.6).toFixed(1)}" height="${(y0 - py(v)).toFixed(1)}" fill="#60a5fa" stroke="#1e3a8a"/>`;
      svg += `<text x="${(x0 + i * bw + bw / 2).toFixed(1)}" y="${y0 + 15}" font-size="11" text-anchor="middle">${namen[i]}</text>`;
    });
    svg += `<line x1="${x0}" y1="${y0}" x2="${x0 + w}" y2="${y0}" stroke="#334155"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - h}" stroke="#334155"/>`;
    if (titel) svg += `<text x="150" y="16" font-size="12" font-weight="bold" text-anchor="middle">${titel}</text>`;
    return svg + `</svg>`;
  }
  // Prozentsätze (Vielfache von 5), die zusammen 100 ergeben
  function anteileSumme100(n) { let a; do { a = Array.from({ length: n }, () => 5 * randInt(2, 9)); } while (a.reduce((x, y) => x + y, 0) !== 100 || new Set(a).size < n); return a; }

  // ---- Stufe 9: Diagramme lesen und beurteilen ----
  function gen_proz_9() {
    if (Math.random() < 0.6) {
      const namen = mische(["Bus", "Fahrrad", "zu Fuß", "Auto", "Bahn"]).slice(0, 4), proz = anteileSumme100(4), N = choice([200, 300, 400, 500, 600]);
      const i = randInt(0, 3), j = (i + randInt(1, 3)) % 4; // geschätzt wird i, gerechnet mit j (verrät i nicht)
      return textTask("prozentrechnung", 9, "kreis",
        T(`Das Kreisdiagramm zeigt, wie die ${N} Schülerinnen und Schüler einer Schule zur Schule kommen.`),
        T(`Schätze den Anteil „${namen[i]}“ in Prozent. Der Anteil „${namen[j]}“ beträgt genau ${proz[j]} % – wie viele Personen sind das?`), [
          { label: `geschätzter Anteil „${namen[i]}“ in %`, kind: "number", answer: proz[i], tol: 5 },
          { label: `Anzahl „${namen[j]}“`, kind: "number", answer: (N * proz[j]) / 100 }
        ], [
          { label: "Schätzen: Ein Viertel des Kreises sind 25 %, die Hälfte 50 %." }, { left: T(`„${namen[i]}“: genau ${proz[i]} % (± 5 % gilt als richtig geschätzt)`), right: "" },
          { left: `${N}\\cdot \\dfrac{${proz[j]}}{100} = ${(N * proz[j]) / 100}`, right: "" }
        ], { graph: kreisdiagrammSVG(namen.map((nm, k) => [nm, proz[k]]), true), dataExtra: { N, i, j, proz } });
    }
    // glatte Prozentsätze (8, 10, 16, 20 %), damit ohne Taschenrechner lösbar
    const [start, steig] = choice([[2, 0.05], [2, 0.1], [2.5, 0.05], [2.5, 0.1]]), jahre = ["2021", "2022", "2023", "2024", "2025"];
    const werte = jahre.map((_, k) => roundKfm(start + steig * k, 2)), gesamt = pr1((werte[4] - werte[0]) / werte[0]);
    const ehrlich = Math.random() < 0.35; // Achse ab 0 -> nicht irreführend (sonst wäre „ja“ immer richtig)
    return textTask("prozentrechnung", 9, "achse",
      T(`Die Schülerzeitung titelt „Brezelpreis explodiert!“ und zeigt dazu das Säulendiagramm mit den Preisen in Euro.`),
      T("Um wie viel Prozent ist der Preis von 2021 bis 2025 gestiegen, und ist das Diagramm irreführend?"), [
        { label: "Preissteigerung in % (1 Nachkommastelle)", kind: "number", answer: gesamt, tol: 0.051 },
        { label: "Diagramm irreführend?", kind: "choice", choices: ["ja", "nein"], answer: ehrlich ? "nein" : "ja" }
      ], [
        { label: "Steigerung in % = Unterschied : Preis am Anfang · 100 – die Werte an den Säulen ablesen" },
        { left: `\\dfrac{${fmtNum(werte[4])} - ${fmtNum(werte[0])}}{${fmtNum(werte[0])}}\\cdot 100 \\approx ${fmtNum(gesamt)}\\,\\%`, right: "" },
        { label: ehrlich ? "Die Achse beginnt bei 0 – die Säulen zeigen die Preise maßstabsgetreu. Das Diagramm ist nicht irreführend (die Schlagzeile allerdings übertreibt)." : `Die Achse beginnt nicht bei 0, sondern bei ${fmtNum(werte[0] - 0.1)} €. Dadurch wirken die Unterschiede viel größer, als sie sind.` }
      ], { graph: ehrlich ? saeulenSVG(werte, jahre, 0, 3, 0.5, "Brezelpreis in €") : saeulenSVG(werte, jahre, roundKfm(werte[0] - 0.1, 2), roundKfm(werte[4] + 0.05, 2), 0.1, "Brezelpreis in €"), dataExtra: { werte, ehrlich } });
  }

  // Klassenarbeit nach dem Vorbild der KM-BW-Beispielarbeit (Kl. 7): ohne Taschenrechner,
  // Zahlen entsprechend gewählt; Diagramme lesen/beurteilen; keine Zinsrechnung.
  KA_VORLAGEN.prozentrechnung = [
    { key: "grundbegriffe", teil: "A", afb: 1, titel: "Anteile umwandeln", baue: () => ({ kontext: "", teile: [stufenTeil("prozentrechnung", 1, (t) => t.subtype === "worte"), stufenTeil("prozentrechnung", 1, (t) => t.subtype !== "worte" && t.data.p <= 100)] }) },
    { key: "grundaufgaben", teil: "A", afb: 1, titel: "Grundaufgaben", baue: () => ({ kontext: "", teile: [
      stufenTeil("prozentrechnung", 2, (t) => [10, 20, 25, 50, 5, 75].includes(t.data.p)), stufenTeil("prozentrechnung", 3, (t) => [10, 20, 25, 50, 5].includes(t.data.p)), stufenTeil("prozentrechnung", 4, (t) => Number.isInteger(t.answer[0]))] }) },
    { key: "diagramm", teil: "A", afb: 2, titel: "Diagramme lesen", baue: () => {
      const t = stufenTeil("prozentrechnung", 9, (x) => x.subtype === "kreis");
      return { kontext: "", graph: t.task.graph, teile: [t] };
    } },
    { key: "abschlussball", teil: "A", afb: 2, titel: "Einkaufen mit Rabatt", baue: () => {
      const teile = [["Kleid", choice([80, 100, 120, 150]), choice([20, 25, 30])], ["Tasche", choice([40, 50, 60]), choice([10, 20, 50])], ["Schuhe", choice([60, 80, 90]), choice([10, 20, 30])]];
      const neu = teile.map(([, alt, r]) => (alt * (100 - r)) / 100), spar = teile.reduce((sum, [, alt, r]) => sum + (alt * r) / 100, 0);
      let a1, n1, a2, n2; do { a1 = choice([40, 50, 60, 80]); n1 = a1 - choice([4, 5, 8, 10, 12, 15, 20]); a2 = choice([40, 50, 60, 80]); n2 = a2 - choice([4, 5, 8, 10, 12, 15, 20]); } while ((a1 - n1) * a2 === (a2 - n2) * a1 || (((a1 - n1) * 100) % a1) || (((a2 - n2) * 100) % a2));
      const pr1x = ((a1 - n1) * 100) / a1, pr2x = ((a2 - n2) * 100) / a2;
      return { kontext: T(`Für den Abschlussball gibt es Rabatte: ${teile.map(([nm, alt, r]) => `${nm} ${alt} € (−${r} %)`).join(", ")}.`), teile: [
        papierTeil(T("✏️ Erkläre am Beispiel des Kleides die drei Grundbegriffe Grundwert, Prozentsatz und Prozentwert."), [
          { text: `Grundwert = ursprünglicher Preis (${teile[0][1]} €)`, punkte: 1 }, { text: `Prozentsatz = ${teile[0][2]} %, Prozentwert = Ersparnis (${(teile[0][1] * teile[0][2]) / 100} €)`, punkte: 1 }],
          [{ left: T(`G = ${teile[0][1]} €, p = ${teile[0][2]} %, W = ${teile[0][1]} · ${teile[0][2]}/100 = ${(teile[0][1] * teile[0][2]) / 100} €`), right: "" }]),
        autoTeil(T("Wie viel kosten die drei Teile zusammen nach den Rabatten, und wie viel spart man insgesamt?"), [
          { label: "Preis nach Rabatt in €", kind: "number", answer: neu.reduce((x, y) => x + y, 0), punkte: 2 }, { label: "Ersparnis in €", kind: "number", answer: spar }],
          [{ left: T(teile.map(([nm, alt, r], k) => `${nm}: ${alt} · ${(100 - r) / 100} = ${fmtNum(neu[k])} €`).join(";  ")), right: "" }]),
        autoTeil(T(`Tasche A kostete ${a1} € und kostet jetzt ${n1} €, Tasche B kostete ${a2} € und kostet jetzt ${n2} €. Bei welcher Tasche ist der Rabatt prozentual größer?`), [
          { label: "prozentual größerer Rabatt", kind: "choice", choices: ["Tasche A", "Tasche B"], answer: pr1x > pr2x ? "Tasche A" : "Tasche B", punkte: 2 }],
          [{ left: T(`A: ${a1 - n1} : ${a1} = ${fmtNum(pr1x)} %,  B: ${a2 - n2} : ${a2} = ${fmtNum(pr2x)} %`), right: "" }, { label: "Nicht den Euro-Betrag vergleichen, sondern den Anteil am alten Preis." }])
      ] };
    } },
    { key: "aussagen", teil: "A", afb: 3, titel: "Aussagen prüfen und Fehler finden", baue: () => {
      const pool = [
        () => aussageTeil(T("Lea behauptet: „20 % Rabatt und danach noch einmal 10 % Rabatt sind zusammen 30 % Rabatt.“"), false, ["0,8 · 0,9 = 0,72 – zusammen sind es nur 28 %.", "Stimmt, Rabatte darf man addieren.", "Es sind sogar mehr als 30 %."]),
        () => { const q = choice([20, 30, 40, 50]); return aussageTeil(T(`Ein Händler senkt den Preis von Schuhen um ${q} % und erhöht ihn später wieder um ${q} %. Tim behauptet: „Jetzt kosten sie wieder so viel wie am Anfang.“`), false, [`Die Erhöhung bezieht sich auf den niedrigeren Preis: ${fmtNum((100 - q) / 100)} · ${fmtNum((100 + q) / 100)} = ${fmtNum(((100 - q) * (100 + q)) / 10000)} – sie sind billiger als vorher.`, "Stimmt, −" + q + " % und +" + q + " % heben sich auf.", "Sie sind danach teurer als am Anfang."]); },
        () => { const a = choice([20, 40]), b = a + 5; return aussageTeil(T(`Ole behauptet: „Steigt ein Stimmenanteil von ${a} % auf ${b} %, ist das eine Steigerung um 5 %.“`), false, [`Es sind 5 Prozentpunkte, aber eine Steigerung um ${fmtNum(roundKfm((5 / a) * 100, 1))} %.`, "Stimmt, " + b + " − " + a + " = 5.", "Es sind 5 Prozentpunkte und ebenfalls 5 %."]); },
        () => aussageTeil(T("Lisa sagt: „Das Prozentzeichen ist eine Einheit wie cm, kg oder €.“"), false, ["% bedeutet „Hundertstel“ – es ist eine Zahlangabe (5 % = 0,05), keine Maßeinheit.", "Stimmt, man kann Prozent in andere Einheiten umrechnen.", "Stimmt, aber nur bei Geldbeträgen."]),
        () => { const p = choice([20, 25, 50]), neu = choice([40, 60, 80]), alt = neu / (1 - p / 100), falsch = neu * (1 + p / 100);
          return fehlerTeil(`${T(`Mia berechnet den Originalpreis einer um ${p} % reduzierten Hose (jetzt ${neu} €):`)}\\;\\; ${neu}\\cdot ${fmtNum(1 + p / 100)} = ${fmtNum(falsch)}\\;€`,
            [`Die ${p} % beziehen sich auf den alten Preis – sie hätte durch ${fmtNum(1 - p / 100)} teilen müssen.`, `Sie hätte ${p} % abziehen müssen.`, "Die Rechnung ist richtig."],
            { label: "richtiger Originalpreis in €", kind: "number", answer: geld(alt), tol: 0.011 }, [{ left: `${neu} : ${fmtNum(1 - p / 100)} = ${fmtNum(geld(alt))}`, right: "" }]); }
      ];
      return { kontext: "", teile: mische(pool).slice(0, 3).map((f) => f()) };
    } },
    { key: "irrefuehrend", teil: "A", afb: 3, titel: "Diagramme beurteilen", baue: () => {
      const t = stufenTeil("prozentrechnung", 9, (x) => x.subtype === "achse" && !x.dataExtra.ehrlich);
      return { kontext: "", graph: t.task.graph, teile: [t, papierTeil(T("✏️ Wie müsste das Diagramm aussehen, damit es nicht irreführt? Begründe."), [
        { text: "Die Hochachse muss bei 0 beginnen", punkte: 1 }, { text: "Begründung: Sonst wirken kleine Unterschiede riesig", punkte: 1 }], [{ label: "Die Achse bei 0 beginnen lassen; dann sieht man, dass die Preise nur leicht gestiegen sind." }])] };
    } },
    { key: "umfrage", teil: "A", afb: 2, titel: "Umfrage auswerten", baue: () => {
      const anz = choice([20, 25, 50]), namen = mische(["Fußball", "Schwimmen", "Tanzen", "Basketball", "Turnen"]).slice(0, 4);
      let werte; do { werte = namen.map(() => randInt(1, anz / 2)); } while (werte.reduce((x, y) => x + y, 0) !== anz || werte.some((x) => ((x * 100) % anz) !== 0) || werte.some((x) => ((x * 100 / anz) * 36) % 10 !== 0));
      const proz = werte.map((x) => (x * 100) / anz), g = kreisdiagrammSVG(namen.map((nm, k) => [nm, proz[k]]));
      return { kontext: T(`In einer Klasse wurde nach der Lieblingssportart gefragt (${anz} Antworten): ${namen.map((nm, k) => `${nm} ${werte[k]}`).join(", ")}.`), teile: [
        autoTeil(T("Wie viel Prozent der Antworten entfallen auf die einzelnen Sportarten?"), namen.map((nm, k) => ({ label: `${nm} in %`, kind: "number", answer: proz[k] })),
          [{ left: namen.map((nm, k) => `\\dfrac{${werte[k]}}{${anz}} = ${fmtNum(proz[k])}\\,\\%`).join("\\,,\\;"), right: "" }]),
        papierTeil(T("✏️ Zeichne ein Kreisdiagramm. Berechne dafür zuerst die Winkel der Kreisausschnitte (100 % ≙ 360°)."), [
          { text: "Winkel richtig berechnet (p % · 3,6°)", punkte: 1 }, { text: "Kreisausschnitte mit dem Geodreieck sauber eingezeichnet", punkte: 1 }, { text: "Diagramm beschriftet", punkte: 1 }],
          [{ left: namen.map((nm, k) => `${T(nm + ":")}\\; ${fmtNum(proz[k])}\\cdot 3,6° = ${fmtNum(roundKfm(proz[k] * 3.6, 1))}°`).join("\\,,\\;"), right: "" }], g)
      ] };
    } }
  ];
  KA_INFO.prozentrechnung = { klasse: "Kl. 7", tr: false };

  Object.assign(ERKL, {
    "prozentrechnung/9": E("Diagramme lesen und beurteilen",
      [T("Kreisdiagramm: Der ganze Kreis sind 100 %. Halbkreis = 50 %, Viertelkreis = 25 %, ein Zehntel ≈ 36°."), T("Anzahl aus dem Anteil: Gesamtzahl · p/100."),
       T("Säulendiagramm: Immer prüfen, wo die Hochachse beginnt. Beginnt sie nicht bei 0, wirken kleine Unterschiede riesig (irreführend).")],
      [{ left: T("Achse von 1,90 € bis 2,25 €: Die Säule 2025 wirkt fünfmal so hoch – der Preis ist aber nur um 10 % gestiegen."), right: "" }],
      [T("Beim Schätzen den Viertelkreis (25 %) als Hilfe vergessen."), T("Säulenhöhen vergleichen, ohne auf den Achsenanfang zu achten.")])
  });
  const erklGrafikPz = erklGrafik;
  erklGrafik = function (art) {
    if (art !== "streifen25") return erklGrafikPz(art);
    let s = `<svg viewBox="0 0 300 100" width="300" height="100" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i < 4; i++) s += `<rect x="${20 + i * 65}" y="30" width="65" height="30" fill="${i === 0 ? "#93c5fd" : "white"}" stroke="#1e3a8a"/>`;
    return s + `<text x="20" y="22" font-size="12">0 %</text><text x="70" y="22" font-size="12" font-weight="bold" fill="#1e40af">25 %</text><text x="252" y="22" font-size="12">100 %</text>` +
      `<text x="20" y="85" font-size="13" font-weight="bold" fill="#1e40af">25 % = 25/100 = 1/4 = 0,25</text></svg>`;
  };
