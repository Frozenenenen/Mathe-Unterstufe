// ============================================================ FORMELBEFEHLE ALLER STUFEN
console.log("\nPrüfe Formelbefehle aller Stufen ...");
(function () {
  const before = totalErrors;
  const bekannt = new Set(["dfrac", "frac", "sqrt", "text", "cdot", "ldots", "log", "ln", "lg", "Leftrightarrow", "Rightarrow", "rightarrow", "approx", "neq", "geq", "leq", "pm", "quad", "qquad", "left", "right", "square", "sin", "cos", "tan", "alpha", "beta", "gamma", "pi", "varepsilon", "epsilon", "varphi", "phi"]);
  Object.keys(ML.TOPICS).forEach((tk) => ML.TOPICS[tk].levels.forEach((l) => {
    for (let i = 0; i < 200; i++) {
      const t = l.generate(); totalChecked++;
      const quellen = [t.prompt, t.question].concat(l.steps(t).map((s) => s.left || ""));
      quellen.filter(Boolean).forEach((src) => (src.match(/\\[a-zA-Z]+/g) || []).forEach((c) => {
        if (!bekannt.has(c.slice(1))) fail(`${tk}/${l.id}: unbekannter Formelbefehl ${c}`);
      }));
    }
  }));
  done("Formelbefehle", before, "alle Stufen");
})();

// ============================================================ VERSCHLUCKTE FORMELBEFEHLE
// Fehlt in einer JS-Zeichenkette der doppelte Backslash, wird aus "\dfrac" einfach "dfrac" – kein unbekannter
// Befehl, sondern sichtbarer Wortsalat. Darum alle ANGEZEIGTEN Texte nach Befehlswörtern durchsuchen.
console.log("\nPrüfe angezeigte Texte auf verschluckte Formelbefehle ...");
(function () {
  const before = totalErrors, re = /\b(dfrac|sqrt|cdot|Rightarrow|Leftrightarrow|qquad|approx|tfrac)\b|(^|[^A-Za-zäöüÄÖÜ])pm([^A-Za-zäöüÄÖÜ]|$)/;
  const pruefe = (wo, src) => { if (!src) return; const v = ML.mathToHtml(String(src)).replace(/<[^>]*>/g, " "); if (re.test(v)) fail(`${wo}: „${v.replace(/\s+/g, " ").trim().slice(0, 70)}“`); };
  Object.keys(ML.TOPICS).forEach((tk) => ML.TOPICS[tk].levels.forEach((l) => {
    const e = ML.erklaerungFuer(tk, l.id);
    if (e) e.regeln.concat(e.fehler, e.beispiel.map((b) => b.left || "")).forEach((x) => pruefe(`Erklärung ${tk}/${l.id}`, x));
    for (let i = 0; i < 150; i++) { totalChecked++; const t = l.generate(); [t.prompt, t.question].concat(l.steps(t).map((s) => s.left || "")).forEach((x) => pruefe(`${tk}/${l.id}`, x)); }
  }));
  Object.keys(ML.KA_VORLAGEN).forEach((tk) => (ML.KA_TEILGEBIETE[tk] || [[undefined]]).forEach(([g]) => {
    for (let i = 0; i < 40; i++) { const ka = ML.erzeugeKlassenarbeit(tk, 90, g); totalChecked++;
      ka.aufgaben.forEach((a) => { pruefe(`KA ${tk} ${a.key}`, a.kontext); a.teile.forEach((t) => { pruefe(`KA ${tk} ${a.key}`, t.text); (t.loesung || []).forEach((s) => pruefe(`KA-Lösung ${tk} ${a.key}`, s.left)); }); }); }
  }));
  done("verschluckte Formelbefehle", before, "alle Texte");
})();

// ============================================================ RECHENWEG BEGINNT MIT DER AUFGABE
console.log("\nPrüfe: Rechenwege starten in der gegebenen Form ...");
(function () {
  const before = totalErrors; let n = 0;
  Object.keys(ML.TOPICS).forEach((tk) => ML.TOPICS[tk].levels.forEach((l) => {
    if (!l.steps.mitAusgang) return; n++;
    for (let i = 0; i < 300; i++) { totalChecked++; const t = l.generate(), st = l.steps(t), erste = st.find((x) => x.left);
      if (!erste || erste.left !== t.prompt) { fail(`${tk}/${l.id}: Rechenweg beginnt nicht mit der Aufgabe`); break; } }
  }));
  if (n < 11) fail(`nur ${n} Stufen mit „Rechenweg ab Aufgabe“ markiert`);
  done("Rechenweg ab Aufgabe", before, `${n} Stufen`);
})();

// ============================================================ TIPPS VERRATEN NICHT DAS ERGEBNIS
// Gleiche Abschnittsbildung wie in der App (src/app/50_aufgabe.js): Die letzte Rechenzeile (Ergebnis)
// darf erst mit „Rechenweg zeigen“ sichtbar werden, nie schon über einen Tipp.
console.log("\nPrüfe: Tipps verraten nicht das Ergebnis ...");
(function () {
  const before = totalErrors;
  Object.keys(ML.TOPICS).forEach((tk) => ML.TOPICS[tk].levels.forEach((l) => {
    for (let i = 0; i < 200; i++) {
      totalChecked++;
      const t = l.generate(), alle = l.steps(t), ab = ML.tippAbschnitte(t, alle);
      if (alle.length >= 2 && ab.length < 2) { fail(`${tk}/${l.id} ${t.subtype || ""}: kein Tipp möglich`); break; }
      const letzte = [...alle].reverse().find((s) => s.left);
      if (letzte && [].concat(...ab.slice(0, ab.length - 1)).includes(letzte)) { fail(`${tk}/${l.id} ${t.subtype || ""}: Ergebnis schon per Tipp sichtbar`); break; }
    }
  }));
  done("Tipps ohne Ergebnis", before, "alle Stufen");
})();


console.log("\nPrüfe Quelltext auf einfache Backslash-Abstände (\; \\, \\! \\: in Template-Strings) ...");
{
  const before = totalErrors;
  const src = require("fs").readFileSync(require("path").join(__dirname, "logic.js"), "utf8").split("\n");
  src.forEach((z, i) => { if (/(^|[^\\])\\[;,!:]/.test(z)) fail(`logic.js Zeile ${i + 1}: einfacher Backslash vor Abstandsbefehl: ${z.trim().slice(0, 90)}`); });
  done("backslash", before, src.length);
}
