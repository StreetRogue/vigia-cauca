/**
 * process-cauca-svg.mjs
 *
 * Lee src/assets/cauca-municipios.svg (exportado desde Figma),
 * calcula el centroide de cada municipio, lo asigna por cercanía geográfica,
 * simplifica la precisión de coordenadas y escribe public/cauca-municipios.svg.
 *
 * USO:  node scripts/process-cauca-svg.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Municipios del Cauca: {id, nombre, lat, lon}
//    Centroides geográficos aproximados (DIVIPOLA / DANE)
// ─────────────────────────────────────────────────────────────────────────────
const MUNICIPIOS = [
  { id: 19001, nombre: 'POPAYÁN',                   lat:  2.444, lon: -76.604 },
  { id: 19022, nombre: 'ALMAGUER',                   lat:  1.926, lon: -76.859 },
  { id: 19050, nombre: 'ARGELIA',                    lat:  1.825, lon: -76.570 },
  { id: 19075, nombre: 'BALBOA',                     lat:  2.085, lon: -77.231 },
  { id: 19100, nombre: 'BOLÍVAR',                    lat:  1.875, lon: -76.960 },
  { id: 19110, nombre: 'BUENOS AIRES',               lat:  3.012, lon: -76.658 },
  { id: 19130, nombre: 'CAJIBÍO',                    lat:  2.582, lon: -76.722 },
  { id: 19137, nombre: 'CALDONO',                    lat:  2.803, lon: -76.451 },
  { id: 19142, nombre: 'CALOTO',                     lat:  3.038, lon: -76.408 },
  { id: 19212, nombre: 'CORINTO',                    lat:  3.178, lon: -76.267 },
  { id: 19256, nombre: 'EL TAMBO',                   lat:  2.452, lon: -76.820 },
  { id: 19290, nombre: 'FLORENCIA',                  lat:  1.616, lon: -76.479 },
  { id: 19300, nombre: 'GUACHENÉ',                   lat:  3.043, lon: -76.543 },
  { id: 19318, nombre: 'GUAPI',                      lat:  2.574, lon: -77.891 },
  { id: 19355, nombre: 'INZÁ',                       lat:  2.553, lon: -76.061 },
  { id: 19364, nombre: 'JAMBALÓ',                    lat:  2.835, lon: -76.220 },
  { id: 19392, nombre: 'LA SIERRA',                  lat:  1.985, lon: -76.706 },
  { id: 19397, nombre: 'LA VEGA',                    lat:  1.915, lon: -76.780 },
  { id: 19418, nombre: 'LÓPEZ DE MICAY',             lat:  3.001, lon: -77.249 },
  { id: 19450, nombre: 'MERCADERES',                 lat:  1.803, lon: -77.172 },
  { id: 19455, nombre: 'MIRANDA',                    lat:  3.228, lon: -76.291 },
  { id: 19473, nombre: 'MORALES',                    lat:  2.741, lon: -76.648 },
  { id: 19513, nombre: 'PADILLA',                    lat:  3.194, lon: -76.309 },
  { id: 19517, nombre: 'PÁEZ',                       lat:  2.769, lon: -76.023 },
  { id: 19532, nombre: 'PATÍA',                      lat:  1.812, lon: -77.052 },
  { id: 19533, nombre: 'PIAMONTE',                   lat:  0.852, lon: -76.195 },
  { id: 19548, nombre: 'PIENDAMÓ - TUNÍA',           lat:  2.637, lon: -76.619 },
  { id: 19573, nombre: 'PUERTO TEJADA',              lat:  3.234, lon: -76.414 },
  { id: 19585, nombre: 'PURACÉ',                     lat:  2.275, lon: -76.475 },
  { id: 19622, nombre: 'ROSAS',                      lat:  2.078, lon: -76.722 },
  { id: 19693, nombre: 'SAN SEBASTIÁN',              lat:  1.799, lon: -76.601 },
  { id: 19698, nombre: 'SANTANDER DE QUILICHAO',     lat:  3.006, lon: -76.483 },
  { id: 19701, nombre: 'SANTA ROSA',                 lat:  1.572, lon: -77.051 },
  { id: 19743, nombre: 'SILVIA',                     lat:  2.636, lon: -76.381 },
  { id: 19760, nombre: 'SOTARÁ PAISPAMBA',           lat:  2.171, lon: -76.569 },
  { id: 19780, nombre: 'SUÁREZ',                     lat:  3.050, lon: -76.680 },
  { id: 19785, nombre: 'SUCRE',                      lat:  2.050, lon: -76.979 },
  { id: 19807, nombre: 'TIMBÍO',                     lat:  2.340, lon: -76.682 },
  { id: 19809, nombre: 'TIMBIQUÍ',                   lat:  2.766, lon: -77.673 },
  { id: 19821, nombre: 'TORIBÍO',                    lat:  2.996, lon: -76.220 },
  { id: 19824, nombre: 'TOTORÓ',                     lat:  2.548, lon: -76.371 },
  { id: 19845, nombre: 'VILLA RICA',                 lat:  3.179, lon: -76.441 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. Leer SVG fuente
// ─────────────────────────────────────────────────────────────────────────────
const srcPath  = resolve(ROOT, 'src', 'assets', 'cauca-municipios.svg');
const outPath  = resolve(ROOT, 'public', 'cauca-municipios.svg');
const debugPath= resolve(ROOT, 'public', 'cauca-debug.svg');

const raw = readFileSync(srcPath, 'utf-8');

// ─────────────────────────────────────────────────────────────────────────────
// 3. Parsear el SVG: extraer viewBox y todos los <path mask="...">
// ─────────────────────────────────────────────────────────────────────────────

// ViewBox
const vbMatch = raw.match(/viewBox="([^"]+)"/);
if (!vbMatch) { console.error('No se encontró viewBox'); process.exit(1); }
const [vbMinX, vbMinY, vbW, vbH] = vbMatch[1].split(' ').map(Number);
console.log(`ViewBox: ${vbMinX} ${vbMinY} ${vbW} ${vbH}`);

/**
 * Extrae todos los pares de coordenadas (x y) del atributo `d` de un path.
 * Soporta M, L, H, V, Z y coordenadas implícitas.
 */
