// RITMO-WIDGET · widget di Ritmo per Scriptable (iPhone). Generato da strumenti/costruisci_widget.py: non modificare ritmo-widget.js a mano.
// Mostra il piano del giorno calcolato come nell'app (stesse regole, stessi dati cifrati). Spunte e spostamenti fatti nell'app
// restano sul telefono dentro l'app e qui non si vedono.
const BASE = 'https://realininiccolo-oss.github.io/ritmo/';
const KEYNAME = 'ritmo-widget-chiave';
const fm = FileManager.local();
const cacheP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-dati.json');
const STATO = 'ritmo-widget-stato', statoP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-stato.json');

/*PIANIFICATORE*/

/* ---------- SHA-256 e HMAC (Scriptable non ha AES né WebCrypto) ---------- */
const K256 = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
function sha256(msg) {
  const l = msg.length, nb = ((l + 9 + 63) >> 6) << 6, buf = new Uint8Array(nb);
  buf.set(msg); buf[l] = 0x80;
  const bits = l * 8; for (let i = 0; i < 8; i++) buf[nb - 1 - i] = Math.floor(bits / Math.pow(2, 8 * i)) & 255;
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]), W = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < nb; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = (buf[o + 4 * i] << 24) | (buf[o + 4 * i + 1] << 16) | (buf[o + 4 * i + 2] << 8) | buf[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) { const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10); W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0; }
    let [a, b, c, d, e, f, g, hh] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = (e & f) ^ (~e & g), t1 = (hh + S1 + ch + K256[i] + W[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += hh;
  }
  const out = new Uint8Array(32); for (let i = 0; i < 8; i++) { out[4 * i] = H[i] >>> 24; out[4 * i + 1] = (H[i] >>> 16) & 255; out[4 * i + 2] = (H[i] >>> 8) & 255; out[4 * i + 3] = H[i] & 255; }
  return out;
}
const concatB = (...a) => { const n = a.reduce((x, y) => x + y.length, 0), o = new Uint8Array(n); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
function hmac(key, msg) {
  const k = new Uint8Array(64); k.set(key.length > 64 ? sha256(key) : key);
  const ip = k.map((x) => x ^ 0x36), op = k.map((x) => x ^ 0x5c);
  return sha256(concatB(op, sha256(concatB(ip, msg))));
}
const hexB = (h2) => Uint8Array.from(h2.match(/../g).map((x) => parseInt(x, 16)));
const b64B = (s2) => Uint8Array.from(Data.fromBase64String(s2).getBytes());
const u32 = (i) => Uint8Array.from([(i >>> 24) & 255, (i >>> 16) & 255, (i >>> 8) & 255, i & 255]);
function utf8(b) {
  let s2 = '', i = 0;
  while (i < b.length) {
    const c = b[i++];
    if (c < 128) s2 += String.fromCharCode(c);
    else if (c < 224) s2 += String.fromCharCode(((c & 31) << 6) | (b[i++] & 63));
    else if (c < 240) s2 += String.fromCharCode(((c & 15) << 12) | ((b[i++] & 63) << 6) | (b[i++] & 63));
    else { const cp = ((c & 7) << 18) | ((b[i++] & 63) << 12) | ((b[i++] & 63) << 6) | (b[i++] & 63); s2 += String.fromCodePoint(cp); }
  }
  return s2;
}
function decryptPkg(pkg, keyHex) {
  const K = hexB(keyHex), n = b64B(pkg.n), c = b64B(pkg.c), t = b64B(pkg.t), tag = hmac(K, concatB(n, c));
  if (tag.length !== t.length || tag.some((x, i) => x !== t[i])) throw new Error('chiave');
  const pt = new Uint8Array(c.length);
  for (let i = 0; i * 32 < c.length; i++) { const ks = sha256(concatB(K, n, u32(i))); for (let j = 0; j < 32 && i * 32 + j < c.length; j++) pt[i * 32 + j] = c[i * 32 + j] ^ ks[j]; }
  return utf8(pt);
}

/* ---------- chiave e dati ---------- */
async function getKey() {
  if (Keychain.contains(KEYNAME)) return Keychain.get(KEYNAME);
  if (config.runsInWidget) return null;
  const a = new Alert(); a.title = 'Chiave del widget di Ritmo'; a.message = 'Incollala dalla chat con Claude. Si chiede una volta sola.';
  a.addTextField('64 caratteri'); a.addAction('Salva'); a.addCancelAction('Annulla');
  if (await a.presentAlert() === -1) return null;
  const k = a.textFieldValue(0).trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(k)) { const e = new Alert(); e.title = 'Chiave non valida'; e.message = 'Devono essere 64 caratteri tra 0-9 e a-f.'; e.addAction('OK'); await e.presentAlert(); return null; }
  Keychain.set(KEYNAME, k); return k;
}
async function loadData(key) {
  try {
    const pkg = await new Request(BASE + 'widget.enc.json?t=' + Date.now()).loadJSON();
    const txt = decryptPkg(pkg, key); fm.writeString(cacheP, txt); return JSON.parse(txt);
  } catch (e) {
    if (e.message === 'chiave') { if (Keychain.contains(KEYNAME)) Keychain.remove(KEYNAME); throw e; }
    if (fm.fileExists(cacheP)) return JSON.parse(fm.readString(cacheP));
    throw e;
  }
}

