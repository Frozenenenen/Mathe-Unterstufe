// ============================================================ TERME & GLEICHUNGEN
// Referenzen auf anderem Weg: Terme numerisch auswerten, Lösungen einsetzen, Textaufgaben durchprobieren
function koeffAusWerten(f) { const f0 = f(0), f1 = f(1), f2 = f(2); const A = (f2 - 2 * f1 + f0) / 2; return [A, f1 - f0 - A, f0]; } // ax²+bx+c aus drei Werten
testLevel("terme_gleichungen", 1, (t) => {
  const f = (x) => t.data.glieder.reduce((s, g) => s + g.k * (g.x ? x : 1), 0);
  const [, b, c] = koeffAusWerten(f); return [b, c];
}, "Terme zusammenfassen");
testLevel("terme_gleichungen", 2, (t) => {
  if (t.subtype === "verschachtelt") return null; // eigene Prüfung unten (zwei Variablen)
  const { p, b, c, d, e, f } = t.data, h = (x) => p * (b * x + c) + d * (e * x + f);
  const [A, B, C] = koeffAusWerten(h); if (A !== 0) throw new Error("x² aufgetaucht"); return [B, C];
}, "Klammern auflösen");
testLevel("terme_gleichungen", 3, (t) => {
  const { a, b, c, d } = t.data, x = t.answer[0].num / t.answer[0].den;
  if (Math.abs(a * x + b - (c * x + d)) > 1e-9) throw new Error("Lösung erfüllt die Gleichung nicht");
  if (a === c) throw new Error("nicht eindeutig lösbar");
  return null;
}, "Lineare Gleichungen");
testLevel("terme_gleichungen", 4, (t) => {
  const { a, b, c, d, e } = t.data;
  for (let x = -50; x <= 50; x++) if (a * (x + b) === c * (x + d) + e) return x;
  throw new Error("keine ganzzahlige Lösung gefunden");
}, "Klammergleichungen");
testLevel("terme_gleichungen", 5, (t) => {
  if (["zweiVar", "luecke"].includes(t.subtype)) return null; // eigene Prüfung unten
  const s = t.subtype, d = t.data;
  const f = s === "koeff" ? (x) => (d.k * x + d.m) ** 2 : s === "plus" ? (x) => (x + d.a) ** 2 : s === "minus" ? (x) => (x - d.a) ** 2 : (x) => (x + d.a) * (x - d.a);
  const [A, B, C] = koeffAusWerten(f);
  return s === "koeff" ? [A, B, C] : (A === 1 ? [B, C] : null);
}, "Binomische Formeln");
testLevel("terme_gleichungen", 6, (t) => {
  const s = t.subtype, d = t.data;
  if (s === "ausklammern") { const g = euklid(d.k * d.a, d.k * d.b); if (g !== t.answer[0]) throw new Error("nicht der größte Faktor"); return [g, d.a, d.b]; }
  if (s === "rueckwaerts") { for (let a = -20; a <= 20; a++) if ([0, 1, 2].every((x) => (x + a) ** 2 === x * x + 2 * d.a * x + d.a * d.a)) return [Math.abs(a)]; throw new Error("kein Quadrat"); }
  for (let a = 0; a <= 20; a++) if ([0, 1, 2].every((x) => (x + a) * (x - a) === x * x - d.a * d.a)) return [a];
  throw new Error("nicht faktorisierbar");
}, "Faktorisieren");
testLevel("terme_gleichungen", 7, (t) => {
  const { a1, b1, c1, a2, b2, c2 } = t.data; let gef = [];
  for (let x = -20; x <= 20; x++) for (let y = -20; y <= 20; y++) if (a1 * x + b1 * y === c1 && a2 * x + b2 * y === c2) gef.push([x, y]);
  if (gef.length !== 1) throw new Error(`${gef.length} ganzzahlige Lösungen`);
  return gef[0];
}, "Gleichungssysteme");
textRef("terme_gleichungen", 8, (t) => {
  const d = t.dataExtra, k = t.subtype;
  if (k === "eintritt") { [d.N, d.pe, d.pk].forEach((x) => muss(t, x)); const L = []; for (let e = 0; e <= d.N; e++) if (e * d.pe + (d.N - e) * d.pk === d.E) L.push([e, d.N - e]); if (L.length !== 1) throw new Error("nicht eindeutig"); return L[0]; }
  if (k === "klassenfahrt") { muss(t, d.fix); for (let s = 1; s < 200; s++) if (d.fix + d.pp * s === d.G) return [s]; throw new Error("keine Lösung"); }
  if (k === "rechteck") { muss(t, d.U); for (let b = 1; b < 100; b++) if (2 * b + 2 * (b + d.dlt) === d.U) return [b, b + d.dlt]; throw new Error("keine Lösung"); }
  if (k === "sparen") { [d.s1, d.s2].forEach((x) => muss(t, x)); for (let w = 0; w < 200; w++) if (d.s1 + d.w1 * w === d.s2 - d.w2 * w) return [w, d.s1 + d.w1 * w]; throw new Error("keine Lösung"); }
  throw new Error("unbekannter Subtyp " + k);
});

