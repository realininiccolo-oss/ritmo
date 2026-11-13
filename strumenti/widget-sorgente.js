// RITMO-WIDGET v2.4 · widget e notifiche di Ritmo per Scriptable (iPhone). Generato da strumenti/costruisci_widget.py: non modificare ritmo-widget.js a mano.
// Mostra gli impegni del giorno, la data settale e il messaggio di feedback, calcolati con lo stesso nucleo dell'app.
// Senza «Andamento nel widget» vede solo gli impegni del file dei dati; collegato, vede anche quelli messi nell'app, le spunte e i piani.
const BASE = 'https://realininiccolo-oss.github.io/ritmo/';
const KEYNAME = 'ritmo-widget-chiave';
const fm = FileManager.local();
const cacheP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-dati.json');
const STATO = 'ritmo-widget-stato', statoP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-stato.json');
const appP = fm.joinPath(fm.documentsDirectory(), 'ritmo-stato-app.json'); // lo stato mandato da Ritmo con «Manda le notifiche al telefono»

/*NUCLEO*/

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
async function loadStato(key) {
  if (!Keychain.contains(STATO)) return null;
  try {
    const j = await new Request('https://api.github.com/gists/' + Keychain.get(STATO) + '?t=' + Date.now()).loadJSON();
    const f = j.files && j.files['ritmo-stato.json']; if (!f) throw new Error('vuoto');
    const txt = decryptPkg(JSON.parse(f.content), key); fm.writeString(statoP, txt); return JSON.parse(txt);
  } catch (e) { return fm.fileExists(statoP) ? JSON.parse(fm.readString(statoP)) : null; }
}
/* lo stato più recente tra l'andamento (gist) e quello mandato direttamente dall'app */
function stateFromApp() { try { return fm.fileExists(appP) ? JSON.parse(fm.readString(appP)) : null; } catch (e) { return null; } }
function newest(a, b) { if (!a) return b; if (!b) return a; return (Number(b.t) || 0) > (Number(a.t) || 0) ? b : a; }

/* ---------- notifiche: le programma iOS, anche ad app chiusa ---------- */
async function syncNotifiche(list) {
  let pend = [];
  try { pend = await Notification.allPending(); } catch (e) { pend = []; }
  const mine = pend.filter((n) => String(n.identifier || '').startsWith('ritmo:'));
  const want = new Set(list.map((x) => x.id)), have = new Set(mine.map((n) => n.identifier));
  const stale = mine.map((n) => n.identifier).filter((id) => !want.has(id));
  if (stale.length) await Notification.removePending(stale);
  let nuove = 0;
  for (const x of list) {
    if (have.has(x.id)) continue;
    const n = new Notification(); n.identifier = x.id; n.title = x.title; n.body = x.body; n.threadIdentifier = 'ritmo'; n.sound = 'default';
    n.setTriggerDate(new Date(x.at)); await n.schedule(); nuove++;
  }
  return { tot: list.length, nuove, tolte: stale.length };
}
async function menu() {
  const a = new Alert(); a.title = 'Ritmo'; a.addAction('Anteprima grande'); a.addAction('Anteprima media'); a.addAction('Anteprima piccola');
  a.addAction(Keychain.contains(STATO) ? 'Cambia il codice dell\'andamento' : 'Collega l\'andamento'); a.addAction('Cambia la chiave'); a.addAction('Notifiche: prova e aggiorna'); a.addCancelAction('Chiudi');
  const r = await a.presentSheet();
  if (r === 3) { const b = new Alert(); b.title = 'Codice dell\'andamento'; b.message = 'Lo trovi in Ritmo, Impostazioni, Andamento nel widget.'; b.addTextField('codice'); b.addAction('Salva'); b.addCancelAction('Annulla'); if (await b.presentAlert() === 0) { const c = b.textFieldValue(0).trim(); if (/^[0-9a-f]{20,}$/i.test(c)) Keychain.set(STATO, c); } }
  if (r === 4 && Keychain.contains(KEYNAME)) Keychain.remove(KEYNAME);
  return r;
}