/* Andamento: spunte, spostamenti e impegni dell'app, salvati cifrati in un gist privato. */
async function loadStato(key) {
  if (!Keychain.contains(STATO)) return null;
  try {
    const j = await new Request('https://api.github.com/gists/' + Keychain.get(STATO) + '?t=' + Date.now()).loadJSON();
    const f = j.files && j.files['ritmo-stato.json']; if (!f) throw new Error('vuoto');
    const txt = decryptPkg(JSON.parse(f.content), key); fm.writeString(statoP, txt); return JSON.parse(txt);
  } catch (e) { return fm.fileExists(statoP) ? JSON.parse(fm.readString(statoP)) : null; }
}
async function menu() {
  const a = new Alert(); a.title = 'Ritmo'; a.addAction('Anteprima grande'); a.addAction('Anteprima media'); a.addAction(Keychain.contains(STATO) ? 'Cambia il codice dell\'andamento' : 'Collega l\'andamento'); a.addAction('Cambia la chiave'); a.addCancelAction('Chiudi');
  const r = await a.presentSheet();
  if (r === 2) { const b = new Alert(); b.title = 'Codice dell\'andamento'; b.message = 'Lo trovi in Ritmo, Impostazioni, Andamento nel widget.'; b.addTextField('codice'); b.addAction('Salva'); b.addCancelAction('Annulla'); if (await b.presentAlert() === 0) { const c = b.textFieldValue(0).trim(); if (/^[0-9a-f]{20,}$/i.test(c)) Keychain.set(STATO, c); } }
  if (r === 3 && Keychain.contains(KEYNAME)) Keychain.remove(KEYNAME);
  return r;
}
const SYM = (n, size, color) => { const s2 = SFSymbol.named(n) || SFSymbol.named('circle'); s2.applyFont(Font.semiboldSystemFont(size)); const im = s2.image; return { im, color }; };
function addSym(st, n, size, color) { const x = SYM(n, size, color); const i = st.addImage(x.im); i.imageSize = new Size(size + 2, size + 2); i.tintColor = color; return i; }
function symFor(t) {
  if (t.key === 'palestra') return 'dumbbell'; if (t.key === 'karate') return 'figure.martial.arts'; if (t.key === 'uscita') return 'party.popper';
  if (t.cat === 'studio') return { 'KRR': 'point.3.connected.trianglepath.dotted', 'Fisica': 'atom', 'Computer Programming': 'chevron.left.forwardslash.chevron.right', 'Analisi': 'function', 'Computational Logic': 'gearshape.2' }[t.label] || 'book';
  return { nerina: 'briefcase', sociale: 'person.2', impegno: 'calendar', ripetizione: 'person.crop.rectangle', corpo: 'figure.run' }[t.cat] || 'calendar';
}
/* Anello di avanzamento disegnato. */
function ringImg(pct, col, track, size) {
  const d = new DrawContext(); d.size = new Size(size * 3, size * 3); d.opaque = false; d.respectScreenScale = false;
  const r = size * 1.5 - 9, cx = size * 1.5, cy = size * 1.5;
  d.setStrokeColor(track); d.setLineWidth(12); d.strokeEllipse(new Rect(cx - r, cy - r, 2 * r, 2 * r));
  if (pct > 0) { const pth = new Path(), n = Math.max(2, Math.round(80 * pct)); for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + 2 * Math.PI * pct * i / n, pt = new Point(cx + r * Math.cos(a), cy + r * Math.sin(a)); if (i) pth.addLine(pt); else pth.move(pt); }
    d.addPath(pth); d.setStrokeColor(col); d.setLineWidth(12); d.strokePath(); }
  return d.getImage();
}
function moodOf(p, L) {
  const open = p.tasks.filter((t) => !p.fatti[t.key]), anti = (p.st.anticipati || []).length, all = p.tasks.length + anti, done = all - open.length;
  const late = open.filter((t) => t.end <= L.min && !t.ev && t.key !== 'karate' && t.key !== 'uscita').length, pct = all ? done / all : 1;
  const m = !all ? ['leaf', 'Libera', '#4E9A6A'] : !open.length ? ['trophy', 'Tutto fatto', '#E2A63B'] : !done && L.min < p.tasks[0].start ? ['sun.max', 'Si parte', '#E2A63B']
    : late >= 2 ? ['timer', 'Un po\' indietro', '#D98A3D'] : late ? ['clock', 'Quasi in pari', '#D9B23C'] : anti || p.items.some((i) => i.prima) ? ['bolt', 'In anticipo', '#46C27A']
    : pct >= .5 ? ['flame', 'Che ritmo', '#EE8A4C'] : done ? ['chart.line.uptrend.xyaxis', 'In pari', '#46C27A'] : ['target', 'Si comincia', '#8FA0D6'];
  return { sym: m[0], t: m[1], col: m[2], done, all, pct, late };
}

