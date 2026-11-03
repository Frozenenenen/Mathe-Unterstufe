#!/usr/bin/env python3
"""Baut aus src/ die eine HTML-Datei: src/logik/*.js und src/app/*.js werden in
Dateinamen-Reihenfolge aneinandergehängt und in src/vorlage.html eingesetzt."""
import glob, os, sys
basis = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def teile(ordner): return ''.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(basis, 'src', ordner, '*.js'))))
os.makedirs(os.path.join(basis, 'build'), exist_ok=True)
logik = teile('logik'); open(os.path.join(basis, 'build', 'logic.js'), 'w', encoding='utf-8').write(logik)
vorlage = os.path.join(basis, 'src', 'vorlage.html')
if os.path.exists(vorlage):
    app = teile('app'); open(os.path.join(basis, 'build', 'app.js'), 'w', encoding='utf-8').write(app)
    html = open(vorlage, encoding='utf-8').read()
    assert html.count('/*__LOGIK__*/') == 1 and html.count('/*__APP__*/') == 1
    html = html.replace('/*__LOGIK__*/', logik).replace('/*__APP__*/', app)
    open(os.path.join(basis, 'build', 'mathe-uebungstool.html'), 'w', encoding='utf-8').write(html)
print('gebaut:', ', '.join(sorted(os.listdir(os.path.join(basis, 'build')))))
