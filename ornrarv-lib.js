/* ORNRARV · libreria grafica del Calendario ORNRARV (dal kit grafico del 9/11/2026, copiata senza modifiche
   tranne: MONTHS calcolato qui invece che dal JSON, todayStr impostabile, patternURI con colore e opacità facoltativi). */
(function () {
'use strict';
let todayStr = (() => { const n = new Date(); const p = x => String(x).padStart(2, '0'); return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`; })();
const PAPER = '#F7F4EC';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const LETTER_META = {
  'O':  { label: 'Observe',  color: '#3D6FB4', fg: '#FFFFFF', word: 'Osservare' },
  'R1': { label: 'Rowing',   color: '#E0745A', fg: '#2A1510', word: 'Remare (osservativo)' },
  'N':  { label: 'Navigate', color: '#D9B23C', fg: '#2A220C', word: 'Navigare' },
  'R2': { label: 'Rowing',   color: '#B23A2E', fg: '#FFFFFF', word: 'Remare (orientato)' },
  'A':  { label: 'Automate', color: '#8A8F94', fg: '#15181A', word: 'Automatizzare' },
  'R3': { label: 'Rowing',   color: '#7A1F1F', fg: '#FFFFFF', word: 'Remare (automatizzato)' },
  'V':  { label: 'Validate', color: '#4B8F5A', fg: '#FFFFFF', word: 'Validare' },
};
function metaKeyFor(letter, idx) {
  if (letter === 'R') return idx === 3 ? 'R2' : idx === 5 ? 'R3' : 'R1';
  return letter;
}
function dayBg(d, m) {
  return `color-mix(in srgb, color-mix(in srgb, ${d.cDay} 38%, color-mix(in srgb, ${d.cWeek} 30%, ${m.theme.bg})) 62%, ${m.theme.bg})`;
}

const MONTH_NAMES = ['Foliaio', 'Brumale', 'Ianuario', 'Germinale', 'Floreale', 'Messidoro', 'Estiario'];
const THEMES = [
  { bg: '#F2E4D5', bg2: '#E8CFB4', ink: '#3B2418', accent: '#B4502E', line: '#D9BE9C', motif: 'leaves' },
  { bg: '#232B3B', bg2: '#2E3550', ink: '#E7E9F2', accent: '#8FA0D6', line: '#3E4560', motif: 'mist' },
  { bg: '#EEF3F5', bg2: '#E1EBF0', ink: '#233238', accent: '#4E8EA8', line: '#CFE0E6', motif: 'frost' },
  { bg: '#EAF3E7', bg2: '#E9E1F0', ink: '#2A3B29', accent: '#7A9E63', line: '#D3E6CC', motif: 'sprout' },
  { bg: '#F1F8EC', bg2: '#F6E9F5', ink: '#2E3B22', accent: '#8E5FA3', line: '#DCEFD2', motif: 'petals' },
  { bg: '#FBF2D9', bg2: '#DFF1F2', ink: '#3B3012', accent: '#3E93A0', line: '#EEDFAE', motif: 'waves' },
  { bg: '#F7E9CE', bg2: '#DDF0EC', ink: '#3A2E14', accent: '#C68A2E', line: '#EAD3A1', motif: 'horizon' }
];
const SEQ = 'ORNRARV';
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const MONTHS = MONTH_NAMES.map((name, mi) => {
  const weeks = [];
  for (let wi = 0; wi < 7; wi++) {
    const days = [];
    for (let di = 0; di < 7; di++) {
      const n = mi * 49 + wi * 7 + di, dt = new Date(2026, 8, 21 + n);
      const dk = metaKeyFor(SEQ[di], di);
      days.push({ code: `${SEQ[mi]}.${SEQ[wi]}.${SEQ[di]}`, date: isoOf(dt), letter: SEQ[di], phase: LETTER_META[dk].word, fictNum: wi * 7 + di + 1,
        cMonth: THEMES[mi].accent, cWeek: LETTER_META[metaKeyFor(SEQ[wi], wi)].color, cDay: LETTER_META[dk].color, seed: n });
    }
    weeks.push({ weekLetter: SEQ[wi], weekPhase: LETTER_META[metaKeyFor(SEQ[wi], wi)].word, weekColor: LETTER_META[metaKeyFor(SEQ[wi], wi)].color, days });
  }
  return { num: mi + 1, letter: SEQ[mi], name, phase: LETTER_META[metaKeyFor(SEQ[mi], mi)].word, startDate: weeks[0].days[0].date, endDate: weeks[6].days[6].date, theme: THEMES[mi], weeks };
});

let illusUid = 0;
const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const waveD = (x0, x1, y, wl, amp) => { let d = `M${x0} ${y}`; for (let x = x0; x < x1; x += wl) d += `q${wl / 4} ${-amp} ${wl / 2} 0t${wl / 2} 0`; return d; };
const DR = (d, style, attrs) => `<path class="dr" pathLength="1" style="${style}" d="${d}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" ${attrs || ''}/>`;
const f2 = n => n.toFixed(2);

function illusFor(letter, posLabel, color) {
  const c = color;
  const open = `<svg class="lil lil-${posLabel}" viewBox="0 0 120 120" style="color:${c}" aria-hidden="true" focusable="false">`;
  switch (posLabel) {

    case 'O': {
      const id = 'lc' + (++illusUid);
      const lid = 'M12 60C32 30 88 30 108 60C88 90 32 90 12 60Z';
      let stri = '';
      for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; stri += `M${f2(60 + Math.cos(a) * 10.5)} ${f2(60 + Math.sin(a) * 10.5)}L${f2(60 + Math.cos(a) * 16.2)} ${f2(60 + Math.sin(a) * 16.2)}`; }
      const lashes = [[32.6, 43, 27, 35], [45.9, 38.6, 43, 29.5], [60, 37.2, 60, 27.5], [74.1, 38.6, 77, 29.5], [87.4, 43, 93, 35]]
        .map((l, k) => DR(`M${l[0]} ${l[1]}L${l[2]} ${l[3]}`, `--d:${f2(.6 + k * .07)}s;--t:.35s`, 'stroke-width="2.4"')).join('');
      return `${open}
        <defs><clipPath id="${id}"><path d="${lid}"/></clipPath></defs>
        <g class="o-halo">${DR('M8 42Q-1 60 8 78', '--d:1.1s;--t:.6s', 'stroke-width="2" stroke-opacity=".5"')}${DR('M112 42Q121 60 112 78', '--d:1.15s;--t:.6s', 'stroke-width="2" stroke-opacity=".5"')}</g>
        <g class="o-blink" style="transform-origin:60px 60px">
          <path class="fi" style="--d:.5s" d="${lid}" fill="currentColor" fill-opacity=".08"/>
          <g clip-path="url(#${id})"><g class="o-look" style="transform-origin:60px 60px"><g class="pp" style="--d:.75s">
            <circle cx="60" cy="60" r="19" fill="currentColor" fill-opacity=".2"/>
            <path d="${stri}" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".5"/>
            <circle cx="60" cy="60" r="19" fill="none" stroke="currentColor" stroke-width="2.6"/>
            <circle class="o-pupil" style="transform-origin:60px 60px" cx="60" cy="60" r="8.5" fill="currentColor"/>
            <circle cx="66" cy="54" r="3" fill="#fff" fill-opacity=".92"/>
            <circle cx="54.5" cy="65.5" r="1.4" fill="#fff" fill-opacity=".6"/>
          </g></g></g>
          ${DR(lid, '--t:1.1s', 'stroke-width="3.2"')}
          ${lashes}
        </g></svg>`;
    }

    case 'R1': {
      // Top view of a single scull. Bow left, rower faces the stern (right).
      // Drive (40% of the cycle) is quicker than the recovery, like real rowing.
      const hull = 'M10 60Q60 48 110 60Q60 72 10 60Z';
      const water = [[24, -10, '5 15'], [36, -3, '9 11'], [84, -7, '9 11'], [96, -14, '5 15']]
        .map(([y, x, da]) => `<path class="r1-water" d="M${x} ${y}H130" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".2" stroke-dasharray="${da}"/>`).join('');
      return `${open}
        <g class="fi" style="--d:.2s">${water}</g>
        <circle class="r1-pud" cx="62" cy="13" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
        <circle class="r1-pud" cx="62" cy="107" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
        <g class="fi" style="--d:1s"><path d="M107 60L118 53M107 60L118 67" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".4"/></g>
        <path class="fi" style="--d:.55s" d="${hull}" fill="currentColor" fill-opacity=".2"/>
        ${DR(hull, '--t:.9s', 'stroke-width="2"')}
        <path class="fi" style="--d:.9s" d="M24 60H98" stroke="currentColor" stroke-opacity=".3" stroke-width="1.2" stroke-linecap="round"/>
        ${DR('M60 54.5L58 44M60 65.5L58 76', '--d:.7s;--t:.4s', 'stroke-width="2"')}
        <g class="pp" style="--d:.95s"><g class="r1-oar-u" style="transform-origin:58px 44px">
          <path d="M64 57L49 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
          <ellipse cx="48.5" cy="11.5" rx="3.3" ry="7.5" transform="rotate(-19 48.5 11.5)" fill="currentColor"/>
          <path d="M64 57L60.2 53.8" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
        </g></g>
        <g class="pp" style="--d:1s"><g class="r1-oar-d" style="transform-origin:58px 76px">
          <path d="M64 63L49 106" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
          <ellipse cx="48.5" cy="108.5" rx="3.3" ry="7.5" transform="rotate(19 48.5 108.5)" fill="currentColor"/>
          <path d="M64 63L60.2 66.2" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
        </g></g>
        <g class="pp" style="--d:1.1s"><g class="r1-body">
          <ellipse cx="64" cy="60" rx="5" ry="8.5" fill="currentColor"/>
          <circle cx="67" cy="60" r="4.3" fill="currentColor" stroke="${PAPER}" stroke-width="1.3"/>
        </g></g>
      </svg>`;
    }

    case 'N': {
      // The needle spins in, overshoots and settles on the chosen heading (40°),
      // marked by the small triangle on the rim.
      let ticks = '';
      for (let k = 0; k < 16; k++) {
        const a = k * Math.PI / 8 - Math.PI / 2, maj = k % 4 === 0, r1 = maj ? 36.5 : 40, r2 = 44.5;
        ticks += DR(`M${f2(60 + Math.cos(a) * r1)} ${f2(60 + Math.sin(a) * r1)}L${f2(60 + Math.cos(a) * r2)} ${f2(60 + Math.sin(a) * r2)}`,
          `--d:${(.3 + k * .035).toFixed(3)}s;--t:.25s`, `stroke-width="${maj ? 2.4 : 1.3}"`);
      }
      return `${open}
        <path class="fi" style="--d:.3s" d="${circ(60, 60, 48)}" fill="currentColor" fill-opacity=".06"/>
        ${DR(circ(60, 60, 48), '--t:1s', 'stroke-width="3"')}
        ${DR(circ(60, 60, 41), '--d:.2s;--t:.9s', 'stroke-width="1.2" stroke-opacity=".5"')}
        ${ticks}
        <g class="fi" style="--d:.9s" font-family="Fraunces, Georgia, serif" fill="currentColor" text-anchor="middle">
          <text x="60" y="33" font-size="9.5" font-weight="700">N</text>
          <text x="87.5" y="63" font-size="7" fill-opacity=".65">E</text>
          <text x="60" y="93" font-size="7" fill-opacity=".65">S</text>
          <text x="32.5" y="63" font-size="7" fill-opacity=".65">O</text>
        </g>
        <g class="pp" style="--d:2.7s"><g class="n-mark"><path d="M92.8 20.9L99.6 19L93.5 13.9Z" fill="currentColor"/></g></g>
        <g class="n-spin" style="transform-origin:60px 60px"><g class="n-wob" style="transform-origin:60px 60px">
          <path d="M60 35L66.5 60H53.5Z" fill="currentColor"/>
          <path d="M60 35L60 60H53.5Z" fill="#fff" fill-opacity=".22"/>
          <path d="M60 85L66.5 60H53.5Z" fill="currentColor" fill-opacity=".3"/>
        </g></g>
        <circle class="pp" style="--d:.5s" cx="60" cy="60" r="4.6" fill="${PAPER}" stroke="currentColor" stroke-width="2"/>
      </svg>`;
    }

    case 'R2': {
      const hull = 'M14 82L104 82Q100 94 86 97L36 97Q22 94 14 82Z';
      return `${open}
        <g class="pp" style="--d:1.2s"><g class="r2-star" style="transform-origin:22px 24px"><path d="M22 15L24 22L31 24L24 26L22 33L20 26L13 24L20 22Z" fill="currentColor" fill-opacity=".75"/></g></g>
        <g class="r2-boat" style="transform-origin:60px 92px">
          ${DR('M60 84L60 14', '--d:.35s;--t:.5s', 'stroke-width="2.4"')}
          <g class="r2-raise" style="transform-origin:60px 77px">
            <g class="r2-main" style="transform-origin:62px 50px">
              <path d="M62 18Q82 44 94 76L62 76Z" fill="currentColor" fill-opacity=".82"/>
              <path d="M62 38Q72 44 80 52M62 56Q74 60 86 64" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.1"/>
            </g>
            <g class="r2-jib" style="transform-origin:58px 50px"><path d="M58 24L58 74L32 74Q42 50 58 24Z" fill="currentColor" fill-opacity=".45"/></g>
          </g>
          ${DR('M60 77.5L95 77.5', '--d:.55s;--t:.4s', 'stroke-width="2"')}
          <g class="r2-flag" style="transform-origin:60px 17px"><path class="fi" style="--d:1s" d="M60 14L72 17L60 20Z" fill="currentColor"/></g>
          <path class="fi" style="--d:.3s" d="${hull}" fill="currentColor" fill-opacity=".9"/>
          ${DR(hull, '--t:.8s', 'stroke-width="2.2"')}
          <path class="fi" style="--d:.8s" d="M22 88L98 88" stroke="#fff" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round"/>
        </g>
        <g class="fi" style="--d:.15s">
          <path class="r2-w1" d="${waveD(-40, 160, 99, 20, 3)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-opacity=".6"/>
          <path class="r2-w2" d="${waveD(-52, 172, 107, 26, 2.5)}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".3"/>
        </g>
      </svg>`;
    }

    case 'A': {
      // Three signal chains, each crossing the hub node; every node flashes
      // exactly when a pulse reaches it.
      const Np = [[44, 40], [76, 40], [38, 62], [60, 56], [82, 62], [50, 78], [70, 78]];
      const E = [[0, 3], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [3, 6], [4, 6], [0, 2], [1, 4], [5, 6]];
      const seg = (a, b) => `M${Np[a][0]} ${Np[a][1]}L${Np[b][0]} ${Np[b][1]}`;
      const edges = E.map(([a, b], k) => DR(seg(a, b), `--d:${f2(.75 + k * .04)}s;--t:.4s`, 'stroke-width="1.4" stroke-opacity=".38"')).join('');
      const pulses = [[0, 3, 0], [3, 6, .5], [2, 3, 1], [3, 4, 1.5], [1, 3, 2], [3, 5, 2.5]]
        .map(([a, b, t]) => `<path class="a-p" pathLength="1" style="--pd:${t}s" d="${seg(a, b)}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`).join('');
      const glows = [[0, 0, ''], [6, 1, ''], [2, 1, ''], [4, 2, ''], [1, 2, ''], [5, 3, ''], [3, .5, ' fast']]
        .map(([n, t, fcls]) => `<circle class="a-glow${fcls}" style="--gd:${t}s" cx="${Np[n][0]}" cy="${Np[n][1]}" r="3.6" fill="currentColor" fill-opacity=".45"/>`).join('');
      const nodes = Np.map((p, k) => k === 3
        ? `<g class="pp" style="--d:1.05s"><circle cx="60" cy="56" r="4.6" fill="currentColor"/><circle cx="60" cy="56" r="1.6" fill="${PAPER}"/></g>`
        : `<circle class="pp" style="--d:${f2(.95 + k * .06)}s" cx="${p[0]}" cy="${p[1]}" r="3.2" fill="currentColor"/>`).join('');
      const L = 'M60 22C46 16 30 24 31 37C21 41 19 56 27 62C21 73 29 86 41 85C46 96 58 97 60 88';
      const Rr = 'M60 22C74 16 90 24 89 37C99 41 101 56 93 62C99 73 91 86 79 85C74 96 62 97 60 88';
      const gyri = ['M34 44C40 40 45 46 51 42', 'M28 59C35 55 40 62 47 57', 'M38 76C43 72 48 78 53 73',
        'M86 44C80 40 75 46 69 42', 'M92 59C85 55 80 62 73 57', 'M82 76C77 72 72 78 67 73']
        .map((d, k) => DR(d, `--d:${f2(.5 + k * .05)}s;--t:.45s`, 'stroke-width="1.5" stroke-opacity=".32"')).join('');
      return `${open}
        <path class="fi" style="--d:.4s" d="${L}Z${Rr}Z" fill="currentColor" fill-opacity=".08"/>
        ${DR(L, '--t:1s', 'stroke-width="3"')}${DR(Rr, '--d:.08s;--t:1s', 'stroke-width="3"')}
        ${DR('M60 25L60 86', '--d:.45s;--t:.5s', 'stroke-width="1.2" stroke-opacity=".3"')}
        ${gyri}${edges}${glows}${pulses}${nodes}
      </svg>`;
    }

    case 'R3': {
      const hull = 'M26 66C26 58 34 54 44 54L84 54C96 54 104 60 104 66C104 72 96 78 84 78L44 78C34 78 26 74 26 66Z';
      const bubbles = [[14, 63, 2.2, 0], [12, 67, 1.6, .5], [15, 65, 2.6, 1.05], [13, 62, 1.8, 1.6], [14, 68, 2.1, 2.1]]
        .map(([x, y, r, d]) => `<circle class="r3-bub" style="--bd:${d}s" cx="${x}" cy="${y}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.2"/>`).join('');
      const sonar = [0, .4, .8].map(d => `<path class="r3-sonar" style="--sd:${d}s" d="M107 58Q113 66 107 74" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`).join('');
      const ports = [50, 64, 78].map((x, k) => `<g class="pp" style="--d:${f2(1 + k * .08)}s"><circle class="r3-port" style="--ld:${k * .35}s" cx="${x}" cy="66" r="3.6" fill="#FFF3CF" stroke="${PAPER}" stroke-width="1.2"/></g>`).join('');
      return `${open}
        <path class="fi" style="--d:.1s" d="M0 23H120V120H0Z" fill="currentColor" fill-opacity=".06"/>
        <g class="fi" style="--d:.2s"><path class="r3-surf" d="${waveD(-40, 160, 23, 20, 2.5)}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-opacity=".55"/></g>
        <g class="fi" style="--d:.4s">
          <path class="r3-cur" d="M-10 98H130" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-opacity=".2" stroke-dasharray="7 13"/>
          <path class="r3-cur" d="M-4 108H130" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-opacity=".14" stroke-dasharray="4 16"/>
        </g>
        ${bubbles}
        <g class="r3-sub" style="transform-origin:64px 66px">
          <g class="r3-peri"><g class="r3-look" style="transform-origin:68px 18px"><path d="M68 41V18H73.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>
          <path class="pp" style="--d:.5s" d="M56 54L58 43Q59 40 62 40H72Q75 40 75.5 43L77 54Z" fill="currentColor"/>
          <path class="fi" style="--d:.45s" d="${hull}" fill="currentColor"/>
          ${DR(hull, '--t:1s', 'stroke-width="2.4"')}
          <path class="fi" style="--d:.8s" d="M28 60L19 55L21 66ZM28 72L19 77L21 66Z" fill="currentColor"/>
          <path class="fi" style="--d:.85s" d="M92 73L101 77L90 77Z" fill="currentColor"/>
          <g class="pp" style="--d:.9s"><ellipse class="r3-prop" style="transform-origin:16.5px 66px" cx="16.5" cy="66" rx="1.8" ry="6.5" fill="currentColor"/></g>
          ${ports}
        </g>
        ${sonar}
      </svg>`;
    }

    case 'V': {
      const sheet = 'M32 14H76L90 28V106H32Z';
      const sparks = [[102, 40, 0], [106, 62, .5], [100, 98, 1], [20, 46, 1.5], [15, 72, 2], [22, 96, 2.5]]
        .map(([x, y, d]) => `<g transform="translate(${x} ${y})"><path class="v-spark" style="--sd:${d}s" d="M0 -4.5L1 -1L4.5 0L1 1L0 4.5L-1 1L-4.5 0L-1 -1Z" fill="currentColor"/></g>`).join('');
      return `${open}
        <g class="v-sheet" style="transform-origin:61px 60px">
          <path class="fi" style="--d:.4s" d="${sheet}" fill="currentColor" fill-opacity=".07"/>
          ${DR(sheet, '--t:1s', 'stroke-width="3"')}
          ${DR('M76 14V28H90', '--d:.65s;--t:.35s', 'stroke-width="2.4"')}
          ${DR('M42 36H78', '--d:.7s;--t:.35s', 'stroke-width="2.4" stroke-opacity=".45"')}
          ${DR('M42 46H78', '--d:.78s;--t:.35s', 'stroke-width="2.4" stroke-opacity=".45"')}
          ${DR('M42 56H66', '--d:.86s;--t:.3s', 'stroke-width="2.4" stroke-opacity=".45"')}
          <circle class="v-stamp" cx="61" cy="77" r="19" fill="none" stroke="currentColor" stroke-width="2.2"/>
          <path class="dr v-check" pathLength="1" style="--d:1.15s;--t:.55s" d="M43 78L55 90L80 62" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        ${sparks}
      </svg>`;
    }
    default: return '';
  }
}
function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const smooth = t => t * t * (3 - 2 * t);

const PAL = [
  { sky: ['#F8ECDC', '#EDC9A0'], sun: '#F2B36B', far: '#DDB08A', mid: '#C98050', near: '#9A5230', front: '#6E3A22', trunk: '#5A3220',
    extra: ['#D8792E', '#B84A26', '#E3A33B', '#8E3A1E'] },
  { sky: ['#161C2B', '#3A4468'], sun: '#E8ECF7', far: '#343F5E', mid: '#29324A', near: '#1E2537', front: '#151A28', trunk: '#10141F',
    extra: ['#8FA0D6', '#C9D2EE'], fog: '#8FA0D6' },
  { sky: ['#E6F0F5', '#C3DAE4'], sun: '#FFFFFF', far: '#A7C4D2', mid: '#7FA3B6', near: '#E9F2F5', front: '#F7FBFC', trunk: '#4A3A30',
    extra: ['#2F5A63', '#3F6F76'] },
  { sky: ['#EFF6EA', '#D5EBCB'], sun: '#F7E6A0', far: '#BCD8AB', mid: '#98C17F', near: '#74A45B', front: '#5A8A45', trunk: '#6B5040',
    extra: ['#F4C9D8', '#FFFFFF', '#E89BB5'] },
  { sky: ['#F8EEF6', '#E3F0DA'], sun: '#FBE7A6', far: '#C8E0B4', mid: '#A2C986', near: '#7DB060', front: '#5E9446', trunk: '#6B5040',
    extra: ['#D8453A', '#FFFFFF', '#8E5FA3', '#B58AC8'] },
  { sky: ['#D6EEF0', '#FBEFD0'], sun: '#F6C75A', far: '#8CC7CC', mid: '#4FA3AE', near: '#E6BE55', front: '#CF9B30', trunk: '#6B5040',
    extra: ['#B9822A', '#D8453A'], sea: ['#7CC0C6', '#3E93A0'], land: '#A9B77A' },
  { sky: ['#D4EDE9', '#F9D6A2'], sun: '#F3A640', far: '#9CC3C0', mid: '#3E8F9A', near: '#C98B4E', front: '#A8683A', trunk: '#6B4A2A',
    extra: ['#C0392B', '#FFFFFF'], sea: ['#5AA7AE', '#2F7A86'], sand: '#EFD39A' },
];

/* Brumale di giorno (v2 di Ritmo): cielo d'autunno coperto, sole basso, nebbia nelle valli, alberi spogli, casa col camino. */
const PAL_BRUMALE_GIORNO = { sky: ['#B7C4D4', '#EEE7DB'], sun: '#FFF3D6', far: '#A9B4C3', mid: '#8E9AAB', near: '#6F7B8C', front: '#566171', trunk: '#454B56',
  extra: ['#5C7290', '#E9E2D3'], fog: '#FFFFFF' };
const THEME_BRUMALE_GIORNO = { bg: '#E6EAEF', bg2: '#D9DFE7', ink: '#1E2733', accent: '#5C7290', line: '#C9D1DB', motif: 'mist' };
/* Variante del paesaggio: 'giorno' o 'notte' esistono solo per Brumale; gli altri mesi hanno un solo disegno. */
const hasVariants = (mi) => mi === 1;
const themeFor = (mi, variant) => (mi === 1 && variant === 'giorno') ? THEME_BRUMALE_GIORNO : THEMES[mi];
let sceneUid = 0;
const hsh = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
function mixHex(a, b, t) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(t, 0, 1)).toString(16).padStart(2, '0')).join('');
}
/* How far into the month the landscape is (0 = first week, 1 = last week) */
function monthP(mi) {
  const m = MONTHS[mi];
  if (todayStr < m.startDate) return 0;
  if (todayStr > m.endDate) return 1;
  const wi = m.weeks.findIndex(w => todayStr >= w.days[0].date && todayStr <= w.days[6].date);
  return Math.max(0, wi) / 6;
}
const SW = 1200, SH = 340;
function hillPts(R, base, amp, tilt, f) {
  const ph = R() * 6.28, ph2 = R() * 6.28, pts = [];
  for (let x = -24; x <= SW + 24; x += 24) {
    const t = Math.max(0, 1 - x / SW);
    pts.push([x, base + tilt * t * t + amp * (Math.sin(x * f + ph) * .65 + Math.sin(x * f * 2.7 + ph2) * .35)]);
  }
  return pts;
}
function smoothPath(pts) {
  let d = `M${pts[0][0]} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) { const [x, y] = pts[i], [nx, ny] = pts[i + 1]; d += `Q${x} ${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`; }
  const L = pts[pts.length - 1];
  return d + `L${L[0]} ${L[1].toFixed(1)}L${L[0]} ${SH + 60}L${pts[0][0]} ${SH + 60}Z`;
}
function yAt(pts, x) {
  for (let i = 0; i < pts.length - 1; i++) if (x >= pts[i][0] && x <= pts[i + 1][0]) { const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t; }
  return pts[pts.length - 1][1];
}
function mapleD(r) {
  const pts = [];
  for (let k = 0; k <= 72; k++) {
    const th = -Math.PI / 2 + k / 72 * Math.PI * 2;
    const lobe = Math.pow(Math.abs(Math.cos(2.5 * (th + Math.PI / 2))), .8);
    let rr = r * (.48 + .52 * lobe) * (1 - .25 * Math.max(0, Math.sin(th)));
    if (Math.sin(th) > .93) rr *= .45;
    pts.push(`${(Math.cos(th) * rr).toFixed(1)} ${(Math.sin(th) * rr).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}
const flakeD = r => {
  let d = '';
  for (let k = 0; k < 6; k++) {
    const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
    d += `M0 0L${f2(c * r)} ${f2(s * r)}`;
    [.5, .75].forEach(p => { const bx = c * r * p, by = s * r * p, l = r * (p === .5 ? .3 : .2);
      [-1, 1].forEach(sg => { const b = a + sg * .85; d += `M${f2(bx)} ${f2(by)}L${f2(bx + Math.cos(b) * l)} ${f2(by + Math.sin(b) * l)}`; }); });
  }
  return d;
};

/* ---- landscape elements (return SVG strings, absolute coordinates) ---- */
function roundTree(x, y, s, cols, trunk, R, keep = 1) {
  const c = () => cols[Math.floor(R() * cols.length)];
  const cc = [c(), c(), c(), c()], k = i => i === 0 || hsh(x, i) < keep;
  return `<path d="M${f2(x)} ${f2(y)}L${f2(x)} ${f2(y - 24 * s)}M${f2(x)} ${f2(y - 16 * s)}l${f2(-7 * s)} ${f2(-8 * s)}" stroke="${trunk}" stroke-width="${f2(3.5 * s)}" stroke-linecap="round" fill="none"/>`
    + (k(0) ? `<circle cx="${f2(x)}" cy="${f2(y - 34 * s)}" r="${f2(14 * s * (keep < .5 ? .75 : 1))}" fill="${cc[0]}"/>` : '')
    + (k(1) ? `<circle cx="${f2(x - 11 * s)}" cy="${f2(y - 27 * s)}" r="${f2(10 * s)}" fill="${cc[1]}"/>` : '')
    + (k(2) ? `<circle cx="${f2(x + 10 * s)}" cy="${f2(y - 29 * s)}" r="${f2(11 * s)}" fill="${cc[2]}"/>` : '')
    + (k(3) ? `<circle cx="${f2(x + 2 * s)}" cy="${f2(y - 45 * s)}" r="${f2(9 * s)}" fill="${cc[3]}"/>` : '')
    + `<circle cx="${f2(x - 5 * s)}" cy="${f2(y - 41 * s)}" r="${f2(4 * s)}" fill="#fff" fill-opacity=".18"/>`;
}
function bareTree(x, y, s, col, R) {
  const lv = [[], [], [], [], []];
  const rec = (x0, y0, len, a, d) => {
    const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
    lv[4 - d].push(`M${f2(x0)} ${f2(y0)}L${f2(x1)} ${f2(y1)}`);
    if (d > 0) {
      rec(x1, y1, len * (.66 + R() * .12), a - (.32 + R() * .3), d - 1);
      rec(x1, y1, len * (.66 + R() * .12), a + (.32 + R() * .3), d - 1);
      if (R() < .35) rec(x1, y1, len * .5, a + (R() - .5) * .4, d - 1);
    }
  };
  rec(x, y, 30 * s, -Math.PI / 2 + (R() - .5) * .15, 4);
  return lv.map((ds, i) => `<path d="${ds.join('')}" stroke="${col}" stroke-width="${(4.4 * s * Math.pow(.6, i)).toFixed(2)}" stroke-linecap="round" fill="none"/>`).join('');
}
function pine(x, y, s, col, snow) {
  let d = '', sn = '';
  const h = 60 * s, w = 40 * s;
  [[1, .55, .34], [.76, .3, .44], [.52, .05, .54]].forEach(([t, b, hw]) => {
    const ty = y - h * t, by = y - h * b;
    d += `M${f2(x)} ${f2(ty)}L${f2(x + w * hw)} ${f2(by)}L${f2(x - w * hw)} ${f2(by)}Z`;
    const sy = ty + (by - ty) * .38, sw = w * hw * .38;
    sn += `M${f2(x)} ${f2(ty)}L${f2(x + sw)} ${f2(sy)}L${f2(x + sw * .3)} ${f2(sy - 2 * s)}L${f2(x - sw * .2)} ${f2(sy + 1.5 * s)}L${f2(x - sw)} ${f2(sy)}Z`;
  });
  return `<rect x="${f2(x - 2.5 * s)}" y="${f2(y - h * .08)}" width="${f2(5 * s)}" height="${f2(h * .1)}" fill="#5A4636"/><path d="${d}" fill="${col}"/><path d="${sn}" fill="${snow}"/>`;
}
function sprout(x, y, h, col, R) {
  const b = (R() - .5) * 6, ax = x + b * .45, ay = y - h * .72;
  return `<path d="M${f2(x)} ${f2(y)}C${f2(x - 2)} ${f2(y - h * .4)} ${f2(x + b)} ${f2(y - h * .7)} ${f2(x + b * .5)} ${f2(y - h)}" stroke="${col}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    + `<path d="M${f2(ax)} ${f2(ay)}c-4 0 -9 -3 -11 -9c5 0 9 3 11 9z" fill="${col}"/><path d="M${f2(ax)} ${f2(ay)}c4 0 9 -3 11 -9c-5 0 -9 3 -11 9z" fill="${col}" fill-opacity=".8"/>`;
}
function poppy(x, y, s, col) {
  return `<path d="M${f2(x)} ${f2(y)}q${f2(s)} ${f2(-8 * s)} 0 ${f2(-16 * s)}" stroke="#4E7A3A" stroke-width="${f2(1.4 * s)}" fill="none"/>`
    + `<circle cx="${f2(x - 2 * s)}" cy="${f2(y - 17 * s)}" r="${f2(4 * s)}" fill="${col}"/><circle cx="${f2(x + 2 * s)}" cy="${f2(y - 17 * s)}" r="${f2(4 * s)}" fill="${col}"/>`
    + `<circle cx="${f2(x)}" cy="${f2(y - 19 * s)}" r="${f2(3.6 * s)}" fill="${col}"/><circle cx="${f2(x)}" cy="${f2(y - 17.5 * s)}" r="${f2(1.5 * s)}" fill="#2A1A14"/>`;
}
function daisy(x, y, s) {
  let p = '';
  const cy = y - 15 * s;
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, px = x + Math.cos(a) * 3.6 * s, py = cy + Math.sin(a) * 3.6 * s;
    p += `<ellipse cx="${f2(px)}" cy="${f2(py)}" rx="${f2(2.7 * s)}" ry="${f2(1.3 * s)}" transform="rotate(${k * 45} ${f2(px)} ${f2(py)})" fill="#fff"/>`; }
  return `<path d="M${f2(x)} ${f2(y)}q${f2(-s)} ${f2(-7 * s)} 0 ${f2(-14 * s)}" stroke="#4E7A3A" stroke-width="${f2(1.3 * s)}" fill="none"/>${p}<circle cx="${f2(x)}" cy="${f2(cy)}" r="${f2(1.9 * s)}" fill="#F2C230"/>`;
}
function lavender(x, y, s, col) {
  let d = '';
  for (let k = 0; k < 6; k++) d += `<ellipse cx="${f2(x + (k % 2 ? 1.2 : -1.2) * s)}" cy="${f2(y - 12 * s - k * 3.2 * s)}" rx="${f2(1.7 * s)}" ry="${f2(2.2 * s)}" fill="${col}"/>`;
  return `<path d="M${f2(x)} ${f2(y)}L${f2(x)} ${f2(y - 28 * s)}" stroke="#6E8F55" stroke-width="${f2(1.2 * s)}"/>${d}`;
}
function wheat(x, y, h, stem, ear) {
  let e = '';
  for (let k = 0; k < 5; k++) { const yy = y - h + 2 + k * 3.6;
    e += `<ellipse cx="${f2(x - 2)}" cy="${f2(yy)}" rx="1.7" ry="3.1" transform="rotate(-25 ${f2(x - 2)} ${f2(yy)})" fill="${ear}"/><ellipse cx="${f2(x + 2)}" cy="${f2(yy)}" rx="1.7" ry="3.1" transform="rotate(25 ${f2(x + 2)} ${f2(yy)})" fill="${ear}"/>`; }
  return `<path d="M${f2(x)} ${f2(y)}L${f2(x)} ${f2(y - h + 2)}M${f2(x)} ${f2(y - h)}l0 -8" stroke="${stem}" stroke-width="1.4"/>${e}`;
}
function butterfly(x, y, c1, c2, R) {
  return `<g class="sc-flut" style="--fd:${f2(9 + R() * 5)}s;--fdl:${f2(-R() * 8)}s"><g transform="translate(${x} ${y}) scale(1.7)">`
    + `<g class="sc-flap"><path d="M0 0C-8 -11 -15 -4 -10 2C-14 7 -6 10 0 2Z" fill="${c1}"/><path d="M0 0C8 -11 15 -4 10 2C14 7 6 10 0 2Z" fill="${c2}"/></g>`
    + `<path d="M0 -4L0 5" stroke="#2A1A14" stroke-width="1.4" stroke-linecap="round"/></g></g>`;
}
function gull(x, y, s, col, R) {
  return `<g class="sc-fly" style="--fd:${f2(24 + R() * 10)}s;--fdl:${f2(-R() * 20)}s"><g transform="translate(${x} ${y}) scale(${s})">`
    + `<path class="sc-gull" d="M-12 0Q-6 -7 0 0Q6 -7 12 0" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/></g></g>`;
}
function sailboat(x, y, s, hull, sail) {
  return `<g class="sc-bob"><g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 0L12 0L8 5L-8 5Z" fill="${hull}"/>`
    + `<path d="M0 -1L0 -24L11 -2Z" fill="${sail}"/><path d="M-1 -3L-1 -20L-9 -3Z" fill="${sail}" fill-opacity=".8"/></g></g>`;
}

function sceneSVG(mi, opts = {}) {
  const G = !!opts.ground;               // ground variant: no sky, static
  const p = clamp(opts.p ?? monthP(mi), 0, 1);   // week-by-week progression
  const DAY = mi === 1 && opts.variant === 'giorno';
  const P = Object.assign({}, DAY ? PAL_BRUMALE_GIORNO : PAL[mi]), R = rng(mi * 131 + 7), u = 'sc' + (++sceneUid);
  const s = [];
  const sky = str => { if (!G) s.push(str); };
  const defs = `<defs>
    <linearGradient id="${u}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset="1" stop-color="${P.sky[1]}"/></linearGradient>
    <radialGradient id="${u}g"><stop offset="0" stop-color="${P.sun}" stop-opacity=".85"/><stop offset=".4" stop-color="${P.sun}" stop-opacity=".3"/><stop offset="1" stop-color="${P.sun}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.fog || '#fff'}" stop-opacity="0"/><stop offset=".5" stop-color="${P.fog || '#fff'}" stop-opacity=".5"/><stop offset="1" stop-color="${P.fog || '#fff'}" stop-opacity="0"/></linearGradient>
    <linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sea ? P.sea[0] : '#fff'}"/><stop offset="1" stop-color="${P.sea ? P.sea[1] : '#fff'}"/></linearGradient>
  </defs>`;
  sky(`<rect width="${SW}" height="${SH}" fill="url(#${u}k)"/>`);
  if (mi === 6 && p > 0) sky(`<rect width="${SW}" height="${SH}" fill="#F08A4B" fill-opacity="${f2(p * .22)}"/>`);
  if (mi === 2 && p > 0) sky(`<rect width="${SW}" height="${SH}" fill="#F3E3C0" fill-opacity="${f2(p * .18)}"/>`);
  const sun = (x, y, r, d = .2) => `<g class="sc-sunrise" style="--d:${d}s"><circle class="sc-glow" cx="${x}" cy="${y}" r="${r * 3}" fill="url(#${u}g)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${P.sun}"/></g>`;
  const hill = (pts, fill, d, rise) => `<path class="sc-rise" style="--d:${d}s;--rise:${rise}px" d="${smoothPath(pts)}" fill="${fill}"/>`;
  const cloud = (x, y, k, d) => `<g class="sc-fade" style="--d:${d}s"><g class="sc-drift" opacity=".62" style="--dd:${f2(30 + R() * 20)}s;--dx:${f2((R() < .5 ? -1 : 1) * (40 + R() * 40))}px">`
    + `<ellipse cx="${x}" cy="${y}" rx="${40 * k}" ry="${12 * k}" fill="#fff"/><ellipse cx="${x - 18 * k}" cy="${y - 6 * k}" rx="${20 * k}" ry="${12 * k}" fill="#fff"/><ellipse cx="${x + 14 * k}" cy="${y - 9 * k}" rx="${24 * k}" ry="${15 * k}" fill="#fff"/></g></g>`;
  const sw = (inner, amp = 2.5) => `<g class="sc-sway" style="--sa:${f2(amp * (.6 + R() * .8))}deg;--sd:${f2(2.6 + R() * 1.8)}s;--sdl:${f2(R() * 1.5)}s">${inner}</g>`;
  const swx = (inner, x, amp) => `<g class="sc-sway" style="--sa:${amp}deg;--sd:2.8s;--sdl:${f2(x / SW * 1.4)}s">${inner}</g>`;
  const grow = (inner, d) => `<g class="sc-grow" style="--d:${f2(d)}s">${inner}</g>`;
  const pop = (inner, d) => `<g class="sc-pop" style="--d:${f2(d)}s">${inner}</g>`;
  const faller = (shape, x, y, fx, fy, fr, dur, dl) => `<g transform="translate(${f2(x)} ${f2(y)})"><g class="sc-fall" style="--fx:${f2(fx)}px;--fy:${f2(fy)}px;--fr:${f2(fr)}deg;--fd:${f2(dur)}s;--fdl:${f2(dl)}s">${shape}</g></g>`;
  const xsOn = (n, a, b) => Array.from({ length: n }, (_, i) => a + (b - a) * (i + .5) / n + (R() - .5) * (b - a) / n * .8);
  const far = hillPts(R, 222, 10, 70, .0055), mid = hillPts(R, 252, 12, 60, .007), near = hillPts(R, 284, 9, 45, .009), front = hillPts(R, 316, 6, 25, .012);
  const waves = (rows, col) => rows.forEach(([y, wl, w, o, x0], i) => s.push(`<g class="sc-fade" style="--d:${f2(.4 + i * .1)}s"><path class="sc-wave" style="--wl:${-wl}px;--wd:${3 + i}s" d="${waveD(x0, SW + wl * 2, y, wl, 3)}" fill="none" stroke="${col}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/></g>`));

  switch (mi) {
    case 0: { // Foliaio — vineyard hills, cypresses, autumn trees
      sky(sun(930, f2(112 + p * 40), 34));
      sky(cloud(690, 70, 1.1, .5) + cloud(1070, 52, .8, .7));
      s.push(hill(far, P.far, .1, 20));
      s.push(hill(mid, P.mid, .22, 30));
      let vines = '';
      for (let k = 0; k < 5; k++) { let d = ''; for (let x = 640; x <= 1170; x += 10) d += (x === 640 ? 'M' : 'L') + x + ' ' + f2(yAt(mid, x) + 12 + k * 8);
        vines += `<path d="${d}" fill="none" stroke="${mixHex('#5E7A34', P.front, p)}" stroke-opacity=".5" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1.5 6"/>`; }
      s.push(`<g class="sc-rise" style="--d:.3s;--rise:30px">${vines}</g>`);
      [[826, 1], [848, .82]].forEach(([x, k], i) => { const y = yAt(mid, x) + 6; s.push(grow(`<ellipse cx="${x}" cy="${f2(y - 36 * k)}" rx="${f2(7 * k)}" ry="${f2(38 * k)}" fill="${P.front}"/>`, .5 + i * .1)); });
      s.push(hill(near, P.near, .34, 40));
      const crowns = p < .3 ? ['#9FAA3F', '#C9A43A', '#B7B04A', '#D8792E'] : p < .7 ? ['#D8792E', '#E3A33B', '#C9A43A', '#B84A26'] : P.extra;
      xsOn(6, 690, 1170).forEach((x, i) => { const y = yAt(near, x) + 4, k = 1 + R() * .6; s.push(grow(sw(roundTree(x, y, k, crowns, P.trunk, R, 1 - p * .75), 1.6), .6 + i * .08)); });
      s.push(hill(front, P.front, .46, 50));
      let fallen = '';
      for (let j = 0; j < Math.round(p * 46); j++) { const x = 440 + hsh(j, 1) * 750, y = yAt(front, x) + 4 + hsh(j, 2) * 16;
        fallen += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="3.4" ry="1.8" transform="rotate(${f2(hsh(j, 3) * 180)} ${f2(x)} ${f2(y)})" fill="${P.extra[j % 4]}"/>`; }
      if (fallen) s.push(`<g class="sc-fade" style="--d:.9s">${fallen}</g>`);
      xsOn(16, 440, 1190).forEach(x => { const y = yAt(front, x) + 3;
        s.push(sw(`<path d="M${f2(x)} ${f2(y)}q-2 -8 -6 -12M${f2(x)} ${f2(y)}q0 -9 1 -15M${f2(x)} ${f2(y)}q2 -7 7 -11" stroke="${P.near}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`, 4)); });
      if (!G) for (let i = 0; i < 3 + Math.round(p * 6); i++) s.push(faller(`<path d="${mapleD(6 + R() * 3)}" fill="${P.extra[i % 4]}"/>`, 620 + R() * 520, 110 + R() * 70, 30 + R() * 50, 120 + R() * 70, (R() < .5 ? -1 : 1) * (200 + R() * 200), 6 + R() * 3, 2 + i * 1.3));
      break;
    }
    case 1: if (DAY) { // Brumale di giorno — sole basso e velato, nebbia, stormo, casa col camino che fuma
      sky(sun(930, f2(118 + p * 18), 26, .1));
      sky(cloud(640, 64, 1.2, .4) + cloud(1110, 46, .9, .6) + cloud(820, 108, .7, .8));
      if (!G) [[700, 92, .55], [735, 80, .45], [760, 98, .5], [1050, 120, .5], [1078, 110, .4]].forEach(([x, y, k]) => s.push(gull(x, y, k, '#3C4350', R)));
      const fogD = (y, h, d, dur, dx) => `<g class="sc-fade" style="--d:${d}s"><g class="sc-fog" opacity="${f2(.55 + p * .35)}" style="--fgd:${dur}s;--fgx:${dx}px"><rect x="-140" y="${y}" width="${SW + 280}" height="${h}" fill="url(#${u}f)"/></g></g>`;
      s.push(hill(far, P.far, .1, 20));
      s.push(fogD(160, 70, .5, 18, 50));
      s.push(hill(mid, P.mid, .22, 30));
      [[690, .9], [880, 1.1], [1110, 1]].forEach(([x, k], i) => s.push(grow(bareTree(x, yAt(mid, x) + 4, k, P.trunk, R), .4 + i * .1)));
      s.push(fogD(222, 66, .8, 14, -60));
      s.push(hill(near, P.near, .34, 40));
      { const hx = 1010, hy = yAt(near, 1010) + 3;
        s.push(pop(`<rect x="${hx - 17}" y="${f2(hy - 22)}" width="34" height="22" fill="${P.extra[1]}"/><path d="M${hx - 21} ${f2(hy - 21)}L${hx} ${f2(hy - 38)}L${hx + 21} ${f2(hy - 21)}Z" fill="#8C4B3A"/>`
          + `<rect x="${hx + 8}" y="${f2(hy - 40)}" width="5" height="12" fill="#6E3B2E"/><rect x="${hx - 9}" y="${f2(hy - 16)}" width="7" height="7" fill="#5B6573"/><rect x="${hx + 3}" y="${f2(hy - 16)}" width="7" height="7" fill="#5B6573"/>`
          + `<rect x="${hx - 3}" y="${f2(hy - 9)}" width="6" height="9" fill="#6E3B2E"/>`, .7));
        if (!G) for (let i = 0; i < 4; i++) s.push(faller(`<circle r="${4 + i * 1.6}" fill="#FFFFFF" fill-opacity=".55"/>`, hx + 10, hy - 44, 14 + R() * 14, -50, 0, 5, 1.6 + i * 1.3)); }
      [[780, 1.35], [1150, 1.2]].forEach(([x, k], i) => s.push(grow(bareTree(x, yAt(near, x) + 4, k, P.trunk, R), .55 + i * .1)));
      s.push(hill(front, P.front, .46, 50));
      if (p > .7) s.push(`<path class="sc-rise" style="--d:.5s;--rise:50px" d="${smoothPath(front).split('L' + (SW + 24))[0]}" fill="none" stroke="#FFFFFF" stroke-opacity="${f2((p - .7) * 2.6)}" stroke-width="4" stroke-linecap="round"/>`);
      s.push(fogD(286, 60, 1, 16, 70));
      break;
    } else { // Brumale — night, moon, fog banks, bare trees, lit house
      if (!G) { let st = ''; for (let i = 0; i < 34; i++) st += `<circle class="sc-twinkle" style="--td:${f2(2 + R() * 3)}s;--tdl:${f2(R() * 3)}s" cx="${f2(470 + R() * 730)}" cy="${f2(10 + R() * 160)}" r="${f2(.7 + R() * 1.3)}" fill="#E7E9F2"/>`;
        s.push(`<g class="sc-fade" style="--d:.4s">${st}</g>`); }
      sky(sun(960, 84, 24, .1) + `<g class="sc-fade" style="--d:.9s"><circle cx="953" cy="78" r="4" fill="#C9D2EE"/><circle cx="968" cy="93" r="3" fill="#C9D2EE"/><circle cx="962" cy="72" r="2" fill="#C9D2EE"/></g>`);
      const fog = (y, h, d, dur, dx) => `<g class="sc-fade" style="--d:${d}s"><g class="sc-fog" opacity="${f2(.4 + p * .6)}" style="--fgd:${dur}s;--fgx:${dx}px"><rect x="-140" y="${y}" width="${SW + 280}" height="${h}" fill="url(#${u}f)"/></g></g>`;
      s.push(hill(far, P.far, .1, 20));
      if (p > .25) s.push(fog(150, 70, .6, 18, 50));
      s.push(hill(mid, P.mid, .22, 30));
      [[690, .9], [880, 1.1], [1110, 1]].forEach(([x, k], i) => s.push(grow(bareTree(x, yAt(mid, x) + 4, k, P.trunk, R), .4 + i * .1)));
      s.push(fog(218, 70, .8, 14, -60));
      s.push(hill(near, P.near, .34, 40));
      const hx = 1010, hy = yAt(near, 1010) + 3;
      s.push(pop(`<rect x="${hx - 17}" y="${f2(hy - 22)}" width="34" height="22" fill="${P.front}"/><path d="M${hx - 21} ${f2(hy - 21)}L${hx} ${f2(hy - 38)}L${hx + 21} ${f2(hy - 21)}Z" fill="${P.front}"/>`
        + `<rect x="${hx + 8}" y="${f2(hy - 40)}" width="5" height="12" fill="${P.front}"/><rect class="sc-window" x="${hx - 9}" y="${f2(hy - 16)}" width="7" height="7" fill="#F3C77A"/>`
        + `<rect class="sc-window" style="--wdl:2.7s" x="${hx + 3}" y="${f2(hy - 16)}" width="7" height="7" fill="${p > .45 ? '#F3C77A' : P.mid}"/>`, .7));
      if (!G) for (let i = 0; i < 3; i++) s.push(faller(`<circle r="${4 + i * 1.5}" fill="#C9D2EE" fill-opacity=".35"/>`, hx + 10, hy - 44, 12 + R() * 12, -46, 0, 4.5, 2 + i * 1.5));
      [[780, 1.35], [1150, 1.2]].forEach(([x, k], i) => s.push(grow(bareTree(x, yAt(near, x) + 4, k, P.trunk, R), .55 + i * .1)));
      s.push(hill(front, P.front, .46, 50));
      if (p > .7) s.push(`<path class="sc-rise" style="--d:.5s;--rise:50px" d="${smoothPath(front).split('L' + (SW + 24))[0]}" fill="none" stroke="#E7E9F2" stroke-opacity="${f2((p - .7) * 2.4)}" stroke-width="4" stroke-linecap="round"/>`);
      s.push(fog(282, 64, 1, 16, 70));
      break;
    }
    case 2: { // Ianuario — snowy peaks, pines, frozen lake, snowfall
      sky(sun(990, f2(98 - p * 30), 24 + p * 4, .1));
      const mnt = (pts, fill, capFill, d, rise) => {
        const path = 'M' + pts.map(p => p.join(' ')).join('L') + `L${SW + 20} ${SH + 60}L-20 ${SH + 60}Z`;
        let caps = '';
        for (let i = 1; i < pts.length - 1; i++) {
          const [px, py] = pts[i], [lx, ly] = pts[i - 1], [rx, ry] = pts[i + 1];
          if (py >= ly || py >= ry) continue;
          const hc = (Math.min(ly, ry) - py) * .38, fl = hc / (ly - py), fr = hc / (ry - py);
          const L1 = [px + (lx - px) * fl, py + (ly - py) * fl], R1 = [px + (rx - px) * fr, py + (ry - py) * fr];
          const a = [L1[0] + (px - L1[0]) * .3, L1[1] - hc * .2], b = [px - 2, py + hc * .75], c = [R1[0] + (px - R1[0]) * .35, R1[1] - hc * .25];
          caps += `M${px} ${py}L${f2(R1[0])} ${f2(R1[1])}L${f2(c[0])} ${f2(c[1])}L${f2(b[0])} ${f2(b[1])}L${f2(a[0])} ${f2(a[1])}L${f2(L1[0])} ${f2(L1[1])}Z`;
        }
        return `<g class="sc-rise" style="--d:${d}s;--rise:${rise}px"><path d="${path}" fill="${fill}"/><path d="${caps}" fill="${capFill}"/></g>`;
      };
      s.push(mnt([[-20, 262], [380, 256], [470, 205], [540, 228], [640, 150], [720, 205], [820, 126], [905, 196], [1000, 116], [1085, 190], [1160, 140], [1220, 170]], P.far, '#FFFFFF', .1, 24));
      s.push(mnt([[-20, 292], [520, 284], [600, 242], [680, 272], [770, 226], [860, 268], [950, 234], [1050, 272], [1130, 240], [1220, 262]], P.mid, '#F4F9FB', .25, 32));
      s.push(hill(near, P.near, .36, 40));
      const ly = yAt(near, 860) + 16;
      s.push(`<g class="sc-rise" style="--d:.45s;--rise:40px"><ellipse cx="860" cy="${f2(ly)}" rx="150" ry="8" fill="#BCD6E0"/><path d="M790 ${f2(ly - 1)}h30M870 ${f2(ly + 1)}h46" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g>`);
      xsOn(14, 560, 1190).forEach((x, i) => { const k = .75 + R() * .7; s.push(grow(pine(x, yAt(near, x) + 5, k, P.extra[i % 2], p > .75 && hsh(x, 9) < (p - .7) * 2 ? P.extra[i % 2] : '#FFFFFF'), .55 + i * .05)); });
      s.push(hill(front, P.front, .5, 50));
      if (!G) for (let i = 0; i < Math.round(30 - p * 20); i++) s.push(faller(`<circle r="${f2(1.2 + R() * 1.6)}" fill="#fff" stroke="${P.far}" stroke-width=".6"/>`, 460 + R() * 740, 10 + R() * 120, (R() - .5) * 40, 150 + R() * 120, 0, 7 + R() * 5, 1.5 + R() * 8));
      break;
    }
    case 3: { // Germinale — blossom trees, growing meadow
      P.far = mixHex('#C9C79A', PAL[3].far, .4 + p * .6); P.mid = mixHex('#B3B27E', PAL[3].mid, .3 + p * .7);
      P.near = mixHex('#9B9A62', PAL[3].near, .2 + p * .8); P.front = mixHex('#7F7E4A', PAL[3].front, .2 + p * .8);
      sky(sun(950, 104, 30));
      sky(cloud(720, 64, 1, .5) + cloud(1100, 48, .7, .7));
      s.push(hill(far, P.far, .1, 20));
      s.push(hill(mid, P.mid, .22, 30));
      const blossomTree = (x, y, k) => {
        let c = `<path d="M${x} ${f2(y)}L${x} ${f2(y - 26 * k)}M${x} ${f2(y - 18 * k)}l${f2(-9 * k)} ${f2(-12 * k)}M${x} ${f2(y - 22 * k)}l${f2(8 * k)} ${f2(-12 * k)}" stroke="${P.trunk}" stroke-width="${f2(3 * k)}" stroke-linecap="round" fill="none"/>`;
        for (let j = 0; j < 10; j++) { const a = R() * Math.PI * 2, rr = R() * 16 * k, cx = x + Math.cos(a) * rr * 1.2, cy = y - 36 * k + Math.sin(a) * rr * .8, rad = (6 + R() * 5) * k;
          if (hsh(x, j) < p * 1.25 - .15) c += `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(rad)}" fill="${P.extra[j % 3]}"/>`;
          else c += `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(1.6 * k)}" fill="#8FB05A"/>`; }
        return c;
      };
      [[700, 1], [1015, 1.05]].forEach(([x, k], i) => s.push(grow(sw(blossomTree(x, yAt(mid, x) + 4, k), 1.2), .45 + i * .1)));
      s.push(hill(near, P.near, .34, 40));
      [[860, 1.25], [1150, 1.3]].forEach(([x, k], i) => s.push(grow(sw(blossomTree(x, yAt(near, x) + 4, k), 1.2), .6 + i * .1)));
      xsOn(22, 460, 1190).forEach((x, i) => { const y = yAt(near, x) + 8 + R() * 12, h = (14 + R() * 16) * (.35 + p * .65), sp = sprout(x, y, h, P.front, R);
        if (hsh(x, 5) < .4 + p * .6) s.push(grow(sw(sp, 5), .9 + i * .045)); });
      s.push(hill(front, P.front, .5, 50));
      xsOn(9, 480, 1190).forEach((x, i) => { if (hsh(x, 7) < p * 1.4 - .4) s.push(pop(daisy(x, yAt(front, x) + 8, .85), 1.4 + i * .06)); });
      if (!G) for (let i = 0; i < 6; i++) s.push(faller(`<ellipse rx="3.4" ry="2" fill="${P.extra[i % 3]}" stroke="#E89BB5" stroke-width=".5"/>`, 680 + R() * 480, 150 + R() * 40, 40 + R() * 50, 90 + R() * 60, 360, 5 + R() * 3, 2.2 + i * 1.1));
      break;
    }
    case 4: { // Floreale — flower meadow, butterflies
      sky(sun(1000, 98, 28));
      sky(cloud(760, 60, .9, .5));
      s.push(hill(far, P.far, .1, 20));
      s.push(hill(mid, P.mid, .22, 30));
      let dots = '';
      for (let i = 0; i < 70; i++) { const x = 560 + R() * 640; dots += `<circle cx="${f2(x)}" cy="${f2(yAt(mid, x) + 6 + R() * 24)}" r="${f2(1.2 + R() * 1.3)}" fill="${P.extra[[0, 1, 2, 3][i % 4]]}"/>`; }
      s.push(`<g class="sc-rise" style="--d:.3s;--rise:30px">${dots}</g>`);
      s.push(hill(near, P.near, .34, 40));
      const flower = (x, y, k, t) => t === 0 ? poppy(x, y, k, P.extra[0]) : t === 1 ? daisy(x, y, k) : lavender(x, y, k, P.extra[t === 2 ? 2 : 3]);
      xsOn(34, 430, 1195).forEach(x => { const fl = flower(x, yAt(near, x) + 8 + R() * 14, .8 + R() * .3, Math.floor(R() * 4)); if (hsh(x, 3) < .35 + p * .65) s.push(pop(sw(fl, 4), .6 + (x - 430) / 765 * .9)); });
      s.push(hill(front, P.front, .46, 50));
      xsOn(26, 440, 1195).forEach(x => { const fl = flower(x, yAt(front, x) + 10 + R() * 12, 1.15 + R() * .35, Math.floor(R() * 4)); if (hsh(x, 4) < .3 + p * .7) s.push(pop(sw(fl, 5), .8 + (x - 440) / 755 * .9)); });
      if (!G) [[760, 150, '#F2A23A', '#F2C230'], [930, 196, '#8E5FA3', '#B58AC8'], [1085, 128, '#D8453A', '#F29A8C']]
        .forEach(([x, y, a, b], i) => { const bf = butterfly(x, y, a, b, R); if (i < 1 + Math.round(p * 2)) s.push(`<g class="sc-fade" style="--d:${f2(1.4 + i * .3)}s">${bf}</g>`); });
      break;
    }
    case 5: { // Messidoro — sea, headland, wheat field in the wind
      sky(sun(1010, 98, 34));
      if (!G) [[780, 70, .9], [850, 96, .7], [1090, 58, 1]].forEach(([x, y, k]) => s.push(gull(x, y, k, '#3B3012', R)));
      s.push(`<rect class="sc-rise" style="--d:.1s;--rise:10px" x="0" y="198" width="${SW}" height="${SH}" fill="url(#${u}s)"/>`);
      s.push(`<path class="sc-rise" style="--d:.15s;--rise:14px" d="M-20 206Q120 148 300 168Q470 184 640 206Z" fill="${P.land}"/>`);
      waves([[214, 60, 1.6, .7, 500], [232, 70, 1.8, .55, 500], [252, 80, 2, .45, 480]], '#FFFFFF');
      s.push(`<g class="sc-fade" style="--d:.8s">${sailboat(870, 208, 1, '#3B3012', '#FFFFFF')}</g>`);
      const field = hillPts(R, 262, 8, 36, .008), field2 = hillPts(R, 302, 6, 22, .011);
      const ripe = clamp(p * 1.15, 0, 1);
      P.near = mixHex('#A9C466', PAL[5].near, ripe); P.front = mixHex('#8FB050', PAL[5].front, ripe);
      const st1 = mixHex('#6E9A3A', '#C9A04A', ripe), ea1 = mixHex('#7FA040', P.extra[0], ripe), st2 = mixHex('#5E8A34', '#B98A34', ripe), ea2 = mixHex('#6E9038', '#9C6A1E', ripe);
      s.push(hill(field, P.near, .3, 40));
      xsOn(40, 430, 1195).forEach(x => s.push(grow(swx(wheat(x, yAt(field, x) + 10 + R() * 14, (34 + R() * 16) * (.75 + ripe * .25), st1, ea1), x, 3), .5 + (x - 430) / 765 * .7)));
      s.push(hill(field2, P.front, .45, 50));
      xsOn(34, 440, 1195).forEach(x => s.push(grow(swx(wheat(x, yAt(field2, x) + 14 + R() * 12, (48 + R() * 20) * (.75 + ripe * .25), st2, ea2), x, 3.5), .7 + (x - 440) / 755 * .7)));
      xsOn(8, 470, 1180).forEach(x => s.push(pop(poppy(x, yAt(field2, x) + 22, 1.1, P.extra[1]), 1.5 + R() * .5)));
      break;
    }
    case 6: { // Estiario — summer sea, lighthouse on the cliff, beach
      sky(sun(880, f2(130 + p * 62), 44));
      if (!G) s.push(gull(1000, 70, .9, '#3A2E14', R) + gull(740, 96, .7, '#3A2E14', R));
      s.push(`<rect class="sc-rise" style="--d:.05s;--rise:10px" x="0" y="212" width="${SW}" height="${SH}" fill="url(#${u}s)"/>`);
      s.push(`<g class="sc-rise" style="--d:.15s;--rise:12px"><ellipse cx="560" cy="213" rx="54" ry="9" fill="${P.far}"/><ellipse cx="648" cy="213" rx="30" ry="6" fill="${P.far}"/></g>`);
      if (!G) { let gl = ''; for (let i = 0; i < 16; i++) { const y = 222 + i * 5 + R() * 3, w = 10 + R() * 18 - i * .4, x = 880 + (R() - .5) * (30 + i * 9);
          gl += `<rect class="sc-twinkle" style="--td:${f2(1.2 + R() * 1.6)}s;--tdl:${f2(R() * 2)}s" x="${f2(x - w / 2)}" y="${f2(y)}" width="${f2(w)}" height="1.8" rx=".9" fill="#FFF6DC"/>`; }
        s.push(`<g class="sc-fade" style="--d:1.2s">${gl}</g>`); }
      waves([[244, 70, 1.6, .5, 380], [266, 80, 1.8, .4, 380], [292, 90, 2, .32, 360]], '#FFFFFF');
      s.push(`<g class="sc-fade" style="--d:.9s">${sailboat(690, 226, 1.1, '#3A2E14', '#FFFFFF')}</g>`);
      s.push(`<g class="sc-rise" style="--d:.3s;--rise:40px"><path d="M1000 ${SH + 60}L1018 250Q1040 190 1090 160L1150 148Q1190 140 ${SW + 20} 146L${SW + 20} ${SH + 60}Z" fill="${P.near}"/>`
        + `<path d="M1030 240Q1070 220 1110 214M1050 272Q1100 256 1150 250M1040 300Q1100 290 1180 286" stroke="${P.front}" stroke-opacity=".5" stroke-width="2" fill="none"/></g>`);
      s.push(grow(`<path d="M1142 149L1145 98H1157L1160 149Z" fill="#FFFFFF"/><path d="M1143.4 132H1158.6L1158.1 120H1144Z M1144.6 110H1157.4L1157 101H1145Z" fill="${P.extra[0]}"/>`
        + `<rect x="1143" y="89" width="16" height="9" fill="#3A2E14"/><path d="M1141 89L1151 80L1161 89Z" fill="${P.extra[0]}"/><rect class="sc-beam" x="1146" y="91" width="10" height="5" fill="#FFE9A8"/>`, .7));
      const sand = hillPts(R, 318, 5, 18, .01);
      s.push(hill(sand, P.sand, .45, 50));
      const ux = 610, uy = yAt(sand, ux) + 4;
      s.push(pop(`<path d="M${ux} ${f2(uy)}L${ux + 4} ${f2(uy - 50)}" stroke="#3A2E14" stroke-width="2"/>`
        + `<path d="M${ux - 24} ${f2(uy - 42)}Q${ux + 4} ${f2(uy - 78)} ${ux + 32} ${f2(uy - 42)}Z" fill="${P.extra[0]}"/>`
        + `<path d="M${ux - 8} ${f2(uy - 45)}Q${ux + 2} ${f2(uy - 70)} ${ux + 4} ${f2(uy - 60)}L${ux + 6} ${f2(uy - 43)}Z M${ux + 14} ${f2(uy - 43)}Q${ux + 12} ${f2(uy - 64)} ${ux + 10} ${f2(uy - 62)}Q${ux + 22} ${f2(uy - 58)} ${ux + 24} ${f2(uy - 43)}Z" fill="#fff"/>`
        + `<rect x="${ux - 40}" y="${f2(uy - 4)}" width="34" height="8" rx="2" fill="#3E8F9A" transform="rotate(-4 ${ux - 23} ${f2(uy)})"/>`, 1.2));
      break;
    }
  }
  return `<svg class="scene${G ? ' static' : ''}" viewBox="0 0 ${SW} ${SH}" preserveAspectRatio="${G ? 'xMidYMax' : 'xMaxYMax'} slice" aria-hidden="true" focusable="false">${defs}${s.join('')}</svg>`;
}

/* Month pattern tile: scattered seasonal glyphs, used as page texture */
function patternURI(mi, colOverride, opOverride) {
  const c = colOverride || MONTHS[mi].theme.ink, op = opOverride || (mi === 1 ? .1 : .075);
  const fl = flakeD(8);
  const glyph = [
    '<path d="M0 -9C6 -5 6 5 0 9C-6 5 -6 -5 0 -9Z"/><path d="M0 -8V12" stroke="C" stroke-width="1.2" fill="none"/>',
    '<path d="M0 -6L1.4 -1.4L6 0L1.4 1.4L0 6L-1.4 1.4L-6 0L-1.4 -1.4Z"/><circle cx="12" cy="10" r="1.3"/>',
    `<path d="${fl}" stroke="C" stroke-width="1.3" stroke-linecap="round" fill="none"/>`,
    '<path d="M0 9V-5" stroke="C" stroke-width="1.5" fill="none"/><path d="M0 -1c-4 0 -7 -3 -8 -7c4 0 7 3 8 7z"/><path d="M0 -1c4 0 7 -3 8 -7c-4 0 -7 3 -8 7z"/>',
    '<circle cx="0" cy="-4.5" r="3.5"/><circle cx="4.3" cy="-1.4" r="3.5"/><circle cx="2.7" cy="3.7" r="3.5"/><circle cx="-2.7" cy="3.7" r="3.5"/><circle cx="-4.3" cy="-1.4" r="3.5"/>',
    '<path d="M0 12V-10" stroke="C" stroke-width="1.2" fill="none"/><ellipse cx="-2.4" cy="-6" rx="1.9" ry="3.4" transform="rotate(-25 -2.4 -6)"/><ellipse cx="2.4" cy="-6" rx="1.9" ry="3.4" transform="rotate(25 2.4 -6)"/><ellipse cx="-2.4" cy="0" rx="1.9" ry="3.4" transform="rotate(-25 -2.4 0)"/><ellipse cx="2.4" cy="0" rx="1.9" ry="3.4" transform="rotate(25 2.4 0)"/>',
    '<circle r="4.5"/><path d="M0 -8V-11M0 8V11M-8 0H-11M8 0H11M5.7 5.7L7.8 7.8M-5.7 5.7L-7.8 7.8M5.7 -5.7L7.8 -7.8M-5.7 -5.7L-7.8 -7.8" stroke="C" stroke-width="1.4" stroke-linecap="round"/>',
  ][mi].replace(/stroke="C"/g, `stroke="${c}"`);
  const pos = [[40, 50, 20, 1], [150, 34, -30, .8], [112, 132, 60, 1.15], [28, 168, -12, .9], [182, 172, 35, .7]];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><g fill="${c}" fill-opacity="${op}" stroke-opacity="${op}">`
    + pos.map(([x, y, r, k]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k})">${glyph}</g>`).join('') + '</g></svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* Corner ornament for week/day pages (top right, fills the empty corner) */
function ornamentSVG(mi) {
  const P = PAL[mi], R = rng(mi * 57 + 3);
  const bez = t => { const p = [[330, 6], [262, 16], [200, 40], [118, 94]], u = 1 - t;
    return [0, 1].map(j => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]); };
  const branch = `<path d="M330 6C262 16 200 40 118 94" stroke="${P.trunk}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  let inner = '';
  switch (mi) {
    case 0:
      inner = branch;
      for (let k = 0; k < 8; k++) { const [x, y] = bez(.08 + k * .115), r = 11 + R() * 6, a = 60 + R() * 90;
        inner += `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(a)})"><path d="M0 0L0 ${f2(r * .9)}" stroke="${P.trunk}" stroke-width="1.5"/><g transform="translate(0 ${f2(r * 1.7)})"><path d="${mapleD(r)}" fill="${P.extra[k % 4]}"/></g></g>`; }
      inner += `<g transform="translate(150 110)"><g class="sc-fall" style="--fx:-30px;--fy:110px;--fr:260deg;--fd:7s;--fdl:1.5s"><path d="${mapleD(10)}" fill="${P.extra[1]}"/></g></g>`;
      break;
    case 1: {
      inner = `<circle cx="248" cy="74" r="70" fill="${P.sun}" fill-opacity=".08"/><path d="M248 40A34 34 0 1 0 248 108A42 42 0 0 1 248 40Z" fill="${P.sun}"/>`;
      [[170, 40, 2.4], [140, 96, 1.6], [300, 130, 2], [200, 150, 1.4], [110, 30, 1.8], [290, 28, 1.2]]
        .forEach(([x, y, r], i) => inner += `<g transform="translate(${x} ${y})"><path class="sc-twinkle" style="--td:${2 + i * .4}s;--tdl:${i * .5}s" d="M0 ${-r * 3}L${r * .6} ${-r * .6}L${r * 3} 0L${r * .6} ${r * .6}L0 ${r * 3}L${-r * .6} ${r * .6}L${-r * 3} 0L${-r * .6} ${-r * .6}Z" fill="${P.sun}"/></g>`);
      break;
    }
    case 2:
      inner = branch;
      for (let t = .04; t < .98; t += .028) { const [x, y] = bez(t);
        [-1, 1].forEach(sg => { const a = -.55 + sg * 1.05 + (R() - .5) * .3; inner += `<path d="M${f2(x)} ${f2(y)}l${f2(Math.cos(a + Math.PI) * 15)} ${f2(Math.sin(a + Math.PI) * 15 * -sg)}" stroke="${P.extra[t * 10 % 2 < 1 ? 0 : 1]}" stroke-width="2" stroke-linecap="round"/>`; }); }
      [.22, .5, .78].forEach(t => { const [x, y] = bez(t); inner += `<ellipse cx="${f2(x)}" cy="${f2(y - 6)}" rx="16" ry="6" fill="#FFFFFF" stroke="#A7C4D2" stroke-width="1"/>`; });
      [.36, .66].forEach(t => { const [x, y] = bez(t); inner += `<ellipse cx="${f2(x)}" cy="${f2(y + 16)}" rx="5" ry="9" fill="#7A5A40"/><path d="M${f2(x - 5)} ${f2(y + 13)}h10M${f2(x - 5)} ${f2(y + 18)}h10" stroke="#5A4030" stroke-width="1"/>`; });
      break;
    case 3:
      inner = branch;
      for (let k = 0; k < 9; k++) { const [x, y] = bez(.06 + k * .11), dx = (R() - .5) * 18, dy = 8 + R() * 12, col = P.extra[k % 3];
        let pet = ''; for (let j = 0; j < 5; j++) { const a = j * 1.2566 - 1.57; pet += `<circle cx="${f2(Math.cos(a) * 6)}" cy="${f2(Math.sin(a) * 6)}" r="5.2" fill="${col}" stroke="#E89BB5" stroke-width=".6"/>`; }
        inner += `<path d="M${f2(x)} ${f2(y)}L${f2(x + dx)} ${f2(y + dy)}" stroke="${P.trunk}" stroke-width="1.6"/><g class="sc-twinkle" style="--td:${f2(4 + R() * 2)}s;--tdl:${f2(R() * 3)}s"><g transform="translate(${f2(x + dx)} ${f2(y + dy)})">${pet}<circle r="2.2" fill="#F2C230"/></g></g>`; }
      break;
    case 4:
      inner = branch;
      [.14, .32, .5, .68, .86].forEach((t, k) => { const [x, y] = bez(t), len = 50 + R() * 40;
        let c = ''; for (let j = 0; j < 16; j++) { const tt = j / 15, w = (1 - tt) * 11 + 2; c += `<circle cx="${f2(x + (R() - .5) * w * 2)}" cy="${f2(y + 6 + tt * len)}" r="${f2(3.6 - tt * 1.4)}" fill="${['#B58AC8', '#8E5FA3', '#D4B5E0'][j % 3]}"/>`; }
        inner += `<g class="sc-hang" style="--sd:${f2(3 + k * .4)}s">${c}</g>`; });
      break;
    case 5:
      [[205, 1], [222, .9], [190, .85], [238, .75]].forEach(([a, k]) => {
        inner += `<g class="sc-hang" style="--sd:${f2(3.4 + k)}s"><g transform="translate(318 -4) rotate(${a}) scale(${f2(2.2 * k)})">${wheat(0, 0, 60, '#B98A34', '#C9962E')}</g></g>`; });
      break;
    case 6: {
      let rays = ''; for (let k = 0; k < 14; k++) { const a = Math.PI / 2 + k * Math.PI / 13; rays += `<path d="M${f2(320 + Math.cos(a) * 78)} ${f2(Math.sin(a) * 78)}L${f2(320 + Math.cos(a) * (104 + (k % 2) * 14))} ${f2(Math.sin(a) * (104 + (k % 2) * 14))}" stroke="${P.sun}" stroke-width="4" stroke-linecap="round"/>`; }
      inner = `<circle cx="320" cy="0" r="120" fill="${P.sun}" fill-opacity=".12"/><g class="sc-spin" style="transform-origin:320px 0px">${rays}</g><circle cx="320" cy="0" r="62" fill="${P.sun}"/>`;
      break;
    }
  }
  return `<svg class="scene orn" viewBox="0 0 320 240" preserveAspectRatio="xMaxYMin meet" aria-hidden="true" focusable="false"><g class="sc-orn">${inner}</g></svg>`;
}

