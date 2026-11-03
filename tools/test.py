#!/usr/bin/env python3
"""Baut das Tool und führt die Tests aus.
   python3 tools/test.py                 -> alle Tests
   python3 tools/test.py trigonometrie   -> nur Basis + Tests dieses Themas (schnell)"""
import glob, os, subprocess, sys
basis = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, os.path.join(basis, 'tools', 'build.py')], check=True, stdout=subprocess.DEVNULL)
dateien = sorted(glob.glob(os.path.join(basis, 'tests', '*.js')))
themen = sys.argv[1:]
if themen:
    dateien = [d for d in dateien if os.path.basename(d) in ('00_basis.js', '99_ende.js') or any(t in os.path.basename(d) for t in themen)]
lauf = os.path.join(basis, 'build', 'test_lauf.js')
open(lauf, 'w', encoding='utf-8').write(''.join(open(d, encoding='utf-8').read() for d in dateien))
sys.exit(subprocess.run(['node', lauf]).returncode)
