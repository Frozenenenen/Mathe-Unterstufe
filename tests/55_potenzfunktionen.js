// ============================================================ POTENZFUNKTIONEN
// Referenzen auf anderem Weg: Symmetrie/Definitionslücke numerisch, Gleichungen durch
// Durchprobieren bzw. Bisektion, n aus dem Quotienten durch Suchen, Verschiebung aus dem
// angezeigten Funktionsterm geparst, Graph aus den SVG-Pfadpunkten zurückgerechnet.
const pfF = (d) => (x) => (d.p / d.q) * Math.pow(x, d.n);
const pfKz = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = euklid(n, d) || 1; return { num: n / g, den: d / g }; };
const alsBruch = (v) => { for (let d = 1; d <= 4096; d++) { const n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-9) return pfKz(n, d); } throw new Error("kein Bruch: " + v); };
testLevel("potenzfunktionen", 1, (t) => {
  const f = pfF(t.data), xs = [0.5, 1.3, 2, 2.7];
  const achse = xs.every((x) => Math.abs(f(-x) - f(x)) < 1e-9), punkt = xs.every((x) => Math.abs(f(-x) + f(x)) < 1e-9);
  if (achse === punkt) throw new Error("Symmetrie nicht eindeutig");
  const luecke = !isFinite(f(0));
  return [achse ? "achsensymmetrisch zur y-Achse" : "punktsymmetrisch zum Ursprung", luecke ? "alle reellen Zahlen außer 0" : "alle reellen Zahlen",
    luecke && Math.abs(f(1e6)) < 1e-3 ? "x-Achse und y-Achse" : "keine Asymptoten"];
}, "Eigenschaften");
// Graphen zuordnen: jeder angezeigte Term muss zur gezeichneten Funktion passen (eigene Termtabelle)
const PF_TERME = { "x^{2}": (x) => x * x, "x^{4}": (x) => x ** 4, "x^{-2}": (x) => x ** -2, "x^{3}": (x) => x ** 3, "x^{5}": (x) => x ** 5, "3x^{5}": (x) => 3 * x ** 5,
  "x^{-1}": (x) => 1 / x, "x^{-3}": (x) => x ** -3, "\\sqrt{x}": (x) => Math.sqrt(x), "\\sqrt[3]{x}": (x) => Math.cbrt(x), "-\\sqrt[3]{x}": (x) => -Math.cbrt(x), "-x^{2}": (x) => -x * x };