/* ---------- disegno ---------- */
function addSym(st, n, size, color) { const s2 = SFSymbol.named(n) || SFSymbol.named('circle'); s2.applyFont(Font.semiboldSystemFont(size)); const i = st.addImage(s2.image); i.imageSize = new Size(size + 2, size + 2); i.tintColor = color; return i; }
const THEMES = [['#F2E4D5', '#3B2418'], ['#232B3B', '#E7E9F2'], ['#EEF3F5', '#233238'], ['#EAF3E7', '#2A3B29'], ['#F1F8EC', '#2E3B22'], ['#FBF2D9', '#3B3012'], ['#F7E9CE', '#3A2E14']];
/* di notte (Ritmo 2.2): Brumale ha il suo disegno notturno come base; gli altri mesi hanno la versione blu notte */
const THEMES_N = [['#2A1F26', '#F1E6DA'], ['#232B3B', '#E7E9F2'], ['#122339', '#E8F0F6'], ['#15261F', '#E9F1E6'], ['#221C33', '#EEF5E8'], ['#0E2630', '#F5EEDB'], ['#221B2F', '#F6EEDC']];
const ACC = '#E2603F', ACC_DARK = '#FF8C6B';
function look(o) {
  const mi = o ? o.mi : 1, v = variantFor(mi, new Date(), pref().paesaggio);
  const [bg, ink] = mi === 1 ? (v === 'giorno' ? ['#E6EAEF', '#1E2733'] : THEMES[1]) : (v === 'notte' ? THEMES_N[mi] : THEMES[mi]);
  const dark = parseInt(bg.slice(1, 3), 16) < 90;
  return { mi, v, bg, ink, dark, acc: dark ? ACC_DARK : ACC, cols: dark ? CAT_COL_DARK : CAT_COL };
}
async function background(o, k, fam) {
  if (!o) return null;
  const f = fam === 'large' ? 'l' : fam === 'small' ? 's' : 'm', name = `${o.mi}-${o.wi}-${f}${o.mi === 1 ? (k.v === 'giorno' ? '-g' : '') : (k.v === 'notte' ? '-n' : '')}.jpg`;
  const path = fm.joinPath(fm.documentsDirectory(), 'ritmo4-img-' + name);
  if (fm.fileExists(path)) return fm.readImage(path);
  try { const img = await new Request(BASE + 'widget-img/' + name).loadImage(); fm.writeImage(path, img); return img; } catch (e) { return null; }
}
let SHADOW = null;
function T(stack, s2, size, color, weight, lines) {
  const t = stack.addText(s2); t.textColor = color; t.lineLimit = lines || 1; t.minimumScaleFactor = .7;
  if (SHADOW) { t.shadowColor = SHADOW; t.shadowRadius = 4; t.shadowOffset = new Point(0, 0); }
  t.font = weight === 'h' ? Font.boldSystemFont(size) : weight === 'b' ? Font.semiboldSystemFont(size) : weight === 'm' ? Font.mediumSystemFont(size) : Font.systemFont(size);
  return t;
}
function head(w, o, k, size, d) {
  const r = w.addStack(); r.centerAlignContent(); r.spacing = 6;
  const ink = new Color(k.ink), sub = new Color(k.ink, .72);
  T(r, o ? `${o.num} ${o.mese}` : dTitle(d), size + 3, ink, 'h');
  if (o) T(r, o.code, size - 1, sub, 'b');
  r.addSpacer();
  return r;
}
/* il riquadro del messaggio, su un fondo velato perché si legga sopra il paesaggio */
function feedbackBox(w, f, k, size, lines) {
  const box = w.addStack(); box.layoutHorizontally(); box.centerAlignContent(); box.spacing = 9;
  box.backgroundColor = new Color(k.bg, k.dark ? .62 : .74); box.cornerRadius = 13; box.setPadding(9, 11, 9, 11);
  const col = f.tone === 'ok' ? new Color(k.dark ? '#74B888' : '#4C8A5E') : f.tone === 'acc' ? new Color(k.acc) : new Color(k.ink, .7);
  addSym(box, f.sym, size + 2, col);
  const tx = box.addStack(); tx.layoutVertically(); tx.spacing = 1;
  T(tx, f.text, size, new Color(k.ink), 'b', lines || 2);
  if (f.sub) T(tx, f.sub, size - 3, new Color(k.ink, .72), 'm', 1);
  box.addSpacer(0);
  return box;
}
function evRow(st, t, k, size, L) {
  const r = st.addStack(); r.centerAlignContent(); r.spacing = 7;
  const tc = r.addStack(); tc.size = new Size(size > 13 ? 44 : 38, 0); T(tc, fmt(t.start), size, new Color(k.ink, t.end <= L.min && !t.done ? .55 : .85), 'b'); tc.addSpacer();
  addSym(r, t.run ? 'timer' : t.done ? 'checkmark.circle.fill' : (CATS[t.cat] || CATS.altro).sym, size - 1, new Color(t.done ? (k.dark ? '#74B888' : '#4C8A5E') : k.cols[t.cat] || k.cols.altro));
  T(r, t.title, size, new Color(k.ink, t.done ? .6 : 1), 'm');
  r.addSpacer();
  return r;
}
const whenDate = (date, min) => { const d = parseISO(date); d.setMinutes(min); return d; };

