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
const S = { cfg: null, nerina: {}, file: [], miei: [], nascosti: [], giorni: {}, settimane: {}, rotte: {}, pasti: {}, eventi: [], versione: null };
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
const fmt = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return Math.floor(m / 60) + ':' + pad(m % 60); };
const hm = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
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
  /* Pasti: orario del giorno (st.pasti) > orario scelto per sempre (S.pasti) > regole. */
  const meal = (key, label, m) => {
    const own = (st.pasti || {})[key], mine = karate && key === 'cena' ? null : (S.pasti || {})[key];
    if (own && own.no) return;
    const pick = own || mine;
    let s = pick ? toMin(pick.da) : toMin(m.da), e = pick ? s + pick.min : toMin(m.a); const len = e - s;
    if (own) { add({ key, cat: 'pausa', label, start: s, end: e, own: true }); return; }
    if (overlaps(s, e)) {
      const ov = busy.filter(([x, y]) => s < y && x < e).sort((p, q) => p[0] - q[0]);
      const before = ov[0][0] - len;
      if (!overlaps(before, before + len) && before >= D0) s = before; else s = Math.max(...ov.map((o) => o[1]));
      e = s + len;
    }
    add({ key, cat: 'pausa', label, start: s, end: e, mine: !!mine });
  };
  meal('pranzo', 'Pranzo', c.pasti.pranzo);
  meal('cena', 'Cena', karate ? c.pasti.cenaKarate : c.pasti.cena);

  for (const e of evs) {
    if (!e.flessibile || !TASK_TIPI.includes(e.tipo)) continue;
    const len = evLen(e);
    let s = earliest(len, toMin(e.dopo || '15:00')); if (s == null) s = earliest(len, D0);
    if (s != null) add({ key: 'e:' + e.id, cat: evCat(e), label: e.titolo, sub: '🕐 da fissare', start: s, end: s + len, task: true, ev: e, flex: true });
    else unplaced.push({ key: 'e:' + e.id, label: e.titolo, min: len, cat: evCat(e) });
  }

  const meno = st.meno || {}, less = (k) => (meno[k] || []).reduce((a, m) => a + m.min, 0);
  const study = ((c.studio[String(dow)]) || []).map((x, i) => ({ key: 's' + i, label: x.m, min: x.min - less('s' + i) })).filter((x) => !skip[x.key] && x.min > 0);
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
  for (const x of (st.extra || [])) { if (skip[x.key] || x.at || x.min - less(x.key) <= 0) continue; split(x.key, x.label, x.min - less(x.key), x.cat, 'Recupero dal ' + dateShort(x.da)); }

  items.sort((a, b) => a.start - b.start || a.end - b.end);
  /* Blocchi fatti con l'orario vero: restano dove li hai fatti. Se hai finito prima, o hai fatto in anticipo un blocco
     che veniva dopo, i blocchi attaccati che seguono partono prima (mai prima del momento in cui l'hai segnato). */
  const SHIFT_NO = ['karate', 'uscita', 'palestra'];
  const canShift = (i) => i.task && !i.ev && !i.moved && !SHIFT_NO.includes(i.key) && !fatti[i.key];
  const ruleFrom = (i) => i.key === 'n3' ? toMin(weekend ? c.nerina.b3Weekend : c.nerina.b3Feriale) : 0;
  const recs = items.filter((i) => i.task && fatti[i.key] && typeof fatti[i.key] === 'object');
  for (const d of recs) {
    const r = fatti[d.key], s0 = d.start, e0 = d.end;
    const hole = r.b < s0 ? s0 : r.b < e0 ? r.b : null;
    d.start = r.a; d.end = r.b; d.real = true;
    if (hole == null) continue;
    let cursor = hole, prevEnd = e0;
    const snap = items.map((i) => [i, i.start, i.end]).sort((x, y) => x[1] - y[1]);
    for (const [i, a, b] of snap) {
      if (i === d || a < prevEnd) continue;
      if (a > prevEnd + 2 || !canShift(i) || a < r.t) break;
      const ns = Math.max(cursor, r.t, ruleFrom(i));
      if (ns < a) { i.start = ns; i.end = ns + (b - a); i.prima = a - ns; }
      cursor = i.end; prevEnd = b;
    }
  }
  if (recs.length) items.sort((a, b) => a.start - b.start || a.end - b.end);
  const busy2 = items.filter((i) => !i.real || i.start >= D0).map((i) => [i.start, i.end]).sort((a, b) => a[0] - b[0]);
  const free = []; { let cur = D0; for (const [x, y] of busy2) { if (x - cur >= 60) free.push({ key: 'free' + cur, cat: 'libero', label: 'Libero', start: cur, end: Math.min(x, D1) }); cur = Math.max(cur, y); } if (D1 - cur >= 60) free.push({ key: 'free' + cur, cat: 'libero', label: 'Libero', start: cur, end: D1 }); }
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
  const skipped = [...Object.keys(skip).map((k) => ({ key: k, info: skip[k] })), ...Object.entries(meno).flatMap(([k, arr]) => arr.map((m) => ({ key: k, info: { a: m.a, x: m.x, fatto: m.fatto }, part: m.min })))];
  const notes = evs.filter((e) => !TASK_TIPI.includes(e.tipo));
  return { date, items, free, unplaced, fatti, st, tasks, skipped, notes, bib, wk, D0, D1, finish, load: { mente: mente / 60, corpo: corpo / 60, sociale } };
}
const loadLevel = (x) => x < 3 ? 1 : x < 6.5 ? 2 : x <= 9 ? 3 : x <= 10.5 ? 4 : 5;
const loadWord = (x) => ['', 'leggera', 'tranquilla', 'impegnativa', 'piena', 'molto piena'][loadLevel(x)];


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
function taskRow(st, t, ink, sub, P, isNow, size) {
  const r = st.addStack(); r.centerAlignContent(); r.spacing = 8;
  const tc = r.addStack(); tc.size = new Size(size > 13 ? 44 : 38, 0); T(tc, fmt(t.start), size, isNow ? ink : sub, 'b'); tc.addSpacer();
  const bar = r.addStack(); bar.size = new Size(3, size + 4); bar.cornerRadius = 1.5; bar.backgroundColor = new Color(P[t.cat] || '#8D9AA2');
  T(r, t.label, size, ink, isNow ? 'b' : 'm');
  r.addSpacer();
}
const whenDate = (date, min) => { const d = parseISO(date); d.setMinutes(min); return d; };

