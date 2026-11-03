# Mathe-Übungstool (Sek I, Kl. 5–10) – Arbeitsregeln

## Ablauf bei jeder Änderung
1. Änderungen nur in `src/` (und `tests/`), nie direkt in `index.html`.
2. `python3 tools/build.py`, dann `python3 tools/test.py` (Schnelltest einzelner Themen: `python3 tools/test.py brueche`).
3. Ausliefern und pushen mit `bash tools/ausliefern.sh "Kurze Commit-Nachricht"`.
   Das Skript liefert nur bei grünen Tests aus, schreibt `index.html`, committet und pusht automatisch nach `main`.
   **Nach jeder fertigen Änderung automatisch pushen** – das ist ausdrücklich gewünscht.

## Inhaltliche Regeln (vom Nutzer festgelegt)
- Vor neuen Themen/Stufen zuerst echte Klassenarbeiten/Arbeitsblätter recherchieren; die schwierigsten gefundenen Aufgaben sind die Obergrenze, nicht darüber hinaus.
- Erklärungen direkt im Tool, keine Verweise auf die Formelsammlung.
- Grafiken in Erklärungen gehören zum Beispiel daneben (gleiche Zahlen).
- Rechenwege beginnen in der Form, in der die Aufgabe gestellt ist.
- Regionale Verfahren gleichwertig anbieten (z. B. p-q-Formel UND Mitternachtsformel).
- Tipps verraten nie das Ergebnis; Zwischenergebnisse in Rechenwegen ungerundet weiterverwenden.
- Nicht gewünscht: Abitur, Abschlussprüfungen (MSA/ZP10), Präsentationsmodus, Klassenstufen-Filter, App/Verkauf.

## Technische Regeln
- Eine Datei, offline, ohne Bibliotheken. Logik in `src/logik/`, Oberfläche in `src/app/`.
- TeX in JS-Template-Strings immer mit doppeltem Backslash (`\\dfrac`, `\\;`) – ein Test prüft das.
- Neue Stufen brauchen: Generator, Prüfung, Rechenweg mit Beschriftungen (für Tipps), Erklärung (`ERKL`), möglichst Fehlerdiagnose (`DIAG`) und einen **unabhängigen** Test in `tests/` (Lösung auf anderem Weg ermitteln, z. B. aus der gezeichneten Grafik).
- Gegenprobe: absichtlich einen Fehler in den Generator einbauen und prüfen, dass der Test ihn findet.
- Oberfläche bei 380 px Breite im Browser prüfen (Playwright), keine JS-Fehler, kein waagerechtes Scrollen.

## Antworten an den Nutzer
Deutsch, kurz und präzise.
