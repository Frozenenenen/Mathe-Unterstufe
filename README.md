# Mathe-Übungstool – Quellcode

Das Tool wird als **eine einzige HTML-Datei** ausgeliefert (offline nutzbar).
Zum Bearbeiten ist der Code in Einzeldateien aufgeteilt; `tools/build.py` setzt sie zusammen.

## Arbeitsablauf
    python3 tools/test.py                    # bauen + alle Tests (~1 min)
    python3 tools/test.py trigonometrie      # nur Grundlagen + ein Thema (schnell)
    → Ergebnis: build/mathe-uebungstool.html
    bash tools/ausliefern.sh "Nachricht"     # liefert NUR aus, wenn alle Tests grün sind; aktualisiert index.html,
                                             # committet und pusht nach GitHub (main)

## Struktur
- `src/logik/` – Rechenlogik, in Dateinamen-Reihenfolge zusammengesetzt
  - `00`–`07`: gemeinsame Grundlagen (Hilfsfunktionen, Formel-Renderer, Graph-Plotter,
    Textaufgaben-, Klassenarbeits-, Erklärungs- und Diagnose-Basis, Themen-Registry)
  - `10_…` bis `80_…`: **ein Thema pro Datei** (Reihenfolge = Startseite) – Stufen, Textaufgaben, Registry-Eintrag,
    Klassenarbeits-Vorlagen, Erklärungen und Diagnose-Regeln dieses Themas
  - `99_export.js`: öffentliche Schnittstelle
- `src/app/` – Oberfläche (Speicher, Startseite, Aufgabe, Klassenarbeit, Arbeitsblatt, …)
- `src/vorlage.html` – HTML-Gerüst und CSS
- `tests/` – unabhängige Prüfungen: `10`–`89` je Thema (gleiche Nummer wie in `src/logik/`),
  `90`–`95` themenübergreifend (Diagnose, Klassenarbeiten, Erklärungen, Vorzeichen, Formelbefehle, Renderer)
- `tools/vergleich.js` – Verhaltens-Abgleich zweier Logik-Fassungen mit festem Zufallsstartwert

## Neues Thema hinzufügen
1. `src/logik/<nr>_neues_thema.js` anlegen (Nummer < 90) (Vorlage: `60_trigonometrie.js`),
   am Ende `TOPICS.neues_thema = {…}` sowie ggf. `KA_VORLAGEN`, `KA_INFO`, `ERKL`, `DIAG` ergänzen.
2. `tests/<nr>_neues_thema.js` mit unabhängigen Referenzrechnungen anlegen.
3. `python3 tools/test.py` – erst wenn alles grün ist, ausliefern.

## GitHub

Repository: https://github.com/Frozenenenen/Mathe-Unterstufe

- `index.html` ist das fertige Tool (eine Datei, offline nutzbar) und wird nur von `tools/ausliefern.sh` geschrieben – nie von Hand bearbeiten, Änderungen gehören in `src/`.
- `tools/ausliefern.sh` pusht nur Stände, bei denen alle automatischen Tests grün sind.
- `tools/browsertest_serien.js` prüft die Zeitmessung im Browser (Playwright, optional).
