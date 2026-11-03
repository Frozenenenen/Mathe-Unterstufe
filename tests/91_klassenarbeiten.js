// ============================================================ KLASSENARBEITEN
console.log("\nPrüfe Klassenarbeiten ...");
(function testKlassenarbeiten() {
  const before = totalErrors;
  let n = 0;
  const inp = (task) => task.answer.map((a, j) => {
    const ch = (task.fieldKinds && task.fieldKinds[j] === "choice") || (task.perFieldType && task.perFieldType[j] === "choice") || task.fieldType === "choice" || task.fieldType === "select";
    return ch ? a : isFrac(a) ? `${a.num}/${a.den}` : ausgeschrieben(a).replace(".", ",");
  });
  Object.keys(ML.KA_VORLAGEN).forEach((tk) => {
    const vorl = ML.KA_VORLAGEN[tk];
    if (!vorl.some((v) => v.afb === 3)) fail(`${tk}: keine AFB-III-Aufgabe vorhanden`);
    for (let r = 0; r < 150; r++) {
      [45, 90].forEach((min) => (ML.KA_TEILGEBIETE[tk] || [[undefined]]).forEach(([gebiet]) => {
        const ka = ML.erzeugeKlassenarbeit(tk, min, gebiet); n++;
        if (gebiet && ka.aufgaben.some((a) => (ML.KA_VORLAGEN[tk].find((v) => v.key === a.key) || {}).gebiet !== gebiet)) fail(`${tk}: Aufgabe aus fremdem Teilgebiet in „${gebiet}“`);
        if (ka.aufgaben.length !== (min >= 90 ? 6 : 4)) fail(`${tk} ${min} min: ${ka.aufgaben.length} Aufgaben`);
        if (!ka.aufgaben.some((a) => a.afb === 3)) fail(`${tk}: Arbeit ohne AFB III`);
        if (new Set(ka.aufgaben.map((a) => a.key)).size !== ka.aufgaben.length) fail(`${tk}: doppelte Aufgabe`);
        const teilFolge = ka.aufgaben.map((a) => a.teil).join("");
        if (!/^A*B*$/.test(teilFolge)) fail(`${tk}: Teil B vor Teil A (${teilFolge})`);
        if (ka.mitTR && !/B/.test(teilFolge)) fail(`${tk}: kein Taschenrechner-Teil`);
        if (!ka.mitTR && /B/.test(teilFolge)) fail(`${tk}: Taschenrechner-Teil, obwohl ohne TR`);
        ka.aufgaben.forEach((a) => {
          if (!a.teile.length) fail(`${tk}/${a.key}: keine Teilaufgaben`);
          [a.kontext].concat(a.teile.map((t) => t.text)).filter(Boolean).forEach((src) => {
            const v = visible(src); if (/\b(dfrac|frac|cdot|sqrt|text|Rightarrow)\b|undefined|NaN/.test(v)) fail(`${tk}/${a.key}: Darstellung "${v.slice(0, 90)}"`);
          });
          [a.graph].concat(a.teile.map((t) => t.loesungsGraph)).filter(Boolean).forEach((svg) => {
            if (!/^<svg[\s\S]*<\/svg>$/.test(svg) || /NaN|undefined|Infinity/.test(svg)) fail(`${tk}/${a.key}: kaputte Grafik`);
          });
          a.teile.forEach((t) => {
            totalChecked++;
            if (!Array.isArray(t.loesung) || !t.loesung.length) fail(`${tk}/${a.key} ${t.label}: keine Musterlösung`);
            t.loesung.filter((st) => !st.label).forEach((st) => { const v = visible(st.left); if (/\b(dfrac|frac|cdot|sqrt|text)\b|undefined|NaN/.test(v)) fail(`${tk}/${a.key} ${t.label}: Lösung "${v.slice(0, 80)}"`); });
            t.loesung.filter((st) => st.label).forEach((st) => { if (/undefined|NaN/.test(st.label)) fail(`${tk}/${a.key}: Lösungstext kaputt`); });
            if (t.art === "papier") {
              const sum = t.erwartung.reduce((s, e) => s + e.punkte, 0);
              if (!t.erwartung.length || sum !== t.punkte[0]) fail(`${tk}/${a.key} ${t.label}: Erwartungshorizont passt nicht zur Punktzahl`);
              t.erwartung.forEach((e) => { if (/undefined|NaN/.test(e.text)) fail(`${tk}/${a.key}: Erwartung kaputt "${e.text}"`); });
              return;
            }
            const task = t.task;
            if (t.punkte.length !== task.answer.length) fail(`${tk}/${a.key} ${t.label}: Punkte passen nicht zu Feldern`);
            const korrekt = inp(task);
            if (!t.pruefe(korrekt).correct) fail(`${tk}/${a.key} ${t.label}: korrekte Antwort abgelehnt (${korrekt.join(" | ")})`);
            task.answer.forEach((x, j) => {
              const w = korrekt.slice();
              const ch = (task.fieldKinds && task.fieldKinds[j] === "choice") || task.fieldType === "select" || task.fieldType === "choice" || (task.perFieldType && task.perFieldType[j] === "choice");
              if (ch) { const opts = task.fieldType === "select" ? task.fieldOptions.map((o) => o.value) : task.fieldChoices[j]; const alt = opts.find((o) => o !== x); if (alt === undefined) return; w[j] = alt; }
              else w[j] = isFrac(x) ? `${x.num + x.den * 50 + 1}/${x.den}` : String(x + 9999);
              const res = t.pruefe(w);
              if (res.correct || !res.fieldErrors.includes(j)) fail(`${tk}/${a.key} ${t.label}: falsches Feld ${j} nicht erkannt`);
            });
            if (task.fieldKinds) task.fieldKinds.forEach((k, j) => { if (k === "choice" && !task.fieldChoices[j].includes(task.answer[j])) fail(`${tk}/${a.key}: Antwort nicht unter den Auswahlmöglichkeiten`); });
          });
          // Querchecks, unabhängig vom Generator
          const ans = (i) => a.teile[i].task && a.teile[i].task.answer;
          if (tk === "lineare_funktionen" && a.key === "zeichnen") {
            const [m, b] = ans(0), x = ans(1)[0];
            if (Math.abs((m.num / m.den) * (x.num / x.den) + b) > 1e-9) fail(`zeichnen: Nullstelle erfüllt f(x)=0 nicht`);
          }
          if (tk === "lineare_funktionen" && a.key === "kerze") {
            const r = ans(0)[0], [m, b] = ans(1), k = ans(2)[0];
            if (m !== -r || Math.abs(b / r - k) > 1e-9) fail(`kerze: Teilaufgaben widersprechen sich`);
          }
          if (tk === "exponentialrechnung" && a.key === "inflation") {
            const p = ans(1)[0]; const n2 = +visible(a.kontext).match(/(\d+) Jahre lang/)[1];
            if (Math.abs(1000 / Math.pow(1 + p / 100, n2) - 500) > 3) fail(`inflation: halbe Kaufkraft nicht bei ${p} %`);
          }
        });
      }));
    }
  });
  // Jeder Formelbefehl muss dem Renderer bekannt sein (sonst erscheint z. B. "tfrac" als Text)
  const bekannt = new Set(["dfrac", "frac", "sqrt", "text", "cdot", "ldots", "log", "ln", "lg", "Leftrightarrow", "Rightarrow", "rightarrow", "approx", "neq", "geq", "leq", "pm", "quad", "qquad", "left", "right", "square", "sin", "cos", "tan", "alpha", "beta", "gamma", "pi", "varepsilon", "epsilon", "varphi", "phi"]);
  for (let r = 0; r < 300; r++) Object.keys(ML.KA_VORLAGEN).forEach((tk) => {
    const ka = ML.erzeugeKlassenarbeit(tk, 90);
    ka.aufgaben.forEach((a) => [a.kontext].concat(...a.teile.map((t) => [t.text].concat(t.loesung.map((s) => s.left || "")))).filter(Boolean).forEach((src) => {
      (src.match(/\\[a-zA-Z]+/g) || []).forEach((c) => { if (!bekannt.has(c.slice(1))) fail(`${tk}/${a.key}: unbekannter Formelbefehl ${c}`); });
    }));
  });
  console.log(`  ${n} Klassenarbeiten erzeugt und geprüft`);
  done("Klassenarbeiten", before, n);
})();

