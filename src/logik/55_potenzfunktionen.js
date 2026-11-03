  // ============================================================
  // POTENZFUNKTIONEN f(x) = a·xⁿ (Kl. 10)
  // Inhalte und Obergrenze nach Recherche (Arbeitsblätter/Klassenarbeiten Kl. 10:
  // Eigenschaften und Symmetrie, Graphen zuordnen, Punktprobe, Funktionsterm aus
  // ein bzw. zwei Punkten, Potenzgleichungen xⁿ = c, Verschieben/Strecken,
  // Anwendungen wie Bremsweg und "Verdoppeln ⇒ 2ⁿ-fach").
  // Bewusst ohne gebrochene Exponenten bei Funktionsgraphen (außer √x im Zuordnen)
  // und ohne Umkehrfunktionen (Oberstufe).
  // ============================================================
  // Koeffizient als Bruch p/q (q > 0), z. B. { p: -1, q: 2 }
  const PF_KOEFF = [[1, 1], [-1, 1], [2, 1], [-2, 1], [3, 1], [1, 2], [-1, 2], [1, 4], [1, 3]];
  function koeffTex(p, q) { // vor einem x-Term
    if (q === 1) return p === 1 ? "" : p === -1 ? "-" : `${p}`;
    return p < 0 ? `-\\dfrac{${-p}}{${q}}` : `\\dfrac{${p}}{${q}}`;
  }
  const potTex = (p, q, n) => `${koeffTex(p, q)}x^{${n}}`;
  // exakter Wert a·x0ⁿ als gekürzter Bruch
  function pfWert(p, q, n, x0) {
    let num = p, den = q;
    if (n >= 0) num *= Math.pow(x0, n); else den *= Math.pow(x0, -n);
    if (den < 0) { num = -num; den = -den; }
    const g = gcd(Math.abs(num), den) || 1;
    return { num: num / g, den: den / g };
  }
  const frTxt = (f) => (f.den === 1 ? `${f.num}` : `${f.num}/${f.den}`);
  const frTexPF = (f) => bruchTex(f.num, f.den);
  const klammerX = (x) => (x < 0 ? `(${x})` : `${x}`);
  function check_pf_wert(task, inp) { // Bruchfelder: jede gleichwertige Schreibweise; Zahlen mit Toleranz; Auswahl exakt
    const err = [];
    task.answer.forEach((a, i) => {
      let ok;
      if (a && typeof a === "object") { const f = parseUserFraction(inp[i]); ok = !!f && f.den !== 0 && fractionsEqual(f, a); }
      else if (typeof a === "string") ok = inp[i] === a;
      else { const v = parseUserNumber(inp[i]); ok = !isNaN(v) && Math.abs(v - a) <= ((task.tolerances && task.tolerances[i]) || 1e-9); }
      if (!ok) err.push(i);
    });
    return { correct: !err.length, fieldErrors: err };
  }

  // ---- Stufe 1: Eigenschaften ----
  const SYM = ["achsensymmetrisch zur y-Achse", "punktsymmetrisch zum Ursprung"];
  const DEF = ["alle reellen Zahlen", "alle reellen Zahlen außer 0"];
  const ASY = ["keine Asymptoten", "x-Achse und y-Achse"];
  function gen_pf_1() {
    const n = choice([-4, -3, -2, -1, 2, 3, 4, 5]), [p, q] = choice([[1, 1], [-1, 1], [2, 1], [-2, 1], [1, 2], [-3, 1]]);
    return { topic: "potenzfunktionen", level: 1, prompt: `f(x) = ${potTex(p, q, n)}`, promptText: `Eigenschaften n=${n}`,
      question: T("Bestimme Symmetrie, Definitionsbereich und Asymptoten des Graphen."), numFields: 3, fieldType: "choice",
      fieldLabels: ["Symmetrie", "Definitionsbereich", "Asymptoten"], fieldChoices: [SYM, DEF, ASY],
      answer: [n % 2 === 0 ? SYM[0] : SYM[1], n < 0 ? DEF[1] : DEF[0], n < 0 ? ASY[1] : ASY[0]], data: { n, p, q } };
  }
  function steps_pf_1(task) {
    const { n } = task.data, ger = n % 2 === 0;
    return [
      { label: `Symmetrie: Der Exponent ${n} ist ${ger ? "gerade" : "ungerade"}` },
      { left: T(ger ? "f(−x) = f(x) ⇒ achsensymmetrisch zur y-Achse" : "f(−x) = −f(x) ⇒ punktsymmetrisch zum Ursprung"), right: "" },
      { label: n < 0 ? "Negativer Exponent: x steht im Nenner" : "Positiver Exponent: man kann jede Zahl einsetzen" },
      { left: n < 0 ? `x^{${n}} = \\dfrac{1}{x^{${-n}}} \\;\\Rightarrow\\; ${T("x = 0 ist verboten")}` : T("Definitionsbereich: alle reellen Zahlen"), right: "" },
      { label: "Asymptoten" },
      { left: T(n < 0 ? "Für x → 0 wird |f(x)| riesig (y-Achse), für große |x| geht f(x) gegen 0 (x-Achse)" : "Keine – der Graph wächst für große |x| immer weiter"), right: "" }
    ];
  }

  // ---- Stufe 2: Graphen zuordnen (gleicher Generator wie Potenzrechnung Stufe 7) ----
  function gen_pf_2() { const t = gen_potenz_7(); t.topic = "potenzfunktionen"; t.level = 2; return t; }

  // ---- Stufe 3: Funktionswerte und Punktprobe ----
  function gen_pf_3() {
    const sub = choice(["wert", "wert", "punktprobe"]);
    const n = choice([-2, -1, 2, 3, 4]), [p, q] = choice(PF_KOEFF), x0 = choice([-3, -2, -1, 2, 3].filter((x) => Math.abs(Math.pow(x, Math.abs(n))) <= 81));
    const w = pfWert(p, q, n, x0);
    if (sub === "wert") return { topic: "potenzfunktionen", level: 3, subtype: sub, signed: true, prompt: `f(x) = ${potTex(p, q, n)}`, promptText: `f(${x0})`,
      question: `${T("Berechne")}\\;\\; f(${x0})`, numFields: 1, fieldLabels: [`f(${x0})`], answer: [w], data: { p, q, n, x0 } };
    // Punktprobe: richtiger Wert oder typischer Fehler (Vorzeichen bei gerader Potenz, Koeffizient mitpotenziert)
    const kand = [{ num: -w.num, den: w.den }]; // Vorzeichenfehler
    if (n > 0) kand.push(pfWert(Math.pow(p, n), Math.pow(q, n), n, x0)); // Faktor mitpotenziert: (a·x)ⁿ
    const falsch = kand.filter((f) => !fractionsEqual(f, w));
    const liegt = Math.random() < 0.5 || !falsch.length, y = liegt ? w : choice(falsch);
    return { topic: "potenzfunktionen", level: 3, subtype: sub, prompt: `f(x) = ${potTex(p, q, n)}\\,,\\quad P(${x0}\\,|\\,${frTexPF(y)})`, promptText: `Punktprobe ${x0}|${frTxt(y)}`,
      question: T("Liegt der Punkt P auf dem Graphen von f?"), numFields: 1, fieldType: "choice", fieldChoices: [["ja", "nein"]], fieldLabels: ["P liegt auf dem Graphen"],
      answer: [liegt ? "ja" : "nein"], data: { p, q, n, x0, y } };
  }
  function steps_pf_3(task) {
    const { p, q, n, x0 } = task.data, w = pfWert(p, q, n, x0);
    const potenz = n >= 0 ? `${klammerX(x0)}^{${n}} = ${Math.pow(x0, n)}` : `${klammerX(x0)}^{${n}} = \\dfrac{1}{${klammerX(x0)}^{${-n}}} = ${bruchTex(1, Math.pow(x0, -n))}`;
    const out = [
      { label: "x-Wert einsetzen – negative Zahlen in Klammern!" },
      { left: `f(${x0}) = ${koeffTex(p, q) === "" ? "" : koeffTex(p, q) === "-" ? "-" : koeffTex(p, q) + "\\cdot "}${klammerX(x0)}^{${n}}`, right: "" },
      { label: "Erst die Potenz, dann mit dem Faktor davor multiplizieren" },
      { left: potenz, right: "" },
      { left: `f(${x0}) = ${frTexPF(w)}`, right: "" }
    ];
    if (task.subtype === "punktprobe") out.push({ label: "Mit der y-Koordinate von P vergleichen" }, { left: T(task.answer[0] === "ja" ? "gleich ⇒ P liegt auf dem Graphen" : `${frTxt(task.data.y)} ≠ ${frTxt(w)} ⇒ P liegt nicht auf dem Graphen`), right: "" });
    return out;
  }

  // ---- Stufe 4: Potenzgleichungen a·xⁿ = c ----
  const mengeTxt = (L) => (L.length ? "{ " + L.map((x) => fmtNum(x)).join("; ") + " }" : "{ } (keine Lösung)");
  function gen_pf_4() {
    if (Math.random() < 0.6) { // exakt, ohne Taschenrechner
      const n = choice([2, 3, 4, 5]), b = randInt(1, n <= 3 ? 6 : 3) * (n % 2 && Math.random() < 0.4 ? -1 : 1), a = choice([1, 1, 2, 3, -1]);
      let c = a * Math.pow(b, n);
      const keine = n % 2 === 0 && Math.random() < 0.25; if (keine) c = -c;
      const L = keine ? [] : n % 2 === 0 ? [-Math.abs(b), Math.abs(b)] : [b];
      const opt = [mengeTxt(L)], kand = [[Math.abs(b)], [-Math.abs(b), Math.abs(b)], [-b], [], [n * (b > 0 ? 1 : -1)]];
      kand.forEach((k) => { const t = mengeTxt(k); if (!opt.includes(t) && opt.length < 4) opt.push(t); });
      return { topic: "potenzfunktionen", level: 4, subtype: "exakt", prompt: `${a === 1 ? "" : a === -1 ? "-" : a}x^{${n}} = ${c}`, promptText: `${a}x^${n}=${c}`,
        question: T("Bestimme die Lösungsmenge (ohne Taschenrechner)."), numFields: 1, fieldType: "choice", fieldChoices: [mische(opt)], fieldLabels: ["Lösungsmenge"], answer: [mengeTxt(L)], data: { a, n, c, L } };
    }
    const n = choice([2, 3, 4, 5]), a = choice([1, 2, 3, 0.5]);
    const vollePotenz = (v) => { const w = Math.round(Math.pow(Math.abs(v), 1 / n)); return Math.abs(w ** n - Math.abs(v)) < 1e-9; };
    let c; do { c = randInt(2, 60) * (n % 2 && Math.random() < 0.3 ? -1 : 1); } while (vollePotenz(c / a));
    const r = Math.sign(c) * Math.pow(Math.abs(c / a), 1 / n), anz = n % 2 === 0 ? "2" : "1", groesste = n % 2 === 0 ? Math.abs(r) : r;
    return { topic: "potenzfunktionen", level: 4, subtype: "gerundet", signed: true, prompt: `${a === 1 ? "" : fmtNum(a)}x^{${n}} = ${c}`, promptText: `${a}x^${n}=${c}`,
      question: T("Wie viele Lösungen gibt es? Gib die größte Lösung auf 2 Nachkommastellen an."), numFields: 2, perFieldType: ["choice", "text"], fieldChoices: [["0", "1", "2"], null],
      fieldSigned: [false, true], fieldLabels: ["Anzahl der Lösungen", "größte Lösung"], answer: [anz, Math.round(groesste * 100) / 100], tolerances: [0, 0.011], data: { a, n, c } };
  }
  function steps_pf_4(task) {
    const { a, n, c } = task.data, ger = n % 2 === 0, rest = c / a;
    const out = [];
    if (a !== 1) out.push({ label: `Zuerst durch ${fmtNum(a)} teilen` }, { left: `x^{${n}} = ${fmtNum(rest)}`, right: "" });
    out.push({ label: ger ? "Gerader Exponent: Die Potenz ist nie negativ – bei positiver rechter Seite gibt es zwei Lösungen (±)" : "Ungerader Exponent: genau eine Lösung, das Vorzeichen bleibt erhalten" });
    if (ger && rest < 0) { out.push({ left: T(`x^${n} kann nicht ${fmtNum(rest)} sein ⇒ keine Lösung`), right: "" }); return out; }
    const w = Math.pow(Math.abs(rest), 1 / n), wt = Number.isInteger(Math.round(w * 1e9) / 1e9) ? fmtNum(Math.round(w)) : `\\sqrt[${n}]{${fmtNum(Math.abs(rest))}} \\approx ${fmtNum(Math.round(w * 100) / 100)}`;
    out.push({ label: `${n}. Wurzel ziehen` }, { left: ger ? `x = \\pm ${wt}` : `x = ${rest < 0 ? "-" : ""}${wt}`, right: "" });
    return out;
  }

  // ---- Stufe 5: Funktionsterm bestimmen ----
  function gen_pf_5() {
    if (Math.random() < 0.5) { // n gegeben, a aus einem Punkt
      const n = choice([-2, -1, 2, 3, 4]), [p, q] = choice(PF_KOEFF.filter(([pp]) => pp !== 0)), x0 = choice([-2, 2, 3, -3].filter((x) => Math.abs(Math.pow(x, Math.abs(n))) <= 81));
      const y = pfWert(p, q, n, x0);
      return { topic: "potenzfunktionen", level: 5, subtype: "einPunkt", signed: true, prompt: `f(x) = a\\cdot x^{${n}}\\,,\\quad P(${x0}\\,|\\,${frTexPF(y)})`, promptText: `a aus P(${x0}|${frTxt(y)})`,
        question: T("Der Graph geht durch P. Bestimme a."), numFields: 1, fieldLabels: ["a"], answer: [{ num: p, den: q }], data: { p, q, n, x0, y } };
    }
    // a und n aus zwei Punkten: A(x1|y1), B(2·x1|y2), Quotient = 2ⁿ
    const n = choice([-2, -1, 2, 3, 4]), [p, q] = choice([[1, 1], [2, 1], [3, 1], [-1, 1], [1, 2], [-2, 1], [4, 1]]), x1 = choice([1, 2]);
    const y1 = pfWert(p, q, n, x1), y2 = pfWert(p, q, n, 2 * x1);
    return { topic: "potenzfunktionen", level: 5, subtype: "zweiPunkte", signed: true, prompt: `f(x) = a\\cdot x^{n}\\,,\\quad A(${x1}\\,|\\,${frTexPF(y1)})\\,,\\;\\; B(${2 * x1}\\,|\\,${frTexPF(y2)})`, promptText: `zwei Punkte x1=${x1}`,
      question: T("Der Graph geht durch A und B. Bestimme n und a."), numFields: 2, fieldLabels: ["n", "a"], answer: [n, { num: p, den: q }], data: { p, q, n, x1, y1, y2 } };
  }
  function steps_pf_5(task) {
    const d = task.data;
    if (task.subtype === "einPunkt") {
      const xp = pfWert(1, 1, d.n, d.x0);
      return [
        { label: "Koordinaten von P einsetzen" }, { left: `${frTexPF(d.y)} = a\\cdot ${klammerX(d.x0)}^{${d.n}} = a\\cdot ${frTexPF(xp)}`, right: "" },
        { label: `Durch ${frTxt(xp)} teilen` }, { left: `a = ${frTexPF(d.y)} : ${frTexPF(xp)} = ${bruchTex(d.p, d.q)}`, right: "" }];
    }
    const quot = pfWert(1, 1, d.n, 2);
    return [
      { label: "Beide Punkte einsetzen und die Gleichungen durcheinander teilen – a kürzt sich weg" },
      { left: `\\dfrac{f(${2 * d.x1})}{f(${d.x1})} = \\dfrac{a\\cdot ${2 * d.x1}^{n}}{a\\cdot ${d.x1}^{n}} = 2^{n}`, right: "" },
      { left: `2^{n} = ${frTexPF(d.y2)} : ${frTexPF(d.y1)} = ${frTexPF(quot)} \\;\\Rightarrow\\; n = ${d.n}`, right: "" },
      { label: "n einsetzen und a aus A bestimmen" },
      { left: `${frTexPF(d.y1)} = a\\cdot ${d.x1}^{${d.n}} \\;\\Rightarrow\\; a = ${bruchTex(d.p, d.q)}`, right: "" }];
  }

  // ---- Stufe 6: Verschieben, strecken, spiegeln: f(x) = a(x − d)ⁿ + e ----
  const verschTex = (a, d, n, e) => `${a === 1 ? "" : a === -1 ? "-" : fmtNum(a)}${d === 0 ? "x" : `(x ${d > 0 ? "-" : "+"} ${Math.abs(d)})`}^{${n}}${e === 0 ? "" : e > 0 ? ` + ${e}` : ` - ${-e}`}`;
  function beschreibung(a, d, e) {
    const t = [];
    if (d) t.push(`${Math.abs(d)} nach ${d > 0 ? "rechts" : "links"}`);
    if (e) t.push(`${Math.abs(e)} nach ${e > 0 ? "oben" : "unten"}`);
    let s = t.length ? "um " + t.join(" und ") + " verschoben" : "nicht verschoben";
    if (a < 0) s += ", an der x-Achse gespiegelt";
    if (Math.abs(a) > 1) s += `, mit Faktor ${fmtNum(Math.abs(a))} gestreckt`;
    if (Math.abs(a) < 1) s += `, mit Faktor ${fmtNum(Math.abs(a))} gestaucht`;
    return s;
  }
  function pfGraph(a, d, e, n, marks) {
    return renderGraphSVG([{ fn: (x) => (n < 0 && Math.abs(x - d) < 1e-9 ? NaN : a * Math.pow(x - d, n) + e), color: "#2563eb" }],
      { xmin: d - 5, xmax: d + 5, ymin: e - 5, ymax: e + 5, width: 280, height: 260, padLeft: 24, padBottom: 20, ticks: true, samples: 600, marks: marks || [] });
  }
  function gen_pf_6() {
    const n = choice([2, 3, -1]), a = choice([1, -1, 2, -2]), d = randInt(-3, 3), e = randInt(-3, 3);
    if (Math.random() < 0.55) {
      const marks = n < 0 ? [{ type: "vline", x: d, color: "#94a3b8" }, { type: "hline", y: e, color: "#94a3b8" }] : [];
      return { topic: "potenzfunktionen", level: 6, subtype: "ablesen", signed: true, prompt: `${T("Der Graph gehört zu")}\\;\\; f(x) = a\\cdot (x - d)^{${n}} + e`, promptText: `ablesen n=${n}`,
        graph: pfGraph(a, d, e, n, marks), question: T(n < 0 ? "Lies d und e an den Asymptoten ab und bestimme a." : "Lies d und e ab und bestimme a."),
        numFields: 3, fieldLabels: ["d", "e", "a"], answer: [d, e, a], data: { a, d, e, n } };
    }
    const richtig = beschreibung(a, d, e), opt = [richtig];
    [[a, -d, e], [a, d, -e], [-a, d, e], [a, -d, -e], [a, e, d]].forEach(([aa, dd, ee]) => { const s = beschreibung(aa, dd, ee); if (!opt.includes(s) && opt.length < 4) opt.push(s); });
    return { topic: "potenzfunktionen", level: 6, subtype: "beschreiben", prompt: `f(x) = ${verschTex(a, d, n, e)}`, promptText: `beschreiben ${a},${d},${e}`,
      question: `${T("Wie entsteht der Graph von f aus dem Graphen von")}\\;\\; y = x^{${n}}${T("?")}`, numFields: 1, fieldType: "choice", fieldChoices: [mische(opt)], fieldLabels: ["Der Graph ist"], answer: [richtig], data: { a, d, e, n } };
  }
  function steps_pf_6(task) {
    const { a, d, e, n } = task.data, zentrum = n === 2 ? "Scheitelpunkt" : n === 3 ? "Symmetriezentrum (Wendepunkt)" : "Schnittpunkt der Asymptoten";
    if (task.subtype === "beschreiben") return [
      { label: "In (x − d) verschiebt d nach RECHTS, wenn d positiv ist – also umgekehrt zum Vorzeichen in der Klammer" },
      { left: d === 0 ? T("keine Klammer ⇒ keine Verschiebung nach links/rechts") : `(x ${d > 0 ? "-" : "+"} ${Math.abs(d)}) \\;\\Rightarrow\\; ${T(Math.abs(d) + " nach " + (d > 0 ? "rechts" : "links"))}`, right: "" },
      { label: "Die Zahl hinten (e) verschiebt nach oben bzw. unten" },
      { left: T(e === 0 ? "e = 0 ⇒ nicht nach oben/unten" : `e = ${e} ⇒ ${Math.abs(e)} nach ${e > 0 ? "oben" : "unten"}`), right: "" },
      { label: "Der Faktor a: Minus spiegelt an der x-Achse, |a| > 1 streckt" },
      { left: T(beschreibung(a, d, e)), right: "" }];
    return [
      { label: `${zentrum} ablesen: Er ist von (0 | 0) nach (d | e) gewandert` },
      { left: `d = ${d},\\;\\; e = ${e}`, right: "" },
      { label: "a: einen Schritt nach rechts gehen und schauen, wie weit der Graph steigt oder fällt" },
      { left: `f(${d + 1}) = ${e + a} \\;\\Rightarrow\\; a = ${e + a} - ${klammerX(e)} = ${a}`, right: "" }];
  }

  // ---- Stufe 7: Anwendungen ----
  const PF_KONTEXTE = [
    { n: 2, txt: "Der Flächeninhalt eines Kreises ist A = π·r².", g: "Radius", z: "Flächeninhalt" },
    { n: 3, txt: "Das Volumen eines Würfels ist V = a³.", g: "Kantenlänge", z: "Volumen" },
    { n: 3, txt: "Das Volumen einer Kugel ist V = 4/3·π·r³.", g: "Radius", z: "Volumen" },
    { n: 2, txt: "Für den Bremsweg gilt die Faustformel s = (v/10)².", g: "Geschwindigkeit", z: "Bremsweg" },
    { n: -2, txt: "Die Anziehungskraft zweier Körper ist F = c·r⁻² (r = Abstand).", g: "Abstand", z: "Anziehungskraft" },
    { n: -2, txt: "Die Helligkeit einer Lampe nimmt mit H = c·r⁻² ab (r = Abstand).", g: "Abstand", z: "Helligkeit" }
  ];
  function gen_pf_7() {
    const sub = choice(["faktor", "faktor", "bremsweg", "kugel"]);
    if (sub === "faktor") {
      const k = choice(PF_KONTEXTE), [kn, kd, wort] = choice([[2, 1, "verdoppelt"], [3, 1, "verdreifacht"], [1, 2, "halbiert"]]);
      const num = k.n >= 0 ? Math.pow(kn, k.n) : Math.pow(kd, -k.n), den = k.n >= 0 ? Math.pow(kd, k.n) : Math.pow(kn, -k.n), g = gcd(num, den);
      return textTask("potenzfunktionen", 7, sub, T(`${k.txt} Der ${k.g} wird ${wort}.`), T(`Mit welchem Faktor ändert sich der ${k.z}?`),
        [{ label: "Faktor (z. B. 4 oder 1/9)", kind: "fraction", answer: { num: num / g, den: den / g } }],
        [{ label: `Der ${k.g} steht hoch ${k.n}: neuer Wert = Faktor hoch ${k.n}` },
         { left: `\\left(${kd === 1 ? kn : `\\dfrac{${kn}}{${kd}}`}\\right)^{${k.n}} = ${bruchTex(num, den)}`, right: "" },
         { left: T(`Der ${k.z} wird mit ${bruchTxt(num, den)} multipliziert.`), right: "" }], { dataExtra: { n: k.n, kn, kd } });
    }
    if (sub === "bremsweg") {
      if (Math.random() < 0.5) { const v = choice([30, 50, 70, 80, 100, 120, 130]), s = (v / 10) ** 2;
        return textTask("potenzfunktionen", 7, "bremsweg", T(`Für den Bremsweg s (in m) bei der Geschwindigkeit v (in km/h) gilt die Faustformel s = (v/10)². Ein Auto fährt ${v} km/h.`),
          T("Wie lang ist der Bremsweg?"), [{ label: "Bremsweg in m", kind: "number", answer: s }],
          [{ label: "v einsetzen, erst teilen, dann quadrieren" }, { left: `s = \\left(\\dfrac{${v}}{10}\\right)^{2} = ${v / 10}^{2} = ${s}`, right: "" }], { dataExtra: { v, rueck: false } }); }
      const s = choice([16, 25, 36, 49, 64, 81, 100, 144]), v = 10 * Math.sqrt(s);
      return textTask("potenzfunktionen", 7, "bremsweg", T(`Für den Bremsweg s (in m) bei der Geschwindigkeit v (in km/h) gilt die Faustformel s = (v/10)². Ein Bremsweg war ${s} m lang.`),
        T("Wie schnell war das Auto?"), [{ label: "Geschwindigkeit in km/h", kind: "number", answer: v }],
        [{ label: "Gleichung aufstellen und rückwärts rechnen: erst Wurzel, dann mal 10" }, { left: `\\left(\\dfrac{v}{10}\\right)^{2} = ${s} \\;\\Rightarrow\\; \\dfrac{v}{10} = \\sqrt{${s}} = ${Math.sqrt(s)} \\;\\Rightarrow\\; v = ${v}`, right: "" }], { dataExtra: { s, rueck: true } });
    }
    const V = choice([100, 250, 500, 1000, 2000, 5000]), r = Math.cbrt((3 * V) / (4 * Math.PI)), r1 = Math.round(r * 10) / 10;
    return textTask("potenzfunktionen", 7, "kugel", T(`Eine Kugel soll ein Volumen von ${V} cm³ haben (V = 4/3·π·r³).`),
      T("Wie groß muss der Radius sein? (1 Nachkommastelle)"), [{ label: "Radius in cm", kind: "number", answer: r1, tol: 0.06 }],
      [{ label: "Nach r³ auflösen: mal 3, durch 4π" }, { left: `r^{3} = \\dfrac{3\\cdot ${V}}{4\\pi} \\approx ${fmtNum(Math.round(r ** 3 * 100) / 100)}`, right: "" },
       { label: "Dritte Wurzel ziehen" }, { left: `r = \\sqrt[3]{${fmtNum(Math.round(r ** 3 * 100) / 100)}} \\approx ${fmtNum(r1)}`, right: "" }], { dataExtra: { V } });
  }

  TOPICS.potenzfunktionen = {
    name: "Potenzfunktionen",
    grade: "Kl. 10",
    levels: [
      { id: 1, name: "Eigenschaften erkennen", grade: "Kl. 10", generate: gen_pf_1, check: check_pf_wert, steps: steps_pf_1 },
      { id: 2, name: "Graphen zuordnen", grade: "Kl. 10", generate: gen_pf_2, check: check_potenz_7, steps: steps_potenz_7 },
      { id: 3, name: "Funktionswerte und Punktprobe", grade: "Kl. 10", signed: true, generate: gen_pf_3, check: check_pf_wert, steps: steps_pf_3 },
      { id: 4, name: "Potenzgleichungen", grade: "Kl. 10", signed: true, generate: gen_pf_4, check: check_pf_wert, steps: steps_pf_4 },
      { id: 5, name: "Funktionsterm bestimmen", grade: "Kl. 10", signed: true, generate: gen_pf_5, check: check_pf_wert, steps: steps_pf_5 },
      { id: 6, name: "Verschieben, strecken, spiegeln", grade: "Kl. 10", signed: true, generate: gen_pf_6, check: check_pf_wert, steps: steps_pf_6 },
      { id: 7, name: "Anwendungen", grade: "Kl. 10", calculatorHint: "Taschenrechner erlaubt", generate: gen_pf_7, check: check_textaufgabe, steps: steps_textaufgabe }
    ]
  };

  // --- Erklärungen ---
  Object.assign(ERKL, {
    "potenzfunktionen/1": E("Eigenschaften von Potenzfunktionen",
      [T("Gerader Exponent (x², x⁴, x⁻²): achsensymmetrisch zur y-Achse, denn (−x)ⁿ = xⁿ."), T("Ungerader Exponent (x³, x⁻¹): punktsymmetrisch zum Ursprung, denn (−x)ⁿ = −xⁿ."),
       T("Negativer Exponent: x⁻ⁿ = 1/xⁿ, also ist x = 0 verboten. Die Achsen sind Asymptoten."), T("Der Faktor a ändert die Symmetrie nicht.")],
      [{ left: `f(x) = -2x^{-3}:\\;\\; ${T("ungerade ⇒ punktsymmetrisch; negativ ⇒ x ≠ 0, Asymptoten x- und y-Achse")}`, right: "" }],
      [T("Das Minus vor dem Faktor mit dem Exponenten verwechseln: −x² ist trotzdem achsensymmetrisch."), T("Bei negativem Exponenten x = 0 einsetzen.")], "pf1"),
    "potenzfunktionen/2": Object.assign({}, ERKL["potenzrechnung/7"]),
    "potenzfunktionen/3": E("Funktionswerte und Punktprobe",
      [T("x-Wert in Klammern einsetzen, zuerst die Potenz, dann mal a."), T("Negativer Exponent: x⁻ⁿ = 1/xⁿ."), T("Punktprobe: f(x-Koordinate) ausrechnen und mit der y-Koordinate vergleichen.")],
      [{ left: `f(x) = \\dfrac{1}{2}x^{3}:\\;\\; f(-2) = \\dfrac{1}{2}\\cdot (-2)^{3} = \\dfrac{1}{2}\\cdot (-8) = -4`, right: "" }],
      [T("(−2)⁴ ohne Klammer rechnen: −2⁴ = −16, aber (−2)⁴ = +16."), T("Den Faktor mitpotenzieren: ½·2³ ist 4, nicht (½·2)³ = 1.")]),
    "potenzfunktionen/4": E("Potenzgleichungen xⁿ = c",
      [T("Zuerst durch den Faktor vor xⁿ teilen."), T("Gerader Exponent: c > 0 ⇒ zwei Lösungen ±ⁿ√c; c < 0 ⇒ keine Lösung."), T("Ungerader Exponent: genau eine Lösung, sie hat das Vorzeichen von c.")],
      [{ left: `x^{4} = 81 \\;\\Rightarrow\\; x = \\pm 3\\,, \\qquad x^{3} = -8 \\;\\Rightarrow\\; x = -2\\,, \\qquad x^{2} = -4 \\;\\Rightarrow\\; ${T("keine Lösung")}`, right: "" }],
      [T("Bei geradem Exponenten die negative Lösung vergessen."), T("Bei x⁴ = −16 die Lösung −2 angeben – (−2)⁴ ist +16.")]),
    "potenzfunktionen/5": E("Funktionsterm bestimmen",
      [T("n bekannt: Punkt einsetzen und nach a auflösen."), T("n und a gesucht: beide Punkte einsetzen und die Gleichungen durcheinander teilen – a kürzt sich weg."),
       T("Liegen die x-Werte im Verhältnis 2 : 1, ist der Quotient der y-Werte 2ⁿ.")],
      [{ left: `A(1\\,|\\,3),\\; B(2\\,|\\,24):\\;\\; \\dfrac{24}{3} = 8 = 2^{3} \\;\\Rightarrow\\; n = 3,\\;\\; a = 3`, right: "" }],
      [T("Beim Einsetzen den Exponenten auf a mit anwenden."), T("Den Quotienten 1/4 als n = 2 statt n = −2 deuten.")]),
    "potenzfunktionen/6": E("Verschieben, strecken, spiegeln",
      [T("f(x) = a·(x − d)ⁿ + e: Der Graph von xⁿ wird um d nach rechts und um e nach oben verschoben."), T("Achtung: (x − 2) bedeutet 2 nach RECHTS, (x + 2) bedeutet 2 nach links."),
       T("a < 0 spiegelt an der x-Achse, |a| > 1 streckt, |a| < 1 staucht."), T("a ablesen: vom verschobenen Ursprung (d | e) einen Schritt nach rechts – der Graph ändert sich um a.")],
      [{ left: `f(x) = -(x - 2)^{3} + 1:\\;\\; ${T("2 nach rechts, 1 nach oben, an der x-Achse gespiegelt")}`, right: "" }],
      [T("Das Vorzeichen in der Klammer übernehmen: (x + 3) ist 3 nach LINKS."), T("e und d vertauschen.")], "pf6"),
    "potenzfunktionen/7": E("Potenzfunktionen im Alltag",
      [T("Steht eine Größe hoch n, ändert sich das Ergebnis beim k-fachen Wert um den Faktor kⁿ."), T("Verdoppeln bei r²: Faktor 4; bei r³: Faktor 8; bei r⁻²: Faktor 1/4."), T("Rückwärts rechnen: nach der Potenz auflösen und die passende Wurzel ziehen.")],
      [{ left: T("Kugel: Radius verdoppelt ⇒ Volumen 2³ = 8-mal so groß. Abstand verdoppelt ⇒ Anziehungskraft 2⁻² = 1/4."), right: "" }],
      [T("Annehmen, dass sich das Ergebnis genauso verdoppelt."), T("Bei negativem Exponenten den Kehrwert vergessen.")])
  });
  const erklGrafikPF = erklGrafik;
  erklGrafik = function (art) {
    if (art === "pf1") return renderGraphSVG([{ fn: (x) => -2 / (x * x * x), color: "#2563eb", label: "f" }], { xmin: -3, xmax: 3, ymin: -5, ymax: 5, width: 300, height: 220, padLeft: 26, padBottom: 22, ticks: true, samples: 600 });
    if (art === "pf6") return pfGraph(-1, 2, 1, 3, [{ type: "point", x: 2, y: 1, label: "(2|1)", color: "#111" }]);
    return erklGrafikPF(art);
  };

  // --- Fehlerdiagnose ---
  H.pfKlammer = "Negative x-Werte in Klammern setzen: (−2)⁴ = +16, bei geradem Exponenten wird das Ergebnis positiv.";
  H.pfZweiteLoesung = "Gerader Exponent: Es gibt auch eine negative Lösung (±).";
  H.pfVerschiebung = "Vorzeichen in der Klammer umdrehen: (x − d) verschiebt um d nach rechts.";
  H.pfQuadratStattN = "Der Faktor ist kⁿ, nicht k – die Größe steht hoch n.";
  Object.assign(DIAG, {
    "potenzfunktionen/3": (t, i, w) => { const d = t.data; if (!w || t.subtype !== "wert" || d.x0 > 0 || d.n % 2) return null; const f = pfWert(d.p, d.q, d.n, d.x0); return nah(w.v, -f.num / f.den) ? H.pfKlammer : null; },
    "potenzfunktionen/4": (t, i, w, raw) => (t.subtype === "exakt" && t.data.n % 2 === 0 && t.data.L.length === 2 && raw === mengeTxt([Math.abs(t.data.L[1])]) ? H.pfZweiteLoesung : null),
    "potenzfunktionen/6": (t, i, w) => (w && t.subtype === "ablesen" && i === 0 && t.data.d !== 0 && nah(w.v, -t.data.d) ? H.pfVerschiebung : null),
    "potenzfunktionen/7": (t, i, w) => { const d = t.dataExtra; return w && t.subtype === "faktor" && d.n !== 1 && nah(w.v, d.kn / d.kd) ? H.pfQuadratStattN : null; }
  });

  // --- Klassenarbeit ---
  KA_INFO.potenzfunktionen = { klasse: "Kl. 10", tr: true };
  KA_VORLAGEN.potenzfunktionen = [
    { key: "eigenschaften", teil: "A", afb: 1, titel: "Eigenschaften und Funktionswerte", baue: () => ({ kontext: "", teile: [stufenTeil("potenzfunktionen", 1), stufenTeil("potenzfunktionen", 3, (t) => t.subtype === "wert"), stufenTeil("potenzfunktionen", 3, (t) => t.subtype === "punktprobe")] }) },
    { key: "graphen", teil: "A", afb: 2, titel: "Graphen zuordnen", baue: () => ({ kontext: "", teile: [stufenTeil("potenzfunktionen", 2)] }) },
    { key: "gleichungen", teil: "A", afb: 2, titel: "Potenzgleichungen", baue: () => ({ kontext: "", teile: [stufenTeil("potenzfunktionen", 4, (t) => t.subtype === "exakt"), stufenTeil("potenzfunktionen", 4, (t) => t.subtype === "exakt")] }) },
    { key: "term", teil: "A", afb: 2, titel: "Funktionsterm bestimmen", baue: () => ({ kontext: "", teile: [stufenTeil("potenzfunktionen", 5, (t) => t.subtype === "einPunkt"), stufenTeil("potenzfunktionen", 5, (t) => t.subtype === "zweiPunkte")] }) },
    { key: "aussagen", teil: "A", afb: 3, titel: "Aussagen prüfen", baue: () => {
      const pool = [
        () => aussageTeil(T("Lea behauptet: „Alle Graphen von f(x) = xⁿ gehen durch den Punkt (1 | 1).“"), true, ["1ⁿ = 1 für jeden Exponenten n.", "Stimmt nur für gerade Exponenten.", "Stimmt nur für positive Exponenten."]),
        () => aussageTeil(T("Ben behauptet: „Der Graph von f(x) = x⁻² hat bei x = 0 den Punkt (0 | 0).“"), false, ["x⁻² = 1/x², durch 0 darf man nicht teilen – die y-Achse ist Asymptote.", "Stimmt, jede Potenzfunktion geht durch (0 | 0).", "Stimmt, weil 0⁻² = 0 ist."]),
        () => aussageTeil(T("Mia behauptet: „Verdoppelt man den Radius eines Kreises, verdoppelt sich auch seine Fläche.“"), false, ["A = πr²: (2r)² = 4r², die Fläche wird 4-mal so groß.", "Stimmt, Radius und Fläche sind proportional.", "Stimmt, weil π konstant ist."]),
        () => aussageTeil(T("Tim behauptet: „Die Gleichung x⁴ = −16 hat die Lösung x = −2.“"), false, ["(−2)⁴ = +16; eine gerade Potenz ist nie negativ, also gibt es keine Lösung.", "Stimmt, weil 2⁴ = 16 ist.", "Stimmt, das Minus bleibt beim Wurzelziehen erhalten."]),
        () => aussageTeil(T("Ida behauptet: „Der Graph von f(x) = −x³ ist punktsymmetrisch zum Ursprung.“"), true, ["Der Exponent 3 ist ungerade; das Minus spiegelt nur an der x-Achse, die Symmetrie bleibt.", "Stimmt nicht, das Minus zerstört die Symmetrie.", "Stimmt nicht, nur gerade Exponenten sind symmetrisch."])
      ];
      return { kontext: "", teile: mische(pool).slice(0, 3).map((f) => f()) };
    } },
    { key: "verschieben", teil: "B", afb: 2, titel: "Verschobene Graphen", baue: () => { const t = stufenTeil("potenzfunktionen", 6, (x) => x.subtype === "ablesen"); return { kontext: "", graph: t.task.graph, teile: [t, stufenTeil("potenzfunktionen", 6, (x) => x.subtype === "beschreiben")] }; } },
    { key: "anwendungen", teil: "B", afb: 2, titel: "Potenzfunktionen im Alltag", baue: () => { const a = stufenTeil("potenzfunktionen", 7, (t) => t.subtype === "faktor"); let b; do { b = stufenTeil("potenzfunktionen", 7); } while (b.task.subtype === "faktor"); return { kontext: "", teile: [a, b] }; } }
  ];