function extractCoords(d) {
  const points = [];
  // Tokenizar: letras + números
  const tokens = d.match(/[MLHVCSQTAZ]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/gi) || [];
  let i = 0, curX = 0, curY = 0, cmd = 'M';

  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[A-Za-z]$/.test(t)) { cmd = t.toUpperCase(); i++; continue; }

    const n = parseFloat(t);
    switch (cmd) {
      case 'M': case 'L': {
        curX = n; curY = parseFloat(tokens[++i]); i++;
        points.push([curX, curY]);
        break;
      }
      case 'H': { curX = n; i++; points.push([curX, curY]); break; }
      case 'V': { curY = n; i++; points.push([curX, curY]); break; }
      case 'C': {
        // Bezier cúbico: consume 6 números
        i += 4; // saltar puntos de control
        curX = parseFloat(tokens[i++]); curY = parseFloat(tokens[i++]);
        points.push([curX, curY]);
        break;
      }
      case 'S': case 'Q': {
        i += 2;
        curX = parseFloat(tokens[i++]); curY = parseFloat(tokens[i++]);
        points.push([curX, curY]);
        break;
      }
      default: i++;
    }
  }
  return points;
}

/** Calcula el centroide (media de coordenadas) de una lista de puntos */
function centroid(points) {
  if (!points.length) return [0, 0];
  const sx = points.reduce((s, p) => s + p[0], 0);
  const sy = points.reduce((s, p) => s + p[1], 0);
  return [sx / points.length, sy / points.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Calcular centroides de los paths visibles (<path mask="...">)
// ─────────────────────────────────────────────────────────────────────────────

// Los paths visibles usan mask="url(#...)" y tienen fill y stroke
const maskPathRe = /<path\s([^>]*mask="[^"]*"[^>]*)\/>/gs;
const paths = [];
let match;
while ((match = maskPathRe.exec(raw)) !== null) {
  const attrs = match[1];
  const dMatch = attrs.match(/\bd="([^"]+)"/);
  if (!dMatch) continue;
  const d  = dMatch[1];
  const pts = extractCoords(d);
  const [cx, cy] = centroid(pts);
  paths.push({ fullMatch: match[0], attrs, d, cx, cy, pts });
}

console.log(`Paths de municipio encontrados: ${paths.length}`);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Transformar coordenadas SVG → geográficas y viceversa
//    Calibración automática por bounding-box de todos los centroides
// ─────────────────────────────────────────────────────────────────────────────

const allCx = paths.map(p => p.cx);
const allCy = paths.map(p => p.cy);
const svgXmin = Math.min(...allCx), svgXmax = Math.max(...allCx);
const svgYmin = Math.min(...allCy), svgYmax = Math.max(...allCy);

// Rango geográfico del Cauca
const geoLonMin = -77.95, geoLonMax = -75.55;
const geoLatMin =   0.75, geoLatMax =   3.30;

/** Convierte coordenadas geográficas a SVG */
function geoToSvg(lat, lon) {
  const x = (lon - geoLonMin) / (geoLonMax - geoLonMin) * vbW + vbMinX;
  const y = (geoLatMax - lat) / (geoLatMax - geoLatMin) * vbH + vbMinY;
  return [x, y];
}

/** Distancia euclidiana */
function dist2(ax, ay, bx, by) {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Asignación: para cada path, encontrar el municipio más cercano
// ─────────────────────────────────────────────────────────────────────────────

const used = new Set();
const assignments = paths.map((path, pi) => {
  // Convertir centroide del path a coordenadas SVG usando la escala calibrada
  // (el centroide ya está en SVG coords — lo buscamos geográficamente)
  // Necesitamos hacer el inverso: SVG → geo → buscar municipio
  // SVG x → lon, SVG y → lat
  const lon = (path.cx - vbMinX) / vbW * (geoLonMax - geoLonMin) + geoLonMin;
  const lat = geoLatMax - (path.cy - vbMinY) / vbH * (geoLatMax - geoLatMin);

  let best = null, bestD = Infinity;
  for (const mpio of MUNICIPIOS) {
    if (used.has(mpio.id)) continue;
    const [sx, sy] = geoToSvg(mpio.lat, mpio.lon);
    const d = dist2(path.cx, path.cy, sx, sy);
    if (d < bestD) { bestD = d; best = mpio; }
  }

  if (best) used.add(best.id);
  const distPx = Math.sqrt(bestD);

  console.log(
    `Path ${pi+1}: cx=${path.cx.toFixed(1)} cy=${path.cy.toFixed(1)} ` +
    `→ lon=${lon.toFixed(2)} lat=${lat.toFixed(2)} ` +
    `→ ${best?.nombre ?? '???'} (dist=${distPx.toFixed(1)}px)`
  );

  return { path, mpio: best, distPx };
});

// Advertir si hay municipios sin asignar
const unassigned = MUNICIPIOS.filter(m => !used.has(m.id));
if (unassigned.length) {
  console.warn(`\n⚠ Municipios sin asignar: ${unassigned.map(m => m.nombre).join(', ')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Simplificar coordenadas (reducir precisión decimal → menos bytes)
// ─────────────────────────────────────────────────────────────────────────────
function simplifyD(d, precision = 1) {
  return d.replace(/[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g, (n) => {
    const f = parseFloat(n);
    return isNaN(f) ? n : f.toFixed(precision);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Reemplazar cada path en el SVG con sus nuevos atributos
// ─────────────────────────────────────────────────────────────────────────────
let result = raw;

for (const { path, mpio } of assignments) {
  if (!mpio) continue;

  // Extraer atributos originales, simplificar `d`
  const newD     = simplifyD(path.d, 1);
  const fillMatch = path.attrs.match(/\bfill="([^"]*)"/);
  const strokeMatch= path.attrs.match(/\bstroke="([^"]*)"/);
  const swMatch   = path.attrs.match(/\bstroke-width="([^"]*)"/);
  const fill     = fillMatch?.[1]     ?? 'rgba(26,63,134,0.35)';
  const stroke   = strokeMatch?.[1]   ?? 'rgba(255,255,255,0.25)';
  const sw       = swMatch?.[1]       ?? '0.5';

  const newPath = [
    `<path`,
    ` id="mpio-${mpio.id}"`,
    ` data-id="${mpio.id}"`,
    ` data-nombre="${mpio.nombre}"`,
    ` fill="${fill}"`,
    ` stroke="${stroke}"`,
    ` stroke-width="${sw}"`,
    ` d="${newD}"`,
    `/>`,
  ].join('');

  result = result.replace(path.fullMatch, newPath);
}

// Limpiar <mask> y <defs> que ya no hacen falta
result = result.replace(/<mask[^>]*>[\s\S]*?<\/mask>/g, '');
result = result.replace(/<defs>[\s\S]*?<\/defs>/g, '');
// Limpiar g con clip-path (dejar solo su contenido)
result = result.replace(/<g clip-path="[^"]*">/g, '<g>');

// ─────────────────────────────────────────────────────────────────────────────
// 9. Escribir outputs
// ─────────────────────────────────────────────────────────────────────────────
mkdirSync(resolve(ROOT, 'public'), { recursive: true });
writeFileSync(outPath, result, 'utf-8');

const kbIn  = Math.round(readFileSync(srcPath).length / 1024);
const kbOut = Math.round(result.length / 1024);
console.log(`\n✅ Generado: ${outPath}`);
console.log(`   Tamaño: ${kbIn} KB → ${kbOut} KB (${Math.round((1-kbOut/kbIn)*100)}% reducción)`);

// ── Debug SVG: centroide + nombre de cada municipio ──────────────────────────
let debugSvg = result;
// Añadir labels al final, antes de </svg>
const labels = assignments
  .filter(a => a.mpio)
  .map(({ path, mpio }) => {
    const fontSize = 4;
    return [
      `<circle cx="${path.cx.toFixed(1)}" cy="${path.cy.toFixed(1)}" r="3" fill="red" opacity="0.7"/>`,
      `<text x="${path.cx.toFixed(1)}" y="${(path.cy - 5).toFixed(1)}"`,
      ` font-size="${fontSize}" fill="white" text-anchor="middle"`,
      ` font-family="monospace">${mpio.nombre}</text>`,
    ].join('');
  })
  .join('\n');

debugSvg = debugSvg.replace('</svg>', `${labels}\n</svg>`);
writeFileSync(debugPath, debugSvg, 'utf-8');
console.log(`🔍 Debug SVG: ${debugPath}  (abre en browser para verificar etiquetas)`);
