// ============================================================
// test_generators.js -- Unabhängige Prüfung aller Aufgabengeneratoren.
// (Nach dem zweiten Sandbox-Reset neu aufgebaut; enthält alle im Projekt
// hinzugekommenen Prüfungen.) Referenzwerte werden auf ANDEREM Weg
// berechnet als im Generator (Schleifen statt Formeln, BigInt bei Geld).
// ============================================================
const ML = require("./logic.js");

const N = 2000;
let totalErrors = 0, totalChecked = 0;
function fail(msg) { totalErrors++; if (totalErrors <= 40) console.error("  FEHLER: " + msg); }
function manualPow(a, n) { let r = 1; for (let i = 0; i < n; i++) r *= a; return r; }
function euklid(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { [x, y] = [y, x % y]; } return x; }
function done(label, before, n) { const k = totalErrors - before; console.log(k === 0 ? `  OK (0 Fehler von ${n})` : `  ${k} Fehler von ${n}!`); }
const isFrac = (a) => a && typeof a === "object" && "num" in a;
// Zahl so ausschreiben, wie ein Mensch sie tippt (keine Exponentialschreibweise wie 9.6e-7)
function ausgeschrieben(x) {
  if (typeof x !== "number" || !/e/i.test(String(x))) return String(x);
  return x.toFixed(20).replace(/0+$/, "").replace(/\.$/, "");
}
const visible = (src) => ML.mathToHtml(src).replace(/<[^>]*>/g, " ");

// Allgemeine Prüfung für jede Aufgabe: korrekte Eingabe akzeptiert,
// pro Feld falsche Eingabe abgelehnt und genau dieses Feld benannt,
// Rechenweg vorhanden und sauber gerendert.
function genericChecks(task, level, i, label) {
  if (task.numFields < task.answer.length) { fail(`${label} #${i}: mehr Antworten als Felder`); return; }
  if (task.fieldType === "select") return;
  const kinds = task.fieldKinds || task.answer.map((a, idx) =>
    (task.perFieldType && task.perFieldType[idx] === "choice") || task.fieldType === "choice" ? "choice" : isFrac(a) ? "fraction" : "number");
  const correct = task.answer.map((a, idx) => kinds[idx] === "choice" ? a : isFrac(a) ? `${a.num}/${a.den}` : ausgeschrieben(a).replace(".", ","));
  if (!level.check(task, correct).correct) fail(`${label} #${i} (${task.promptText}): korrekte Eingabe abgelehnt: ${correct.join(" | ")}`);
  task.answer.forEach((a, idx) => {
    const wrong = correct.slice();
    if (kinds[idx] === "choice") {
      const ch = (task.fieldChoices && task.fieldChoices[idx]) || [];
      const alt = ch.find((c) => c !== a);
      if (alt === undefined) return;
      wrong[idx] = alt;
    } else if (isFrac(a)) wrong[idx] = `${a.num + a.den * 100 + 7}/${a.den}`;
    else wrong[idx] = String(a + 99999);
    const res = level.check(task, wrong);
    if (res.correct || !res.fieldErrors.includes(idx)) fail(`${label} #${i}: falsche Eingabe in Feld ${idx} nicht erkannt`);
    if (res.fieldErrors.some((e) => e !== idx)) fail(`${label} #${i}: Feld ${idx} falsch -> auch andere Felder markiert`);
  });
  let steps;
  try { steps = level.steps(task); } catch (e) { fail(`${label} #${i}: steps() wirft ${e.message}`); return; }
  if (!Array.isArray(steps) || steps.length === 0) fail(`${label} #${i}: kein Rechenweg`);
  [task.prompt, task.question].concat(steps.filter((s) => !s.label).map((s) => s.left)).filter(Boolean).forEach((src) => {
    const v = visible(src);
    if (/\b(left|right|dfrac|frac|cdot|sqrt|Rightarrow|Leftrightarrow|square)\b|undefined|NaN/.test(v)) fail(`${label} #${i}: Darstellungsproblem: "${v.slice(0, 100)}"`);
  });
}

