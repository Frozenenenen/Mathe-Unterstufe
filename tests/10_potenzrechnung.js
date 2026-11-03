// ============================================================ POTENZRECHNUNG
testLevel("potenzrechnung", 1, (t) => {
  const r = manualPow(t.data.a, t.data.n);
  if (Math.abs(r) > 200) throw new Error(`Ergebnis ${r} zu groß für Kopfrechnen`);
  return r;
}, "Potenzen berechnen");
testLevel("potenzrechnung", 2, (t) => {
  const { m, n } = t.data;
  if (t.subtype === "mult") return m + n;
  if (t.subtype === "div") return m - n;
  if (t.subtype === "pow") return m * n;
  if (m % n !== 0) throw new Error("Wurzel-Exponent nicht teilbar");
  return m / n;
}, "Potenzgesetze");
testLevel("potenzrechnung", 3, (t) => (t.subtype === "zero" ? { num: 1, den: 1 } : { num: 1, den: manualPow(t.data.a, t.data.n) }), "Nullter & negativer Exponent");
testLevel("potenzrechnung", 4, (t) => { const { b, k, a } = t.data; if (manualPow(b, k) !== a) throw new Error("b^k != a"); return k; }, "Logarithmus");
testLevel("potenzrechnung", 5, (t) => {
  const d = t.data;
  if (t.subtype === "coefMul") return [d.c1 * d.c2, d.m + d.n];
  if (t.subtype === "coefDiv") return [d.c1 / d.c2, d.m - d.n];
  if (t.subtype === "coefPow") return [manualPow(d.c, d.n), d.m * d.n];
  return [d.a + d.c, d.b + d.d];
}, "Potenzgesetze mit Variablen");
testLevel("potenzrechnung", 6, (t) => {
  if (t.subtype === "sqrt") { const r = Math.round(Math.sqrt(t.data.a)); if (r * r !== t.data.a) throw new Error("kein Quadrat"); return r; }
  if (t.subtype === "cbrt") { const r = Math.round(Math.cbrt(t.data.a)); if (r * r * r !== t.data.a) throw new Error("kein Kubus"); return r; }
  return t.data.a * t.data.b;
}, "Wurzeln");

(function testGraphen() {
  const level = ML.TOPICS.potenzrechnung.levels.find((l) => l.id === 7);
  console.log("Prüfe potenzrechnung Stufe 7 (Graphen zuordnen) ...");
  const before = totalErrors;
  const REF = { "x^{2}": [[2, 4]], "x^{4}": [[2, 16]], "x^{-2}": [[2, 0.25]], "x^{3}": [[-2, -8]], "x^{5}": [[2, 32]], "3x^{5}": [[2, 96]],
    "x^{-1}": [[2, 0.5]], "x^{-3}": [[2, 0.125]], "\\sqrt{x}": [[9, 3]], "\\sqrt[3]{x}": [[-8, -2]], "-\\sqrt[3]{x}": [[8, -2]], "-x^{2}": [[3, -9]] };
  for (let i = 0; i < N; i++) {
    totalChecked++;
    const t = level.generate();
    if (t.graphs.length !== 4 || t.fieldOptions.length !== 6) { fail(`Graphen #${i}: falsche Anzahl`); continue; }
    const cls = t.graphs.map((g) => t.data.allChoiceItems.find((x) => x.term === g.term).cls);
    if (new Set(cls).size !== 4) fail(`Graphen #${i}: doppelte Klasse`);
    t.graphs.forEach((g) => (REF[g.term] || []).forEach(([x, y]) => { if (Math.abs(g.fn(x) - y) > 1e-9) fail(`Graphen #${i}: ${g.term}(${x})`); }));
    if (!level.check(t, t.answer.slice()).correct) fail(`Graphen #${i}: korrekte Zuordnung abgelehnt`);
  }
  done("Graphen", before, N);
})();