// --- Stufen 9/10 und neue Typen: Referenz aus den hinterlegten Rechenschritten bzw. durch Einsetzen ---
textRefLevel9: {
  const level = ML.TOPICS.terme_gleichungen.levels.find((l) => l.id === 9);
  testLevel("terme_gleichungen", 9, (t) => {
    const d = t.data, fr = (v) => { const z = Math.round(v * 1000), g = euklid(z, 1000) || 1; return { num: z / g, den: 1000 / g }; };
    if (t.subtype === "text") {
      // exakt mit Brüchen [Zähler, Nenner] rechnen (⅓ ist als Dezimalzahl nicht exakt)
      const red = ([z, nn]) => { const g = euklid(z, nn) || 1; return nn / g < 0 ? [-z / g, -nn / g] : [z / g, nn / g]; };
      const f = (x) => d.ops.reduce(([z, nn], [op, k]) => red(op === "mal" ? [z * k, nn] : op === "durch" ? [z, nn * k] : [z + k * nn, nn]), [x, 1]);
      const [z0, n0] = f(0), [z1, n1] = f(1), stg = red([z1 * n0 - z0 * n1, n1 * n0]);
      return [{ num: stg[0], den: stg[1] }, { num: z0, den: n0 }];
    }
    if (t.subtype === "tabelle") return d.xs.map((x) => fr(d.A * x * x + d.B * x + d.C));
    const x = d.p, mutter = x * d.fm; return [fr(x + d.dm), fr(mutter), fr(mutter + d.dv)];
  }, "Terme aufstellen");
}
testLevel("terme_gleichungen", 10, (t) => {
  const d = t.data;
  // Werte aus der Aufgabe lesen und in die ORIGINALformel einsetzen: das Ergebnis muss sie erfüllen
  const geg = Object.fromEntries([...d.geg.matchAll(/([A-Za-z]) = (-?[\d.]+)/g)].map((m) => [m[1], +m[2]])), x = t.answer[1];
  const g = Object.assign({}, geg, { [d.nach]: x });
  const ok = { "W = U\\cdot I\\cdot t": () => g.W === g.U * g.I * g.t, "U = 2(a + b)": () => g.U === 2 * (g.a + g.b), "A = \\dfrac{(a + c)\\cdot h}{2}": () => g.A === ((g.a + g.c) * g.h) / 2,
    "v = \\dfrac{s}{t}": () => g.v === g.s / g.t, "V = \\dfrac{1}{3}\\cdot G\\cdot h": () => Math.abs(g.V - (g.G * g.h) / 3) < 1e-9 }[d.F];
  if (!ok || !ok()) throw new Error(`Ergebnis erfüllt die Formel ${d.F} nicht`);
  if (!t.fieldChoices[0].includes(t.answer[0]) || new Set(t.fieldChoices[0]).size !== 3) throw new Error("Auswahl kaputt");
  return null;
}, "Formeln umstellen");
(function neueTypen() {
  const L = ML.TOPICS.terme_gleichungen.levels;
  for (let i = 0; i < 3000; i++) {
    totalChecked++;
    const t2 = L[1].generate();
    if (t2.subtype === "verschachtelt") { const { a, b, c, d } = t2.data, f = (x, y) => a - (x + b - (c + y) - d), [p, q, r] = t2.answer;
      [[0, 0], [1, 0], [0, 1], [3, -2]].forEach(([x, y]) => { if (f(x, y) !== p * x + q * y + r) fail(`verschachtelt ${t2.promptText}: falsch`); }); }
    const t5 = L[4].generate();
    if (t5.subtype === "zweiVar") { const { c, k, mi } = t5.data, f = (m) => (c + (mi ? -1 : 1) * k * m) ** 2;
      [0, 1, 2].forEach((m) => { if (f(m) !== t5.answer[0] + t5.answer[1] * m + t5.answer[2] * m * m) fail("zweiVar falsch"); }); }
    if (t5.subtype === "luecke") { const { k, m } = t5.data, [b, mitte] = t5.answer;
      [[1, 1], [2, 3]].forEach(([x, y]) => { if (Math.abs((k * x - b * y) ** 2 - (k * k * x * x - mitte * x * y + m * m * y * y)) > 1e-9) fail("Lücken-Binom falsch"); }); }
  }
})();

console.log("\nPrüfe Eingaben mit Plus/typografischem Minus und (x − ?)² ...");
{
  const before = totalErrors;
  [["+1", 1], ["−1", -1], ["–2,5", -2.5], [" +3 ", 3], ["1", 1]].forEach(([s, v]) => { if (ML.parseUserNumber(s) !== v) fail(`parseUserNumber("${s}") ergibt ${ML.parseUserNumber(s)} statt ${v}`); });
  const L6 = ML.TOPICS.terme_gleichungen.levels.find((l) => l.id === 6);
  let n = 0;
  for (let i = 0; i < 3000; i++) {
    const t = L6.generate(); if (t.subtype !== "rueckwaerts") continue; n++;
    const a = t.data.a, zeichen = a > 0 ? "+" : "-";
    if (!t.question.includes(`(x ${zeichen} `)) fail(`(x ${zeichen} ?)² erwartet: ${t.question}`);
    if (!L6.check(t, [String(Math.abs(a))]).correct) fail(`Betrag ${Math.abs(a)} nicht akzeptiert bei ${t.prompt}`);
  }
  done("eingabe", before, n);
}

