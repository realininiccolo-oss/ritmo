// RITMO-WIDGET · widget di Ritmo per Scriptable (iPhone). Generato da strumenti/costruisci_widget.py: non modificare ritmo-widget.js a mano.
// Mostra il piano del giorno calcolato come nell'app (stesse regole, stessi dati cifrati). Spunte e spostamenti fatti nell'app
// restano sul telefono dentro l'app e qui non si vedono.
const BASE = 'https://realininiccolo-oss.github.io/ritmo/';
const KEYNAME = 'ritmo-widget-chiave';
const fm = FileManager.local();
const cacheP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-dati.json');
const STATO = 'ritmo-widget-stato', statoP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-stato.json');

/* Regole della settimana tipo. Il file dei dati (data.enc.json) può sovrascriverle. */
const DEF = {
  giorno: { inizio: '09:00', inizioDomenica: '10:00', fineLavoro: '23:30' },
  /* Sonno: 8h30 a notte; a letto di base a mezzanotte, più tardi se la sera finisce tardi, prima se la mattina dopo si parte presto. */
  sonno: { ore: 510, letto: '00:00', sera: 45, mattina: 30, primaImpegno: 45 },
  /* Pasti da 15 minuti, messi ogni giorno nel posto migliore della loro fascia; allenamenti almeno 1h30 dopo un pasto. */
  pasti: { min: 15, pranzo: { ideale: '13:00', da: '12:00', a: '14:30' }, cena: { ideale: '20:00', da: '19:00', a: '21:30' }, merenda: { dopoPranzo: 120, primaCena: 90 } },
  allenamento: { dopoPasto: 90 },
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
const TASK_TIPI = ['impegno', 'ripetizione', 'sociale', 'scuola', 'lavoro', 'palestra', 'karate', 'salute'];
const CATN = { nerina: 'Lavoro', studio: 'Scuola', corpo: 'Palestra', sociale: 'Persone', impegno: 'Impegno', ripetizione: 'Ripetizione' };
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
const evCat = (e) => ({ sociale: 'sociale', ripetizione: 'ripetizione', scuola: 'studio', lavoro: 'nerina', palestra: 'corpo', karate: 'corpo' })[e.tipo] || 'impegno';
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
  const z = c.sonno || DEF.sonno, wake = toMin(z.letto, 600) + z.ore - 1440;
  const D0 = Math.max(wake + z.mattina, dow === 0 ? toMin(c.giorno.inizioDomenica) : 0), D1 = toMin(z.letto, 600) - z.sera;
  const isK = kar === d;
  let free = D1 - D0 - 3 * ((c.pasti && c.pasti.min) || 15);
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

/* Primo inizio e ultima fine degli impegni fissi di un giorno (impegni con orario, blocchi fissati, karate, uscita). */
function fixedSpan(d) {
  const c = cfg(), st = S.giorni[d] || {}, skip = st.skip || {}; let first = null, last = null;
  const take = (a, b) => { if (first == null || a < first) first = a; if (last == null || b > last) last = b; };
  for (const e of eventsOn(d)) if (e.inizio && !e.flessibile && TASK_TIPI.includes(e.tipo)) { const s = toMin(e.inizio); take(s, s + evLen(e)); }
  for (const x of (st.extra || [])) if (x.at && !skip[x.key]) { const s = toMin(x.at, 240); take(s, s + x.min); }
  if (weekPlan(mondayOf(d)).kar === d && !skip.karate) take(toMin(c.karate.inizio), toMin(c.karate.fine));
  if (dowOf(d) === c.sociale.uscitaGiorno && !skip.uscita) { const s = toMin(c.sociale.uscitaInizio); take(s, toMin(c.sociale.uscitaFine, s)); }
  return { first, last };
}
/* La notte dopo il giorno d: ora di letto (minuti di d, anche oltre le 24) e sveglia (minuti del giorno dopo). */
function night(d) {
  const z = cfg().sonno || DEF.sonno;
  let bed = toMin(z.letto, 600);
  const a = fixedSpan(d), b = fixedSpan(addDays(d, 1));
  if (a.last != null && a.last + 30 > bed) bed = a.last + 30;
  let wake = bed + z.ore - 1440;
  if (b.first != null && wake > b.first - z.primaImpegno) { wake = b.first - z.primaImpegno; bed = wake + 1440 - z.ore; }
  return { bed, wake };
}

/* ---------- il pianificatore della giornata ---------- */
function plan(date) {
  const c = cfg(), dow = dowOf(date), st = S.giorni[date] || {}, skip = st.skip || {}, fatti = st.fatti || {};
  const wk = weekPlan(mondayOf(date));
  const weekend = dow === 0 || dow === 6;
  const z = c.sonno || DEF.sonno, wake = night(addDays(date, -1)).wake, bedT = night(date).bed;
  const D0 = Math.max(wake + z.mattina, dow === 0 ? toMin(c.giorno.inizioDomenica) : 0);
  const D1 = bedT - z.sera;
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
    add({ key: x.key, base: x.key, cat: x.cat, label: x.label, sub: x.da === date ? 'Spostato qui' : 'Spostato dal ' + dateShort(x.da), start: s, end: s + x.min, task: true, moved: true, pinned: true });
  }
  items.push({ key: 'sveglia', cat: 'sonno', label: 'Sveglia', start: wake, end: wake });
  items.push({ key: 'letto', cat: 'sonno', label: 'A letto', sub: `${dur(z.ore)} di sonno`, start: bedT, end: bedT });
  /* Pasti da 15 minuti. Orario del giorno (st.pasti) > orario preferito (S.pasti, fa da ideale) > fascia delle regole.
     Ogni pasto va nel punto libero più vicino all'ideale, mai nell'ora e mezza prima di un allenamento. */
  const ML = (c.pasti && c.pasti.min) || 15, GAP = (c.allenamento || DEF.allenamento).dopoPasto;
  const PW = (k) => { const m = (c.pasti || {})[k]; return m && m.ideale ? m : DEF.pasti[k]; };
  const trains = () => items.filter((i) => i.key === 'karate' || i.key === 'palestra' || (i.cat === 'corpo' && i.task));
  const nearTrain = (a, b) => trains().some((t) => b > t.start - GAP && a < t.end);
  const findSlot = (ideal, lo, hi, len, rule) => {
    let best = null;
    for (let x = Math.ceil(lo / 5) * 5; x + len <= hi; x += 5) {
      if (overlaps(x, x + len) || (rule && nearTrain(x, x + len))) continue;
      if (best == null || Math.abs(x - ideal) < Math.abs(best - ideal)) best = x;
    }
    return best;
  };
  const LABELS = { colazione: 'Colazione', pranzo: 'Pranzo', merenda: 'Merenda', cena: 'Cena' };
  const meal = (key, ideal, lo, hi) => {
    const own = (st.pasti || {})[key], mine = (S.pasti || {})[key];
    if (own && own.no) return null;
    if (own) { const x = toMin(own.da, 240); const it = { key, cat: 'pausa', label: LABELS[key], start: x, end: x + (own.min || ML), meal: true, own: true }; add(it); return it; }
    const len = (mine && mine.min) || ML; if (mine) ideal = toMin(mine.da, 240);
    let x = findSlot(ideal, lo, hi, len, true);
    if (x == null) x = findSlot(ideal, Math.max(wake, lo - 150), Math.min(bedT, hi + 120), len, true);
    if (x == null) x = findSlot(ideal, Math.max(wake, lo - 150), Math.min(bedT, hi + 120), len, false);
    if (x == null) return null;
    const it = { key, cat: 'pausa', label: LABELS[key], start: x, end: x + len, meal: true, mine: !!mine }; add(it); return it;
  };
  const colazione = meal('colazione', wake, wake, wake + 60);
  const pw = PW('pranzo'), pranzo = meal('pranzo', toMin(pw.ideale), toMin(pw.da), toMin(pw.a));

  for (const e of evs) {
    if (!e.flessibile || !TASK_TIPI.includes(e.tipo)) continue;
    const len = evLen(e);
    let s = earliest(len, toMin(e.dopo || '15:00')); if (s == null) s = earliest(len, D0);
    if (s != null) add({ key: 'e:' + e.id, cat: evCat(e), label: e.titolo, sub: 'da fissare', start: s, end: s + len, task: true, ev: e, flex: true });
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
    const len = c.palestra.durata, lo = toMin(c.palestra.dopo), hiI = toMin(c.palestra.fineIdeale);
    const mealOk = (x) => !items.some((m) => m.meal && m.end > x - GAP && m.start < x + len);
    const ok = (x) => !overlaps(x, x + len) && mealOk(x);
    let s = null;
    for (let x = Math.floor((hiI - len) / 5) * 5; x >= lo; x -= 5) if (ok(x)) { s = x; break; }
    if (s == null) for (let x = Math.ceil(lo / 5) * 5; x + len <= D1; x += 5) if (ok(x)) { s = x; break; }
    if (s == null) s = latest(len, lo, hiI); if (s == null) s = earliest(len, lo);
    if (s != null) add({ key: 'palestra', cat: 'corpo', label: 'Palestra', sub: '2h30, viaggio compreso', start: s, end: s + len, task: true });
    else unplaced.push({ key: 'palestra', label: 'Palestra', min: len, cat: 'corpo' });
  }
  const cw = PW('cena'), cena = meal('cena', toMin(cw.ideale), toMin(cw.da), toMin(cw.a));
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
  /* Merenda per ultima, attaccata a un altro blocco così non spezza il pomeriggio; se non c'è spazio, accorcia di 15 minuti lo studio. */
  (() => {
    const mr = (c.pasti || {}).merenda || DEF.pasti.merenda, own = (st.pasti || {}).merenda, mine = (S.pasti || {}).merenda;
    if (own) { meal('merenda', 0, 0, 0); return; }
    if (!pranzo || !cena) return;
    const len = (mine && mine.min) || ML, lo = pranzo.end + mr.dopoPranzo, hi = cena.start - mr.primaCena;
    const ideal = mine ? toMin(mine.da, 240) : Math.round((pranzo.end + cena.start) / 2 / 5) * 5;
    const put = (x) => add({ key: 'merenda', cat: 'pausa', label: 'Merenda', start: x, end: x + len, meal: true, mine: !!mine });
    const edgeIn = (a2, b2) => { let best = null;
      for (const [ga, gb] of gaps(a2, b2)) { if (gb - ga < len) continue; for (const x of [ga, gb - len]) if (!nearTrain(x, x + len) && (best == null || Math.abs(x - ideal) < Math.abs(best - ideal))) best = x; }
      return best; };
    let x = hi - lo >= len ? edgeIn(lo, hi) : null;
    const rebusy = () => { busy.length = 0; for (const i of items) if (i.end > i.start) busy.push([i.start, i.end]); };
    const flexW = (i) => i.task && !i.ev && !i.pinned && !i.bib && (i.cat === 'studio' || i.cat === 'nerina');
    if (x == null) { /* dentro un blocco di studio: lo divide in due */
      let bestX = null, bestI = null;
      for (const it of items) { if (it.cat !== 'studio' || it.bib || !it.task || it.pinned) continue;
        for (let y = Math.max(lo, it.start); y + len <= Math.min(hi + len, it.end); y += 5) {
          const p1 = y - it.start, p2 = it.end - y - len; if ((p1 && p1 < 30) || (p2 && p2 < 30) || nearTrain(y, y + len)) continue;
          if (bestX == null || Math.abs(y - ideal) < Math.abs(bestX - ideal)) { bestX = y; bestI = it; } } }
      if (bestI) {
        const it = bestI, end0 = it.end, ext = !overlaps(end0, end0 + len) && end0 + len <= D1;
        if (bestX > it.start) { it.end = bestX; const rest = end0 - bestX - len + (ext ? len : 0); if (rest > 0) items.push({ ...it, key: (it.base || it.key) + '.' + (bestX + len), start: bestX + len, end: bestX + len + rest }); }
        else { it.start = bestX + len; if (ext) it.end = end0 + len; }
        if (!ext) it.sub = [it.sub, `${len} min in meno`].filter(Boolean).join(' · ');
        rebusy(); x = bestX;
      }
    }
    if (x == null) { /* tra due blocchi: sposta di 15 minuti quelli attaccati dopo */
      const srt = items.filter((i) => i.end > i.start).sort((a2, b2) => a2.start - b2.start);
      const cands = srt.filter((i) => flexW(i) && i.end >= lo && i.end <= hi && !nearTrain(i.end, i.end + len)).sort((a2, b2) => Math.abs(a2.end - ideal) - Math.abs(b2.end - ideal));
      for (const it of cands) {
        const chain = []; let e2 = it.end, k = srt.indexOf(it) + 1, ok = true;
        while (k < srt.length && srt[k].start === e2) { if (!flexW(srt[k])) { ok = false; break; } chain.push(srt[k]); e2 = srt[k].end; k++; }
        if (!ok && !chain.length) continue;
        const limit = k < srt.length ? srt[k].start : D1, over = e2 + len - limit;
        const last = chain[chain.length - 1];
        if (over > 0 && !(last && last.cat === 'studio' && last.end - last.start - over >= 30)) continue;
        for (const c2 of chain) { c2.start += len; c2.end += len; }
        if (over > 0) { last.end -= over; last.sub = [last.sub, `${over} min in meno`].filter(Boolean).join(' · '); }
        rebusy(); x = it.end; break;
      }
    }
    if (x == null) x = edgeIn(Math.max(D0, lo - 60), Math.min(D1, hi + 60));
    if (x != null) put(x);
  })();

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
