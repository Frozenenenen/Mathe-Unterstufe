// ============================================================ STATISTIK & WAHRSCHEINLICHKEIT
// Referenzen eigenständig: Kennwerte selbst berechnet, Wahrscheinlichkeiten durch vollständiges Abzählen.
const sortS = (a) => a.slice().sort((p, q) => p - q);
const medS = (a) => { const s = sortS(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const kz = (n, d) => { const g = euklid(n, d) || 1; return { num: n / g, den: d / g }; };
const r2s = (x) => Math.round(x * 100 + 1e-9) / 100;
testLevel("statistik", 1, (t) => {
  const d = t.data.d, z = new Map(); d.forEach((x) => z.set(x, (z.get(x) || 0) + 1));
  const max = Math.max(...z.values()), mod = [...z].filter(([, c]) => c === max);
  if (mod.length !== 1) throw new Error("Modalwert nicht eindeutig");
  return [r2s(d.reduce((s, x) => s + x, 0) / d.length), medS(d), mod[0][0], Math.round((Math.max(...d) - Math.min(...d)) * 100) / 100];
}, "Kennwerte");
testLevel("statistik", 2, (t) => {
  const d = t.data;
  if (t.subtype === "tabelle") { const L = []; d.werte.forEach((w, i) => { for (let k = 0; k < d.anz[i]; k++) L.push(w); }); return [r2s(L.reduce((s, x) => s + x, 0) / L.length), medS(L)]; }
  for (let x = -100; x <= 100; x++) if (Math.abs((d.gegeben.reduce((s, y) => s + y, 0) + x) / d.n - d.mw) < 1e-9) return [x];
  throw new Error("keine ganze Lösung");
}, "Tabellen/fehlender Wert");
testLevel("statistik", 3, (t) => {
  if (t.subtype === "ablesen") { const w = t.data.w; return [w[2], w[4] - w[0], w[3] - w[1]]; }
  const s = sortS(t.data.d), n = s.length, unten = s.filter((_, i) => i < Math.floor(n / 2)), oben = s.filter((_, i) => i >= Math.ceil(n / 2));
  return [medS(unten), medS(s), medS(oben), medS(oben) - medS(unten)];
}, "Quartile/Boxplot");
testLevel("statistik", 4, (t) => {
  const d = t.data;
  if (t.subtype === "ausreisser") return [r2s(d.d.reduce((s, x) => s + x, 0) / d.d.length), medS(d.d), "Median"];
  return [d.A[2] > d.B[2] ? "8a" : "8b", d.A[3] - d.A[1] < d.B[3] - d.B[1] ? "8a" : "8b", d.B[2] >= d.grenze ? "ja" : "nein"];
}, "Daten beurteilen");
testLevel("statistik", 5, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "wuerfel") { const pr = { "eine gerade Zahl": (x) => x % 2 === 0, "eine Zahl größer als 4": (x) => x > 4, "eine Primzahl": (x) => [2, 3, 5].includes(x), "höchstens eine 2": (x) => x <= 2, "keine 6": (x) => x !== 6, "eine durch 3 teilbare Zahl": (x) => x % 3 === 0 }[d.name];
    const g = [1, 2, 3, 4, 5, 6].filter(pr).length; return [kz(g, 6), kz(6 - g, 6)]; }
  if (s === "urne") return [kz(d.gunstAnz, d.N), kz(d.N - d.gunstAnz, d.N)];
  if (s === "rad") return [kz(d.felder.filter((x) => x === d.z).length, d.felder.length)];
  return [d.k / d.N, "nein"];
}, "Laplace");
testLevel("statistik", 6, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "mindestens") { let gut = 0, alle = 0; const rek = (k, hat6) => { if (k === d.n) { alle++; if (hat6) gut++; return; } for (let w = 1; w <= 6; w++) rek(k + 1, hat6 || w === 6); }; rek(0, false); return [kz(gut, alle)]; }
  const urne = Array(d.r).fill("r").concat(Array(d.b).fill("b")), paare = [];
  const ohne = s === "ergaenzen" ? true : d.ohne;
  urne.forEach((a, i) => urne.forEach((c, j) => { if (!ohne || i !== j) paare.push(a + c); }));
  if (s === "ergaenzen") { const erste = paare.filter((p) => p[0] === d.l[0]); return [kz(erste.filter((p) => p[1] === d.l[1]).length, erste.length)]; }
  const ereignis = { "zweimal rot": (p) => p === "rr", "gleiche Farbe": (p) => p[0] === p[1], "mindestens eine rote": (p) => p.includes("r"), "verschiedene Farben": (p) => p[0] !== p[1] }[d.E];
  return [kz(paare.filter(ereignis).length, paare.length)];
}, "Baumdiagramm");
textRef("statistik", 7, (t) => {
  const d = t.dataExtra, k = t.subtype;
  if (k === "elfmeter") return [Math.round(d.p * d.p * 1e4) / 1e4, Math.round((1 - d.p * d.p) * 1e4) / 1e4];
  if (k === "los") { let gut = 0, alle = 0; for (let i = 0; i < d.N; i++) for (let j = 0; j < d.N; j++) if (i !== j) { alle++; if (i >= d.G && j >= d.G) gut++; } return [kz(gut, alle)]; }
  let anz = 0; for (let c = 0; c < Math.pow(10, d.st); c++) anz++; return [anz, { num: 1, den: anz }];
});
