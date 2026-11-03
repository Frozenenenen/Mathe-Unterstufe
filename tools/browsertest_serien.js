// Browser-Test der Zeitmessung (Serien, Bestenliste, Lernstand). Aufruf nach tools/build.py:
//   PLAYWRIGHT_PFAD=/pfad/zu/playwright node tools/browsertest_serien.js
const { chromium } = require(process.env.PLAYWRIGHT_PFAD || 'playwright');
const ok = (b, m) => { console.log((b ? "OK   " : "FEHLER ") + m); if (!b) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.clock.install({ time: new Date('2026-11-03T09:00:00') });
  await p.goto('file://' + require('path').join(__dirname, '..', 'build', 'mathe-uebungstool.html'));
  const zurueck = () => p.locator('.backbtn').first().click();
  const txt = () => p.evaluate(() => document.body.innerText);
  await p.getByText('Bruchrechnung').click();
  ok(/Noch keine 5er-Serie/.test(await txt()), "leere Bestenliste");
  await p.locator('input.name-in').fill('Lena'); await p.locator('input.name-in').press('Tab');
  const stufe = (n) => p.getByText(n, { exact: true }).first().click();
  // Serie 1: 5 Aufgaben per Rechenweg (0 Punkte), je 10 s
  await stufe('Brüche kürzen (ggT)');
  for (let i = 0; i < 5; i++) { await p.clock.runFor(10000); await p.getByRole('button', { name: 'Rechenweg zeigen' }).click(); if (i < 4) await p.getByRole('button', { name: 'Neue Aufgabe' }).click(); }
  const z = await p.locator('.serie-zaehler').textContent();
  ok(/Serie geschafft: 5 Aufgaben in 0:50 min \(0 von 5 Punkten\)/.test(z), "Serie abgeschlossen: " + z);
  // 3 weitere, dann abbrechen
  for (let i = 0; i < 3; i++) { await p.getByRole('button', { name: 'Neue Aufgabe' }).click(); await p.getByRole('button', { name: 'Rechenweg zeigen' }).click(); }
  ok(/⏱ 3\/5/.test(await p.locator('.serie-zaehler').textContent()), "Zähler 3/5");
  await zurueck();
  let t = await txt();
  ok(/Brüche kürzen \(ggT\)\s+Lena\s+0:50\s+0\/5/.test(t), "Bestenliste zeigt Lena, 0:50 min, 0/5");
  ok(/Top 1 von 1 Serie/.test(t), "abgebrochene Serie nicht gespeichert");
  await p.locator('input.name-in').fill('Tom'); await p.locator('input.name-in').press('Tab');
  ok(await p.locator('input.name-in').inputValue() === 'Tom', "Name bleibt nach Neuaufbau erhalten");
  // Serie 2: Stufe 1 richtig lösen (aus dem sichtbaren Text), langsamer (je 30 s) -> muss trotzdem vorne stehen
  await stufe('Was ist größer? (gleicher Nenner/Zähler)');
  for (let i = 0; i < 5; i++) {
    await p.clock.runFor(30000);
    const zahlen = (await p.locator('.task-prompt').first().innerText()).match(/\d+/g).map(Number);
    const [a, bb, c, d] = zahlen, v = a * d - c * bb, zeichen = v > 0 ? '>' : v < 0 ? '<' : '=';
    await p.locator('button.choice-btn', { hasText: new RegExp('^\\' + zeichen + '$') }).first().click();
    await p.getByRole('button', { name: 'Prüfen' }).click();
    if (i < 4) await p.getByRole('button', { name: 'Neue Aufgabe' }).click();
  }
  ok(/2:30 min \(5 von 5 Punkten\)/.test(await p.locator('.serie-zaehler').textContent()), "volle Punktzahl gemessen");
  await zurueck(); t = await txt();
  ok(/Was ist größer\? \(gleicher Nenner\/Zähler\)\s+Tom\s+2:30\s+5\/5/.test(t), "zweite Stufe in der Bestenliste (Tom)");
  // Rangfolge innerhalb einer Stufe: weitere langsame, schlechtere Serie in Kürzen darf die bessere nicht verdrängen
  // Seriengröße 10: eigene Liste
  await p.locator('.serie-wahl button', { hasText: '10 Aufgaben' }).click();
  t = await txt(); ok(/Noch keine 10er-Serie/.test(t), "10er-Liste getrennt");
  await p.locator('.serie-wahl button', { hasText: '5 Aufgaben' }).click();
  // Lernstand sichern und laden (Zeiten müssen erhalten bleiben)
  const gespeichert = await p.evaluate(() => localStorage.getItem('mathe-uebungstool-stats'));
  const sicherung = JSON.stringify({ app: 'mathe-uebungstool', version: 1, erstellt: '2026-11-03', lernstand: JSON.parse(gespeichert) });
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.getByText('Lernstand sichern').click(); await p.getByRole('button', { name: 'Aus Text laden' }).click();
  await p.locator('textarea.ls-feld').fill(sicherung); await p.getByRole('button', { name: 'Eingefügten Text laden' }).click();
  await p.clock.runFor(2000);
  await p.getByText('Bruchrechnung').click(); t = await txt();
  ok(/0:50/.test(t) && /2:30/.test(t) && /Lena/.test(t) && /Tom/.test(t), "Zeiten und Namen nach Laden des Lernstands vorhanden");
  // manipulierte Sicherung (mehr Punkte als Aufgaben) wird abgelehnt
  await zurueck();
  const kaputt = JSON.parse(sicherung); kaputt.lernstand.__zeiten['brueche-3'][0].p = 7;
  await p.getByText('Lernstand sichern').click(); await p.getByRole('button', { name: 'Aus Text laden' }).click();
  await p.locator('textarea.ls-feld').fill(JSON.stringify(kaputt)); await p.getByRole('button', { name: 'Eingefügten Text laden' }).click();
  ok(/Ungültige Zeitmessung/.test(await p.locator('.ls-status').textContent()), "ungültige Zeiten abgelehnt");
  
  await p.getByText('Bruchrechnung').click();
  
  ok(errs.length === 0, "keine JS-Fehler " + errs.join(' | '));
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 380, "kein waagerechtes Scrollen");
  await b.close();
})();
