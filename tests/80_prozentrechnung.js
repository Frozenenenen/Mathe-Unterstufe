// ============================================================ PROZENTRECHNUNG
// Referenzen exakt in ganzen Cent bzw. Zehntel-Prozent (BigInt), kaufmännisch gerundet
const HA = (num, den) => { num = BigInt(num); den = BigInt(den); const neg = (num < 0n) !== (den < 0n); num = num < 0n ? -num : num; den = den < 0n ? -den : den; const q = (2n * num + den) / (2n * den); return Number(neg ? -q : q); };
const ct = (x) => Math.round(x * 100), p10 = (p) => Math.round(p * 10);
testLevel("prozentrechnung", 1, (t) => {
  const p = t.data.p, n = p10(p), g = euklid(n, 1000), fr = { num: n / g, den: 1000 / g };
  return { prozent: [fr, p / 100], bruch: [p, p / 100], dezimal: [p, fr], worte: [p, fr] }[t.subtype];
}, "Prozent/Bruch/Dezimal");
testLevel("prozentrechnung", 2, (t) => HA(t.data.G * p10(t.data.p), 10) / 100, "Prozentwert");
testLevel("prozentrechnung", 3, (t) => {
  const { G, p, W } = t.data; if ((G * p10(p)) % 10 !== 0) throw new Error("Prozentwert nicht centgenau – Grundwert wäre mehrdeutig");
  return HA(ct(W) * 1000, p10(p)) / 100;
}, "Grundwert");
testLevel("prozentrechnung", 4, (t) => HA(t.data.W * 1000, t.data.G) / 10, "Prozentsatz");
testLevel("prozentrechnung", 5, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "rabatt") return HA(ct(d.alt) * (100 - d.p), 100) / 100;
  if (s === "originalpreis") { if (ct(d.neu) !== HA(ct(d.alt) * (100 - d.p), 100)) throw new Error("angezeigter Preis falsch"); return HA(ct(d.neu) * 100, 100 - d.p) / 100; }
  if (s === "aufschlag") return HA(d.netto * 100 * 119, 100) / 100;
  return HA(ct(d.brutto) * 100, 119) / 100;
}, "Rabatt/MwSt");
testLevel("prozentrechnung", 6, (t) => {
  const { a, b } = t.data, proz = HA((b - a) * 1000, a) / 10;
  return t.subtype === "punkte" ? [b - a, proz] : [proz];
}, "Veränderung");
testLevel("prozentrechnung", 7, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "jahr") return HA(d.K * p10(d.p) * 100, 1000) / 100;
  if (s === "monate") return HA(d.K * 100 * p10(d.p) * d.m, 10 * 1200) / 100;
  if (s === "tage") return HA(d.K * 100 * p10(d.p) * d.t, 10 * 36000) / 100;
  return d.K;
}, "Zinsen");
textRef("prozentrechnung", 8, (t) => {
  const d = t.dataExtra, k = t.subtype;
  if (k === "doppelrabatt") { muss(t, d.preis); return [HA(d.preis * 100 * (100 - d.r1) * (100 - d.r2), 10000) / 100, HA(10 * (100 * d.r1 + 100 * d.r2 - d.r1 * d.r2), 100) / 10]; }
  if (k === "rechnung") { const n = d.std * d.lohn * 100 + ct(d.mat), mw = HA(n * 19, 100); return [n / 100, mw / 100, (n + mw) / 100]; }
  if (k === "angebote") { const a = HA(d.pA * 100 * (100 - d.rA), 100), b = (d.pB - d.rB) * 100; if (a === b) throw new Error("gleich teuer"); return [a < b ? "Laden A" : "Laden B", Math.abs(a - b) / 100]; }
  if (k === "zucker") { [d.port, d.zucker].forEach((x) => muss(t, x)); const an = HA(d.zucker * 1000, d.port) / 10; return [an, HA(d.zucker * d.pack * 10, d.port) / 10, an < 10 ? "ja" : "nein"]; }
  throw new Error("unbekannter Subtyp " + k);
});

textRef("prozentrechnung", 9, (t) => {
  const d = t.dataExtra;
  if (t.subtype === "kreis") {
    if (d.i === d.j) throw new Error("geschätzte Kategorie wird verraten");
    if (d.proz.reduce((x, y) => x + y, 0) !== 100) throw new Error("Anteile ergeben nicht 100 %");
    if (/genau [^.]*\b/.test("") || visible(t.question).includes(`genau ${d.proz[d.i]} %`) && d.proz[d.i] !== d.proz[d.j]) throw new Error("Schätzwert wird im Text genannt");
    return [d.proz[d.i], (d.N * d.proz[d.j]) / 100];
  }
  const w = d.werte, achsenAnfang = (t.graph.match(/text-anchor="end">([\d,]+)</) || [])[1];
  if ((achsenAnfang === "0") !== !!d.ehrlich) throw new Error(`Achse beginnt bei ${achsenAnfang}, aber ehrlich=${d.ehrlich}`);
  return [HA(Math.round((w[4] - w[0]) * 100) * 1000, Math.round(w[0] * 100)) / 10, d.ehrlich ? "nein" : "ja"];
});
