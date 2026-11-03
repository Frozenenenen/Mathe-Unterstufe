// Verhaltens-Abgleich zweier Logik-Fassungen mit festem Zufallsstartwert.
// Aufruf: node tools/vergleich.js <alt.js> <neu.js>
const path = require("path");
const ALT = require(path.resolve(process.argv[2])), NEU = require(path.resolve(process.argv[3]));
let seed = 1;
const echtesRandom = Math.random;
function setzeSeed(s) { seed = s; Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; }
const ser = (x) => JSON.stringify(x, (k, v) => (typeof v === "function" ? undefined : v));
let vergleiche = 0, abweichungen = 0;
function gleich(name, fa, fn, s) {
  setzeSeed(s); let a; try { a = ser(fa(ALT)); } catch (e) { a = "FEHLER " + e.message; }
  setzeSeed(s); let b; try { b = ser(fn(NEU)); } catch (e) { b = "FEHLER " + e.message; }
  vergleiche++;
  if (a !== b) { abweichungen++; if (abweichungen <= 10) console.log("ABWEICHUNG:", name, "\n   alt:", String(a).slice(0, 200), "\n   neu:", String(b).slice(0, 200)); }
}
const themenA = Object.keys(ALT.TOPICS), themenN = Object.keys(NEU.TOPICS);
gleich("Themenliste", () => themenA.map((k) => [k, ALT.TOPICS[k].name, ALT.TOPICS[k].grade]), () => themenN.map((k) => [k, NEU.TOPICS[k].name, NEU.TOPICS[k].grade]), 1);
themenA.forEach((tk) => ALT.TOPICS[tk].levels.forEach((la, li) => {
  const pick = (M) => M.TOPICS[tk].levels[li];
  gleich(`${tk}/${la.id} Stufe`, (M) => pick(M), (M) => pick(M), 1);
  for (let r = 0; r < 300; r++) {
    const s = 1000 + r;
    const lauf = (M) => {
      const l = pick(M), t = l.generate(), st = l.steps(t);
      const korrekt = t.answer.map((a) => (a && typeof a === "object" && "num" in a ? `${a.num}/${a.den}` : String(a)));
      const falsch = t.answer.map((a, i) => (i % 2 ? korrekt[i] : a && typeof a === "object" ? `${a.num + 1}/${a.den}` : typeof a === "number" ? String(a * 2 + 1) : "x"));
      const res = l.check(t, falsch);
      return { t, st, ok: l.check(t, korrekt), res, dg: M.diagnose(t, falsch, res.fieldErrors),
        html: [t.prompt, t.question].concat(st.map((x) => x.left || "")).filter(Boolean).map((x) => M.mathToHtml(x)), erkl: M.erklaerungFuer(tk, l.id) };
    };
    gleich(`${tk}/${la.id} Lauf ${r}`, lauf, lauf, s);
  }
}));
Object.keys(ALT.KA_VORLAGEN).forEach((tk) => [45, 90].forEach((min) => {
  for (let r = 0; r < 60; r++) gleich(`Klassenarbeit ${tk} ${min} Lauf ${r}`, (M) => M.erzeugeKlassenarbeit(tk, min), (M) => M.erzeugeKlassenarbeit(tk, min), 5000 + r);
}));
gleich("Klassenarbeits-Themen", (M) => Object.keys(M.KA_VORLAGEN).sort(), (M) => Object.keys(M.KA_VORLAGEN).sort(), 1);
gleich("Notenschlüssel", (M) => [M.KA_NOTEN, [0, 24, 25, 49, 50, 62, 63, 76, 77, 89, 90, 100].map(M.noteKA)], (M) => [M.KA_NOTEN, [0, 24, 25, 49, 50, 62, 63, 76, 77, 89, 90, 100].map(M.noteKA)], 1);
gleich("Hinweistexte", (M) => M.DIAG_HINWEISE, (M) => M.DIAG_HINWEISE, 1);
gleich("Exporte", (M) => Object.keys(M).sort(), (M) => Object.keys(M).sort(), 1);
Math.random = echtesRandom;
console.log(`\n${vergleiche} Vergleiche, ${abweichungen} Abweichungen`);
process.exit(abweichungen ? 1 : 0);
