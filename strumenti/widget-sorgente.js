// RITMO-WIDGET · widget di Ritmo per Scriptable (iPhone). Generato da strumenti/costruisci_widget.py: non modificare ritmo-widget.js a mano.
// Mostra il piano del giorno calcolato come nell'app (stesse regole, stessi dati cifrati). Spunte e spostamenti fatti nell'app
// restano sul telefono dentro l'app e qui non si vedono.
const BASE = 'https://realininiccolo-oss.github.io/ritmo/';
const KEYNAME = 'ritmo-widget-chiave';
const fm = FileManager.local();
const cacheP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-dati.json');

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

/* ---------- ORNRARV: codice del giorno ---------- */
const SEQ = 'ORNRARV', MESI = ['Foliaio', 'Brumale', 'Ianuario', 'Germinale', 'Floreale', 'Messidoro', 'Estiario'];
const LCOL = { O: '#3D6FB4', R1: '#E0745A', N: '#D9B23C', R2: '#B23A2E', A: '#8A8F94', R3: '#7A1F1F', V: '#4B8F5A' };
const lkey = (l, i) => l === 'R' ? (i === 3 ? 'R2' : i === 5 ? 'R3' : 'R1') : l;
function ornCode(date) {
  const n = dayDiff('2026-09-21', date); if (n < 0 || n >= 343) return null;
  const mi = Math.floor(n / 49), r = n % 49, wi = Math.floor(r / 7), di = r % 7;
  return { letters: [[SEQ[mi], LCOL[lkey(SEQ[mi], mi)]], [SEQ[wi], LCOL[lkey(SEQ[wi], wi)]], [SEQ[di], LCOL[lkey(SEQ[di], di)]]], fict: `${r + 1} ${MESI[mi]}` };
}

/* ---------- disegno ---------- */
const CC = { nerina: '#3F7A5A', studio: '#44609A', corpo: '#B06A40', sociale: '#965172', impegno: '#6D6394', ripetizione: '#6D6394' };
const dyn = (a, b) => Color.dynamic(new Color(a), new Color(b));
const INK = dyn('#1E2024', '#ECEBE7'), MUTED = dyn('#6C6F76', '#A09F9A'), BG = dyn('#F6F4EF', '#141518');
function txt(stack, s2, size, color, weight) {
  const t = stack.addText(s2); t.textColor = color || INK; t.lineLimit = 1; t.minimumScaleFactor = .7;
  t.font = weight === 'b' ? Font.semiboldSystemFont(size) : weight === 'd' ? Font.semiboldRoundedSystemFont(size) : Font.systemFont(size);
  return t;
}
function codeRow(w, o, size) {
  const s2 = w.addStack(); s2.centerAlignContent();
  if (o) { o.letters.forEach(([l, c], i) => { if (i) txt(s2, '.', size, MUTED); txt(s2, l, size, new Color(c), 'b'); }); s2.addSpacer(6); txt(s2, o.fict, size - 1, MUTED); }
  return s2;
}
function whenDate(date, min) { const d = parseISO(date); d.setMinutes(min); return d; }

