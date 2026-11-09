// RITMO-WIDGET · widget di Ritmo per Scriptable (iPhone). Generato da strumenti/costruisci_widget.py: non modificare ritmo-widget.js a mano.
// Mostra il piano del giorno calcolato come nell'app (stesse regole, stessi dati cifrati). Spunte e spostamenti fatti nell'app
// restano sul telefono dentro l'app e qui non si vedono.
const BASE = 'https://realininiccolo-oss.github.io/ritmo/';
const KEYNAME = 'ritmo-widget-chiave';
const fm = FileManager.local();
const cacheP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-dati.json');

/* Regole della settimana tipo. Il file dei dati (data.enc.json) può sovrascriverle. */
const DEF = {
  giorno: { inizio: '09:00', inizioDomenica: '10:00', fineLavoro: '23:30' },
  pasti: { pranzo: { da: '13:00', a: '13:45' }, cena: { da: '20:00', a: '20:45' }, cenaKarate: { da: '19:10', a: '19:50' } },
  nerina: { durata: 120, feriale: 3, sabato: 3, domenica: 1, b3Feriale: '16:00', b3Weekend: '13:45' },
  studio: {
    '1': [{ m: 'KRR', min: 180 }, { m: 'Fisica', min: 60 }],
    '2': [{ m: 'Computer Programming', min: 120 }, { m: 'Analisi', min: 120 }],
    '3': [{ m: 'Computational Logic', min: 180 }, { m: 'Computer Programming', min: 60 }],
    '4': [{ m: 'KRR', min: 180 }],
    '5': [{ m: 'Computational Logic', min: 120 }, { m: 'Analisi', min: 120 }]
  },
  palestra: { volte: 3, durata: 150, dopo: '14:00', fineIdeale: '20:00' },
  karate: { giorni: [2, 4], inizio: '20:00', fine: '22:00' },
  sociale: { biblioteca: 5, viaggio: 30, uscitaGiorno: 6, uscitaInizio: '21:00', uscitaFine: '00:30', obiettivo: 2 },
  soglia: { mente: 9 },
  cruscotto: 'https://claude.ai/artifact/GC8MBwH6aJJCGhLPCW3Bpf'
};
const NB = [
  { key: 'n1', label: 'Nerina · B1', sub: 'Leggi e prova il lavoro della notte' },
  { key: 'n2', label: 'Nerina · B2', sub: 'Lavoro a mano: account, prove, documenti' },
  { key: 'n3', label: 'Nerina · B3', sub: 'Prepara e lancia il prompt della notte' }
];
const TASK_TIPI = ['impegno', 'ripetizione', 'sociale'];
const CATN = { nerina: 'Lavoro · Nerina', studio: 'Scuola', corpo: 'Allenamento', sociale: 'Relazioni', impegno: 'Impegno', ripetizione: 'Ripetizione' };
const WD = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const WDS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MO = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MOS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

/* S.file = dati dal file cifrato; S.miei, S.nascosti, S.giorni, S.settimane = stato sul telefono */
const S = { cfg: null, nerina: {}, file: [], miei: [], nascosti: [], giorni: {}, settimane: {}, rotte: {}, eventi: [], versione: null };
const rebuildEvents = () => { const hid = new Set(S.nascosti); S.eventi = [...S.file.filter((e) => !hid.has(e.id)).map((e) => ({ ...e, src: 'file' })), ...S.miei]; };

/* ---------- tempo ---------- */
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const dowOf = (s) => parseISO(s).getDay();
const dayDiff = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const mondayOf = (s) => addDays(s, -((dowOf(s) + 6) % 7));
const toMin = (t, after) => { if (!t) return null; const [hh, mm] = String(t).split(':').map(Number); let v = hh * 60 + (mm || 0); if (after != null && v < after) v += 1440; return v; };
const fmt = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
const dur = (m) => { m = Math.round(m); const hh = Math.floor(m / 60), r = m % 60; return hh ? (r ? `${hh}h${pad(r)}` : `${hh}h`) : `${r} min`; };
const hrs = (x) => { const v = Math.round(x * 2) / 2; return (Number.isInteger(v) ? v : v.toFixed(1).replace('.', ',')) + 'h'; };
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const dayLong = (s) => { const d = parseISO(s); return `${cap(WD[d.getDay()])} ${d.getDate()} ${MO[d.getMonth()]}`; };
const dayShort = (s) => { const d = parseISO(s); return `${WDS[d.getDay()]} ${d.getDate()}`; };
const dateShort = (s) => { const d = parseISO(s); return `${d.getDate()} ${MOS[d.getMonth()]}`; };
function nowLogical() { const n = new Date(); const l = new Date(n.getTime() - 4 * 3600e3); return { date: iso(l), min: n.getHours() * 60 + n.getMinutes() + (n.getHours() < 4 ? 1440 : 0), hour: n.getHours() }; }
const nextSunday = (s) => addDays(s, dowOf(s) === 0 ? 7 : 7 - dowOf(s));

