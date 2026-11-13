"""Rigenera gli sfondi del widget (widget-img/) disegnando i paesaggi di ornrarv-lib.js con Chrome senza testa (playwright).
Uso: python3 strumenti/costruisci_sfondi.py [cartella] [filtro, es. 1-2-m]. Nomi: <mese>-<settimana>-<l|m|s>.jpg, Brumale di giorno -g, altri mesi di notte -n."""
import asyncio, sys, os
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT, 'widget-img')
os.makedirs(OUT, exist_ok=True)
SIZES={'l':(1014,1062),'m':(1014,474),'s':(474,474)}
ONLY = sys.argv[2] if len(sys.argv)>2 else None
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        html = f"""<html><head><link rel=stylesheet href="file://{ROOT}/ornrarv.css"><style>html,body{{margin:0;overflow:hidden}} #h{{position:relative;width:100vw;height:100vh}} .scene{{position:absolute;inset:0;width:100%;height:100%;display:block}}</style></head><body><div id=h></div><script src="file://{ROOT}/ornrarv-lib.js"></script></body></html>"""
        open('/tmp/ritmo-sfondi.html','w').write(html)
        for f,(w,hh) in SIZES.items():
            pg = await b.new_page(viewport={'width':w,'height':hh}, device_scale_factor=1)
            await pg.goto('file:///tmp/ritmo-sfondi.html')
            for mi in range(7):
                for v in (['giorno','notte']):
                    suf = ('-g' if v=='giorno' else '') if mi==1 else ('-n' if v=='notte' else '')
                    for wi in range(7):
                        name=f'{mi}-{wi}-{f}{suf}.jpg'
                        if ONLY and ONLY not in name: continue
                        await pg.evaluate(f"document.getElementById('h').innerHTML = ORN.sceneSVG({mi}, {{p: {wi}/6, variant: '{v}'}}).replace('class=\"scene','class=\"scene static')")
                        await pg.screenshot(path=f'{OUT}/{name}', type='jpeg', quality=82)
            await pg.close()
        await b.close()
asyncio.run(main())
