  // ============================================================
  // TERME & GLEICHUNGEN (Kl. 7–9)
  // ============================================================
  // Term ax + b als Text (ohne "1x", ohne "+ -")
  function linTerm(a, b, v) {
    v = v || "x";
    const xt = a === 0 ? "" : a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`;
    if (!xt) return `${b}`;
    return b === 0 ? xt : `${xt} ${b > 0 ? "+" : "-"} ${Math.abs(b)}`;
  }
  // Summe einzelner Glieder [{k, x:true|false}] als Text, erstes Glied ohne "+"
  function gliederTex(glieder, v) {
    v = v || "x";
    return glieder.map((g, i) => {
      const betrag = Math.abs(g.k), vz = g.k < 0 ? "-" : "+";
      const kern = g.x ? (betrag === 1 ? v : `${betrag}${v}`) : `${betrag}`;
      return i === 0 ? (g.k < 0 ? `-${kern}` : kern) : ` ${vz} ${kern}`;
    }).join("");
  }
  const nz = (lo, hi) => { let k; do { k = randInt(lo, hi); } while (k === 0); return k; };
  const kl = (a, b) => `(${linTerm(a, b)})`;
  const fak = (k) => (k === 1 ? "" : k === -1 ? "-" : `${k}`);

  // ---- Stufe 1: Terme zusammenfassen ----
  function gen_term_1() {
    const glieder = mische([{ k: nz(-9, 9), x: true }, { k: nz(-9, 9), x: true }, { k: nz(-12, 12), x: false }, { k: nz(-12, 12), x: false }]);
    if (glieder[0].k < 0 && Math.random() < 0.6) glieder[0].k = -glieder[0].k;
    const a = glieder.filter((g) => g.x).reduce((s, g) => s + g.k, 0), b = glieder.filter((g) => !g.x).reduce((s, g) => s + g.k, 0);
    return {
      topic: "terme_gleichungen", level: 1, prompt: gliederTex(glieder), promptText: gliederTex(glieder),
      question: `\\text{Fasse zusammen.}`, numFields: 2, fieldLabels: ["Zahl vor x", "Zahl ohne x"], eingabeForm: [0, "x +", 1],
      answer: [a, b], data: { glieder, a, b }
    };
  }
  function check_zahlen(task, inp) { const err = []; task.answer.forEach((x, i) => { const v = parseUserNumber(inp[i]); if (isNaN(v) || Math.abs(v - x) > 1e-9) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
  function steps_term_1(task) {
    const { glieder, a, b } = task.data, xs = glieder.filter((g) => g.x), zs = glieder.filter((g) => !g.x);
    return [
      { label: "Gleichartige Glieder sortieren (das Vorzeichen gehört zum Glied!)" },
      { left: `${gliederTex(xs)}${zs[0].k >= 0 ? " + " : " "}${gliederTex(zs).replace(/^-/, "- ")}`, right: "" },
      { left: `= ${linTerm(a, b)}`, right: "" }
    ];
  }

  // ---- Stufe 2: Klammern auflösen ----
  function gen_term_2() {
    if (Math.random() < 0.3) { // a − [x + b − (c + y) − d]  (Vorbild: echte Klassenarbeit)
      const a = randInt(2, 12), b = randInt(1, 9), c = randInt(1, 9), d = randInt(1, 9);
      return { topic: "terme_gleichungen", level: 2, subtype: "verschachtelt", signed: true, prompt: `${a} - [x + ${b} - (${c} + y) - ${d}]`, promptText: "verschachtelt",
        question: `\\text{Löse die Klammern auf.}`, numFields: 3, fieldLabels: ["Zahl vor x", "Zahl vor y", "Zahl ohne Variable"], eingabeForm: [0, "x +", 1, "y +", 2],
        answer: [-1, 1, a - b + c + d], data: { a, b, c, d } };
    }
    const p = nz(-6, 6), b = nz(-5, 5), c = nz(-9, 9), d = nz(-6, 6), e = nz(-5, 5), f = nz(-9, 9);
    const A = p * b + d * e, B = p * c + d * f;
    const t1 = `${fak(p)}${kl(b, c)}`, t2 = `${d < 0 ? " - " : " + "}${fak(Math.abs(d))}${kl(e, f)}`;
    return {
      topic: "terme_gleichungen", level: 2, signed: true, prompt: t1 + t2, promptText: t1 + t2,
      question: `\\text{Löse die Klammern auf und fasse zusammen.}`, numFields: 2, fieldLabels: ["Zahl vor x", "Zahl ohne x"], eingabeForm: [0, "x +", 1],
      answer: [A, B], data: { p, b, c, d, e, f, A, B }
    };
  }
  function steps_term_2(task) {
    if (task.subtype === "verschachtelt") { const { a, b, c, d } = task.data; return [
      { label: "Von innen nach außen: Minus vor der Klammer dreht alle Vorzeichen in der Klammer um" },
      { left: `${a} - [x + ${b} - ${c} - y - ${d}]`, right: "" }, { left: `= ${a} - x - ${b} + ${c} + y + ${d}`, right: "" }, { left: `= -x + y + ${a - b + c + d}`, right: "" }]; }
    const { p, b, c, d, e, f, A, B } = task.data;
    return [
      { label: "Jedes Glied in der Klammer mit dem Faktor davor multiplizieren – auch das Vorzeichen!" },
      { left: `${gliederTex([{ k: p * b, x: true }, { k: p * c, x: false }, { k: d * e, x: true }, { k: d * f, x: false }])}`, right: "" },
      { left: `= ${linTerm(A, B)}`, right: "" }
    ];
  }

  // ---- Stufe 3: Lineare Gleichungen ----
  function gen_term_3() {
    // Jede Runde legt ALLE Werte neu fest; erst wenn alles passt, wird übernommen
    // (früher: "continue" ließ d aus der Vorrunde stehen -> Lösung passte nicht zur Gleichung).
    let a, c, b, d, num, den;
    for (;;) {
      a = nz(-8, 9); c = nz(-8, 9); b = randInt(-15, 15);
      den = Math.random() < 0.3 ? choice([2, 3, 4]) : 1; num = randInt(-9, 9);
      d = ((a - c) * num) / den + b;
      if (a !== c && Number.isInteger(d) && (den === 1 || gcd(num, den) === 1)) break;
    }
    const g = gcd(num, den) || 1;
    return {
      topic: "terme_gleichungen", level: 3, signed: true, zeilen: true, prompt: `${linTerm(a, b)} = ${linTerm(c, d)}`, promptText: `${a}x+${b}=${c}x+${d}`,
      question: `\\text{Löse die Gleichung.}`, numFields: 1, fieldLabels: ["x (Bruch oder Zahl)"], answer: [{ num: num / g, den: den / g }], data: { a, b, c, d }
    };
  }
  function check_bruchfelder(task, inp) { const err = []; task.answer.forEach((x, i) => { const f = parseUserFraction(inp[i]); if (!f || !fractionsEqual(f, x)) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
  function steps_term_3(task) {
    const { a, b, c, d } = task.data;
    return [
      { label: `x-Glieder nach links: auf beiden Seiten ${c > 0 ? "−" : "+"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}x` }, { left: `${linTerm(a - c, b)} = ${d}`, right: "" },
      { label: `Zahlen nach rechts: auf beiden Seiten ${b > 0 ? "−" : "+"} ${Math.abs(b)}` }, { left: `${linTerm(a - c, 0)} = ${d - b}`, right: "" },
      { label: `Durch ${a - c} teilen` }, { left: `x = ${bruchTex(d - b, a - c)}`, right: "" },
      { label: "Probe: Lösung in beide Seiten einsetzen – es muss dasselbe herauskommen." }
    ];
  }

  // ---- Stufe 4: Gleichungen mit Klammern ----
  function gen_term_4() {
    let a, c, b, d, x0, e;
    do { a = nz(-6, 6); c = nz(-6, 6); b = nz(-6, 6); d = nz(-6, 6); x0 = randInt(-8, 8); e = a * (x0 + b) - c * (x0 + d); } while (a === c || Math.abs(e) > 30);
    const rechts = `${fak(c)}(x ${d > 0 ? "+" : "-"} ${Math.abs(d)})${e === 0 ? "" : e > 0 ? ` + ${e}` : ` - ${-e}`}`;
    return {
      topic: "terme_gleichungen", level: 4, signed: true, zeilen: true, prompt: `${fak(a)}(x ${b > 0 ? "+" : "-"} ${Math.abs(b)}) = ${rechts}`, promptText: "Klammergleichung",
      question: `\\text{Löse die Gleichung.}`, numFields: 1, fieldLabels: ["x"], answer: [x0], data: { a, b, c, d, e, x0 }
    };
  }
  function steps_term_4(task) {
    const { a, b, c, d, e, x0 } = task.data;
    return [
      { label: "Klammern auflösen" }, { left: `${linTerm(a, a * b)} = ${linTerm(c, c * d + e)}`, right: "" },
      { label: "x-Glieder links, Zahlen rechts sammeln" }, { left: `${linTerm(a - c, 0)} = ${c * d + e - a * b}`, right: "" },
      { left: `x = ${x0}`, right: "" }
    ];
  }

  // ---- Stufe 11: Große lineare Gleichungen – je Seite 4 Terme, binomische Formeln, x² fällt weg ----
  // Glied: { s: ±1, art, ... , p: [c0, c1, c2] }  (p = Polynom des Gliedes MIT Vorzeichen)
  const xGlied = (p, q) => linTerm(p, q);                           // px + q
  function polyTex(c0, c1, c2) {                                     // c2·x² + c1·x + c0
    const t = [];
    if (c2) t.push([c2, "x^{2}"]); if (c1) t.push([c1, "x"]); if (c0 || !t.length) t.push([c0, ""]);
    return t.map(([k, v], i) => { const b = Math.abs(k), z = v && b === 1 ? v : `${b}${v}`; return (i === 0 ? (k < 0 ? "-" : "") : k < 0 ? " - " : " + ") + z; }).join("");
  }
  function gliedTex(g) {
    if (g.art === "quadrat") return `(${xGlied(g.a, g.b)})^{2}`;
    if (g.art === "produkt") return `(${xGlied(g.a, g.b)})(${xGlied(g.c, g.d)})`;
    if (g.art === "klammer") return `${g.m === 1 ? "" : g.m}(${xGlied(1, g.b)})`;
    if (g.art === "x") return g.k === 1 ? "x" : `${g.k}x`;
    return `${g.k}`;
  }
  // jedes Glied samt Vorzeichen bleibt beim Umbrechen zusammen
  const seiteTex = (gl, f) => gl.map((g, i) => `\\mbox{${(i === 0 ? (g.s < 0 ? "-" : "") : g.s < 0 ? "- " : "+ ") + f(g)}}`).join(" ");
  function gliedPoly(g) {
    let p;
    if (g.art === "quadrat") p = [g.b * g.b, 2 * g.a * g.b, g.a * g.a];
    else if (g.art === "produkt") p = [g.b * g.d, g.a * g.d + g.b * g.c, g.a * g.c];
    else if (g.art === "klammer") p = [g.m * g.b, g.m, 0];
    else if (g.art === "x") p = [0, g.k, 0];
    else p = [g.k, 0, 0];
    return p.map((v) => v * g.s);
  }
  const summe = (gl) => gl.map(gliedPoly).reduce((s, p) => s.map((v, i) => v + p[i]), [0, 0, 0]);
  function quadGlied() {
    const a = Math.random() < 0.75 ? 1 : 2, s = Math.random() < 0.5 ? 1 : -1;
    if (Math.random() < 0.55) return { art: "quadrat", s, a, b: nz(-7, 7) };
    if (Math.random() < 0.5) { const b = randInt(1, 7); return { art: "produkt", s, a, b, c: a, d: -b }; } // 3. binomische Formel
    return { art: "produkt", s, a, b: nz(-6, 6), c: a, d: nz(-6, 6) };
  }
  function linGlied(art) {
    const s = Math.random() < 0.5 ? 1 : -1;
    if (art === "klammer") return { art, s, m: randInt(2, 6), b: nz(-7, 7) };
    if (art === "x") return { art, s, k: randInt(1, 9) };
    return { art: "zahl", s, k: randInt(1, 20) };
  }
  function gen_term_11() {
    for (;;) {
      const nL = randInt(1, 2), nR = randInt(1, 2);
      const L = Array.from({ length: nL }, quadGlied), R = Array.from({ length: nR }, quadGlied);
      const sL = summe(L), sR = summe(R);
      if (sL[2] !== sR[2] || sL[2] === 0) continue;                  // x² auf beiden Seiten, hebt sich gegenseitig auf
      if (L.concat(R).filter((g) => g.s > 0).length === 0) continue;
      // auf 4 Glieder je Seite auffüllen: genau eine Zahl ganz rechts im Pool, Rest Klammer/x
      const fuell = (n, zahl) => { const r = []; for (let i = 0; i < n; i++) r.push(linGlied(zahl && i === n - 1 ? "zahl" : choice(["klammer", "x", "klammer", "zahl"]))); return r; };
      const Lv = mische(L.concat(fuell(4 - nL, false))), Rv = mische(R.concat(fuell(4 - nR, true)));
      const zahlGl = Rv.filter((g) => g.art === "zahl").pop();
      // Lösung festlegen und die letzte Zahl rechts passend wählen
      const P = summe(Lv), Q0 = summe(Rv.filter((g) => g !== zahlGl)), A = P[1] - Q0[1];
      if (A === 0 || Math.abs(A) > 20) continue;
      const den = Math.random() < 0.25 ? choice([2, 3, 4]) : 1, num = randInt(-10, 10);
      if (den > 1 && (gcd(Math.abs(num), den) !== 1 || A % den !== 0)) continue;
      const k = A * num / den + P[0] - Q0[0];                       // P(x) = Q0(x) + k
      if (k === 0 || Math.abs(k) > 40) continue;
      zahlGl.s = k > 0 ? 1 : -1; zahlGl.k = Math.abs(k);
      if (Lv[0].s < 0 && Rv[0].s < 0) continue;
      // keine Glieder, die sich sofort wegheben oder auf beiden Seiten gleich sind; je Seite höchstens ein x- und ein Zahlglied
      const sch = (g) => JSON.stringify(Object.assign({}, g, { s: 0 })), alle = Lv.concat(Rv).map(sch);
      if (new Set(alle).size !== alle.length) continue;
      if ([Lv, Rv].some((v) => v.filter((g) => g.art === "x").length > 1 || v.filter((g) => g.art === "zahl").length > 1)) continue;
      const g = gcd(Math.abs(num), den) || 1;
      return { topic: "terme_gleichungen", level: 11, signed: true, zeilen: true, prompt: `${seiteTex(Lv, gliedTex)} = ${seiteTex(Rv, gliedTex)}`, promptText: "große Gleichung",
        question: `\\text{Löse die Gleichung.}`, numFields: 1, fieldLabels: ["x (Bruch oder Zahl)"], answer: [{ num: num / g, den: den / g }], data: { L: Lv, R: Rv } };
    }
  }
  // ausmultipliziertes Glied: mit Minus davor bei Quadraten/Produkten in Klammern (erst im nächsten Schritt aufgelöst)
  function gliedAus(g, klammer) {
    const p = gliedPoly(g);
    if (klammer && g.s < 0 && (g.art === "quadrat" || g.art === "produkt")) return { s: -1, t: `(${polyTex(-p[0], -p[1], -p[2])})` };
    return { s: 1, t: polyTex(p[0], p[1], p[2]), roh: true };
  }
  function seiteAus(gl, klammer) {
    return gl.map((g, i) => { const a = gliedAus(g, klammer); if (a.roh) return i === 0 ? a.t : a.t[0] === "-" ? " - " + a.t.slice(1) : " + " + a.t; return (i === 0 ? "-" : " - ") + a.t; }).join("");
  }
  function steps_term_11(task) {
    const { L, R } = task.data, P = summe(L), Q = summe(R), mk = L.concat(R).some((g) => g.s < 0 && (g.art === "quadrat" || g.art === "produkt"));
    const A = P[1] - Q[1], B = Q[0] - P[0], st = [];
    st.push({ label: "Binomische Formeln und Klammern auflösen (Minus vor einer Klammer erst stehen lassen)" }, { left: `${seiteAus(L, true)} = ${seiteAus(R, true)}`, right: "" });
    if (mk) st.push({ label: "Minusklammern auflösen: alle Vorzeichen in der Klammer umdrehen" }, { left: `${seiteAus(L, false)} = ${seiteAus(R, false)}`, right: "" });
    st.push({ label: "Jede Seite zusammenfassen" }, { left: `${polyTex(P[0], P[1], P[2])} = ${polyTex(Q[0], Q[1], Q[2])}`, right: "" });
    st.push({ label: `Auf beiden Seiten ${P[2] > 0 ? "−" : "+"} ${Math.abs(P[2]) === 1 ? "" : Math.abs(P[2])}x² rechnen – x² fällt weg` }, { left: `${polyTex(P[0], P[1], 0)} = ${polyTex(Q[0], Q[1], 0)}`, right: "" });
    st.push({ label: "x-Glieder nach links, Zahlen nach rechts" }, { left: `${polyTex(0, A, 0)} = ${B}`, right: "" });
    if (A !== 1) st.push({ label: `Durch ${A} teilen` }, { left: `x = ${bruchTex(B, A)}`, right: "" });
    st.push({ label: "Probe: Lösung in beide Seiten einsetzen – es muss dasselbe herauskommen." });
    return st;
  }

  // ---- Stufe 5: Binomische Formeln anwenden ----
  function gen_term_5() {
    const sub = choice(["plus", "minus", "dritte", "koeff", "zweiVar", "luecke"]), a = randInt(1, 9);
    if (sub === "zweiVar") { // (12 + 5m)²
      const c = randInt(2, 12), k = randInt(2, 6), v = choice(["m", "a", "b", "y"]), mi = Math.random() < 0.5;
      return { topic: "terme_gleichungen", level: 5, subtype: sub, signed: true, prompt: `(${c} ${mi ? "-" : "+"} ${k}${v})^{2}`, promptText: "binom2",
        question: `\\text{Multipliziere aus.}`, numFields: 3, fieldLabels: ["Zahl ohne " + v, "Zahl vor " + v, `Zahl vor ${v}²`], eingabeForm: [0, "+", 1, v + " +", 2, `${v}^{2}`],
        answer: [c * c, (mi ? -2 : 2) * c * k, k * k], data: { c, k, v, mi } };
    }
    if (sub === "luecke") { // (3,5x − ?y)² = 12,25x² − ?xy + 36y²
      const k = choice([2, 3, 4, 5, 1.5, 2.5, 3.5]), m = randInt(2, 9);
      return { topic: "terme_gleichungen", level: 5, subtype: sub, prompt: `(${fmtNum(k)}x - \\square\\,y)^{2} = ${fmtNum(k * k)}x^{2} - \\square\\,xy + ${m * m}y^{2}`, promptText: "Lücke",
        question: `\\text{Fülle die Lücken (▢) aus.}`, numFields: 2, fieldLabels: ["Zahl vor y in der Klammer", "Zahl vor xy"], answer: [m, 2 * k * m], data: { k, m } };
    }
    if (sub === "koeff") {
      const k = randInt(2, 5), m = nz(-7, 7);
      return { topic: "terme_gleichungen", level: 5, subtype: sub, signed: true, prompt: `(${k}x ${m > 0 ? "+" : "-"} ${Math.abs(m)})^{2}`, promptText: "binomisch",
        question: `\\text{Multipliziere aus.}`, numFields: 3, fieldLabels: ["Zahl vor x²", "Zahl vor x", "Zahl ohne x"], eingabeForm: [0, "x^{2} +", 1, "x +", 2],
        answer: [k * k, 2 * k * m, m * m], data: { k, m } };
    }
    const p = sub === "plus" ? 2 * a : sub === "minus" ? -2 * a : 0, q = sub === "dritte" ? -a * a : a * a;
    const pr = sub === "plus" ? `(x + ${a})^{2}` : sub === "minus" ? `(x - ${a})^{2}` : `(x + ${a})(x - ${a})`;
    return { topic: "terme_gleichungen", level: 5, subtype: sub, signed: true, prompt: pr, promptText: pr,
      question: `\\text{Multipliziere aus.}`, numFields: 2, fieldLabels: ["Zahl vor x", "Zahl ohne x"], eingabeForm: ["x^{2} +", 0, "x +", 1], answer: [p, q], data: { a } };
  }
  function steps_term_5(task) {
    const s = task.subtype;
    if (s === "zweiVar") { const { c, k, v, mi } = task.data; return [{ label: (mi ? "2." : "1.") + ` binomische Formel mit a = ${c} und b = ${k}${v}` },
      { left: `${c}^{2} ${mi ? "-" : "+"} 2\\cdot ${c}\\cdot ${k}${v} + (${k}${v})^{2} = ${c * c} ${mi ? "-" : "+"} ${2 * c * k}${v} + ${k * k}${v}^{2}`, right: "" }]; }
    if (s === "luecke") { const { k, m } = task.data; return [{ label: "Hinten steht b² – daraus b bestimmen, dann das Mischglied 2ab" },
      { left: `b^{2} = ${m * m}y^{2} \\;\\Rightarrow\\; b = ${m}y`, right: "" }, { left: `2ab = 2\\cdot ${fmtNum(k)}x\\cdot ${m}y = ${fmtNum(2 * k * m)}xy`, right: "" }]; }
    if (s === "koeff") { const { k, m } = task.data; return [
      { label: "1. binomische Formel mit a = " + k + "x und b = " + m }, { left: `(${k}x)^{2} + 2\\cdot ${k}x\\cdot (${m}) + (${m})^{2}`, right: "" },
      { left: `= ${k * k}x^{2} ${2 * k * m < 0 ? "-" : "+"} ${Math.abs(2 * k * m)}x + ${m * m}`, right: "" }]; }
    const a = task.data.a;
    if (s === "dritte") return [{ label: "3. binomische Formel: (a + b)(a − b) = a² − b²" }, { left: `x^{2} - ${a * a}`, right: "" }];
    return [{ label: s === "plus" ? "1. binomische Formel: (a + b)² = a² + 2ab + b²" : "2. binomische Formel: (a − b)² = a² − 2ab + b²" },
      { left: `x^{2} ${s === "plus" ? "+" : "-"} 2\\cdot ${a}\\cdot x + ${a}^{2} = x^{2} ${s === "plus" ? "+" : "-"} ${2 * a}x + ${a * a}`, right: "" }];
  }

  // ---- Stufe 6: Faktorisieren ----
  function gen_term_6() {
    const sub = choice(["ausklammern", "rueckwaerts", "dritte"]);
    if (sub === "ausklammern") {
      let a, b; do { a = nz(-9, 9); b = nz(-9, 9); } while (gcd(a, b) !== 1 || a < 0);
      const k = randInt(2, 9);
      return { topic: "terme_gleichungen", level: 6, subtype: sub, signed: true, prompt: linTerm(k * a, k * b), promptText: "ausklammern",
        question: `\\text{Klammere die größte gemeinsame Zahl aus.}`, numFields: 3, fieldLabels: ["Zahl vor der Klammer", "Zahl vor x in der Klammer", "Zahl ohne x in der Klammer"], eingabeForm: [0, "(", 1, "x +", 2, ")"],
        answer: [k, a, b], data: { k, a, b } };
    }
    const a = nz(-9, 9);
    if (sub === "rueckwaerts") return { topic: "terme_gleichungen", level: 6, subtype: sub, signed: true, prompt: `x^{2} ${a > 0 ? "+" : "-"} ${Math.abs(2 * a)}x + ${a * a}`, promptText: "rückwärts",
      question: `\\text{Schreibe als Quadrat:}\\;\\; (x ${a > 0 ? "+" : "-"} \\;?)^{2}`, numFields: 1, fieldLabels: ["Zahl in der Klammer"], fieldSigned: [false], answer: [Math.abs(a)], data: { a } };
    const b = Math.abs(a);
    return { topic: "terme_gleichungen", level: 6, subtype: sub, prompt: `x^{2} - ${b * b}`, promptText: "dritte rückwärts",
      question: `\\text{Faktorisiere:}\\;\\; (x + \\;?)(x - \\;?)`, numFields: 1, fieldLabels: ["Zahl in den Klammern"], answer: [b], data: { a: b } };
  }
  function steps_term_6(task) {
    const s = task.subtype, d = task.data;
    if (s === "ausklammern") return [{ label: `Größter gemeinsamer Teiler von ${d.k * d.a} und ${Math.abs(d.k * d.b)} ist ${d.k}` }, { left: `${linTerm(d.k * d.a, d.k * d.b)} = ${d.k}(${linTerm(d.a, d.b)})`, right: "" }];
    if (s === "rueckwaerts") return [{ label: "Erkennen: x² ± 2ax + a² ist eine binomische Formel" }, { left: `a^{2} = ${d.a * d.a} \\;\\Rightarrow\\; a = ${Math.abs(d.a)},\\; ${T("Vorzeichen vom Mittelglied")}`, right: "" }, { left: `= (${linTerm(1, d.a)})^{2}`, right: "" }];
    return [{ label: "3. binomische Formel rückwärts: a² − b² = (a + b)(a − b)" }, { left: `x^{2} - ${d.a * d.a} = (x + ${d.a})(x - ${d.a})`, right: "" }];
  }

  // ---- Stufe 7: Lineare Gleichungssysteme ----
  function gen_term_7() {
    let a1, b1, a2, b2, x0, y0;
    do { a1 = nz(-5, 5); b1 = nz(-5, 5); a2 = nz(-5, 5); b2 = nz(-5, 5); x0 = randInt(-6, 6); y0 = randInt(-6, 6); } while (a1 * b2 - a2 * b1 === 0);
    const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
    const gl = (a, b, c) => `${linTerm(a, 0)} ${b > 0 ? "+" : "-"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y = ${c}`;
    return {
      topic: "terme_gleichungen", level: 7, signed: true, prompt: `\\text{I:}\\;\\; ${gl(a1, b1, c1)}\\qquad \\text{II:}\\;\\; ${gl(a2, b2, c2)}`, promptText: "LGS",
      question: `\\text{Löse das Gleichungssystem.}`, numFields: 2, fieldLabels: ["x", "y"], answer: [x0, y0], data: { a1, b1, c1, a2, b2, c2, x0, y0 }
    };
  }
  function steps_term_7(task) {
    const { a1, b1, c1, a2, b2, c2, x0, y0 } = task.data;
    const D = a1 * b2 - a2 * b1;
    return [
      { label: `Additionsverfahren: I mal ${b2}, II mal ${b1}, dann subtrahieren – y fällt weg` },
      { left: `(${a1 * b2} - (${a2 * b1}))x = ${c1 * b2} - (${c2 * b1}) \\;\\Rightarrow\\; ${D}x = ${c1 * b2 - c2 * b1}`, right: "" },
      { left: `x = ${x0}`, right: "" },
      { label: "x in Gleichung I einsetzen" }, { left: `${a1}\\cdot (${x0}) + ${b1}y = ${c1} \\;\\Rightarrow\\; y = ${y0}`, right: "" },
      { label: "Probe in Gleichung II" }, { left: `${a2}\\cdot (${x0}) + ${b2}\\cdot (${y0}) = ${c2}\\;\\; ✓`, right: "" }
    ];
  }

  // ---- Stufe 8: Gleichungen aufstellen (Textaufgaben) ----
  function gen_term_8() {
    const sub = choice(["eintritt", "klassenfahrt", "rechteck", "sparen"]), n = choice(NAMEN);
    if (sub === "eintritt") {
      const pe = choice([8, 9, 10, 12, 14]), pk = choice([4, 5, 6, 7]), e = randInt(8, 40), k = randInt(10, 60), E = e * pe + k * pk;
      return textTask("terme_gleichungen", 8, sub,
        T(`Ins Freibad kamen heute ${e + k} Besucher. Erwachsene zahlen ${pe} €, Kinder ${pk} €. Die Kasse hat ${tausender(E)} € eingenommen.`),
        T("Wie viele Erwachsene und wie viele Kinder waren im Freibad?"), [
          { label: "Erwachsene", kind: "number", answer: e }, { label: "Kinder", kind: "number", answer: k }
        ], [
          { label: "e = Erwachsene, k = Kinder" }, { left: `\\text{I:}\\;\\; e + k = ${e + k}\\qquad \\text{II:}\\;\\; ${pe}e + ${pk}k = ${E}`, right: "" },
          { label: `Aus I: k = ${e + k} − e, in II einsetzen` }, { left: `${pe}e + ${pk}(${e + k} - e) = ${E} \\;\\Rightarrow\\; ${pe - pk}e = ${E - pk * (e + k)} \\;\\Rightarrow\\; e = ${e}`, right: "" },
          { left: `k = ${e + k} - ${e} = ${k}`, right: "" }
        ], { dataExtra: { pe, pk, N: e + k, E } });
    }
    if (sub === "klassenfahrt") {
      const fix = choice([300, 400, 450, 500, 600]), pp = choice([25, 30, 35, 40, 45]), s = randInt(18, 30), G = fix + pp * s;
      return textTask("terme_gleichungen", 8, sub,
        T(`Für die Klassenfahrt kostet der Bus pauschal ${fix} €, dazu kommen ${pp} € pro Person für Unterkunft und Eintritte. Insgesamt wurden ${tausender(G)} € bezahlt.`),
        T("Wie viele Personen sind mitgefahren?"), [{ label: "Anzahl Personen", kind: "number", answer: s }],
        [{ label: "x = Anzahl Personen" }, { left: `${fix} + ${pp}x = ${G}`, right: "" }, { left: `${pp}x = ${G - fix} \\;\\Rightarrow\\; x = ${s}`, right: "" }],
        { dataExtra: { fix, pp, G } });
    }
    if (sub === "rechteck") {
      const bb = randInt(3, 15), dlt = randInt(2, 9), U = 2 * (bb + bb + dlt);
      return textTask("terme_gleichungen", 8, sub,
        T(`${n} legt im Garten ein rechteckiges Beet an. Es soll ${dlt} m länger als breit sein. Für die Umrandung sind genau ${U} m Kantensteine vorhanden.`),
        T("Wie breit und wie lang wird das Beet?"), [{ label: "Breite in m", kind: "number", answer: bb }, { label: "Länge in m", kind: "number", answer: bb + dlt }],
        [{ label: `Breite x, Länge x + ${dlt}; Umfang = 2 · Breite + 2 · Länge` }, { left: `2x + 2(x + ${dlt}) = ${U}`, right: "" },
         { left: `4x + ${2 * dlt} = ${U} \\;\\Rightarrow\\; x = ${bb}`, right: "" }, { left: T(`Länge: ${bb} + ${dlt} = ${bb + dlt} m`), right: "" }],
        { dataExtra: { dlt, U } });
    }
    let s1, w1, s2, w2, t0;
    do { s1 = choice([40, 60, 80, 100, 120]); w1 = choice([10, 15, 20, 25]); w2 = choice([5, 8, 10]); t0 = randInt(4, 20); s2 = s1 + (w1 + w2) * t0; } while (s2 > 600);
    const [n1, n2] = zweiNamen();
    return textTask("terme_gleichungen", 8, sub,
      T(`${n1} hat ${s1} € gespart und legt jede Woche ${w1} € dazu. ${n2} hat ${s2} € und gibt jede Woche ${w2} € davon aus.`),
      T("Nach wie vielen Wochen haben beide gleich viel Geld, und wie viel ist das?"), [
        { label: "Anzahl Wochen", kind: "number", answer: t0 }, { label: "Betrag in €", kind: "number", answer: s1 + w1 * t0 }
      ], [
        { label: "x = Anzahl Wochen" }, { left: `${s1} + ${w1}x = ${s2} - ${w2}x`, right: "" },
        { left: `${w1 + w2}x = ${s2 - s1} \\;\\Rightarrow\\; x = ${t0}`, right: "" }, { left: `${s1} + ${w1}\\cdot ${t0} = ${s1 + w1 * t0}`, right: "" }
      ], { dataExtra: { s1, w1, s2, w2 } });
  }

  // ---- Stufe 9: Terme aufstellen (Texte in Terme, Wertetabelle, Alter) ----
  // Jede Formulierung trägt ihre Rechenschritte (ops) – der Test rechnet daraus unabhängig nach.
  function gen_term_9() {
    const sub = choice(["text", "text", "tabelle", "alter"]);
    if (sub === "text") {
      const k = randInt(2, 9), c = randInt(2, 12), q = choice([2, 3, 4, 5, 7]);
      const vorlagen = [
        [`Vermehre das ${k}-Fache einer Zahl um ${c}.`, k, c, [["mal", k], ["plus", c]]],
        [`Vermindere das ${k}-Fache einer Zahl um ${c}.`, k, -c, [["mal", k], ["plus", -c]]],
        [`Addiere ${c} zum ${k}-Fachen einer Zahl.`, k, c, [["mal", k], ["plus", c]]],
        [`Subtrahiere eine Zahl von ${c}.`, -1, c, [["mal", -1], ["plus", c]]],
        [`Das Produkt aus ${k} und einer Zahl, vergrößert um ${c}.`, k, c, [["mal", k], ["plus", c]]],
        [`Die Summe aus ${c} und dem ${q === 2 ? "halben" : ["", "", "", "dritten", "vierten", "fünften", "", "siebten"][q]} Teil einer Zahl.`, { num: 1, den: q }, c, [["durch", q], ["plus", c]]],
        [`${c} vergrößert um die Differenz aus ${k} und einer Zahl.`, -1, c + k, [["mal", -1], ["plus", k], ["plus", c]]],
        [`Halbiere eine Zahl und füge ${c} hinzu.`, { num: 1, den: 2 }, c, [["durch", 2], ["plus", c]]],
        [`Verteile einen Geldbetrag x gleichmäßig auf ${q} Personen.`, { num: 1, den: q }, 0, [["durch", q]]]
      ];
      const [satz, a, b, ops] = choice(vorlagen);
      const af = typeof a === "object" ? a : { num: a, den: 1 };
      return { topic: "terme_gleichungen", level: 9, subtype: "text", signed: true,
        prompt: T(`„${satz}“`), promptText: satz, question: `\\text{Schreibe als Term.}`, eingabeForm: [0, "\\cdot x +", 1],
        numFields: 2, fieldLabels: ["Zahl vor x (auch als Bruch)", "Zahl ohne x"], answer: [af, { num: b, den: 1 }], data: { satz, ops } };
    }
    if (sub === "tabelle") {
      const [A, B, C] = choice([[0, -3, 1], [1, 1, 0], [0, 2, -5], [2, -1, 0], [-1, 0, 4], [1, -4, 3], [0, -0.5, 2]]);
      const xs = mische([-2, -1, 0, 1, 2, 3, 4, 5]).slice(0, 3).sort((p, q) => p - q);
      const term = `${A === 0 ? "" : A === 1 ? "x^{2}" : A === -1 ? "-x^{2}" : `${A}x^{2}`}${B === 0 ? "" : `${A !== 0 && B > 0 ? " + " : B < 0 ? " - " : ""}${Math.abs(B) === 1 ? "" : fmtNum(Math.abs(B))}x`}${C === 0 ? "" : ` ${C > 0 ? "+" : "-"} ${Math.abs(C)}`}`.replace(/^ - /, "-");
      const werte = xs.map((x) => A * x * x + B * x + C);
      return { topic: "terme_gleichungen", level: 9, subtype: "tabelle", signed: true,
        prompt: `T(x) = ${term}`, promptText: term, question: `\\text{Fülle die Wertetabelle aus.}`,
        numFields: 3, fieldLabels: xs.map((x) => `T(${x})`), answer: werte.map((w) => { const z = Math.round(w * 2), g = gcd(z, 2) || 1; return { num: z / g, den: 2 / g }; }), data: { A, B, C, xs } };
    }
    const p = randInt(8, 15), dm = randInt(2, 6), fm = randInt(3, 4), dv = randInt(2, 5), n = choice(NAMEN);
    const ops = [["Schwester", "plus", dm], ["Mutter", "mal", fm], ["Vater", "mutterPlus", dv]];
    return { topic: "terme_gleichungen", level: 9, subtype: "alter",
      prompt: T(`${n} ist x Jahre alt. Die Schwester ist ${dm} Jahre älter, die Mutter ist ${fm}-mal so alt wie ${n}, der Vater ist ${dv} Jahre älter als die Mutter.`), promptText: "Alter",
      question: `\\text{Stelle die Terme auf und berechne damit das Alter aller, wenn ${n} ${p} Jahre alt ist.}`, numFields: 3, fieldLabels: ["Schwester (Jahre)", "Mutter (Jahre)", "Vater (Jahre)"],
      answer: [{ num: p + dm, den: 1 }, { num: fm * p, den: 1 }, { num: fm * p + dv, den: 1 }], data: { p, dm, fm, dv, ops } };
  }
  function steps_term_9(task) {
    const s = task.subtype, d = task.data;
    if (s === "text") { const [a, b] = task.answer; return [{ label: "Satz Stück für Stück übersetzen: „das k-Fache“ = k · x, „vermindere um“ = −, „der fünfte Teil“ = x : 5" },
      { left: `${a.den === 1 ? (a.num === -1 ? "-" : a.num === 1 ? "" : a.num) : `\\dfrac{${a.num}}{${a.den}}`}x${b.num === 0 ? "" : b.num > 0 ? ` + ${b.num}` : ` - ${-b.num}`}`, right: "" }]; }
    if (s === "tabelle") return [{ label: "Für x die Zahl einsetzen – negative Zahlen in Klammern!" }].concat(d.xs.map((x, i) => ({ left: `T(${x}) = ${fmtNum(task.answer[i].num / task.answer[i].den)}`, right: "" })));
    return [{ label: "Terme aufstellen" }, { left: T(`Schwester: x + ${d.dm}, Mutter: ${d.fm}x, Vater: ${d.fm}x + ${d.dv}`), right: "" },
      { label: `x = ${d.p} einsetzen` }, { left: T(`${d.p + d.dm}, ${d.fm * d.p} und ${d.fm * d.p + d.dv} Jahre`), right: "" }];
  }

  // ---- Stufe 10: Formeln umstellen ----
  const FORMELN = [
    { f: "W = U\\cdot I\\cdot t", nach: "t", rich: "t = \\dfrac{W}{U\\cdot I}", falsch: ["t = W\\cdot U\\cdot I", "t = \\dfrac{U\\cdot I}{W}"], werte: () => { const U = choice([12, 24, 230]), I = choice([2, 4, 5]), t = choice([2, 3, 5, 10]); return { geg: `W = ${U * I * t},\\; U = ${U},\\; I = ${I}`, erg: t }; } },
    { f: "U = 2(a + b)", nach: "b", rich: "b = \\dfrac{U}{2} - a", falsch: ["b = U - 2a", "b = \\dfrac{U - a}{2}"], werte: () => { const a = randInt(3, 15), b = randInt(2, 15); return { geg: `U = ${2 * (a + b)},\\; a = ${a}`, erg: b }; } },
    { f: "A = \\dfrac{(a + c)\\cdot h}{2}", nach: "h", rich: "h = \\dfrac{2A}{a + c}", falsch: ["h = \\dfrac{A}{2(a + c)}", "h = 2A - (a + c)"], werte: () => { const a = randInt(4, 12), c = randInt(2, 8), h = randInt(2, 10); return { geg: `A = ${((a + c) * h) / 2},\\; a = ${a},\\; c = ${c}`, erg: h }; } },
    { f: "v = \\dfrac{s}{t}", nach: "t", rich: "t = \\dfrac{s}{v}", falsch: ["t = s\\cdot v", "t = \\dfrac{v}{s}"], werte: () => { const v = choice([5, 10, 15, 20, 50, 80]), t = randInt(2, 6); return { geg: `s = ${v * t},\\; v = ${v}`, erg: t }; } },
    { f: "V = \\dfrac{1}{3}\\cdot G\\cdot h", nach: "h", rich: "h = \\dfrac{3V}{G}", falsch: ["h = \\dfrac{V}{3G}", "h = 3V - G"], werte: () => { const G = choice([6, 9, 12, 15, 20]), h = randInt(2, 10); return { geg: `V = ${(G * h) / 3},\\; G = ${G}`, erg: h }; } }
  ];
  function gen_term_10() {
    const F = choice(FORMELN), w = F.werte(), opts = mische([F.rich].concat(F.falsch));
    const txt = (x) => ML_texte(x);
    return { topic: "terme_gleichungen", level: 10, subtype: F.nach, prompt: F.f, promptText: F.f,
      question: `\\text{Stelle nach ${F.nach} um und berechne ${F.nach} für}\\;\\; ${w.geg}`, numFields: 2, fieldLabels: [`umgestellte Formel`, `${F.nach} =`],
      perFieldType: ["choice", "text"], fieldChoices: [opts.map(formelText), null], answer: [formelText(F.rich), w.erg], data: { F: F.f, rich: F.rich, falsch: F.falsch, geg: w.geg, nach: F.nach } };
  }
  // Auswahlknöpfe zeigen Text, keine Formeln -> lesbare Fassung erzeugen
  function formelText(tex) {
    return tex.replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, (m, z, n) => `${/[+\-\s]/.test(z) ? "(" + z + ")" : z} / ${/[+\-·\s]/.test(n) || n.length > 1 ? "(" + n + ")" : n}`).replace(/\\cdot/g, "·").replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();
  }
  function ML_texte(x) { return x; }
  function check_term_10(task, inp) { const err = []; if (inp[0] !== task.answer[0]) err.push(0); const v = parseUserNumber(inp[1]); if (isNaN(v) || Math.abs(v - task.answer[1]) > 1e-9) err.push(1); return { correct: !err.length, fieldErrors: err }; }
  function steps_term_10(task) {
    const d = task.data;
    return [{ label: `Schritt für Schritt nach ${d.nach} auflösen: Was mit ${d.nach} verrechnet ist, auf beiden Seiten umkehren` }, { left: `${d.F} \\;\\Rightarrow\\; ${d.rich}`, right: "" },
      { label: "Werte einsetzen" }, { left: `${d.geg} \\;\\Rightarrow\\; ${d.nach} = ${fmtNum(task.answer[1])}`, right: "" }];
  }

  TOPICS.terme_gleichungen = {
    name: "Terme & Gleichungen",
    grade: "Kl. 7–9",
    levels: [
      { id: 1, name: "Terme zusammenfassen", grade: "Kl. 7", signed: true, generate: gen_term_1, check: check_zahlen, steps: mitAusgang(steps_term_1) },
      { id: 2, name: "Klammern auflösen", grade: "Kl. 7–8", signed: true, generate: gen_term_2, check: check_zahlen, steps: mitAusgang(steps_term_2) },
      { id: 3, name: "Lineare Gleichungen lösen", grade: "Kl. 7–8", signed: true, generate: gen_term_3, check: check_bruchfelder, steps: mitAusgang(steps_term_3) },
      { id: 4, name: "Gleichungen mit Klammern", grade: "Kl. 8", signed: true, generate: gen_term_4, check: check_zahlen, steps: mitAusgang(steps_term_4) },
      { id: 5, name: "Binomische Formeln", grade: "Kl. 8", signed: true, generate: gen_term_5, check: check_zahlen, steps: steps_term_5 },
      { id: 11, name: "Große Gleichungen mit Binomen", grade: "Kl. 8–9", signed: true, generate: gen_term_11, check: check_bruchfelder, steps: mitAusgang(steps_term_11) },
      { id: 6, name: "Faktorisieren", grade: "Kl. 8–9", signed: true, generate: gen_term_6, check: check_zahlen, steps: steps_term_6 },
      { id: 7, name: "Lineare Gleichungssysteme", grade: "Kl. 8–9", signed: true, generate: gen_term_7, check: check_zahlen, steps: mitAusgang(steps_term_7) },
      { id: 8, name: "Gleichungen aufstellen", grade: "Kl. 7–9", generate: gen_term_8, check: check_textaufgabe, steps: steps_textaufgabe },
      { id: 9, name: "Terme aufstellen", grade: "Kl. 7–8", signed: true, generate: gen_term_9, check: check_bruchfelder, steps: steps_term_9 },
      { id: 10, name: "Formeln umstellen", grade: "Kl. 8–9", generate: gen_term_10, check: check_term_10, steps: steps_term_10 }
    ]
  };

  // --- Erklärungen ---
  Object.assign(ERKL, {
    "terme_gleichungen/1": E("Terme zusammenfassen",
      [T("Nur gleichartige Glieder zusammenfassen: x-Glieder mit x-Gliedern, Zahlen mit Zahlen."), T("Das Rechenzeichen VOR einem Glied gehört zu ihm: In 5 − 3x ist das Glied −3x.")],
      [{ left: `3x + 5 - 2x + 7 = (3 - 2)x + (5 + 7) = x + 12`, right: "" }],
      [T("Das Minus vor einem Glied verlieren (−2x wie +2x behandeln)."), T("x-Glieder und Zahlen zusammenzählen: 3x + 5 ist NICHT 8x.")]),
    "terme_gleichungen/2": E("Klammern auflösen",
      [`a(b + c) = ab + ac`, T("Der Faktor vor der Klammer wird mit JEDEM Glied in der Klammer multipliziert."), T("Minus vor der Klammer: Alle Vorzeichen in der Klammer drehen sich um.")],
      [{ left: `-3(2x - 4) = -6x + 12`, right: "" }],
      [T("Nur das erste Glied multiplizieren: −3(2x − 4) ist nicht −6x − 4."), T("Minus vor der Klammer nicht auf das zweite Glied anwenden: −(x − 4) = −x + 4.")]),
    "terme_gleichungen/3": E("Lineare Gleichungen lösen",
      [T("Auf beiden Seiten immer dasselbe tun (Äquivalenzumformung) – wie bei einer Waage."), T("1. x-Glieder auf eine Seite, Zahlen auf die andere. 2. Durch die Zahl vor x teilen."), T("Probe: Lösung einsetzen, beide Seiten müssen gleich sein.")],
      [{ left: `5x - 3 = 2x + 9 \\;\\Rightarrow\\; 3x - 3 = 9 \\;\\Rightarrow\\; 3x = 12 \\;\\Rightarrow\\; x = 4`, right: "" }],
      [T("Beim „Rüberbringen“ das Vorzeichen nicht ändern – besser: auf beiden Seiten dasselbe abziehen."), T("Am Ende durch die falsche Zahl teilen (Zahl vor x und Zahl rechts vertauscht).")]),
    "terme_gleichungen/4": E("Gleichungen mit Klammern",
      [T("Zuerst alle Klammern auflösen, dann wie eine normale lineare Gleichung lösen.")],
      [{ left: `2(x + 3) = 5(x - 1) - 1 \\;\\Rightarrow\\; 2x + 6 = 5x - 6 \\;\\Rightarrow\\; 12 = 3x \\;\\Rightarrow\\; x = 4`, right: "" }],
      [T("Beim Auflösen der rechten Klammer die Zahl dahinter mit in die Klammer ziehen.")]),
    "terme_gleichungen/11": E("Große Gleichungen mit Binomen",
      [T("1. Binomische Formeln und Klammern auflösen. Steht ein Minus vor einem Binom, das Ergebnis erst in Klammern schreiben."), T("2. Minusklammern auflösen: alle Vorzeichen in der Klammer umdrehen."), T("3. Jede Seite zusammenfassen. Die x² heben sich weg – übrig bleibt eine lineare Gleichung."), T("4. Wie gewohnt lösen, dann Probe.")],
      [{ left: `(x + 3)^{2} + 2(x - 1) - x - 5 = (x - 2)(x + 2) + 3(x + 1) - x + 13`, right: "" },
       { left: `x^{2} + 6x + 9 + 2x - 2 - x - 5 = x^{2} - 4 + 3x + 3 - x + 13`, right: "" },
       { left: `x^{2} + 7x + 2 = x^{2} + 2x + 12 \\;\\Rightarrow\\; 7x + 2 = 2x + 12 \\;\\Rightarrow\\; 5x = 10 \\;\\Rightarrow\\; x = 2`, right: "" }],
      [T("Minus vor dem Binom: nur beim x² das Vorzeichen gedreht, bei den anderen Gliedern nicht."), T("Mischglied vergessen: (x + 3)² ist NICHT x² + 9."), T("Bleibt x² stehen, ist beim Auflösen ein Fehler passiert.")]),
    "terme_gleichungen/5": E("Binomische Formeln",
      [`(a + b)^{2} = a^{2} + 2ab + b^{2}`, `(a - b)^{2} = a^{2} - 2ab + b^{2}`, `(a + b)(a - b) = a^{2} - b^{2}`],
      [{ left: `(x + 3)^{2} = x^{2} + 6x + 9`, right: "" }, { left: `(2x - 5)^{2} = 4x^{2} - 20x + 25`, right: "" }],
      [T("Das Mischglied 2ab vergessen: (x + 3)² ist NICHT x² + 9."), T("Nur ab statt 2ab schreiben."), T("Bei (2x)² nur das x quadrieren: (2x)² = 4x².")], "binom"),
    "terme_gleichungen/6": E("Faktorisieren",
      [T("Ausklammern: größten gemeinsamen Teiler vor die Klammer schreiben, jedes Glied durch ihn teilen."), T("Binomische Formeln rückwärts: x² + 2ax + a² = (x + a)²,  x² − a² = (x + a)(x − a).")],
      [{ left: `12x - 18 = 6(2x - 3)`, right: "" }, { left: `x^{2} - 10x + 25 = (x - 5)^{2}`, right: "" }],
      [T("Nicht den größten gemeinsamen Teiler ausklammern (2(6x − 9) statt 6(2x − 3))."), T("Das Vorzeichen in der Klammer vom Mittelglied übernehmen vergessen.")]),
    "terme_gleichungen/7": E("Lineare Gleichungssysteme",
      [T("Gesucht sind x und y, die BEIDE Gleichungen erfüllen."), T("Additionsverfahren: Gleichungen so multiplizieren, dass beim Addieren/Subtrahieren eine Variable wegfällt."), T("Einsetzungsverfahren: eine Gleichung nach einer Variablen auflösen und in die andere einsetzen."), T("Grafisch: Lösung = Schnittpunkt der beiden Geraden.")],
      [{ left: `\\text{I: } x + y = 7,\\;\\; \\text{II: } x - y = 1 \\;\\Rightarrow\\; 2x = 8 \\;\\Rightarrow\\; x = 4,\\; y = 3`, right: "" }],
      [T("Nur x berechnen und y vergessen."), T("x und y vertauscht angeben – Probe in beiden Gleichungen machen!")], "lgs"),
    "terme_gleichungen/8": E("Gleichungen aufstellen",
      [T("1. Festlegen, wofür x (und y) steht – mit Einheit."), T("2. Jeden Satz des Textes in einen Term übersetzen („3 m länger“ ⇒ x + 3)."), T("3. Gleichung aufstellen, lösen und die Antwort im Satz formulieren.")],
      [{ left: T("Länge 3 m mehr als Breite, Umfang 26 m:  2x + 2(x + 3) = 26 ⇒ x = 5 ⇒ 5 m breit, 8 m lang"), right: "" }],
      [T("Nur eine Größe angeben, wenn zwei gefragt sind."), T("Beim Umfang die Seiten nur einmal statt doppelt zählen.")])
  });
  const erklGrafikTG = erklGrafik;
  erklGrafik = function (art) {
    if (art === "binom") {
      const a = 150, b = 70, o = 20, f = (x) => x.toFixed(0);
      const r = (x, y, w, h, c, t) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" stroke="#1e3a8a"/><text x="${f(x + w / 2)}" y="${f(y + h / 2 + 5)}" font-size="15" font-weight="bold" text-anchor="middle">${t}</text>`;
      return `<svg viewBox="0 0 280 270" width="280" height="270" xmlns="http://www.w3.org/2000/svg">` +
        r(o, o, a, a, "#bfdbfe", "x²") + r(o + a, o, b, a, "#fde68a", "3x") + r(o, o + a, a, b, "#fde68a", "3x") + r(o + a, o + a, b, b, "#bbf7d0", "9") +
        `<text x="${o + a / 2}" y="${o - 5}" font-size="13" text-anchor="middle">x</text><text x="${o + a + b / 2}" y="${o - 5}" font-size="13" text-anchor="middle">3</text>` +
        `<text x="${o + a + b + 8}" y="${o + a / 2}" font-size="13">x</text><text x="${o + a + b + 8}" y="${o + a + b / 2}" font-size="13">3</text>` +
        `<text x="20" y="262" font-size="12" fill="#475569">(x + 3)² = x² + 6x + 9 – zwei gelbe Rechtecke 3x!</text></svg>`;
    }
    if (art === "lgs") return renderGraphSVG([{ fn: (x) => 7 - x, color: "#2563eb", label: "I" }, { fn: (x) => x - 1, color: "#dc2626", label: "II" }],
      { xmin: -1, xmax: 8, ymin: -2, ymax: 8, width: 300, height: 230, padLeft: 26, padBottom: 22, ticks: true, marks: [{ type: "point", x: 4, y: 3, label: "Lösung (4|3)", color: "#111" }] });
    return erklGrafikTG(art);
  };

  // --- Fehlerdiagnose ---
  H.minusGlied = "Das Vorzeichen vor einem Glied gehört dazu – prüfe die Glieder mit Minus.";
  H.minusKlammer = "Minus vor der Klammer: Alle Vorzeichen in der Klammer drehen sich um.";
  H.jedesGlied = "Der Faktor vor der Klammer wird mit JEDEM Glied in der Klammer multipliziert.";
  H.seitenwechsel = "Vorzeichenfehler beim Umformen: Auf beiden Seiten dasselbe abziehen bzw. addieren.";
  H.mischglied = "Das Mischglied fehlt: (a + b)² = a² + 2ab + b².";
  H.zweiAB = "Das Mischglied heißt 2ab – nicht nur ab.";
  H.quadratPos = "Ein Quadrat ist nie negativ: (−b)² = +b².";
  H.koeffQuadrat = "Auch die Zahl vor x wird quadriert: (2x)² = 4x².";
  H.xy = "x und y vertauscht? Mach die Probe in beiden Gleichungen.";
  Object.assign(DIAG, {
    "terme_gleichungen/1": (t, i, w) => {
      const gl = t.data.glieder.filter((g) => (i === 0 ? g.x : !g.x));
      return nah(w.v, gl.reduce((s, g) => s + Math.abs(g.k), 0)) || gl.some((g, j) => nah(w.v, gl.reduce((s, h, k) => s + (k === j ? -h.k : h.k), 0))) ? H.minusGlied : null;
    },
    "terme_gleichungen/2": (t, i, w) => {
      const { p, b, c, d, e, f } = t.data;
      const ohneVz = i === 0 ? p * b + d * e : p * c + d * f;
      if (d < 0 && nah(w.v, i === 0 ? p * b + d * e : p * c - d * f)) return H.minusKlammer;
      if (nah(w.v, i === 0 ? p * b + d * e : c + f) && !nah(w.v, ohneVz)) return H.jedesGlied;
      return null;
    },
    "terme_gleichungen/3": (t, i, w) => {
      const { a, b, c, d } = t.data;
      return [(d + b) / (a - c), (d - b) / (a + c), (d + b) / (a + c)].some((x) => isFinite(x) && nah(w.v, x, 1e-4)) ? H.seitenwechsel : null; // auch gerundete Eingaben
    },
    "terme_gleichungen/11": (t, i, w) => {
      const { L, R } = t.data;
      const loes = (pf) => { const P = L.map(pf).reduce((a, p) => a.map((v, j) => v + p[j]), [0, 0, 0]), Q = R.map(pf).reduce((a, p) => a.map((v, j) => v + p[j]), [0, 0, 0]); return P[1] === Q[1] ? NaN : (Q[0] - P[0]) / (P[1] - Q[1]); };
      const bin = (g) => g.art === "quadrat" || g.art === "produkt";
      // Fehler 1: Minus vor dem Binom nur aufs erste Glied (x²) angewendet
      const ohneMinus = (g) => { const p = gliedPoly(g); return g.s < 0 && bin(g) ? [-p[0], -p[1], p[2]] : p; };
      // Fehler 2: Mischglied vergessen bei (ax + b)²
      const ohneMisch = (g) => { const p = gliedPoly(g); return g.art === "quadrat" ? [p[0], 0, p[2]] : p; };
      if (L.concat(R).some((g) => g.s < 0 && bin(g)) && nah(w.v, loes(ohneMinus), 1e-4)) return H.minusKlammer;
      if (L.concat(R).some((g) => g.art === "quadrat") && nah(w.v, loes(ohneMisch), 1e-4)) return H.mischglied;
      return null;
    },
    "terme_gleichungen/5": (t, i, w) => {
      const s = t.subtype, d = t.data;
      if (s === "koeff") {
        if (i === 0 && nah(w.v, d.k)) return H.koeffQuadrat;
        if (i === 1 && (nah(w.v, 0) || nah(w.v, d.k * d.m))) return nah(w.v, 0) ? H.mischglied : H.zweiAB;
        if (i === 2 && nah(w.v, -d.m * d.m)) return H.quadratPos;
        return null;
      }
      if (s !== "dritte" && i === 0 && nah(w.v, 0)) return H.mischglied;
      if (s !== "dritte" && i === 0 && nah(w.v, s === "plus" ? d.a : -d.a)) return H.zweiAB;
      if (s === "minus" && i === 1 && nah(w.v, -d.a * d.a)) return H.quadratPos;
      return null;
    },
    "terme_gleichungen/7": (t, i, w, raw, inputs) => {
      const { x0, y0 } = t.data, a = parseUserNumber(inputs[0]), b = parseUserNumber(inputs[1]);
      return x0 !== y0 && a === y0 && b === x0 ? H.xy : null;
    }
  });

  // --- Klassenarbeit ---
  KA_VORLAGEN.terme_gleichungen = [
    { key: "terme", teil: "A", afb: 1, titel: "Terme vereinfachen", baue: () => ({ kontext: T("Vereinfache so weit wie möglich."), teile: [stufenTeil("terme_gleichungen", 1), stufenTeil("terme_gleichungen", 2, (t) => t.subtype !== "verschachtelt"), stufenTeil("terme_gleichungen", 2, (t) => t.subtype === "verschachtelt")] }) },
    { key: "gleichungen", teil: "A", afb: 1, titel: "Gleichungen lösen", baue: () => ({ kontext: "", teile: [stufenTeil("terme_gleichungen", 3), stufenTeil("terme_gleichungen", 4), stufenTeil("terme_gleichungen", 11)] }) },
    { key: "binomisch", teil: "A", afb: 2, titel: "Binomische Formeln", baue: () => ({ kontext: "", teile: [stufenTeil("terme_gleichungen", 5, (t) => ["plus", "minus", "dritte"].includes(t.subtype)), stufenTeil("terme_gleichungen", 5, (t) => ["koeff", "zweiVar"].includes(t.subtype)), stufenTeil("terme_gleichungen", 5, (t) => t.subtype === "luecke"), stufenTeil("terme_gleichungen", 6)] }) },
    { key: "fehler", teil: "A", afb: 3, titel: "Fehler finden und Aussagen prüfen", baue: () => {
      const pool = [
        () => { const a = randInt(2, 9); return fehlerTeil(`${T("Lea rechnet:")}\\;\\; (x + ${a})^{2} = x^{2} + ${a * a}`, ["Das Mischglied 2 · " + a + " · x fehlt.", "Sie hätte " + a + " nicht quadrieren dürfen.", "Die Rechnung ist richtig."],
          { label: "richtige Zahl vor x", kind: "number", answer: 2 * a }, [{ left: `(x + ${a})^{2} = x^{2} + ${2 * a}x + ${a * a}`, right: "" }]); },
        () => { const k = randInt(2, 6), m = randInt(2, 9); return fehlerTeil(`${T("Tim rechnet:")}\\;\\; -${k}(x - ${m}) = -${k}x - ${k * m}`, ["Minus mal Minus ergibt Plus: Es muss + " + k * m + " heißen.", "Er hätte nur x multiplizieren dürfen.", "Die Rechnung ist richtig."],
          { label: "richtige Zahl ohne x", kind: "number", answer: k * m, signed: true }, [{ left: `-${k}(x - ${m}) = -${k}x + ${k * m}`, right: "" }]); },
        () => { let a, b, c; do { a = randInt(3, 7); c = randInt(1, a - 1); b = randInt(1, 9); } while (false); const d = -randInt(2, 9); const x = (d - b) / (a - c);
          return fehlerTeil(`${T("Ben löst")}\\;\\; ${linTerm(a, b)} = ${linTerm(c, d)}:\\;\\; ${linTerm(a - c, 0)} = ${d} + ${b} = ${d + b}`, ["Beim Abziehen von " + b + " auf beiden Seiten hätte er rechnen müssen: " + d + " − " + b + ".", "Er hätte die x-Glieder addieren müssen.", "Die Rechnung ist richtig."],
            { label: "richtige Lösung x", kind: "fraction", answer: (() => { const g = gcd(d - b, a - c); let nn = (d - b) / g, dd = (a - c) / g; if (dd < 0) { nn = -nn; dd = -dd; } return { num: nn, den: dd }; })(), signed: true },
            [{ left: `${linTerm(a - c, 0)} = ${d} - ${b} = ${d - b} \\;\\Rightarrow\\; x = ${bruchTex(d - b, a - c)}`, right: "" }]); },
        () => aussageTeil(T("Ole behauptet: „Jede lineare Gleichung hat genau eine Lösung.“"), false, ["x + 1 = x + 2 hat keine Lösung, x + 1 = x + 1 unendlich viele.", "Stimmt, Geraden schneiden sich immer genau einmal.", "Stimmt, man kann immer nach x auflösen."]),
        () => aussageTeil(T("Mia behauptet: „Man darf bei einer Gleichung auf beiden Seiten durch x teilen.“"), false, ["x könnte 0 sein – durch 0 darf man nicht teilen, dabei gehen Lösungen verloren.", "Stimmt, man darf auf beiden Seiten alles tun.", "Stimmt, wenn x positiv ist, und das ist immer so."])
      ];
      return { kontext: "", teile: mische(pool).slice(0, 3).map((f) => f()) };
    } },
    { key: "uebersetzen", teil: "A", afb: 1, titel: "Texte in Terme übersetzen", baue: () => ({ kontext: "", teile: [
      stufenTeil("terme_gleichungen", 9, (t) => t.subtype === "text"), stufenTeil("terme_gleichungen", 9, (t) => t.subtype === "text"), stufenTeil("terme_gleichungen", 9, (t) => t.subtype === "tabelle")] }) },
    { key: "formeln", teil: "A", afb: 2, titel: "Formeln umstellen", baue: () => { const a = stufenTeil("terme_gleichungen", 10); let b; do { b = stufenTeil("terme_gleichungen", 10); } while (b.task.data.F === a.task.data.F); return { kontext: "", teile: [a, b] }; } },
    { key: "sach", teil: "A", afb: 2, titel: "Gleichungen aufstellen", baue: () => {
      const a = stufenTeil("terme_gleichungen", 8); let b; do { b = stufenTeil("terme_gleichungen", 8); } while (b.task.subtype === a.task.subtype);
      return { kontext: "", teile: [papierTeil(T("✏️ Lege für die folgende Aufgabe fest, wofür x steht, und stelle die Gleichung auf, bevor du rechnest."), [
        { text: "Variable mit Bedeutung und Einheit festgelegt", punkte: 1 }, { text: "Gleichung passt zum Text", punkte: 1 }], [{ label: "Siehe Musterlösung der nächsten Teilaufgabe." }]), a, b] };
    } }
  ];
  KA_INFO.terme_gleichungen = { klasse: "Kl. 8", tr: false };

  Object.assign(ERKL, {
    "terme_gleichungen/9": E("Terme aufstellen",
      [T("Wörter übersetzen: „das 3-Fache“ = 3x, „vermehre um“ = +, „vermindere um“ = −, „der fünfte Teil“ = x : 5, „halbiere“ = x : 2."), T("Reihenfolge beachten: „Subtrahiere eine Zahl von 8“ heißt 8 − x."), T("Wertetabelle: Zahl für x einsetzen, negative Zahlen in Klammern.")],
      [{ left: T("„Vermindere das Doppelte einer Zahl um 3“ ⇒ 2x − 3;   T(x) = 1 − 3x:  T(−2) = 1 − 3 · (−2) = 7"), right: "" }],
      [T("„Subtrahiere x von 8“ als x − 8 schreiben."), T("Beim Einsetzen negativer Zahlen die Klammer vergessen: −2² ≠ (−2)².")]),
    "terme_gleichungen/10": E("Formeln umstellen",
      [T("Wie bei Gleichungen: Was mit der gesuchten Größe verrechnet ist, wird auf beiden Seiten mit der Umkehrrechnung rückgängig gemacht."), T("Mal ↔ Geteilt, Plus ↔ Minus. Steht die gesuchte Größe im Nenner: erst mit ihr multiplizieren.")],
      [{ left: `W = U\\cdot I\\cdot t \\;\\;|\\; : (U\\cdot I) \\;\\Rightarrow\\; t = \\dfrac{W}{U\\cdot I}`, right: "" }, { left: `U = 2(a + b) \\;\\;|\\; : 2 \\;\\;|\\; - a \\;\\Rightarrow\\; b = \\dfrac{U}{2} - a`, right: "" }],
      [T("Nur durch einen Faktor teilen und den anderen vergessen."), T("Bei U = 2(a + b) zuerst a abziehen – erst muss die 2 weg.")])
  });