function cfg() {
  const c = S.cfg; if (!c) return DEF;
  const out = { ...DEF };
  for (const k of Object.keys(c)) out[k] = (c[k] && typeof c[k] === 'object' && !Array.isArray(c[k]) && DEF[k] && k !== 'studio') ? { ...DEF[k], ...c[k] } : c[k];
  return out;
}
const eventsOn = (d) => S.eventi.filter((e) => e.data === d);
const evCat = (e) => e.tipo === 'sociale' ? 'sociale' : e.tipo === 'ripetizione' ? 'ripetizione' : 'impegno';
const evLen = (e) => e.inizio && e.fine ? toMin(e.fine, toMin(e.inizio)) - toMin(e.inizio) : (Number(e.durata) || 60);
const nerinaCount = (c, dow) => dow === 0 ? c.nerina.domenica : dow === 6 ? c.nerina.sabato : c.nerina.feriale;

function estLoad(d) {
  const c = cfg(), dow = dowOf(d);
  let x = nerinaCount(c, dow) * c.nerina.durata / 60;
  x += (c.studio[String(dow)] || []).reduce((a, s) => a + s.min, 0) / 60;
  for (const e of eventsOn(d)) if (TASK_TIPI.includes(e.tipo) && e.tipo !== 'sociale') x += evLen(e) / 60 * (e.tipo === 'ripetizione' ? 0.6 : 0.8);
  return x;
}
/* Minuti liberi che restano dopo pasti, impegni, Nerina, studio e (se è quel giorno) karate. */
function slack(d, kar) {
  const c = cfg(), dow = dowOf(d), st = S.giorni[d] || {};
  const D0 = toMin(dow === 0 ? c.giorno.inizioDomenica : c.giorno.inizio), D1 = toMin(c.giorno.fineLavoro, 300);
  const isK = kar === d, cena = isK ? c.pasti.cenaKarate : c.pasti.cena;
  let free = D1 - D0 - (toMin(c.pasti.pranzo.a) - toMin(c.pasti.pranzo.da)) - (toMin(cena.a) - toMin(cena.da));
  if (isK) free -= toMin(c.karate.fine) - toMin(c.karate.inizio);
  for (const e of eventsOn(d)) {
    if (!TASK_TIPI.includes(e.tipo)) continue;
    if (e.inizio && !e.flessibile) { const s = toMin(e.inizio); free -= Math.max(0, Math.min(D1, s + evLen(e)) - Math.max(D0, s)); } else free -= evLen(e);
  }
  free -= nerinaCount(c, dow) * c.nerina.durata;
  const study = (c.studio[String(dow)] || []).reduce((a, s) => a + s.min, 0);
  free -= study;
  const bib = st.biblioteca !== undefined ? !!st.biblioteca : dow === c.sociale.biblioteca;
  if (bib && study) free -= 2 * c.sociale.viaggio;
  if (dow === c.sociale.uscitaGiorno && !(st.skip || {}).uscita) free -= Math.max(0, D1 - toMin(c.sociale.uscitaInizio));
  return free;
}
function eveningBusy(d, a, b) {
  return eventsOn(d).some((e) => e.inizio && !e.flessibile && TASK_TIPI.includes(e.tipo) && toMin(e.inizio) < b && toMin(e.inizio) + evLen(e) > a);
}
/* Sport della settimana: karate nella sera libera con più spazio; palestra nei 3 giorni con più tempo libero, non attaccati ad altro sport se si può. */
function weekPlan(mon) {
  const c = cfg(), ov = S.settimane[mon];
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(mon, i));
  let kar = null, gym = [];
  if (ov && 'karate' in ov) kar = ov.karate || null;
  else {
    const kS = toMin(c.karate.inizio) - 60, kE = toMin(c.karate.fine);
    const cands = days.filter((d) => c.karate.giorni.includes(dowOf(d)) && !eveningBusy(d, kS, kE));
    cands.sort((a, b) => (slack(b, b) - slack(a, a)) || (estLoad(a) - estLoad(b)) || (dowOf(b) - dowOf(a)));
    kar = cands[0] || null;
  }
  if (ov && Array.isArray(ov.palestra)) gym = ov.palestra.slice();
  else {
    const need = c.palestra.durata + 30;
    const sorted = days.filter((d) => d !== kar).sort((a, b) => (slack(b, kar) - slack(a, kar)) || (estLoad(a) - estLoad(b)) || a.localeCompare(b));
    const sport = new Set(kar ? [kar] : []);
    const adj = (d) => [...sport].some((x) => Math.abs(dayDiff(x, d)) === 1);
    const pick = (ok) => { for (const d of sorted) { if (gym.length >= c.palestra.volte) break; if (!gym.includes(d) && ok(d)) { gym.push(d); sport.add(d); } } };
    pick((d) => slack(d, kar) >= need && !adj(d));
    pick((d) => slack(d, kar) >= need);
    pick(() => true);
  }
  return { kar, gym: new Set(gym), auto: !ov };
}