testLevel("potenzfunktionen", 2, (t) => t.graphs.map((g) => {
  const ref = Object.keys(PF_TERME).filter((k) => [0.5, 1.5, 1.9].every((x) => Math.abs(PF_TERME[k](x) - g.fn(x)) < 1e-9));
  if (ref.length !== 1) throw new Error(`${ref.length} passende Terme für ${g.id}`);
  return ref[0];
}), "Graphen zuordnen");
testLevel("potenzfunktionen", 3, (t) => {
  const d = t.data, v = alsBruch(pfF(d)(d.x0));
  if (t.subtype === "wert") return [v];
  return [Math.abs(d.y.num / d.y.den - pfF(d)(d.x0)) < 1e-9 ? "ja" : "nein"];
}, "Funktionswerte/Punktprobe");
testLevel("potenzfunktionen", 4, (t) => {
  const { a, n, c } = t.data;
  if (t.subtype === "exakt") {
    const L = []; for (let x = -30; x <= 30; x++) if (a * x ** n === c) L.push(x);
    return [L.length ? "{ " + L.join("; ") + " }" : "{ } (keine Lösung)"];
  }
  // Nullstellen von g(x) = a·xⁿ − c durch Vorzeichenwechsel auf feinem Raster + Bisektion
  const g = (x) => a * x ** n - c, roots = [];
  for (let x = -20; x < 20; x += 0.01) if (g(x) === 0 || g(x) * g(x + 0.01) < 0) { let lo = x, hi = x + 0.01; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; } roots.push((lo + hi) / 2); }
  return [String(roots.length), Math.round(Math.max(...roots) * 100) / 100];
}, "Potenzgleichungen");
testLevel("potenzfunktionen", 5, (t) => {
  const d = t.data, yv = (f) => f.num / f.den;
  if (t.subtype === "einPunkt") return [alsBruch(yv(d.y) / d.x0 ** d.n)];
  const ns = []; for (let k = -6; k <= 6; k++) if (k !== 0 && Math.abs(yv(d.y1) * (2 * d.x1) ** k - yv(d.y2) * d.x1 ** k) < 1e-9) ns.push(k);
  if (ns.length !== 1) throw new Error("n nicht eindeutig");
  return [ns[0], alsBruch(yv(d.y1) / d.x1 ** ns[0])];
}, "Funktionsterm bestimmen");
testLevel("potenzfunktionen", 6, (t) => {
  if (t.subtype === "ablesen") {
    // Pfadpunkte der Kurve zurückrechnen (Plotfenster ±5 um den Ursprung der Verschiebung) und prüfen
    const [d, e, a] = t.answer, n = t.data.n, W = 280, H = 260, pl = 24, pr = 8, pt = 8, pb = 20;
    const pfad = (t.graph.match(/<path d="([^"]+)" fill="none" stroke="#2563eb"/) || [])[1];
    if (!pfad) throw new Error("kein Graph");
    const pts = [...pfad.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map((m) => [d - 5 + ((+m[1] - pl) / (W - pl - pr)) * 10, e + 5 - ((+m[2] - pt) / (H - pt - pb)) * 10]);
    const schlecht = pts.filter(([x, y]) => Math.abs(y - e) < 5 && Math.abs(y - (a * (x - d) ** n + e)) > 0.15 * Math.max(1, Math.abs(a * n * (x - d) ** (n - 1))));
    if (pts.length < 50 || schlecht.length > 2) throw new Error(`Graph passt nicht (${schlecht.length} Abweichungen)`);
    return [d, e, a];
  }
  // Term aus dem Prompt lesen: f(x) = [a](x ∓ d)^{n} ± e
  const m = t.prompt.match(/^f\(x\) = (-?\d*)(?:x|\(x ([+-]) (\d+)\))\^\{(-?\d+)\}(?: ([+-]) (\d+))?$/);
  if (!m) throw new Error("Term nicht lesbar: " + t.prompt);
  const a = m[1] === "" ? 1 : m[1] === "-" ? -1 : +m[1], d = m[2] ? (m[2] === "-" ? +m[3] : -m[3]) : 0, e = m[5] ? (m[5] === "+" ? +m[6] : -m[6]) : 0;
  const s = t.answer[0];
  const ok = (d === 0 || s.includes(`${Math.abs(d)} nach ${d > 0 ? "rechts" : "links"}`)) && (e === 0 || s.includes(`${Math.abs(e)} nach ${e > 0 ? "oben" : "unten"}`))
    && (a < 0) === s.includes("gespiegelt") && (Math.abs(a) > 1) === s.includes("gestreckt") && !(d === 0 && /nach (rechts|links)/.test(s)) && !(e === 0 && /nach (oben|unten)/.test(s));
  if (!ok) throw new Error("Beschreibung passt nicht zum Term: " + s);
  if (new Set(t.fieldChoices[0]).size !== t.fieldChoices[0].length) throw new Error("doppelte Auswahl");
  return [s];
}, "Verschieben/Strecken");
textRef("potenzfunktionen", 7, (t) => {
  const vis = visible(t.prompt), k = t.subtype;
  if (k === "faktor") {
    const n = /r⁻²/.test(vis) ? -2 : /r³|a³/.test(vis) ? 3 : 2, s = /verdoppelt/.test(vis) ? 2 : /verdreifacht/.test(vis) ? 3 : 0.5;
    return [alsBruch((s * 1.7) ** n / 1.7 ** n)];
  }
  if (k === "bremsweg") { const z = vis.match(/(\d+) (km\/h|m lang)/); return [z[2] === "km/h" ? (z[1] / 10) ** 2 : 10 * Math.sqrt(+z[1])]; }
  const V = +vis.match(/Volumen von (\d+)/)[1]; let lo = 0, hi = 100; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if ((4 / 3) * Math.PI * m ** 3 < V) lo = m; else hi = m; }
  return [Math.round(lo * 10) / 10];
});
