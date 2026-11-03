  // ============================================================
  // STATISTIK & WAHRSCHEINLICHKEIT (Kl. 6–10)
  // Inhalte nach Recherche (SINUS.NRW Boxplots Kl. 7/8, ÖBV/Klett Grundwissen,
  // Lehrplan Lambacher Schweizer Kl. 8, Grundwissen BW Kl. 10). Bewusst ohne
  // bedingte Wahrscheinlichkeit und Erwartungswert (erst Kl. 10/Oberstufe).
  // ============================================================
  const sortiert = (a) => a.slice().sort((p, q) => p - q);
  const medianVon = (a) => { const s = sortiert(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  // Quartile wie im Schulbuch: Median der unteren bzw. oberen Hälfte (bei ungerader Anzahl ohne den Median)
  const quartile = (a) => { const s = sortiert(a), n = s.length, h = Math.floor(n / 2); return [medianVon(s.slice(0, h)), medianVon(s), medianVon(s.slice(n - h))]; };
  const modus = (a) => { const z = {}; a.forEach((x) => { z[x] = (z[x] || 0) + 1; }); const m = Math.max(...Object.values(z)); const k = Object.keys(z).filter((x) => z[x] === m); return k.length === 1 ? Number(k[0]) : null; };
  const listeTxt = (a, einh) => a.map((x) => fmtNum(x) + (einh ? " " + einh : "")).join(";  ");

  // ---------- Boxplot (ein oder zwei, übereinander) ----------
  function boxplotSVG(boxen, achse) { // boxen: [{name, w:[min,q1,med,q3,max]}], achse: {von, bis, schritt, einheit}
    const W = 300, x0 = 40, x1 = 285, H = 50 + boxen.length * 60, px = (v) => x0 + ((v - achse.von) / (achse.bis - achse.von)) * (x1 - x0);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" class="graph-svg">`;
    for (let v = achse.von; v <= achse.bis + 1e-9; v += achse.schritt) s += `<line x1="${px(v).toFixed(1)}" y1="10" x2="${px(v).toFixed(1)}" y2="${H - 28}" stroke="#e2e8f0"/><text x="${px(v).toFixed(1)}" y="${H - 14}" font-size="10" text-anchor="middle">${fmtNum(v)}</text>`;
    s += `<line x1="${x0}" y1="${H - 28}" x2="${x1}" y2="${H - 28}" stroke="#334155"/>` + (achse.einheit ? `<text x="${x1}" y="${H - 2}" font-size="10" text-anchor="end" fill="#475569">${achse.einheit}</text>` : "");
    boxen.forEach((b, i) => {
      const y = 30 + i * 60, [mi, q1, me, q3, ma] = b.w.map(px);
      s += `<line x1="${mi.toFixed(1)}" y1="${y}" x2="${q1.toFixed(1)}" y2="${y}" stroke="#1e3a8a" stroke-width="2"/><line x1="${q3.toFixed(1)}" y1="${y}" x2="${ma.toFixed(1)}" y2="${y}" stroke="#1e3a8a" stroke-width="2"/>`;
      s += `<line x1="${mi.toFixed(1)}" y1="${y - 8}" x2="${mi.toFixed(1)}" y2="${y + 8}" stroke="#1e3a8a" stroke-width="2"/><line x1="${ma.toFixed(1)}" y1="${y - 8}" x2="${ma.toFixed(1)}" y2="${y + 8}" stroke="#1e3a8a" stroke-width="2"/>`;
      s += `<rect x="${q1.toFixed(1)}" y="${y - 14}" width="${(q3 - q1).toFixed(1)}" height="28" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2"/><line x1="${me.toFixed(1)}" y1="${y - 14}" x2="${me.toFixed(1)}" y2="${y + 14}" stroke="#dc2626" stroke-width="3"/>`;
      if (b.name) s += `<text x="4" y="${y + 4}" font-size="11" font-weight="bold">${b.name}</text>`;
    });
    return s + "</svg>";
  }

  // ---- Stufe 1: Kennwerte ----
  const DATEN_KONTEXT = [["Sprungweiten im Weitsprung (in m)", 2.6, 4.4, 0.1, "m"], ["Punkte in einem Test", 8, 30, 1, ""], ["Schulwege (in min)", 5, 40, 1, "min"], ["Körpergrößen (in cm)", 148, 178, 1, "cm"]];
  function datenreihe(n, ctx) { const [, lo, hi, sch] = ctx; return Array.from({ length: n }, () => roundKfm(lo + sch * randInt(0, Math.round((hi - lo) / sch)), 2)); }
  function gen_stat_1() {
    const ctx = choice(DATEN_KONTEXT), n = randInt(6, 11); let d;
    do { d = datenreihe(n, ctx); } while (modus(d) === null);
    const mw = roundKfm(d.reduce((s, x) => s + x, 0) / n, 2), sp = roundKfm(Math.max(...d) - Math.min(...d), 2);
    return { topic: "statistik", level: 1, prompt: T(`${ctx[0]}: ${listeTxt(d)}`), promptText: "Kennwerte",
      question: `\\text{Bestimme Mittelwert (2 Nachkommastellen), Median, Modalwert und Spannweite.}`, numFields: 4, fieldLabels: ["Mittelwert", "Median", "Modalwert", "Spannweite"],
      answer: [mw, medianVon(d), modus(d), sp], tolerances: [0.011, 1e-9, 1e-9, 1e-9], data: { d } };
  }
  function check_stat_num(task, inp) { const err = []; task.answer.forEach((x, i) => { const v = parseUserNumber(String(inp[i]).replace(/\s*(m|cm|min|€|%)$/, "")); const tol = task.tolerances ? task.tolerances[i] : task.tolerance || 1e-9; if (isNaN(v) || Math.abs(v - x) > tol) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
  function steps_stat_1(task) {
    const d = task.data.d, s = sortiert(d), n = d.length, sum = roundKfm(d.reduce((a, x) => a + x, 0), 2);
    return [{ label: "Mittelwert: Summe aller Werte durch ihre Anzahl" }, { left: `\\dfrac{${fmtNum(sum)}}{${n}} \\approx ${fmtNum(task.answer[0])}`, right: "" },
      { label: "Median: der mittlere Wert der GEORDNETEN Liste (bei gerader Anzahl der Mittelwert der beiden mittleren)" }, { left: T(listeTxt(s)), right: "" }, { left: T(`Median = ${fmtNum(task.answer[1])}`), right: "" },
      { label: "Modalwert: der häufigste Wert;  Spannweite: größter minus kleinster Wert" }, { left: T(`Modalwert = ${fmtNum(task.answer[2])},  Spannweite = ${fmtNum(s[n - 1])} − ${fmtNum(s[0])} = ${fmtNum(task.answer[3])}`), right: "" }];
  }

  // ---- Stufe 2: Häufigkeitstabelle, fehlender Wert ----
  function gen_stat_2() {
    if (Math.random() < 0.55) {
      const werte = [1, 2, 3, 4, 5, 6], anz = werte.map(() => randInt(0, 8)); if (anz.reduce((s, x) => s + x, 0) < 8) return gen_stat_2();
      const liste = []; werte.forEach((w, i) => { for (let k = 0; k < anz[i]; k++) liste.push(w); });
      return { topic: "statistik", level: 2, subtype: "tabelle", prompt: T(`Notenverteilung einer Klassenarbeit – Note: ${werte.join(" | ")};  Anzahl: ${anz.join(" | ")}`), promptText: "Tabelle",
        question: `\\text{Berechne den Notendurchschnitt (2 Nachkommastellen) und den Median.}`, numFields: 2, fieldLabels: ["Durchschnitt", "Median"],
        answer: [roundKfm(liste.reduce((s, x) => s + x, 0) / liste.length, 2), medianVon(liste)], tolerances: [0.011, 1e-9], data: { werte, anz } };
    }
    const n = randInt(4, 7), d = Array.from({ length: n }, () => randInt(2, 15)), mw = d.reduce((s, x) => s + x, 0) / n, gegeben = d.slice(0, n - 1);
    return { topic: "statistik", level: 2, subtype: "fehlend", prompt: T(`Von ${n} Zahlen kennt man ${n - 1}: ${gegeben.join(";  ")}. Der Mittelwert aller ${n} Zahlen beträgt ${fmtNum(roundKfm(mw, 4))}.`), promptText: "fehlend",
      question: `\\text{Wie heißt die fehlende Zahl?}`, numFields: 1, fieldLabels: ["fehlende Zahl"], answer: [d[n - 1]], tolerance: 1e-6, data: { gegeben, n, mw } };
  }
  function steps_stat_2(task) {
    const d = task.data;
    if (task.subtype === "tabelle") { const N = d.anz.reduce((s, x) => s + x, 0), S = d.werte.reduce((s, w, i) => s + w * d.anz[i], 0);
      return [{ label: "Jede Note mit ihrer Anzahl multiplizieren, alles addieren, durch die Gesamtzahl teilen" }, { left: `\\dfrac{${d.werte.map((w, i) => `${w}\\cdot ${d.anz[i]}`).join(" + ")}}{${N}} = \\dfrac{${S}}{${N}} \\approx ${fmtNum(task.answer[0])}`, right: "" },
        { label: `Median: der ${N % 2 ? `${(N + 1) / 2}.` : `Mittelwert aus dem ${N / 2}. und ${N / 2 + 1}.`} Wert, wenn man alle ${N} Noten der Größe nach aufschreibt` }, { left: T(`Median = ${fmtNum(task.answer[1])}`), right: "" }]; }
    const S = d.gegeben.reduce((s, x) => s + x, 0);
    return [{ label: "Summe aller Zahlen = Mittelwert · Anzahl" }, { left: `${fmtNum(roundKfm(d.mw, 4))}\\cdot ${d.n} = ${fmtNum(roundKfm(d.mw * d.n, 4))}`, right: "" },
      { label: "Davon die Summe der bekannten Zahlen abziehen" }, { left: `${fmtNum(roundKfm(d.mw * d.n, 4))} - ${S} = ${task.answer[0]}`, right: "" }];
  }

  // ---- Stufe 3: Quartile und Boxplot ----
  function gen_stat_3() {
    if (Math.random() < 0.5) {
      const n = choice([7, 8, 9, 10, 11, 12]), d = Array.from({ length: n }, () => randInt(10, 60)), [q1, me, q3] = quartile(d);
      return { topic: "statistik", level: 3, subtype: "berechnen", prompt: T(`Fahrzeiten zur Arbeit (in min): ${listeTxt(d)}`), promptText: "Quartile",
        question: `\\text{Bestimme unteres Quartil, Median, oberes Quartil und den Quartilsabstand.}`, numFields: 4, fieldLabels: ["unteres Quartil q₁", "Median", "oberes Quartil q₃", "Quartilsabstand"],
        answer: [q1, me, q3, q3 - q1], tolerance: 1e-9, data: { d } };
    }
    let w; do { w = [randInt(0, 4), randInt(5, 9), randInt(10, 14), randInt(15, 19), randInt(20, 25)].map((x) => 2 * x); } while (new Set(w).size < 5);
    return { topic: "statistik", level: 3, subtype: "ablesen", prompt: T("Der Boxplot zeigt die Punktzahlen einer Klassenarbeit."), promptText: "Boxplot ablesen",
      graph: boxplotSVG([{ w }], { von: 0, bis: 50, schritt: 5, einheit: "Punkte" }),
      question: `\\text{Lies Median, Spannweite und Quartilsabstand ab.}`, numFields: 3, fieldLabels: ["Median", "Spannweite", "Quartilsabstand"], answer: [w[2], w[4] - w[0], w[3] - w[1]], tolerance: 1e-9, data: { w } };
  }
  function steps_stat_3(task) {
    if (task.subtype === "ablesen") { const w = task.data.w; return [{ label: "Kasten: von q₁ bis q₃; roter Strich: Median; Antennen: Minimum und Maximum" },
      { left: T(`Minimum ${w[0]},  q₁ = ${w[1]},  Median ${w[2]},  q₃ = ${w[3]},  Maximum ${w[4]}`), right: "" }, { left: T(`Spannweite ${w[4]} − ${w[0]} = ${w[4] - w[0]},  Quartilsabstand ${w[3]} − ${w[1]} = ${w[3] - w[1]}`), right: "" }]; }
    const s = sortiert(task.data.d), n = s.length, h = Math.floor(n / 2);
    return [{ label: "Liste ordnen" }, { left: T(listeTxt(s)), right: "" }, { label: `Median der ganzen Liste; dann Median der unteren und der oberen ${h} Werte${n % 2 ? " (ohne den Median)" : ""}` },
      { left: T(`untere Hälfte: ${listeTxt(s.slice(0, h))} ⇒ q₁ = ${fmtNum(task.answer[0])}`), right: "" }, { left: T(`obere Hälfte: ${listeTxt(s.slice(n - h))} ⇒ q₃ = ${fmtNum(task.answer[2])}`), right: "" },
      { left: T(`Median = ${fmtNum(task.answer[1])},  Quartilsabstand = ${fmtNum(task.answer[2])} − ${fmtNum(task.answer[0])} = ${fmtNum(task.answer[3])}`), right: "" }];
  }

  // ---- Stufe 4: Daten beurteilen (Ausreißer, Boxplots vergleichen) ----
  function gen_stat_4() {
    if (Math.random() < 0.5) {
      const n = randInt(5, 7), d = Array.from({ length: n }, () => randInt(1800, 2600)).map((x) => Math.round(x / 50) * 50), boss = choice([9000, 12000, 15000]); d.push(boss);
      const mw = roundKfm(d.reduce((s, x) => s + x, 0) / d.length, 2);
      return { topic: "statistik", level: 4, subtype: "ausreisser", prompt: T(`Monatliche Gehälter in einem kleinen Betrieb (in €): ${listeTxt(d)}. Der Chef verdient ${tausender(boss)} €.`), promptText: "Ausreißer",
        question: T("Berechne Mittelwert (2 Nachkommastellen) und Median. Welcher Wert beschreibt das „typische“ Gehalt besser?"), numFields: 3, fieldLabels: ["Mittelwert in €", "Median in €", "besser geeignet"],
        perFieldType: ["text", "text", "choice"], fieldChoices: [null, null, ["Mittelwert", "Median"]], answer: [mw, medianVon(d), "Median"], tolerances: [0.011, 1e-9, 0], data: { d } };
    }
    const mk = () => { let w; do { w = [randInt(0, 6), randInt(7, 12), randInt(13, 18), randInt(19, 23), randInt(24, 25)].map((x) => 2 * x); } while (new Set(w).size < 5); return w; };
    let A, B; do { A = mk(); B = mk(); } while (A[2] === B[2] || (A[4] - A[0]) === (B[4] - B[0]) || (A[3] - A[1]) === (B[3] - B[1]));
    const grenze = Math.min(A[2], B[2]) + 1;
    const halbeB = B[2] >= grenze ? "ja" : "nein";
    return { topic: "statistik", level: 4, subtype: "vergleich", prompt: T("Zwei Klassen haben dieselbe Arbeit geschrieben. Die Boxplots zeigen die Punktzahlen."), promptText: "Vergleich",
      graph: boxplotSVG([{ name: "8a", w: A }, { name: "8b", w: B }], { von: 0, bis: 50, schritt: 5, einheit: "Punkte" }),
      question: T(`Welche Klasse hat den höheren Median, wo streuen die mittleren 50 % weniger, und hat mindestens die Hälfte der 8b ${grenze} oder mehr Punkte?`), numFields: 3,
      fieldLabels: ["höherer Median", "kleinerer Quartilsabstand", `Hälfte der 8b ≥ ${grenze} Punkte?`], fieldType: "choice", fieldChoices: [["8a", "8b"], ["8a", "8b"], ["ja", "nein"]],
      answer: [A[2] > B[2] ? "8a" : "8b", A[3] - A[1] < B[3] - B[1] ? "8a" : "8b", halbeB], data: { A, B, grenze } };
  }
  function check_stat_4(task, inp) { if (task.subtype === "vergleich") { const err = []; task.answer.forEach((x, i) => { if (inp[i] !== x) err.push(i); }); return { correct: !err.length, fieldErrors: err }; }
    const err = []; [0, 1].forEach((i) => { const v = parseUserNumber(inp[i]); if (isNaN(v) || Math.abs(v - task.answer[i]) > task.tolerances[i]) err.push(i); }); if (inp[2] !== "Median") err.push(2); return { correct: !err.length, fieldErrors: err }; }
  function steps_stat_4(task) {
    const d = task.data;
    if (task.subtype === "vergleich") return [{ label: "Median = roter Strich; Quartilsabstand = Breite des Kastens; links vom Median liegt die Hälfte der Werte" },
      { left: T(`8a: Median ${d.A[2]}, Kastenbreite ${d.A[3] - d.A[1]};  8b: Median ${d.B[2]}, Kastenbreite ${d.B[3] - d.B[1]}`), right: "" },
      { left: T(`Mindestens die Hälfte der 8b hat ${d.B[2]} oder mehr Punkte ⇒ ${task.answer[2] === "ja" ? `${d.B[2]} ≥ ${d.grenze}: ja` : `${d.B[2]} < ${d.grenze}: nein`}`), right: "" }];
    return [{ label: "Mittelwert: Summe aller Gehälter : Anzahl.  Median: mittlerer Wert der geordneten Liste." },
      { left: T(`Mittelwert ≈ ${fmtNum(task.answer[0])} €,  Median = ${fmtNum(task.answer[1])} €`), right: "" },
      { label: "Der Mittelwert wird vom Ausreißer (Chefgehalt) stark nach oben gezogen, der Median nicht – er beschreibt das typische Gehalt besser." }];
  }

  // ---------- Glücksrad und Baumdiagramm ----------
  function gluecksradSVG(felder) { // felder: Liste von Beschriftungen (gleich große Sektoren)
    const n = felder.length, cx = 150, cy = 110, r = 95, farben = ["#bfdbfe", "#fde68a", "#bbf7d0", "#fbcfe8", "#ddd6fe", "#fed7aa"];
    let s = `<svg viewBox="0 0 300 220" width="300" height="220" xmlns="http://www.w3.org/2000/svg" class="graph-svg">`;
    felder.forEach((f, i) => {
      const a1 = (i / n) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2, am = (a1 + a2) / 2;
      s += `<path d="M ${cx} ${cy} L ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} A ${r} ${r} 0 0 1 ${(cx + r * Math.cos(a2)).toFixed(1)} ${(cy + r * Math.sin(a2)).toFixed(1)} Z" fill="${farben[i % farben.length]}" stroke="#1e3a8a" stroke-width="1.5"/>`;
      s += `<text x="${(cx + r * 0.65 * Math.cos(am)).toFixed(1)}" y="${(cy + r * 0.65 * Math.sin(am) + 5).toFixed(1)}" font-size="15" font-weight="bold" text-anchor="middle">${f}</text>`;
    });
    return s + `<polygon points="${cx - 7},6 ${cx + 7},6 ${cx},22" fill="#dc2626"/></svg>`;
  }
  function baumSVG(stufe1, stufe2) { // stufe1: [[name, wTex]], stufe2[i]: [[name, wTex]] – wTex als Text (z. B. "3/7" oder "?")
    const W = 300, H = 230, x0 = 20, x1 = 140, x2 = 270; let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" class="graph-svg">`;
    const y1 = stufe1.map((_, i) => ((i + 0.5) / stufe1.length) * H);
    stufe1.forEach(([n1, w1], i) => {
      s += `<line x1="${x0}" y1="${H / 2}" x2="${x1 - 12}" y2="${y1[i]}" stroke="#1e3a8a" stroke-width="1.5"/>` + `<text x="${(x0 + x1) / 2 - 8}" y="${((H / 2 + y1[i]) / 2 - 4).toFixed(1)}" font-size="12" fill="#dc2626" font-weight="bold" text-anchor="middle">${w1}</text>`;
      s += `<text x="${x1}" y="${y1[i] + 5}" font-size="14" font-weight="bold" text-anchor="middle">${n1}</text>`;
      const kinder = stufe2[i], hBlock = H / stufe1.length;
      kinder.forEach(([n2, w2], j) => {
        const y2 = i * hBlock + ((j + 0.5) / kinder.length) * hBlock;
        s += `<line x1="${x1 + 12}" y1="${y1[i]}" x2="${x2 - 12}" y2="${y2}" stroke="#1e3a8a" stroke-width="1.5"/>` + `<text x="${(x1 + x2) / 2}" y="${((y1[i] + y2) / 2 - 4).toFixed(1)}" font-size="12" fill="#dc2626" font-weight="bold" text-anchor="middle">${w2}</text>`;
        s += `<text x="${x2}" y="${y2 + 5}" font-size="14" font-weight="bold" text-anchor="middle">${n2}</text>`;
      });
    });
    return s + "</svg>";
  }
  const bruchK = (n, d) => { const g = gcd(n, d) || 1; return { num: n / g, den: d / g }; };
  const bTxt = (n, d) => `${n}/${d}`;

  // ---- Stufe 5: Laplace-Wahrscheinlichkeit und relative Häufigkeit ----
  function gen_stat_5() {
    const sub = choice(["wuerfel", "urne", "rad", "relativ"]);
    if (sub === "wuerfel") {
      const E = choice([["eine gerade Zahl", [2, 4, 6]], ["eine Zahl größer als 4", [5, 6]], ["eine Primzahl", [2, 3, 5]], ["höchstens eine 2", [1, 2]], ["keine 6", [1, 2, 3, 4, 5]], ["eine durch 3 teilbare Zahl", [3, 6]]]);
      return { topic: "statistik", level: 5, subtype: sub, prompt: T(`Ein fairer Würfel wird einmal geworfen. Ereignis E: „${E[0]}“.`), promptText: "Würfel",
        question: `\\text{Bestimme P(E) und die Wahrscheinlichkeit des Gegenereignisses.}`, numFields: 2, fieldLabels: ["P(E)", "P(Gegenereignis)"], answer: [bruchK(E[1].length, 6), bruchK(6 - E[1].length, 6)], data: { gunst: E[1], N: 6, name: E[0] } };
    }
    if (sub === "urne") {
      const r = randInt(1, 8), b = randInt(1, 8), g = randInt(0, 6), N = r + b + g, farbe = choice([["rot", r], ["blau", b]].concat(g ? [["grün", g]] : []));
      return { topic: "statistik", level: 5, subtype: sub, prompt: T(`In einer Urne liegen ${r} rote, ${b} blaue${g ? ` und ${g} grüne` : ""} Kugeln. Es wird eine Kugel gezogen.`), promptText: "Urne",
        question: T(`Wie groß ist die Wahrscheinlichkeit für „${farbe[0]}“ und für „nicht ${farbe[0]}“?`), numFields: 2, fieldLabels: [`P(${farbe[0]})`, `P(nicht ${farbe[0]})`], answer: [bruchK(farbe[1], N), bruchK(N - farbe[1], N)], data: { gunstAnz: farbe[1], N } };
    }
    if (sub === "rad") {
      const n = choice([4, 5, 6, 8]), felder = Array.from({ length: n }, () => randInt(1, 4)), z = choice([...new Set(felder)]), anz = felder.filter((x) => x === z).length;
      return { topic: "statistik", level: 5, subtype: sub, prompt: T(`Das Glücksrad hat ${n} gleich große Felder und wird einmal gedreht.`), promptText: "Glücksrad", graph: gluecksradSVG(felder),
        question: T(`Wie groß ist die Wahrscheinlichkeit, eine ${z} zu drehen?`), numFields: 1, fieldLabels: [`P(${z})`], answer: [bruchK(anz, n)], data: { felder, z } };
    }
    const N = choice([100, 200, 250, 400, 500, 1000]), k = Math.round(N * (0.3 + Math.random() * 0.35));
    return { topic: "statistik", level: 5, subtype: sub, prompt: T(`Eine Reißzwecke wurde ${N}-mal geworfen und landete ${k}-mal auf dem Rücken (Spitze nach oben).`), promptText: "relative Häufigkeit",
      question: T("Wie groß ist die relative Häufigkeit (als Dezimalzahl), und ist die Reißzwecke ein Laplace-Experiment?"), numFields: 2, fieldLabels: ["relative Häufigkeit", "Laplace-Experiment?"],
      perFieldType: ["text", "choice"], fieldChoices: [null, ["ja", "nein"]], answer: [k / N, "nein"], data: { N, k } };
  }
  function check_stat_bruch(task, inp) {
    const err = [];
    task.answer.forEach((a, i) => {
      if (a && typeof a === "object") { const f = parseUserFraction(inp[i]); if (!f || !fractionsEqual(f, a)) err.push(i); }
      else if (typeof a === "string") { if (inp[i] !== a) err.push(i); }
      else { const v = parseUserNumber(inp[i]); if (isNaN(v) || Math.abs(v - a) > 1e-9) err.push(i); }
    });
    return { correct: !err.length, fieldErrors: err };
  }
  function steps_stat_5(task) {
    const d = task.data, s = task.subtype, fT = (f) => `\\dfrac{${f.num}}{${f.den}}`;
    if (s === "relativ") return [{ label: "Relative Häufigkeit = Anzahl der Treffer : Anzahl der Versuche" }, { left: `\\dfrac{${d.k}}{${d.N}} = ${fmtNum(d.k / d.N)}`, right: "" },
      { label: "Kein Laplace-Experiment: Die beiden Lagen sind nicht gleich wahrscheinlich (die Reißzwecke ist nicht symmetrisch). Die Wahrscheinlichkeit kann man nur über lange Versuchsreihen schätzen." }];
    if (s === "rad") { const anz = d.felder.filter((x) => x === d.z).length; return [{ label: "Laplace: Anzahl der günstigen Felder : Anzahl aller Felder" }, { left: `P(${d.z}) = \\dfrac{${anz}}{${d.felder.length}} = ${fT(task.answer[0])}`, right: "" }]; }
    const g = s === "wuerfel" ? d.gunst.length : d.gunstAnz;
    return [{ label: "Laplace: P(E) = Anzahl der günstigen Ergebnisse : Anzahl aller Ergebnisse" }].concat(s === "wuerfel" ? [{ left: T(`günstig: ${d.gunst.join(", ")}`), right: "" }] : [])
      .concat([{ left: `P(E) = \\dfrac{${g}}{${d.N}} = ${fT(task.answer[0])}`, right: "" }, { label: "Gegenereignis: 1 − P(E)" }, { left: `1 - ${fT(task.answer[0])} = ${fT(task.answer[1])}`, right: "" }]);
  }

  // ---- Stufe 6: Baumdiagramm und Pfadregeln ----
  function gen_stat_6() {
    const sub = choice(["ohne", "mit", "mindestens", "ergaenzen"]);
    if (sub === "mindestens") { const n = choice([2, 3, 4]); const p = 1 - Math.pow(5 / 6, n);
      return { topic: "statistik", level: 6, subtype: sub, prompt: T(`Ein fairer Würfel wird ${n}-mal geworfen.`), promptText: "mindestens",
        question: T("Wie groß ist die Wahrscheinlichkeit, mindestens einmal eine 6 zu werfen? (als Bruch)"), numFields: 1, fieldLabels: ["P(mindestens eine 6)"],
        answer: [bruchK(Math.pow(6, n) - Math.pow(5, n), Math.pow(6, n))], data: { n, p } }; }
    const r = randInt(2, 6), b = randInt(2, 6), N = r + b, ohne = sub !== "mit";
    const z2 = (erst, farbe) => (ohne ? (farbe === "r" ? r - (erst === "r" ? 1 : 0) : b - (erst === "b" ? 1 : 0)) : farbe === "r" ? r : b), n2 = ohne ? N - 1 : N;
    const baum = (luecke) => baumSVG([["r", bTxt(r, N)], ["b", bTxt(b, N)]], [["r", "b"].map((f) => [f, luecke === "r" + f ? "?" : bTxt(z2("r", f), n2)]), ["r", "b"].map((f) => [f, luecke === "b" + f ? "?" : bTxt(z2("b", f), n2)])]);
    if (sub === "ergaenzen") { const l = choice(["rr", "rb", "br", "bb"]);
      return { topic: "statistik", level: 6, subtype: sub, prompt: T(`In einer Urne liegen ${r} rote und ${b} blaue Kugeln. Es werden zwei Kugeln ohne Zurücklegen gezogen.`), promptText: "ergänzen", graph: baum(l),
        question: T("Ergänze die fehlende Zweigwahrscheinlichkeit (?)."), numFields: 1, fieldLabels: ["fehlende Wahrscheinlichkeit"], answer: [bruchK(z2(l[0], l[1]), n2)], data: { r, b, l } }; }
    const E = choice(["zweimal rot", "gleiche Farbe", "mindestens eine rote", "verschiedene Farben"]);
    const P = (a, c) => (a === "r" ? r : b) * z2(a, c), N2 = N * n2;
    const zaehler = { "zweimal rot": P("r", "r"), "gleiche Farbe": P("r", "r") + P("b", "b"), "mindestens eine rote": N2 - P("b", "b"), "verschiedene Farben": P("r", "b") + P("b", "r") }[E];
    return { topic: "statistik", level: 6, subtype: sub, prompt: T(`In einer Urne liegen ${r} rote und ${b} blaue Kugeln. Es werden nacheinander zwei Kugeln ${ohne ? "ohne" : "mit"} Zurücklegen gezogen.`), promptText: "Baum", graph: baum(null),
      question: T(`Wie groß ist die Wahrscheinlichkeit für „${E}“?`), numFields: 1, fieldLabels: [`P(${E})`], answer: [bruchK(zaehler, N2)], data: { r, b, ohne, E } };
  }
  function steps_stat_6(task) {
    const d = task.data, s = task.subtype, fT = (f) => `\\dfrac{${f.num}}{${f.den}}`;
    if (s === "mindestens") return [{ label: "Über das Gegenereignis „keine einzige 6“ rechnen" }, { left: `P = 1 - \\left(\\dfrac{5}{6}\\right)^{${d.n}} = 1 - \\dfrac{${Math.pow(5, d.n)}}{${Math.pow(6, d.n)}} = ${fT(task.answer[0])}`, right: "" }];
    if (s === "ergaenzen") return [{ label: "Ohne Zurücklegen: Im zweiten Zug ist eine Kugel weniger in der Urne – und von der zuerst gezogenen Farbe eine weniger." }, { left: `= ${fT(task.answer[0])}`, right: "" },
      { label: "Kontrolle: Die Zweige, die von einem Punkt ausgehen, ergeben zusammen 1." }];
    const N = d.r + d.b, n2 = d.ohne ? N - 1 : N, z = (a, c) => (d.ohne ? (c === "r" ? d.r - (a === "r") : d.b - (a === "b")) : c === "r" ? d.r : d.b);
    const pf = (a, c) => `\\dfrac{${a === "r" ? d.r : d.b}}{${N}}\\cdot \\dfrac{${z(a, c)}}{${n2}}`;
    const terme = { "zweimal rot": [pf("r", "r")], "gleiche Farbe": [pf("r", "r"), pf("b", "b")], "verschiedene Farben": [pf("r", "b"), pf("b", "r")], "mindestens eine rote": [`1 - ${pf("b", "b")}`] }[d.E];
    return [{ label: "1. Pfadregel: entlang eines Pfades multiplizieren;  2. Pfadregel: die passenden Pfade addieren" + (d.E === "mindestens eine rote" ? ";  hier geschickter über das Gegenereignis „zweimal blau“" : "") },
      { left: `P = ${terme.join(" + ")} = ${fT(task.answer[0])}`, right: "" }];
  }

  // ---- Stufe 7: Wahrscheinlichkeit im Alltag ----
  function gen_stat_7() {
    const sub = choice(["elfmeter", "los", "code"]), n = choice(NAMEN);
    if (sub === "elfmeter") { const p = choice([0.7, 0.75, 0.8, 0.9]);
      return textTask("statistik", 7, sub, T(`${n} verwandelt einen Elfmeter mit der Wahrscheinlichkeit ${fmtNum(p)}. Im Training schießt ${n} zwei Elfmeter.`), T("Wie groß ist die Wahrscheinlichkeit, dass beide treffen, und dass höchstens einer trifft?"), [
        { label: "P(beide treffen)", kind: "number", answer: roundKfm(p * p, 4), tol: 1e-9 }, { label: "P(höchstens einer trifft)", kind: "number", answer: roundKfm(1 - p * p, 4), tol: 1e-9 }],
        [{ left: `P(${T("beide")}) = ${fmtNum(p)}\\cdot ${fmtNum(p)} = ${fmtNum(roundKfm(p * p, 4))}`, right: "" }, { label: "„Höchstens einer“ ist das Gegenereignis zu „beide“" }, { left: `1 - ${fmtNum(roundKfm(p * p, 4))} = ${fmtNum(roundKfm(1 - p * p, 4))}`, right: "" }], { dataExtra: { p } }); }
    if (sub === "los") { const N = choice([50, 100, 200]), G = choice([5, 10, 20, 25]);
      return textTask("statistik", 7, sub, T(`In einer Lostrommel beim Schulfest sind ${N} Lose, davon ${G} Gewinne. ${n} kauft zwei Lose.`), T("Wie groß ist die Wahrscheinlichkeit, dass beide Lose Nieten sind? (als Bruch)"),
        [{ label: "P(zwei Nieten)", kind: "fraction", answer: bruchK((N - G) * (N - G - 1), N * (N - 1)) }],
        [{ label: "Ziehen ohne Zurücklegen: Beim zweiten Los gibt es ein Los und eine Niete weniger" }, { left: `\\dfrac{${N - G}}{${N}}\\cdot \\dfrac{${N - G - 1}}{${N - 1}} = ${bruchTex((N - G) * (N - G - 1), N * (N - 1))}`, right: "" }], { dataExtra: { N, G } }); }
    const st = choice([3, 4]);
    return textTask("statistik", 7, sub, T(`Ein Fahrradschloss hat ${st} Rädchen mit den Ziffern 0 bis 9. ${n} hat den Code vergessen und probiert einmal zufällig.`), T("Wie viele Codes gibt es, und wie groß ist die Wahrscheinlichkeit, beim ersten Versuch richtig zu liegen?"),
      [{ label: "Anzahl der Codes", kind: "number", answer: Math.pow(10, st) }, { label: "Wahrscheinlichkeit (als Bruch)", kind: "fraction", answer: { num: 1, den: Math.pow(10, st) } }],
      [{ label: "Für jedes Rädchen 10 Möglichkeiten – multiplizieren" }, { left: `10^{${st}} = ${tausender(Math.pow(10, st))}`, right: "" }, { left: `P = \\dfrac{1}{${tausender(Math.pow(10, st))}}`, right: "" }], { dataExtra: { st } });
  }

  TOPICS.statistik = {
    name: "Statistik & Wahrscheinlichkeit",
    grade: "Kl. 6–10",
    levels: [
      { id: 1, name: "Kennwerte", grade: "Kl. 6–7", generate: gen_stat_1, check: check_stat_num, steps: steps_stat_1 },
      { id: 2, name: "Häufigkeitstabellen und fehlende Werte", grade: "Kl. 6–7", generate: gen_stat_2, check: check_stat_num, steps: steps_stat_2 },
      { id: 3, name: "Quartile und Boxplot", grade: "Kl. 7–8", generate: gen_stat_3, check: check_stat_num, steps: steps_stat_3 },
      { id: 4, name: "Daten beurteilen", grade: "Kl. 7–8", generate: gen_stat_4, check: check_stat_4, steps: steps_stat_4 },
      { id: 5, name: "Laplace und relative Häufigkeit", grade: "Kl. 7–8", generate: gen_stat_5, check: check_stat_bruch, steps: steps_stat_5 },
      { id: 6, name: "Baumdiagramm und Pfadregeln", grade: "Kl. 8–10", generate: gen_stat_6, check: check_stat_bruch, steps: steps_stat_6 },
      { id: 7, name: "Wahrscheinlichkeit im Alltag", grade: "Kl. 8–10", generate: gen_stat_7, check: check_textaufgabe, steps: steps_textaufgabe }
    ]
  };

  // ---------- Klassenarbeiten (beide ohne Taschenrechner) ----------
  KA_TEILGEBIETE.statistik = [["statistik", "Statistik (Kl. 7–8)"], ["wahrscheinlichkeit", "Wahrscheinlichkeit (Kl. 8–9)"]];
  KA_INFO.statistik = { klasse: "Kl. 7–9", tr: false, gebiete: { statistik: { klasse: "Kl. 7–8" }, wahrscheinlichkeit: { klasse: "Kl. 8–9" } } };
  const sts = (lvl, f) => stufenTeil("statistik", lvl, f), wahl3 = (pool) => mische(pool).slice(0, 3).map((f) => f());
  KA_VORLAGEN.statistik = [
    { key: "s_kennwerte", gebiet: "statistik", teil: "A", afb: 1, titel: "Kennwerte", baue: () => ({ kontext: "", teile: [sts(1), sts(2, (t) => t.subtype === "tabelle")] }) },
    { key: "s_ablesen", gebiet: "statistik", teil: "A", afb: 1, titel: "Boxplot ablesen", baue: () => { const t = sts(3, (x) => x.subtype === "ablesen"); return { kontext: "", graph: t.task.graph, teile: [t] }; } },
    { key: "s_boxplot", gebiet: "statistik", teil: "A", afb: 2, titel: "Quartile und Boxplot", baue: () => {
      const t = sts(3, (x) => x.subtype === "berechnen"), d = t.task.data.d, [q1, me, q3] = quartile(d), lo = Math.floor(Math.min(...d) / 10) * 10, hi = Math.ceil(Math.max(...d) / 10) * 10;
      return { kontext: "", teile: [t, papierTeil(T("✏️ Zeichne den Boxplot zu diesen Daten mit beschrifteter Achse."), [
        { text: `Kasten von q₁ = ${fmtNum(q1)} bis q₃ = ${fmtNum(q3)}, Median ${fmtNum(me)} markiert`, punkte: 1 }, { text: `Antennen bis Minimum ${Math.min(...d)} und Maximum ${Math.max(...d)}`, punkte: 1 }, { text: "Achse sinnvoll eingeteilt und beschriftet", punkte: 1 }],
        [{ label: "Musterlösung" }], boxplotSVG([{ w: [Math.min(...d), q1, me, q3, Math.max(...d)] }], { von: lo, bis: hi, schritt: 5, einheit: "min" }))] };
    } },
    { key: "s_vergleich", gebiet: "statistik", teil: "A", afb: 2, titel: "Boxplots vergleichen", baue: () => { const t = sts(4, (x) => x.subtype === "vergleich"); return { kontext: "", graph: t.task.graph, teile: [t] }; } },
    { key: "s_ausreisser", gebiet: "statistik", teil: "A", afb: 3, titel: "Mittelwert oder Median?", baue: () => ({ kontext: "", teile: [sts(4, (x) => x.subtype === "ausreisser"),
      papierTeil(T("✏️ Begründe, warum der Median hier aussagekräftiger ist als der Mittelwert."), [{ text: "Ausreißer (Chefgehalt) benannt", punkte: 1 }, { text: "Mittelwert wird stark verschoben, Median kaum", punkte: 1 }],
        [{ left: T("Ein einzelner sehr hoher Wert zieht den Mittelwert nach oben; der Median hängt nur von der Reihenfolge ab und bleibt beim typischen Gehalt."), right: "" }])] }) },
    { key: "s_aussagen", gebiet: "statistik", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => ({ kontext: "", teile: wahl3([
      () => aussageTeil(T("Lea behauptet: „Der Mittelwert ist immer einer der Werte aus der Liste.“"), false, ["Gegenbeispiel: 1 und 2 haben den Mittelwert 1,5.", "Stimmt, man rechnet ja nur mit diesen Werten.", "Stimmt bei ganzen Zahlen."]),
      () => aussageTeil(T("Tim behauptet: „Ist die Spannweite 0, sind alle Werte gleich.“"), true, ["Größter minus kleinster Wert ist 0 – also ist der größte gleich dem kleinsten.", "Nein, die Spannweite ist nie 0.", "Nur bei zwei Werten."]),
      () => aussageTeil(T("Ole behauptet: „Verdoppelt man alle Werte, verdoppelt sich auch der Mittelwert.“"), true, ["Die Summe verdoppelt sich, die Anzahl bleibt gleich.", "Nein, der Mittelwert bleibt gleich.", "Nur der Median verdoppelt sich."]),
      () => aussageTeil(T("Mia behauptet: „Im Kasten des Boxplots liegt genau die Hälfte aller Werte.“"), true, ["Zwischen q₁ und q₃ liegen etwa die mittleren 50 % der Werte.", "Nein, im Kasten liegen 25 %.", "Nein, im Kasten liegen alle Werte außer Minimum und Maximum."]),
      () => sts(2, (x) => x.subtype === "fehlend")]) }) },
    { key: "w_laplace", gebiet: "wahrscheinlichkeit", teil: "A", afb: 1, titel: "Laplace-Wahrscheinlichkeiten", baue: () => ({ kontext: "", teile: [sts(5, (t) => t.subtype === "wuerfel"), sts(5, (t) => t.subtype === "urne"), sts(5, (t) => t.subtype === "rad")] }) },
    { key: "w_haeufigkeit", gebiet: "wahrscheinlichkeit", teil: "A", afb: 2, titel: "Schätzen mit relativen Häufigkeiten", baue: () => ({ kontext: "", teile: [sts(5, (t) => t.subtype === "relativ"),
      papierTeil(T("✏️ Erkläre, warum man die Wahrscheinlichkeit bei der Reißzwecke nicht wie beim Würfel berechnen kann, und wie man sie trotzdem bestimmt."), [{ text: "Die Ergebnisse sind nicht gleich wahrscheinlich (kein Laplace-Experiment)", punkte: 1 }, { text: "Schätzen über die relative Häufigkeit einer langen Versuchsreihe", punkte: 1 }],
        [{ left: T("Die Reißzwecke ist nicht symmetrisch – Rücken- und Seitenlage sind nicht gleich wahrscheinlich. Man wirft sehr oft und nimmt die relative Häufigkeit als Schätzwert."), right: "" }])] }) },
    { key: "w_baum", gebiet: "wahrscheinlichkeit", teil: "A", afb: 2, titel: "Baumdiagramm", baue: () => { const t = sts(6, (x) => x.subtype === "ohne"); return { kontext: "", graph: t.task.graph, teile: [sts(6, (x) => x.subtype === "ergaenzen"), t, sts(6, (x) => x.subtype === "mit")] }; } },
    { key: "w_gegen", gebiet: "wahrscheinlichkeit", teil: "A", afb: 2, titel: "Gegenereignis", baue: () => ({ kontext: "", teile: [sts(6, (x) => x.subtype === "mindestens" && x.data.n <= 3), sts(7, (x) => x.subtype === "elfmeter")] }) }, // ohne TR: höchstens 6³
    { key: "w_alltag", gebiet: "wahrscheinlichkeit", teil: "A", afb: 2, titel: "Wahrscheinlichkeit im Alltag", baue: () => ({ kontext: "", teile: [sts(7, (x) => x.subtype === "los" && x.dataExtra.N === 50), sts(7, (x) => x.subtype === "code")] }) },
    { key: "w_aussagen", gebiet: "wahrscheinlichkeit", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => ({ kontext: "", teile: wahl3([
      () => aussageTeil(T("Lea behauptet: „Nach fünfmal Kopf ist beim nächsten Wurf Zahl wahrscheinlicher.“"), false, ["Die Münze hat kein Gedächtnis – die Wahrscheinlichkeit bleibt 1/2.", "Stimmt, auf Dauer gleicht sich das aus.", "Stimmt, nach fünfmal Kopf ist Zahl sicher."]),
      () => aussageTeil(T("Tim behauptet: „Beim Werfen von zwei Würfeln ist die Augensumme 7 genauso wahrscheinlich wie die Augensumme 2.“"), false, ["Summe 7 entsteht auf 6 Arten, Summe 2 nur auf eine (1 + 1).", "Stimmt, alle Summen sind gleich wahrscheinlich.", "Stimmt, weil beide Zahlen nur einmal vorkommen."]),
      () => aussageTeil(T("Ole behauptet: „Die Wahrscheinlichkeiten aller Ergebnisse eines Zufallsversuchs ergeben zusammen 1.“"), true, ["Irgendein Ergebnis tritt sicher ein – das sichere Ereignis hat die Wahrscheinlichkeit 1.", "Nein, sie ergeben 100.", "Nur bei Laplace-Experimenten."]),
      () => aussageTeil(T("Mia behauptet: „Beim Ziehen ohne Zurücklegen ändern sich die Wahrscheinlichkeiten im zweiten Zug.“"), true, ["Die Anzahl der Kugeln in der Urne hat sich verändert.", "Nein, sie bleiben immer gleich.", "Nur wenn man zweimal dieselbe Farbe zieht."])]) }) }
  ];

  // ---------- Erklärungen ----------
  Object.assign(ERKL, {
    "statistik/1": E("Kennwerte", [T("Mittelwert: Summe aller Werte : Anzahl."), T("Median: mittlerer Wert der GEORDNETEN Liste (bei gerader Anzahl: Mittelwert der beiden mittleren)."), T("Modalwert: häufigster Wert.  Spannweite: größter − kleinster Wert.")],
      [{ left: T("3; 7; 4; 7; 9  →  geordnet 3; 4; 7; 7; 9:  Mittelwert 6, Median 7, Modalwert 7, Spannweite 6"), right: "" }], [T("Den Median aus der ungeordneten Liste ablesen."), T("Bei gerader Anzahl einen der beiden mittleren Werte nehmen statt ihres Mittelwerts.")]),
    "statistik/2": E("Häufigkeitstabellen und fehlende Werte", [T("Mittelwert aus einer Tabelle: jeden Wert mit seiner Anzahl multiplizieren, addieren, durch die Gesamtanzahl teilen."), T("Fehlender Wert: Summe = Mittelwert · Anzahl; davon die bekannten Werte abziehen.")],
      [{ left: T("Noten 1|2|3 mit Anzahl 2|3|5:  (1·2 + 2·3 + 3·5) : 10 = 2,3"), right: "" }], [T("Durch die Anzahl der verschiedenen Noten (3) statt durch die Anzahl der Schüler (10) teilen.")]),
    "statistik/3": E("Quartile und Boxplot", [T("Liste ordnen. Median teilt sie in zwei Hälften (bei ungerader Anzahl ohne den Median)."), T("Unteres Quartil q₁ = Median der unteren Hälfte, oberes Quartil q₃ = Median der oberen Hälfte."), T("Boxplot: Kasten von q₁ bis q₃ mit Median-Strich, Antennen bis Minimum und Maximum. Quartilsabstand = q₃ − q₁.")],
      [{ left: T("2; 4; 5; 7; 8; 9; 12:  Median 7, q₁ = 4, q₃ = 9, Quartilsabstand 5"), right: "" }], [T("Die Liste nicht ordnen."), T("Quartilsabstand und Spannweite verwechseln.")], "boxplot"),
    "statistik/4": E("Daten beurteilen", [T("Der Mittelwert reagiert stark auf Ausreißer, der Median kaum."), T("Boxplots vergleichen: Lage (Median), Streuung (Kastenbreite = Quartilsabstand, Spannweite). Links vom Median liegt die Hälfte der Werte.")],
      [{ left: T("Gehälter 2000, 2100, 2200, 12000:  Mittelwert 4575, Median 2150 – der Median ist typischer."), right: "" }], [T("Aus einem breiten Kasten auf „mehr Werte“ schließen – er zeigt nur größere Streuung.")]),
    "statistik/5": E("Laplace und relative Häufigkeit", [`P(E) = \\dfrac{${T("Anzahl der günstigen Ergebnisse")}}{${T("Anzahl aller Ergebnisse")}}\\;\\; ${T("(nur wenn alle Ergebnisse gleich wahrscheinlich sind)")}`, T("Gegenereignis: P(nicht E) = 1 − P(E)."), T("Sonst: Wahrscheinlichkeit über die relative Häufigkeit einer langen Versuchsreihe schätzen.")],
      [{ left: `${T("Glücksrad im Bild:")}\\;\\; P(1) = \\dfrac{3}{6} = \\dfrac{1}{2}\\,, \\quad P(3) = \\dfrac{1}{6}\\,, \\quad P(${T("nicht 1")}) = 1 - \\dfrac{1}{2} = \\dfrac{1}{2}`, right: "" }], [T("Glücksrad mit ungleich großen Feldern als Laplace-Experiment behandeln."), T("Die Anzahl der Farben statt der Kugeln in den Nenner schreiben.")], "rad"),
    "statistik/6": E("Baumdiagramm und Pfadregeln", [T("1. Pfadregel (Produktregel): Wahrscheinlichkeiten entlang eines Pfades multiplizieren."), T("2. Pfadregel (Summenregel): Wahrscheinlichkeiten der passenden Pfade addieren."), T("Ohne Zurücklegen ändern sich im 2. Zug Zähler und Nenner. „Mindestens einmal“: über das Gegenereignis rechnen.")],
      [{ left: `${T("3 rote, 2 blaue, ohne Zurücklegen:")}\\;\\; P(rr) = \\dfrac{3}{5}\\cdot \\dfrac{2}{4} = \\dfrac{3}{10}`, right: "" }], [T("Beim Ziehen ohne Zurücklegen im 2. Zug den Nenner nicht verkleinern."), T("Entlang eines Pfades addieren statt multiplizieren.")], "baum"),
    "statistik/7": E("Wahrscheinlichkeit im Alltag", [T("Situation als Baumdiagramm oder Urne modellieren: Was wird gezogen, mit oder ohne Zurücklegen?"), T("„Höchstens einer“ oder „mindestens einer“ fast immer über das Gegenereignis.")],
      [{ left: T("Treffer mit 0,8: beide treffen 0,8 · 0,8 = 0,64; höchstens einer trifft 1 − 0,64 = 0,36"), right: "" }], [T("„Höchstens einer“ mit „genau einer“ verwechseln.")])
  });
  const erklGrafikStat = erklGrafik;
  erklGrafik = function (art) {
    if (art === "boxplot") return boxplotSVG([{ w: [2, 4, 7, 9, 12] }], { von: 0, bis: 14, schritt: 2 });
    if (art === "rad") return gluecksradSVG([1, 2, 1, 3, 1, 2]);
    if (art === "baum") return baumSVG([["r", "3/5"], ["b", "2/5"]], [[["r", "2/4"], ["b", "2/4"]], [["r", "3/4"], ["b", "1/4"]]]);
    return erklGrafikStat(art);
  };

  // ---------- Fehlerdiagnose ----------
  H.medianUngeordnet = "Den Median erst aus der GEORDNETEN Liste bestimmen.";
  H.tabelleNenner = "Durch die Gesamtzahl aller Werte teilen (Summe der Anzahlen), nicht durch die Anzahl der Spalten.";
  H.ohneZuruecklegen = "Ohne Zurücklegen: Im zweiten Zug ist eine Kugel weniger in der Urne.";
  H.pfadAddiert = "Entlang eines Pfades wird multipliziert, nicht addiert.";
  H.mindestensEinfach = "„Mindestens einmal“: über das Gegenereignis 1 − (5/6)ⁿ rechnen.";
  Object.assign(DIAG, {
    "statistik/1": (t, i, w) => { const d = t.data.d; return i === 1 && !nah(w.v, medianVon(d)) && nah(w.v, d.length % 2 ? d[(d.length - 1) / 2] : (d[d.length / 2 - 1] + d[d.length / 2]) / 2) ? H.medianUngeordnet : null; },
    "statistik/2": (t, i, w) => { if (t.subtype !== "tabelle" || i !== 0) return null; const d = t.data, S = d.werte.reduce((s, x, k) => s + x * d.anz[k], 0); return nah(w.v, S / d.werte.length, 0.002) ? H.tabelleNenner : null; },
    "statistik/6": (t, i, w) => { const d = t.data;
      if (t.subtype === "ohne" && d.E === "zweimal rot" && nah(w.v, (d.r * d.r) / ((d.r + d.b) ** 2))) return H.ohneZuruecklegen;
      if (t.subtype === "mindestens" && nah(w.v, d.n / 6)) return H.mindestensEinfach; return null; }
  });