/* ---------- ORNRARV: codice del giorno e tema del mese ---------- */
const SEQ = 'ORNRARV', MESI = ['Foliaio', 'Brumale', 'Ianuario', 'Germinale', 'Floreale', 'Messidoro', 'Estiario'];
const FASI = { O: 'Osservare', R1: 'Remare', N: 'Navigare', R2: 'Remare', A: 'Automatizzare', R3: 'Remare', V: 'Validare' };
const LCOL = { O: '#3D6FB4', R1: '#E0745A', N: '#D9B23C', R2: '#B23A2E', A: '#8A8F94', R3: '#7A1F1F', V: '#4B8F5A' };
const LCOL_DARK = { O: '#7EA6E6', R1: '#F08E76', N: '#E8C55A', R2: '#E06A5C', A: '#B4B8BD', R3: '#D07070', V: '#7CC48E' };
const THEMES = [['#F2E4D5', '#3B2418'], ['#232B3B', '#E7E9F2'], ['#EEF3F5', '#233238'], ['#EAF3E7', '#2A3B29'], ['#F1F8EC', '#2E3B22'], ['#FBF2D9', '#3B3012'], ['#F7E9CE', '#3A2E14']];
const lkey = (l, i) => l === 'R' ? (i === 3 ? 'R2' : i === 5 ? 'R3' : 'R1') : l;
function ornOf(date) {
  const n = dayDiff('2026-09-21', date); if (n < 0 || n >= 343) return null;
  const mi = Math.floor(n / 49), r = n % 49, wi = Math.floor(r / 7), di = r % 7, dark = mi === 1, P = dark ? LCOL_DARK : LCOL;
  return { mi, wi, dark, letters: [[SEQ[mi], P[lkey(SEQ[mi], mi)]], [SEQ[wi], P[lkey(SEQ[wi], wi)]], [SEQ[di], P[lkey(SEQ[di], di)]]],
    fict: `${r + 1} ${MESI[mi]}`, fase: FASI[lkey(SEQ[di], di)], bg: THEMES[mi][0], ink: THEMES[mi][1] };
}

