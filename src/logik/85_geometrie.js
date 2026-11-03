  // ============================================================
  // GEOMETRIE (Kl. 7–10): Winkel, Flächen, Kreis, Pythagoras, Körper
  // Inhalte und Niveau nach Recherche echter Arbeiten/Lehrwerke (siehe Chat).
  // ============================================================
  const f1g = (x) => x.toFixed(1);
  const svgKopf = (w, h) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" class="graph-svg">`;
  const txt = (x, y, t, o) => `<text x="${f1g(x)}" y="${f1g(y)}" font-size="${(o && o.size) || 13}" ${o && o.fett ? 'font-weight="bold"' : ""} text-anchor="${(o && o.anchor) || "middle"}" fill="${(o && o.farbe) || "#0f172a"}" stroke="white" stroke-width="3" paint-order="stroke">${t}</text>`;
  // Toleranz: akzeptiert auch Rechnungen mit π ≈ 3,14 (relativer Fehler ≈ 0,05 %)
  const tolPi = (x) => Math.max(0.011, Math.abs(x) * 0.0015);

  // ---------- Winkel an zwei geschnittenen Parallelen ----------
  // pos: "OR","OL","UL","UR" (oben/unten, rechts/links) an Kreuzung 0 (obere Gerade) oder 1 (untere)
  const WPOS = { OR: [0, 1], OL: [1, 2], UL: [2, 3], UR: [3, 0] }; // Strahl-Indizes: 0 rechts, 1 Transversale oben, 2 links, 3 Transversale unten
  function winkelSVG(theta, gegeben, gesucht) { // gegeben/gesucht: {k, pos, text, farbe}
    const W = 300, H = 230, y0 = [75, 165], dx = (y0[1] - y0[0]) / Math.tan((theta * Math.PI) / 180);
    const X = [150 - dx / 2, 150 + dx / 2]; // Schnittpunkte (Transversale steigt nach rechts)
    const dir = [0, theta, 180, 180 + theta].map((g) => [Math.cos((g * Math.PI) / 180), -Math.sin((g * Math.PI) / 180)]);
    let s = svgKopf(W, H);
    y0.forEach((y) => { s += `<line x1="10" y1="${y}" x2="${W - 10}" y2="${y}" stroke="#1e3a8a" stroke-width="2"/>`; });
    const L = 140; s += `<line x1="${f1g(X[1] - dir[1][0] * L * 1.6)}" y1="${f1g(y0[1] - dir[1][1] * L * 1.6)}" x2="${f1g(X[0] + dir[1][0] * L)}" y2="${f1g(y0[0] + dir[1][1] * L)}" stroke="#1e3a8a" stroke-width="2"/>`;
    s += txt(W - 14, y0[0] - 6, "g", { anchor: "end", size: 12 }) + txt(W - 14, y0[1] - 6, "h", { anchor: "end", size: 12 }) + `<text x="${W - 60}" y="${H - 6}" font-size="11" fill="#475569">g ∥ h</text>`;
    [gegeben, gesucht].forEach((a, idx) => {
      if (!a) return;
      const P = [X[a.k], y0[a.k]], [i1, i2] = WPOS[a.pos], r = idx ? 30 : 22;
      const p1 = [P[0] + dir[i1][0] * r, P[1] + dir[i1][1] * r], p2 = [P[0] + dir[i2][0] * r, P[1] + dir[i2][1] * r];
      s += `<path d="M ${f1g(p1[0])} ${f1g(p1[1])} A ${r} ${r} 0 0 0 ${f1g(p2[0])} ${f1g(p2[1])}" fill="none" stroke="${a.farbe}" stroke-width="2.5"/>`;
      const m = [dir[i1][0] + dir[i2][0], dir[i1][1] + dir[i2][1]], l = Math.hypot(m[0], m[1]) || 1;
      s += txt(P[0] + (m[0] / l) * (r + 16), P[1] + (m[1] / l) * (r + 16) + 5, a.text, { fett: true, farbe: a.farbe, size: 13 });
    });
    return s + "</svg>";
  }

  // ---------- Vielecke mit Maßen ----------
  function figurSVG(art, m) { // m: Maße (nur für die Beschriftung), Form ist schematisch
    const W = 300, H = 210; let s = svgKopf(W, H), pts;
    const poly = (p, fill) => `<polygon points="${p.map((q) => f1g(q[0]) + "," + f1g(q[1])).join(" ")}" fill="${fill || "#eff6ff"}" stroke="#1e3a8a" stroke-width="2"/>`;
    const hoehe = (x, y1, y2, t) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5 4"/>` + txt(x + 12, (y1 + y2) / 2 + 5, t, { farbe: "#dc2626", anchor: "start" });
    if (art === "rechteck") { pts = [[50, 40], [250, 40], [250, 160], [50, 160]]; s += poly(pts) + txt(150, 180, m.a) + txt(268, 104, m.b, { anchor: "start" }); }
    if (art === "parallelogramm") { pts = [[40, 160], [210, 160], [260, 50], [90, 50]]; s += poly(pts) + txt(125, 180, m.a) + hoehe(90, 50, 160, m.h); }
    if (art === "dreieck") { pts = [[40, 160], [260, 160], [110, 40]]; s += poly(pts) + txt(150, 180, m.g) + hoehe(110, 40, 160, m.h); }
    if (art === "trapez") { pts = [[30, 160], [270, 160], [210, 50], [80, 50]]; s += poly(pts) + txt(150, 180, m.a) + txt(145, 40, m.c) + hoehe(80, 50, 160, m.h); }
    if (art === "drachen") { pts = [[150, 25], [235, 85], [150, 190], [65, 85]]; s += poly(pts) + `<line x1="150" y1="25" x2="150" y2="190" stroke="#dc2626" stroke-dasharray="5 4"/><line x1="65" y1="85" x2="235" y2="85" stroke="#dc2626" stroke-dasharray="5 4"/>` + txt(162, 150, m.e, { farbe: "#dc2626", anchor: "start" }) + txt(205, 78, m.f, { farbe: "#dc2626" }); }
    if (art === "L") { // L-Form: außen a × b, Ausschnitt oben rechts c × d
      pts = [[40, 30], [150, 30], [150, 100], [260, 100], [260, 180], [40, 180]]; s += poly(pts) + txt(150, 198, m.a) + txt(30, 110, m.b, { anchor: "end" }) + txt(95, 22, m.c) + txt(160, 70, m.d, { anchor: "start" });
    }
    if (art === "haus") { pts = [[60, 190], [240, 190], [240, 100], [150, 30], [60, 100]]; s += poly(pts) + `<line x1="60" y1="100" x2="240" y2="100" stroke="#94a3b8" stroke-dasharray="4 4"/>` + txt(150, 206, m.a) + txt(250, 150, m.b, { anchor: "start" }) + hoehe(150, 30, 100, m.h); }
    return s + "</svg>";
  }
  // ---------- Kreis, Kreisring, Kreisausschnitt ----------
  function kreisSVG(art, m) {
    const W = 300, H = 210, cx = 150, cy = 105, R = 85; let s = svgKopf(W, H);
    if (art === "ring") { s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${R * 0.5}" fill="white" stroke="#1e3a8a" stroke-width="2"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="#dc2626" stroke-width="2"/><line x1="${cx}" y1="${cy}" x2="${cx - R * 0.35}" y2="${cy - R * 0.35}" stroke="#16a34a" stroke-width="2"/>` + txt(cx + R * 0.72, cy - 6, m.R, { farbe: "#dc2626" }) + txt(cx - 30, cy - 20, m.r, { farbe: "#16a34a" }); }
    else if (art === "sektor") { const a = (m.alpha * Math.PI) / 180, x2 = cx + R * Math.cos(-a), y2 = cy + R * Math.sin(-a);
      s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#cbd5e1" stroke-dasharray="4 4"/><path d="M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 ${m.alpha > 180 ? 1 : 0} 0 ${f1g(x2)} ${f1g(y2)} Z" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2"/>`;
      s += txt(cx + R / 2, cy + 16, m.r) + txt(cx + 34 * Math.cos(-a / 2), cy + 34 * Math.sin(-a / 2) + 5, `${m.alpha}°`, { farbe: "#dc2626", fett: true }); }
    else { s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="2.5" fill="#1e3a8a"/>`;
      s += m.d ? `<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="#dc2626" stroke-width="2"/>` + txt(cx, cy - 8, m.d, { farbe: "#dc2626" }) : `<line x1="${cx}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="#dc2626" stroke-width="2"/>` + txt(cx + R / 2, cy - 8, m.r, { farbe: "#dc2626" }); }
    return s + "</svg>";
  }
  // ---------- Körper (Schrägbilder) ----------
  function koerperSVG(art, m) {
    const W = 300, H = 220; let s = svgKopf(W, H);
    const L = (x1, y1, x2, y2, gestr) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1e3a8a" stroke-width="2" ${gestr ? 'stroke-dasharray="5 4"' : ""}/>`;
    if (art === "quader") { // Vorderfläche 60..200 × 70..190, Versatz (60,-45)
      s += `<polygon points="60,70 200,70 260,25 120,25" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2"/><polygon points="200,70 260,25 260,145 200,190" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2"/><rect x="60" y="70" width="140" height="120" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>`;
      s += L(60, 190, 120, 145, true) + L(120, 145, 260, 145, true) + L(120, 145, 120, 25, true);
      s += txt(130, 208, m.a) + txt(48, 135, m.c, { anchor: "end" }) + txt(245, 178, m.b, { anchor: "start" });
      if (m.diag) s += `<line x1="60" y1="190" x2="260" y2="25" stroke="#dc2626" stroke-width="2.5"/>` + txt(150, 100, m.diag, { farbe: "#dc2626", fett: true });
    }
    if (art === "zylinder" || art === "kegel") {
      s += `<ellipse cx="150" cy="180" rx="80" ry="20" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>`;
      if (art === "zylinder") s += `<rect x="70" y="50" width="160" height="130" fill="#eff6ff" stroke="none"/>` + L(70, 50, 70, 180) + L(230, 50, 230, 180) + `<ellipse cx="150" cy="50" rx="80" ry="20" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2"/>`;
      else s += `<polygon points="70,180 230,180 150,30" fill="#eff6ff" stroke="none"/>` + L(70, 180, 150, 30) + L(230, 180, 150, 30);
      s += `<path d="M 70 180 A 80 20 0 0 0 230 180" fill="none" stroke="#1e3a8a" stroke-width="2"/>` + L(150, 180, 230, 180) + txt(190, 174, m.r, { farbe: "#dc2626" });
      s += `<line x1="150" y1="${art === "zylinder" ? 50 : 30}" x2="150" y2="180" stroke="#dc2626" stroke-dasharray="5 4"/>` + txt(140, 120, m.h, { farbe: "#dc2626", anchor: "end" });
    }
    if (art === "prisma") { // Dreiecksprisma
      s += `<polygon points="50,180 150,180 90,90" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/><polygon points="150,180 250,120 190,30 90,90" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2"/>` + L(50, 180, 150, 120, true) + L(150, 120, 250, 120, true) + L(150, 120, 190, 30, true);
      s += `<line x1="90" y1="90" x2="90" y2="180" stroke="#dc2626" stroke-dasharray="4 4"/>` + txt(100, 198, m.g) + txt(80, 140, m.hg, { farbe: "#dc2626", anchor: "end" }) + txt(220, 170, m.h, { anchor: "start" });
    }
    if (art === "pyramide") {
      s += `<polygon points="60,180 200,180 250,140 110,140" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>` + L(60, 180, 155, 30) + L(200, 180, 155, 30) + L(250, 140, 155, 30) + L(110, 140, 155, 30, true);
      s += `<line x1="155" y1="30" x2="155" y2="160" stroke="#dc2626" stroke-dasharray="5 4"/>` + txt(165, 110, m.h, { farbe: "#dc2626", anchor: "start" }) + txt(130, 200, m.a);
    }
    if (art === "kugel") {
      s += `<circle cx="150" cy="110" r="90" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/><path d="M 60 110 A 90 22 0 0 0 240 110" fill="none" stroke="#1e3a8a"/><path d="M 60 110 A 90 22 0 0 1 240 110" fill="none" stroke="#1e3a8a" stroke-dasharray="4 4"/>`;
      s += `<line x1="150" y1="110" x2="240" y2="110" stroke="#dc2626" stroke-width="2"/>` + txt(195, 104, m.r, { farbe: "#dc2626" });
    }
    return s + "</svg>";
  }

  // ---- Stufe 1: Winkel an geschnittenen Parallelen ----
  // Paare mit Schulbegriff: gleiche Kreuzung gegenüber = Scheitel, nebeneinander = Neben;
  // andere Kreuzung gleiche Lage = Stufen; oben-UL ↔ unten-OR bzw. oben-UR ↔ unten-OL = Wechsel
  const NACHBAR = { OR: ["OL", "UR"], OL: ["OR", "UL"], UL: ["OL", "UR"], UR: ["OR", "UL"] }, GEGEN = { OR: "UL", UL: "OR", OL: "UR", UR: "OL" };
  const WECHSEL = { "0UL": "1OR", "0UR": "1OL", "1OR": "0UL", "1OL": "0UR" };
  const wert = (theta, pos) => (pos === "OR" || pos === "UL" ? theta : 180 - theta);
  function gen_geo_1() {
    const theta = randInt(40, 70), k = randInt(0, 1), pos = choice(["OR", "OL", "UL", "UR"]);
    const rel = choice(["Nebenwinkel", "Scheitelwinkel", "Stufenwinkel", "Wechselwinkel"]);
    let k2 = k, pos2;
    if (rel === "Nebenwinkel") pos2 = choice(NACHBAR[pos]);
    else if (rel === "Scheitelwinkel") pos2 = GEGEN[pos];
    else if (rel === "Stufenwinkel") { k2 = 1 - k; pos2 = pos; }
    else { const w = WECHSEL[`${k}${pos}`]; if (!w) return gen_geo_1(); k2 = +w[0]; pos2 = w.slice(1); }
    const a = wert(theta, pos), b = wert(theta, pos2);
    return { topic: "geometrie", level: 1, subtype: rel, prompt: `\\text{Die Geraden g und h sind parallel. Gegeben ist}\\;\\; \\alpha = ${a}°.`, promptText: "Winkel",
      graph: winkelSVG(theta, { k, pos, text: `α = ${a}°`, farbe: "#2563eb" }, { k: k2, pos: pos2, text: "β", farbe: "#dc2626" }),
      question: `\\text{Wie liegen α und β zueinander, und wie groß ist β?}`, numFields: 2, fieldLabels: ["α und β sind", "β in Grad"],
      perFieldType: ["choice", "text"], fieldChoices: [["Nebenwinkel", "Scheitelwinkel", "Stufenwinkel", "Wechselwinkel"], null], answer: [rel, b], data: { a, b, rel } };
  }
  function check_geo_1(task, inp) { const err = []; if (inp[0] !== task.answer[0]) err.push(0); const v = parseUserNumber(String(inp[1]).replace("°", "")); if (isNaN(v) || Math.abs(v - task.answer[1]) > 1e-9) err.push(1); return { correct: !err.length, fieldErrors: err }; }
  function steps_geo_1(task) {
    const { a, b, rel } = task.data, regel = { Nebenwinkel: "Nebenwinkel ergänzen sich zu 180°", Scheitelwinkel: "Scheitelwinkel sind gleich groß", Stufenwinkel: "Stufenwinkel an Parallelen sind gleich groß", Wechselwinkel: "Wechselwinkel an Parallelen sind gleich groß" }[rel];
    return [{ label: `${rel}: ${regel}` }, { left: rel === "Nebenwinkel" ? `\\beta = 180° - ${a}° = ${b}°` : `\\beta = \\alpha = ${b}°`, right: "" }];
  }

  // ---- Stufe 2: Winkelsummen ----
  function gen_geo_2() {
    const sub = choice(["dreieck", "gleichschenklig", "viereck", "aussen", "nebenGleichung"]);
    if (sub === "dreieck") { let a, b; do { a = randInt(20, 110); b = randInt(20, 110); } while (a + b > 165); return { topic: "geometrie", level: 2, subtype: sub, prompt: `\\text{Im Dreieck ABC ist}\\;\\; \\alpha = ${a}°,\\; \\beta = ${b}°.`, promptText: "Dreieck",
      question: `\\text{Berechne}\\;\\; \\gamma.`, numFields: 1, fieldLabels: ["γ in Grad"], answer: [180 - a - b], data: { a, b } }; }
    if (sub === "gleichschenklig") { const spitze = Math.random() < 0.5, w = spitze ? 2 * randInt(10, 70) : randInt(25, 80);
      return { topic: "geometrie", level: 2, subtype: sub, prompt: T(spitze ? `In einem gleichschenkligen Dreieck ist der Winkel an der Spitze ${w}°.` : `In einem gleichschenkligen Dreieck ist ein Basiswinkel ${w}°.`), promptText: "gleichschenklig",
        question: T(spitze ? "Wie groß sind die beiden Basiswinkel?" : "Wie groß ist der Winkel an der Spitze?"), numFields: 1, fieldLabels: [spitze ? "Basiswinkel in Grad" : "Spitzenwinkel in Grad"], answer: [spitze ? (180 - w) / 2 : 180 - 2 * w], data: { spitze, w } }; }
    if (sub === "viereck") { let a, b, c; do { a = randInt(50, 140); b = randInt(50, 140); c = randInt(50, 140); } while (a + b + c >= 330 || a + b + c <= 200); return { topic: "geometrie", level: 2, subtype: sub, prompt: `\\text{In einem Viereck sind drei Winkel}\\;\\; ${a}°,\\; ${b}°,\\; ${c}°.`, promptText: "Viereck",
      question: `\\text{Wie groß ist der vierte Winkel?}`, numFields: 1, fieldLabels: ["vierter Winkel in Grad"], answer: [360 - a - b - c], data: { a, b, c } }; }
    if (sub === "aussen") { let a, b; do { a = randInt(30, 80); b = randInt(30, 80); } while (a + b > 160); return { topic: "geometrie", level: 2, subtype: sub, prompt: `\\text{Im Dreieck ABC ist}\\;\\; \\alpha = ${a}°,\\; \\beta = ${b}°.`, promptText: "Außenwinkel",
      question: `\\text{Wie groß ist der Außenwinkel bei C (Nebenwinkel von}\\;\\gamma)?`, numFields: 1, fieldLabels: ["Außenwinkel in Grad"], answer: [a + b], data: { a, b } }; }
    const k = choice([2, 3, 4, 5, 8]);
    return { topic: "geometrie", level: 2, subtype: sub, prompt: T(`Zwei Nebenwinkel: Der eine ist ${k}-mal so groß wie der andere.`), promptText: "Gleichung",
      question: T("Wie groß ist der kleinere Winkel? (gerundet auf 1 Nachkommastelle)"), numFields: 1, fieldLabels: ["kleinerer Winkel in Grad"], answer: [roundKfm(180 / (k + 1), 1)], tolerance: 0.051, data: { k } };
  }
  function check_geo_tol(task, inp) { const err = []; task.answer.forEach((x, i) => { const v = parseUserNumber(String(inp[i]).replace("°", "").replace(/\s*(cm|m|mm|dm|km|l|ml)(²|³)?$/, "")); const tol = task.tolerances ? task.tolerances[i] : task.tolerance || 1e-9; if (isNaN(v) || Math.abs(v - x) > tol) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
  function steps_geo_2(task) {
    const d = task.data, s = task.subtype;
    if (s === "dreieck") return [{ label: "Winkelsumme im Dreieck: 180°" }, { left: `\\gamma = 180° - ${d.a}° - ${d.b}° = ${task.answer[0]}°`, right: "" }];
    if (s === "gleichschenklig") return [{ label: "Im gleichschenkligen Dreieck sind die Basiswinkel gleich groß; Winkelsumme 180°" }, { left: d.spitze ? `(180° - ${d.w}°) : 2 = ${task.answer[0]}°` : `180° - 2\\cdot ${d.w}° = ${task.answer[0]}°`, right: "" }];
    if (s === "viereck") return [{ label: "Winkelsumme im Viereck: 360°" }, { left: `360° - ${d.a}° - ${d.b}° - ${d.c}° = ${task.answer[0]}°`, right: "" }];
    if (s === "aussen") return [{ label: "Außenwinkel = Summe der beiden nicht anliegenden Innenwinkel" }, { left: `${d.a}° + ${d.b}° = ${task.answer[0]}°`, right: "" }];
    return [{ label: "Kleiner Winkel x, großer Winkel " + d.k + "x; Nebenwinkel ergeben 180°" }, { left: `x + ${d.k}x = 180° \\;\\Rightarrow\\; x = \\dfrac{180°}{${d.k + 1}} \\approx ${fmtNum(task.answer[0])}°`, right: "" }];
  }

  // ---- Stufe 3: Flächen und Umfang von Vielecken ----
  function gen_geo_3() {
    const art = choice(["rechteck", "parallelogramm", "dreieck", "trapez", "drachen"]), E = choice(["cm", "m"]);
    let A, U = null, m, frage, felder, data;
    if (art === "rechteck") { const a = randInt(3, 25), b = randInt(2, 18); A = a * b; U = 2 * (a + b); m = { a: `${a} ${E}`, b: `${b} ${E}` }; data = { a, b }; }
    if (art === "parallelogramm") { const a = randInt(4, 20), h = randInt(2, 12); A = a * h; m = { a: `a = ${a} ${E}`, h: `h = ${h} ${E}` }; data = { a, h }; }
    if (art === "dreieck") { const g = randInt(4, 20), h = randInt(3, 15); A = (g * h) / 2; m = { g: `g = ${g} ${E}`, h: `h = ${h} ${E}` }; data = { g, h }; }
    if (art === "trapez") { const a = randInt(8, 20), c = randInt(3, a - 2), h = randInt(2, 12); A = ((a + c) * h) / 2; m = { a: `a = ${a} ${E}`, c: `c = ${c} ${E}`, h: `h = ${h} ${E}` }; data = { a, c, h }; }
    if (art === "drachen") { const e = randInt(4, 20), f = randInt(3, 16); A = (e * f) / 2; m = { e: `e = ${e} ${E}`, f: `f = ${f} ${E}` }; data = { e, f }; }
    const name = { rechteck: "Rechteck", parallelogramm: "Parallelogramm", dreieck: "Dreieck", trapez: "Trapez", drachen: "Drachenviereck" }[art];
    // Rückwärts-Variante: Höhe aus Fläche
    if (art !== "rechteck" && art !== "drachen" && Math.random() < 0.3) {
      const h = data.h, mm = Object.assign({}, m, { h: "h = ?" });
      return { topic: "geometrie", level: 3, subtype: art + "-rueck", prompt: T(`Das ${name} hat den Flächeninhalt ${fmtNum(A)} ${E}².`), promptText: name, graph: figurSVG(art, mm),
        question: `\\text{Berechne die Höhe h.}`, numFields: 1, fieldLabels: [`h in ${E}`], answer: [h], tolerance: 1e-9, data: Object.assign({ art, A, E, rueck: true }, data) };
    }
    felder = [`Flächeninhalt in ${E}²`].concat(U !== null ? [`Umfang in ${E}`] : []);
    return { topic: "geometrie", level: 3, subtype: art, prompt: T(`Berechne für das ${name} ${U !== null ? "Flächeninhalt und Umfang" : "den Flächeninhalt"}.`), promptText: name, graph: figurSVG(art, m),
      numFields: felder.length, fieldLabels: felder, answer: U !== null ? [A, U] : [A], tolerance: 1e-9, data: Object.assign({ art, E }, data) };
  }
  function steps_geo_3(task) {
    const d = task.data, F = { rechteck: `A = a\\cdot b = ${d.a}\\cdot ${d.b}`, parallelogramm: `A = a\\cdot h = ${d.a}\\cdot ${d.h}`, dreieck: `A = \\dfrac{g\\cdot h}{2} = \\dfrac{${d.g}\\cdot ${d.h}}{2}`, trapez: `A = \\dfrac{(a + c)\\cdot h}{2} = \\dfrac{(${d.a} + ${d.c})\\cdot ${d.h}}{2}`, drachen: `A = \\dfrac{e\\cdot f}{2} = \\dfrac{${d.e}\\cdot ${d.f}}{2}` }[d.art];
    if (d.rueck) { const R = { parallelogramm: `h = \\dfrac{A}{a} = \\dfrac{${fmtNum(d.A)}}{${d.a}}`, dreieck: `h = \\dfrac{2A}{g} = \\dfrac{2\\cdot ${fmtNum(d.A)}}{${d.g}}`, trapez: `h = \\dfrac{2A}{a + c} = \\dfrac{2\\cdot ${fmtNum(d.A)}}{${d.a + d.c}}` }[d.art];
      return [{ label: "Flächenformel nach h umstellen" }, { left: `${R} = ${d.h}`, right: "" }]; }
    const st = [{ label: "Flächenformel" }, { left: `${F} = ${fmtNum(task.answer[0])}\\;${T(d.E + "²")}`, right: "" }];
    if (d.art === "rechteck") st.push({ label: "Umfang: alle Seiten zusammen" }, { left: `u = 2\\cdot (${d.a} + ${d.b}) = ${task.answer[1]}\\;${T(d.E)}`, right: "" });
    return st;
  }

  // ---- Stufe 4: Zusammengesetzte Figuren ----
  function gen_geo_4() {
    if (Math.random() < 0.5) { // L-Form
      const a = randInt(8, 20), b = randInt(6, 16), c = randInt(3, a - 3), d = randInt(2, b - 2);
      return { topic: "geometrie", level: 4, subtype: "L", prompt: T("Berechne Flächeninhalt und Umfang der Figur (Maße in m, alle Ecken rechtwinklig)."), promptText: "L-Form",
        graph: figurSVG("L", { a: `${a} m`, b: `${b} m`, c: `${c} m`, d: `${d} m` }), numFields: 2, fieldLabels: ["Flächeninhalt in m²", "Umfang in m"], answer: [a * b - (a - c) * d, 2 * (a + b)], tolerance: 1e-9, data: { a, b, c, d } };
    }
    const a = randInt(6, 14), b = randInt(3, 8), h = randInt(2, 6);
    return { topic: "geometrie", level: 4, subtype: "haus", prompt: T("Eine Hauswand mit Giebel (Rechteck mit aufgesetztem Dreieck) soll gestrichen werden. Maße in m."), promptText: "Giebel",
      graph: figurSVG("haus", { a: `${a} m`, b: `${b} m`, h: `${h} m` }), numFields: 1, fieldLabels: ["Flächeninhalt in m²"], answer: [a * b + (a * h) / 2], tolerance: 1e-9, data: { a, b, h } };
  }
  function steps_geo_4(task) {
    const d = task.data;
    if (task.subtype === "L") return [{ label: "Fläche: großes Rechteck minus fehlendes Rechteck oben rechts" }, { left: `${d.a}\\cdot ${d.b} - ${d.a - d.c}\\cdot ${d.d} = ${task.answer[0]}`, right: "" },
      { label: "Umfang: Bei rechtwinkligen Treppenformen ist er so groß wie beim umschließenden Rechteck" }, { left: `2\\cdot (${d.a} + ${d.b}) = ${task.answer[1]}`, right: "" }];
    return [{ label: "In Rechteck und Dreieck zerlegen" }, { left: `${d.a}\\cdot ${d.b} + \\dfrac{${d.a}\\cdot ${d.h}}{2} = ${d.a * d.b} + ${fmtNum((d.a * d.h) / 2)} = ${fmtNum(task.answer[0])}`, right: "" }];
  }

  // ---- Stufe 5: Kreis ----
  function gen_geo_5() {
    const sub = choice(["umfang", "flaeche", "rueckUmfang", "rueckFlaeche", "ring", "sektor"]), E = choice(["cm", "m"]);
    if (sub === "umfang" || sub === "flaeche") { const mitD = Math.random() < 0.4, r = randInt(2, 20), wert = sub === "umfang" ? 2 * Math.PI * r : Math.PI * r * r;
      return { topic: "geometrie", level: 5, subtype: sub, prompt: T(mitD ? `Ein Kreis hat den Durchmesser d = ${2 * r} ${E}.` : `Ein Kreis hat den Radius r = ${r} ${E}.`), promptText: "Kreis",
        graph: kreisSVG("kreis", mitD ? { d: `d = ${2 * r} ${E}` } : { r: `r = ${r} ${E}` }), question: T(sub === "umfang" ? "Berechne den Umfang (2 Nachkommastellen)." : "Berechne den Flächeninhalt (2 Nachkommastellen)."),
        numFields: 1, fieldLabels: [sub === "umfang" ? `u in ${E}` : `A in ${E}²`], answer: [roundKfm(wert, 2)], tolerance: tolPi(wert), data: { r, mitD, E } }; }
    if (sub === "rueckUmfang" || sub === "rueckFlaeche") { const r = randInt(2, 15), wert = sub === "rueckUmfang" ? roundKfm(2 * Math.PI * r, 2) : roundKfm(Math.PI * r * r, 2);
      return { topic: "geometrie", level: 5, subtype: sub, prompt: T(sub === "rueckUmfang" ? `Ein runder Teich hat einen Umfang von ${fmtNum(wert)} m.` : `Ein runder Platz hat einen Flächeninhalt von ${fmtNum(wert)} m².`), promptText: "rückwärts",
        question: T("Wie groß ist der Radius? (2 Nachkommastellen)"), numFields: 1, fieldLabels: ["r in m"], answer: [r], tolerance: Math.max(0.011, r * 0.0015), data: { r, wert } }; }
    if (sub === "ring") { const R = randInt(5, 20), r = randInt(2, R - 2), A = Math.PI * (R * R - r * r);
      return { topic: "geometrie", level: 5, subtype: sub, prompt: T(`Ein Kreisring hat den Außenradius R = ${R} ${E} und den Innenradius r = ${r} ${E}.`), promptText: "Ring",
        graph: kreisSVG("ring", { R: `R = ${R}`, r: `r = ${r}` }), question: T("Berechne den Flächeninhalt des Rings (2 Nachkommastellen)."), numFields: 1, fieldLabels: [`A in ${E}²`], answer: [roundKfm(A, 2)], tolerance: tolPi(A), data: { R, r, E } }; }
    const r = randInt(3, 15), alpha = choice([30, 45, 60, 72, 90, 120, 135, 150, 200, 240, 270]), A = (Math.PI * r * r * alpha) / 360;
    return { topic: "geometrie", level: 5, subtype: sub, prompt: T(`Ein Kreisausschnitt hat den Radius r = ${r} ${E} und den Mittelpunktswinkel α = ${alpha}°.`), promptText: "Sektor",
      graph: kreisSVG("sektor", { r: `${r} ${E}`, alpha }), question: T("Berechne seinen Flächeninhalt (2 Nachkommastellen)."), numFields: 1, fieldLabels: [`A in ${E}²`], answer: [roundKfm(A, 2)], tolerance: tolPi(A), data: { r, alpha, E } };
  }
  function steps_geo_5(task) {
    const d = task.data, s = task.subtype, x = fmtNum(task.answer[0]);
    if (s === "umfang") return (d.mitD ? [{ label: `Radius = halber Durchmesser: r = ${d.r}` }] : []).concat([{ left: `u = 2\\cdot \\pi\\cdot r = 2\\cdot \\pi\\cdot ${d.r} \\approx ${x}`, right: "" }]);
    if (s === "flaeche") return (d.mitD ? [{ label: `Radius = halber Durchmesser: r = ${d.r}` }] : []).concat([{ left: `A = \\pi\\cdot r^{2} = \\pi\\cdot ${d.r}^{2} \\approx ${x}`, right: "" }]);
    if (s === "rueckUmfang") return [{ label: "u = 2πr nach r umstellen" }, { left: `r = \\dfrac{u}{2\\pi} = \\dfrac{${fmtNum(d.wert)}}{2\\pi} \\approx ${d.r}`, right: "" }];
    if (s === "rueckFlaeche") return [{ label: "A = πr² nach r umstellen" }, { left: `r = \\sqrt{\\dfrac{A}{\\pi}} = \\sqrt{\\dfrac{${fmtNum(d.wert)}}{\\pi}} \\approx ${d.r}`, right: "" }];
    if (s === "ring") return [{ label: "Ringfläche = großer Kreis minus kleiner Kreis" }, { left: `A = \\pi\\cdot (${d.R}^{2} - ${d.r}^{2}) = \\pi\\cdot ${d.R * d.R - d.r * d.r} \\approx ${x}`, right: "" }];
    return [{ label: "Anteil des Vollkreises: α/360°" }, { left: `A = \\pi\\cdot ${d.r}^{2}\\cdot \\dfrac{${d.alpha}}{360} \\approx ${x}`, right: "" }];
  }

  // ---- Stufe 6: Satz des Pythagoras – Grundaufgaben und Umkehrung ----
  function gen_geo_6() {
    const sub = choice(["hypotenuse", "kathete", "kathete", "umkehrung"]);
    if (sub === "umkehrung") {
      const recht = Math.random() < 0.5; let s;
      if (recht) { const [x, y, z] = choice([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15], [7, 24, 25], [20, 21, 29]]); s = [x, y, z]; }
      else { do { s = [randInt(4, 20), randInt(4, 20), randInt(5, 25)].sort((p, q) => p - q); } while (s[0] * s[0] + s[1] * s[1] === s[2] * s[2] || s[0] + s[1] <= s[2]); }
      return { topic: "geometrie", level: 6, subtype: sub, prompt: T(`Ein Dreieck hat die Seitenlängen ${s.join(" cm, ")} cm.`), promptText: "Umkehrung",
        question: T("Ist das Dreieck rechtwinklig?"), numFields: 1, fieldLabels: ["rechtwinklig?"], fieldType: "choice", fieldChoices: [["ja", "nein"]], answer: [recht ? "ja" : "nein"], data: { s } };
    }
    let a, b; do { a = randInt(3, 15); b = randInt(3, 15); } while (a === b);
    const c = Math.sqrt(a * a + b * b);
    if (sub === "hypotenuse") return { topic: "geometrie", level: 6, subtype: sub, prompt: T(`Rechtwinkliges Dreieck mit den Katheten a = ${a} cm und b = ${b} cm.`), promptText: "Hypotenuse",
      graph: dreieckSVG({ a, b, seiten: { a: `${a} cm`, b: `${b} cm`, c: "c = ?" }, winkel: null, rot: randInt(0, 3), spiegel: Math.random() < 0.5 }),
      question: T("Berechne die Hypotenuse c (2 Nachkommastellen)."), numFields: 1, fieldLabels: ["c in cm"], answer: [roundKfm(c, 2)], tolerance: 0.011, data: { a, b } };
    const cg = Math.max(a, b) + randInt(1, 6), kk = Math.min(a, b), gesucht = Math.sqrt(cg * cg - kk * kk);
    return { topic: "geometrie", level: 6, subtype: sub, prompt: T(`Rechtwinkliges Dreieck mit der Hypotenuse c = ${cg} cm und der Kathete b = ${kk} cm.`), promptText: "Kathete",
      graph: dreieckSVG({ a: gesucht, b: kk, seiten: { a: "a = ?", b: `${kk} cm`, c: `${cg} cm` }, winkel: null, rot: randInt(0, 3), spiegel: Math.random() < 0.5 }),
      question: T("Berechne die Kathete a (2 Nachkommastellen)."), numFields: 1, fieldLabels: ["a in cm"], answer: [roundKfm(gesucht, 2)], tolerance: 0.011, data: { c: cg, b: kk } };
  }
  function check_geo_6(task, inp) { return task.subtype === "umkehrung" ? { correct: inp[0] === task.answer[0], fieldErrors: inp[0] === task.answer[0] ? [] : [0] } : check_geo_tol(task, inp); }
  function steps_geo_6(task) {
    const d = task.data, s = task.subtype;
    if (s === "umkehrung") { const [x, y, z] = d.s; return [{ label: "Umkehrung des Pythagoras: Gilt a² + b² = c² für die längste Seite c, ist das Dreieck rechtwinklig" },
      { left: `${x}^{2} + ${y}^{2} = ${x * x + y * y}\\,, \\qquad ${z}^{2} = ${z * z}`, right: "" }, { left: T(task.answer[0] === "ja" ? "gleich ⇒ rechtwinklig" : "nicht gleich ⇒ nicht rechtwinklig"), right: "" }]; }
    if (s === "hypotenuse") return [{ label: "c² = a² + b²" }, { left: `c = \\sqrt{${d.a}^{2} + ${d.b}^{2}} = \\sqrt{${d.a * d.a + d.b * d.b}} \\approx ${fmtNum(task.answer[0])}`, right: "" }];
    return [{ label: "Kathete gesucht: a² = c² − b² (abziehen!)" }, { left: `a = \\sqrt{${d.c}^{2} - ${d.b}^{2}} = \\sqrt{${d.c * d.c - d.b * d.b}} \\approx ${fmtNum(task.answer[0])}`, right: "" }];
  }

  // ---- Stufe 7: Pythagoras im Alltag und im Raum ----
  function gen_geo_7() {
    const sub = choice(["leiter", "fernseher", "raumdiagonale", "aufzug", "trinkhalm", "teich"]), n = choice(NAMEN);
    if (sub === "leiter") { const L = choice([4, 5, 6, 7, 8]), d = choice([1, 1.2, 1.5, 2]), h = Math.sqrt(L * L - d * d);
      return textTask("geometrie", 7, sub, T(`${n} lehnt eine ${L} m lange Leiter an eine Hauswand. Der Fuß steht ${fmtNum(d)} m von der Wand entfernt.`), T("In welcher Höhe berührt die Leiter die Wand? (2 Nachkommastellen)"),
        [{ label: "Höhe in m", kind: "number", answer: roundKfm(h, 2), tol: 0.011 }], [{ label: "Leiter = Hypotenuse, gesucht ist eine Kathete" }, { left: `h = \\sqrt{${L}^{2} - ${fmtNum(d)}^{2}} \\approx ${fmtNum(roundKfm(h, 2))}`, right: "" }], { dataExtra: { L, d } }); }
    if (sub === "fernseher") { const [b, h] = choice([[16, 9], [4, 3]]), k = choice([7, 8, 9, 10]), B = b * k, Hh = h * k, D = Math.sqrt(B * B + Hh * Hh);
      return textTask("geometrie", 7, sub, T(`Ein Bildschirm ist ${B} cm breit und ${Hh} cm hoch. Bildschirmgrößen werden als Diagonale in Zoll angegeben (1 Zoll = 2,54 cm).`), T("Wie lang ist die Diagonale in cm und in Zoll? (1 Nachkommastelle)"),
        [{ label: "Diagonale in cm", kind: "number", answer: roundKfm(D, 1), tol: 0.051 }, { label: "Diagonale in Zoll", kind: "number", answer: roundKfm(D / 2.54, 1), tol: 0.051 }],
        [{ left: `d = \\sqrt{${B}^{2} + ${Hh}^{2}} \\approx ${fmtNum(roundKfm(D, 1))}\\;${T("cm")}`, right: "" }, { left: `${fmtNum(roundKfm(D, 1))} : 2,54 \\approx ${fmtNum(roundKfm(D / 2.54, 1))}\\;${T("Zoll")}`, right: "" }], { dataExtra: { B, Hh } }); }
    if (sub === "raumdiagonale") { const a = randInt(3, 12), b = randInt(3, 12), c = randInt(3, 12), d = Math.sqrt(a * a + b * b + c * c);
      return textTask("geometrie", 7, sub, T(`Ein Quader hat die Kantenlängen a = ${a} cm, b = ${b} cm und c = ${c} cm.`), T("Berechne die Raumdiagonale (2 Nachkommastellen)."),
        [{ label: "Raumdiagonale in cm", kind: "number", answer: roundKfm(d, 2), tol: 0.011 }],
        [{ label: "Erst die Diagonale der Grundfläche, dann mit der Höhe ein zweites rechtwinkliges Dreieck" }, { left: `e = \\sqrt{${a}^{2} + ${b}^{2}} = \\sqrt{${a * a + b * b}}`, right: "" }, { left: `d = \\sqrt{e^{2} + ${c}^{2}} = \\sqrt{${a * a + b * b + c * c}} \\approx ${fmtNum(roundKfm(d, 2))}`, right: "" }],
        { dataExtra: { a, b, c }, graph: koerperSVG("quader", { a: `a = ${a} cm`, b: `b = ${b} cm`, c: `c = ${c} cm`, diag: "d" }) }); }
    if (sub === "aufzug") { const [a, b, c] = choice([[200, 110, 220], [140, 110, 210], [160, 100, 220], [210, 140, 230]]), L = choice([2.8, 3, 3.2, 2.5]), d = Math.sqrt(a * a + b * b + c * c);
      return textTask("geometrie", 7, sub, T(`Eine Aufzugkabine ist innen ${a} cm × ${b} cm × ${c} cm groß. ${n} möchte eine ${fmtNum(L)} m lange Vorhangstange transportieren.`), T("Wie lang ist die Raumdiagonale der Kabine, und passt die Stange hinein?"),
        [{ label: "Raumdiagonale in cm (ganze cm)", kind: "number", answer: Math.round(d), tol: 1 }, { label: "Passt die Stange?", kind: "choice", choices: ["ja", "nein"], answer: d >= L * 100 ? "ja" : "nein" }],
        [{ left: `d = \\sqrt{${a}^{2} + ${b}^{2} + ${c}^{2}} \\approx ${Math.round(d)}\\;${T("cm")}`, right: "" }, { left: T(d >= L * 100 ? `${Math.round(d)} cm ≥ ${L * 100} cm ⇒ passt (schräg in die Kabine gestellt)` : `${Math.round(d)} cm < ${L * 100} cm ⇒ passt nicht`), right: "" }], { dataExtra: { a, b, c, L } }); }
    if (sub === "trinkhalm") { const [a, b, c] = choice([[3.4, 6.5, 9], [4, 6, 10], [5, 7.5, 12], [4.5, 6, 11]]), d = Math.sqrt(a * a + b * b + c * c);
      return textTask("geometrie", 7, sub, T(`Eine quaderförmige Getränkepackung ist ${fmtNum(a)} cm × ${fmtNum(b)} cm × ${fmtNum(c)} cm groß. Das Loch für den Trinkhalm ist an einer oberen Ecke.`), T("Wie lang muss der Trinkhalm mindestens sein, damit er jede Ecke erreicht und noch 2 cm herausschaut? (1 Nachkommastelle)"),
        [{ label: "Länge in cm", kind: "number", answer: roundKfm(d + 2, 1), tol: 0.051 }],
        [{ label: "Der weiteste Weg im Quader ist die Raumdiagonale" }, { left: `d = \\sqrt{${fmtNum(a)}^{2} + ${fmtNum(b)}^{2} + ${fmtNum(c)}^{2}} \\approx ${fmtNum(roundKfm(d, 2))}`, right: "" }, { left: `${fmtNum(roundKfm(d, 2))} + 2 \\approx ${fmtNum(roundKfm(d + 2, 1))}`, right: "" }], { dataExtra: { a, b, c } }); }
    const ueber = choice([0.5, 1]), seite = choice([1.5, 2, 2.5, 3]), t = (seite * seite - ueber * ueber) / (2 * ueber);
    return textTask("geometrie", 7, "teich", T(`Eine Wasserpflanze ragt ${fmtNum(ueber)} m senkrecht aus einem Teich. Zieht man sie zur Seite, erreicht ihre Spitze die Wasseroberfläche genau ${fmtNum(seite)} m vom ursprünglichen Ort entfernt.`), T("Wie tief ist der Teich? (2 Nachkommastellen)"),
      [{ label: "Tiefe in m", kind: "number", answer: roundKfm(t, 2), tol: 0.011 }],
      [{ label: `Tiefe t; die Pflanze ist t + ${fmtNum(ueber)} lang und bildet die Hypotenuse` }, { left: `t^{2} + ${fmtNum(seite)}^{2} = (t + ${fmtNum(ueber)})^{2}`, right: "" },
       { left: `${fmtNum(seite * seite)} = ${fmtNum(2 * ueber)}t + ${fmtNum(ueber * ueber)} \\;\\Rightarrow\\; t \\approx ${fmtNum(roundKfm(t, 2))}`, right: "" }], { dataExtra: { ueber, seite } });
  }

  // ---- Stufe 8: Quader, Prisma, Zylinder (Volumen, Oberfläche, Einheiten) ----
  const VOL_EINH = [["m³", 1e9], ["dm³", 1e6], ["l", 1e6], ["cm³", 1e3], ["ml", 1e3], ["mm³", 1]];
  function gen_geo_8() {
    const sub = choice(["quader", "prisma", "prismaHoehe", "zylinder", "zylinderO", "vase", "einheit"]);
    if (sub === "einheit") { let a, b; do { a = choice(VOL_EINH); b = choice(VOL_EINH); } while (a[1] === b[1]); const w = choice([2, 3.5, 7, 45.4, 98.4, 250, 3610, 42800]);
      return { topic: "geometrie", level: 8, subtype: sub, prompt: T(`${fmtNum(w)} ${a[0]}`), promptText: "Einheit", question: T(`Rechne um in ${b[0]}.`), numFields: 1, fieldLabels: [b[0]], answer: [Number(((w * a[1]) / b[1]).toPrecision(12))], tolerance: 1e-9, data: { w, von: a, nach: b } }; }
    if (sub === "quader") { const a = randInt(3, 15), b = randInt(3, 15), c = randInt(2, 12);
      return { topic: "geometrie", level: 8, subtype: sub, prompt: T(`Quader mit a = ${a} cm, b = ${b} cm, c = ${c} cm.`), promptText: "Quader", graph: koerperSVG("quader", { a: `a = ${a}`, b: `b = ${b}`, c: `c = ${c}` }),
        question: T("Berechne Volumen und Oberfläche."), numFields: 2, fieldLabels: ["V in cm³", "O in cm²"], answer: [a * b * c, 2 * (a * b + a * c + b * c)], tolerance: 1e-9, data: { a, b, c } }; }
    if (sub === "prisma" || sub === "prismaHoehe") { const g = randInt(3, 12), hg = randInt(2, 10), h = randInt(4, 20), G = (g * hg) / 2;
      if (sub === "prismaHoehe") return { topic: "geometrie", level: 8, subtype: sub, prompt: T(`Ein Dreiecksprisma hat das Volumen ${fmtNum(G * h)} cm³. Die dreieckige Grundfläche hat die Grundseite ${g} cm und die Höhe ${hg} cm.`), promptText: "Prismahöhe",
        graph: koerperSVG("prisma", { g: `${g}`, hg: `${hg}`, h: "h = ?" }), question: T("Wie hoch ist das Prisma?"), numFields: 1, fieldLabels: ["h in cm"], answer: [h], tolerance: 1e-9, data: { g, hg, G, h } };
      return { topic: "geometrie", level: 8, subtype: sub, prompt: T(`Dreiecksprisma: Grundseite des Dreiecks ${g} cm, Höhe des Dreiecks ${hg} cm, Körperhöhe ${h} cm.`), promptText: "Prisma",
        graph: koerperSVG("prisma", { g: `${g}`, hg: `${hg}`, h: `h = ${h}` }), question: T("Berechne das Volumen."), numFields: 1, fieldLabels: ["V in cm³"], answer: [G * h], tolerance: 1e-9, data: { g, hg, G, h } }; }
    const r = randInt(2, 12), h = randInt(3, 25);
    if (sub === "vase") { const anteil = choice([[3, 4], [4, 5], [2, 3], [1, 2]]), V = (Math.PI * r * r * h * anteil[0]) / anteil[1] / 1000;
      return { topic: "geometrie", level: 8, subtype: sub, prompt: T(`Eine zylinderförmige Vase hat innen den Radius ${r} cm und die Höhe ${h} cm. Sie ist zu ${anteil[0]}/${anteil[1]} mit Wasser gefüllt.`), promptText: "Vase",
        graph: koerperSVG("zylinder", { r: `r = ${r}`, h: `h = ${h}` }), question: T("Wie viel Liter Wasser sind in der Vase? (2 Nachkommastellen)"), numFields: 1, fieldLabels: ["Liter"], answer: [roundKfm(V, 2)], tolerance: tolPi(V), data: { r, h, anteil } }; }
    const V = Math.PI * r * r * h, M = 2 * Math.PI * r * h, O = 2 * Math.PI * r * r + M;
    if (sub === "zylinderO") return { topic: "geometrie", level: 8, subtype: sub, prompt: T(`Zylinder mit r = ${r} cm und h = ${h} cm.`), promptText: "Zylinder O", graph: koerperSVG("zylinder", { r: `r = ${r}`, h: `h = ${h}` }),
      question: T("Berechne Mantelfläche und Oberfläche (2 Nachkommastellen)."), numFields: 2, fieldLabels: ["M in cm²", "O in cm²"], answer: [roundKfm(M, 2), roundKfm(O, 2)], tolerances: [tolPi(M), tolPi(O)], data: { r, h } };
    return { topic: "geometrie", level: 8, subtype: sub, prompt: T(`Zylinder mit r = ${r} cm und h = ${h} cm.`), promptText: "Zylinder", graph: koerperSVG("zylinder", { r: `r = ${r}`, h: `h = ${h}` }),
      question: T("Berechne das Volumen (2 Nachkommastellen)."), numFields: 1, fieldLabels: ["V in cm³"], answer: [roundKfm(V, 2)], tolerance: tolPi(V), data: { r, h } };
  }
  function steps_geo_8(task) {
    const d = task.data, s = task.subtype, x = (i) => fmtNum(task.answer[i]);
    if (s === "einheit") return [{ label: "Bei Volumen ist der Umrechnungsfaktor zwischen benachbarten Einheiten 1000 (1 dm³ = 1 l, 1 cm³ = 1 ml)" }, { left: T(`${fmtNum(d.w)} ${d.von[0]} = ${x(0)} ${d.nach[0]}`), right: "" }];
    if (s === "quader") return [{ left: `V = a\\cdot b\\cdot c = ${d.a}\\cdot ${d.b}\\cdot ${d.c} = ${x(0)}`, right: "" }, { left: `O = 2\\cdot (ab + ac + bc) = 2\\cdot (${d.a * d.b} + ${d.a * d.c} + ${d.b * d.c}) = ${x(1)}`, right: "" }];
    if (s === "prisma") return [{ label: "V = Grundfläche · Körperhöhe" }, { left: `G = \\dfrac{${d.g}\\cdot ${d.hg}}{2} = ${fmtNum(d.G)}\\,, \\quad V = ${fmtNum(d.G)}\\cdot ${d.h} = ${x(0)}`, right: "" }];
    if (s === "prismaHoehe") return [{ label: "V = G · h nach h umstellen" }, { left: `G = \\dfrac{${d.g}\\cdot ${d.hg}}{2} = ${fmtNum(d.G)}\\,, \\quad h = \\dfrac{V}{G} = \\dfrac{${fmtNum(d.G * d.h)}}{${fmtNum(d.G)}} = ${d.h}`, right: "" }];
    if (s === "vase") return [{ left: `V = \\pi\\cdot ${d.r}^{2}\\cdot ${d.h}\\cdot \\dfrac{${d.anteil[0]}}{${d.anteil[1]}}\\;${T("cm³")}`, right: "" }, { label: "1000 cm³ = 1 Liter" }, { left: T(`≈ ${x(0)} l`), right: "" }];
    if (s === "zylinderO") return [{ left: `M = 2\\pi r h = 2\\pi\\cdot ${d.r}\\cdot ${d.h} \\approx ${x(0)}`, right: "" }, { label: "Oberfläche = 2 Kreise + Mantel" }, { left: `O = 2\\pi r^{2} + M \\approx ${x(1)}`, right: "" }];
    return [{ label: "Zylinder: V = Grundfläche · Höhe = πr² · h" }, { left: `V = \\pi\\cdot ${d.r}^{2}\\cdot ${d.h} \\approx ${x(0)}`, right: "" }];
  }

  // ---- Stufe 9: Pyramide, Kegel, Kugel (Kl. 10) ----
  function gen_geo_9() {
    const sub = choice(["pyramide", "kegel", "kugel", "kugelO", "pilz"]);
    if (sub === "pyramide") { const a = randInt(3, 15), h = randInt(3, 20), V = (a * a * h) / 3;
      return { topic: "geometrie", level: 9, subtype: sub, prompt: T(`Quadratische Pyramide mit Grundkante a = ${a} cm und Höhe h = ${h} cm.`), promptText: "Pyramide", graph: koerperSVG("pyramide", { a: `a = ${a}`, h: `h = ${h}` }),
        question: T("Berechne das Volumen (2 Nachkommastellen)."), numFields: 1, fieldLabels: ["V in cm³"], answer: [roundKfm(V, 2)], tolerance: 0.011, data: { a, h } }; }
    const r = randInt(2, 12), h = randInt(3, 20);
    if (sub === "kegel") { const V = (Math.PI * r * r * h) / 3; return { topic: "geometrie", level: 9, subtype: sub, prompt: T(`Kegel mit r = ${r} cm und h = ${h} cm.`), promptText: "Kegel", graph: koerperSVG("kegel", { r: `r = ${r}`, h: `h = ${h}` }),
      question: T("Berechne das Volumen (2 Nachkommastellen)."), numFields: 1, fieldLabels: ["V in cm³"], answer: [roundKfm(V, 2)], tolerance: tolPi(V), data: { r, h } }; }
    if (sub === "kugel" || sub === "kugelO") { const w = sub === "kugel" ? (4 / 3) * Math.PI * r ** 3 : 4 * Math.PI * r * r;
      return { topic: "geometrie", level: 9, subtype: sub, prompt: T(`Kugel mit r = ${r} cm.`), promptText: "Kugel", graph: koerperSVG("kugel", { r: `r = ${r}` }),
        question: T(sub === "kugel" ? "Berechne das Volumen (2 Nachkommastellen)." : "Berechne die Oberfläche (2 Nachkommastellen)."), numFields: 1, fieldLabels: [sub === "kugel" ? "V in cm³" : "O in cm²"], answer: [roundKfm(w, 2)], tolerance: tolPi(w), data: { r } }; }
    const rp = choice([1.5, 2, 2.5]), hs = choice([3, 4, 5]), anz = choice([20, 30, 40]), V = Math.PI * rp * rp * hs + (2 / 3) * Math.PI * rp ** 3;
    return textTask("geometrie", 9, "pilz", T(`Pilze werden vereinfacht als Zylinder (Stiel) mit aufgesetzter Halbkugel (Hut) modelliert, beide mit dem Radius ${fmtNum(rp)} cm; der Stiel ist ${hs} cm hoch.`),
      T(`Wie groß ist das Volumen eines Pilzes, und übersteigen ${anz} Pilze das Volumen von 1 Liter?`),
      [{ label: "Volumen eines Pilzes in cm³ (2 Nachkommastellen)", kind: "number", answer: roundKfm(V, 2), tol: tolPi(V) }, { label: `mehr als 1 l?`, kind: "choice", choices: ["ja", "nein"], answer: anz * V > 1000 ? "ja" : "nein" }],
      [{ left: `V = \\pi\\cdot ${fmtNum(rp)}^{2}\\cdot ${hs} + \\dfrac{2}{3}\\pi\\cdot ${fmtNum(rp)}^{3} \\approx ${fmtNum(roundKfm(V, 2))}`, right: "" }, { left: T(`${anz} · ${fmtNum(roundKfm(V, 2))} ≈ ${fmtNum(roundKfm(anz * V, 0))} cm³ ${anz * V > 1000 ? ">" : "<"} 1000 cm³`), right: "" }], { dataExtra: { rp, hs, anz } });
  }
  function steps_geo_9(task) {
    const d = task.data, s = task.subtype, x = fmtNum(task.answer[0]);
    if (s === "pyramide") return [{ label: "Spitze Körper: ein Drittel von Grundfläche · Höhe" }, { left: `V = \\dfrac{1}{3}\\cdot ${d.a}^{2}\\cdot ${d.h} \\approx ${x}`, right: "" }];
    if (s === "kegel") return [{ label: "Kegel: ein Drittel des Zylinders" }, { left: `V = \\dfrac{1}{3}\\pi\\cdot ${d.r}^{2}\\cdot ${d.h} \\approx ${x}`, right: "" }];
    if (s === "kugel") return [{ left: `V = \\dfrac{4}{3}\\pi r^{3} = \\dfrac{4}{3}\\pi\\cdot ${d.r}^{3} \\approx ${x}`, right: "" }];
    return [{ left: `O = 4\\pi r^{2} = 4\\pi\\cdot ${d.r}^{2} \\approx ${x}`, right: "" }];
  }

  TOPICS.geometrie = {
    name: "Geometrie",
    grade: "Kl. 7–10",
    levels: [
      { id: 1, name: "Winkel an Geradenkreuzungen", grade: "Kl. 7", generate: gen_geo_1, check: check_geo_1, steps: steps_geo_1 },
      { id: 2, name: "Winkelsummen", grade: "Kl. 7", generate: gen_geo_2, check: check_geo_tol, steps: steps_geo_2 },
      { id: 3, name: "Flächen von Vielecken", grade: "Kl. 6–8", generate: gen_geo_3, check: check_geo_tol, steps: steps_geo_3 },
      { id: 4, name: "Zusammengesetzte Figuren", grade: "Kl. 6–8", generate: gen_geo_4, check: check_geo_tol, steps: steps_geo_4 },
      { id: 5, name: "Kreis", grade: "Kl. 8", calculatorHint: "Taschenrechner erlaubt (π ≈ 3,14 genügt)", generate: gen_geo_5, check: check_geo_tol, steps: steps_geo_5 },
      { id: 6, name: "Satz des Pythagoras", grade: "Kl. 8–9", calculatorHint: "Taschenrechner erlaubt", generate: gen_geo_6, check: check_geo_6, steps: steps_geo_6 },
      { id: 7, name: "Pythagoras im Alltag und im Raum", grade: "Kl. 8–9", calculatorHint: "Taschenrechner erlaubt", generate: gen_geo_7, check: check_textaufgabe, steps: steps_textaufgabe },
      { id: 8, name: "Quader, Prisma, Zylinder", grade: "Kl. 8–9", calculatorHint: "Taschenrechner erlaubt", generate: gen_geo_8, check: check_geo_tol, steps: steps_geo_8 },
      { id: 9, name: "Pyramide, Kegel, Kugel", grade: "Kl. 10", calculatorHint: "Taschenrechner erlaubt", generate: gen_geo_9, check: (t, i) => (t.textTask ? check_textaufgabe(t, i) : check_geo_tol(t, i)), steps: (t) => (t.textTask ? steps_textaufgabe(t) : steps_geo_9(t)) }
    ]
  };

  // ---------- Klassenarbeiten: getrennt nach Teilgebiet (wie in der Schule) ----------
  KA_TEILGEBIETE.geometrie = [["winkel", "Winkel (Kl. 7)"], ["flaechen", "Flächen und Kreis (Kl. 7–8)"], ["pythagoras", "Satz des Pythagoras (Kl. 8–9)"], ["koerper", "Körper (Kl. 9–10)"]];
  KA_INFO.geometrie = { klasse: "Kl. 7–10", tr: true, gebiete: { winkel: { klasse: "Kl. 7", tr: false }, flaechen: { klasse: "Kl. 7–8" }, pythagoras: { klasse: "Kl. 8–9" }, koerper: { klasse: "Kl. 9–10" } } };
  const st = (lvl, f) => stufenTeil("geometrie", lvl, f);
  const pool3 = (pool) => mische(pool).slice(0, 3).map((f) => f());
  KA_VORLAGEN.geometrie = [
    // --- Winkel (ohne Taschenrechner) ---
    { key: "w_paare", gebiet: "winkel", teil: "A", afb: 1, titel: "Winkelpaare", baue: () => ({ kontext: "", teile: [st(1), st(1)] }) },
    { key: "w_summen", gebiet: "winkel", teil: "A", afb: 1, titel: "Winkelsummen", baue: () => ({ kontext: "", teile: [st(2, (t) => t.subtype === "dreieck"), st(2, (t) => t.subtype === "viereck")] }) },
    { key: "w_dreiecke", gebiet: "winkel", teil: "A", afb: 2, titel: "Besondere Dreiecke", baue: () => ({ kontext: "", teile: [st(2, (t) => t.subtype === "gleichschenklig"), st(2, (t) => t.subtype === "gleichschenklig"), st(2, (t) => t.subtype === "aussen")] }) },
    { key: "w_parallelen", gebiet: "winkel", teil: "A", afb: 2, titel: "Winkel an Parallelen", baue: () => ({ kontext: "", teile: [st(1, (t) => t.subtype === "Stufenwinkel"), st(1, (t) => t.subtype === "Wechselwinkel"),
      papierTeil(T("✏️ Erkläre den Unterschied zwischen Stufenwinkeln und Wechselwinkeln. Fertige dazu eine Skizze an."), [{ text: "Stufenwinkel: gleiche Lage an beiden Kreuzungen (auf derselben Seite)", punkte: 1 }, { text: "Wechselwinkel: auf verschiedenen Seiten der schneidenden Geraden, zwischen den Parallelen", punkte: 1 }],
        [{ left: T("Stufenwinkel liegen an den beiden Kreuzungen „auf derselben Stufe“; Wechselwinkel liegen „über Kreuz“ (Z-Form). An Parallelen sind beide gleich groß."), right: "" }], winkelSVG(55, { k: 0, pos: "UR", text: "α", farbe: "#2563eb" }, { k: 1, pos: "OL", text: "α′", farbe: "#dc2626" }))] }) },
    { key: "w_gleichung", gebiet: "winkel", teil: "A", afb: 2, titel: "Winkel mit Gleichungen", baue: () => ({ kontext: "", teile: [st(2, (t) => t.subtype === "nebenGleichung"),
      papierTeil(T("✏️ Zeichne zwei sich schneidende Geraden, bei denen zwei Nebenwinkel gleich groß sind. Wie viele Möglichkeiten gibt es? Begründe."), [{ text: "Beide Nebenwinkel 90° (Geraden senkrecht)", punkte: 1 }, { text: "Begründung: x + x = 180° ⇒ x = 90°, nur diese eine Möglichkeit", punkte: 1 }], [{ left: T("x + x = 180° ⇒ x = 90°: Die Geraden müssen senkrecht zueinander stehen – nur eine Möglichkeit."), right: "" }])] }) },
    { key: "w_aussagen", gebiet: "winkel", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => ({ kontext: "", teile: pool3([
      () => aussageTeil(T("Lea behauptet: „Es gibt Dreiecke mit zwei stumpfen Winkeln.“"), false, ["Zwei stumpfe Winkel wären zusammen schon mehr als 180° – die Winkelsumme ist genau 180°.", "Stimmt, wenn die Seiten lang genug sind.", "Stimmt in gleichschenkligen Dreiecken."]),
      () => aussageTeil(T("Tim behauptet: „Scheitelwinkel können sich zu 180° ergänzen.“"), true, ["Wenn beide 90° groß sind (die Geraden stehen senkrecht).", "Nein, Scheitelwinkel sind immer kleiner als 90°.", "Ja, Scheitelwinkel ergänzen sich immer zu 180°."]),
      () => aussageTeil(T("Ole behauptet: „Stufenwinkel sind immer gleich groß.“"), false, ["Nur wenn die beiden geschnittenen Geraden parallel sind.", "Stimmt, das ist die Definition.", "Stimmt nur bei rechten Winkeln."]),
      () => aussageTeil(T("Mia behauptet: „In einem gleichseitigen Dreieck ist jeder Winkel 60° groß.“"), true, ["Alle drei Winkel sind gleich groß: 180° : 3 = 60°.", "Nein, das hängt von der Seitenlänge ab.", "Nur im rechtwinkligen Dreieck."])]) }) },
    // --- Flächen und Kreis ---
    { key: "f_grund", gebiet: "flaechen", teil: "A", afb: 1, titel: "Flächen von Vielecken", baue: () => { const a = st(3, (t) => !t.data.rueck); let b; do { b = st(3); } while (b.task.subtype === a.task.subtype); return { kontext: "", graph: a.task.graph, teile: [a, b] }; } },
    { key: "f_zusammen", gebiet: "flaechen", teil: "A", afb: 2, titel: "Zusammengesetzte Figuren", baue: () => { const t = st(4, (x) => x.subtype === "L"); return { kontext: "", graph: t.task.graph, teile: [t, st(4, (x) => x.subtype === "haus")] }; } },
    { key: "f_aussagen", gebiet: "flaechen", teil: "A", afb: 3, titel: "Aussagen prüfen und Fehler finden", baue: () => ({ kontext: "", teile: pool3([
      () => aussageTeil(T("Lea behauptet: „Verdoppelt man den Radius eines Kreises, verdoppelt sich auch seine Fläche.“"), false, ["Der Radius geht quadratisch ein: doppelter Radius ⇒ vierfache Fläche.", "Stimmt, Radius und Fläche sind proportional.", "Die Fläche verdreifacht sich."]),
      () => aussageTeil(T("Tim behauptet: „Verdoppelt man den Mittelpunktswinkel eines Kreisausschnitts, verdoppelt sich seine Fläche.“"), true, ["Die Fläche ist proportional zum Anteil α/360°.", "Nein, sie vervierfacht sich.", "Nein, sie bleibt gleich."]),
      () => aussageTeil(T("Ole behauptet: „Zwei Rechtecke mit gleichem Umfang haben auch den gleichen Flächeninhalt.“"), false, ["Gegenbeispiel: 1 × 9 und 5 × 5 haben beide den Umfang 20, aber die Flächen 9 und 25.", "Stimmt, Umfang und Fläche hängen fest zusammen.", "Stimmt nur bei Quadraten."]),
      () => { const a = randInt(6, 12), c = randInt(2, a - 2), h = randInt(2, 8); return fehlerTeil(`${T("Paul berechnet den Flächeninhalt eines Trapezes:")}\\;\\; A = (${a} + ${c})\\cdot ${h} = ${(a + c) * h}`, ["Er hat vergessen, durch 2 zu teilen.", "Er hätte a und c multiplizieren müssen.", "Die Rechnung ist richtig."],
        { label: "richtiger Flächeninhalt", kind: "number", answer: ((a + c) * h) / 2 }, [{ left: `A = \\dfrac{(${a} + ${c})\\cdot ${h}}{2} = ${fmtNum(((a + c) * h) / 2)}`, right: "" }]); }]) }) },
    { key: "f_kreis", gebiet: "flaechen", teil: "B", afb: 2, titel: "Kreis berechnen", baue: () => ({ kontext: "", teile: [st(5, (t) => t.subtype === "umfang"), st(5, (t) => t.subtype === "flaeche")] }) },
    { key: "f_rueck", gebiet: "flaechen", teil: "B", afb: 2, titel: "Kreis rückwärts und Kreisring", baue: () => ({ kontext: "", teile: [st(5, (t) => t.subtype.startsWith("rueck")), st(5, (t) => t.subtype === "ring")] }) },
    { key: "f_sektor", gebiet: "flaechen", teil: "B", afb: 2, titel: "Kreisausschnitte", baue: () => { const t = st(5, (x) => x.subtype === "sektor"); return { kontext: "", graph: t.task.graph, teile: [t, st(5, (x) => x.subtype === "sektor")] }; } },
    // --- Pythagoras ---
    { key: "p_umkehrung", gebiet: "pythagoras", teil: "A", afb: 1, titel: "Rechtwinklig oder nicht?", baue: () => ({ kontext: "", teile: [st(6, (t) => t.subtype === "umkehrung"), st(6, (t) => t.subtype === "umkehrung")] }) },
    { key: "p_formel", gebiet: "pythagoras", teil: "A", afb: 1, titel: "Den Satz aufstellen", baue: () => {
      const [k1, k2, h] = mische(["r", "s", "t", "u", "v", "w"]).slice(0, 3), rich = `${k1}² + ${k2}² = ${h}²`;
      const g = dreieckSVG({ a: 3, b: 4, seiten: { a: k1, b: k2, c: h }, winkel: null, rot: randInt(0, 3), spiegel: Math.random() < 0.5, ecken: false });
      return { kontext: T("Im abgebildeten rechtwinkligen Dreieck sind die Seiten mit Buchstaben bezeichnet."), graph: g, teile: [
        autoTeil(T("Welche Gleichung gilt hier?"), [{ label: "Satz des Pythagoras", kind: "choice", choices: mische([rich, `${k1}² + ${h}² = ${k2}²`, `${k2}² + ${h}² = ${k1}²`]), answer: rich, punkte: 2 }],
          [{ left: T(`${h} liegt dem rechten Winkel gegenüber und ist die Hypotenuse: ${rich}`), right: "" }])] };
    } },
    { key: "p_aussagen", gebiet: "pythagoras", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => ({ kontext: "", teile: pool3([
      () => aussageTeil(T("Emil behauptet: „Der Satz des Pythagoras stimmt nicht – bei meinem Dreieck mit 5 cm, 6 cm und 7 cm geht die Rechnung nicht auf.“"), false, ["Das Dreieck ist nicht rechtwinklig – der Satz gilt nur in rechtwinkligen Dreiecken.", "Stimmt, der Satz gilt nur ungefähr.", "Er hat sich verrechnet: 5² + 6² = 7²."]),
      () => aussageTeil(T("Lea behauptet: „Mit einer Schnur mit 12 gleichen Abständen (Knoten) kann man einen rechten Winkel abstecken.“"), true, ["Ein Dreieck mit 3, 4 und 5 Abschnitten ist rechtwinklig, denn 3² + 4² = 5².", "Nein, dafür braucht man ein Geodreieck.", "Nur mit 13 Knoten."]),
      () => aussageTeil(T("Tim behauptet: „Die Hypotenuse ist immer die längste Seite im rechtwinkligen Dreieck.“"), true, ["c² = a² + b² ist größer als a² und als b², also ist c länger als jede Kathete.", "Nein, manchmal ist eine Kathete länger.", "Nur im gleichschenkligen rechtwinkligen Dreieck."])]) }) },
    { key: "p_rechnen", gebiet: "pythagoras", teil: "B", afb: 2, titel: "Seiten berechnen", baue: () => ({ kontext: "", teile: [st(6, (t) => t.subtype === "hypotenuse"), st(6, (t) => t.subtype === "kathete")] }) },
    { key: "p_alltag", gebiet: "pythagoras", teil: "B", afb: 2, titel: "Pythagoras im Alltag", baue: () => ({ kontext: "", teile: [st(7, (t) => t.subtype === "leiter"), st(7, (t) => t.subtype === "fernseher")] }) },
    { key: "p_raum", gebiet: "pythagoras", teil: "B", afb: 3, titel: "Pythagoras im Raum", baue: () => ({ kontext: "", teile: [st(7, (t) => t.subtype === "raumdiagonale"), st(7, (t) => ["aufzug", "trinkhalm"].includes(t.subtype))] }) },
    // --- Körper ---
    { key: "k_einheiten", gebiet: "koerper", teil: "A", afb: 1, titel: "Volumeneinheiten", baue: () => ({ kontext: "", teile: [st(8, (t) => t.subtype === "einheit"), st(8, (t) => t.subtype === "einheit"), st(8, (t) => t.subtype === "einheit")] }) },
    { key: "k_quader", gebiet: "koerper", teil: "A", afb: 1, titel: "Quader", baue: () => { const t = st(8, (x) => x.subtype === "quader"); return { kontext: "", graph: t.task.graph, teile: [t] }; } },
    { key: "k_aussagen", gebiet: "koerper", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => ({ kontext: "", teile: pool3([
      () => aussageTeil(T("Lea behauptet: „Wenn zwei Quader dasselbe Volumen haben, ist auch ihre Oberfläche gleich groß.“"), false, ["Gegenbeispiel: 1 × 1 × 8 (O = 34) und 2 × 2 × 2 (O = 24) haben beide das Volumen 8.", "Stimmt, Volumen und Oberfläche hängen fest zusammen.", "Stimmt nur bei Würfeln."]),
      () => aussageTeil(T("Tim behauptet: „Ein Kegel hat ein Drittel des Volumens eines Zylinders mit gleichem Radius und gleicher Höhe.“"), true, ["V_Kegel = ⅓ · πr²h, V_Zylinder = πr²h.", "Nein, die Hälfte.", "Nein, beide sind gleich groß."]),
      () => aussageTeil(T("Ole behauptet: „Verdoppelt man die Kantenlänge eines Würfels, verdoppelt sich sein Volumen.“"), false, ["(2a)³ = 8a³ – das Volumen wird achtmal so groß.", "Stimmt, Kante und Volumen sind proportional.", "Es wird viermal so groß."])]) }) },
    { key: "k_zylinder", gebiet: "koerper", teil: "B", afb: 2, titel: "Zylinder", baue: () => { const t = st(8, (x) => x.subtype === "zylinder"); return { kontext: "", graph: t.task.graph, teile: [t, st(8, (x) => x.subtype === "zylinderO"), st(8, (x) => x.subtype === "vase")] }; } },
    { key: "k_prisma", gebiet: "koerper", teil: "B", afb: 2, titel: "Prisma", baue: () => ({ kontext: "", teile: [st(8, (x) => x.subtype === "prisma"), st(8, (x) => x.subtype === "prismaHoehe")] }) },
    { key: "k_spitz", gebiet: "koerper", teil: "B", afb: 2, titel: "Spitze Körper und Kugel", baue: () => ({ kontext: "", teile: [st(9, (x) => x.subtype === "pyramide"), st(9, (x) => x.subtype === "kegel"), st(9, (x) => x.subtype === "kugel")] }) },
    { key: "k_pilz", gebiet: "koerper", teil: "B", afb: 3, titel: "Modellieren: Pilze", baue: () => ({ kontext: "", teile: [st(9, (x) => x.subtype === "pilz")] }) }
  ];

  // ---------- Erklärungen ----------
  Object.assign(ERKL, {
    "geometrie/1": E("Winkel an Geradenkreuzungen", [T("Nebenwinkel (nebeneinander) ergänzen sich zu 180°."), T("Scheitelwinkel (gegenüber) sind gleich groß."), T("An geschnittenen PARALLELEN: Stufenwinkel (gleiche Lage) und Wechselwinkel (Z-Form) sind gleich groß.")],
      [{ left: `\\alpha = 55°:\\;\\; ${T("Nebenwinkel")}\\; 125°,\\; ${T("Scheitel-, Stufen-, Wechselwinkel")}\\; 55°`, right: "" }], [T("Nebenwinkel als gleich groß ansehen."), T("Stufen-/Wechselwinkel auch ohne Parallelen gleichsetzen.")], "winkel"),
    "geometrie/2": E("Winkelsummen", [T("Dreieck: α + β + γ = 180°. Viereck: 360°."), T("Gleichschenkliges Dreieck: Basiswinkel gleich groß. Gleichseitiges Dreieck: alle 60°."), T("Außenwinkel = Summe der beiden nicht anliegenden Innenwinkel.")],
      [{ left: `${T("Spitze 40°:")}\\;\\; (180° - 40°) : 2 = 70°`, right: "" }], [T("Bei gleichschenkligen Dreiecken die Spitze mit einem Basiswinkel verwechseln.")]),
    "geometrie/3": E("Flächen von Vielecken", [T("Rechteck a · b,  Parallelogramm a · h,  Dreieck g · h : 2,  Trapez (a + c) · h : 2,  Drachen/Raute e · f : 2."), T("Die Höhe steht immer senkrecht auf der Grundseite.")],
      [{ left: `${T("Trapez:")}\\;\\; \\dfrac{(8 + 4)\\cdot 5}{2} = 30`, right: "" }], [T("Beim Dreieck oder Trapez das „: 2“ vergessen."), T("Die schräge Seite statt der Höhe nehmen.")], "g3"),
    "geometrie/4": E("Zusammengesetzte Figuren", [T("In bekannte Teilfiguren zerlegen ODER zu einer großen Figur ergänzen und den Rest abziehen."), T("Umfang: alle Randstücke zusammenzählen (innere Trennlinien zählen nicht).")],
      [{ left: T("L-Form 12 × 8 mit Ausschnitt 5 × 3:  96 − 15 = 81"), right: "" }], [T("Trennlinien beim Umfang mitzählen.")]),
    "geometrie/5": E("Kreis", [`u = 2\\pi r = \\pi d\\,, \\qquad A = \\pi r^{2}`, T("Kreisring: πR² − πr².  Kreisausschnitt: πr² · α/360°."), T("Rückwärts: r = u : (2π) bzw. r = √(A : π).")],
      [{ left: `r = 5:\\;\\; u \\approx 31,42\\,, \\; A \\approx 78,54`, right: "" }], [T("Mit dem Durchmesser statt dem Radius rechnen."), T("Umfang- und Flächenformel verwechseln.")], "g5"),
    "geometrie/6": E("Satz des Pythagoras", [`a^{2} + b^{2} = c^{2}\\;\\; ${T("(c = Hypotenuse, gegenüber dem rechten Winkel)")}`, T("Kathete gesucht: a² = c² − b². Gilt nur in rechtwinkligen Dreiecken."), T("Umkehrung: Gilt a² + b² = c², ist das Dreieck rechtwinklig.")],
      [{ left: `c = \\sqrt{6^{2} + 8^{2}} = \\sqrt{100} = 10\\,, \\qquad a = \\sqrt{13^{2} - 5^{2}} = 12`, right: "" }], [T("Bei der Kathete addieren statt subtrahieren."), T("Am Ende die Wurzel vergessen.")], "g6"),
    "geometrie/7": E("Pythagoras im Alltag und im Raum", [T("Rechtwinkliges Dreieck in der Situation suchen (Wand–Boden, Breite–Höhe …) und skizzieren."), T("Raumdiagonale im Quader: d = √(a² + b² + c²).")],
      [{ left: `d = \\sqrt{3^{2} + 4^{2} + 12^{2}} = \\sqrt{169} = 13`, right: "" }], [T("Bei der Raumdiagonale nur zwei Kanten nehmen (das ist die Flächendiagonale).")], "g7"),
    "geometrie/8": E("Quader, Prisma, Zylinder", [T("Quader: V = a · b · c, O = 2(ab + ac + bc)."), T("Prisma und Zylinder: V = Grundfläche · Höhe; Zylinder: V = πr²h, M = 2πrh, O = 2πr² + 2πrh."), T("Volumeneinheiten: Faktor 1000; 1 dm³ = 1 l, 1 cm³ = 1 ml.")],
      [{ left: `r = 3,\\; h = 10:\\;\\; V = \\pi\\cdot 9\\cdot 10 \\approx 282,74\\;${T("cm³")}`, right: "" }], [T("Bei Volumeneinheiten mit 10 oder 100 statt mit 1000 umrechnen."), T("Bei der Oberfläche einen der beiden Deckel vergessen.")], "g8"),
    "geometrie/9": E("Pyramide, Kegel, Kugel", [T("Spitze Körper: V = ⅓ · G · h (Pyramide ⅓a²h, Kegel ⅓πr²h)."), `${T("Kugel:")}\\;\\; V = \\dfrac{4}{3}\\pi r^{3}\\,, \\quad O = 4\\pi r^{2}`],
      [{ left: `${T("Kegel")}\\; r = 3,\\; h = 4:\\;\\; V = \\dfrac{1}{3}\\pi\\cdot 9\\cdot 4 \\approx 37,70`, right: "" }], [T("Das ⅓ vergessen."), T("Bei der Kugel r² statt r³ nehmen.")])
  });
  const erklGrafikGeo = erklGrafik;
  erklGrafik = function (art) {
    if (art === "winkel") return winkelSVG(55, { k: 0, pos: "OR", text: "α", farbe: "#2563eb" }, { k: 1, pos: "OR", text: "α′ (Stufenwinkel)", farbe: "#dc2626" });
    if (art === "flaechen") return figurSVG("trapez", { a: "a", c: "c", h: "h" });
    if (art === "kreis") return kreisSVG("kreis", { r: "r" });
    if (art === "pythagoras") return dreieckSVG({ a: 3, b: 4, seiten: { a: "a (Kathete)", b: "b (Kathete)", c: "c (Hypotenuse)" }, winkel: null, rot: 0, spiegel: false });
    if (art === "koerper") return koerperSVG("quader", { a: "a", b: "b", c: "c", diag: "d" });
    return erklGrafikGeo(art);
  };

  // ---------- Fehlerdiagnose ----------
  H.nebenNichtGleich = "Nebenwinkel sind nicht gleich groß – sie ergänzen sich zu 180°.";
  H.gleichNicht180 = "Scheitel-, Stufen- und Wechselwinkel sind gleich groß (nicht 180° minus).";
  H.halbVergessen = "Beim Dreieck, Trapez bzw. Drachen noch durch 2 teilen.";
  H.durchmesserRadius = "Radius und Durchmesser verwechselt? Der Radius ist der halbe Durchmesser.";
  H.umfangFlaeche = "Umfang- und Flächenformel verwechselt? u = 2πr, A = πr².";
  H.katheteAddiert = "Für eine Kathete wird abgezogen: a² = c² − b².";
  H.wurzelGeo = "Fast – das ist das Quadrat der Länge. Noch die Wurzel ziehen.";
  H.volFaktor = "Bei Volumeneinheiten ist der Faktor 1000 (nicht 10 oder 100).";
  H.drittel = "Bei Pyramide und Kegel das ⅓ nicht vergessen.";
  Object.assign(DIAG, {
    "geometrie/1": (t, i, w) => { if (i !== 1) return null; const { a, rel } = t.data; if (rel === "Nebenwinkel" && nah(w.v, a)) return H.nebenNichtGleich; if (rel !== "Nebenwinkel" && nah(w.v, 180 - a) && a !== 90) return H.gleichNicht180; return null; },
    "geometrie/3": (t, i, w) => (i === 0 && ["dreieck", "trapez", "drachen"].includes(t.data.art) && !t.data.rueck && nah(w.v, 2 * t.answer[0]) ? H.halbVergessen : null),
    "geometrie/5": (t, i, w) => { const d = t.data, s = t.subtype; if (!["umfang", "flaeche"].includes(s)) return null; const r = d.r;
      return naechsterHinweis(w.v, [[s === "umfang" ? 4 * Math.PI * r : 4 * Math.PI * r * r, H.durchmesserRadius], [s === "umfang" ? Math.PI * r * r : 2 * Math.PI * r, H.umfangFlaeche]], 0.003); },
    "geometrie/6": (t, i, w) => { const d = t.data; if (t.subtype === "kathete") return naechsterHinweis(w.v, [[Math.sqrt(d.c * d.c + d.b * d.b), H.katheteAddiert], [d.c * d.c - d.b * d.b, H.wurzelGeo]], 0.002);
      if (t.subtype === "hypotenuse" && nah(w.v, d.a * d.a + d.b * d.b)) return H.wurzelGeo; return null; },
    "geometrie/8": (t, i, w) => { if (t.subtype !== "einheit") return null; const d = t.data, rich = (d.w * d.von[1]) / d.nach[1], f = rich / (d.w || 1); return [10, 100, 0.1, 0.01].some((k) => nah(w.v, d.w * (f > 1 ? k : 1 / k)) && Math.abs(rich - w.v) > 1e-9) ? H.volFaktor : null; },
    "geometrie/9": (t, i, w) => (["pyramide", "kegel"].includes(t.subtype) && nah(w.v, 3 * t.answer[0], 0.003) ? H.drittel : null)
  });

  const erklGrafikG2 = erklGrafik;
  erklGrafik = function (art) {
    if (art === "g3") return figurSVG("trapez", { a: "a = 8", c: "c = 4", h: "h = 5" });
    if (art === "g5") return kreisSVG("kreis", { r: "r = 5" });
    if (art === "g6") return dreieckSVG({ a: 6, b: 8, seiten: { a: "a = 6", b: "b = 8", c: "c = ?" }, winkel: null, rot: 0, spiegel: false });
    if (art === "g7") return koerperSVG("quader", { a: "a = 3", b: "b = 4", c: "c = 12", diag: "d = ?" });
    if (art === "g8") return koerperSVG("zylinder", { r: "r = 3", h: "h = 10" });
    return erklGrafikG2(art);
  };
