  // ============================================================
  // TRIGONOMETRIE (rechtwinkliges Dreieck, Kl. 9/10)
  // Bezeichnungen: rechter Winkel bei C; a = BC (gegenüber A), b = AC, c = AB (Hypotenuse).
  // Für α (bei A): Gegenkathete a, Ankathete b. Für β (bei B): Gegenkathete b, Ankathete a.
  // ============================================================
  const RAD = Math.PI / 180;
  const fmt1 = (x) => fmtNum(Math.round(x * 10) / 10);
  // Zeichnet ein rechtwinkliges Dreieck, beliebig gedreht/gespiegelt.
  // o = { a, b, seiten: {a:'…', b:'…', c:'…'}, winkel: 'α'|'β'|null, winkelText, rot: 0..3, spiegel: bool, ecken: bool }
  function dreieckSVG(o) {
    const W = 300, Hh = 220, pad = 34;
    let P = { A: [0, 0], C: [o.b, 0], B: [o.b, o.a] };
    const tr = ([x, y]) => {
      if (o.spiegel) x = -x;
      for (let i = 0; i < (o.rot || 0); i++) [x, y] = [-y, x];
      return [x, y];
    };
    Object.keys(P).forEach((k) => { P[k] = tr(P[k]); });
    const xs = Object.values(P).map((p) => p[0]), ys = Object.values(P).map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const sk = Math.min((W - 2 * pad) / (maxX - minX || 1), (Hh - 2 * pad) / (maxY - minY || 1));
    const offX = (W - (maxX - minX) * sk) / 2, offY = (Hh - (maxY - minY) * sk) / 2;
    const px = (p) => [offX + (p[0] - minX) * sk, Hh - (offY + (p[1] - minY) * sk)];
    const S = { A: px(P.A), B: px(P.B), C: px(P.C) };
    const M = [(S.A[0] + S.B[0] + S.C[0]) / 3, (S.A[1] + S.B[1] + S.C[1]) / 3];
    const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
    const f = (x) => x.toFixed(1);
    let svg = `<svg viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" xmlns="http://www.w3.org/2000/svg" class="graph-svg">`;
    svg += `<polygon points="${[S.A, S.B, S.C].map((p) => f(p[0]) + "," + f(p[1])).join(" ")}" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>`;
    // rechter Winkel bei C
    const u1 = norm([S.A[0] - S.C[0], S.A[1] - S.C[1]]), u2 = norm([S.B[0] - S.C[0], S.B[1] - S.C[1]]), q = 14;
    svg += `<path d="M ${f(S.C[0] + u1[0] * q)} ${f(S.C[1] + u1[1] * q)} L ${f(S.C[0] + (u1[0] + u2[0]) * q)} ${f(S.C[1] + (u1[1] + u2[1]) * q)} L ${f(S.C[0] + u2[0] * q)} ${f(S.C[1] + u2[1] * q)}" fill="none" stroke="#1e3a8a" stroke-width="1.5"/>`;
    svg += `<circle cx="${f(S.C[0] + (u1[0] + u2[0]) * q * 0.5)}" cy="${f(S.C[1] + (u1[1] + u2[1]) * q * 0.5)}" r="1.8" fill="#1e3a8a"/>`;
    // markierter Winkel
    if (o.winkel) {
      const V = o.winkel === "α" ? S.A : S.B, P1 = S.C, P2 = o.winkel === "α" ? S.B : S.A;
      const v1 = norm([P1[0] - V[0], P1[1] - V[1]]), v2 = norm([P2[0] - V[0], P2[1] - V[1]]), r = 26;
      const cross = v1[0] * v2[1] - v1[1] * v2[0];
      svg += `<path d="M ${f(V[0] + v1[0] * r)} ${f(V[1] + v1[1] * r)} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${f(V[0] + v2[0] * r)} ${f(V[1] + v2[1] * r)}" fill="none" stroke="#dc2626" stroke-width="2"/>`;
      const bi = norm([v1[0] + v2[0], v1[1] + v2[1]]);
      svg += `<text x="${f(V[0] + bi[0] * 40)}" y="${f(V[1] + bi[1] * 40 + 5)}" font-size="14" font-weight="bold" text-anchor="middle" fill="#dc2626">${o.winkelText || o.winkel}</text>`;
    }
    // Seitenbeschriftungen außen an der Seitenmitte
    const seite = (P1, P2, txt) => {
      if (!txt) return "";
      const m = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2], n = norm([m[0] - M[0], m[1] - M[1]]);
      return `<text x="${f(m[0] + n[0] * 16)}" y="${f(m[1] + n[1] * 16 + 5)}" font-size="14" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="white" stroke-width="3" paint-order="stroke">${txt}</text>`;
    };
    const sei = o.seiten || {};
    svg += seite(S.B, S.C, sei.a) + seite(S.A, S.C, sei.b) + seite(S.A, S.B, sei.c);
    if (o.ecken !== false) ["A", "B", "C"].forEach((k) => {
      const n = norm([S[k][0] - M[0], S[k][1] - M[1]]);
      svg += `<text x="${f(S[k][0] + n[0] * 14)}" y="${f(S[k][1] + n[1] * 14 + 5)}" font-size="12" fill="#64748b" text-anchor="middle">${k}</text>`;
    });
    return svg + "</svg>";
  }
  const lage = () => ({ rot: randInt(0, 3), spiegel: Math.random() < 0.5 });

  const TRIPEL = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]];
  // Rollen der Seiten für einen Winkel
  const rollen = (w) => (w === "α" ? { geg: "a", an: "b" } : { geg: "b", an: "a" });

  // ---- Stufe 1: Seiten benennen ----
  function gen_trig_1() {
    const w = choice(["α", "β"]), [a, b] = choice([[3, 4], [4, 3], [2, 5], [5, 2], [3, 5]]), R = rollen(w), L = lage();
    return {
      topic: "trigonometrie", level: 1, prompt: `\\text{Benenne die Seiten bezogen auf den Winkel ${w}.}`, promptText: "Seiten benennen",
      graph: dreieckSVG(Object.assign({ a, b, seiten: { a: "a", b: "b", c: "c" }, winkel: w }, L)),
      numFields: 3, fieldLabels: ["Hypotenuse", `Gegenkathete von ${w}`, `Ankathete von ${w}`],
      fieldType: "choice", fieldChoices: [["a", "b", "c"], ["a", "b", "c"], ["a", "b", "c"]],
      answer: ["c", R.geg, R.an], data: { w }
    };
  }
  function check_trig_1(task, inp) { const err = []; task.answer.forEach((x, i) => { if (inp[i] !== x) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
  function steps_trig_1(task) {
    const R = rollen(task.data.w);
    return [
      { label: "Hypotenuse: die längste Seite, gegenüber dem rechten Winkel" }, { left: T("Hypotenuse: c"), right: "" },
      { label: `Gegenkathete: liegt dem Winkel ${task.data.w} gegenüber (berührt ihn nicht)` }, { left: T(`Gegenkathete: ${R.geg}`), right: "" },
      { label: `Ankathete: liegt am Winkel ${task.data.w} an (und ist nicht die Hypotenuse)` }, { left: T(`Ankathete: ${R.an}`), right: "" }
    ];
  }

  // ---- Stufe 2: sin, cos, tan als Verhältnis ----
  function gen_trig_2() {
    const w = choice(["α", "β"]); let [x, y, h] = choice(TRIPEL); if (Math.random() < 0.5) [x, y] = [y, x];
    const a = x, b = y, c = h, R = rollen(w), G = R.geg === "a" ? a : b, A = R.an === "a" ? a : b;
    const fr = (n, d) => { const g = gcd(n, d); return { num: n / g, den: d / g }; };
    return {
      topic: "trigonometrie", level: 2, prompt: `\\text{Gib sin(${w}), cos(${w}) und tan(${w}) als Bruch an.}`, promptText: "Verhältnisse",
      graph: dreieckSVG(Object.assign({ a, b, seiten: { a: String(a), b: String(b), c: String(c) }, winkel: w }, lage())),
      numFields: 3, fieldLabels: [`sin(${w})`, `cos(${w})`, `tan(${w})`], answer: [fr(G, c), fr(A, c), fr(G, A)], data: { w, a, b, c, G, A }
    };
  }
  function check_trig_2(task, inp) {
    const err = []; task.answer.forEach((x, i) => { const f = parseUserFraction(inp[i]); if (!f || !fractionsEqual(f, x)) err.push(i); });
    return { correct: !err.length, fieldErrors: err };
  }
  function steps_trig_2(task) {
    const { w, c, G, A } = task.data;
    return [
      { label: `Bezogen auf ${w}: Gegenkathete ${G}, Ankathete ${A}, Hypotenuse ${c}` },
      { left: `\\sin(${w}) = \\dfrac{${T("Gegenkathete")}}{${T("Hypotenuse")}} = \\dfrac{${G}}{${c}}`, right: "" },
      { left: `\\cos(${w}) = \\dfrac{${T("Ankathete")}}{${T("Hypotenuse")}} = \\dfrac{${A}}{${c}}`, right: "" },
      { left: `\\tan(${w}) = \\dfrac{${T("Gegenkathete")}}{${T("Ankathete")}} = \\dfrac{${G}}{${A}}`, right: "" }
    ];
  }

  // ---- Stufe 3: Seite berechnen ----
  // Fälle bezogen auf α: [gegeben, gesucht, Funktion, Formel(α, x) -> gesucht]
  const SEITEN_FAELLE = [
    ["c", "a", "sin", (al, x) => x * Math.sin(al)], ["c", "b", "cos", (al, x) => x * Math.cos(al)], ["b", "a", "tan", (al, x) => x * Math.tan(al)],
    ["a", "c", "sin", (al, x) => x / Math.sin(al)], ["b", "c", "cos", (al, x) => x / Math.cos(al)], ["a", "b", "tan", (al, x) => x / Math.tan(al)]
  ];
  const NAME = { a: "Gegenkathete", b: "Ankathete", c: "Hypotenuse" };
  function gen_trig_3() {
    const al = randInt(20, 70), [gg, gs, fn, formel] = choice(SEITEN_FAELLE), x = randInt(4, 20);
    const erg = round2(formel(al * RAD, x));
    const seiten = { a: "", b: "", c: "" }; seiten[gg] = `${x} cm`; seiten[gs] = "?";
    const dims = gs === "c" || gg === "c" ? { a: Math.sin(al * RAD), b: Math.cos(al * RAD) } : { a: Math.tan(al * RAD), b: 1 };
    return {
      topic: "trigonometrie", level: 3,
      prompt: `${T("Gegeben:")}\\;\\; \\alpha = ${al}°,\\;\\; ${gg} = ${x}\\text{ cm}.\\;\\; ${T("Berechne")}\\; ${gs}.`, promptText: `alpha=${al}, ${gg}=${x}`,
      graph: dreieckSVG(Object.assign({ a: dims.a, b: dims.b, seiten, winkel: "α", winkelText: `${al}°` }, lage())),
      numFields: 1, fieldLabels: [`${gs} in cm (2 Nachkommastellen)`], answer: [erg], tolerance: 0.02, data: { al, gg, gs, fn, x }
    };
  }
  function check_trig_3(task, inp) { const v = parseUserNumber(inp[0]); const ok = !isNaN(v) && Math.abs(v - task.answer[0]) <= task.tolerance; return { correct: ok, fieldErrors: ok ? [] : [0] }; }
  function steps_trig_3(task) {
    const { al, gg, gs, fn, x } = task.data, F = { sin: ["Gegenkathete", "Hypotenuse"], cos: ["Ankathete", "Hypotenuse"], tan: ["Gegenkathete", "Ankathete"] }[fn];
    const z = gs === "c" ? `${gg} = ${x}` : `${gs}`;
    return [
      { label: `${gg} ist die ${NAME[gg]}, ${gs} die ${NAME[gs]} von α ⇒ ${fn} verwenden` },
      { left: `\\${fn}(${al}°) = \\dfrac{${T(F[0])}}{${T(F[1])}}`, right: "" },
      { left: gs === "c" ? `c = \\dfrac{${x}}{\\${fn}(${al}°)}` : (gg === "c" || (fn === "tan" && gs === "a")) ? `${gs} = ${x}\\cdot \\${fn}(${al}°)` : `${gs} = \\dfrac{${x}}{\\${fn}(${al}°)}`, right: "" },
      { left: `${gs} \\approx ${fmtNum(task.answer[0])}\\text{ cm}`, right: "" },
      { label: "Taschenrechner im Grad-Modus (DEG)!" }
    ];
  }

  // ---- Stufe 4: Winkel berechnen ----
  function gen_trig_4() {
    const fall = choice(["sin", "cos", "tan"]); let a, b, c;
    if (fall === "tan") { a = randInt(2, 15); b = randInt(2, 15); } else { c = randInt(6, 20); const k = randInt(2, c - 1); if (fall === "sin") a = k; else b = k; }
    const al = fall === "sin" ? Math.asin(a / c) / RAD : fall === "cos" ? Math.acos(b / c) / RAD : Math.atan(a / b) / RAD;
    const aa = fall === "cos" ? Math.sqrt(c * c - b * b) : a, bb = fall === "sin" ? Math.sqrt(c * c - a * a) : b;
    const seiten = { a: fall !== "cos" ? `${a} cm` : "", b: fall !== "sin" ? `${b} cm` : "", c: fall !== "tan" ? `${c} cm` : "" };
    const geg = fall === "sin" ? `a = ${a}\\text{ cm},\\; c = ${c}\\text{ cm}` : fall === "cos" ? `b = ${b}\\text{ cm},\\; c = ${c}\\text{ cm}` : `a = ${a}\\text{ cm},\\; b = ${b}\\text{ cm}`;
    return {
      topic: "trigonometrie", level: 4, prompt: `${T("Gegeben:")}\\;\\; ${geg}.\\;\\; ${T("Berechne den Winkel α.")}`, promptText: "Winkel",
      graph: dreieckSVG(Object.assign({ a: aa, b: bb, seiten, winkel: "α", winkelText: "α = ?" }, lage())),
      numFields: 1, fieldLabels: ["α in Grad (1 Nachkommastelle)"], answer: [Math.round(al * 10) / 10], tolerance: 0.06, data: { fall, a, b, c, al }
    };
  }
  function check_trig_4(task, inp) { const v = parseUserNumber(inp[0]); const ok = !isNaN(v) && Math.abs(v - task.answer[0]) <= task.tolerance; return { correct: ok, fieldErrors: ok ? [] : [0] }; }
  function steps_trig_4(task) {
    const { fall, a, b, c } = task.data;
    const q = fall === "sin" ? [a, c] : fall === "cos" ? [b, c] : [a, b];
    return [
      { label: fall === "sin" ? "Gegenkathete und Hypotenuse gegeben ⇒ Sinus" : fall === "cos" ? "Ankathete und Hypotenuse gegeben ⇒ Kosinus" : "Gegenkathete und Ankathete gegeben ⇒ Tangens" },
      { left: `\\${fall}(\\alpha) = \\dfrac{${q[0]}}{${q[1]}}`, right: "" },
      { label: `Umkehrfunktion ${fall}⁻¹ (auf dem Taschenrechner meist SHIFT + ${fall})` },
      { left: `\\alpha = ${fall}^{-1}\\left(\\dfrac{${q[0]}}{${q[1]}}\\right) \\approx ${fmt1(task.answer[0])}°`, right: "" }
    ];
  }

  // ---- Stufe 5: Textaufgaben ----
  function gen_trig_5() {
    const sub = choice(["leiter", "rampe", "turm", "steigung", "drachen"]), n = choice(NAMEN);
    if (sub === "leiter") {
      const L = choice([3, 4, 5, 6, 8]), d = choice([0.8, 1, 1.2, 1.5, 2, 2.5]), w = Math.round(Math.acos(d / L) / RAD * 10) / 10;
      const sicher = w >= 65 && w <= 75 ? "ja" : "nein";
      return textTask("trigonometrie", 5, "leiter",
        T(`${n} lehnt eine ${L} m lange Leiter an eine Hauswand. Der Fuß der Leiter steht ${fmtNum(d)} m von der Wand entfernt. Sicher steht eine Leiter bei einem Anstellwinkel zum Boden zwischen 65° und 75°.`),
        T("Wie groß ist der Anstellwinkel, und steht die Leiter sicher?"), [
          { label: "Winkel zum Boden in Grad (1 Nachkommastelle)", kind: "number", answer: w, tol: 0.06 },
          { label: "Steht die Leiter sicher?", kind: "choice", choices: ["ja", "nein"], answer: sicher }
        ], [
          { label: "Leiter = Hypotenuse, Abstand zur Wand = Ankathete des Winkels am Boden ⇒ Kosinus" },
          { left: `\\cos(\\alpha) = \\dfrac{${fmtNum(d)}}{${L}} \\;\\Rightarrow\\; \\alpha \\approx ${fmt1(w)}°`, right: "" },
          { left: T(sicher === "ja" ? "liegt zwischen 65° und 75° ⇒ sicher" : w < 65 ? "kleiner als 65° ⇒ Leiter kann wegrutschen" : "größer als 75° ⇒ Leiter kann nach hinten kippen"), right: "" }
        ], { dataExtra: { L, d } });
    }
    if (sub === "rampe") {
      const h = choice([12, 15, 18, 20, 24, 30]), l = choice([2, 2.5, 3, 4, 5]);
      const pz = Math.round((h / (l * 100)) * 1000) / 10, w = Math.round(Math.atan(h / (l * 100)) / RAD * 10) / 10;
      return textTask("trigonometrie", 5, "rampe",
        T(`Vor dem Eingang einer Schule liegt eine Stufe von ${h} cm Höhe. Eine Rollstuhlrampe soll sie auf ${fmtNum(l)} m waagerechter Länge überbrücken. Erlaubt ist eine Steigung von höchstens 6 %.`),
        T("Wie groß sind Steigung und Steigungswinkel der Rampe, und ist sie zulässig?"), [
          { label: "Steigung in % (1 Nachkommastelle)", kind: "number", answer: pz, tol: 0.06 },
          { label: "Steigungswinkel in Grad (1 Nachkommastelle)", kind: "number", answer: w, tol: 0.06 },
          { label: "zulässig?", kind: "choice", choices: ["ja", "nein"], answer: pz <= 6 ? "ja" : "nein" }
        ], [
          { label: "Steigung = Höhenunterschied : waagerechte Länge (gleiche Einheit!)" }, { left: `${h} : ${fmtNum(l * 100)} = ${fmtNum(round4(h / (l * 100)))} = ${fmtNum(pz)}\\,\\%`, right: "" },
          { label: "Die Steigung ist der Tangens des Winkels" }, { left: `\\alpha = \\tan^{-1}(${fmtNum(round4(h / (l * 100)))}) \\approx ${fmt1(w)}°`, right: "" }
        ], { dataExtra: { h, l } });
    }
    if (sub === "turm") {
      const s = choice([12, 15, 18, 24, 30, 36]), w = randInt(25, 60), H = Math.round(s * Math.tan(w * RAD) * 10) / 10;
      return textTask("trigonometrie", 5, "turm",
        T(`Ein Kirchturm wirft auf ebenem Boden einen ${s} m langen Schatten. Die Sonnenstrahlen treffen unter einem Winkel von ${w}° auf den Boden.`),
        T("Wie hoch ist der Turm? (1 Nachkommastelle)"), [{ label: "Höhe in m", kind: "number", answer: H, tol: 0.06 }],
        [{ label: "Schatten = Ankathete, Turm = Gegenkathete des Sonnenwinkels ⇒ Tangens" }, { left: `h = ${s}\\cdot \\tan(${w}°) \\approx ${fmt1(H)}`, right: "" }], { dataExtra: { s, w } });
    }
    if (sub === "steigung") {
      const p = choice([8, 10, 12, 15, 18, 20]), km = choice([1, 1.5, 2, 3]);
      const w = Math.atan(p / 100) / RAD, hd = Math.round(km * 1000 * Math.sin(w * RAD));
      return textTask("trigonometrie", 5, "steigung",
        T(`Ein Verkehrsschild an einer Passstraße zeigt „${p} % Steigung“. ${n} fährt mit dem Rad ${fmtNum(km)} km auf dieser Straße bergauf (gemessen entlang der Straße).`),
        T("Wie groß ist der Steigungswinkel, und wie viele Höhenmeter schafft das Rad dabei?"), [
          { label: "Steigungswinkel in Grad (1 Nachkommastelle)", kind: "number", answer: Math.round(w * 10) / 10, tol: 0.06 },
          { label: "Höhenmeter (ganze Meter)", kind: "number", answer: hd, tol: 1 }
        ], [
          { label: `${p} % bedeutet: ${p} m Höhe auf 100 m waagerechter Strecke ⇒ tan(α) = ${fmtNum(p / 100)}` },
          { left: `\\alpha = \\tan^{-1}(${fmtNum(p / 100)}) \\approx ${fmt1(w)}°`, right: "" },
          { label: "Die gefahrene Strecke ist die Hypotenuse ⇒ Sinus" },
          { left: `h = ${km * 1000}\\cdot \\sin(${fmt1(w)}°) \\approx ${hd}\\text{ m}`, right: "" },
          { label: "Achtung: 12 % Steigung sind NICHT 12°." }
        ], { dataExtra: { p, km } });
    }
    const L = choice([30, 40, 50, 60]), w = randInt(35, 65), hand = 1.5, H = Math.round((L * Math.sin(w * RAD) + hand) * 10) / 10;
    return textTask("trigonometrie", 5, "drachen",
      T(`${n} lässt einen Drachen steigen. Die Schnur ist ${L} m lang, straff gespannt und bildet mit der Waagerechten einen Winkel von ${w}°. ${n} hält die Schnur in 1,5 m Höhe.`),
      T("In welcher Höhe über dem Boden fliegt der Drachen? (1 Nachkommastelle)"), [{ label: "Höhe in m", kind: "number", answer: H, tol: 0.06 }],
      [{ label: "Schnur = Hypotenuse, gesuchte Höhe über der Hand = Gegenkathete ⇒ Sinus" }, { left: `${L}\\cdot \\sin(${w}°) \\approx ${fmtNum(round2(L * Math.sin(w * RAD)))}`, right: "" },
       { label: "Die Handhöhe noch dazurechnen" }, { left: `${fmtNum(round2(L * Math.sin(w * RAD)))} + 1,5 \\approx ${fmt1(H)}`, right: "" }], { dataExtra: { L, w } });
  }

  // ============================================================
  // ALLGEMEINE DREIECKE: Sinussatz und Kosinussatz (Kl. 10)
  // Bezeichnungen wie üblich: Seite a liegt A gegenüber (also α), b gegenüber β, c gegenüber γ.
  // ============================================================
  // Dreieck aus drei Seiten, mit Winkel- und Seitenbeschriftung.
  // o = { a, b, c, seiten: {a,b,c}, winkel: {α,β,γ} (Text oder leer), spiegel }
  function dreieckAllgSVG(o) {
    const W = 300, Hh = 220, pad = 36, { a, b, c } = o;
    const xC = (b * b + c * c - a * a) / (2 * c), yC = Math.sqrt(Math.max(0, b * b - xC * xC));
    let P = { A: [0, 0], B: [c, 0], C: [xC, yC] };
    if (o.spiegel) Object.keys(P).forEach((k) => { P[k] = [c - P[k][0], P[k][1]]; });
    const xs = Object.values(P).map((p) => p[0]), ys = Object.values(P).map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const sk = Math.min((W - 2 * pad) / (maxX - minX || 1), (Hh - 2 * pad) / (maxY - minY || 1));
    const offX = (W - (maxX - minX) * sk) / 2, offY = (Hh - (maxY - minY) * sk) / 2;
    const px = (p) => [offX + (p[0] - minX) * sk, Hh - (offY + (p[1] - minY) * sk)];
    const S = { A: px(P.A), B: px(P.B), C: px(P.C) };
    const M = [(S.A[0] + S.B[0] + S.C[0]) / 3, (S.A[1] + S.B[1] + S.C[1]) / 3];
    const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
    const f = (x) => x.toFixed(1);
    let svg = `<svg viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" xmlns="http://www.w3.org/2000/svg" class="graph-svg">`;
    svg += `<polygon points="${[S.A, S.B, S.C].map((p) => f(p[0]) + "," + f(p[1])).join(" ")}" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>`;
    const winkel = o.winkel || {};
    [["A", "B", "C", "α"], ["B", "C", "A", "β"], ["C", "A", "B", "γ"]].forEach(([v, p1, p2, gr]) => {
      if (!winkel[gr]) return;
      const V = S[v], v1 = norm([S[p1][0] - V[0], S[p1][1] - V[1]]), v2 = norm([S[p2][0] - V[0], S[p2][1] - V[1]]), r = 22;
      const cross = v1[0] * v2[1] - v1[1] * v2[0];
      svg += `<path d="M ${f(V[0] + v1[0] * r)} ${f(V[1] + v1[1] * r)} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${f(V[0] + v2[0] * r)} ${f(V[1] + v2[1] * r)}" fill="none" stroke="#dc2626" stroke-width="2"/>`;
      const bi = norm([v1[0] + v2[0], v1[1] + v2[1]]);
      svg += `<text x="${f(V[0] + bi[0] * 38)}" y="${f(V[1] + bi[1] * 38 + 5)}" font-size="13" font-weight="bold" text-anchor="middle" fill="#dc2626" stroke="white" stroke-width="3" paint-order="stroke">${winkel[gr]}</text>`;
    });
    const seite = (P1, P2, txt) => {
      if (!txt) return "";
      const m = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2], n = norm([m[0] - M[0], m[1] - M[1]]);
      return `<text x="${f(m[0] + n[0] * 22)}" y="${f(m[1] + n[1] * 22 + 5)}" font-size="13" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="white" stroke-width="3" paint-order="stroke">${txt}</text>`;
    };
    const sei = o.seiten || {};
    svg += seite(S.B, S.C, sei.a) + seite(S.A, S.C, sei.b) + seite(S.A, S.B, sei.c);
    ["A", "B", "C"].forEach((k) => {
      const n = norm([S[k][0] - M[0], S[k][1] - M[1]]);
      svg += `<text x="${f(S[k][0] + n[0] * 14)}" y="${f(S[k][1] + n[1] * 14 + 5)}" font-size="12" fill="#64748b" text-anchor="middle">${k}</text>`;
    });
    return svg + "</svg>";
  }
  // Seitenlängen aus zwei Winkeln (Grad) und Seite a
  const seitenAusWinkeln = (al, be, a) => { const ga = 180 - al - be; return { a, b: (a * Math.sin(be * RAD)) / Math.sin(al * RAD), c: (a * Math.sin(ga * RAD)) / Math.sin(al * RAD), ga }; };
  const winkelAusSeiten = (a, b, c) => ({ al: Math.acos((b * b + c * c - a * a) / (2 * b * c)) / RAD, be: Math.acos((a * a + c * c - b * b) / (2 * a * c)) / RAD });
  const r2 = (x) => Math.round(x * 100) / 100, r1 = (x) => Math.round(x * 10) / 10;

  // ---- Stufe 6: Sinussatz ----
  function gen_trig_6() {
    const sub = choice(["seite", "winkel"]);
    if (sub === "seite") {
      let al, be; do { al = randInt(25, 110); be = randInt(25, 110); } while (al + be > 150);
      const a = randInt(5, 20), S = seitenAusWinkeln(al, be, a), ziel = choice(["b", "c"]);
      const erg = r2(S[ziel]), wz = ziel === "b" ? be : S.ga, wn = ziel === "b" ? "β" : "γ";
      const seiten = { a: `${a} cm`, b: "", c: "" }; seiten[ziel] = "?";
      return {
        topic: "trigonometrie", level: 6, subtype: "seite",
        prompt: `${T("Gegeben:")}\\;\\; a = ${a}\\text{ cm},\\; \\alpha = ${al}°,\\; \\beta = ${be}°.\\;\\; ${T("Berechne")}\\; ${ziel}.`, promptText: "Sinussatz Seite",
        graph: dreieckAllgSVG({ a: S.a, b: S.b, c: S.c, seiten, winkel: { α: `${al}°`, β: `${be}°`, γ: ziel === "c" ? "γ" : "" }, spiegel: Math.random() < 0.5 }),
        numFields: 1, fieldLabels: [`${ziel} in cm (2 Nachkommastellen)`], answer: [erg], tolerance: 0.02, data: { al, be, a, ziel, wz, wn, ga: S.ga }
      };
    }
    // Winkel: a > b, damit β eindeutig (spitz) ist
    let a, b, al; do { a = randInt(6, 20); b = randInt(4, a - 1); al = randInt(30, 120); } while (b * Math.sin(al * RAD) / a >= 0.98);
    const be = Math.asin((b * Math.sin(al * RAD)) / a) / RAD, ga = 180 - al - be, c = (a * Math.sin(ga * RAD)) / Math.sin(al * RAD);
    return {
      topic: "trigonometrie", level: 6, subtype: "winkel",
      prompt: `${T("Gegeben:")}\\;\\; a = ${a}\\text{ cm},\\; b = ${b}\\text{ cm},\\; \\alpha = ${al}°.\\;\\; ${T("Berechne")}\\; \\beta.`, promptText: "Sinussatz Winkel",
      graph: dreieckAllgSVG({ a, b, c, seiten: { a: `${a} cm`, b: `${b} cm`, c: "" }, winkel: { α: `${al}°`, β: "β = ?" }, spiegel: Math.random() < 0.5 }),
      numFields: 1, fieldLabels: ["β in Grad (1 Nachkommastelle)"], answer: [r1(be)], tolerance: 0.06, data: { a, b, al, be }
    };
  }
  function check_trig_6(task, inp) { const v = parseUserNumber(inp[0]); const ok = !isNaN(v) && Math.abs(v - task.answer[0]) <= task.tolerance; return { correct: ok, fieldErrors: ok ? [] : [0] }; }
  function steps_trig_6(task) {
    const d = task.data;
    if (task.subtype === "seite") {
      const zus = d.ziel === "c" ? [{ label: "Fehlender Winkel: Winkelsumme 180°" }, { left: `\\gamma = 180° - ${d.al}° - ${d.be}° = ${d.ga}°`, right: "" }] : [];
      return zus.concat([
        { label: "Sinussatz: Jede Seite gehört zu ihrem gegenüberliegenden Winkel" },
        { left: `\\dfrac{${d.ziel}}{\\sin(${d.wz}°)} = \\dfrac{a}{\\sin(\\alpha)}`, right: "" },
        { left: `${d.ziel} = \\dfrac{${d.a}\\cdot \\sin(${d.wz}°)}{\\sin(${d.al}°)} \\approx ${fmtNum(task.answer[0])}\\text{ cm}`, right: "" }
      ]);
    }
    return [
      { label: "Sinussatz mit den Paaren (a, α) und (b, β)" },
      { left: `\\dfrac{\\sin(\\beta)}{${d.b}} = \\dfrac{\\sin(${d.al}°)}{${d.a}} \\;\\Rightarrow\\; \\sin(\\beta) = \\dfrac{${d.b}\\cdot \\sin(${d.al}°)}{${d.a}} \\approx ${fmtNum(round4(d.b * Math.sin(d.al * RAD) / d.a))}`, right: "" },
      { left: `\\beta = \\sin^{-1}(${fmtNum(round4(d.b * Math.sin(d.al * RAD) / d.a))}) \\approx ${fmt1(task.answer[0])}°`, right: "" },
      { label: "Eindeutig, weil b < a: β muss kleiner als α sein (also spitz)." }
    ];
  }

  // ---- Stufe 7: Kosinussatz ----
  function gen_trig_7() {
    const sub = choice(["seite", "winkel"]);
    if (sub === "seite") {
      const b = randInt(4, 15), c = randInt(4, 15), al = randInt(25, 140);
      const a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(al * RAD));
      return {
        topic: "trigonometrie", level: 7, subtype: "seite",
        prompt: `${T("Gegeben:")}\\;\\; b = ${b}\\text{ cm},\\; c = ${c}\\text{ cm},\\; \\alpha = ${al}°.\\;\\; ${T("Berechne")}\\; a.`, promptText: "Kosinussatz Seite",
        graph: dreieckAllgSVG({ a, b, c, seiten: { a: "?", b: `${b} cm`, c: `${c} cm` }, winkel: { α: `${al}°` }, spiegel: Math.random() < 0.5 }),
        numFields: 1, fieldLabels: ["a in cm (2 Nachkommastellen)"], answer: [r2(a)], tolerance: 0.02, data: { b, c, al }
      };
    }
    let a, b, c; do { a = randInt(4, 15); b = randInt(4, 15); c = randInt(4, 15); } while (a + b <= c + 1 || a + c <= b + 1 || b + c <= a + 1);
    const ga = Math.acos((a * a + b * b - c * c) / (2 * a * b)) / RAD;
    return {
      topic: "trigonometrie", level: 7, subtype: "winkel",
      prompt: `${T("Gegeben:")}\\;\\; a = ${a}\\text{ cm},\\; b = ${b}\\text{ cm},\\; c = ${c}\\text{ cm}.\\;\\; ${T("Berechne")}\\; \\gamma.`, promptText: "Kosinussatz Winkel",
      graph: dreieckAllgSVG({ a, b, c, seiten: { a: `${a} cm`, b: `${b} cm`, c: `${c} cm` }, winkel: { γ: "γ = ?" }, spiegel: Math.random() < 0.5 }),
      numFields: 1, fieldLabels: ["γ in Grad (1 Nachkommastelle)"], answer: [r1(ga)], tolerance: 0.06, data: { a, b, c, ga }
    };
  }
  function check_trig_7(task, inp) { const v = parseUserNumber(inp[0]); const ok = !isNaN(v) && Math.abs(v - task.answer[0]) <= task.tolerance; return { correct: ok, fieldErrors: ok ? [] : [0] }; }
  function steps_trig_7(task) {
    const d = task.data;
    if (task.subtype === "seite") {
      const q = d.b * d.b + d.c * d.c - 2 * d.b * d.c * Math.cos(d.al * RAD);
      return [
        { label: "Kosinussatz (zwei Seiten und der eingeschlossene Winkel gegeben)" },
        { left: `a^{2} = b^{2} + c^{2} - 2bc\\cdot \\cos(\\alpha)`, right: "" },
        { left: `a^{2} = ${d.b * d.b} + ${d.c * d.c} - 2\\cdot ${d.b}\\cdot ${d.c}\\cdot \\cos(${d.al}°) \\approx ${fmtNum(r2(q))}`, right: "" },
        { left: `a = \\sqrt{${fmtNum(r2(q))}} \\approx ${fmtNum(task.answer[0])}\\text{ cm}`, right: "" }
      ];
    }
    const z = d.a * d.a + d.b * d.b - d.c * d.c, n = 2 * d.a * d.b;
    return [
      { label: "Kosinussatz nach dem Winkel umgestellt (drei Seiten gegeben)" },
      { left: `\\cos(\\gamma) = \\dfrac{a^{2} + b^{2} - c^{2}}{2ab} = \\dfrac{${d.a * d.a} + ${d.b * d.b} - ${d.c * d.c}}{${n}} = \\dfrac{${z}}{${n}}`, right: "" },
      { left: `\\gamma = \\cos^{-1}\\left(\\dfrac{${z}}{${n}}\\right) \\approx ${fmt1(task.answer[0])}°`, right: "" }
    ];
  }

  // ---- Stufe 8: Textaufgaben zu allgemeinen Dreiecken ----
  function gen_trig_8() {
    const sub = choice(["fluss", "grundstueck", "wanderer"]), n = choice(NAMEN);
    if (sub === "fluss") {
      const c = choice([40, 50, 60, 80, 100]); let al, be; do { al = randInt(40, 80); be = randInt(40, 80); } while (al + be > 150);
      const ga = 180 - al - be, b = (c * Math.sin(be * RAD)) / Math.sin(ga * RAD), h = b * Math.sin(al * RAD);
      return textTask("trigonometrie", 8, "fluss",
        T(`Um die Breite eines Flusses zu bestimmen, steckt ${n} am Ufer zwei Punkte A und B im Abstand von ${c} m ab. Am anderen Ufer steht ein Baum C. Gemessen werden die Winkel ∠BAC = ${al}° und ∠ABC = ${be}°.`),
        T("Wie weit ist der Baum von A entfernt, und wie breit ist der Fluss (senkrechter Abstand des Baums zur Uferlinie AB)?"), [
          { label: "Entfernung A–Baum in m (1 Nachkommastelle)", kind: "number", answer: r1(b), tol: 0.06 },
          { label: "Flussbreite in m (1 Nachkommastelle)", kind: "number", answer: r1(h), tol: 0.06 }
        ], [
          { label: "Winkel beim Baum" }, { left: `\\gamma = 180° - ${al}° - ${be}° = ${ga}°`, right: "" },
          { label: "Sinussatz: AC liegt β gegenüber, AB liegt γ gegenüber" }, { left: `AC = \\dfrac{${c}\\cdot \\sin(${be}°)}{\\sin(${ga}°)} \\approx ${fmtNum(r2(b))}`, right: "" },
          { label: "Breite = Höhe im Dreieck: rechtwinkliges Teildreieck bei A" }, { left: `h = ${fmtNum(r2(b))}\\cdot \\sin(${al}°) \\approx ${fmt1(h)}`, right: "" }
        ], { dataExtra: { c, al, be } });
    }
    if (sub === "grundstueck") {
      const b = choice([20, 25, 30, 35, 40]), c = choice([24, 28, 32, 36, 45]), al = randInt(40, 120);
      const a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(al * RAD)), A = 0.5 * b * c * Math.sin(al * RAD);
      return textTask("trigonometrie", 8, "grundstueck",
        T(`Ein dreieckiges Grundstück hat zwei Seiten von ${b} m und ${c} m Länge, die an einer Ecke unter einem Winkel von ${al}° zusammentreffen. Es soll ganz eingezäunt werden.`),
        T("Wie viel Meter Zaun braucht man, und wie groß ist das Grundstück?"), [
          { label: "Zaunlänge in m (1 Nachkommastelle)", kind: "number", answer: r1(a + b + c), tol: 0.06 },
          { label: "Fläche in m² (ganze m²)", kind: "number", answer: Math.round(A), tol: 1 }
        ], [
          { label: "Dritte Seite mit dem Kosinussatz" }, { left: `a = \\sqrt{${b}^{2} + ${c}^{2} - 2\\cdot ${b}\\cdot ${c}\\cdot \\cos(${al}°)} \\approx ${fmtNum(r2(a))}`, right: "" },
          { left: `${T("Zaun:")}\\; ${b} + ${c} + ${fmtNum(r2(a))} \\approx ${fmt1(a + b + c)}`, right: "" },
          { label: "Fläche aus zwei Seiten und dem eingeschlossenen Winkel" }, { left: `A = \\dfrac{1}{2}\\cdot ${b}\\cdot ${c}\\cdot \\sin(${al}°) \\approx ${Math.round(A)}`, right: "" }
        ], { dataExtra: { b, c, al } });
    }
    const x = choice([2, 3, 4, 5, 6]), y = choice([3, 4, 5, 6, 7]), ga = randInt(30, 150), d = Math.sqrt(x * x + y * y - 2 * x * y * Math.cos(ga * RAD));
    const [n2] = zweiNamen().filter((m) => m !== n);
    return textTask("trigonometrie", 8, "wanderer",
      T(`An einer Weggabelung trennen sich ${n} und ${n2}. Die beiden geraden Wege bilden einen Winkel von ${ga}°. ${n} geht ${x} km, ${n2} geht ${y} km weit.`),
      T("Wie weit sind die beiden dann in Luftlinie voneinander entfernt? (2 Nachkommastellen)"), [
        { label: "Entfernung in km", kind: "number", answer: r2(d), tol: 0.02 }
      ], [
        { label: "Zwei Seiten und der eingeschlossene Winkel ⇒ Kosinussatz" },
        { left: `d = \\sqrt{${x}^{2} + ${y}^{2} - 2\\cdot ${x}\\cdot ${y}\\cdot \\cos(${ga}°)} \\approx ${fmtNum(r2(d))}`, right: "" }
      ], { dataExtra: { x, y, ga } });
  }

  // ---- Stufe 9: Mehrschrittige Aufgaben (Zerlegung in rechtwinklige Teildreiecke, Kl. 10) ----
  // Obergrenze nach Klassenarbeiten/Rahmenplan Kl. 10: zwei Standpunkte, quadratische Pyramide
  // (Seitenhöhe, Oberfläche, Neigungswinkel), Trapez, gleichschenkliges Dreieck, exakte Werte über Pythagoras.
  // figurSVG2: freie Figur aus Punkten; Seitentexte außen (weg vom Schwerpunkt), Winkelbögen, rechte Winkel
  function figurSVG2(o) {
    const W = 330, Hh = 240, pad = 52, P = o.punkte, keys = Object.keys(P);
    const xs = keys.map((k) => P[k][0]), ys = keys.map((k) => P[k][1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const sk = Math.min((W - 2 * pad) / (maxX - minX || 1), (Hh - 2 * pad) / (maxY - minY || 1));
    const offX = (W - (maxX - minX) * sk) / 2, offY = (Hh - (maxY - minY) * sk) / 2;
    const S = {}; keys.forEach((k) => { S[k] = [offX + (P[k][0] - minX) * sk, Hh - (offY + (P[k][1] - minY) * sk)]; });
    const M = [keys.reduce((s, k) => s + S[k][0], 0) / keys.length, keys.reduce((s, k) => s + S[k][1], 0) / keys.length];
    const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }, f = (x) => x.toFixed(1);
    let svg = `<svg viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" xmlns="http://www.w3.org/2000/svg" class="graph-svg">`;
    (o.flaechen || []).forEach((fl) => { svg += `<polygon points="${fl.map((k) => f(S[k][0]) + "," + f(S[k][1])).join(" ")}" fill="${o.fuellung || "#eff6ff"}" stroke="none"/>`; });
    (o.linien || []).forEach(([p, q, st]) => { svg += `<line x1="${f(S[p][0])}" y1="${f(S[p][1])}" x2="${f(S[q][0])}" y2="${f(S[q][1])}" stroke="${st === "hilf" ? "#64748b" : st === "rot" ? "#dc2626" : "#1e3a8a"}" stroke-width="${st === "hilf" ? 1.5 : 2}"${st === "hilf" || st === "verdeckt" ? ' stroke-dasharray="5 4"' : ""}/>`; });
    (o.rechte || []).forEach(([v, p, q]) => {
      const u1 = norm([S[p][0] - S[v][0], S[p][1] - S[v][1]]), u2 = norm([S[q][0] - S[v][0], S[q][1] - S[v][1]]), r = 11;
      svg += `<path d="M ${f(S[v][0] + u1[0] * r)} ${f(S[v][1] + u1[1] * r)} L ${f(S[v][0] + (u1[0] + u2[0]) * r)} ${f(S[v][1] + (u1[1] + u2[1]) * r)} L ${f(S[v][0] + u2[0] * r)} ${f(S[v][1] + u2[1] * r)}" fill="none" stroke="#1e3a8a" stroke-width="1.3"/>`;
    });
    (o.winkel || []).forEach(([v, p, q, txt, rr]) => {
      const v1 = norm([S[p][0] - S[v][0], S[p][1] - S[v][1]]), v2 = norm([S[q][0] - S[v][0], S[q][1] - S[v][1]]), r = rr || 24;
      const cross = v1[0] * v2[1] - v1[1] * v2[0], bi = norm([v1[0] + v2[0], v1[1] + v2[1]]);
      svg += `<path d="M ${f(S[v][0] + v1[0] * r)} ${f(S[v][1] + v1[1] * r)} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${f(S[v][0] + v2[0] * r)} ${f(S[v][1] + v2[1] * r)}" fill="none" stroke="#dc2626" stroke-width="2"/>`;
      svg += `<text x="${f(S[v][0] + bi[0] * (r + 16))}" y="${f(S[v][1] + bi[1] * (r + 16) + 5)}" font-size="13" font-weight="bold" text-anchor="middle" fill="#dc2626" stroke="white" stroke-width="3" paint-order="stroke">${txt}</text>`;
    });
    (o.seiten || []).forEach(([p, q, txt, seite]) => {
      const m = [(S[p][0] + S[q][0]) / 2, (S[p][1] + S[q][1]) / 2], d = norm([S[q][0] - S[p][0], S[q][1] - S[p][1]]);
      let n = [-d[1], d[0]]; const weg = (m[0] - M[0]) * n[0] + (m[1] - M[1]) * n[1];
      if ((seite || 0) === 0 ? weg < 0 : seite < 0) n = [-n[0], -n[1]];
      const t2 = String(txt).replace(/_([a-z])/g, '<tspan baseline-shift="sub" font-size="10">$1</tspan>');
      svg += `<text x="${f(m[0] + n[0] * 15)}" y="${f(m[1] + n[1] * 15 + 5)}" font-size="13" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="white" stroke-width="3" paint-order="stroke">${t2}</text>`;
    });
    (o.namen || []).forEach((k) => { const n = norm([S[k][0] - M[0], S[k][1] - M[1]]); svg += `<text x="${f(S[k][0] + n[0] * 13)}" y="${f(S[k][1] + n[1] * 13 + 5)}" font-size="12" fill="#64748b" text-anchor="middle">${k}</text>`; });
    return svg + "</svg>";
  }
  // Turm, von zwei Standpunkten A (weiter weg) und B (näher) angepeilt
  function turmSVG(d, a1, a2, h, beschr) {
    const x = h / Math.tan(a2 * RAD);
    return figurSVG2({ punkte: { A: [0, 0], B: [d, 0], F: [d + x, 0], S: [d + x, h] }, flaechen: [["A", "F", "S"]],
      linien: [["A", "F"], ["F", "S"], ["A", "S", "hilf"], ["B", "S", "hilf"]], rechte: [["F", "S", "A"]],
      winkel: [["A", "F", "S", `${a1}°`, 34], ["B", "F", "S", `${a2}°`, 22]],
      seiten: [["A", "B", beschr.d, 1], ["F", "S", beschr.h], ["B", "F", beschr.x || "", 1]] });
  }
  function pyramideSVG(beschr) {
    // Kavalierperspektive: Tiefe unter 45°, halbe Länge
    const t = 0.45, P = { A: [0, 0], B: [6, 0], C: [6 + 6 * t, 6 * t], D: [6 * t, 6 * t] }, Mi = [3 + 3 * t, 3 * t];
    const pkt = Object.assign({}, P, { M: Mi, S: [Mi[0], 7.2], H: [3, 0] });
    return figurSVG2({ punkte: pkt, flaechen: [["A", "B", "S"]], fuellung: "#eff6ff",
      linien: [["A", "B"], ["B", "C"], ["C", "D", "verdeckt"], ["D", "A", "verdeckt"], ["A", "S"], ["B", "S"], ["C", "S"], ["D", "S", "verdeckt"],
        ["M", "S", "hilf"], ["M", "H", "hilf"], ["M", "A", "hilf"], ["H", "S", "rot"]],
      winkel: [["H", "M", "S", "ε", 14], ["A", "M", "S", "φ", 26]],
      seiten: [["A", "B", beschr.a], ["M", "S", beschr.h, 1], ["H", "S", beschr.hs, 1]], namen: ["A", "B", "C", "D", "S"] });
  }
  function trapezSVG(a, d, al, be, beschr) {
    const h = d * Math.sin(al * RAD), xD = d * Math.cos(al * RAD), xC = a - h / Math.tan(be * RAD);
    return figurSVG2({ punkte: { A: [0, 0], B: [a, 0], C: [xC, h], D: [xD, h], E: [xD, 0] }, flaechen: [["A", "B", "C", "D"]],
      linien: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["D", "E", "hilf"]], rechte: [["E", "D", "B"]],
      winkel: [["A", "B", "D", `${al}°`], ["B", "C", "A", `${be}°`]],
      seiten: [["A", "B", beschr.a], ["A", "D", beschr.d], ["B", "C", beschr.b], ["D", "C", beschr.c], ["D", "E", beschr.h, -1]], namen: ["A", "B", "C", "D"] });
  }
  function gleichschenkligSVG(c, be, beschr) {
    const h = (c / 2) * Math.tan(be * RAD);
    return figurSVG2({ punkte: { A: [0, 0], B: [c, 0], C: [c / 2, h], F: [c / 2, 0] }, flaechen: [["A", "B", "C"]],
      linien: [["A", "B"], ["B", "C"], ["C", "A"], ["C", "F", "hilf"]], rechte: [["F", "C", "B"]],
      winkel: [["B", "C", "A", `${be}°`]], seiten: [["A", "B", beschr.c], ["B", "C", beschr.a], ["C", "F", beschr.h, 1]], namen: ["A", "B", "C"] });
  }
  const TRIPEL_PRIM = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
  function gen_trig_9() {
    const sub = choice(["turm", "turm", "pyramide", "pyramide", "trapez", "gleichschenklig", "exakt"]), n = choice(NAMEN);
    if (sub === "turm") {
      const d = choice([20, 25, 30, 40, 50, 60]), a1 = randInt(20, 40), a2 = randInt(a1 + 10, Math.min(a1 + 25, 70));
      const t1 = Math.tan(a1 * RAD), t2 = Math.tan(a2 * RAD), h = (d * t1 * t2) / (t2 - t1), x = h / t2;
      const obj = choice(["Kirchturm", "Leuchtturm", "Funkmast", "Baum"]);
      return textTask("trigonometrie", 9, sub,
        T(`${n} sieht die Spitze eines ${obj}s unter einem Höhenwinkel von ${a1}°. Nach ${d} m auf ebenem Boden direkt auf den ${obj} zu beträgt der Höhenwinkel ${a2}°.`),
        T("Wie hoch ist der " + obj + ", und wie weit ist " + n + " am zweiten Standpunkt noch von ihm entfernt? (Augenhöhe vernachlässigen)"), [
          { label: "Höhe in m (1 Nachkommastelle)", kind: "number", answer: r1(h), tol: 0.06 },
          { label: "Entfernung vom zweiten Standpunkt in m (1 Nachkommastelle)", kind: "number", answer: r1(x), tol: 0.06 + 0.05 / t2 }
        ], [
          { label: "Zwei rechtwinklige Dreiecke mit derselben Höhe h; x = Entfernung vom zweiten Standpunkt" },
          { left: `\\tan(${a2}°) = \\dfrac{h}{x} \\qquad \\tan(${a1}°) = \\dfrac{h}{x + ${d}}`, right: "" },
          { label: "Beide Gleichungen nach h auflösen und gleichsetzen" },
          { left: `x\\cdot \\tan(${a2}°) = (x + ${d})\\cdot \\tan(${a1}°)`, right: "" },
          { left: `x = \\dfrac{${d}\\cdot \\tan(${a1}°)}{\\tan(${a2}°) - \\tan(${a1}°)} \\approx ${fmt1(x)}`, right: "" },
          { label: "Höhe aus dem kleinen Dreieck (mit ungerundetem x weiterrechnen)" },
          { left: `h = x\\cdot \\tan(${a2}°) \\approx ${fmt1(h)}`, right: "" }
        ], { graph: turmSVG(d, a1, a2, h, { d: `${d} m`, h: "h = ?", x: "x" }), dataExtra: { d, a1, a2, h, x } });
    }
    if (sub === "pyramide") {
      const a = choice([4, 5, 6, 7, 8, 8.2, 9, 10, 12]), h = choice([5, 6, 7, 7.5, 8, 9, 10, 12]);
      const hs = Math.hypot(h, a / 2), O = a * a + 2 * a * hs, eps = Math.atan(h / (a / 2)) / RAD, phi = Math.atan(h / (a * Math.SQRT2 / 2)) / RAD;
      return textTask("trigonometrie", 9, sub,
        T(`Eine gerade quadratische Pyramide hat die Grundkante a = ${fmtNum(a)} cm und die Höhe h = ${fmtNum(h)} cm.`),
        T("Berechne die Höhe hₛ einer Seitenfläche, die Oberfläche, den Neigungswinkel ε der Seitenfläche und den Neigungswinkel φ der Seitenkante gegen die Grundfläche."), [
          { label: "Seitenhöhe hₛ in cm (1 Nachkommastelle)", kind: "number", answer: r1(hs), tol: 0.06 },
          { label: "Oberfläche in cm² (1 Nachkommastelle)", kind: "number", answer: r1(O), tol: 0.06 + a * 0.1 },
          { label: "ε in Grad (1 Nachkommastelle)", kind: "number", answer: r1(eps), tol: 0.06 },
          { label: "φ in Grad (1 Nachkommastelle)", kind: "number", answer: r1(phi), tol: 0.06 }
        ], [
          { label: "Seitenhöhe: rechtwinkliges Dreieck aus h, a/2 und hₛ (Pythagoras)" },
          { left: `h_s = \\sqrt{${fmtNum(h)}^{2} + ${fmtNum(a / 2)}^{2}} \\approx ${fmtNum(r2(hs))}`, right: "" },
          { label: "Oberfläche = Grundfläche + 4 Dreiecke" },
          { left: `O = ${fmtNum(a)}^{2} + 4\\cdot \\dfrac{1}{2}\\cdot ${fmtNum(a)}\\cdot ${fmtNum(r2(hs))} \\approx ${fmt1(O)}`, right: "" },
          { label: "Neigungswinkel der Seitenfläche: im selben Dreieck, gegenüber von h liegt ε, anliegend a/2" },
          { left: `\\tan(\\varepsilon) = \\dfrac{${fmtNum(h)}}{${fmtNum(a / 2)}} \\;\\Rightarrow\\; \\varepsilon \\approx ${fmt1(eps)}°`, right: "" },
          { label: "Neigungswinkel der Seitenkante: anliegend ist die halbe Diagonale d/2 = a·√2 : 2" },
          { left: `\\dfrac{d}{2} = \\dfrac{${fmtNum(a)}\\cdot \\sqrt{2}}{2} \\approx ${fmtNum(r2(a * Math.SQRT2 / 2))} \\;\\Rightarrow\\; \\tan(\\varphi) = \\dfrac{${fmtNum(h)}}{${fmtNum(r2(a * Math.SQRT2 / 2))}} \\;\\Rightarrow\\; \\varphi \\approx ${fmt1(phi)}°`, right: "" }
        ], { graph: pyramideSVG({ a: `a = ${fmtNum(a)}`, h: `h = ${fmtNum(h)}`, hs: "h_s" }), dataExtra: { a, h, hs, O, eps, phi } });
    }
    if (sub === "trapez") {
      for (;;) {
        const a = choice([6, 7, 7.4, 8, 9, 10, 12]), d = choice([3, 3.6, 4, 4.5, 5, 6]), al = randInt(50, 75), be = randInt(40, 70);
        const h = d * Math.sin(al * RAD), b = h / Math.sin(be * RAD), c = a - d * Math.cos(al * RAD) - b * Math.cos(be * RAD);
        if (c < 1.5) continue;
        return textTask("trigonometrie", 9, sub,
          T(`Im Trapez ABCD (AB parallel zu CD) sind gegeben: a = AB = ${fmtNum(a)} cm, d = AD = ${fmtNum(d)} cm, α = ${al}° und β = ${be}°.`),
          T("Berechne die Höhe h, die Seite b = BC und die Seite c = CD."), [
            { label: "h in cm (1 Nachkommastelle)", kind: "number", answer: r1(h), tol: 0.06 },
            { label: "b in cm (1 Nachkommastelle)", kind: "number", answer: r1(b), tol: 0.06 + 0.05 / Math.sin(be * RAD) },
            { label: "c in cm (1 Nachkommastelle)", kind: "number", answer: r1(c), tol: 0.2 }
          ], [
            { label: "Höhe von D aus fällen: rechtwinkliges Dreieck mit Hypotenuse d" },
            { left: `h = ${fmtNum(d)}\\cdot \\sin(${al}°) \\approx ${fmtNum(r2(h))}`, right: "" },
            { label: "Rechtwinkliges Dreieck bei B: h liegt β gegenüber, b ist Hypotenuse" },
            { left: `b = \\dfrac{h}{\\sin(${be}°)} \\approx ${fmtNum(r2(b))}`, right: "" },
            { label: "c = a minus die beiden Randstücke unter den schrägen Seiten" },
            { left: `c = ${fmtNum(a)} - ${fmtNum(d)}\\cdot \\cos(${al}°) - b\\cdot \\cos(${be}°) \\approx ${fmtNum(a)} - ${fmtNum(r2(d * Math.cos(al * RAD)))} - ${fmtNum(r2(b * Math.cos(be * RAD)))} \\approx ${fmt1(c)}`, right: "" }
          ], { graph: trapezSVG(a, d, al, be, { a: `${fmtNum(a)} cm`, d: `${fmtNum(d)} cm`, b: "b = ?", c: "c = ?", h: "h" }), dataExtra: { a, d, al, be, h, b, c } });
      }
    }
    if (sub === "gleichschenklig") {
      const c = choice([6, 8, 9, 10, 12, 40, 60, 80]), be = randInt(35, 70), ein = c >= 40 ? "cm" : "cm";
      const s = (c / 2) / Math.cos(be * RAD), h = (c / 2) * Math.tan(be * RAD), A = (c * h) / 2;
      return textTask("trigonometrie", 9, sub,
        T(`Ein gleichschenkliges Dreieck ABC hat die Basis c = AB = ${c} ${ein} und die Basiswinkel α = β = ${be}°.`),
        T("Berechne die Schenkellänge a = b, die Höhe h_c und den Flächeninhalt."), [
          { label: `a in ${ein} (1 Nachkommastelle)`, kind: "number", answer: r1(s), tol: 0.06 },
          { label: `Höhe zur Basis in ${ein} (1 Nachkommastelle)`, kind: "number", answer: r1(h), tol: 0.06 },
          { label: `Fläche in ${ein}² (1 Nachkommastelle)`, kind: "number", answer: r1(A), tol: 0.06 + c * 0.025 }
        ], [
          { label: "Die Höhe zur Basis halbiert die Basis: rechtwinkliges Dreieck mit c/2 als Ankathete von β" },
          { left: `\\cos(${be}°) = \\dfrac{${fmtNum(c / 2)}}{a} \\;\\Rightarrow\\; a = \\dfrac{${fmtNum(c / 2)}}{\\cos(${be}°)} \\approx ${fmtNum(r2(s))}`, right: "" },
          { label: "Höhe als Gegenkathete von β" },
          { left: `h_c = ${fmtNum(c / 2)}\\cdot \\tan(${be}°) \\approx ${fmtNum(r2(h))}`, right: "" },
          { label: "Fläche = Grundseite · Höhe : 2" },
          { left: `A = \\dfrac{${c}\\cdot ${fmtNum(r2(h))}}{2} \\approx ${fmt1(A)}`, right: "" }
        ], { graph: gleichschenkligSVG(c, be, { c: `${c} ${ein}`, a: "a = ?", h: "h_c" }), dataExtra: { c, be, s, h, A } });
    }
    // exakt: aus tan(α) = p/q ohne Taschenrechner sin(α) und cos(α) bestimmen
    let [p, q, r] = choice(TRIPEL_PRIM); if (Math.random() < 0.5) [p, q] = [q, p];
    return textTask("trigonometrie", 9, sub,
      `${T("In einem rechtwinkligen Dreieck gilt für den spitzen Winkel α:")}\\;\\; \\tan(\\alpha) = \\dfrac{${p}}{${q}}`,
      T("Bestimme sin(α) und cos(α) exakt als Bruch – ohne Taschenrechner."), [
        { label: "sin(α)", kind: "fraction", answer: { num: p, den: r } },
        { label: "cos(α)", kind: "fraction", answer: { num: q, den: r } }
      ], [
        { label: `tan(α) = Gegenkathete : Ankathete – wähle ein passendes Dreieck mit Gegenkathete ${p} und Ankathete ${q}` },
        { left: `${T("Hypotenuse")} = \\sqrt{${p}^{2} + ${q}^{2}} = \\sqrt{${p * p + q * q}} = ${r}`, right: "" },
        { label: "Sinus und Kosinus mit dieser Hypotenuse" },
        { left: `\\sin(\\alpha) = \\dfrac{${p}}{${r}} \\qquad \\cos(\\alpha) = \\dfrac{${q}}{${r}}`, right: "" }
      ], { dataExtra: { p, q, r }, noCalculator: true });
  }

  TOPICS.trigonometrie = {
      name: "Trigonometrie",
      grade: "Kl. 9–10",
      levels: [
        { id: 1, name: "Seiten benennen", grade: "Kl. 9", generate: gen_trig_1, check: check_trig_1, steps: steps_trig_1 },
        { id: 2, name: "sin, cos, tan als Verhältnis", grade: "Kl. 9", generate: gen_trig_2, check: check_trig_2, steps: steps_trig_2 },
        { id: 3, name: "Seite berechnen", grade: "Kl. 9–10", calculatorHint: "Taschenrechner im Grad-Modus (DEG)", generate: gen_trig_3, check: check_trig_3, steps: steps_trig_3 },
        { id: 4, name: "Winkel berechnen", grade: "Kl. 9–10", calculatorHint: "Taschenrechner im Grad-Modus (DEG)", generate: gen_trig_4, check: check_trig_4, steps: steps_trig_4 },
        { id: 5, name: "Textaufgaben", grade: "Kl. 9–10", calculatorHint: "Taschenrechner im Grad-Modus (DEG)", generate: gen_trig_5, check: check_textaufgabe, steps: steps_textaufgabe },
        { id: 9, name: "Mehrschrittige Aufgaben", grade: "Kl. 10", calculatorHint: "Taschenrechner im Grad-Modus (DEG); Zwischenergebnisse ungerundet weiterverwenden", generate: gen_trig_9, check: check_textaufgabe, steps: steps_textaufgabe },
        { id: 6, name: "Sinussatz", grade: "Kl. 10", calculatorHint: "Taschenrechner im Grad-Modus (DEG)", generate: gen_trig_6, check: check_trig_6, steps: steps_trig_6 },
        { id: 7, name: "Kosinussatz", grade: "Kl. 10", calculatorHint: "Taschenrechner im Grad-Modus (DEG)", generate: gen_trig_7, check: check_trig_7, steps: steps_trig_7 },
        { id: 8, name: "Allgemeine Dreiecke im Alltag", grade: "Kl. 10", calculatorHint: "Taschenrechner im Grad-Modus (DEG)", generate: gen_trig_8, check: check_textaufgabe, steps: steps_textaufgabe }
      ]
  };
  // --- Erklärungen: Trigonometrie ---
  Object.assign(ERKL, {
    "trigonometrie/1": E("Seiten im rechtwinkligen Dreieck",
      [T("Hypotenuse: die längste Seite, liegt dem rechten Winkel gegenüber."), T("Gegenkathete eines Winkels: die Seite, die ihm gegenüberliegt."), T("Ankathete eines Winkels: die Kathete, die an ihm anliegt.")],
      [{ left: T("Für α: Gegenkathete a, Ankathete b, Hypotenuse c. Für β ist es umgekehrt: Gegenkathete b, Ankathete a."), right: "" }],
      [T("Die Hypotenuse als Ankathete nehmen – sie liegt zwar am Winkel an, ist aber keine Kathete."), T("Gegen- und Ankathete hängen vom Winkel ab: Für β tauschen sie die Rollen.")], "dreieck"),
    "trigonometrie/2": E("Sinus, Kosinus, Tangens",
      [`\\sin(\\alpha) = \\dfrac{${T("Gegenkathete")}}{${T("Hypotenuse")}}`, `\\cos(\\alpha) = \\dfrac{${T("Ankathete")}}{${T("Hypotenuse")}}`, `\\tan(\\alpha) = \\dfrac{${T("Gegenkathete")}}{${T("Ankathete")}}`, T("Merksatz: GAGA HummelHummel AG – Gegen/Hypo, An/Hypo, Gegen/An.")],
      [{ left: `a = 3,\\; b = 4,\\; c = 5:\\;\\; \\sin(\\alpha) = \\dfrac{3}{5},\\; \\cos(\\alpha) = \\dfrac{4}{5},\\; \\tan(\\alpha) = \\dfrac{3}{4}`, right: "" }],
      [T("Sinus und Kosinus vertauschen."), T("sin oder cos größer als 1 erhalten: Dann steht die Hypotenuse fälschlich im Zähler.")], "t2"),
    "trigonometrie/3": E("Seite berechnen",
      [T("1. Welche Seite ist gegeben, welche gesucht – bezogen auf den Winkel?"), T("2. Die Funktion wählen, in der genau diese beiden Seiten vorkommen."), T("3. Gleichung aufstellen und nach der gesuchten Seite auflösen.")],
      [{ left: `\\alpha = 35°,\\; c = 8:\\;\\; a = 8\\cdot \\sin(35°) \\approx 4,59`, right: "" }, { left: `\\alpha = 35°,\\; a = 4:\\;\\; c = \\dfrac{4}{\\sin(35°)} \\approx 6,97`, right: "" }],
      [T("Taschenrechner im RAD-Modus: sin(35) ist dann ein ganz anderer Wert. Immer DEG (Grad) einstellen!"), T("Beim Auflösen multiplizieren statt teilen (Hypotenuse gesucht ⇒ teilen).")]),
    "trigonometrie/4": E("Winkel berechnen",
      [T("Verhältnis der beiden gegebenen Seiten bilden, dann die Umkehrfunktion anwenden:"), `\\alpha = \\sin^{-1}\\left(\\dfrac{${T("Gegenkathete")}}{${T("Hypotenuse")}}\\right)\\;\\;${T("(analog cos⁻¹, tan⁻¹)")}`],
      [{ left: `\\tan(\\alpha) = \\dfrac{5}{8} \\;\\Rightarrow\\; \\alpha = \\tan^{-1}(0,625) \\approx 32,0°`, right: "" }],
      [T("Das Verhältnis selbst als Winkel angeben (0,625 ist kein Winkel)."), T("Den anderen spitzen Winkel berechnen: α und β ergeben zusammen 90°.")]),
    "trigonometrie/5": E("Trigonometrie im Alltag",
      [T("Erst eine Skizze machen und den rechten Winkel finden (Wand und Boden, Turm und Boden …)."), T("Leiter, Schnur, gefahrene Strecke: Hypotenuse. Steigung in % = tan(α) · 100."), T("Am Ende prüfen: Was ist gefragt – Winkel, Höhe, Strecke? Gibt es eine Zusatzhöhe (z. B. Hand)?")],
      [{ left: T("12 % Steigung: tan(α) = 0,12 ⇒ α ≈ 6,8° – also nicht 12°!"), right: "" }],
      [T("Steigung in % und Winkel in Grad gleichsetzen."), T("Bei Leiter/Wand den Winkel an der Wand statt am Boden berechnen.")])
  });
  const erklGrafikT = erklGrafik;
  erklGrafik = function (art) {
    if (art === "dreieck") return dreieckSVG({ a: 3, b: 4, seiten: { a: "Gegenkathete", b: "Ankathete", c: "Hypotenuse" }, winkel: "α", rot: 0, spiegel: false });
    return erklGrafikT(art);
  };

  Object.assign(ERKL, {
    "trigonometrie/9": E("Mehrschrittige Aufgaben",
      [T("1. Skizze machen und alle rechtwinkligen Teildreiecke markieren (Höhe einzeichnen!)."),
       T("2. Mit dem Teildreieck beginnen, in dem schon zwei Stücke bekannt sind."),
       T("3. Das Ergebnis ist ein Stück im nächsten Teildreieck – so Schritt für Schritt weiter."),
       T("4. Zwischenergebnisse ungerundet im Taschenrechner weiterverwenden, erst am Ende runden."),
       T("Zwei Standpunkte: Beide Dreiecke haben dieselbe Höhe h – zwei Gleichungen aufstellen und gleichsetzen.")],
      [{ left: T("Höhenwinkel 30° und nach 50 m 45°:"), right: "" },
       { left: `\\tan(45°) = \\dfrac{h}{x},\\;\\; \\tan(30°) = \\dfrac{h}{x + 50} \\;\\Rightarrow\\; x = \\dfrac{50\\cdot \\tan(30°)}{\\tan(45°) - \\tan(30°)} \\approx 68,3`, right: "" },
       { left: `h = x\\cdot \\tan(45°) \\approx 68,3\\text{ m}`, right: "" }],
      [T("Die 50 m als Entfernung zum Turm nehmen – sie ist nur der Abstand der beiden Standpunkte."),
       T("Bei der Pyramide Neigungswinkel der Seitenfläche (an der Kantenmitte, a/2) und der Seitenkante (an der Ecke, halbe Diagonale) verwechseln."),
       T("Mit gerundeten Zwischenergebnissen weiterrechnen – das Endergebnis weicht dann ab.")], "t9")
  });
  const erklGrafikT9 = erklGrafik;
  erklGrafik = function (art) {
    if (art === "t9") { const t1 = Math.tan(30 * RAD), h = (50 * t1 * 1) / (1 - t1); return turmSVG(50, 30, 45, h, { d: "50 m", h: "h ≈ 68,3 m", x: "x ≈ 68,3 m" }); }
    return erklGrafikT9(art);
  };
  H.standpunktAbstand = "Die gegebene Strecke ist nur der Abstand der beiden Standpunkte, nicht die Entfernung zum Fuß – stelle zwei Gleichungen mit derselben Höhe auf.";
  H.epsPhi = "Seitenfläche und Seitenkante verwechselt? Seitenfläche: an der Kantenmitte (a/2); Seitenkante: an der Ecke (halbe Diagonale).";
  H.ungerundet = "Fast – rechne mit den ungerundeten Zwischenergebnissen weiter.";
  H.sinCosExakt = "Sinus und Kosinus vertauscht? Sinus = Gegenkathete : Hypotenuse.";
  DIAG["trigonometrie/9"] = (t, i, w) => {
    if (!w) return null; const d = t.dataExtra, s = t.subtype;
    if (s === "turm" && i === 0 && (nah(w.v, d.d * Math.tan(d.a1 * RAD), 0.02) || nah(w.v, d.d * Math.tan(d.a2 * RAD), 0.02))) return H.standpunktAbstand;
    if (s === "pyramide" && ((i === 2 && nah(w.v, d.phi, 0.005)) || (i === 3 && nah(w.v, d.eps, 0.005)))) return H.epsPhi;
    if (s === "exakt" && ((i === 0 && nah(w.v, d.q / d.r)) || (i === 1 && nah(w.v, d.p / d.r)))) return H.sinCosExakt;
    if (s !== "exakt" && nah(w.v, t.answer[i], 0.03)) return H.ungerundet;
    return null;
  };

  // --- Fehlerdiagnose: Trigonometrie ---
  H.radModus = "Prüfe den Taschenrechner: Er steht wohl auf RAD – stelle auf DEG (Grad) um.";
  H.sinCos = "Sinus und Kosinus (bzw. Tangens) verwechselt? Prüfe, welche Seite Gegen- und welche Ankathete ist.";
  H.andererWinkel = "Das ist der andere spitze Winkel. Gegen- und Ankathete beziehen sich auf α.";
  H.umkehr = "Das ist das Seitenverhältnis – der Winkel ergibt sich erst mit der Umkehrfunktion (sin⁻¹, cos⁻¹, tan⁻¹).";
  H.mulDiv = "Multiplizieren und Teilen verwechselt? Ist die Hypotenuse gesucht, wird geteilt.";
  H.ankathete = "Gegen- und Ankathete vertauscht? Die Gegenkathete berührt den Winkel nicht.";
  H.prozentGrad = "Steigung in % ist nicht der Winkel in Grad: α = tan⁻¹(Prozent : 100).";
  H.handhoehe = "Fast – hast du die Höhe der Hand dazugerechnet?";
  Object.assign(DIAG, {
    "trigonometrie/1": (t, i, w, raw) => (i > 0 && raw !== "c" && raw === t.answer[3 - i] ? H.ankathete : null),
    "trigonometrie/2": (t, i, w) => {
      const { G, A, c } = t.data;
      const alt = [[A / c, G / A, A / G], [G / c, G / A, A / G], [A / G, G / c, A / c]][i];
      if (alt.some((x) => nah(w.v, x))) return H.sinCos;
      return null;
    },
    "trigonometrie/3": (t, i, w) => {
      const { al, gg, gs, fn, x } = t.data;
      const f = SEITEN_FAELLE.find((F) => F[0] === gg && F[1] === gs)[3];
      if (nah(w.v, f(al, x), 0.005)) return H.radModus; // Grad als Bogenmaß eingesetzt
      const tausch = { sin: (v) => Math.cos(v), cos: (v) => Math.sin(v), tan: (v) => 1 / Math.tan(v) }[fn];
      const istMal = gg === "c" || (fn === "tan" && gs === "a");
      const alt = gs === "c" ? x / tausch(al * RAD) : istMal ? x * tausch(al * RAD) : x / tausch(al * RAD);
      if (nah(w.v, alt, 0.005)) return H.sinCos;
      const umgekehrt = gs === "c" || !istMal ? x * Math[fn](al * RAD) : x / Math[fn](al * RAD);
      if (nah(w.v, umgekehrt, 0.005)) return H.mulDiv;
      return null;
    },
    "trigonometrie/4": (t, i, w) => {
      const al = t.data.al, r = t.data.fall === "sin" ? t.data.a / t.data.c : t.data.fall === "cos" ? t.data.b / t.data.c : t.data.a / t.data.b;
      if (Math.abs(w.v - r) < 0.002) return H.umkehr;      // genau das Verhältnis zuerst (sin x ≈ x bei kleinen x; tan 82,4° ≈ 7,5 ≈ 90° − 82,4°)
      if (Math.abs(w.v - (90 - al)) < 0.11) return H.andererWinkel;
      if (Math.abs(w.v - al * RAD) < 0.011) return H.radModus;
      if (Math.abs(w.v - r) < 0.011) return H.umkehr;
      return null;
    },
    "trigonometrie/5": (t, i, w) => {
      const d = t.dataExtra, s = t.subtype;
      if (s === "steigung" && i === 0 && nah(w.v, d.p, 0.001)) return H.prozentGrad;
      if (s === "leiter" && i === 0 && Math.abs(w.v - (90 - t.answer[0])) < 0.11) return H.andererWinkel;
      if (s === "drachen" && Math.abs(w.v - (t.answer[0] - 1.5)) < 0.11) return H.handhoehe;
      if (["turm", "drachen"].includes(s) && Math.abs(w.v) < 1000) {
        const radW = { turm: d.s * Math.tan(d.w), drachen: d.L * Math.sin(d.w) + 1.5 }[s];
        if (Math.abs(w.v - radW) < 0.11) return H.radModus;
      }
      return null;
    }
  });

  // --- Klassenarbeit: Trigonometrie ---
  KA_VORLAGEN.trigonometrie = [
    { key: "grundlagen", gebiet: "rechtwinklig", teil: "A", afb: 1, titel: "Seiten und Verhältnisse", baue: () => ({ kontext: "", teile: [stufenTeil("trigonometrie", 1), stufenTeil("trigonometrie", 2)] }) },
    { key: "pythagoras", gebiet: "rechtwinklig", teil: "A", afb: 2, titel: "Pythagoras und Trigonometrie", baue: () => {
      let [x, y, h] = choice(TRIPEL); if (Math.random() < 0.5) [x, y] = [y, x];
      const fehlt = choice(["a", "b", "c"]), a = x, b = y, c = h;
      const seiten = { a: `${a} cm`, b: `${b} cm`, c: `${c} cm` }; seiten[fehlt] = "?";
      const wert = { a, b, c }[fehlt], fr = (n, d) => { const g = gcd(n, d); return { num: n / g, den: d / g }; };
      return { kontext: T("Im rechtwinkligen Dreieck (rechter Winkel bei C) sind zwei Seiten gegeben."),
        graph: dreieckSVG(Object.assign({ a, b, seiten, winkel: "α" }, lage())), teile: [
        autoTeil(T("Berechne die fehlende Seite mit dem Satz des Pythagoras."), [{ label: `${fehlt} in cm`, kind: "number", answer: wert, punkte: 2 }],
          [{ left: fehlt === "c" ? `c = \\sqrt{${a}^{2} + ${b}^{2}} = \\sqrt{${a * a + b * b}} = ${c}` : `${fehlt} = \\sqrt{${c}^{2} - ${fehlt === "a" ? b : a}^{2}} = \\sqrt{${c * c - (fehlt === "a" ? b * b : a * a)}} = ${wert}`, right: "" }]),
        autoTeil(T("Gib sin(α) und tan(α) als vollständig gekürzten Bruch an."), [
          { label: "sin(α)", kind: "fraction", answer: fr(a, c) }, { label: "tan(α)", kind: "fraction", answer: fr(a, b) }],
          [{ left: `\\sin(\\alpha) = \\dfrac{${a}}{${c}} = ${bruchTex(a, c)}\\,,\\quad \\tan(\\alpha) = \\dfrac{${a}}{${b}} = ${bruchTex(a, b)}`, right: "" }])
      ] };
    } },
    { key: "aussagen", gebiet: "rechtwinklig", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => {
      const pool = [
        () => aussageTeil(T("Lea behauptet: „Der Sinus eines Winkels im rechtwinkligen Dreieck kann größer als 1 sein.“"), false, ["Die Hypotenuse ist die längste Seite, also ist Gegenkathete : Hypotenuse immer kleiner als 1.", "Stimmt, bei großen Dreiecken.", "Stimmt, wenn der Winkel größer als 45° ist."]),
        () => aussageTeil(T("Tim behauptet: „Wird α größer (zwischen 0° und 90°), wird auch sin(α) größer.“"), true, ["Die Gegenkathete wird im Verhältnis zur Hypotenuse immer länger.", "Weil sin und α immer gleich groß sind.", "Stimmt nur bis 45°."]),
        () => aussageTeil(T("Ole behauptet: „In jedem rechtwinkligen Dreieck gilt sin(α) = cos(β).“"), true, ["Die Gegenkathete von α ist die Ankathete von β.", "Weil α und β immer gleich groß sind.", "Stimmt nur im gleichschenkligen Dreieck."]),
        () => aussageTeil(T("Mia behauptet: „Eine Straße mit 100 % Steigung ist senkrecht.“"), false, ["100 % heißt tan(α) = 1, also α = 45°.", "Stimmt, 100 % ist das Maximum.", "Stimmt, weil 100 % = 90° sind."])
      ];
      return { kontext: "", teile: mische(pool).slice(0, 3).map((f) => f()) };
    } },
    { key: "berechnen", gebiet: "rechtwinklig", teil: "B", afb: 2, titel: "Seiten und Winkel berechnen", baue: () => ({ kontext: "", teile: [stufenTeil("trigonometrie", 3), stufenTeil("trigonometrie", 4)] }) },
    { key: "fehler", gebiet: "rechtwinklig", teil: "B", afb: 3, titel: "Fehler finden", baue: () => {
      const L = choice([4, 5, 6, 8]), w = randInt(55, 75), h = round2(L * Math.sin(w * RAD)), falsch = round2(L * Math.cos(w * RAD));
      return { kontext: T(`Eine ${L} m lange Leiter lehnt an einer Wand und bildet mit dem Boden einen Winkel von ${w}°.`), teile: [
        fehlerTeil(`${T("Ben berechnet die Höhe, in der die Leiter die Wand berührt:")}\\;\\; h = ${L}\\cdot \\cos(${w}°) \\approx ${fmtNum(falsch)}\\text{ m}`,
          ["Die Höhe ist die Gegenkathete des Bodenwinkels – er hätte den Sinus nehmen müssen.", "Er hätte durch cos teilen müssen.", "Die Rechnung ist richtig."],
          { label: "richtige Höhe in m (2 Nachkommastellen)", kind: "number", answer: h, tol: 0.011 },
          [{ left: `h = ${L}\\cdot \\sin(${w}°) \\approx ${fmtNum(h)}`, right: "" }]),
        papierTeil(T("✏️ Fertige eine beschriftete Skizze an: Leiter, Wand, Boden, rechter Winkel und gegebener Winkel."), [
          { text: "rechter Winkel zwischen Wand und Boden", punkte: 1 }, { text: `Leiter als Hypotenuse mit ${L} m beschriftet`, punkte: 1 }, { text: `Winkel ${w}° am Boden eingezeichnet`, punkte: 1 }],
          [{ label: "Musterskizze" }], dreieckSVG({ a: Math.sin(w * RAD), b: Math.cos(w * RAD), seiten: { a: "Wand: h = ?", b: "Boden", c: `Leiter ${L} m` }, winkel: "α", winkelText: `${w}°`, rot: 0, spiegel: true, ecken: false }))
      ] };
    } },
    { key: "mehrschritt", gebiet: "rechtwinklig", teil: "B", afb: 3, titel: "Zusammengesetzte Figuren", baue: () => {
      const t = stufenTeil("trigonometrie", 9, (x) => x.subtype !== "exakt");
      return { kontext: "", graph: t.task.graph, teile: [t] };
    } },
    { key: "exakt", gebiet: "rechtwinklig", teil: "A", afb: 2, titel: "Exakte Werte ohne Taschenrechner", baue: () => ({ kontext: "", teile: [stufenTeil("trigonometrie", 9, (x) => x.subtype === "exakt")] }) },
    { key: "alltag", gebiet: "rechtwinklig", teil: "B", afb: 2, titel: "Trigonometrie im Alltag", baue: () => {
      const a = stufenTeil("trigonometrie", 5); let b; do { b = stufenTeil("trigonometrie", 5); } while (b.task.subtype === a.task.subtype);
      return { kontext: "", teile: [a, b] };
    } }
  ];
  KA_INFO.trigonometrie = { klasse: "Kl. 9/10", tr: true };

  // --- Sinus- und Kosinussatz: Erklärungen, Diagnose, Klassenarbeit ---
  Object.assign(ERKL, {
    "trigonometrie/6": E("Sinussatz",
      [`\\dfrac{a}{\\sin(\\alpha)} = \\dfrac{b}{\\sin(\\beta)} = \\dfrac{c}{\\sin(\\gamma)}`, T("Jede Seite gehört zu dem Winkel, der ihr GEGENÜBER liegt."), T("Gebraucht, wenn eine Seite mit ihrem Gegenwinkel bekannt ist. Fehlender Winkel: α + β + γ = 180°.")],
      [{ left: `a = 10,\\; \\alpha = 50°,\\; \\beta = 70°:\\;\\; b = \\dfrac{10\\cdot \\sin(70°)}{\\sin(50°)} \\approx 12,27`, right: "" }],
      [T("Seite und Winkel falsch zuordnen (die anliegende statt der gegenüberliegenden Seite)."), T("Bruch verkehrt herum auflösen (sin α durch sin β statt umgekehrt)."), T("Taschenrechner im RAD-Modus.")], "t6"),
    "trigonometrie/7": E("Kosinussatz",
      [`a^{2} = b^{2} + c^{2} - 2bc\\cdot \\cos(\\alpha)`, T("Gebraucht bei zwei Seiten und dem eingeschlossenen Winkel (SWS) oder bei drei Seiten (SSS)."), `\\cos(\\gamma) = \\dfrac{a^{2} + b^{2} - c^{2}}{2ab}`, T("Bei γ = 90° wird daraus der Satz des Pythagoras.")],
      [{ left: `b = 5,\\; c = 7,\\; \\alpha = 60°:\\;\\; a = \\sqrt{25 + 49 - 70\\cdot 0,5} = \\sqrt{39} \\approx 6,24`, right: "" }],
      [T("Plus statt Minus vor 2bc · cos(α)."), T("Am Ende die Wurzel vergessen (a² statt a)."), T("Beim Winkel die Seite gegenüber dem gesuchten Winkel falsch einsetzen.")], "t7"),
    "trigonometrie/8": E("Allgemeine Dreiecke im Alltag",
      [T("Skizze machen, Dreieck beschriften (Seite a gegenüber A …)."), T("Seite + Gegenwinkel bekannt ⇒ Sinussatz. Zwei Seiten + eingeschlossener Winkel oder drei Seiten ⇒ Kosinussatz."), `${T("Fläche aus zwei Seiten und eingeschlossenem Winkel: ")}A = \\dfrac{1}{2}\\, bc\\cdot \\sin(\\alpha)`],
      [{ left: T("Fluss: Abstand AB und beide Winkel am Ufer ⇒ dritter Winkel ⇒ Sinussatz ⇒ Höhe mit dem Sinus"), right: "" }],
      [T("Bei der Flussbreite die schräge Entfernung angeben statt des senkrechten Abstands.")])
  });
  const erklGrafikA = erklGrafik;
  erklGrafik = function (art) {
    if (art === "allgemein") return dreieckAllgSVG({ a: 6, b: 5, c: 7, seiten: { a: "a", b: "b", c: "c" }, winkel: { α: "α", β: "β", γ: "γ" } });
    return erklGrafikA(art);
  };
  H.kosinusPlus = "Im Kosinussatz steht MINUS 2bc · cos(α).";
  H.wurzel = "Fast – das ist a². Zum Schluss noch die Wurzel ziehen.";
  H.sinussatzKehr = "Sinussatz verkehrt aufgelöst? Jede Seite steht über dem Sinus ihres Gegenwinkels.";
  H.flussSchraeg = "Das ist die schräge Entfernung zum Baum – die Flussbreite ist der senkrechte Abstand.";
  Object.assign(DIAG, {
    "trigonometrie/6": (t, i, w) => {
      const d = t.data;
      if (t.subtype === "seite") {
        const h = naechsterHinweis(w.v, [[(d.a * Math.sin(d.wz)) / Math.sin(d.al), H.radModus], [(d.a * Math.sin(d.al * RAD)) / Math.sin(d.wz * RAD), H.sinussatzKehr]], 0.005);
        if (h) return h;
      } else {
        const r = (d.b * Math.sin(d.al * RAD)) / d.a;
        if (Math.abs(w.v - r) < 0.002) return H.umkehr;
        if (Math.abs(w.v - Math.asin(r)) < 0.011) return H.radModus;
      }
      return null;
    },
    "trigonometrie/7": (t, i, w) => {
      const d = t.data;
      if (t.subtype === "seite") {
        const q = d.b * d.b + d.c * d.c - 2 * d.b * d.c * Math.cos(d.al * RAD);
        return naechsterHinweis(w.v, [
          [Math.sqrt(d.b * d.b + d.c * d.c + 2 * d.b * d.c * Math.cos(d.al * RAD)), H.kosinusPlus],
          [q, H.wurzel],
          [Math.sqrt(Math.max(0, d.b * d.b + d.c * d.c - 2 * d.b * d.c * Math.cos(d.al))), H.radModus]], 0.005);
      } else {
        const cg = (d.a * d.a + d.b * d.b - d.c * d.c) / (2 * d.a * d.b);
        if (Math.abs(w.v - cg) < 0.002) return H.umkehr;
        if (Math.abs(w.v - Math.acos(cg)) < 0.011) return H.radModus;
      }
      return null;
    },
    "trigonometrie/8": (t, i, w) => {
      if (t.subtype === "fluss" && i === 1 && Math.abs(w.v - t.answer[0]) < 0.11) return H.flussSchraeg;
      return null;
    }
  });
  KA_TEILGEBIETE.trigonometrie = [["rechtwinklig", "Rechtwinklige Dreiecke"], ["allgemein", "Allgemeine Dreiecke (Sinus- und Kosinussatz)"]];
  // Welcher Satz passt? (ohne Taschenrechner) – aus der Art der gegebenen Stücke entscheiden
  const SATZ_FAELLE = [
    ["zwei Seiten und den eingeschlossenen Winkel (SWS)", "Kosinussatz", "Für den Sinussatz fehlt ein Paar aus Seite und Gegenwinkel; SWS führt mit dem Kosinussatz direkt zur dritten Seite."],
    ["alle drei Seiten (SSS)", "Kosinussatz", "Ohne Winkel gibt es kein Paar aus Seite und Gegenwinkel; der Kosinussatz liefert den ersten Winkel."],
    ["eine Seite und zwei Winkel (WSW)", "Sinussatz", "Den dritten Winkel liefert die Winkelsumme; dann gibt es Paare aus Seite und Gegenwinkel."],
    ["zwei Seiten und den Gegenwinkel der größeren Seite (SsW)", "Sinussatz", "Seite und Gegenwinkel bilden ein Paar; damit liefert der Sinussatz den zweiten Winkel."]
  ];
  KA_VORLAGEN.trigonometrie.push(
    { key: "allg_satzwahl", gebiet: "allgemein", teil: "A", afb: 2, titel: "Welcher Satz passt?", baue: () => ({ kontext: T("Entscheide jeweils, ob man zuerst den Sinussatz oder den Kosinussatz braucht."), teile: mische(SATZ_FAELLE).slice(0, 3).map(([geg, satz, grund]) =>
      autoTeil(T(`Gegeben sind ${geg}.`), [{ label: "zuerst verwenden", kind: "choice", choices: ["Sinussatz", "Kosinussatz"], answer: satz }], [{ left: T(`${satz}: ${grund}`), right: "" }])) }) },
    { key: "allg_aussagen", gebiet: "allgemein", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => {
      const pool = [
        () => aussageTeil(T("Noah behauptet: „Der Kosinussatz mit γ = 90° ist der Satz des Pythagoras.“"), true, ["cos(90°) = 0, also fällt der Term −2ab · cos(γ) weg: c² = a² + b².", "Stimmt nur, wenn a = b ist.", "Stimmt, weil der Kosinus immer 1 ist."]),
        () => aussageTeil(T("Lina behauptet: „Wenn man nur die drei Seiten kennt, rechnet man die Winkel mit dem Sinussatz aus.“"), false, ["Für den Sinussatz braucht man ein Paar aus Seite und Gegenwinkel – bei drei Seiten nimmt man den Kosinussatz.", "Stimmt, der Sinussatz gilt immer.", "Stimmt nur im rechtwinkligen Dreieck."]),
        () => aussageTeil(T("Tim behauptet: „Im allgemeinen Dreieck liegt der größten Seite auch der größte Winkel gegenüber.“"), true, ["Nach dem Sinussatz gehört zur größeren Seite der größere Sinus des Gegenwinkels (und es gibt höchstens einen stumpfen Winkel).", "Stimmt nur im rechtwinkligen Dreieck.", "Stimmt nicht, die Winkel hängen nicht von den Seiten ab."]),
        () => aussageTeil(T("Mia behauptet: „Ein Dreieck kann zwei stumpfe Winkel haben.“"), false, ["Zwei stumpfe Winkel wären zusammen schon mehr als 180° – die Winkelsumme ist aber genau 180°.", "Stimmt, wenn die Seiten lang genug sind.", "Stimmt im gleichschenkligen Dreieck."])
      ];
      return { kontext: "", teile: mische(pool).slice(0, 3).map((f) => f()) };
    } },
    { key: "allg_planfigur", gebiet: "allgemein", teil: "A", afb: 2, titel: "Planfigur und Vorgehen", baue: () => {
      const t = stufenTeil("trigonometrie", 8, (x) => x.subtype === "fluss"), d = t.task.dataExtra;
      const ga = 180 - d.al - d.be, b = (d.c * Math.sin(d.be * RAD)) / Math.sin(ga * RAD);
      const g = dreieckAllgSVG({ a: (d.c * Math.sin(d.al * RAD)) / Math.sin(ga * RAD), b, c: d.c, seiten: { c: `AB = ${d.c} m`, b: "AC = ?" }, winkel: { α: `${d.al}°`, β: `${d.be}°`, γ: "γ" } });
      return { kontext: t.text, teile: [
        papierTeil(T("✏️ Fertige eine beschriftete Planfigur an (A, B, Baum C, gegebene Strecke und Winkel)."), [
          { text: "Dreieck ABC mit Baum als Ecke C", punkte: 1 }, { text: `AB = ${d.c} m und die Winkel ${d.al}° bei A und ${d.be}° bei B eingetragen`, punkte: 1 }], [{ label: "Musterskizze" }], g),
        autoTeil(T("Welcher Winkel lässt sich ohne Taschenrechner sofort angeben, und wie groß ist er?"), [{ label: "Winkel beim Baum in Grad", kind: "number", answer: ga }],
          [{ left: `\\gamma = 180° - ${d.al}° - ${d.be}° = ${ga}°`, right: "" }]),
        autoTeil(T("Mit welchem Satz berechnet man danach die Entfernung AC?"), [{ label: "Satz", kind: "choice", choices: ["Sinussatz", "Kosinussatz"], answer: "Sinussatz" }],
          [{ left: T("Sinussatz: AC liegt β gegenüber, AB liegt γ gegenüber – beide Paare sind bekannt."), right: "" }])
      ] };
    } },
    { key: "allg_sinus", gebiet: "allgemein", teil: "B", afb: 2, titel: "Rechnen mit dem Sinussatz", baue: () => ({ kontext: "", teile: [stufenTeil("trigonometrie", 6, (t) => t.subtype === "seite"), stufenTeil("trigonometrie", 6, (t) => t.subtype === "winkel")] }) },
    { key: "allg_kosinus", gebiet: "allgemein", teil: "B", afb: 2, titel: "Rechnen mit dem Kosinussatz", baue: () => ({ kontext: "", teile: [stufenTeil("trigonometrie", 7, (t) => t.subtype === "seite"), stufenTeil("trigonometrie", 7, (t) => t.subtype === "winkel")] }) },
    { key: "allg_fluss", gebiet: "allgemein", teil: "B", afb: 2, titel: "Wie breit ist der Fluss?", baue: () => ({ kontext: "", teile: [stufenTeil("trigonometrie", 8, (t) => t.subtype === "fluss")] }) },
    { key: "allg_alltag", gebiet: "allgemein", teil: "B", afb: 2, titel: "Dreiecke im Alltag", baue: () => ({ kontext: "", teile: [stufenTeil("trigonometrie", 8, (t) => t.subtype === "grundstueck"), stufenTeil("trigonometrie", 8, (t) => t.subtype === "wanderer")] }) }
  );
  const erklGrafikTr = erklGrafik;
  erklGrafik = function (art) {
    if (art === "t2") return dreieckSVG({ a: 3, b: 4, seiten: { a: "a = 3", b: "b = 4", c: "c = 5" }, winkel: "α", rot: 0, spiegel: false });
    if (art === "t6") { const a = 10, b = (10 * Math.sin(70 * RAD)) / Math.sin(50 * RAD), c = (10 * Math.sin(60 * RAD)) / Math.sin(50 * RAD);
      return dreieckAllgSVG({ a, b, c, seiten: { a: "a = 10", b: "b ≈ 12,27" }, winkel: { α: "50°", β: "70°" } }); }
    if (art === "t7") { const a = Math.sqrt(39); return dreieckAllgSVG({ a, b: 5, c: 7, seiten: { a: "a ≈ 6,24", b: "b = 5", c: "c = 7" }, winkel: { α: "60°" } }); }
    return erklGrafikTr(art);
  };
