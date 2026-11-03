  // ============================================================
  // ERKLÄRUNGEN ("📖"): Merkwissen direkt im Tool, pro Stufe
  // Regel(n), vorgerechnetes Beispiel, typische Fehler, ggf. Grafik.
  // Allgemein gehalten (nicht aufgabenbezogen) -> sperrt das Prüfen nicht.
  // ============================================================
  const E = (titel, regeln, beispiel, fehler, grafik) => ({ titel, regeln, beispiel, fehler, grafik });
  const ERKL = {};
  // Grafiken zu den Erklärungen (allgemeine Beispiele)
  let erklGrafik = function (art) {
    const basis = { width: 300, height: 220, padLeft: 26, padBottom: 22, ticks: true };
    if (art === "steigung") return renderGraphSVG([{ fn: (x) => 0.5 * x + 1, color: "#2563eb", label: "f" }], Object.assign({ xmin: -1, xmax: 6, ymin: -1, ymax: 5, marks: [
      { type: "triangle", x: 1, y: 1.5, dx: 2, dy: 1, color: "#f59e0b" }, { type: "point", x: 0, y: 1, label: "b = 1", dx: 6, dy: -6 }] }, basis));
    if (art === "parallelsenkrecht") return renderGraphSVG([{ fn: (x) => 2 * x - 1, color: "#2563eb", label: "f" }, { fn: (x) => 2 * x + 2, color: "#16a34a", label: "parallel" }, { fn: (x) => -0.5 * x + 1, color: "#dc2626", label: "senkrecht" }],
      Object.assign({ xmin: -4, xmax: 4, ymin: -4, ymax: 4 }, basis));
    if (art === "schnitt") return renderGraphSVG([{ fn: (x) => 2 * x + 1, color: "#2563eb", label: "f" }, { fn: (x) => -x + 7, color: "#dc2626", label: "g" }],
      Object.assign({ xmin: -1, xmax: 6, ymin: -1, ymax: 9, marks: [{ type: "point", x: 2, y: 5, label: "S(2|5)", color: "#111" }] }, basis));
    if (art === "linexp") return renderGraphSVG([{ fn: (x) => 100 + 30 * x, color: "#16a34a", label: "linear" }, { fn: (x) => 100 * Math.pow(1.3, x), color: "#2563eb", label: "exponentiell" }],
      Object.assign({ xmin: 0, xmax: 8, ymin: 0, ymax: 900, gridStepX: 1, gridStepY: 100, padLeft: 34, achsenNamen: ["t", "B"] }, basis));
    if (art === "potenzgraphen") return renderGraphSVG([{ fn: (x) => x * x, color: "#2563eb", label: "x²" }, { fn: (x) => x * x * x, color: "#16a34a", label: "x³" }, { fn: (x) => 1 / x, color: "#dc2626", label: "x⁻¹" }],
      Object.assign({ xmin: -3, xmax: 3, ymin: -4, ymax: 4 }, basis));
    if (art === "kaestchen") {
      const zeile = (y, n, z, farbe) => Array.from({ length: n }, (_, i) => `<rect x="${10 + i * (240 / n)}" y="${y}" width="${240 / n}" height="26" fill="${i < z ? farbe : "white"}" stroke="#334155"/>`).join("");
      return `<svg viewBox="0 0 300 110" width="300" height="110" xmlns="http://www.w3.org/2000/svg">` +
        zeile(10, 3, 2, "#93c5fd") + `<text x="258" y="28" font-size="13">2/3</text>` +
        zeile(55, 7, 2, "#fca5a5") + `<text x="258" y="73" font-size="13">2/7</text>` +
        `<text x="10" y="102" font-size="11" fill="#475569">Gleicher Zähler: kleinere Nenner = größere Stücke</text></svg>`;
    }
    return null;
  };

  function erklaerungFuer(topicKey, levelId) {
    const e = ERKL[topicKey + "/" + levelId];
    if (!e) return null;
    return Object.assign({}, e, { grafikSVG: e.grafik ? erklGrafik(e.grafik) : null });
  }

