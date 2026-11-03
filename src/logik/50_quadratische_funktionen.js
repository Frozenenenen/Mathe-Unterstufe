  // ============================================================
  // QUADRATISCHE FUNKTIONEN (Kl. 9)
  // ============================================================
  function aTex(an, ad) { // Faktor vor der Klammer / vor x²
    const g = gcd(an, ad) || 1; let n = an / g, d = ad / g; if (d < 0) { n = -n; d = -d; }
    if (d === 1) return n === 1 ? "" : n === -1 ? "-" : `${n}`;
    return n < 0 ? `-\\dfrac{${-n}}{${d}}` : `\\dfrac{${n}}{${d}}`;
  }
  const xMinusD = (d) => (d === 0 ? "x" : d > 0 ? `(x - ${d})` : `(x + ${-d})`);
  const plusE = (e) => (e === 0 ? "" : e > 0 ? ` + ${fmtNum(e)}` : ` - ${fmtNum(-e)}`);
  function scheitelTex(an, ad, d, e) { return `f(x) = ${aTex(an, ad)}${xMinusD(d)}^{2}${plusE(e)}`; }
  function normalTex(p, q, v) { v = v || "x"; const pt = p === 0 ? "" : p === 1 ? ` + ${v}` : p === -1 ? ` - ${v}` : p > 0 ? ` + ${fmtNum(p)}${v}` : ` - ${fmtNum(-p)}${v}`; return `${v}^{2}${pt}${plusE(q)}`; }
  const A_WERTE = [[1, 1], [-1, 1], [2, 1], [-2, 1], [1, 2], [-1, 2], [3, 1]];
  function parabelSVG(a, d, e, extra) {
    const ys = [e, a * 9 + e];
    const cfg = Object.assign({ xmin: d - 5, xmax: d + 5, ymin: Math.max(-10, Math.floor(Math.min(...ys, 0)) - 1), ymax: Math.min(10, Math.ceil(Math.max(...ys, 0)) + 1),
      width: 300, height: 240, padLeft: 26, padBottom: 22, ticks: true }, extra || {});
    return renderGraphSVG([{ fn: (x) => a * (x - d) * (x - d) + e, color: "#2563eb", label: cfg.ohneName ? undefined : "f" }], cfg);
  }

  function gen_quad_1() {
    const [an, ad] = choice(A_WERTE), d = randInt(-5, 5), e = randInt(-6, 6), a = an / ad;
    const art = a > 0 ? "Tiefpunkt" : "Hochpunkt";
    return {
      topic: "quadratische_funktionen", level: 1, signed: true,
      prompt: scheitelTex(an, ad, d, e), promptText: `f(x) = a(x-${d})^2+${e}`,
      question: `\\text{Scheitelpunkt } S(\\;?\\,|\\,\\;?)\\text{ – Hoch- oder Tiefpunkt?}`,
      numFields: 3, fieldLabels: ["x-Koordinate von S", "y-Koordinate von S", "Art des Scheitelpunkts"],
      perFieldType: ["text", "text", "choice"], fieldChoices: [null, null, ["Hochpunkt", "Tiefpunkt"]],
      answer: [d, e, art], data: { an, ad, a, d, e }
    };
  }
  function check_quad_1(task, inp) {
    const err = [];
    [0, 1].forEach((i) => { const v = parseUserNumber(inp[i]); if (isNaN(v) || v !== task.answer[i]) err.push(i); });
    if (inp[2] !== task.answer[2]) err.push(2);
    return { correct: err.length === 0, fieldErrors: err };
  }
  function steps_quad_1(task) {
    const { a, d, e } = task.data;
    return [
      { label: "Scheitelpunktform f(x) = a(x − d)² + e  ⇒  S(d | e)" },
      { left: T(d >= 0 ? `In der Klammer steht x − ${d}, also d = ${d}.` : `In der Klammer steht x + ${-d} = x − (${d}), also d = ${d}.`), right: "" },
      { left: `S(${d}\\,|\\,${e})`, right: "" },
      { label: a > 0 ? "a > 0: nach oben geöffnet ⇒ Tiefpunkt" : "a < 0: nach unten geöffnet ⇒ Hochpunkt" }
    ];
  }

  // Polynom ax² + bx + c als Tex, a auch als Bruch (−¼x² + 6x − 11)
  function polyTex(an, ad, b, c) {
    const at = aTex(an, ad);
    const bt = b === 0 ? "" : b > 0 ? ` + ${b === 1 ? "" : fmtNum(b)}x` : ` - ${b === -1 ? "" : fmtNum(-b)}x`;
    return `${at}x^{2}${bt}${plusE(c)}`;
  }
  const A_ALLG = [[2, 1], [-2, 1], [3, 1], [-3, 1], [1, 2], [-1, 2], [1, 4], [-1, 4]];
  function gen_quad_2() {
    if (Math.random() < 0.45) { // a ≠ 1 (Vorbild aus Übungsaufgaben: y = −¼x² + 6x − 11)
      let an, ad, d, e, b, c;
      do { [an, ad] = choice(A_ALLG); d = randInt(-8, 12); e = randInt(-12, 25); b = (-2 * an * d) / ad; c = (an * d * d) / ad + e; }
      while (!Number.isInteger(b) || !Number.isInteger(c) || b === 0 || Math.abs(c) > 60);
      return { topic: "quadratische_funktionen", level: 2, subtype: "allgemein", signed: true,
        prompt: `f(x) = ${polyTex(an, ad, b, c)}`, promptText: "allgemein", question: `\\text{Bestimme den Scheitelpunkt (quadratische Ergänzung)}`,
        numFields: 2, fieldLabels: ["x-Koordinate von S", "y-Koordinate von S"], answer: [d, e], data: { an, ad, b, c, d, e } };
    }
    let p; do { p = 2 * randInt(-5, 5); } while (p === 0);
    const q = randInt(-10, 10), d = -p / 2, e = q - (p / 2) * (p / 2);
    return {
      topic: "quadratische_funktionen", level: 2, signed: true,
      prompt: `f(x) = ${normalTex(p, q)}`, promptText: `f(x) = x^2+${p}x+${q}`,
      question: `\\text{Bestimme den Scheitelpunkt (quadratische Ergänzung)}`,
      numFields: 2, fieldLabels: ["x-Koordinate von S", "y-Koordinate von S"], answer: [d, e], data: { p, q, d, e }
    };
  }
  function check_quad_2(task, inp) {
    const err = []; [0, 1].forEach((i) => { const v = parseUserNumber(inp[i]); if (isNaN(v) || v !== task.answer[i]) err.push(i); });
    return { correct: err.length === 0, fieldErrors: err };
  }
  function steps_quad_2(task) {
    if (task.subtype === "allgemein") {
      const { an, ad, b, c, d, e } = task.data, a = an / ad, h = b / a / 2;
      return [
        { label: "Zuerst a aus den x-Gliedern ausklammern" },
        { left: `f(x) = ${aTex(an, ad) || "1"}\\left(x^{2} ${b / a > 0 ? "+" : "-"} ${fmtNum(Math.abs(b / a))}x\\right)${plusE(c)}`, right: "" },
        { label: "In der Klammer quadratisch ergänzen: (p/2)² addieren und abziehen" },
        { left: `= ${aTex(an, ad) || "1"}\\left(${xMinusD(d)}^{2} - ${fmtNum(h * h)}\\right)${plusE(c)}`, right: "" },
        { label: "Klammer auflösen" },
        { left: `= ${aTex(an, ad)}${xMinusD(d)}^{2} ${-a * h * h >= 0 ? "+" : "-"} ${fmtNum(Math.abs(a * h * h))}${plusE(c)} = ${aTex(an, ad)}${xMinusD(d)}^{2}${plusE(e)}`, right: "" },
        { left: `S(${d}\\,|\\,${e})`, right: "" }
      ];
    }
    const { p, q, d, e } = task.data, h = p / 2;
    return [
      { label: "Quadratische Ergänzung: (p/2)² addieren und wieder abziehen" },
      { left: `x^{2} ${p > 0 ? "+" : "-"} ${Math.abs(p)}x + ${h * h} - ${h * h}${plusE(q)}`, right: "" },
      { left: `= ${xMinusD(d)}^{2}${plusE(e)}`, right: "" },
      { left: `S(${d}\\,|\\,${e})`, right: "" }
    ];
  }

  function gen_quad_3() {
    const sub = choice(["ganz", "ganz", "normieren", "wurzel"]);
    if (sub === "wurzel") { // Lösungen mit Wurzel, auf 2 Nachkommastellen
      let p, q, D; do { p = randInt(-8, 8); q = randInt(-12, 8); D = (p / 2) * (p / 2) - q; } while (D <= 0 || Number.isInteger(Math.sqrt(D)) || Number.isInteger(Math.sqrt(4 * D)));
      const r1 = round2(-p / 2 - Math.sqrt(D)), r2 = round2(-p / 2 + Math.sqrt(D));
      return { topic: "quadratische_funktionen", level: 3, subtype: sub, signed: true, prompt: `${normalTex(p, q)} = 0`, promptText: "wurzel",
        question: `\\text{Löse mit der p-q-Formel (2 Nachkommastellen)}`, numFields: 2, fieldLabels: ["x₁ (kleinere Lösung)", "x₂ (größere Lösung)"], answer: [r1, r2], tolerance: 0.011, data: { p, q, r1, r2, k: 1 } };
    }
    let r1, r2; do { r1 = randInt(-8, 8); r2 = randInt(-8, 8); } while (r1 >= r2);
    const p = -(r1 + r2), q = r1 * r2;
    if (sub === "normieren") { // erst durch a teilen (Vorbild: ½x² + 4x − 24 = 0)
      const [an, ad] = choice([[2, 1], [3, 1], [-1, 1], [-2, 1], [1, 2]]), a = an / ad;
      if (!Number.isInteger(a * p) || !Number.isInteger(a * q)) return gen_quad_3();
      return { topic: "quadratische_funktionen", level: 3, subtype: sub, signed: true, prompt: `${polyTex(an, ad, a * p, a * q)} = 0`, promptText: "normieren",
        question: `\\text{Löse die Gleichung.}`, numFields: 2, fieldLabels: ["x₁ (kleinere Lösung)", "x₂ (größere Lösung)"], answer: [r1, r2], data: { p, q, r1, r2, an, ad } };
    }
    return {
      topic: "quadratische_funktionen", level: 3, signed: true,
      prompt: `${normalTex(p, q)} = 0`, promptText: `x^2+${p}x+${q}=0`,
      question: `\\text{Löse mit der p-q-Formel}`,
      numFields: 2, fieldLabels: ["x₁ (kleinere Lösung)", "x₂ (größere Lösung)"], answer: [r1, r2], data: { p, q, r1, r2 }
    };
  }
  function check_quad_3(task, inp) {
    const tol = task.tolerance || 0, err = [];
    [0, 1].forEach((i) => { const v = parseUserNumber(inp[i]); if (isNaN(v) || Math.abs(v - task.answer[i]) > tol + 1e-9) err.push(i); });
    return { correct: err.length === 0, fieldErrors: err };
  }
  function steps_quad_3(task) {
    const { p, q, r1, r2 } = task.data, h = p / 2, D = h * h - q;
    const vorher = task.subtype === "normieren" ? [{ label: `Zuerst durch ${fmtNum(task.data.an / task.data.ad)} teilen, damit vor x² eine 1 steht` }, { left: `${normalTex(p, q)} = 0`, right: "" }] : [];
    return vorher.concat([
      { label: "p und q ablesen" }, { left: `p = ${p},\\; q = ${q}`, right: "" },
      { label: "In die p-q-Formel einsetzen" }, { left: `x_{1,2} = -\\dfrac{p}{2} \\pm \\sqrt{\\left(\\dfrac{p}{2}\\right)^{2} - q}`, right: "" },
      { left: `x_{1,2} = ${fmtNum(-h)} \\pm \\sqrt{${fmtNum(h * h)} - (${q})} = ${fmtNum(-h)} \\pm \\sqrt{${fmtNum(D)}}${Number.isInteger(Math.sqrt(D)) || Number.isInteger(Math.sqrt(4 * D)) ? ` = ${fmtNum(-h)} \\pm ${fmtNum(Math.sqrt(D))}` : ""}`, right: "" },
      { label: "Lösungen" }, { left: task.subtype === "wurzel" ? `x_{1} \\approx ${fmtNum(r1)},\\;\\; x_{2} \\approx ${fmtNum(r2)}` : `x_{1} = ${r1},\\;\\; x_{2} = ${r2}`, right: "" }
    ]);
  }

  function gen_quad_4() {
    let p; do { p = 2 * randInt(-5, 5); } while (p === 0);
    const fall = choice([0, 1, 2]), h2 = (p / 2) * (p / 2);
    const D = fall === 2 ? randInt(1, 12) : fall === 1 ? 0 : -randInt(1, 12);
    const q = h2 - D;
    return {
      topic: "quadratische_funktionen", level: 4, signed: true,
      prompt: `${normalTex(p, q)} = 0`, promptText: `x^2+${p}x+${q}=0`,
      question: `\\text{Wie viele Lösungen hat die Gleichung?}`,
      numFields: 2, fieldLabels: ["Diskriminante D = (p/2)² − q", "Anzahl der Lösungen"],
      perFieldType: ["text", "choice"], fieldChoices: [null, ["0", "1", "2"]],
      answer: [D, String(fall)], data: { p, q, D }
    };
  }
  function check_quad_4(task, inp) {
    const err = [], v = parseUserNumber(inp[0]);
    if (isNaN(v) || v !== task.answer[0]) err.push(0);
    if (inp[1] !== task.answer[1]) err.push(1);
    return { correct: err.length === 0, fieldErrors: err };
  }
  function steps_quad_4(task) {
    const { p, q, D } = task.data;
    return [
      { left: `D = \\left(\\dfrac{${p}}{2}\\right)^{2} - (${q}) = ${(p / 2) * (p / 2)} - (${q}) = ${D}`, right: "" },
      { label: "D > 0: zwei Lösungen · D = 0: eine Lösung · D < 0: keine Lösung" },
      { left: T(D > 0 ? "D > 0 ⇒ 2 Lösungen" : D === 0 ? "D = 0 ⇒ 1 Lösung" : "D < 0 ⇒ keine Lösung"), right: "" }
    ];
  }

  function gen_quad_5() {
    const [an, ad] = choice([[1, 1], [-1, 1], [2, 1], [-2, 1], [1, 2], [-1, 2]]), a = an / ad;
    const d = randInt(-3, 3), e = a > 0 ? randInt(-5, 1) : randInt(-1, 5);
    return {
      topic: "quadratische_funktionen", level: 5, signed: true,
      prompt: `\\text{Lies am Graphen ab und gib die Scheitelpunktform an.}`, promptText: "Parabel ablesen",
      graph: parabelSVG(a, d, e, { ohneName: true }),
      question: `f(x) = a\\,(x - d)^{2} + e`,
      numFields: 3, fieldLabels: ["d (x-Koordinate des Scheitels)", "e (y-Koordinate des Scheitels)", "Streckfaktor a"],
      answer: [d, e, { num: an, den: ad }], data: { an, ad, a, d, e }
    };
  }
  function check_quad_5(task, inp) {
    const err = [];
    [0, 1].forEach((i) => { const v = parseUserNumber(inp[i]); if (isNaN(v) || v !== task.answer[i]) err.push(i); });
    const f = parseUserFraction(inp[2]); if (!f || !fractionsEqual(f, task.answer[2])) err.push(2);
    return { correct: err.length === 0, fieldErrors: err };
  }
  function steps_quad_5(task) {
    const { a, d, e, an, ad } = task.data;
    return [
      { label: "Scheitelpunkt ablesen (höchster bzw. tiefster Punkt)" }, { left: `S(${d}\\,|\\,${e})`, right: "" },
      { label: "Vom Scheitel 1 nach rechts: Um so viel ändert sich y – das ist a." },
      { left: `f(${d + 1}) - f(${d}) = ${fmtNum(a)} \\;\\Rightarrow\\; a = ${an * ad < 0 ? "-" : ""}${Math.abs(ad) === 1 ? Math.abs(an) : `\\dfrac{${Math.abs(an)}}{${Math.abs(ad)}}`}`, right: "" },
      { left: scheitelTex(an, ad, d, e), right: "" }
    ];
  }

  function gen_quad_6() {
    const sub = choice(["wurf", "zaun", "bruecke", "preis"]);
    const n = choice(NAMEN);
    if (sub === "wurf") {
      const v = choice([10, 12, 15, 20]), h0 = choice([1, 1.5, 2]);
      const tS = v / 10, hMax = h0 + (v * v) / 20, tL = round2((v + Math.sqrt(v * v + 20 * h0)) / 10);
      return textTask("quadratische_funktionen", 6, "wurf",
        T(`${n} wirft einen Ball senkrecht nach oben. Seine Höhe (in m) nach t Sekunden ist ungefähr h(t) = −5t² + ${v}t + ${fmtNum(h0)}.`),
        T("Wann erreicht der Ball seine größte Höhe, wie hoch ist er dann, und wann landet er auf dem Boden?"), [
          { label: "Zeitpunkt der größten Höhe in s", kind: "number", answer: tS, tol: 0.001 },
          { label: "größte Höhe in m", kind: "number", answer: hMax, tol: 0.001 },
          { label: "Aufprall nach … s (2 Nachkommastellen)", kind: "number", answer: tL, tol: 0.011 }
        ], [
          { label: "Scheitelpunkt: t = −b : (2a)" }, { left: `t = -${v} : (2\\cdot (-5)) = ${fmtNum(tS)}`, right: "" },
          { left: `h(${fmtNum(tS)}) = -5\\cdot ${fmtNum(tS)}^{2} + ${v}\\cdot ${fmtNum(tS)} + ${fmtNum(h0)} = ${fmtNum(hMax)}`, right: "" },
          { label: "Aufprall: h(t) = 0, durch −5 teilen, dann p-q-Formel" },
          { left: `t^{2} - ${fmtNum(v / 5)}t - ${fmtNum(h0 / 5)} = 0 \\;\\Rightarrow\\; t = ${fmtNum(tS)} + \\sqrt{${fmtNum(round4(tS * tS + h0 / 5))}} \\approx ${fmtNum(tL)}`, right: "" },
          { label: "Die negative Lösung ergibt hier keinen Sinn (Zeit vor dem Wurf)." }
        ], { dataExtra: { v, h0 } });
    }
    if (sub === "zaun") {
      const L = choice([20, 24, 28, 32, 36, 40, 48, 60]), x = L / 4, A = (L * L) / 8;
      return textTask("quadratische_funktionen", 6, "zaun",
        T(`${n} baut für Kaninchen ein rechteckiges Gehege an einer Hauswand. Die Wand bildet eine Seite, für die anderen drei Seiten gibt es ${L} m Zaun. Die Fläche soll so groß wie möglich werden.`),
        T("Wie breit muss das Gehege (senkrecht zur Wand) sein, und wie groß ist die Fläche dann?"), [
          { label: "Breite x in m", kind: "number", answer: x, tol: 0.001 },
          { label: "größte Fläche in m²", kind: "number", answer: A, tol: 0.001 }
        ], [
          { label: "Zwei Seiten der Breite x, die Seite parallel zur Wand ist der Rest des Zauns" },
          { left: `A(x) = x\\cdot (${L} - 2x) = -2x^{2} + ${L}x`, right: "" },
          { label: "Scheitelpunkt: x = −b : (2a)" }, { left: `x = -${L} : (2\\cdot (-2)) = ${fmtNum(x)}`, right: "" },
          { left: `A = ${fmtNum(x)}\\cdot (${L} - ${fmtNum(2 * x)}) = ${fmtNum(A)}`, right: "" }
        ], { dataExtra: { L } });
    }
    if (sub === "bruecke") {
      const [w, H] = choice([[20, 5], [40, 10], [30, 9], [50, 10], [40, 8], [60, 12]]);
      const s = choice([w / 4, w / 5, w / 10]), an = -4 * H, ad = w * w, g = gcd(an, ad);
      const hs = round2(H - (4 * H * s * s) / (w * w));
      return textTask("quadratische_funktionen", 6, "bruecke",
        T(`Ein Brückenbogen hat die Form einer Parabel. Er ist am Boden ${w} m breit und in der Mitte ${H} m hoch. Lege die y-Achse durch die Mitte: y = a · x² + ${H}.`),
        T(`Bestimme a. Wie hoch ist der Bogen ${fmtNum(s)} m von der Mitte entfernt?`), [
          { label: "a (als Bruch)", kind: "fraction", answer: { num: an / g, den: ad / g }, signed: true },
          { label: "Höhe in m", kind: "number", answer: hs, tol: 0.011 }
        ], [
          { label: `Der Fußpunkt (${w / 2} | 0) liegt auf dem Bogen` },
          { left: `0 = a\\cdot ${w / 2}^{2} + ${H} \\;\\Rightarrow\\; a = -\\dfrac{${H}}{${(w / 2) * (w / 2)}}${g * 4 * H !== 4 * H || true ? ` = ${bruchTex(an, ad)}` : ""}`, right: "" },
          { left: `y(${fmtNum(s)}) = ${bruchTex(an, ad)}\\cdot ${fmtNum(s)}^{2} + ${H} = ${fmtNum(hs)}`, right: "" }
        ], { dataExtra: { w, H, s } });
    }
    const [N, k] = choice([[600, 20], [400, 10], [500, 20], [800, 20], [300, 10]]);
    const p = N / (2 * k), E = (N * N) / (4 * k);
    return textTask("quadratische_funktionen", 6, "preis",
      T(`Ein Schulkiosk verkauft Waffeln. Bei einem Preis von p Euro werden pro Woche ungefähr ${N} − ${k}p Waffeln verkauft.`),
      T("Bei welchem Preis sind die Einnahmen am größten, und wie hoch sind sie dann?"), [
        { label: "bester Preis in €", kind: "number", answer: p, tol: 0.001 },
        { label: "größte Einnahmen in €", kind: "number", answer: E, tol: 0.001 }
      ], [
        { label: "Einnahmen = Preis · verkaufte Menge" }, { left: `E(p) = p\\cdot (${N} - ${k}p) = -${k}p^{2} + ${N}p`, right: "" },
        { label: "Scheitelpunkt: p = −b : (2a)" }, { left: `p = -${N} : (2\\cdot (-${k})) = ${fmtNum(p)}`, right: "" },
        { left: `E = ${fmtNum(p)}\\cdot (${N} - ${k}\\cdot ${fmtNum(p)}) = ${fmtNum(E)}`, right: "" }
      ], { dataExtra: { N, k } });
  }


  // ---- Stufe 7: Parabelgleichung aufstellen ----
  function gen_quad_7() {
    if (Math.random() < 0.5) { // Normalparabel mit gegebenem Scheitel und Öffnung (Vorbild: „nach unten geöffnete Standardparabel mit Scheitel (5|2)“)
      const unten = Math.random() < 0.5, d = randInt(-6, 6), e = randInt(-8, 8);
      return { topic: "quadratische_funktionen", level: 7, subtype: "scheitel", signed: true,
        prompt: T(`Eine nach ${unten ? "unten" : "oben"} geöffnete Normalparabel hat den Scheitelpunkt S(${d} | ${e}).`), promptText: "scheitel",
        question: `\\text{Gib die Gleichung in Scheitelpunktform an:}\\;\\; f(x) = a\\,(x - d)^{2} + e`, numFields: 3, fieldLabels: ["a", "d", "e"], answer: [unten ? -1 : 1, d, e], data: { d, e, a: unten ? -1 : 1 } };
    }
    let d, e, x1, an, ad, y1;
    do { [an, ad] = choice([[1, 1], [-1, 1], [2, 1], [-2, 1], [1, 2], [-1, 2], [3, 1], [-3, 1]]); d = randInt(-4, 4); e = randInt(-6, 6); x1 = d + choice([-2, -1, 1, 2, 3]); y1 = (an * (x1 - d) * (x1 - d)) / ad + e; } while (!Number.isInteger(y1) || Math.abs(y1) > 30);
    return { topic: "quadratische_funktionen", level: 7, subtype: "punkt", signed: true,
      prompt: T(`Eine Parabel hat den Scheitelpunkt S(${d} | ${e}) und geht durch den Punkt P(${x1} | ${y1}).`), promptText: "punkt",
      question: `\\text{Bestimme den Streckfaktor a in}\\;\\; f(x) = a\\,${xMinusD(d)}^{2}${plusE(e)}`, numFields: 1, fieldLabels: ["a (auch als Bruch)"], answer: [(() => { const g = gcd(an, ad); return { num: an / g, den: ad / g }; })()], data: { d, e, x1, y1, an, ad } };
  }
  function check_quad_7(task, inp) {
    const err = [];
    task.answer.forEach((x, i) => { const f = parseUserFraction(inp[i]); if (!f || !fractionsEqual(f, typeof x === "object" ? x : { num: x, den: 1 })) err.push(i); });
    return { correct: err.length === 0, fieldErrors: err };
  }
  function steps_quad_7(task) {
    const d = task.data;
    if (task.subtype === "scheitel") return [{ label: "Normalparabel: a = 1 (nach oben) bzw. a = −1 (nach unten); Scheitel S(d | e) direkt einsetzen" }, { left: `f(x) = ${d.a === -1 ? "-" : ""}${xMinusD(d.d)}^{2}${plusE(d.e)}`, right: "" }];
    return [{ label: "Scheitel einsetzen, dann den Punkt P einsetzen und nach a auflösen" },
      { left: `${d.y1} = a\\cdot (${d.x1} - (${d.d}))^{2}${plusE(d.e)}`, right: "" },
      { left: `${d.y1 - d.e} = a\\cdot ${(d.x1 - d.d) ** 2} \\;\\Rightarrow\\; a = ${bruchTex(d.y1 - d.e, (d.x1 - d.d) ** 2)}`, right: "" }];
  }

  // ---- Stufe 8: Nullstellen mit der Mitternachtsformel (abc-Formel) ----
  // Regional üblich statt bzw. neben der p-q-Formel (v. a. Bayern, Baden-Württemberg).
  function gen_quad_8() {
    const sub = choice(["ganz", "ganz", "rational", "wurzel", "diskriminante"]);
    if (sub === "diskriminante") {
      let a, b, c, D; do { a = nz(-4, 5); b = randInt(-9, 9); c = randInt(-9, 9); D = b * b - 4 * a * c; } while (a === 1 && Math.random() < 0.7);
      return { topic: "quadratische_funktionen", level: 8, subtype: sub, signed: true, prompt: `${polyTex(a, 1, b, c)} = 0`, promptText: "Diskriminante",
        question: `\\text{Berechne die Diskriminante und gib die Anzahl der Lösungen an.}`, numFields: 2, fieldLabels: ["D = b² − 4ac", "Anzahl der Lösungen"],
        perFieldType: ["text", "choice"], fieldChoices: [null, ["0", "1", "2"]], answer: [D, D > 0 ? "2" : D === 0 ? "1" : "0"], data: { a, b, c, D } };
    }
    if (sub === "wurzel") {
      let a, b, c, D; do { a = nz(-4, 5); b = randInt(-9, 9); c = randInt(-9, 9); D = b * b - 4 * a * c; } while (a === 1 || D <= 0 || Number.isInteger(Math.sqrt(D)));
      const x = [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q);
      return { topic: "quadratische_funktionen", level: 8, subtype: sub, signed: true, prompt: `${polyTex(a, 1, b, c)} = 0`, promptText: "abc Wurzel",
        question: `\\text{Löse mit der Mitternachtsformel (2 Nachkommastellen).}`, numFields: 2, fieldLabels: ["x₁ (kleinere Lösung)", "x₂ (größere Lösung)"],
        answer: x.map((v) => round2(v)), tolerance: 0.011, data: { a, b, c, D } };
    }
    // Linearfaktoren (k1·x − m1)(k2·x − m2): ganzzahlige bzw. rationale Lösungen m1/k1, m2/k2
    let k1, m1, k2, m2;
    do {
      k1 = sub === "rational" ? choice([2, 3, 4]) : 1; k2 = choice([1, 1, 2, -1]); m1 = randInt(-9, 9); m2 = randInt(-9, 9);
      if (sub === "rational" && gcd(Math.abs(m1), k1) !== 1) continue;
    } while ((sub === "ganz" && k2 === 1) || m1 * k2 === m2 * k1 || (sub === "rational" && gcd(Math.abs(m1), k1) !== 1) || (sub === "ganz" && m2 % k2 !== 0) ||
             (sub === "rational" && gcd(gcd(Math.abs(k1 * k2), Math.abs(k1 * m2 + k2 * m1)), Math.abs(m1 * m2)) !== 1)); // rational: keine unnötig großen Koeffizienten
    const a = k1 * k2, b = -(k1 * m2 + k2 * m1), c = m1 * m2;
    const x = [m1 / k1, m2 / k2].sort((p, q) => p - q);
    return { topic: "quadratische_funktionen", level: 8, subtype: sub, signed: true, prompt: `${polyTex(a, 1, b, c)} = 0`, promptText: "abc",
      question: `\\text{Löse mit der Mitternachtsformel.}`, numFields: 2, fieldLabels: ["x₁ (kleinere Lösung)", "x₂ (größere Lösung)"],
      answer: x.map((v) => round4(v)), tolerance: sub === "rational" ? 0.0051 : 0, data: { a, b, c, D: b * b - 4 * a * c, x } };
  }
  function check_quad_8(task, inp) {
    if (task.subtype === "diskriminante") { const err = [], v = parseUserNumber(inp[0]); if (isNaN(v) || v !== task.answer[0]) err.push(0); if (inp[1] !== task.answer[1]) err.push(1); return { correct: !err.length, fieldErrors: err }; }
    const err = [];
    [0, 1].forEach((i) => { const f = parseUserFraction(inp[i]), v = f ? f.num / f.den : parseUserNumber(inp[i]); if (isNaN(v) || Math.abs(v - task.answer[i]) > (task.tolerance || 0) + 1e-9) err.push(i); });
    return { correct: !err.length, fieldErrors: err };
  }
  function steps_quad_8(task) {
    const { a, b, c, D } = task.data;
    const kopf = [{ label: "a, b und c ablesen" }, { left: `a = ${a},\\; b = ${b},\\; c = ${c}`, right: "" },
      { label: "Diskriminante berechnen" }, { left: `D = b^{2} - 4ac = (${b})^{2} - 4\\cdot (${a})\\cdot (${c}) = ${D}`, right: "" }];
    if (task.subtype === "diskriminante") return kopf.concat([{ label: "D > 0: zwei Lösungen · D = 0: eine Lösung · D < 0: keine Lösung" }, { left: T(`${D} ⇒ ${task.answer[1]} Lösung${task.answer[1] === "1" ? "" : "en"}`), right: "" }]);
    const w = Number.isInteger(Math.sqrt(D)) ? fmtNum(Math.sqrt(D)) : `\\sqrt{${D}}`;
    return kopf.concat([
      { label: "In die Mitternachtsformel einsetzen" }, { left: `x_{1,2} = \\dfrac{-b \\pm \\sqrt{D}}{2a} = \\dfrac{${-b} \\pm ${w}}{${2 * a}}`, right: "" },
      { left: task.subtype === "wurzel" ? `x_{1} \\approx ${fmtNum(task.answer[0])},\\;\\; x_{2} \\approx ${fmtNum(task.answer[1])}` : `x_{1} = ${task.subtype === "rational" ? bruchTexQ(task.data.x[0]) : fmtNum(task.answer[0])},\\;\\; x_{2} = ${task.subtype === "rational" ? bruchTexQ(task.data.x[1]) : fmtNum(task.answer[1])}`, right: "" },
      { label: "Kein Teilen durch a nötig – die Formel funktioniert direkt mit a, b und c." }
    ]);
  }
  function bruchTexQ(v) { for (let d = 1; d <= 12; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return d === 1 ? fmtNum(Math.round(v)) : bruchTex(Math.round(v * d), d); return fmtNum(round4(v)); }

  TOPICS.quadratische_funktionen = {
      name: "Quadratische Funktionen",
      grade: "Kl. 9",
      levels: [
        { id: 1, name: "Scheitelpunkt ablesen", grade: "Kl. 9", signed: true, generate: gen_quad_1, check: check_quad_1, steps: mitAusgang(steps_quad_1) },
        { id: 2, name: "Quadratische Ergänzung", grade: "Kl. 9", signed: true, generate: gen_quad_2, check: check_quad_2, steps: mitAusgang(steps_quad_2) },
        { id: 3, name: "Nullstellen mit der p-q-Formel", grade: "Kl. 9", signed: true, generate: gen_quad_3, check: check_quad_3, steps: mitAusgang(steps_quad_3) },
        { id: 8, name: "Nullstellen mit der Mitternachtsformel", grade: "Kl. 9", signed: true, generate: gen_quad_8, check: check_quad_8, steps: mitAusgang(steps_quad_8) },
        { id: 4, name: "Anzahl der Lösungen", grade: "Kl. 9", signed: true, generate: gen_quad_4, check: check_quad_4, steps: mitAusgang(steps_quad_4) },
        { id: 5, name: "Parabel am Graphen ablesen", grade: "Kl. 9", signed: true, generate: gen_quad_5, check: check_quad_5, steps: steps_quad_5 },
        { id: 6, name: "Textaufgaben", grade: "Kl. 9", calculatorHint: "Taschenrechner erlaubt", generate: gen_quad_6, check: check_textaufgabe, steps: steps_textaufgabe },
        { id: 7, name: "Parabelgleichung aufstellen", grade: "Kl. 9", signed: true, generate: gen_quad_7, check: check_quad_7, steps: steps_quad_7 }
      ]
  };
  // --- Erklärungen: Quadratische Funktionen ---
  Object.assign(ERKL, {
    "quadratische_funktionen/1": E("Scheitelpunktform",
      [`f(x) = a(x - d)^{2} + e \\;\\Rightarrow\\; S(d\\,|\\,e)`, T("Achtung Vorzeichen: Steht in der Klammer x + 3, ist d = −3."), T("a > 0: nach oben geöffnet (Tiefpunkt), a < 0: nach unten geöffnet (Hochpunkt).")],
      [{ left: `f(x) = 2(x + 3)^{2} - 1 \\;\\Rightarrow\\; S(-3\\,|\\,-1)\\text{, Tiefpunkt}`, right: "" }],
      [T("Das Vorzeichen von d übernehmen: (x + 3)² hat den Scheitel bei x = −3, nicht bei 3."), T("Hoch- und Tiefpunkt verwechseln: Entscheidend ist das Vorzeichen von a.")], "q1"),
    "quadratische_funktionen/2": E("Quadratische Ergänzung",
      [T("f(x) = x² + px + q: Man addiert (p/2)² und zieht es gleich wieder ab."), `x^{2} + px + q = \\left(x + \\dfrac{p}{2}\\right)^{2} + q - \\left(\\dfrac{p}{2}\\right)^{2}`, T("Daraus liest man S(−p/2 | q − (p/2)²) ab."), T("Bei f(x) = ax² + bx + c mit a ≠ 1: zuerst a aus den x-Gliedern ausklammern, dann in der Klammer ergänzen.")],
      [{ left: `x^{2} + 6x - 2 = x^{2} + 6x + 9 - 9 - 2 = (x + 3)^{2} - 11`, right: "" }, { left: `S(-3\\,|\\,-11)`, right: "" },
       { label: "Mit a ≠ 1: zuerst a aus den x-Gliedern ausklammern" },
       { left: `-\\dfrac{1}{4}x^{2} + 6x - 11 = -\\dfrac{1}{4}(x^{2} - 24x) - 11 = -\\dfrac{1}{4}\\left((x - 12)^{2} - 144\\right) - 11 = -\\dfrac{1}{4}(x - 12)^{2} + 25`, right: "" }, { left: `S(12\\,|\\,25)`, right: "" }],
      [T("(p/2)² addieren, aber nicht wieder abziehen."), T("Beim Ablesen das Vorzeichen der x-Koordinate falsch übernehmen.")], "q2"),
    "quadratische_funktionen/3": E("p-q-Formel",
      [T("Gleichung in Normalform bringen: x² + px + q = 0 (vor x² muss 1 stehen)."), `x_{1,2} = -\\dfrac{p}{2} \\pm \\sqrt{\\left(\\dfrac{p}{2}\\right)^{2} - q}`],
      [{ left: `x^{2} - 2x - 8 = 0:\\;\\; p = -2,\\; q = -8`, right: "" }, { left: `x = 1 \\pm \\sqrt{1 + 8} = 1 \\pm 3 \\;\\Rightarrow\\; x_{1} = -2,\\; x_{2} = 4`, right: "" },
       { label: "Steht vor x² keine 1: zuerst durch diese Zahl teilen" },
       { left: `2x^{2} - 4x - 6 = 0 \\;\\;|\\; : 2 \\;\\Rightarrow\\; x^{2} - 2x - 3 = 0 \\;\\Rightarrow\\; x = 1 \\pm \\sqrt{1 + 3} = 1 \\pm 2`, right: "" }],
      [T("Das Minus vor p/2 vergessen."), T("Vorzeichen von q übernehmen: Bei −8 wird unter der Wurzel + 8 gerechnet."), T("Vergessen, vorher durch die Zahl vor x² zu teilen.")], "q3"),
    "quadratische_funktionen/4": E("Anzahl der Lösungen",
      [`D = \\left(\\dfrac{p}{2}\\right)^{2} - q`, T("D > 0: zwei Lösungen · D = 0: eine Lösung · D < 0: keine Lösung (die Parabel berührt bzw. schneidet die x-Achse nicht).")],
      [{ left: `x^{2} + 4x + 7 = 0:\\;\\; D = 4 - 7 = -3 < 0 \\;\\Rightarrow\\; ${T("keine Lösung")}`, right: "" }],
      [T("D = (p/2)² + q rechnen – es wird q abgezogen.")]),
    "quadratische_funktionen/5": E("Parabel am Graphen ablesen",
      [T("Scheitelpunkt S(d | e) ist der tiefste bzw. höchste Punkt."), T("Streckfaktor a: Vom Scheitel 1 nach rechts gehen – um so viel geht der Graph nach oben (a > 0) oder unten (a < 0).")],
      [{ left: T("S(1 | −2); 1 nach rechts ⇒ 2 nach oben ⇒ a = 2 ⇒ f(x) = 2(x − 1)² − 2"), right: "" }],
      [T("2 nach rechts gehen und dann den y-Unterschied als a nehmen (dann ist er 4·a)."), T("Bei nach unten geöffneten Parabeln das Minus bei a vergessen.")], "q5"),
    "quadratische_funktionen/6": E("Quadratische Funktionen im Alltag",
      [T("„Am höchsten / am größten / am besten“: Gesucht ist der Scheitelpunkt."), `${T("Bei f(x) = ax² + bx + c: ")}x_{S} = -\\dfrac{b}{2a}`, T("„Wann trifft es auf den Boden?“: Nullstelle (h(t) = 0), nur die sinnvolle Lösung nehmen.")],
      [{ left: `A(x) = x\\cdot (20 - 2x) = -2x^{2} + 20x \\;\\Rightarrow\\; x_{S} = -\\dfrac{20}{2\\cdot (-2)} = 5`, right: "" }],
      [T("Bei der größten Fläche ein Quadrat annehmen – an einer Wand stimmt das nicht."), T("Die negative Lösung als Zeitpunkt angeben.")])
  });
  const erklGrafikAlt = erklGrafik;
  erklGrafik = function (art) {
    if (art === "parabel") return renderGraphSVG([{ fn: (x) => (x - 1) * (x - 1) - 4, color: "#2563eb", label: "f" }],
      { xmin: -3, xmax: 5, ymin: -5, ymax: 6, width: 300, height: 230, padLeft: 26, padBottom: 22, ticks: true,
        marks: [{ type: "point", x: 1, y: -4, label: "S(1|−4)", dx: 8, dy: 4 }, { type: "point", x: -1, y: 0, label: "x₁ = −1", color: "#16a34a", dx: -50, dy: -8 }, { type: "point", x: 3, y: 0, label: "x₂ = 3", color: "#16a34a", dx: 6, dy: -8 }] });
    return erklGrafikAlt(art);
  };

  // --- Fehlerdiagnose: Quadratische Funktionen ---
  H.scheitelVz = "Vorzeichen beachten: In a(x − d)² + e steht ein Minus – bei (x + 3)² ist d = −3.";
  H.ergaenzung = "Bei der quadratischen Ergänzung wird (p/2)² addiert UND wieder abgezogen.";
  H.pqMinus = "In der p-q-Formel steht −p/2: Das Vorzeichen von p wird umgedreht.";
  H.reihenfolge = "Beide Lösungen stimmen – aber die kleinere gehört nach x₁.";
  H.diskriminante = "D = (p/2)² − q: Es wird q abgezogen.";
  H.streckfaktor = "Den Streckfaktor misst man 1 Schritt neben dem Scheitel, nicht 2.";
  H.ergaenzungA = "Beim Auflösen der äußeren Klammer auch den abgezogenen Ergänzungsterm mit a multiplizieren.";
  H.hochTief = "Entscheidend ist das Vorzeichen von a: a > 0 Tiefpunkt, a < 0 Hochpunkt.";
  Object.assign(DIAG, {
    "quadratische_funktionen/1": (t, i, w, raw) => {
      if (i === 0 && t.data.d !== 0 && nah(w.v, -t.data.d)) return H.scheitelVz;
      if (i === 2) return H.hochTief;
      return null;
    },
    "quadratische_funktionen/2": (t, i, w) => {
      if (t.subtype === "allgemein") { const d = t.data, a = d.an / d.ad, h = d.b / a / 2;
        return i === 1 && a !== 1 && nah(w.v, d.c - h * h, 1e-6) ? H.ergaenzungA : (i === 0 && nah(w.v, -t.answer[0]) && t.answer[0] !== 0 ? H.scheitelVz : null); }
      const { p, q } = t.data;
      if (i === 0 && nah(w.v, p / 2)) return H.scheitelVz;
      if (i === 1 && nah(w.v, q + (p / 2) * (p / 2))) return H.ergaenzung;
      return null;
    },
    "quadratische_funktionen/3": (t, i, w, raw, inputs) => {
      const { r1, r2 } = t.data, a = parseUserNumber(inputs[0]), b = parseUserNumber(inputs[1]);
      if (a === r2 && b === r1) return H.reihenfolge;
      if (nah(w.v, -r1) || nah(w.v, -r2)) return H.pqMinus;
      return null;
    },
    "quadratische_funktionen/4": (t, i, w) => (i === 0 && nah(w.v, (t.data.p / 2) * (t.data.p / 2) + t.data.q) ? H.diskriminante : null),
    "quadratische_funktionen/5": (t, i, w) => {
      if (i === 0 && t.data.d !== 0 && nah(w.v, -t.data.d)) return H.scheitelVz;
      if (i === 2 && nah(w.v, 4 * t.data.a)) return H.streckfaktor;
      return null;
    }
  });

  // --- Klassenarbeit: Quadratische Funktionen ---
  KA_VORLAGEN.quadratische_funktionen = [
    { key: "scheitel", teil: "A", afb: 1, titel: "Parabel untersuchen und zeichnen", baue: () => {
      const a = choice([1, -1]), d = randInt(-3, 3), k = randInt(1, 3), e = -a * k * k; // Nullstellen d ± k
      const g = parabelSVG(a, d, e, { marks: [{ type: "point", x: d, y: e, label: `S(${d}|${e})`, dx: 8, dy: a > 0 ? 12 : -6 },
        { type: "point", x: d - k, y: 0, label: `${d - k}`, color: "#16a34a", dx: -14, dy: -8 }, { type: "point", x: d + k, y: 0, label: `${d + k}`, color: "#16a34a", dx: 6, dy: -8 }] });
      return { kontext: `${T("Gegeben ist")}\\;\\; ${scheitelTex(a, 1, d, e)}`, teile: [
        autoTeil(T("Gib den Scheitelpunkt an und entscheide, ob er ein Hoch- oder Tiefpunkt ist."), [
          { label: "x-Koordinate von S", kind: "number", answer: d, signed: true }, { label: "y-Koordinate von S", kind: "number", answer: e, signed: true },
          { label: "Art", kind: "choice", choices: ["Hochpunkt", "Tiefpunkt"], answer: a > 0 ? "Tiefpunkt" : "Hochpunkt" }],
          [{ left: `S(${d}\\,|\\,${e})\\text{, }${T(a > 0 ? "a > 0 ⇒ Tiefpunkt" : "a < 0 ⇒ Hochpunkt")}`, right: "" }]),
        autoTeil(T("Berechne die Nullstellen von f."), [
          { label: "x₁ (kleinere)", kind: "number", answer: d - k, signed: true, punkte: 1 }, { label: "x₂ (größere)", kind: "number", answer: d + k, signed: true, punkte: 1 }],
          [{ left: `${a === 1 ? "" : "-"}${xMinusD(d)}^{2}${plusE(e)} = 0 \\;\\Rightarrow\\; ${xMinusD(d)}^{2} = ${k * k}`, right: "" },
           { left: `x - (${d}) = \\pm ${k} \\;\\Rightarrow\\; x_{1} = ${d - k},\\; x_{2} = ${d + k}`, right: "" }]),
        papierTeil(T("✏️ Zeichne den Graphen von f. Markiere Scheitelpunkt und Nullstellen."), [
          { text: `Scheitelpunkt S(${d}|${e}) richtig eingezeichnet`, punkte: 1 }, { text: `nach ${a > 0 ? "oben" : "unten"} geöffnet, Form der Normalparabel`, punkte: 1 },
          { text: `Nullstellen bei ${d - k} und ${d + k} markiert`, punkte: 1 }], [{ label: "Vom Scheitel aus: 1 nach rechts, 1 nach oben/unten; 2 nach rechts, 4 nach oben/unten …" }], g)
      ] };
    } },
    { key: "pq", teil: "A", afb: 2, titel: "Quadratische Gleichungen lösen", baue: () => {
      const c = randInt(1, 9);
      return { kontext: "", teile: [Math.random() < 0.5 ? stufenTeil("quadratische_funktionen", 3) : stufenTeil("quadratische_funktionen", 8, (t) => t.subtype !== "diskriminante"), stufenTeil("quadratische_funktionen", 2), stufenTeil("quadratische_funktionen", 4),
        papierTeil(`${T("✏️ Begründe ohne Rechnung, warum")}\\;\\; x^{2} + ${c} = 0\\;\\; ${T("keine Lösung hat.")}`, [
          { text: "x² ist nie negativ", punkte: 1 }, { text: `deshalb ist x² + ${c} immer mindestens ${c}, also nie 0`, punkte: 1 }],
          [{ left: `x^{2} \\geq 0 \\;\\Rightarrow\\; x^{2} + ${c} \\geq ${c} > 0`, right: "" }])] };
    } },
    { key: "aussagen", teil: "A", afb: 3, titel: "Aussagen prüfen und Fehler finden", baue: () => {
      const pool = [
        () => aussageTeil(T("Lea behauptet: „Jede Parabel schneidet die x-Achse.“"), false, ["Eine nach oben geöffnete Parabel mit Scheitel oberhalb der x-Achse hat keine Nullstelle.", "Stimmt, Parabeln sind nach beiden Seiten unendlich lang.", "Stimmt nur, wenn a negativ ist."]),
        () => { const k = choice([2, 3]), d = k; return aussageTeil(`${T("Ole behauptet: „Die Parabeln")}\\;\\; y = ${polyTex(k, 1, -2 * k * d, k * d * d)}\\;\\; ${T("und")}\\;\\; y = ${polyTex(1, k, -2 * d / k, (d * d) / k)}\\;\\; ${T("haben denselben Scheitelpunkt.“")}`, true,
          [`Beide lassen sich als a(x − ${d})² schreiben – Scheitel S(${d} | 0); nur die Öffnung ist verschieden.`, "Stimmt nicht, weil die Zahlen vor x² verschieden sind.", "Stimmt nur, wenn beide nach oben geöffnet sind."]); },
        () => aussageTeil(T("Tim behauptet: „Ist a negativ, ist der Scheitelpunkt der höchste Punkt der Parabel.“"), true, ["Bei a < 0 ist die Parabel nach unten geöffnet.", "Weil negative Zahlen kleiner sind.", "Das hängt von e ab."]),
        () => { const d = randInt(2, 5); return aussageTeil(`${T("Ole behauptet: „")}f(x) = (x - ${d})^{2}${T(" hat den Scheitelpunkt S(−" + d + " | 0).“")}`, false, [`In (x − ${d})² ist d = ${d}, also S(${d} | 0).`, "Stimmt, das Vorzeichen dreht sich immer um.", "Stimmt, weil der Scheitel immer links liegt."]); },
        () => { let r1, r2; do { r1 = randInt(-6, -1); r2 = randInt(1, 6); } while (r1 + r2 === 0); const p = -(r1 + r2), q = r1 * r2;
          return fehlerTeil(`${T("Mia löst")}\\;\\; ${normalTex(p, q)} = 0:\\;\\; x = ${fmtNum(p / 2)} \\pm \\sqrt{${fmtNum((p / 2) * (p / 2))} - (${q})}`,
            ["Sie hat −p/2 vergessen: Das Vorzeichen von p muss umgedreht werden.", "Unter der Wurzel muss q addiert werden statt subtrahiert.", "Die Rechnung ist richtig."],
            { label: "richtige größere Lösung", kind: "number", answer: r2, signed: true },
            [{ left: `x = ${fmtNum(-p / 2)} \\pm \\sqrt{${fmtNum((p / 2) * (p / 2) - q)}} \\;\\Rightarrow\\; x_{1} = ${r1},\\; x_{2} = ${r2}`, right: "" }]); }
      ];
      return { kontext: "", teile: mische(pool).slice(0, 3).map((f) => f()) };
    } },
    { key: "aufstellen", teil: "A", afb: 2, titel: "Parabelgleichungen aufstellen", baue: () => ({ kontext: "", teile: [stufenTeil("quadratische_funktionen", 7, (t) => t.subtype === "scheitel"), stufenTeil("quadratische_funktionen", 7, (t) => t.subtype === "punkt"), stufenTeil("quadratische_funktionen", 2, (t) => t.subtype === "allgemein")] }) },
    { key: "graph", teil: "A", afb: 2, titel: "Parabel aus dem Graphen bestimmen", baue: () => {
      const t = stufenTeil("quadratische_funktionen", 5);
      return { kontext: "", graph: t.task.graph, teile: [t] };
    } },
    { key: "wurf", teil: "B", afb: 2, titel: "Ballwurf", baue: () => {
      const t = stufenTeil("quadratische_funktionen", 6, (x) => x.subtype === "wurf"), { v, h0 } = t.task.dataExtra;
      const tS = v / 10, hMax = h0 + (v * v) / 20, tL = (v + Math.sqrt(v * v + 20 * h0)) / 10;
      const g = renderGraphSVG([{ fn: (x) => (x >= 0 && x <= tL ? -5 * x * x + v * x + h0 : NaN), color: "#2563eb", label: "h" }], { xmin: 0, xmax: Math.ceil(tL) + 0.5, ymin: 0, ymax: Math.ceil(hMax / 5) * 5 + 2,
        width: 300, height: 230, padLeft: 30, padBottom: 22, ticks: true, gridStepX: 0.5, gridStepY: 2, achsenNamen: ["t in s", "h in m"],
        marks: [{ type: "point", x: tS, y: hMax, label: `(${fmtNum(tS)}|${fmtNum(hMax)})` }, { type: "point", x: tL, y: 0, label: `≈ ${fmtNum(round2(tL))} s`, color: "#16a34a", dx: -50, dy: -8 }] });
      return { kontext: "", teile: [t, papierTeil(T("✏️ Skizziere den Graphen von h vom Abwurf bis zum Aufprall. Markiere den höchsten Punkt."), [
        { text: `Start bei h(0) = ${fmtNum(h0)} m`, punkte: 1 }, { text: `höchster Punkt bei (${fmtNum(tS)} | ${fmtNum(hMax)})`, punkte: 1 }, { text: `Aufprall bei etwa ${fmtNum(round2(tL))} s`, punkte: 1 }],
        [{ label: "Musterlösung" }], g)] };
    } },
    { key: "zaun", teil: "B", afb: 3, titel: "Gehege mit größter Fläche", baue: () => {
      const t = stufenTeil("quadratische_funktionen", 6, (x) => x.subtype === "zaun"), L = t.task.dataExtra.L;
      return { kontext: "", teile: [
        papierTeil(T(`✏️ Erkläre, warum für die Fläche A(x) = x · (${L} − 2x) gilt (x = Breite senkrecht zur Wand).`), [
          { text: "Zwei Seiten sind x lang (senkrecht zur Wand)", punkte: 1 }, { text: `für die Seite parallel zur Wand bleiben ${L} − 2x Meter`, punkte: 1 }],
          [{ left: T(`Länge parallel zur Wand = ${L} − 2x, Fläche = Breite · Länge`), right: "" }]), t,
        aussageTeil(T("Jonas behauptet: „Die größte Fläche bekommt man immer mit einem Quadrat.“"), false, ["An der Wand braucht man nur drei Zaunseiten – das beste Rechteck ist doppelt so lang wie breit.", "Stimmt, Quadrate haben immer die größte Fläche.", "Stimmt nur bei einer geraden Zaunlänge."])] };
    } },
    { key: "preis", teil: "B", afb: 2, titel: "Bester Verkaufspreis", baue: () => {
      const t = stufenTeil("quadratische_funktionen", 6, (x) => x.subtype === "preis");
      return { kontext: "", teile: [t, papierTeil(T("✏️ Erkläre, warum die Einnahmen bei einem zu hohen Preis wieder sinken."), [
        { text: "Bei höherem Preis werden weniger Waffeln verkauft", punkte: 1 }, { text: "Ab einem Punkt sinkt Preis · Menge, weil die Menge stärker abnimmt", punkte: 1 }],
        [{ left: T("Einnahmen = Preis · Menge; sinkt die Menge stark, werden die Einnahmen kleiner."), right: "" }])] };
    } }
  ];
  KA_INFO.quadratische_funktionen = { klasse: "Kl. 9", tr: true };

  Object.assign(ERKL, {
    "quadratische_funktionen/7": E("Parabelgleichung aufstellen",
      [T("Scheitelpunktform: f(x) = a(x − d)² + e mit Scheitel S(d | e)."), T("Normalparabel: a = 1 (nach oben) bzw. a = −1 (nach unten)."), T("Ist zusätzlich ein Punkt P gegeben: S einsetzen, dann P einsetzen und nach a auflösen.")],
      [{ left: `S(2\\,|\\,-6),\\; P(3\\,|\\,-3):\\;\\; -3 = a\\cdot (3 - 2)^{2} - 6 \\;\\Rightarrow\\; a = 3`, right: "" }],
      [T("Vorzeichen von d falsch: S(2 | …) gibt (x − 2), nicht (x + 2)."), T("Beim Einsetzen von P die Klammer (x − d) vor dem Quadrieren vergessen.")], "q7")
  });
  Object.assign(ERKL, {
    "quadratische_funktionen/8": E("Mitternachtsformel (abc-Formel)",
      [T("Gleichung in die Form ax² + bx + c = 0 bringen (rechts muss 0 stehen)."), `x_{1,2} = \\dfrac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}`,
       T("Diskriminante D = b² − 4ac: D > 0 zwei Lösungen, D = 0 eine, D < 0 keine."), T("Anders als bei der p-q-Formel muss man nicht vorher durch a teilen.")],
      [{ left: `2x^{2} - 5x - 3 = 0:\\;\\; x = \\dfrac{5 \\pm \\sqrt{25 + 24}}{4} = \\dfrac{5 \\pm 7}{4} \\;\\Rightarrow\\; x_{1} = -\\dfrac{1}{2},\\; x_{2} = 3`, right: "" }],
      [T("Das Minus vor b vergessen (bei b = −5 wird −b zu +5)."), T("Nur durch a statt durch 2a teilen."), T("Bei negativem c das Vorzeichen in −4ac falsch: −4 · 2 · (−3) = +24.")], "q8")
  });
  H.abcMinusB = "In der Mitternachtsformel steht −b: Das Vorzeichen von b wird umgedreht.";
  H.abcZweiA = "Im Nenner steht 2a, nicht nur a.";
  H.abcDiskriminante = "Vorzeichen in D = b² − 4ac prüfen – bei negativem a oder c wird −4ac positiv.";
  Object.assign(DIAG, {
    "quadratische_funktionen/8": (t, i, w) => {
      const { a, b, c, D } = t.data;
      if (t.subtype === "diskriminante") return i === 0 ? naechsterHinweis(w.v, [[b * b + 4 * a * c, H.abcDiskriminante], [-b * b - 4 * a * c, H.abcDiskriminante]], 1e-9) : null;
      const kand = [];
      if (D >= 0) [-1, 1].forEach((sg) => { kand.push([(b + sg * Math.sqrt(D)) / (2 * a), H.abcMinusB]); kand.push([(-b + sg * Math.sqrt(D)) / a, H.abcZweiA]); });
      const D2 = b * b + 4 * a * c; if (D2 >= 0) [-1, 1].forEach((sg) => kand.push([(-b + sg * Math.sqrt(D2)) / (2 * a), H.abcDiskriminante]));
      return naechsterHinweis(w.v, kand.filter(([x]) => !t.answer.some((r) => Math.abs(r - x) < 1e-6)), 0.006);
    }
  });
  const erklGrafikQ = erklGrafik;
  erklGrafik = function (art) {
    const k = { width: 300, height: 240, padLeft: 28, padBottom: 22, ticks: true };
    const P = (a, d, e, fenster, marks, name) => renderGraphSVG([{ fn: (x) => a * (x - d) * (x - d) + e, color: "#2563eb", label: name || "f" }], Object.assign({ marks }, fenster, k));
    if (art === "q1") return P(2, -3, -1, { xmin: -7, xmax: 1, ymin: -2, ymax: 8 }, [{ type: "point", x: -3, y: -1, label: "S(−3|−1)", dx: 8, dy: 14 }]);
    if (art === "q2") return P(1, -3, -11, { xmin: -8, xmax: 2, ymin: -12, ymax: 6, gridStepY: 2 }, [{ type: "point", x: -3, y: -11, label: "S(−3|−11)", dx: 8, dy: 4 }], "x² + 6x − 2");
    if (art === "q3") return P(1, 1, -9, { xmin: -4, xmax: 6, ymin: -10, ymax: 8, gridStepY: 2 }, [{ type: "point", x: -2, y: 0, label: "x₁ = −2", color: "#16a34a", dx: -54, dy: -8 }, { type: "point", x: 4, y: 0, label: "x₂ = 4", color: "#16a34a", dx: 6, dy: -8 }], "x² − 2x − 8");
    if (art === "q8") return P(2, 1.25, -6.125, { xmin: -2, xmax: 4, ymin: -7, ymax: 8 }, [{ type: "point", x: -0.5, y: 0, label: "x₁ = −½", color: "#16a34a", dx: -50, dy: -8 }, { type: "point", x: 3, y: 0, label: "x₂ = 3", color: "#16a34a", dx: 6, dy: -8 }]);
    if (art === "q5") return P(2, 1, -2, { xmin: -2, xmax: 4, ymin: -3, ymax: 6 }, [{ type: "triangle", x: 1, y: -2, dx: 1, dy: 2, color: "#f59e0b" }, { type: "point", x: 1, y: -2, label: "S(1|−2)", dx: -58, dy: 14 }]);
    if (art === "q7") return P(3, 2, -6, { xmin: -1, xmax: 5, ymin: -7, ymax: 6 }, [{ type: "point", x: 2, y: -6, label: "S(2|−6)", dx: -58, dy: 4 }, { type: "point", x: 3, y: -3, label: "P(3|−3)", dx: 8, dy: 4 }]);
    return erklGrafikQ(art);
  };
