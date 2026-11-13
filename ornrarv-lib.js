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
const paddleSteamer = (u) => {
  let s = `<defs><clipPath id="${u}pw"><rect x="-30" y="-14" width="68" height="30"/></clipPath></defs>`;
  s += `<path d="M-74 -18V-58M60 -20V-44" stroke="#2A2420" stroke-width="1.4"/><path class="sc-flagw" d="M60 -44L74 -41L60 -38Z" fill="#B23A2E"/><path class="sc-flagw" d="M-74 -58L-62 -55.6L-74 -53Z" fill="#E3A33B"/>`
    + `<path d="M2 -38L7 -86H20L17 -38Z" fill="#D9A441"/><path d="M12 -38L14 -86H20L17 -38Z" fill="#000" fill-opacity=".12"/><path d="M6.6 -86H20.2L19.8 -79H7.2Z" fill="#1E1E1E"/><path d="M5.4 -64H18.6" stroke="#B23A2E" stroke-width="2.4"/>`
    + `<rect x="-44" y="-53" width="24" height="15" rx="1.2" fill="#F4EEE0"/><path d="M-46 -53H-18" stroke="#2A2420" stroke-width="1.6"/><rect x="-40" y="-49" width="5" height="6" fill="#3E6E7A"/><rect x="-32" y="-49" width="5" height="6" fill="#3E6E7A"/>`
    + `<path d="M-68 -38H62" stroke="#2A2420" stroke-width="1.2"/>` + Array.from({ length: 14 }, (_, i) => `<path d="M${-66 + i * 9.4} -38V-34" stroke="#2A2420" stroke-width=".8"/>`).join('')
    + `<rect x="-64" y="-34" width="120" height="16" rx="1.2" fill="#F4EEE0"/><rect x="20" y="-34" width="36" height="16" fill="#000" fill-opacity=".06"/>`
    + Array.from({ length: 12 }, (_, i) => `<path d="M${-58 + i * 9} -22V-28Q${-55.5 + i * 9} -31 ${-53 + i * 9} -28V-22Z" fill="#3E6E7A"/>`).join('');
  s += `<path d="M-92 -20L82 -18Q88 -16 90 -12L82 4Q40 9 -60 8Q-82 5 -88 -10Z" fill="#20242A"/><path d="M-92 -20L82 -18L82 -14.6L-90.6 -16Z" fill="#F1ECE0"/><path d="M-84 0Q-20 7 84 0L82 4Q40 9 -60 8Q-78 6 -84 0Z" fill="#A8352B"/>`;
  let wh = ''; for (let k = 0; k < 10; k++) wh += `<g transform="rotate(${k * 36} 4 -14)"><path d="M4 -14V8" stroke="#3B3012" stroke-width="1.4"/><rect x="0.6" y="6" width="6.8" height="4" fill="#7A2620"/></g>`;
  s += `<g clip-path="url(#${u}pw)"><g><animateTransform attributeName="transform" type="rotate" from="0 4 -14" to="-360 4 -14" dur="6s" repeatCount="indefinite"/>${wh}</g></g>`
    + `<path d="M-24 -14A28 28 0 0 1 32 -14Z" fill="#F1ECE0" stroke="#20242A" stroke-width="1.6"/>` + Array.from({ length: 7 }, (_, i) => { const a = Math.PI * (1 + (i + 1) / 8); return `<path d="M4 -14L${f2(4 + Math.cos(a) * 26)} ${f2(-14 + Math.sin(a) * 26)}" stroke="#B9AE98" stroke-width="1.1"/>`; }).join('')
    + `<path d="M-14 -14A18 18 0 0 1 22 -14" stroke="#B23A2E" stroke-width="2" fill="none"/><circle cx="4" cy="-14" r="3" fill="#20242A"/>`;
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
function cottage(x, y, s, wall, roof, L, chimney = true) {
  const w = 17 * s, h = 15 * s;
  return `<rect x="${f2(x - w)}" y="${f2(y - h)}" width="${f2(2 * w)}" height="${f2(h)}" fill="${wall}"/><rect x="${f2(L > 0 ? x : x - w)}" y="${f2(y - h)}" width="${f2(w)}" height="${f2(h)}" fill="#000" fill-opacity=".13"/>`
    + `<path d="M${f2(x - w - 3 * s)} ${f2(y - h + .5)}L${f2(x)} ${f2(y - h - 13 * s)}L${f2(x + w + 3 * s)} ${f2(y - h + .5)}Z" fill="${roof}"/><path d="M${f2(x)} ${f2(y - h - 13 * s)}L${f2(x + L * (w + 3 * s))} ${f2(y - h + .5)}H${f2(x)}Z" fill="#000" fill-opacity=".16"/>`
    + (chimney ? `<rect x="${f2(x + 7 * s)}" y="${f2(y - h - 13 * s)}" width="${f2(4 * s)}" height="${f2(9 * s)}" fill="${shade(roof, .25)}"/>` : '')
    + `<rect x="${f2(x - 3 * s)}" y="${f2(y - 8 * s)}" width="${f2(6 * s)}" height="${f2(8 * s)}" fill="${shade(roof, .35)}"/>`;
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
    wood: ['#3E3128', '#5A4636', '#7A6450'], roof: '#4E5662', tower: 'wood', lamp: true,
    boat: { hull: '#2A2622', trim: '#C9C1B2', band: '#141210', coat: '#3E4650', hat: 'cappuccio', canopy: true },
    sail: { rig: 'terzaroli', main: '#B9B5AC', jib: '#A8A49B', hull: '#2E3440', stripe: '#C9C1B2', band: '#1A1E26', pen: '#6A3A34', lamp: true },
    town: 'lombardo', spire: 'piramide', body: '#A9A59C', flag: '#5A3A34', terr: 'lampione' },
  { // Ianuario: montagne e neve
    wood: ['#4A3426', '#6A4A34', '#8A6A4E'], roof: '#4E5A64', tower: 'baita',
    boat: { hull: '#F2F4F6', trim: '#2F5A7A', band: '#2F5A7A', coat: '#7A2E2A', hat: 'pelliccia', cargo: 'neve' },
    sail: { rig: 'ghiaccio', main: '#FBF7EE', jib: '#F1E8D4', hull: '#2F5A7A', stripe: '#FFFFFF', band: '#B23A2E', pen: '#B23A2E' },
    town: 'baite', spire: 'cipolla', body: '#ECE8E0', flag: '#B23A2E', terr: 'ghiaccioli' },
  { // Germinale: primavera, alberi in fiore
    wood: ['#7A5A3E', '#A27A54', '#C9A27A'], roof: '#5E8A4A', tower: 'wood', vine: true,
    boat: { hull: '#5E8A5A', trim: '#F4EFE2', band: '#3E6440', coat: '#C9A27A', hat: 'none', cargo: 'fiori' },
    sail: { rig: 'sloop', main: '#FBF7EE', jib: '#F4EFE2', hull: '#F4EFE2', stripe: '#5E8A5A', band: '#3E6440', pen: '#E89BB5' },
    town: 'pastello', spire: 'piramide', body: '#EBCFC2', flag: '#5E8A4A', terr: 'glicine' },
  { // Floreale: i campi in fiore
    wood: ['#6A4A3A', '#8E6A52', '#B48E70'], roof: '#7E5A8E', tower: 'wood', box: true,
    boat: { hull: '#3E6E9A', trim: '#F4EFE2', band: '#2A4E70', coat: '#E9DCC4', hat: 'none', cargo: 'lavanda' },
    sail: { rig: 'sloop', main: '#FBF7EE', jib: '#E6D6EE', hull: '#FFFFFF', stripe: '#7E5A8E', band: '#4E3A5E', pen: '#7E5A8E' },
    town: 'graticcio', spire: 'piramide', body: '#E6D8C2', flag: '#7E5A8E', terr: 'fioriere' },
  { // Messidoro: la costa del grano, estate
    wood: [WOOD_D, WOOD, WOOD_L], roof: '#A9502F', tower: 'saracena',
    boat: { hull: '#F4F1EA', trim: '#2F6E9A', band: '#B23A2E', coat: '#EDE6D8', hat: 'paglia', cargo: 'reti', gozzo: true },
    sail: { rig: 'latina', main: '#F7F0DE', jib: '#F7F0DE', hull: '#F4F1EA', stripe: '#2F6E9A', band: '#B23A2E', pen: '#2F6E9A' },
    town: 'bianco', spire: 'campanile', body: '#F4F1EA', flag: '#2F6E9A', terr: 'limone' },
  { // Estiario: il mare d'estate, le scogliere, il tramonto
    wood: [WOOD_D, WOOD, WOOD_L], roof: '#C0392B', tower: 'bagnino',
    boat: { hull: '#3E9AA6', trim: '#F4F1EA', band: '#1E6474', coat: '#F4F1EA', hat: 'paglia', cargo: 'ombrellone' },
    sail: { rig: 'spinnaker', main: '#FBF7EE', jib: '#F1E8D4', hull: '#F4F1EA', stripe: '#C0392B', band: '#1E2A44', pen: '#C0392B' },
    town: 'ligure', spire: 'piramide', body: '#D9A85B', flag: '#C0392B', terr: 'buganvillea' },
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
  return oar(-3, .55, 1.8) + lantern + hull + canopy + cargo + body + oar(0, 1, 2.2) + `<circle cx="5" cy="-4" r="1.6" fill="${BRASS_D}"/>`;
}
/* la barca a vela (prua a sinistra): il vento viene da poppa, la bandierina in testa d'albero punta avanti, la scia resta dietro.
   Il capitano tiene il timone a poppa e guarda avanti. rig: sloop · terzaroli (vele ridotte col tempo brutto) · latina (la vela triangolare del Mediterraneo)
   ghiaccio (l'iceboat sui pattini, sul lago gelato: origine = il ghiaccio) · spinnaker (la vela a pallone col vento in poppa) */
