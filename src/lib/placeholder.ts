/**
 * Deterministic, offline SVG placeholder images encoded as data URIs.
 * Keeps the demo fully self-contained (no external image hosts) while the
 * schema and <SmartImage> component fully support real Supabase Storage URLs.
 */

/* Premium, restrained palette — warm neutrals, ink and leather tones.
   Keeps product imagery looking editorial rather than loud. */
const PALETTES: Array<[string, string]> = [
  ["#2b2a24", "#4a4840"],
  ["#8a6a4a", "#b79b7c"],
  ["#3f3d35", "#6b675c"],
  ["#5c5346", "#8c8173"],
  ["#26251f", "#3f3d35"],
  ["#7c6b58", "#a89478"],
  ["#4a4840", "#75726a"],
  ["#332f28", "#5c5346"],
];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function encode(svg: string): string {
  const cleaned = svg.replace(/\n/g, "").replace(/\s{2,}/g, " ");
  return `data:image/svg+xml,${encodeURIComponent(cleaned)}`;
}

/** A premium gradient tile with the product label — used as product imagery. */
export function productPlaceholder(label: string, seed = label): string {
  const [c1, c2] = PALETTES[hash(seed) % PALETTES.length];
  const initials = label
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="600" fill="#f2f0ea"/>
    <circle cx="300" cy="250" r="150" fill="url(#g)" opacity="0.10"/>
    <rect x="210" y="150" width="180" height="260" rx="28" fill="url(#g)" opacity="0.92"/>
    <rect x="232" y="176" width="136" height="180" rx="14" fill="#ffffff" opacity="0.94"/>
    <text x="300" y="270" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="700" fill="url(#g)" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    <text x="300" y="470" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="600" fill="#16150f" text-anchor="middle">${escapeXml(
      truncate(label, 26)
    )}</text>
  </svg>`;
  return encode(svg);
}

/** A wide banner gradient. */
export function bannerPlaceholder(seed: string): string {
  const [c1, c2] = PALETTES[hash(seed) % PALETTES.length];
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="500" fill="url(#g)"/>
    <circle cx="980" cy="120" r="220" fill="#ffffff" opacity="0.08"/>
    <circle cx="1080" cy="420" r="160" fill="#ffffff" opacity="0.08"/>
  </svg>`;
  return encode(svg);
}

/** A small square logo tile for brands. */
export function logoPlaceholder(label: string): string {
  const [c1, c2] = PALETTES[hash(label) % PALETTES.length];
  const initials = label.slice(0, 2).toUpperCase();
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="24" fill="#ffffff"/>
    <rect x="8" y="8" width="104" height="104" rx="20" fill="url(#g)" opacity="0.12"/>
    <text x="60" y="60" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700" fill="url(#g)" text-anchor="middle" dominant-baseline="central">${initials}</text>
  </svg>`;
  return encode(svg);
}

/** Wide lifestyle tile for homepage bento grids. */
export function tilePlaceholder(label: string, seed = label): string {
  const [c1, c2] = PALETTES[hash(seed) % PALETTES.length];
  const initials = label
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="900" height="600" fill="#efede8"/>
    <rect width="900" height="600" fill="url(#g)" opacity="0.88"/>
    <circle cx="700" cy="140" r="180" fill="#ffffff" opacity="0.08"/>
    <circle cx="160" cy="480" r="140" fill="#ffffff" opacity="0.06"/>
    <rect x="320" y="160" width="260" height="300" rx="36" fill="#ffffff" opacity="0.18"/>
    <text x="450" y="320" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" opacity="0.9">${initials}</text>
  </svg>`;
  return encode(svg);
}

/** Editorial mosaic art for the homepage lifestyle section. */
export function lifestyleScene(kind: "protect" | "charge" | "listen"): string {
  if (kind === "protect") {
    return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2b2a24"/>
          <stop offset="1" stop-color="#8a6a4a"/>
        </linearGradient>
        <linearGradient id="case" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4eee6"/>
          <stop offset="1" stop-color="#d8c7b0"/>
        </linearGradient>
      </defs>
      <rect width="720" height="960" fill="url(#bg)"/>
      <circle cx="560" cy="160" r="220" fill="#ffffff" opacity="0.06"/>
      <rect x="210" y="170" width="300" height="580" rx="64" fill="url(#case)"/>
      <rect x="236" y="214" width="248" height="430" rx="42" fill="#16150f"/>
      <rect x="268" y="248" width="184" height="300" rx="8" fill="#2f2c26"/>
      <circle cx="360" cy="690" r="16" fill="#16150f" opacity="0.35"/>
    </svg>`);
  }
  if (kind === "charge") {
    return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1c1b16"/>
          <stop offset="1" stop-color="#4a4840"/>
        </linearGradient>
      </defs>
      <rect width="720" height="480" fill="url(#bg)"/>
      <circle cx="120" cy="400" r="160" fill="#8a6a4a" opacity="0.25"/>
      <rect x="250" y="150" width="220" height="180" rx="28" fill="#efede8"/>
      <rect x="274" y="174" width="172" height="96" rx="12" fill="#16150f"/>
      <rect x="338" y="330" width="44" height="36" rx="8" fill="#cfc8bc"/>
      <rect x="348" y="366" width="24" height="40" rx="6" fill="#8a6a4a"/>
    </svg>`);
  }
  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">
      <defs>
        <linearGradient id="bg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#3f3d35"/>
          <stop offset="1" stop-color="#6b675c"/>
        </linearGradient>
      </defs>
      <rect width="720" height="480" fill="url(#bg)"/>
      <circle cx="600" cy="80" r="140" fill="#ffffff" opacity="0.07"/>
      <ellipse cx="300" cy="250" rx="70" ry="86" fill="#f6f5f2"/>
      <ellipse cx="420" cy="250" rx="70" ry="86" fill="#e7e2d8"/>
      <path d="M300 250 C300 140 420 140 420 250" fill="none" stroke="#d8c7b0" stroke-width="10" stroke-linecap="round"/>
      <circle cx="300" cy="250" r="18" fill="#16150f"/>
      <circle cx="420" cy="250" r="18" fill="#16150f"/>
    </svg>`);
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