let FAM = 'large', NOTI = null;
async function main() {
  const fam = config.widgetFamily || FAM;
  const w = new ListWidget();
  const key = await getKey();
  if (!key) { w.backgroundColor = new Color('#1F2845'); T(w, 'Ritmo', 16, Color.white(), 'h'); w.addSpacer(4); T(w, 'Apri lo script in Scriptable e incolla la chiave.', 12, new Color('#F3F5FC', .8), 'm', 3); return w; }
  const data = await loadData(key), st0 = newest(await loadStato(key), stateFromApp());
  S.cfg = data.cfg || null; S.nerina = data.nerina || {}; S.file = data.eventi || [];
  if (st0) { S.giorni = st0.giorni || {}; S.miei = st0.miei || []; S.nascosti = st0.nascosti || []; S.pref = st0.pref || {}; }
  rebuildEvents();
  // dentro il widget iOS dà pochi secondi: le notifiche non devono mai bloccare il disegno
  let tm = null;
  try { const lim = config.runsInWidget ? 2500 : 15000; NOTI = await Promise.race([syncNotifiche(promemoria(Date.now(), 7, !!st0)), new Promise((_, no) => { tm = Timer.schedule(lim, false, () => no(new Error('tempo scaduto'))); })]); }
  catch (e) { NOTI = { err: e.message }; }
  if (tm) tm.invalidate();
  const L = nowLogical(), d = L.date, o = settale(d), m = dayModel(d);
  let f = feedback(d, L);
  if (!st0 && f.act) f = { ...f, sub: 'Collega l\'andamento da Ritmo per vedere i piani' };
  const rest = m.timed.filter((t) => t.end > L.min);
  const nxt = rest.find((t) => t.start > L.min), cur = rest.find((t) => t.start <= L.min);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60e3);
  if (cur) w.refreshAfterDate = whenDate(d, Math.min(cur.end, L.min + 15)); else if (nxt && nxt.start - L.min < 105) w.refreshAfterDate = whenDate(d, Math.max(L.min + 5, Math.min(nxt.start, L.min + 15)));

  if (fam === 'accessoryInline') { w.addText(`${o ? o.num + ' ' + o.mese.slice(0, 3) + ' · ' : ''}${f.text}`); return w; }
  if (fam === 'accessoryCircular') { const s = w.addStack(); s.layoutVertically(); s.centerAlignContent(); const t1 = s.addText(o ? o.l : '·'); t1.font = Font.boldRoundedSystemFont(22); t1.centerAlignText(); const t2 = s.addText(String(o ? o.num : parseISO(d).getDate())); t2.font = Font.semiboldRoundedSystemFont(13); t2.centerAlignText(); return w; }
  if (fam === 'accessoryRectangular') {
    T(w, `${o ? `${o.l} · ${o.num} ${o.mese}` : dTitle(d)}`, 12, Color.white(), 'm');
    T(w, f.text, 14, Color.white(), 'b', 2);
    if (f.sub) T(w, f.sub, 11, Color.white(), 'r');
    return w;
  }

  const k = look(o);
  w.backgroundColor = new Color(k.bg); SHADOW = new Color(k.bg, .9);
  const bg = await background(o, k, fam); if (bg) w.backgroundImage = bg;
  const ink = new Color(k.ink), sub = new Color(k.ink, .72);

  if (fam === 'small') {
    w.setPadding(13, 13, 13, 13);
    head(w, o, k, 13, d);
    T(w, o ? `${cap(WD[dowOf(d)])} · ${o.fase}` : cap(WD[dowOf(d)]), 11, sub, 'm');
    w.addSpacer();
    feedbackBox(w, { ...f, sub: f.sub && f.sub.length < 26 ? f.sub : '' }, k, 13, 3);
    return w;
  }
  if (fam === 'medium') {
    w.setPadding(13, 15, 13, 15);
    const hr = head(w, o, k, 14, d); T(hr, o ? o.fase : '', 12, sub, 'm');
    w.addSpacer(8);
    const cols = w.addStack(); cols.spacing = 12; cols.topAlignContent();
    const left = cols.addStack(); left.layoutVertically(); left.size = new Size(160, 0);
    feedbackBox(left, f, k, 13, 3); left.addSpacer();
    const right = cols.addStack(); right.layoutVertically(); right.spacing = 6;
    const list = rest.length ? rest : [];
    if (!list.length) T(right, m.timed.length ? 'Niente altro oggi' : 'Nessun impegno', 13, ink, 'm');
    for (const t of list.slice(0, 4)) evRow(right, t, k, 13, L);
    right.addSpacer();
    return w;
  }
  // grande: la giornata
  w.setPadding(16, 17, 16, 17);
  const hr = head(w, o, k, 19, d);
  T(w, `${cap(WD[dowOf(d)])} ${greg(d)}${o ? ' · ' + o.fase : ''}`, 13, sub, 'm');
  w.addSpacer(12);
  feedbackBox(w, f, k, 16, 2);
  w.addSpacer(14);
  T(w, m.timed.length ? `Oggi · ${m.timed.length} ${m.timed.length === 1 ? 'impegno' : 'impegni'}` : 'Oggi', 13, sub, 'b'); w.addSpacer(7);
  if (!m.timed.length) T(w, 'Nessun impegno fissato', 15, ink, 'm');
  const show = m.timed.length > 5 ? [...m.timed.filter((t) => t.end > L.min), ...m.timed.filter((t) => t.end <= L.min)].slice(0, 5).sort((a, b) => a.start - b.start) : m.timed;
  for (const t of show) { evRow(w, t, k, 15, L); w.addSpacer(7); }
  if (m.timed.length > 5) T(w, `e altri ${m.timed.length - 5}`, 12, sub, 'm');
  w.addSpacer();
  const tom = addDays(d, 1), mt = dayModel(tom);
  const fr = w.addStack(); fr.centerAlignContent(); fr.spacing = 6;
  addSym(fr, isPlanned(tom) ? 'checkmark.circle' : 'circle.dashed', 12, isPlanned(tom) ? new Color(k.dark ? '#74B888' : '#4C8A5E') : sub);
  const to = settale(tom);
  T(fr, `Domani${to ? ' ' + to.num + ' ' + to.mese : ''} · ${mt.timed.length ? `${mt.timed.length} ${mt.timed.length === 1 ? 'impegno' : 'impegni'}, dalle ${fmt(mt.timed[0].start)}` : 'libero'}${st0 ? (isPlanned(tom) ? ' · pianificato' : ' · da pianificare') : ''}`, 12, sub, 'm');
  void hr;
  return w;
}