/* ---------- disegno ---------- */
const CC = { nerina: '#3F7A5A', studio: '#44609A', corpo: '#B06A40', sociale: '#965172', impegno: '#6D6394', ripetizione: '#6D6394' };
const CC_DARK = { nerina: '#7CC79C', studio: '#93ACE6', corpo: '#E59E70', sociale: '#E096BA', impegno: '#B3A9E0', ripetizione: '#B3A9E0' };
async function background(o, fam) {
  if (!o) return null;
  const f = fam === 'large' ? 'l' : fam === 'small' ? 's' : 'm', name = `${o.mi}-${o.wi}-${f}.jpg`;
  const path = fm.joinPath(fm.documentsDirectory(), 'ritmo-img-' + name);
  if (fm.fileExists(path)) return fm.readImage(path);
  try { const img = await new Request(BASE + 'widget-img/' + name).loadImage(); fm.writeImage(path, img); return img; } catch (e) { return null; }
}
let SHADOW = null;
function T(stack, s2, size, color, weight, lines) {
  const t = stack.addText(s2); t.textColor = color; t.lineLimit = lines || 1; t.minimumScaleFactor = .75;
  if (SHADOW) { t.shadowColor = SHADOW; t.shadowRadius = 3; t.shadowOffset = new Point(0, 0); }
  t.font = weight === 'h' ? Font.boldSystemFont(size) : weight === 'b' ? Font.semiboldSystemFont(size) : weight === 'm' ? Font.mediumSystemFont(size) : Font.systemFont(size);
  return t;
}
function codeRow(st, o, size, sub) {
  const r = st.addStack(); r.centerAlignContent(); r.spacing = 1;
  o.letters.forEach(([l, c], i) => { if (i) T(r, '·', size, sub); T(r, l, size, new Color(c), 'h'); });
  r.addSpacer(7); T(r, o.fict, size, sub, 'm');
  return r;
}
function taskRow(st, t, ink, sub, P, isNow, size, done) {
  const r = st.addStack(); r.centerAlignContent(); r.spacing = 7;
  const tc = r.addStack(); tc.size = new Size(size > 13 ? 44 : 38, 0); T(tc, fmt(t.start), size, isNow ? ink : sub, 'b'); tc.addSpacer();
  addSym(r, done ? 'checkmark.circle.fill' : symFor(t), size - 1, done ? new Color('#46C27A') : new Color(P[t.cat] || '#8D9AA2'));
  T(r, t.label, size, done ? sub : ink, isNow ? 'b' : 'm');
  r.addSpacer();
}
function progRow(st, md, ink, sub, size, track) {
  const r = st.addStack(); r.centerAlignContent(); r.spacing = 8;
  const ri = r.addImage(ringImg(md.pct, new Color('#46C27A'), track, size)); ri.imageSize = new Size(size, size);
  const tx = r.addStack(); tx.layoutVertically();
  const l1 = tx.addStack(); l1.centerAlignContent(); l1.spacing = 4; addSym(l1, md.sym, size * .36, new Color(md.col)); T(l1, md.t, size * .4, ink, 'h');
  T(tx, `${md.done}/${md.all} fatti${md.late ? ` · ${md.late} indietro` : ''}`, size * .32, sub, 'm');
  return r;
}
const whenDate = (date, min) => { const d = parseISO(date); d.setMinutes(min); return d; };