/* ---------- il pianificatore della giornata ---------- */
function plan(date) {
  const c = cfg(), dow = dowOf(date), st = S.giorni[date] || {}, skip = st.skip || {}, fatti = st.fatti || {};
  const wk = weekPlan(mondayOf(date));
  const weekend = dow === 0 || dow === 6;
  const D0 = toMin(dow === 0 ? c.giorno.inizioDomenica : c.giorno.inizio);
  const D1 = toMin(c.giorno.fineLavoro, 300);
  const items = [], unplaced = [], busy = [];
  const occupy = (a, b) => busy.push([a, b]);
  const add = (it) => { items.push(it); occupy(it.start, it.end); };
  const overlaps = (a, b) => busy.some(([x, y]) => a < y && x < b);
  const gaps = (from, to) => {
    const bs = busy.filter(([x, y]) => y > from && x < to).sort((p, q) => p[0] - q[0]);
    const out = []; let cur = from;
    for (const [x, y] of bs) { if (x > cur) out.push([cur, Math.min(x, to)]); cur = Math.max(cur, y); if (cur >= to) break; }
    if (cur < to) out.push([cur, to]);
    return out.filter(([a, b]) => b > a);
  };
  const earliest = (len, from, to = D1) => { for (const [a, b] of gaps(from, to)) if (b - a >= len) return a; return null; };
  const latest = (len, from, to) => { const g = gaps(from, to); for (let i = g.length - 1; i >= 0; i--) if (g[i][1] - g[i][0] >= len) return g[i][1] - len; return null; };
  const evs = eventsOn(date);
  const karate = wk.kar === date && !skip.karate;

  for (const e of evs) {
    if (!e.inizio || e.flessibile || !TASK_TIPI.includes(e.tipo)) continue;
    const s = toMin(e.inizio);
    add({ key: 'e:' + e.id, cat: evCat(e), label: e.titolo, sub: [e.dove, e.nota].filter(Boolean).join(' · '), start: s, end: s + evLen(e), task: true, ev: e });
  }
  if (karate) add({ key: 'karate', cat: 'corpo', label: 'Karate', sub: 'Allenamento', start: toMin(c.karate.inizio), end: toMin(c.karate.fine), task: true });
  if (dow === c.sociale.uscitaGiorno && !skip.uscita) { const s = toMin(c.sociale.uscitaInizio); add({ key: 'uscita', cat: 'sociale', label: 'Serata fuori', sub: 'Amici, niente lavoro', start: s, end: toMin(c.sociale.uscitaFine, s), task: true }); }
  for (const x of (st.extra || [])) {
    if (skip[x.key] || !x.at) continue;
    const s = toMin(x.at, 240);
    add({ key: x.key, base: x.key, cat: x.cat, label: x.label, sub: x.da === date ? 'Spostato qui' : 'Spostato dal ' + dateShort(x.da), start: s, end: s + x.min, task: true, moved: true });
  }
  const meal = (key, label, m) => {
    let s = toMin(m.da), e = toMin(m.a); const len = e - s;
    if (overlaps(s, e)) {
      const ov = busy.filter(([x, y]) => s < y && x < e).sort((p, q) => p[0] - q[0]);
      const before = ov[0][0] - len;
      if (!overlaps(before, before + len) && before >= D0) s = before; else s = Math.max(...ov.map((o) => o[1]));
      e = s + len;
    }
    add({ key, cat: 'pausa', label, start: s, end: e });
  };
  meal('pranzo', 'Pranzo', c.pasti.pranzo);
  meal('cena', 'Cena', karate ? c.pasti.cenaKarate : c.pasti.cena);

  for (const e of evs) {
    if (!e.flessibile || !TASK_TIPI.includes(e.tipo)) continue;
    const len = evLen(e);
    let s = earliest(len, toMin(e.dopo || '15:00')); if (s == null) s = earliest(len, D0);
    if (s != null) add({ key: 'e:' + e.id, cat: evCat(e), label: e.titolo, sub: 'Orario da fissare: tocca per sceglierlo', start: s, end: s + len, task: true, ev: e, flex: true });
    else unplaced.push({ key: 'e:' + e.id, label: e.titolo, min: len, cat: evCat(e) });
  }

  const study = ((c.studio[String(dow)]) || []).map((x, i) => ({ key: 's' + i, label: x.m, min: x.min })).filter((x) => !skip[x.key]);
  const wantBib = st.biblioteca !== undefined ? !!st.biblioteca : dow === c.sociale.biblioteca;
  let bib = false;
  if (wantBib && study.length) {
    const v = c.sociale.viaggio, tot = study.reduce((a, x) => a + x.min, 0) + 2 * v;
    const s = earliest(tot, D0);
    if (s != null) {
      bib = true; let t = s;
      add({ key: 'via1', cat: 'viaggio', label: 'Verso Brescia', start: t, end: t + v }); t += v;
      for (const x of study) { add({ key: x.key, base: x.key, cat: 'studio', label: x.label, sub: 'In biblioteca a Brescia, in compagnia', start: t, end: t + x.min, task: true, bib: true }); t += x.min; }
      add({ key: 'via2', cat: 'viaggio', label: 'Ritorno a casa', start: t, end: t + v });
    }
  }
  if (wk.gym.has(date) && !skip.palestra) {
    const len = c.palestra.durata;
    let s = latest(len, toMin(c.palestra.dopo), toMin(c.palestra.fineIdeale));
    if (s == null) s = earliest(len, toMin(c.palestra.dopo));
    if (s != null) add({ key: 'palestra', cat: 'corpo', label: 'Palestra', sub: '2h30, viaggio compreso', start: s, end: s + len, task: true });
    else unplaced.push({ key: 'palestra', label: 'Palestra', min: len, cat: 'corpo' });
  }
  const nN = Math.min(3, nerinaCount(c, dow));
  let after = D0;
  for (let i = 0; i < nN; i++) {
    const b = NB[i]; if (skip[b.key]) continue;
    let from = after;
    if (i === 2) from = Math.max(after, toMin(weekend ? c.nerina.b3Weekend : c.nerina.b3Feriale));
    const len = c.nerina.durata, s = earliest(len, from);
    if (s != null) { add({ ...b, base: b.key, sub: nN === 1 ? 'Un solo blocco: la domenica è leggera' : b.sub, cat: 'nerina', start: s, end: s + len, task: true }); after = s + len; }
    else unplaced.push({ key: b.key, label: b.label, min: len, cat: 'nerina' });
  }
  const split = (base, label, min, cat, sub) => {
    let rem = min; const chunks = [];
    for (const [a, b] of gaps(D0, D1)) {
      if (rem <= 0) break;
      const len = Math.min(b - a, rem);
      if (len < 30 && len < min) continue;
      chunks.push([a, a + len]); occupy(a, a + len); rem -= len;
    }
    chunks.forEach(([a, b], i) => items.push({ key: chunks.length > 1 ? base + '.' + i : base, base, cat, label, sub: [sub, chunks.length > 1 ? `parte ${i + 1} di ${chunks.length}` : '', (rem > 0 && rem <= 15 && i === chunks.length - 1) ? `${rem} min in meno` : ''].filter(Boolean).join(' · '), start: a, end: b, task: true }));
    if (rem > 15) unplaced.push({ key: base, label, min: rem, cat, partial: rem < min });
  };
  if (!bib) for (const x of study) split(x.key, x.label, x.min, 'studio', '');
  for (const x of (st.extra || [])) { if (skip[x.key] || x.at) continue; split(x.key, x.label, x.min, x.cat, 'Recupero dal ' + dateShort(x.da)); }

  const free = gaps(D0, D1).filter(([a, b]) => b - a >= 60).map(([a, b]) => ({ key: 'free' + a, cat: 'libero', label: 'Libero', start: a, end: b }));
  items.sort((a, b) => a.start - b.start || a.end - b.end);
  let mente = 0, corpo = 0;
  for (const it of items) {
    const L = it.end - it.start;
    if (it.cat === 'nerina' || it.cat === 'studio') mente += L;
    else if (it.cat === 'impegno') mente += L * 0.8;
    else if (it.cat === 'ripetizione') mente += L * 0.6;
    else if (it.cat === 'corpo') corpo += L;
  }
  const sociale = (bib ? 1 : 0) + items.filter((i) => i.cat === 'sociale').length;
  const tasks = items.filter((i) => i.task);
  const work = tasks.filter((t) => t.cat !== 'sociale');
  const finish = work.length ? Math.max(...work.map((t) => t.end)) : null;
  const skipped = Object.keys(skip).map((k) => ({ key: k, info: skip[k] }));
  const notes = evs.filter((e) => !TASK_TIPI.includes(e.tipo));
  return { date, items, free, unplaced, fatti, st, tasks, skipped, notes, bib, wk, D0, D1, finish, load: { mente: mente / 60, corpo: corpo / 60, sociale } };
}
const loadLevel = (x) => x < 3 ? 1 : x < 6.5 ? 2 : x <= 9 ? 3 : x <= 10.5 ? 4 : 5;
const loadWord = (x) => ['', 'leggera', 'tranquilla', 'impegnativa', 'piena', 'oltre il limite'][loadLevel(x)];


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