/* Restart entry + loops for every scene/illustration inside root */
function playAll(root) {
  if (!root) return;
  const els = root.querySelectorAll('.scene:not(.static), .lil');
  els.forEach(s => s.classList.remove('play', 'leave'));
  void root.getBoundingClientRect();
  els.forEach(s => s.classList.add('play'));
}
let fxUid = 0;
function seasonFx(motif, accent, W, H, seed) {
  if (motif === 'waves' || motif === 'horizon') return null;
  const NS = 'http://www.w3.org/2000/svg';
  const R = rng(seed * 7919 + 17), uid = 'fx' + (++fxUid);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'season-fx'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('aria-hidden', 'true');
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };
  const defs = mk('defs', {});
  const anims = []; let end = 0;
  const A = (e, kf, o) => { anims.push([e, kf, o]); end = Math.max(end, (o.delay || 0) + o.duration); };
  const M = Math.round(Math.max(32, W * .05)), span = W - 2 * M;
  const grad = (id, col, stops, radial = true) => {
    const g = mk(radial ? 'radialGradient' : 'linearGradient', Object.assign({ id }, radial ? {} : { x1: 0, y1: 0, x2: 0, y2: 1 }), defs);
    stops.forEach(([o, op]) => mk('stop', { offset: o, 'stop-color': col, 'stop-opacity': op }, g));
    return `url(#${id})`;
  };
  const depth = () => { const r = R(); return r < .4 ? .6 + R() * .3 : r < .82 ? 1 + R() * .45 : 1.8 + R() * .8; };
  const opac = z => z < .95 ? .5 : z < 1.6 ? .85 : .96;

  // generic flight: falling (or rising) with sway, spin, flip and wind
  const flight = (e, x, z, o) => {
    const N = 22, kf = [];
    const y0 = o.up ? H + 16 * z : -18 * z, y1 = o.up ? H * (.04 + R() * .3) : H * (.7 + R() * .32);
    const amp = (10 + R() * 18) * z, ph = R() * 6.28, spin = (R() < .5 ? -1 : 1) * (o.spin || 260) * (.6 + R() * .6), r0 = R() * 360, dx = (o.wind || 0) * z * (.7 + R() * .6);
    for (let k = 0; k <= N; k++) {
      const t = k / N, e2 = t * .25 + smooth(t) * .75;
      const px = x + dx * e2 + Math.sin(t * Math.PI * (o.waves || 2) + ph) * amp, py = y0 + (y1 - y0) * e2;
      const fl = o.flip ? .28 + .72 * Math.abs(Math.cos(t * Math.PI * 3 + ph)) : 1;
      kf.push({ transform: `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) rotate(${(r0 + spin * e2).toFixed(1)}deg) scale(${(z * fl).toFixed(3)},${z.toFixed(3)})`,
                opacity: (k === 0 || k === N) ? 0 : (k === 1 || k === N - 1) ? opac(z) * .6 : opac(z) });
    }
    A(e, kf, { duration: o.dur * (1.28 - z * .2) * (.85 + R() * .3), delay: (o.delay || 0) + R() * o.spread });
  };
  // a gust: a few near particles swooping across the whole frame
  const gust = (make, n, o) => {
    for (let i = 0; i < n; i++) {
      const z = 1.7 + R() * .7, e = make(i), N = 18, kf = [], yA = H * (.15 + R() * .25), yB = yA + H * (.15 + R() * .2), ph = R() * 6.28;
      for (let k = 0; k <= N; k++) { const t = k / N, px = M + (W - 2 * M) * t, py = yA + (yB - yA) * t - Math.sin(t * Math.PI) * H * .12 + Math.sin(t * 9 + ph) * 8;
        kf.push({ transform: `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) rotate(${(t * 540 + i * 40).toFixed(1)}deg) scale(${(z * (.35 + .65 * Math.abs(Math.cos(t * 7 + ph)))).toFixed(3)},${z.toFixed(3)})`,
                  opacity: (k === 0 || k === N) ? 0 : .95 }); }
      A(e, kf, { duration: 2600 + R() * 500, delay: (o.delay || 1100) + i * 170, easing: 'cubic-bezier(.4,0,.6,1)' });
    }
  };
  const spawn = (n, make, o, xRight = 0) => {
    const list = Array.from({ length: n }, () => ({ z: depth(), x: M + 20 + R() * Math.max(10, span - 40 - xRight) }));
    list.sort((a, b) => a.z - b.z).forEach((p, i) => flight(make(i, p.z), p.x, p.z, o));
  };

  switch (motif) {
    case 'leaves': {
      const cols = PAL[0].extra;
      spawn(clamp(Math.round(W / 34), 16, 34), (i) => {
        const g = mk('g', { opacity: 0 }), c = cols[i % cols.length];
        if (R() < .65) { mk('path', { d: mapleD(9), fill: c }, g); mk('path', { d: 'M0 0L0 13', stroke: c, 'stroke-width': 1.3, 'stroke-linecap': 'round' }, g); }
        else { mk('path', { d: 'M0 -11C8 -7 8 6 0 11C-8 6 -8 -7 0 -11Z', fill: c }, g); mk('path', { d: 'M0 -9L0 14', stroke: c, 'stroke-width': 1.2 }, g); }
        mk('path', { d: 'M0 -6L0 7M0 -1L4 -5M0 3L-4 -1', stroke: '#fff', 'stroke-opacity': .35, 'stroke-width': .9, 'stroke-linecap': 'round', fill: 'none' }, g);
        return g;
      }, { dur: 4400, spread: 1800, wind: 70, spin: 300, flip: true, waves: 2 }, 90);
      gust(i => { const g = mk('g', { opacity: 0 }); mk('path', { d: mapleD(9), fill: cols[(i + 1) % 4] }, g); return g; }, 5, { delay: 1300 });
      break;
    }
    case 'mist': {
      const g = grad(uid + 'g', accent, [[0, .5], [.55, .2], [1, 0]]);
      const veil = mk('rect', { width: W, height: H, fill: grad(uid + 'v', accent, [[0, .14], [.6, .06], [1, 0]], false), opacity: 0 });
      A(veil, [{ opacity: 0 }, { opacity: 1, offset: .45 }, { opacity: 0 }], { duration: 4600, easing: 'ease-in-out' });
      for (let i = 0; i < 7; i++) {
        const rx = W * (.38 + R() * .3), ry = H * (.05 + R() * .06) + 34, cy = H * (.06 + i * .14) + (R() - .5) * H * .05;
        const cx = W * (.2 + R() * .6), dx = W * .14 * (i % 2 ? -1 : 1);
        const e = mk('ellipse', { cx: 0, cy: 0, rx, ry, fill: g, opacity: 0 });
        A(e, [{ transform: `translate(${cx - dx}px,${cy}px) scaleX(.85)`, opacity: 0 }, { opacity: .95, offset: .3 }, { opacity: .95, offset: .7 },
              { transform: `translate(${cx + dx}px,${cy - 10}px) scaleX(1.1)`, opacity: 0 }],
          { duration: 4200 + R() * 900, delay: i * 140, easing: 'cubic-bezier(.4,0,.6,1)' });
      }
      break;
    }
    case 'frost': {
      spawn(clamp(Math.round(W / 30), 18, 38), (i, z) => mk('path', { d: flakeD(7), stroke: accent, 'stroke-width': z > 1.6 ? 1.1 : 1.4, 'stroke-linecap': 'round', fill: 'none', opacity: 0 }),
        { dur: 5600, spread: 2200, wind: 24, spin: 90, waves: 1.2 });
      // frost crystals growing in from both top corners
      const k = clamp(Math.min(W, H) / 700, .6, 1.2);
      const ice = (x, y, a, len, d, delay) => {
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        const p = mk('path', { d: `M${f2(x)} ${f2(y)}L${f2(x2)} ${f2(y2)}`, stroke: accent, 'stroke-width': Math.max(.8, d * .8), 'stroke-linecap': 'round', 'stroke-opacity': .55, pathLength: 1, 'stroke-dasharray': '1 1.1', 'stroke-dashoffset': 1.02 });
        A(p, [{ strokeDashoffset: 1.02 }, { strokeDashoffset: 0 }], { duration: 280, delay, easing: 'ease-out' });
        if (d > 0) { ice(x2, y2, a - .62, len * .6, d - 1, delay + 210); ice(x2, y2, a + .62, len * .6, d - 1, delay + 210); if (d > 1) ice(x2, y2, a, len * .72, d - 1, delay + 210); }
      };
      [[0, 0, .35], [0, 0, 1.2], [W, 0, Math.PI - .35], [W, 0, Math.PI - 1.2]].forEach(([x, y, a], i) => ice(x, y, a, 80 * k, 4, 300 + i * 120));
      break;
    }
    case 'sprout': { // Germinale: dandelion seeds drifting up across the page
      const ink = MONTHS[3].theme.ink;
      spawn(clamp(Math.round(W / 50), 12, 24), () => {
        const g = mk('g', { opacity: 0 });
        mk('path', { d: 'M0 0L0 12', stroke: ink, 'stroke-opacity': .55, 'stroke-width': 1 }, g);
        let d = ''; for (let j = 0; j < 11; j++) { const a = -Math.PI / 2 + (j - 5) * .26; d += `M0 0L${f2(Math.cos(a) * 9)} ${f2(Math.sin(a) * 9)}`; }
        mk('path', { d, stroke: ink, 'stroke-opacity': .5, 'stroke-width': .7, fill: 'none' }, g);
        mk('ellipse', { cx: 0, cy: 13, rx: 1.3, ry: 2.2, fill: '#6B5040' }, g);
        return g;
      }, { up: true, dur: 5600, spread: 2400, wind: 130, spin: 40, waves: 1.5 }, 130);
      break;
    }
    case 'petals': {
      const cols = ['#F2B8CC', '#E98FB0', '#FFFFFF', '#C9A3DA', '#8E5FA3'];
      const petal = c => { const e = mk('path', { d: 'M0 -8C5 -6 6 2 2 7L0 5L-2 7C-6 2 -5 -6 0 -8Z', fill: c, stroke: '#D98AAE', 'stroke-width': .5, opacity: 0 }); return e; };
      spawn(clamp(Math.round(W / 30), 18, 40), i => petal(cols[i % cols.length]), { dur: 4600, spread: 1900, wind: 110, spin: 220, flip: true, waves: 2.5 }, 120);
      gust(i => petal(cols[(i + 2) % cols.length]), 6, { delay: 1200 });
      break;
    }
  }
  return { svg, total: end + 150, run() { anims.forEach(([e, kf, o]) => e.animate(kf, Object.assign({ fill: 'both', easing: 'linear' }, o))); } };
}

window.ORN = { MONTHS, LETTER_META, metaKeyFor, dayBg, illusFor, sceneSVG, hasVariants, themeFor, patternURI, ornamentSVG, playAll, seasonFx, setToday: (s) => { todayStr = s; } };
})();
