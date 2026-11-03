// ============================================================ BRÜCHE
testLevel("brueche", 1, (t) => {
  const { a, b, c, d, mode, k } = t.data;
  if (a === c && b === d) throw new Error("identische Brüche");
  if (mode === "expanded" && !((k >= 2 && k <= 5) && ((c === a * k && d === b * k) || (a === c * k && b === d * k)))) throw new Error("keine Erweiterung mit 2-5");
  const v = a * d - c * b; return v > 0 ? ">" : v < 0 ? "<" : "=";
}, "Was ist größer?");
testLevel("brueche", 2, (t) => {
  const { a, b, c, d } = t.data;
  if (b === d) throw new Error("gleiche Nenner"); if (a === c && b === d) throw new Error("identisch");
  const v = a * d - c * b; return [(b * d) / euklid(b, d), v > 0 ? ">" : v < 0 ? "<" : "="];
}, "Ungleichnamig");
testLevel("brueche", 3, (t) => {
  const { a, b } = t.data; const g = euklid(a, b);
  if (g < 2) throw new Error("nicht kürzbar");
  // streng: ungekürzt / teilweise gekürzt muss abgelehnt werden
  const level = ML.TOPICS.brueche.levels.find((l) => l.id === 3);
  if (level.check(t, [String(g), `${a}/${b}`]).correct) throw new Error("ungekürzter Bruch akzeptiert");
  let sp = 2; while (g % sp) sp++;
  if (sp !== g && level.check(t, [String(g), `${a / sp}/${b / sp}`]).correct) throw new Error("teilweise gekürzt akzeptiert");
  return [g, { num: a / g, den: b / g }];
}, "Kürzen (ggT)");

textRef("brueche", 4, (t) => {
  const d = t.dataExtra;
  if (/frac/.test(t.prompt)) throw new Error("Bruch steht im Aufgabentext");
  const red = (n, m) => { const g = euklid(n, m); return { num: n / g, den: m / g }; };
  if (d.kind === "fussball") { [d.b, d.w, d.u].forEach((x) => muss(t, x)); return [red(d.b - d.w - d.u, d.b)]; }
  if (d.kind === "anteil") { muss(t, d.a); return [red(d.rest ? d.b - d.a : d.a, d.b)]; }
  if (d.s[0].b === d.s[1].b) throw new Error("gleiches Ganzes");
  const fr = d.s.map((x) => { muss(t, x.a); if (d.ganzesVersteckt) muss(t, x.b - x.a); else muss(t, x.b); return red(d.rest ? x.b - x.a : x.a, x.b); });
  const diff = fr[0].num * fr[1].den - fr[1].num * fr[0].den;
  const w = diff === 0 ? d.choices[1] : (d.besser === "weniger" ? (diff < 0 ? d.choices[0] : d.choices[2]) : (diff > 0 ? d.choices[0] : d.choices[2]));
  return [fr[0], fr[1], w];
});

// --- Bruchrechnung (Stufen 5–8): Referenzen mit ganzzahliger Bruchrechnung bzw. schriftlicher Division ---
const kuerze = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = euklid(n, d) || 1; return { num: n / g, den: d / g }; };
testLevel("brueche", 5, (t) => { const { g, n, d } = t.data; return t.subtype === "zuUnecht" ? [kuerze(g * d + n, d)] : [Math.floor((g * d + n) / d), kuerze((g * d + n) % d, d)]; }, "Gemischte Zahlen");
testLevel("brueche", 6, (t) => {
  const { a, b, c, d, g1, g2, op } = t.data, z1 = g1 * b + a, z2 = g2 * d + c;
  const n = op === "+" ? z1 * d + z2 * b : z1 * d - z2 * b; if (n <= 0) throw new Error("negatives Ergebnis");
  return [kuerze(n, b * d)];
}, "Addieren/Subtrahieren");
testLevel("brueche", 7, (t) => { const { A, B, C, D, op } = t.data; return [op === ":" ? kuerze(A * D, B * C) : kuerze(A * C, B * D)]; }, "Multiplizieren/Dividieren");
testLevel("brueche", 8, (t) => {
  const { n, d } = t.data;
  if (t.subtype === "art") { // schriftliche Division: wiederholt sich ein Rest ≠ 0, ist der Bruch periodisch
    const reste = new Set(); let r = n % d;
    while (r !== 0 && !reste.has(r)) { reste.add(r); r = (r * 10) % d; }
    return [r === 0 ? "abbrechend" : "periodisch"];
  }
  return t.subtype === "zuDezimal" ? [n / d] : [kuerze(n, d)];
}, "Dezimalbrüche");

