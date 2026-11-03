  // ============================================================
  // FEHLERDIAGNOSE: erkennt typische Denkfehler und gibt einen gezielten
  // Hinweis pro falschem Feld. Die Hinweise enthalten bewusst KEINE
  // konkreten Zahlen, damit sie die Lösung nicht verraten.
  // ============================================================
  const H = {
    vorzeichen: "Fast! Prüfe das Vorzeichen.",
    kehrwert: "Zähler und Nenner vertauscht?",
    ungekuerzt: "Der Wert stimmt, aber der Bruch ist noch nicht vollständig gekürzt.",
    prozent: "Prozent und Dezimalzahl verwechselt? Achte darauf, in welcher Form gefragt ist.",
    rundung: "Knapp daneben – prüfe die Rundung oder rechne mit mehr Nachkommastellen weiter.",
    alsBruch: "Fast – das ist eine gerundete Dezimalzahl. Gib das Ergebnis als exakten Bruch an.",
    aufrunden: "„Erstmals“ heißt: auf die nächste ganze Zahl aufrunden.",
    expAddieren: "Bei gleicher Basis werden beim Multiplizieren die Exponenten addiert, nicht multipliziert.",
    expSubtrahieren: "Beim Dividieren mit gleicher Basis werden die Exponenten subtrahiert.",
    expMultiplizieren: "Potenz einer Potenz: Exponenten multiplizieren, nicht addieren.",
    wurzelTeilen: "Eine Wurzel entspricht einem Bruch im Exponenten: Exponent durch den Wurzelgrad teilen.",
    potenzNichtMal: "Potenzieren heißt, die Basis mehrfach mit sich selbst zu multiplizieren – nicht Basis mal Exponent.",
    nullExponent: "Jede Zahl (außer 0) hoch 0 ergibt 1.",
    negExpKehrwert: "Negativer Exponent heißt Kehrwert: a⁻ⁿ = 1/aⁿ.",
    negExpNichtNegativ: "Ein negativer Exponent macht das Ergebnis nicht negativ, sondern bildet den Kehrwert.",
    logExponent: "Der Logarithmus fragt nach dem Exponenten: Die Basis hoch wie viel ergibt die Zahl?",
    koeffMal: "Die Zahlen vor den Variablen werden multipliziert, nicht addiert.",
    koeffGeteilt: "Die Zahlen vor den Variablen werden dividiert, nicht subtrahiert.",
    koeffPotenz: "Der Koeffizient wird mit potenziert: cⁿ, nicht c · n.",
    wurzelHaelfte: "Die Wurzel ist nicht die Hälfte (bzw. ein Drittel): Gesucht ist die Zahl, die mit sich selbst multipliziert die Zahl unter der Wurzel ergibt.",
    wurzelProdukt: "√a · √b = √(a · b): Unter der Wurzel wird multipliziert.",
    umProzent: "Bei „um x %“ kommt x/100 zur 1 dazu (Zunahme) bzw. wird von 1 abgezogen (Abnahme).",
    zuAb: "Zunahme und Abnahme verwechselt? Zunahme: 1 + p/100, Abnahme: 1 − p/100.",
    aufProzent: "Bei „auf x %“ ist der Faktor direkt x/100 – nichts dazuzählen oder abziehen.",
    logStatt: "x steht im Exponenten – dafür braucht man den Logarithmus, nicht das Teilen.",
    ganzeZahl: "Hier ist eine ganze Zahl gesucht: ab welcher vollen Einheit?",
    genauerWert: "Hier ist der genaue Wert auf 2 Nachkommastellen gesucht, nicht eine gerundete ganze Zahl.",
    faktorStattRendite: "Das ist der Wachstumsfaktor. Rendite in % = (Faktor − 1) · 100.",
    ohneZinseszins: "Das wäre ohne Zinseszins. Bei jährlicher Verzinsung wächst auch der Zuwachs mit.",
    malJahre: "Nicht mit der Anzahl der Jahre multiplizieren: Der Faktor wird hoch die Anzahl der Jahre genommen.",
    senkrecht: "Senkrechte Gerade: negativer Kehrwert −1/m₁ – nicht nur das Vorzeichen ändern.",
    senkrechtGleich: "Gleiche Steigung haben Parallelen. Für eine Senkrechte gilt m₂ = −1/m₁.",
    parallel: "Parallele Geraden haben dieselbe Steigung.",
    bUmstellen: "Beim Umstellen nach b: b = y − m · x.",
    gleicherZaehler: "Gleicher Zähler: Je größer der Nenner, desto kleiner die Teile – also desto kleiner der Bruch.",
    vielleichtGleich: "Erweitere einen der Brüche – vielleicht sind beide gleich groß.",
    nichtKleinstes: "Das ist ein gemeinsames Vielfaches, aber nicht das kleinste.",
    ggtStattKgv: "Das ist der ggT – gesucht ist das kleinste gemeinsame Vielfache.",
    nichtGroesster: "Das ist ein gemeinsamer Teiler, aber nicht der größte.",
    rest: "Gefragt ist der Rest (übrig/frei/ohne …), nicht der genannte Teil.",
    saftWasser: "Anteil = Teil : Ganzes. Das Ganze ist hier Saft + Wasser zusammen.",
    weniger: "Achtung: Hier ist der kleinere Anteil der bessere!",
    abrunden: "Volle Kilometer, die man noch bezahlen kann: abrunden, nicht aufrunden.",
    dauerStattUhrzeit: "Das ist die Dauer – gefragt ist die Uhrzeit.",
    vertauscht: "Die beiden Werte vertauscht?",
    tagNichtAddieren: "Jeden Tag wird mit derselben Zahl multipliziert – die Anzahl wächst als Potenz, nicht durch Addition.",
    schachExp: "Feld 1 hat 2⁰ = 1 Korn – der Exponent ist immer eins kleiner als die Feldnummer.",
    dritteWurzel: "Würfelvolumen = Kante³: die dritte Wurzel ziehen, nicht durch 3 teilen.",
    einheiten: "Achte auf die Einheiten: 1 GB = 1000 MB.",
    kaufkraft: "Die Preise steigen um p %: Das Geld ist daher (1 + p/100)ⁿ-mal weniger wert – durch diesen Faktor teilen."
  };
  const nah = (v, x, rel) => Math.abs(v - x) <= (rel || 1e-9) * Math.max(1, Math.abs(x));
  // Mehrere typische Fehler können zufällig fast dasselbe Ergebnis liefern:
  // nimm den Hinweis, dessen Fehlerwert am nächsten an der Eingabe liegt.
  // kandidaten: [[fehlerwert, hinweis], ...], rel: erlaubte relative Abweichung
  function naechsterHinweis(v, kandidaten, rel) {
    const k = kandidaten.filter(([x]) => isFinite(x)).map(([x, h]) => [Math.abs(v - x) / Math.max(1, Math.abs(x)), h])
      .filter(([abw]) => abw <= rel).sort((p, q) => p[0] - q[0]);
    return k.length ? k[0][1] : null;
  }
  function wertVon(input) {
    const f = parseUserFraction(typeof input === "string" ? input : String(input));
    if (!f) return null;
    return { v: f.num / f.den, num: f.num, den: f.den };
  }

  // Stufenspezifische Regeln: (task, idx, w) -> Hinweis oder null; w = {v, num, den}
  const DIAG = {};

  function diagnose(task, inputs, fieldErrors) {
    const out = {};
    const key = task.topic + "/" + task.level;
    (fieldErrors || []).forEach((i) => {
      const raw = inputs[i];
      const isChoice = (task.fieldKinds && task.fieldKinds[i] === "choice") || task.fieldType === "choice" || (task.perFieldType && task.perFieldType[i] === "choice") || task.fieldType === "select";
      const w = isChoice ? { v: NaN } : wertVon(raw);
      if (!isChoice && (!w || raw === "" || raw === undefined)) return;
      let msg = null;
      try { if (DIAG[key]) msg = DIAG[key](task, i, w, raw, inputs); } catch (e) { msg = null; }
      if (!msg && !isChoice) {
        const a = task.answer[i];
        const av = a && typeof a === "object" ? a.num / a.den : a;
        if (typeof av !== "number") return;
        const strengGekuerzt = (task.fieldKinds && task.fieldKinds[i] === "fraction") || key === "brueche/3";
        const tol = (task.tolerances && task.tolerances[i]) || task.tolerance || 0;
        if (strengGekuerzt && nah(w.v, av) && gcd(w.num, w.den) > 1) msg = H.ungekuerzt;
        else if (av !== 0 && nah(w.v, -av)) msg = H.vorzeichen;
        else if (av !== 0 && Math.abs(av) !== 1 && nah(w.v, 1 / av)) msg = H.kehrwert;
        else if (av !== 0 && (nah(w.v, av * 100) || nah(w.v, av / 100))) msg = H.prozent;
        else if (tol > 0 && Math.abs(w.v - av) <= Math.max(5 * tol, 0.02)) msg = H.rundung;
        else if (a && typeof a === "object" && a.den !== 1 && w.den === 1 && !Number.isInteger(w.v) && Math.abs(w.v - av) <= 0.01) msg = H.alsBruch;
      }
      if (msg) out[i] = msg;
    });
    return out;
  }
  const DIAG_HINWEISE = H;

