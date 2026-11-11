// ============================================================ ERKLÄRUNGEN
console.log("\nPrüfe Erklärungen ...");
(function testErklaerungen() {
  const before = totalErrors;
  const bekannt = new Set(["dfrac", "frac", "sqrt", "text", "cdot", "ldots", "log", "ln", "lg", "Leftrightarrow", "Rightarrow", "rightarrow", "approx", "neq", "geq", "leq", "pm", "quad", "qquad", "left", "right", "square", "sin", "cos", "tan", "alpha", "beta", "gamma", "pi", "varepsilon", "epsilon", "varphi", "phi", "mbox"]);
  let n = 0;
  Object.keys(ML.TOPICS).forEach((tk) => ML.TOPICS[tk].levels.forEach((l) => {
    totalChecked++; n++;
    const e = ML.erklaerungFuer(tk, l.id);
    if (!e) { fail(`${tk}/${l.id}: keine Erklärung`); return; }
    if (!e.regeln.length || !e.fehler.length) fail(`${tk}/${l.id}: Regel oder typischer Fehler fehlt`);
    const alle = e.regeln.concat(e.fehler, e.beispiel.map((b) => b.left || ""), e.beispiel.map((b) => b.label || ""));
    alle.filter(Boolean).forEach((src) => {
      (src.match(/\\[a-zA-Z]+/g) || []).forEach((c) => { if (!bekannt.has(c.slice(1))) fail(`${tk}/${l.id}: unbekannter Formelbefehl ${c}`); });
      const v = visible(src);
      if (/undefined|NaN|[{}]/.test(v)) fail(`${tk}/${l.id}: Darstellungsproblem "${v.slice(0, 80)}"`);
    });
    if (e.grafik && !/^<svg[\s\S]*<\/svg>$/.test(e.grafikSVG || "")) fail(`${tk}/${l.id}: Grafik fehlt oder kaputt`);
    if (e.grafikSVG && /NaN|undefined/.test(e.grafikSVG)) fail(`${tk}/${l.id}: Grafik enthält NaN`);
  }));
  done("Erklärungen", before, `${n} Stufen`);
})();