async function main() {
  const fam = config.widgetFamily || 'large';
  const w = new ListWidget();
  const key = await getKey();
  if (!key) { w.backgroundColor = new Color('#232B3B'); const t = w.addText('Ritmo'); t.font = Font.boldSystemFont(16); t.textColor = Color.white(); w.addSpacer(4); const m = w.addText('Apri lo script in Scriptable e incolla la chiave.'); m.font = Font.systemFont(12); m.textColor = new Color('#E7E9F2', .8); return w; }
  const data = await loadData(key);
  S.cfg = data.cfg || null; S.nerina = data.nerina || {}; S.file = data.eventi || []; rebuildEvents();
  const L = nowLogical(), p = plan(L.date), o = ornOf(L.date);
  const rest = p.tasks.filter((t) => t.end > L.min);
  const now = rest.find((t) => t.start <= L.min), nextT = rest.find((t) => t.start > L.min), focus = now || nextT;
  w.refreshAfterDate = focus ? whenDate(L.date, now ? now.end : nextT.start) : new Date(Date.now() + 30 * 60e3);

  if (fam === 'accessoryInline') { w.addText(`${o ? o.letters.map((x) => x[0]).join('.') + ' · ' : ''}${focus ? (now ? 'ora ' : fmt(focus.start) + ' ') + focus.label : 'giornata libera'}`); return w; }
  if (fam === 'accessoryCircular') { const t = w.addText(o ? o.letters[2][0] : '·'); t.font = Font.boldRoundedSystemFont(28); t.centerAlignText(); return w; }
  if (fam === 'accessoryRectangular') {
    T(w, `${o ? o.letters.map((x) => x[0]).join('.') + '  ' : ''}${now ? 'adesso' : focus ? 'alle ' + fmt(focus.start) : 'oggi'}`, 12, Color.white(), 'm');
    T(w, focus ? focus.label : 'Giornata libera', 15, Color.white(), 'b');
    if (focus) T(w, `fino alle ${fmt(focus.end)}`, 12, Color.white());
    return w;
  }

  const ink = new Color(o ? o.ink : '#1E2024'), sub = new Color(o ? o.ink : '#1E2024', .72), P = o && o.dark ? CC_DARK : CC;
  w.backgroundColor = new Color(o ? o.bg : '#F6F4EF');
  if (o) SHADOW = new Color(o.bg, .9);
  const bg = await background(o, fam); if (bg) w.backgroundImage = bg;
  const after = focus ? rest.slice(rest.indexOf(focus) + 1) : [];
  const head = (size) => { const hs = w.addStack(); hs.centerAlignContent(); if (o) codeRow(hs, o, size, sub); hs.addSpacer(); if (o && fam !== 'small') T(hs, o.fase, size, sub, 'm'); };

  if (fam === 'small') {
    w.setPadding(14, 14, 14, 14);
    head(12); w.addSpacer();
    T(w, focus ? (now ? 'Adesso' : 'Alle ' + fmt(focus.start)) : 'Oggi', 12, sub, 'm');
    T(w, focus ? focus.label : 'Giornata libera', 18, ink, 'h', 3);
    if (focus) T(w, `fino alle ${fmt(focus.end)}`, 13, sub, 'm');
    return w;
  }

  if (fam === 'medium') {
    w.setPadding(14, 16, 14, 16);
    head(12); w.addSpacer(8);
    const cols = w.addStack(); cols.spacing = 14;
    const left = cols.addStack(); left.layoutVertically(); left.size = new Size(140, 0);
    T(left, focus ? (now ? 'Adesso' : 'Alle ' + fmt(focus.start)) : 'Oggi', 12, sub, 'm');
    T(left, focus ? focus.label : 'Giornata libera', 18, ink, 'h', 2);
    if (focus) T(left, `fino alle ${fmt(focus.end)}`, 13, sub, 'm');
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
  w.addSpacer(14);
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
    for (const t of after.slice(0, 4)) { taskRow(w, t, ink, sub, P, false, 15); w.addSpacer(7); }
    if (after.length > 4) T(w, `e altri ${after.length - 4}`, 12, sub, 'm');
  }
  w.addSpacer();
  return w;
}

try {
  const widget = await main();
  if (config.runsInWidget) Script.setWidget(widget); else await widget.presentLarge();
} catch (e) {
  const w = new ListWidget(); w.backgroundColor = new Color('#232B3B');
  const t = w.addText(e.message === 'chiave' ? 'Chiave sbagliata: riapri lo script e incollala di nuovo.' : 'Ritmo non riesce a caricare il piano. ' + e.message);
  t.font = Font.systemFont(12); t.textColor = new Color('#E7E9F2');
  if (config.runsInWidget) Script.setWidget(w); else await w.presentLarge();
}
Script.complete();
