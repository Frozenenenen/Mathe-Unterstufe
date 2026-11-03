// ============================================================ EXPONENTIALRECHNUNG
testLevel("exponentialrechnung", 1, (t) => { let v = t.data.a; for (let i = 0; i < t.data.x; i++) v *= t.data.b; return ML.round2(v); }, "Wachstum auswerten");
testLevel("exponentialrechnung", 2, (t) => { const d = t.data; return d.mode === "um" ? ML.round2(d.growth ? 1 + d.p / 100 : 1 - d.p / 100) : ML.round2(d.q / 100); }, "Wachstumsfaktor");
testLevel("exponentialrechnung", 3, (t) => ML.round2(Math.log(t.data.c) / Math.log(t.data.b)), "Exponentialgleichungen");
testLevel("exponentialrechnung", 4, (t) => {
  const { a, p, growth, factor, roundMode } = t.data;
  const b = growth ? 1 + p / 100 : 1 - p / 100, target = a * factor;
  if (roundMode === "ceil") { let v = a, k = 0; while (growth ? v <= target : v >= target) { v *= b; k++; } return k; }
  return ML.round2(Math.log(target / a) / Math.log(b));
}, "Anwendungsaufgaben");
testLevel("exponentialrechnung", 5, (t) => {
  const { V, n, VnDisplay, ratio } = t.data;
  const full = ML.round2((Math.exp(Math.log(VnDisplay / V) / n) - 1) * 100);
  const fromShown = ML.round2((Math.exp(Math.log(ratio) / n) - 1) * 100);
  if (Math.abs(full - fromShown) > 0.1) throw new Error("Rechenweg mit angezeigtem Zwischenwert führt zu anderem Ergebnis");
  return full;
}, "Rendite berechnen");

textRef("exponentialrechnung", 6, (t) => {
  const d = t.dataExtra, k = t.subtype;
  // exakt mit BigInt: Faktor = (1000 ± q) / 1000, q = Prozent · 10
  const B = (x) => BigInt(Math.round(x)), q = (p) => Math.round(p * 10);
  const halbAuf = (num, den) => (2n * num + den) / (2n * den);
  const pot = (x, n) => { let r = 1n; for (let i = 0; i < n; i++) r *= x; return r; };
  const schritte = (start, qq, grenze, wachsend) => {
    for (let n = 0; n < 500; n++) {
      const links = B(start) * pot(BigInt(1000 + (wachsend ? qq : -qq)), n), rechts = B(grenze) * pot(1000n, n);
      if (wachsend ? links > rechts : links < rechts) return n;
    }
    throw new Error("keine Lösung");
  };
  if (k === "geschenk") { muss(t, d.K); return [Number(halbAuf(B(d.K) * 100n * pot(BigInt(1000 + q(d.p)), d.N), pot(1000n, d.N))) / 100]; }
  if (k === "sparziel") { muss(t, d.Z); return [schritte(d.K, q(d.p), d.Z, true)]; }
  if (k === "inflation") return [Number(halbAuf(B(d.K) * pot(1000n, d.N), pot(BigInt(1000 + q(d.p)), d.N)))];
  if (k === "auto") return [Number(halbAuf(B(d.K) * pot(BigInt(1000 - q(d.p)), 3), pot(1000n, 3))), schritte(2, q(d.p), 1, false)];
  if (k === "medikament") return [schritte(d.D, q(d.p), d.G, false)];
  if (k === "follower") return [schritte(d.F0, q(d.p), d.Z, true)];
  if (k === "stadt") return [Number(halbAuf(B(d.P0) * pot(BigInt(1000 - q(d.p)), d.N), 100n * pot(1000n, d.N))) * 100];
  if (k === "rendite") { muss(t, d.E); const r = Math.round((Math.exp(Math.log(d.E / d.K) / d.N) - 1) * 10000) / 100; return [r, r > d.vergleich ? "ja" : "nein"]; }
  if (k === "seerose") return [schritte(d.A0, q(d.p), d.teich, true)];
  throw new Error("unbekannter Subtyp " + k);
});

testLevel("exponentialrechnung", 7, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "rest") { let m = d.m0, schritte = 0; for (let z = 0; z < d.t; z += d.TH) { m /= 2; schritte++; } return [m]; } // schrittweise halbieren
  if (s === "zeitBisRest") { let lo = 0, hi = 10000; for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; Math.pow(0.5, mid / d.TH) > d.p / 100 ? (lo = mid) : (hi = mid); } return [Math.round(lo * 10) / 10]; } // Bisektion
  if (s === "verdopplung") { let lo = 0, hi = 1000; for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; Math.pow(1 + d.p / 100, mid) < 2 ? (lo = mid) : (hi = mid); } return [Math.round(lo * 10) / 10]; }
  let lo = 0, hi = 1; for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; Math.pow(mid, d.TH) < 0.5 ? (lo = mid) : (hi = mid); } return [d.m0, Math.round(lo * 10000) / 10000];
}, "Halbwertszeit/Verdopplung");
