"""Costruisce ritmo-widget.js (per Scriptable) copiando il NUCLEO di index.html (tempo, calendario settale, categorie,
impegni del giorno, messaggio di feedback) dentro strumenti/widget-sorgente.js al posto di /*NUCLEO*/.
Uso, dalla cartella principale del repository: python3 strumenti/costruisci_widget.py"""
import os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
a = html.index('/* ==== NUCLEO')
fine = '/* ==== FINE NUCLEO ==== */'
b = html.index(fine) + len(fine)
core = html[a:b]
src = open(os.path.join(root, 'strumenti', 'widget-sorgente.js'), encoding='utf-8').read()
assert '/*NUCLEO*/' in src
open(os.path.join(root, 'ritmo-widget.js'), 'w', encoding='utf-8').write(src.replace('/*NUCLEO*/', core))
print('ritmo-widget.js:', len(core), 'caratteri di nucleo')
