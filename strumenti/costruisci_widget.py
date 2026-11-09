"""Costruisce ritmo-widget.js (per Scriptable) copiando il pianificatore da index.html dentro strumenti/widget-sorgente.js.
Uso, dalla cartella principale del repository: python3 strumenti/costruisci_widget.py"""
import os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
a = html.index('/* Regole della settimana tipo.')
b = html.index('const loadWord')
b = html.index('\n', b) + 1
planner = html[a:b]
src = open(os.path.join(root, 'strumenti', 'widget-sorgente.js'), encoding='utf-8').read()
assert '/*PIANIFICATORE*/' in src
open(os.path.join(root, 'ritmo-widget.js'), 'w', encoding='utf-8').write(src.replace('/*PIANIFICATORE*/', planner))
print('ritmo-widget.js:', len(planner), 'caratteri di pianificatore')
