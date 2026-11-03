  // ============================================================
  // LINEARE FUNKTIONEN
  // ============================================================

  // ---- Stufe 1: Steigung aus zwei Punkten berechnen (Kl. 7-8) ----
  function gen_linear_1() {
    const x1 = randInt(-6, 6);
    const y1 = randInt(-6, 6);
    let dx = randInt(-6, 6);
    while (dx === 0) dx = randInt(-6, 6);
    const dy = randInt(-10, 10);
    const x2 = x1 + dx;
    const y2 = y1 + dy;
    const g = gcd(dy, dx) || 1;
    const num = dy / g, den = dx / g;
    // Vorzeichen vereinheitlichen: Nenner immer positiv
    const answer = den < 0 ? { num: -num, den: -den } : { num, den };
    return {
      topic: "lineare_funktionen", level: 1,
      prompt: `P(${x1}\\,|\\,${y1})\\,, \\; Q(${x2}\\,|\\,${y2})`,
      promptText: `P(${x1}|${y1}), Q(${x2}|${y2})`,
      question: `m = \\;?`,
      questionText: `Steigung m = ?`,
      numFields: 1,
      fieldLabels: ["m (Bruch oder Zahl, z. B. 3/4)"],
      answerType: "fraction",
      answer: [answer],
      data: { x1, y1, x2, y2, dx, dy }
    };
  }
  function check_linear_1(task, userInputs) {
    const f = parseUserFraction(userInputs[0]);
    if (!f) return { correct: false, fieldErrors: [0] };
    const ok = fractionsEqual(f, task.answer[0]);
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_linear_1(task) {
    const { x1, y1, x2, y2, dx, dy } = task.data;
    return [
      { left: `m = \\dfrac{y_2-y_1}{x_2-x_1}`, right: "Formel" },
      { left: `m = \\dfrac{${y2}-(${y1})}{${x2}-(${x1})}`, right: "einsetzen" },
      { left: `m = \\dfrac{${dy}}{${dx}}`, right: "" }
    ];
  }

  // ---- Stufe 2: Geradengleichung aufstellen (Kl. 7-8) ----
  function gen_linear_2() {
    let m = randInt(-5, 5);
    while (m === 0) m = randInt(-5, 5);
    const b = randInt(-10, 10);
    const x1 = randInt(-5, 5);
    const y1 = m * x1 + b;
    let x2 = randInt(-5, 5);
    while (x2 === x1) x2 = randInt(-5, 5);
    const y2 = m * x2 + b;
    return {
      topic: "lineare_funktionen", level: 2,
      prompt: `P(${x1}\\,|\\,${y1})\\,, \\; Q(${x2}\\,|\\,${y2})`,
      promptText: `P(${x1}|${y1}), Q(${x2}|${y2})`,
      question: `\\text{Bestimme die Geradengleichung.}`,
      questionText: `Geradengleichung y = mx + b`,
      numFields: 2,
      fieldLabels: ["m", "b"], eingabeForm: ["y =", 0, "x +", 1],
      answer: [m, b],
      data: { m, b, x1, y1, x2, y2 }
    };
  }
  function check_linear_2(task, userInputs) {
    const v0 = parseUserNumber(userInputs[0]);
    const v1 = parseUserNumber(userInputs[1]);
    const errors = [];
    if (isNaN(v0) || v0 !== task.answer[0]) errors.push(0);
    if (isNaN(v1) || v1 !== task.answer[1]) errors.push(1);
    return { correct: errors.length === 0, fieldErrors: errors };
  }
  function steps_linear_2(task) {
    const { m, b, x1, y1, x2, y2 } = task.data;
    return [
      { left: `m = \\dfrac{${y2}-(${y1})}{${x2}-(${x1})} = ${m}`, right: "Steigung berechnen" },
      { left: `y = ${m}x + b`, right: "einsetzen von P" },
      { left: `${y1} = ${m}\\cdot(${x1}) + b`, right: "" },
      { left: `b = ${b}`, right: "" }
    ];
  }

  // ---- Stufe 3: Parallelität & Orthogonalität (Kl. 8) ----
  function gen_linear_3() {
    let m1 = randInt(-6, 6);
    while (m1 === 0) m1 = randInt(-6, 6);
    const subtype = choice(["parallel", "ortho"]);
    const answer = subtype === "parallel" ? { num: m1, den: 1 } : { num: -1, den: m1 };
    return {
      topic: "lineare_funktionen", level: 3, subtype,
      prompt: subtype === "parallel"
        ? `\\text{Gerade }g\\text{ mit }m_1 = ${m1}\\text{, gesucht: Steigung einer Parallelen}`
        : `\\text{Gerade }g\\text{ mit }m_1 = ${m1}\\text{, gesucht: Steigung einer Senkrechten}`,
      promptText: subtype === "parallel" ? `g: m1=${m1}, Steigung einer Parallelen?` : `g: m1=${m1}, Steigung einer Senkrechten?`,
      numFields: 1,
      fieldLabels: ["m (Bruch oder Zahl)"],
      answerType: "fraction",
      answer: [answer],
      data: { m1 }
    };
  }
  function check_linear_3(task, userInputs) {
    const f = parseUserFraction(userInputs[0]);
    if (!f) return { correct: false, fieldErrors: [0] };
    const ok = fractionsEqual(f, task.answer[0]);
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_linear_3(task) {
    const { m1 } = task.data;
    if (task.subtype === "parallel") {
      return [
        { left: `\\text{Parallele Geraden haben dieselbe Steigung}`, right: "" },
        { left: `m = m_1 = ${m1}`, right: "" }
      ];
    }
    return [
      { left: `m_1\\cdot m_2 = -1`, right: "Orthogonalitätsbedingung" },
      { left: `m_2 = -\\dfrac{1}{m_1} = -\\dfrac{1}{${m1}}`, right: "" }
    ];
  }

  // ---- Stufe 4: Schnittpunkt zweier Geraden (Kl. 8-9) ----
  function gen_linear_4() {
    const xT = randInt(-5, 5);
    let m1 = randInt(-4, 4);
    while (m1 === 0) m1 = randInt(-4, 4);
    let m2 = randInt(-4, 4);
    while (m2 === 0 || m2 === m1) m2 = randInt(-4, 4);
    const b1 = randInt(-8, 8);
    const b2 = b1 + (m1 - m2) * xT;
    const yT = m1 * xT + b1;
    return {
      topic: "lineare_funktionen", level: 4,
      prompt: `f(x) = ${coefX(m1)} ${b1 >= 0 ? "+" : "-"} ${Math.abs(b1)}\\,, \\quad g(x) = ${coefX(m2)} ${b2 >= 0 ? "+" : "-"} ${Math.abs(b2)}`,
      promptText: `f(x)=${coefX(m1)}${b1 >= 0 ? "+" : ""}${b1}, g(x)=${coefX(m2)}${b2 >= 0 ? "+" : ""}${b2}`,
      question: `\\text{Bestimme den Schnittpunkt.}`,
      questionText: `Schnittpunkt S(x|y)`,
      numFields: 2,
      fieldLabels: ["x", "y"], eingabeForm: ["S(", 0, "|", 1, ")"],
      answer: [xT, yT],
      data: { m1, m2, b1, b2, xT, yT }
    };
  }
  function check_linear_4(task, userInputs) {
    const v0 = parseUserNumber(userInputs[0]);
    const v1 = parseUserNumber(userInputs[1]);
    const errors = [];
    if (isNaN(v0) || v0 !== task.answer[0]) errors.push(0);
    if (isNaN(v1) || v1 !== task.answer[1]) errors.push(1);
    return { correct: errors.length === 0, fieldErrors: errors };
  }
  function steps_linear_4(task) {
    const { m1, m2, b1, b2, xT, yT } = task.data;
    return [
      { left: `${coefX(m1)} ${b1 >= 0 ? "+" : "-"} ${Math.abs(b1)} = ${coefX(m2)} ${b2 >= 0 ? "+" : "-"} ${Math.abs(b2)}`, right: "Gleichsetzen" },
      { left: `${coefX(m1 - m2)} = ${b2 - b1}`, right: "umformen" },
      { left: `x = ${xT}`, right: `:${m1 - m2}` },
      { left: `y = ${m1}\\cdot(${xT}) ${b1 >= 0 ? "+" : "-"} ${Math.abs(b1)} = ${yT}`, right: "in f(x) einsetzen" }
    ];
  }

  // ---------------- Lineare Funktionen: Textaufgaben ----------------
  // Realistische Fragen (Wie weit komme ich? Wann ist es leer? Welcher Tarif
  // lohnt sich für mich?) -- die Geradengleichung wird NICHT vorgegeben.
  const FAMILIEN = ["Weber", "Schulz", "Yılmaz", "Nowak", "Becker", "Hoffmann", "Kaya", "Wagner"];
  const uhr = (h, mm) => `${h}:${mm === undefined ? "00" : mm} Uhr`;
  const ABOS = [
    { key: "fitness", xs: ["Monat", "Monate"], e: ["Studio A", "Studio B"], ms: [15, 30], dm: [2, 8], bs2: [0, 30],
      text: (c) => `Fitnessstudio A verlangt ${c.b1} € Aufnahmegebühr und ${c.m1} € pro Monat, Fitnessstudio B ${c.b2 === 0 ? "keine Aufnahmegebühr" : c.b2 + " € Aufnahmegebühr"} und ${c.m2} € pro Monat. ${c.n} will voraussichtlich ${anz(c.xp, "Monat", "Monate")} trainieren.`,
      frage: (c) => `Bei wie vielen Monaten wären beide gleich teuer? Welches Studio ist für ${c.n} günstiger?`, x: "Monate" },
    { key: "handy", xs: ["Monat", "Monate"], e: ["Vertrag A", "Vertrag B"], ms: [5, 15], dm: [2, 6], bs2: [0, 20],
      text: (c) => `Handyvertrag A kostet einmalig ${c.b1} € und dann ${c.m1} € im Monat. Vertrag B ${c.b2 === 0 ? "hat keine einmaligen Kosten und kostet" : "kostet einmalig " + c.b2 + " € und dann"} ${c.m2} € im Monat. ${c.n} will den Vertrag ${anz(c.xp, "Monat", "Monate")} lang nutzen.`,
      frage: (c) => `Bei wie vielen Monaten wären beide gleich teuer? Welcher Vertrag ist für ${c.n} günstiger?`, x: "Monate" },
    { key: "paket", xs: ["kg", "kg"], e: ["Dienst A", "Dienst B"], ms: [1, 3], dm: [1, 2], bs2: [3, 6],
      text: (c) => `Paketdienst A verlangt ${c.b1} € Grundpreis plus ${c.m1} € pro Kilogramm, Paketdienst B ${c.b2} € Grundpreis plus ${c.m2} € pro Kilogramm. ${c.n} will ein Paket mit ${c.xp} kg verschicken.`,
      frage: (c) => `Bei wie vielen Kilogramm kosten beide gleich viel? Welcher Dienst ist für ${genitiv(c.n)} Paket günstiger?`, x: "kg" }
  ];

  function gen_linear_5() {
    const sub = choice(["taxi", "handwerker", "verleih", "strom", "kerze", "akku", "abo"]);
    const n = choice(NAMEN);
    if (sub === "taxi") {
      let b, m, B, x, ans;
      do {
        b = choice([3.5, 4, 4.5, 5]); m = choice([1.8, 2, 2.2, 2.5]); B = choice([15, 20, 25, 30]);
        x = (B - b) / m; ans = Math.floor(x + 1e-9);
      } while (ans < 2);
      const steps = [
        { label: "Kosten = Grundgebühr + Preis pro km · Kilometer. Das Geld reicht, solange die Kosten höchstens so hoch sind wie das Budget." },
        { left: `${fmtNum(m)}\\cdot x + ${fmtNum(b)} = ${B}`, right: "" },
        { left: `x = (${B} - ${fmtNum(b)}) : ${fmtNum(m)} \\approx ${fmtNum(round2(x))}`, right: "" },
        { label: "Nur volle Kilometer, die man noch bezahlen kann: abrunden" },
        { left: T(`höchstens ${ans} km`), right: "" }
      ];
      return textTask("lineare_funktionen", 5, "taxi",
        T(`Ein Taxi kostet ${euro(b)} Grundgebühr und ${euro(m)} pro gefahrenem Kilometer. ${n} hat nach einer Feier nur noch ${B} € dabei.`),
        T(`Wie viele volle Kilometer kann ${n} mit dem Taxi höchstens fahren?`), [
          { label: "Kilometer (höchstens)", kind: "number", answer: ans }
        ], steps, { dataExtra: { b, m, B } });
    }
    if (sub === "handwerker") {
      const r = choice([45, 50, 55, 60, 65]), A = choice([25, 30, 35, 40, 45]);
      const h1 = randInt(1, 4), h2 = h1 + randInt(1, 4);
      const R1 = A + r * h1, R2 = A + r * h2;
      const [F1, F2] = zweiAus(FAMILIEN);
      const steps = [
        { label: "Die zusätzlichen Stunden erklären den Preisunterschied" },
        { left: `(${R2} - ${R1}) : (${h2} - ${h1}) = ${R2 - R1} : ${h2 - h1} = ${r}`, right: "" },
        { label: "Anfahrt = Rechnung minus Arbeitszeit" },
        { left: `${R1} - ${h1}\\cdot ${r} = ${A}`, right: "" }
      ];
      return textTask("lineare_funktionen", 5, "handwerker",
        T(`Ein Elektriker berechnet für jeden Einsatz eine feste Anfahrtspauschale und dazu einen festen Stundenlohn. Familie ${F1} hat für ${anz(h1, "Stunde", "Stunden")} Arbeit ${R1} € bezahlt, Familie ${F2} für ${anz(h2, "Stunde", "Stunden")} ${R2} €.`),
        T("Wie hoch sind Stundenlohn und Anfahrtspauschale?"), [
          { label: "Stundenlohn in €", kind: "number", answer: r },
          { label: "Anfahrtspauschale in €", kind: "number", answer: A }
        ], steps, { dataExtra: { h1, h2, R1, R2 } });
    }
    if (sub === "verleih") {
      const b = choice([2, 3, 4, 5]), m = choice([3, 4, 5, 6]);
      const s = randInt(9, 12), mm = choice(["00", "30"]), d = randInt(2, 6), p = randInt(2, 5);
      const c1 = b + m * d, total = p * c1;
      const F = choice(FAMILIEN);
      const steps = [
        { label: "Leihdauer aus den Uhrzeiten" },
        { left: T(`${uhr(s + d, mm)} − ${uhr(s, mm)} = ${d} Stunden`), right: "" },
        { label: "Kosten pro Fahrrad: Grundgebühr + Stundenpreis · Stunden" },
        { left: `${b} + ${m}\\cdot ${d} = ${c1}`, right: "" },
        { label: `Für ${p} Fahrräder` },
        { left: `${p}\\cdot ${c1} = ${total}`, right: "" }
      ];
      return textTask("lineare_funktionen", 5, "verleih",
        T(`Familie ${F} leiht sich für einen Ausflug ${p} Fahrräder. Pro Fahrrad verlangt der Verleih ${b} € Grundgebühr und ${m} € pro Stunde. Die Familie holt die Räder um ${uhr(s, mm)} ab und bringt sie um ${uhr(s + d, mm)} zurück.`),
        T("Wie viel kostet der Ausflug insgesamt?"), [
          { label: "Kosten pro Fahrrad in €", kind: "number", answer: c1 },
          { label: "Gesamtkosten in €", kind: "number", answer: total }
        ], steps, { dataExtra: { b, m, s, d, p } });
    }
    if (sub === "strom") {
      const G = choice([10, 12, 14]), c = choice([30, 32, 35, 38, 40]);
      const z1 = randInt(1800, 3800) * 10 + randInt(0, 9), v = 10 * randInt(12, 26), z2 = z1 + v;
      const total = (G * 100 + v * c) / 100;
      const steps = [
        { label: "Verbrauch = neuer minus alter Zählerstand" },
        { left: `${tausender(z2)} - ${tausender(z1)} = ${v}`, right: "" },
        { label: "Rechnung = Grundpreis + Preis pro kWh · Verbrauch" },
        { left: `${G} + ${fmtNum(c / 100)}\\cdot ${v} = ${fmtNum(total.toFixed(2))}`, right: "" }
      ];
      return textTask("lineare_funktionen", 5, "strom",
        T(`Der Stromanbieter verlangt ${G} € Grundpreis im Monat und ${c} Cent pro Kilowattstunde. Am 1. März stand der Stromzähler bei ${tausender(z1)} kWh, am 1. April bei ${tausender(z2)} kWh.`),
        T("Wie hoch ist die Stromrechnung für den März?"), [
          { label: "Verbrauch in kWh", kind: "number", answer: v },
          { label: "Rechnungsbetrag in €", kind: "number", answer: total, tol: 0.005 }
        ], steps, { dataExtra: { G, c, z1, z2 } });
    }
    if (sub === "kerze") {
      let r, k, H, t0, d;
      do { r = choice([2, 3, 4]); k = randInt(4, 8); H = r * k; t0 = randInt(15, 19); d = randInt(1, 3); } while (t0 + k > 23 || d >= k);
      const steps = [
        { label: "Abbrand pro Stunde" },
        { left: `(${H} - ${H - r * d}) : ${d} = ${r}`, right: "" },
        { label: "Brenndauer = Höhe : Abbrand pro Stunde" },
        { left: `${H} : ${r} = ${k}`, right: "" },
        { label: "Uhrzeit = Anzünden + Brenndauer" },
        { left: T(`${t0} Uhr + ${k} Stunden = ${t0 + k} Uhr`), right: "" }
      ];
      return textTask("lineare_funktionen", 5, "kerze",
        T(`${n} zündet um ${t0} Uhr eine neue, ${H} cm hohe Kerze an. Um ${t0 + d} Uhr ist sie nur noch ${H - r * d} cm hoch. Die Kerze brennt gleichmäßig ab.`),
        T("Um wie viel Uhr ist die Kerze ganz heruntergebrannt?"), [
          { label: "Abbrand pro Stunde in cm", kind: "number", answer: r },
          { label: "Uhrzeit (volle Stunde)", kind: "number", answer: t0 + k }
        ], steps, { dataExtra: { H, t0, d, h: H - r * d } });
    }
    if (sub === "akku") {
      let S, r, t0, d, T0, E;
      do {
        S = choice([100, 90, 80]); r = choice([5, 6, 8, 10, 12, 15]);
        t0 = choice([6, 7, 8]); d = choice([2, 3]);
        T0 = t0 + S / r; E = T0 + choice([-2, -1, 1, 2]);
      } while (S % r !== 0 || S / r < 6 || S / r > 12 || T0 > 22 || E > 22 || E <= t0 + d);
      const reicht = T0 > E ? "ja" : "nein";
      const steps = [
        { label: "Verbrauch pro Stunde" },
        { left: `(${S} - ${S - r * d}) : ${d} = ${r}`, right: "" },
        { label: "Laufzeit = Akkustand : Verbrauch pro Stunde" },
        { left: `${S} : ${r} = ${S / r}`, right: "" },
        { left: T(`${t0} Uhr + ${S / r} Stunden = ${T0} Uhr`), right: "" },
        { label: "Antwort" },
        { left: T(reicht === "ja" ? `Der Akku hält bis ${T0} Uhr, also länger als bis ${E} Uhr.` : `Der Akku ist um ${T0} Uhr leer, also vor ${E} Uhr.`), right: "" }
      ];
      return textTask("lineare_funktionen", 5, "akku",
        T(`Um ${t0} Uhr zeigt ${genitiv(n)} Handy ${S} % Akku an, um ${t0 + d} Uhr nur noch ${S - r * d} %. Der Akku wird gleichmäßig leerer. Laden kann ${n} erst nach dem Training, das um ${E} Uhr endet.`),
        T(`Um wie viel Uhr ist der Akku leer, und reicht er bis ${E} Uhr?`), [
          { label: "Verbrauch pro Stunde in Prozentpunkten", kind: "number", answer: r },
          { label: "Uhrzeit, zu der der Akku leer ist", kind: "number", answer: T0 },
          { label: `Reicht der Akku bis ${E} Uhr?`, kind: "choice", choices: ["ja", "nein"], answer: reicht }
        ], steps, { dataExtra: { S, t0, d, now: S - r * d, E } });
    }
    // abo: Tarifvergleich mit persönlicher Entscheidung
    const A = choice(ABOS);
    let m1, m2, b1, b2, xT, xp;
    do {
      m1 = randInt(A.ms[0], A.ms[1]); m2 = m1 + randInt(A.dm[0], A.dm[1]);
      xT = randInt(2, 12); b2 = randInt(A.bs2[0], A.bs2[1]); b1 = b2 + (m2 - m1) * xT;
      xp = xT + choice([-4, -3, -2, -1, 1, 2, 3, 4]);
    } while (xp < 1);
    const c = { n, m1, m2, b1, b2, xp };
    const idx = xp > xT ? 0 : 2; // mehr Einheiten -> A (kleinerer Preis pro Einheit) günstiger
    const choices = [A.e[0], "gleich teuer", A.e[1]];
    const kA = b1 + m1 * xp, kB = b2 + m2 * xp;
    const steps = [
      { label: "Gleich teuer: Kosten gleichsetzen" },
      { left: `${m1}x + ${b1} = ${m2}x + ${b2}`, right: "" },
      { left: `${b1 - b2} = ${m2 - m1}x \\;\\Rightarrow\\; x = ${xT}`, right: "" },
      { label: `Für ${anz(xp, A.xs[0], A.xs[1])} konkret nachrechnen` },
      { left: T(`${A.e[0]}: ${b1} + ${m1} · ${xp} = ${kA} €`), right: "" },
      { left: T(`${A.e[1]}: ${b2} + ${m2} · ${xp} = ${kB} €`), right: "" },
      { label: "Antwort" },
      { left: T(`${choices[idx]} ist günstiger.`), right: "" }
    ];
    return textTask("lineare_funktionen", 5, "abo:" + A.key, T(A.text(c)), T(A.frage(c)), [
      { label: `${A.x} bei gleichen Kosten`, kind: "number", answer: xT },
      { label: "Günstiger ist …", kind: "choice", choices, answer: choices[idx] }
    ], steps, { dataExtra: { m1, m2, b1, b2, xp } });
  }

  // ---- Stufe 6: Wertetabelle und Funktionen erkennen (Vorbild: hilfsmittelfreier Teil einer Kl.-8-Arbeit) ----
  const fmtB = (x) => fmtNum(Math.round(x * 100) / 100);
  function gen_linear_6() {
    const sub = choice(["tabelle", "ankreuzen", "funktion", "linear"]);
    if (sub === "tabelle") {
      const [mn, md] = choice([[-1, 2], [1, 2], [-1, 1], [2, 1], [-2, 1], [3, 2], [1, 1], [-3, 2]]), b = randInt(-3, 3), m = mn / md;
      const xs = [-1, 1, 3];
      const fx = (x) => { const g = gcd(mn * x + b * md, md) || 1; let z = (mn * x + b * md) / g, n = md / g; if (n < 0) { z = -z; n = -n; } return { num: z, den: n }; };
      return { topic: "lineare_funktionen", level: 6, subtype: sub, signed: true, prompt: geradeTex("y", mn, md, b), promptText: "Wertetabelle",
        question: `\\text{Fülle die Wertetabelle aus.}`, numFields: 3, fieldLabels: xs.map((x) => `y für x = ${x}`), answer: xs.map(fx), data: { mn, md, b, xs } };
    }
    if (sub === "ankreuzen") {
      const [m, b] = choice([[-1, 1], [1, -1], [0.5, 1], [-0.5, 1], [2, -1], [1, 0.5], [-1, 0.5], [0.5, -1], [2, 1], [-2, 2]]), N = -b / m;
      const opt = (richtig, pool) => mische([...new Set([richtig].concat(mische(pool.filter((x) => x !== richtig)).slice(0, 3)))]).map(fmtB);
      const g = renderGraphSVG([{ fn: (x) => m * x + b, color: "#2563eb" }], fensterGerade(m, b, []));
      return { topic: "lineare_funktionen", level: 6, subtype: sub, signed: true, prompt: `\\text{Lies am Graphen ab und kreuze die richtigen Werte an.}`, promptText: "ankreuzen", graph: g,
        question: "", numFields: 3, fieldLabels: ["y-Achsenabschnitt", "Nullstelle", "Steigung"], fieldType: "choice",
        fieldChoices: [opt(b, [-1, -0.5, 0, 0.5, 1, 1.5, 2]), opt(N, [-2, -1, -0.5, 0, 0.5, 1, 2]), opt(m, [-2, -1, -0.5, 0.5, 1, 2])],
        answer: [fmtB(b), fmtB(N), fmtB(m)], data: { m, b } };
    }
    if (sub === "funktion") {
      const istFkt = Math.random() < 0.5, xs = mische([-2, -1, 0, 1, 2, 3]).slice(0, 5);
      let paare = xs.map((x) => [x, randInt(-4, 6)]);
      if (!istFkt) { const k = randInt(0, 4); let y2; do { y2 = randInt(-4, 6); } while (y2 === paare[k][1]); paare.push([paare[k][0], y2]); paare = mische(paare); }
      return { topic: "lineare_funktionen", level: 6, subtype: sub, prompt: `${T("Zuordnung:")}\\;\\; ${T(paare.map(([x, y]) => `${x} → ${y}`).join(";  "))}`, promptText: "Funktion?",
        question: `\\text{Handelt es sich um eine Funktion?}`, numFields: 1, fieldLabels: ["Zuordnung ist"], fieldType: "choice", fieldChoices: [["eine Funktion", "keine Funktion"]],
        answer: [istFkt ? "eine Funktion" : "keine Funktion"], data: { paare } };
    }
    const lin = Math.random() < 0.5, y0 = randInt(-4, 6), d = choice([-3, -2, -1, 1, 2, 3, 0.5]);
    const ys = [0, 1, 2, 3, 4].map((x) => y0 + d * x);
    const nl = choice([[1, 2, 4, 8, 16], [0, 1, 4, 9, 16], [y0, y0 + 1, y0 + 3, y0 + 6, y0 + 10], [16, 8, 4, 2, 1]]);
    const werte = lin ? ys : nl;
    return { topic: "lineare_funktionen", level: 6, subtype: sub, prompt: `${T("x: 0 | 1 | 2 | 3 | 4")}\\quad ${T("y: " + werte.map(fmtB).join(" | "))}`, promptText: "linear?",
      question: `\\text{Gehört die Wertetabelle zu einer linearen Funktion?}`, numFields: 1, fieldLabels: ["Die Funktion ist"], fieldType: "choice", fieldChoices: [["linear", "nicht linear"]],
      answer: [lin ? "linear" : "nicht linear"], data: { werte } };
  }
  function check_linear_6(task, inp) {
    const err = [];
    task.answer.forEach((a, i) => {
      if (a && typeof a === "object") { const f = parseUserFraction(inp[i]); if (!f || !fractionsEqual(f, a)) err.push(i); }
      else if (inp[i] !== a) err.push(i);
    });
    return { correct: !err.length, fieldErrors: err };
  }
  function steps_linear_6(task) {
    const s = task.subtype, d = task.data;
    if (s === "tabelle") return [{ label: "Jeden x-Wert in die Funktionsgleichung einsetzen" }].concat(d.xs.map((x, i) => ({ left: `x = ${x}:\\;\\; y = ${bruchTex(d.mn, d.md)}\\cdot (${x}) ${d.b < 0 ? "-" : "+"} ${Math.abs(d.b)} = ${bruchTex(task.answer[i].num, task.answer[i].den)}`, right: "" })));
    if (s === "ankreuzen") return [{ label: "y-Achsenabschnitt: dort schneidet der Graph die y-Achse. Nullstelle: dort schneidet er die x-Achse. Steigung: 1 nach rechts – wie viel nach oben/unten?" },
      { left: T(`b = ${fmtB(d.b)},  Nullstelle x = ${fmtB(-d.b / d.m)},  m = ${fmtB(d.m)}`), right: "" }];
    if (s === "funktion") return [{ label: "Eine Funktion ordnet jedem x-Wert GENAU EINEN y-Wert zu." },
      { left: T(task.answer[0] === "keine Funktion" ? "Ein x-Wert kommt mit zwei verschiedenen y-Werten vor ⇒ keine Funktion." : "Jeder x-Wert kommt nur einmal vor ⇒ Funktion."), right: "" }];
    const diffs = d.werte.slice(1).map((y, i) => fmtB(y - d.werte[i]));
    return [{ label: "Linear, wenn die y-Werte bei gleichen x-Schritten immer um denselben Betrag wachsen" }, { left: T(`Differenzen: ${diffs.join(", ")}`), right: "" },
      { left: T(task.answer[0] === "linear" ? "immer gleich ⇒ linear" : "nicht immer gleich ⇒ nicht linear"), right: "" }];
  }

  TOPICS.lineare_funktionen = {
      name: "Lineare Funktionen",
      grade: "Kl. 7–9",
      levels: [
        { id: 1, name: "Steigung berechnen", grade: "Kl. 7–8", signed: true, generate: gen_linear_1, check: check_linear_1, steps: mitAusgang(steps_linear_1) },
        { id: 2, name: "Geradengleichung aufstellen", grade: "Kl. 7–8", signed: true, generate: gen_linear_2, check: check_linear_2, steps: steps_linear_2 },
        { id: 3, name: "Parallelität & Orthogonalität", grade: "Kl. 8", signed: true, generate: gen_linear_3, check: check_linear_3, steps: steps_linear_3 },
        { id: 4, name: "Schnittpunkt zweier Geraden", grade: "Kl. 8–9", signed: true, generate: gen_linear_4, check: check_linear_4, steps: steps_linear_4 },
        { id: 6, name: "Wertetabelle und Funktionen erkennen", grade: "Kl. 7–8", signed: true, generate: gen_linear_6, check: check_linear_6, steps: steps_linear_6 },
        { id: 5, name: "Textaufgaben", grade: "Kl. 7–9", generate: gen_linear_5, check: check_textaufgabe, steps: steps_textaufgabe }
      ]
  };
  // ---------- LINEARE FUNKTIONEN (Kl. 8) ----------
  const STEIGUNGEN = [[-3, 1], [-2, 1], [-1, 1], [-1, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [-3, 2], [2, 3], [-2, 3]];
  const KA_LINEAR = [
    { key: "zeichnen", teil: "A", afb: 1, titel: "Geraden untersuchen und zeichnen", baue: () => {
      const [p, q] = choice(STEIGUNGEN); let b; do { b = randInt(-4, 4); } while (b === 0);
      const m = p / q, nn = -b * q, nd = p; // Nullstelle -b/m = -b*q/p
      const cfg = fensterGerade(m, b, [q]);
      const g = svgGraph([{ fn: (x) => m * x + b, color: "#2563eb", label: "f" }], Object.assign({}, cfg, { marks: [
        { type: "triangle", x: 0, y: b, dx: q, dy: p, color: "#f59e0b" },
        { type: "point", x: 0, y: b, label: `(0|${fmtNum(b)})`, dx: -46, dy: p > 0 ? -6 : 14 },
        { type: "point", x: -b / m, y: 0, label: `N(${bruchTxt(nn, nd).replace(".", ",")}|0)`, color: "#16a34a", dx: p > 0 ? -58 : 6, dy: -8 } ] }));
      return { kontext: `\\text{Gegeben ist die Funktion } ${geradeTex("f(x)", p, q, b)}.`, teile: [
        autoTeil(T("Gib die Steigung m und den y-Achsenabschnitt b an."), [
          { label: "Steigung m", kind: "fraction", answer: { num: p / gcd(p, q), den: q / gcd(p, q) }, signed: true },
          { label: "y-Achsenabschnitt b", kind: "number", answer: b, signed: true }
        ], [{ label: "In y = mx + b steht m vor dem x, b ist die Zahl ohne x." }, { left: `m = ${bruchTex(p, q)}\\,, \\quad b = ${b}`, right: "" }]),
        autoTeil(T("Berechne die Nullstelle von f."), [
          { label: "Nullstelle x", kind: "fraction", answer: (() => { const gg = gcd(nn, nd); let a = nn / gg, d = nd / gg; if (d < 0) { a = -a; d = -d; } return { num: a, den: d }; })(), signed: true, punkte: 2 }
        ], [{ label: "Nullstelle: f(x) = 0 setzen" }, { left: `0 = ${geradeTex("", p, q, b).replace(/^ = /, "")}`, right: "" },
            { left: `x = ${bruchTex(nn, nd)}`, right: "" }]),
        papierTeil(T("✏️ Zeichne den Graphen von f in ein Koordinatensystem. Zeichne ein beschriftetes Steigungsdreieck ein und markiere die Nullstelle."), [
          { text: `Gerade schneidet die y-Achse bei ${b}`, punkte: 1 },
          { text: `Steigungsdreieck: ${q} nach rechts, ${Math.abs(p)} nach ${p > 0 ? "oben" : "unten"}`, punkte: 1 },
          { text: "Gerade sauber und lang genug gezeichnet", punkte: 1 },
          { text: `Nullstelle bei x = ${bruchTxt(nn, nd).replace(".", ",")} markiert`, punkte: 1 }
        ], [{ label: "Vom y-Achsenabschnitt aus das Steigungsdreieck abtragen, dann die Gerade durch beide Punkte zeichnen." }], g)
      ] };
    } },
    { key: "ablesen", teil: "A", afb: 2, titel: "Gerade aus dem Graphen bestimmen", baue: () => {
      const [p, q] = choice(STEIGUNGEN.filter(([a, c]) => c <= 2)); let b; do { b = randInt(-3, 3); } while (b === 0);
      const m = p / q, x1 = q * choice([1, 2]), x2 = x1 + q * choice([1, 2]);
      const P = [x1, b + m * x1], Q = [x2, b + m * x2];
      const xr = q * choice([-1, 3]), aufG = Math.random() < 0.5, yr = b + m * xr + (aufG ? 0 : choice([-1, 1]));
      const cfg = fensterGerade(m, b, [x1, x2, xr]);
      cfg.ymin = Math.min(cfg.ymin, Math.floor(Math.min(P[1], Q[1], yr)) - 1); cfg.ymax = Math.max(cfg.ymax, Math.ceil(Math.max(P[1], Q[1], yr)) + 1);
      const graph = svgGraph([{ fn: (x) => m * x + b, color: "#2563eb", label: "g" }], Object.assign({}, cfg, { marks: [
        { type: "point", x: P[0], y: P[1], label: "P", color: "#111" }, { type: "point", x: Q[0], y: Q[1], label: "Q", color: "#111" }] }));
      const yrx = b + m * xr;
      return { kontext: T("Die Abbildung zeigt den Graphen einer linearen Funktion g. P und Q liegen auf gitterpunkten des Koordinatensystems.").replace("gitterpunkten", "Gitterpunkten"), graph, teile: [
        autoTeil(T("Lies den y-Achsenabschnitt ab."), [{ label: "y-Achsenabschnitt", kind: "number", answer: b, signed: true }],
          [{ label: "Dort schneidet der Graph die y-Achse." }, { left: `b = ${b}`, right: "" }]),
        autoTeil(T("Lies die Koordinaten von P und Q ab und berechne die Steigung."), [
          { label: "Steigung m", kind: "fraction", answer: (() => { const gg = gcd(p, q); return { num: p / gg, den: q / gg }; })(), signed: true, punkte: 2 }
        ], [{ left: `P(${x1}\\,|\\,${fmtNum(P[1])}),\\; Q(${x2}\\,|\\,${fmtNum(Q[1])})`, right: "" },
            { left: `m = \\dfrac{${fmtNum(Q[1])} - (${fmtNum(P[1])})}{${x2} - ${x1}} = ${bruchTex(p, q)}`, right: "" }]),
        autoTeil(`${T("Liegt der Punkt ")}R(${xr}\\,|\\,${fmtNum(yr)})${T(" auf dem Graphen von g?")}`, [
          { label: "R liegt auf dem Graphen", kind: "choice", choices: ["ja", "nein"], answer: aufG ? "ja" : "nein" }
        ], [{ label: "Punktprobe mit g(x) = mx + b" }, { left: `g(${xr}) = ${bruchTex(p, q)}\\cdot ${xr} + ${b} = ${fmtNum(yrx)}`, right: "" },
            { left: T(aufG ? `= y-Wert von R ⇒ R liegt auf dem Graphen` : `≠ ${fmtNum(yr)} ⇒ R liegt nicht auf dem Graphen`), right: "" }]),
        papierTeil(T("✏️ Begründe deine Antwort zur letzten Teilaufgabe mit einer Rechnung."), [
          { text: `Funktionsgleichung g(x) = ${bruchTxt(p, q).replace(".", ",")}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} verwendet`, punkte: 1 },
          { text: `x-Wert ${xr} eingesetzt und mit dem y-Wert ${fmtNum(yr)} verglichen`, punkte: 1 }
        ], [{ left: `g(${xr}) = ${fmtNum(yrx)}`, right: "" }])
      ] };
    } },
    { key: "aussagen", teil: "A", afb: 3, titel: "Aussagen prüfen und Fehler finden", baue: () => {
      const pool = [
        () => { const m1 = choice([2, 3, -2, 4]); const par = Math.random() < 0.5; const m2n = par ? m1 : -1, m2d = par ? 1 : m1;
          let b1 = randInt(-4, 4), b2; do { b2 = randInt(-4, 4); } while (b2 === b1);
          const aus = `${T("Ole behauptet: „Die Geraden ")}${geradeTex("f(x)", m1, 1, b1)}${T(" und ")}${geradeTex("g(x)", m2n, m2d, b2)}${T(" sind parallel.“")}`;
          return par ? aussageTeil(aus, true, ["Beide haben dieselbe Steigung.", "Beide haben denselben y-Achsenabschnitt.", "Beide Geraden steigen."])
            : aussageTeil(aus, false, ["Die Steigungen sind verschieden – parallele Geraden haben die gleiche Steigung.", "Die y-Achsenabschnitte sind verschieden, deshalb sind sie parallel.", "Eine fällt und eine steigt, deshalb schneiden sie sich nie."]); },
        () => aussageTeil(T("Lea behauptet: „Wenn man bei y = mx + b den Wert von b vergrößert, wird die Gerade steiler.“"), false,
          ["b verschiebt die Gerade nur nach oben; die Steilheit hängt nur von m ab.", "Stimmt, weil die y-Werte größer werden.", "Stimmt nur, wenn m positiv ist."]),
        () => aussageTeil(T("Jonas behauptet: „Jede lineare Funktion hat genau eine Nullstelle.“"), false,
          ["Eine waagerechte Gerade y = b mit b ≠ 0 schneidet die x-Achse nie.", "Stimmt, jede Gerade schneidet die x-Achse genau einmal.", "Falsch, jede lineare Funktion hat zwei Nullstellen."]),
        () => { let x1, y1, x2, y2; do { x1 = randInt(-3, 3); y1 = randInt(-4, 4); x2 = x1 + randInt(1, 4); y2 = y1 + choice([-5, -3, -2, 2, 3, 5]); } while (Math.abs(y2 - y1) === x2 - x1);
          return fehlerTeil(`${T("Mia berechnet die Steigung der Geraden durch ")}P(${x1}\\,|\\,${y1})${T(" und ")}Q(${x2}\\,|\\,${y2})${T(":")}\\;\\; m = \\dfrac{${x2} - (${x1})}{${y2} - (${y1})} = ${bruchTex(x2 - x1, y2 - y1)}`,
            ["Zähler und Nenner sind vertauscht.", "Sie hätte addieren statt subtrahieren müssen.", "Die Rechnung ist richtig."],
            { label: "richtige Steigung m", kind: "fraction", answer: (() => { const gg = gcd(y2 - y1, x2 - x1); let n = (y2 - y1) / gg, d = (x2 - x1) / gg; if (d < 0) { n = -n; d = -d; } return { num: n, den: d }; })(), signed: true },
            [{ label: "Richtig: Höhenunterschied durch Breitenunterschied" }, { left: `m = \\dfrac{${y2} - (${y1})}{${x2} - (${x1})} = ${bruchTex(y2 - y1, x2 - x1)}`, right: "" }]); }
      ];
      const [a, b] = mische(pool).slice(0, 2);
      return { kontext: "", teile: [a(), b()] };
    } },
    { key: "scooter", teil: "B", afb: 2, titel: "E-Scooter", baue: () => {
      const bc = choice([50, 80, 100]), mc = choice([15, 19, 22, 25]), t1 = choice([20, 25, 30, 45]), Bc = choice([300, 500, 800, 1000]);
      const kosten = (bc + mc * t1) / 100, maxT = Math.floor((Bc - bc) / mc), maxT2 = Math.floor((Bc - bc) / (mc / 2));
      const b = bc / 100, m = mc / 100, B = Bc / 100;
      return { kontext: T(`Ein E-Scooter kostet ${euro(b)} Leihgebühr und ${fmtNum(mc)} Cent pro gefahrener Minute. Die Kosten lassen sich mit y = ${fmtNum(m)}x + ${fmtNum(b)} berechnen.`), teile: [
        papierTeil(T("✏️ Erkläre, was x und y in dieser Gleichung im Sachzusammenhang bedeuten."), [
          { text: "x: Fahrzeit in Minuten", punkte: 1 }, { text: "y: Kosten der Fahrt in Euro", punkte: 1 }],
          [{ left: T("x = gefahrene Minuten, y = Gesamtkosten in Euro"), right: "" }]),
        autoTeil(T(`Berechne, wie viel eine Fahrt von ${t1} Minuten kostet.`), [{ label: "Kosten in €", kind: "number", answer: kosten, tol: 0.005, punkte: 2 }],
          [{ left: `y = ${fmtNum(m)}\\cdot ${t1} + ${fmtNum(b)} = ${fmtNum(kosten.toFixed(2))}`, right: "" }]),
        autoTeil(T(`Berechne, wie viele volle Minuten du mit ${euro(B)} höchstens fahren kannst.`), [{ label: "Minuten", kind: "number", answer: maxT, punkte: 2 }],
          [{ left: `${fmtNum(m)}x + ${fmtNum(b)} = ${fmtNum(B)} \\;\\Rightarrow\\; x = \\dfrac{${fmtNum(B)} - ${fmtNum(b)}}{${fmtNum(m)}} \\approx ${fmtNum(round2((B - b) / m))}`, right: "" },
            { label: "Nur volle Minuten, die man bezahlen kann: abrunden" }, { left: T(`${maxT} Minuten`), right: "" }]),
        autoTeil(T("Wie viele volle Minuten länger könntest du fahren, wenn der Minutenpreis nur halb so hoch wäre?"), [{ label: "Minuten länger", kind: "number", answer: maxT2 - maxT, punkte: 2 }],
          [{ left: `x = \\dfrac{${fmtNum(B)} - ${fmtNum(b)}}{${fmtNum(m / 2)}} \\approx ${fmtNum(round2((B - b) / (m / 2)))} \\;\\Rightarrow\\; ${maxT2}\\text{ min}`, right: "" },
            { left: `${maxT2} - ${maxT} = ${maxT2 - maxT}`, right: "" },
            { label: "Achtung: nicht einfach verdoppeln – erst bei der neuen Rechnung abrunden." }])
      ] };
    } },
    { key: "kerze", teil: "B", afb: 2, titel: "Abbrennende Kerze", baue: () => {
      let r, k, H, d; do { r = choice([1.5, 2, 2.5, 3]); k = randInt(5, 12); H = r * k; d = randInt(2, 4); } while (!Number.isInteger(H) || H > 30 || d >= k);
      const h = H - r * d;
      const g = svgGraph([{ fn: (t) => (t <= k ? H - r * t : NaN), color: "#2563eb", label: "h" }], { xmin: 0, xmax: k + 1, ymin: 0, ymax: H + 2, width: 300, height: 220, padLeft: 30, padBottom: 22, ticks: true,
        gridStepX: 1, gridStepY: H > 20 ? 5 : 2, achsenNamen: ["t in h", "h in cm"], marks: [{ type: "point", x: 0, y: H, label: `(0|${H})` }, { type: "point", x: k, y: 0, label: `(${k}|0)`, color: "#16a34a", dx: -26, dy: -8 }] });
      return { kontext: T(`Eine ${H} cm hohe Kerze wird angezündet. Nach ${d} Stunden ist sie noch ${fmtNum(h)} cm hoch. Sie brennt gleichmäßig ab.`), teile: [
        autoTeil(T("Um wie viele Zentimeter wird die Kerze pro Stunde kürzer?"), [{ label: "cm pro Stunde", kind: "number", answer: r }],
          [{ left: `(${H} - ${fmtNum(h)}) : ${d} = ${fmtNum(r)}`, right: "" }]),
        autoTeil(T("Gib die Funktionsgleichung h(t) = mt + b an (t in Stunden, h in cm)."), [
          { label: "m", kind: "number", answer: -r, signed: true }, { label: "b", kind: "number", answer: H, signed: true }],
          [{ label: "Die Höhe nimmt ab, also ist m negativ; b ist die Anfangshöhe." }, { left: `h(t) = -${fmtNum(r)}t + ${H}`, right: "" }]),
        autoTeil(T("Nach wie vielen Stunden ist die Kerze ganz abgebrannt?"), [{ label: "Stunden", kind: "number", answer: k, punkte: 2 }],
          [{ left: `0 = -${fmtNum(r)}t + ${H} \\;\\Rightarrow\\; t = ${H} : ${fmtNum(r)} = ${k}`, right: "" }]),
        papierTeil(T(`✏️ Zeichne den Graphen von h für 0 ≤ t ≤ ${k}. Beschrifte die Achsen.`), [
          { text: `Startpunkt (0|${H})`, punkte: 1 }, { text: `Endpunkt (${k}|0)`, punkte: 1 }, { text: "Achsen mit Größe und Einheit beschriftet", punkte: 1 }],
          [{ label: "Gerade vom Start- zum Endpunkt" }], g)
      ] };
    } },
    { key: "tarif", teil: "B", afb: 3, titel: "Handytarife vergleichen", baue: () => {
      let m1, m2, b1, b2, xT, xp; do { m1 = randInt(5, 12); m2 = m1 + randInt(2, 5); xT = randInt(3, 10); b2 = randInt(0, 4) * 5; b1 = b2 + (m2 - m1) * xT; xp = xT + choice([-3, -2, 2, 3, 5]); } while (xp < 1);
      const yT = m1 * xT + b1, n = choice(NAMEN), guenstig = xp > xT ? "Tarif A" : "Tarif B";
      const g = svgGraph([{ fn: (x) => m1 * x + b1, color: "#2563eb", label: "A" }, { fn: (x) => m2 * x + b2, color: "#dc2626", label: "B" }],
        { xmin: 0, xmax: xT + 4, ymin: 0, ymax: Math.ceil((m2 * (xT + 4) + b2) / 20) * 20, width: 300, height: 230, padLeft: 34, padBottom: 22, ticks: true, gridStepX: 1, gridStepY: 20, achsenNamen: ["Monate", "€"],
          marks: [{ type: "point", x: xT, y: yT, label: `S(${xT}|${yT})`, color: "#111" }] });
      return { kontext: T(`Tarif A: ${b1} € Anschlussgebühr und ${m1} € pro Monat. Tarif B: ${b2 === 0 ? "keine Anschlussgebühr" : b2 + " € Anschlussgebühr"} und ${m2} € pro Monat. ${n} will den Vertrag ${anz(xp, "Monat", "Monate")} nutzen.`), teile: [
        autoTeil(T("Nach wie vielen Monaten kosten beide Tarife gleich viel, und wie viel ist das?"), [
          { label: "Monate", kind: "number", answer: xT, punkte: 2 }, { label: "Kosten in €", kind: "number", answer: yT }],
          [{ left: `${m1}x + ${b1} = ${m2}x + ${b2} \\;\\Rightarrow\\; ${b1 - b2} = ${m2 - m1}x \\;\\Rightarrow\\; x = ${xT}`, right: "" }, { left: `y = ${m1}\\cdot ${xT} + ${b1} = ${yT}`, right: "" }]),
        autoTeil(T(`Welcher Tarif ist für ${n} günstiger?`), [{ label: "günstiger", kind: "choice", choices: ["Tarif A", "gleich teuer", "Tarif B"], answer: guenstig }],
          [{ left: T(`A: ${b1} + ${m1} · ${xp} = ${b1 + m1 * xp} €,  B: ${b2} + ${m2} · ${xp} = ${b2 + m2 * xp} €`), right: "" }]),
        papierTeil(T("✏️ Zeichne beide Kostengeraden in ein Koordinatensystem und markiere den Schnittpunkt. Erkläre am Graphen, ab wann Tarif A günstiger ist."), [
          { text: `Gerade A beginnt bei ${b1} €, Gerade B bei ${b2} €`, punkte: 1 }, { text: "Steigungen erkennbar richtig", punkte: 1 },
          { text: `Schnittpunkt S(${xT}|${yT}) markiert`, punkte: 1 }, { text: `Erklärung: rechts vom Schnittpunkt (mehr als ${xT} Monate) liegt A unter B`, punkte: 1 }],
          [{ label: "Rechts vom Schnittpunkt liegt die Gerade von Tarif A unter der von Tarif B." }], g)
      ] };
    } }
  ];

  KA_LINEAR.push(
    { key: "grundbegriffe", teil: "A", afb: 1, titel: "Funktionen und Wertetabellen", baue: () => {
      const t = stufenTeil("lineare_funktionen", 6, (x) => x.subtype === "ankreuzen");
      return { kontext: "", graph: t.task.graph, teile: [
        papierTeil(T("✏️ Beschreibe, was eine Funktion ist. Benutze die Wörter Zuordnung, x-Wert, y-Wert, Definitionsbereich und Wertebereich."), [
          { text: "Jedem x-Wert wird genau ein y-Wert zugeordnet", punkte: 1 }, { text: "Definitionsbereich = mögliche x-Werte, Wertebereich = auftretende y-Werte", punkte: 1 }],
          [{ left: T("Eine Funktion ist eine Zuordnung, die jedem x-Wert aus dem Definitionsbereich genau einen y-Wert aus dem Wertebereich zuordnet."), right: "" }]),
        t, stufenTeil("lineare_funktionen", 6, (x) => x.subtype === "tabelle")] };
    } },
    { key: "erkennen", teil: "A", afb: 2, titel: "Funktion? Linear?", baue: () => {
      const lin = stufenTeil("lineare_funktionen", 6, (x) => x.subtype === "linear");
      return { kontext: "", teile: [stufenTeil("lineare_funktionen", 6, (x) => x.subtype === "funktion"), lin,
        papierTeil(T("✏️ Begründe deine Entscheidung zur Wertetabelle mit den Werten."), [
          { text: "Differenzen aufeinanderfolgender y-Werte gebildet", punkte: 1 }, { text: "Daraus richtig geschlossen (gleich ⇒ linear)", punkte: 1 }], lin.loesung)] };
    } }
  );
  KA_VORLAGEN.lineare_funktionen = KA_LINEAR;
  KA_INFO.lineare_funktionen = { klasse: "Kl. 8", tr: true };
  Object.assign(ERKL, {
    "lineare_funktionen/1": E("Steigung",
      [`m = \\dfrac{y_{2} - y_{1}}{x_{2} - x_{1}}\\;\\;${T("(Höhenunterschied durch Breitenunterschied)")}`, T("m > 0: Gerade steigt, m < 0: Gerade fällt.")],
      [{ left: `P(1\\,|\\,2),\\; Q(3\\,|\\,8): \\;\\; m = \\dfrac{8 - 2}{3 - 1} = 3`, right: "" }],
      [T("Zähler und Nenner vertauschen (x oben, y unten)."), T("Vorzeichenfehler beim Subtrahieren negativer Koordinaten.")], "lin1"),
    "lineare_funktionen/2": E("Geradengleichung aufstellen",
      [`y = mx + b`, T("1. Steigung m aus zwei Punkten berechnen. 2. Einen Punkt einsetzen und nach b auflösen.")],
      [{ left: `m = 3,\\; P(1\\,|\\,2): \\;\\; 2 = 3\\cdot 1 + b \\;\\Rightarrow\\; b = -1`, right: "" }, { left: `y = 3x - 1`, right: "" }],
      [T("Beim Umstellen das Vorzeichen falsch: b = y − m · x.")]),
    "lineare_funktionen/3": E("Parallel und senkrecht",
      [T("Parallele Geraden haben dieselbe Steigung: m₂ = m₁."), `${T("Senkrechte Geraden: ")}m_{1}\\cdot m_{2} = -1\\;\\Rightarrow\\; m_{2} = -\\dfrac{1}{m_{1}}`],
      [{ left: `m_{1} = 2: \\;\\; ${T("parallel ")} m = 2,\\;\\; ${T("senkrecht ")} m = -\\dfrac{1}{2}`, right: "" }],
      [T("Für die Senkrechte nur das Vorzeichen ändern (−2 statt −½).")], "parallelsenkrecht"),
    "lineare_funktionen/4": E("Schnittpunkt zweier Geraden",
      [T("Gleichsetzen, nach x auflösen, x in eine der Gleichungen einsetzen.")],
      [{ left: `2x + 1 = -x + 7 \\;\\Rightarrow\\; 3x = 6 \\;\\Rightarrow\\; x = 2`, right: "" }, { left: `y = 2\\cdot 2 + 1 = 5 \\;\\Rightarrow\\; S(2\\,|\\,5)`, right: "" }],
      [T("Nur x angeben – zum Schnittpunkt gehört auch y.")], "schnitt"),
    "lineare_funktionen/5": E("Lineare Funktionen im Alltag",
      [T("Fester Betrag (Grundgebühr, Anfangshöhe) = y-Achsenabschnitt b."), T("Betrag pro Einheit (pro km, pro Stunde) = Steigung m; nimmt etwas ab, ist m negativ."),
       T("„Wann ist es leer?“ = Nullstelle. „Ab wann ist A günstiger?“ = Schnittpunkt.")],
      [{ left: T("Taxi: 4 € + 2 € pro km  ⇒  y = 2x + 4;  bei 20 €: 2x + 4 = 20 ⇒ x = 8 km"), right: "" }],
      [T("Bei „höchstens“ aufrunden: Man kann nur die Kilometer fahren, die man bezahlen kann."), T("Dauer und Uhrzeit verwechseln.")]),
  });
  Object.assign(DIAG, {
    "lineare_funktionen/2": (t, i, w) => (i === 1 && nah(w.v, t.data.y1 + t.data.m * t.data.x1) ? H.bUmstellen : null),
    "lineare_funktionen/3": (t, i, w) => {
      const m1 = t.data.m1;
      if (t.subtype === "ortho") {
        if (nah(w.v, -m1)) return H.senkrecht;
        if (nah(w.v, m1)) return H.senkrechtGleich;
        if (nah(w.v, 1 / m1)) return H.senkrecht;
      } else if (nah(w.v, -1 / m1) || nah(w.v, 1 / m1)) return H.parallel;
      return null;
    },
    "lineare_funktionen/5": (t, i, w) => {
      const d = t.dataExtra, s = t.subtype;
      if (s === "taxi" && nah(w.v, t.answer[0] + 1)) return H.abrunden;
      if ((s === "kerze" || s === "akku") && i === 1 && nah(w.v, t.answer[1] - d.t0)) return H.dauerStattUhrzeit;
      if (s === "handwerker" && nah(w.v, t.answer[1 - i])) return H.vertauscht;
      return null;
    },
  });
  Object.assign(ERKL, {
    "lineare_funktionen/6": E("Wertetabelle und Funktionen erkennen",
      [T("Funktion: Jedem x-Wert wird GENAU EIN y-Wert zugeordnet."), T("Wertetabelle: x-Werte in die Funktionsgleichung einsetzen."), T("Linear: Bei gleichen x-Schritten ändern sich die y-Werte immer um denselben Betrag (gleiche Differenzen).")],
      [{ left: `y = -\\dfrac{1}{2}x - 1:\\;\\; x = 2 \\;\\Rightarrow\\; y = -1 - 1 = -2`, right: "" }],
      [T("Bei negativen x-Werten das Vorzeichen falsch einsetzen."), T("Verwechseln: Ein y-Wert darf mehrfach vorkommen, ein x-Wert nicht.")], "lin6")
  });
  const erklGrafikLin = erklGrafik;
  erklGrafik = function (art) {
    const k = { width: 300, height: 230, padLeft: 26, padBottom: 22, ticks: true };
    if (art === "lin1") return renderGraphSVG([{ fn: (x) => 3 * x - 1, color: "#2563eb", label: "g" }], Object.assign({ xmin: -1, xmax: 5, ymin: -2, ymax: 10, gridStepY: 2, marks: [{ type: "triangle", x: 1, y: 2, dx: 2, dy: 6, color: "#f59e0b" }, { type: "point", x: 1, y: 2, label: "P(1|2)", dx: 6, dy: 14 }, { type: "point", x: 3, y: 8, label: "Q(3|8)", dx: -52, dy: -4 }] }, k));
    if (art === "lin6") return renderGraphSVG([{ fn: (x) => -0.5 * x - 1, color: "#2563eb", label: "y" }], Object.assign({ xmin: -4, xmax: 4, ymin: -4, ymax: 2, marks: [{ type: "point", x: 2, y: -2, label: "(2 | −2)", dx: 6, dy: 14 }] }, k));
    return erklGrafikLin(art);
  };
