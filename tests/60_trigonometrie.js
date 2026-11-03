// ============================================================ TRIGONOMETRIE
testLevel("trigonometrie", 1, (t) => (t.data.w === "α" ? ["c", "a", "b"] : ["c", "b", "a"]), "Seiten benennen");
testLevel("trigonometrie", 2, (t) => {
  const { a, b, c, w } = t.data;
  if (a * a + b * b !== c * c) throw new Error("kein rechtwinkliges Dreieck");
  const g = w === "α" ? a : b, an = w === "α" ? b : a;
  return [{ num: g, den: c }, { num: an, den: c }, { num: g, den: an }];
}, "Verhältnisse");
testLevel("trigonometrie", 3, (t) => {
  // Dreieck als Koordinaten: A(0|0), Richtung zu B unter α; Seiten über hypot
  const { al, gg, gs, x } = t.data, r = (al * Math.PI) / 180;
  const ux = Math.cos(r), uy = Math.sin(r); // Einheitsdreieck: c=1, b=ux, a=uy
  const einh = { a: uy, b: ux, c: Math.hypot(ux, uy) };
  return Math.round((x / einh[gg]) * einh[gs] * 100) / 100;
}, "Seite berechnen");
testLevel("trigonometrie", 4, (t) => {
  const { fall, a, b, c } = t.data;
  const A = fall === "cos" ? Math.sqrt(c * c - b * b) : a, B = fall === "sin" ? Math.sqrt(c * c - a * a) : b;
  return Math.round((Math.atan2(A, B) * 180) / Math.PI * 10) / 10;
}, "Winkel berechnen");
textRef("trigonometrie", 5, (t) => {
  const d = t.dataExtra, k = t.subtype, deg = (x) => (x * 180) / Math.PI, r1 = (x) => Math.round(x * 10) / 10;
  if (k === "leiter") { muss(t, d.L); const w = r1(deg(Math.atan2(Math.sqrt(d.L * d.L - d.d * d.d), d.d))); return [w, w >= 65 && w <= 75 ? "ja" : "nein"]; }
  if (k === "rampe") { muss(t, d.h); const s = d.h / (d.l * 100); return [Math.round(s * 1000) / 10, r1(deg(Math.atan2(d.h, d.l * 100))), Math.round(s * 1000) / 10 <= 6 ? "ja" : "nein"]; }
  if (k === "turm") { muss(t, d.s); return [r1(d.s * Math.sin((d.w * Math.PI) / 180) / Math.cos((d.w * Math.PI) / 180))]; }
  if (k === "steigung") { muss(t, d.p); const w = Math.atan2(d.p, 100); return [r1(deg(w)), Math.round(d.km * 1000 * d.p / Math.hypot(d.p, 100))]; }
  if (k === "drachen") { muss(t, d.L); return [r1(d.L * Math.sin((d.w * Math.PI) / 180) + 1.5)]; }
  throw new Error("unbekannter Subtyp " + k);
});

// --- Sinus- und Kosinussatz: Referenz über Koordinaten (Dreieck konstruieren, Abstände/Winkel messen) ---
function konstruiere(c, al, be) { // A(0|0), B(c|0), C als Schnitt der Strahlen unter α und β
  const ta = Math.tan((al * Math.PI) / 180), tb = Math.tan((be * Math.PI) / 180);
  const x = Number.isFinite(ta) && Number.isFinite(tb) ? (c * tb) / (ta + tb) : 0;
  // robust auch bei stumpfen Winkeln: über Richtungsvektoren
  const ra = [Math.cos((al * Math.PI) / 180), Math.sin((al * Math.PI) / 180)], rb = [-Math.cos((be * Math.PI) / 180), Math.sin((be * Math.PI) / 180)];
  const det = ra[0] * rb[1] - ra[1] * rb[0], s = (c * rb[1]) / det;
  return { A: [0, 0], B: [c, 0], C: [ra[0] * s, ra[1] * s] };
}
const abst = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);
const winkelBei = (V, P, Q) => { const a1 = Math.atan2(P[1] - V[1], P[0] - V[0]), a2 = Math.atan2(Q[1] - V[1], Q[0] - V[0]); let w = Math.abs(a1 - a2) * 180 / Math.PI; return w > 180 ? 360 - w : w; };
testLevel("trigonometrie", 6, (t) => {
  const d = t.data;
  if (t.subtype === "seite") {
    const P = konstruiere(1, d.al, d.be), k = d.a / abst(P.B, P.C); // auf a skalieren
    return Math.round((d.ziel === "b" ? abst(P.A, P.C) : abst(P.A, P.B)) * k * 100) / 100;
  }
  // a, b, α: C so, dass |AC| = b unter α; B auf der x-Achse mit |BC| = a (größere Lösung, da a > b)
  const C = [d.b * Math.cos((d.al * Math.PI) / 180), d.b * Math.sin((d.al * Math.PI) / 180)];
  const xB = C[0] + Math.sqrt(d.a * d.a - C[1] * C[1]), B = [xB, 0];
  return Math.round(winkelBei(B, [0, 0], C) * 10) / 10;
}, "Sinussatz");
testLevel("trigonometrie", 7, (t) => {
  const d = t.data;
  if (t.subtype === "seite") { const B = [d.c, 0], C = [d.b * Math.cos((d.al * Math.PI) / 180), d.b * Math.sin((d.al * Math.PI) / 180)]; return Math.round(abst(B, C) * 100) / 100; }
  // SSS: C(0|0), B(a|0), A über zwei Kreise
  const x = (d.a * d.a + d.b * d.b - d.c * d.c) / (2 * d.a), A = [x, Math.sqrt(d.b * d.b - x * x)];
  if (Math.abs(abst(A, [d.a, 0]) - d.c) > 1e-9) throw new Error("Dreieck nicht konstruierbar");
  return Math.round(winkelBei([0, 0], [d.a, 0], A) * 10) / 10;
}, "Kosinussatz");
textRef("trigonometrie", 8, (t) => {
  const d = t.dataExtra, k = t.subtype;
  if (k === "fluss") { muss(t, d.c); const P = konstruiere(d.c, d.al, d.be); return [Math.round(abst(P.A, P.C) * 10) / 10, Math.round(P.C[1] * 10) / 10]; }
  if (k === "grundstueck") { const B = [d.c, 0], C = [d.b * Math.cos((d.al * Math.PI) / 180), d.b * Math.sin((d.al * Math.PI) / 180)];
    return [Math.round((d.b + d.c + abst(B, C)) * 10) / 10, Math.round(Math.abs(B[0] * C[1] - B[1] * C[0]) / 2)]; }
  if (k === "wanderer") { const P = [d.x, 0], Q = [d.y * Math.cos((d.ga * Math.PI) / 180), d.y * Math.sin((d.ga * Math.PI) / 180)]; return [Math.round(abst(P, Q) * 100) / 100]; }
  throw new Error("unbekannter Subtyp " + k);
});

