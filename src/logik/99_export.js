  const MathLogic = {
    TOPICS,
    randInt, choice, round2, fmtNum, gcd,
    parseUserNumber, parseUserFraction, fractionsEqual, numbersClose,
    mathToHtml,
    renderGraphSVG, pathForFunction, makeTransform,
    diagnose, DIAG_HINWEISE,
    erzeugeKlassenarbeit, noteKA, KA_VORLAGEN, KA_NOTEN, KA_TEILGEBIETE, tippAbschnitte,
    erklaerungFuer, dreieckSVG
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = MathLogic;
  } else {
    root.MathLogic = MathLogic;
  }
})(typeof window !== "undefined" ? window : globalThis);
