


// ============================================================
// logic.js -- Reine Rechenlogik für das Mathe-Übungstool.
// (1:1 identisch zur separat mit 16000 Testaufgaben geprüften Version --
// siehe Testprotokoll in der Projekt-Antwort.)
// ============================================================
(function (root) {
  "use strict";

  // ---------- Hilfsfunktionen ----------
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function choice(arr) {
    return arr[randInt(0, arr.length - 1)];
  }
  function round2(x) {
    return Math.round(x * 100) / 100;
  }
  function round4(x) {
    return Math.round(x * 10000) / 10000;
  }
  function fmtNum(x) {
    return String(x).replace(".", ",");
  }
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a;
  }
  function parseUserNumber(str) {
    if (typeof str !== "string") return NaN;
    const cleaned = str.trim().replace(/\s+/g, "").replace(/^\+/, "").replace(/^[−–]/, "-").replace(",", ".");
    if (cleaned === "" || cleaned === "-" ) return NaN;
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return NaN;
    return parseFloat(cleaned);
  }
  function parseUserFraction(str) {
    if (typeof str !== "string") return null;
    const cleaned = str.trim().replace(/\s+/g, "").replace(/^\+/, "").replace(/^[−–]/, "-");
    if (cleaned === "") return null;
    const m = cleaned.match(/^(-?\d+)\/(-?\d+)$/);
    if (m) {
      const num = parseInt(m[1], 10);
      const den = parseInt(m[2], 10);
      if (den === 0) return null;
      return { num, den };
    }
    const n = parseUserNumber(cleaned);
    if (!isNaN(n)) return { num: n, den: 1 };
    return null;
  }
  function fractionsEqual(f1, f2, tol) {
    tol = tol || 1e-9;
    return Math.abs(f1.num * f2.den - f2.num * f1.den) < tol * Math.max(1, Math.abs(f1.den * f2.den));
  }
  function numbersClose(a, b, tol) {
    tol = tol === undefined ? 0.05 : tol;
    return Math.abs(a - b) <= tol;
  }
  // Basis für die Anzeige direkt vor einem Exponenten: negative Zahlen IMMER
  // in Klammern setzen, sonst wäre "-9^2" mathematisch mehrdeutig
  // (Konvention: -9^2 = -(9^2) = -81, aber gemeint ist (-9)^2 = 81).
  function baseStr(a) {
    return a < 0 ? `(${a})` : `${a}`;
  }
  // Koeffizient vor einer Variable konventionell darstellen: "1x" -> "x",
  // "-1x" -> "-x", sonst normale Zahl davor.
  function coefX(m, varName) {
    varName = varName || "x";
    if (m === 1) return varName;
    if (m === -1) return "-" + varName;
    return `${m}${varName}`;
  }
  // Rechenweg beginnt mit der Aufgabe in genau der gegebenen Form (danach erst Ablesen/Umformen)
  function mitAusgang(stepsFn) { const f = (task) => [{ left: task.prompt, right: "" }].concat(stepsFn(task)); f.mitAusgang = true; return f; }
  // Abschnitte für die Tipp-Funktion (eine Quelle für App UND Tests):
  //  1. Gliederung nach Überschriften (label); eine vorangestellte Aufgabe gehört zum ersten Abschnitt.
  //  2. Ergibt das weniger als zwei Abschnitte: Schritt für Schritt (Hinweis, Zwischenschritte …).
  //  3. Ein Schlussabschnitt ohne Rechenzeile wird angehängt – das Ergebnis bleibt immer dem
  //     letzten Abschnitt vorbehalten (= erst mit „Rechenweg zeigen“ sichtbar).
  function tippAbschnitte(task, alle) {
    const istAufgabe = (x) => x && x.left === task.prompt;
    const schluss = (ab) => { while (ab.length > 1 && !ab[ab.length - 1].some((x) => x.left)) { const r = ab.pop(); ab[ab.length - 1].push(...r); } return ab; };
    const mitL = alle.some((s) => s.label);
    let ab = [];
    alle.forEach((s) => { const nurA = ab.length === 1 && ab[0].length === 1 && istAufgabe(ab[0][0]); if (!ab.length || ((mitL ? s.label : true) && !nurA)) ab.push([]); ab[ab.length - 1].push(s); });
    ab = schluss(ab);
    if (ab.length < 2) {
      ab = [];
      alle.forEach((s) => { if (ab.length === 1 && ab[0].length === 1 && istAufgabe(ab[0][0])) ab[0].push(s); else ab.push([s]); });
      ab = schluss(ab);
    }
    return ab;
  }