// --- Stufe 9: Zahlenstrahl. Referenz liest NUR die Zeichnung (SVG) aus: Striche, Beschriftungen, Pfeile ---
function strahlAusSVG(svg) {
  const striche = [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="\1" y2="([\d.]+)" stroke="#111"/g)].map((m) => +m[1]).sort((a, b) => a - b);
  const idx = (x) => { const i = striche.findIndex((s) => Math.abs(s - x) < 0.6); if (i < 0) throw new Error("Pfeil/Beschriftung nicht auf einem Strich"); return i; };
  const labels = [...svg.matchAll(/<text x="([\d.]+)" y="72" font-size="14" text-anchor="middle">(\d+)<\/text>/g)].map((m) => ({ i: idx(+m[1]), z: +m[2], n: 1 }));
  const zaehler = [...svg.matchAll(/<text x="([\d.]+)" y="70" font-size="15" text-anchor="middle">(\d+)<\/text>/g)], nenner = [...svg.matchAll(/<text x="([\d.]+)" y="90" font-size="15" text-anchor="middle">(\d+)<\/text>/g)];
  zaehler.forEach((m, j) => labels.push({ i: idx(+m[1]), z: +m[2], n: +nenner[j][2] }));
  const pfeile = [...svg.matchAll(/<path d="M([\d.]+) 24 L([\d.]+) 24/g)].map((m) => idx((+m[1] + +m[2]) / 2));
  const buchst = [...svg.matchAll(/<text x="([\d.]+)" y="10"[^>]*>([A-E])<\/text>/g)].map((m) => ({ i: idx(+m[1]), b: m[2] }));
  if (labels.length < 2) throw new Error("weniger als zwei Beschriftungen");
  const [a, b] = labels.sort((p, q) => p.i - q.i);
  // Wert am Strich i: a + (i − a.i)·(b − a)/(b.i − a.i), exakt als Bruch
  const wert = (i) => kuerze(a.z * b.n * (b.i - a.i) + (i - a.i) * (b.z * a.n - a.z * b.n), a.n * b.n * (b.i - a.i));
  return { wert, pfeile, buchst, striche: striche.length };
}
testLevel("brueche", 9, (t) => {
  const S = strahlAusSVG(t.graph);
  if (t.subtype !== "eintragen") {
    if (S.pfeile.length !== 1) throw new Error("nicht genau ein Pfeil");
    const L = ML.TOPICS.brueche.levels.find((l) => l.id === 9), r = S.wert(S.pfeile[0]);
    // gleichwertige Schreibweise muss zählen, Nachbarwert nicht
    if (!L.check(t, [`${r.num * 3}/${r.den * 3}`]).correct) throw new Error("erweiterte Form abgelehnt");
    if (L.check(t, [`${r.num + 1}/${r.den}`]).correct) throw new Error("falscher Bruch akzeptiert");
    return [r];
  }
  // Bruch aus der Aufgabe: gemischte Zahl "G z n" oder "z n"
  const zahlen = visible(t.prompt).match(/\d+/g).map(Number);
  const ziel = zahlen.length === 3 ? kuerze(zahlen[0] * zahlen[2] + zahlen[1], zahlen[2]) : kuerze(zahlen[0], zahlen[1]);
  const treffer = S.buchst.filter((x) => { const w = S.wert(x.i); return w.num === ziel.num && w.den === ziel.den; });
  if (treffer.length !== 1) throw new Error(`${treffer.length} passende Buchstaben`);
  if (S.buchst.length < 4) throw new Error("zu wenige Auswahlstellen");
  return [treffer[0].b];
}, "Brüche am Zahlenstrahl");

// --- Stufe 10: Tortenstücke. Referenz zählt NUR die gezeichneten Stücke und ihre Farben (SVG) ---
function tortenAusSVG(html) {
  return html.split('<g transform').slice(1).map((teil) => {
    const stuecke = [...teil.matchAll(/(?:<path|<circle)[^>]*fill="([^"]+)"[^>]*data-stueck="(\d+)"/g)].map((m) => m[1]);
    const name = (teil.match(/class="tortenname">([^<]+)</) || [])[1] || "";
    return { n: stuecke.length, blau: stuecke.filter((f) => f === "#60a5fa").length, rot: stuecke.filter((f) => f === "#f87171").length, name };
  });
}
testLevel("brueche", 10, (t) => {
  const T10 = tortenAusSVG(t.graph), s = t.subtype, L = ML.TOPICS.brueche.levels.find((l) => l.id === 10);
  if (T10.some((x) => x.n < 1 || x.n > 12)) throw new Error("unpassende Stückzahl");
  let r;
  if (s === "ablesen") r = [kuerze(T10[0].blau, T10[0].n)];
  else if (s === "rest") r = [kuerze(T10[0].n - T10[0].blau, T10[0].n)];
  else if (s === "zweiFarben") r = [kuerze(T10[0].blau, T10[0].n), kuerze(T10[0].rot, T10[0].n), kuerze(T10[0].blau + T10[0].rot, T10[0].n)];
  else if (s === "vergleichen") { const [A, B] = T10, v = A.blau * B.n - B.blau * A.n; r = [kuerze(A.blau, A.n), kuerze(B.blau, B.n), v > 0 ? "Torte A" : v < 0 ? "Torte B" : "gleich viel"]; }
  else if (s === "zuordnen") {
    const zahlen = visible(t.prompt).match(/\d+/g).map(Number), ziel = kuerze(zahlen[0], zahlen[1]);
    const treffer = T10.filter((x) => { const k = kuerze(x.blau, x.n); return k.num === ziel.num && k.den === ziel.den; });
    if (treffer.length !== 1 || T10.length !== 4) throw new Error(`${treffer.length} passende Torten von ${T10.length}`);
    r = [treffer[0].name];
  } else { // gemischt: volle Torten + eine angeschnittene
    const voll = T10.filter((x) => x.blau === x.n).length, rest = T10.filter((x) => x.blau < x.n);
    if (rest.length !== 1) throw new Error("nicht genau eine angeschnittene Torte");
    r = [voll, kuerze(rest[0].blau, rest[0].n), kuerze(voll * rest[0].n + rest[0].blau, rest[0].n)];
  }
  // gleichwertige (erweiterte) Brüche müssen zählen
  const erw = r.map((x) => (x && typeof x === "object" ? `${x.num * 2}/${x.den * 2}` : String(x)));
  if (!L.check(t, erw).correct) throw new Error("erweiterte Schreibweise abgelehnt");
  return r;
}, "Tortenstücke");