// --- Stufe 9: Mehrschrittige Aufgaben. Referenzen über Koordinaten/3D-Vektoren bzw. Sinussatz (anderer Weg als der Generator) ---
textRef("trigonometrie", 9, (t) => {
  const d = t.dataExtra, k = t.subtype, R = Math.PI / 180, r1 = (x) => Math.round(x * 10) / 10;
  if (k === "turm") { // Dreieck A-B-Spitze: Winkel an der Spitze = a2 − a1, Sinussatz liefert BS
    muss(t, d.d); muss(t, d.a1); muss(t, d.a2);
    const BS = (d.d * Math.sin(d.a1 * R)) / Math.sin((d.a2 - d.a1) * R);
    return [r1(BS * Math.sin(d.a2 * R)), r1(BS * Math.cos(d.a2 * R))];
  }
  if (k === "pyramide") { // 3D: Grundfläche in z = 0, Spitze über dem Mittelpunkt
    const a = d.a, h = d.h, A = [0, 0, 0], B = [a, 0, 0], S = [a / 2, a / 2, h], M = [a / 2, a / 2, 0], Hm = [a / 2, 0, 0];
    const sub = (p, q) => p.map((x, i) => x - q[i]), len = (v) => Math.hypot(...v), dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
    const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const winkel = (V, P, Q) => Math.acos(dot(sub(P, V), sub(Q, V)) / (len(sub(P, V)) * len(sub(Q, V)))) / R;
    const O = a * a + 4 * len(cross(sub(B, A), sub(S, A))) / 2;
    return [r1(len(sub(S, Hm))), r1(O), r1(winkel(Hm, M, S)), r1(winkel(A, M, S))];
  }
  if (k === "trapez") { // C als Schnitt der Geraden durch B (Richtung 180° − β) mit der Parallelen durch D
    const D = [d.d * Math.cos(d.al * R), d.d * Math.sin(d.al * R)], u = [-Math.cos(d.be * R), Math.sin(d.be * R)], s = D[1] / u[1], C = [d.a + s * u[0], D[1]];
    return [r1(D[1]), r1(s), r1(C[0] - D[0])];
  }
  if (k === "gleichschenklig") { // Sinussatz im ganzen Dreieck, Fläche über ½·a·b·sin(γ)
    const ga = 180 - 2 * d.be, a = (d.c * Math.sin(d.be * R)) / Math.sin(ga * R);
    return [r1(a), r1(a * Math.sin(d.be * R)), r1(0.5 * a * a * Math.sin(ga * R))];
  }
  if (k === "exakt") { // ganzzahlige Hypotenuse suchen und Probe sin² + cos² = 1
    let r = 1; while (r * r < d.p * d.p + d.q * d.q) r++;
    if (r * r !== d.p * d.p + d.q * d.q) throw new Error("kein pythagoreisches Tripel");
    const g = (x, y) => (y ? g(y, x % y) : x), red = (n, m) => ({ num: n / g(n, m), den: m / g(n, m) });
    return [red(d.p, r), red(d.q, r)];
  }
  throw new Error("unbekannter Subtyp " + k);
});
