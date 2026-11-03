  // ============================================================
  // BRÜCHE VERGLEICHEN (zwei "Spiele": Multiple-Choice-Vergleich)
  // ============================================================

  // Primfaktorzerlegung als {Primzahl: Exponent}-Objekt
  function primeFactorize(n) {
    const factors = {};
    let d = 2;
    while (n > 1) {
      while (n % d === 0) { factors[d] = (factors[d] || 0) + 1; n = n / d; }
      d++;
      if (d * d > n && n > 1) { factors[n] = (factors[n] || 0) + 1; break; }
    }
    return factors;
  }
  function factorsToTerm(factors) {
    return Object.keys(factors).map((p) => (factors[p] > 1 ? `${p}^{${factors[p]}}` : `${p}`)).join("\\cdot ");
  }
  function lcmViaFactors(b, d) {
    const fb = primeFactorize(b), fd = primeFactorize(d);
    const allPrimes = new Set([...Object.keys(fb), ...Object.keys(fd)]);
    const lcmFactors = {};
    let lcm = 1;
    allPrimes.forEach((p) => {
      const e = Math.max(fb[p] || 0, fd[p] || 0);
      lcmFactors[p] = e;
      lcm *= Math.pow(Number(p), e);
    });
    return { lcm, fb, fd, lcmFactors };
  }

  // ---- Spiel 1: "Was ist größer?" -- gleicher Nenner XOR gleicher Zähler ----
  // Sonderfall "gleichwertig": ein Bruch ist die mit 2-5 erweiterte Form des
  // anderen (z.B. 3/5 und 9/15) -- so sehen gleiche Brüche nie identisch aus.
  function gen_brueche_1() {
    let mode = Math.random() < 0.2 ? "expanded" : choice(["sameDenom", "sameNum"]);
    let a, b, c, d, cmp, k = null;
    if (mode === "expanded") {
      const baseNum = randInt(1, 9), baseDen = randInt(2, 9);
      k = randInt(2, 5);
      if (Math.random() < 0.5) { a = baseNum; b = baseDen; c = baseNum * k; d = baseDen * k; }
      else { a = baseNum * k; b = baseDen * k; c = baseNum; d = baseDen; }
      cmp = "=";
    } else if (mode === "sameDenom") {
      b = d = randInt(2, 12);
      a = randInt(1, 15);
      do { c = randInt(1, 15); } while (c === a);
      cmp = a > c ? ">" : "<";
    } else {
      a = c = randInt(1, 12);
      b = randInt(2, 15);
      do { d = randInt(2, 15); } while (d === b);
      cmp = b < d ? ">" : "<"; // gleicher Zähler: kleinerer Nenner = größerer Bruch
    }
    return {
      topic: "brueche", level: 1, subtype: mode,
      prompt: `\\dfrac{${a}}{${b}} \\;\\;\\square\\;\\; \\dfrac{${c}}{${d}}`,
      promptText: `${a}/${b} ? ${c}/${d}`,
      question: `\\text{Welches Zeichen gehört ins } \\square\\text{?}`,
      numFields: 1,
      fieldType: "choice",
      fieldChoices: [["<", "=", ">"]],
      fieldLabels: ["Vergleich"],
      answer: [cmp],
      data: { a, b, c, d, mode, k }
    };
  }
  function check_brueche_1(task, userInputs) {
    const ok = userInputs[0] === task.answer[0];
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_brueche_1(task) {
    const { a, b, c, d, mode, k } = task.data;
    const cmp = task.answer[0];
    if (mode === "expanded") {
      // kleineren (Grund-)Bruch mit k erweitern
      const [sn, sd, bn, bd] = a < c ? [a, b, c, d] : [c, d, a, b];
      return [
        { label: `Weder Zähler noch Nenner gleich: mit ${k} erweitern` },
        { left: `\\dfrac{${sn}}{${sd}} = \\dfrac{${sn}\\cdot ${k}}{${sd}\\cdot ${k}} = \\dfrac{${bn}}{${bd}}`, right: "" },
        { left: `\\Rightarrow \\dfrac{${a}}{${b}} = \\dfrac{${c}}{${d}}`, right: "" }
      ];
    }
    if (mode === "sameDenom") {
      return [
        { label: "Gleicher Nenner: Zähler vergleichen" },
        { left: `${a} ${cmp} ${c}`, right: "" },
        { left: `\\Rightarrow \\dfrac{${a}}{${b}} ${cmp} \\dfrac{${c}}{${d}}`, right: "" }
      ];
    }
    return [
      { label: "Gleicher Zähler: kleinerer Nenner = größerer Bruch" },
      { left: `${b} ${b < d ? "<" : ">"} ${d}`, right: "" },
      { left: `\\Rightarrow \\dfrac{${a}}{${b}} ${cmp} \\dfrac{${c}}{${d}}`, right: "" }
    ];
  }

  // ---- Spiel 2: ungleichnamige Brüche -- kgV per Primfaktorzerlegung, dann vergleichen ----
  // Da die Nenner immer verschieden sind, sehen auch gleichwertige Brüche
  // (z.B. 1/2 und 2/4) nie identisch aus.
  const BRUECHE2_DENOMS = [2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 24];
  function gen_brueche_2() {
    let b, d, a, c;
    const wantEqual = Math.random() < 0.2;
    for (let tries = 0; tries < 200; tries++) {
      b = choice(BRUECHE2_DENOMS);
      do { d = choice(BRUECHE2_DENOMS); } while (d === b);
      a = randInt(1, b - 1);
      if (wantEqual) {
        // c/d = a/b nur möglich, wenn a*d durch b teilbar ist
        if ((a * d) % b !== 0) continue;
        c = (a * d) / b;
        if (c < 1 || c > d - 1) continue;
      } else {
        c = randInt(1, d - 1);
      }
      break;
    }
    if (c === undefined) c = randInt(1, d - 1);
    const { lcm, fb, fd, lcmFactors } = lcmViaFactors(b, d);
    const k1 = lcm / b, k2 = lcm / d;
    const aNew = a * k1, cNew = c * k2;
    const cmp = aNew > cNew ? ">" : aNew < cNew ? "<" : "=";
    return {
      topic: "brueche", level: 2,
      prompt: `\\dfrac{${a}}{${b}} \\;\\;\\square\\;\\; \\dfrac{${c}}{${d}}`,
      promptText: `${a}/${b} ? ${c}/${d}`,
      question: `\\text{kgV der Nenner, dann das Zeichen für } \\square`,
      numFields: 2,
      perFieldType: ["text", "choice"],
      fieldChoices: [null, ["<", "=", ">"]],
      fieldLabels: ["kgV der Nenner", "Vergleich"],
      answer: [lcm, cmp],
      data: { a, b, c, d, lcm, fb, fd, lcmFactors, k1, k2, aNew, cNew }
    };
  }
  function check_brueche_2(task, userInputs) {
    const errors = [];
    const v0 = parseUserNumber(userInputs[0]);
    if (isNaN(v0) || v0 !== task.answer[0]) errors.push(0);
    if (userInputs[1] !== task.answer[1]) errors.push(1);
    return { correct: errors.length === 0, fieldErrors: errors };
  }
  function steps_brueche_2(task) {
    const { a, b, c, d, lcm, fb, fd, lcmFactors, k1, k2, aNew, cNew } = task.data;
    const cmp = task.answer[1];
    return [
      { label: "Primfaktorzerlegung" },
      { left: `${b} = ${factorsToTerm(fb)}`, right: "" },
      { left: `${d} = ${factorsToTerm(fd)}`, right: "" },
      { label: "kgV: höchste Potenz je Primfaktor" },
      { left: `\\text{kgV} = ${factorsToTerm(lcmFactors)} = ${lcm}`, right: "" },
      { label: `Auf den Nenner ${lcm} erweitern` },
      { left: `\\dfrac{${a}}{${b}} = \\dfrac{${a}\\cdot ${k1}}{${b}\\cdot ${k1}} = \\dfrac{${aNew}}{${lcm}}`, right: "" },
      { left: `\\dfrac{${c}}{${d}} = \\dfrac{${c}\\cdot ${k2}}{${d}\\cdot ${k2}} = \\dfrac{${cNew}}{${lcm}}`, right: "" },
      { label: "Zähler vergleichen" },
      { left: `${aNew} ${cmp} ${cNew}`, right: "" },
      { left: `\\Rightarrow \\dfrac{${a}}{${b}} ${cmp} \\dfrac{${c}}{${d}}`, right: "" }
    ];
  }

  // ---- Spiel 3: Brüche kürzen mit dem ggT ----
  // Aufbau rückwärts: vollständig gekürzter Bruch p/q (ggT(p,q)=1) mal ggT k.
  // Dadurch ist der ggT von Zähler und Nenner garantiert genau k.
  function gen_brueche_3() {
    let p, q;
    do {
      q = randInt(2, 12);
      p = Math.random() < 0.8 ? randInt(1, q - 1) : randInt(q + 1, 2 * q); // meist echte Brüche
    } while (gcd(p, q) !== 1);
    // ggT oft zusammengesetzt (4, 6, 8, 9, 12 ...), damit man nicht beim
    // ersten gemeinsamen Primfaktor aufhören darf
    const k = choice([2, 3, 4, 5, 6, 6, 8, 9, 10, 12, 12, 14, 15, 18]);
    const a = p * k, b = q * k;
    return {
      topic: "brueche", level: 3,
      prompt: `\\dfrac{${a}}{${b}}`,
      promptText: `${a}/${b}`,
      question: `\\text{ggT bestimmen und vollständig kürzen}`,
      numFields: 2,
      fieldLabels: ["ggT von Zähler und Nenner", "gekürzter Bruch"],
      fieldPlaceholders: ["", "z. B. 3/4"],
      answer: [k, { num: p, den: q }],
      data: { a, b, k, p, q, fa: primeFactorize(a), fb: primeFactorize(b) }
    };
  }
  function check_brueche_3(task, userInputs) {
    const errors = [];
    const g = parseUserNumber(userInputs[0]);
    if (isNaN(g) || g !== task.answer[0]) errors.push(0);
    // streng: nur die VOLLSTÄNDIG gekürzte Form zählt (6/8 statt 3/4 ist falsch)
    const f = parseUserFraction(userInputs[1]);
    const r = task.answer[1];
    if (!f) errors.push(1);
    else {
      let n = f.num, d = f.den;
      if (d < 0) { n = -n; d = -d; }
      if (n !== r.num || d !== r.den) errors.push(1);
    }
    return { correct: errors.length === 0, fieldErrors: errors };
  }
  function steps_brueche_3(task) {
    const { a, b, k, p, q, fa, fb } = task.data;
    const common = {};
    Object.keys(fa).forEach((pr) => { if (fb[pr]) common[pr] = Math.min(fa[pr], fb[pr]); });
    return [
      { label: "Primfaktorzerlegung" },
      { left: `${a} = ${factorsToTerm(fa)}`, right: "" },
      { left: `${b} = ${factorsToTerm(fb)}`, right: "" },
      { label: "ggT: gemeinsame Primfaktoren, jeweils niedrigste Potenz" },
      { left: `\\text{ggT} = ${factorsToTerm(common)} = ${k}`, right: "" },
      { label: "Zähler und Nenner durch den ggT teilen" },
      { left: `\\dfrac{${a}}{${b}} = \\dfrac{${a} : ${k}}{${b} : ${k}} = \\dfrac{${p}}{${q}}`, right: "" }
    ];
  }

  // ============================================================
  // Brüche: Textaufgaben (realistische Situationen, KEIN Bruch im Text).
  // Der Anteil muss aus der Situation gebildet werden -- teils mit
  // verstecktem Ganzen (Tag = 24 h), teils als Rest ("noch übrig"), teils
  // über einen Zwischenschritt (Saft + Wasser = Gesamtmenge).
  // ============================================================
  const KLASSEN = ["5a", "5b", "5c", "6a", "6b", "6c"];
  const BOHNEN = ["Feuerbohne", "Wachsbohne", "Stangenbohne", "Buschbohne"];
  const VEREINE = ["Schwimmverein", "Tischtennisverein", "Schachclub", "Ruderverein", "Turnverein", "Leichtathletikverein"];
  const zweiAus = (arr) => { const x = choice(arr); let y; do { y = choice(arr); } while (y === x); return [x, y]; };
  const genitiv = (n) => (/[sxzß]$/.test(n) ? n + "’" : n + "s");
  const anz = (n, sing, plur) => `${n} ${n === 1 ? sing : plur}`;

  // Liefert einen gekürzten Anteil p/q, dessen Nenner q das Ganze b teilt
  function anteilFuer(b, maxQ, min, max, qMuss) {
    const kand = [];
    for (let q = 2; q <= maxQ; q++) {
      if (b % q !== 0) continue;
      if (qMuss && qMuss % q !== 0) continue;
      for (let p = 1; p < q; p++) if (gcd(p, q) === 1 && p / q >= min && p / q <= max) kand.push([p, q]);
    }
    return kand.length ? choice(kand) : null;
  }
  function kuerzZeile(prefix, n, d) {
    const g = gcd(n, d);
    return g > 1
      ? { left: `${prefix}\\dfrac{${n}}{${d}} = \\dfrac{${n / g}}{${d / g}}`, right: `\\text{gekürzt mit } ${g}` }
      : { left: `${prefix}\\dfrac{${n}}{${d}}`, right: "\\text{nicht kürzbar}" };
  }
  const HINWEIS_RENNEN = "Beide haben gleichzeitig angefangen und bleiben im eigenen Tempo: Wer den größeren Anteil geschafft hat, ist schneller und hat weniger Rest vor sich.";

  const VERGLEICHE_BR = [
    { key: "abstimmung", w: [20, 24, 25, 27, 28, 30, 32], maxQ: 10, min: 0.2, max: 0.9,
      setup: () => { const [k1, k2] = zweiAus(KLASSEN); return { e: [k1, k2] }; },
      text: (c, s) => `Für den Wandertag wird abgestimmt. In der ${c.e[0]} sind ${s[0].a} von ${s[0].b} Kindern für den Kletterpark, in der ${c.e[1]} ${s[1].a} von ${s[1].b} Kindern.`,
      frage: () => "In welcher Klasse ist der Anteil der Kletterpark-Fans größer?", gleich: "gleich groß",
      feld: (c, i) => `Anteil in der ${c.e[i]}`,
      satz: (c, i) => (i === null ? "In beiden Klassen ist der Anteil gleich groß." : `In der ${c.e[i]} ist der Anteil größer.`) },
    { key: "freiwurf", w: [10, 12, 15, 16, 20, 24, 25], maxQ: 8, min: 0.3, max: 0.9,
      setup: () => ({ e: zweiNamen() }),
      text: (c, s) => `${c.e[0]} hat im Training ${s[0].a} von ${s[0].b} Freiwürfen getroffen, ${c.e[1]} ${s[1].a} von ${s[1].b}. Beim Stand von 59:60 gibt es in der letzten Sekunde einen Freiwurf. Die Trainerin will, dass das Kind mit der besten Trefferquote wirft.`,
      frage: () => "Wen sollte sie schicken?", gleich: "beide gleich sicher",
      feld: (c, i) => `Trefferanteil von ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide treffen anteilig gleich oft." : `${c.e[i]} trifft anteilig öfter und sollte werfen.`) },
    { key: "tests", w: [20, 24, 25, 30, 36, 40, 48], maxQ: 12, min: 0.4, max: 0.95,
      setup: () => ({ n: choice(NAMEN), e: ["Mathetest", "Englischtest"] }),
      text: (c, s) => `${c.n} bekommt zwei Tests zurück: im Mathetest ${s[0].a} von ${s[0].b} Punkten, im Englischtest ${s[1].a} von ${s[1].b} Punkten.`,
      frage: (c) => `In welchem Test hat ${c.n} anteilig besser abgeschnitten?`, gleich: "gleich gut",
      feld: (c, i) => `Punkteanteil im ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide Tests sind anteilig gleich gut." : `Im ${c.e[i]} war das Ergebnis anteilig besser.`) },
    { key: "schorle", w: [4, 5, 6, 8, 9, 10, 12], maxQ: 12, min: 0.2, max: 0.8, ganzesVersteckt: true,
      setup: () => ({ e: zweiNamen() }),
      text: (c, s) => `${c.e[0]} mischt für eine Apfelschorle ${anz(s[0].a, "Becher", "Becher")} Saft mit ${anz(s[0].b - s[0].a, "Becher", "Bechern")} Wasser. ${c.e[1]} nimmt ${anz(s[1].a, "Becher", "Becher")} Saft und ${anz(s[1].b - s[1].a, "Becher", "Becher")} Wasser.`,
      frage: () => "Wessen Schorle schmeckt fruchtiger?", gleich: "beide gleich",
      feld: (c, i) => `Saftanteil bei ${c.e[i]}`,
      extra: (c, s, i) => ({ left: `${T(c.e[i] + ": ")}${s[i].a} + ${s[i].b - s[i].a} = ${s[i].b} ${T(" Becher insgesamt")}`, right: "" }),
      satz: (c, i) => (i === null ? "Beide Schorlen haben den gleichen Saftanteil." : `${genitiv(c.e[i])} Schorle hat den größeren Saftanteil.`) },
    { key: "keimung", w: [12, 15, 16, 20, 24, 25, 30], maxQ: 10, min: 0.4, max: 0.95,
      setup: () => ({ e: zweiAus(BOHNEN) }),
      text: (c, s) => `Im Schulgarten wurden zwei Bohnensorten ausgesät. Von ${s[0].b} Samen der ${c.e[0]} sind ${s[0].a} aufgegangen, von ${s[1].b} Samen der ${c.e[1]} ${s[1].a}.`,
      frage: () => "Welche Sorte sollte man nächstes Jahr nehmen, wenn möglichst viele Samen aufgehen sollen?", gleich: "beide gleich gut",
      feld: (c, i) => `Keimanteil der ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide Sorten keimen gleich zuverlässig." : `Die ${c.e[i]} keimt zuverlässiger.`) },
    { key: "bus", besser: "weniger", w: [15, 18, 20, 24, 30], maxQ: 10, min: 0.1, max: 0.5,
      setup: () => { const [x, y] = zweiAus([2, 3, 5, 7, 8, 11, 12, 14, 17, 19]); return { e: [`Linie ${x}`, `Linie ${y}`] }; },
      text: (c, s) => `Die Schülerzeitung hat Verspätungen gezählt: Die Buslinie ${c.e[0].slice(6)} kam an ${s[0].a} von ${s[0].b} beobachteten Tagen zu spät, die Linie ${c.e[1].slice(6)} an ${s[1].a} von ${s[1].b} Tagen.`,
      frage: () => "Mit welcher Linie kommt man zuverlässiger pünktlich zur Schule?", gleich: "gleich zuverlässig",
      feld: (c, i) => `Verspätungsanteil der ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide Linien sind gleich zuverlässig." : `Die ${c.e[i]} ist anteilig seltener verspätet, also zuverlässiger.`) },
    { key: "los", w: [20, 30, 40, 50, 60, 80, 100], maxQ: 10, min: 0.1, max: 0.5,
      setup: () => ({ e: ["erste Losbude", "zweite Losbude"] }),
      text: (c, s) => `Auf dem Schulfest gibt es zwei Losbuden. In der ersten sind unter ${s[0].b} Losen ${s[0].a} Gewinne, in der zweiten unter ${s[1].b} Losen ${s[1].a} Gewinne.`,
      frage: () => "An welcher Losbude sind die Gewinnchancen besser?", gleich: "gleich gut",
      feld: (c, i) => `Gewinnanteil ${i === 0 ? "erste" : "zweite"} Losbude`,
      satz: (c, i) => (i === null ? "Die Chancen sind an beiden Buden gleich." : `An der ${c.e[i]} sind die Chancen besser.`) },
    { key: "torwart", w: [5, 6, 8, 9, 10, 12], maxQ: 6, min: 0.2, max: 0.6,
      setup: () => ({ e: zweiNamen() }),
      text: (c, s) => `Vor dem Elfmeterschießen schaut der Trainer in die Statistik: ${c.e[0]} hat ${s[0].a} von ${s[0].b} Elfmetern gehalten, ${c.e[1]} ${s[1].a} von ${s[1].b}.`,
      frage: () => "Wen sollte er ins Tor stellen?", gleich: "beide gleich gut",
      feld: (c, i) => `gehaltener Anteil bei ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide halten anteilig gleich viele Elfmeter." : `${c.e[i]} hält anteilig mehr Elfmeter.`) },
    { key: "diktat", besser: "weniger", w: [40, 50, 60, 80, 100, 120], maxQ: 20, min: 0.05, max: 0.2,
      setup: () => ({ e: zweiNamen() }),
      text: (c, s) => `${c.e[0]} hat in einem Diktat mit ${s[0].b} Wörtern ${anz(s[0].a, "Fehler", "Fehler")} gemacht, ${c.e[1]} in einem Diktat mit ${s[1].b} Wörtern ${anz(s[1].a, "Fehler", "Fehler")}.`,
      frage: () => "Wer hat anteilig weniger Fehler gemacht?", gleich: "beide gleich",
      feld: (c, i) => `Fehleranteil bei ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide haben anteilig gleich viele Fehler." : `${c.e[i]} hat anteilig weniger Fehler gemacht.`) },
    { key: "verein", w: [20, 24, 30, 32, 36, 40, 45], maxQ: 10, min: 0.2, max: 0.8,
      setup: () => ({ e: zweiAus(VEREINE) }),
      text: (c, s) => `Im ${c.e[0]} sind ${s[0].a} der ${s[0].b} Mitglieder Mädchen, im ${c.e[1]} ${s[1].a} der ${s[1].b} Mitglieder.`,
      frage: () => "In welchem Verein ist der Mädchenanteil größer?", gleich: "gleich groß",
      feld: (c, i) => `Mädchenanteil im ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Der Mädchenanteil ist in beiden Vereinen gleich." : `Im ${c.e[i]} ist der Mädchenanteil größer.`) },
    { key: "speicher", rest: true, w: [16, 32, 64, 128], maxQ: 8, min: 0.1, max: 0.6,
      setup: () => ({ e: ["Handy", "Tablet"] }),
      text: (c, s) => `Für ein großes Update braucht man möglichst viel freien Speicher. Ein Handy hat ${s[0].b} GB Speicher, davon sind ${s[0].a} GB belegt. Ein Tablet hat ${s[1].b} GB, davon sind ${s[1].a} GB belegt.`,
      frage: () => "Auf welchem Gerät ist anteilig mehr Speicher frei?", gleich: "gleich viel",
      feld: (c, i) => `freier Anteil beim ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Auf beiden Geräten ist anteilig gleich viel frei." : `Auf dem ${c.e[i]} ist anteilig mehr Speicher frei.`) },
    { key: "buch", rennen: true, w: [120, 150, 160, 180, 200, 240, 250, 300, 320, 360, 400], maxQ: 10, min: 0.1, max: 0.9,
      setup: () => ({ e: zweiNamen() }),
      text: (c, s) => `${c.e[0]} und ${c.e[1]} haben am selben Tag angefangen, je ein Buch zu lesen, und lesen jeweils in ihrem eigenen, gleichbleibenden Tempo. ${c.e[0]} hat von ${s[0].b} Seiten schon ${s[0].a} gelesen, ${c.e[1]} von ${s[1].b} Seiten ${s[1].a}.`,
      frage: () => "Wer ist zuerst am Ende des Buches?", gleich: "gleichzeitig",
      feld: (c, i) => `gelesener Anteil bei ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide sind gleichzeitig fertig." : `${c.e[i]} ist zuerst fertig.`) },
    { key: "download", rennen: true, w: [600, 800, 900, 1200, 1500, 2000, 2400], maxQ: 10, min: 0.1, max: 0.9,
      setup: () => ({ e: ["Spiel", "Film"] }),
      text: (c, s) => `Zwei Downloads laufen seit derselben Zeit, jeder mit gleichbleibender Geschwindigkeit. Vom Spiel (${s[0].b} MB) sind schon ${s[0].a} MB geladen, vom Film (${s[1].b} MB) ${s[1].a} MB.`,
      frage: () => "Welcher Download ist zuerst fertig?", gleich: "gleichzeitig",
      feld: (c, i) => `geladener Anteil beim ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide Downloads sind gleichzeitig fertig." : `Der Download vom ${c.e[i]} ist zuerst fertig.`) },
    { key: "puzzle", rennen: true, w: [300, 500, 600, 750, 1000, 1500], maxQ: 10, min: 0.1, max: 0.9,
      setup: () => ({ e: zweiNamen() }),
      text: (c, s) => `${c.e[0]} und ${c.e[1]} haben am selben Abend mit einem Puzzle angefangen und kommen jeweils gleichmäßig voran. ${genitiv(c.e[0])} Puzzle hat ${s[0].b} Teile, davon liegen schon ${s[0].a}. ${genitiv(c.e[1])} Puzzle hat ${s[1].b} Teile, davon liegen ${s[1].a}.`,
      frage: () => "Wer legt zuerst das letzte Teil?", gleich: "gleichzeitig",
      feld: (c, i) => `gelegter Anteil bei ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide werden gleichzeitig fertig." : `${c.e[i]} wird zuerst fertig.`) },
    { key: "wanderung", rennen: true, w: [6, 8, 9, 10, 12, 15, 16, 18, 20], maxQ: 10, min: 0.1, max: 0.9,
      setup: () => ({ e: zweiAus(KLASSEN) }),
      text: (c, s) => `Die Klassen ${c.e[0]} und ${c.e[1]} starten gleichzeitig auf verschiedenen Wanderwegen, jede in ihrem eigenen, gleichbleibenden Tempo. Die ${c.e[0]} hat von ihren ${s[0].b} km schon ${s[0].a} km geschafft, die ${c.e[1]} von ihren ${s[1].b} km schon ${s[1].a} km.`,
      frage: () => "Welche Klasse kommt zuerst am Ziel an?", gleich: "gleichzeitig",
      feld: (c, i) => `geschaffter Anteil der ${c.e[i]}`,
      satz: (c, i) => (i === null ? "Beide Klassen kommen gleichzeitig an." : `Die ${c.e[i]} kommt zuerst an.`) }
  ];

  const ANTEILE_BR = [
    { key: "schlaf", ganz: [24], zeigen: [6, 8, 9, 10], hinweis: "Ein Tag hat 24 Stunden.",
      text: (n, a) => `${n} schläft jede Nacht ${a} Stunden.`, frage: (n) => `Welchen Anteil eines Tages verbringt ${n} mit Schlafen?` },
    { key: "pause", ganz: [60], zeigen: [5, 10, 12, 15, 20, 25, 30, 40, 45], hinweis: "Eine Stunde hat 60 Minuten.",
      text: (n, a) => `Die große Pause dauert ${a} Minuten.`, frage: () => "Welcher Anteil einer Stunde ist das?" },
    { key: "mehl", ganz: [1000], zeigen: [200, 250, 300, 400, 500, 600, 750, 800], rest: true, hinweis: "1 kg = 1000 g.",
      text: (n, a) => `Für einen Kuchen nimmt ${n} ${a} g Mehl aus einer vollen 1-kg-Packung.`, frage: () => "Welcher Anteil der Packung ist noch übrig?" },
    { key: "brett", ganz: [200], zeigen: [25, 40, 50, 75, 80, 120, 125, 150], hinweis: "2 m = 200 cm.",
      text: (n, a) => `Von einem 2 m langen Brett sägt ${n} ein ${a} cm langes Stück ab.`, frage: () => "Welcher Anteil des Bretts ist das?" },
    { key: "daten", ganz: [4, 6, 8, 10, 12, 20], rest: true, maxQ: 10, min: 0.1, max: 0.9,
      text: (n, a, b) => `${genitiv(n)} Handytarif hat ${b} GB Datenvolumen im Monat. Nach zwei Wochen sind schon ${a} GB verbraucht.`, frage: () => "Welcher Anteil des Datenvolumens ist noch übrig?" },
    { key: "haustier", ganz: [20, 24, 25, 27, 28, 30], rest: true, maxQ: 10, min: 0.2, max: 0.8,
      text: (n, a, b) => `In der Klasse von ${n} sind ${b} Kinder, ${a} davon haben ein Haustier.`, frage: () => "Welcher Anteil der Klasse hat kein Haustier?" },
    { key: "regen", ganz: [30], rest: true, maxQ: 10, min: 0.3, max: 0.9, hinweis: "Der April hat 30 Tage.",
      text: (n, a) => `Im April hat es an ${a} Tagen geregnet.`, frage: () => "An welchem Anteil der Apriltage war es trocken?" },
    { key: "taschengeld", ganz: [10, 12, 15, 20, 24, 30], maxQ: 10, min: 0.2, max: 0.8,
      text: (n, a, b) => `${n} bekommt ${b} € Taschengeld im Monat und kauft davon ein Buch für ${a} €.`, frage: () => "Welcher Anteil des Taschengelds geht für das Buch drauf?" },
    { key: "sport", ganz: [90], zeigen: [10, 15, 18, 20, 30, 45], rest: true,
      text: (n, a) => `Eine Doppelstunde Sport dauert 90 Minuten. Die ersten ${a} Minuten sind Aufwärmen, danach wird gespielt.`, frage: () => "Welcher Anteil der Doppelstunde bleibt zum Spielen?" }
  ];

  function gen_brueche_4() {
    if (Math.random() < 0.6) {
      // ---------- Vergleich zweier Anteile ----------
      const V = choice(VERGLEICHE_BR);
      const c = V.setup();
      const wantEqual = Math.random() < 0.15;
      let s, f;
      for (let tries = 0; tries < 500; tries++) {
        const b1 = choice(V.w); let b2; do { b2 = choice(V.w); } while (b2 === b1);
        let f1, f2;
        if (wantEqual) {
          f1 = anteilFuer(b1, V.maxQ, V.min, V.max, b2);
          if (!f1) continue;
          f2 = f1;
        } else {
          f1 = anteilFuer(b1, V.maxQ, V.min, V.max); f2 = anteilFuer(b2, V.maxQ, V.min, V.max);
          if (!f1 || !f2 || f1[0] * f2[1] === f2[0] * f1[1]) continue;
        }
        const zeig = (b, fr) => { const rel = (b / fr[1]) * fr[0]; return { b, rel, a: V.rest ? b - rel : rel }; };
        s = [zeig(b1, f1), zeig(b2, f2)]; f = [f1, f2];
        if (s.some((x) => x.a < 1 || x.b - x.a < 1)) { s = null; continue; }
        break;
      }
      const diff = f[0][0] * f[1][1] - f[1][0] * f[0][1]; // >0: erster Anteil größer
      const sieger = diff === 0 ? null : (V.besser === "weniger" ? (diff < 0 ? 0 : 1) : (diff > 0 ? 0 : 1));
      const choices = [c.e[0], V.gleich, c.e[1]];
      const antwort = sieger === null ? V.gleich : c.e[sieger];
      const steps = [];
      if (V.rennen) steps.push({ label: HINWEIS_RENNEN });
      steps.push({ label: V.rest ? "Gesucht ist der freie Rest: Ganzes minus belegt" : "Anteil = Teil : Ganzes, dann kürzen" });
      [0, 1].forEach((i) => {
        if (V.extra) steps.push(V.extra(c, s, i));
        if (V.rest) steps.push({ left: `${T(c.e[i] + ": ")}${s[i].b} - ${s[i].a} = ${s[i].rel}`, right: "" });
        steps.push(kuerzZeile(T(c.e[i] + ": "), s[i].rel, s[i].b));
      });
      const [p1, q1] = f[0], [p2, q2] = f[1];
      const cmp = diff > 0 ? ">" : diff < 0 ? "<" : "=";
      if (q1 === q2) {
        steps.push({ label: "Gleicher Nenner: Zähler vergleichen" }, { left: `\\dfrac{${p1}}{${q1}} ${cmp} \\dfrac{${p2}}{${q2}}`, right: "" });
      } else {
        const L = (q1 * q2) / gcd(q1, q2);
        steps.push({ label: `Gleichnamig machen: kgV von ${q1} und ${q2} ist ${L}` },
          { left: `\\dfrac{${p1}}{${q1}} = \\dfrac{${p1 * L / q1}}{${L}}\\,, \\quad \\dfrac{${p2}}{${q2}} = \\dfrac{${p2 * L / q2}}{${L}}`, right: "" },
          { left: `\\dfrac{${p1 * L / q1}}{${L}} ${cmp} \\dfrac{${p2 * L / q2}}{${L}}`, right: "" });
      }
      if (V.besser === "weniger") steps.push({ label: "Hier ist der kleinere Anteil der bessere." });
      steps.push({ label: "Antwort" }, { left: T(V.satz(c, sieger)), right: "" });
      return textTask("brueche", 4, "vergleich:" + V.key, T(V.text(c, s)), T(V.frage(c)), [
        { label: V.feld(c, 0) + " (gekürzt)", kind: "fraction", answer: { num: p1, den: q1 } },
        { label: V.feld(c, 1) + " (gekürzt)", kind: "fraction", answer: { num: p2, den: q2 } },
        { label: V.frage(c), kind: "choice", choices, answer: antwort }
      ], steps, { dataExtra: { kind: "vergleich", key: V.key, rest: !!V.rest, besser: V.besser || "mehr", ganzesVersteckt: !!V.ganzesVersteckt, s, choices } });
    }

    // ---------- Einzelner Anteil (vollständig gekürzt) ----------
    const n = choice(NAMEN);
    if (Math.random() < 0.12) {
      // Fußball: Niederlagen erst ausrechnen
      let b, lost, w, u;
      do {
        b = choice([20, 24, 30, 32, 36]);
        const fr = anteilFuer(b, 10, 0.1, 0.5);
        lost = (b / fr[1]) * fr[0];
        const rest = b - lost;
        w = randInt(1, rest - 1); u = rest - w;
      } while (u < 1 || w < 1);
      const g = gcd(lost, b);
      const steps = [
        { label: "Niederlagen = alle Spiele minus Siege minus Unentschieden" },
        { left: `${b} - ${w} - ${u} = ${lost}`, right: "" },
        { label: "Anteil = Niederlagen : alle Spiele, dann kürzen" },
        kuerzZeile("", lost, b)
      ];
      return textTask("brueche", 4, "anteil:fussball",
        T(`Ein Fußballverein hat in der Saison ${b} Spiele bestritten: ${anz(w, "Sieg", "Siege")}, ${anz(u, "Unentschieden", "Unentschieden")}, der Rest waren Niederlagen.`),
        T("Welcher Anteil der Spiele ging verloren? Gib ihn vollständig gekürzt an."), [
          { label: "Anteil der Niederlagen (gekürzt)", kind: "fraction", answer: { num: lost / g, den: b / g } }
        ], steps, { dataExtra: { kind: "fussball", b, w, u } });
    }
    const A = choice(ANTEILE_BR);
    let b, a, rel;
    for (let tries = 0; tries < 200; tries++) {
      b = choice(A.ganz);
      if (A.zeigen) { a = choice(A.zeigen); rel = A.rest ? b - a : a; }
      else { const fr = anteilFuer(b, A.maxQ, A.min, A.max); if (!fr) continue; rel = (b / fr[1]) * fr[0]; a = A.rest ? b - rel : rel; }
      if (a >= 1 && rel >= 1 && rel < b) break;
    }
    const g = gcd(rel, b);
    const steps = [];
    if (A.hinweis) steps.push({ label: A.hinweis });
    if (A.rest) steps.push({ label: "Gesucht ist der Rest: Ganzes minus verbraucht" }, { left: `${b} - ${a} = ${rel}`, right: "" });
    steps.push({ label: "Anteil = Teil : Ganzes, dann kürzen" }, kuerzZeile("", rel, b));
    return textTask("brueche", 4, "anteil:" + A.key, T(A.text(n, a, b)), T(A.frage(n) + " Gib ihn vollständig gekürzt an."), [
      { label: "Anteil (vollständig gekürzt)", kind: "fraction", answer: { num: rel / g, den: b / g } }
    ], steps, { dataExtra: { kind: "anteil", key: A.key, a, b, rest: !!A.rest } });
  }


  // ============================================================
  // Bruchrechnung erweitert (Recherche: echte Kl.-6-Arbeiten enthalten gemischte
  // Zahlen, alle vier Grundrechenarten und Dezimalbrüche)
  // ============================================================
  const fr = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { num: n / g, den: d / g }; };
  const frTex = (n, d) => (d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`);
  const gemTex = (g, n, d) => (n === 0 ? `${g}` : g === 0 ? `\\dfrac{${n}}{${d}}` : `${g}\\tfracSPACE\\dfrac{${n}}{${d}}`.replace("\\tfracSPACE", "\\,"));
  function echterBruch(maxN) { let n, d; do { d = randInt(2, maxN || 9); n = randInt(1, d - 1); } while (gcd(n, d) !== 1); return [n, d]; }
  function check_bruch_streng(task, inp) { // vollständig gekürzt verlangt (Fraktionsfelder), Zahlenfelder exakt
    const err = [];
    task.answer.forEach((a, i) => {
      if (a && typeof a === "object") { const f = parseUserFraction(inp[i]); let ok = false; if (f) { let n = f.num, d = f.den; if (d < 0) { n = -n; d = -d; } ok = n === a.num && d === a.den; } if (!ok) err.push(i); }
      else { const v = parseUserNumber(inp[i]); if (isNaN(v) || Math.abs(v - a) > 1e-9) err.push(i); }
    });
    return { correct: !err.length, fieldErrors: err };
  }

  // ---- Stufe 5: Gemischte Zahlen ----
  function gen_brueche_5() {
    const [n, d] = echterBruch(9), g = randInt(1, 9);
    if (Math.random() < 0.5) return { topic: "brueche", level: 5, subtype: "zuUnecht", prompt: gemTex(g, n, d), promptText: `${g} ${n}/${d}`,
      question: `\\text{Schreibe als unechten Bruch.}`, numFields: 1, fieldLabels: ["unechter Bruch"], answer: [fr(g * d + n, d)], data: { g, n, d } };
    return { topic: "brueche", level: 5, subtype: "zuGemischt", prompt: `\\dfrac{${g * d + n}}{${d}}`, promptText: `${g * d + n}/${d}`,
      question: `\\text{Schreibe als gemischte Zahl.}`, numFields: 2, fieldLabels: ["Ganze", "Bruchteil"], answer: [g, fr(n, d)], data: { g, n, d } };
  }
  function steps_brueche_5(task) {
    const { g, n, d } = task.data;
    return task.subtype === "zuUnecht"
      ? [{ label: "Ganze mal Nenner, dann den Zähler dazu" }, { left: `${gemTex(g, n, d)} = \\dfrac{${g}\\cdot ${d} + ${n}}{${d}} = \\dfrac{${g * d + n}}{${d}}`, right: "" }]
      : [{ label: "Zähler durch Nenner teilen: Ergebnis = Ganze, Rest = neuer Zähler" }, { left: `${g * d + n} : ${d} = ${g}\\;${T("Rest")}\\;${n} \\;\\Rightarrow\\; ${gemTex(g, n, d)}`, right: "" }];
  }

  // ---- Stufe 6: Addieren und Subtrahieren (auch gemischte Zahlen) ----
  function gen_brueche_6() {
    const sub = choice(["gleichnamig", "ungleichnamig", "ungleichnamig", "gemischt"]);
    for (;;) {
      let a, b, c, d, g1 = 0, g2 = 0;
      if (sub === "gleichnamig") { b = d = randInt(3, 12); a = randInt(1, b - 1); c = randInt(1, d - 1); }
      else { [a, b] = echterBruch(10); [c, d] = echterBruch(12); if (b === d) continue; }
      if (sub === "gemischt") { g1 = randInt(1, 5); g2 = randInt(1, 4); }
      const op = choice(["+", "-"]);
      const z1 = g1 * b + a, z2 = g2 * d + c, n = op === "+" ? z1 * d + z2 * b : z1 * d - z2 * b;
      if (n <= 0) continue;
      const erg = fr(n, b * d), L = (b * d) / gcd(b, d);
      return { topic: "brueche", level: 6, subtype: sub, prompt: `${gemTex(g1, a, b)} ${op} ${gemTex(g2, c, d)}`, promptText: "add/sub",
        question: `\\text{Berechne und kürze vollständig (Ergebnis als Bruch, auch unecht).}`, numFields: 1, fieldLabels: ["Ergebnis"], answer: [erg], data: { a, b, c, d, g1, g2, op, L } };
    }
  }
  function steps_brueche_6(task) {
    const { a, b, c, d, g1, g2, op, L } = task.data, z1 = g1 * b + a, z2 = g2 * d + c;
    const st = [];
    if (g1 || g2) st.push({ label: "Gemischte Zahlen zuerst in unechte Brüche umwandeln" }, { left: `${frTex(z1, b)} ${op} ${frTex(z2, d)}`, right: "" });
    if (b !== d) st.push({ label: `Gleichnamig machen: kgV von ${b} und ${d} ist ${L}` }, { left: `\\dfrac{${(z1 * L) / b}}{${L}} ${op} \\dfrac{${(z2 * L) / d}}{${L}}`, right: "" });
    const zn = op === "+" ? (z1 * L) / b + (z2 * L) / d : (z1 * L) / b - (z2 * L) / d;
    st.push({ label: "Zähler verrechnen, Nenner bleibt – dann kürzen" }, { left: `= \\dfrac{${zn}}{${L}} = ${frTex(task.answer[0].num, task.answer[0].den)}`, right: "" });
    return st;
  }

  // ---- Stufe 7: Multiplizieren und Dividieren ----
  function gen_brueche_7() {
    const sub = choice(["malZahl", "malBruch", "durchZahl", "durchBruch", "gemischt"]);
    const [a, b] = echterBruch(10); let [c, d] = echterBruch(10);
    let A = a, B = b, C, D, op, g1 = 0, p1, p2;
    if (sub === "malZahl") { C = randInt(2, 12); D = 1; op = "\\cdot"; p1 = `\\dfrac{${a}}{${b}}`; p2 = `${C}`; }
    else if (sub === "durchZahl") { C = randInt(2, 9); D = 1; op = ":"; p1 = `\\dfrac{${a}}{${b}}`; p2 = `${C}`; }
    else if (sub === "malBruch") { C = c; D = d; op = "\\cdot"; p1 = `\\dfrac{${a}}{${b}}`; p2 = `\\dfrac{${c}}{${d}}`; }
    else if (sub === "durchBruch") { C = c; D = d; op = ":"; p1 = `\\dfrac{${a}}{${b}}`; p2 = `\\dfrac{${c}}{${d}}`; }
    else { g1 = randInt(1, 4); A = g1 * b + a; C = c; D = d; op = choice(["\\cdot", ":"]); p1 = gemTex(g1, a, b); p2 = `\\dfrac{${c}}{${d}}`; }
    const erg = op === ":" ? fr(A * D, B * C) : fr(A * C, B * D);
    return { topic: "brueche", level: 7, subtype: sub, prompt: `${p1} ${op} ${p2}`, promptText: "mal/durch",
      question: `\\text{Berechne und kürze vollständig.}`, numFields: 1, fieldLabels: ["Ergebnis"], answer: [erg], data: { A, B, C, D, op, g1, a, b } };
  }
  function steps_brueche_7(task) {
    const { A, B, C, D, op, g1, a, b } = task.data, st = [];
    if (g1) st.push({ label: "Gemischte Zahl in einen unechten Bruch umwandeln" }, { left: `${gemTex(g1, a, b)} = \\dfrac{${A}}{${B}}`, right: "" });
    if (op === ":") st.push({ label: "Durch einen Bruch teilen = mit dem Kehrwert multiplizieren" }, { left: `\\dfrac{${A}}{${B}} : ${frTex(C, D)} = \\dfrac{${A}}{${B}}\\cdot \\dfrac{${D}}{${C}}`, right: "" });
    const [Z, N] = op === ":" ? [A * D, B * C] : [A * C, B * D];
    st.push({ label: "Zähler mal Zähler, Nenner mal Nenner (am besten vorher kürzen)" }, { left: `= \\dfrac{${Z}}{${N}} = ${frTex(task.answer[0].num, task.answer[0].den)}`, right: "" });
    return st;
  }

  // ---- Stufe 8: Dezimalbrüche ----
  function gen_brueche_8() {
    const sub = choice(["zuDezimal", "zuBruch", "art"]);
    if (sub === "art") {
      const d = choice([3, 6, 7, 9, 11, 12, 15, 2, 4, 5, 8, 20, 25, 40, 50]), n = randInt(1, d - 1); // auch ungekürzt (3/6!)
      const g = gcd(n, d), dr = d / g; let r = dr; while (r % 2 === 0) r /= 2; while (r % 5 === 0) r /= 5;
      return { topic: "brueche", level: 8, subtype: sub, prompt: `\\dfrac{${n}}{${d}}`, promptText: `${n}/${d}`,
        question: `\\text{Ergibt der Bruch einen abbrechenden oder einen periodischen Dezimalbruch?}`, numFields: 1, fieldLabels: ["Dezimalbruch"], fieldType: "choice", fieldChoices: [["abbrechend", "periodisch"]],
        answer: [r === 1 ? "abbrechend" : "periodisch"], data: { n, d, g, dr } };
    }
    const d = choice([2, 4, 5, 8, 10, 20, 25, 40, 50]), n = randInt(1, d - 1), g = gcd(n, d);
    if (sub === "zuDezimal") return { topic: "brueche", level: 8, subtype: sub, prompt: `\\dfrac{${n}}{${d}}`, promptText: `${n}/${d}`,
      question: `\\text{Schreibe als Dezimalzahl.}`, numFields: 1, fieldLabels: ["Dezimalzahl"], answer: [n / d], data: { n, d } };
    return { topic: "brueche", level: 8, subtype: sub, prompt: fmtNum(n / d), promptText: String(n / d),
      question: `\\text{Schreibe als vollständig gekürzten Bruch.}`, numFields: 1, fieldLabels: ["Bruch"], answer: [fr(n, d)], data: { n, d } };
  }
  function check_brueche_8(task, inp) { return task.subtype === "art" ? { correct: inp[0] === task.answer[0], fieldErrors: inp[0] === task.answer[0] ? [] : [0] } : check_bruch_streng(task, inp); }
  function steps_brueche_8(task) {
    const d = task.data, s = task.subtype;
    if (s === "art") return [{ label: "Vollständig kürzen, dann den Nenner in Primfaktoren zerlegen" }, { left: `\\dfrac{${d.n}}{${d.d}} = \\dfrac{${d.n / d.g}}{${d.dr}}`, right: "" },
      { label: "Enthält der Nenner nur die Primfaktoren 2 und 5, bricht der Dezimalbruch ab – sonst ist er periodisch." }, { left: T(task.answer[0]), right: "" }];
    const k = { 2: 50, 4: 25, 5: 20, 8: 125, 10: 10, 20: 5, 25: 4, 40: 25, 50: 2 }[d.d], N = d.d * k;
    if (s === "zuDezimal") return [{ label: `Auf eine Zehnerpotenz erweitern (mal ${k})` }, { left: `\\dfrac{${d.n}}{${d.d}} = \\dfrac{${d.n * k}}{${N}} = ${fmtNum(d.n / d.d)}`, right: "" }];
    const st = String(d.n / d.d).split(".")[1].length, Z = Math.round((d.n / d.d) * 10 ** st);
    return [{ label: "Nachkommastellen bestimmen den Nenner (10, 100, 1000 …), dann kürzen" }, { left: `${fmtNum(d.n / d.d)} = \\dfrac{${Z}}{${10 ** st}} = ${frTex(task.answer[0].num, task.answer[0].den)}`, right: "" }];
  }

  // ---- Stufe 9: Brüche am Zahlenstrahl (Ablesen, gemischte Zahlen, Skala ohne 1, Eintragen) ----
  // Vorbild: Schulbuch-/Arbeitsblattaufgaben (Einteilung zählen = Nenner, Teile abzählen = Zähler;
  // Zahlenstrahl beginnt nicht bei 0; nur 0 und ein Stammbruch beschriftet; Brüche einem Buchstaben zuordnen)
  // zahlenstrahlSVG: T Teilstücke, N Teilstücke pro Ganzes, Beginn bei "start" (ganze Zahl).
  //   labels: [{ i, text } | { i, num, den }] unter dem Strahl, pfeile: [{ i, text }] darüber
  function zahlenstrahlSVG(o) {
    const B = o.breite || 340, x0 = 22, x1 = B - 22, yL = 46, T = o.T, dx = (x1 - x0) / T, X = (i) => x0 + i * dx;
    let svg = `<svg viewBox="0 0 ${B} 100" width="${B}" height="100" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">`;
    svg += `<line x1="${x0 - 8}" y1="${yL}" x2="${x1 + 14}" y2="${yL}" stroke="#111" stroke-width="1.6"/><path d="M${x1 + 14} ${yL - 4} L${x1 + 20} ${yL} L${x1 + 14} ${yL + 4} Z" fill="#111"/>`;
    const lang = new Set((o.labels || []).map((l) => l.i));
    for (let i = 0; i <= T; i++) {
      const g = o.N && i % o.N === 0 && !o.ohneGanze ? 1 : 0, l = lang.has(i) || g ? 9 : 5;
      svg += `<line x1="${X(i).toFixed(1)}" y1="${yL - l}" x2="${X(i).toFixed(1)}" y2="${yL + l}" stroke="#111" stroke-width="${l > 5 ? 1.6 : 1}"/>`;
    }
    (o.labels || []).forEach((l) => {
      const x = X(l.i).toFixed(1);
      if (l.den) svg += `<text x="${x}" y="${yL + 24}" font-size="15" text-anchor="middle">${l.num}</text><line x1="${(X(l.i) - 8).toFixed(1)}" y1="${yL + 29}" x2="${(X(l.i) + 8).toFixed(1)}" y2="${yL + 29}" stroke="#111"/><text x="${x}" y="${yL + 44}" font-size="15" text-anchor="middle">${l.den}</text>`;
      else svg += `<text x="${x}" y="${yL + 26}" font-size="14" text-anchor="middle">${l.text}</text>`;
    });
    (o.pfeile || []).forEach((p) => {
      const x = X(p.i);
      svg += `<path d="M${(x - 5).toFixed(1)} ${yL - 22} L${(x + 5).toFixed(1)} ${yL - 22} L${x.toFixed(1)} ${yL - 12} Z" fill="#dc2626"/><line x1="${x.toFixed(1)}" y1="${yL - 32}" x2="${x.toFixed(1)}" y2="${yL - 21}" stroke="#dc2626" stroke-width="2"/>`;
      if (p.text) svg += `<text x="${x.toFixed(1)}" y="${yL - 36}" font-size="14" font-weight="bold" fill="#dc2626" text-anchor="middle">${p.text}</text>`;
    });
    return svg + "</svg>";
  }
  const ganzeLabels = (start, N, T) => Array.from({ length: Math.floor(T / N) + 1 }, (_, j) => ({ i: j * N, text: String(start + j) }));
  function gen_brueche_9() {
    const sub = choice(["ablesen", "ablesen", "gemischt", "skala", "eintragen", "eintragen"]);
    if (sub === "ablesen") {
      const n = randInt(2, 12), bis = n <= 6 && Math.random() < 0.4 ? 2 : 1, anz = n * bis;
      let k; do { k = randInt(1, anz - 1); } while (k % n === 0);
      return { topic: "brueche", level: 9, subtype: sub, prompt: T("Welcher Bruch gehört an den Pfeil?"), promptText: `ablesen ${k}/${n}`,
        graph: zahlenstrahlSVG({ T: anz, N: n, labels: ganzeLabels(0, n, anz), pfeile: [{ i: k }] }),
        question: T("Gib den Bruch an (gekürzt oder ungekürzt)."), numFields: 1, fieldLabels: ["Bruch am Pfeil"], answer: [{ num: k, den: n }], data: { k, n, start: 0 } };
    }
    if (sub === "gemischt") {
      const N = randInt(2, 6), g = randInt(0, 3); let k; do { k = randInt(1, 2 * N - 1); } while (k % N === 0 || (g === 0 && k < N));
      return { topic: "brueche", level: 9, subtype: sub, prompt: T(`Der Zahlenstrahl beginnt bei ${g}. Welche Zahl gehört an den Pfeil?`), promptText: `gemischt ${g}+${k}/${N}`,
        graph: zahlenstrahlSVG({ T: 2 * N, N, labels: ganzeLabels(g, N, 2 * N), pfeile: [{ i: k }] }),
        question: T("Gib die Zahl als unechten Bruch an (z. B. 7/4)."), numFields: 1, fieldLabels: ["unechter Bruch"], answer: [{ num: g * N + k, den: N }], data: { g, k, N } };
    }
    if (sub === "skala") {
      const q = randInt(2, 5), m = randInt(2, 4), N = q * m, anz = randInt(m + 1, Math.max(m + 1, Math.min(N - 1, 3 * m)));
      let k; do { k = randInt(1, anz); } while (k === m);
      return { topic: "brueche", level: 9, subtype: sub, prompt: T("Nur 0 und ein Bruch sind beschriftet. Welcher Bruch gehört an den Pfeil?"), promptText: `skala 1/${q} bei ${m}, Pfeil ${k}`,
        graph: zahlenstrahlSVG({ T: anz, N, ohneGanze: true, labels: [{ i: 0, text: "0" }, { i: m, num: 1, den: q }], pfeile: [{ i: k }] }),
        question: T("Gib den Bruch an (gekürzt oder ungekürzt)."), numFields: 1, fieldLabels: ["Bruch am Pfeil"], answer: [{ num: k, den: N }], data: { q, m, N, k, anz } };
    }
    // eintragen: Bruch dem richtigen Buchstaben zuordnen (Nenner der Einteilung ≠ Nenner des Bruchs)
    for (;;) {
      const N = choice([4, 6, 8, 10, 12]), bis = Math.random() < 0.5 ? 2 : 1, anz = N * bis;
      const teiler = [2, 3, 4, 5, 6].filter((q) => N % q === 0 && q < N);
      const q = choice(teiler); let p; do { p = randInt(1, bis * q - 1); } while (p % q === 0 || gcd(p, q) !== 1);
      const t = p * N / q;
      // Ablenker: Zähler direkt abgezählt (häufigster Fehler), Nachbarstriche, weitere
      const kand = new Set([t]); if (p !== t && p < anz && p % N !== 0) kand.add(p);
      [t - 1, t + 1].forEach((x) => { if (kand.size < 5 && x > 0 && x < anz && x % N !== 0) kand.add(x); });
      for (let v = 0; kand.size < 5 && v < 60; v++) { const x = randInt(1, anz - 1); if (x % N !== 0) kand.add(x); }
      if (kand.size < 4) continue;
      const pos = [...kand].sort((a, b) => a - b), buchst = pos.map((_, j) => "ABCDE"[j]), L = buchst[pos.indexOf(t)];
      const gem = p > q && Math.random() < 0.4, G = Math.floor(p / q), r = p % q;
      return { topic: "brueche", level: 9, subtype: sub, prompt: gem ? gemTex(G, r, q) : `\\dfrac{${p}}{${q}}`, promptText: `eintragen ${p}/${q} auf ${N}tel`,
        graph: zahlenstrahlSVG({ T: anz, N, labels: ganzeLabels(0, N, anz), pfeile: pos.map((i, j) => ({ i, text: buchst[j] })) }),
        question: T("Bei welchem Buchstaben liegt diese Zahl?"), numFields: 1, fieldType: "choice", fieldChoices: [buchst], fieldLabels: ["Buchstabe"], answer: [L], data: { N, p, q, t, pos, buchst, gem, G, r } };
    }
  }
  function check_brueche_9(task, inp) {
    if (task.subtype === "eintragen") return { correct: inp[0] === task.answer[0], fieldErrors: inp[0] === task.answer[0] ? [] : [0] };
    const f = parseUserFraction(inp[0]), a = task.answer[0];
    const ok = !!f && f.den !== 0 && f.num * a.den === a.num * f.den; // jede gleichwertige Schreibweise zählt
    return { correct: ok, fieldErrors: ok ? [] : [0] };
  }
  function steps_brueche_9(task) {
    const d = task.data, s = task.subtype;
    const gekuerzt = (z, n) => (gcd(z, n) > 1 ? ` = ${bruchTex(z, n)}` : "");
    if (s === "ablesen") return [
      { label: "Nenner: In wie viele gleich große Teile ist die Strecke von 0 bis 1 geteilt?" }, { left: `${T(d.n + " Teile")} \\;\\Rightarrow\\; ${T("Nenner")}\\; ${d.n}`, right: "" },
      { label: "Zähler: Teile von 0 bis zum Pfeil abzählen" }, { left: `${T(d.k + " Teile")} \\;\\Rightarrow\\; \\dfrac{${d.k}}{${d.n}}${gekuerzt(d.k, d.n)}`, right: "" }];
    if (s === "gemischt") {
      const G = d.g + Math.floor(d.k / d.N), r = d.k % d.N;
      return [
        { label: `Nenner: Von ${d.g} bis ${d.g + 1} sind es ${d.N} gleich große Teile` }, { left: `${T("ein Teil")} = \\dfrac{1}{${d.N}}`, right: "" },
        { label: `Vom letzten Ganzen (${G}) aus ${r} Teile weiter` }, { left: `${gemTex(G, r, d.N)}`, right: "" },
        { label: "In einen unechten Bruch umwandeln: Ganze · Nenner + Zähler" }, { left: `\\dfrac{${G}\\cdot ${d.N} + ${r}}{${d.N}} = \\dfrac{${G * d.N + r}}{${d.N}}`, right: "" }];
    }
    if (s === "skala") return [
      { label: `Von 0 bis 1/${d.q} sind es ${d.m} Teile` }, { left: `\\dfrac{1}{${d.q}} \\;${T("entspricht")}\\; ${T(d.m + " Teile")}`, right: "" },
      { label: `Bis 1 sind es ${d.q}-mal so viele Teile` }, { left: `${d.q}\\cdot ${d.m} = ${d.N} \\;\\Rightarrow\\; ${T("ein Teil")} = \\dfrac{1}{${d.N}}`, right: "" },
      { label: "Teile von 0 bis zum Pfeil abzählen" }, { left: `${T(d.k + " Teile")} \\;\\Rightarrow\\; \\dfrac{${d.k}}{${d.N}}${gekuerzt(d.k, d.N)}`, right: "" }];
    const f = d.N / d.q, vorne = d.gem ? [{ label: "Gemischte Zahl in einen unechten Bruch umwandeln" }, { left: `${gemTex(d.G, d.r, d.q)} = \\dfrac{${d.G}\\cdot ${d.q} + ${d.r}}{${d.q}} = \\dfrac{${d.p}}{${d.q}}`, right: "" }] : [];
    return vorne.concat([
      { label: `Von 0 bis 1 sind es ${d.N} Teile: auf den Nenner ${d.N} erweitern` }, { left: `\\dfrac{${d.p}}{${d.q}} = \\dfrac{${d.p}\\cdot ${f}}{${d.q}\\cdot ${f}} = \\dfrac{${d.t}}{${d.N}}`, right: "" },
      { label: `${d.t} Teile von 0 aus abzählen` }, { left: T("Buchstabe " + task.answer[0]), right: "" }]);
  }

  Object.assign(ERKL, {
    "brueche/5": E("Gemischte Zahlen", [T("Gemischte Zahl → unechter Bruch: Ganze · Nenner + Zähler, Nenner bleibt."), T("Unechter Bruch → gemischte Zahl: Zähler : Nenner, der Rest wird der neue Zähler.")],
      [{ left: `2\\,\\dfrac{3}{4} = \\dfrac{2\\cdot 4 + 3}{4} = \\dfrac{11}{4}\\,, \\qquad \\dfrac{17}{5} = 3\\,\\dfrac{2}{5}`, right: "" }], [T("Ganze und Zähler einfach addieren: 2 3/4 ist nicht 5/4.")]),
    "brueche/6": E("Brüche addieren und subtrahieren", [T("Nur gleichnamige Brüche kann man addieren: erst auf das kgV der Nenner erweitern, dann die Zähler verrechnen. Der Nenner bleibt."), T("Gemischte Zahlen vorher in unechte Brüche umwandeln.")],
      [{ left: `\\dfrac{1}{2} + \\dfrac{1}{3} = \\dfrac{3}{6} + \\dfrac{2}{6} = \\dfrac{5}{6}`, right: "" }], [T("Zähler und Nenner einzeln addieren: 1/2 + 1/3 ist NICHT 2/5."), T("Am Ende nicht kürzen.")]),
    "brueche/7": E("Brüche multiplizieren und dividieren", [T("Multiplizieren: Zähler mal Zähler, Nenner mal Nenner – möglichst vorher kürzen."), T("Dividieren: mit dem Kehrwert multiplizieren (Zähler und Nenner vertauschen)."), T("Ganze Zahlen als Bruch mit Nenner 1 schreiben; gemischte Zahlen zuerst umwandeln.")],
      [{ left: `\\dfrac{3}{4}\\cdot \\dfrac{2}{9} = \\dfrac{6}{36} = \\dfrac{1}{6}\\,, \\qquad \\dfrac{3}{5} : \\dfrac{2}{3} = \\dfrac{3}{5}\\cdot \\dfrac{3}{2} = \\dfrac{9}{10}`, right: "" }],
      [T("Beim Dividieren den Kehrwert vergessen."), T("Bei 3/4 · 5 auch den Nenner mit 5 multiplizieren (richtig: 15/4).")]),
    "brueche/8": E("Dezimalbrüche", [T("Bruch → Dezimalzahl: auf 10, 100, 1000 … erweitern oder Zähler durch Nenner teilen."), T("Dezimalzahl → Bruch: Nachkommastellen bestimmen den Nenner, dann kürzen."), T("Abbrechend genau dann, wenn der gekürzte Nenner nur die Primfaktoren 2 und 5 hat; sonst periodisch (1/3 = 0,333…).")],
      [{ left: `\\dfrac{3}{8} = \\dfrac{375}{1000} = 0,375\\,, \\qquad 0,35 = \\dfrac{35}{100} = \\dfrac{7}{20}`, right: "" }], [T("Bei 3/6 = 1/2 vorher nicht kürzen und deshalb „periodisch“ wegen der 3 im Nenner sagen.")])
  });
  // ---- Stufe 10: Brüche als Tortenstücke (Kreisdarstellung, Kl. 5–6) ----
  // Vorbild: Schulbuch/Arbeitsblätter: gefärbten Anteil ablesen (auch kürzen), Rest, passende Torte
  // zuordnen (gleichwertige Brüche), zwei Torten vergleichen, zwei Farben, gemischte Zahlen aus mehreren Kreisen.
  const TORTE_BLAU = "#60a5fa", TORTE_ROT = "#f87171";
  // Eine Torte als SVG-Gruppe (ohne <svg>-Hülle): Start oben, im Uhrzeigersinn; farben[i] = Füllfarbe oder null (weiß)
  function torteGruppe(n, farben, G, x0, y0) {
    const c = G / 2, r = G / 2 - 4, f = (x) => x.toFixed(2);
    let g = `<g transform="translate(${x0},${y0 || 0})" class="torte">`;
    for (let i = 0; i < n; i++) {
      const fill = farben[i] || "#ffffff";
      if (n === 1) { g += `<circle cx="${c}" cy="${c}" r="${r}" fill="${fill}" stroke="#334155" stroke-width="1.5" data-stueck="${i}"/>`; continue; }
      const a0 = -Math.PI / 2 + (2 * Math.PI * i) / n, a1 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / n;
      g += `<path d="M ${c} ${c} L ${f(c + r * Math.cos(a0))} ${f(c + r * Math.sin(a0))} A ${r} ${r} 0 ${n === 2 ? 1 : 0} 1 ${f(c + r * Math.cos(a1))} ${f(c + r * Math.sin(a1))} Z" fill="${fill}" stroke="#334155" stroke-width="1.5" data-stueck="${i}"/>`;
    }
    return g + "</g>";
  }
  // mehrere Torten in EINEM SVG (proZeile Torten je Zeile), optional mit Namen darunter
  function tortenReihe(liste, proZeile) {
    const k = proZeile || liste.length, gap = 14, G = Math.max(...liste.map((t) => t.gr || 120)), mitName = liste.some((t) => t.name);
    const zeilen = Math.ceil(liste.length / k), ZH = G + (mitName ? 22 : 0) + (zeilen > 1 ? 8 : 0);
    const W = Math.min(k, liste.length) * G + gap * (Math.min(k, liste.length) - 1), H = zeilen * ZH;
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" class="graph-svg">`;
    liste.forEach((t, j) => {
      const x = (j % k) * (G + gap), y = Math.floor(j / k) * ZH, g = t.gr || 120, dx = x + (G - g) / 2;
      svg += torteGruppe(t.n, t.farben, g, dx, y + (G - g) / 2);
      if (t.name) svg += `<text x="${(x + G / 2).toFixed(1)}" y="${(y + G + 17).toFixed(1)}" font-size="14" font-weight="bold" text-anchor="middle" fill="#0f172a" class="tortenname">${t.name}</text>`;
    });
    return svg + "</svg>";
  }
  const gefaerbt = (n, k, farbe) => Array.from({ length: n }, (_, i) => (i < k ? farbe || TORTE_BLAU : null));
  function gen_brueche_10() {
    const sub = choice(["ablesen", "ablesen", "rest", "zuordnen", "vergleichen", "zweiFarben", "gemischt"]);
    if (sub === "ablesen" || sub === "rest") {
      const n = randInt(2, 12); let k; do { k = randInt(1, n - 1); } while (sub === "ablesen" && n > 4 && Math.random() < 0.5 && gcd(k, n) === 1);
      const z = sub === "rest" ? n - k : k;
      return { topic: "brueche", level: 10, subtype: sub, prompt: T(sub === "rest" ? "Welcher Anteil der Torte ist NICHT gefärbt?" : "Welcher Anteil der Torte ist blau gefärbt?"), promptText: `${sub} ${k}/${n}`,
        graph: tortenReihe([{ n, farben: gefaerbt(n, k), gr: 150 }]), question: T("Gib den Anteil als Bruch an (gekürzt oder ungekürzt)."),
        numFields: 1, fieldLabels: ["Anteil"], answer: [{ num: z, den: n }], data: { n, k, z } };
    }
    if (sub === "zuordnen") {
      for (;;) {
        let p, q; do { q = choice([2, 3, 4, 5, 6]); p = randInt(1, q - 1); } while (gcd(p, q) !== 1);
        const m = choice([1, 2, 2, 3].filter((x) => q * x <= 12)), N = q * m, K = p * m; // richtige Torte, evtl. feiner eingeteilt
        const kand = [{ n: N, k: K }];
        const ablenker = [{ n: N, k: p }, { n: q + p, k: p }, { n: N, k: N - K }, { n: N, k: K + 1 }, { n: N, k: K - 1 }, { n: p + q, k: q }];
        mische(ablenker).forEach((a) => { if (kand.length < 4 && a.k > 0 && a.k < a.n && a.n <= 12 && Math.abs(a.k / a.n - p / q) > 1e-9 && !kand.some((b) => b.n === a.n && b.k === a.k)) kand.push(a); });
        if (kand.length < 4) continue;
        const reihen = mische(kand).map((t, i) => Object.assign(t, { name: "ABCD"[i] }));
        const L = reihen.find((t) => t.n === N && t.k === K).name;
        return { topic: "brueche", level: 10, subtype: sub, prompt: `${T("Welche Torte zeigt")}\\;\\; \\dfrac{${p}}{${q}}\\;${T("?")}`, promptText: `zuordnen ${p}/${q}`,
          graph: tortenReihe(reihen.map((t) => ({ n: t.n, farben: gefaerbt(t.n, t.k), name: t.name, gr: 120 })), 2), question: T("Wähle die passende Torte."),
          numFields: 1, fieldType: "choice", fieldChoices: [["A", "B", "C", "D"]], fieldLabels: ["Torte"], answer: [L], data: { p, q, N, K, reihen: reihen.map((t) => [t.name, t.n, t.k]) } };
      }
    }
    if (sub === "vergleichen") {
      let n1, k1, n2, k2; do { n1 = randInt(3, 12); n2 = randInt(3, 12); k1 = randInt(1, n1 - 1); k2 = randInt(1, n2 - 1); } while (n1 === n2 || (Math.random() < 0.7 && k1 * n2 === k2 * n1));
      const v = k1 * n2 - k2 * n1, A = v > 0 ? "Torte A" : v < 0 ? "Torte B" : "gleich viel";
      return { topic: "brueche", level: 10, subtype: sub, prompt: T("Zwei gleich große Torten wurden unterschiedlich geschnitten. Die blauen Stücke sind noch übrig."), promptText: `vergleichen ${k1}/${n1} ${k2}/${n2}`,
        graph: tortenReihe([{ n: n1, farben: gefaerbt(n1, k1), name: "A", gr: 120 }, { n: n2, farben: gefaerbt(n2, k2), name: "B", gr: 120 }]),
        question: T("Wie viel ist jeweils übrig, und von welcher Torte ist mehr übrig?"), numFields: 3, perFieldType: ["text", "text", "choice"], fieldChoices: [null, null, ["Torte A", "Torte B", "gleich viel"]],
        fieldLabels: ["übrig von A", "übrig von B", "mehr übrig ist bei"], answer: [{ num: k1, den: n1 }, { num: k2, den: n2 }, A], data: { n1, k1, n2, k2 } };
    }
    if (sub === "zweiFarben") {
      for (;;) {
        const n = choice([4, 6, 8, 10, 12]), b = randInt(1, n - 2), r = randInt(1, n - 1 - b);
        if (gcd(b, n) === 1 && gcd(r, n) === 1 && Math.random() < 0.6) continue; // meist kürzbare Teile, damit die Torte "Viertel/Drittel" zeigt
        const farben = Array.from({ length: n }, (_, i) => (i < b ? TORTE_BLAU : i < b + r ? TORTE_ROT : null));
        return { topic: "brueche", level: 10, subtype: sub, prompt: T("Ein Teil der Torte ist blau, ein Teil rot gefärbt."), promptText: `zweiFarben ${b}+${r}/${n}`,
          graph: tortenReihe([{ n, farben, gr: 150 }]), question: T("Welcher Anteil ist blau, welcher rot, und welcher Anteil ist insgesamt gefärbt?"),
          numFields: 3, fieldLabels: ["blau", "rot", "insgesamt gefärbt"], answer: [{ num: b, den: n }, { num: r, den: n }, { num: b + r, den: n }], data: { n, b, r } };
      }
    }
    // gemischt: g volle Torten und eine angeschnittene
    const g = randInt(1, 3), n = randInt(2, 8), k = randInt(1, n - 1);
    const liste = Array.from({ length: g }, () => ({ n, farben: gefaerbt(n, n), gr: 90 })).concat([{ n, farben: gefaerbt(n, k), gr: 90 }]);
    return { topic: "brueche", level: 10, subtype: sub, prompt: T("Alle Torten sind gleich groß. Wie viele Torten sind blau gefärbt?"), promptText: `gemischt ${g} ${k}/${n}`,
      graph: tortenReihe(liste, 3), question: T("Gib die Anzahl als gemischte Zahl und als unechten Bruch an."), numFields: 3, perFieldType: ["text", "text", "text"],
      fieldLabels: ["ganze Torten", "Bruchteil der letzten Torte", "als unechter Bruch"], answer: [g, { num: k, den: n }, { num: g * n + k, den: n }], data: { g, n, k } };
  }
  function check_brueche_10(task, inp) {
    const err = [];
    task.answer.forEach((a, i) => {
      let ok;
      if (a && typeof a === "object") { const f = parseUserFraction(inp[i]); ok = !!f && f.den !== 0 && fractionsEqual(f, a); } // jede gleichwertige Schreibweise
      else if (typeof a === "string") ok = inp[i] === a;
      else { const v = parseUserNumber(inp[i]); ok = !isNaN(v) && v === a; }
      if (!ok) err.push(i);
    });
    return { correct: !err.length, fieldErrors: err };
  }
  function steps_brueche_10(task) {
    const d = task.data, s = task.subtype, gk = (z, n) => (gcd(z, n) > 1 ? ` = ${bruchTex(z, n)}` : "");
    if (s === "ablesen" || s === "rest") return [
      { label: "Nenner: In wie viele gleich große Stücke ist die Torte geteilt?" }, { left: `${T(d.n + " Stücke")} \\;\\Rightarrow\\; ${T("Nenner")}\\; ${d.n}`, right: "" },
      { label: s === "rest" ? "Zähler: die weißen (nicht gefärbten) Stücke zählen" : "Zähler: die blauen Stücke zählen" },
      { left: s === "rest" ? `${d.n} - ${d.k} = ${d.z} \\;\\Rightarrow\\; \\dfrac{${d.z}}{${d.n}}${gk(d.z, d.n)}` : `\\dfrac{${d.k}}{${d.n}}${gk(d.k, d.n)}`, right: "" }];
    if (s === "zuordnen") {
      const r = d.reihen.map(([nm, n, k]) => `${nm}: \\dfrac{${k}}{${n}}`).join(",\\;\\; ");
      return [{ label: "Bei jeder Torte den Anteil ablesen: gefärbte Stücke von allen Stücken" }, { left: r, right: "" },
        { label: "Kürzen bzw. erweitern und mit dem gesuchten Bruch vergleichen" },
        { left: `\\dfrac{${d.K}}{${d.N}}${d.K !== d.p ? ` = \\dfrac{${d.p}}{${d.q}}` : ""} \\;\\Rightarrow\\; ${T("Torte " + task.answer[0])}`, right: "" }];
    }
    if (s === "vergleichen") {
      const L = (d.n1 * d.n2) / gcd(d.n1, d.n2), z1 = d.k1 * L / d.n1, z2 = d.k2 * L / d.n2;
      return [{ label: "Anteile ablesen" }, { left: `A: \\dfrac{${d.k1}}{${d.n1}},\\;\\; B: \\dfrac{${d.k2}}{${d.n2}}`, right: "" },
        { label: `Gleichnamig machen (Hauptnenner ${L}) und die Zähler vergleichen` },
        { left: `\\dfrac{${z1}}{${L}} ${z1 > z2 ? ">" : z1 < z2 ? "<" : "="} \\dfrac{${z2}}{${L}} \\;\\Rightarrow\\; ${T(task.answer[2] === "gleich viel" ? "gleich viel übrig" : "mehr übrig bei " + task.answer[2])}`, right: "" }];
    }
    if (s === "zweiFarben") return [
      { label: `Die Torte hat ${d.n} Stücke: blaue und rote Stücke einzeln zählen` }, { left: `${T("blau")}\\; \\dfrac{${d.b}}{${d.n}}${gk(d.b, d.n)},\\;\\; ${T("rot")}\\; \\dfrac{${d.r}}{${d.n}}${gk(d.r, d.n)}`, right: "" },
      { label: "Insgesamt: gleicher Nenner, Zähler addieren" }, { left: `\\dfrac{${d.b}}{${d.n}} + \\dfrac{${d.r}}{${d.n}} = \\dfrac{${d.b + d.r}}{${d.n}}${gk(d.b + d.r, d.n)}`, right: "" }];
    return [
      { label: "Volle Torten zählen = Ganze" }, { left: `${d.g}\\; ${T(d.g === 1 ? "ganze Torte" : "ganze Torten")}`, right: "" },
      { label: "Die angeschnittene Torte ablesen" }, { left: `\\dfrac{${d.k}}{${d.n}} \\;\\Rightarrow\\; ${d.g}\\,\\dfrac{${d.k}}{${d.n}}`, right: "" },
      { label: "In einen unechten Bruch umwandeln: Ganze · Nenner + Zähler" }, { left: `\\dfrac{${d.g}\\cdot ${d.n} + ${d.k}}{${d.n}} = \\dfrac{${d.g * d.n + d.k}}{${d.n}}`, right: "" }];
  }

  Object.assign(ERKL, {
    "brueche/9": E("Brüche am Zahlenstrahl",
      [T("Nenner: Zähle, in wie viele gleich große Teile die Strecke von 0 bis 1 geteilt ist – die Teilstücke, nicht die Striche."),
       T("Zähler: Zähle die Teile von 0 bis zur gesuchten Stelle."),
       T("Beginnt der Strahl nicht bei 0: vom letzten Ganzen aus weiterzählen (1 und 3 Viertel = 7/4)."),
       T("Ist nur 0 und z. B. 1/4 beschriftet: Teile bis 1/4 zählen und mal 4 nehmen – so viele Teile hat das Ganze."),
       T("Bruch eintragen: zuerst auf den Nenner der Einteilung erweitern (3/4 bei Achteln = 6/8), dann abzählen.")],
      [{ left: `${T("8 Teile von 0 bis 1, Pfeil nach 6 Teilen:")}\\;\\; \\dfrac{6}{8} = \\dfrac{3}{4}`, right: "" }],
      [T("Die Striche statt der Teilstücke zählen (bei 8 Teilen gibt es 9 Striche)."), T("Den Strich bei 0 mitzählen."), T("Bei einer Skala, die bei 1 beginnt, die Ganzen vergessen."),
       T("Den Zähler direkt abzählen, ohne vorher auf die Einteilung zu erweitern.")], "zahlenstrahl")
  });
  Object.assign(ERKL, {
    "brueche/10": E("Brüche als Tortenstücke",
      [T("Nenner: Zähle, in wie viele gleich große Stücke die Torte geteilt ist."), T("Zähler: Zähle die gefärbten Stücke."),
       T("Der nicht gefärbte Rest: alle Stücke minus die gefärbten."), T("Zwei Torten vergleichen: Brüche gleichnamig machen, dann die Zähler vergleichen."),
       T("Mehrere Torten: volle Torten sind die Ganzen, die angeschnittene Torte ist der Bruchteil.")],
      [{ left: `${T("8 Stücke, 6 davon blau:")}\\;\\; \\dfrac{6}{8} = \\dfrac{3}{4}\\,, \\qquad ${T("nicht gefärbt:")}\\;\\; \\dfrac{2}{8} = \\dfrac{1}{4}`, right: "" }],
      [T("Gefärbte Stücke durch die weißen statt durch ALLE Stücke teilen (6 : 2 statt 6 : 8)."), T("Bei verschieden geschnittenen Torten nur die Anzahl der Stücke vergleichen – 3 große Stücke können mehr sein als 5 kleine.")], "torte")
  });
  H.durchRest = "Der Nenner ist die Anzahl ALLER Stücke, nicht nur der weißen.";
  H.stueckeGezaehlt = "Nicht die Anzahl der Stücke vergleichen – die Stücke sind verschieden groß. Erst gleichnamig machen.";
  DIAG["brueche/10"] = (t, i, w, raw) => {
    const d = t.data, s = t.subtype;
    if ((s === "ablesen" || s === "rest") && w && d.n - d.z > 0 && nah(w.v, d.z / (d.n - d.z))) return H.durchRest;
    if (s === "vergleichen" && i === 2 && d.k1 !== d.k2 && raw === (d.k1 > d.k2 ? "Torte A" : "Torte B") && raw !== t.answer[2]) return H.stueckeGezaehlt;
    return null;
  };
  const erklGrafikBR = erklGrafik;
  erklGrafik = function (art) {
    if (art === "torte") return tortenReihe([{ n: 8, farben: gefaerbt(8, 6), name: "6/8 = 3/4 blau", gr: 150 }]);
    if (art === "zahlenstrahl") return zahlenstrahlSVG({ T: 8, N: 8, labels: [{ i: 0, text: "0" }, { i: 8, text: "1" }, { i: 6, num: 3, den: 4 }], pfeile: [{ i: 6, text: "6/8" }] });
    return erklGrafikBR(art);
  };
  H.stricheGezaehlt = "Zähle die Teilstücke (die Abstände zwischen den Strichen), nicht die Striche.";
  H.nullMitgezaehlt = "Der Strich bei 0 zählt nicht mit – zähle die Schritte ab 0.";
  H.startVergessen = "Der Zahlenstrahl beginnt nicht bei 0 – die Ganzen links vom Pfeil gehören dazu.";
  H.skalaNichtEins = "Der beschriftete Bruch ist nicht die 1 – überlege, wie viele Teile bis zur 1 gehören.";
  H.nichtErweitert = "Erst auf den Nenner der Einteilung erweitern, dann abzählen.";
  DIAG["brueche/9"] = (t, i, w, raw) => {
    const d = t.data, s = t.subtype;
    if (s === "eintragen") { const j = d.buchst.indexOf(raw); return j >= 0 && d.pos[j] === d.p ? H.nichtErweitert : null; }
    if (!w) return null;
    if (s === "ablesen") { if (nah(w.v, d.k / (d.n + 1))) return H.stricheGezaehlt; if (nah(w.v, (d.k + 1) / d.n)) return H.nullMitgezaehlt; }
    if (s === "gemischt") { if (nah(w.v, d.k / d.N) || nah(w.v, (d.k % d.N) / d.N)) return H.startVergessen; if (nah(w.v, d.g + d.k / (d.N + 1))) return H.stricheGezaehlt; }
    if (s === "skala") { if (nah(w.v, d.k / d.m) || nah(w.v, d.k / d.q)) return H.skalaNichtEins; }
    return null;
  };
  H.kehrwertVergessen = "Beim Dividieren mit dem KEHRWERT multiplizieren (Zähler und Nenner des zweiten Bruchs vertauschen).";
  H.nennerMal = "Bei Bruch mal ganzer Zahl nur den Zähler multiplizieren.";
  H.gemischtAddiert = "Gemischte Zahl → Bruch: Ganze MAL Nenner, dann Zähler dazu.";
  H.einzelnAddiert = "Zähler und Nenner einzeln addiert? Erst gleichnamig machen.";
  Object.assign(DIAG, {
    "brueche/5": (t, i, w) => (t.subtype === "zuUnecht" && nah(w.v, (t.data.g + t.data.n) / t.data.d) ? H.gemischtAddiert : null),
    "brueche/6": (t, i, w) => { const d = t.data, z1 = d.g1 * d.b + d.a, z2 = d.g2 * d.d + d.c; return d.op === "+" && nah(w.v, (z1 + z2) / (d.b + d.d)) ? H.einzelnAddiert : null; },
    "brueche/7": (t, i, w) => { const d = t.data; if (d.op === ":" && nah(w.v, (d.A * d.C) / (d.B * d.D))) return H.kehrwertVergessen; if (t.subtype === "malZahl" && nah(w.v, (d.A * d.C) / (d.B * d.C))) return H.nennerMal; return null; }
  });

  TOPICS.brueche = {
      name: "Bruchrechnung",
      grade: "Kl. 5–6",
      levels: [
        { id: 10, name: "Brüche als Tortenstücke", grade: "Kl. 5–6", generate: gen_brueche_10, check: check_brueche_10, steps: steps_brueche_10 },
        { id: 1, name: "Was ist größer? (gleicher Nenner/Zähler)", grade: "Kl. 5", generate: gen_brueche_1, check: check_brueche_1, steps: steps_brueche_1 },
        { id: 2, name: "Ungleichnamige Brüche vergleichen", grade: "Kl. 5–6", generate: gen_brueche_2, check: check_brueche_2, steps: steps_brueche_2 },
        { id: 9, name: "Brüche am Zahlenstrahl", grade: "Kl. 5–6", generate: gen_brueche_9, check: check_brueche_9, steps: steps_brueche_9 },
        { id: 3, name: "Brüche kürzen (ggT)", grade: "Kl. 6", generate: gen_brueche_3, check: check_brueche_3, steps: steps_brueche_3 },
        { id: 5, name: "Gemischte Zahlen", grade: "Kl. 6", generate: gen_brueche_5, check: check_bruch_streng, steps: steps_brueche_5 },
        { id: 6, name: "Addieren und subtrahieren", grade: "Kl. 6", generate: gen_brueche_6, check: check_bruch_streng, steps: steps_brueche_6 },
        { id: 7, name: "Multiplizieren und dividieren", grade: "Kl. 6", generate: gen_brueche_7, check: check_bruch_streng, steps: steps_brueche_7 },
        { id: 8, name: "Dezimalbrüche", grade: "Kl. 6", generate: gen_brueche_8, check: check_brueche_8, steps: steps_brueche_8 },
        { id: 4, name: "Textaufgaben", grade: "Kl. 5–6", generate: gen_brueche_4, check: check_textaufgabe, steps: steps_textaufgabe }
      ]
  };
  // ---------- BRÜCHE (Kl. 6, ohne Taschenrechner) ----------
  function kuerzbar() { let p, q; do { q = randInt(2, 10); p = randInt(1, q - 1); } while (gcd(p, q) !== 1); const k = randInt(2, 8); return { a: p * k, b: q * k, p, q }; }
  const KA_BRUECHE = [
    { key: "kuerzen", teil: "A", afb: 1, titel: "Kürzen und erweitern", baue: () => {
      const ks = [kuerzbar(), kuerzbar(), kuerzbar()];
      const er = [0, 1].map(() => { let p, q; do { q = randInt(2, 9); p = randInt(1, q - 1); } while (gcd(p, q) !== 1); const N = q * randInt(2, 6); return { p, q, N }; });
      return { kontext: "", teile: ks.map((k) => autoTeil(`${T("Kürze vollständig:")}\\;\\; \\dfrac{${k.a}}{${k.b}}`, [{ label: "gekürzter Bruch", kind: "fraction", answer: { num: k.p, den: k.q } }],
        [{ left: `\\dfrac{${k.a}}{${k.b}} = \\dfrac{${k.a} : ${gcd(k.a, k.b)}}{${k.b} : ${gcd(k.a, k.b)}} = \\dfrac{${k.p}}{${k.q}}`, right: "" }]))
        .concat(er.map((e) => autoTeil(`${T("Erweitere auf den Nenner " + e.N + ":")}\\;\\; \\dfrac{${e.p}}{${e.q}} = \\dfrac{?}{${e.N}}`, [{ label: "Zähler", kind: "number", answer: e.p * e.N / e.q }],
          [{ left: `\\dfrac{${e.p}}{${e.q}} = \\dfrac{${e.p}\\cdot ${e.N / e.q}}{${e.q}\\cdot ${e.N / e.q}} = \\dfrac{${e.p * e.N / e.q}}{${e.N}}`, right: "" }]))) };
    } },
    { key: "zeichnen", teil: "A", afb: 1, titel: "Brüche darstellen", baue: () => {
      const [R, C] = choice([[3, 4], [2, 6], [4, 5], [3, 5], [2, 5]]); const n = R * C; let z; do { z = randInt(1, n - 1); } while (gcd(z, n) === 1);
      const gg = gcd(z, n), w = 24;
      let svg = `<svg viewBox="0 0 ${C * w + 4} ${R * w + 4}" width="${C * w + 4}" height="${R * w + 4}" xmlns="http://www.w3.org/2000/svg">`;
      for (let i = 0; i < n; i++) svg += `<rect x="${2 + (i % C) * w}" y="${2 + Math.floor(i / C) * w}" width="${w}" height="${w}" fill="${i < z ? "#93c5fd" : "white"}" stroke="#334155"/>`;
      svg += "</svg>";
      return { kontext: "", teile: [
        papierTeil(`${T(`✏️ Zeichne ein Rechteck aus ${R} · ${C} Kästchen und färbe`)}\\;\\dfrac{${z / gg}}{${n / gg}}\\;${T("davon ein.")}`, [
          { text: `Rechteck aus ${n} Kästchen`, punkte: 1 }, { text: `genau ${z} Kästchen gefärbt (${z / gg}/${n / gg} = ${z}/${n})`, punkte: 1 }],
          [{ left: `\\dfrac{${z / gg}}{${n / gg}} = \\dfrac{${z}}{${n}}`, right: "" }], svg),
        autoTeil(`${T("Welcher Anteil der Kästchen bleibt weiß? (vollständig gekürzt)")}`, [{ label: "weißer Anteil", kind: "fraction", answer: (() => { const g2 = gcd(n - z, n); return { num: (n - z) / g2, den: n / g2 }; })() }],
          [{ left: `1 - \\dfrac{${z}}{${n}} = \\dfrac{${n - z}}{${n}} = ${bruchTex(n - z, n)}`, right: "" }])
      ] };
    } },
    { key: "ordnen", teil: "A", afb: 2, titel: "Brüche ordnen", baue: () => {
      let fr; do { fr = [0, 1, 2].map(() => { let p, q; do { q = choice([3, 4, 5, 6, 8, 9, 10, 12]); p = randInt(1, q - 1); } while (gcd(p, q) !== 1); return [p, q]; }); }
      while (new Set(fr.map(([p, q]) => p / q)).size < 3 || new Set(fr.map((f) => f[1])).size < 3);
      const txt = fr.map(([p, q]) => `${p}/${q}`), sortiert = fr.slice().sort((a, b) => a[0] / a[1] - b[0] / b[1]);
      const L = fr.reduce((l, [, q]) => (l * q) / gcd(l, q), 1);
      return { kontext: `${T("Gegeben sind die Brüche")}\\;\\; ${fr.map(([p, q]) => `\\dfrac{${p}}{${q}}`).join("\\,,\\;")}`, teile: [
        autoTeil(T("Welcher Bruch ist am größten?"), [{ label: "größter Bruch", kind: "choice", choices: txt, answer: `${sortiert[2][0]}/${sortiert[2][1]}` }],
          [{ label: `Gleichnamig machen (Hauptnenner ${L})` }, { left: fr.map(([p, q]) => `\\dfrac{${p}}{${q}} = \\dfrac{${p * L / q}}{${L}}`).join("\\,,\\;"), right: "" }]),
        autoTeil(T("Welcher Bruch ist am kleinsten?"), [{ label: "kleinster Bruch", kind: "choice", choices: txt, answer: `${sortiert[0][0]}/${sortiert[0][1]}` }],
          [{ left: sortiert.map(([p, q]) => `\\dfrac{${p}}{${q}}`).join(" < "), right: "" }]),
        papierTeil(T("✏️ Ordne alle drei Brüche der Größe nach und erkläre, wie du vorgegangen bist."), [
          { text: "Auf einen gemeinsamen Nenner gebracht (oder in Dezimalzahlen umgewandelt)", punkte: 1 }, { text: "Richtige Reihenfolge", punkte: 1 }],
          [{ left: sortiert.map(([p, q]) => `\\dfrac{${p}}{${q}}`).join(" < "), right: "" }])
      ] };
    } },
    { key: "torte", teil: "A", afb: 1, titel: "Brüche als Tortenstücke", baue: () => {
      const a = stufenTeil("brueche", 10, (t) => t.subtype === "zweiFarben"), b = stufenTeil("brueche", 10, (t) => t.subtype === "vergleichen");
      return { kontext: "", graph: tortenReihe([{ n: a.task.data.n, farben: Array.from({ length: a.task.data.n }, (_, i) => (i < a.task.data.b ? TORTE_BLAU : i < a.task.data.b + a.task.data.r ? TORTE_ROT : null)), name: "a)", gr: 110 }, { n: b.task.data.n1, farben: gefaerbt(b.task.data.n1, b.task.data.k1), name: "A", gr: 110 }, { n: b.task.data.n2, farben: gefaerbt(b.task.data.n2, b.task.data.k2), name: "B", gr: 110 }]), teile: [Object.assign(a, { text: T("Erste Torte (blau und rot): ") + a.text }), Object.assign(b, { text: T("Torten A und B: ") + b.text })] };
    } },
    { key: "zahlenstrahl", teil: "A", afb: 1, titel: "Brüche am Zahlenstrahl", baue: () => {
      for (;;) {
        const N = choice([4, 6, 8, 10, 12]), T2 = 2 * N;
        const pos = new Set([randInt(1, N - 1), randInt(N + 1, T2 - 1)]); while (pos.size < 4) { const x = randInt(1, T2 - 1); if (x !== N) pos.add(x); }
        const P = [...pos].sort((a, b) => a - b), Bu = ["A", "B", "C", "D"];
        // c) ein Buchstabe, dessen Bruch sich kürzen lässt (Nenner der Frage ≠ Einteilung)
        const kand = P.map((x, j) => ({ x, j })).filter((o) => o.j > 0 && o.j < 3 && gcd(o.x, N) > 1 && o.x % N !== 0);
        if (!kand.length) continue;
        const c = choice(kand), cg = gcd(c.x, N), A = P[0], D = P[3];
        const dG = Math.floor(D / N), dr = D % N;
        const svg = zahlenstrahlSVG({ T: T2, N, labels: ganzeLabels(0, N, T2), pfeile: P.map((i, j) => ({ i, text: Bu[j] })) });
        const satz = choice([[[1, 3], [3, 4], [5, 6]], [[2, 3], [1, 4], [1, 6]], [[1, 2], [5, 6], [1, 4]], [[3, 4], [1, 6], [2, 3]]]).slice().sort((u, v) => u[0] / u[1] - v[0] / v[1]);
        const zw = satz.map(([z, n]) => z * 12 / n);
        const loes = zahlenstrahlSVG({ T: 12, N: 12, labels: [{ i: 0, text: "0" }, { i: 12, text: "1" }].concat(satz.map(([z, n], j) => ({ i: zw[j], num: z, den: n }))) });
        return { kontext: T(`Der Zahlenstrahl ist von 0 bis 2 in gleich große Teile eingeteilt.`), graph: svg, teile: [
          autoTeil(T("Welcher Bruch gehört zu A? (vollständig gekürzt)"), [{ label: "Bruch bei A", kind: "fraction", answer: { num: A / gcd(A, N), den: N / gcd(A, N) } }],
            [{ label: `Von 0 bis 1 sind es ${N} Teile, bis A sind es ${A}` }, { left: `\\dfrac{${A}}{${N}}${gcd(A, N) > 1 ? ` = ${bruchTex(A, N)}` : ""}`, right: "" }]),
          autoTeil(T("Welche Zahl gehört zu D? Gib sie als unechten Bruch an (vollständig gekürzt)."), [{ label: "Zahl bei D", kind: "fraction", answer: { num: D / gcd(D, N), den: N / gcd(D, N) } }],
            [{ label: `${dG} Ganzes und ${dr} weitere Teile` }, { left: `${gemTex(dG, dr, N)} = \\dfrac{${D}}{${N}}${gcd(D, N) > 1 ? ` = ${bruchTex(D, N)}` : ""}`, right: "" }]),
          autoTeil(`${T("Bei welchem Buchstaben liegt")}\\;\\; \\dfrac{${c.x / cg}}{${N / cg}}\\;${T("?")}`, [{ label: "Buchstabe", kind: "choice", choices: Bu, answer: Bu[c.j] }],
            [{ label: `Auf den Nenner ${N} erweitern` }, { left: `\\dfrac{${c.x / cg}}{${N / cg}} = \\dfrac{${c.x}}{${N}} \\;\\Rightarrow\\; ${T("Buchstabe " + Bu[c.j])}`, right: "" }]),
          papierTeil(`${T("✏️ Zeichne einen Zahlenstrahl von 0 bis 1 (Länge 12 cm) und trage")}\\;\\; ${satz.map(([z, n]) => `\\dfrac{${z}}{${n}}`).join(",\\; ")}\\;\\; ${T("ein.")}`, [
            { text: "Sinnvolle Einteilung: 12 cm = 12 Teile, 1 cm entspricht 1/12", punkte: 1 }, { text: satz.map(([z, n], j) => `${z}/${n} bei ${zw[j]} cm`).join(", "), punkte: 2 }],
            [{ label: "Gemeinsamer Nenner der drei Brüche ist 12" }, { left: satz.map(([z, n], j) => `\\dfrac{${z}}{${n}} = \\dfrac{${zw[j]}}{12}`).join(",\\; "), right: "" }], loes)
        ] };
      }
    } },
    { key: "rechnen", teil: "A", afb: 2, titel: "Addieren und subtrahieren", baue: () => {
      const mk = (op, gleich) => { let a, b, c, d, n, D;
        do { b = randInt(3, 12); d = gleich ? b : choice([2, 3, 4, 5, 6, 8, 9, 10, 12].filter((x) => x !== b)); a = randInt(1, b - 1); c = randInt(1, d - 1);
          n = op === "+" ? a * d + c * b : a * d - c * b; D = b * d; } while (n <= 0);
        const L = (b * d) / gcd(b, d), z1 = a * L / b, z2 = c * L / d, zr = op === "+" ? z1 + z2 : z1 - z2, g = gcd(zr, L);
        return autoTeil(`${T("Berechne und kürze vollständig:")}\\;\\; \\dfrac{${a}}{${b}} ${op} \\dfrac{${c}}{${d}}`, [{ label: "Ergebnis", kind: "fraction", answer: { num: zr / g, den: L / g }, punkte: gleich ? 1 : 2 }],
          (gleich ? [] : [{ label: `Gleichnamig machen: kgV von ${b} und ${d} ist ${L}` }]).concat([
            { left: `\\dfrac{${z1}}{${L}} ${op} \\dfrac{${z2}}{${L}} = \\dfrac{${zr}}{${L}}${g > 1 ? ` = \\dfrac{${zr / g}}{${L / g}}` : ""}`, right: "" }])); };
      return { kontext: "", teile: [mk("+", true), mk("+", false), mk("-", false)] };
    } },
    { key: "gemischt", teil: "A", afb: 1, titel: "Gemischte Zahlen und Dezimalbrüche", baue: () => ({ kontext: "", teile: [
      stufenTeil("brueche", 5, (t) => t.subtype === "zuUnecht"), stufenTeil("brueche", 5, (t) => t.subtype === "zuGemischt"), stufenTeil("brueche", 8, (t) => t.subtype === "zuDezimal"), stufenTeil("brueche", 8, (t) => t.subtype === "art")] }) },
    { key: "punktrechnung", teil: "A", afb: 2, titel: "Multiplizieren und dividieren", baue: () => ({ kontext: "", teile: [
      stufenTeil("brueche", 7, (t) => t.subtype === "malBruch"), stufenTeil("brueche", 7, (t) => t.subtype === "durchBruch"), stufenTeil("brueche", 7, (t) => t.subtype === "gemischt")] }) },
    { key: "fehler", teil: "A", afb: 3, titel: "Fehler finden", baue: () => {
      const pool = [
        () => { let a, b, c, d; do { b = randInt(2, 6); d = randInt(2, 6); a = randInt(1, b - 1); c = randInt(1, d - 1); } while (b === d);
          const n = a * d + c * b, D = b * d, g = gcd(n, D);
          return fehlerTeil(`${T("Ben rechnet:")}\\;\\; \\dfrac{${a}}{${b}} + \\dfrac{${c}}{${d}} = \\dfrac{${a + c}}{${b + d}}`,
            ["Zähler und Nenner wurden einzeln addiert – man muss erst gleichnamig machen.", "Er hätte die Nenner multiplizieren und die Zähler addieren müssen.", "Die Rechnung ist richtig."],
            { label: "richtiges Ergebnis (gekürzt)", kind: "fraction", answer: { num: n / g, den: D / g } },
            [{ left: `\\dfrac{${a * d}}{${D}} + \\dfrac{${c * b}}{${D}} = \\dfrac{${n}}{${D}} = ${bruchTex(n, D)}`, right: "" }]); },
        () => { let p, q; do { q = randInt(2, 7); p = randInt(1, q - 1); } while (gcd(p, q) !== 1); const k = randInt(2, 5);
          return fehlerTeil(`${T("Lea erweitert mit " + k + ":")}\\;\\; \\dfrac{${p}}{${q}} = \\dfrac{${p}}{${q * k}}`,
            ["Beim Erweitern muss auch der Zähler mit derselben Zahl multipliziert werden.", "Sie hätte den Nenner durch " + k + " teilen müssen.", "Die Rechnung ist richtig."],
            { label: "richtiger Zähler", kind: "number", answer: p * k }, [{ left: `\\dfrac{${p}}{${q}} = \\dfrac{${p}\\cdot ${k}}{${q}\\cdot ${k}} = \\dfrac{${p * k}}{${q * k}}`, right: "" }]); },
        () => { const [a, b] = echterBruch(9), [c, d] = echterBruch(9); const g = fr(a * d, b * c);
          return fehlerTeil(`${T("Paul rechnet:")}\\;\\; \\dfrac{${a}}{${b}} : \\dfrac{${c}}{${d}} = \\dfrac{${a * c}}{${b * d}}`, ["Er hat nicht mit dem Kehrwert multipliziert.", "Er hätte die Zähler addieren müssen.", "Die Rechnung ist richtig."],
            { label: "richtiges Ergebnis (gekürzt)", kind: "fraction", answer: g }, [{ left: `\\dfrac{${a}}{${b}}\\cdot \\dfrac{${d}}{${c}} = \\dfrac{${a * d}}{${b * c}} = ${frTex(g.num, g.den)}`, right: "" }]); },
        () => aussageTeil(T("Ida behauptet: „Beim Multiplizieren mit einem Bruch wird das Ergebnis immer größer.“"), false, ["Mit einem echten Bruch (kleiner als 1) wird das Ergebnis kleiner: 6 · 1/2 = 3.", "Stimmt, Multiplizieren macht immer größer.", "Stimmt nur bei gleichnamigen Brüchen."]),
        () => { let a, b, c, d; do { b = choice([3, 4, 5, 6]); d = b * 2; a = randInt(1, b - 1); c = randInt(1, d - 1); } while (!(a * d > c * b) || gcd(a, b) !== 1);
          return aussageTeil(`${T("Tom behauptet: „")}\\dfrac{${a}}{${b}} < \\dfrac{${c}}{${d}}${T(", weil " + b + " kleiner als " + d + " ist.“")}`, false,
            [`Der Nenner allein entscheidet nicht: ${a}/${b} = ${a * 2}/${d} ist größer als ${c}/${d}.`, "Stimmt, ein kleinerer Nenner bedeutet immer einen kleineren Bruch.", "Stimmt, weil auch der Zähler kleiner ist."]); }
      ];
      return { kontext: "", teile: mische(pool).slice(0, 2).map((f) => f()) };
    } },
    { key: "sach", teil: "A", afb: 2, titel: "Brüche im Alltag", baue: () => {
      const a = stufenTeil("brueche", 4, (t) => t.subtype.startsWith("vergleich")), b = stufenTeil("brueche", 4, (t) => t.subtype.startsWith("anteil"));
      return { kontext: "", teile: [a, b] };
    } }
  ];

  KA_VORLAGEN.brueche = KA_BRUECHE;
  KA_INFO.brueche = { klasse: "Kl. 6", tr: false };
  Object.assign(ERKL, {
    "brueche/1": E("Brüche vergleichen",
      [T("Gleicher Nenner: Der Bruch mit dem größeren Zähler ist größer."), T("Gleicher Zähler: Der Bruch mit dem KLEINEREN Nenner ist größer (größere Stücke)."), T("Sonst: einen Bruch erweitern oder kürzen und dann vergleichen.")],
      [{ left: `\\dfrac{3}{5} < \\dfrac{4}{5}\\,, \\qquad \\dfrac{2}{3} > \\dfrac{2}{7}\\,, \\qquad \\dfrac{1}{2} = \\dfrac{3}{6}`, right: "" }],
      [T("Bei gleichem Zähler denken, ein größerer Nenner mache den Bruch größer.")], "kaestchen"),
    "brueche/2": E("Ungleichnamige Brüche vergleichen",
      [T("1. kgV der Nenner bestimmen (Primfaktorzerlegung: höchste Potenz je Primfaktor)."), T("2. Beide Brüche auf diesen Nenner erweitern."), T("3. Zähler vergleichen.")],
      [{ left: `6 = 2\\cdot 3,\\; 8 = 2^{3} \\;\\Rightarrow\\; ${T("kgV")} = 2^{3}\\cdot 3 = 24`, right: "" }, { left: `\\dfrac{5}{6} = \\dfrac{20}{24}\\,,\\;\\; \\dfrac{7}{8} = \\dfrac{21}{24} \\;\\Rightarrow\\; \\dfrac{5}{6} < \\dfrac{7}{8}`, right: "" }],
      [T("Das Produkt der Nenner nehmen: Das ist ein gemeinsames Vielfaches, aber oft nicht das kleinste.")]),
    "brueche/3": E("Brüche kürzen mit dem ggT",
      [T("ggT: gemeinsame Primfaktoren, jeweils die niedrigste Potenz."), T("Zähler und Nenner durch den ggT teilen – dann ist der Bruch vollständig gekürzt.")],
      [{ left: `24 = 2^{3}\\cdot 3,\\; 36 = 2^{2}\\cdot 3^{2} \\;\\Rightarrow\\; ${T("ggT")} = 2^{2}\\cdot 3 = 12`, right: "" }, { left: `\\dfrac{24}{36} = \\dfrac{24 : 12}{36 : 12} = \\dfrac{2}{3}`, right: "" }],
      [T("Nur mit einem gemeinsamen Teiler kürzen und dann aufhören (12/18 statt 2/3).")]),
    "brueche/4": E("Brüche im Alltag",
      [T("Anteil = Teil : Ganzes, danach vollständig kürzen."), T("Achtung, was das Ganze ist: Schorle = Saft + Wasser; ein Tag = 24 Stunden; 1 kg = 1000 g."),
       T("Fragt die Aufgabe nach dem Rest (übrig, frei, ohne …), erst Ganzes − Teil rechnen.")],
      [{ left: T("8 von 20 Kindern fahren Rad: 8/20 = 2/5.   Ohne Rad: (20 − 8)/20 = 12/20 = 3/5"), right: "" }],
      [T("Teil durch Rest statt durch das Ganze teilen (Saft : Wasser statt Saft : Gesamtmenge)."), T("Bei „weniger ist besser“ (Fehler, Verspätungen) den größeren Anteil wählen.")])
  });
  Object.assign(DIAG, {
    "brueche/1": (t, i, w, raw) => {
      const d = t.data;
      if (d.mode === "expanded") return H.vielleichtGleich;
      if (d.mode === "sameNum") {
        const naiv = d.b > d.d ? ">" : "<"; // Nenner wie normale Zahlen verglichen
        if (raw === naiv) return H.gleicherZaehler;
      }
      return null;
    },
    "brueche/2": (t, i, w, raw) => {
      const d = t.data;
      if (i === 0) {
        if (nah(w.v, gcd(d.b, d.d))) return H.ggtStattKgv;
        if (w.v > d.lcm && w.v % d.b === 0 && w.v % d.d === 0) return H.nichtKleinstes;
      } else if (d.aNew === d.cNew && raw !== "=") return H.vielleichtGleich;
      return null;
    },
    "brueche/3": (t, i, w) => {
      const d = t.data;
      if (i === 0 && Number.isInteger(w.v) && w.v > 1 && w.v < d.k && d.a % w.v === 0 && d.b % w.v === 0) return H.nichtGroesster;
      return null;
    },
    "brueche/4": (t, i, w, raw, inputs) => {
      const d = t.dataExtra, kind = t.fieldKinds[i];
      if (kind === "fraction") {
        if (d.kind === "anteil" && d.rest && nah(w.v, d.a / d.b)) return H.rest;
        if (d.kind === "vergleich") {
          const s = d.s[i];
          if (d.rest && nah(w.v, s.a / s.b)) return H.rest;
          if (d.ganzesVersteckt && nah(w.v, s.a / (s.b - s.a))) return H.saftWasser;
        }
      } else if (kind === "choice" && d.besser === "weniger") {
        // Anteile selbst richtig, aber den größeren gewählt
        const okFr = [0, 1].every((j) => { const x = wertVon(inputs[j]); return x && nah(x.v, t.answer[j].num / t.answer[j].den); });
        if (okFr) return H.weniger;
      }
      return null;
    },
  });
