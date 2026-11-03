// Hilfsfunktion: Ergebnis von Stufe Trig/3, wenn der Taschenrechner im RAD-Modus rechnet
function SIN_RAD(t) {
  const { al, gg, gs, x } = t.data, f = { sin: Math.sin, cos: Math.cos, tan: Math.tan }[t.data.fn];
  if (gs === "c") return x / f(al);
  if (gg === "c" || (t.data.fn === "tan" && gs === "a")) return x * f(al);
  return x / f(al);
}
// ============================================================ FEHLERDIAGNOSE
console.log("\nPrüfe Fehlerdiagnose ...");
(function testDiagnose() {
  const before = totalErrors;
  const H = ML.DIAG_HINWEISE;
  const erlaubt = new Set(Object.values(H));
  const s = (x) => String(x).replace(".", ",");
  const ok = (t) => t.answer.map((a, j) => (t.fieldKinds && t.fieldKinds[j] === "choice") || (t.perFieldType && t.perFieldType[j] === "choice") || t.fieldType === "choice" ? a : isFrac(a) ? `${a.num}/${a.den}` : s(a));
  // [Thema, Stufe, Bedingung, Eingabe-Bauer, Feld, erwarteter Hinweis]
  const faelle = [
    ["potenzrechnung", 1, (t) => Math.abs(t.data.a * t.data.n) !== Math.abs(t.answer[0]), (t) => [s(t.data.a * t.data.n)], 0, "potenzNichtMal"],
    ["potenzrechnung", 2, (t) => t.subtype === "mult" && t.data.m * t.data.n !== t.data.m + t.data.n, (t) => [s(t.data.m * t.data.n)], 0, "expAddieren"],
    ["potenzrechnung", 2, (t) => t.subtype === "pow" && t.data.m * t.data.n !== t.data.m + t.data.n, (t) => [s(t.data.m + t.data.n)], 0, "expMultiplizieren"],
    ["potenzrechnung", 2, (t) => t.subtype === "div", (t) => [s(t.data.m + t.data.n)], 0, "expSubtrahieren"],
    ["potenzrechnung", 3, (t) => t.subtype === "zero", () => ["0"], 0, "nullExponent"],
    ["potenzrechnung", 3, (t) => t.subtype === "neg" && Math.abs(t.data.den) > 1, (t) => [`-1/${t.data.den}`], 0, "negExpNichtNegativ"],
    ["potenzrechnung", 3, (t) => t.subtype === "neg" && Math.abs(t.data.den) > 1, (t) => [String(t.data.den)], 0, "negExpKehrwert"],
    ["potenzrechnung", 5, (t) => t.subtype === "coefPow" && t.data.c * t.data.n !== t.answer[0], (t) => [s(t.data.c * t.data.n), s(t.answer[1])], 0, "koeffPotenz"],
    ["potenzrechnung", 6, (t) => t.subtype === "productLaw" && t.data.a + t.data.b !== t.answer[0], (t) => [s(t.data.a + t.data.b)], 0, "wurzelProdukt"],
    ["exponentialrechnung", 2, (t) => t.data.mode === "um" && t.data.growth, (t) => [s(t.data.p / 100)], 0, "umProzent"],
    ["exponentialrechnung", 2, (t) => t.data.mode === "um" && !t.data.growth, (t) => [s(ML.round2(1 + t.data.p / 100))], 0, "zuAb"],
    ["exponentialrechnung", 2, (t) => t.data.mode === "auf" && t.data.q !== 50, (t) => [s(ML.round2(1 - t.data.q / 100))], 0, "aufProzent"],
    ["exponentialrechnung", 4, (t) => t.data.roundMode === "ceil", (t) => [s(t.answer[0] - 1)], 0, "aufrunden"],
    ["exponentialrechnung", 5, () => true, (t) => [s(ML.round2(Math.pow(t.data.VnDisplay / t.data.V, 1 / t.data.n) * 1000) / 1000)], 0, "faktorStattRendite"],
    ["lineare_funktionen", 3, (t) => t.subtype === "ortho" && Math.abs(t.data.m1) > 1, (t) => [s(-t.data.m1)], 0, "senkrecht"],
    ["lineare_funktionen", 3, (t) => t.subtype === "parallel" && Math.abs(t.data.m1) > 1, (t) => [`-1/${t.data.m1}`], 0, "parallel"],
    ["lineare_funktionen", 2, (t) => t.data.b !== 0 && t.data.y1 !== 0, (t) => [s(t.answer[0]), s(-t.answer[1])], 1, "vorzeichen"],
    ["lineare_funktionen", 1, (t) => Math.abs(t.answer[0].num) !== t.answer[0].den && t.answer[0].num !== 0, (t) => [`${t.answer[0].den}/${t.answer[0].num}`], 0, "kehrwert"],
    ["brueche", 1, (t) => t.data.mode === "sameNum", (t) => [t.data.b > t.data.d ? ">" : "<"], 0, "gleicherZaehler"],
    ["brueche", 1, (t) => t.data.mode === "expanded", () => [">"], 0, "vielleichtGleich"],
    ["brueche", 2, (t) => t.data.b * t.data.d > t.data.lcm, (t) => [s(t.data.b * t.data.d), t.answer[1]], 0, "nichtKleinstes"],
    ["brueche", 3, (t) => { let p = 2; while (t.data.k % p) p++; return p < t.data.k; }, (t) => { let p = 2; while (t.data.k % p) p++; return [String(p), `${t.answer[1].num}/${t.answer[1].den}`]; }, 0, "nichtGroesster"],
    ["brueche", 3, () => true, (t) => [String(t.answer[0]), `${t.data.a}/${t.data.b}`], 1, "ungekuerzt"],
    ["brueche", 4, (t) => t.dataExtra.kind === "anteil" && t.dataExtra.rest && 2 * t.dataExtra.a !== t.dataExtra.b, (t) => [`${t.dataExtra.a}/${t.dataExtra.b}`], 0, "rest"],
    ["brueche", 4, (t) => t.dataExtra.kind === "vergleich" && t.dataExtra.besser === "weniger" && t.answer[2] !== t.dataExtra.choices[1],
      (t) => { const i = ok(t); i[2] = t.dataExtra.choices.find((c) => c !== t.answer[2] && c !== t.dataExtra.choices[1]); return i; }, 2, "weniger"],
    ["brueche", 4, (t) => t.dataExtra.key === "schorle", (t) => { const i = ok(t); const x = t.dataExtra.s[0]; i[0] = `${x.a}/${x.b - x.a}`; return i; }, 0, "saftWasser"],
    ["lineare_funktionen", 5, (t) => t.subtype === "taxi", (t) => [s(t.answer[0] + 1)], 0, "abrunden"],
    ["lineare_funktionen", 5, (t) => t.subtype === "kerze", (t) => [s(t.answer[0]), s(t.answer[1] - t.dataExtra.t0)], 1, "dauerStattUhrzeit"],
    ["lineare_funktionen", 5, (t) => t.subtype === "handwerker" && t.answer[0] !== t.answer[1], (t) => [s(t.answer[1]), s(t.answer[0])], 0, "vertauscht"],
    ["exponentialrechnung", 6, (t) => t.subtype === "sparziel", (t) => [s(t.answer[0] - 1)], 0, "aufrunden"],
    ["exponentialrechnung", 6, (t) => t.subtype === "geschenk", (t) => { const d = t.dataExtra; return [s(Math.round(d.K * (1 + (d.p * d.N) / 100) * 100) / 100)]; }, 0, "ohneZinseszins"],
    ["potenzrechnung", 9, (t) => t.subtype === "schach", (t) => [s(Math.pow(2, t.dataExtra.f))], 0, "schachExp"],
    ["potenzrechnung", 9, (t) => t.subtype === "fotos", (t) => [s(t.dataExtra.G / t.dataExtra.m)], 0, "einheiten"],
    ["exponentialrechnung", 3, () => true, (t) => [s(ML.round2(t.answer[0] + 0.08))], 0, "rundung"],
    ["quadratische_funktionen", 1, (t) => t.data.d !== 0, (t) => [s(-t.data.d), s(t.data.e), t.answer[2]], 0, "scheitelVz"],
    ["quadratische_funktionen", 2, (t) => t.subtype !== "allgemein", (t) => [s(t.answer[0]), s(t.data.q + (t.data.p / 2) ** 2)], 1, "ergaenzung"],
    ["quadratische_funktionen", 2, (t) => t.subtype === "allgemein" && t.data.an !== t.data.ad, (t) => { const d = t.data, a = d.an / d.ad, h = d.b / a / 2; return [s(t.answer[0]), s(Math.round((d.c - h * h) * 1e6) / 1e6)]; }, 1, "ergaenzungA"],
    ["quadratische_funktionen", 3, (t) => true, (t) => [s(t.answer[1]), s(t.answer[0])], 0, "reihenfolge"],
    ["quadratische_funktionen", 3, (t) => t.data.r1 !== -t.data.r2 && -t.data.r1 !== t.data.r2 && t.data.r1 !== 0, (t) => [s(-t.data.r1), s(t.answer[1])], 0, "pqMinus"],
    ["quadratische_funktionen", 4, (t) => t.data.q !== 0, (t) => [s((t.data.p / 2) ** 2 + t.data.q), t.answer[1]], 0, "diskriminante"],
    ["quadratische_funktionen", 5, (t) => Math.abs(t.data.a) !== 0, (t) => [s(t.answer[0]), s(t.answer[1]), s(4 * t.data.a)], 2, "streckfaktor"],
    ["trigonometrie", 3, (t) => Math.abs(SIN_RAD(t) - t.answer[0]) > 0.05, (t) => [s(Math.round(SIN_RAD(t) * 100) / 100)], 0, "radModus"],
    ["trigonometrie", 4, (t) => Math.abs(90 - 2 * t.data.al) > 0.5, (t) => [s(Math.round((90 - t.data.al) * 10) / 10)], 0, "andererWinkel"],
    ["trigonometrie", 4, () => true, (t) => [s(Math.round((t.data.fall === "sin" ? t.data.a / t.data.c : t.data.fall === "cos" ? t.data.b / t.data.c : t.data.a / t.data.b) * 1000) / 1000)], 0, "umkehr"],
    ["trigonometrie", 5, (t) => t.subtype === "steigung", (t) => [s(t.dataExtra.p), s(t.answer[1])], 0, "prozentGrad"],
    ["terme_gleichungen", 2, (t) => t.data.d < 0 && t.data.f !== 0, (t) => [s(t.answer[0]), s(t.data.p * t.data.c - t.data.d * t.data.f)], 1, "minusKlammer"],
    ["terme_gleichungen", 3, (t) => t.data.a !== t.data.c && t.data.b !== 0 && t.data.a + t.data.c !== 0, (t) => { const d = t.data; const v = (d.d + d.b) / (d.a - d.c); return [s(Math.round(v * 1e6) / 1e6)]; }, 0, "seitenwechsel"],
    ["terme_gleichungen", 5, (t) => t.subtype === "plus", (t) => [s(0), s(t.answer[1])], 0, "mischglied"],
    ["terme_gleichungen", 5, (t) => t.subtype === "minus", (t) => [s(t.answer[0]), s(-t.answer[1])], 1, "quadratPos"],
    ["terme_gleichungen", 5, (t) => t.subtype === "koeff", (t) => [s(t.data.k), s(t.answer[1]), s(t.answer[2])], 0, "koeffQuadrat"],
    ["terme_gleichungen", 7, (t) => t.data.x0 !== t.data.y0, (t) => [s(t.data.y0), s(t.data.x0)], 0, "xy"],
    ["quadratische_funktionen", 8, (t) => { const { a, b, D } = t.data, v = Math.round((b - Math.sqrt(D)) / (2 * a) * 1e4) / 1e4; return t.subtype === "ganz" && b !== 0 && !t.answer.some((r) => Math.abs(r - v) < 1e-9 || Math.abs(2 * r - v) < 1e-9); }, (t) => { const { a, b, D } = t.data; return [s(Math.round((b - Math.sqrt(D)) / (2 * a) * 1e4) / 1e4), s(t.answer[1])]; }, 0, "abcMinusB"],
    ["quadratische_funktionen", 8, (t) => { const { a, b, D } = t.data, v = Math.min((-b - Math.sqrt(D)) / a, (-b + Math.sqrt(D)) / a); return t.subtype === "ganz" && Math.abs(a) !== 1 && !t.answer.some((r) => Math.abs(r - v) < 1e-9 || Math.abs(-r - v) < 1e-9); }, (t) => { const { a, b, D } = t.data; const v = [(-b - Math.sqrt(D)) / a, (-b + Math.sqrt(D)) / a].sort((p, q) => p - q); return [s(Math.round(v[0] * 1e4) / 1e4), s(t.answer[1])]; }, 0, "abcZweiA"],
    ["potenzfunktionen", 3, (t) => t.subtype === "wert" && t.data.x0 < 0 && t.data.n % 2 === 0, (t) => [`${-t.answer[0].num}/${t.answer[0].den}`], 0, "pfKlammer"],
    ["potenzfunktionen", 4, (t) => t.subtype === "exakt" && t.data.L.length === 2, (t) => [`{ ${Math.abs(t.data.L[1])} }`], 0, "pfZweiteLoesung"],
    ["potenzfunktionen", 6, (t) => t.subtype === "ablesen" && t.data.d !== 0, (t) => [s(-t.data.d), s(t.data.e), s(t.data.a)], 0, "pfVerschiebung"],
    ["potenzfunktionen", 7, (t) => t.subtype === "faktor" && t.dataExtra.kd === 1, (t) => [s(t.dataExtra.kn)], 0, "pfQuadratStattN"],
    ["statistik", 2, (t) => t.subtype === "tabelle", (t) => { const d = t.data, S = d.werte.reduce((a, x, k) => a + x * d.anz[k], 0); return [s(Math.round(S / 6 * 1000) / 1000), s(t.answer[1])]; }, 0, "tabelleNenner"],
    ["statistik", 6, (t) => t.subtype === "ohne" && t.data.E === "zweimal rot", (t) => { const d = t.data, N = d.r + d.b; return [`${d.r * d.r}/${N * N}`]; }, 0, "ohneZuruecklegen"],
    ["statistik", 6, (t) => t.subtype === "mindestens", (t) => [`${t.data.n}/6`], 0, "mindestensEinfach"],
    ["geometrie", 1, (t) => t.data.rel === "Nebenwinkel" && t.data.a !== 90, (t) => [t.answer[0], s(t.data.a)], 1, "nebenNichtGleich"],
    ["geometrie", 3, (t) => ["dreieck", "trapez", "drachen"].includes(t.subtype), (t) => [s(2 * t.answer[0])], 0, "halbVergessen"],
    ["geometrie", 5, (t) => t.subtype === "flaeche", (t) => [s(Math.round(4 * Math.PI * t.data.r * t.data.r * 100) / 100)], 0, "durchmesserRadius"],
    ["geometrie", 6, (t) => t.subtype === "kathete", (t) => [s(Math.round(Math.hypot(t.data.c, t.data.b) * 100) / 100)], 0, "katheteAddiert"],
    ["geometrie", 9, (t) => t.subtype === "kegel", (t) => [s(Math.round(Math.PI * t.data.r * t.data.r * t.data.h * 100) / 100)], 0, "drittel"],
    ["brueche", 7, (t) => t.data.op === ":" && t.data.C !== t.data.D && t.data.A * t.data.C * t.data.B * t.data.C !== t.data.A * t.data.D * t.data.B * t.data.D, (t) => { const d = t.data; return [`${d.A * d.C}/${d.B * d.D}`]; }, 0, "kehrwertVergessen"],
    ["brueche", 5, (t) => t.subtype === "zuUnecht" && t.data.g > 1, (t) => [`${t.data.g + t.data.n}/${t.data.d}`], 0, "gemischtAddiert"],
    ["prozentrechnung", 3, (t) => t.data.p !== 10, (t) => [s(Math.round(t.data.W * t.data.p * 1e6) / 1e8)], 0, "grundwertMal"],
    ["prozentrechnung", 5, (t) => t.subtype === "originalpreis", (t) => [s(Math.round(t.data.neu * (1 + t.data.p / 100) * 100) / 100)], 0, "rueckwaerts"],
    ["prozentrechnung", 5, (t) => t.subtype === "netto", (t) => [s(Math.round(t.data.brutto * 0.81 * 100) / 100)], 0, "nettoAbziehen"],
    ["prozentrechnung", 6, (t) => t.subtype === "punkte", (t) => [s(t.answer[0]), s(t.answer[0])], 1, "punkteProzent"],
    ["prozentrechnung", 7, (t) => t.subtype === "monate", (t) => [s(Math.round(t.data.K * t.data.p) / 100)], 0, "zinsJahr"],
    ["prozentrechnung", 8, (t) => t.subtype === "doppelrabatt", (t) => [s(t.answer[0]), s(t.dataExtra.r1 + t.dataExtra.r2)], 1, "rabattAddiert"],
    ["terme_gleichungen", 3, (t) => t.answer[0].den === 3, (t) => [s(Math.round(t.answer[0].num / t.answer[0].den * 100) / 100)], 0, "alsBruch"],
    ["trigonometrie", 7, (t) => t.subtype === "seite" && Math.abs(Math.cos(t.data.al * Math.PI / 180)) > 0.05, (t) => { const d = t.data; return [s(Math.round(Math.sqrt(d.b ** 2 + d.c ** 2 + 2 * d.b * d.c * Math.cos(d.al * Math.PI / 180)) * 100) / 100)]; }, 0, "kosinusPlus"],
    ["trigonometrie", 7, (t) => t.subtype === "seite", (t) => { const d = t.data; return [s(Math.round((d.b ** 2 + d.c ** 2 - 2 * d.b * d.c * Math.cos(d.al * Math.PI / 180)) * 100) / 100)]; }, 0, "wurzel"],
    ["trigonometrie", 6, (t) => t.subtype === "seite" && Math.abs(t.data.wz - t.data.al) > 3, (t) => { const d = t.data; return [s(Math.round(d.a * Math.sin(d.al * Math.PI / 180) / Math.sin(d.wz * Math.PI / 180) * 100) / 100)]; }, 0, "sinussatzKehr"],
    ["trigonometrie", 8, (t) => t.subtype === "fluss", (t) => [s(t.answer[0]), s(t.answer[0])], 1, "flussSchraeg"],
    ["trigonometrie", 2, (t) => t.answer[0].num !== t.answer[1].num, (t) => [`${t.answer[1].num}/${t.answer[1].den}`, `${t.answer[1].num}/${t.answer[1].den}`, `${t.answer[2].num}/${t.answer[2].den}`], 0, "sinCos"]
  ];
  faelle.forEach(([tk, id, wenn, eingabe, feld, erwartet]) => {
    const level = ML.TOPICS[tk].levels.find((l) => l.id === id);
    let gefunden = 0;
    for (let i = 0; i < 6000 && gefunden < 40; i++) {
      const t = level.generate();
      if (!wenn(t)) continue;
      gefunden++; totalChecked++;
      const inp = eingabe(t);
      const res = level.check(t, inp);
      if (res.correct) { fail(`Diagnose ${tk}/${id} [${erwartet}]: Testeingabe ist gar nicht falsch (${inp.join(" | ")})`); continue; }
      const dg = ML.diagnose(t, inp, res.fieldErrors);
      if (dg[feld] !== H[erwartet]) fail(`Diagnose ${tk}/${id} (${t.promptText}) Eingabe ${inp.join(" | ")}: erwartet "${erwartet}", bekommen "${dg[feld]}"`);
    }
    if (gefunden === 0) fail(`Diagnose ${tk}/${id} [${erwartet}]: kein passender Testfall erzeugt`);
  });
  // Sicherheit: Hinweise nur bei falschen Feldern, immer feste Texte, nie Absturz
  Object.keys(ML.TOPICS).forEach((tk) => ML.TOPICS[tk].levels.forEach((l) => {
    for (let i = 0; i < 400; i++) {
      totalChecked++;
      const t = l.generate();
      if (t.fieldType === "select") continue;
      const inp = ok(t);
      if (Object.keys(ML.diagnose(t, inp, [])).length) fail(`${tk}/${l.id}: Hinweis ohne Fehler`);
      const j = i % t.answer.length;
      const kind = (t.fieldKinds && t.fieldKinds[j]) || ((t.perFieldType && t.perFieldType[j] === "choice") || t.fieldType === "choice" ? "choice" : "x");
      if (kind === "choice") { const ch = t.fieldChoices[j]; inp[j] = ch.find((c) => c !== t.answer[j]); }
      else inp[j] = s(Math.round((Math.random() * 200 - 100) * 100) / 100);
      const res = l.check(t, inp);
      let dg;
      try { dg = ML.diagnose(t, inp, res.fieldErrors); } catch (e) { fail(`${tk}/${l.id}: diagnose wirft ${e.message}`); continue; }
      Object.keys(dg).forEach((k) => {
        if (!res.fieldErrors.includes(+k)) fail(`${tk}/${l.id}: Hinweis für korrektes Feld ${k}`);
        if (!erlaubt.has(dg[k])) fail(`${tk}/${l.id}: unbekannter Hinweistext "${dg[k]}"`);
      });
    }
  }));
  done("Fehlerdiagnose", before, `${faelle.length} Fehlertypen + Zufallseingaben`);
})();