const captainL = () => `<g transform="scale(-1 1)">${captain()}</g>`;
function sailBoat2(st) {
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
  if (ice) s += `<path d="M-60 -9L44 -10L46 -4L-56 -2Z" fill="${st.hull}"/><path d="M-60 -9L44 -10" stroke="${st.stripe}" stroke-width="1.4"/><path d="M-14 -4L-20 8M18 -4L24 8M-52 -3L-56 8" stroke="#3A3A3A" stroke-width="2"/><path d="M-30 9H34M-66 9H-46" stroke="#9AA6B2" stroke-width="2.6" stroke-linecap="round"/><path d="M-14 -4H18" stroke="${st.band}" stroke-width="3"/>`;
  else s += `<path d="M44 -8L46 6" stroke="#5A4632" stroke-width="2.2"/><path d="M-50 -12Q-10 -5 44 -9Q40 5 22 9L-24 9Q-40 6 -50 -12Z" fill="${st.hull}"/><path d="M-50 -12Q-10 -5 44 -9L43.5 -6Q-10 -1 -49 -9Z" fill="${st.stripe}"/><path d="M-38 4Q0 7 36 3" stroke="${st.band}" stroke-width="1.6" fill="none"/>`;
  return dy ? `<g transform="translate(0 ${dy})">${s}</g>` : s;
}
/* le vedette, una per luogo: di legno (con le varianti del mese), la baita in quota, la torre saracena sulla costa, la torretta del bagnino sulla duna */
function watchtower(mi, L) {
  const st = STY[mi], [wd, wm, wl] = st.wood, snowy = mi === 2;
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
  const st = STY[mi], body = st.body, sd = shade(body, .22), snowy = mi === 2;
  let t = `<rect x="-25" y="-8" width="50" height="8" rx="1" fill="${shade(body, .3)}"/><rect x="-19" y="-100" width="38" height="92" fill="${body}"/><rect x="${L > 0 ? 5 : -19}" y="-100" width="14" height="92" fill="#000" fill-opacity=".12"/>`;
  if (mi === 0) for (let j = 1; j < 18; j++) t += `<path d="M-19 ${-8 - j * 5.2}H19" stroke="${sd}" stroke-opacity=".35" stroke-width=".6"/>`;
  else for (let j = 1; j < 8; j++) t += `<path d="M-19 ${-8 - j * 12}H19" stroke="${sd}" stroke-opacity=".5" stroke-width=".9"/>`;
  if (mi === 2) t += `<path d="M-19 -8V-100M19 -8V-100" stroke="#7A5236" stroke-width="2.4"/>`;
  t += `<path d="M-7 -8V-26Q0 -33 7 -26V-8Z" fill="${WOOD_D}"/><rect x="-4" y="-56" width="8" height="12" rx="4" fill="#3E3A34"/>`
    + `<rect x="-22" y="-104" width="44" height="5" fill="${shade(body, .12)}"/><path d="M-19 -104V-124H19V-104" fill="${light(body, .08)}"/>`;
  if (st.spire === 'campanile') t += `<path d="M-14 -104V-118Q-9 -124 -4 -118V-104ZM4 -104V-118Q9 -124 14 -118V-104Z" fill="#2E261E"/>`;
  else t += `<path d="M-12 -104V-117Q-6 -123 0 -117Q6 -123 12 -117V-104Z" fill="#2E261E"/>`;
  t += `<g><animateTransform attributeName="transform" type="rotate" values="-6 0 -119;6 0 -119;-6 0 -119" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><path d="M0 -119V-116" stroke="#3A3226" stroke-width="1"/><path d="M-4.6 -106Q-4.6 -116 0 -116Q4.6 -116 4.6 -106Z" fill="#B8863B"/></g>`;
  if (st.spire === 'merli') { t += `<rect x="-22" y="-127" width="44" height="4" fill="${shade(body, .12)}"/>`; for (let j = 0; j < 5; j++) t += `<path d="M${-21 + j * 9} -127v-9l3 3l3 -3v9z" fill="${body}"/>`; }
  else if (st.spire === 'cipolla') t += `<rect x="-22" y="-127" width="44" height="4" fill="#7A5236"/><path d="M-17 -127C-24 -142 -6 -146 0 -162C6 -146 24 -142 17 -127Z" fill="#4E6E64"/><path d="M0 -162C6 -146 24 -142 17 -127H0Z" fill="#000" fill-opacity=".16"/><path d="M-15 -134Q0 -150 15 -134Q8 -146 0 -152Q-8 -146 -15 -134Z" fill="#FFFFFF"/><circle cx="0" cy="-164" r="2.6" fill="${BRASS}"/><path d="M0 -166V-176M-3 -172H3" stroke="#3A3226" stroke-width="1.2"/>`;
  else if (st.spire === 'campanile') t += `<rect x="-22" y="-127" width="44" height="4" fill="${shade(body, .08)}"/><path d="M-14 -127Q0 -146 14 -127Z" fill="${light(body, .05)}"/><path d="M0 -146Q8 -137 14 -127H0Z" fill="#000" fill-opacity=".1"/><path d="M0 -146V-158M-4 -153H4" stroke="#3A3226" stroke-width="1.4"/>`;
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
function townHouse(kind, x, y, s, i, L, R) {
  const P = { toscano: { w: ['#E3C99E', '#D9B98A', '#EAD7B5', '#CFAE84'], r: ['#B05A36', '#A24E30', '#BC6A42'], sh: '#4E6B4A' },
    lombardo: { w: ['#B9B4AA', '#A9A59C', '#C7C2B8', '#9E9A92'], r: ['#5A4E4A', '#4E4844', '#665A54'], sh: '#5E4636' },
    baite: { w: ['#EEEAE2', '#E6E0D6'], r: ['#4E4A48', '#5A5450'], sh: '#7A2E2A' },
    pastello: { w: ['#F0C9C0', '#F3E0A8', '#CFE0C8', '#F6E7D8', '#E6D2EC'], r: ['#B5643A', '#A9583A'], sh: '#5E8A5A' },
    graticcio: { w: ['#F2E8D6', '#EFE2CC', '#F4ECDF'], r: ['#8A4A3A', '#7A4236', '#94523E'], sh: '#4E3A5E' },
    bianco: { w: ['#F6F3EC', '#F1EDE4', '#FAF8F3'], r: ['#F1EDE4'], sh: '#2F6E9A' },
    ligure: { w: ['#E7A65C', '#D9644A', '#F2D27A', '#E8B4A6', '#C97B52', '#E9C9A0'], r: ['#6E6A66', '#7A746E'], sh: '#3E6E46' } }[kind];
  const wall = P.w[i % P.w.length], roof = P.r[i % P.r.length], tall = kind === 'ligure' ? 2 + (i % 2) : 1 + (i % 3 === 0 ? 1 : 0);
  const w = (kind === 'ligure' ? 11 : 13 + (i % 3) * 2.5) * s, fh = 11 * s, h = fh * tall + 3 * s, gable = kind === 'baite' || kind === 'graticcio' || (kind === 'lombardo' && i % 2);
  let o = `<rect x="${f2(x - w)}" y="${f2(y - h)}" width="${f2(2 * w)}" height="${f2(h)}" fill="${wall}"/><rect x="${f2(L > 0 ? x + w * .35 : x - w)}" y="${f2(y - h)}" width="${f2(w * .65)}" height="${f2(h)}" fill="#000" fill-opacity=".1"/>`;
  if (kind === 'baite') o += `<rect x="${f2(x - w)}" y="${f2(y - h)}" width="${f2(2 * w)}" height="${f2(h * .55)}" fill="#7A5236"/><path d="M${f2(x - w)} ${f2(y - h * .45)}H${f2(x + w)}" stroke="#5A3A26" stroke-width="${f2(1.6 * s)}"/>`
    + Array.from({ length: 6 }, (_, j) => `<path d="M${f2(x - w + (j + .5) * w / 3)} ${f2(y - h * .45)}v${f2(-3 * s)}" stroke="#5A3A26" stroke-width="${f2(.8 * s)}"/>`).join('');
  if (kind === 'graticcio') o += `<path d="M${f2(x - w)} ${f2(y - h * .5)}H${f2(x + w)}M${f2(x - w * .34)} ${f2(y - h)}V${f2(y)}M${f2(x + w * .34)} ${f2(y - h)}V${f2(y)}M${f2(x - w)} ${f2(y - h)}L${f2(x - w * .34)} ${f2(y - h * .5)}M${f2(x + w)} ${f2(y - h)}L${f2(x + w * .34)} ${f2(y - h * .5)}" stroke="#5A3A2E" stroke-width="${f2(1.3 * s)}"/>`;
  /* il tetto */
  if (kind === 'bianco') { o += `<rect x="${f2(x - w - s)}" y="${f2(y - h - 2 * s)}" width="${f2(2 * w + 2 * s)}" height="${f2(2.4 * s)}" fill="${shade(wall, .06)}"/>`; if (i % 3 === 1) o += `<path d="M${f2(x - w * .5)} ${f2(y - h - 2 * s)}A${f2(w * .5)} ${f2(w * .5)} 0 0 1 ${f2(x + w * .5)} ${f2(y - h - 2 * s)}Z" fill="#2F6E9A"/>`; }
  else if (gable) { const rh = (kind === 'baite' ? 14 : 11) * s; o += `<path d="M${f2(x - w - 3 * s)} ${f2(y - h + .5)}L${f2(x)} ${f2(y - h - rh)}L${f2(x + w + 3 * s)} ${f2(y - h + .5)}Z" fill="${roof}"/><path d="M${f2(x)} ${f2(y - h - rh)}L${f2(x + L * (w + 3 * s))} ${f2(y - h + .5)}H${f2(x)}Z" fill="#000" fill-opacity=".16"/>`;
    if (kind === 'baite') o += `<path d="M${f2(x - w - 4 * s)} ${f2(y - h + 1)}L${f2(x)} ${f2(y - h - rh - 1.5 * s)}L${f2(x + w + 4 * s)} ${f2(y - h + 1)}L${f2(x + w)} ${f2(y - h + 2.6 * s)}L${f2(x)} ${f2(y - h - rh + 4 * s)}L${f2(x - w)} ${f2(y - h + 2.6 * s)}Z" fill="#FFFFFF"/>`; }
  else { const rh = (kind === 'ligure' ? 4 : 6) * s; o += `<path d="M${f2(x - w - 2.4 * s)} ${f2(y - h + .5)}L${f2(x - w * .55)} ${f2(y - h - rh)}H${f2(x + w * .55)}L${f2(x + w + 2.4 * s)} ${f2(y - h + .5)}Z" fill="${roof}"/>`
    + Array.from({ length: 4 }, (_, j) => `<path d="M${f2(x - w * .7 + j * w * .45)} ${f2(y - h - rh * .7)}v${f2(rh * .6)}" stroke="#000" stroke-opacity=".12" stroke-width="${f2(.6 * s)}"/>`).join('') + `<path d="M${f2(x - w - 2.4 * s)} ${f2(y - h + .5)}H${f2(x + w + 2.4 * s)}" stroke="${shade(roof, .3)}" stroke-width="${f2(.9 * s)}"/>`; }
  if (kind !== 'bianco' && kind !== 'ligure' && i % 2 === 0) o += `<rect x="${f2(x + w * .45)}" y="${f2(y - h - 12 * s)}" width="${f2(3.6 * s)}" height="${f2(8 * s)}" fill="${shade(roof, .3)}"/>`;
  /* finestre con le persiane, porta */
  const wins = [], cols = kind === 'ligure' ? 2 : w > 15 * s ? 3 : 2, ww = 3 * s, wh = 4 * s;
  for (let r = 0; r < tall; r++) for (let c = 0; c < cols; c++) { const wx = x - w + (c + .5) * (2 * w / cols) - ww / 2, wy = y - 3 * s - (r + 1) * fh + 3.5 * s; if (r === 0 && c === Math.floor(cols / 2) && kind !== 'ligure') continue;
    o += `<rect x="${f2(wx)}" y="${f2(wy)}" width="${f2(ww)}" height="${f2(wh)}" fill="${kind === 'bianco' ? '#2F6E9A' : '#3E4652'}"/>`;
    if (kind !== 'bianco') o += `<rect x="${f2(wx - 1.6 * s)}" y="${f2(wy)}" width="${f2(1.4 * s)}" height="${f2(wh)}" fill="${P.sh}"/><rect x="${f2(wx + ww + .2 * s)}" y="${f2(wy)}" width="${f2(1.4 * s)}" height="${f2(wh)}" fill="${P.sh}"/>`;
    if (kind === 'graticcio') o += `<rect x="${f2(wx - 1)}" y="${f2(wy + wh)}" width="${f2(ww + 2)}" height="${f2(1.6 * s)}" fill="#D8453A"/>`;
    wins.push([wx, wy, ww, wh]); }
  const dc = Math.floor(cols / 2), dx = x - w + (dc + .5) * (2 * w / cols);
  o += `<path d="M${f2(dx - 2.6 * s)} ${f2(y)}V${f2(y - 6.4 * s)}Q${f2(dx)} ${f2(y - 8.6 * s)} ${f2(dx + 2.6 * s)} ${f2(y - 6.4 * s)}V${f2(y)}Z" fill="${shade(roof === '#F1EDE4' ? '#2F6E9A' : roof, .35)}"/>`;
  void R;
  return { svg: o, wins, top: y - h, chim: kind !== 'bianco' && kind !== 'ligure' && i % 2 === 0 ? [x + w * .45 + 1.8 * s, y - h - 12 * s] : null };
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

function sceneSVG(mi, opts = {}) {
  const p = clamp(opts.p ?? monthP(mi), 0, 1);
  const DAYB = mi === 1 && opts.variant === 'giorno';
  const NIGHT = mi === 1 ? !DAYB : opts.variant === 'notte', NK = mi === 1 ? .56 : NIGHT_K[mi];
  const LD = Object.assign({}, LAND[mi]), u = 'sc' + (++sceneUid);
  const seed = mi * 131 + (opts.prot ? 900 : (opts.wk ?? 0) * 37) + 7, R = rng(seed), RN = rng(seed * 7 + 3);
  const T = Math.max(0, Math.round(opts.top || 0)), B = Math.max(0, Math.round(opts.bot || 0)), BOT = SH + B + 4;
  const sky = NIGHT ? NIGHT_SKY2[mi] : LD.sky.slice();
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
  const cloud = (x, y, k, col, op) => `<g class="sc-drift" opacity="${f2(NIGHT ? op * .45 : op)}" style="--dd:${f2(50 + R() * 30)}s;--dx:${f2((R() < .5 ? -1 : 1) * (24 + R() * 24))}px"><ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(44 * k)}" ry="${f2(10 * k)}" fill="${col}"/><ellipse cx="${f2(x - 16 * k)}" cy="${f2(y - 6 * k)}" rx="${f2(20 * k)}" ry="${f2(11 * k)}" fill="${col}"/><ellipse cx="${f2(x + 14 * k)}" cy="${f2(y - 9 * k)}" rx="${f2(25 * k)}" ry="${f2(14 * k)}" fill="${col}"/></g>`;
  if (DAYB) add([[620, 40, 1.4], [820, 10, 1.6], [1020, 52, 1.5], [1170, 18, 1.3], [900, 96, 1], [700, -40, 1.5], [1080, -70, 1.4]].map(([x, y, k], i) => cloud(x, y, k, ['#D3DAE4', '#C9D1DC', '#DCE1E8'][i % 3], .9)).join(''), .3);
  else if (mi !== 6 || !NIGHT) add([[700, 70 - T * .3, 1.1], [1080, 40 - T * .5, .8], [880, 130, .6]].map(([x, y, k]) => cloud(x, y, k, '#FFFFFF', mi === 5 || mi === 6 ? .5 : .62)).join(''), .4);

  /* il sole o la luna */
  if (cel) {
    const { x, y, r } = cel;
    if (cel.kind === 'sol') s.push(`<g class="sc-fade" style="--d:.2s"><g opacity="${DAYB ? .55 : 1}"><circle class="sc-glow" cx="${f2(x)}" cy="${f2(y)}" r="${r * 3.4}" fill="url(#${u}g)"/><circle cx="${f2(x)}" cy="${f2(y)}" r="${r}" fill="${low > .5 ? '#FBD9A0' : '#FFF6DE'}"/></g></g>`);
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
    s.push(`<g class="sc-fade" style="--d:1.4s"><g opacity=".2">${['#E25B4A', '#F0A04A', '#F2D45A', '#7DBE6A', '#5A9AD6', '#8A6ACB'].map((c, i) => `<path d="M${cx - (r0 - i * 5)} ${cy}A${r0 - i * 5} ${r0 - i * 5} 0 0 1 ${cx + (r0 - i * 5)} ${cy}" stroke="${c}" stroke-width="5.4" fill="none"/>`).join('')}</g></g>`); }
  if (mi === 5) {   // Messidoro: di giorno i cumuli alti sul mare; di notte i lampi di calore lontani, dentro le nuvole all'orizzonte
    const bank = wkx % 2 ? [[820, 200, 22], [846, 192, 30], [872, 200, 20], [1090, 200, 26], [1120, 190, 36], [1150, 200, 22]] : [[900, 200, 24], [930, 188, 36], [962, 200, 22], [1160, 202, 18]];
    if (NIGHT) s.push(lit(`<ellipse class="sc-flash" style="--fld:9s;--fll:-3s" cx="1010" cy="176" rx="130" ry="56" fill="url(#${u}g)"/><ellipse class="sc-flash" style="--fld:13s;--fll:-8s" cx="860" cy="186" rx="100" ry="44" fill="url(#${u}g)"/>`, .5));
    add(`<g opacity="${NIGHT ? .9 : .85}">` + bank.map(([x, y, r]) => `<circle cx="${x}" cy="${y - r * .5}" r="${r}" fill="${NIGHT ? '#7E88A6' : '#FFFFFF'}"/><circle cx="${x + r * .5}" cy="${y - r * 1.1}" r="${r * .62}" fill="${NIGHT ? '#8892AE' : '#FFFFFF'}"/><ellipse cx="${x}" cy="${y - r * .2}" rx="${r * 1.1}" ry="${r * .35}" fill="${NIGHT ? '#6E7896' : '#E4EAEF'}"/>`).join('') + '</g>', .3); }
  if (mi === 6 && NIGHT) s.push(lit([[760, 30, 13, 3], [1100, -20, 17, 9], [920, -60, 21, 15]].map(([x, y, d, l]) => `<g class="sc-shoot" style="--sd2:${d}s;--sdl2:${l}s"><path d="M${x} ${y - T * .3}l-64 24" stroke="url(#${u}t)" stroke-width="1.6" stroke-linecap="round"/></g>`).join(''), 2));

  /* ---- strumenti per costruire il luogo ---- */
  const ridge = (keys, rough = 4, step = 30, base) => { const c = [];
    for (let i = 0; i < keys.length - 1; i++) { const [x0, y0] = keys[i], [x1, y1] = keys[i + 1], n = Math.max(1, Math.round((x1 - x0) / step));
      for (let k = 0; k < n; k++) { const t = k / n; c.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * smooth(t) + (k ? (R() - .5) * rough : 0)]); } }
    c.push(keys[keys.length - 1]); const pts = crSample(c); const by = base ?? BOT + 40; return { pts, y: (x) => interpY(pts, x), d: ptsD(pts) + `L${f2(pts[pts.length - 1][0])} ${f2(by)}L${f2(pts[0][0])} ${f2(by)}Z` }; };
  const fill = (rg, col, extra = '') => `<path d="${rg.d}" fill="${col}"${extra}/>`;
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
  const water = (top, x0 = -20, x1 = SW + 20) => { wId = u + 'w' + (++wN); return `<defs><linearGradient id="${wId}" x1="0" y1="${top}" x2="0" y2="${BOT}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${WT[0]}"/><stop offset=".45" stop-color="${WT[2]}"/><stop offset="1" stop-color="${WT[1]}"/></linearGradient>`
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
      if (NIGHT) addLit(Array.from({ length: 12 }, (_, i) => `<path d="M${f2(x + (-58 + i * 9) * k)} ${f2(y - 22 * k)}v${f2(-6 * k)}q${f2(2.5 * k)} ${f2(-3 * k)} ${f2(5 * k)} 0v${f2(6 * k)}z" fill="#F6C76E"/>`).join('') + glow(x, y - 26 * k, 60, .7), 1.4);
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
      add(fill(rg, dune ? '#E9CF98' : landCol(.82)) + (dune ? `<path d="M940 330Q1040 300 1140 306M960 360Q1060 340 1180 344" stroke="#D9B97E" stroke-width="2" fill="none"/>` + dg + `<path d="M1150 ${f2(rg.y(1150) + 4)}l40 -2" stroke="#7A5A3A" stroke-width="2"/>` : path + forest(rg, 1150, 1220, 2, .9, .85) + groundDetail(rg, 930, 1220, 16, 1, .9)) + shadowAt(X, y, 30) + at(X, y, K, T0.svg), .35);
      if (T0.lamp && (NIGHT || DAYB)) addLit(at(X, y, K, `<rect x="${T0.lamp[0] - 4}" y="${T0.lamp[1] - 4}" width="8" height="8" rx="1.5" fill="#F6C76E"/>` + glow(T0.lamp[0], T0.lamp[1], 28)), 1.6);
      if (T0.lamp2) addLit(at(X, y, K, `<rect x="${T0.lamp2[0] - 2}" y="${T0.lamp2[1] - 3}" width="4" height="5" fill="#F6C76E"/>` + glow(T0.lamp2[0], T0.lamp2[1], 22, NIGHT ? 1 : .6)), 1.7);
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
      if (wk === 1) { const hx = sea ? 760 : 860, hy = sh.y(hx) + 3; shore += cottage(hx, hy, .62, haze(mi === 2 ? '#8A5A3C' : mi === 5 || mi === 6 ? '#F4F1EA' : '#E6D6BC', .35), haze(STY[mi].roof, .35), Ls(hx));
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
      if (wk === 1) { const bx = 1060, by = 300, k = 1.32, boat = at(bx, by, k, rowBoat2(true, STY[mi].boat));
        add(mirror(boat, by, .32) + boat + frontWater(bx, by, 150 * k, 18) + ripRings(bx - 30 * k, by + 1, 3, 24) + `<path d="M${f2(bx + 50 * k)} ${by + 3}l34 2M${f2(bx + 46 * k)} ${by + 7}l26 5" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.2"/>`, .45);
        addLit(glow(bx - 58 * k, by - 34 * k, NIGHT || DAYB ? 34 : 16) + mirror(glow(bx - 58 * k, by - 34 * k, 22), by, .6), 1.6); }
      else { const st = STY[mi].sail, bx = 1070, by = ice ? 300 : 296, k = 1.3, boat = at(bx, by, k, sailBoat2(st));
        if (ice) add(`<ellipse cx="${bx}" cy="${by + 2}" rx="${70 * k}" ry="5" fill="#5A6E7E" fill-opacity=".2"/>` + boat + `<path d="M${f2(bx + 50 * k)} ${by + 1}q40 -1 90 1M${f2(bx + 46 * k)} ${by + 4}q30 0 70 3" stroke="#FFFFFF" stroke-width="1.6" fill="none" stroke-linecap="round"/>`, .45);
        else add(mirror(boat, by, .3) + `<g class="sc-bob2">${boat}</g>` + frontWater(bx, by, 140 * k, 18) + `<path d="M${f2(bx + 50 * k)} ${by + 3}q30 2 58 -1M${f2(bx + 46 * k)} ${by + 8}q24 2 48 4" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="1.3" fill="none" stroke-linecap="round"/>`, .45);
        if (st.lamp) addLit(glow(bx - 1.9 * k, by - 112.5 * k, NIGHT || DAYB ? 26 : 10) + mirror(glow(bx - 1.9 * k, by - 112.5 * k, 16), by, .5), 1.6); }
      if (!sea) { let rd = ''; for (let i = 0; i < 12; i++) { const x = 1160 + i * 5.5 + R() * 4, y = BOT - 4 - R() * 10; rd += snowy ? `<path d="M${f2(x)} ${f2(y)}q3 -14 1 -26" stroke="#7A6A58" stroke-width="1.4" fill="none"/>` : reed(x, y, 1.4 + R() * .6, shade(LD.front, .15)); } add(rd, .6); }
      break;
    }
    case 2: { // Navigare: la sfera armillare sul belvedere di pietra, ornato come vuole il mese; sotto, la pianura col lago lontano; di notte l'asse indica la stella polare
      backdrop();
      const mid = ridge([[-20, 236], [600, 230], [860, 226], [1000, 232], [1220, 226]], 3);
      add(fill(mid, landCol(.4)) + patches(mid, 400, 1200, .4) + forest(mid, 560, 1200, 16, .3, .4) + (LD.sea ? '' : `<ellipse cx="900" cy="${f2(mid.y(900) + 12)}" rx="80" ry="5" fill="${mixHex(WTh[0], '#FFFFFF', .15)}"/>`), .25);
      const plain = ridge([[-20, 262], [700, 258], [1000, 256], [1220, 260]], 2);
      add(fill(plain, landCol(.6)) + patches(plain, 400, 1200, .6, 3) + hedge(plain, 400, 1200, 14, .6) + `<path d="M560 ${f2(plain.y(600) + 40)}Q820 ${f2(plain.y(800) + 8)} 900 ${f2(mid.y(900) + 14)}" stroke="${LD.path}" stroke-opacity=".55" stroke-width="2" fill="none"/>`, .3);
      const ty = 298, X = 1090, fy = ty + 34;
      const stone = mi === 6 ? '#EFE9DE' : mixHex(LD.rock, '#D8D0C0', .45);
      let terr = `<defs><linearGradient id="${u}tf" x1="0" y1="${ty}" x2="0" y2="${BOT}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${shade(stone, .08)}"/><stop offset="1" stop-color="${light(stone, .12)}"/></linearGradient></defs><path d="M-20 ${ty}H1230V${BOT + 40}H-20Z" fill="url(#${u}tf)"/>`;
      for (let k = 1; k < 7; k++) { const y = ty + Math.pow(k / 6, 1.6) * (BOT - ty); terr += `<path d="M-20 ${f2(y)}H1230" stroke="${shade(stone, .2)}" stroke-opacity=".35" stroke-width="${f2(.6 + k * .2)}"/>`; }
      for (let k = -6; k <= 10; k++) { const x0 = 900 + k * 34; terr += `<path d="M${x0} ${ty}L${f2(900 + (x0 - 900) * 3.2)} ${BOT + 40}" stroke="${shade(stone, .2)}" stroke-opacity=".28" stroke-width="1"/>`; }
      const bc = mi === 6 ? '#F4F1EA' : '#D6CEBD', bc2 = mi === 6 ? '#E6E0D4' : '#C3BAA8';
      let bal = `<path d="M-20 ${ty - 30}H1230" stroke="${bc}" stroke-width="5"/><path d="M-20 ${ty - 3}H1230" stroke="${shade(bc, .12)}" stroke-width="4"/>`;
      for (let x = -14; x < 1230; x += 13) bal += `<path d="M${x} ${ty - 27}q-3.2 6 0 11.5q3.2 6 0 11.5" stroke="${bc2}" stroke-width="5.4" fill="none"/><path d="M${x + 1.6} ${ty - 26}q2 5 0 10q-2 5 0 10" stroke="#000" stroke-opacity=".08" stroke-width="1.6" fill="none"/>`;
      for (let x = 30; x < 1230; x += 120) bal += `<rect x="${x - 6}" y="${ty - 36}" width="12" height="36" fill="${shade(bc, .06)}"/><rect x="${x - 8}" y="${ty - 39}" width="16" height="4" fill="${light(bc, .1)}"/>`;
      /* gli ornamenti del mese */
      const RD2 = rng(seed + 41); let deco = '', decoLit = '';
      const potTree = (px, tree) => `<path d="M${px - 13} ${fy + 26}l3 -20h20l3 20Z" fill="#B0643F"/><path d="M${px - 11} ${fy + 8}h22" stroke="#8E4A2E" stroke-width="2"/>` + tree;
      switch (STY[mi].terr) {
        case 'olivi': for (let x = 870; x < 1230; x += 40) { const xx = x + RD2() * 10; deco += `<path d="M${xx - 20} ${ty - 31}Q${xx} ${ty - 22} ${xx + 20} ${ty - 31}" stroke="#4E6A34" stroke-width="2.4" fill="none"/>` + [0, 1, 2, 3, 4].map((k) => `<circle cx="${f2(xx - 2 + (k % 2) * 3)}" cy="${f2(ty - 24 + Math.floor(k / 2) * 3.4)}" r="2" fill="#5A2E5E"/>`).join(''); }
          deco += potTree(1196, treeRound(1196, fy + 8, 1, '#7E8F5A', '#5B4130', Ls(1196))); break;
        case 'lampione': { const lx = 1000; deco += `<path d="M${lx} ${fy + 20}V${fy - 128}" stroke="#2E2A26" stroke-width="3.4"/><rect x="${lx - 5}" y="${fy + 12}" width="10" height="8" fill="#2E2A26"/><path d="M${lx - 8} ${fy - 128}h16l-3 -6h-10z" fill="#2E2A26"/><rect x="${lx - 6}" y="${fy - 128}" width="12" height="14" fill="#2E2A26"/>`;
          decoLit = lit(`<rect x="${lx - 4}" y="${fy - 126}" width="8" height="10" fill="#F6C76E"/>` + glow(lx, fy - 121, NIGHT ? 60 : 34) + Array.from({ length: 5 }, (_, i) => `<rect class="sc-twinkle" style="--td:${f2(2 + i * .4)}s" x="${lx - 8 - i * 3}" y="${fy + 30 + i * 12}" width="${16 + i * 6}" height="1.6" rx=".8" fill="#F6C76E" fill-opacity=".55"/>`).join(''), 1.5);
          deco += Array.from({ length: 6 }, () => { const x = 880 + RD2() * 340, y = fy + 30 + RD2() * (BOT - fy - 40), w = 16 + RD2() * 30; return `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(w * .14)}" fill="#FFFFFF" fill-opacity=".12"/>`; }).join(''); break; }
        case 'ghiaccioli': deco += `<path d="M-20 ${ty - 33}H1230" stroke="#FFFFFF" stroke-width="3"/>`; for (let x = -10; x < 1230; x += 6 + RD2() * 6) deco += `<path d="M${f2(x)} ${ty - 28}l1.2 ${f2(4 + RD2() * 7)}l1.2 ${f2(-4 - RD2() * 7)}" fill="#E4F0F6"/>`;
          deco += [880, 1010, 1180].map((x) => `<path d="M${x - 46} ${fy + 24}Q${x - 20} ${fy + 8} ${x} ${fy + 12}Q${x + 26} ${fy + 8} ${x + 46} ${fy + 24}Z" fill="#FFFFFF"/>`).join(''); break;
        case 'glicine': { let g = `<path d="M1230 ${ty - 92}Q1160 ${ty - 100} 1100 ${ty - 80}Q1060 ${ty - 66} 1040 ${ty - 34}" stroke="#6E5236" stroke-width="3.4" fill="none"/>`;
          for (let i = 0; i < 12; i++) { const t = i / 11, x = 1230 - t * 190, y = ty - 92 + t * 40 + RD2() * 6; g += `<path d="M${f2(x)} ${f2(y)}l-2 ${f2(16 + RD2() * 10)}" stroke="#B48ECF" stroke-width="5" stroke-linecap="round"/><path d="M${f2(x - 1)} ${f2(y + 6)}l-1 ${f2(8 + RD2() * 6)}" stroke="#D9C2EA" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="${f2(x + 6)}" cy="${f2(y)}" rx="5" ry="2.4" fill="#6E9C52"/>`; }
          deco += g + Array.from({ length: 10 }, () => `<ellipse cx="${f2(900 + RD2() * 320)}" cy="${f2(fy + 20 + RD2() * (BOT - fy - 30))}" rx="2.4" ry="1.3" fill="#C9A6DE"/>`).join(''); break; }
        case 'fioriere': for (let x = 90; x < 1230; x += 120) deco += `<rect x="${x - 22}" y="${ty - 40}" width="44" height="8" fill="#8A5E3B"/>` + Array.from({ length: 9 }, (_, i) => `<circle cx="${x - 20 + i * 5}" cy="${f2(ty - 42 - RD2() * 3)}" r="2.6" fill="${['#D8453A', '#8E5FA3', '#F4ECDD', '#E3A33B'][i % 4]}"/>`).join(''); break;
        case 'limone': deco += potTree(1196, treeRound(1196, fy + 8, 1.1, '#4F7A3A', '#5B4130', Ls(1196)) + [[-8, -26], [6, -30], [-2, -36], [10, -22], [-12, -18]].map(([a, b]) => `<ellipse cx="${1196 + a}" cy="${fy + 8 + b}" rx="2.6" ry="2" fill="#F2D23A"/>`).join('')); break;
        case 'buganvillea': for (let i = 0; i < 70; i++) { const x = 1100 + RD2() * 140, y = ty - 46 + RD2() * 34 + Math.max(0, x - 1150) * .3 * RD2(); deco += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(2 + RD2() * 2.6)}" fill="${['#C2307A', '#E0559A', '#9E2A60', '#5E8A44'][i % 4]}"/>`; } break;
      }
      add(terr + `<g>${bal}</g>` + deco + shadowAt(X, fy, 30) + at(X, fy, 1.4, armillary(snowy)), .35); if (decoLit) s.push(decoLit);
      if (NIGHT) { const S = 1.4, cx = X + ARM_AX[0] * 34 * S, cy = fy - 84 * S + ARM_AX[1] * 34 * S, py = -T + 40, t = (cy - py) / -ARM_AX[1], px = cx + ARM_AX[0] * t;
        addLit(`<path d="M${f2(cx)} ${f2(cy)}L${f2(px)} ${f2(py)}" stroke="#E9ECF6" stroke-opacity=".16" stroke-width="1" stroke-dasharray="2 6"/><g transform="translate(${f2(px)} ${f2(py)})"><circle class="sc-glow" r="26" fill="url(#${u}g)"/><path class="sc-twinkle" style="--td:3.6s" d="M0 -12L2 -2L12 0L2 2L0 12L-2 2L-12 0L-2 -2Z" fill="#FFFFFF"/><circle r="2" fill="#FFFFFF"/></g>`
          + [[-34, 14], [-58, 22], [-74, 40], [-98, 44], [-92, 64], [-66, 60]].map(([a, b], i) => `<circle class="sc-twinkle" style="--td:${f2(2.4 + i * .3)}s" cx="${f2(px + a)}" cy="${f2(py + b)}" r="1.5" fill="#E9ECF6"/>`).join(''), 1.2); }
      break;
    }
    case 4: { // Automatizzare: il borgo del luogo sul colle (toscano, lombardo, baite, pastello, a graticcio, bianco, ligure), la torre dell'orologio in mezzo, la strada coi lampioni
      backdrop();
      const mid = ridge([[-20, 236], [600, 230], [860, 228], [1220, 232]], 3);
      add(fill(mid, landCol(.38)) + patches(mid, 300, 1200, .38, 2) + hedge(mid, 300, 1200, 22, .38) + forest(mid, 560, 1200, 18, .3, .38), .25);
      const hill = ridge([[700, BOT], [780, 320], [900, 286], [1010, 262], [1090, 254], [1160, 258], [1220, 268]], 2);
      const X = 1092, y = hill.y(X) + 2, L = Ls(X), kind = STY[mi].town, RH = rng(seed + 17);
      let back = '', front = '', wins = '', smoke = '';
      const put = (hx, dy, k, i) => { const hy = hill.y(hx) + dy, H0 = townHouse(kind, hx, hy, k, i, Ls(hx), RH);
        wins += H0.wins.map(([wx, wy, ww, wh], j) => (i + j) % 3 === 2 ? '' : win(wx, wy, ww, wh, (i * 7 + j) % 5 * .6)).join('');
        if (H0.chim && !NIGHT && (mi <= 2) && i % 3 === 0) smoke += [0, 1, 2].map((j) => `<circle class="sc-puff2" style="--pfd:7s;--pfl:${f2(-j * 2.3 - i)}s" cx="${f2(H0.chim[0])}" cy="${f2(H0.chim[1])}" r="${f2((3 + j) * k)}" fill="#FFFFFF" fill-opacity=".55"/>`).join('');
        return H0.svg; };
      /* tre file di case: in alto dietro la torre, a metà costa, davanti più grandi; ogni fila più in basso e più grande della precedente */
      [[1026, 4, .92], [1058, 2, .95], [1128, 2, .95], [1160, 4, .92], [1192, 8, .9], [996, 10, .88], [966, 18, .84]].forEach(([hx, dy, k], i) => { back += put(hx, dy, k, i); });
      [[944, 36, 1.08], [990, 34, 1.16], [1044, 30, 1.2], [1140, 30, 1.2], [1196, 34, 1.16]].forEach(([hx, dy, k], i) => { front += put(hx, dy, k, i + 7); });
      [[910, 62, 1.3], [1000, 66, 1.42], [1100, 62, 1.46], [1190, 66, 1.4]].forEach(([hx, dy, k], i) => { front += put(hx, dy, k, i + 12); });
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
    case 5: { // Remare automatizzato: il fiume scende dai colli, fa la curva e passa davanti al mulino; la ruota sta nella corrente, allineata al fiume, e gira nel verso dell'acqua
      backdrop();
      const back = ridge([[-20, 232], [600, 226], [860, 230], [1220, 228]], 3);
      add(fill(back, landCol(.4)) + patches(back, 400, 1200, .4) + forest(back, 560, 1200, 14, .32, .4), .2);
      const C0 = [[914, 233], [894, 250], [860, 272], [868, 296], [960, 318], [1080, 328], [1240, 334]], W0 = [3, 9, 20, 34, 48, 56, 62];
      const Cs = crSample(C0, 4), cum = (P) => { const o = [0]; for (let i = 1; i < P.length; i++) o.push(o[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return o; };
      const lc = cum(C0), ls = cum(Cs), wAt = (l) => { for (let i = 0; i < lc.length - 1; i++) if (l <= lc[i + 1]) return W0[i] + (W0[i + 1] - W0[i]) * (l - lc[i]) / (lc[i + 1] - lc[i]); return W0[W0.length - 1]; };
      const Pn = [], Mf = [];
      Cs.forEach(([x, y], i) => { const a = Cs[Math.max(0, i - 1)], b = Cs[Math.min(Cs.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, nx = -dy / n, ny = dx / n, w = wAt(ls[i]) / 2;
        Pn.push([x + nx * w, y + ny * w]); Mf.push([x - nx * w, y - ny * w]); });
      const PL = Pn[Pn.length - 1], ML = Mf[Mf.length - 1];
      const nearD = `M-20 244L600 240Q820 236 ${f2(Pn[0][0])} ${f2(Pn[0][1])}` + Pn.map(([x, y]) => `L${f2(x)} ${f2(y)}`).join('') + `L1240 ${f2(PL[1])}L1240 ${BOT + 40}L-20 ${BOT + 40}Z`;
      const farD = ptsD(Mf) + `L1240 ${f2(ML[1])}L1240 240Q1040 232 ${f2(Mf[0][0])} ${f2(Mf[0][1])}Z`;
      const riverD = ptsD(Pn) + Mf.slice().reverse().map(([x, y]) => `L${f2(x)} ${f2(y)}`).join('') + 'Z';
      const grad = (id, y0, y1, c0, c1) => `<defs><linearGradient id="${u}${id}" x1="0" y1="${y0}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>`;
      add(grad('fb', 232, 334, landCol(.42), landCol(.74)) + `<path d="${farD}" fill="url(#${u}fb)"/>` + patches({ y: (x) => 240 + (x - 900) * .02 }, 960, 1200, .5, 1), .25);
      s.push(water(233, -20, -19)); s.push(`<path d="${riverD}" fill="url(#${wId})"/>`);
      const edgeC = shade(landCol(.8), .35);
      let flow = ''; for (let i = 0; i < 26; i++) { const j = 4 + Math.floor(R() * (Cs.length - 6)), [x, y] = Cs[j], b = Cs[j + 1], dx = b[0] - x, dy = b[1] - y, n = Math.hypot(dx, dy) || 1, w = wAt(ls[j]), off = (R() - .5) * w * .6, len = 4 + w * .25;
        const hx = Math.abs(dx) > Math.abs(dy); flow += `<path class="${hx ? 'sc-flowx' : 'sc-flow'}" style="--fwd:${f2(2.2 + R() * 1.4)}s;--fwl:${f2(-R() * 3)}s" d="M${f2(x - dy / n * off)} ${f2(y + dx / n * off)}l${f2(dx / n * len)} ${f2(dy / n * len)}" stroke="#FFFFFF" stroke-opacity="${f2(.25 + w / 120)}" stroke-width="${f2(.8 + w / 40)}" stroke-linecap="round"/>`; }
      add(`<path d="${ptsD(Mf)}" stroke="${edgeC}" stroke-width="2" fill="none" stroke-opacity=".55"/>` + flow + (snowy ? `<path d="${ptsD(Pn)}" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-opacity=".85"/><path d="${ptsD(Mf)}" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-opacity=".8"/>` : ''), .3);
      /* il mulino sulla riva di là, la ruota davanti alla facciata, mezza nella corrente */
      const bank = Mf.filter(([x]) => x > 940), hx = 1134, hy = interpY(bank, hx) - 2, k = 1.12, Lh = Ls(hx), wx = 1082, wr = 30, wl = interpY(bank, wx) + 5, wy = wl - 4;
      const MW = ['#D9C3A0', '#A9A59C', '#ECE8E0', '#EBD8C8', '#EFE4D0', '#E8D8B0', '#F4F1EA'][mi], roofM = STY[mi].roof;
      let house = `<path d="M-32 0V-52H32V0Z" fill="${MW}"/><path d="M${Lh > 0 ? 8 : -32} 0V-52H${Lh > 0 ? 32 : -8}V0Z" fill="#000" fill-opacity=".12"/>`;
      for (let j = 1; j < 6; j++) house += `<path d="M-32 ${-j * 9}H32" stroke="${shade(MW, .2)}" stroke-opacity=".4" stroke-width=".8"/>`;
      if (mi === 2) house += `<rect x="-32" y="-52" width="64" height="24" fill="#7A5236"/>`;
      house += `<path d="M-38 -50L0 -78L38 -50Z" fill="${roofM}"/><path d="M0 -78L${38 * Lh} -50H0Z" fill="#000" fill-opacity=".15"/>`
        + (snowy ? `<path d="M-40 -50L0 -80L40 -50L30 -47L0 -71L-30 -47Z" fill="#FFFFFF"/>` + [-28, -18, 18, 28].map((x) => `<path d="M${x} -49l1.2 6l1.2 -6" fill="#DDEBF2"/>`).join('') : '')
        + `<rect x="2" y="-24" width="12" height="24" fill="${WOOD_D}"/><rect x="18" y="-40" width="9" height="9" fill="#4E5866"/><rect x="-20" y="-40" width="9" height="9" fill="#4E5866"/><rect x="18" y="-72" width="6" height="14" fill="${shade(roofM, .3)}"/>`
        + (mi === 4 ? `<rect x="16" y="-31" width="13" height="3" fill="#8A5E3B"/><rect x="-22" y="-31" width="13" height="3" fill="#8A5E3B"/>` + [17, 20, 23, 26, -21, -18, -15, -12].map((x, i) => `<circle cx="${x}" cy="-32" r="1.8" fill="${['#D8453A', '#8E5FA3', '#E3A33B'][i % 3]}"/>`).join('') : '')
        + (mi === 5 ? `<path d="M36 0q-2 -12 6 -14q8 2 6 14z" fill="#E6D3A0"/><path d="M44 0q-2 -10 5 -12q7 2 5 12z" fill="#D9C38A"/>` : '');
      let wh = `<g><animateTransform attributeName="transform" type="rotate" from="0 ${wx} ${f2(wy)}" to="-360 ${wx} ${f2(wy)}" dur="14s" repeatCount="indefinite"/><circle cx="${wx}" cy="${f2(wy)}" r="${wr - 3}" fill="none" stroke="${WOOD_D}" stroke-width="3.6"/><circle cx="${wx}" cy="${f2(wy)}" r="${wr - 11}" fill="none" stroke="${WOOD}" stroke-width="1.8"/>`;
      for (let j = 0; j < 8; j++) { const an = j * Math.PI / 4; wh += `<path d="M${wx} ${f2(wy)}L${f2(wx + Math.cos(an) * (wr - 4))} ${f2(wy + Math.sin(an) * (wr - 4))}" stroke="${WOOD}" stroke-width="2.2"/>`; }
      for (let j = 0; j < 16; j++) { const an = j * Math.PI / 8, c = Math.cos(an), s2 = Math.sin(an); wh += `<path d="M${f2(wx + c * (wr - 5))} ${f2(wy + s2 * (wr - 5))}L${f2(wx + c * (wr + 3))} ${f2(wy + s2 * (wr + 3))}" stroke="${WOOD_D}" stroke-width="4"/>`; }
      wh += `</g><circle cx="${wx}" cy="${f2(wy)}" r="4.4" fill="#3E2A1A"/><circle cx="${wx}" cy="${f2(wy)}" r="1.6" fill="${BRASS}"/>`;
      const foam = `<path d="M${wx + wr - 2} ${f2(wl + 2)}q8 -4 16 0q6 -3 12 1M${wx + wr + 4} ${f2(wl + 7)}q10 -3 20 1" stroke="#FFFFFF" stroke-opacity=".85" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
      let drops = ''; for (let j = 0; j < 5; j++) drops += `<path class="sc-rain" style="--rd:${f2(.9 + j * .2)}s;--rdl:${f2(-j * .3)}s;--ro:.7" d="M${f2(wx - wr + 2 + j * 4)} ${f2(wy - 6 - j * 4)}l1 6" stroke="#E4F2F6" stroke-width="1.3" stroke-linecap="round"/>`;
      const extra = mi === 3 ? treeBlossom(1200, interpY(bank, 1200) + 2, 1.05, ['#F4C9D8', '#FFFFFF', '#E89BB5'], '#5B4130', R, p) : mi === 0 ? treeRound(1200, interpY(bank, 1200) + 2, 1.05, '#D8792E', '#5B4130', Ls(1200)) + `<path d="M1172 ${f2(interpY(bank, 1172))}h18v-8h-18z" fill="#8A5E3B"/><path d="M1172 ${f2(interpY(bank, 1172) - 4)}h18" stroke="#5E3D25"/>` : mi === 6 ? treeRound(1204, interpY(bank, 1204) + 2, .8, '#5E8A44', '#5B4130', Ls(1204)) + [[-6, -22], [4, -26], [8, -18], [-10, -16]].map(([a, b]) => `<circle cx="${1204 + a}" cy="${f2(interpY(bank, 1204) + b)}" r="3" fill="#E58AB0"/>`).join('') : veg(1204, interpY(bank, 1204) + 2, .9, .75);
      add(shadowAt(hx, hy, 40) + at(hx, hy, k, house) + extra + wh + drops + frontWater(wx, wl, 84, 20) + foam + ripRings(wx + 20, wl + 4, 3, 22), .35);
      if (NIGHT || DAYB) addLit(win(hx + 18 * k, hy - 40 * k, 9 * k, 9 * k, .4) + win(hx - 20 * k, hy - 40 * k, 9 * k, 9 * k, 2), 1.6);
      if (!NIGHT && mi <= 2) for (let i = 0; i < 3; i++) add(`<circle class="sc-puff2" style="--pfd:7s;--pfl:${f2(-i * 2.3)}s" cx="${f2(hx + 21 * k)}" cy="${f2(hy - 74 * k)}" r="${4 + i}" fill="#FFFFFF" fill-opacity=".6"/>`);
      /* la riva di qua: erba, canne lungo l'acqua */
      let nb = grad('nb', 240, BOT, landCol(.52), landCol(1)) + `<path d="${nearD}" fill="url(#${u}nb)"/><path d="${ptsD(Pn)}" stroke="${edgeC}" stroke-width="2.4" fill="none" stroke-opacity=".5"/>`;
      for (let i = 0; i < 12; i++) { const x = 900 + i * 26 + R() * 10, yy = interpY(Pn.filter(([px]) => px > 880), x) + 6 + R() * 6; nb += snowy ? `<path d="M${f2(x)} ${f2(yy)}q2 -10 0 -18" stroke="#7A6A58" stroke-width="1.3" fill="none"/>` : reed(x, yy, .9 + R() * .4, shade(LD.front, .1)); }
      add(nb + groundDetail({ y: () => BOT - 60 }, 640, 1220, 16, 1.4, 1), .5);
      if (mi === 1) add(mist(wl - 14, 30, DAYB ? .8 : .3, 22, 50), .4);
      break;
    }
    default: { // Validare: in vetta. L'ometto e la bandiera sulla roccia, con quello che si trova lassù in quel mese; sotto, il mare di nuvole; il sentiero che abbiamo fatto
      const fr0 = ridge([[-20, 190], [400, 170], [640, 140], [760, 104], [860, 150], [980, 122], [1100, 160], [1220, 140]], 8);
      add(fill(fr0, haze(LD.far, 0)) + snowCap(fr0, snowy ? 168 : 132, 24), .1);
      const cl = NIGHT ? mixHex('#4A5672', '#C9D2E6', moonL) : low > .3 ? mixHex('#FFFFFF', '#F7D3A8', .35) : '#FBFCFD', cs = NIGHT ? mixHex('#2E3750', '#8E9AB8', moonL) : low > .3 ? '#E4BC94' : '#D5DCE5';
      const layer = (y0, r, d, gid) => { const RB = rng(seed + Math.round(y0)); let dd = `M-20 ${f2(y0 + r)}`, x = -20;
        while (x < SW + 20) { const rr = r * (.6 + RB() * .8), h = rr * (.55 + RB() * .5); dd += `Q${f2(x + rr * .1)} ${f2(y0 - h)} ${f2(x + rr)} ${f2(y0 - h)}Q${f2(x + rr * 1.9)} ${f2(y0 - h)} ${f2(x + rr * 2)} ${f2(y0 + RB() * r * .3)}`; x += rr * 2; }
        dd += `L${SW + 20} ${BOT + 40}L-20 ${BOT + 40}Z`;
        const c0 = mixHex(cl, hzC, (1 - d) * .35), c1 = mixHex(cs, hzC, (1 - d) * .35);
        return `<defs><linearGradient id="${u}${gid}" x1="0" y1="${f2(y0 - r)}" x2="0" y2="${f2(y0 + r * 2.2)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${rgb(c0)}"/><stop offset=".55" stop-color="${rgb(c0)}"/><stop offset="1" stop-color="${rgb(c1)}"/></linearGradient></defs><path d="${dd}" fill="url(#${u}${gid})"/>`; };
      const pk = (cx, top, w, d) => { const r = ridge([[cx - w, 250], [cx - w * .5, top + 30], [cx - w * .12, top + 6], [cx, top], [cx + w * .2, top + 10], [cx + w * .55, top + 34], [cx + w, 250]], 2, 12); return fill(r, haze(LD.rock, d)) + (snowy || top < 210 ? snowCap(r, top + 16, 12) : ''); };
      add(layer(204, 10, .1, 'c1'), .15);
      add(pk(780, 168, 64, .25) + pk(900, 196, 44, .3) + layer(228, 16, .35, 'c2'), .2);
      add(layer(256, 26, .6, 'c3'), .25);
      const rock = ridge([[860, BOT], [920, 340], [990, 300], [1050, 278], [1100, 270], [1150, 276], [1220, 300]], 3);
      const rc = mi === 2 ? '#E9F0F4' : mixHex(LD.rock, LD.near, .3);
      const X = 1100, y = rock.y(X) + 3;
      const cracks = `<path d="M1000 300l20 14l-6 18M1060 286l-10 22l14 20M1140 282l12 26" stroke="${shade(rc, .25)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      const path = `<path d="${ptsD(crSample([[920, BOT], [980, 360], [930, 340], [1010, 318], [1050, 300], [X - 20, y]], 4))}" stroke="${LD.path}" stroke-opacity=".7" stroke-width="2.6" fill="none" stroke-dasharray="1 5" stroke-linecap="round"/>`;
      add(fill(rock, rc) + `<path d="M1100 270L1220 300V${BOT + 40}H1100Z" fill="#000" fill-opacity="${Ls(1150) > 0 ? .1 : 0}"/>` + cracks + path + (snowy ? '' : groundDetail(rock, 960, 1220, 10, .9, .9)) + shadowAt(X, y, 36) + at(X, y, 1.25, cairn(mi)), .35);
      s.push(`<g class="sc-fade" style="--d:.5s"><g class="sc-fog" opacity=".9" style="--fgd:40s;--fgx:20px">${layer(BOT - 34, 58, 1, 'c4')}</g></g>`);
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
    case 2: if (!opts.prot) { let sn = ''; for (let i = 0; i < 34; i++) { const big = RW() < .35; sn += `<circle class="sc-fall2" style="--fd:${f2(big ? 7 + RW() * 3 : 11 + RW() * 5)}s;--fdl:${f2(-RW() * 14)}s;--fx:${f2((RW() - .5) * 40)}px" cx="${f2(720 + RW() * 500)}" cy="${f2(-T + RW() * 80)}" r="${f2(big ? 1.8 + RW() : .9 + RW() * .6)}" fill="#FFFFFF" fill-opacity="${big ? .95 : .7}"/>`; } add(sn, .8); } break;
    case 3: if (!NIGHT && (wkx === 1 || wkx === 4)) { let dr = ''; for (let i = 0; i < 60; i++) { const x = 720 + RW() * 500, y = -T + RW() * (T + 240), l = 9 + RW() * 6;
        dr += `<path class="sc-rain" style="--rd:${f2(.9 + RW() * .5)}s;--rdl:${f2(-RW() * 1.6)}s;--ro:${f2(.2 + RW() * .2)}" d="M${f2(x)} ${f2(y)}l${f2(-l * .19)} ${f2(l)}" stroke="#8FA6B8" stroke-width="1" stroke-linecap="round"/>`; } s.push(`<g class="sc-fade" style="--d:.4s">${dr}</g>`); }
      else if (!opts.prot) add(Array.from({ length: 8 }, (_, i) => `<ellipse class="sc-fall2" style="--fd:${f2(9 + RW() * 4)}s;--fdl:${f2(-RW() * 12)}s;--fx:${f2(-50 - RW() * 50)}px" cx="${f2(800 + RW() * 420)}" cy="${f2(-T * .2 + RW() * 120)}" rx="3" ry="1.8" fill="${['#F4C9D8', '#FFFFFF', '#E89BB5'][i % 3]}"/>`).join(''), 1); break;
    case 4: if (!NIGHT) { if (!opts.prot) add([['#F2A23A', '#F2C230'], ['#8E5FA3', '#B58AC8']].map(([a, b], i) => butterfly(f2(760 + RW() * 180 + i * 200), f2(170 + RW() * 90), a, b, RW)).join(''), 1.4);
        add(Array.from({ length: 14 }, () => `<circle class="sc-twinkle" style="--td:${f2(2 + RW() * 3)}s;--tdl:${f2(RW() * 3)}s" cx="${f2(740 + RW() * 460)}" cy="${f2(150 + RW() * 180)}" r="${f2(.8 + RW() * .8)}" fill="#FFF6C8"/>`).join(''), 1.2); }
      else s.push(lit(Array.from({ length: 16 }, () => { const x = 740 + RW() * 460, y = 270 + RW() * (BOT - 300); return `<g class="sc-twinkle" style="--td:${f2(1.6 + RW() * 2.4)}s;--tdl:${f2(RW() * 3)}s"><circle cx="${f2(x)}" cy="${f2(y)}" r="6" fill="url(#${u}l)"/><circle cx="${f2(x)}" cy="${f2(y)}" r="1.5" fill="#F4FFB4"/></g>`; }).join(''), 1.6)); break;
    case 5: case 6: if (!NIGHT && !opts.prot) add(gull(860, 120 - T * .2, .9, '#3B3012', RW) + gull(1130, 80 - T * .3, .7, '#3B3012', RW), 1); break;
  }
  /* Brumale di giorno: la pioggerella fitta e sottile */
  if (DAYB) { let dr = ''; for (let i = 0; i < 90 + Math.round(T / 3); i++) { const x = 360 + R() * 860, y = -30 - T + R() * (300 + T), l = 8 + R() * 6;
    dr += `<path class="sc-rain" style="--rd:${f2(.85 + R() * .6)}s;--rdl:${f2(-R() * 1.6)}s;--ro:${f2(.25 + R() * .3)}" d="M${f2(x)} ${f2(y)}l${f2(-l * .19)} ${f2(l)}" stroke="#65758D" stroke-width="1.05" stroke-linecap="round"/>`; }
    s.push(`<g class="sc-fade" style="--d:.4s">${dr}</g>`); }
  return `<svg class="scene${NIGHT ? ' night' : ''}" viewBox="0 ${-T} ${SW} ${SH + T + B}" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">${defs}<g class="sc-enter">${s.join('')}</g></svg>`;
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
window.ORN = { version: '2.9', moonPhase, MONTHS, LETTER_META, metaKeyFor, dayBg, illusFor, sceneSVG, hasVariants, themeFor, patternURI, ornamentSVG, playAll, seasonFx, setToday: (s) => { todayStr = s; } };
})();
