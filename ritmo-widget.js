// RITMO-WIDGET v2.7 · widget e notifiche di Ritmo per Scriptable (iPhone). Generato da strumenti/costruisci_widget.py: non modificare ritmo-widget.js a mano.
// Mostra gli impegni del giorno, la data settale e il messaggio di feedback, calcolati con lo stesso nucleo dell'app.
// Senza «Andamento nel widget» vede solo gli impegni del file dei dati; collegato, vede anche quelli messi nell'app, le spunte e i piani.
const BASE = 'https://realininiccolo-oss.github.io/ritmo/';
const KEYNAME = 'ritmo-widget-chiave';
const fm = FileManager.local();
const cacheP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-dati.json');
const STATO = 'ritmo-widget-stato', statoP = fm.joinPath(fm.documentsDirectory(), 'ritmo-widget-stato.json');
const appP = fm.joinPath(fm.documentsDirectory(), 'ritmo-stato-app.json'); // lo stato mandato da Ritmo con «Manda le notifiche al telefono»

/* ==== NUCLEO di Ritmo v2 (copiato nel widget da strumenti/costruisci_widget.py: niente DOM qui dentro) ==== */
/* Tempo */
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const dowOf = (s) => parseISO(s).getDay();
const dayDiff = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const mondayOf = (s) => addDays(s, -((dowOf(s) + 6) % 7));
const toMin = (t, after) => { if (!t) return null; const [hh, mm] = String(t).split(':').map(Number); let v = hh * 60 + (mm || 0); if (after != null && v <= after) v += 1440; return v; };
const fmt = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return Math.floor(m / 60) + ':' + pad(m % 60); };
const hm = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
const dur = (m) => { m = Math.round(m); const hh = Math.floor(m / 60), r = m % 60; return hh ? (r ? `${hh}h${pad(r)}` : `${hh}h`) : `${r} min`; };
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const WD = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MOS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
/* Il giorno "logico" finisce alle 4 di notte: a mezzanotte e mezza è ancora oggi. */
function nowLogical() { const n = new Date(); const l = new Date(n.getTime() - 4 * 3600e3); return { date: iso(l), min: n.getHours() * 60 + n.getMinutes() + (n.getHours() < 4 ? 1440 : 0), hour: n.getHours() }; }

