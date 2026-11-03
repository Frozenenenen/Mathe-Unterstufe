// ============================================================ RENDERER
console.log("\nPrüfe Formel-Renderer ...");
[["x^{2}", "x<sup>2</sup>"], ["\\sqrt{16}", "√(16)"], ["\\sqrt[3]{27}", "<sup>3</sup>√(27)"], ["\\square", "▢"]].forEach(([src, exp]) => {
  totalChecked++;
  const got = ML.mathToHtml(src);
  if (got !== exp) fail(`Renderer("${src}") = "${got}", erwartet "${exp}"`);
});

