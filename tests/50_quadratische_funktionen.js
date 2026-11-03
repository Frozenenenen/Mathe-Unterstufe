// ============================================================ QUADRATISCHE FUNKTIONEN
// Referenzen numerisch auf anderem Weg: Scheitel per Abtastung, Nullstellen per Bisektion
function scheitelNumerisch(f) {
  let best = 0, bv = f(0);
  for (let x = -20; x <= 20; x += 0.5) { const v = f(x); if (v < bv) { bv = v; best = x; } }
  return [best, bv];
}
function nullstellenNumerisch(f) {
  const r = [];
  for (let x = -20; x < 20; x += 0.25) {
    const a = f(x), b = f(x + 0.25);
    if (a === 0) r.push(x);
    else if (a * b < 0) { let lo = x, hi = x + 0.25; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; f(lo) * f(m) <= 0 ? (hi = m) : (lo = m); } r.push((lo + hi) / 2); }
  }
  return r;
}
testLevel("quadratische_funktionen", 1, (t) => {
  const { a, d, e } = t.data, f = (x) => a * (x - d) * (x - d) + e;
  const [xs, ys] = scheitelNumerisch(a > 0 ? f : (x) => -f(x));
  return [xs, a > 0 ? ys : -ys, a > 0 ? "Tiefpunkt" : "Hochpunkt"];
}, "Scheitelpunkt ablesen");
testLevel("quadratische_funktionen", 2, (t) => {
  if (t.subtype === "allgemein") { const { an, ad, b, c } = t.data, a = an / ad, f = (x) => a * x * x + b * x + c;
    const [xs, ys] = scheitelNumerisch(a > 0 ? f : (x) => -f(x)); return [xs, a > 0 ? ys : -ys]; }
  const { p, q } = t.data; return scheitelNumerisch((x) => x * x + p * x + q);
}, "Quadratische Ergänzung");
testLevel("quadratische_funktionen", 3, (t) => {
  // Referenz direkt aus der ANGEZEIGTEN Gleichung (bei "normieren" mit Faktor a vor x²)
  const { p, q } = t.data, a = t.data.an ? t.data.an / t.data.ad : 1, r = nullstellenNumerisch((x) => a * (x * x + p * x + q));
  if (r.length !== 2) throw new Error(`${r.length} Nullstellen gefunden`);
  const st = t.subtype === "wurzel" ? 100 : 1e6;
  return [Math.round(r[0] * st) / st, Math.round(r[1] * st) / st];
}, "p-q-Formel");
testLevel("quadratische_funktionen", 4, (t) => {
  const { p, q } = t.data, [, ymin] = scheitelNumerisch((x) => x * x + p * x + q);
  const anzahl = Math.abs(ymin) < 1e-9 ? 1 : ymin < 0 ? 2 : 0;
  return [-ymin, String(anzahl)]; // D = (p/2)² − q = −(Minimum der Parabel)
}, "Anzahl Lösungen");
testLevel("quadratische_funktionen", 5, (t) => {
  const { a, d, e } = t.data, f = (x) => a * (x - d) * (x - d) + e;
  return [d, e, { num: Math.round((f(d + 1) - f(d)) * 2), den: 2 }];
}, "Parabel ablesen");
textRef("quadratische_funktionen", 6, (t) => {
  const d = t.dataExtra, k = t.subtype;
  const maxStelle = (f, lo, hi) => { let bx = lo, bv = f(lo); for (let x = lo; x <= hi; x += 0.001) { const v = f(x); if (v > bv) { bv = v; bx = x; } } return [Math.round(bx * 100) / 100, bv]; };
  if (k === "wurf") { const h = (x) => -5 * x * x + d.v * x + d.h0; const [ts, hm] = maxStelle(h, 0, 10); const r = nullstellenNumerisch(h).filter((x) => x > 0)[0];
    muss(t, d.v); return [ts, Math.round(hm * 1000) / 1000, Math.round(r * 100) / 100]; }
  if (k === "zaun") { muss(t, d.L); const [x, A] = maxStelle((x) => x * (d.L - 2 * x), 0, d.L / 2); return [x, Math.round(A * 1000) / 1000]; }
  if (k === "bruecke") { [d.w, d.H].forEach((x) => muss(t, x)); const a = -d.H / ((d.w / 2) * (d.w / 2)); const g = euklid(-4 * d.H, d.w * d.w);
    if (Math.abs(a * (d.w / 2) * (d.w / 2) + d.H) > 1e-9) throw new Error("Fußpunkt nicht auf dem Bogen");
    return [{ num: -4 * d.H / g, den: d.w * d.w / g }, Math.round((a * d.s * d.s + d.H) * 100) / 100]; }
  if (k === "preis") { muss(t, d.N); const [p, E] = maxStelle((p) => p * (d.N - d.k * p), 0, d.N / d.k); return [p, Math.round(E)]; }
  throw new Error("unbekannter Subtyp " + k);
});

testLevel("quadratische_funktionen", 7, (t) => {
  const d = t.data;
  if (t.subtype === "scheitel") { const unten = /unten/.test(visible(t.prompt)); return [unten ? -1 : 1, d.d, d.e]; }
  // a so, dass P auf der Parabel liegt – über zwei Punkte unabhängig prüfen
  const a = (d.y1 - d.e) / ((d.x1 - d.d) ** 2), f = (x) => a * (x - d.d) ** 2 + d.e;
  if (Math.abs(f(d.x1) - d.y1) > 1e-9 || Math.abs(f(d.d) - d.e) > 1e-9) throw new Error("Parabel geht nicht durch S und P");
  const g = euklid(Math.round(a * 4), 4); return [{ num: Math.round(a * 4) / g, den: 4 / g }];
}, "Parabel aufstellen");
testLevel("quadratische_funktionen", 8, (t) => {
  const { a, b, c } = t.data, f = (x) => a * x * x + b * x + c;
  if (t.subtype === "diskriminante") { const D = -4 * a * f(-b / (2 * a)); return [Math.round(D), D > 1e-9 ? "2" : D < -1e-9 ? "0" : "1"]; } // D aus dem Scheitelwert
  // Vom Scheitel aus ist f auf jeder Seite monoton: je eine Intervallhalbierung links und rechts (findet auch dicht liegende Nullstellen)
  const xv = -b / (2 * a), halb = (lo, hi) => { if (Math.sign(f(lo)) === Math.sign(f(hi))) return null; for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; Math.sign(f(m)) === Math.sign(f(lo)) ? (lo = m) : (hi = m); } return (lo + hi) / 2; };
  const r = [halb(xv - 1000, xv), halb(xv, xv + 1000)];
  if (r.some((x) => x === null)) throw new Error("keine zwei Nullstellen");
  const st = t.subtype === "wurzel" ? 100 : 1e4;
  return [Math.round(r[0] * st) / st, Math.round(r[1] * st) / st];
}, "Mitternachtsformel");