function testLevel(tk, id, ref, label) {
  const level = ML.TOPICS[tk].levels.find((l) => l.id === id);
  console.log(`Prüfe ${tk} Stufe ${id} (${label}) ...`);
  const before = totalErrors;
  for (let i = 0; i < N; i++) {
    totalChecked++;
    const task = level.generate();
    let r;
    try { r = ref(task); } catch (e) { fail(`${label} #${i} (${task.promptText}): ${e.message}`); continue; }
    if (r !== null) {
      const refs = Array.isArray(r) ? r : [r];
      refs.forEach((rv, idx) => {
        const a = task.answer[idx], tol = (task.tolerances && task.tolerances[idx]) || task.tolerance || 1e-9;
        const ok = isFrac(rv) ? (isFrac(a) && a.num * rv.den === rv.num * a.den)
          : typeof rv === "string" ? a === rv : Math.abs(a - rv) <= Math.max(1e-9, tol / 2);
        if (!ok) fail(`${label} #${i} (${task.promptText}) Feld ${idx}: Generator=${JSON.stringify(a)}, Referenz=${JSON.stringify(rv)}`);
      });
    }
    genericChecks(task, level, i, label);
  }
  done(label, before, N);
}

// ============================================================ TEXTAUFGABEN
function muss(t, x) {
  const vis = visible(t.prompt);
  const formen = [String(x), String(x).replace(".", ","), String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ".")];
  if (!formen.some((f) => new RegExp("(^|[^\\d,.])" + f.replace(/\./g, "\\.") + "([^\\d]|$)").test(vis))) throw new Error(`Zahl ${x} fehlt im Text: ${vis.slice(0, 120)}`);
}
function textRef(tk, id, ref) {
  const level = ML.TOPICS[tk].levels.find((l) => l.id === id);
  console.log(`Prüfe ${tk} Stufe ${id} (Textaufgaben) ...`);
  const before = totalErrors, typen = new Set();
  for (let i = 0; i < N; i++) {
    totalChecked++;
    const t = level.generate();
    typen.add(t.subtype.replace(/^.*:/, ""));
    let r;
    try { r = ref(t); } catch (e) { fail(`${tk} #${i} (${t.subtype}): ${e.message}`); continue; }
    r.forEach((rv, idx) => {
      const a = t.answer[idx];
      const ok = isFrac(rv) ? (a.num === rv.num && a.den === rv.den) : typeof rv === "string" ? a === rv : Math.abs(a - rv) <= Math.max(1e-9, t.tolerances[idx] / 2);
      if (!ok) fail(`${tk} #${i} (${t.subtype}) Feld ${idx}: Generator=${JSON.stringify(a)}, Referenz=${JSON.stringify(rv)}`);
    });
    genericChecks(t, level, i, tk + "/" + t.subtype);
    // vollständig gekürzt verlangt: gleicher Wert, aber erweitert -> abgelehnt
    t.answer.forEach((a, idx) => {
      if (t.fieldKinds[idx] !== "fraction") return;
      const inp = t.answer.map((x, j) => (t.fieldKinds[j] === "choice" ? x : isFrac(x) ? `${x.num}/${x.den}` : String(x)));
      inp[idx] = `${a.num * 2}/${a.den * 2}`;
      if (level.check(t, inp).correct) fail(`${tk} #${i}: erweiterter (ungekürzter) Bruch akzeptiert`);
    });
    // Grammatik: keine Mehrzahl nach der Zahl 1
    const all = [t.prompt, t.question].concat(t.fieldLabels, level.steps(t).map((s) => (s.label || "") + " " + (s.left || ""))).map(visible).join(" ");
    const bad = all.match(/(^|[^\d,.])1 (Stunden|Minuten|Wochen|Jahren|Jahre|Monaten|Monate|Tagen|Tage|Kilometern|Fahrräder|Becher Saft und 1 Bechern)\b/);
    if (bad) fail(`${tk} #${i} (${t.subtype}): Grammatik: "${bad[0].trim()}"`);
    t.fieldLabels.concat(level.steps(t).filter((s) => s.label).map((s) => s.label)).forEach((l) => { if (/undefined|NaN/.test(l)) fail(`${tk} #${i}: Beschriftung kaputt: ${l}`); });
  }
  console.log(`  ${typen.size} Aufgabentypen: ${[...typen].join(", ")}`);
  done("Textaufgaben " + tk, before, N);
}

