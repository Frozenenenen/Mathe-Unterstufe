// ============================================================ GEOMETRIE
// Referenzen auf anderem Weg: Koordinaten (Gaußsche Trapezformel), Kreise als Vielecke,
// Volumen durch Aufsummieren dünner Scheiben (Cavalieri), 3D-Vektoren, Bisektion.
const shoelace = (P) => Math.abs(P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const umfangP = (P) => P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + Math.hypot(q[0] - p[0], q[1] - p[1]); }, 0);
const kreisFl = (r, grad) => { const n = 200000, g = ((grad || 360) * Math.PI) / 180; return (n * r * r * Math.sin(g / n)) / 2; }; // Fächer aus n Dreiecken
const kreisU = (r) => { const n = 200000; return 2 * n * r * Math.sin(Math.PI / n); };
const scheiben = (flaeche, h) => { const n = 20000; let v = 0; for (let i = 0; i < n; i++) v += flaeche(((i + 0.5) * h) / n) * (h / n); return v; };
// +1e-7: Näherungsverfahren landen bei exakten ,5-Grenzfällen sonst knapp darunter
const r2g = (x) => Math.round(x * 100 + 1e-7) / 100, r1g = (x) => Math.round(x * 10 + 1e-7) / 10;
testLevel("geometrie", 1, (t) => {
  if (!/<svg/.test(t.graph || "")) throw new Error("Zeichnung fehlt");
  return [t.data.rel, t.data.rel === "Nebenwinkel" ? 180 - t.data.a : t.data.a];
}, "Winkel an Parallelen");
testLevel("geometrie", 2, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "dreieck") return [180 - d.a - d.b];
  if (s === "viereck") return [360 - d.a - d.b - d.c];
  if (s === "aussen") return [180 - (180 - d.a - d.b)];
  if (s === "gleichschenklig") { for (let x = 0; x <= 180; x += 0.5) { if (d.spitze ? Math.abs(2 * x + d.w - 180) < 1e-9 : Math.abs(2 * d.w + x - 180) < 1e-9) return [x]; } throw new Error("keine Lösung"); }
  let lo = 0, hi = 180; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; m + d.k * m < 180 ? (lo = m) : (hi = m); } return [r1g(lo)];
}, "Winkelsummen");
testLevel("geometrie", 3, (t) => {
  const d = t.data;
  const P = { rechteck: [[0, 0], [d.a, 0], [d.a, d.b], [0, d.b]], parallelogramm: [[0, 0], [d.a, 0], [d.a + 2, d.h], [2, d.h]], dreieck: [[0, 0], [d.g, 0], [1.3, d.h]],
    trapez: [[0, 0], [d.a, 0], [(d.a + d.c) / 2, d.h], [(d.a - d.c) / 2, d.h]], drachen: [[0, 0], [d.f / 2, d.e * 0.3], [0, d.e], [-d.f / 2, d.e * 0.3]] }[d.art];
  if (d.rueck) { if (Math.abs(shoelace(P) - d.A) > 1e-9) throw new Error("angegebene Fläche passt nicht zur Höhe"); return [d.h]; }
  return d.art === "rechteck" ? [shoelace(P), umfangP(P)] : [shoelace(P)];
}, "Flächen");
testLevel("geometrie", 4, (t) => {
  const d = t.data;
  if (t.subtype === "L") { const P = [[0, 0], [d.a, 0], [d.a, d.b - d.d], [d.c, d.b - d.d], [d.c, d.b], [0, d.b]]; return [shoelace(P), umfangP(P)]; }
  return [shoelace([[0, 0], [d.a, 0], [d.a, d.b], [d.a / 2, d.b + d.h], [0, d.b]])];
}, "Zusammengesetzte Figuren");
testLevel("geometrie", 5, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "umfang") return [r2g(kreisU(d.r))];
  if (s === "flaeche") return [r2g(kreisFl(d.r))];
  if (s === "ring") return [r2g(kreisFl(d.R) - kreisFl(d.r))];
  if (s === "sektor") return [r2g(kreisFl(d.r, d.alpha))];
  const f = s === "rueckUmfang" ? kreisU : (r) => kreisFl(r); let lo = 0, hi = 100; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; f(m) < d.wert ? (lo = m) : (hi = m); } return [r2g(lo)];
}, "Kreis");
testLevel("geometrie", 6, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "umkehrung") { const [x, y, z] = d.s, cosG = (x * x + y * y - z * z) / (2 * x * y); return [Math.abs(cosG) < 1e-12 ? "ja" : "nein"]; } // größter Winkel = 90°?
  if (s === "hypotenuse") return [r2g(Math.hypot(d.a, d.b))];
  // Kathete: Punkt auf dem Kreis um A mit Radius c über der Kathete b suchen
  let lo = 0, hi = d.c; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; Math.hypot(d.b, m) < d.c ? (lo = m) : (hi = m); } return [r2g(lo)];
}, "Pythagoras");
textRef("geometrie", 7, (t) => {
  const d = t.dataExtra, k = t.subtype, v3 = (a, b, c) => Math.hypot(a, b, c);
  if (k === "leiter") { muss(t, d.L); let lo = 0, hi = d.L; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; Math.hypot(d.d, m) < d.L ? (lo = m) : (hi = m); } return [r2g(lo)]; }
  if (k === "fernseher") { const D = Math.hypot(d.B, d.Hh); return [r1g(D), r1g(r1g(D) / 2.54)]; }
  if (k === "raumdiagonale") return [r2g(v3(d.a, d.b, d.c))];
  if (k === "aufzug") { const D = v3(d.a, d.b, d.c); return [Math.round(D), D >= d.L * 100 ? "ja" : "nein"]; }
  if (k === "trinkhalm") return [r1g(v3(d.a, d.b, d.c) + 2)];
  let lo = 0, hi = 50; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; m * m + d.seite * d.seite > (m + d.ueber) ** 2 ? (lo = m) : (hi = m); } return [r2g(lo)];
});
testLevel("geometrie", 8, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "einheit") { const exp = { "m³": 9, "dm³": 6, l: 6, "cm³": 3, ml: 3, "mm³": 0 }; return [Number((d.w * Math.pow(10, exp[d.von[0]] - exp[d.nach[0]])).toPrecision(12))]; }
  if (s === "quader") { let flaechen = 0; [[d.a, d.b], [d.a, d.c], [d.b, d.c]].forEach(([x, y]) => { flaechen += 2 * shoelace([[0, 0], [x, 0], [x, y], [0, y]]); }); return [scheiben(() => d.a * d.b, d.c), flaechen].map((x) => Math.round(x * 1e6) / 1e6); }
  if (s === "prisma") return [Math.round(scheiben(() => shoelace([[0, 0], [d.g, 0], [1, d.hg]]), d.h) * 1e6) / 1e6];
  if (s === "prismaHoehe") { const G = shoelace([[0, 0], [d.g, 0], [1, d.hg]]); let lo = 0, hi = 1000; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; G * m < G * d.h ? (lo = m) : (hi = m); } return [Math.round(lo * 1e6) / 1e6]; }
  if (s === "vase") return [r2g((kreisFl(d.r) * d.h * d.anteil[0]) / d.anteil[1] / 1000)];
  if (s === "zylinderO") { const M = kreisU(d.r) * d.h; return [r2g(M), r2g(M + 2 * kreisFl(d.r))]; }
  return [r2g(kreisFl(d.r) * d.h)];
}, "Quader/Prisma/Zylinder");
testLevel("geometrie", 9, (t) => {
  const d = t.data || {}, s = t.subtype;
  if (t.textTask) { const e = t.dataExtra, V = kreisFl(e.rp) * e.hs + scheiben((z) => kreisFl(Math.sqrt(Math.max(0, e.rp * e.rp - z * z))), e.rp); return [r2g(V), e.anz * V > 1000 ? "ja" : "nein"]; }
  if (s === "pyramide") return [r2g(scheiben((z) => (d.a * (1 - z / d.h)) ** 2, d.h))];
  if (s === "kegel") return [r2g(scheiben((z) => kreisFl(d.r * (1 - z / d.h)), d.h))];
  const V = (r) => 2 * scheiben((z) => kreisFl(Math.sqrt(Math.max(0, r * r - z * z))), r);
  if (s === "kugel") return [r2g(V(d.r))];
  const eps = 1e-3; return [r2g((V(d.r + eps) - V(d.r - eps)) / (2 * eps))]; // Oberfläche = Ableitung des Volumens nach r
}, "Pyramide/Kegel/Kugel");
