  // ============================================================
  // RECHENZEILEN: freie Eingabe von Gleichungen (z. B. "2x^2 - 2 = -24")
  // Nur Zahlen, x, + − · / ^ ² ³ und Klammern; Malpunkt darf fehlen ("2x", "3(x+1)").
  // ============================================================
  function termParser(str) {
    const s = String(str).replace(/[−–]/g, "-").replace(/[·×∙*]/g, "*").replace(/:/g, "/").replace(/X/g, "x").replace(/\s+/g, "");
    let i = 0;
    const fehler = () => { throw new Error("unlesbar"); };
    function zahl() { const m = s.slice(i).match(/^\d+([.,]\d+)?/); if (!m) fehler(); i += m[0].length; const v = parseFloat(m[0].replace(",", ".")); return () => v; }
    function atom() {
      if (s[i] === "(") { i++; const e = summe(); if (s[i] !== ")") fehler(); i++; return e; }
      if (s[i] === "x") { i++; return (x) => x; }
      if (/\d/.test(s[i] || "")) return zahl();
      fehler();
    }
    function potenz() {
      let b = atom();
      for (;;) {
        if (s[i] === "²" || s[i] === "³") { const e = s[i] === "²" ? 2 : 3; i++; const bb = b; b = (x) => Math.pow(bb(x), e); continue; }
        if (s[i] === "^") { i++; let e; if (s[i] === "(") e = atom(); else { const neg = s[i] === "-"; if (neg) i++; const z = zahl(); e = neg ? (x) => -z(x) : z; } const bb = b, ee = e; b = (x) => Math.pow(bb(x), ee(x)); continue; }
        return b;
      }
    }
    function vorzeichen() { if (s[i] === "-") { i++; const f = vorzeichen(); return (x) => -f(x); } if (s[i] === "+") { i++; return vorzeichen(); } return potenz(); }
    function produkt() {
      let f = vorzeichen();
      for (;;) {
        const c = s[i];
        if (c === "*" || c === "/") { i++; const g = vorzeichen(), ff = f; f = c === "*" ? (x) => ff(x) * g(x) : (x) => ff(x) / g(x); continue; }
        if (c === "(" || c === "x" || /\d/.test(c || "")) { const g = potenz(), ff = f; f = (x) => ff(x) * g(x); continue; } // Malpunkt weggelassen
        return f;
      }
    }
    function summe() {
      let f = produkt();
      while (s[i] === "+" || s[i] === "-") { const c = s[i]; i++; const g = produkt(), ff = f; f = c === "+" ? (x) => ff(x) + g(x) : (x) => ff(x) - g(x); }
      return f;
    }
    if (!s) fehler();
    const f = summe();
    if (i !== s.length) fehler();
    return f;
  }
  // Polynomkoeffizienten [c0..c4] von f aus Funktionswerten; null, wenn f kein Polynom bis Grad 4 ist
  function polyAusWerten(f) {
    const xs = [-2, -1, 0, 1, 2], ys = xs.map(f);
    if (ys.some((y) => !isFinite(y))) return null;
    // Newton-Interpolation, dann in Monome umrechnen
    const n = 5, a = ys.slice();
    for (let j = 1; j < n; j++) for (let k = n - 1; k >= j; k--) a[k] = (a[k] - a[k - 1]) / (xs[k] - xs[k - j]);
    let c = [0, 0, 0, 0, 0];
    for (let k = n - 1; k >= 0; k--) { // c = c·(x − xs[k]) + a[k]
      const neu = [0, 0, 0, 0, 0];
      for (let d = 0; d < 4; d++) { neu[d + 1] += c[d]; neu[d] -= c[d] * xs[k]; }
      neu[0] += a[k]; c = neu;
    }
    const p = (x) => c.reduce((s, k, d) => s + k * Math.pow(x, d), 0);
    for (const x of [3, -3, 0.5, 7]) { const y = f(x); if (!isFinite(y) || Math.abs(y - p(x)) > 1e-6 * Math.max(1, Math.abs(y))) return null; }
    return c.map((k) => (Math.abs(k) < 1e-9 ? 0 : k));
  }
  // Ergebnis einer Zeile "x = 3/4" (auch "3/4 = x" oder nur "3/4") als Text für die normale Prüfung; sonst null
  function zeilenErgebnis(zeile) {
    const z = String(zeile || "").replace(/[−–]/g, "-").replace(/\s+/g, "");
    const zahlRe = /^-?\d+([.,]\d+)?(\/-?\d+([.,]\d+)?)?$/;
    let r = null;
    if (zahlRe.test(z)) r = z;
    else { const m = z.match(/^x=(.+)$/i) || z.match(/^(.+)=x$/i); if (m && zahlRe.test(m[1])) r = m[1]; }
    if (r === null) return null;
    const [zz, nn] = r.split("/"), v = parseFloat(zz.replace(",", ".")) / (nn ? parseFloat(nn.replace(",", ".")) : 1);
    if (!isFinite(v)) return null;
    for (let d = 1; d <= 100; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return d === 1 ? String(Math.round(v)) : `${Math.round(v * d)}/${d}`;
    return String(v).replace(".", ",");
  }
  // Prüft eine Zwischenzeile gegen die Lösungsmenge {x0} der Ausgangsgleichung:
  // "ok" (gleichwertig), "falsch", "keineGleichung", "unlesbar"
  function zeilePruefen(zeile, x0) {
    const teile = String(zeile || "").split("=");
    if (!String(zeile || "").trim()) return "leer";
    if (teile.length !== 2) return teile.length < 2 ? "keineGleichung" : "unlesbar";
    let fL, fR;
    try { fL = termParser(teile[0]); fR = termParser(teile[1]); } catch (e) { return "unlesbar"; }
    const c = polyAusWerten((x) => fL(x) - fR(x));
    if (!c) return "unlesbar";
    const grad = c.reduce((g, k, d) => (k ? d : g), -1), tol = 1e-7 * Math.max(1, ...c.map(Math.abs));
    if (grad < 1) return "falsch";                       // 0 = 0 oder 0 = 5: x ist verloren gegangen
    const f = (x) => c.reduce((s, k, d) => s + k * Math.pow(x, d), 0);
    if (Math.abs(f(x0)) > tol * Math.max(1, Math.pow(Math.abs(x0), grad))) return "falsch";
    if (grad === 2) { const zweite = x0 !== 0 ? c[0] / (c[2] * x0) : -c[1] / c[2]; return Math.abs(zweite - x0) < 1e-6 ? "ok" : "falsch"; }
    return "ok";
  }