// --- Stufe 11: große Gleichungen. Referenz NUR aus dem Aufgabentext: TeX → JS-Ausdruck, numerisch auswerten ---
function ohneMbox(tex) { let o = "", i = 0; const offen = []; while (i < tex.length) { if (tex.startsWith("\\mbox{", i)) { offen.push(0); i += 6; continue; } const c = tex[i]; if (c === "{") offen.push(1); if (c === "}") { if (offen.pop() === 0) { i++; continue; } } o += c; i++; } return o; }
function seiteAusTex(tex) {
  tex = ohneMbox(tex);
  const js = tex.replace(/\^\{2\}/g, "**2").replace(/\s+/g, "")
    .replace(/(\d)(x|\()/g, "$1*$2").replace(/\)\(/g, ")*(").replace(/x/g, "(X)");
  return new Function("X", "return " + js.replace(/^-\(/, "-1*(").replace(/([+-])\(/g, "$1(") + ";");
}
function gliederZahl(tex) { let t = 0, n = 0; for (let i = 0; i < tex.length; i++) { const c = tex[i]; if (c === "(") t++; else if (c === ")") t--; else if (t === 0 && (c === "+" || c === "-") && tex.slice(0, i).trim()) n++; } return n + 1; }
testLevel("terme_gleichungen", 11, (t) => {
  const [l, r] = ohneMbox(t.prompt).split("="); if (gliederZahl(l) !== 4 || gliederZahl(r) !== 4) throw new Error("nicht je 4 Glieder");
  if (!/\^\{2\}|\)\(/.test(t.prompt)) throw new Error("kein Binom");
  const fL = seiteAusTex(l), fR = seiteAusTex(r), f = (x) => fL(x) - fR(x);
  const [A, B, C] = koeffAusWerten(f);
  if (Math.abs(A) > 1e-9) throw new Error("x² hebt sich nicht auf");
  if (Math.abs(B) < 1e-9) throw new Error("keine eindeutige Lösung");
  const x = -C / B; for (let d = 1; d <= 4; d++) if (Math.abs(x * d - Math.round(x * d)) < 1e-9) return [{ num: Math.round(x * d), den: d }];
  throw new Error("Lösung kein einfacher Bruch");
}, "Große Gleichungen mit Binomen");

// --- Rechenzeilen (Stufen 3, 4, 11): jede Zeile des Musterrechenwegs muss als „passt“ gelten,
// eine Zeile mit verändertem Zahlwert (fast immer) als „falsch“; die Ergebniszeile x = … wird erkannt ---
function texZuText(tex) {
  let t = ohneMbox(tex);
  t = t.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, "$1/$2");
  for (let k = 0; k < 5; k++) t = t.replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
  return t.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/\\cdot/g, "*").replace(/\\[,;!]/g, " ");
}
[3, 4, 11].forEach((id) => {
  const level = ML.TOPICS.terme_gleichungen.levels.find((l) => l.id === id);
  console.log(`Prüfe Rechenzeilen Stufe ${id} ...`);
  let falschErkannt = 0, veraendert = 0;
  for (let n = 0; n < 1500; n++) {
    totalChecked++;
    const t = level.generate(), a = t.answer[0], x0 = typeof a === "number" ? a : a.num / a.den;
    if (!t.zeilen) { fail(`Stufe ${id}: Rechenzeilen nicht eingeschaltet`); break; }
    const zeilen = level.steps(t).filter((s) => !s.label && s.left && !/Rightarrow/.test(s.left)).map((s) => texZuText(s.left));
    for (const z of zeilen) { const r = ML.zeilePruefen(z, x0); if (r !== "ok") { fail(`Stufe ${id} (${t.promptText}): Musterzeile „${z}“ gilt als ${r}`); break; } }
    const erg = ML.zeilenErgebnis(zeilen[zeilen.length - 1]);
    if (erg === null || !level.check(t, [erg]).correct) fail(`Stufe ${id}: Ergebniszeile „${zeilen[zeilen.length - 1]}“ nicht als richtig erkannt`);
    if (level.check(t, [ML.zeilenErgebnis(`x = ${x0 + 1}`)]).correct) fail(`Stufe ${id}: falsches Ergebnis akzeptiert`);
    // eine Zahl in der ersten Zeile um 1 verändern
    const z0 = zeilen[0], m = [...z0.matchAll(/\d+/g)]; if (!m.length) continue;
    const w = m[n % m.length], kaputt = z0.slice(0, w.index) + (Number(w[0]) + 1) + z0.slice(w.index + w[0].length);
    veraendert++; if (ML.zeilePruefen(kaputt, x0) === "falsch") falschErkannt++;
  }
  if (falschErkannt < 0.9 * veraendert) fail(`Stufe ${id}: nur ${falschErkannt}/${veraendert} veränderte Zeilen als falsch erkannt`);
});
