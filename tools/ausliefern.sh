#!/bin/bash
# Liefert NUR aus, wenn der komplette Testlauf fehlerfrei durchläuft.
# Danach: index.html aktualisieren, committen und nach GitHub pushen.
#   bash tools/ausliefern.sh "Commit-Nachricht"
cd "$(dirname "$0")/.." || exit 1
NACHRICHT="${1:-Aktualisierung des Mathe-Übungstools}"
python3 tools/test.py > /tmp/auslieferung_test.txt 2>&1
if [ $? -ne 0 ] || ! grep -q "Gesamtfehler: 0" /tmp/auslieferung_test.txt; then
  echo "NICHT ausgeliefert – Tests fehlgeschlagen:"; grep -E "FEHLER|Error" /tmp/auslieferung_test.txt | head -10; tail -3 /tmp/auslieferung_test.txt; exit 1
fi
cp build/mathe-uebungstool.html index.html
if [ -d /mnt/user-data/outputs ]; then
  cp build/mathe-uebungstool.html /mnt/user-data/outputs/mathe-uebungstool.html
  rm -f /mnt/user-data/outputs/mathe-uebungstool-quellcode.zip && zip -qr /mnt/user-data/outputs/mathe-uebungstool-quellcode.zip README.md src tests tools -x "*/__pycache__/*"
fi
echo "ausgeliefert ($(grep 'Gesamt geprüft' /tmp/auslieferung_test.txt))"
# --- GitHub: nur geprüfte Stände werden gepusht ---
if [ -d .git ]; then
  git add -A
  if git diff --cached --quiet; then echo "GitHub: nichts zu committen"; exit 0; fi
  git commit -q -m "$NACHRICHT" -m "Alle automatischen Tests bestanden ($(grep 'Gesamt geprüft' /tmp/auslieferung_test.txt | sed 's/^ *//'))." \
    -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbLjtTJEGMGpcpnbFSYH5m" || exit 1
  git fetch -q origin main && git rebase -q origin/main || { echo "GitHub: Rebase fehlgeschlagen – bitte manuell lösen"; exit 1; }
  for versuch in 1 2 3 4; do
    if git push -q origin HEAD:main; then echo "GitHub: gepusht ($(git rev-parse --short HEAD))"; exit 0; fi
    sleep $((2 ** versuch))
  done
  echo "GitHub: Push fehlgeschlagen"; exit 1
fi
