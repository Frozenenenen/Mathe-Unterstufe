// ============================================================ VORZEICHEN-KNOPF
// Feld mit möglichen negativen Ergebnissen MUSS den Knopf haben, alle anderen dürfen ihn NICHT haben.
// Stufen können Text- und normale Aufgaben mischen (z. B. Geometrie 9) – jede Aufgabe wird nach ihrer Art geprüft:
//  - Textaufgaben (fieldKinds/fieldSigned): pro Feld,
//  - normale Aufgaben: stufenweit über level.signed.
console.log("\nPrüfe Vorzeichen-Knopf aller Stufen ...");
(function () {
  const before = totalErrors;
  Object.keys(ML.TOPICS).forEach((tk) => ML.TOPICS[tk].levels.forEach((l) => {
    totalChecked++;
    const neg = {}, flag = {};
    let normalGesehen = false, normalNeg = false;
    for (let i = 0; i < 4000; i++) {
      const t = l.generate();
      if (t.fieldType === "select") continue;
      if (t.fieldKinds) {
        t.answer.forEach((a, idx) => {
          if (t.fieldKinds[idx] === "choice") return;
          const key = t.subtype + "|" + t.fieldLabels[idx].replace(/\d+/g, "#");
          if ((isFrac(a) ? a.num / a.den : a) < 0) neg[key] = true;
          flag[key] = t.fieldSigned[idx];
        });
      } else {
        normalGesehen = true;
        t.answer.forEach((a, idx) => {
          if (t.fieldType === "choice" || (t.perFieldType && t.perFieldType[idx] === "choice")) return;
          if ((isFrac(a) ? a.num / a.den : a) < 0) normalNeg = true;
        });
      }
    }
    Object.keys(flag).forEach((key) => {
      if (neg[key] && !flag[key]) fail(`${tk}/${l.id} ${key}: negativ möglich, aber kein Vorzeichen-Knopf`);
      if (!neg[key] && flag[key]) fail(`${tk}/${l.id} ${key}: Vorzeichen-Knopf, aber nie negativ`);
    });
    if (normalGesehen) {
      if (normalNeg && !l.signed) fail(`${tk}/${l.id} (${l.name}): negativ möglich, aber kein Vorzeichen-Knopf`);
      if (!normalNeg && l.signed) fail(`${tk}/${l.id} (${l.name}): Vorzeichen-Knopf, aber nie negativ`);
    } else if (l.signed) fail(`${tk}/${l.id}: reine Textaufgaben-Stufe mit stufenweitem signed`);
  }));
  done("Vorzeichen", before, "alle Stufen");
})();