/* Calendario settale ORNRARV: dal lunedì 21 settembre 2026, 7 mesi x 7 settimane x 7 giorni. */
const ORN_START = '2026-09-21', SEQ = 'ORNRARV';
const MESI = ['Foliaio', 'Brumale', 'Ianuario', 'Germinale', 'Floreale', 'Messidoro', 'Estiario'];
const FASI = { O: 'Osservare', R: 'Remare', N: 'Navigare', A: 'Automatizzare', V: 'Validare' };
function settale(date) {
  const n = dayDiff(ORN_START, date); if (n < 0 || n >= 343) return null;
  const mi = Math.floor(n / 49), r = n % 49, wi = Math.floor(r / 7), di = r % 7;
  return { n, mi, wi, di, num: r + 1, mese: MESI[mi], l: SEQ[di], wl: SEQ[wi], ml: SEQ[mi], code: `${SEQ[mi]}.${SEQ[wi]}.${SEQ[di]}`, fase: FASI[SEQ[di]], sett: FASI[SEQ[wi]],
    first: addDays(ORN_START, mi * 49), weekStart: addDays(ORN_START, mi * 49 + wi * 7) };
}
const gWD = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
const dLetter = (d) => { const o = settale(d); return o ? o.l : gWD[dowOf(d)]; };
const dNum = (d) => { const o = settale(d); return o ? o.num : parseISO(d).getDate(); };
const dTitle = (d) => { const o = settale(d); return o ? `${o.num} ${o.mese}` : `${parseISO(d).getDate()} ${MOS[parseISO(d).getMonth()]}`; };
const greg = (d) => { const x = parseISO(d); return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}`; };
function relWord(d, today) { const k = dayDiff(today, d); return k === 0 ? 'Oggi' : k === 1 ? 'Domani' : k === -1 ? 'Ieri' : cap(WD[dowOf(d)]); }
/* Alba e tramonto a Erbusco (lat 45,6 · lon 10,0) con la formula della NOAA: minuti dalla mezzanotte, ora locale. Errore di qualche minuto. */
function sunTimes(d, lat = 45.6, lon = 9.97) {
  const x = parseISO(d), N = Math.round((x - new Date(x.getFullYear(), 0, 0)) / 864e5), g = 2 * Math.PI / 365 * (N - .5);
  const eq = 229.18 * (.000075 + .001868 * Math.cos(g) - .032077 * Math.sin(g) - .014615 * Math.cos(2 * g) - .040849 * Math.sin(2 * g));
  const dc = .006918 - .399912 * Math.cos(g) + .070257 * Math.sin(g) - .006758 * Math.cos(2 * g) + .000907 * Math.sin(2 * g) - .002697 * Math.cos(3 * g) + .00148 * Math.sin(3 * g);
  const la = lat * Math.PI / 180, ha = Math.acos(Math.cos(90.833 * Math.PI / 180) / (Math.cos(la) * Math.cos(dc)) - Math.tan(la) * Math.tan(dc)) * 180 / Math.PI;
  const tz = -new Date(x.getFullYear(), x.getMonth(), x.getDate(), 12).getTimezoneOffset();
  return [Math.round(720 - 4 * (lon + ha) - eq + tz), Math.round(720 - 4 * (lon - ha) - eq + tz)];
}
/* Paesaggio: di giorno dall'alba al tramonto, di notte il resto (o fisso dalle Impostazioni). Vale per tutti i mesi. */
function variantFor(mi, when, pr) {
  if (pr === 'giorno' || pr === 'notte') return pr;
  const t = when instanceof Date ? when : new Date(), m = t.getHours() * 60 + t.getMinutes(), [a, b] = sunTimes(iso(t));
  return m >= a && m < b ? 'giorno' : 'notte';
}

/* Categorie degli impegni */
const CATS = {
  uni: { n: 'Uni', ic: 'uni', min: 120, sym: 'graduationcap' },
  nerina: { n: 'Nerina', ic: 'nerina', min: 120, sym: 'leaf' },
  network: { n: 'Network', ic: 'rete', min: 60, sym: 'point.3.connected.trianglepath.dotted' },
  social: { n: 'Social', ic: 'persone', min: 120, sym: 'person.2' },
  palestra: { n: 'Palestra', ic: 'pesi', min: 90, sym: 'dumbbell' },
  karate: { n: 'Karate', ic: 'karate', min: 120, sym: 'figure.martial.arts' },
  altro: { n: 'Altro', ic: 'impegno', min: 60, sym: 'calendar' },
  scadenza: { n: 'Scadenza', ic: 'bandiera', min: 0, sym: 'flag' },
  festa: { n: 'Festa', ic: 'festa', min: 0, sym: 'sparkles' },
  ricorrenza: { n: 'Ricorrenza', ic: 'regalo', min: 0, sym: 'gift' }
};
const NEW_CATS = ['uni', 'nerina', 'network', 'social', 'palestra', 'karate'];
const CAT_COL = { uni: '#4A6FA5', nerina: '#3E8A63', network: '#7A62AD', social: '#C05A7D', palestra: '#B5832B', karate: '#2E8A8C', altro: '#6E85B8', scadenza: '#E2603F', festa: '#D08A2E', ricorrenza: '#A0559A' };
const CAT_COL_DARK = { uni: '#8DB0EC', nerina: '#74CC9C', network: '#B29DF0', social: '#F293B6', palestra: '#EBBE66', karate: '#62CFCF', altro: '#A3B6E6', scadenza: '#FF8C6B', festa: '#F2B45E', ricorrenza: '#E3A0D8' };
/* Vecchi tipi della v1 riportati alle categorie nuove */
const LEGACY = { scuola: 'uni', studio: 'uni', lavoro: 'nerina', sociale: 'social', persone: 'social', promemoria: 'scadenza' };
const catOf = (e) => { const t = LEGACY[e.tipo] || e.tipo; return CATS[t] ? t : 'altro'; };
const isAllDay = (e) => !e.inizio && !e.flessibile;

/* Stato: S.file = dati del file cifrato, S.miei = impegni aggiunti sul telefono, S.giorni = spunte, piano e umore per giorno */
const S = { file: [], miei: [], nascosti: [], giorni: {}, nerina: {}, cfg: null, versione: null, eventi: [], pref: {}, soldi: { base: 0, mov: [] } };
const PREF0 = { sveglia: '08:30', letto: '00:00', paesaggio: 'auto', avviso: 10, sera: '21:30' };
const pref = () => ({ ...PREF0, ...((S.cfg && S.cfg.sonno) || {}), ...S.pref });
/* 2.6: ricorrenze e feste messe dal telefono con «ogni anno» (ogni: 'anno') compaiono anche nei tre anni dopo; le copie hanno orig = id dell'originale */
const yearly = (e) => { if (e.ogni !== 'anno') return [e]; const [y, m, d] = e.data.split('-').map(Number);
  return [0, 1, 2, 3].map((k) => { const dd = m === 2 && d === 29 && (y + k) % 4 ? 28 : d; return k ? { ...e, data: `${y + k}-${pad(m)}-${pad(dd)}`, id: e.id + '~' + (y + k), orig: e.id } : e; }); };
const rebuildEvents = () => { const hid = new Set(S.nascosti); S.eventi = [...S.file.filter((e) => !hid.has(e.id)).map((e) => ({ ...e, src: 'file' })), ...S.miei.flatMap(yearly).map((e) => ({ ...e, src: 'mio' }))]; };
const evKey = (e) => 'e:' + e.id;
const dayRec = (d) => S.giorni[d] || {};
const isPlanned = (d) => !!dayRec(d).pianificato;
const isDone = (d, e) => !!(dayRec(d).fatti || {})[evKey(e)];
/* Sveglia e ora di andare a letto del giorno (si possono cambiare per un giorno solo mentre lo si pianifica) */
/* Il sonno vero: S.giorni[n].sonno = { s: quando sei andato a letto la notte di n, e: quando ti sei svegliato (null = dormi ancora), stima: ora di letto stimata }.
   Come i blocchi: la sveglia vera sposta l'inizio della giornata dopo, l'ora vera di letto ne sposta la fine; finché dormi la notte si allunga con l'orologio. */
const SLEEP_MAX = 16 * 3600e3;
const sleepOn = (n) => { const z = dayRec(n).sonno; return z && z.s ? z : null; };
const sleepRun = (z) => !!(z && !z.e && Date.now() - z.s < SLEEP_MAX);
function dayBounds(d) {
  const p = pref(), r = dayRec(d), pv = sleepOn(addDays(d, -1)), sl = sleepOn(d);
  let wake = toMin(r.sveglia || p.sveglia); const bed0 = toMin(r.letto || p.letto);
  let bed = bed0 <= wake ? bed0 + 1440 : bed0;
  const nowM = msMin(d, Date.now());
  if (pv && pv.e) wake = msMin(d, pv.e); else if (sleepRun(pv) && nowM > 0) wake = Math.max(wake, nowM);
  if (sl) bed = Math.max(wake + 30, msMin(d, sl.s));
  return { wake, bed, wakeReal: !!(pv && pv.e), sleptMin: pv && pv.e ? Math.round((pv.e - pv.s) / 60000) : null, stima: !!(pv && pv.stima), asleepAM: sleepRun(pv), bedReal: !!sl, asleepPM: sleepRun(sl) };
}
/* Iniziato / terminato: i tempi veri di un impegno, in S.giorni[d].corso[chiave] = { s: quando è iniziato, e: quando è finito (null = in corso) }.
   Finché è in corso il blocco parte dall'ora vera e si allunga con l'orologio; quando lo termini resta con la durata vera. */
const corsoOf = (d, e) => ((dayRec(d).corso || {})[evKey(e)]) || null;
const msMin = (d, ms) => Math.round((ms - parseISO(d).getTime()) / 60000);
/* Tutto quello che c'è in un giorno */
function dayModel(d) {
  const evs = S.eventi.filter((e) => e.data === d), nowM = msMin(d, Date.now());
  const timed = evs.filter((e) => e.inizio || (e.flessibile && corsoOf(d, e))).map((e) => {
    let s = e.inizio ? toMin(e.inizio) : 0, en = e.inizio && e.fine ? toMin(e.fine, s) : s + (Number(e.durata) || 60);
    const plan = e.inizio ? [s, en] : null, c = corsoOf(d, e), len = Math.max(5, en - s);
    if (c) { s = msMin(d, c.s); en = c.e ? Math.max(s + 1, msMin(d, c.e)) : Math.max(s + len, Math.min(nowM, 1680)); }
    return { key: evKey(e), ev: e, cat: catOf(e), title: e.titolo, dove: e.dove || '', start: s, end: en, done: isDone(d, e), run: !!(c && !c.e), real: !!c, plan };
  }).sort((a, b) => a.start - b.start || b.end - a.end);
  const allDay = evs.filter(isAllDay).map((e) => ({ key: evKey(e), ev: e, cat: catOf(e), title: e.titolo }));
  const todo = evs.filter((e) => !e.inizio && e.flessibile && !corsoOf(d, e)).map((e) => ({ key: evKey(e), ev: e, cat: catOf(e), title: e.titolo, len: Number(e.durata) || 60, done: isDone(d, e) }));
  const B = dayBounds(d);
  const A0 = Math.min(B.wake, ...timed.map((t) => t.start)), B0 = Math.max(B.bed, ...timed.map((t) => t.end));
  const free = freeWindows(timed, B.wake, B.bed);
  const busy = timed.reduce((a, t) => a + Math.max(0, Math.min(t.end, B.bed) - Math.max(t.start, B.wake)), 0);
  return { date: d, timed, allDay, todo, wake: B.wake, bed: B.bed, sonno: B, A: A0, B: B0, free, busy, freeMin: free.reduce((a, [x, y]) => a + y - x, 0), nerina: S.nerina[d] || null, rec: dayRec(d) };
}
function freeWindows(timed, a, b, from) {
  const out = []; let cur = Math.max(a, from || a);
  for (const t of [...timed].sort((x, y) => x.start - y.start)) { if (t.start > cur) out.push([cur, Math.min(t.start, b)]); cur = Math.max(cur, t.end); if (cur >= b) break; }
  if (cur < b) out.push([cur, b]);
  return out.filter(([x, y]) => y - x >= 15);
}
/* Giorni pianificati di fila fino a oggi (oggi conta se è già pianificato) */
function planStreak(today) { let n = 0, d = isPlanned(today) ? today : addDays(today, -1); while (isPlanned(d) && n < 400) { n++; d = addDays(d, -1); } return n; }

/* Messaggio di feedback: lo stesso nell'app e nel widget. tone: acc (da fare), ok (bene), calm (niente da segnalare) */
function feedback(d, L) {
  const m = dayModel(d), t = m.timed, today = d === L.date, tom = addDays(d, 1);
  const doneN = t.filter((x) => x.done).length;
  const tail = (x) => x.dove ? ` · ${x.dove}` : '';
  if (!today) {
    const k = dayDiff(L.date, d);
    if (k < 0) return t.length ? { sym: doneN === t.length ? 'checkmark.seal' : 'clock.arrow.circlepath', ic: doneN === t.length ? 'check' : 'orologio', tone: doneN === t.length ? 'ok' : 'calm', text: doneN === t.length ? 'Tutto fatto' : `${doneN} di ${t.length} segnati come fatti`, sub: 'Giornata passata' } : { sym: 'moon', ic: 'luna', tone: 'calm', text: 'Giornata passata', sub: 'Niente di fissato' };
    const head = t.length ? `${t.length === 1 ? '1 impegno' : t.length + ' impegni'}, il primo alle ${fmt(t[0].start)}` : 'Nessun impegno fissato';
    return isPlanned(d) ? { sym: 'checkmark.circle', ic: 'check', tone: 'ok', text: head, sub: `Pianificata · ${dur(m.freeMin)} libere` } : { sym: 'square.and.pencil', ic: 'matita', tone: 'acc', text: head, sub: `Da pianificare · ${dur(m.freeMin)} libere`, act: 'pianifica' };
  }
  const B = dayBounds(d), pv = sleepOn(addDays(d, -1)), sl = sleepOn(d);
  if (sleepRun(sl)) return { sym: 'moon.zzz', ic: 'luna', tone: 'calm', text: 'Buonanotte', sub: `A letto dalle ${fmt(msMin(d, sl.s))} · quando ti svegli tocca «Sveglio»`, go: { a: 'sveglio' } };
  if (sleepRun(pv)) return { sym: 'sun.horizon', ic: 'sole', tone: 'acc', text: 'Buongiorno', sub: `Dormi dalle ${fmt(msMin(addDays(d, -1), pv.s))} · segna la sveglia`, go: { a: 'sveglio' } };
  if (!pv && L.min < B.wake + 150 && L.min >= B.wake - 120) return { sym: 'sun.horizon', ic: 'sole', tone: 'acc', text: 'Buongiorno', sub: 'Segna la sveglia: l\'ora di letto la stimo dal tuo orario', go: { a: 'sveglio' } };
  const run = t.find((x) => x.run);
  if (run) { const el = Math.max(1, L.min - run.start), over = run.plan ? el - (run.plan[1] - run.plan[0]) : 0;
    return { sym: 'timer', ic: 'play', tone: 'acc', text: `In corso: ${run.title}`, sub: `da ${dur(el)} · iniziato alle ${fmt(run.start)}${over >= 5 ? ` · ${dur(over)} oltre il previsto` : ''}`, go: { a: 'termina', key: run.key } }; }
  const now = t.find((x) => x.start <= L.min && x.end > L.min && !x.done && !x.real), next = t.find((x) => x.start > L.min && !x.done && !x.real);
  const missed = t.filter((x) => x.end <= L.min && !x.done).length;
  if (now) return { sym: 'play.circle', ic: 'play', tone: 'acc', text: `Adesso: ${now.title}`, sub: `fino alle ${fmt(now.end)}${tail(now)}${next ? ` · poi ${next.title} alle ${fmt(next.start)}` : ''}`, go: { a: 'inizia', key: now.key } };
  if (!sl && L.min >= B.bed - 45) return { sym: 'bed.double', ic: 'luna', tone: 'acc', text: L.min >= B.bed ? 'È ora di dormire' : `Tra ${dur(B.bed - L.min)} a letto`, sub: `Orario: ${fmt(B.bed)} · tocca quando vai a dormire`, go: { a: 'dormo' } };
  if (next && next.start - L.min <= 90) return { sym: 'clock', ic: 'orologio', tone: 'acc', text: `Tra ${dur(next.start - L.min)}: ${next.title}`, sub: `alle ${fmt(next.start)}${tail(next)}`, go: next.start - L.min <= 20 ? { a: 'inizia', key: next.key } : null };
  if (L.min >= 19 * 60 && !isPlanned(tom)) { const mt = dayModel(tom).timed; return { sym: 'square.and.pencil', ic: 'matita', tone: 'acc', text: 'Domani è ancora da pianificare', sub: mt.length ? `Hai già ${mt.length === 1 ? '1 impegno' : mt.length + ' impegni'}, il primo alle ${fmt(mt[0].start)}` : 'Per ora è tutto libero', act: 'pianifica-domani' }; }
  if (missed && L.min >= 17 * 60) return { sym: 'checklist', ic: 'check', tone: 'acc', text: missed === 1 ? '1 impegno da segnare' : `${missed} impegni da segnare`, sub: `Hai fatto ${doneN} di ${t.length}?` };
  if (t.length && doneN === t.length) { const st = planStreak(d); return { sym: 'checkmark.seal', ic: 'check', tone: 'ok', text: 'Tutto fatto per oggi', sub: `${doneN} su ${t.length}${st > 1 ? ` · ${st} giorni pianificati di fila` : ''}` }; }
  if (next) { const gap = next.start - L.min; return { sym: 'calendar', ic: 'calendario', tone: 'calm', text: `Prossimo alle ${fmt(next.start)}: ${next.title}`, sub: `${dur(gap)} libere prima${doneN ? ` · ${doneN} di ${t.length} fatti` : ''}` }; }
  if (!isPlanned(d) && L.min < 19 * 60) { const fr = freeWindows(t, m.wake, m.bed, L.min).reduce((a, [x, y]) => a + y - x, 0); return { sym: 'square.and.pencil', ic: 'matita', tone: 'acc', text: t.length ? 'Il resto di oggi è libero' : 'Oggi non c\'è niente di fissato', sub: `${dur(fr)} libere · pianifica la giornata`, act: 'pianifica' }; }
  if (isPlanned(tom)) return { sym: 'moon.stars', ic: 'luna', tone: 'ok', text: 'Domani è già pianificato', sub: (() => { const mt = dayModel(tom).timed; return mt.length ? `Si parte alle ${fmt(mt[0].start)} con ${mt[0].title}` : 'Nessun impegno fissato'; })() };
  return { sym: 'sun.max', ic: 'sole', tone: 'calm', text: 'Niente altro per oggi', sub: doneN ? `${doneN} di ${t.length} fatti` : 'Giornata libera' };
}
/* Notifiche: i promemoria dei prossimi giorni, calcolati qui e programmati da Scriptable sul telefono.
   Un avviso prima di ogni impegno con orario (pref().avviso minuti prima, 0 = niente) e, la sera, «domani è da pianificare» (pref().sera, '' = niente). */
function promemoria(nowMs, days, conSera) {
  const p = pref(), L = nowLogical(), out = [], av = Number(p.avviso) || 0;
  const at = (d, min) => { const x = parseISO(d); x.setMinutes(min); return x.getTime(); };
  for (let i = 0; i < (days || 3); i++) {
    const d = addDays(L.date, i), m = dayModel(d), o = settale(d);
    if (av > 0) for (const t of m.timed) {
      if (t.done || t.real) continue;
      const when = at(d, t.start - av); if (when <= nowMs + 30e3) continue;
      out.push({ id: `ritmo:${d}:${t.ev.id}:${t.start}:${t.end}:${av}:${t.title}`, at: when, title: `${av >= 60 ? 'Tra ' + dur(av) : 'Tra ' + av + ' min'} · ${t.title}`,
        body: `${fmt(t.start)}–${fmt(t.end)}${t.dove ? ' · ' + t.dove : ''}${o ? ' · ' + o.num + ' ' + o.mese : ''}` });
    }
    if (p.sera && conSera && i < 2) {
      const tom = addDays(d, 1), when = at(d, toMin(p.sera));
      if (when > nowMs + 30e3 && !isPlanned(tom)) {
        const mt = dayModel(tom).timed;
        out.push({ id: `ritmo:${d}:sera:${p.sera}:${mt.length}`, at: when, title: 'Domani è da pianificare', body: mt.length ? `${mt.length === 1 ? '1 impegno' : mt.length + ' impegni'}, il primo alle ${fmt(mt[0].start)}. Apri Ritmo e tocca Pianifica.` : 'Per ora è tutto libero. Apri Ritmo e tocca Pianifica.' });
      }
    }
  }
  return out.sort((a, b) => a.at - b.at).slice(0, 48);
}
/* ==== FINE NUCLEO ==== */

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
  const path = fm.joinPath(fm.documentsDirectory(), 'ritmo8-img-' + name);
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