let FAM = 'large';
async function main() {
  const fam = config.widgetFamily || FAM;
  const w = new ListWidget();
  const key = await getKey();
  if (!key) { w.backgroundColor = new Color('#232B3B'); const t = w.addText('Ritmo'); t.font = Font.boldSystemFont(16); t.textColor = Color.white(); w.addSpacer(4); const m = w.addText('Apri lo script in Scriptable e incolla la chiave.'); m.font = Font.systemFont(12); m.textColor = new Color('#E7E9F2', .8); return w; }
  const data = await loadData(key), st0 = await loadStato(key);
  S.cfg = data.cfg || null; S.nerina = data.nerina || {}; S.file = data.eventi || [];
  if (st0) { S.giorni = st0.giorni || {}; S.settimane = st0.settimane || {}; S.miei = st0.miei || []; S.nascosti = st0.nascosti || []; S.pasti = st0.pasti || {}; }
  rebuildEvents();
  const L = nowLogical(), p = plan(L.date), o = ornOf(L.date), md = st0 ? moodOf(p, L) : null;
  const rest = p.tasks.filter((t) => t.end > L.min && !p.fatti[t.key]);
  const now = rest.find((t) => t.start <= L.min), nextT = rest.find((t) => t.start > L.min), focus = now || nextT;
  w.refreshAfterDate = focus ? whenDate(L.date, now ? now.end : nextT.start) : new Date(Date.now() + 30 * 60e3);

  if (fam === 'accessoryInline') { w.addText(`${o ? o.letters.map((x) => x[0]).join('.') + ' · ' : ''}${focus ? (now ? 'ora ' : fmt(focus.start) + ' ') + focus.label : 'giornata libera'}`); return w; }
  if (fam === 'accessoryCircular') { if (md) { const ri = w.addImage(ringImg(md.pct, Color.white(), new Color('#ffffff', .25), 60)); ri.imageSize = new Size(56, 56); ri.centerAlignImage(); return w; } const t = w.addText(o ? o.letters[2][0] : '·'); t.font = Font.boldRoundedSystemFont(28); t.centerAlignText(); return w; }
  if (fam === 'accessoryRectangular') {
    T(w, `${md ? md.done + '/' + md.all + '  ' : o ? o.letters.map((x) => x[0]).join('.') + '  ' : ''}${now ? 'adesso' : focus ? 'alle ' + fmt(focus.start) : 'oggi'}`, 12, Color.white(), 'm');
    T(w, focus ? focus.label : 'Giornata libera', 15, Color.white(), 'b');
    if (focus) T(w, `fino alle ${fmt(focus.end)}`, 12, Color.white());
    return w;
  }

  const ink = new Color(o ? o.ink : '#1E2024'), sub = new Color(o ? o.ink : '#1E2024', .72), P = o && o.dark ? CC_DARK : CC;
  w.backgroundColor = new Color(o ? o.bg : '#F6F4EF');
  if (o) SHADOW = new Color(o.bg, .9);
  const bg = await background(o, fam); if (bg) w.backgroundImage = bg;
  const after = focus ? rest.slice(rest.indexOf(focus) + 1) : [];
  const track = new Color(o ? o.ink : '#1E2024', .18);
  const head = (size) => { const hs = w.addStack(); hs.centerAlignContent(); if (o) codeRow(hs, o, size, sub); hs.addSpacer(); if (o && fam !== 'small') T(hs, o.fase, size, sub, 'm'); };

  if (fam === 'small') {
    w.setPadding(14, 14, 14, 14);
    if (md) progRow(w, md, ink, sub, 38, track); else head(12);
    w.addSpacer();
    T(w, focus ? (now ? 'Adesso' : 'Alle ' + fmt(focus.start)) : 'Oggi', 12, sub, 'm');
    T(w, focus ? focus.label : 'Giornata libera', 18, ink, 'h', md ? 2 : 3);
    if (focus) T(w, `fino alle ${fmt(focus.end)}`, 13, sub, 'm');
    return w;
  }

  if (fam === 'medium') {
    w.setPadding(14, 16, 14, 16);
    head(12); w.addSpacer(8);
    const cols = w.addStack(); cols.spacing = 14;
    const left = cols.addStack(); left.layoutVertically(); left.size = new Size(140, 0);
    if (md) { progRow(left, md, ink, sub, 40, track); left.addSpacer(8); }
    T(left, focus ? (now ? 'Adesso' : 'Alle ' + fmt(focus.start)) : 'Oggi', 12, sub, 'm');
    T(left, focus ? focus.label : 'Giornata libera', md ? 16 : 18, ink, 'h', 2);
    if (focus && !md) T(left, `fino alle ${fmt(focus.end)}`, 13, sub, 'm');
    left.addSpacer();
    const right = cols.addStack(); right.layoutVertically(); right.spacing = 6;
    T(right, after.length ? 'Poi' : 'Dopo', 12, sub, 'm');
    if (!after.length) T(right, 'Niente altro oggi', 13, ink, 'm');
    for (const t of after.slice(0, 3)) taskRow(right, t, ink, sub, P, false, 13);
    right.addSpacer();
    return w;
  }

  // grande: panoramica della giornata
  w.setPadding(16, 18, 16, 18);
  head(13); w.addSpacer(4);
  T(w, dayLong(L.date), 22, ink, 'h');
  w.addSpacer(md ? 10 : 14);
  if (md) { progRow(w, md, ink, sub, 50, track); w.addSpacer(12); }
  if (focus) {
    T(w, now ? 'Adesso' : `Tra ${dur(nextT.start - L.min)}`, 13, sub, 'm');
    T(w, focus.label, 24, ink, 'h', 2);
    T(w, now ? `fino alle ${fmt(focus.end)}` : `${fmt(focus.start)} - ${fmt(focus.end)}`, 15, ink, 'b');
  } else {
    T(w, 'Per oggi hai finito', 22, ink, 'h');
    const tp = plan(addDays(L.date, 1)), f2 = tp.tasks[0];
    if (f2) T(w, `Domani si parte alle ${fmt(f2.start)} con ${f2.label}`, 14, sub, 'm', 2);
  }
  w.addSpacer(14);
  if (after.length) {
    T(w, `Poi · fine verso le ${fmt(p.finish)}`, 13, sub, 'm'); w.addSpacer(6);
    for (const t of after.slice(0, md ? 3 : 4)) { taskRow(w, t, ink, sub, P, false, 15); w.addSpacer(7); }
    if (after.length > 4) T(w, `e altri ${after.length - 4}`, 12, sub, 'm');
  }
  w.addSpacer();
  return w;
}

try {
  let r = 0;
  if (!config.runsInWidget && !config.runsInAccessoryWidget && Keychain.contains(KEYNAME)) r = await menu();
  if (r === -1) { Script.complete(); return; }
  if (r === 1) FAM = 'medium';
  const widget = await main();
  if (config.runsInWidget) Script.setWidget(widget); else if (FAM === 'medium') await widget.presentMedium(); else await widget.presentLarge();
} catch (e) {
  const w = new ListWidget(); w.backgroundColor = new Color('#232B3B');
  const t = w.addText(e.message === 'chiave' ? 'Chiave sbagliata: riapri lo script e incollala di nuovo.' : 'Ritmo non riesce a caricare il piano. ' + e.message);
  t.font = Font.systemFont(12); t.textColor = new Color('#E7E9F2');
  if (config.runsInWidget) Script.setWidget(w); else await w.presentLarge();
}
Script.complete();
