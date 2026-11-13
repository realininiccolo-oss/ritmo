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
/* Ritmo 2.2: ogni mese ha il giorno e la notte. Brumale ha due disegni a sé (la notte è il disegno originale, il giorno è coperto con la pioggerella);
   gli altri mesi di notte tengono lo stesso paesaggio, tinto di blu notte, con luna, stelle e luci (finestre, lucciole, il faro). */
const NIGHT_SKY = [['#1A1830', '#4D3A50'], null, ['#0E1A2E', '#2C4664'], ['#121A2E', '#36425F'], ['#111A2C', '#2E3D5C'], ['#0C1730', '#2A4872'], ['#0B1430', '#36406F']];
const MOON = ['#F6DBA6', '#E8ECF7', '#F2F5FF', '#EEF0F8', '#F3F1E4', '#F4EFD8', '#F7F2DE'];
const NIGHT_K = [.62, 0, .46, .6, .6, .58, .58];
const NIGHT_INK = '#111933';
const THEMES_N = [
  { bg: '#2A1F26', bg2: '#36282F', ink: '#F1E6DA', accent: '#E0935F', line: '#3A3346', motif: 'leaves' }, null,
  { bg: '#122339', bg2: '#1A2F4A', ink: '#E8F0F6', accent: '#8FC3DA', line: '#2A3A56', motif: 'frost' },
  { bg: '#15261F', bg2: '#1D3329', ink: '#E9F1E6', accent: '#A9C98F', line: '#2E3850', motif: 'sprout' },
  { bg: '#221C33', bg2: '#2D2542', ink: '#EEF5E8', accent: '#C3A0D6', line: '#2D364E', motif: 'petals' },
  { bg: '#0E2630', bg2: '#16333F', ink: '#F5EEDB', accent: '#7FC4CE', line: '#283656', motif: 'waves' },
  { bg: '#221B2F', bg2: '#2D243D', ink: '#F6EEDC', accent: '#E2B464', line: '#2A3358', motif: 'horizon' }];
const hasVariants = () => true;
const themeFor = (mi, variant) => mi === 1 ? (variant === 'giorno' ? THEME_BRUMALE_GIORNO : THEMES[1]) : (variant === 'notte' ? THEMES_N[mi] : THEMES[mi]);
const hex6 = (c) => c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c;
const toneHex = (c, k) => mixHex(hex6(c), NIGHT_INK, k);
const toneStr = (str, k) => str.replace(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g, (m) => toneHex(m, k));
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
  return `<g class="sc-hover" style="--hd:${f2(12 + R() * 8)}s;--hdl:${f2(-R() * 12)}s;--hx:${f2(-(26 + R() * 40))}px"><g transform="translate(${x} ${y}) scale(${s})">`
    + `<path class="sc-gull" d="M-12 0Q-6 -7 0 0Q6 -7 12 0" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/></g></g>`;
}
function sailboat(x, y, s, hull, sail) {
  return `<g class="sc-bob"><g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 0L12 0L8 5L-8 5Z" fill="${hull}"/>`
    + `<path d="M0 -1L0 -24L11 -2Z" fill="${sail}"/><path d="M-1 -3L-1 -20L-9 -3Z" fill="${sail}" fill-opacity=".8"/></g></g>`;
}

const captain = () => `<path d="M-6 0V-6Q-6 -8 -3 -8H6V0Z" fill="#1E2230"/>`
  + `<path d="M-6.4 -6Q-7.6 -18 -2 -21.6H4.4Q9 -18.4 7.6 -6Z" fill="#22324F"/><path d="M1.2 -21.4L2.4 -14L3.4 -21.4Z" fill="#FFFFFF"/><path d="M-4 -12.5H6.4" stroke="#18243B" stroke-width="1"/>`
  + `<circle cx="4.6" cy="-15" r=".8" fill="#E2B64A"/><circle cx="4.6" cy="-11" r=".8" fill="#E2B64A"/><path d="M-5.4 -20l2 -1.4" stroke="#E2B64A" stroke-width="1.1"/>`
  + `<path d="M3 -18.6Q8 -14 10.6 -11.6" stroke="#22324F" stroke-width="3.6" stroke-linecap="round" fill="none"/><circle cx="11.4" cy="-11" r="1.7" fill="#D8A47E"/>`
  + `<path d="M-.6 -21.6V-23.2H3.4V-21.6Z" fill="#D8A47E"/><circle cx="1.6" cy="-26.6" r="4.7" fill="#E0B08A"/>`
  + `<path d="M-2.6 -25.8Q-2 -20 2.4 -20.4Q6 -21 6.2 -25Q4.6 -23.4 2.4 -23.6Q-.4 -23.6 -2.6 -25.8Z" fill="#EDEAE4"/><path d="M1.4 -25.2Q3.4 -24.4 5.2 -25.2" stroke="#C9C4BA" stroke-width=".8" fill="none"/>`
  + `<circle cx="4" cy="-27.4" r=".55" fill="#2A2420"/><path d="M5.8 -27L6.8 -25.8L5.8 -25.6" fill="#D8A47E"/>`
  + `<path d="M-3.4 -29.6Q1.6 -35.4 7 -30L6.6 -28.8L-3 -28.6Z" fill="#FFFFFF"/><rect x="-3.4" y="-30" width="10.6" height="2.1" rx=".6" fill="#1E2230"/><path d="M6.2 -28.4Q9.6 -28.2 10.6 -26.6Q7.8 -26.8 6 -27.2Z" fill="#1E2230"/><circle cx="1.8" cy="-31.2" r="1" fill="#E2B64A"/>`;
/* 2.7: la nave degli antichi greci (prua a sinistra col rostro di bronzo e l'occhio dipinto, poppa ricurva, vela quadra, remi che vogano insieme) */
const greekShip = () => {
  let s = `<path d="M-8 -14V-120" stroke="#5A4632" stroke-width="3"/><path d="M-8 -120L-88 -22M-8 -120L80 -36M-8 -112L-60 -108M-8 -112L44 -108" stroke="#5A4632" stroke-opacity=".5" stroke-width=".8"/>`
    + `<path d="M-60 -108Q-8 -112 44 -108" stroke="#5A4632" stroke-width="2.8" fill="none" stroke-linecap="round"/>`
    + `<path d="M-56 -106Q-8 -109 40 -106Q45 -76 38 -46Q-8 -42 -54 -46Q-61 -76 -56 -106Z" fill="#EFE4CC"/><path d="M-8 -108Q12 -76 38 -46Q-8 -42 -8 -42Z" fill="#000" fill-opacity=".05"/>`
    + `<path d="M-55 -98Q-8 -101 41 -98M-56 -56Q-8 -52 40 -56" stroke="#A8452E" stroke-width="3" fill="none"/><path d="M-32 -106Q-35 -76 -31 -44M-8 -108V-42M16 -107Q19 -76 15 -44" stroke="#D9CBAE" stroke-width=".9" fill="none"/>`
    + `<path class="sc-flagw" d="M-8 -120L6 -117L-8 -113Z" fill="#A8452E"/>`;
  s += `<path d="M62 -12L76 14" stroke="#4A3626" stroke-width="2.6" stroke-linecap="round"/><path d="M71 6Q78 12 80 18L74 16Z" fill="#6E5236"/>`;
  s += `<path d="M-104 3L-90 1Q-86 -10 -88 -22Q-84 -25 -82 -16L60 -14Q78 -16 86 -28Q92 -40 86 -50Q82 -56 78 -50Q84 -42 80 -32Q74 -20 62 -8L58 4Q0 10 -86 7L-90 6L-104 5Z" fill="#2A2420"/>`
    + `<path d="M-104 3L-90 1L-90 6L-104 5Z" fill="#B8863B"/><path d="M-84 -9L60 -8" stroke="#A8452E" stroke-width="3.2"/><path d="M-84 -4.5L58 -3.5" stroke="#B8863B" stroke-width=".9"/>`
    + `<path d="M-87 -3Q-81 -8.6 -75 -3Q-81 2 -87 -3Z" fill="#F2ECDC" stroke="#A8452E" stroke-width=".9"/><circle cx="-80.6" cy="-3.2" r="1.9" fill="#1E1A14"/>`;
  for (let x = -62, i = 0; x <= 48; x += 14, i++) s += `<circle cx="${x}" cy="-17" r="4.6" fill="${i % 2 ? '#A8452E' : '#B8863B'}" stroke="#2A2420" stroke-width="1"/><circle cx="${x}" cy="-17" r="1.3" fill="#2A2420"/>`;
  for (let x = -60; x <= 50; x += 12) s += `<g><animateTransform attributeName="transform" type="rotate" values="-12 ${x} -5;14 ${x} -5;-12 ${x} -5" keyTimes="0;.42;1" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1" dur="2.8s" repeatCount="indefinite"/>`
    + `<path d="M${x} -5L${x - 13} 16" stroke="#7A5A3A" stroke-width="1.6" stroke-linecap="round"/><path d="M${x - 11} 12.6L${x - 15.6} 20L${x - 12} 20.4Z" fill="#8E6A46"/></g><circle cx="${x}" cy="-5" r="1" fill="#1E1A14"/>`;
  return s;
};
/* 2.7: il battello a ruota laterale (prua a sinistra): scafo nero col bordo rosso, tuga chiara, ciminiera, ruota nella sua cassa */
const PW = (x) => x > -36 && x < 42;   // dove sta la cassa della ruota: lì le finestre non si vedono
const paddleSteamer = (u) => {
  let s = `<defs><clipPath id="${u}pw"><rect x="-32" y="-12" width="72" height="28"/></clipPath></defs>`;
  s += `<path d="M-74 -18V-58M60 -20V-44" stroke="#2A2420" stroke-width="1.4"/><path d="M-74 -58L60 -44M-74 -58L-90 -20M60 -44L82 -18" stroke="#2A2420" stroke-opacity=".5" stroke-width=".6"/><path class="sc-flagw" d="M60 -44L74 -41L60 -38Z" fill="#B23A2E"/><path class="sc-flagw" d="M-74 -58L-62 -55.6L-74 -53Z" fill="#E3A33B"/>`
    + `<path d="M2 -38L6 -88H20L17 -38Z" fill="#D9A441"/><path d="M12 -38L14 -88H20L17 -38Z" fill="#000" fill-opacity=".12"/><path d="M5.6 -88H20.4L20 -81H6.2Z" fill="#1E1E1E"/><path d="M4.8 -66H18.8" stroke="#B23A2E" stroke-width="2.6"/>`
    + `<rect x="-46" y="-54" width="26" height="16" rx="1.2" fill="#F4EEE0"/><path d="M-48 -54H-18" stroke="#2A2420" stroke-width="1.8"/><rect x="-42" y="-50" width="5" height="7" fill="#3E6E7A"/><rect x="-33" y="-50" width="5" height="7" fill="#3E6E7A"/><path d="M-26 -50h3v7h-3z" fill="#3E6E7A"/>`
    + `<path d="M-68 -38H62" stroke="#2A2420" stroke-width="1.2"/>` + Array.from({ length: 14 }, (_, i) => `<path d="M${-66 + i * 9.4} -38V-34" stroke="#2A2420" stroke-width=".8"/>`).join('')
    + `<rect x="-64" y="-34" width="122" height="16" rx="1.2" fill="#F4EEE0"/><rect x="22" y="-34" width="36" height="16" fill="#000" fill-opacity=".06"/>`
    + Array.from({ length: 12 }, (_, i) => -58 + i * 9).filter((x) => !PW(x) && !PW(x + 5)).map((x) => `<path d="M${x} -22V-28Q${x + 2.5} -31 ${x + 5} -28V-22Z" fill="#3E6E7A"/>`).join('');
  s += `<path d="M-92 -20L82 -18Q88 -16 90 -12L82 4Q40 9 -60 8Q-82 5 -88 -10Z" fill="#20242A"/><path d="M-92 -20L82 -18L82 -14.6L-90.6 -16Z" fill="#F1ECE0"/><path d="M-84 0Q-20 7 84 0L82 4Q40 9 -60 8Q-78 6 -84 0Z" fill="#A8352B"/>`;
  /* la ruota che gira sotto la cassa, mezza nell'acqua */
  let wh = ''; for (let k = 0; k < 10; k++) wh += `<g transform="rotate(${k * 36} 4 -16)"><path d="M4 -16V10" stroke="#3B3012" stroke-width="1.4"/><rect x="0.4" y="8" width="7.2" height="4" fill="#7A2620"/></g>`;
  s += `<g clip-path="url(#${u}pw)"><g><animateTransform attributeName="transform" type="rotate" from="0 4 -16" to="-360 4 -16" dur="6s" repeatCount="indefinite"/>${wh}</g></g>`;
  /* la cassa: semicerchio scuro con la raggiera di stecche bianche e il bordo dorato, poggiata sulla falchetta */
  s += `<rect x="-34" y="-17" width="76" height="4" fill="#2A2E36"/><path d="M-28 -16A32 32 0 0 1 36 -16Z" fill="#2A2E36"/>`
    + Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1 + (i + .5) / 9); return `<path d="M${f2(4 + Math.cos(a) * 8)} ${f2(-16 + Math.sin(a) * 8)}L${f2(4 + Math.cos(a) * 28)} ${f2(-16 + Math.sin(a) * 28)}" stroke="#E9E2D3" stroke-width="2.2" stroke-linecap="round"/>`; }).join('')
    + `<path d="M-28 -16A32 32 0 0 1 36 -16" stroke="#C9A04A" stroke-width="2.4" fill="none"/><path d="M-4 -16A8 8 0 0 1 12 -16Z" fill="#C9A04A"/><path d="M-30 -16H38" stroke="#C9A04A" stroke-width="1.6"/>`;
  return s;
};
const at = (x, y, k, inner, cls) => `<g transform="translate(${f2(x)} ${f2(y)}) scale(${k})"${cls ? ` class="${cls}"` : ''}>${inner}</g>`;
/* ===== Ritmo 2.8 · paesaggi con la profondità =====
   Ogni disegno è un luogo, non un fondale con un oggetto sopra: i piani lontani sono piccoli e velati dalla foschia,
   quelli vicini più scuri e più grandi; l'acqua riflette la riva, il cielo, la luna e le luci; un primo piano incornicia.
   Mese → il protagonista del mese nel suo luogo. Settimana e Giorno → il soggetto della settimana nel luogo che gli serve:
   O la vedetta sul crinale sopra la valle · R la barca a remi sul lago, verso la casa illuminata sull'altra riva
   N la sfera armillare sul belvedere, l'asse puntato alla stella polare · R la barca a vela verso il faro
   A la torre dell'orologio nel borgo (le lancette segnano l'ora vera) · R il mulino ad acqua sul torrente · V l'ometto in vetta sopra le nuvole.
   Sole e luna stanno all'altezza dell'ora (la luna sorge più tardi ogni giorno, secondo la fase). */
const WOOD = '#8A5E3B', WOOD_D = '#5E3D25', WOOD_L = '#B98A5C', BRASS = '#C9973A', BRASS_L = '#EBC77A', BRASS_D = '#7A5520';
const MONTH_OBJ = ['Il cannocchiale', 'Il pontile con la lanterna e la barca che arriva', 'Il segnavia sul passo innevato', 'La nave degli antichi greci verso il tempio', 'Il mulino a vento tra i campi in fiore', 'Il battello a ruota lungo la costa del grano', 'Il forziere trovato sulla scogliera'];
const WEEK_OBJ = ['La vedetta sul crinale', 'La barca a remi verso la casa illuminata', 'La sfera armillare sul belvedere', 'La barca a vela verso il faro', 'La torre dell\'orologio nel borgo', 'Il mulino ad acqua sul torrente', 'L\'ometto di pietre in vetta'];
/* colori del luogo, dal lontano (far) al vicino (near) e al primo piano (front); l'acqua dall'orizzonte (0) al fondo (1) */
const LAND = [
  { sky: ['#F4E3CE', '#F0CDA2'], far: '#CDAE8F', near: '#8C5E33', front: '#5B3A21', water: ['#D8D6C6', '#6E8A8E'], rock: '#9C8773', path: '#E6CDA6', hz: .62 },
  { sky: ['#AFBBCB', '#E3DFD7'], far: '#9DA8B7', near: '#5C6675', front: '#3C4452', water: ['#BCC5D0', '#34405A'], rock: '#7D8592', path: '#C9CDD3', hz: .66 },
  { sky: ['#CFE1EC', '#EEF3F4'], far: '#9FB9CB', near: '#E4ECF0', front: '#F6F9FA', water: ['#BCD0DA', '#3D6176'], rock: '#7C8993', path: '#FFFFFF', hz: .58 },
  { sky: ['#DAECDD', '#F3F0D6'], far: '#B2CCA6', near: '#6B9A50', front: '#4A7A39', water: ['#C6E3DC', '#4B928B'], rock: '#9C9A88', path: '#E6DDBE', hz: .56 },
  { sky: ['#EEDBEA', '#F5EED6'], far: '#B7CFAB', near: '#72A455', front: '#517E3D', water: ['#C7E2DE', '#4C918C'], rock: '#9F9A8C', path: '#EADFC0', hz: .56 },
  { sky: ['#C3E2EB', '#F8EAC6'], far: '#93BCC0', near: '#CFA947', front: '#A47C2A', water: ['#B1DADB', '#2B7B89'], rock: '#A29070', path: '#EFDAA2', hz: .5, sea: true },
  { sky: ['#C0E0DE', '#F6CD98'], far: '#98BAB6', near: '#B7844E', front: '#8A5A32', water: ['#9ACECD', '#1E6474'], rock: '#A07B58', path: '#EFD8A5', hz: .5, sea: true },
];
const NIGHT_SKY2 = [['#17162B', '#463650'], ['#0C1322', '#28344F'], ['#0D1729', '#2A4360'], ['#101828', '#33405B'], ['#10182A', '#2D3B58'], ['#0B152B', '#284569'], ['#0A1229', '#333C69']];
const PEAK = [.62, .42, .46, .78, .9, 1, .9];   // quanto sale il sole a mezzogiorno nel mese (autunno basso, estate alto)
/* curva morbida che passa per i punti (Catmull-Rom), campionata fitta */
function crSample(ctrl, step = 6) {
  const out = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    const n = Math.max(2, Math.ceil(Math.abs(p2[0] - p1[0]) / step));
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}
const ptsD = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f2(x)} ${f2(y)}`).join('');
function interpY(pts, x) {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) if (x >= pts[i][0] && x <= pts[i + 1][0]) { const t = (x - pts[i][0]) / ((pts[i + 1][0] - pts[i][0]) || 1); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t; }
  return pts[pts.length - 1][1];
}
/* ---- figure e cose (origine alla base, al centro; L = da che parte viene la luce: +1 da sinistra) ---- */
const shade = (c, k) => mixHex(c, '#141A22', k), light = (c, k) => mixHex(c, '#FFFFFF', k);
function treeRound(x, y, s, c, trunk, L) {
  const r = 12 * s, cy = y - 21 * s, dk = shade(c, .32), lt = light(c, .2), o = -L * r * .2;
  const C = [[0, 0, 1], [-.82, .36, .72], [.82, .32, .74], [.08, -.72, .7]];
  return `<path d="M${f2(x)} ${f2(y)}V${f2(cy + r * .3)}M${f2(x)} ${f2(cy + r * .9)}l${f2(L * -5 * s)} ${f2(-5 * s)}" stroke="${trunk}" stroke-width="${f2(2.4 * s)}" stroke-linecap="round" fill="none"/>`
    + C.map(([a, b, k]) => `<circle cx="${f2(x + a * r)}" cy="${f2(cy + b * r)}" r="${f2(k * r)}" fill="${dk}"/>`).join('')
    + C.map(([a, b, k]) => `<circle cx="${f2(x + a * r + o)}" cy="${f2(cy + b * r - r * .08)}" r="${f2(k * r * .84)}" fill="${c}"/>`).join('')
    + `<circle cx="${f2(x - L * r * .42)}" cy="${f2(cy - r * .42)}" r="${f2(r * .34)}" fill="${lt}" fill-opacity=".75"/>`;
}
function treeCypress(x, y, s, c, L) {
  const h = 62 * s, w = 6.5 * s;
  return `<path d="M${f2(x)} ${f2(y)}C${f2(x - w)} ${f2(y - h * .3)} ${f2(x - w * .8)} ${f2(y - h * .75)} ${f2(x)} ${f2(y - h)}C${f2(x + w * .8)} ${f2(y - h * .75)} ${f2(x + w)} ${f2(y - h * .3)} ${f2(x)} ${f2(y)}Z" fill="${c}"/>`
    + `<path d="M${f2(x)} ${f2(y)}C${f2(x + L * w)} ${f2(y - h * .3)} ${f2(x + L * w * .8)} ${f2(y - h * .75)} ${f2(x)} ${f2(y - h)}Q${f2(x + L * w * .2)} ${f2(y - h * .5)} ${f2(x)} ${f2(y)}Z" fill="${shade(c, .3)}"/>`;
}
function treePine(x, y, s, c, snow, L) {
  let d = '', ds = '', sn = '';
  const h = 58 * s, w = 38 * s;
  [[1, .56, .32], [.78, .32, .42], [.56, .06, .52]].forEach(([t, b, hw]) => { const ty = y - h * t, by = y - h * b;
    d += `M${f2(x)} ${f2(ty)}L${f2(x + w * hw)} ${f2(by)}L${f2(x - w * hw)} ${f2(by)}Z`;
    ds += `M${f2(x)} ${f2(ty)}L${f2(x + L * w * hw)} ${f2(by)}L${f2(x)} ${f2(by)}Z`;
    if (snow) { const sy = ty + (by - ty) * .42, sw = w * hw * .42; sn += `M${f2(x)} ${f2(ty)}L${f2(x + sw)} ${f2(sy)}L${f2(x + sw * .3)} ${f2(sy - 2 * s)}L${f2(x - sw * .2)} ${f2(sy + 1.5 * s)}L${f2(x - sw)} ${f2(sy)}Z`
      + `M${f2(x - w * hw)} ${f2(by)}L${f2(x + w * hw)} ${f2(by)}L${f2(x + w * hw * .6)} ${f2(by - 2.4 * s)}L${f2(x - w * hw * .7)} ${f2(by - 2 * s)}Z`; } });
  return `<rect x="${f2(x - 2 * s)}" y="${f2(y - h * .1)}" width="${f2(4 * s)}" height="${f2(h * .1)}" fill="#4E3C2E"/><path d="${d}" fill="${c}"/><path d="${ds}" fill="${shade(c, .3)}"/>${sn ? `<path d="${sn}" fill="#FFFFFF"/>` : ''}`;
}
function treeUmbrella(x, y, s, c, trunk, L) {
  const cy = y - 40 * s, dk = shade(c, .3);
  return `<path d="M${f2(x)} ${f2(y)}Q${f2(x + 4 * s)} ${f2(y - 22 * s)} ${f2(x + 1 * s)} ${f2(cy + 2 * s)}M${f2(x + 2 * s)} ${f2(y - 26 * s)}q${f2(-8 * s)} ${f2(-6 * s)} ${f2(-12 * s)} ${f2(-12 * s)}" stroke="${trunk}" stroke-width="${f2(2.6 * s)}" stroke-linecap="round" fill="none"/>`
    + `<path d="M${f2(x - 24 * s)} ${f2(cy + 3 * s)}Q${f2(x - 26 * s)} ${f2(cy - 8 * s)} ${f2(x - 12 * s)} ${f2(cy - 10 * s)}Q${f2(x)} ${f2(cy - 16 * s)} ${f2(x + 12 * s)} ${f2(cy - 11 * s)}Q${f2(x + 27 * s)} ${f2(cy - 9 * s)} ${f2(x + 25 * s)} ${f2(cy + 3 * s)}Z" fill="${dk}"/>`
    + `<path d="M${f2(x - 22 * s)} ${f2(cy)}Q${f2(x - 23 * s)} ${f2(cy - 9 * s)} ${f2(x - 11 * s)} ${f2(cy - 10.5 * s)}Q${f2(x)} ${f2(cy - 16 * s)} ${f2(x + 11 * s)} ${f2(cy - 11.5 * s)}Q${f2(x + 18 * s)} ${f2(cy - 10 * s)} ${f2(x + L * -4 * s + 14 * s)} ${f2(cy - 3 * s)}Q${f2(x)} ${f2(cy - 6 * s)} ${f2(x - 22 * s)} ${f2(cy)}Z" fill="${c}"/>`;
}
function treeBlossom(x, y, s, cols, trunk, R, p) {
  let c = `<path d="M${f2(x)} ${f2(y)}L${f2(x)} ${f2(y - 22 * s)}M${f2(x)} ${f2(y - 15 * s)}l${f2(-9 * s)} ${f2(-11 * s)}M${f2(x)} ${f2(y - 19 * s)}l${f2(8 * s)} ${f2(-11 * s)}" stroke="${trunk}" stroke-width="${f2(2.6 * s)}" stroke-linecap="round" fill="none"/>`;
  for (let j = 0; j < 12; j++) { const a = R() * Math.PI * 2, rr = R() * 14 * s, cx = x + Math.cos(a) * rr * 1.25, cy = y - 31 * s + Math.sin(a) * rr * .75, rad = (5 + R() * 4.5) * s;
    c += R() < .35 + p * .65 ? `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(rad)}" fill="${cols[j % cols.length]}"/>` : `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(rad * .5)}" fill="#93B45E"/>`; }
  return c;
}
function grassTuft(x, y, s, c) { return `<path d="M${f2(x)} ${f2(y)}q${f2(-2 * s)} ${f2(-8 * s)} ${f2(-7 * s)} ${f2(-12 * s)}M${f2(x)} ${f2(y)}q${f2(.4 * s)} ${f2(-9 * s)} ${f2(1.4 * s)} ${f2(-15 * s)}M${f2(x)} ${f2(y)}q${f2(2 * s)} ${f2(-7 * s)} ${f2(7 * s)} ${f2(-11 * s)}" stroke="${c}" stroke-width="${f2(1.5 * s)}" fill="none" stroke-linecap="round"/>`; }
function reed(x, y, s, c) { return `<path d="M${f2(x)} ${f2(y)}q${f2(-1.5 * s)} ${f2(-16 * s)} ${f2(-4 * s)} ${f2(-30 * s)}M${f2(x + 2 * s)} ${f2(y)}q${f2(1 * s)} ${f2(-12 * s)} ${f2(5 * s)} ${f2(-22 * s)}" stroke="${c}" stroke-width="${f2(1.6 * s)}" fill="none" stroke-linecap="round"/><ellipse cx="${f2(x - 3.8 * s)}" cy="${f2(y - 27 * s)}" rx="${f2(1.8 * s)}" ry="${f2(5 * s)}" transform="rotate(-8 ${f2(x - 3.8 * s)} ${f2(y - 27 * s)})" fill="${shade(c, .25)}"/>`; }
function cottage(x, y, s, wall, roof, L, chimney = true, snow = false) {
  const w = 17 * s, h = 15 * s;
  return `<rect x="${f2(x - w)}" y="${f2(y - h)}" width="${f2(2 * w)}" height="${f2(h)}" fill="${wall}"/><rect x="${f2(L > 0 ? x : x - w)}" y="${f2(y - h)}" width="${f2(w)}" height="${f2(h)}" fill="#000" fill-opacity=".13"/>`
    + `<path d="M${f2(x - w - 3 * s)} ${f2(y - h + .5)}L${f2(x)} ${f2(y - h - 13 * s)}L${f2(x + w + 3 * s)} ${f2(y - h + .5)}Z" fill="${roof}"/><path d="M${f2(x)} ${f2(y - h - 13 * s)}L${f2(x + L * (w + 3 * s))} ${f2(y - h + .5)}H${f2(x)}Z" fill="#000" fill-opacity=".16"/>`
    + (chimney ? `<rect x="${f2(x + 7 * s)}" y="${f2(y - h - 13 * s)}" width="${f2(4 * s)}" height="${f2(9 * s)}" fill="${shade(roof, .25)}"/>` : '')
    + `<rect x="${f2(x - 3 * s)}" y="${f2(y - 8 * s)}" width="${f2(6 * s)}" height="${f2(8 * s)}" fill="${shade(roof, .35)}"/>`
    + (snow ? `<path d="M${f2(x - w - 4 * s)} ${f2(y - h + 1)}L${f2(x)} ${f2(y - h - 14 * s)}L${f2(x + w + 4 * s)} ${f2(y - h + 1)}L${f2(x + w)} ${f2(y - h + 2 * s)}L${f2(x)} ${f2(y - h - 9 * s)}L${f2(x - w)} ${f2(y - h + 2 * s)}Z" fill="#FFFFFF"/>` : '');
}
/* ===== 2.9: i soggetti della settimana cambiano col luogo e col clima del mese =====
   STY[mi] dice come sono fatti: legno e tetti, barca e rematore, vele, borgo, mulino, cose in vetta. */
const STY = [
  { // Foliaio: colline delle vigne, autunno
    wood: [WOOD_D, WOOD, WOOD_L], roof: '#A9502F', tower: 'wood',
    boat: { hull: '#7A4A2E', trim: '#E9DCC4', band: '#4E2E1E', coat: '#6B4E3A', hat: 'cap', cargo: 'uva' },
    sail: { rig: 'sloop', main: '#D98B3A', jib: '#C9642E', hull: '#6E4A2E', stripe: '#E9DCC4', band: '#3E2A1A', pen: '#7A2E22', mark: true },
    town: 'toscano', spire: 'merli', body: '#C98256', flag: '#8E2A22', terr: 'olivi' },
  { // Brumale: il lago nella nebbia, novembre
    wood: ['#3E3128', '#5A4636', '#7A6450'], roof: '#4E5662', tower: 'palafitta', lamp: true,
    boat: { hull: '#2A2622', trim: '#C9C1B2', band: '#141210', coat: '#3E4650', hat: 'cappuccio', canopy: true },
    sail: { rig: 'terzaroli', main: '#B9B5AC', jib: '#A8A49B', hull: '#2E3440', stripe: '#C9C1B2', band: '#1A1E26', pen: '#6A3A34', lamp: true },
    town: 'lombardo', spire: 'cono', body: '#A9A59C', flag: '#5A3A34', terr: 'lampione' },
  { // Ianuario: montagne e neve
    wood: ['#4A3426', '#6A4A34', '#8A6A4E'], roof: '#4E5A64', tower: 'baita',
    boat: { hull: '#F2F4F6', trim: '#2F5A7A', band: '#2F5A7A', coat: '#7A2E2A', hat: 'pelliccia', cargo: 'neve', ice: true },
    sail: { rig: 'ghiaccio', main: '#FBF7EE', jib: '#F1E8D4', hull: '#2F5A7A', stripe: '#FFFFFF', band: '#B23A2E', pen: '#B23A2E' },
    town: 'baite', spire: 'cipolla', body: '#ECE8E0', flag: '#B23A2E', terr: 'ghiaccioli' },
  { // Germinale: primavera, alberi in fiore
    wood: ['#7A5A3E', '#A27A54', '#C9A27A'], roof: '#5E8A4A', tower: 'albero', vine: true,
    boat: { hull: '#5E8A5A', trim: '#F4EFE2', band: '#3E6440', coat: '#C9A27A', hat: 'none', cargo: 'fiori' },
    sail: { rig: 'iole', pen: '#E89BB5' },
    town: 'pastello', spire: 'cupola', body: '#EBCFC2', flag: '#5E8A4A', terr: 'glicine' },
  { // Floreale: i campi in fiore
    wood: ['#6A4A3A', '#8E6A52', '#B48E70'], roof: '#7E5A8E', tower: 'giardino', box: true,
    boat: { hull: '#3E6E9A', trim: '#F4EFE2', band: '#2A4E70', coat: '#E9DCC4', hat: 'none', cargo: 'lavanda' },
    sail: { rig: 'botter', pen: '#E3A33B' },
    town: 'graticcio', spire: 'guglia', body: '#F2E8D6', flag: '#7E5A8E', terr: 'fioriere' },
  { // Messidoro: la costa del grano, estate
    wood: [WOOD_D, WOOD, WOOD_L], roof: '#A9502F', tower: 'saracena',
    boat: { hull: '#F4F1EA', trim: '#2F6E9A', band: '#B23A2E', coat: '#2F5A8A', hat: 'paglia', cargo: 'reti', gozzo: true },
    sail: { rig: 'feluca', pen: '#2F6E9A' },
    town: 'bianco', spire: 'campanile', body: '#F4F1EA', flag: '#2F6E9A', terr: 'limone' },
  { // Estiario: il mare d'estate, le scogliere, il tramonto
    wood: [WOOD_D, WOOD, WOOD_L], roof: '#C0392B', tower: 'bagnino',
    boat: { hull: '#3E9AA6', trim: '#F4F1EA', band: '#1E6474', coat: '#F4F1EA', hat: 'paglia', cargo: 'ombrellone' },
    sail: { rig: 'spinnaker', main: '#FBF7EE', jib: '#F1E8D4', hull: '#F4F1EA', stripe: '#C0392B', band: '#1E2A44', pen: '#C0392B' },
    town: 'ligure', spire: 'piramide', body: '#ECE6DA', flag: '#C0392B', terr: 'buganvillea' },
];
/* la barca a remi (prua a sinistra). Il rematore guarda la poppa, come si rema davvero: tira i remi verso di sé e la pala, sott'acqua, spinge l'acqua indietro.
   Origine = linea di galleggiamento. Ogni colpo: la pala entra a prua, passa sott'acqua verso poppa, esce appena e torna. */
function rowBoat2(lamp = true, st = STY[0].boat) {
  const kt = '0;.56;.74;1', sp = `calcMode="spline" keySplines=".5 0 .5 1;.4 0 .6 1;.4 0 .6 1"`, dur = 'dur="3.2s" repeatCount="indefinite"';
  const A = (vals, attr) => `<animate attributeName="${attr}" values="${vals}" keyTimes="${kt}" ${sp} ${dur}/>`;
  const S = [[13, -24], [2, -25.5], [6, -25], [13, -24]], H = [[20, -15], [-1, -15], [5, -12], [20, -15]], Bl = [[-36, 7], [16, 7], [7, -2], [-36, 7]];
  const oar = (dx, op, w) => `<path d="M${H[0][0] + dx} ${H[0][1]}L${Bl[0][0] + dx} ${Bl[0][1]}" stroke="${WOOD}" stroke-width="${w}" stroke-linecap="round" opacity="${op}">${A(H.map((h, i) => `M${h[0] + dx} ${h[1]}L${Bl[i][0] + dx} ${Bl[i][1]}`).join(';'), 'd')}</path>`
    + `<path d="M${Bl[0][0] + dx} ${Bl[0][1]}l-1 -6" stroke="${WOOD_L}" stroke-width="${w * 2.3}" stroke-linecap="round" opacity="${op}">${A(Bl.map((b) => `M${b[0] + dx} ${b[1]}l${f2((H[0][0] - b[0]) * .12)} ${f2((H[0][1] - b[1]) * .12)}`).join(';'), 'd')}</path>`;
  let hull = `<path d="M-54 -15Q-46 -4 -30 -3L30 -3Q40 -4 46 -12L45 2Q34 9 14 10L-24 10Q-42 7 -54 -15Z" fill="${st.hull}"/><path d="M-54 -15Q-46 -4 -30 -3L30 -3Q40 -4 46 -12" stroke="${st.trim}" stroke-width="2.2" fill="none"/>`
    + `<path d="M-44 -1Q0 2 40 -2" stroke="${st.band}" stroke-width="${st.gozzo ? 2.4 : 1}" fill="none"/><path d="M46 -12L45 2" stroke="${shade(st.hull, .3)}" stroke-width="1.4"/>`;
  if (st.gozzo) hull += `<path d="M-54 -15L-58 -26" stroke="${st.trim}" stroke-width="3.4" stroke-linecap="round"/><path d="M46 -12L48 -20" stroke="${st.trim}" stroke-width="3" stroke-linecap="round"/><circle cx="-44" cy="-7" r="1.6" fill="${st.band}"/>`;
  /* le cose a bordo, a prua */
  const cargo = { uva: `<rect x="-38" y="-12" width="15" height="8" rx="1" fill="#8A5E3B"/><path d="M-38 -8h15" stroke="#5E3D25" stroke-width=".8"/>` + [[-35, -13], [-31, -14.4], [-27, -13], [-33, -15.6], [-29, -16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#5A2E5E"/>`).join(''),
    fiori: `<path d="M-34 -4l2 -8h8l2 8z" fill="#B0643F"/>` + [[-32, -15, '#F4C9D8'], [-28, -17, '#FFFFFF'], [-25, -14, '#E89BB5']].map(([x, y, c]) => `<path d="M-28 -12L${x} ${y}" stroke="#4E7A3A" stroke-width=".8"/><circle cx="${x}" cy="${y}" r="2.4" fill="${c}"/>`).join(''),
    lavanda: `<path d="M-38 -5L-22 -9" stroke="#6E8F55" stroke-width="1.2"/>` + [0, 1, 2, 3].map((i) => `<ellipse cx="${-36 + i * 4}" cy="${f2(-8.6 - i * .9)}" rx="2.4" ry="1.4" fill="#8E5FA3" transform="rotate(-14 ${-36 + i * 4} ${f2(-8.6 - i * .9)})"/>`).join(''),
    reti: `<path d="M24 -4Q30 -12 38 -6Q34 -2 24 -4Z" fill="#6E7A5A"/><path d="M26 -6l4 -3M30 -5l4 -3" stroke="#4E5A3E" stroke-width=".7"/><circle cx="36" cy="-8" r="1.6" fill="#E3A33B"/>`,
    neve: `<path d="M-54 -15Q-48 -19 -40 -12Q-34 -9 -28 -7L-30 -4Q-44 -6 -54 -15Z" fill="#FFFFFF"/><path d="M28 -4Q36 -8 44 -13L46 -11Q38 -5 30 -2Z" fill="#FFFFFF"/>`,
    ombrellone: `<path d="M-42 -6L-24 -10" stroke="#7A5A3A" stroke-width="1.6"/><path d="M-40 -7L-22 -11L-24 -14L-38 -11Z" fill="#E8C34A"/><path d="M-36 -9.4L-30 -10.6" stroke="#C0392B" stroke-width="2.4"/>` }[st.cargo] || '';
  if (st.gozzo) hull = gozzo(true);
  if (st.ice) hull += `<path d="M-54 -15Q-48 -4 -36 -2L-34 9Q-46 6 -54 -15Z" fill="#8A949E"/><path d="M-54 -15Q-48 -4 -36 -2" stroke="#C9D2DA" stroke-width="1.2" fill="none"/>` + [[-48, -6], [-44, -2], [-40, 2], [-38, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#5E666E"/>`).join('')
    + `<path d="M-30 -5L30 -5" stroke="#E6F0F5" stroke-width="1.2" stroke-dasharray="1.4 1.8"/><path d="M-22 -8L34 -14" stroke="#6E5236" stroke-width="1.6" stroke-linecap="round"/><path d="M34 -14l3 -2l1 3z" fill="#8A949E"/>`;
  const canopy = st.canopy ? [-46, -36, -26].map((x) => `<path d="M${x} -4Q${x + 4} -22 ${x + 8} -4" stroke="${st.trim}" stroke-width="1.4" fill="none"/>`).join('') + `<path d="M-42 -13Q-32 -15 -18 -13" stroke="${st.trim}" stroke-width=".8" fill="none"/>` : '';
  const hat = { cap: `<path d="M9 -32Q13.5 -38.6 18 -32.2Z" fill="#8E3A2E"/><path d="M8.8 -32.2H18.4" stroke="#6E2A20" stroke-width="1.2"/>`,
    pelliccia: `<path d="M8.6 -32Q13.5 -41 18.4 -32Z" fill="#6B5240"/><rect x="8.2" y="-33.6" width="10.6" height="3" rx="1.4" fill="#E9E2D6"/>`,
    paglia: `<ellipse cx="13.5" cy="-33.2" rx="8.4" ry="1.6" fill="#E2C77A"/><path d="M10 -33.4Q13.5 -39.4 17 -33.4Z" fill="#E8CF86"/><path d="M10.2 -33.8h6.6" stroke="#B23A2E" stroke-width=".9"/>`,
    cappuccio: `<path d="M8.4 -29Q8 -37.6 13.6 -37.6Q19.4 -37.6 18.8 -29Q17 -33 13.6 -33Q10.4 -33 8.4 -29Z" fill="${shade(st.coat, .15)}"/>`,
    none: `<path d="M9 -32.4Q13.5 -37 18 -32.6Q16 -34.6 13.5 -34.6Q11 -34.6 9 -32.4Z" fill="#4A3426"/>` }[st.hat] || '';
  const scarf = st.hat === 'pelliccia' ? `<path d="M8.6 -25.6h8" stroke="#B23A2E" stroke-width="2.4" stroke-linecap="round"/>` : '';
  const body = `<path d="M3 -6H16" stroke="#3A3026" stroke-width="5" stroke-linecap="round"/><path d="M10 -7Q5 -8 -1 -5" stroke="#2E2A26" stroke-width="4.4" stroke-linecap="round" fill="none"/>`
    + `<path d="M8 -7L${S[0][0]} ${S[0][1]}" stroke="${st.coat}" stroke-width="8" stroke-linecap="round">${A(S.map((p) => `M8 -7L${p[0]} ${p[1]}`).join(';'), 'd')}</path>`
    + `<path d="M${S[0][0]} ${S[0][1] + 3}L${H[0][0]} ${H[0][1]}" stroke="${shade(st.coat, .12)}" stroke-width="3.2" stroke-linecap="round">${A(S.map((p, i) => `M${p[0]} ${p[1] + 3}L${H[i][0]} ${H[i][1]}`).join(';'), 'd')}</path>`
    + `<g><animateTransform attributeName="transform" type="translate" values="${S.map((p) => `${p[0] - 13} ${p[1] + 24}`).join(';')}" keyTimes="${kt}" ${sp} ${dur}/>`
    + `<circle cx="13.5" cy="-30.5" r="4.6" fill="#D9A47E"/>${hat}${scarf}<circle cx="16.2" cy="-31" r=".6" fill="#2A2420"/></g>`;
  const lantern = lamp ? `<path d="M-48 -11L-53 -40" stroke="${WOOD_D}" stroke-width="1.8" stroke-linecap="round"/><path d="M-53 -40h-5" stroke="${WOOD_D}" stroke-width="1.6"/>`
    + `<g transform="translate(-58 -34)"><path d="M0 -6v2" stroke="#3A3A3A" stroke-width=".9"/><path d="M-3.6 -3.4L3.6 -3.4L2.2 -5.4L-2.2 -5.4Z" fill="#3A3A3A"/><rect x="-3" y="-3.4" width="6" height="7.2" rx=".8" fill="#3A3A3A"/><rect x="-2" y="-2.4" width="4" height="5.2" fill="#F6C76E"/></g>` : '';
  return oar(-3, .55, 1.8) + lantern + hull + canopy + (st.gozzo ? '' : cargo) + body + oar(0, 1, 2.2) + `<circle cx="5" cy="-4" r="1.6" fill="${BRASS_D}"/>`;
}
/* la barca a vela (prua a sinistra): il vento viene da poppa, la bandierina in testa d'albero punta avanti, la scia resta dietro.
   Il capitano tiene il timone a poppa e guarda avanti. rig: sloop · terzaroli (vele ridotte col tempo brutto) · latina (la vela triangolare del Mediterraneo)
   ghiaccio (l'iceboat sui pattini, sul lago gelato: origine = il ghiaccio) · spinnaker (la vela a pallone col vento in poppa) */
const captainL = () => `<g transform="scale(-1 1)">${captain()}</g>`;
function sailBoat2(st) {
  if (st.rig === 'iole' || st.rig === 'botter' || st.rig === 'feluca') return sailExtra(st.rig);
  const ice = st.rig === 'ghiaccio', dy = ice ? -10 : 0;
  let s = '';
  if (st.rig === 'latina') {
    s += `<path d="M-2 -5V-62" stroke="#5A4632" stroke-width="2.6"/><path d="M-48 -14L34 -120" stroke="#5A4632" stroke-width="2.2" stroke-linecap="round"/>`
      + `<path d="M-46 -15L33 -118Q44 -64 34 -12Z" fill="${st.main}"/><path d="M-46 -15L33 -118Q30 -66 12 -13Z" fill="#000" fill-opacity=".05"/><path d="M-20 -48L36 -46M2 -78L38 -80" stroke="#E2D9C4" stroke-width=".8"/>`
      + `<path class="sc-flagw2" d="M34 -120L19 -118L33 -114Z" fill="${st.pen}"/>`;
  } else {
    const top = st.rig === 'terzaroli' ? -80 : -104, jt = st.rig === 'terzaroli' ? -76 : -100;
    s += `<path d="M-2 -110V-5" stroke="#5A4632" stroke-width="2.6"/><path d="M-2 -110L-46 -10M-2 -110L40 -8" stroke="#5A4632" stroke-opacity=".45" stroke-width=".7"/>`
      + `<path d="M0 ${top}Q20 ${top + 34} 40 -18L0 -18Z" fill="${st.main}"/><path d="M0 ${top}Q8 ${top + 38} 13 -18L0 -18Z" fill="#000" fill-opacity=".05"/>`
      + (st.rig === 'terzaroli' ? [0, 1, 2, 3, 4].map((i) => `<path d="M${4 + i * 7} -25v4" stroke="#7A766E" stroke-width=".9"/>`).join('') + `<path d="M0 -24Q20 -20 40 -20" stroke="#8A867E" stroke-width="2.6" fill="none"/>` : `<path d="M0 -86L19 -56M0 -66L29 -38M0 -44L36 -24" stroke="#E2D9C4" stroke-width=".8"/>`)
      + (st.mark ? `<circle cx="16" cy="-50" r="7" fill="none" stroke="#7A2E22" stroke-width="2"/><circle cx="16" cy="-50" r="2.4" fill="#7A2E22"/>` : '')
      + `<path d="M-1 -18H44" stroke="#5A4632" stroke-width="2.4" stroke-linecap="round"/>`;
    if (st.rig === 'spinnaker') s += `<path d="M-4 -104Q-78 -76 -56 -14L-8 -16Q-36 -60 -4 -104Z" fill="#FFFFFF"/><path d="M-4 -104Q-66 -78 -50 -46L-28 -46Q-30 -78 -4 -104Z" fill="${st.stripe}"/><path d="M-54 -26L-12 -28L-9 -16L-56 -14Z" fill="${st.band}"/>`;
    else s += `<path d="M-5 ${jt}Q-26 ${jt + 46} -44 -12L-5 -14Z" fill="${st.jib}"/><path d="M-5 ${jt}Q-12 ${jt + 44} -16 -13L-5 -14Z" fill="#000" fill-opacity=".05"/>`;
    s += `<path class="sc-flagw2" d="M-2 -110L-17 -107L-2 -104Z" fill="${st.pen}"/>` + (st.lamp ? `<rect x="-4.4" y="-115" width="5" height="5" rx="1" fill="#3A3A3A"/><rect x="-3.4" y="-114" width="3" height="3" fill="#F6C76E"/>` : '');
  }
  s += `<g transform="translate(30 -7)">${captainL()}</g><path d="M42 -8L19 -15" stroke="#6E4A2C" stroke-width="1.8" stroke-linecap="round"/>`;
  if (ice) s += `<path d="M-60 -9L44 -10L46 -4L-56 -2Z" fill="${st.hull}"/><path d="M-60 -9L44 -10" stroke="${st.stripe}" stroke-width="1.4"/><path d="M-14 -4L-20 8M18 -4L24 8M-52 -3L-56 8" stroke="#3A3A3A" stroke-width="2"/><path d="M-30 9H34M-66 9H-46" stroke="#9AA6B2" stroke-width="2.6" stroke-linecap="round"/><path d="M-14 -4H18" stroke="${st.band}" stroke-width="3"/><path d="M-58 -10Q-40 -14 -20 -11L-22 -9Q-40 -11 -57 -8Z" fill="#FFFFFF"/><path d="M-1 -20H38" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>`;
  else s += `<path d="M44 -8L46 6" stroke="#5A4632" stroke-width="2.2"/><path d="M-50 -12Q-10 -5 44 -9Q40 5 22 9L-24 9Q-40 6 -50 -12Z" fill="${st.hull}"/><path d="M-50 -12Q-10 -5 44 -9L43.5 -6Q-10 -1 -49 -9Z" fill="${st.stripe}"/><path d="M-38 4Q0 7 36 3" stroke="${st.band}" stroke-width="1.6" fill="none"/>`;
  return dy ? `<g transform="translate(0 ${dy})">${s}</g>` : s;
}
/* le vedette, una per luogo: di legno (con le varianti del mese), la baita in quota, la torre saracena sulla costa, la torretta del bagnino sulla duna */
function watchtower(mi, L) {
  const st = STY[mi], [wd, wm, wl] = st.wood, snowy = mi === 2;
  if (st.tower === 'palafitta') return stiltHut(L);
  if (st.tower === 'albero') return treeHouse(L, rng(53));
  if (st.tower === 'gazebo') return ironGazebo(L);
  if (st.tower === 'giardino') return gardenTower(L);
  if (st.tower === 'saracena') {
    const c = '#CDB78F', sd = shade(c, .3);
    let t = `<path d="M-31 0L-25 -32H25L31 0Z" fill="${shade(c, .1)}"/><path d="M-24 -30L-20 -112H20L24 -30Z" fill="${c}"/><path d="M${L > 0 ? 3 : -24} -30L${L > 0 ? 3 : -20} -112H${L > 0 ? 20 : -3}L${L > 0 ? 24 : -3} -30Z" fill="#000" fill-opacity=".14"/><path d="M${L > 0 ? 3 : -31} 0L${L > 0 ? 3 : -25} -32H${L > 0 ? 25 : -3}L${L > 0 ? 31 : -3} 0Z" fill="#000" fill-opacity=".14"/>`;
    for (let j = 1; j < 11; j++) t += `<path d="M-23 ${-j * 10.6}H23" stroke="${sd}" stroke-opacity=".3" stroke-width=".8"/>`;
    t += `<rect x="-26" y="-120" width="52" height="8" fill="${shade(c, .05)}"/>`;
    for (let j = 0; j < 7; j++) t += `<path d="M${-22 + j * 7.4} -112v4" stroke="${sd}" stroke-width="2.6"/>`;
    for (let j = 0; j < 5; j++) t += `<rect x="${-26 + j * 11}" y="-131" width="7" height="11" fill="${c}"/>`;
    t += `<rect x="-3.6" y="-84" width="7.2" height="13" rx="3.6" fill="#2E261E"/><rect x="-3.4" y="-52" width="6.8" height="11" rx="3.4" fill="#2E261E"/><path d="M-8 0V-16Q0 -24 8 -16V0Z" fill="${WOOD_D}"/>`
      + `<path d="M0 -131V-154" stroke="#3A2E24" stroke-width="1.6"/><path class="sc-flagw" d="M0 -154L15 -151L0 -147Z" fill="${st.flag}"/>`;
    return { svg: t, lamp: [0, -77] };
  }
  if (st.tower === 'bagnino') {
    let t = `<path d="M-17 2L-13 -66M17 2L13 -66" stroke="#F4F1EA" stroke-width="3.6" stroke-linecap="round"/><path d="M-6 2L-5 -66M6 2L5 -66" stroke="#E6E0D4" stroke-width="2.6"/>`
      + `<path d="M-15 -14L14 -40M15 -14L-14 -40" stroke="#E6E0D4" stroke-width="1.8"/><path d="M-21 -68H21" stroke="#F4F1EA" stroke-width="5"/><path d="M-19 -72V-86M19 -72V-86M-19 -82H19" stroke="#F4F1EA" stroke-width="2"/>`
      + `<path d="M24 2L12 -66M32 2L20 -66" stroke="#E6E0D4" stroke-width="1.8"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${f2(23 - i * 2)} ${-8 - i * 10}h${f2(8)}" stroke="#E6E0D4" stroke-width="1.4"/>`).join('')
      + `<rect x="-8" y="-82" width="16" height="3" fill="#C0392B"/><rect x="-8" y="-95" width="3" height="14" fill="#C0392B"/>`
      + `<path d="M0 -70V-122" stroke="#6E6A62" stroke-width="1.6"/>` + [0, 1, 2, 3].map((i) => `<path d="M${-28 + i * 14} -108Q${-21 + i * 14} ${i === 1 || i === 2 ? -124 : -118} ${-14 + i * 14} -108" fill="${i % 2 ? '#FFFFFF' : '#C0392B'}"/>`).join('')
      + `<path d="M-28 -108H28" stroke="#9A2A20" stroke-width="1"/><path d="M0 -122V-140" stroke="#6E6A62" stroke-width="1.4"/><path class="sc-flagw" d="M0 -140L15 -137L0 -133Z" fill="#C0392B"/><path d="M0 -136L15 -137" stroke="#E8C34A" stroke-width="1.4"/>`;
    return { svg: t, lamp: null };
  }
  let tw = `<path d="M-22 2L-14 -96" stroke="${wd}" stroke-width="4.6" stroke-linecap="round"/><path d="M22 2L14 -96" stroke="${shade(wd, .25)}" stroke-width="4.6" stroke-linecap="round"/>`
    + `<path d="M-20 -8L16 -48M20 -8L-16 -48M-16 -48L14 -90M16 -48L-14 -90" stroke="${wm}" stroke-width="2"/><path d="M-20 -8H20M-16 -48H16M-14 -90H14" stroke="${wm}" stroke-width="2.6"/>`
    + `<path d="M-5 2L-3 -98M6 2L4 -98" stroke="${wl}" stroke-width="1.6"/>`;
  for (let j = 0; j < 9; j++) tw += `<path d="M-4.6 ${-7 - j * 10}H5.6" stroke="${wl}" stroke-width="1.4"/>`;
  if (st.vine) { const RV = rng(77); for (let j = 0; j < 14; j++) { const t = j / 13, x = -22 + 8 * t + (RV() - .5) * 4, y = 2 - 98 * t * .9; tw += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(1.8 + RV() * 1.4)}" fill="${j % 3 ? '#6E9C52' : j % 2 ? '#F4C9D8' : '#FFFFFF'}"/>`; } }
  const alp = st.tower === 'baita';
  tw += `<path d="M-18 -102V-124M18 -102V-124" stroke="${wd}" stroke-width="3"/><rect x="-17" y="-124" width="34" height="12" fill="#2E2218" fill-opacity=".6"/>`
    + `<rect x="-26" y="-104" width="52" height="6" rx="1" fill="${wd}"/><rect x="-23" y="-114" width="46" height="11" fill="${wm}"/><path d="M${L > 0 ? 8 : -23} -114H${L > 0 ? 23 : -8}V-103H${L > 0 ? 8 : -23}Z" fill="#000" fill-opacity=".14"/>`
    + `<path d="M-15 -114V-103M-7 -114V-103M1 -114V-103M9 -114V-103M17 -114V-103" stroke="${wd}" stroke-width="1.1"/>`;
  if (st.box) tw += `<rect x="-22" y="-119" width="44" height="5" fill="${WOOD}"/>` + [-18, -12, -6, 0, 6, 12, 18].map((x, i) => `<circle cx="${x}" cy="-120" r="2.6" fill="${['#D8453A', '#8E5FA3', '#F4ECDD', '#E3A33B'][i % 4]}"/>`).join('');
  if (alp) tw += `<path d="M-36 -120L0 -156L36 -120Z" fill="${st.roof}"/><path d="M0 -156L${36 * L} -120H0Z" fill="#000" fill-opacity=".16"/><path d="M-38 -121L0 -158L38 -121L30 -118L0 -148L-30 -118Z" fill="#FFFFFF"/>`
    + [-30, -22, -14, 14, 22, 30].map((x, i) => `<path d="M${x} -119l1.4 ${6 + (i % 3) * 2}l1.4 ${-6 - (i % 3) * 2}" fill="#DDEBF2"/>`).join('') + `<path d="M-24 -104h48" stroke="#FFFFFF" stroke-width="2.4"/><path d="M0 -156V-170" stroke="#3A2E24" stroke-width="1.6"/><path class="sc-flagw" d="M0 -170L15 -167L0 -163Z" fill="${st.flag}"/>`;
  else tw += `<path d="M-30 -122L0 -145L30 -122Z" fill="${st.roof}"/><path d="M0 -145L${30 * L} -122H0Z" fill="#000" fill-opacity=".16"/><path d="M-30 -122H30" stroke="${shade(st.roof, .35)}" stroke-width="2"/>`
    + (mi === 1 ? `<path d="M-26 -126L0 -143M-18 -130L0 -142" stroke="#FFFFFF" stroke-opacity=".18" stroke-width="1"/>` : '')
    + `<path d="M0 -145V-162" stroke="#3A2E24" stroke-width="1.6"/><path class="sc-flagw" d="M0 -162L15 -159L0 -155Z" fill="${st.flag}"/>`;
  if (st.lamp) tw += `<path d="M18 -102h8v6" stroke="#2E2A26" stroke-width="1.4" fill="none"/><rect x="23" y="-96" width="6" height="8" rx="1" fill="#2E2A26"/>`;
  return { svg: tw, lamp: [0, -118], lamp2: st.lamp ? [26, -92] : null };
}
/* la torre dell'orologio: le lancette segnano l'ora vera e vanno avanti da sole. spire: merli (ghibellini) · piramide · cipolla (le Alpi) · campanile (bianco, cella aperta) */
function clockTower(mi, L, hr) {
  if (mi === 2) return gothicTower(L, hr);
  const st = STY[mi], body = st.body, sd = shade(body, .22), snowy = mi === 2;
  let t = `<rect x="-25" y="-8" width="50" height="8" rx="1" fill="${shade(body, .3)}"/><rect x="-19" y="-100" width="38" height="92" fill="${body}"/><rect x="${L > 0 ? 5 : -19}" y="-100" width="14" height="92" fill="#000" fill-opacity=".12"/>`;
  if (mi === 0) for (let j = 1; j < 18; j++) t += `<path d="M-19 ${-8 - j * 5.2}H19" stroke="${sd}" stroke-opacity=".35" stroke-width=".6"/>`;
  else for (let j = 1; j < 8; j++) t += `<path d="M-19 ${-8 - j * 12}H19" stroke="${sd}" stroke-opacity=".5" stroke-width=".9"/>`;
  if (mi === 2) t += `<path d="M-19 -8V-100M19 -8V-100" stroke="#7A5236" stroke-width="2.4"/>`;
  if (mi === 1) t += `<path d="M-19 -8V-100M19 -8V-100M0 -8V-60" stroke="${shade(body, .25)}" stroke-width="3"/>` + [-15, -9, -3, 3, 9, 15].map((x) => `<path d="M${x - 3} -100q3 4 6 0" stroke="${shade(body, .3)}" stroke-width="1" fill="none"/>`).join('') + `<path d="M-10 -66V-56M10 -66V-56" stroke="#2E2A26" stroke-width="3"/><path d="M-13 -56V-66Q-10 -70 -7 -66V-56ZM7 -56V-66Q10 -70 13 -66V-56Z" fill="#2E2A26"/>`;
  if (mi === 4) t += `<path d="M-19 -40L19 -100M19 -40L-19 -100M-19 -40H19M-19 -70H19M-10 -8V-40M10 -8V-40" stroke="#5A3A2E" stroke-width="2"/>`;
  if (mi === 6) for (let j = 0; j < 11; j++) t += `<rect x="-19" y="${-16 - j * 8}" width="38" height="4" fill="#3A3836" fill-opacity=".75"/>`;
  t += `<path d="M-7 -8V-26Q0 -33 7 -26V-8Z" fill="${WOOD_D}"/><rect x="-4" y="-56" width="8" height="12" rx="4" fill="#3E3A34"/>`
    + `<rect x="-22" y="-104" width="44" height="5" fill="${shade(body, .12)}"/><path d="M-19 -104V-124H19V-104" fill="${light(body, .08)}"/>`;
  if (st.spire === 'campanile') t += `<path d="M-14 -104V-118Q-9 -124 -4 -118V-104ZM4 -104V-118Q9 -124 14 -118V-104Z" fill="#2E261E"/>`;
  else t += `<path d="M-12 -104V-117Q-6 -123 0 -117Q6 -123 12 -117V-104Z" fill="#2E261E"/>`;
  t += `<g><animateTransform attributeName="transform" type="rotate" values="-6 0 -119;6 0 -119;-6 0 -119" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><path d="M0 -119V-116" stroke="#3A3226" stroke-width="1"/><path d="M-4.6 -106Q-4.6 -116 0 -116Q4.6 -116 4.6 -106Z" fill="#B8863B"/></g>`;
  if (st.spire === 'merli') { t += `<rect x="-22" y="-127" width="44" height="4" fill="${shade(body, .12)}"/>`; for (let j = 0; j < 5; j++) t += `<path d="M${-21 + j * 9} -127v-9l3 3l3 -3v9z" fill="${body}"/>`; }
  else if (st.spire === 'cipolla') t += `<rect x="-22" y="-127" width="44" height="4" fill="#7A5236"/><path d="M-17 -127C-24 -142 -6 -146 0 -162C6 -146 24 -142 17 -127Z" fill="#4E6E64"/><path d="M0 -162C6 -146 24 -142 17 -127H0Z" fill="#000" fill-opacity=".16"/><path d="M-15 -134Q0 -150 15 -134Q8 -146 0 -152Q-8 -146 -15 -134Z" fill="#FFFFFF"/><circle cx="0" cy="-164" r="2.6" fill="${BRASS}"/><path d="M0 -166V-176M-3 -172H3" stroke="#3A3226" stroke-width="1.2"/>`;
  else if (st.spire === 'cono') t += `<rect x="-22" y="-127" width="44" height="4" fill="${shade(body, .12)}"/><path d="M-20 -127L0 -182L20 -127Z" fill="${st.roof}"/><path d="M0 -182L${20 * L} -127H0Z" fill="#000" fill-opacity=".18"/><path d="M0 -182V-192M-3 -188H3" stroke="#3A3226" stroke-width="1.2"/>`;
  else if (st.spire === 'cupola') t += `<rect x="-22" y="-127" width="44" height="4" fill="${shade(body, .12)}"/><path d="M-18 -127Q-18 -152 0 -154Q18 -152 18 -127Z" fill="#6E9C7E"/><path d="M0 -154Q18 -152 18 -127H0Z" fill="#000" fill-opacity=".14"/><rect x="-4" y="-164" width="8" height="10" fill="${body}"/><path d="M-5 -164Q0 -172 5 -164Z" fill="#6E9C7E"/><path d="M0 -170V-176" stroke="#3A3226" stroke-width="1.2"/>`;
  else if (st.spire === 'guglia') t += `<rect x="-22" y="-127" width="44" height="4" fill="#5A3A2E"/><path d="M-24 -127L-12 -140L0 -196L12 -140L24 -127Z" fill="${st.roof}"/><path d="M0 -196L12 -140L24 -127H0Z" fill="#000" fill-opacity=".16"/><path d="M-12 -140H12" stroke="#5A3A2E" stroke-width="1.4"/><circle cx="0" cy="-198" r="2.4" fill="${BRASS}"/>`;
  else if (st.spire === 'campanile') t += `<rect x="-22" y="-127" width="44" height="4" fill="${shade(body, .08)}"/><path d="M-14 -127Q0 -146 14 -127Z" fill="#2F6E9A"/><path d="M0 -146Q8 -137 14 -127H0Z" fill="#000" fill-opacity=".1"/><path d="M0 -146V-158M-4 -153H4" stroke="#3A3226" stroke-width="1.4"/>`;
  else t += `<rect x="-22" y="-127" width="44" height="4" fill="${shade(body, .12)}"/><path d="M-24 -127L0 -152L24 -127Z" fill="${st.roof}"/><path d="M0 -152L${24 * L} -127H0Z" fill="#000" fill-opacity=".16"/><path d="M0 -152V-162" stroke="#3A3226" stroke-width="1.4"/><path d="M-3 -160H3" stroke="#3A3226" stroke-width="1.2"/>`;
  t += `<circle cx="0" cy="-76" r="13" fill="#F4EFE0" stroke="#3A3226" stroke-width="2.2"/>`;
  for (let j = 0; j < 12; j++) { const a = j * Math.PI / 6, r0 = j % 3 ? 10.2 : 8.8; t += `<path d="M${f2(Math.sin(a) * r0)} ${f2(-76 - Math.cos(a) * r0)}L${f2(Math.sin(a) * 11.6)} ${f2(-76 - Math.cos(a) * 11.6)}" stroke="#3A3226" stroke-width="${j % 3 ? .8 : 1.4}"/>`; }
  const ha = ((hr % 12) / 12) * 360, ma = ((hr * 60) % 60) / 60 * 360;
  t += `<g><animateTransform attributeName="transform" type="rotate" from="${f2(ha)} 0 -76" to="${f2(ha + 360)} 0 -76" dur="43200s" repeatCount="indefinite"/><path d="M0 -76V-82.5" stroke="#2A221A" stroke-width="2.2" stroke-linecap="round"/></g>`
    + `<g><animateTransform attributeName="transform" type="rotate" from="${f2(ma)} 0 -76" to="${f2(ma + 360)} 0 -76" dur="3600s" repeatCount="indefinite"/><path d="M0 -76V-86" stroke="#2A221A" stroke-width="1.4" stroke-linecap="round"/></g><circle cx="0" cy="-76" r="1.4" fill="#2A221A"/>`;
  if (snowy) t += `<path d="M-23 -105h46M-23 -128h46" stroke="#FFFFFF" stroke-width="2.4"/>`;
  return t;
}
/* una casa del borgo, nello stile del luogo. Restituisce il disegno e le finestre (per accenderle la sera) */
/* ===== 3.1: case vere, ben piantate a terra =====
   Ogni casa ha lo zoccolo di pietra, il cornicione sotto il tetto, finestre con cornici, davanzali e persiane, la porta col gradino.
   Gli stili: toscano (tetto a padiglione di coppi, altana), lombardo (cascina col portico ad archi), baite (piano terra di pietra, legno sopra,
   ballatoio, tetto largo carico di neve, ghiaccioli), pastello (villini liberty con le cornici bianche), graticcio (travi a vista, piano di sopra sporgente),
   bianco (cubi a calce con terrazza, cupole blu, scale esterne), ligure (alte e strette, cornici dipinte, persiane verdi, ardesia). */
function icicles(x0, x1, y, s, R, col = '#DDEBF2') { let o = ''; for (let x = x0 + R() * 2 * s; x < x1; x += (2 + R() * 3.4) * s) { const l = (R() < .25 ? 6 + R() * 6 : 1.6 + R() * 4.4) * s, w = (.7 + R() * .6) * s, bend = (R() - .5) * .8 * s;
  o += `<path d="M${f2(x - w)} ${f2(y)}Q${f2(x - w * .4 + bend)} ${f2(y + l * .55)} ${f2(x + bend)} ${f2(y + l)}Q${f2(x + w * .4 + bend)} ${f2(y + l * .55)} ${f2(x + w)} ${f2(y)}Z" fill="${col}"/><path d="M${f2(x - w * .3)} ${f2(y + .4)}Q${f2(x - w * .1 + bend)} ${f2(y + l * .4)} ${f2(x + bend * .8)} ${f2(y + l * .8)}" stroke="#FFFFFF" stroke-width="${f2(.35 * s)}" fill="none" opacity=".8"/>`; } return o; }
/* uno strato di neve posato su una superficie orizzontale: spesso, col bordo tondo che sporge un poco */
function snowLedge(x0, x1, y, t) {
  const R = rng(Math.round(Math.abs(x0) * 13 + Math.abs(y) * 7 + Math.abs(x1) * 3)), w = x1 - x0, n = Math.max(2, Math.round(w / 6));
  const top = []; for (let i = 0; i <= n; i++) top.push([x0 + w * i / n, y - t * (.7 + R() * .55) * (i === 0 || i === n ? .8 : 1)]);
  let d = `M${f2(x0 - 1.4)} ${f2(y + .4)}C${f2(x0 - 3.4)} ${f2(y - t * .2)} ${f2(x0 - 2.6)} ${f2(top[0][1] - t * .1)} ${f2(top[0][0] + .6)} ${f2(top[0][1])}`;
  for (let i = 1; i <= n; i++) { const [px, py] = top[i - 1], [x, yy] = top[i]; d += `Q${f2((px + x) / 2)} ${f2(Math.min(py, yy) - t * (.15 + R() * .3))} ${f2(x)} ${f2(yy)}`; }
  d += `C${f2(x1 + 2.6)} ${f2(top[n][1] - t * .1)} ${f2(x1 + 3.4)} ${f2(y - t * .2)} ${f2(x1 + 1.4)} ${f2(y + .4)}`;
  let bot = `M${f2(x1 + 1.4)} ${f2(y + .4)}`; const m = Math.max(2, Math.round(w / 5)); let lx = x1 + 1.4;
  for (let i = 1; i <= m; i++) { const x = x1 + 1.4 - (w + 2.8) * i / m, sag = t * (.25 + R() * .75 * (R() < .6 ? 1 : .3)); bot += `Q${f2((lx + x) / 2)} ${f2(y + sag)} ${f2(x)} ${f2(y + t * .12)}`; lx = x; }
  return `<path d="${d}${bot.replace(/^M[^Q]*/, '')}Z" fill="#FFFFFF"/><path d="${bot}" stroke="#BFD4E0" stroke-width=".7" fill="none"/><path d="${d.replace(/C[^C]*$/, '')}" stroke="#E6F0F6" stroke-width=".5" fill="none" transform="translate(0 ${f2(t * .35)})" opacity=".8"/>`;
}
function townHouse(kind, x, y, s, i, L, R) {
  const P = { toscano: { w: ['#E3C99E', '#D9B98A', '#EAD7B5', '#CFAE84'], r: ['#B05A36', '#A24E30', '#BC6A42'], sh: '#4E6B4A' },
    lombardo: { w: ['#D9C9A8', '#C9BCA4', '#E3D4B6', '#B9B4AA'], r: ['#8E4A36', '#7E4232', '#9A5440'], sh: '#5E4636' },
    baite: { w: ['#B9B4AA', '#ABA69C'], r: ['#4E4A48', '#5A5450'], sh: '#9A2E26' },
    pastello: { w: ['#F0C9C0', '#F3E0A8', '#CFE0C8', '#F6E7D8', '#E6D2EC'], r: ['#B5643A', '#A9583A'], sh: '#5E8A5A' },
    graticcio: { w: ['#F2E8D6', '#EFE2CC', '#F4ECDF'], r: ['#8A4A3A', '#7A4236', '#94523E'], sh: '#4E3A5E' },
    bianco: { w: ['#F6F3EC', '#F1EDE4', '#FAF8F3'], r: ['#F1EDE4'], sh: '#2F6E9A' },
    ligure: { w: ['#E7A65C', '#D9644A', '#F2D27A', '#E8B4A6', '#C97B52', '#E9C9A0'], r: ['#6E6A66', '#7A746E'], sh: '#3E6E46' } }[kind];
  const wall = P.w[i % P.w.length], roof = P.r[i % P.r.length], tall = kind === 'ligure' ? 3 + (i % 2) : kind === 'bianco' ? 1 + (i % 2) : 1 + (i % 3 === 0 ? 0 : 1);
  const w = (kind === 'ligure' ? 10 : kind === 'baite' ? 16 + (i % 2) * 2 : 12 + (i % 3) * 2.5) * s, fh = 10.5 * s, zh = 2.6 * s, h = fh * tall + zh + 1.5 * s;
  const sideX = L > 0 ? x + w * .38 : x - w, sideW = w * .62, top = y - h;
  let o = `<rect x="${f2(x - w)}" y="${f2(top)}" width="${f2(2 * w)}" height="${f2(h)}" fill="${wall}"/>`;
  /* lo zoccolo di pietra */
  const zc = kind === 'bianco' ? '#E2DCCF' : kind === 'baite' ? '#8E897F' : shade(wall, .28);
  o += `<rect x="${f2(x - w - .6 * s)}" y="${f2(y - zh)}" width="${f2(2 * w + 1.2 * s)}" height="${f2(zh + .5)}" fill="${zc}"/>`;
  const R2 = rng(Math.round(x * 3 + i * 17));
  if (kind === 'baite') { // piano terra di pietra a corsi irregolari, sopra legno a doghe, ballatoio
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) o += `<rect x="${f2(x - w + c * w / 3 + (r % 2) * w / 6 + R2() * s)}" y="${f2(y - zh - (r + 1) * 3 * s)}" width="${f2(w / 3 - 1.2 * s)}" height="${f2(2.4 * s)}" rx="${f2(.8 * s)}" fill="#000" fill-opacity="${f2(.05 + R2() * .07)}"/>`;
    const wy0 = top, wy1 = y - zh - fh; o += `<rect x="${f2(x - w)}" y="${f2(wy0)}" width="${f2(2 * w)}" height="${f2(wy1 - wy0)}" fill="#7A5236"/>` + Array.from({ length: Math.round(2 * w / (2.6 * s)) }, (_, j) => `<path d="M${f2(x - w + j * 2.6 * s)} ${f2(wy0)}V${f2(wy1)}" stroke="#5A3A26" stroke-width="${f2(.5 * s)}"/>`).join('');
    o += `<rect x="${f2(x - w - 2 * s)}" y="${f2(wy1 - .5 * s)}" width="${f2(2 * w + 4 * s)}" height="${f2(1.6 * s)}" fill="#5A3A26"/>` + Array.from({ length: Math.round((2 * w + 4 * s) / (2.2 * s)) }, (_, j) => `<path d="M${f2(x - w - 2 * s + j * 2.2 * s)} ${f2(wy1 - .5 * s)}v${f2(-4.4 * s)}" stroke="#5A3A26" stroke-width="${f2(.6 * s)}"/>`).join('')
      + `<path d="M${f2(x - w - 2 * s)} ${f2(wy1 - 4.9 * s)}H${f2(x + w + 2 * s)}" stroke="#5A3A26" stroke-width="${f2(1 * s)}"/>` + snowLedge(x - w - 2 * s, x + w + 2 * s, wy1 - 5 * s, 1.4 * s);
  }
  if (kind === 'graticcio') { const jt = top + (h - zh) * .5; o += `<rect x="${f2(x - w - 1.2 * s)}" y="${f2(top)}" width="${f2(2 * w + 2.4 * s)}" height="${f2(jt - top)}" fill="${wall}"/>`
    + `<path d="M${f2(x - w - 1.2 * s)} ${f2(jt)}H${f2(x + w + 1.2 * s)}M${f2(x - w)} ${f2(y - zh)}H${f2(x + w)}" stroke="#5A3A2E" stroke-width="${f2(1.4 * s)}"/>`
    + [-1, -.34, .34, 1].map((k) => `<path d="M${f2(x + k * w)} ${f2(top)}V${f2(y - zh)}" stroke="#5A3A2E" stroke-width="${f2(1.2 * s)}"/>`).join('')
    + `<path d="M${f2(x - w)} ${f2(jt)}L${f2(x - w * .34)} ${f2(top)}M${f2(x + w)} ${f2(jt)}L${f2(x + w * .34)} ${f2(top)}M${f2(x - w)} ${f2(jt)}L${f2(x - w * .34)} ${f2(y - zh)}M${f2(x + w)} ${f2(jt)}L${f2(x + w * .34)} ${f2(y - zh)}" stroke="#5A3A2E" stroke-width="${f2(1 * s)}"/>`; }
  if (kind === 'lombardo' && i % 2 === 0) { const ah = fh * .9; o += [0, 1, 2].map((c) => { const ax = x - w + (c + .5) * (2 * w / 3); return `<path d="M${f2(ax - w / 3 + 1.4 * s)} ${f2(y - zh)}V${f2(y - zh - ah * .6)}Q${f2(ax)} ${f2(y - zh - ah * 1.05)} ${f2(ax + w / 3 - 1.4 * s)} ${f2(y - zh - ah * .6)}V${f2(y - zh)}Z" fill="#3A3026"/>`; }).join(''); }
  if (kind === 'pastello' || kind === 'ligure') o += Array.from({ length: tall }, (_, r) => `<path d="M${f2(x - w)} ${f2(y - zh - r * fh)}H${f2(x + w)}" stroke="${light(wall, .5)}" stroke-width="${f2(.9 * s)}"/>`).join('') + `<path d="M${f2(x - w)} ${f2(top)}V${f2(y)}M${f2(x + w)} ${f2(top)}V${f2(y)}" stroke="${light(wall, .45)}" stroke-width="${f2(1.4 * s)}"/>`;
  o += `<rect x="${f2(sideX)}" y="${f2(top)}" width="${f2(sideW)}" height="${f2(h)}" fill="#000" fill-opacity=".1"/>`;
  /* finestre: cornici, davanzali, persiane; porta col gradino */
  const wins = [], cols = kind === 'ligure' ? 2 : w > 16 * s ? 3 : 2, ww = (kind === 'baite' ? 3.4 : 3) * s, wh = (kind === 'ligure' ? 5 : 4.4) * s;
  const dc = kind === 'lombardo' && i % 2 === 0 ? -1 : Math.floor(cols / 2), skipDoor = (r, c) => r === 0 && c === dc;
  for (let r = 0; r < tall; r++) for (let c = 0; c < cols; c++) { if (skipDoor(r, c) || (kind === 'lombardo' && i % 2 === 0 && r === 0)) continue;
    const wx = x - w + (c + .5) * (2 * w / cols) - ww / 2, wy = y - zh - (r + 1) * fh + 3 * s;
    if (kind === 'pastello' || kind === 'ligure') o += `<rect x="${f2(wx - 1.2 * s)}" y="${f2(wy - 1.4 * s)}" width="${f2(ww + 2.4 * s)}" height="${f2(wh + 2.6 * s)}" fill="${light(wall, .55)}"/>`;
    if (kind === 'toscano' && r === tall - 1 && c === 0 && i % 2) o += `<path d="M${f2(wx)} ${f2(wy + wh)}V${f2(wy + 1.4 * s)}Q${f2(wx + ww / 2)} ${f2(wy - 1.2 * s)} ${f2(wx + ww)} ${f2(wy + 1.4 * s)}V${f2(wy + wh)}Z" fill="#3E4652"/>`;
    else o += `<rect x="${f2(wx)}" y="${f2(wy)}" width="${f2(ww)}" height="${f2(wh)}" fill="${kind === 'bianco' ? '#2F6E9A' : '#3E4652'}"/>`;
    if (kind === 'baite') o += `<rect x="${f2(wx - .6 * s)}" y="${f2(wy - .6 * s)}" width="${f2(ww + 1.2 * s)}" height="${f2(wh + 1.2 * s)}" fill="none" stroke="#FFFFFF" stroke-width="${f2(.6 * s)}"/>`;
    if (kind !== 'bianco') o += `<rect x="${f2(wx - 1.6 * s)}" y="${f2(wy)}" width="${f2(1.4 * s)}" height="${f2(wh)}" fill="${P.sh}"/><rect x="${f2(wx + ww + .2 * s)}" y="${f2(wy)}" width="${f2(1.4 * s)}" height="${f2(wh)}" fill="${P.sh}"/>`;
    o += `<rect x="${f2(wx - .8 * s)}" y="${f2(wy + wh)}" width="${f2(ww + 1.6 * s)}" height="${f2(.9 * s)}" fill="${kind === 'graticcio' ? '#D8453A' : light(zc, .2)}"/>`;
    if (kind === 'baite') o += snowLedge(wx - 1, wx + ww + 1, wy + wh, .9 * s);
    wins.push([wx, wy, ww, wh]); }
  if (dc >= 0) { const dx = x - w + (dc + .5) * (2 * w / cols), doorC = kind === 'bianco' ? '#2F6E9A' : kind === 'baite' ? '#5A3A26' : shade(roof, .4);
    o += `<path d="M${f2(dx - 2.6 * s)} ${f2(y - .6 * s)}V${f2(y - 6.6 * s)}Q${f2(dx)} ${f2(y - 9 * s)} ${f2(dx + 2.6 * s)} ${f2(y - 6.6 * s)}V${f2(y - .6 * s)}Z" fill="${doorC}"/><rect x="${f2(dx - 3.8 * s)}" y="${f2(y - .8 * s)}" width="${f2(7.6 * s)}" height="${f2(1.2 * s)}" fill="${light(zc, .25)}"/>`; }
  /* il tetto */
  let chim = null;
  if (kind === 'bianco') { o += `<rect x="${f2(x - w - .6 * s)}" y="${f2(top - 2.4 * s)}" width="${f2(2 * w + 1.2 * s)}" height="${f2(2.6 * s)}" rx="${f2(.8 * s)}" fill="${shade(wall, .04)}"/>`;
    if (i % 3 === 1) o += `<rect x="${f2(x - w * .42)}" y="${f2(top - 6 * s)}" width="${f2(w * .84)}" height="${f2(4 * s)}" fill="${wall}"/><path d="M${f2(x - w * .48)} ${f2(top - 6 * s)}A${f2(w * .48)} ${f2(w * .5)} 0 0 1 ${f2(x + w * .48)} ${f2(top - 6 * s)}Z" fill="#2F6E9A"/><path d="M${f2(x)} ${f2(top - 6 * s - w * .5)}v${f2(-3 * s)}" stroke="#2F6E9A" stroke-width="${f2(.8 * s)}"/>`;
    if (i % 3 === 2) o += `<path d="M${f2(x + w)} ${f2(y - zh)}L${f2(x + w + 7 * s)} ${f2(y - zh)}L${f2(x + w)} ${f2(top + 2 * s)}Z" fill="${shade(wall, .05)}"/><path d="M${f2(x + w)} ${f2(top + 2 * s)}L${f2(x + w + 7 * s)} ${f2(y - zh)}" stroke="${shade(wall, .15)}" stroke-width="${f2(.8 * s)}"/>`; }
  else if (kind === 'baite' || kind === 'graticcio' || (kind === 'lombardo')) { const ov = kind === 'baite' ? 6 : 3, rh = (kind === 'baite' ? 10 : kind === 'graticcio' ? 15 : 9) * s, ex = w + ov * s;
    o += `<path d="M${f2(x - ex)} ${f2(top + .5)}L${f2(x)} ${f2(top - rh)}L${f2(x + ex)} ${f2(top + .5)}Z" fill="${roof}"/><path d="M${f2(x)} ${f2(top - rh)}L${f2(x + L * ex)} ${f2(top + .5)}H${f2(x)}Z" fill="#000" fill-opacity=".16"/><path d="M${f2(x - ex)} ${f2(top + .5)}H${f2(x + ex)}" stroke="${shade(roof, .3)}" stroke-width="${f2(1 * s)}"/>`;
    if (kind === 'baite') { const t = 3.4 * s;   // la neve sul tetto: spessa, col labbro che sporge, i ghiaccioli sotto la gronda
      o += `<path d="M${f2(x - ex - 1.6 * s)} ${f2(top + 1)}Q${f2(x - ex - 2 * s)} ${f2(top - t * .8)} ${f2(x - ex + 2 * s)} ${f2(top - t * .9)}L${f2(x)} ${f2(top - rh - t)}L${f2(x + ex - 2 * s)} ${f2(top - t * .9)}Q${f2(x + ex + 2 * s)} ${f2(top - t * .8)} ${f2(x + ex + 1.6 * s)} ${f2(top + 1)}Q${f2(x + ex)} ${f2(top + t * .4)} ${f2(x + ex - 2 * s)} ${f2(top + t * .3)}L${f2(x)} ${f2(top - rh + t * .2)}L${f2(x - ex + 2 * s)} ${f2(top + t * .3)}Q${f2(x - ex)} ${f2(top + t * .4)} ${f2(x - ex - 1.6 * s)} ${f2(top + 1)}Z" fill="#FFFFFF"/>`
        + `<path d="M${f2(x)} ${f2(top - rh - t)}L${f2(x + L * (ex - 2 * s))} ${f2(top - t * .9)}" stroke="#D6E4EC" stroke-width="${f2(1.2 * s)}"/>` + icicles(x - ex, x + ex, top + t * .3, s, R2); }
    else if (kind === 'graticcio') o += `<path d="M${f2(x - 3 * s)} ${f2(top - rh * .55)}h${f2(6 * s)}v${f2(4 * s)}h${f2(-6 * s)}Z" fill="#3E4652"/>`;
    if (i % 2 === 0) chim = [x + w * .45, top - rh * .45]; }
  else { const rh = (kind === 'ligure' ? 4.4 : 6.4) * s, ex = w + 2.6 * s;   // tetto a padiglione (coppi o ardesia) col cornicione
    o += `<rect x="${f2(x - w - 1 * s)}" y="${f2(top - 1 * s)}" width="${f2(2 * w + 2 * s)}" height="${f2(1.4 * s)}" fill="${light(wall, .3)}"/>`
      + `<path d="M${f2(x - ex)} ${f2(top - .6 * s)}L${f2(x - w * .5)} ${f2(top - rh)}H${f2(x + w * .5)}L${f2(x + ex)} ${f2(top - .6 * s)}Z" fill="${roof}"/>`
      + Array.from({ length: Math.round(2 * ex / (2 * s)) }, (_, j) => `<path d="M${f2(x - ex + (j + .5) * 2 * s)} ${f2(top - .8 * s)}L${f2(x - w * .5 + (j + .5) * (w / Math.round(2 * ex / (2 * s))))} ${f2(top - rh + .4)}" stroke="#000" stroke-opacity="${kind === 'ligure' ? .1 : .16}" stroke-width="${f2(.6 * s)}"/>`).join('')
      + `<path d="M${f2(x - ex)} ${f2(top - .6 * s)}H${f2(x + ex)}" stroke="${shade(roof, .3)}" stroke-width="${f2(1 * s)}"/>`;
    if (kind === 'toscano' && i % 4 === 1) o += `<rect x="${f2(x - 5 * s)}" y="${f2(top - rh - 7 * s)}" width="${f2(10 * s)}" height="${f2(7 * s)}" fill="${wall}"/><path d="M${f2(x - 3.6 * s)} ${f2(top - rh)}V${f2(top - rh - 4 * s)}Q${f2(x - 2 * s)} ${f2(top - rh - 6 * s)} ${f2(x - .4 * s)} ${f2(top - rh - 4 * s)}V${f2(top - rh)}ZM${f2(x + .4 * s)} ${f2(top - rh)}V${f2(top - rh - 4 * s)}Q${f2(x + 2 * s)} ${f2(top - rh - 6 * s)} ${f2(x + 3.6 * s)} ${f2(top - rh - 4 * s)}V${f2(top - rh)}Z" fill="#3A3026"/><path d="M${f2(x - 7 * s)} ${f2(top - rh - 7 * s)}L${f2(x)} ${f2(top - rh - 10 * s)}L${f2(x + 7 * s)} ${f2(top - rh - 7 * s)}Z" fill="${roof}"/>`;
    if (kind === 'pastello' && i % 3 === 1) o += `<rect x="${f2(x + w * .4)}" y="${f2(top - rh - 8 * s)}" width="${f2(7 * s)}" height="${f2(10 * s)}" fill="${wall}"/><path d="M${f2(x + w * .4 - 1 * s)} ${f2(top - rh - 8 * s)}L${f2(x + w * .4 + 3.5 * s)} ${f2(top - rh - 15 * s)}L${f2(x + w * .4 + 8 * s)} ${f2(top - rh - 8 * s)}Z" fill="#6E9C7E"/><rect x="${f2(x + w * .4 + 2 * s)}" y="${f2(top - rh - 6 * s)}" width="${f2(3 * s)}" height="${f2(4 * s)}" fill="#3E4652"/>`;
    if (kind !== 'ligure' && i % 2 === 0) chim = [x + w * .3, top - rh]; }
  if (chim) o += `<rect x="${f2(chim[0] - 1.8 * s)}" y="${f2(chim[1] - 7 * s)}" width="${f2(3.6 * s)}" height="${f2(8 * s)}" fill="${shade(roof, .3)}"/><rect x="${f2(chim[0] - 2.4 * s)}" y="${f2(chim[1] - 8 * s)}" width="${f2(4.8 * s)}" height="${f2(1.4 * s)}" fill="${shade(roof, .4)}"/>` + (kind === 'baite' ? snowLedge(chim[0] - 2.4 * s, chim[0] + 2.4 * s, chim[1] - 8 * s, 1.2 * s) : '');
  if (kind === 'baite') o += `<path d="M${f2(x + w)} ${f2(y)}h${f2(5 * s)}v${f2(-8 * s)}h${f2(-5 * s)}Z" fill="#8A6A48"/>` + [0, 1, 2].map((r) => [0, 1].map((c) => `<circle cx="${f2(x + w + 1.3 * s + c * 2.5 * s)}" cy="${f2(y - 1.3 * s - r * 2.6 * s)}" r="${f2(1.2 * s)}" fill="#C9A27A" stroke="#6A4A34" stroke-width="${f2(.3 * s)}"/>`).join('')).join('') + snowLedge(x + w, x + w + 5 * s, y - 8 * s, 1.2 * s);
  if (kind === 'bianco' && i % 2) o += Array.from({ length: 9 }, () => `<circle cx="${f2(x - w + R2() * 6 * s)}" cy="${f2(y - zh - R2() * fh)}" r="${f2(1.2 * s + R2() * s)}" fill="${R2() < .6 ? '#C2307A' : '#5E8A44'}"/>`).join('');
  void R;
  return { svg: o, wins, top: top, chim: chim ? [chim[0], chim[1] - 8 * s] : null, w };
}
/* la sfera armillare sulla colonnina; l'asse del mondo (inclinato come la latitudine) indica la stella polare */
const ARM_AX = [-.42, -.91];   // direzione dell'asse (verso l'alto a sinistra)
function armillary(snowy) {
  const stone = `<rect x="-19" y="-7" width="38" height="7" rx="1" fill="#A39C8E"/><rect x="5" y="-7" width="14" height="7" fill="#000" fill-opacity=".1"/>`
    + `<path d="M-9 -7L-7 -44H7L9 -7Z" fill="#C7C0B1"/><path d="M2 -7L2 -44H7L9 -7Z" fill="#000" fill-opacity=".1"/><path d="M-8 -20H8M-7.5 -32H7.5" stroke="#A39C8E" stroke-width=".9"/>`
    + `<rect x="-12" y="-49" width="24" height="5" rx="1" fill="#B3AC9D"/>` + (snowy ? `<path d="M-13 -48q13 -7 26 0z" fill="#FFFFFF"/>` : '');
  const ring = (rx, ry, rot, col, w, an) => `<g transform="rotate(${rot} 0 -84)"><ellipse cx="0" cy="-84" rx="${rx}" ry="${ry}" fill="none" stroke="${col}" stroke-width="${w}">${an || ''}</ellipse></g>`;
  const turn = (a, b, d) => `<animate attributeName="ry" values="${a};${b};${a}" dur="${d}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
  const ax = ARM_AX, e1 = [f2(ax[0] * 34), f2(-84 + ax[1] * 34)], e2 = [f2(-ax[0] * 34), f2(-84 - ax[1] * 34)];
  return stone + `<path d="M0 -49V-56" stroke="${BRASS_D}" stroke-width="3"/><path d="M-6 -56H6" stroke="${BRASS_D}" stroke-width="2"/>`
    + ring(31, 6.5, 0, BRASS_D, 2.6) + `<circle cx="0" cy="-84" r="29" fill="none" stroke="${BRASS}" stroke-width="3"/>`
    + ring(28, 8, -24, BRASS, 2, turn(8, 26, 11)) + ring(28, 12, 24, '#A8452E', 3.2, turn(12, 3, 14))
    + `<path d="M${e1[0]} ${e1[1]}L${e2[0]} ${e2[1]}" stroke="#3A2E24" stroke-width="1.4" stroke-linecap="round"/><circle cx="0" cy="-84" r="5.4" fill="#4E8EA8"/><path d="M-2.5 -86.5q2 -1.6 4 0q1 1.6 -1 2.6q-2 .8 -3 -.4z" fill="#7DA35A"/>`
    + `<circle cx="${e1[0]}" cy="${e1[1]}" r="1.8" fill="${BRASS_L}"/><path d="M-20 -101q6 -8 14 -10" stroke="${BRASS_L}" stroke-opacity=".7" stroke-width="1.2" fill="none"/>`;
}
/* l'ometto di pietre con la bandiera di vetta, e quello che si trova in cima in quel mese */
function cairn(mi) {
  const snowy = mi === 2, st = (cx, cy, rx, ry, c) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/><path d="M${cx - rx * .7} ${f2(cy - ry * .45)}Q${cx} ${f2(cy - ry * 1.1)} ${cx + rx * .6} ${f2(cy - ry * .5)}" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="1.4" fill="none"/>`;
  let o = '';
  if (mi === 5) o += `<path d="M-40 4V-96M-56 -72H-24" stroke="#6E4A2C" stroke-width="4" stroke-linecap="round"/><path d="M-41.6 4V-96" stroke="#000" stroke-opacity=".15" stroke-width="1.2"/>`;
  o += st(-1, -5, 22, 7, '#9C978C') + st(1, -17, 18, 6.5, '#B1ACA1') + st(-2, -28, 15, 6, '#8E897F') + st(1, -38, 12, 5.2, '#A7A296') + st(-1, -47, 9, 4.4, '#B9B4A9') + st(0, -54, 6, 3.4, '#9A958A')
    + (snowy ? `<path d="M-14 -31Q-2 -37 13 -31M-9 -41Q0 -45 10 -41M-6 -50Q0 -53 6 -50" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round"/>` : '')
    + `<path d="M4 -55V-112" stroke="#3A2E24" stroke-width="2" stroke-linecap="round"/><path class="sc-flagw" d="M5 -111Q18 -114 30 -108Q18 -102 5 -98Z" fill="${STY[mi].flag}"/><path d="M5 -108Q16 -110 25 -106" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="1" fill="none"/>`;
  if (mi === 2) o += `<path d="M30 4L35 -40" stroke="#6E4A2C" stroke-width="2.6" stroke-linecap="round"/><path d="M27 -40Q34 -45 44 -40L35 -38Z" fill="#8A949E"/><path d="M33 -36l2 -4" stroke="#B23A2E" stroke-width="2"/>`;
  if (mi === 3) o += [[-28, 2], [-20, 4], [26, 3], [34, 1]].map(([x, y]) => `<path d="M${x} ${y}v-7" stroke="#4E7A3A" stroke-width="1.2"/><path d="M${x - 2.4} ${y - 7}L${x} ${y - 12}L${x + 2.4} ${y - 7}Z" fill="#2E4FA8"/>`).join('');
  if (mi === 4) o += [[-28, 2], [-19, 4], [27, 3]].map(([x, y]) => `<path d="M${x} ${y}v-6" stroke="#7E8F6A" stroke-width="1.2"/><g transform="translate(${x} ${y - 7})">${[0, 1, 2, 3, 4].map((k) => `<ellipse rx="1.2" ry="3" transform="rotate(${k * 72}) translate(0 -2.4)" fill="#F4F1EA"/>`).join('')}<circle r="1.2" fill="#E3C34A"/></g>`).join('');
  if (mi === 0) o += [[-30, 2], [28, 3]].map(([x, y]) => grassTuft(x, y, 1.1, '#B98A34')).join('') + `<path d="M4 -86l6 2l-1 10l-4 -2z" fill="#B23A2E"/>`;
  return o;
}

/* ===== 3.0: figure ancora più legate al luogo ===== */
/* animazione di un colpo di remo o di pagaia: tre pose (presa, fine, ritorno) */
const SMILk = (vals, attr, dur = '3.2s') => `<animate attributeName="${attr}" values="${vals}" keyTimes="0;.56;.74;1" calcMode="spline" keySplines=".5 0 .5 1;.4 0 .6 1;.4 0 .6 1" dur="${dur}" repeatCount="indefinite"/>`;
const seg4 = (A, B) => [0, 1, 2, 0].map((i) => `M${f2(A[i][0])} ${f2(A[i][1])}L${f2(B[i][0])} ${f2(B[i][1])}`).join(';');
/* una figura in piedi che rema (vista di fianco, guarda a sinistra): piedi in (0,0); mani che spingono il remo */
function standingRower(coat, hat, Hd, Bl, dur) {
  const S = [[-3, -36], [3, -35], [0, -36]], Hh = Hd;
  return `<path d="M-3 0L-1 -18M3 0L1 -18" stroke="#2E2A26" stroke-width="3.4" stroke-linecap="round"/>`
    + `<path d="M0 -18L${S[0][0]} ${S[0][1]}" stroke="${coat}" stroke-width="8" stroke-linecap="round">${SMILk(seg4([[0, -18], [0, -18], [0, -18]], S), 'd', dur)}</path>`
    + `<path d="M${S[0][0]} ${S[0][1] + 3}L${Hh[0][0]} ${Hh[0][1]}" stroke="${shade(coat, .15)}" stroke-width="3" stroke-linecap="round">${SMILk(seg4(S.map(([x, y]) => [x, y + 3]), Hh), 'd', dur)}</path>`
    + `<path d="M${Hh[0][0]} ${Hh[0][1]}L${Bl[0][0]} ${Bl[0][1]}" stroke="${WOOD}" stroke-width="2.2" stroke-linecap="round">${SMILk(seg4(Hh, Bl), 'd', dur)}</path>`
    + `<g><animateTransform attributeName="transform" type="translate" values="${[0, 1, 2, 0].map((i) => `${S[i][0] + 3} ${S[i][1] + 36}`).join(';')}" keyTimes="0;.56;.74;1" calcMode="spline" keySplines=".5 0 .5 1;.4 0 .6 1;.4 0 .6 1" dur="${dur}" repeatCount="indefinite"/>`
    + `<circle cx="-3" cy="-41" r="4.4" fill="#D9A47E"/><circle cx="-5.4" cy="-41.6" r=".55" fill="#2A2420"/>${hat}</g>`;
}
/* la canoa canadese di Germinale: chi la guida sta in ginocchio e usa una pagaia sola, la pala entra davanti e spinge indietro */
function canoe() {
  const Hu = [[-8, -30], [4, -30], [0, -26]], Hl = [[-14, -14], [4, -14], [-4, -12]], Bl = [[-30, 8], [12, 8], [0, -2]];
  return `<path d="M-60 -12Q-54 -2 -36 -1H36Q54 -2 60 -12Q62 -4 52 3Q30 9 0 9Q-30 9 -52 3Q-62 -4 -60 -12Z" fill="#A9553A"/><path d="M-60 -12Q-54 -2 -36 -1H36Q54 -2 60 -12" stroke="#E9DCC4" stroke-width="2" fill="none"/>`
    + `<path d="M-58 -10l-3 -6M58 -10l3 -6" stroke="#6E3A26" stroke-width="2.4" stroke-linecap="round"/><path d="M-40 3Q0 7 40 3" stroke="#7A3A26" stroke-width="1" fill="none"/>`
    + `<path d="M2 -2L2 -6M-2 -4H8" stroke="#2E2A26" stroke-width="4.4" stroke-linecap="round"/><path d="M2 -6L0 -26" stroke="#E3A33B" stroke-width="8" stroke-linecap="round"/>`
    + `<path d="M-1 -24L${Hl[0][0]} ${Hl[0][1]}" stroke="#C98B2E" stroke-width="3" stroke-linecap="round">${SMILk(seg4([[-1, -24], [-1, -24], [-1, -24]], Hl), 'd')}</path>`
    + `<path d="M${Hu[0][0]} ${Hu[0][1]}L${Bl[0][0]} ${Bl[0][1]}" stroke="${WOOD}" stroke-width="2" stroke-linecap="round">${SMILk(seg4(Hu, Bl), 'd')}</path>`
    + `<path d="M${Bl[0][0]} ${Bl[0][1]}l1.6 -9" stroke="${WOOD_L}" stroke-width="5.4" stroke-linecap="round">${SMILk([0, 1, 2, 0].map((i) => `M${Bl[i][0]} ${Bl[i][1]}l1.6 -9`).join(';'), 'd')}</path>`
    + `<circle cx="-1" cy="-31" r="4.4" fill="#D9A47E"/><path d="M-5.4 -32Q-1 -38 3.6 -32Z" fill="#5E8A5A"/><circle cx="-3.6" cy="-31.4" r=".55" fill="#2A2420"/><path d="M38 -2l6 -8h6l-2 8z" fill="#8A6A48"/>`;
}
/* il sandolo di Floreale: fondo piatto, il barcaiolo in piedi a poppa voga alla veneta con un remo sulla forcola, tra le ninfee */
function sandolo() {
  const H = [[24, -28], [34, -26], [30, -24]], Bl = [[70, 9], [56, 9], [62, 0]];
  return `<path d="M-64 -14Q-50 -4 -30 -4H44Q54 -5 58 -10L56 2Q40 7 10 8L-36 8Q-56 6 -64 -14Z" fill="#2A4E70"/><path d="M-64 -14Q-50 -4 -30 -4H44Q54 -5 58 -10" stroke="#F4EFE2" stroke-width="2" fill="none"/>`
    + `<path d="M-52 -6Q-10 0 50 -5" stroke="#C9A04A" stroke-width="1.2" fill="none"/><path d="M44 -5L46 -16" stroke="${WOOD_D}" stroke-width="3" stroke-linecap="round"/><path d="M43 -16q3 -4 6 0" stroke="${WOOD_D}" stroke-width="2" fill="none"/>`
    + [-40, -32, -24].map((x, i) => `<path d="M${x} -6l-1 -9" stroke="#6E8F55" stroke-width="1"/><ellipse cx="${x - 1}" cy="-16" rx="2" ry="4" fill="#8E5FA3" transform="rotate(${-10 + i * 6} ${x - 1} -16)"/>`).join('')
    + `<g transform="translate(26 -4)">${standingRower('#E9DCC4', `<path d="M-8.4 -43.4h10.8" stroke="#2A2A2A" stroke-width="1.4"/><path d="M-6.6 -43.4Q-3 -49 1 -43.4Z" fill="#E2C77A"/><path d="M-6.4 -44.4h7" stroke="#2A4E70" stroke-width="1"/>`, H.map(([x, y]) => [x - 26, y + 4]), Bl.map(([x, y]) => [x - 26, y + 4]), '3.6s')}</g>`;
}
/* il pattino di salvataggio di Estiario: due galleggianti rossi, il bagnino in piedi che spinge i remi guardando avanti */
function pattino() {
  const H = [[-10, -30], [4, -30], [-2, -26]], Bl = [[-50, 8], [-12, 8], [-26, -2]];
  return `<path d="M-56 -4Q-60 -10 -52 -12H50Q58 -10 54 -4Q50 6 40 7H-44Q-54 6 -56 -4Z" fill="#C0392B" opacity=".55"/>`
    + `<path d="M-60 -8Q-64 -16 -54 -18H52Q62 -16 58 -8Q54 4 42 5H-46Q-58 4 -60 -8Z" fill="#D9442F"/><path d="M-54 -18H52" stroke="#F4F1EA" stroke-width="1.6"/><path d="M-40 -4H38" stroke="#F4F1EA" stroke-width="3"/>`
    + `<path d="M-30 -18V-26M24 -18V-26M-34 -26H28" stroke="#F4F1EA" stroke-width="2.4" stroke-linecap="round"/><rect x="-6" y="-30" width="12" height="4" fill="#E8C34A"/>`
    + `<g transform="translate(0 -26)">${standingRower('#C0392B', `<path d="M-8 -45.6Q-3 -50 2 -45.6Z" fill="#E8C34A"/><path d="M-8.6 -45.4h11" stroke="#C98B2E" stroke-width="1.4"/>`, H.map(([x, y]) => [x, y + 26 - 26]), Bl.map(([x, y]) => [x, y + 26]), '3s')}</g>`;
}
/* il gozzo ligure di Messidoro: doppia prua alta (torelle), capodibanda in legno chiaro, fasce azzurra e rossa, la lampara a poppa per la pesca di notte,
   le reti coi sugheri, la cassetta del pesce. Il pescatore (maglia a righe, cappello di paglia) rema guardando la poppa. */
function gozzo(lamp) {
  let s = `<path d="M-60 -20Q-58 -8 -44 -5Q-10 -2 30 -4Q48 -6 56 -18L55 -8Q52 4 38 8Q10 12 -26 10Q-48 7 -56 -4Q-60 -10 -60 -20Z" fill="#F4F1EA"/>`
    + `<path d="M-58 -10Q-50 2 -30 4Q10 7 40 3Q50 0 55 -8L54 -4Q48 6 36 8Q10 12 -26 10Q-48 7 -56 -4Z" fill="#3E86B8"/><path d="M-56 -6Q-30 4 10 5Q38 4 54 -6" stroke="#B23A2E" stroke-width="1.4" fill="none"/>`
    + `<path d="M-60 -20Q-58 -8 -44 -5Q-10 -2 30 -4Q48 -6 56 -18" stroke="#C99A5E" stroke-width="2.8" fill="none"/><path d="M-60 -20L-64 -32Q-62 -34 -60 -32L-58 -20" fill="#C99A5E"/><path d="M56 -18L60 -28Q62 -29 62 -26L58 -16" fill="#C99A5E"/>`
    + `<path d="M-44 -6Q-42 -1 -38 0M-24 -4Q-22 1 -18 2M-4 -3Q-2 2 2 3M16 -4Q18 1 22 2" stroke="#000" stroke-opacity=".08" stroke-width="1" fill="none"/>`
    + `<path d="M-52 -10Q-44 -20 -32 -10Q-40 -6 -52 -10Z" fill="#6E7A5A"/>` + [-48, -43, -38, -34].map((x, i) => `<circle cx="${x}" cy="${-13 + (i % 2) * 2}" r="1.6" fill="#E3A33B"/>`).join('')
    + `<rect x="-28" y="-12" width="12" height="7" rx="1" fill="#8A5E3B"/>` + [-26, -22, -18].map((x) => `<ellipse cx="${x}" cy="-12.4" rx="2.6" ry="1.2" fill="#9FB4C0"/>`).join('');
  if (lamp) s += `<path d="M48 -16L50 -52" stroke="#5A4632" stroke-width="2"/><path d="M42 -52h14" stroke="#5A4632" stroke-width="1.6"/><path d="M45 -52l-2 -6h12l-2 6z" fill="#3A3A3A"/><rect x="44" y="-50" width="10" height="7" rx="2" fill="#FFF1BE"/>`;
  return s;
}
/* le vele in più: la iole di Germinale (due alberi, legno verniciato), il botter olandese di Floreale (fondo piatto, deriva laterale, randa aurica rossiccia),
   la feluca di Messidoro (scafo a doppia punta, antenna lunga, vela latina con le cuciture) */
function sailExtra(kind) {
  if (kind === 'iole') return `<path d="M-6 -104V-5" stroke="#5A4632" stroke-width="2.4"/><path d="M-4 -100Q14 -64 32 -16L-4 -16Z" fill="#FBF7EE"/><path d="M-8 -96Q-26 -52 -44 -12L-8 -14Z" fill="#F4EFE2"/><path d="M-4 -16H34" stroke="#5A4632" stroke-width="2"/>`
    + `<path d="M40 -6V-56" stroke="#5A4632" stroke-width="1.8"/><path d="M42 -54Q50 -34 54 -12L42 -12Z" fill="#FBF7EE"/><path class="sc-flagw2" d="M-6 -104L-24 -101L-6 -97Z" fill="#E89BB5"/><path class="sc-flagw2" d="M40 -56L28 -54L40 -51Z" fill="#5E8A5A"/>`
    + `<g transform="translate(30 -7)">${captainL()}</g><path d="M-50 -12Q-10 -5 46 -9Q42 5 24 9L-24 9Q-40 6 -50 -12Z" fill="#B98A5C"/><path d="M-50 -12Q-10 -5 46 -9L45.5 -6.4Q-10 -1.6 -49 -9.4Z" fill="#5E8A5A"/><path d="M-38 3Q0 6 38 2" stroke="#8A5E3B" stroke-width="1.2" fill="none"/>`;
  if (kind === 'botter') return `<path d="M0 -6V-96" stroke="#3A2E24" stroke-width="3"/><path d="M2 -60L40 -88" stroke="#3A2E24" stroke-width="2.2"/><path d="M2 -58L40 -86Q44 -46 42 -14L2 -14Z" fill="#9A4A2E"/><path d="M2 -14Q20 -40 41 -84" stroke="#7E3A22" stroke-width="1" fill="none"/>`
    + `<path d="M-2 -90Q-20 -50 -38 -12L-2 -12Z" fill="#B85A34"/><path d="M0 -96L-30 -100" stroke="#3A2E24" stroke-width=".8"/><path class="sc-flagw2" d="M0 -96L-26 -94L0 -91Z" fill="#E3A33B"/>`
    + `<g transform="translate(30 -9)">${captainL()}</g><path d="M-52 -14Q-48 2 -30 6H34Q48 4 50 -16Q0 -10 -52 -14Z" fill="#3A2A20"/><path d="M-52 -14Q0 -10 50 -16" stroke="#C9A04A" stroke-width="2.4" fill="none"/>`
    + `<ellipse cx="-2" cy="-2" rx="12" ry="18" fill="#5A3A26" transform="rotate(-8 -2 -2)"/><ellipse cx="-2" cy="-2" rx="8" ry="13" fill="#6E4A30" transform="rotate(-8 -2 -2)"/>`;
  /* feluca */
  return `<path d="M-2 -5V-64" stroke="#5A4632" stroke-width="2.8"/><path d="M-54 -12L38 -124" stroke="#5A4632" stroke-width="2.4" stroke-linecap="round"/>`
    + `<path d="M-52 -13L37 -122Q46 -66 34 -14Z" fill="#F7F0DE"/>` + [.2, .4, .6, .8].map((t) => `<path d="M${f2(-52 + 89 * t)} ${f2(-13 - 109 * t)}L${f2(-52 + 86 * t + 30 * (1 - t) * .2)} -14" stroke="#E2D6BA" stroke-width=".8"/>`).join('')
    + `<path d="M-52 -13L37 -122Q30 -66 12 -14Z" fill="#000" fill-opacity=".04"/><path class="sc-flagw2" d="M38 -124L22 -122L37 -118Z" fill="#2F6E9A"/><path d="M-54 -12L-50 -4" stroke="#5A4632" stroke-width="1.6"/>`
    + `<g transform="translate(30 -8)">${captainL()}</g><path d="M42 -10L20 -16" stroke="#6E4A2C" stroke-width="1.8" stroke-linecap="round"/>`
    + `<path d="M-60 -18Q-50 -6 -30 -5Q10 -3 40 -6Q50 -8 54 -16L52 -6Q46 6 30 9Q0 12 -30 9Q-52 6 -58 -6Z" fill="#B98A5C"/><path d="M-58 -8Q-30 2 10 3Q40 2 52 -8L51 -4Q44 6 30 8Q0 11 -30 8Q-50 5 -57 -4Z" fill="#2F6E9A"/>`
    + `<path d="M-60 -18Q-50 -6 -30 -5Q10 -3 40 -6Q50 -8 54 -16" stroke="#8A5E3B" stroke-width="2.4" fill="none"/><circle cx="-48" cy="-9" r="2.4" fill="#F4F1EA"/><circle cx="-48" cy="-9" r="1.1" fill="#1E1A14"/>`;
}
/* vedette in più: la palafitta di Brumale sullo stagno, la casa sull'albero fiorito di Germinale, il belvedere di ferro battuto coi rampicanti di Floreale */
function stiltHut(L) {
  let t = '';
  [-20, -7, 7, 20].forEach((x, i) => { t += `<path d="M${x} 30L${x * .9} -40" stroke="${i % 2 ? '#3E3128' : '#4A3A2E'}" stroke-width="3.4" stroke-linecap="round"/>`; });
  t += `<path d="M-20 10L20 -20M20 10L-20 -20" stroke="#5A4636" stroke-width="1.6"/><rect x="-30" y="-44" width="60" height="5" fill="#3E3128"/>`
    + `<path d="M-24 -44V-74H24V-44Z" fill="#6A5644"/>` + Array.from({ length: 8 }, (_, j) => `<path d="M${-24 + j * 6.8} -44V-74" stroke="#4A3A2E" stroke-width="1"/>`).join('')
    + `<rect x="-6" y="-66" width="10" height="10" fill="#2E2218"/><path d="M-34 -72L0 -98L34 -72Z" fill="#8C7A4A"/>` + Array.from({ length: 9 }, (_, j) => `<path d="M${-30 + j * 7.4} -73l${f2((j - 4) * -.8)} -6" stroke="#6E5E36" stroke-width="1"/>`).join('')
    + `<path d="M0 -98L${34 * L} -72H0Z" fill="#000" fill-opacity=".14"/><path d="M30 -44L44 26" stroke="#5A4636" stroke-width="1.6"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${f2(31 + i * 2.2)} ${f2(-34 + i * 11)}h6" stroke="#5A4636" stroke-width="1.2"/>`).join('')
    + `<path d="M-30 -44h-10v8" stroke="#2E2A26" stroke-width="1.4" fill="none"/><rect x="-43" y="-36" width="6" height="8" rx="1" fill="#2E2A26"/>`;
  return { svg: t, lamp: [-1, -61], lamp2: [-40, -32] };
}
function treeHouse(L, R) {
  let t = `<path d="M-6 2Q-4 -40 -2 -60Q-14 -80 -30 -88M-2 -60Q8 -82 28 -92M-3 -40Q-20 -44 -34 -40M2 -2Q-2 -40 4 -64" stroke="#6B5040" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-12 2Q-6 -6 -6 -14M6 2Q4 -6 2 -12" stroke="#6B5040" stroke-width="5" fill="none"/>`;
  t += `<rect x="-30" y="-62" width="60" height="5" fill="#8A6A48"/><path d="M-26 -62V-92H26V-62Z" fill="#C9A27A"/>` + Array.from({ length: 6 }, (_, j) => `<path d="M-26 ${-66 - j * 5}H26" stroke="#A27A54" stroke-width="1"/>`).join('')
    + `<rect x="-14" y="-84" width="10" height="10" fill="#3E4652"/><rect x="6" y="-84" width="10" height="10" fill="#3E4652"/><path d="M-32 -90L0 -110L32 -90Z" fill="#5E8A4A"/><path d="M0 -110L${32 * L} -90H0Z" fill="#000" fill-opacity=".14"/>`
    + `<path d="M28 -60L40 2M36 -60L48 2" stroke="#8A6A48" stroke-width="1.6"/>` + [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${f2(29 + i * 1.8)} ${-52 + i * 8}h8" stroke="#8A6A48" stroke-width="1.3"/>`).join('');
  const cols = ['#F4C9D8', '#FFFFFF', '#E89BB5', '#F7DCE6'];
  let cr = ''; for (let i = 0; i < 70; i++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()), x = Math.cos(a) * rr * 62, y = -104 + Math.sin(a) * rr * 34; if (y > -94 && Math.abs(x) < 34) continue; cr += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(5 + R() * 6)}" fill="${cols[i % 4]}"/>`; }
  return { svg: t + cr + `<path class="sc-flagw" d="M0 -110L0 -126L14 -122L0 -118" fill="#E89BB5" stroke="#3A2E24" stroke-width="1.2"/>`, lamp: [-9, -79], lamp2: null };
}
/* Floreale · Osservare: la torre belvedere del giardino. Fusto di mattoni su basamento di pietra, cornici marcapiano, finestre ad arco,
   in cima la loggia aperta (tre archi su colonnine, balaustra) sotto il tetto a padiglione di ardesia viola con la lanterna e la bandiera.
   Il glicine sale sullo spigolo e ricade a grappoli dalla loggia; ai piedi le rose rampicanti e i vasi di limoni. */
function gardenTower(L) {
  const B = '#C98A62', Bd = shade(B, .25), S = '#E4D8C2', Sd = shade(S, .2), RG = rng(97), sh = L > 0 ? 1 : -1;
  const arch = (cx, by, w, h, f) => `<path d="M${f2(cx - w / 2)} ${f2(by)}V${f2(by - h + w / 2)}A${f2(w / 2)} ${f2(w / 2)} 0 0 1 ${f2(cx + w / 2)} ${f2(by - h + w / 2)}V${f2(by)}Z" fill="${f}"/>`;
  let t = `<path d="M-30 0L-27 -16H27L30 0Z" fill="${Sd}"/><path d="M-27 -16H27" stroke="${S}" stroke-width="2"/>`;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) t += `<rect x="${f2(-26 + c * 9 + (r % 2) * 4.5)}" y="${f2(-14 + r * 4.6)}" width="8" height="4" rx="1" fill="#000" fill-opacity="${f2(.05 + RG() * .07)}"/>`;
  t += `<path d="M-20 -16L-19 -112H19L20 -16Z" fill="${B}"/><path d="M${sh > 0 ? 6 : -20} -16L${sh > 0 ? 6 : -19} -112H${sh > 0 ? 19 : -6}L${sh > 0 ? 20 : -6} -16Z" fill="#000" fill-opacity=".14"/>`;
  for (let j = 1; j < 24; j++) t += `<path d="M-19.5 ${-16 - j * 4}H19.5" stroke="${Bd}" stroke-opacity=".28" stroke-width=".5"/>`;
  [-1, 1].forEach((sg) => { for (let j = 0; j < 8; j++) t += `<rect x="${sg > 0 ? 15 : -20}" y="${-22 - j * 11}" width="5" height="${j % 2 ? 5 : 6}" fill="${S}" fill-opacity=".85"/>`; });   // cantonali di pietra
  t += [-48, -80].map((y) => `<rect x="-22" y="${y}" width="44" height="3.2" fill="${S}"/><rect x="-22" y="${y + 3.2}" width="44" height="1" fill="#000" fill-opacity=".15"/>`).join('');
  t += arch(0, -16, 12, 24, '#4A3A2E') + `<path d="M-7 -16V-34A7 7 0 0 1 7 -34V-16" stroke="${S}" stroke-width="2" fill="none"/><path d="M-10 -16h20v2h-20z" fill="${Sd}"/>`;
  t += arch(0, -56, 8, 16, '#3E4652') + `<path d="M-5 -56h10" stroke="${S}" stroke-width="1.6"/>` + arch(-8, -88, 6, 13, '#3E4652') + arch(8, -88, 6, 13, '#3E4652') + `<path d="M-12 -88h24" stroke="${S}" stroke-width="1.4"/>`;
  /* la loggia */
  t += `<rect x="-24" y="-116" width="48" height="5" fill="${S}"/><rect x="-24" y="-111" width="48" height="1.4" fill="#000" fill-opacity=".18"/>`;
  t += `<path d="M-22 -116V-146H22V-116Z" fill="${shade(B, .05)}"/>` + [-14, 0, 14].map((x) => arch(x, -116, 11, 26, '#2E2A30')).join('');
  t += `<path d="M-22 -122H22" stroke="${S}" stroke-width="1.6"/>` + Array.from({ length: 13 }, (_, j) => `<path d="M${-20 + j * 3.3} -116V-122" stroke="${S}" stroke-width="1.2"/>`).join('');
  t += [-20.5, -7, 7, 20.5].map((x) => `<rect x="${x - 1.5}" y="-142" width="3" height="26" fill="${S}"/>`).join('') + `<rect x="-24" y="-150" width="48" height="4" fill="${S}"/>`;
  /* il tetto a padiglione con le falde a sbalzo, la lanterna, la bandiera */
  t += `<path d="M-32 -149L-14 -170H14L32 -149Z" fill="#5E4A72"/><path d="M0 -170H14L32 -149H0Z" fill="#000" fill-opacity="${sh > 0 ? .2 : .05}"/><path d="M-32 -149H32" stroke="#3E3050" stroke-width="1.6"/>`
    + Array.from({ length: 5 }, (_, j) => `<path d="M-30 ${-152 - j * 4}H30" stroke="#000" stroke-opacity=".12" stroke-width=".6" transform="scale(${f2(1 - j * .14)} 1)"/>`).join('')
    + `<rect x="-6" y="-182" width="12" height="12" fill="${S}"/>${arch(0, -172, 5, 9, '#2E2A30')}<path d="M-8 -182L0 -190L8 -182Z" fill="#5E4A72"/><path d="M0 -190V-206" stroke="#3A2E24" stroke-width="1.4"/>`
    + `<path class="sc-flagw" d="M0 -206L14 -202L0 -198Z" fill="#E3A33B"/>`;
  /* il glicine: il tronco ritorto sale sullo spigolo, si apre sotto la loggia e ricade a grappoli */
  const gx = -21 * sh; let gl = `<path d="M${gx} 0Q${gx - 3 * sh} -30 ${gx + 1 * sh} -56Q${gx - 4 * sh} -80 ${gx} -108Q${gx + 10 * sh} -114 ${gx + 26 * sh} -112" stroke="#6A5440" stroke-width="2.4" fill="none"/>`;
  for (let i = 0; i < 26; i++) { const x = gx + sh * (RG() * 40 - 2), y = -110 + RG() * 6, l = 6 + RG() * 12; gl += `<path d="M${f2(x)} ${f2(y)}q${f2((RG() - .5) * 2)} ${f2(l * .5)} 0 ${f2(l)}" stroke="#A98ACB" stroke-width="${f2(2.4 + RG() * 1.2)}" stroke-linecap="round" fill="none"/><circle cx="${f2(x)}" cy="${f2(y + 1)}" r="1.8" fill="#6E8F55"/>`; }
  for (let i = 0; i < 14; i++) { const y = -20 - RG() * 86, x = gx + sh * (RG() * 6 - 2); gl += `<path d="M${f2(x)} ${f2(y)}q${f2(-sh * 2)} 4 0 ${f2(6 + RG() * 5)}" stroke="#B79AD6" stroke-width="2.2" stroke-linecap="round" fill="none"/><circle cx="${f2(x + sh)}" cy="${f2(y)}" r="1.5" fill="#5E8A44"/>`; }
  /* le rose ai piedi, il vaso di limoni accanto alla porta */
  let fl = ''; for (let i = 0; i < 22; i++) { const x = (RG() < .5 ? -1 : 1) * (12 + RG() * 18), y = -2 - RG() * 14; fl += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(2 + RG() * 1.6)}" fill="${i % 3 ? '#5E8A44' : ['#D8453A', '#F4C9D8', '#C2307A'][i % 3]}"/>`; }
  fl += `<path d="M${f2(16 * sh)} 0l2 -8h10l2 8z" fill="#B0643F"/><circle cx="${f2(23 * sh)}" cy="-14" r="6" fill="#4E7A3A"/>` + [[20, -15], [25, -12], [23, -17]].map(([x, y]) => `<circle cx="${f2(x * sh)}" cy="${y}" r="1.4" fill="#F2C230"/>`).join('');
  return { svg: t + gl + fl, lamp: [0, -128], lamp2: null };
}
function ironGazebo(L) {
  const G = '#3E5A48', GL = '#5E7E66';
  let t = `<rect x="-26" y="-6" width="52" height="6" fill="#B9B0A0"/>`;
  [-20, -7, 7, 20].forEach((x) => { t += `<path d="M${x} -6V-104" stroke="${G}" stroke-width="2.6"/>`; });
  for (let j = 0; j < 9; j++) t += `<path d="M-20 ${-12 - j * 10}L20 ${-17 - j * 10}" stroke="${GL}" stroke-width="1.4"/>`;
  t += `<path d="M-24 -54H24M-24 -104H24" stroke="${G}" stroke-width="3"/><path d="M-24 -104Q-18 -112 -20 -118Q-10 -122 0 -140Q10 -122 20 -118Q18 -112 24 -104Z" fill="${G}"/><path d="M0 -140L${20 * L} -118Q${18 * L} -112 ${24 * L} -104H0Z" fill="#000" fill-opacity=".15"/>`
    + `<circle cx="0" cy="-143" r="3" fill="${BRASS}"/>` + [-16, -8, 0, 8, 16].map((x) => `<path d="M${x} -104q4 6 0 12" stroke="${GL}" stroke-width="1.2" fill="none"/>`).join('');
  let roses = ''; const RR = rng(91); for (let i = 0; i < 40; i++) { const side = i % 2 ? 1 : -1, y = -6 - RR() * 98, x = side * 20 + (RR() - .5) * 8; roses += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(1.6 + RR() * 1.6)}" fill="${i % 3 ? '#5E8A44' : ['#D8453A', '#F4C9D8', '#C2307A'][i % 3]}"/>`; }
  return { svg: t + roses + `<path class="sc-flagw" d="M0 -146V-160L14 -156L0 -152" fill="#7E5A8E" stroke="#3A2E24" stroke-width="1"/>`, lamp: null, lamp2: null };
}

/* il campanile gotico alpino di Ianuario: contrafforti a gradoni, finestre a sesto acuto, cella campanaria a bifore, guglia ottagonale a scaglie
   coi pinnacoli agli angoli. La neve si posa su ogni ripiano (contrafforti, cornici, cappello dell'orologio, base della guglia), i ghiaccioli pendono sotto. */
function gothicTower(L, hr) {
  const st = '#D2CDC3', sd = shade(st, .28), R = rng(23);
  const lancet = (cx, by, w, h, fill = '#2E2A26') => `<path d="M${f2(cx - w / 2)} ${f2(by)}V${f2(by - h + w * .7)}Q${f2(cx - w / 2)} ${f2(by - h + w * .1)} ${f2(cx)} ${f2(by - h)}Q${f2(cx + w / 2)} ${f2(by - h + w * .1)} ${f2(cx + w / 2)} ${f2(by - h + w * .7)}V${f2(by)}Z" fill="${fill}"/>`;
  let t = `<rect x="-27" y="-9" width="54" height="9" fill="#8E897F"/><rect x="-27" y="-9" width="54" height="2" fill="#A9A49A"/>`;
  t += `<rect x="-18" y="-114" width="36" height="105" fill="${st}"/><rect x="${L > 0 ? 4 : -18}" y="-114" width="14" height="105" fill="#000" fill-opacity=".12"/>`;
  for (let j = 1; j < 14; j++) t += `<path d="M-18 ${-9 - j * 7.5}H18" stroke="${sd}" stroke-opacity=".35" stroke-width=".7"/>`;
  [-1, 1].forEach((sg) => { const x = sg * 20; t += `<path d="M${x - 4} -9V-52L${x - 2} -56V-82L${x} -86L${x + 2} -82V-56L${x + 4} -52V-9Z" fill="${shade(st, .1)}"/><path d="M${x - 4} -9V-52L${x - 2} -56V-82L${x} -86" stroke="${sd}" stroke-width=".8" fill="none"/>`
    + snowLedge(x - 5, x + 5, -52, 2.2) + snowLedge(x - 3, x + 3, -82, 1.8) + icicles(x - 4, x + 4, -50.5, .8, R); });
  t += lancet(0, -24, 7, 20) + `<path d="M-6 -9V-24Q0 -32 6 -24V-9Z" fill="#5A3A26"/>` + lancet(0, -44, 5, 14, '#3E4652') + lancet(-9, -96, 4, 12, '#3E4652') + lancet(9, -96, 4, 12, '#3E4652');
  t += `<rect x="-20" y="-118" width="40" height="5" fill="${shade(st, .06)}"/>` + [-15, -9, -3, 3, 9, 15].map((x) => `<path d="M${x - 3} -113q3 4 6 0" stroke="${sd}" stroke-width=".9" fill="none"/>`).join('') + snowLedge(-21, 21, -118, 2.8) + icicles(-20, 20, -112.5, 1, R);
  /* la cella campanaria con le bifore e la campana */
  t += `<rect x="-17" y="-142" width="34" height="24" fill="${st}"/><rect x="${L > 0 ? 4 : -17}" y="-142" width="13" height="24" fill="#000" fill-opacity=".12"/>` + lancet(-7, -120, 7, 18) + lancet(7, -120, 7, 18)
    + `<g><animateTransform attributeName="transform" type="rotate" values="-6 -7 -136;6 -7 -136;-6 -7 -136" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><path d="M-11 -124Q-11 -134 -7 -134Q-3 -134 -3 -124Z" fill="#B8863B"/></g>`
    + `<rect x="-20" y="-146" width="40" height="4" fill="${shade(st, .06)}"/>` + snowLedge(-21, 21, -146, 3) + icicles(-20, 20, -141.5, 1, R);
  /* la guglia ottagonale a scaglie, coi pinnacoli */
  let sc = ''; for (let r = 0; r < 9; r++) { const y = -150 - r * 9, hw = 15 * (1 - (r + .5) / 10); for (let x = -hw + 2; x < hw - 1; x += 4) sc += `<path d="M${f2(x)} ${f2(y)}q2 2.6 4 0" stroke="#000" stroke-opacity=".16" stroke-width=".6" fill="none"/>`; }
  t += `<path d="M-16 -146L0 -236L16 -146Z" fill="#4E5A64"/><path d="M0 -236L${16 * L} -146H${6 * L}Z" fill="#000" fill-opacity=".18"/><path d="M-6 -146L0 -236L6 -146" stroke="#3E4852" stroke-width=".8" fill="none"/>` + sc;
  [-1, 1].forEach((sg) => { const x = sg * 18; t += `<path d="M${x - 3} -146L${x} -170L${x + 3} -146Z" fill="#B9B4AA"/><circle cx="${x}" cy="-171" r="1.4" fill="#B9B4AA"/>` + [-158, -164].map((y) => `<circle cx="${x + sg * -1.6}" cy="${y}" r=".9" fill="#9A958A"/>`).join('') + `<path d="M${x - 2.4} -168Q${x} -174 ${x + 2.4} -168L${x} -172Z" fill="#FFFFFF"/>`; });
  /* la neve trattenuta dalle scaglie, a strisce sul lato del vento, più fitta in basso dove la pendenza cala; il ghiaccio vetroso sotto la cella */
  for (let r = 0; r < 8; r++) { const y = -152 - r * 10, hw = 15 * (1 - (r + .6) / 10); for (let j = 0; j < 3 - (r > 4); j++) { const x0 = -hw + 1 + R() * hw * .9, w = 2 + R() * 3.4 * (1 - r / 9); t += `<path d="M${f2(x0)} ${f2(y)}q${f2(w / 2)} ${f2(-1.6)} ${f2(w)} 0q${f2(-w / 2)} ${f2(.8)} ${f2(-w)} 0z" fill="#FFFFFF" fill-opacity=".92"/>`; } }
  t += `<path d="M-16 -146L-15 -150L0 -236L-12 -150Z" fill="#FFFFFF" fill-opacity=".55"/><path d="M-14 -142H14" stroke="#CFE3EE" stroke-width="1.4" stroke-opacity=".8"/>` + icicles(-16, 16, -140, 1.4, R);
  t += `<path d="M-16 -146Q-10 -154 -12 -160L-4 -158Q-2 -170 0 -172Q4 -164 6 -168Q10 -156 16 -146Z" fill="#FFFFFF" fill-opacity=".95"/><path d="M-6 -190Q-3 -196 -1 -200L0 -186Z" fill="#FFFFFF" fill-opacity=".85"/><path d="M2 -206l1.4 -6l1 5z" fill="#FFFFFF" fill-opacity=".8"/>`
    + `<path d="M0 -236V-250M-4 -245H4" stroke="#3A3226" stroke-width="1.4"/><circle cx="0" cy="-237" r="1.8" fill="${BRASS}"/>`;
  /* l'orologio col cappello */
  t += `<circle cx="0" cy="-68" r="11.5" fill="#F4EFE0" stroke="#3A3226" stroke-width="2"/><path d="M-14 -81L0 -88L14 -81Z" fill="#4E5A64"/>` + snowLedge(-14, 14, -82, 2);
  for (let j = 0; j < 12; j++) { const a = j * Math.PI / 6, r0 = j % 3 ? 9 : 7.6; t += `<path d="M${f2(Math.sin(a) * r0)} ${f2(-68 - Math.cos(a) * r0)}L${f2(Math.sin(a) * 10.2)} ${f2(-68 - Math.cos(a) * 10.2)}" stroke="#3A3226" stroke-width="${j % 3 ? .7 : 1.2}"/>`; }
  const ha = ((hr % 12) / 12) * 360, ma = ((hr * 60) % 60) / 60 * 360;
  t += `<g><animateTransform attributeName="transform" type="rotate" from="${f2(ha)} 0 -68" to="${f2(ha + 360)} 0 -68" dur="43200s" repeatCount="indefinite"/><path d="M0 -68V-74" stroke="#2A221A" stroke-width="2" stroke-linecap="round"/></g>`
    + `<g><animateTransform attributeName="transform" type="rotate" from="${f2(ma)} 0 -68" to="${f2(ma + 360)} 0 -68" dur="3600s" repeatCount="indefinite"/><path d="M0 -68V-77" stroke="#2A221A" stroke-width="1.3" stroke-linecap="round"/></g><circle cx="0" cy="-68" r="1.3" fill="#2A221A"/>`;
  /* la neve accumulata alla base, contro i muri */
  t += `<path d="M-34 1Q-30 -8 -20 -6Q0 -12 20 -6Q30 -8 34 1Z" fill="#FFFFFF"/>`;
  return t;
}
/* il segno della vetta, diverso per ogni mese (origine alla base, al centro) */
function summitMark(mi, L) {
  const R = rng(61 + mi);
  switch (mi) {
    case 0: { // Foliaio: la cappelletta di pietra in cima al colle, coi due cipressi; dentro il lume acceso
      let c = treeCypress(-34, 2, 1.1, '#3F5A34', L) + treeCypress(36, 2, 1.25, '#3F5A34', L);
      c += `<rect x="-20" y="-2" width="40" height="4" fill="#9A8C74"/><path d="M-16 -2V-44H16V-2Z" fill="#D9C3A0"/><path d="M${L > 0 ? 4 : -16} -2V-44H${L > 0 ? 16 : -4}V-2Z" fill="#000" fill-opacity=".12"/>`
        + Array.from({ length: 6 }, (_, j) => `<path d="M-16 ${-6 - j * 7}H16" stroke="#B9A27A" stroke-width=".7"/>`).join('')
        + `<path d="M-8 -2V-24Q0 -34 8 -24V-2Z" fill="#3A3026"/><path d="M-22 -42L0 -58L22 -42Z" fill="#B05A36"/><path d="M0 -58L${22 * L} -42H0Z" fill="#000" fill-opacity=".15"/>`
        + `<rect x="-4" y="-70" width="8" height="12" fill="#D9C3A0"/><path d="M-2 -60V-66Q0 -68 2 -66V-60Z" fill="#3A3026"/><path d="M0 -70V-78M-3 -75H3" stroke="#3A3226" stroke-width="1.2"/>`
        + `<rect x="-3" y="-16" width="6" height="8" fill="#E8CF86"/><path d="M0 -16v-3" stroke="#F6C76E" stroke-width="1.4"/>`;
      return { svg: c, lamp: [0, -18] }; }
    case 1: { // Brumale: l'ometto con la lanterna accesa sul palo e la cassetta del libro di vetta
      return { svg: cairn(1) + `<path d="M-28 4V-60h10" stroke="#3E3128" stroke-width="2.4" fill="none"/><path d="M-18 -60v6" stroke="#2E2A26" stroke-width="1"/><rect x="-22" y="-54" width="8" height="10" rx="1.4" fill="#2E2A26"/>`
        + `<path d="M24 4V-22" stroke="#5A4636" stroke-width="2.4"/><rect x="17" y="-34" width="14" height="12" rx="1.4" fill="#8A8F96"/><path d="M17 -30h14" stroke="#5E636A" stroke-width="1"/>`, lamp: [-18, -49] }; }
    case 2: { // Ianuario: la croce di vetta coperta di galaverna (gli aghi di ghiaccio crescono contro vento), la cornice di neve, la piccozza
      let c = `<path d="M-2 4V-108M-26 -80H22" stroke="#4A3A2E" stroke-width="5" stroke-linecap="square"/>`;
      const rime = (x0, y0, x1, y1, n) => { let o = ''; for (let j = 0; j < n; j++) { const t = j / (n - 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, l = 4 + R() * 6; o += `<path d="M${f2(x)} ${f2(y - 1.6)}l${f2(-l)} ${f2(-1 - R() * 2)}l${f2(l * .3)} ${f2(2.4)}l${f2(-l * .7)} ${f2(1.6)}l${f2(l)} ${f2(.6)}Z" fill="#F4F9FC"/>`; } return o; };
      c += rime(-4.5, 2, -4.5, -108, 26) + rime(-26, -82.5, 22, -82.5, 12) + `<path d="M-28 -83H24" stroke="#FFFFFF" stroke-width="2.4"/><path d="M-5 -110H1" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`;
      c += `<path d="M30 4L36 -40" stroke="#6E4A2C" stroke-width="2.6" stroke-linecap="round"/><path d="M28 -40Q35 -45 45 -40L36 -38Z" fill="#8A949E"/><path d="M34 -36l2 -4" stroke="#B23A2E" stroke-width="2"/>`
        + `<path d="M-48 6Q-40 -6 -20 -4Q10 -8 40 -2Q54 0 58 8Q40 4 10 6Q-20 4 -48 6Z" fill="#FFFFFF"/><path d="M40 -2Q54 0 58 8L62 6Q56 -4 40 -4Z" fill="#E6F0F5"/>` + icicles(-40, 50, 6, 1, R);
      return { svg: c, lamp: null }; }
    case 3: { // Germinale: il pilastrino del vertice geodetico col disco di bronzo, la palina bianca e rossa: qui si misura e si verifica
      return { svg: `<path d="M-14 2L-10 -36H10L14 2Z" fill="#D8D2C6"/><path d="M${L > 0 ? 2 : -14} 2L${L > 0 ? 2 : -10} -36H${L > 0 ? 10 : -2}L${L > 0 ? 14 : -2} 2Z" fill="#000" fill-opacity=".1"/><rect x="-12" y="-40" width="24" height="5" fill="#C9C2B4"/>`
        + `<ellipse cx="0" cy="-41" rx="6" ry="2" fill="${BRASS}"/><circle cx="0" cy="-41.4" r="1" fill="${BRASS_D}"/><path d="M-8 -20h16M-8 -14h16" stroke="#9A958A" stroke-width=".7"/><rect x="-6" y="-28" width="12" height="5" fill="#B9B4AA"/>`
        + `<path d="M26 4V-74" stroke="#F4F1EA" stroke-width="3"/>` + [0, 1, 2, 3].map((j) => `<path d="M26 ${-8 - j * 18}v-9" stroke="#C0392B" stroke-width="3"/>`).join('') + `<path class="sc-flagw" d="M27 -74L40 -71L27 -67Z" fill="#5E8A4A"/>`
        + [[-26, 2], [-20, 4], [36, 3], [44, 1], [-34, 3]].map(([x, y]) => `<path d="M${x} ${y}v-7" stroke="#4E7A3A" stroke-width="1.2"/><path d="M${x - 2.4} ${y - 7}L${x} ${y - 12}L${x + 2.4} ${y - 7}Z" fill="#2E4FA8"/>`).join(''), lamp: null }; }
    case 4: { // Floreale: la campana di vetta sotto il suo telaio di legno; chi arriva la suona (dondola piano), intorno le stelle alpine
      return { svg: `<path d="M-22 4L-16 -78M22 4L16 -78M-22 -78H22" stroke="#6E5236" stroke-width="4" stroke-linecap="round"/><path d="M-20 -30H20" stroke="#6E5236" stroke-width="2"/><path d="M-24 -80L0 -94L24 -80Z" fill="#6E5236"/>`
        + `<g><animateTransform attributeName="transform" type="rotate" values="-10 0 -76;10 0 -76;-10 0 -76" dur="3.6s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><path d="M0 -78V-72" stroke="#3A3226" stroke-width="1.4"/><path d="M-10 -48Q-10 -72 0 -72Q10 -72 10 -48L13 -45H-13Z" fill="${BRASS}"/><path d="M-10 -52H10" stroke="${BRASS_D}" stroke-width="1.2"/><circle cx="0" cy="-44" r="2.4" fill="${BRASS_D}"/><path d="M0 -44V-20" stroke="#C9B48A" stroke-width="1"/></g>`
        + [[-30, 2], [-38, 4], [30, 3], [38, 1]].map(([x, y]) => `<path d="M${x} ${y}v-6" stroke="#7E8F6A" stroke-width="1.2"/><g transform="translate(${x} ${y - 7})">${[0, 1, 2, 3, 4].map((k) => `<ellipse rx="1.2" ry="3" transform="rotate(${k * 72}) translate(0 -2.4)" fill="#F4F1EA"/>`).join('')}<circle r="1.2" fill="#E3C34A"/></g>`).join(''), lamp: null }; }
    case 5: { // Messidoro: la croce di legno sopra la piana del grano, con la cassetta di latta del libro di vetta e la bandiera
      return { svg: `<path d="M0 4V-104M-20 -78H20" stroke="#6E4A2C" stroke-width="5"/><path d="M-1.6 4V-104" stroke="#000" stroke-opacity=".15" stroke-width="1.6"/><rect x="-6" y="-56" width="12" height="10" rx="1.2" fill="#9AA0A6"/><path d="M-6 -52h12" stroke="#6E747A" stroke-width=".8"/>`
        + `<path d="M24 4V-60" stroke="#3A2E24" stroke-width="2"/><path class="sc-flagw" d="M25 -59Q36 -62 46 -57Q36 -52 25 -48Z" fill="${STY[5].flag}"/>` + [[-26, 2], [32, 3]].map(([x, y]) => wheat(x, y, 30, '#B98A34', '#C9A04A') + wheat(x + 4, y + 1, 26, '#B98A34', '#C9A04A')).join(''), lamp: null }; }
    default: { // Estiario: il capo, la fine della terra: l'obelisco di pietra con la sfera, la rosa dei venti incisa nella roccia, la bandiera al vento di mare
      let c = `<ellipse cx="-6" cy="4" rx="46" ry="9" fill="#B39A76"/><ellipse cx="-6" cy="4" rx="40" ry="7" fill="none" stroke="#8E7A58" stroke-width="1"/>`;
      for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4; c += `<path d="M-6 4L${f2(-6 + Math.cos(a) * (j % 2 ? 22 : 38))} ${f2(4 + Math.sin(a) * (j % 2 ? 4 : 7))}" stroke="#8E7A58" stroke-width="${j % 2 ? .8 : 1.6}"/>`; }
      c += `<path d="M-11 2L-8 -86H8L11 2Z" fill="#E2D6BC"/><path d="M${L > 0 ? 0 : -11} 2L${L > 0 ? 0 : -8} -86H${L > 0 ? 8 : 0}L${L > 0 ? 11 : 0} 2Z" fill="#000" fill-opacity=".12"/><path d="M-8 -86L0 -98L8 -86Z" fill="#CFC2A6"/><circle cx="0" cy="-102" r="4.4" fill="${BRASS}"/>`
        + `<rect x="-14" y="-4" width="28" height="6" fill="#CFC2A6"/><path d="M-4 -40h8M-3 -34h6" stroke="#B39A76" stroke-width=".8"/>`
        + `<path d="M28 4V-78" stroke="#3A2E14" stroke-width="2.2"/><path class="sc-flagw" d="M29 -77Q42 -80 54 -74Q42 -68 29 -64Z" fill="#C0392B"/>`;
      return { svg: c, lamp: null }; }
  }
}

function sceneSVG(mi, opts = {}) {
  const p = clamp(opts.p ?? monthP(mi), 0, 1);
  const DAYB = mi === 1 && opts.variant === 'giorno';
  const NIGHT = mi === 1 ? !DAYB : opts.variant === 'notte', NK = mi === 1 ? .56 : NIGHT_K[mi];
  const LD = Object.assign({}, LAND[mi]), u = 'sc' + (++sceneUid);
  const seed = mi * 131 + (opts.prot ? 900 : (opts.wk ?? 0) * 37) + 7, R = rng(seed), RN = rng(seed * 7 + 3);
  const T = Math.max(0, Math.round(opts.top || 0)), B = Math.max(0, Math.round(opts.bot || 0)), BOT = SH + B + 4;
  const sky = NIGHT ? NIGHT_SKY2[mi] : LD.sky.slice();
  /* 3.0: le settimane di pioggia (Foliaio 2 e 6, Germinale 2 e 5, Floreale 7) e il temporale lontano sul mare (Messidoro 4); Brumale di giorno pioviggina sempre */
  const RAINW = !opts.prot && (({ 0: [1, 5], 3: [1, 4], 4: [6] })[mi] || []).includes(opts.wk ?? -1), RAIN = RAINW || DAYB, STORM = !opts.prot && mi === 5 && opts.wk === 3;
  if (RAINW && !NIGHT) { sky[0] = mixHex(sky[0], '#8A94A2', .55); sky[1] = mixHex(sky[1], '#B6BEC8', .5); }
  if (RAINW && NIGHT) { sky[0] = mixHex(sky[0], '#1A2030', .4); sky[1] = mixHex(sky[1], '#2A3040', .4); }
  const waterTops = [];
  const s = [];
  const tone = (str) => NIGHT ? toneStr(str, NK) : str;
  const add = (str, d) => { if (str) s.push(d == null ? tone(str) : `<g class="sc-fade" style="--d:${f2(d)}s">${tone(str)}</g>`); };
  const lit = (inner, d = 1.1) => `<g data-lit="1" class="sc-fade" style="--d:${f2(d)}s">${inner}</g>`;
  const addLit = (inner, d) => s.push(lit(inner, d));
  const glow = (x, y, r, op = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="url(#${u}l)" opacity="${op}"/>`;
  const win = (x, y, w, h, dl = 0) => NIGHT || DAYB ? lit(`<rect class="sc-window" style="--wdl:${f2(dl)}s" x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="#F6C76E"/>` + glow(x + w / 2, y + h / 2, w * 3.2, NIGHT ? 1 : .5), 1.4) : '';

  /* ---- sole e luna all'altezza dell'ora ---- */
  const hour = opts.hour ?? (NIGHT ? 22 : 13), sr = opts.sun ? opts.sun[0] : 7, ss = opts.sun ? opts.sun[1] : 17.2;
  const MP = opts.moon ?? .5, MI = (1 - Math.cos(2 * Math.PI * MP)) / 2;
  const HZ = 204, topY = -T + 44, arc = (f, alt) => [740 + clamp(f, 0, 1) * 420, HZ - (HZ - topY) * alt];
  let cel = null;
  if (!NIGHT) { const f = clamp((hour - sr) / (ss - sr), .03, .97), alt = Math.max(.06, Math.sin(Math.PI * f)) * PEAK[mi] * (DAYB ? .9 : 1); const [x, y] = arc(f, alt); cel = { x, y, alt, kind: 'sol', r: 26 }; }
  else { const rise = sr + MP * 24.84, f = (((hour - rise) % 24) + 24) % 24 / 12.4; if (f > 0 && f < 1 && MI > .015) { const alt = Math.sin(Math.PI * f) * .86; const [x, y] = arc(f, alt); cel = { x, y, alt, kind: 'luna', r: 19 }; } }
  const Lx = cel ? cel.x : 900, Ls = (x) => Lx < x ? 1 : -1;     // da che parte viene la luce
  const low = cel && cel.kind === 'sol' ? clamp((.3 - cel.alt) / .3, 0, 1) : 0;   // sole basso: luce calda
  if (low > 0) sky[1] = mixHex(sky[1], mi === 2 ? '#F4D6C0' : '#F4B47C', low * .55);
  /* di notte i monti lontani sono sagome scure; si schiariscono solo se c'è la luna, tanto più quanto è piena e alta */
  const moonL = NIGHT && cel && cel.kind === 'luna' ? clamp(MI * (.4 + cel.alt * .6), 0, 1) : 0;
  const horizon = sky[1], hzC = NIGHT ? mixHex(sky[1], '#93A3C9', moonL * .85) : horizon;
  const haze = (c, d) => { const r = mixHex(c, hzC, Math.pow(1 - clamp(d, 0, 1), 1.7) * LD.hz * (NIGHT ? 1.05 : 1)); return NIGHT ? mixHex(r, '#141C30', (1 - moonL) * .42) : r; };
  const landCol = (d) => haze(mixHex(LD.far, LD.near, smooth(clamp(d, 0, 1))), d);

  const defs = `<defs><linearGradient id="${u}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
    <radialGradient id="${u}g"><stop offset="0" stop-color="${NIGHT ? '#EEF1FA' : '#FFF4D8'}" stop-opacity=".8"/><stop offset=".25" stop-color="${NIGHT ? '#EEF1FA' : '#FFF0C8'}" stop-opacity=".42"/><stop offset=".55" stop-color="${NIGHT ? '#EEF1FA' : '#FFF0C8'}" stop-opacity=".12"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="${u}l"><stop offset="0" stop-color="#FBE6A0" stop-opacity=".6"/><stop offset=".2" stop-color="#F7DC86" stop-opacity=".38"/><stop offset=".45" stop-color="#F5D57A" stop-opacity=".15"/><stop offset=".72" stop-color="#F5D57A" stop-opacity=".04"/><stop offset="1" stop-color="#F5D57A" stop-opacity="0"/></radialGradient>
    <linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="${NIGHT ? '#9FB0D6' : '#FFFFFF'}" stop-opacity=".55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
    <linearGradient id="${u}b" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFF1BE" stop-opacity=".8"/><stop offset="1" stop-color="#FFF1BE" stop-opacity="0"/></linearGradient>
    <radialGradient id="${u}wsp"><stop offset="0" stop-color="${NIGHT ? '#A9B8DC' : '#FFFFFF'}" stop-opacity=".85"/><stop offset=".6" stop-color="${NIGHT ? '#A9B8DC' : '#FFFFFF'}" stop-opacity=".3"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <linearGradient id="${u}b2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF1BE" stop-opacity=".85"/><stop offset=".6" stop-color="#FFF1BE" stop-opacity=".25"/><stop offset="1" stop-color="#FFF1BE" stop-opacity="0"/></linearGradient>
    <linearGradient id="${u}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="1"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs>`;
  s.push(`<rect y="${-T - 30}" width="${SW}" height="${SH + T + B + 40}" fill="url(#${u}k)"/>`);

  /* stelle: tante senza luna, poche con la luna piena alta */
  if (NIGHT) { const n = Math.round((60 + T / 3) * (cel ? 1 - MI * .6 : 1.25)); let st = '';
    for (let i = 0; i < n; i++) { const big = RN() < .1, x = 300 + RN() * 900, y = -T + RN() * (T + 200); if (cel && Math.hypot(x - cel.x, y - cel.y) < 40) continue;
      st += `<circle class="sc-twinkle" style="--td:${f2(2 + RN() * 3.4)}s;--tdl:${f2(RN() * 4)}s" cx="${f2(x)}" cy="${f2(y)}" r="${f2(big ? 1.2 + RN() * .8 : .45 + RN() * .8)}" fill="#E9ECF6" fill-opacity="${f2(.4 + RN() * .55)}"/>`; }
    s.push(lit(st, .3)); }
  /* nuvole (Brumale di giorno: cielo coperto) */
  const extraDefs = [], cgCache = {};
  const cgrad = (col) => { if (cgCache[col]) return cgCache[col]; const id = u + 'cg' + Object.keys(cgCache).length;
    extraDefs.push(`<radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity=".95"/><stop offset=".45" stop-color="${col}" stop-opacity=".78"/><stop offset=".75" stop-color="${col}" stop-opacity=".3"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`); return (cgCache[col] = id); };
  const softPuffs = (x, y, k, col, tall = 1, wide = 1) => { const RC = rng(Math.round(Math.abs(x) * 7 + Math.abs(y) * 13 + k * 100)), c = NIGHT ? mixHex(toneHex(col, NK + .05), sky[1], .25) : col, lt = cgrad(c), dk = cgrad(shade(c, NIGHT ? .1 : .16)); let o = '';
    for (let i = 0; i < 7; i++) { const t = i / 6 - .5, r = (15 + RC() * 9) * k; o += `<ellipse cx="${f2(x + t * 96 * k * wide)}" cy="${f2(y + 5 * k + (RC() - .5) * 3 * k)}" rx="${f2(r * 1.7)}" ry="${f2(r * .7)}" fill="url(#${dk})"/>`; }
    for (let i = 0; i < 7; i++) { const t = (i / 6 - .5) * .85, r = (17 + RC() * 13) * k * (1 - Math.abs(t) * .7); o += `<circle cx="${f2(x + t * 86 * k * wide + (RC() - .5) * 8 * k)}" cy="${f2(y - r * .5 * tall - RC() * 5 * k * tall)}" r="${f2(r)}" fill="url(#${lt})"/>`; }
    if (tall > 1.3) for (let i = 0; i < 4; i++) { const r = (16 + RC() * 10) * k; o += `<circle cx="${f2(x + (RC() - .5) * 40 * k)}" cy="${f2(y - (30 + i * 16) * k * tall * .6)}" r="${f2(r)}" fill="url(#${lt})"/>`; }
    return o; };
  const cumulus = (x, by, w, h, col, n = 16) => { const RC = rng(Math.round(x * 3 + by * 7 + w)), c = NIGHT ? mixHex(toneHex(col, NK + .05), sky[1], .25) : col, gL = cgrad(c), gM = cgrad(shade(c, NIGHT ? .08 : .1)), gD = cgrad(shade(c, NIGHT ? .16 : .24)); let o = '';
    for (let i = 0; i < 6; i++) { const t = i / 5 - .5; o += `<ellipse cx="${f2(x + t * w * 1.3)}" cy="${f2(by - h * .05)}" rx="${f2(w * .42)}" ry="${f2(h * .1)}" fill="url(#${gD})"/>`; }
    const P = []; for (let i = 0; i < n; i++) { const uu = (RC() * 2 - 1) * .92, env = Math.sqrt(1 - uu * uu), r = w * (.2 + RC() * .12) * (.55 + .45 * env), cy = by - h * .12 - RC() * env * (h - r * .9); P.push([x + uu * w * .8, cy, r]); }
    P.sort((a, b) => b[1] - a[1]).forEach(([px, py, r]) => { const f = (by - py) / h; o += `<circle cx="${f2(px)}" cy="${f2(py)}" r="${f2(r)}" fill="url(#${f < .3 ? gD : f < .6 ? gM : gL})"/>`; });
    return o; };
  const cloud = (x, y, k, col, op) => `<g class="sc-drift" opacity="${f2(NIGHT ? op * .7 : op)}" style="--dd:${f2(50 + R() * 30)}s;--dx:${f2((R() < .5 ? -1 : 1) * (24 + R() * 24))}px">${softPuffs(x, y, k, col)}</g>`;
  const cloudOld = (x, y, k, col, op) => `<g class="sc-drift" opacity="${f2(NIGHT ? op * .45 : op)}" style="--dd:${f2(50 + R() * 30)}s;--dx:${f2((R() < .5 ? -1 : 1) * (24 + R() * 24))}px"><ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(44 * k)}" ry="${f2(10 * k)}" fill="${col}"/><ellipse cx="${f2(x - 16 * k)}" cy="${f2(y - 6 * k)}" rx="${f2(20 * k)}" ry="${f2(11 * k)}" fill="${col}"/><ellipse cx="${f2(x + 14 * k)}" cy="${f2(y - 9 * k)}" rx="${f2(25 * k)}" ry="${f2(14 * k)}" fill="${col}"/></g>`;
  const OVC = mi === 1 && (opts.prot || opts.wk !== 6), OVN = OVC && NIGHT;
  if (OVN) { s.push(`<defs><linearGradient id="${u}ovn" x1="0" y1="${-T - 30}" x2="0" y2="220" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2E364A" stop-opacity=".75"/><stop offset=".75" stop-color="#3A4256" stop-opacity=".3"/><stop offset="1" stop-color="#3A4256" stop-opacity="0"/></linearGradient></defs><rect x="-20" y="${-T - 30}" width="${SW + 40}" height="${T + 250}" fill="url(#${u}ovn)"/>`);
    const far = (x, y) => !cel || Math.hypot(x - cel.x, y - cel.y) > 95;
    add([[600, 30, 1.5], [780, -10, 1.7], [960, 40, 1.6], [1140, 0, 1.5], [860, 100, 1.1], [680, -70, 1.6], [1060, -80, 1.5], [740, 130, 1.2], [1160, 120, 1.3], [920, -120, 1.7], [1220, 60, 1.3], [520, 90, 1.2]].filter(([x, y]) => far(x, y)).map(([x, y, k], i) => cloud(x, y, k, ['#9AA3B6', '#8A93A8', '#A6AEC0'][i % 3], .9)).join('')
      + (cel ? `<ellipse cx="${f2(cel.x)}" cy="${f2(cel.y + 40)}" rx="140" ry="16" fill="url(#${cgrad('#B6BED0')})" opacity=".55"/>` : ''), .3); }
  if (DAYB || RAINW) { const sc2 = RAINW ? '#9AA2AE' : '#C9D0DA'; s.push(`<defs><linearGradient id="${u}ov" x1="0" y1="${-T - 30}" x2="0" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${sc2}" stop-opacity=".8"/><stop offset=".7" stop-color="${sc2}" stop-opacity=".35"/><stop offset="1" stop-color="${sc2}" stop-opacity="0"/></linearGradient></defs><rect x="-20" y="${-T - 30}" width="${SW + 40}" height="${T + 230}" fill="url(#${u}ov)"/>`); }
  if ((DAYB || RAINW) && !OVN) add([[620, 40, 1.4], [820, 10, 1.6], [1020, 52, 1.5], [1170, 18, 1.3], [900, 96, 1], [700, -40, 1.5], [1080, -70, 1.4], [760, 120, 1.2], [1140, 110, 1.3], [940, -100, 1.6]].map(([x, y, k], i) => cloud(x, y, k, RAINW ? ['#A9B1BC', '#9CA4B0', '#B4BBC5'][i % 3] : ['#D3DAE4', '#C9D1DC', '#DCE1E8'][i % 3], .92)).join(''), .3);
  else if (!OVN && (mi !== 6 || !NIGHT)) add([[700, 70 - T * .3, 1.1], [1080, 40 - T * .5, .8], [880, 130, .6]].map(([x, y, k]) => cloud(x, y, k, '#FFFFFF', mi === 5 || mi === 6 ? .5 : .62)).join(''), .4);

  /* il sole o la luna */
  if (cel) {
    const { x, y, r } = cel;
    if (cel.kind === 'sol') s.push(`<g class="sc-fade" style="--d:.2s"><g opacity="${DAYB ? .55 : RAINW ? .35 : 1}"><circle class="sc-glow" cx="${f2(x)}" cy="${f2(y)}" r="${r * 3.4}" fill="url(#${u}g)"/><circle cx="${f2(x)}" cy="${f2(y)}" r="${r}" fill="${low > .5 ? '#FBD9A0' : '#FFF6DE'}"/></g></g>`);
    else {
      const k = Math.cos(2 * Math.PI * MP), rx = f2(Math.abs(k) * r), wax = MP < .5, T0 = `${f2(x)} ${f2(y - r)}`, B0 = `${f2(x)} ${f2(y + r)}`;
      const litD = wax ? `M${T0}A${r} ${r} 0 0 1 ${B0}A${rx} ${r} 0 0 ${k > 0 ? 0 : 1} ${T0}Z` : `M${T0}A${r} ${r} 0 0 0 ${B0}A${rx} ${r} 0 0 ${k > 0 ? 1 : 0} ${T0}Z`;
      s.push(`<g data-lit="1" class="sc-fade" style="--d:.2s"><defs><clipPath id="${u}m"><path d="${litD}"/></clipPath></defs>`
        + `<circle class="sc-glow" cx="${f2(x)}" cy="${f2(y)}" r="${f2(r * (1.8 + MI * 2))}" fill="url(#${u}g)" opacity="${f2(Math.pow(MI, 1.4) * .7)}"/><circle cx="${f2(x)}" cy="${f2(y)}" r="${r}" fill="${mixHex(sky[0], '#C9D0E4', .16)}" fill-opacity=".8"/>`
        + `<path d="${litD}" fill="#F1F2F6"/><g clip-path="url(#${u}m)"><circle cx="${f2(x - r * .3)}" cy="${f2(y - r * .2)}" r="${f2(r * .17)}" fill="#000" fill-opacity=".07"/><circle cx="${f2(x + r * .28)}" cy="${f2(y + r * .3)}" r="${f2(r * .12)}" fill="#000" fill-opacity=".07"/><circle cx="${f2(x + r * .1)}" cy="${f2(y - r * .45)}" r="${f2(r * .08)}" fill="#000" fill-opacity=".06"/></g></g>`);
    }
  }
  /* ---- 2.9: il meteo del mese, in cielo (dietro i monti) ---- */
  const wkx = opts.prot ? 9 : (opts.wk ?? 0), RW = rng(seed + 99);
  if (mi === 3 && !NIGHT && (wkx === 1 || wkx === 4) && cel && cel.alt > .12) {   // Germinale: dopo l'acquazzone, l'arcobaleno dalla parte opposta al sole
    const cx = cel.x < 960 ? 1100 : 820, cy = HZ + 60, r0 = 210;
    s.push(`<g class="sc-fade" style="--d:1.4s"><g opacity=".32">${['#E25B4A', '#F0A04A', '#F2D45A', '#7DBE6A', '#5A9AD6', '#8A6ACB'].map((c, i) => `<path d="M${cx - (r0 - i * 5)} ${cy}A${r0 - i * 5} ${r0 - i * 5} 0 0 1 ${cx + (r0 - i * 5)} ${cy}" stroke="${c}" stroke-width="5.4" fill="none"/>`).join('')}</g></g>`); }
  if (mi === 5) {   // Messidoro: di giorno i cumuli alti sul mare; di notte i lampi di calore lontani, dentro le nuvole all'orizzonte
    const bank = wkx % 2 ? [[846, 206, 62, 66], [1124, 206, 74, 86]] : [[932, 206, 76, 80], [1162, 206, 40, 40]];
    if (NIGHT) s.push(lit(`<ellipse class="sc-flash" style="--fld:9s;--fll:-3s" cx="1010" cy="176" rx="130" ry="56" fill="url(#${u}g)"/><ellipse class="sc-flash" style="--fld:13s;--fll:-8s" cx="860" cy="186" rx="100" ry="44" fill="url(#${u}g)"/>`, .5));
    add(bank.map(([x, y, w, h]) => cumulus(x, y, w, h, NIGHT ? '#8A94B0' : '#FFFFFF', 18)).join(''), .3); }
  if (STORM && !NIGHT) { const cx = 870; s.push('<g transform="translate(348 86) scale(.6)">');   // il temporale lontano sul mare: la torre di nuvole con l'incudine, la cortina di pioggia sfumata che tocca l'acqua, il fulmine
    s.push(`<g class="sc-fade" style="--d:.6s"><defs><linearGradient id="${u}cur" x1="0" y1="150" x2="0" y2="214" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6E7888" stop-opacity=".7"/><stop offset="1" stop-color="#8A94A2" stop-opacity=".15"/></linearGradient><linearGradient id="${u}cb" x1="0" y1="20" x2="0" y2="160" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#D9DEE5"/><stop offset=".6" stop-color="#9AA3B0"/><stop offset="1" stop-color="#6E7888"/></linearGradient></defs>`
      + `<path d="M${cx - 60} 150L${cx - 78} 214H${cx + 96}L${cx + 76} 150Z" fill="url(#${u}cur)"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M${cx - 50 + i * 13} 152l-8 60" stroke="#6E7888" stroke-opacity=".18" stroke-width="5"/>`).join('')
      + `<path d="M${cx - 40} 100Q${cx - 130} 50 ${cx - 190} 46Q${cx - 60} 22 ${cx + 20} 26Q${cx + 130} 22 ${cx + 200} 44Q${cx + 120} 50 ${cx + 54} 100Z" fill="url(#${cgrad('#C3CAD4')})"/>`
      + [[-150, 44, 36], [-90, 34, 42], [-20, 28, 46], [50, 28, 44], [120, 34, 40], [170, 42, 30]].map(([dx, y, r]) => `<ellipse cx="${cx + dx}" cy="${y}" rx="${r * 1.5}" ry="${r * .5}" fill="url(#${cgrad('#C9D0D9')})"/>`).join('')
      + cumulus(cx + 6, 150, 96, 120, '#B0B8C4', 26) + `<ellipse cx="${cx + 6}" cy="148" rx="120" ry="12" fill="url(#${cgrad('#6E7888')})"/>` + '</g>'
      + `<g data-lit="1"><path class="sc-flash" style="--fld:7s;--fll:-2s" d="M${cx + 20} 152l-8 20l7 0l-12 26l18 -30l-8 0l8 -16z" fill="#FFF8D0"/><ellipse class="sc-flash" style="--fld:7s;--fll:-2s" cx="${cx + 10}" cy="110" rx="80" ry="50" fill="url(#${u}g)"/></g>`); s.push('</g>'); }
  if (mi === 6 && NIGHT) s.push(lit([[760, 30, 13, 3], [1100, -20, 17, 9], [920, -60, 21, 15]].map(([x, y, d, l]) => `<g class="sc-shoot" style="--sd2:${d}s;--sdl2:${l}s"><path d="M${x} ${y - T * .3}l-64 24" stroke="url(#${u}t)" stroke-width="1.6" stroke-linecap="round"/></g>`).join(''), 2));

  /* ---- strumenti per costruire il luogo ---- */
  const ridge = (keys, rough = 4, step = 30, base) => { const c = [];
    for (let i = 0; i < keys.length - 1; i++) { const [x0, y0] = keys[i], [x1, y1] = keys[i + 1], n = Math.max(1, Math.round((x1 - x0) / step));
      for (let k = 0; k < n; k++) { const t = k / n; c.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * smooth(t) + (k ? (R() - .5) * rough : 0)]); } }
    c.push(keys[keys.length - 1]); const pts = crSample(c); const by = base ?? BOT + 40; return { pts, y: (x) => interpY(pts, x), d: ptsD(pts) + `L${f2(pts[pts.length - 1][0])} ${f2(by)}L${f2(pts[0][0])} ${f2(by)}Z` }; };
  /* in Ianuario la neve si posa sui crinali: un orlo bianco sopra ogni piano */
  const fill = (rg, col, extra = '') => `<path d="${rg.d}" fill="${col}"${extra}/>` + (snowy ? `<path d="${ptsD(rg.pts)}" stroke="#FFFFFF" stroke-width="2.6" stroke-opacity=".85" fill="none" stroke-linecap="round"/>` : '');
  const snowCap = (rg, line, h = 22) => { const top = rg.pts.filter(([, y]) => y < line + 4); if (top.length < 2) return '';
    let d = ''; let run = [];
    const flush = () => { if (run.length > 2) d += ptsD(run) + run.slice().reverse().map(([x, y], i) => `L${f2(x)} ${f2(Math.min(y + h * (.6 + .4 * hsh(x, 3)), Math.max(y, line + (hsh(x, 7) - .5) * 14)))}`).join('') + 'Z'; run = []; };
    rg.pts.forEach((pt) => { if (pt[1] < line) run.push(pt); else flush(); }); flush();
    return d ? `<path d="${d}" fill="#FFFFFF" fill-opacity="${NIGHT ? f2(.45 + moonL * .47) : .92}"/>` : ''; };
  const mist = (y, h, op, dur = 26, dx = 40) => `<g class="sc-fog" opacity="${f2(op * (NIGHT ? .3 + moonL * .7 : 1))}" style="--fgd:${dur}s;--fgx:${dx}px"><rect x="-120" y="${f2(y)}" width="${SW + 240}" height="${f2(h)}" fill="url(#${u}f)"/></g>`;
  const shadowAt = (x, y, w) => cel ? `<ellipse cx="${f2(x + Ls(x) * w * .35 * (1.2 - cel.alt))}" cy="${f2(y + 1)}" rx="${f2(w * (1.1 - cel.alt * .4))}" ry="${f2(w * .13)}" fill="#141A22" fill-opacity="${NIGHT ? .22 : .16}"/>` : '';
  /* la vegetazione del mese, grande quanto è vicina (s) */
  const trunkC = mi === 2 ? '#4E3C2E' : '#5B4130';
  const AUT = p < .3 ? ['#9FAA3F', '#C9A43A', '#B7B04A', '#D8792E'] : p < .7 ? ['#D8792E', '#E3A33B', '#C9A43A', '#B84A26'] : ['#C2622C', '#B84A26', '#D8892E', '#8E3A1E'];
  const veg = (x, y, sc, d) => { const r = R(), L = Ls(x), dim = (c) => haze(c, d);
    switch (mi) {
      case 0: return r < .3 ? treeCypress(x, y, sc, dim('#3F5A34'), L) : treeRound(x, y, sc, dim(AUT[Math.floor(R() * 4)]), dim(trunkC), L);
      case 1: return r < .45 ? treeCypress(x, y, sc * 1.1, dim('#3E4652'), L) : bareTree(x, y, sc * .9, dim('#3A414C'), R);
      case 2: return treePine(x, y, sc, dim(R() < .5 ? '#2F5A63' : '#3F6F76'), true, L);
      case 3: return r < .55 ? treeBlossom(x, y, sc, [dim('#F4C9D8'), dim('#FFFFFF'), dim('#E89BB5')], dim(trunkC), R, p) : treeRound(x, y, sc, dim('#86B35E'), dim(trunkC), L);
      case 4: return r < .25 ? treeCypress(x, y, sc, dim('#3C6B3A'), L) : treeRound(x, y, sc, dim(R() < .5 ? '#5E9A48' : '#6FA853'), dim(trunkC), L);
      case 5: return r < .35 ? treeUmbrella(x, y, sc, dim('#4F7340'), dim(trunkC), L) : treeRound(x, y, sc, dim('#5F8040'), dim(trunkC), L);
      default: return r < .5 ? treeUmbrella(x, y, sc, dim('#4E7044'), dim(trunkC), L) : treeCypress(x, y, sc, dim('#3D5A3A'), L);
    } };
  const forest = (rg, a, b, n, sc, d, keep = () => true, dy = 2) => { let o = ''; for (let i = 0; i < n; i++) { const x = a + (b - a) * (i + .5) / n + (R() - .5) * (b - a) / n * .9; if (keep(x)) o += veg(x, rg.y(x) + dy, sc * (.8 + R() * .4), d); } return o; };
  const smallTrees = (rg, a, b, n, d, keep = () => true) => { let o = '', c = haze(shade(LD.near, .25), d); for (let i = 0; i < n; i++) { const x = a + R() * (b - a); if (!keep(x)) continue; const y = rg.y(x) + 1.5, k = .6 + R() * .6;
    o += mi === 2 ? `<path d="M${f2(x)} ${f2(y - 9 * k)}l${f2(3 * k)} ${f2(9 * k)}h${f2(-6 * k)}Z" fill="${c}"/>` : mi === 1 ? `<path d="M${f2(x)} ${f2(y)}v${f2(-8 * k)}" stroke="${c}" stroke-width="1.2"/>` : `<ellipse cx="${f2(x)}" cy="${f2(y - 3 * k)}" rx="${f2(3 * k)}" ry="${f2(3.6 * k)}" fill="${c}"/>`; } return o; };
  /* trama dei piani di mezzo: campi a toppe e siepi che seguono il terreno (danno la misura della distanza) */
  const FIELD = [['#B9873F', '#A0662E', '#C9A456', '#7E7A3A'], ['#7C8696', '#6E7888', '#8A92A0'], null, ['#9CC27A', '#E3D36A', '#7FAE5C'], ['#9CC27A', '#C9A6D6', '#E3D36A', '#7FAE5C'], ['#E6C25A', '#D8AE44', '#9DB55E'], ['#C9A46A', '#B38A52', '#9DAE6A']][mi];
  const patches = (rg, a, b, d, rows = 2, seg = 70) => { if (!FIELD) return ''; let o = '';
    for (let r = 0; r < rows; r++) { const o1 = 2 + r * 11 * (.4 + d), o2 = o1 + 10 * (.4 + d);
      for (let x = a; x < b;) { const w = seg * (.5 + R() * .8) * (.6 + d), x1 = Math.min(b, x + w), c = haze(FIELD[Math.floor(R() * FIELD.length)], d);
        let dd = ''; for (let xx = x; xx <= x1 + .1; xx += 8) dd += `${xx === x ? 'M' : 'L'}${f2(xx)} ${f2(rg.y(xx) + o1)}`; for (let xx = x1; xx >= x - .1; xx -= 8) dd += `L${f2(xx)} ${f2(rg.y(xx) + o2)}`;
        if (R() < .75) o += `<path d="${dd}Z" fill="${c}" fill-opacity=".5"/>`; x = x1 + 2; } }
    return o; };
  const hedge = (rg, a, b, off, d) => { let o = ''; const c = haze(shade(LD.near, .3), d); for (let x = a; x < b; x += 3.2 + R() * 2.4) { if (R() < .2) { x += 20; continue; } const r = (1.2 + R() * 1.2) * (.4 + d); o += `<circle cx="${f2(x)}" cy="${f2(rg.y(x) + off - r)}" r="${f2(r)}" fill="${c}"/>`; } return o; };
  /* il suolo del primo piano: erba, fiori, neve, foglie cadute */
  const groundDetail = (rg, a, b, n, sc, d) => { let o = ''; const gc = shade(landCol(d), .22);
    for (let i = 0; i < n; i++) { const x = a + (b - a) * (i + .5) / n + (R() - .5) * 14, y = rg.y(x) + 4 + R() * 14 * sc, k = sc * (.8 + R() * .5);
      if (mi === 2) { o += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(9 * k)}" ry="${f2(2 * k)}" fill="#CFDDE5" fill-opacity=".7"/>`; continue; }
      o += grassTuft(x, y, k, gc);
      if (mi === 0 && R() < .5) o += `<ellipse cx="${f2(x + 5)}" cy="${f2(y + 1)}" rx="${f2(3 * k)}" ry="${f2(1.5 * k)}" transform="rotate(${f2(R() * 180)} ${f2(x + 5)} ${f2(y + 1)})" fill="${AUT[i % 4]}"/>`;
      if ((mi === 3 && R() < .35) || (mi === 4 && R() < .7)) o += R() < .5 ? daisy(x + 4, y, k * .8) : poppy(x + 4, y, k * .8, '#D8453A');
      if (mi === 4 && R() < .3) o += lavender(x - 5, y, k * .8, '#8E5FA3');
      if (mi === 5 && R() < .6) o += wheat(x + 3, y, 30 * k, '#B98A34', '#C9A04A'); }
    return o; };
  /* l'acqua: dall'orizzonte (chiara, riflette il cielo) al fondo (scura); poi i riflessi e le increspature */
  const rgb = (c) => `rgb(${[1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).join(',')})`;
  const WTh = NIGHT ? [mixHex(sky[1], toneHex(LD.water[0], NK), .4), mi === 1 ? '#0A1120' : toneHex(shade(LD.water[1], .2), NK)] : [mixHex(sky[1], LD.water[0], .55), LD.water[1]];
  const WT = [rgb(WTh[0]), rgb(WTh[1]), rgb(mixHex(WTh[0], WTh[1], .6)), rgb(mixHex(WTh[0], WTh[1], .5))];
  let wN = 0, wId = u + 'w0';
  const water = (top, x0 = -20, x1 = SW + 20) => { wId = u + 'w' + (++wN); if (x1 - x0 > 280) waterTops.push([top, x0, x1]); return `<defs><linearGradient id="${wId}" x1="0" y1="${top}" x2="0" y2="${BOT}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${WT[0]}"/><stop offset=".45" stop-color="${WT[2]}"/><stop offset="1" stop-color="${WT[1]}"/></linearGradient>`
    + `<clipPath id="${wId}c"><rect x="${x0}" y="${f2(top)}" width="${x1 - x0}" height="${f2(BOT - top + 40)}"/></clipPath></defs><rect x="${x0}" y="${f2(top)}" width="${x1 - x0}" height="${f2(BOT - top + 40)}" fill="url(#${wId})"/>`; };
  const mirror = (inner, wl, op = .38) => `<g clip-path="url(#${wId}c)"><g transform="translate(0 ${f2(2 * wl)}) scale(1 -1)" opacity="${op}">${inner}</g></g>`;
  const ripplesOn = (top, x0, x1, n) => { let o = ''; for (let i = 0; i < n; i++) { const t = Math.pow(R(), .8), y = top + 4 + t * (BOT - top - 4), w = 6 + t * 46 * (.5 + R()), x = x0 + R() * (x1 - x0);
    o += `<path d="M${f2(x - w / 2)} ${f2(y)}h${f2(w)}" stroke="#FFFFFF" stroke-opacity="${f2(.12 + t * .16)}" stroke-width="${f2(.8 + t * 1.2)}" stroke-linecap="round"/>`; } return o; };
  /* la scia di luce della luna (o del sole basso) sull'acqua, fino al fondo */
  const glitter = (top, x0 = -20, x1 = SW + 20) => { if (!cel || cel.x < x0 || cel.x > x1) return '';
    const br = cel.kind === 'luna' ? .45 + MI * .55 : low * .9 + .2; let o = ''; const RG = rng(seed + 5);
    for (let i = 0; i < 34; i++) { const t = i / 33, y = top + 2 + Math.pow(t, 1.35) * (BOT - top), w = (5 + t * 44) * (.4 + RG() * .9) * (cel.kind === 'luna' ? 1 : 1.3), x = cel.x + (RG() - .5) * (8 + t * 46);
      o += `<rect class="sc-twinkle" style="--td:${f2(1.4 + RG() * 2.2)}s;--tdl:${f2(RG() * 2)}s" x="${f2(x - w / 2)}" y="${f2(y)}" width="${f2(w)}" height="${f2(1 + t * 1.8)}" rx="1" fill="${cel.kind === 'luna' ? '#EEF1F8' : '#FFF1C8'}" fill-opacity="${f2(br * (.85 - t * .35))}"/>`; }
    return lit(o, .9); };
  const frontWater = (x, wl, w, h = 14) => `<defs><linearGradient id="${u}fw${Math.round(x)}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${WT[3]}" stop-opacity="0"/><stop offset=".2" stop-color="${WT[3]}" stop-opacity=".88"/><stop offset=".8" stop-color="${WT[3]}" stop-opacity=".88"/><stop offset="1" stop-color="${WT[3]}" stop-opacity="0"/></linearGradient></defs>`
    + `<rect x="${f2(x - w / 2)}" y="${f2(wl + .4)}" width="${f2(w)}" height="${h}" fill="url(#${u}fw${Math.round(x)})"/><path d="M${f2(x - w * .38)} ${f2(wl + .6)}H${f2(x + w * .38)}" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="1"/>`;
  const ripRings = (x, y, n, w) => { let r = ''; for (let i = 0; i < n; i++) r += `<ellipse class="sc-ripple" style="--rpd:${f2(3 + i * .6)}s;--rpl:${f2(-i * 1.1)}s" cx="${f2(x + (i - n / 2) * 8)}" cy="${f2(y + 1)}" rx="${w}" ry="${f2(w * .16)}" fill="none" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="1"/>`; return r; };

  /* ---- i piani lontani: due catene velate (Ianuario: montagne innevate; Messidoro ed Estiario: il mare) ---- */
  const far1 = ridge(mi === 2 ? [[-20, 176], [300, 150], [520, 118], [660, 150], [780, 96], [880, 140], [990, 84], [1080, 132], [1160, 104], [1220, 126]]
    : mi === 1 ? [[-20, 184], [400, 170], [620, 156], [760, 142], [860, 160], [980, 138], [1100, 158], [1220, 148]]
    : [[-20, 188], [380, 176], [620, 168], [760, 150], [880, 172], [1000, 154], [1110, 170], [1220, 160]], mi === 2 ? 10 : 6);
  const far2 = ridge(mi === 2 ? [[-20, 214], [500, 200], [700, 186], [820, 158], [930, 192], [1040, 170], [1140, 196], [1220, 184]]
    : [[-20, 212], [500, 202], [720, 196], [860, 206], [1000, 194], [1120, 204], [1220, 198]], 5);
  const backdrop = (seaY) => {
    if (LD.sea) { const y0 = seaY || 214; add(fill(ridge([[-20, y0 - 2], [300, y0 - 16], [520, y0 - 6], [640, y0 + 1]], 4, 30, y0 + 1), haze(LD.far, .05)) + fill(ridge([[1060, y0 + 1], [1150, y0 - 10], [1220, y0 - 6]], 4, 30, y0 + 1), haze(LD.far, .1)), .1);
      s.push(water(y0)); add(ripplesOn(y0, 300, 1200, 44)); s.push(glitter(y0)); return; }
    add(fill(far1, haze(LD.far, 0)) + (mi === 2 ? snowCap(far1, 150, 30) : ''), .1);
    if (moonL > .05) addLit(`<path d="${ptsD(far1.pts)}" stroke="#D3DBF0" stroke-opacity="${f2(moonL * .45)}" stroke-width="1.2" fill="none"/>`, .2);
    if (mi === 1) add(mist(160, 44, DAYB ? .75 : .28, 30, 50), .2);
    add(fill(far2, landCol(.16)) + (mi === 2 ? snowCap(far2, 196, 16) : '') + smallTrees(far2, 300, 1200, mi === 2 ? 40 : 30, .16), .2);
  };

  const snowy = mi === 2, roofC = mi === 2 ? '#5E6F7A' : mi === 4 ? '#7E5A8E' : mi === 1 ? '#6A4A44' : '#A9502F';
  const hr = (hour % 24 + 24) % 24;
  const wk = opts.wk ?? 0;

  /* ================= MESE: il protagonista ================= */
  if (opts.prot) switch (mi) {
    case 0: { // Foliaio · Osservare: dal poggio tra le vigne il cannocchiale guarda lontano (di notte una costellazione, di giorno il borgo sul colle)
      backdrop();
      const far3 = ridge([[-20, 226], [600, 218], [800, 214], [900, 206], [980, 214], [1220, 224]], 4);
      add(fill(far3, landCol(.32)) + forest(far3, 600, 1200, 16, .3, .32), .25);
      { const bx = 905, by = far3.y(905); add(cottage(bx - 14, by + 2, .42, haze('#EBD8BC', .3), haze('#A9502F', .3), Ls(bx)) + cottage(bx + 6, by, .46, haze('#E4CDAA', .3), haze('#9A4A2E', .3), Ls(bx)) + `<rect x="${bx - 3}" y="${f2(by - 24)}" width="6" height="22" fill="${haze('#D9C3A0', .3)}"/><path d="M${bx - 4.5} ${f2(by - 24)}l4.5 -6l4.5 6z" fill="${haze('#9A4A2E', .3)}"/>`, .3);
        addLit(win(bx - 1.2, by - 19, 2.4, 3, 1) + win(bx + 3, by - 6, 2.4, 2.4, 2)); }
      const vin = ridge([[-20, 262], [500, 250], [760, 244], [960, 236], [1100, 238], [1220, 230]], 3);
      let rows = ''; for (let k = 0; k < 9; k++) { const t = k / 8, y0 = (x) => vin.y(x) + 6 + Math.pow(t, 1.6) * 90; let d = ''; for (let x = 640; x <= 1080; x += 8) d += `${x === 640 ? 'M' : 'L'}${x} ${f2(y0(x) + (x - 640) * .04 * t)}`;
        rows += `<path d="${d}" fill="none" stroke="${haze(mixHex('#5E7A34', '#8E3A1E', p), .5 + t * .5)}" stroke-width="${f2(1.2 + t * 4)}" stroke-linecap="round" stroke-dasharray="${f2(.5 + t)} ${f2(3 + t * 6)}"/>`; }
      add(fill(vin, landCol(.6)) + rows + forest(vin, 640, 900, 4, .62, .6), .3);
      const hill = ridge([[880, BOT], [960, 330], [1040, 296], [1110, 286], [1160, 288], [1220, 300]], 2);
      const X = 1112, y = hill.y(X), A = NIGHT ? -22 : -9;
      const tube = `<g transform="translate(0 -100) rotate(${A})"><rect x="-30" y="-17" width="36" height="6" rx="2.5" fill="${BRASS_D}"/><path d="M-80 -9.5L44 -6.5L44 6.5L-80 9.5Z" fill="${BRASS}"/><path d="M-80 -6.5L44 -4.4L44 -2.2L-80 -3.2Z" fill="${BRASS_L}" fill-opacity=".8"/>`
        + `<rect x="-98" y="-11.5" width="20" height="23" rx="2.5" fill="${BRASS_D}"/><rect x="-40" y="-10" width="5" height="20" fill="${BRASS_D}"/><rect x="16" y="-7.4" width="4" height="14.8" fill="${BRASS_D}"/>`
        + `<rect x="44" y="-3.8" width="16" height="7.6" fill="#3A2E24"/><rect x="58" y="-5.5" width="6" height="11" rx="1.5" fill="#3A2E24"/><ellipse cx="-98" cy="0" rx="3" ry="10.5" fill="#CDE6EE"/></g>`;
      const legs = `<path d="M0 -94L-30 0M0 -94L30 0M0 -94L6 6" stroke="${WOOD_D}" stroke-width="4.6" stroke-linecap="round" fill="none"/><path d="M-15 -47L15 -47" stroke="${WOOD}" stroke-width="2.2" stroke-linecap="round"/><rect x="-8" y="-104" width="16" height="12" rx="2" fill="#4A3A2E"/>`;
      add(fill(hill, LD.front) + groundDetail(hill, 940, 1210, 14, 1.1, 1) + shadowAt(X, y, 40) + at(X, y, 1.05, legs + tube) + `<path d="M${X + 46} ${f2(y + 2)}l14 -3l4 8l-16 2z" fill="#E9DFC6"/><path d="M${X + 48} ${f2(y + 1)}l12 -2" stroke="#8C6E4A" stroke-width=".8"/>`, .45);
      if (NIGHT) { const st = [[760, 40], [800, 18], [846, 30], [884, 4], [930, 22]].map(([a, b]) => [a, b - T * .35]);
        addLit(`<path d="${ptsD(st)}" stroke="#E9ECF6" stroke-opacity=".3" stroke-width="1" fill="none" stroke-dasharray="3 4"/>` + st.map(([x, yy], i) => `<g transform="translate(${f2(x)} ${f2(yy)})"><path class="sc-twinkle" style="--td:${f2(2.2 + i * .4)}s" d="M0 -5L1.2 -1.2L5 0L1.2 1.2L0 5L-1.2 1.2L-5 0L-1.2 -1.2Z" fill="#FFF3D0"/></g>`).join(''), 1.4); }
      const fr = ridge([[-20, BOT - 30], [600, BOT - 40], [900, BOT - 30], [1000, BOT + 10]], 3);
      add(fill(fr, shade(LD.front, .2)) + groundDetail(fr, 620, 980, 16, 1.4, 1), .55);
      break;
    }
    case 1: { // Brumale · Remare osservativo: il lago scuro arriva fino in fondo, la luna si specchia; la barca rema verso la lanterna in fondo al pontile
      backdrop();
      const sh = ridge([[-20, 224], [500, 218], [760, 222], [900, 214], [1040, 220], [1220, 214]], 3), WL = 228;
      const shore = fill(sh, landCol(.35)) + forest(sh, 500, 1200, 22, .34, .35, () => true, 3);
      const hx = 870, hy = sh.y(hx) + 3, house = cottage(hx, hy, .6, haze('#8A8F99', .35), haze('#5A4440', .35), Ls(hx));
      add(shore + house, .25);
      addLit(win(hx - 6, hy - 6.5, 3, 3, .3) + win(hx + 3, hy - 6.5, 3, 3, 1.8));
      s.push(water(WL)); add(mirror(shore + house, WL, .4)); addLit(mirror(win(hx - 6, hy - 6.5, 3, 3) + win(hx + 3, hy - 6.5, 3, 3), WL, .55));
      add(`<path d="M-20 ${WL}H${SW + 20}" stroke="#FFFFFF" stroke-opacity=".2" stroke-width="1"/>` + ripplesOn(WL, 300, 1200, 40));
      s.push(glitter(WL));
      add(mist(WL - 16, 26, DAYB ? .7 : .3, 24, 60), .4);
      /* il pontile: dalla riva a destra viene verso di noi, le assi più grandi in avanti */
      const J0 = [1230, 262], J1 = [1052, 318], post = (t) => { const x = J0[0] + (J1[0] - J0[0]) * t, y = J0[1] + (J1[1] - J0[1]) * t, w = 3 + t * 4, h = 14 + t * 26; return [x, y, w, h]; };
      let jet = '', jr = '';
      for (let i = 0; i <= 6; i++) { const [x, y, w, h] = post(i / 6); jet += `<rect x="${f2(x - w / 2)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${shade(WOOD_D, .2)}"/>`; jr += `<rect x="${f2(x - w / 2)}" y="${f2(y + h - 2)}" width="${f2(w)}" height="${f2(h * .9)}" fill="${WOOD_D}" opacity=".5"/>`; }
      const deck = `<path d="M${J0[0]} ${J0[1] - 4}L${J1[0]} ${J1[1] - 8}L${J1[0] - 4} ${J1[1] + 2}L${J0[0]} ${J0[1] + 2}Z" fill="${WOOD}"/><path d="M${J0[0]} ${J0[1] + 2}L${J1[0] - 4} ${J1[1] + 2}" stroke="${WOOD_D}" stroke-width="3"/>`
        + Array.from({ length: 14 }, (_, i) => { const t = i / 13, x = J0[0] + (J1[0] - J0[0]) * t, y = J0[1] + (J1[1] - J0[1]) * t; return `<path d="M${f2(x)} ${f2(y - 4 - t * 4)}l${f2(-2 - t * 2)} ${f2(6 + t * 4)}" stroke="${WOOD_D}" stroke-opacity=".5" stroke-width="${f2(.6 + t * .6)}"/>`; }).join('');
      const lx = J1[0] + 8, ly = J1[1] - 8;
      const lamp = `<path d="M${lx} ${ly}V${ly - 92}h-20" stroke="${WOOD_D}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${lx} ${ly - 76}l-12 -14" stroke="${WOOD_D}" stroke-width="2"/><path d="M${lx - 20} ${ly - 92}v8" stroke="#3A3A3A" stroke-width="1.4"/>`
        + `<g transform="translate(${lx - 20} ${ly - 66}) scale(1.6)"><path d="M-6 -10L6 -10L3.5 -13.5L-3.5 -13.5Z" fill="#3A3A3A"/><rect x="-5" y="-10" width="10" height="12" rx="1.2" fill="#3A3A3A"/><rect x="-3.4" y="-8.4" width="6.8" height="8.6" fill="#F6C76E"/><path d="M-6 2H6" stroke="#3A3A3A" stroke-width="1.8"/></g>`;
      add(mirror(jr, J1[1], .5) + jet + deck + lamp, .45);
      addLit(glow(lx - 20, ly - 74, 70) + `<g opacity=".7">${Array.from({ length: 7 }, (_, i) => `<rect class="sc-twinkle" style="--td:${f2(2 + i * .3)}s" x="${f2(lx - 30 + (i % 2) * 6)}" y="${f2(J1[1] + 14 + i * 9)}" width="${f2(14 + i * 3)}" height="1.6" rx=".8" fill="#F6C76E"/>`).join('')}</g>`, 1.6);
      /* la barca arriva remando verso la lanterna (prua a destra) */
      const bx = 968, by = 300, k = 1.05, boat = at(bx, by, k, `<g transform="scale(-1 1)">${rowBoat2(false, STY[1].boat)}</g>`);
      add(mirror(boat, by, .35) + boat + frontWater(bx, by, 130 * k, 16) + ripRings(bx + 30, by, 3, 26) + `<path d="M${f2(bx - 60)} ${by + 3}l-30 2M${f2(bx - 56)} ${by + 7}l-22 4" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="1.2"/>`, .5);
      /* le canne in primo piano, a sinistra, che incorniciano */
      let rd = ''; for (let i = 0; i < 16; i++) { const x = 1150 + i * 5 + R() * 4, y = BOT - 6 - R() * 10; rd += reed(x, y, 1.6 + R() * .6, shade(LD.front, .2)); }
      add(rd, .6);
      break;
    }
    case 2: { // Ianuario · Navigare: il passo innevato, le orme che salgono al segnavia e proseguono lontano; di notte la stella polare
      backdrop();
      const mid = ridge([[-20, 240], [500, 232], [760, 226], [900, 236], [1040, 228], [1220, 238]], 4);
      add(fill(mid, '#E9F0F3') + `<path d="${ptsD(mid.pts)}" stroke="#C5D6DF" stroke-width="2" fill="none"/>` + forest(mid, 560, 1200, 18, .34, .3), .25);
      const pass = ridge([[-20, 300], [600, 286], [860, 276], [1000, 270], [1100, 272], [1220, 280]], 2);
      const X = 1080, y = pass.y(X) + 4;
      let sp = `<rect x="-4" y="-150" width="8" height="152" fill="${WOOD_D}"/>`;
      const board = (yy, dir, len) => { const a = dir < 0 ? -6 : 6, e = a + dir * len, t = e + dir * 10;
        return `<path d="M${a} ${yy - 9}L${e} ${yy - 9}L${t} ${yy}L${e} ${yy + 9}L${a} ${yy + 9}Z" fill="${WOOD}"/><path d="M${a + dir * 6} ${yy - 2}h${dir * (len - 14)}M${a + dir * 6} ${yy + 3}h${dir * (len - 24)}" stroke="${WOOD_D}" stroke-opacity=".55" stroke-width="1.6"/>`
          + `<path d="M${a - dir} ${yy - 9}L${e} ${yy - 9}L${t - dir * 3} ${yy - 4}" stroke="#FFFFFF" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; };
      sp += board(-118, -1, 50) + board(-92, 1, 46) + board(-66, -1, 36);
      sp += `<circle cx="0" cy="-160" r="17" fill="#EFE7D2" stroke="${WOOD_D}" stroke-width="3"/><path d="M0 -174L3.5 -160L0 -146L-3.5 -160Z" fill="#B23A2E"/><path d="M0 -146L3.5 -160L-3.5 -160Z" fill="#2F5A63"/><path d="M-14 -160L0 -157L14 -160L0 -163Z" fill="#8A7B60"/><circle cx="0" cy="-160" r="2" fill="${WOOD_D}"/><path d="M-15 -168Q0 -186 15 -168Q0 -176 -15 -168Z" fill="#FFFFFF"/>`;
      let prints = ''; for (let i = 0; i < 16; i++) { const t = i / 15, x = 880 + t * (X - 40 - 880) + (i % 2 ? 4 : -4) * (1 - t * .5), yy = BOT - 20 - t * (BOT - 20 - y - 4), k = 1.6 - t * 1.1;
        prints += `<ellipse cx="${f2(x)}" cy="${f2(yy)}" rx="${f2(3.2 * k)}" ry="${f2(1.4 * k)}" fill="#B9CCD8"/>`; }
      for (let i = 0; i < 10; i++) { const t = i / 9, x = X + 30 + t * 110, yy = y - 2 - t * 26; prints += `<ellipse cx="${f2(x)}" cy="${f2(yy)}" rx="${f2(2 * (1 - t * .6))}" ry="${f2(.9 * (1 - t * .6))}" fill="#B9CCD8"/>`; }
      add(fill(pass, '#F4F8FA') + `<path d="${ptsD(pass.pts)}" stroke="#D2E0E8" stroke-width="2.4" fill="none"/>` + forest(pass, 760, 1000, 4, .8, .75) + prints + shadowAt(X, y, 36) + at(X, y, 1.04, `<ellipse cx="0" cy="2" rx="34" ry="6" fill="#FFFFFF"/>${sp}`) + forest(pass, 1150, 1220, 2, 1.1, .9), .4);
      if (NIGHT) addLit(`<g transform="translate(${X - 4} ${-T + 40})"><circle class="sc-glow" r="30" fill="url(#${u}g)"/><path class="sc-twinkle" style="--td:3.6s" d="M0 -14L2.4 -2.4L14 0L2.4 2.4L0 14L-2.4 2.4L-14 0L-2.4 -2.4Z" fill="#FFFFFF"/><circle r="2.2" fill="#FFFFFF"/></g>`, 1.2);
      add(Array.from({ length: Math.round(30 - p * 18) }, () => `<circle class="sc-fall2" style="--fd:${f2(8 + R() * 6)}s;--fdl:${f2(-R() * 12)}s;--fx:${f2((R() - .5) * 30)}px" cx="${f2(700 + R() * 520)}" cy="${f2(-T + R() * 60)}" r="${f2(1 + R() * 1.6)}" fill="#FFFFFF"/>`).join(''), .8);
      break;
    }
    case 3: { // Germinale · Remare orientato: la nave degli antichi greci voga verso il tempio sul promontorio
      backdrop();
      const head = ridge([[-20, 216], [600, 210], [760, 200], [830, 196], [880, 214], [920, 229]], 3, 30, 229);
      add(fill(head, landCol(.3)) + forest(head, 560, 860, 10, .3, .3), .25);
      const tx = 800, ty = head.y(tx) + 1; let temple = `<rect x="${tx - 22}" y="${f2(ty - 3)}" width="44" height="3" fill="${haze('#EFE6D2', .3)}"/>`;
      for (let i = 0; i < 6; i++) temple += `<rect x="${tx - 19 + i * 7.4}" y="${f2(ty - 20)}" width="2.6" height="17" fill="${haze('#F2EADA', .3)}"/>`;
      temple += `<rect x="${tx - 22}" y="${f2(ty - 23)}" width="44" height="3" fill="${haze('#EFE6D2', .3)}"/><path d="M${tx - 23} ${f2(ty - 23)}L${tx} ${f2(ty - 31)}L${tx + 23} ${f2(ty - 23)}Z" fill="${haze('#E8DEC8', .3)}"/>`;
      add(temple, .3);
      const WL = 228; s.push(water(WL)); add(mirror(fill(head, landCol(.3)) + temple, WL, .35) + ripplesOn(WL, 300, 1200, 40)); s.push(glitter(WL));
      const nr = ridge([[1080, BOT], [1120, 300], [1170, 276], [1220, 268]], 2);
      add(fill(nr, LD.front) + forest(nr, 1130, 1215, 3, 1.25, 1, () => true, 6), .5);
      const bx = 1000, by = 292, k = 1.05, ship = at(bx, by, k, greekShip());
      add(mirror(ship, by, .3) + `<g class="sc-bob2">${ship}</g>` + frontWater(bx, by, 220 * k, 22) + ripRings(bx - 20, by + 2, 4, 40) + `<path d="M${bx + 92} ${by + 4}q24 2 50 -1M${bx + 96} ${by + 9}q30 2 56 -2" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="1.4" fill="none" stroke-linecap="round"/>`, .45);
      add(Array.from({ length: 7 }, (_, i) => `<ellipse class="sc-fall2" style="--fd:${f2(7 + R() * 4)}s;--fdl:${f2(-R() * 10)}s;--fx:${f2(-40 - R() * 40)}px" cx="${f2(1120 + R() * 90)}" cy="${f2(200 + R() * 50)}" rx="3" ry="1.8" fill="${['#F4C9D8', '#FFFFFF', '#E89BB5'][i % 3]}"/>`).join(''), 1);
      break;
    }
    case 4: { // Floreale · Automatizzare: il mulino a vento sul colle, i campi in fiore a file che vengono verso di noi
      backdrop();
      const mid = ridge([[-20, 232], [600, 226], [860, 220], [1000, 214], [1220, 224]], 3);
      add(fill(mid, landCol(.32)) + forest(mid, 560, 1200, 14, .3, .32), .25);
      const hill = ridge([[-20, 268], [700, 258], [940, 246], [1080, 236], [1160, 240], [1220, 248]], 2);
      const X = 1090, y = hill.y(X) + 4;
      const colsF = ['#D8453A', '#F4ECDD', '#8E5FA3', '#E3A33B', '#D8453A'];
      let fields = ''; for (let k = 0; k < 5; k++) { const y0 = (x) => hill.y(x) + 8 + Math.pow(k / 4, 1.5) * 80, y1 = (x) => hill.y(x) + 8 + Math.pow((k + .6) / 4, 1.5) * 80;
        let d = ''; for (let x = 600; x <= 1220; x += 20) d += `${x === 600 ? 'M' : 'L'}${x} ${f2(y0(x))}`; for (let x = 1220; x >= 600; x -= 20) d += `L${x} ${f2(y1(x))}`;
        fields += `<path d="${d}Z" fill="${haze(colsF[k], .45 + k * .14)}" fill-opacity=".85"/>`; }
      let blades = ''; for (let k = 0; k < 4; k++) blades += `<g transform="rotate(${k * 90 + 20})"><path d="M0 0L0 -82" stroke="${WOOD_D}" stroke-width="3.2" stroke-linecap="round"/><path d="M-8 -16L8 -16L9 -80L-9 -80Z" fill="#F4ECDD" stroke="${WOOD_D}" stroke-width="1.3" stroke-linejoin="round"/><path d="M-8.3 -32H8.4M-8.6 -48H8.6M-8.8 -64H8.8" stroke="${WOOD_D}" stroke-width="1" stroke-opacity=".6"/></g>`;
      const L = Ls(X), tower = `<path d="M-32 0L-19 -140L19 -140L32 0Z" fill="#EFE6D6"/><path d="M0 0L0 -140L${19 * L} -140L${32 * L} 0Z" fill="#000" fill-opacity=".1"/><path d="M-26 -140Q0 -182 26 -140Z" fill="#A9502F"/><rect x="-8" y="-26" width="16" height="26" rx="8" fill="${WOOD_D}"/><rect x="-6" y="-92" width="11" height="13" rx="1" fill="#5B6573"/><rect x="-5" y="-56" width="9" height="11" rx="1" fill="#5B6573"/>`;
      add(fill(hill, landCol(.7)) + fields + shadowAt(X, y, 40) + at(X, y, 1.06, tower) + at(X, y, 1.06, `<g transform="translate(0 -148)"><g class="sc-rot" style="--rtd:12s">${blades}<circle r="84" fill="none"/></g><circle r="7" fill="${WOOD_D}"/><circle r="2.6" fill="#C9A04A"/></g>`), .35);
      addLit(win(X - 6.4, y - 97.5, 11.6, 13.8, .5));
      const fr = ridge([[-20, BOT - 34], [700, BOT - 44], [980, BOT - 40], [1220, BOT - 50]], 3);
      add(fill(fr, LD.front) + groundDetail(fr, 640, 1220, 24, 1.5, 1), .5);
      if (!NIGHT) add([[880, 170, '#F2A23A', '#F2C230'], [1010, 220, '#8E5FA3', '#B58AC8']].map(([x, yy, a, b]) => butterfly(x, yy, a, b, R)).join(''), 1.4);
      break;
    }
    case 5: { // Messidoro · Remare automatizzato: il battello a ruota lungo la costa del grano, il fumo va indietro
      const SY = 214; backdrop(SY);
      const coast = ridge([[-20, 226], [520, 220], [760, 216], [880, 222], [940, 233]], 3, 30, 233);
      const cst = fill(coast, landCol(.4)) + forest(coast, 560, 900, 8, .34, .4) + `<path d="M760 ${f2(coast.y(760) + 4)}h120" stroke="${haze('#E6BE55', .4)}" stroke-width="5"/>`;
      add(cst, .2); add(mirror(cst, 232, .3));
      const x = 1040, y = 284, k = 1.02, boat = at(x, y, k, paddleSteamer(u));
      let puffs = ''; for (let i = 0; i < 5; i++) puffs += `<g transform="translate(${f2(x + 13 * k + (i % 2) * 4)} ${f2(y - 90 * k)})"><g class="sc-puff2" style="--pfd:6s;--pfl:${f2(-i * 1.2)}s"><circle r="${5 + (i % 2) * 2}" fill="#FFFFFF" fill-opacity=".8"/></g></g>`;
      add(mirror(boat, y, .3) + puffs + `<g class="sc-bob2">${boat}</g>` + frontWater(x, y, 210 * k, 18) + `<path d="M${f2(x + 92 * k)} ${y + 4}q24 2 48 -1M${f2(x + 96 * k)} ${y + 9}q28 2 54 -2" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="1.4" fill="none" stroke-linecap="round"/>`, .4);
      if (NIGHT) addLit(Array.from({ length: 12 }, (_, i) => PW(-58 + i * 9) || PW(-53 + i * 9) ? '' : `<path d="M${f2(x + (-58 + i * 9) * k)} ${f2(y - 22 * k)}v${f2(-6 * k)}q${f2(2.5 * k)} ${f2(-3 * k)} ${f2(5 * k)} 0v${f2(6 * k)}z" fill="#F6C76E"/>`).join('') + glow(x, y - 26 * k, 60, .7), 1.4);
      if (!NIGHT) add([[820, 120, .9], [890, 90, .7], [1150, 70, 1]].map(([gx, gy, gk]) => gull(gx, gy, gk, '#3B3012', R)).join(''), 1);
      const fr = ridge([[1110, BOT], [1150, 330], [1190, 316], [1220, 312]], 2);
      add(fill(fr, LD.front) + groundDetail(fr, 1140, 1220, 8, 1.6, 1), .5);
      break;
    }
    default: { // Estiario · Validare: sulla scogliera al tramonto il forziere trovato, la bandiera piantata, la mappa; in fondo il faro
      const SY = 220; backdrop(SY);
      const hd = ridge([[620, 233], [700, 214], [780, 206], [840, 214], [880, 233]], 3, 30, 233);
      add(fill(hd, landCol(.3)) + `<path d="M772 ${f2(hd.y(772))}L775 ${f2(hd.y(772) - 30)}H783L786 ${f2(hd.y(786))}Z" fill="${haze('#FFFFFF', .3)}"/><path d="M774 ${f2(hd.y(772) - 20)}h11" stroke="${haze('#C0392B', .3)}" stroke-width="3"/><rect x="773" y="${f2(hd.y(772) - 36)}" width="12" height="6" fill="${haze('#3A2E14', .3)}"/>`, .2);
      if (NIGHT) addLit(`<rect class="sc-beam" x="775.5" y="${f2(hd.y(772) - 35)}" width="7" height="4" fill="#FFF1BE"/><path class="sc-cone2" d="M779 ${f2(hd.y(772) - 33)}L1110 ${f2(hd.y(772) - 58)}L1110 ${f2(hd.y(772) - 12)}Z" fill="url(#${u}b2)" opacity=".34"/>` + glow(779, hd.y(772) - 33, 18) + mirror(glow(779, hd.y(772) - 33, 12), 233, .6), 1.3);
      add(mirror(fill(hd, landCol(.3)), 232, .3));
      waves(SY);
      const cliff = ridge([[930, BOT], [960, 300], [1000, 262], [1060, 246], [1140, 240], [1220, 244]], 2);
      const x = 1110, y = cliff.y(x) + 2;
      let coins = ''; [[-14, -30], [-6, -33], [3, -31], [11, -33], [17, -29], [-9, -27], [8, -27]].forEach(([cx, cy]) => { coins += `<circle cx="${cx}" cy="${cy}" r="5" fill="#F2C230" stroke="#C68A2E" stroke-width="1"/>`; });
      const chest = `<path d="M-26 -27L26 -27L22 -54L-22 -56Z" fill="${WOOD_D}"/><path d="M-22 -56L22 -54" stroke="${BRASS}" stroke-width="3"/>${coins}<rect x="-27" y="-28" width="54" height="28" rx="3" fill="${WOOD}"/>`
        + `<path d="M-27 -16H27" stroke="${WOOD_D}" stroke-width="1.4"/><rect x="-20" y="-28" width="6" height="28" fill="${BRASS}"/><rect x="14" y="-28" width="6" height="28" fill="${BRASS}"/><rect x="-5" y="-22" width="10" height="11" rx="2" fill="${BRASS_L}"/><circle cx="0" cy="-17" r="1.8" fill="${WOOD_D}"/>`;
      const flag = `<path d="M-40 4V-80" stroke="#3A2E14" stroke-width="2.4" stroke-linecap="round"/><path class="sc-flagw" d="M-39 -80Q-24 -84 -10 -77Q-24 -70 -39 -66Z" fill="#C0392B"/>`;
      const map = `<path d="M34 0L60 -4L64 4L38 7Z" fill="#EBDDBB"/><path d="M40 2l6 -1l5 1l6 -1" stroke="#A8452E" stroke-width="1" stroke-dasharray="1.6 1.4" fill="none"/><path d="M51 -1l3 3m0 -3l-3 3" stroke="#A8452E" stroke-width="1.2"/>`;
      let prints = ''; for (let i = 0; i < 9; i++) { const t = i / 8; prints += `<ellipse cx="${f2(990 + t * 80 + (i % 2) * 5)}" cy="${f2(BOT - 30 - t * (BOT - 30 - y) )}" rx="${f2(3 - t * 1.6)}" ry="${f2(1.3 - t * .6)}" fill="${shade(LD.near, .25)}" fill-opacity=".5"/>`; }
      add(fill(cliff, LD.near) + `<path d="M1000 300Q1060 280 1120 276M1010 330Q1080 316 1160 312" stroke="${LD.front}" stroke-opacity=".5" stroke-width="2" fill="none"/>` + prints + shadowAt(x, y, 34) + at(x, y, 1.05, flag + chest + map), .35);
      addLit(at(x, y, 1.05, glow(0, -34, NIGHT ? 38 : 24) + [[-10, -44], [12, -46], [0, -52]].map(([sx, sy], i) => `<g transform="translate(${sx} ${sy})"><path class="sc-twinkle" style="--td:${f2(1.6 + i * .5)}s" d="M0 -6L1.4 -1.4L6 0L1.4 1.4L0 6L-1.4 1.4L-6 0L-1.4 -1.4Z" fill="#FFF6D0"/></g>`).join('')), 1.5);
      add(groundDetail(cliff, 1000, 1220, 10, 1.4, 1), .5);
      if (!NIGHT) add(gull(900, 120, .9, '#3A2E14', R) + gull(980, 90, .7, '#3A2E14', R), 1);
    }
  }
  /* ================= SETTIMANA e GIORNO: il soggetto della settimana ================= */
  else switch (wk) {
    case 0: { // Osservare: la vedetta del luogo sul crinale (in Estiario la torretta del bagnino sulla duna); sotto, la valle col fiume; il sentiero sale fin lassù
      backdrop();
      const vL = ridge([[-20, 222], [500, 214], [760, 218], [860, 226], [940, 244], [990, 268]], 3);
      const vF = ridge([[-20, 250], [700, 246], [900, 252], [1000, 250], [1220, 246]], 2);
      let rv = ''; { const C = crSample([[904, 207], [898, 216], [912, 226], [894, 238], [922, 254]], 2), W = (i) => .8 + Math.pow(i / (C.length - 1), 1.6) * 11;
        rv = `<path d="${ptsD(C.map(([x, y], i) => [x - W(i), y]))}${C.slice().reverse().map(([x, y], j) => `L${f2(x + W(C.length - 1 - j))} ${f2(y)}`).join('')}Z" fill="${mixHex(WTh[0], '#FFFFFF', .25)}" fill-opacity=".9"/>`; }
      if (!LD.sea) add(fill(vF, landCol(.48)) + patches(vF, 300, 1200, .48, 3) + rv + hedge(vF, 300, 1200, 24, .48) + smallTrees(vF, 700, 1200, 26, .48), .2);
      add(fill(vL, landCol(.36)) + patches(vL, 300, 940, .36, 2) + forest(vL, 560, 960, 10, .32, .36), .25);
      const dune = mi === 6, rg = ridge(dune ? [[860, BOT], [900, 344], [980, 306], [1060, 282], [1110, 276], [1160, 280], [1220, 290]] : [[860, BOT], [900, 340], [980, 300], [1060, 268], [1110, 262], [1160, 270], [1220, 284]], 2);
      const X = 1100, y = rg.y(X) + 3, L = Ls(X), T0 = watchtower(mi, L), K = mi === 5 ? 1.12 : 1.16;
      const path = `<path d="${ptsD(crSample([[900, BOT], [940, 352], [1010, 330], [960, 316], [1030, 298], [1080, 286], [X - 18, y]], 4))}" stroke="${LD.path}" stroke-opacity=".75" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="1 5"/>`;
      let dg = ''; if (dune) for (let i = 0; i < 18; i++) { const x = 900 + R() * 320, yy = rg.y(x) + 3 + R() * 30; dg += `<path d="M${f2(x)} ${f2(yy)}q-3 -10 -8 -14M${f2(x)} ${f2(yy)}q1 -12 4 -18M${f2(x)} ${f2(yy)}q4 -8 9 -10" stroke="#A9A05A" stroke-width="1.4" fill="none" stroke-linecap="round"/>`; }
      if (T0.lamp2 && STY[mi].tower === 'palafitta') { // Brumale: la palafitta sta nello stagno: i pali entrano nell'acqua scura, canne tutt'intorno, si specchia
        const WLm = 318, bank = ridge([[860, BOT], [890, 340], [950, 316], [1000, 312]], 2, 30, BOT + 40);
        add(fill(ridge([[930, 318], [1000, 300], [1080, 296], [1160, 300], [1240, 296]], 3, 30, WLm + 2), landCol(.7)) + forest(ridge([[930, 318], [1240, 300]], 0), 1170, 1230, 2, .8, .7, () => true, 2), .3);
        s.push(water(WLm, 900, 1240));
        const hut = at(X, WLm, K, T0.svg);
        let rd = ''; for (let i2 = 0; i2 < 30; i2++) { const x = 930 + R() * 300, yy = WLm + 4 + R() * 30; if (Math.abs(x - X) < 30 && yy < WLm + 20) continue; rd += reed(x, yy, .7 + (yy - WLm) / 40, shade(LD.front, .1)); }
        add(mirror(hut, WLm, .35) + ripplesOn(WLm, 920, 1220, 14) + hut + frontWater(X, WLm, 90, 40) + rd + fill(bank, landCol(.85)) + groundDetail(bank, 870, 990, 8, 1.2, .9), .35);
        if (NIGHT || DAYB) addLit(mirror(at(X, WLm, K, glow(T0.lamp[0], T0.lamp[1], 20)), WLm, .5), 1.6);
      } else add(fill(rg, dune ? '#E9CF98' : landCol(.82)) + (dune ? `<path d="M940 330Q1040 300 1140 306M960 360Q1060 340 1180 344" stroke="#D9B97E" stroke-width="2" fill="none"/>` + dg + `<path d="M1150 ${f2(rg.y(1150) + 4)}l40 -2" stroke="#7A5A3A" stroke-width="2"/>` : path + forest(rg, 1150, 1220, 2, .9, .85) + groundDetail(rg, 930, 1220, 16, 1, .9)) + shadowAt(X, y, 30) + at(X, y, K, T0.svg), .35);
      const yL = STY[mi].tower === 'palafitta' ? 318 : y;
      if (T0.lamp && (NIGHT || DAYB)) addLit(at(X, yL, K, `<rect x="${T0.lamp[0] - 4}" y="${T0.lamp[1] - 4}" width="8" height="8" rx="1.5" fill="#F6C76E"/>` + glow(T0.lamp[0], T0.lamp[1], 28)), 1.6);
      if (T0.lamp2) addLit(at(X, yL, K, `<rect x="${T0.lamp2[0] - 2}" y="${T0.lamp2[1] - 3}" width="4" height="5" fill="#F6C76E"/>` + glow(T0.lamp2[0], T0.lamp2[1], 22, NIGHT ? 1 : .6)), 1.7);
      const fr = ridge([[-20, BOT - 22], [700, BOT - 30], [900, BOT - 26], [960, BOT + 10]], 3);
      add(fill(fr, dune ? '#D9B97E' : shade(LD.front, .1)) + groundDetail(fr, 650, 940, 14, 1.5, 1), .5);
      break;
    }
    case 1: case 3: { // Remare: il lago (o il mare) fino in fondo. Osservativo: la barca a remi del luogo verso la casa illuminata. Orientato: la barca a vela verso il faro (in Ianuario l'iceboat sul lago gelato)
      const sea = !!LD.sea, WL = sea ? 214 : 230, ice = mi === 2 && wk === 3;
      backdrop(WL);
      const sh = sea ? ridge([[640, WL + 1], [700, WL - 8], [780, WL - 14], [860, WL - 6], [920, WL + 1]], 3, 30, WL + 1) : ridge([[-20, 224], [500, 220], [760, 224], [880, 216], [1000, 222], [1220, 216]], 3);
      let shore = fill(sh, landCol(.34)) + (sea ? '' : forest(sh, 500, 1200, 20, .32, .34, (x) => Math.abs(x - 860) > 22, 3));
      let lights = '', lightsM = null;
      if (wk === 1) { const hx = sea ? 760 : 860, hy = sh.y(hx) + 3; shore += cottage(hx, hy, .62, haze(mi === 2 ? '#8A5A3C' : mi === 5 || mi === 6 ? '#F4F1EA' : '#E6D6BC', .35), haze(STY[mi].roof, .35), Ls(hx), true, snowy);
        shore += `<path d="M${hx + 14} ${f2(hy + 1)}h26" stroke="${haze(WOOD, .4)}" stroke-width="2"/>`; lights = win(hx - 6.5, hy - 6.5, 3.2, 3.2, .4) + win(hx + 3, hy - 6.5, 3.2, 3.2, 1.9); }
      else { const fx = sea ? 784 : 880, fy = sh.y(fx) + 1;
        shore += `<path d="M${fx - 5} ${f2(fy)}L${fx - 3.4} ${f2(fy - 34)}H${fx + 3.4}L${fx + 5} ${f2(fy)}Z" fill="${haze('#FFFFFF', .3)}"/><path d="M${fx - 4.4} ${f2(fy - 12)}h8.8M${fx - 4} ${f2(fy - 24)}h8" stroke="${haze('#B23A2E', .3)}" stroke-width="3.4"/><rect x="${fx - 4}" y="${f2(fy - 41)}" width="8" height="7" fill="${haze('#3A2E24', .3)}"/><path d="M${fx - 5} ${f2(fy - 41)}l5 -5l5 5z" fill="${haze('#B23A2E', .3)}"/>`;
        if (NIGHT || DAYB) lightsM = lit(glow(fx, fy - 37.4, 16), 1.3);
        lights = NIGHT || DAYB ? lit(`<rect class="sc-beam" x="${fx - 2.6}" y="${f2(fy - 39.4)}" width="5.2" height="4" fill="#FFF1BE"/>` + glow(fx, fy - 37.4, 22) + `<path class="sc-cone2" d="M${fx} ${f2(fy - 37.4)}L${fx + 300} ${f2(fy - 60)}L${fx + 300} ${f2(fy - 16)}Z" fill="url(#${u}b2)" opacity=".32"/>`, 1.3) : ''; }
      add(shore, .25); if (lights) s.push(lights);
      if (!sea) s.push(water(WL));
      if (ice) { let cr = ''; for (let i = 0; i < 9; i++) { let x = 300 + R() * 900, y = WL + 8 + Math.pow(R(), .7) * (BOT - WL), d = `M${f2(x)} ${f2(y)}`; for (let k = 0; k < 4; k++) { x += 10 + R() * 30; y += (R() - .5) * 8; d += `L${f2(x)} ${f2(y)}`; } cr += `<path d="${d}" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="1" fill="none"/>`; }
        add(`<defs><linearGradient id="${u}ice" x1="0" y1="${WL}" x2="0" y2="${BOT}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E6EFF4"/><stop offset="1" stop-color="#B9CFDB"/></linearGradient></defs><rect x="-20" y="${WL}" width="${SW + 40}" height="${BOT - WL + 40}" fill="url(#${u}ice)" opacity=".9"/>` + cr
          + Array.from({ length: 10 }, () => { const x = 300 + R() * 900, y = WL + 10 + Math.pow(R(), .6) * (BOT - WL - 20), w = 14 + R() * 50; return `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(w * .09)}" fill="#FFFFFF" fill-opacity=".9"/>`; }).join(''), .3); }
      add(mirror(shore, WL, ice ? .12 : .38)); if (lights && !ice) s.push(mirror(lightsM || lights, WL, .5));
      if (!sea && !ice) { add(ripplesOn(WL, 300, 1200, 44)); s.push(glitter(WL)); }
      if (mi === 1) add(mist(WL - 16, 26, DAYB ? .7 : .3, 24, 60), .4);
      if (snowy && !ice) add(`<path d="M-20 ${WL + 1}H1220" stroke="#FFFFFF" stroke-width="2.4" stroke-opacity=".8"/>` + Array.from({ length: 8 }, () => { const x = 300 + R() * 900, y = WL + 6 + R() * 50, w = 10 + R() * 30; return `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(w * .1)}" fill="#E8F1F5" fill-opacity=".85"/>`; }).join(''), .4);
      if (wk === 1) { /* la barca del mese: barchino, lucia, barca tra i ghiacci, canoa, sandolo tra le ninfee, gozzo con la lampara, pattino del bagnino */
        const bx = 1060, by = 300, k = 1.32, kind = mi === 3 ? 'canoa' : mi === 4 ? 'sandolo' : mi === 6 ? 'pattino' : 'remi';
        const boat = at(bx, by, k, kind === 'canoa' ? canoe() : kind === 'sandolo' ? sandolo() : kind === 'pattino' ? pattino() : rowBoat2(mi !== 5, STY[mi].boat));
        let deco = '';
        if (mi === 4) for (let i2 = 0; i2 < 14; i2++) { const x = 760 + R() * 460, y = 300 + Math.pow(R(), .7) * (BOT - 300), w = 6 + (y - 290) * .12; if (Math.abs(x - bx) < 90 && Math.abs(y - by) < 20) continue; deco += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(w * .3)}" fill="#5E8A44"/><path d="M${f2(x)} ${f2(y)}l${f2(w * .6)} ${f2(-w * .1)}" stroke="#4A6E36" stroke-width="1"/>` + (i2 % 3 ? '' : `<circle cx="${f2(x - w * .3)}" cy="${f2(y - w * .15)}" r="${f2(w * .3)}" fill="#F4C9D8"/>`); }
        if (mi === 0) for (let i2 = 0; i2 < 16; i2++) { const x = 740 + R() * 480, y = 250 + Math.pow(R(), .7) * (BOT - 250), w = 2 + (y - 240) * .03; deco += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(w * .4)}" fill="${AUT[i2 % 4]}"/>`; }
        let iceFront = '';
        if (mi === 2) {   // il lago è gelato: la barca (prua rivestita di lamiera) avanza rompendo la lastra; dietro resta il canale d'acqua nera coi lastroni rotti
          const ice2 = `<defs><linearGradient id="${u}ic2" x1="0" y1="${WL}" x2="0" y2="${BOT}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E4EDF2"/><stop offset="1" stop-color="#C3D5DF"/></linearGradient><linearGradient id="${u}chw" x1="0" y1="${by - 10}" x2="0" y2="${BOT}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2E4656"/><stop offset="1" stop-color="#4A6676"/></linearGradient></defs>`;
          const ch = [[bx - 92, by + 1], [bx - 20, by + 2], [bx + 80, by + 6], [bx + 150, by + 26], [bx + 190, by + 70], [1250, BOT + 30]], cw = [3, 12, 14, 18, 30, 60];
          const L2 = ch.map(([x, y], i) => [x, y - cw[i] * .55]), R2 = ch.map(([x, y], i) => [x, y + cw[i]]);
          const chD = ptsD(crSample(L2, 5)) + crSample(R2, 5).reverse().map(([x, y]) => `L${f2(x)} ${f2(y)}`).join('') + 'Z';
          /* la superficie: lastra liscia con la neve portata dal vento in strisce, qualche crepa lunga */
          let dr = ''; for (let i2 = 0; i2 < 16; i2++) { const x = 300 + R() * 920, y = WL + 6 + Math.pow(R(), .6) * (BOT - WL - 10), w = 18 + (y - WL) * .5 + R() * 40; if (Math.abs(y - by) < 30 && x > bx - 120) continue; dr += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(w * .07)}" fill="url(#${cgrad('#FFFFFF')})"/>`; }
          let cr = ''; for (let i2 = 0; i2 < 7; i2++) { let x = 320 + R() * 600, y = WL + 12 + Math.pow(R(), .7) * (BOT - WL - 20), d = `M${f2(x)} ${f2(y)}`; for (let k2 = 0; k2 < 5; k2++) { x += 14 + R() * 30; y += (R() - .5) * 5; d += `L${f2(x)} ${f2(y)}`; } cr += `<path d="${d}" stroke="#9FB8C6" stroke-width=".8" fill="none" stroke-opacity=".7"/>`; }
          /* davanti alla prua le crepe a raggiera nella lastra ancora intera */
          for (let i2 = 0; i2 < 3; i2++) { let x = bx - 92, y = by + 1, d = `M${f2(x)} ${f2(y)}`, a2 = Math.PI + (i2 - 1) * .3; for (let k2 = 0; k2 < 3; k2++) { x += Math.cos(a2) * (8 + R() * 12); y += Math.sin(a2) * (2 + R() * 3) + (R() - .5) * 2; d += `L${f2(x)} ${f2(y)}`; } cr += `<path d="${d}" stroke="#9FB8C6" stroke-width=".7" fill="none"/>`; }
          /* il canale: il bordo lontano mostra lo spessore della lastra, quello vicino il labbro bianco; dentro i lastroni rotti che galleggiano */
          let fl = ''; for (let i2 = 0; i2 < 18; i2++) { const t = .15 + R() * .85, j = Math.min(ch.length - 2, Math.floor(t * (ch.length - 1))), q = t * (ch.length - 1) - j, x = ch[j][0] + (ch[j + 1][0] - ch[j][0]) * q, y = ch[j][1] + (ch[j + 1][1] - ch[j][1]) * q, w = cw[j] + (cw[j + 1] - cw[j]) * q, sz = 2.4 + w * .22 + R() * 3, yy = y + (R() - .3) * w * .6;
            if (Math.abs(x - bx) < 80 && Math.abs(yy - by) < 8) continue;
            fl += `<path d="M${f2(x - sz)} ${f2(yy)}l${f2(sz * .5)} ${f2(-sz * .26)}l${f2(sz * 1.1)} ${f2(-sz * .04)}l${f2(sz * .5)} ${f2(sz * .24)}l${f2(-sz * .6)} ${f2(sz * .16)}Z" fill="#F2F7FA"/><path d="M${f2(x - sz)} ${f2(yy)}l${f2(sz * 1.5)} ${f2(sz * .06)}l${f2(sz * .5)} ${f2(-sz * .06)}v${f2(sz * .16)}h${f2(-sz * 2)}Z" fill="#9DB9C8"/>`; }
          const edge = ptsD(crSample(L2, 5));
          add(ice2 + `<rect x="-20" y="${WL}" width="${SW + 40}" height="${BOT - WL + 40}" fill="url(#${u}ic2)"/>` + dr + cr + `<path d="${chD}" fill="url(#${u}chw)"/><path d="${edge}" stroke="#A9C3D1" stroke-width="2.2" fill="none" transform="translate(0 1.2)"/><path d="${edge}" stroke="#FFFFFF" stroke-width="1" fill="none"/>`
            + `<path d="${ptsD(crSample(R2, 5))}" stroke="#FFFFFF" stroke-width="1.8" fill="none"/>` + fl, .3);
          /* la lastra spezzata davanti allo scafo e i frammenti accavallati alla prua: tengono la barca dentro il ghiaccio */
          iceFront = `<path d="M${bx - 86} ${by + 1}L${bx + 76} ${by + 2.4}L${bx + 80} ${by + 15}L${bx - 80} ${by + 12}Z" fill="url(#${u}chw)"/><path d="M${bx - 60} ${by + 5}h30M${bx + 4} ${by + 7}h40" stroke="#7E98A8" stroke-width=".8"/>`
            + `<path d="M${bx - 96} ${by + 12}L${bx - 80} ${by + 11.4}L${bx + 82} ${by + 14.4}Q${bx + 96} ${by + 16} ${bx + 104} ${by + 24}V${by + 30}H${bx - 96}Z" fill="url(#${u}ic2)"/><path d="M${bx - 96} ${by + 12}L${bx - 80} ${by + 11.4}L${bx + 82} ${by + 14.4}Q${bx + 96} ${by + 16} ${bx + 104} ${by + 24}" stroke="#FFFFFF" stroke-width="1.8" fill="none"/><path d="M${bx - 80} ${by + 13.4}L${bx + 82} ${by + 16.4}" stroke="#A9C3D1" stroke-width="1.2"/>` + [[bx - 70, by + 3, 7], [bx - 48, by + 4.4, 5], [bx - 10, by + 5, 6], [bx + 30, by + 5.4, 5], [bx + 64, by + 6, 6], [bx - 84, by + .5, 6]].map(([x, y, sz]) => `<path d="M${x - sz} ${y}l${f2(sz * .6)} ${f2(-sz * .45)}l${f2(sz * 1)} ${f2(-sz * .1)}l${f2(sz * .6)} ${f2(sz * .5)}l${f2(-sz * .5)} ${f2(sz * .2)}Z" fill="#F4F9FC" stroke="#AFC6D3" stroke-width=".6"/>`).join('')
            + `<path d="M${bx - 96} ${by - 1}l6 -5l5 4l-3 3z" fill="#F4F9FC" stroke="#AFC6D3" stroke-width=".6"/><path d="M${bx - 86} ${by - 3}l7 -7l4 7z" fill="#E9F2F6" stroke="#AFC6D3" stroke-width=".6"/>`; }
        add(deco, .4);
        if (mi === 2) add(boat + `<path d="M${bx - 70} ${by + 1.6}H${bx + 74}" stroke="#2E4656" stroke-width="2.4" stroke-opacity=".7"/>` + iceFront, .45);
        else add(mirror(boat, by, .32) + boat + frontWater(bx, by, 150 * k, 18) + ripRings(bx - 30 * k, by + 1, 3, 24) + `<path d="M${f2(bx + 50 * k)} ${by + 3}l34 2M${f2(bx + 46 * k)} ${by + 7}l26 5" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.2"/>`, .45);
        if (kind === 'remi' && mi !== 5) addLit(glow(bx - 58 * k, by - 34 * k, NIGHT || DAYB ? 34 : 16) + (mi === 2 ? '' : mirror(glow(bx - 58 * k, by - 34 * k, 22), by, .6)), 1.6);
        if (mi === 5 && NIGHT) addLit(glow(bx + 49 * k, by - 47 * k, 70) + mirror(glow(bx + 49 * k, by - 47 * k, 50), by, .8) + Array.from({ length: 8 }, (_, i2) => `<rect class="sc-twinkle" style="--td:${f2(1.6 + i2 * .3)}s" x="${f2(bx + 49 * k - 14 - i2 * 3)}" y="${f2(by + 10 + i2 * 10)}" width="${f2(28 + i2 * 6)}" height="1.8" rx=".9" fill="#FFF1BE" fill-opacity=".7"/>`).join(''), 1.6); }
      else { const st = STY[mi].sail, bx = 1070, by = ice ? 300 : 296, k = 1.3, boat = at(bx, by, k, sailBoat2(st));
        if (ice) add(`<ellipse cx="${bx}" cy="${by + 2}" rx="${70 * k}" ry="5" fill="#5A6E7E" fill-opacity=".2"/>` + boat + `<path d="M${f2(bx + 50 * k)} ${by + 1}q40 -1 90 1M${f2(bx + 46 * k)} ${by + 4}q30 0 70 3" stroke="#FFFFFF" stroke-width="1.6" fill="none" stroke-linecap="round"/>`, .45);
        else add(mirror(boat, by, .3) + `<g class="sc-bob2">${boat}</g>` + frontWater(bx, by, 140 * k, 18) + `<path d="M${f2(bx + 50 * k)} ${by + 3}q30 2 58 -1M${f2(bx + 46 * k)} ${by + 8}q24 2 48 4" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="1.3" fill="none" stroke-linecap="round"/>`, .45);
        if (st.lamp) addLit(glow(bx - 1.9 * k, by - 112.5 * k, NIGHT || DAYB ? 26 : 10) + mirror(glow(bx - 1.9 * k, by - 112.5 * k, 16), by, .5), 1.6); }
      if (!sea) { let rd = ''; for (let i = 0; i < 12; i++) { const x = 1160 + i * 5.5 + R() * 4, y = BOT - 4 - R() * 10; rd += snowy ? `<path d="M${f2(x)} ${f2(y)}q3 -14 1 -26" stroke="#7A6A58" stroke-width="1.4" fill="none"/>` : reed(x, y, 1.4 + R() * .6, shade(LD.front, .15)); } add(rd, .6); }
      break;
    }
    case 2: { // Navigare: ogni mese si trova la rotta a modo suo
      const RN2 = rng(seed + 41);
      if (mi === 0 || mi > 6) { // Foliaio: la sfera armillare sul belvedere tra le vigne, sotto il pergolato; di notte l'asse indica la stella polare
        backdrop();
        const mid = ridge([[-20, 236], [600, 230], [860, 226], [1000, 232], [1220, 226]], 3);
        add(fill(mid, landCol(.4)) + patches(mid, 400, 1200, .4) + forest(mid, 560, 1200, 16, .3, .4) + `<ellipse cx="900" cy="${f2(mid.y(900) + 12)}" rx="80" ry="5" fill="${mixHex(WTh[0], '#FFFFFF', .15)}"/>`, .25);
        const plain = ridge([[-20, 262], [700, 258], [1000, 256], [1220, 260]], 2);
        let vines = ''; for (let k = 0; k < 7; k++) { const y0 = (x) => plain.y(x) + 4 + Math.pow(k / 6, 1.4) * 26; let d = ''; for (let x = 600; x <= 1200; x += 8) d += `${x === 600 ? 'M' : 'L'}${x} ${f2(y0(x))}`; vines += `<path d="${d}" stroke="${haze(mixHex('#5E7A34', '#8E3A1E', p), .55 + k * .05)}" stroke-width="${f2(1 + k * .4)}" stroke-dasharray="${f2(.6 + k * .2)} ${f2(3 + k)}" fill="none"/>`; }
        add(fill(plain, landCol(.6)) + vines, .3);
        const ty = 298, X = 1090, fy = ty + 34, stone = mixHex(LD.rock, '#D8D0C0', .45);
        let terr = `<defs><linearGradient id="${u}tf" x1="0" y1="${ty}" x2="0" y2="${BOT}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${shade(stone, .08)}"/><stop offset="1" stop-color="${light(stone, .12)}"/></linearGradient></defs><path d="M-20 ${ty}H1230V${BOT + 40}H-20Z" fill="url(#${u}tf)"/>`;
        for (let k = 1; k < 7; k++) { const y = ty + Math.pow(k / 6, 1.6) * (BOT - ty); terr += `<path d="M-20 ${f2(y)}H1230" stroke="${shade(stone, .2)}" stroke-opacity=".35" stroke-width="${f2(.6 + k * .2)}"/>`; }
        for (let k = -6; k <= 10; k++) { const x0 = 900 + k * 34; terr += `<path d="M${x0} ${ty}L${f2(900 + (x0 - 900) * 3.2)} ${BOT + 40}" stroke="${shade(stone, .2)}" stroke-opacity=".28" stroke-width="1"/>`; }
        let bal = `<path d="M-20 ${ty - 30}H1230" stroke="#D6CEBD" stroke-width="5"/><path d="M-20 ${ty - 3}H1230" stroke="#B9B0A0" stroke-width="4"/>`;
        for (let x = -14; x < 1230; x += 13) bal += `<path d="M${x} ${ty - 27}q-3.2 6 0 11.5q3.2 6 0 11.5" stroke="#C3BAA8" stroke-width="5.4" fill="none"/>`;
        let perg = ''; for (let x = 870; x < 1230; x += 40) { const xx = x + RN2() * 10; perg += `<path d="M${xx - 20} ${ty - 31}Q${xx} ${ty - 20} ${xx + 20} ${ty - 31}" stroke="#4E6A34" stroke-width="2.6" fill="none"/>` + [0, 1, 2].map((j) => `<path d="${mapleD(4 + RN2() * 2)}" transform="translate(${f2(xx - 12 + j * 12)} ${f2(ty - 26 + (j % 2) * 3)})" fill="${AUT[(j + x) % 4]}"/>`).join('') + [0, 1, 2, 3, 4].map((k2) => `<circle cx="${f2(xx - 2 + (k2 % 2) * 3)}" cy="${f2(ty - 22 + Math.floor(k2 / 2) * 3.4)}" r="2" fill="#5A2E5E"/>`).join(''); }
        perg += `<path d="M1183 ${fy + 26}l3 -20h20l3 20Z" fill="#B0643F"/><path d="M1185 ${fy + 8}h22" stroke="#8E4A2E" stroke-width="2"/>` + treeRound(1196, fy + 8, 1.05, '#7E8F5A', '#5B4130', Ls(1196));
        add(terr + bal + shadowAt(X, fy, 30) + at(X, fy, 1.4, armillary(false)) + perg, .35);
        if (NIGHT) { const S = 1.4, cx = X + ARM_AX[0] * 34 * S, cy = fy - 84 * S + ARM_AX[1] * 34 * S, py = -T + 40, t = (cy - py) / -ARM_AX[1], px = cx + ARM_AX[0] * t;
          addLit(`<path d="M${f2(cx)} ${f2(cy)}L${f2(px)} ${f2(py)}" stroke="#E9ECF6" stroke-opacity=".16" stroke-width="1" stroke-dasharray="2 6"/><g transform="translate(${f2(px)} ${f2(py)})"><circle class="sc-glow" r="26" fill="url(#${u}g)"/><path class="sc-twinkle" style="--td:3.6s" d="M0 -12L2 -2L12 0L2 2L0 12L-2 2L-12 0L-2 -2Z" fill="#FFFFFF"/><circle r="2" fill="#FFFFFF"/></g>`, 1.2); }
      } else if (mi === 1) { // Brumale: nella nebbia la rotta si trova a orecchio e a occhio: la boa con la campana che dondola, il fanale verde in fondo al molo
        backdrop();
        const WL = 234, sh = ridge([[-20, 222], [500, 218], [760, 222], [880, 214], [1000, 220], [1220, 214]], 3);
        const shore = fill(sh, landCol(.34)) + forest(sh, 500, 1200, 22, .34, .34, () => true, 3);
        add(shore, .25); s.push(water(WL)); add(mirror(shore, WL, .38) + ripplesOn(WL, 300, 1200, 40)); s.push(glitter(WL));
        add(mist(WL - 14, 26, DAYB ? .7 : .3, 24, 60), .4);
        /* il molo di pietra che viene verso di noi da destra, coi pali d'ormeggio */
        const P0 = [1240, 262], P1 = [1050, 300], th = (t) => 6 + t * 16;
        let molo = `<path d="M${P0[0]} ${P0[1] - 6}L${P1[0]} ${P1[1] - 10}L${P1[0]} ${P1[1] + th(1)}L${P0[0]} ${P0[1] + th(0)}Z" fill="#7D7A74"/><path d="M${P0[0]} ${P0[1] - 6}L${P1[0]} ${P1[1] - 10}L${P1[0] + 12} ${P1[1] - 16}L${P0[0]} ${P0[1] - 10}Z" fill="#A9A59C"/>`;
        for (let i = 0; i < 9; i++) { const t = i / 8, x = P0[0] + (P1[0] - P0[0]) * t, y = P0[1] + (P1[1] - P0[1]) * t; molo += `<path d="M${f2(x)} ${f2(y - 8 - t * 2)}v${f2(th(t) + 6)}" stroke="#5E5B56" stroke-opacity=".5" stroke-width="${f2(.6 + t)}"/>`; }
        molo += `<rect x="${P1[0] + 30}" y="${P1[1] - 26}" width="5" height="10" rx="2" fill="#3A3836"/><rect x="${P1[0] + 70}" y="${P1[1] - 33}" width="4" height="8" rx="2" fill="#3A3836"/>`;
        const lx = P1[0] + 10, ly = P1[1] - 14;
        molo += `<path d="M${lx - 8} ${ly}h16l-3 -40h-10z" fill="#3E6A4E"/><path d="M${lx - 8} ${ly - 14}h16M${lx - 7} ${ly - 28}h14" stroke="#2E4E3A" stroke-width="1.4"/><rect x="${lx - 6}" y="${ly - 54}" width="12" height="14" rx="2" fill="#2E3A34"/><path d="M${lx - 8} ${ly - 54}l8 -8l8 8z" fill="#2E3A34"/>`;
        add(mirror(molo, P1[1] + th(1), .4) + molo, .4);
        addLit(`<rect class="sc-beam" x="${lx - 4}" y="${ly - 52}" width="8" height="10" fill="#9FF0B8"/>` + `<circle cx="${lx}" cy="${ly - 47}" r="${NIGHT || DAYB ? 46 : 20}" fill="url(#${u}l)" opacity=".7"/>` + mirror(`<rect x="${lx - 4}" y="${ly - 52}" width="8" height="10" fill="#9FF0B8" opacity=".6"/>`, P1[1] + th(1), .6), 1.4);
        /* la boa a campana: galleggiante rosso, gabbia, campana che dondola col moto dell'acqua, luce rossa in cima */
        const bx = 950, by = 318, k = 1.25;
        const buoy = `<path d="M-20 0Q-22 -10 -14 -12H14Q22 -10 20 0Q18 10 0 12Q-18 10 -20 0Z" fill="#B23A2E"/><path d="M-14 -12H14" stroke="#F4F1EA" stroke-width="2"/><path d="M-12 -12L-6 -56M12 -12L6 -56M-9 -30H9M-7 -46H7" stroke="#3A3836" stroke-width="2"/>`
          + `<g><animateTransform attributeName="transform" type="rotate" values="-14 0 -52;14 0 -52;-14 0 -52" dur="3.4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><path d="M0 -52V-48" stroke="#3A3226" stroke-width="1"/><path d="M-6 -30Q-6 -48 0 -48Q6 -48 6 -30Z" fill="#B8863B"/><circle cx="0" cy="-29" r="1.6" fill="#7A5520"/></g>`
          + `<path d="M-7 -56H7L5 -62H-5Z" fill="#3A3836"/>`;
        const bb = at(bx, by, k, `<g class="sc-bob2">${buoy}</g>`);
        add(mirror(bb, by, .35) + bb + frontWater(bx, by, 70, 14) + ripRings(bx, by + 2, 3, 22), .45);
        addLit(`<rect class="sc-beam" x="${f2(bx - 3)}" y="${f2(by - 66 * k)}" width="6" height="5" fill="#FF7A6A"/>` + glow(bx, by - 64 * k, NIGHT || DAYB ? 30 : 12) + mirror(glow(bx, by - 64 * k, 16), by, .5), 1.5);
        /* la barchetta ormeggiata al molo */
        const mb = at(1150, 296, .8, `<path d="M-40 -6Q-30 2 -14 3H24Q34 2 38 -6Q36 4 26 8H-24Q-36 5 -40 -6Z" fill="#2A2622"/><path d="M-40 -6Q-30 2 -14 3H24Q34 2 38 -6" stroke="#C9C1B2" stroke-width="1.6" fill="none"/>`);
        add(mirror(mb, 296, .3) + mb + frontWater(1150, 296, 70, 10) + `<path d="M1180 293Q1186 286 1190 ${P0[1] + (P1[1] - P0[1]) * .3 - 10}" stroke="#C9B48A" stroke-width="1" fill="none"/>`, .5);
      } else if (mi === 2) { // Ianuario: in vetta la tavola d'orientamento di bronzo dice il nome di ogni cima; la linea di mira va al picco più alto; sotto, il rifugio acceso
        backdrop();
        const mid = ridge([[-20, 246], [600, 240], [820, 232], [960, 244], [1220, 236]], 4);
        const hx = 880, hy = mid.y(hx) + 4;
        add(fill(mid, '#E9F0F3') + forest(mid, 560, 1200, 16, .34, .32) + cottage(hx, hy, .7, haze('#7A5236', .4), haze('#4E5A64', .4), Ls(hx)) + `<path d="M${hx - 16} ${f2(hy - 11)}L${hx} ${f2(hy - 22)}L${hx + 16} ${f2(hy - 11)}L${hx} ${f2(hy - 18)}Z" fill="#FFFFFF"/>`, .25);
        addLit(win(hx - 7, hy - 7, 3.6, 3.6, .4) + win(hx + 3.4, hy - 7, 3.6, 3.6, 1.6));
        if (!NIGHT) add([0, 1, 2].map((j) => `<circle class="sc-puff2" style="--pfd:7s;--pfl:${f2(-j * 2.3)}s" cx="${hx + 7}" cy="${f2(hy - 26)}" r="${3 + j}" fill="#FFFFFF" fill-opacity=".6"/>`).join(''), .6);
        const top = ridge([[860, BOT], [900, 330], [980, 300], [1060, 288], [1140, 290], [1220, 300]], 2);
        const X = 1086, y = top.y(X) + 4, peak = [990, 84];
        let tav = `<path d="M-12 0L-10 -44H10L12 0Z" fill="#A39C8E"/><path d="M2 0L2 -44H10L12 0Z" fill="#000" fill-opacity=".12"/><path d="M-11 -14H11M-10.5 -30H10.5" stroke="#8C877C" stroke-width=".8"/>`
          + `<ellipse cx="0" cy="-48" rx="34" ry="10" fill="${BRASS_D}"/><ellipse cx="0" cy="-50" rx="33" ry="9.4" fill="${BRASS}"/><ellipse cx="0" cy="-50" rx="26" ry="7.2" fill="none" stroke="${BRASS_D}" stroke-width=".8"/>`;
        for (let j = 0; j < 16; j++) { const a = j * Math.PI / 8; tav += `<path d="M${f2(Math.cos(a) * 6)} ${f2(-50 + Math.sin(a) * 1.7)}L${f2(Math.cos(a) * (j % 2 ? 24 : 31))} ${f2(-50 + Math.sin(a) * (j % 2 ? 6.6 : 8.6))}" stroke="${BRASS_D}" stroke-width="${j % 4 ? .6 : 1.2}"/>`; }
        tav += `<path d="M-2 -50L-14 -56L0 -51Z" fill="#B23A2E"/><circle cx="0" cy="-50" r="2" fill="${BRASS_D}"/>` + [[-20, -55], [-8, -57.6], [10, -57], [22, -54]].map(([a, b]) => `<path d="M${a - 3} ${b}l3 -3l3 3z" fill="${BRASS_D}"/>`).join('')
          + `<path d="M-34 -49Q-18 -52 -2 -50M6 -50Q20 -52 33 -48" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
        let prints = ''; for (let i = 0; i < 12; i++) { const t = i / 11, xx = 900 + t * (X - 50 - 900) + (i % 2 ? 4 : -4), yy = BOT - 18 - t * (BOT - 18 - y); prints += `<ellipse cx="${f2(xx)}" cy="${f2(yy)}" rx="${f2(3 * (1.4 - t))}" ry="${f2(1.2 * (1.4 - t))}" fill="#B9CCD8"/>`; }
        const skis = `<path d="M${X + 48} ${f2(y + 2)}L${X + 40} ${f2(y - 62)}M${X + 56} ${f2(y + 2)}L${X + 52} ${f2(y - 62)}" stroke="#B23A2E" stroke-width="2.4" stroke-linecap="round"/><path d="M${X + 37} ${f2(y - 62)}q3 -4 5 -1M${X + 50} ${f2(y - 62)}q3 -4 5 -1" stroke="#B23A2E" stroke-width="2" fill="none"/><path d="M${X + 62} ${f2(y + 2)}L${X + 66} ${f2(y - 44)}" stroke="#3A3A3A" stroke-width="1.4"/><circle cx="${X + 63.4}" cy="${f2(y - 8)}" r="3" fill="none" stroke="#3A3A3A" stroke-width="1"/>`;
        add(fill(top, '#F4F8FA') + `<path d="${ptsD(top.pts)}" stroke="#D2E0E8" stroke-width="2.4" fill="none"/>` + prints + `<path d="M${X - 20} ${f2(y - 58 * 1.3)}L${peak[0]} ${peak[1]}" stroke="${NIGHT ? '#E9ECF6' : '#5C7290'}" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="3 5"/>`
          + shadowAt(X, y, 34) + at(X, y, 1.3, `<ellipse cx="0" cy="2" rx="30" ry="5" fill="#FFFFFF"/>${tav}`) + skis + forest(top, 1170, 1220, 2, 1.1, .9), .35);
        addLit(`<g transform="translate(${peak[0]} ${peak[1] - 8})"><path class="sc-twinkle" style="--td:3s" d="M0 -5L1.2 -1.2L5 0L1.2 1.2L0 5L-1.2 1.2L-5 0L-1.2 -1.2Z" fill="#FFF3D0"/></g>`, 1.6);
      } else if (mi === 3) { // Germinale: la banderuola in cima alla colombaia dice da dove viene il vento; in cielo le cicogne tornano a nord in formazione
        backdrop();
        const mid = ridge([[-20, 238], [600, 232], [860, 228], [1220, 234]], 3);
        add(fill(mid, landCol(.42)) + patches(mid, 300, 1200, .42, 3) + hedge(mid, 300, 1200, 24, .42) + forest(mid, 560, 1200, 18, .3, .42), .25);
        const hill = ridge([[780, BOT], [860, 322], [960, 290], [1060, 276], [1140, 274], [1220, 282]], 2);
        const X = 1100, y = hill.y(X) + 3, L = Ls(X);
        let orch = ''; for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) { const x = 880 + i * 34 + k * 14, yy = hill.y(x) + 12 + k * 16; if (Math.abs(x - X) < 60) continue; orch += treeBlossom(x, yy, .7 + k * .18, ['#F4C9D8', '#FFFFFF', '#E89BB5'], '#6B5040', R, p); }
        const W = '#EDE0C8';
        let dv = `<path d="M-40 0V-34H10V0Z" fill="${W}"/><path d="M-46 -32L-15 -54L16 -32Z" fill="#B5643A"/><rect x="-30" y="-24" width="8" height="10" fill="#4E6B4A"/><rect x="-14" y="-18" width="9" height="18" fill="${WOOD_D}"/>`
          + `<path d="M8 0V-96H40V0Z" fill="${W}"/><path d="M${L > 0 ? 26 : 8} 0V-96H${L > 0 ? 40 : 22}V0Z" fill="#000" fill-opacity=".12"/>`
          + `<path d="M6 -96H42L38 -100H10Z" fill="#C9B898"/>` + [0, 1, 2].map((r) => [0, 1, 2].map((c) => `<path d="M${14 + c * 9} ${-74 - r * 6}a2.4 2.4 0 0 1 4.8 0v2.6h-4.8z" fill="#3A3026"/>`).join('')).join('') + `<path d="M12 -64H36" stroke="#C9B898" stroke-width="2"/>`
          + `<path d="M4 -98L24 -118L44 -98Z" fill="#A9583A"/><path d="M24 -118L${24 + 20 * L} -98H24Z" fill="#000" fill-opacity=".15"/><path d="M24 -118V-150" stroke="#2E2A26" stroke-width="1.6"/>`
          + `<path d="M16 -130H32M24 -122V-138" stroke="#2E2A26" stroke-width="1"/><path d="M14 -132l-3 2l3 2zM34 -132l3 2l-3 2z" fill="#2E2A26"/>`
          + `<g transform="translate(24 0)"><g><animateTransform attributeName="transform" type="scale" values="1 1;.55 1;1 1;.8 1;1 1" dur="9s" repeatCount="indefinite"/><g transform="translate(-24 0)">`
          + `<path d="M24 -144H10l-4 -3h4zM24 -144H38" stroke="#2E2A26" stroke-width="1.6"/><path d="M28 -144q-1 -6 3 -8q2 -4 6 -2l-2 2q3 2 1 5q-3 4 -8 3z" fill="#2E2A26"/><path d="M33 -152l2 -3l1 3" fill="#B23A2E"/></g></g></g>`;
        for (let i = 0; i < 4; i++) dv += `<g transform="translate(${-30 + i * 9} -36)"><path d="M0 0q3 -4 6 0q-3 2 -6 0z" fill="#E6E2DC"/></g>`;
        add(fill(hill, landCol(.8)) + orch + shadowAt(X, y, 40) + at(X, y, 1.15, dv) + groundDetail(hill, 860, 1220, 14, 1.1, .9), .35);
        if (NIGHT || DAYB) addLit(at(X, y, 1.15, glow(-26, -19, 12)) + win(X - 30 * 1.15, y - 24 * 1.15, 8 * 1.15, 10 * 1.15), 1.6);
        /* le cicogne: nove in formazione a V, verso sinistra */
        let birds = ''; for (let i = 0; i < 9; i++) { const side = i % 2 ? 1 : -1, n = Math.ceil(i / 2), bx = 900 + n * 26, byy = 40 - T * .45 + side * n * 14;
          birds += `<g transform="translate(${bx} ${f2(byy)}) scale(${f2(1.3 - n * .06)})"><path class="sc-gull" style="animation-duration:${f2(1.6 + (i % 3) * .2)}s" d="M-14 0Q-7 -6 0 0Q7 -6 14 0" stroke="${NIGHT ? '#C9D0E0' : '#2E2A26'}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M0 0l-10 1M0 0l4 .6" stroke="${NIGHT ? '#C9D0E0' : '#2E2A26'}" stroke-width="1.2"/></g>`; }
        add(birds, 1);
      } else if (mi === 4) { // Floreale: il labirinto di siepi nel giardino in fiore; al centro il gazebo: per arrivarci bisogna scegliere la strada giusta
        backdrop();
        const mid = ridge([[-20, 238], [600, 232], [860, 228], [1220, 234]], 3);
        add(fill(mid, landCol(.42)) + patches(mid, 300, 1200, .42, 3) + forest(mid, 560, 1200, 16, .3, .42), .25);
        const gy = 268, cx = 1046, cy = 344, RX = [40, 76, 112, 148, 184], H = (r) => 6 + r * .05, ry = (r) => r * .3;
        const Gc = '#4E7E3E', Gd = '#36602E', Gl = '#6E9E52';
        let gnd = `<path d="M-20 ${gy}Q600 ${gy - 6} 1230 ${gy - 2}V${BOT + 40}H-20Z" fill="${landCol(.82)}"/><ellipse cx="${cx}" cy="${cy}" rx="200" ry="64" fill="${mixHex(LD.path, '#FFFFFF', .2)}"/>`;
        const gaps = RX.map((_, i) => [(1.3 + i * 1.7) % (2 * Math.PI), (4.1 + i * 2.3) % (2 * Math.PI)]);
        const arc = (r, a0, a1) => { const o = []; for (let a = a0; a <= a1 + 1e-6; a += .05) o.push([cx + r * Math.cos(a), cy + ry(r) * Math.sin(a)]); return o; };
        const inGap = (a, g) => g.some((x) => { const d = Math.abs(((a - x + 3 * Math.PI) % (2 * Math.PI)) - Math.PI); return d < .16; });
        const hedgeSeg = (r, a0, a1, i) => { let o = '', run = [];
          const flush = () => { if (run.length > 1) { const top = run.map(([x, y]) => [x, y - H(r)]); o += `<path d="${ptsD(top)}${run.slice().reverse().map(([x, y]) => `L${f2(x)} ${f2(y)}`).join('')}Z" fill="${Gd}"/><path d="${ptsD(top)}" stroke="${Gl}" stroke-width="${f2(3 + r * .02)}" fill="none" stroke-linecap="round"/>`; } run = []; };
          arc(r, a0, a1).forEach((pt, j) => { const a = a0 + j * .05; if (inGap(a, gaps[i])) flush(); else run.push(pt); }); flush(); return o; };
        let backH = '', frontH = '';
        RX.slice().reverse().forEach((r, k) => { backH += hedgeSeg(r, Math.PI, 2 * Math.PI, RX.length - 1 - k); });
        RX.forEach((r, i) => { frontH += hedgeSeg(r, 0, Math.PI, i); });
        const gz = at(cx, cy, 1, `<ellipse cx="0" cy="0" rx="22" ry="7" fill="#D8D0C0"/>` + [-16, -8, 0, 8, 16].map((x) => `<rect x="${x - 1.4}" y="-30" width="2.8" height="30" fill="#F4F1EA"/>`).join('') + `<path d="M-22 -30Q-20 -48 0 -54Q20 -48 22 -30Z" fill="#7E5A8E"/><path d="M0 -54L${22 * Ls(cx)} -30H0Z" fill="#000" fill-opacity=".14"/><path d="M-24 -30H24" stroke="#F4F1EA" stroke-width="2.4"/><path d="M0 -54V-62" stroke="#3A3226" stroke-width="1.4"/><circle cx="0" cy="-63" r="2" fill="${BRASS}"/>`);
        let flowers = ''; for (let i = 0; i < 46; i++) { const a = RN2() * Math.PI * 2, rr = 194 + RN2() * 20, x = cx + rr * Math.cos(a), y = cy + rr * .32 * Math.sin(a); flowers += `<circle cx="${f2(x)}" cy="${f2(y - 4)}" r="${f2(2 + RN2() * 1.6)}" fill="${['#D8453A', '#F4ECDD', '#8E5FA3', '#E3A33B', '#E89BB5'][i % 5]}"/>`; }
        add(gnd + backH + gz + frontH + flowers + `<path d="M${cx - 60} ${BOT + 10}Q${cx - 30} ${cy + 80} ${cx - 2} ${cy + ry(184) - 2}" stroke="${mixHex(LD.path, '#FFFFFF', .2)}" stroke-width="16" fill="none"/>` + groundDetail({ y: () => BOT - 40 }, 640, 900, 14, 1.4, 1), .35);
        if (NIGHT || DAYB) addLit(at(cx, cy, 1, glow(0, -20, 30, .8)), 1.6);
      } else if (mi === 5) { // Messidoro: si naviga davvero. Dal ponte della nave: il timone che corregge la rotta, la chiesuola con la bussola, la prua che punta alla costa del grano
        const SY = 214; backdrop(SY);
        const coast = ridge([[-20, 222], [520, 216], [760, 212], [880, 218], [960, 224]], 3, 30, 224);
        add(fill(coast, landCol(.4)) + patches(coast, 500, 950, .4, 2) + forest(coast, 560, 940, 6, .3, .4), .2);
        const VP = [905, 236], yb = 264;
        const xl = (y) => VP[0] - (y - VP[1]) * 1.15, xr = (y) => VP[0] + (y - VP[1]) * 1.15, D = '#8A5E3B', DL = '#A97A50';
        let deck = `<path d="M${f2(xl(yb))} ${yb}L${f2(xr(yb))} ${yb}L${f2(xr(BOT + 40))} ${BOT + 40}L${f2(xl(BOT + 40))} ${BOT + 40}Z" fill="${DL}"/>`;
        for (let k = -12; k <= 12; k++) { const x0 = VP[0] + k * 6; deck += `<path d="M${f2(VP[0] + (x0 - VP[0]) * ((yb - VP[1]) / 6))} ${yb}L${f2(VP[0] + (x0 - VP[0]) * ((BOT + 40 - VP[1]) / 6))} ${BOT + 40}" stroke="${D}" stroke-opacity=".5" stroke-width="1"/>`; }
        for (let k = 1; k < 8; k++) { const y = yb + Math.pow(k / 8, 1.8) * (BOT - yb); deck += `<path d="M${f2(xl(y))} ${f2(y)}H${f2(xr(y))}" stroke="${D}" stroke-opacity=".25" stroke-width="${f2(.5 + k * .2)}"/>`; }
        const wall = (side) => { const xs = side < 0 ? xl : xr, h = (y) => (y - VP[1]) * .32; let o = `<path d="M${f2(xs(yb))} ${yb}L${f2(xs(BOT + 40))} ${BOT + 40}L${f2(xs(BOT + 40))} ${f2(BOT + 40 - h(BOT + 40))}L${f2(xs(yb))} ${f2(yb - h(yb))}Z" fill="#6E4A30"/>`
          + `<path d="M${f2(xs(yb))} ${f2(yb - h(yb))}L${f2(xs(BOT + 40))} ${f2(BOT + 40 - h(BOT + 40))}" stroke="#C99A5E" stroke-width="${f2(4)}"/>`;
          for (let k = 0; k < 6; k++) { const y = yb + Math.pow(k / 6, 1.5) * (BOT - yb); o += `<path d="M${f2(xs(y))} ${f2(y)}V${f2(y - h(y))}" stroke="#4E3220" stroke-width="${f2(1 + k * .6)}"/>`; } return o; };
        const bow = `<path d="M${f2(xl(yb))} ${f2(yb - (yb - VP[1]) * .32)}L${VP[0]} ${VP[1] + 6}L${f2(xr(yb))} ${f2(yb - (yb - VP[1]) * .32)}" fill="none" stroke="#C99A5E" stroke-width="3"/><path d="M${VP[0]} ${VP[1] + 8}L${VP[0] - 26} ${VP[1] - 4}" stroke="#6E4A30" stroke-width="3" stroke-linecap="round"/>`;
        const mast = [VP[0] + 40, 120], ropes = `<path d="M${VP[0] - 26} ${VP[1] - 4}L${mast[0]} ${mast[1]}M${f2(xl(BOT - 40))} ${f2(BOT - 40 - (BOT - 40 - VP[1]) * .32)}L${mast[0]} ${mast[1]}M${f2(xr(BOT - 40))} ${f2(BOT - 40 - (BOT - 40 - VP[1]) * .32)}L${mast[0]} ${mast[1]}" stroke="#5A4632" stroke-width="1.2" stroke-opacity=".6"/>`
          + `<path d="M${mast[0]} ${BOT + 40}L${mast[0] - 3} ${mast[1] - 40}" stroke="#6E4A30" stroke-width="7"/>`;
        const WX = 1060, WY = BOT - 76, wr = 44;
        let wheel = `<path d="M${WX - 14} ${BOT + 10}L${WX - 8} ${WY + 8}H${WX + 8}L${WX + 14} ${BOT + 10}Z" fill="#5E3D25"/><g><animateTransform attributeName="transform" type="rotate" values="-8 ${WX} ${WY};9 ${WX} ${WY};-8 ${WX} ${WY}" dur="7s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
        for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4, c = Math.cos(a), sn = Math.sin(a); wheel += `<path d="M${WX} ${WY}L${f2(WX + c * (wr + 14))} ${f2(WY + sn * (wr + 14))}" stroke="#7A4E2E" stroke-width="5" stroke-linecap="round"/><circle cx="${f2(WX + c * (wr + 14))}" cy="${f2(WY + sn * (wr + 14))}" r="4" fill="#8A5E3B"/>`; }
        wheel += `<circle cx="${WX}" cy="${WY}" r="${wr}" fill="none" stroke="#8A5E3B" stroke-width="8"/><circle cx="${WX}" cy="${WY}" r="${wr - 6}" fill="none" stroke="#6E4A30" stroke-width="1.6"/><circle cx="${WX}" cy="${WY}" r="10" fill="${BRASS}"/><circle cx="${WX}" cy="${WY}" r="4" fill="${BRASS_D}"/></g>`;
        const BX = 960, BY = BOT - 24;
        const binn = `<path d="M${BX - 16} ${BY}L${BX - 12} ${BY - 50}H${BX + 12}L${BX + 16} ${BY}Z" fill="#7A4E2E"/><path d="M${BX - 22} ${BY - 50}Q${BX - 22} ${BY - 76} ${BX} ${BY - 78}Q${BX + 22} ${BY - 76} ${BX + 22} ${BY - 50}Z" fill="${BRASS}"/><path d="M${BX - 14} ${BY - 58}Q${BX} ${BY - 74} ${BX + 14} ${BY - 58}V${BY - 52}H${BX - 14}Z" fill="#CFE2E6" fill-opacity=".85"/>`
          + `<ellipse cx="${BX}" cy="${BY - 55}" rx="10" ry="3" fill="#F2ECDC"/><path d="M${BX - 7} ${BY - 55}L${BX + 7} ${BY - 55}" stroke="#B23A2E" stroke-width="1.4"/><circle cx="${BX - 28}" cy="${BY - 60}" r="7" fill="#2E4E7A"/><circle cx="${BX + 28}" cy="${BY - 60}" r="7" fill="#B23A2E"/><path d="M${BX - 22} ${BY - 60}H${BX - 21}M${BX + 21} ${BY - 60}H${BX + 22}" stroke="${BRASS_D}" stroke-width="2"/>`;
        add(deck + wall(-1) + wall(1) + bow + ropes + `<path d="M${f2(xl(BOT) + 60)} ${BOT - 4}q20 -14 44 -2q-20 10 -44 2z" fill="#B9A27A"/>` + binn + wheel, .35);
        if (NIGHT || DAYB) addLit(glow(BX, BY - 58, 40, .7) + `<rect x="${VP[0] - 30}" y="${VP[1] - 14}" width="6" height="6" rx="1" fill="#FF7A6A"/>` + glow(VP[0] - 27, VP[1] - 11, 14), 1.5);
      } else { // Estiario: l'osservatorio sulla scogliera: la cupola si apre, il telescopio punta il cielo d'agosto; si naviga con le stelle
        const SY = 220; backdrop(SY);
        const hd = ridge([[620, 233], [700, 214], [780, 206], [840, 214], [880, 233]], 3, 30, 233);
        add(fill(hd, landCol(.3)) + `<path d="M772 ${f2(hd.y(772))}L775 ${f2(hd.y(772) - 30)}H783L786 ${f2(hd.y(786))}Z" fill="${haze('#FFFFFF', .3)}"/><rect x="773" y="${f2(hd.y(772) - 36)}" width="12" height="6" fill="${haze('#3A2E14', .3)}"/>`, .2);
        if (NIGHT) addLit(`<rect class="sc-beam" x="775.5" y="${f2(hd.y(772) - 35)}" width="7" height="4" fill="#FFF1BE"/>` + glow(779, hd.y(772) - 33, 16), 1.3);
        add(mirror(fill(hd, landCol(.3)), 233, .3)); waves(SY);
        const cliff = ridge([[920, BOT], [950, 300], [1000, 262], [1060, 248], [1140, 244], [1220, 248]], 2);
        const X = 1110, y = cliff.y(X) + 2, L = Ls(X), slit = NIGHT ? .6 : .25;
        let obs = `<rect x="-40" y="-46" width="80" height="46" fill="#F2EEE6"/><rect x="${L > 0 ? 6 : -40}" y="-46" width="34" height="46" fill="#000" fill-opacity=".1"/><rect x="-42" y="-48" width="84" height="5" fill="#E2DCD0"/>`
          + `<path d="M-38 -48A38 34 0 0 1 38 -48Z" fill="#E9E4DA"/><path d="M0 -82A38 34 0 0 1 38 -48H0Z" fill="#000" fill-opacity=".1"/>`
          + `<path d="M-6 -48L-8 -81Q0 -83 8 -81L6 -48Z" fill="#1E2438"/><g transform="translate(0 -56) rotate(${NIGHT ? -32 : -18})"><rect x="-4" y="-5" width="44" height="10" rx="2" fill="#C9C4BA"/><rect x="38" y="-6" width="6" height="12" rx="1" fill="#9A958C"/></g>`
          + `<rect x="-8" y="-24" width="14" height="24" fill="${WOOD_D}"/><rect x="16" y="-34" width="12" height="10" fill="#3E4652"/>` + `<path d="M-38 -48A38 34 0 0 1 38 -48" stroke="#C9C2B4" stroke-width="1.2" fill="none"/>`;
        let agave = ''; [[1020, 1.2], [1196, 1]].forEach(([ax, k]) => { const ay = cliff.y(ax) + 4; for (let j = 0; j < 7; j++) { const a = -Math.PI / 2 + (j - 3) * .36; agave += `<path d="M${ax} ${f2(ay)}Q${f2(ax + Math.cos(a) * 10 * k)} ${f2(ay + Math.sin(a) * 14 * k)} ${f2(ax + Math.cos(a) * 22 * k)} ${f2(ay + Math.sin(a) * 26 * k)}" stroke="#6E8F6A" stroke-width="${f2(3 * k)}" fill="none" stroke-linecap="round"/>`; } });
        add(fill(cliff, LD.near) + `<path d="M1000 300Q1060 280 1120 276M1010 330Q1080 316 1160 312" stroke="${LD.front}" stroke-opacity=".5" stroke-width="2" fill="none"/>` + agave + shadowAt(X, y, 44) + at(X, y, 1.25, obs) + groundDetail(cliff, 1000, 1220, 8, 1.3, 1), .35);
        if (NIGHT || DAYB) addLit(win(X + 16 * 1.25, y - 34 * 1.25, 12 * 1.25, 10 * 1.25, .4) + at(X, y, 1.25, `<path d="M-4 -50L-6 -80Q0 -82 6 -80L4 -50Z" fill="#F6C76E" opacity="${slit}"/>`), 1.6);
        if (NIGHT) { let mw = ''; for (let i = 0; i < 90; i++) { const t = RN2(), x = 760 + t * 440, yy = -T + 20 + t * (T + 120) * .7 + (RN2() - .5) * 60; mw += `<circle cx="${f2(x)}" cy="${f2(yy)}" r="${f2(.4 + RN2() * .7)}" fill="#E9ECF6" fill-opacity="${f2(.3 + RN2() * .5)}"/>`; }
          addLit(`<path d="M760 ${-T + 20}L1200 ${f2(-T + 20 + (T + 120) * .7)}" stroke="#C9D2EE" stroke-opacity=".08" stroke-width="70" stroke-linecap="round"/>` + mw, .4); }
      }
      break;
    }
    case 4: { // Automatizzare: il borgo del luogo sul colle (toscano, lombardo, baite, pastello, a graticcio, bianco, ligure), la torre dell'orologio in mezzo, la strada coi lampioni
      backdrop();
      const mid = ridge([[-20, 236], [600, 230], [860, 228], [1220, 232]], 3);
      add(fill(mid, landCol(.38)) + patches(mid, 300, 1200, .38, 2) + hedge(mid, 300, 1200, 22, .38) + forest(mid, 560, 1200, 18, .3, .38), .25);
      const hill = ridge([[700, BOT], [780, 320], [900, 286], [1010, 262], [1090, 254], [1160, 258], [1220, 268]], 2);
      const X = 1092, y = hill.y(X) + 2, L = Ls(X), kind = STY[mi].town, RH = rng(seed + 17);
      let back = '', front = '', wins = '', smoke = '';
      const WALLC = { toscano: '#BFA27A', lombardo: '#A9A296', baite: '#8E897F', pastello: '#C9B8A0', graticcio: '#A99A86', bianco: '#E9E3D6', ligure: '#B9A68A' }[kind];
      const put = (hx, dy, k, i) => { const hy = hill.y(hx) + dy, H0 = townHouse(kind, hx, hy, k, i, Ls(hx), RH), tw = H0.w + 7 * k, th = 5 * k;
        let ter = mi === 1 ? '' : `<path d="M${f2(hx - tw)} ${f2(hy - .5)}H${f2(hx + tw)}L${f2(hx + tw - 1.6 * k)} ${f2(hy + th)}H${f2(hx - tw + 1.6 * k)}Z" fill="${WALLC}"/>`;
        if (mi !== 1) for (let r = 0; r < 2; r++) for (let c = 0; c < Math.round(tw / (3 * k)); c++) ter += `<rect x="${f2(hx - tw + 1.8 * k + c * 6 * k + (r % 2) * 3 * k)}" y="${f2(hy + .6 * k + r * 2.3 * k)}" width="${f2(5 * k)}" height="${f2(1.8 * k)}" rx="${f2(.6 * k)}" fill="#000" fill-opacity="${f2(.06 + RH() * .08)}"/>`;
        if (mi === 1) { const gc = landCol(.78), w0 = H0.w;   // Brumale: niente ripiano, la casa siede nel prato: un poco di terra smossa, l'erba alta contro lo zoccolo, l'ombra morbida
          ter = `<path d="M${f2(hx - w0 - 7 * k)} ${f2(hy + 2.4 * k)}Q${f2(hx - w0)} ${f2(hy - 1.2 * k)} ${f2(hx)} ${f2(hy - .6 * k)}Q${f2(hx + w0)} ${f2(hy - 1.2 * k)} ${f2(hx + w0 + 7 * k)} ${f2(hy + 2.4 * k)}Z" fill="${shade(gc, .08)}"/>`
            + `<ellipse cx="${f2(hx + Ls(hx) * 3 * k)}" cy="${f2(hy + .6 * k)}" rx="${f2(w0 + 5 * k)}" ry="${f2(1.8 * k)}" fill="url(#${cgrad('#000000')})" opacity=".35"/>`;
          H0.after = [-1, -.55, .5, .95].map((q) => grassTuft(hx + q * w0, hy + .4 * k, .5 * k, shade(gc, .3))).join(''); }
        else ter += `<rect x="${f2(hx - tw)}" y="${f2(hy - 1.6 * k)}" width="${f2(2 * tw)}" height="${f2(1.8 * k)}" fill="${snowy ? '#FFFFFF' : shade(landCol(.8), .05)}"/><rect x="${f2(hx - H0.w - 1.5 * k)}" y="${f2(hy - .8 * k)}" width="${f2(2 * H0.w + 3 * k)}" height="${f2(1.4 * k)}" fill="#000" fill-opacity=".22"/>`
          + (snowy ? snowLedge(hx - tw, hx + tw, hy - 1.4 * k, 1.6 * k) : grassTuft(hx - tw + 3 * k, hy - .8 * k, .6 * k, shade(landCol(.8), .3)) + grassTuft(hx + tw - 3 * k, hy - .8 * k, .6 * k, shade(landCol(.8), .3)));
        const H1 = { ...H0, svg: ter + H0.svg + (H0.after || '') + (snowy ? `<path d="M${f2(hx - H0.w - 2 * k)} ${f2(hy)}Q${f2(hx - H0.w)} ${f2(hy - 4 * k)} ${f2(hx - H0.w + 6 * k)} ${f2(hy - 2.4 * k)}L${f2(hx - H0.w + 8 * k)} ${f2(hy)}Z" fill="#FFFFFF"/>` : '') };
        wins += H0.wins.map(([wx, wy, ww, wh], j) => (i + j) % 3 === 2 ? '' : win(wx, wy, ww, wh, (i * 7 + j) % 5 * .6)).join('');
        if (H0.chim && !NIGHT && (mi <= 2) && i % 3 === 0) smoke += [0, 1, 2].map((j) => `<circle class="sc-puff2" style="--pfd:7s;--pfl:${f2(-j * 2.3 - i)}s" cx="${f2(H0.chim[0])}" cy="${f2(H0.chim[1])}" r="${f2((3 + j) * k)}" fill="#FFFFFF" fill-opacity=".55"/>`).join('');
        return H1.svg; };
      /* tre file di case: in alto dietro la torre, a metà costa, davanti più grandi; ogni fila più in basso e più grande della precedente */
      [[1026, 4, .92], [1058, 2, .95], [1128, 2, .95], [1160, 4, .92], [1192, 8, .9], [996, 10, .88], [966, 18, .84]].forEach(([hx, dy, k], i) => { back += put(hx, dy, k, i); });
      const fogBand = (yb, x0, x1, op) => { if (mi !== 1) return ''; const RF = rng(Math.round(yb * 3)), fc = NIGHT ? mixHex('#8E98B0', '#C9D2E6', moonL * .6) : '#E6EAEE', g = cgrad(fc); let o = `<g opacity="${op}">`;
        for (let x = x0; x < x1; x += 26 + RF() * 18) o += `<ellipse cx="${f2(x)}" cy="${f2(hill.y(Math.min(1220, x)) + yb + (RF() - .5) * 6)}" rx="${f2(46 + RF() * 40)}" ry="${f2(7 + RF() * 6)}" fill="url(#${g})"/>`; return o + '</g>'; };
      back += fogBand(20, 880, 1260, NIGHT ? .45 : .8);
      [[944, 36, 1.08], [990, 34, 1.16], [1044, 30, 1.2], [1140, 30, 1.2], [1196, 34, 1.16]].forEach(([hx, dy, k], i) => { front += put(hx, dy, k, i + 7); });
      front += fogBand(48, 840, 1260, NIGHT ? .5 : .85);
      [[910, 62, 1.3], [1000, 66, 1.42], [1100, 62, 1.46], [1190, 66, 1.4]].forEach(([hx, dy, k], i) => { front += put(hx, dy, k, i + 12); });
      front += fogBand(82, 780, 1260, NIGHT ? .4 : .65);
      let road = `<path d="${ptsD(crSample([[780, BOT], [860, 340], [960, 318], [1000, 298], [1040, 282]], 4))}" stroke="${LD.path}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`;
      [[880, 333], [962, 314]].forEach(([lx, ly], i) => { const k = 1.4 - i * .25; road += `<path d="M${lx} ${ly}v${f2(-22 * k)}" stroke="#3A3530" stroke-width="${f2(1.4 * k)}"/><rect x="${f2(lx - 2 * k)}" y="${f2(ly - 26 * k)}" width="${f2(4 * k)}" height="${f2(4.5 * k)}" fill="#3A3530"/>`;
        wins += NIGHT || DAYB ? lit(`<rect x="${f2(lx - 1.3 * k)}" y="${f2(ly - 25.2 * k)}" width="${f2(2.6 * k)}" height="${f2(3 * k)}" fill="#F6C76E"/>` + glow(lx, ly - 23.5 * k, 16 * k), 1.5) : ''; });
      const trees = mi === 0 || mi === 4 ? [treeCypress(1000, hill.y(1000) + 4, .8, '#3F5A34', L), treeCypress(1214, hill.y(1214) + 6, .9, '#3F5A34', L)].join('') : mi === 2 ? treePine(1000, hill.y(1000) + 5, .8, '#2F5A63', true, L) + treePine(1212, hill.y(1212) + 6, .9, '#3F6F76', true, L) : mi === 6 || mi === 5 ? treeUmbrella(1212, hill.y(1212) + 4, .9, '#4E7044', '#5B4130', L) : veg(1210, hill.y(1210) + 4, .9, .8);
      add(fill(hill, landCol(.78)) + road + trees + back + shadowAt(X, y, 30) + at(X, y, 1.08, clockTower(mi, L, hr)) + front, .35);
      s.push(wins); if (smoke) add(smoke);
      if (NIGHT || DAYB) addLit(glow(X, y - 76 * 1.08, 30, .8), 1.7);
      const fr = ridge([[-20, BOT - 18], [700, BOT - 26], [840, BOT - 14], [900, BOT + 10]], 3);
      add(fill(fr, shade(LD.front, .1)) + groundDetail(fr, 650, 880, 12, 1.5, 1), .5);
      break;
    }
    case 5: { // Remare automatizzato: ogni mese una macchina che l'acqua fa andare da sola, ciascuna messa per il verso della corrente
      const RM = rng(seed + 63);
      const grad = (id, y0, y1, c0, c1) => `<defs><linearGradient id="${u}${id}" x1="0" y1="${y0}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>`;
      /* la ruota a pale: dir -1 = antioraria (la corrente va a destra e spinge in basso), +1 = oraria */
      const wheel = (wx, wy, wr, dir, dur = 14, buckets = false) => { let w = `<g><animateTransform attributeName="transform" type="rotate" from="0 ${f2(wx)} ${f2(wy)}" to="${dir * 360} ${f2(wx)} ${f2(wy)}" dur="${dur}s" repeatCount="indefinite"/><circle cx="${f2(wx)}" cy="${f2(wy)}" r="${f2(wr - 3)}" fill="none" stroke="${WOOD_D}" stroke-width="3.6"/><circle cx="${f2(wx)}" cy="${f2(wy)}" r="${f2(wr - 11)}" fill="none" stroke="${WOOD}" stroke-width="1.8"/>`;
        for (let j = 0; j < 8; j++) { const an = j * Math.PI / 4; w += `<path d="M${f2(wx)} ${f2(wy)}L${f2(wx + Math.cos(an) * (wr - 4))} ${f2(wy + Math.sin(an) * (wr - 4))}" stroke="${WOOD}" stroke-width="2.2"/>`; }
        const n = buckets ? 12 : 16; for (let j = 0; j < n; j++) { const an = j * 2 * Math.PI / n, c = Math.cos(an), sn = Math.sin(an);
          w += buckets ? `<g transform="translate(${f2(wx + c * wr)} ${f2(wy + sn * wr)}) rotate(${f2(an * 180 / Math.PI + 90)})"><path d="M-5 -4h10l-2 9h-6z" fill="#B0643F"/><path d="M-5 -4h10" stroke="#7E4426" stroke-width="1"/></g>` : `<path d="M${f2(wx + c * (wr - 5))} ${f2(wy + sn * (wr - 5))}L${f2(wx + c * (wr + 3))} ${f2(wy + sn * (wr + 3))}" stroke="${WOOD_D}" stroke-width="4"/>`; }
        return w + `</g><circle cx="${f2(wx)}" cy="${f2(wy)}" r="4.4" fill="#3E2A1A"/><circle cx="${f2(wx)}" cy="${f2(wy)}" r="1.6" fill="${BRASS}"/>`; };
      const flowOn = (pts, wAt0, n, cls = 'sc-flowx') => { let o = ''; for (let i = 0; i < n; i++) { const j = 2 + Math.floor(RM() * (pts.length - 4)), [x, y] = pts[j], b = pts[j + 1], dx = b[0] - x, dy = b[1] - y, l = Math.hypot(dx, dy) || 1, w = wAt0(j), off = (RM() - .5) * w * .6, len = 4 + w * .25;
        o += `<path class="${Math.abs(dx) > Math.abs(dy) ? cls : 'sc-flow'}" style="--fwd:${f2(2.2 + RM() * 1.4)}s;--fwl:${f2(-RM() * 3)}s" d="M${f2(x - dy / l * off)} ${f2(y + dx / l * off)}l${f2(dx / l * len)} ${f2(dy / l * len)}" stroke="#FFFFFF" stroke-opacity="${f2(.25 + w / 120)}" stroke-width="${f2(.8 + w / 40)}" stroke-linecap="round"/>`; } return o; };
      /* il fiume: linea di mezzo e larghezze; Pn = riva di qua, Mf = riva di là */
      const riverGeo = (C0, W0) => { const Cs = crSample(C0, 4), cum = (P) => { const o = [0]; for (let i = 1; i < P.length; i++) o.push(o[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return o; };
        const lc = cum(C0), ls = cum(Cs), wAt = (l) => { for (let i = 0; i < lc.length - 1; i++) if (l <= lc[i + 1]) return W0[i] + (W0[i + 1] - W0[i]) * (l - lc[i]) / (lc[i + 1] - lc[i]); return W0[W0.length - 1]; };
        const Pn = [], Mf = []; Cs.forEach(([x, y], i) => { const a = Cs[Math.max(0, i - 1)], b = Cs[Math.min(Cs.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, nx = -dy / n, ny = dx / n, w = wAt(ls[i]) / 2; Pn.push([x + nx * w, y + ny * w]); Mf.push([x - nx * w, y - ny * w]); });
        return { Cs, Pn, Mf, w: (j) => wAt(ls[j]), riverD: ptsD(Pn) + Mf.slice().reverse().map(([x, y]) => `L${f2(x)} ${f2(y)}`).join('') + 'Z', farAt: (x) => interpY(Mf.filter(([px]) => px > 930), x), nearAt: (x) => interpY(Pn.filter(([px]) => px > 880), x) }; };
      const drawRiver = (G, top) => { s.push(water(top, -20, -19)); s.push(`<path d="${G.riverD}" fill="url(#${wId})"/>`);
        add(`<path d="${ptsD(G.Mf)}" stroke="${shade(landCol(.8), .35)}" stroke-width="2" fill="none" stroke-opacity=".55"/>` + flowOn(G.Cs, G.w, 26) + (snowy ? `<path d="${ptsD(G.Pn)}" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-opacity=".85"/><path d="${ptsD(G.Mf)}" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-opacity=".8"/>` : ''), .3); };
      const nearBank = (G, extra = '') => { const PL = G.Pn[G.Pn.length - 1];
        const d = `M-20 244L600 240Q820 236 ${f2(G.Pn[0][0])} ${f2(G.Pn[0][1])}` + G.Pn.map(([x, y]) => `L${f2(x)} ${f2(y)}`).join('') + `L1240 ${f2(PL[1])}L1240 ${BOT + 40}L-20 ${BOT + 40}Z`;
        let nb = grad('nb', 240, BOT, landCol(.52), landCol(1)) + `<path d="${d}" fill="url(#${u}nb)"/><path d="${ptsD(G.Pn)}" stroke="${shade(landCol(.8), .35)}" stroke-width="2.4" fill="none" stroke-opacity=".5"/>`;
        for (let i = 0; i < 12; i++) { const x = 900 + i * 26 + RM() * 10, yy = G.nearAt(x) + 6 + RM() * 6; nb += snowy ? `<path d="M${f2(x)} ${f2(yy)}q2 -10 0 -18" stroke="#7A6A58" stroke-width="1.3" fill="none"/>` : reed(x, yy, .9 + RM() * .4, shade(LD.front, .1)); }
        add(nb + extra + groundDetail({ y: () => BOT - 60 }, 640, 1220, 16, 1.4, 1), .5); };
      const farBank = (G, extra = '') => { const ML = G.Mf[G.Mf.length - 1];
        add(grad('fb', 232, 334, landCol(.42), landCol(.74)) + `<path d="${ptsD(G.Mf)}L1240 ${f2(ML[1])}L1240 240Q1040 232 ${f2(G.Mf[0][0])} ${f2(G.Mf[0][1])}Z" fill="url(#${u}fb)"/>` + extra, .25); };
      /* la casa del mulino, nello stile del luogo (origine alla base, al centro) */
      /* la casa del mulino, nello stile del luogo (origine alla base, al centro). A sinistra l'ala bassa della macina, contro cui gira la ruota */
      const stoneWall = (x0, x1, y0, y1, c, RS) => { let o = `<rect x="${x0}" y="${y1}" width="${x1 - x0}" height="${y0 - y1}" fill="${c}"/>`;
        for (let y = y0 - 1; y > y1 + 2;) { const hh = 3.4 + RS() * 3; for (let x = x0 + RS() * 4; x < x1 - 2;) { const ww = 5 + RS() * 9; o += `<rect x="${f2(x)}" y="${f2(y - hh)}" width="${f2(Math.min(ww, x1 - x - .6))}" height="${f2(hh - .8)}" rx="1.2" fill="${shade(c, (RS() - .4) * .16)}"/>`; x += ww + .8; } y -= hh; }
        return o; };
      const quoins = (x, y0, y1, c, dir) => { let o = ''; for (let y = y0, j = 0; y > y1 + 4; y -= 6, j++) o += `<rect x="${f2(dir > 0 ? x - (j % 2 ? 6 : 9) : x)}" y="${f2(y - 5.4)}" width="${j % 2 ? 6 : 9}" height="5.4" fill="${c}"/>`; return o; };
      const winS = (x, y, w, h, sh, frame, open = false) => `<rect x="${f2(x - 1.2)}" y="${f2(y - 1.4)}" width="${f2(w + 2.4)}" height="${f2(h + 2.8)}" fill="${frame}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#3A4250"/><path d="M${f2(x + w / 2)} ${y}V${y + h}M${x} ${f2(y + h * .45)}H${x + w}" stroke="${frame}" stroke-width=".7"/>`
        + (sh ? (open ? `<rect x="${f2(x - w * .55 - 1)}" y="${y}" width="${f2(w * .5)}" height="${h}" fill="${sh}"/><rect x="${f2(x + w + 1)}" y="${y}" width="${f2(w * .5)}" height="${h}" fill="${sh}"/>` : `<rect x="${f2(x - w * .5 - 1.2)}" y="${y}" width="${f2(w * .5)}" height="${h}" fill="${sh}"/><rect x="${f2(x + w + 1.2)}" y="${y}" width="${f2(w * .5)}" height="${h}" fill="${sh}"/>`)
          + [0, 1, 2].map((j) => `<path d="M${f2(x - w * .5 - 1.2)} ${f2(y + 2 + j * h / 3.4)}h${f2(w * .5)}M${f2(x + w + 1.2)} ${f2(y + 2 + j * h / 3.4)}h${f2(w * .5)}" stroke="#000" stroke-opacity=".18" stroke-width=".6"/>`).join('') : '')
        + `<rect x="${f2(x - 2)}" y="${f2(y + h + 1.2)}" width="${f2(w + 4)}" height="2" fill="${frame}"/><rect x="${f2(x - 2)}" y="${f2(y + h + 3.2)}" width="${f2(w + 4)}" height=".8" fill="#000" fill-opacity=".2"/>`;
      const tileRoof = (x0, x1, yE, yR, inset, c) => { let o = `<path d="M${x0} ${yE}L${x0 + inset} ${yR}H${x1 - inset}L${x1} ${yE}Z" fill="${c}"/>`;
        for (let x = x0 + 3; x < x1 - 2; x += 3.2) { const t = (x - x0) / (x1 - x0), xt = x0 + inset + t * (x1 - x0 - 2 * inset); o += `<path d="M${f2(x)} ${yE}L${f2(xt)} ${yR}" stroke="#000" stroke-opacity=".13" stroke-width=".8"/>`; }
        for (let j = 1; j < 4; j++) { const y = yR + (yE - yR) * j / 4, xi = inset * (1 - j / 4); o += `<path d="M${f2(x0 + xi)} ${f2(y)}H${f2(x1 - xi)}" stroke="#FFFFFF" stroke-opacity=".12" stroke-width=".8"/>`; }
        return o + `<path d="M${x0 - 1} ${yE}H${x1 + 1}" stroke="${shade(c, .35)}" stroke-width="1.6"/><path d="M${x0 + inset} ${yR}H${x1 - inset}" stroke="${shade(c, .3)}" stroke-width="2"/><rect x="${x0 + 2}" y="${yE + .8}" width="${x1 - x0 - 4}" height="2.4" fill="#000" fill-opacity=".22"/>`; };
      const millHouse = (style, L) => { const RS = rng(style.length * 17 + 5), sh = L > 0 ? 1 : -1;
        if (style === 'toscano') { const st = '#D3BD98', qn = '#E6D8BC';
          /* l'ala della macina, bassa, col tetto a una falda */
          let h = stoneWall(-84, -34, 0, -32, shade(st, .04), RS) + `<path d="M-90 -28L-34 -40V-34L-88 -24Z" fill="#A8553A"/>` + Array.from({ length: 14 }, (_, j) => `<path d="M${-88 + j * 4} ${f2(-25 - j * .9)}l0 -3.6" stroke="#000" stroke-opacity=".15" stroke-width=".7"/>`).join('') + `<rect x="-88" y="-24" width="54" height="2" fill="#000" fill-opacity=".2"/>`
            + `<rect x="-60" y="-22" width="8" height="6" fill="#3A3026"/><path d="M-62 -15.4h12" stroke="${qn}" stroke-width="1.6"/>`;
          /* il corpo: scarpa alla base, pietra a corsi irregolari, cantonali, cornice di gronda */
          h += `<path d="M-38 0L-35 -9H35L38 0Z" fill="${shade(st, .12)}"/>` + stoneWall(-35, 35, -8, -58, st, RS) + quoins(-35, -8, -58, qn, 1) + quoins(35, -8, -58, qn, -1)
            + `<path d="M${sh > 0 ? 10 : -35} 0V-58H${sh > 0 ? 38 : -10}V0Z" fill="#000" fill-opacity=".12"/>`;
          /* la loggia in alto a destra con due archi e il parapetto; la scala esterna di pietra che ci sale */
          h += `<path d="M4 -38V-52A6 6 0 0 1 16 -52V-38ZM18 -38V-52A6 6 0 0 1 30 -52V-38Z" fill="#2E2620"/><rect x="2" y="-40" width="30" height="3.4" fill="${qn}"/><path d="M16 -38V-54" stroke="${qn}" stroke-width="2"/>`
            + `<path d="M32 0L38 0L38 -8L8 -38H2L32 -8Z" fill="${shade(st, .1)}"/>` + Array.from({ length: 7 }, (_, j) => `<path d="M${36 - j * 4.4} ${-6 - j * 4.4}h-4.4v4.4" stroke="${shade(st, .3)}" stroke-width=".8" fill="none"/>`).join('') + `<path d="M38 -10L8 -40" stroke="${qn}" stroke-width="2.2"/>`
            + `<path d="M28 -10l2 -6h6l2 6z" fill="#B0643F"/><circle cx="33" cy="-19" r="4" fill="#4E7A3A"/><circle cx="31" cy="-20" r="1.3" fill="#D8453A"/><circle cx="35" cy="-18" r="1.3" fill="#D8453A"/>`;
          /* porta ad arco con la ghiera, finestre con le persiane verdi */
          h += `<path d="M-22 0V-18A7 7 0 0 1 -8 -18V0Z" fill="#5A3A26"/><path d="M-23.6 0V-18A8.6 8.6 0 0 1 -6.4 -18V0" stroke="${qn}" stroke-width="2.4" fill="none"/>` + [-19, -15, -11].map((x) => `<path d="M${x} -1V-20" stroke="#3E2618" stroke-width=".6"/>`).join('') + `<rect x="-26" y="-1" width="22" height="2" fill="${shade(st, .25)}"/>`
            + winS(-25, -48, 8, 10, '#4E6B4A', qn) + winS(-5, -26, 6, 8, null, qn);
          /* il tetto a padiglione con lo sbalzo, il comignolo col cappello */
          h += tileRoof(-42, 42, -57, -74, 16, '#B05A36') + `<rect x="18" y="-86" width="7" height="14" fill="${st}"/><path d="M16 -86h11l-2 -3h-7z" fill="#8E4A2E"/>`;
          return h; }
        if (style === 'mediterraneo') { const w = '#F6F3EC', sd = '#E2DACB';
          let h = `<path d="M-84 0V-30Q-84 -32 -82 -32H-34V0Z" fill="${w}"/><path d="M-86 -32H-32V-36H-86Z" fill="${sd}"/>` + `<rect x="-62" y="-24" width="7" height="7" rx="3.4" fill="#3E4652"/>`;
          h += `<path d="M-34 0V-50Q-34 -52 -32 -52H32Q34 -52 34 -50V0Z" fill="${w}"/><path d="M${sh > 0 ? 10 : -34} 0V-52H${sh > 0 ? 34 : -10}V0Z" fill="#000" fill-opacity=".07"/><rect x="-36" y="-4" width="72" height="4" fill="${sd}"/>`
            + tileRoof(-40, 40, -51, -68, 26, '#B85A36') + `<path d="M-24 -66h6v-10h-6z" fill="${w}"/><path d="M-26 -76h10" stroke="${sd}" stroke-width="2"/>`;
          /* la scala esterna a sinistra contro il muro, il forno del pane a cupola a destra */
          h += `<path d="M-34 0H-50L-34 -24Z" fill="#ECE6DA"/>` + Array.from({ length: 6 }, (_, j) => `<path d="M${-48 + j * 2.6} ${-2 - j * 4}h${f2(14 - j * 2.6)}" stroke="#D9D0C0" stroke-width="1.4"/>`).join('')
            + `<path d="M34 0V-12A12 12 0 0 1 58 -12V0Z" fill="#EDE5D6"/><path d="M42 0V-6A4 4 0 0 1 50 -6V0Z" fill="#3A3026"/><path d="M52 -20l2 -6h3l1 6z" fill="#E2DACB"/>`;
          /* porta blu, finestre col contorno di calce e gli scuri blu, la buganvillea sopra la porta */
          h += `<path d="M2 0V-22Q8 -28 14 -22V0Z" fill="#2F6E9A"/><path d="M8 0V-25" stroke="#24577A" stroke-width=".6"/><rect x="0" y="-1" width="16" height="1.4" fill="${sd}"/>` + winS(-22, -40, 8, 9, '#2F6E9A', w) + winS(20, -40, 8, 9, '#2F6E9A', w, true);
          let bg = ''; for (let i = 0; i < 22; i++) { const x = -2 + RS() * 22, y = -30 - RS() * 10; bg += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(1.4 + RS() * 1.4)}" fill="${i % 3 ? '#C2307A' : '#4E7A3A'}"/>`; }
          return h + bg + `<path d="M-30 0l2 -7h8l2 7z" fill="#B0643F"/><circle cx="-24" cy="-11" r="4.4" fill="#5E8A44"/>`; }
        return ''; };
      if (mi === 0 || mi === 5) { // Foliaio: il mulino di pietra con la loggia, il carro della vendemmia · Messidoro: il mulino bianco tra il grano, coi sacchi di farina e i covoni
        backdrop();
        const back = ridge([[-20, 232], [600, 226], [860, 230], [1220, 228]], 3);
        let vines = ''; if (mi === 0) for (let k = 0; k < 4; k++) { let d = ''; for (let x = 600; x <= 1200; x += 8) d += `${x === 600 ? 'M' : 'L'}${x} ${f2(back.y(x) + 4 + k * 5)}`; vines += `<path d="${d}" stroke="${haze('#6E5A2E', .4)}" stroke-width="1.4" stroke-dasharray="1 4" fill="none"/>`; }
        add(fill(back, landCol(.4)) + patches(back, 400, 1200, .4) + vines + forest(back, 560, 1200, 12, .32, .4), .2);
        const G = riverGeo([[914, 233], [894, 250], [860, 272], [868, 296], [960, 318], [1080, 328], [1240, 334]], [3, 9, 20, 34, 48, 56, 62]);
        let fb = ''; if (mi === 5) for (let i = 0; i < 7; i++) { const x = 960 + i * 38 + RM() * 10, yy = 254 + RM() * 12 + (x - 960) * .1; fb += `<path d="M${f2(x - 6)} ${f2(yy)}l3 -14h6l3 14z" fill="${haze('#D8B24A', .55)}"/><path d="M${f2(x - 4)} ${f2(yy - 9)}h8" stroke="${haze('#A9822A', .55)}" stroke-width="1.2"/>`; }
        else fb += patches({ y: (x) => 240 + (x - 900) * .02 }, 960, 1200, .5, 1);
        farBank(G, fb); drawRiver(G, 233);
        const hx = 1138, hy = G.farAt(hx) - 2, k = 1.14, L = Ls(hx), wx = 1082, wr = 30, wl = G.farAt(wx) + 5, wy = wl - 4;
        let extra = '';
        if (mi === 0) { const cx = 1206, cy = G.farAt(1206) - 1; extra = `<path d="M${cx - 18} ${cy - 8}h36v-12h-36z" fill="#8A5E3B"/><path d="M${cx - 18} ${cy - 14}h36" stroke="#5E3D25"/>` + [-10, 0, 10].map((x) => `<ellipse cx="${cx + x}" cy="${cy - 22}" rx="5" ry="4" fill="#5A2E5E"/>`).join('') + `<circle cx="${cx - 12}" cy="${cy - 3}" r="6" fill="none" stroke="#3E2A1A" stroke-width="2"/><circle cx="${cx + 12}" cy="${cy - 3}" r="6" fill="none" stroke="#3E2A1A" stroke-width="2"/><path d="M${cx - 18} ${cy - 10}l-14 6" stroke="#5E3D25" stroke-width="2"/>`
          + treeRound(1196, G.farAt(1196) - 20, .9, '#D8792E', '#5B4130', Ls(1196)); }
        else { const cx = 1200, cy = G.farAt(1200) - 1; extra = `<path d="M${cx - 14} ${cy}q-2 -12 6 -14q8 2 6 14zM${cx - 2} ${cy}q-2 -10 5 -12q7 2 5 12zM${cx + 8} ${cy}q-2 -11 5 -13q7 2 5 13z" fill="#ECE2C8"/><path d="M${cx - 13} ${cy - 7}h8M${cx - 1} ${cy - 6}h8" stroke="#C9B48A" stroke-width=".8"/>`; }
        add(shadowAt(hx, hy, 40) + at(hx, hy, k, millHouse(mi === 0 ? 'toscano' : 'mediterraneo', L)) + extra + wheel(wx, wy, wr, -1) + frontWater(wx, wl, 84, 20) + `<path d="M${wx + wr - 2} ${f2(wl + 2)}q8 -4 16 0q6 -3 12 1M${wx + wr + 4} ${f2(wl + 7)}q10 -3 20 1" stroke="#FFFFFF" stroke-opacity=".85" stroke-width="1.6" fill="none" stroke-linecap="round"/>` + ripRings(wx + 20, wl + 4, 3, 22), .35);
        if (NIGHT || DAYB) addLit(mi === 0 ? win(hx - 25 * k, hy - 48 * k, 8 * k, 10 * k, .4) + win(hx + 5 * k, hy - 51 * k, 10 * k, 12 * k, 2) : win(hx - 22 * k, hy - 40 * k, 8 * k, 9 * k, .4) + win(hx + 20 * k, hy - 40 * k, 8 * k, 9 * k, 2), 1.6);
        if (!NIGHT && mi === 0) add([0, 1, 2].map((j) => `<circle class="sc-puff2" style="--pfd:7s;--pfl:${f2(-j * 2.3)}s" cx="${f2(hx + 21.5 * k)}" cy="${f2(hy - 90 * k)}" r="${4 + j}" fill="#FFFFFF" fill-opacity=".6"/>`).join(''), .6);
        let nbx = ''; if (mi === 5) for (let i = 0; i < 6; i++) { const x = 680 + i * 50 + RM() * 20, yy = BOT - 50 - RM() * 30; nbx += `<path d="M${f2(x - 12)} ${f2(yy)}q12 -40 24 0z" fill="#D8B24A"/><path d="M${f2(x - 8)} ${f2(yy - 12)}h16" stroke="#A9822A" stroke-width="1.6"/>`; }
        nearBank(G, nbx);
      } else if (mi === 1) { // Brumale: il mulino natante sul fiume largo, come sull'Adige: la ruota tra due scafi, nella corrente, legato alla riva con le catene; nebbia sull'acqua
        backdrop();
        const WL = 236, sh = ridge([[-20, 224], [500, 220], [760, 224], [880, 216], [1000, 222], [1220, 216]], 3);
        const shore = fill(sh, landCol(.34)) + forest(sh, 500, 1200, 22, .34, .34, () => true, 3);
        add(shore, .25); s.push(water(WL)); add(mirror(shore, WL, .38) + ripplesOn(WL, 300, 1200, 40)); s.push(glitter(WL));
        let cur = ''; for (let i = 0; i < 30; i++) { const t = Math.pow(RM(), .8), y = WL + 8 + t * (BOT - WL - 10), w = 6 + t * 30; cur += `<path class="sc-flowx" style="--fwd:${f2(2.6 + RM() * 1.6)}s;--fwl:${f2(-RM() * 3)}s" d="M${f2(700 + RM() * 520)} ${f2(y)}h${f2(w)}" stroke="#FFFFFF" stroke-opacity="${f2(.15 + t * .2)}" stroke-width="${f2(.8 + t)}" stroke-linecap="round"/>`; }
        add(cur, .3);
        const X = 1060, Y = 304, k = 1.1;
        const hull = (x0, x1, h, c) => `<path d="M${x0} -6Q${x0 + 6} ${h} ${x0 + 20} ${h + 2}H${x1 - 20}Q${x1 - 6} ${h} ${x1} -6Z" fill="${c}"/><path d="M${x0} -6H${x1}" stroke="#7A6450" stroke-width="2"/>`;
        /* la casetta del mulino sulla chiatta: assito orizzontale a sovrapposizione, tetto di scandole con lo sbalzo, la finestrella col telaio,
           la stufa col tubo, i sacchi sul ponte, la ringhiera, la lanterna sul palo di prua */
        let fm = hull(-30, 96, 12, '#3A2E26') + `<path d="M-26 0Q20 4 92 0" stroke="#5A4A3C" stroke-width=".8" fill="none"/><path d="M-24 4Q20 8 88 4" stroke="#5A4A3C" stroke-width=".8" fill="none"/>`
          + `<path d="M-14 -6V-50H80V-6Z" fill="#6A5644"/>` + Array.from({ length: 11 }, (_, j) => `<path d="M-14 ${-9 - j * 4}H80" stroke="#4A3A2E" stroke-width="1"/><path d="M-14 ${-8 - j * 4}H80" stroke="#8A7460" stroke-width=".5" stroke-opacity=".6"/>`).join('')
          + `<path d="M-14 -6V-50M80 -6V-50" stroke="#3E3026" stroke-width="2.4"/><path d="M33 -6V-50" stroke="#3E3026" stroke-width="1.4"/><path d="M58 -6V-50H80V-6Z" fill="#000" fill-opacity=".14"/>`
          + `<path d="M-24 -47L33 -82L90 -47L86 -45L33 -77L-20 -45Z" fill="#3E4650"/><path d="M-20 -45L33 -77L86 -45Z" fill="#4E5662"/>` + Array.from({ length: 6 }, (_, j) => `<path d="M${f2(-16 + j * 4.6)} ${f2(-48 - j * 4.2)}H${f2(82 - j * 4.6)}" stroke="#2E343C" stroke-width=".8" stroke-dasharray="3 1"/>`).join('')
          + `<path d="M33 -77L86 -45H33Z" fill="#000" fill-opacity=".15"/><rect x="-18" y="-45" width="102" height="2.4" fill="#000" fill-opacity=".25"/><path d="M29 -64h8v-6h-8z" fill="#2E2218"/>`
          + `<rect x="38.6" y="-39.4" width="12.8" height="12.8" fill="#4A3A2E"/><rect x="40" y="-38" width="10" height="10" fill="#2E2218"/><path d="M45 -38v10M40 -33h10" stroke="#4A3A2E" stroke-width="1"/><path d="M37.6 -26.4h14.8" stroke="#8A7460" stroke-width="1.6"/>`
          + `<rect x="8.6" y="-31.4" width="14.8" height="25.4" fill="#4A3A2E"/><rect x="10" y="-30" width="12" height="24" fill="#2E2218"/><circle cx="19.6" cy="-17" r=".9" fill="${BRASS}"/>`
          + `<path d="M64 -80V-60" stroke="#2A2622" stroke-width="2.6"/><path d="M61.6 -80h5" stroke="#2A2622" stroke-width="1.6"/>`
          + `<path d="M80 -40h10v6" stroke="#2E2A26" stroke-width="1.4" fill="none"/><rect x="87" y="-34" width="6" height="8" rx="1" fill="#2E2A26"/>`
          + `<path d="M84 -6V-18M92 -6V-16M84 -16H94" stroke="#4A3A2E" stroke-width="1.2"/><path d="M-26 -6V-16M-20 -6V-16M-27 -15H-14" stroke="#4A3A2E" stroke-width="1.2"/>`
          + `<path d="M-6 -6q0 -9 6 -9q6 0 6 9z" fill="#D9CDB4"/><path d="M-1 -15l1 -2l1 2" stroke="#A89A7E" fill="none"/><path d="M48 -6q0 -8 5 -8q5 0 5 8z" fill="#CFC2A8"/>`;
        const wx = -60, wy = -12, wr = 34;
        fm += `<path d="M-30 -14H-96" stroke="#4A3A2E" stroke-width="3"/>` + wheel(wx, wy, wr, -1, 12) + hull(-110, -76, 8, '#2E2622') + `<path d="M-30 -14L-96 -14" stroke="#4A3A2E" stroke-width="2"/>`;
        const bt = at(X, Y, k, fm);
        add(mirror(bt, Y, .3) + bt + frontWater(X - 30, Y, 280, 18) + ripRings(X + (wx + 20) * k, Y + 2, 4, 30) + `<path d="M${f2(X + 96 * k)} ${f2(Y - 4)}Q${X + 150} ${Y + 6} ${X + 170} ${Y - 30}" stroke="#5E5B56" stroke-width="1.6" fill="none"/><path d="M${X + 170} ${Y + 20}V${Y - 40}" stroke="#3E3128" stroke-width="5"/>`, .45);
        addLit(at(X, Y, k, `<rect x="88" y="-33" width="4" height="6" fill="#F6C76E"/>` + glow(90, -30, NIGHT || DAYB ? 30 : 12)) + (NIGHT || DAYB ? win(X + 40 * k, Y - 38 * k, 10 * k, 10 * k, .8) : ''), 1.6);
        add(mist(Y - 20, 30, DAYB ? .8 : .35, 22, 50), .5);
      } else if (mi === 2) { /* Ianuario: la segheria veneziana sul torrente. La gora di legno, su cavalletti, porta l'acqua da monte (a sinistra)
           sopra la ruota: l'acqua cade sulle pale di destra e la ruota gira in senso orario; dalla ruota l'acqua torna nel torrente, che lì resta aperto.
           Lungo le rive il torrente è orlato di ghiaccio; sotto la gora che perde pendono i ghiaccioli. Nel capannone, dalla parte aperta, la lama sale e scende
           e taglia il tronco steso sul carro; davanti, sulla riva, la catasta di tronchi sotto la neve e la slitta col tronco. */
        backdrop();
        const cTop = 300, cBot = 336;
        const far = ridge([[-20, 262], [600, 258], [860, 262], [1000, 256], [1220, 260]], 3);
        add(fill(far, '#EEF3F6') + forest(far, 640, 1220, 22, .55, .5, (x) => x < 1000 || x > 1190, 3), .25);
        const bank = ridge([[-20, 286], [700, 284], [1000, 288], [1220, 286]], 2, 30, cTop + 2);
        add(fill(bank, '#F4F8FA') + `<path d="M-20 ${cTop}H1240" stroke="#D5E2EA" stroke-width="3"/>`, .3);
        s.push(water(cTop, -20, 1240));
        add(flowOn(Array.from({ length: 40 }, (_, i) => [-20 + i * 32, cTop + 8 + RM() * (cBot - cTop - 16)]), () => 30, 26), .3);
        /* l'orlo di ghiaccio lungo le due rive, rotto dove l'acqua della ruota è viva */
        const wx = 1046, wr = 38, wy = cTop - 18;
        const shelf = (yEdge, dir, x0, x1) => { let d = `M${x0} ${yEdge}`, pts = []; for (let x = x0; x <= x1; x += 10 + RM() * 14) pts.push([x, yEdge + dir * (3 + RM() * 9)]); pts.push([x1, yEdge]);
          d += pts.map(([x, y]) => `L${f2(x)} ${f2(y)}`).join('') + 'Z'; return `<path d="${d}" fill="#E9F2F6"/><path d="M${pts.map(([x, y]) => `${f2(x)} ${f2(y)}`).join('L')}" stroke="#A9C3D1" stroke-width="1" fill="none"/>`; };
        let ice = shelf(cTop, 1, -20, wx - wr - 30) + shelf(cTop, 1, wx + wr + 50, 1240) + shelf(cBot, -1, -20, wx - 60) + shelf(cBot, -1, wx + 90, 1240);
        for (let i = 0; i < 7; i++) { const x = 760 + RM() * 440, y = cTop + 10 + RM() * (cBot - cTop - 20), w = 5 + RM() * 9; if (Math.abs(x - wx) < 80) continue; ice += `<path d="M${f2(x - w)} ${f2(y)}l${f2(w * .4)} ${f2(-w * .22)}l${f2(w * 1.2)} ${f2(-w * .05)}l${f2(w * .4)} ${f2(w * .22)}l${f2(-w * .6)} ${f2(w * .14)}Z" fill="#F2F7FA" stroke="#B9CEDA" stroke-width=".5"/>`; }
        add(ice, .3);
        /* il capannone della sega: zoccolo di pietra sulla riva, assito di larice, a destra la campata aperta con la sega; tetto di scandole sotto la neve */
        const hx = 1122, hy = cTop - 1, k = 1.36, L = Ls(hx), RS = rng(211);
        let saw = `<path d="M-60 2V-12H60V2Z" fill="#8E897F"/>` + Array.from({ length: 2 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<rect x="${-59 + c * 15 + (r % 2) * 7}" y="${-11 + r * 6}" width="13" height="5" rx="1.2" fill="#000" fill-opacity="${f2(.05 + RS() * .08)}"/>`).join('')).join('');
        saw += `<path d="M-56 -12V-50H56V-12Z" fill="#7A5236"/>` + Array.from({ length: 15 }, (_, j) => `<path d="M${-56 + j * 7.5} -12V-50" stroke="#5A3A26" stroke-width="1"/><path d="M${-55 + j * 7.5} -12V-50" stroke="#9A7050" stroke-width=".5" stroke-opacity=".5"/>`).join('')
          + `<path d="M${L > 0 ? 20 : -56} -12V-50H${L > 0 ? 56 : -20}V-12Z" fill="#000" fill-opacity=".12"/>`;
        /* la campata aperta: dentro buio, il telaio della sega con la lama che va su e giù, il tronco sul carro, la segatura */
        saw += `<rect x="6" y="-48" width="46" height="36" fill="#2A2018"/><path d="M6 -48V-12M52 -48V-12" stroke="#4A3220" stroke-width="3"/>`
          + `<rect x="8" y="-22" width="42" height="3" fill="#6A4A30"/><path d="M8 -19H50" stroke="#3A2A1C" stroke-width="1"/>`
          + `<rect x="10" y="-30" width="40" height="8" rx="3.6" fill="#A27A54"/><path d="M10 -27H50M10 -24.6H50" stroke="#7E5A3A" stroke-width=".6"/><ellipse cx="10" cy="-26" rx="2.4" ry="4" fill="#E0C49A" stroke="#8A6440" stroke-width=".6"/>`
          + `<path d="M24 -46V-14M34 -46V-14" stroke="#5A3A26" stroke-width="2"/><g><animateTransform attributeName="transform" type="translate" values="0 -3;0 3;0 -3" dur="1.1s" repeatCount="indefinite"/><rect x="24" y="-42" width="10" height="2.4" fill="#5A3A26"/><path d="M29 -40V-18" stroke="#C9D2DA" stroke-width="1.4"/><rect x="24" y="-18" width="10" height="2.4" fill="#5A3A26"/></g>`
          + `<path d="M40 -12q4 -5 9 0z" fill="#E6C99A"/><path d="M8 -12q3 -3 7 0z" fill="#E6C99A"/>`;
        /* la parte chiusa: la porticina, la finestrella con la croce, l'asse della ruota che entra nel muro */
        saw += `<rect x="-44" y="-40" width="10" height="9" fill="#2E2218"/><path d="M-39 -40v9M-44 -35.5h10" stroke="#7A5236" stroke-width="1"/><path d="M-46 -30.4h14" stroke="#9A7050" stroke-width="1.6"/>`
          + `<path d="M-18 -12V-36H-4V-12Z" fill="#4A3220"/><path d="M-17 -30h12M-17 -20h12" stroke="#2E2218" stroke-width="1"/><circle cx="-6.5" cy="-24" r=".8" fill="${BRASS}"/>`;
        /* il tetto: due falde di scandole, lo spesso strato di neve che deborda sulla gronda, i ghiaccioli */
        saw += `<path d="M-68 -48L0 -82L68 -48L62 -45L0 -76L-62 -45Z" fill="#5A4636"/><path d="M-62 -45L0 -76L62 -45Z" fill="#6E5844"/>` + Array.from({ length: 6 }, (_, j) => `<path d="M${f2(-58 + j * 9.6)} ${f2(-47 - j * 4.8)}H${f2(58 - j * 9.6)}" stroke="#4A3A2E" stroke-width=".8" stroke-dasharray="4 1.4"/>`).join('')
          + `<path d="M0 -76L62 -45H0Z" fill="#000" fill-opacity=".14"/>`;
        /* la neve sulle due falde: spessa, col bordo di sopra a cuscini morbidi, che deborda sulla gronda e sul colmo */
        const roofY = (x) => -82 + Math.abs(x) * 34 / 68, top = [], botP = [];
        for (let j = 0; j <= 16; j++) { const x = -74 + j * 148 / 16, th = 6 + RS() * 4 - (Math.abs(x) > 64 ? 2 : 0); top.push([x, roofY(Math.max(-68, Math.min(68, x))) - th]); }
        for (let j = 16; j >= 0; j--) { const x = -72 + j * 144 / 16, sag = Math.abs(x) > 60 ? 2.4 + RS() * 3.6 : .8 + RS() * 1.2; botP.push([x, roofY(Math.max(-68, Math.min(68, x))) + 2 + sag]); }
        let sn = `M${f2(top[0][0])} ${f2(top[0][1] + 6)}Q${f2(top[0][0] - 3)} ${f2(top[0][1])} ${f2(top[0][0] + 2)} ${f2(top[0][1])}`;
        for (let j = 1; j < top.length; j++) { const [px, py] = top[j - 1], [x, y] = top[j]; sn += `Q${f2((px + x) / 2)} ${f2(Math.min(py, y) - 2.4 - RS() * 1.6)} ${f2(x)} ${f2(y)}`; }
        sn += `Q${f2(top[16][0] + 3)} ${f2(top[16][1] + 3)} ${f2(botP[0][0])} ${f2(botP[0][1])}`;
        for (let j = 1; j < botP.length; j++) { const [px, py] = botP[j - 1], [x, y] = botP[j]; sn += `Q${f2((px + x) / 2)} ${f2(Math.max(py, y) + 1.2)} ${f2(x)} ${f2(y)}`; }
        sn += 'Z';
        saw += `<path d="${sn}" fill="#FFFFFF"/><path d="${ptsD(botP)}" stroke="#C3D7E2" stroke-width=".9" fill="none"/>` + icicles(-70, -52, -42, 1.3, RS) + icicles(52, 70, -42, 1.3, RS);
        /* la gora sui cavalletti: da sinistra (monte) fin sopra la ruota; la neve sul bordo, i ghiaccioli dove perde */
        const g0 = [700, 238], g1 = [wx + 6, wy - wr - 6], gy = (x) => g0[1] + (g1[1] - g0[1]) * (x - g0[0]) / (g1[0] - g0[0]);
        let gora = '';
        for (let x = 740; x < g1[0] - 10; x += 64) { const y = gy(x), yb = bank.y(x) + 8; gora += `<path d="M${x - 9} ${f2(yb)}L${x} ${f2(y + 4)}L${x + 9} ${f2(yb)}M${x - 5} ${f2((y + yb) / 2 + 4)}H${x + 5}" stroke="${WOOD_D}" stroke-width="2.4" fill="none"/>` + snowLedge(x - 4, x + 4, y + 5, 1.4); }
        gora += `<path d="M${g0[0]} ${g0[1]}L${g1[0]} ${g1[1]}L${g1[0]} ${g1[1] + 7}L${g0[0]} ${g0[1] + 7}Z" fill="${WOOD_D}"/><path d="M${g0[0]} ${g0[1] + 2}L${g1[0]} ${g1[1] + 2}" stroke="${mixHex(WTh[0], '#FFFFFF', .4)}" stroke-width="2.4"/>`
          + `<path d="M${g0[0]} ${g0[1] - .6}L${g1[0]} ${g1[1] - .6}" stroke="#FFFFFF" stroke-width="2.6"/>`;
        for (let x = 760; x < g1[0] - 6; x += 40 + RM() * 30) gora += icicles(x, x + 10 + RM() * 8, gy(x) + 7, 1.2, RM);
        let pour = ''; for (let j = 0; j < 6; j++) pour += `<path class="sc-rain" style="--rd:${f2(.5 + j * .1)}s;--rdl:${f2(-j * .15)}s;--ro:.85" d="M${f2(g1[0] + 2 + j * 1.6)} ${f2(g1[1] + 6)}l1 8" stroke="#E4F2F6" stroke-width="1.8" stroke-linecap="round"/>`;
        const foam = `<path d="M${wx - wr} ${cTop + 3}q10 -4 20 0q10 -4 20 0q10 -4 22 0M${wx + 10} ${cTop + 8}q10 -3 18 0q8 -3 16 1" stroke="#FFFFFF" stroke-width="1.6" fill="none" stroke-opacity=".85"/>`;
        add(gora + shadowAt(hx, hy, 70) + at(hx, hy, k, saw) + wheel(wx, wy, wr, 1, 10) + icicles(wx - wr + 4, wx - 6, wy + 4, 1, RM) + pour + frontWater(wx, cTop + 2, 120, 22) + foam + ripRings(wx + 30, cTop + 8, 3, 22), .35);
        if (NIGHT || DAYB) addLit(win(hx - 44 * k, hy - 40 * k, 10 * k, 9 * k, .6) + at(hx, hy, k, `<rect x="40" y="-46" width="4" height="5" fill="#F6C76E"/>` + glow(42, -43, 18)), 1.6);
        /* la riva di qua: neve alta, la catasta di tronchi, la slitta col tronco, le orme */
        let fr = grad('nb', cBot, BOT, '#EEF4F7', '#DCE8EE') + `<path d="M-20 ${cBot}H1240V${BOT + 40}H-20Z" fill="url(#${u}nb)"/><path d="M-20 ${cBot}H1240" stroke="#FFFFFF" stroke-width="3"/>`;
        let logs = ''; const lx0 = 1120, ly0 = cBot + 56; for (let r = 0; r < 3; r++) for (let c = 0; c < 5 - r; c++) { const lx = lx0 + c * 15 + r * 7.5, ly = ly0 - r * 13; logs += `<circle cx="${f2(lx)}" cy="${f2(ly)}" r="7.4" fill="#B48A60" stroke="#6A4A34" stroke-width="1.2"/><circle cx="${f2(lx)}" cy="${f2(ly)}" r="2" fill="none" stroke="#8A6440" stroke-width=".6"/>`; }
        logs += `<path d="M${lx0 - 10} ${ly0 - 28}Q${lx0 + 4} ${ly0 - 40} ${lx0 + 30} ${ly0 - 50}Q${lx0 + 56} ${ly0 - 42} ${lx0 + 72} ${ly0 - 24}Q${lx0 + 50} ${ly0 - 32} ${lx0 + 30} ${ly0 - 40}Q${lx0 + 10} ${ly0 - 30} ${lx0 - 10} ${ly0 - 22}Z" fill="#FFFFFF"/>`;
        const sl = `<path d="M-30 0Q-38 0 -38 -6M-30 0H34" stroke="#5A3A26" stroke-width="2.2" fill="none"/><path d="M-26 0V-6M-6 0V-6M14 0V-6M30 0V-6M-30 -6H34" stroke="#6E5236" stroke-width="2"/><rect x="-30" y="-15" width="62" height="9" rx="4" fill="#A27A54"/><path d="M-30 -11H32" stroke="#7E5A3A" stroke-width=".6"/><ellipse cx="32" cy="-10.5" rx="2.6" ry="4.5" fill="#E0C49A"/><path d="M-26 -15Q0 -20 30 -15" stroke="#FFFFFF" stroke-width="2.4" fill="none"/>`;
        let steps = ''; for (let i = 0; i < 10; i++) steps += `<ellipse cx="${f2(860 + i * 22)}" cy="${f2(BOT - 30 - i * 3.6 + (i % 2) * 4)}" rx="3" ry="1.4" fill="#C9DCE6"/>`;
        add(fr + steps + at(1010, cBot + 52, 1.5, sl) + logs + treePine(1214, cBot + 30, 1.1, '#2F5A63', true, Ls(1214)) + groundDetail({ y: () => BOT - 40 }, 640, 1000, 10, 1.4, 1), .5);
      } else if (mi === 3) { // Germinale: la noria. Il canale scorre davanti, la ruota coi vasi di coccio raccoglie l'acqua e la versa in alto nell'acquedotto che va ai frutteti in fiore
        backdrop();
        const mid = ridge([[-20, 238], [600, 232], [860, 228], [1220, 234]], 3);
        add(fill(mid, landCol(.42)) + patches(mid, 300, 1200, .42, 3) + forest(mid, 560, 1200, 18, .3, .42), .25);
        const far = ridge([[-20, 270], [700, 266], [1000, 268], [1220, 266]], 2), cTop = 316, cBot = 352;
        let orch = ''; for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) { const x = 760 + i * 52 + r * 24 + RM() * 10, y = far.y(x) + 10 + r * 18; if (x > 980 && x < 1060) continue; orch += treeBlossom(x, y, .8 + r * .25, ['#F4C9D8', '#FFFFFF', '#E89BB5'], '#6B5040', R, p); }
        add(fill(far, landCol(.7)) + `<path d="M-20 ${cTop - 2}H1240" stroke="${shade(landCol(.8), .3)}" stroke-width="3"/>` + orch, .3);
        s.push(water(cTop, -20, 1240)); add(flowOn([[-20, (cTop + cBot) / 2], [400, (cTop + cBot) / 2], [800, (cTop + cBot) / 2], [1240, (cTop + cBot) / 2]].flatMap((pt, i, A) => i < A.length - 1 ? Array.from({ length: 10 }, (_, j) => [pt[0] + (A[i + 1][0] - pt[0]) * j / 10, pt[1] + (RM() - .5) * 20]) : []), () => 34, 30), .3);
        /* la noria: la corrente va a destra e spinge i vasi in basso, la ruota gira in senso antiorario; i vasi si riempiono sotto, salgono a destra
           gocciolando, in cima si rovesciano nella canaletta che porta l'acqua all'acquedotto di pietra ad archi, verso i frutteti */
        const wx = 1004, wr = 56, wy = cTop - 10, ty = wy - wr - 6, aqC = '#C9BCA6', aqD = shade(aqC, .25), wTop = mixHex(WTh[0], '#FFFFFF', .35);
        let aq = '';
        const piers = [1084, 1150, 1216, 1282], pw = 12;
        aq += `<rect x="${wx + 20}" y="${ty - 6}" width="${1260 - wx}" height="14" fill="${aqC}"/><rect x="${wx + 20}" y="${ty - 7}" width="${1260 - wx}" height="3" fill="${shade(aqC, -.06)}"/><path d="M${wx + 20} ${ty - 3}H1260" stroke="${wTop}" stroke-width="2.6"/>`;
        piers.forEach((x, i) => { aq += `<path d="M${x - pw / 2 - 2} ${cTop - 1}L${x - pw / 2} ${ty + 8}H${x + pw / 2}L${x + pw / 2 + 2} ${cTop - 1}Z" fill="${aqC}"/><path d="M${x + pw / 2 - 4} ${ty + 8}H${x + pw / 2}L${x + pw / 2 + 2} ${cTop - 1}H${x + pw / 2 - 3}Z" fill="#000" fill-opacity=".14"/>`
          + Array.from({ length: 6 }, (_, j) => `<path d="M${x - pw / 2} ${f2(ty + 14 + j * 9)}h${pw}" stroke="${aqD}" stroke-opacity=".35" stroke-width=".7"/>`).join('');
          if (i < piers.length - 1) { const xa = x + pw / 2, xb = piers[i + 1] - pw / 2, r = (xb - xa) / 2, ya = ty + 14 + r;
            aq += `<path d="M${xa} ${ty + 8}H${xb}V${f2(ya)}A${f2(r)} ${f2(r)} 0 0 0 ${xa} ${f2(ya)}Z" fill="${aqC}"/><path d="M${xb} ${f2(ya)}A${f2(r)} ${f2(r)} 0 0 0 ${xa} ${f2(ya)}" stroke="${aqD}" stroke-width="1.4" fill="none"/>`
              + Array.from({ length: 7 }, (_, j) => { const an = Math.PI * (j + .5) / 7; return `<path d="M${f2(xa + r - Math.cos(an) * r)} ${f2(ya - Math.sin(an) * r)}l${f2(-Math.cos(an) * 4)} ${f2(-Math.sin(an) * 4)}" stroke="${aqD}" stroke-width=".8"/>`; }).join(''); } });
        aq += `<path d="M${wx + 20} ${ty - 6}h${1260 - wx}" stroke="#7E6A52" stroke-width="1"/>` + Array.from({ length: 8 }, (_, j) => `<path class="sc-flowx" style="--fwd:${f2(2 + RM())}s;--fwl:${f2(-RM() * 2)}s" d="M${f2(wx + 30 + j * 30)} ${ty - 3}h10" stroke="#FFFFFF" stroke-width="1" stroke-opacity=".7"/>`).join('');
        /* la pila di pietra che regge l'asse, dietro la ruota */
        const pile = `<path d="M${wx - 12} ${cBot - 6}L${wx - 7} ${wy - 4}H${wx + 7}L${wx + 12} ${cBot - 6}Z" fill="${aqC}"/><path d="M${wx + 2} ${wy - 4}H${wx + 7}L${wx + 12} ${cBot - 6}H${wx + 4}Z" fill="#000" fill-opacity=".15"/><rect x="${wx - 9}" y="${wy - 8}" width="18" height="5" fill="${aqD}"/>`;
        /* la ruota: doppio cerchio, raggi a coppie con le traverse, i vasi di coccio legati al cerchio esterno */
        let nw = `<g><animateTransform attributeName="transform" type="rotate" from="0 ${wx} ${wy}" to="-360 ${wx} ${wy}" dur="20s" repeatCount="indefinite"/>`;
        nw += `<circle cx="${wx}" cy="${wy}" r="${wr - 2}" stroke="${WOOD_D}" stroke-width="3.4" fill="none"/><circle cx="${wx}" cy="${wy}" r="${wr - 9}" stroke="${WOOD}" stroke-width="2" fill="none"/><circle cx="${wx}" cy="${wy}" r="${f2(wr * .42)}" stroke="${WOOD}" stroke-width="1.4" fill="none"/>`;
        for (let j = 0; j < 12; j++) { const an = j * Math.PI / 6, c = Math.cos(an), sn = Math.sin(an), px = -sn * 2.2, py = c * 2.2;
          nw += `<path d="M${f2(wx + px)} ${f2(wy + py)}L${f2(wx + c * (wr - 2) + px)} ${f2(wy + sn * (wr - 2) + py)}M${f2(wx - px)} ${f2(wy - py)}L${f2(wx + c * (wr - 2) - px)} ${f2(wy + sn * (wr - 2) - py)}" stroke="${WOOD}" stroke-width="1.5"/>`; }
        for (let j = 0; j < 20; j++) { const an = j * Math.PI / 10, c = Math.cos(an), sn = Math.sin(an);
          nw += `<g transform="translate(${f2(wx + c * (wr + 1))} ${f2(wy + sn * (wr + 1))}) rotate(${f2(an * 180 / Math.PI + 90)})"><path d="M-3.6 -1Q-4.6 4 -2.4 7.4H2.4Q4.6 4 3.6 -1Z" fill="#B0643F"/><ellipse cx="0" cy="-1" rx="3.6" ry="1.2" fill="#7E4426"/><path d="M-3.4 2.4H3.4" stroke="#8E4E2E" stroke-width=".6"/></g>`; }
        nw += `</g><circle cx="${wx}" cy="${wy}" r="6" fill="#3E2A1A"/><circle cx="${wx}" cy="${wy}" r="2.4" fill="${BRASS}"/>`;
        /* la canaletta in cima, appena a sinistra del culmine, dove i vasi si rovesciano; porta l'acqua a destra sull'acquedotto */
        const ch = `<path d="M${wx - 22} ${ty - 2}L${wx + 24} ${ty - 6}V${ty}L${wx - 22} ${ty + 4}Z" fill="#8A5E3B"/><path d="M${wx - 22} ${ty - 1}L${wx + 24} ${ty - 4.6}" stroke="${wTop}" stroke-width="2"/><path d="M${wx - 18} ${ty + 4}V${cTop - 2}M${wx - 22} ${ty + 4}h8" stroke="#6E5236" stroke-width="2.4"/>`;
        let pour = ''; for (let j = 0; j < 6; j++) pour += `<path class="sc-rain" style="--rd:${f2(.6 + j * .12)}s;--rdl:${f2(-j * .2)}s;--ro:.85" d="M${f2(wx - 14 + j * 3)} ${f2(ty - 14)}l.6 7" stroke="#E4F2F6" stroke-width="1.8" stroke-linecap="round"/>`;
        for (let j = 0; j < 9; j++) { const an = -Math.PI / 2 + (j + 1) * Math.PI / 10, x = wx + Math.cos(an) * (wr + 6), y = wy + Math.sin(an) * (wr + 6);   // gocce dai vasi che salgono a destra
          pour += `<path class="sc-rain" style="--rd:${f2(.5 + RM() * .4)}s;--rdl:${f2(-RM())}s;--ro:.7" d="M${f2(x)} ${f2(y)}v4" stroke="#E4F2F6" stroke-width="1.2" stroke-linecap="round"/>`; }
        const foam = `<path d="M${wx - wr + 6} ${cTop + 3}q8 -4 16 0q8 -4 16 0M${wx + 12} ${cTop + 4}q10 -4 20 0q8 -3 16 1" stroke="#FFFFFF" stroke-width="1.6" fill="none" stroke-opacity=".8"/>`;
        add(aq + pile + nw + ch + pour + frontWater(wx, cTop + 2, 150, 28) + foam + ripRings(wx + 40, cTop + 8, 3, 24), .35);
        add(grad('nb', cBot, BOT, landCol(.85), landCol(1)) + `<path d="M-20 ${cBot}H1240V${BOT + 40}H-20Z" fill="url(#${u}nb)"/><path d="M-20 ${cBot}H1240" stroke="${shade(landCol(.8), .3)}" stroke-width="3"/>` + groundDetail({ y: () => cBot + 6 }, 640, 1220, 24, 1.2, 1), .45);
      } else if (mi === 4) { // Floreale: il traghetto di Leonardo: la chiatta appesa al cavo attraversa il fiume da sola, la corrente la spinge
        backdrop();
        const mid = ridge([[-20, 238], [600, 232], [860, 228], [1220, 234]], 3);
        add(fill(mid, landCol(.42)) + patches(mid, 300, 1200, .42, 3) + forest(mid, 560, 1200, 16, .3, .42), .25);
        const far = ridge([[-20, 280], [700, 276], [1000, 278], [1220, 276]], 2), cTop = 300, cBot = 360;
        let fl = ''; for (let i = 0; i < 60; i++) { const x = 600 + RM() * 640, y = far.y(x) + 4 + RM() * 16; fl += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(1.4 + RM())}" fill="${['#D8453A', '#F4ECDD', '#8E5FA3', '#E3A33B'][i % 4]}"/>`; }
        const p1 = [1000, 196], p2 = [1188, BOT - 140];
        add(fill(far, landCol(.7)) + fl + `<path d="M${p1[0]} ${far.y(p1[0]) + 4}V${p1[1]}" stroke="#6E5236" stroke-width="5"/><path d="M${p1[0] - 8} ${p1[1] + 4}h16" stroke="#6E5236" stroke-width="2"/>` + cottage(940, far.y(940) + 4, .7, '#EFE2CC', '#8A4A3A', Ls(940)) + `<path d="M-20 ${cTop - 2}H1240" stroke="${shade(landCol(.8), .3)}" stroke-width="3"/>`, .3);
        s.push(water(cTop, -20, 1240)); add(flowOn(Array.from({ length: 40 }, (_, i) => [-20 + i * 32, cTop + 8 + RM() * (cBot - cTop - 16)]), () => 40, 30) + mirror(fill(far, landCol(.7)), cTop, .25), .3);
        const fx = 1076, fy = 328, cx = p1[0] + (p2[0] - p1[0]) * .42, cy = p1[1] + (p2[1] - p1[1]) * .42;
        let fe = `<path d="M-60 0H58L52 8H-54Z" fill="#5A3A26"/><path d="M-62 -6H60V0H-62Z" fill="#8A6A48"/>` + Array.from({ length: 13 }, (_, j) => `<path d="M${-60 + j * 10} -6V0" stroke="#5A3A26" stroke-width=".8"/>`).join('')
          + `<path d="M-60 -6V-20M-30 -6V-20M0 -6V-20M30 -6V-20M58 -6V-20M-60 -18H58" stroke="#6E5236" stroke-width="1.6"/><path d="M14 -6V-34H40V-6Z" fill="#E6D8C2"/><path d="M10 -34L27 -46L44 -34Z" fill="#7E5A8E"/><rect x="20" y="-28" width="7" height="7" fill="#3E4652"/>`
          + `<path d="M-20 -6V-60" stroke="#6E5236" stroke-width="2.4"/><circle cx="-20" cy="-60" r="2.4" fill="${BRASS}"/>`;
        const fer = at(fx, fy, 1.1, `<g class="sc-bob2">${fe}</g>`);
        add(`<path d="M${p1[0]} ${p1[1]}Q${f2((p1[0] + p2[0]) / 2)} ${f2((p1[1] + p2[1]) / 2 + 20)} ${p2[0]} ${p2[1]}" stroke="#3A3026" stroke-width="1.6" fill="none"/>` + mirror(fer, fy, .3) + fer + `<path d="M${f2(fx - 22)} ${f2(fy - 66)}L${f2(cx)} ${f2(cy + 10)}" stroke="#3A3026" stroke-width="1" fill="none"/>` + frontWater(fx, fy, 160, 14) + ripRings(fx - 70, fy + 2, 3, 26), .4);
        if (NIGHT || DAYB) addLit(win(fx + 20 * 1.1, fy - 28 * 1.1, 7 * 1.1, 7 * 1.1, .5), 1.6);
        add(grad('nb', cBot, BOT, landCol(.85), landCol(1)) + `<path d="M-20 ${cBot}H1240V${BOT + 40}H-20Z" fill="url(#${u}nb)"/><path d="M-20 ${cBot}H1240" stroke="${shade(landCol(.8), .3)}" stroke-width="3"/>`
          + `<path d="M${p2[0]} ${BOT + 10}V${p2[1]}" stroke="#6E5236" stroke-width="7"/><path d="M${p2[0] - 10} ${p2[1] + 6}h20" stroke="#6E5236" stroke-width="3"/>` + groundDetail({ y: () => cBot + 6 }, 640, 1220, 26, 1.3, 1), .45);
      } else { // Estiario: il mulino a marea. Il canale di pietra porta la marea dalla laguna al mare; la ruota gira sotto l'arco; barche da pesca ormeggiate
        backdrop(214);
        const qT = 306, qB = 350;
        const quay = `<path d="M-20 286H1240V${qT}H-20Z" fill="#CDB78F"/><path d="M-20 286H1240" stroke="#E2D2B0" stroke-width="3"/>` + Array.from({ length: 30 }, (_, j) => `<path d="M${-20 + j * 44} 288V${qT}" stroke="#A8936E" stroke-width="1"/>`).join('');
        add(quay, .25);
        s.push(water(qT, -20, 1240)); add(flowOn(Array.from({ length: 40 }, (_, i) => [-20 + i * 32, qT + 6 + RM() * (qB - qT - 12)]), () => 36, 30), .3);
        const hx = 1110, hy = 290, k = 1.1, L = Ls(hx);
        /* il mulino a marea: piano terra di bugnato con i due archi sul canale (sotto quello di destra gira la ruota), sopra l'intonaco chiaro
           con la fascia marcapiano, le finestre con gli scuri verdi, il balcone di ferro sopra la porta; il tetto a padiglione col trave del paranco e il sacco */
        const RT = rng(77), qs = '#CDB78F', pl = '#F1E9DA';
        let tm = `<rect x="-62" y="-20" width="124" height="20" fill="${qs}"/>`;
        for (let r = 0; r < 4; r++) for (let x = -62 + (r % 2) * 8; x < 62; x += 16) tm += `<rect x="${f2(x + .6)}" y="${f2(-19.4 + r * 5)}" width="${f2(Math.min(15, 61.4 - x))}" height="4.4" rx="1" fill="${shade(qs, (RT() - .3) * .12)}"/>`;
        tm += `<path d="M-44 16V-4Q-30 -22 -16 -4V16ZM16 16V-4Q30 -22 44 -4V16Z" fill="#2E2C28"/><path d="M-46 16V-4Q-30 -25 -14 -4V16M14 16V-4Q30 -25 46 -4V16" stroke="#E2D2B0" stroke-width="2.4" fill="none"/>`
          + [-30, 30].map((x) => `<path d="M${x - 3} -18.4h6l-1 5h-4z" fill="#E2D2B0"/>`).join('') + `<path d="M-50 16V0H-46M50 16V0H46" stroke="#A8936E" stroke-width="2"/>`;
        tm += `<rect x="-58" y="-58" width="116" height="38" fill="${pl}"/><path d="M${L > 0 ? 14 : -58} -20V-58H${L > 0 ? 58 : -14}V-20Z" fill="#000" fill-opacity=".07"/><rect x="-62" y="-22.4" width="124" height="3" fill="#E2D2B0"/><rect x="-62" y="-19.4" width="124" height="1" fill="#000" fill-opacity=".2"/>`
          + [-36, -12, 12, 36].map((x) => winS(x - 4, -48, 8, 11, '#4E6B4A', '#E2D2B0', x > 0)).join('');
        tm += `<path d="M-6.4 0V-12A6.4 6.4 0 0 1 6.4 -12V0" stroke="#E2D2B0" stroke-width="2" fill="none"/><path d="M-5 0V-12A5 5 0 0 1 5 -12V0Z" fill="#5A3A26"/>`;
        tm += `<path d="M-14 -26H14" stroke="#3A3A3A" stroke-width="1.4"/>` + Array.from({ length: 8 }, (_, j) => `<path d="M${-13 + j * 3.7} -26V-31" stroke="#3A3A3A" stroke-width=".8"/>`).join('') + `<path d="M-14 -31H14" stroke="#3A3A3A" stroke-width="1"/><rect x="-15" y="-26" width="30" height="2" fill="#E2D2B0"/>`
          + `<path d="M-4 -26V-40A4 4 0 0 1 4 -40V-26Z" fill="#4E6B4A"/>`;
        tm += tileRoof(-66, 66, -57, -78, 30, '#C0392B') + `<path d="M52 -62H74" stroke="#6E5236" stroke-width="3"/><circle cx="72" cy="-60" r="2.2" fill="#3A3026"/><path d="M72 -58V-36" stroke="#8E7A58" stroke-width=".8"/><path d="M68 -36h8l1 8h-10z" fill="#D9CDB4"/>`
          + `<rect x="-40" y="-90" width="7" height="14" fill="${pl}"/><path d="M-42 -90h11" stroke="#A8352B" stroke-width="2.4"/>`;
        const wx = hx + 30 * k, wy = hy + 14, wr = 24;
        let boats = ''; [[880, 312, '#3E86B8'], [960, 318, '#C0392B']].forEach(([bx, by, c]) => { boats += at(bx, by, .7, `<path d="M-40 -8Q-36 0 -24 2H28Q38 0 42 -8Q40 4 28 8H-26Q-38 5 -40 -8Z" fill="#F4F1EA"/><path d="M-38 -2Q0 4 40 -2" stroke="${c}" stroke-width="2.4" fill="none"/><path d="M-40 -8l-3 -8M42 -8l2 -7" stroke="#C99A5E" stroke-width="2.4"/>`); });
        add(shadowAt(hx, hy, 60) + at(hx, hy, k, tm) + wheel(wx, wy, wr, -1, 12) + frontWater(wx, qT + 6, 70, 18) + boats + frontWater(920, 314, 160, 10) + ripRings(wx + 18, qT + 8, 3, 20), .35);
        if (NIGHT || DAYB) addLit([-36, 12].map((x) => win(hx + (x - 4) * k, hy - 44 * k, 8 * k, 10 * k, .5)).join(''), 1.6);
        add(grad('nb', qB, BOT, '#C9B48E', '#A8936E') + `<path d="M-20 ${qB}H1240V${BOT + 40}H-20Z" fill="url(#${u}nb)"/><path d="M-20 ${qB}H1240" stroke="#E2D2B0" stroke-width="4"/>` + Array.from({ length: 16 }, (_, j) => `<path d="M${-20 + j * 80} ${qB + 2}V${BOT + 40}" stroke="#8E7A58" stroke-width="1.2" stroke-opacity=".5"/>`).join('')
          + `<circle cx="760" cy="${qB + 14}" r="6" fill="#3A3836"/><path d="M760 ${qB + 14}Q840 ${qT + 20} 880 ${qT + 6}" stroke="#C9B48A" stroke-width="1.4" fill="none"/>`, .45);
      }
      break;
    }
    default: { // Validare: in vetta. L'ometto e la bandiera sulla roccia, con quello che si trova lassù in quel mese; sotto, il mare di nuvole; il sentiero che abbiamo fatto
      const fr0 = ridge([[-20, 190], [400, 170], [640, 140], [760, 104], [860, 150], [980, 122], [1100, 160], [1220, 140]], 8);
      add(fill(fr0, haze(LD.far, 0)) + (mi >= 1 && mi <= 4 ? snowCap(fr0, snowy ? 168 : 132, 24) : ''), .1);
      const cl = NIGHT ? mixHex('#4A5672', '#C9D2E6', moonL) : low > .3 ? mixHex('#FFFFFF', '#F7D3A8', .35) : '#FBFCFD', cs = NIGHT ? mixHex('#2E3750', '#8E9AB8', moonL) : low > .3 ? '#E4BC94' : '#D5DCE5';
      const layer = (y0, r, d, gid) => { const RB = rng(seed + Math.round(y0)), c0 = mixHex(cl, hzC, (1 - d) * .35), c1 = mixHex(cs, hzC, (1 - d) * .35), g0 = cgrad(c0), g1 = cgrad(mixHex(c0, c1, .5));
        let o = `<defs><linearGradient id="${u}${gid}" x1="0" y1="${f2(y0)}" x2="0" y2="${f2(y0 + r * 3)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${rgb(c0)}"/><stop offset="1" stop-color="${rgb(c1)}"/></linearGradient></defs><rect x="-20" y="${f2(y0 + r * .25)}" width="${SW + 40}" height="${f2(BOT - y0 + 40)}" fill="url(#${u}${gid})"/>`;
        for (let x = -20; x < SW + 20;) { const rr = r * (1 + RB() * 1.1); o += `<ellipse cx="${f2(x + rr * .6)}" cy="${f2(y0 + rr * .35)}" rx="${f2(rr * 1.6)}" ry="${f2(rr * .8)}" fill="url(#${g1})"/><circle cx="${f2(x + rr * .6)}" cy="${f2(y0 - rr * .1 + RB() * r * .2)}" r="${f2(rr)}" fill="url(#${g0})"/>`; x += rr * 1.15; }
        return o; };
      const pk = (cx, top, w, d) => { const r = ridge([[cx - w, 250], [cx - w * .5, top + 30], [cx - w * .12, top + 6], [cx, top], [cx + w * .2, top + 10], [cx + w * .55, top + 34], [cx + w, 250]], 2, 12); return fill(r, haze(LD.rock, d)) + (snowy || top < 210 ? snowCap(r, top + 16, 12) : ''); };
      const below = mi === 0 ? 'colli' : mi === 5 ? 'piana' : mi === 6 ? 'mare' : 'nuvole';
      if (below === 'nuvole') { add(layer(204, 10, .1, 'c1'), .15); add(pk(780, 168, 64, .25) + pk(900, 196, 44, .3) + layer(228, 16, .35, 'c2'), .2); add(layer(256, 26, .6, 'c3'), .25); }
      else if (below === 'mare') { backdrop(214); waves(214); }
      else { /* Foliaio: i colli delle vigne con la nebbia nelle valli · Messidoro: la piana del grano che tremola nel caldo */
        [[226, .25], [252, .45], [280, .65]].forEach(([y0, d], i) => { const rg2 = ridge([[-20, y0 + 6], [500, y0], [760, y0 - 6], [900, y0 + 4], [1060, y0 - 4], [1220, y0 + 2]], 5);
          add(fill(rg2, landCol(d)) + patches(rg2, 300, 1220, d, 3) + (below === 'colli' ? forest(rg2, 600, 1200, 10, .3 + d * .4, d) : hedge(rg2, 300, 1200, 18, d)) + mist(y0 + 4, 22, below === 'colli' ? .7 : .35, 28 + i * 4, 40), .15 + i * .05); }); }
      const rock = ridge([[860, BOT], [920, 340], [990, 300], [1050, 278], [1100, 270], [1150, 276], [1220, 300]], 3);
      const rc = mi === 2 ? '#E9F0F4' : mixHex(LD.rock, LD.near, .3);
      const X = 1100, y = rock.y(X) + 3, SM = summitMark(mi, Ls(X));
      const cracks = `<path d="M1000 300l20 14l-6 18M1060 286l-10 22l14 20M1140 282l12 26" stroke="${shade(rc, .25)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      const path = `<path d="${ptsD(crSample([[920, BOT], [980, 360], [930, 340], [1010, 318], [1050, 300], [X - 20, y]], 4))}" stroke="${LD.path}" stroke-opacity=".7" stroke-width="2.6" fill="none" stroke-dasharray="1 5" stroke-linecap="round"/>`;
      add(fill(rock, rc) + `<defs><linearGradient id="${u}rsh" x1="1080" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-opacity="0"/><stop offset=".5" stop-opacity=".1"/><stop offset="1" stop-opacity=".16"/></linearGradient></defs><path d="M1100 ${f2(rock.y(1100))}${[1120, 1140, 1160, 1180, 1200, 1220].map((x) => `L${x} ${f2(rock.y(x))}`).join('')}V${BOT + 40}H1040Z" fill="url(#${u}rsh)" opacity="${Ls(1150) > 0 ? 1 : 0}"/>` + cracks + path + (snowy ? '' : groundDetail(rock, 960, 1220, 10, .9, .9)) + shadowAt(X, y, 36) + at(X, y, 1.25, SM.svg), .35);
      if (SM.lamp && (NIGHT || DAYB || mi === 1)) addLit(at(X, y, 1.25, glow(SM.lamp[0], SM.lamp[1], 26)), 1.6);
      if (below === 'nuvole') s.push(`<g class="sc-fade" style="--d:.5s"><g class="sc-fog" opacity=".9" style="--fgd:40s;--fgx:20px">${layer(BOT - 34, 58, 1, 'c4')}</g></g>`);
      break;
    }
  }
  function waves(top) { s.push(tone(`<g class="sc-fade" style="--d:.5s">${[[top + 22, 60, 1.4, .5], [top + 50, 74, 1.7, .4], [top + 90, 90, 2, .32]].map(([y, wl, w, o], i) => `<path class="sc-wave" style="--wl:${-wl}px;--wd:${5 + i}s" d="${waveD(300, SW + wl * 2, y, wl, 3)}" fill="none" stroke="#FFFFFF" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`).join('')}</g>`)); }
  /* ---- 2.9: il meteo del mese, davanti ---- */
  switch (mi) {
    case 0: { // Foliaio: le foglie che cadono col vento; al mattino e di notte la nebbiolina nelle valli
      let lv = ''; for (let i = 0; i < 9; i++) lv += `<g transform="translate(${f2(760 + RW() * 440)} ${f2(-T * .3 + RW() * 160)})"><g class="sc-fall2" style="--fd:${f2(9 + RW() * 5)}s;--fdl:${f2(-RW() * 14)}s;--fx:${f2(-60 - RW() * 80)}px"><path d="${mapleD(4 + RW() * 2.4)}" fill="${AUT[i % 4]}"/></g></g>`;
      add(lv, .8); if (hour < 10.5 || NIGHT) add(mist(238, 30, .55, 30, 40) + mist(262, 26, .4, 26, -40), .4); break; }
    case 1: { // Brumale: la nebbia che si sfilaccia tra i piani (di notte si vede solo se c'è la luna)
      let w = ''; [[232, 3, 150], [262, 3, 190], [300, 2, 230], [BOT - 46, 2, 260]].forEach(([y0, n, rx]) => { for (let i = 0; i < n; i++) { const x = 700 + RW() * 520, y = y0 + RW() * 14;
        w += `<ellipse class="sc-wisp" style="--wsd:${f2(30 + RW() * 22)}s;--wsl:${f2(-RW() * 30)}s;--wsx:${f2((RW() < .5 ? -1 : 1) * (60 + RW() * 90))}px;--wo0:.45;--wo1:.85" cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx * (.7 + RW() * .5))}" ry="${f2(16 + RW() * 14)}" fill="url(#${u}wsp)"/>`; } });
      s.push(`<g class="sc-fade" style="--d:.9s"><g opacity="${f2(DAYB ? .55 : .12 + moonL * .3)}">${w}</g></g>`); break; }
    case 2: break;
    case 3: if (RAINW) { /* la pioggia la disegna il blocco della pioggia */ }
      else if (!opts.prot) add(Array.from({ length: 8 }, (_, i) => `<ellipse class="sc-fall2" style="--fd:${f2(9 + RW() * 4)}s;--fdl:${f2(-RW() * 12)}s;--fx:${f2(-50 - RW() * 50)}px" cx="${f2(800 + RW() * 420)}" cy="${f2(-T * .2 + RW() * 120)}" rx="3" ry="1.8" fill="${['#F4C9D8', '#FFFFFF', '#E89BB5'][i % 3]}"/>`).join(''), 1); break;
    case 4: if (!NIGHT) { if (!opts.prot) add([['#F2A23A', '#F2C230'], ['#8E5FA3', '#B58AC8']].map(([a, b], i) => butterfly(f2(760 + RW() * 180 + i * 200), f2(170 + RW() * 90), a, b, RW)).join(''), 1.4);
        add(Array.from({ length: 14 }, () => `<circle class="sc-twinkle" style="--td:${f2(2 + RW() * 3)}s;--tdl:${f2(RW() * 3)}s" cx="${f2(740 + RW() * 460)}" cy="${f2(150 + RW() * 180)}" r="${f2(.8 + RW() * .8)}" fill="#FFF6C8"/>`).join(''), 1.2); }
      else s.push(lit(Array.from({ length: 16 }, () => { const x = 740 + RW() * 460, y = 270 + RW() * (BOT - 300); return `<g class="sc-twinkle" style="--td:${f2(1.6 + RW() * 2.4)}s;--tdl:${f2(RW() * 3)}s"><circle cx="${f2(x)}" cy="${f2(y)}" r="6" fill="url(#${u}l)"/><circle cx="${f2(x)}" cy="${f2(y)}" r="1.5" fill="#F4FFB4"/></g>`; }).join(''), 1.6)); break;
    case 5: case 6: if (!NIGHT && !opts.prot) add(gull(860, 120 - T * .2, .9, '#3B3012', RW) + gull(1130, 80 - T * .3, .7, '#3B3012', RW), 1); break;
  }
  /* 3.0: la pioggia vera: righe oblique fitte (più lunghe davanti), cerchi che si aprono sull'acqua, schizzi a terra */
  if (RAIN) { const RR = rng(seed + 7), n = (RAINW ? 170 : 120) + Math.round(T / 2); let dr = '', fr = '';
    for (let i = 0; i < n; i++) { const near = RR() < .3, x = 700 + RR() * 540, y = -40 - T + RR() * (BOT + T), l = near ? 18 + RR() * 10 : 9 + RR() * 7;
      const str = `<path class="sc-rain" style="--rd:${f2(near ? .55 + RR() * .3 : .8 + RR() * .5)}s;--rdl:${f2(-RR() * 1.6)}s;--ro:${f2(NIGHT ? .16 + RR() * .18 : near ? .4 + RR() * .25 : .22 + RR() * .25)}" d="M${f2(x)} ${f2(y)}l${f2(-l * .22)} ${f2(l)}" stroke="${NIGHT ? '#B4C0D8' : near ? '#5E6E84' : '#7A8A9E'}" stroke-width="${near ? 1.4 : 1}" stroke-linecap="round"/>`;
      if (near) fr += str; else dr += str; }
    s.push(`<g class="sc-fade" style="--d:.4s">${dr}</g>`);
    let rings = ''; waterTops.forEach(([top, x0, x1]) => { for (let i = 0; i < 26; i++) { const t = Math.pow(RR(), .7), y = top + 6 + t * (BOT - top - 8), w = 3 + t * 12, x = Math.max(x0, 700) + RR() * (Math.min(x1, 1220) - Math.max(x0, 700));
      rings += `<ellipse class="sc-ripple" style="--rpd:${f2(1.2 + RR() * .8)}s;--rpl:${f2(-RR() * 2)}s" cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(w * .2)}" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="${f2(.6 + t * .6)}"/>`; } });
    if (!waterTops.length) for (let i = 0; i < 16; i++) { const x = 700 + RR() * 520, y = BOT - 70 + RR() * 60; rings += `<ellipse class="sc-ripple" style="--rpd:${f2(1 + RR() * .8)}s;--rpl:${f2(-RR() * 2)}s" cx="${f2(x)}" cy="${f2(y)}" rx="5" ry="1.2" fill="none" stroke="#FFFFFF" stroke-opacity=".5" stroke-width=".8"/>`; }
    s.push(`<g class="sc-fade" style="--d:.6s">${rings}${fr}</g>`); }
  /* 3.0: in Ianuario la neve cade su tre piani: fiocchi minuti lontani, medi, grandi e lenti davanti */
  if (snowy && !opts.prot) { const RS = rng(seed + 9); let sn = '';
    for (let i = 0; i < 70 + Math.round(T / 4); i++) { const layer = RS() < .45 ? 0 : RS() < .7 ? 1 : 2, r = [.7, 1.4, 2.6][layer] + RS() * [.4, .6, 1.2][layer];
      sn += `<circle class="sc-fall2" style="--fd:${f2([16, 11, 8][layer] + RS() * 4)}s;--fdl:${f2(-RS() * 16)}s;--fx:${f2((RS() - .3) * [30, 50, 80][layer])}px" cx="${f2(700 + RS() * 540)}" cy="${f2(-T - 20 + RS() * (T + 120))}" r="${f2(r)}" fill="#FFFFFF" fill-opacity="${[.6, .85, .95][layer]}"/>`; }
    s.push(tone(`<g class="sc-fade" style="--d:.8s">${sn}</g>`)); }
  return `<svg class="scene${NIGHT ? ' night' : ''}" viewBox="0 ${-T} ${SW} ${SH + T + B}" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">${defs}<defs>${extraDefs.join('')}</defs><g class="sc-enter">${s.join('')}</g></svg>`;
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

/* fase della luna (0 = nuova, 0,5 = piena) alle 22 del giorno dato, dal novilunio del 6/1/2000 18:14 UTC; errore di qualche ora */
function moonPhase(iso) { const [y, m, d] = iso.split('-').map(Number), t = Date.UTC(y, m - 1, d, 21, 0) - Date.UTC(2000, 0, 6, 18, 14), f = (t / 864e5) / 29.530588853; return f - Math.floor(f); }
window.ORN = { version: '3.2', moonPhase, MONTHS, LETTER_META, metaKeyFor, dayBg, illusFor, sceneSVG, hasVariants, themeFor, patternURI, ornamentSVG, playAll, seasonFx, setToday: (s) => { todayStr = s; } };
})();