async function main() {
  const fam = config.widgetFamily || 'medium';
  const w = new ListWidget();
  w.backgroundColor = BG;
  const key = await getKey();
  if (!key) { w.setPadding(12, 14, 12, 14); txt(w, 'Ritmo', 15, INK, 'b'); w.addSpacer(4); const t = w.addText('Apri lo script in Scriptable per inserire la chiave.'); t.font = Font.systemFont(12); t.textColor = MUTED; return w; }
  const data = await loadData(key);
  S.cfg = data.cfg || null; S.nerina = data.nerina || {}; S.file = data.eventi || []; rebuildEvents();
  const L = nowLogical(), p = plan(L.date), o = ornCode(L.date);
  const rest = p.tasks.filter((t) => t.end > L.min);
  const now = rest.find((t) => t.start <= L.min);
  const nextT = rest.find((t) => t.start > L.min);
  w.refreshAfterDate = nextT ? whenDate(L.date, nextT.start) : new Date(Date.now() + 30 * 60e3);

  if (fam === 'accessoryInline') { const f = now || nextT; w.addText(`${o ? o.letters.map((x) => x[0]).join('.') + ' · ' : ''}${f ? fmt(f.start) + ' ' + f.label : 'giornata libera'}`); return w; }
  if (fam === 'accessoryCircular') { const t = w.addText(o ? o.letters[2][0] : '·'); t.font = Font.semiboldRoundedSystemFont(30); t.centerAlignText(); return w; }
  if (fam === 'accessoryRectangular') {
    const f = now || nextT;
    txt(w, `${o ? o.letters.map((x) => x[0]).join('.') + ' · ' : ''}${now ? 'adesso' : f ? 'alle ' + fmt(f.start) : 'oggi'}`, 12, null);
    txt(w, f ? f.label : 'Giornata libera', 15, null, 'b');
    if (f) txt(w, `fino alle ${fmt(f.end)}`, 12, null);
    return w;
  }

  w.setPadding(14, 16, 12, 16);
  const head = w.addStack(); head.centerAlignContent();
  const cs = head.addStack(); codeRow(cs, o, 13); head.addSpacer();
  txt(head, 'Testa ' + hrs(p.load.mente), 12, p.load.mente > cfg().soglia.mente ? new Color('#B04A3C') : MUTED);
  w.addSpacer(fam === 'small' ? 6 : 4);
  if (fam === 'small') {
    const f = now || nextT;
    txt(w, f ? (now ? 'Adesso' : 'Alle ' + fmt(f.start)) : 'Oggi', 12, MUTED);
    const t = w.addText(f ? f.label : 'Giornata libera'); t.font = Font.semiboldSystemFont(17); t.textColor = INK; t.lineLimit = 2; t.minimumScaleFactor = .7;
    if (f) txt(w, `fino alle ${fmt(f.end)}`, 12, MUTED);
    w.addSpacer();
    const n2 = rest[rest.indexOf(f) + 1]; if (n2) txt(w, `poi ${fmt(n2.start)} ${n2.label}`, 11, MUTED);
    return w;
  }
  txt(w, dayLong(L.date), 15, INK, 'd');
  w.addSpacer(6);
  const list = rest.slice(0, fam === 'large' ? 9 : 3);
  if (!list.length) txt(w, 'Niente altro in programma. Goditi la serata.', 13, MUTED);
  for (const t of list) {
    const r = w.addStack(); r.centerAlignContent(); r.spacing = 8;
    const tm = r.addText(fmt(t.start)); tm.font = Font.mediumMonospacedSystemFont(12); tm.textColor = t === now ? INK : MUTED;
    const bar = r.addStack(); bar.size = new Size(3, 14); bar.cornerRadius = 1.5; bar.backgroundColor = new Color(CC[t.cat] || '#8D9AA2');
    const lb = r.addText(t.label); lb.font = t === now ? Font.semiboldSystemFont(13) : Font.systemFont(13); lb.textColor = INK; lb.lineLimit = 1;
    w.addSpacer(4);
  }
  w.addSpacer();
  const left = p.tasks.filter((t) => t.end > L.min).length;
  txt(w, `${left} ${left === 1 ? 'blocco' : 'blocchi'} da qui a fine giornata · piano base`, 10, MUTED);
  return w;
}

try {
  const widget = await main();
  if (config.runsInWidget) Script.setWidget(widget); else await widget.presentMedium();
} catch (e) {
  const w = new ListWidget(); w.backgroundColor = BG;
  const t = w.addText(e.message === 'chiave' ? 'Chiave sbagliata: riapri lo script e incollala di nuovo.' : 'Ritmo non riesce a caricare il piano. ' + e.message);
  t.font = Font.systemFont(12); t.textColor = INK;
  if (config.runsInWidget) Script.setWidget(w); else await w.presentMedium();
}
Script.complete();