async function avvisoNotifiche(prova) {
  const a = new Alert();
  if (!NOTI || NOTI.err) { a.title = 'Notifiche non programmate'; a.message = (NOTI && NOTI.err) || 'Qualcosa non è andato.'; }
  else {
    const pend = (await Notification.allPending()).filter((n) => String(n.identifier || '').startsWith('ritmo:')).sort((x, y) => x.nextTriggerDate - y.nextTriggerDate);
    const df = new DateFormatter(); df.locale = 'it_IT'; df.dateFormat = 'EEE HH:mm';
    a.title = pend.length ? `Notifiche pronte: ${pend.length}` : 'Nessuna notifica nei prossimi 7 giorni';
    a.message = pend.slice(0, 4).map((n) => `${df.string(n.nextTriggerDate)} · ${n.title}`).join('\n') + (prova ? '\n\nTra 5 secondi arriva una notifica di prova.' : '\n\nAnche il widget ora vede gli impegni di Ritmo. Puoi tornare su Ritmo.');
  }
  a.addAction('OK'); await a.presentAlert();
}
try {
  let r = 0;
  const q = args.queryParameters || {};
  if (q.notifiche) {
    // aperto da Ritmo: salvo lo stato che arriva dall'app, programmo le notifiche e basta
    if (q.stato) { try { const st = JSON.parse(q.stato); if (st && st.v === 2) fm.writeString(appP, JSON.stringify(st)); } catch (e) { /* stato non leggibile: uso quello che ho */ } }
    await main(); await avvisoNotifiche(false); Script.complete(); return;
  }
  if (config.runsWithSiri) { await main(); Script.complete(); return; } // da Comandi: aggiorna in silenzio le notifiche
  if (!config.runsInWidget && !config.runsInAccessoryWidget && Keychain.contains(KEYNAME)) r = await menu();
  if (r === 5) {
    await main();
    const n = new Notification(); n.identifier = 'ritmo-prova'; n.title = 'Ritmo · prova'; n.body = 'Le notifiche funzionano: arriveranno prima degli impegni.'; n.threadIdentifier = 'ritmo'; n.sound = 'default';
    n.setTriggerDate(new Date(Date.now() + 5000)); await n.schedule();
    await avvisoNotifiche(true); Script.complete(); return;
  }
  if (r === -1) { Script.complete(); return; }
  if (r === 1) FAM = 'medium'; if (r === 2) FAM = 'small';
  const widget = await main();
  if (config.runsInWidget) Script.setWidget(widget); else if (FAM === 'medium') await widget.presentMedium(); else if (FAM === 'small') await widget.presentSmall(); else await widget.presentLarge();
} catch (e) {
  const w = new ListWidget(); w.backgroundColor = new Color('#1F2845');
  const t = w.addText(e.message === 'chiave' ? 'Chiave sbagliata: riapri lo script e incollala di nuovo.' : 'Ritmo non riesce a caricare i dati. ' + e.message);
  t.font = Font.systemFont(12); t.textColor = new Color('#F3F5FC');
  if (config.runsInWidget) Script.setWidget(w); else await w.presentLarge();
}
Script.complete();
