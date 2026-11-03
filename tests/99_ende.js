console.log("\n============================================================");
console.log(`Gesamt geprüfte Aufgaben: ${totalChecked}`);
console.log(`Gesamtfehler: ${totalErrors}`);
console.log(totalErrors === 0 ? "ALLE TESTS BESTANDEN ✔" : "TESTS FEHLGESCHLAGEN ✘");
console.log("============================================================");
process.exit(totalErrors === 0 ? 0 : 1);