(function testKlausur() {
  const level = ML.TOPICS.potenzrechnung.levels.find((l) => l.id === 8);
  const first = level.generate(); const total = first.data.total;
  console.log(`Prüfe potenzrechnung Stufe 8 (Klassenarbeits-Niveau) -- alle ${total} Aufgaben ...`);
  const before = totalErrors;
  const tasks = [first]; for (let i = 1; i < total; i++) tasks.push(level.generate());
  const ids = new Set(tasks.map((t) => t.data.problemId));
  if (ids.size !== total) fail(`Klausur: nur ${ids.size} verschiedene Aufgaben im Zyklus`);
  tasks.forEach((t, i) => { totalChecked++; genericChecks(t, level, i, "Klausur " + t.data.problemId); });
  done("Klausur", before, total);
})();

textRef("potenzrechnung", 9, (t) => {
  const d = t.dataExtra, k = t.subtype;
  if (k === "bakterien") { let n = 0, v = 1; while (v <= d.N) { v *= 2; n++; } return [n, n * d.t]; }
  if (k === "nachricht") return [manualPow(d.q, d.d)];
  if (k === "schach") return [manualPow(2, d.f - 1)];
  if (k === "tank") { let a = 1; while (a * a * a < d.V) a++; if (a * a * a !== d.V) throw new Error("kein Würfelvolumen"); return [a]; }
  if (k === "fliesen") { const ps = (d.s * 100) / d.fl; return [d.s, ps * ps]; }
  if (k === "fotos") return [(d.G * 1e9) / (d.m * 1e6)];
  if (k === "tropfen") { const n = 1000 / d.ml; if (Math.abs(n - Math.round(n)) > 1e-9) throw new Error("keine ganze Tropfenzahl"); return [Math.round(n)]; }
  if (k === "licht") return [Math.round((d.m * Math.pow(10, d.e)) / 3e5 * 100) / 100];
  throw new Error("unbekannter Subtyp " + k);
});

// --- Stufen 10/11: Referenz aus dem angezeigten Text bzw. durch Probieren ---
const normiere = (x) => { const [m, e] = x.toExponential(10).split("e"); return [Number(Number(m).toPrecision(10)), Number(e)]; };
testLevel("potenzrechnung", 10, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "zuWiss") { const zahl = Number(visible(t.prompt).trim().replace(/\./g, "").replace(",", ".")); return normiere(zahl); }
  if (s === "zurueck") return [Number(`${d.m}e${d.e}`)];
  if (s === "einheit") return normiere(Number(`${d.zahl}e${d.ve}`));
  const wert = d.op === "mal" ? Number(`${d.m1 * d.m2}e${d.e1 + d.e2}`) : Number(`${d.m1 / d.m2}e${d.e1 - d.e2}`);
  return normiere(wert);
}, "Wissenschaftliche Schreibweise");
testLevel("potenzrechnung", 11, (t) => {
  const d = t.data, s = t.subtype;
  if (s === "gleicherExp") return [Math.round(d.div ? Math.pow(d.a, d.n) / Math.pow(d.b, d.n) : Math.pow(d.a, d.n) * Math.pow(d.b, d.n))];
  if (s === "zusammenfassen") { const f = (x) => d.ks.reduce((sum, k, i) => sum + d.vz[i] * k * Math.pow(x, d.n), 0); const k = f(2) / Math.pow(2, d.n);
    if (Math.abs(f(3) - k * Math.pow(3, d.n)) > 1e-9) throw new Error("Exponent passt nicht"); return [k, d.n]; }
  if (s === "teilweise") { const N = d.q * d.q * d.r; let best = 1; for (let q = 2; q * q <= N; q++) if (N % (q * q) === 0) best = q; return [best, N / (best * best)]; }
  return [Math.round(((Math.sqrt(d.q1 * d.q1 * d.r) + d.vz * Math.sqrt(d.q2 * d.q2 * d.r)) / Math.sqrt(d.r)) * 1e9) / 1e9];
}, "Zusammenfassen/Wurzeln");
