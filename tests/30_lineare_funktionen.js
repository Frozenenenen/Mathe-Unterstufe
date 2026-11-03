// ============================================================ LINEARE FUNKTIONEN
testLevel("lineare_funktionen", 1, (t) => { const { x1, y1, x2, y2 } = t.data; const g = euklid(y2 - y1, x2 - x1) || 1; let n = (y2 - y1) / g, d = (x2 - x1) / g; if (d < 0) { n = -n; d = -d; } return { num: n, den: d }; }, "Steigung");
testLevel("lineare_funktionen", 2, (t) => { const { x1, y1, x2, y2 } = t.data; const m = (y2 - y1) / (x2 - x1); return [m, y1 - m * x1]; }, "Geradengleichung");
testLevel("lineare_funktionen", 3, (t) => (t.subtype === "parallel" ? { num: t.data.m1, den: 1 } : { num: -1, den: t.data.m1 }), "Parallel/Orthogonal");
testLevel("lineare_funktionen", 4, (t) => {
  const { m1, m2, b1, b2 } = t.data; const x = (b2 - b1) / (m1 - m2);
  if (Math.abs(m1 * x + b1 - (m2 * x + b2)) > 1e-9) throw new Error("Schnittpunkt inkonsistent");
  return [x, m1 * x + b1];
}, "Schnittpunkt");

textRef("lineare_funktionen", 5, (t) => {
  const d = t.dataExtra, k = t.subtype;
  if (k === "taxi") { muss(t, d.B); return [Math.floor((d.B * 100 - Math.round(d.b * 100)) / Math.round(d.m * 100))]; }
  if (k === "handwerker") { [d.R1, d.R2].forEach((x) => muss(t, x)); const r = (d.R2 - d.R1) / (d.h2 - d.h1); return [r, d.R1 - r * d.h1]; }
  if (k === "verleih") { muss(t, d.p); const c1 = d.b + d.m * d.d; return [c1, d.p * c1]; }
  if (k === "strom") { const v = d.z2 - d.z1; return [v, (d.G * 100 + v * d.c) / 100]; }
  if (k === "kerze") { [d.H, d.h].forEach((x) => muss(t, x)); const r = (d.H - d.h) / d.d; return [r, d.t0 + d.H / r]; }
  if (k === "akku") { muss(t, d.now); const r = (d.S - d.now) / d.d; const T0 = d.t0 + d.S / r; if (T0 === d.E) throw new Error("Grenzfall genau gleich"); return [r, T0, T0 > d.E ? "ja" : "nein"]; }
  if (k.startsWith("abo")) {
    [d.b1, d.xp].forEach((x) => muss(t, x));
    if (d.b2 === 0) { if (!/keine/.test(visible(t.prompt))) throw new Error("0 € nicht als 'keine' formuliert"); } else muss(t, d.b2);
    const xT = (d.b1 - d.b2) / (d.m2 - d.m1), kA = d.b1 + d.m1 * d.xp, kB = d.b2 + d.m2 * d.xp;
    if (kA === kB) throw new Error("Plan genau am Gleichstand");
    return [xT, kA < kB ? t.fieldChoices[1][0] : t.fieldChoices[1][2]];
  }
  throw new Error("unbekannter Subtyp " + k);
});

testLevel("lineare_funktionen", 6, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "tabelle") return d.xs.map((x) => { const z = d.mn * x + d.b * d.md, g = euklid(z, d.md) || 1; let n = d.md / g, zz = z / g; if (n < 0) { zz = -zz; n = -n; } return { num: zz, den: n }; });
  if (s === "ankreuzen") { const f = (v) => String(Math.round(v * 100) / 100).replace(".", ",");
    [0, 1, 2].forEach((i) => { if (!t.fieldChoices[i].includes(t.answer[i])) throw new Error("richtige Antwort nicht in der Auswahl"); if (new Set(t.fieldChoices[i]).size !== t.fieldChoices[i].length) throw new Error("doppelte Auswahl"); });
    return [f(d.b), f(-d.b / d.m), f(d.m)]; }
  if (s === "funktion") { const m = {}; let fkt = true; d.paare.forEach(([x, y]) => { if (x in m && m[x] !== y) fkt = false; m[x] = y; }); return [fkt ? "eine Funktion" : "keine Funktion"]; }
  const diffs = d.werte.slice(1).map((y, i) => Math.round((y - d.werte[i]) * 1e9));
  return [diffs.every((x) => x === diffs[0]) ? "linear" : "nicht linear"];
}, "Wertetabelle/Funktionen erkennen");
