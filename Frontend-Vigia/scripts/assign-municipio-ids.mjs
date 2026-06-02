/**
 * assign-municipio-ids.mjs
 *
 * Procesa el SVG exportado por Mapshaper (cauca-mapshaper.svg) y asigna
 * data-id + data-nombre a cada path/grupo de municipio del Cauca.
 *
 * USO:
 *   node scripts/assign-municipio-ids.mjs
 *
 * ── Pasos en Mapshaper (mapshaper.org) ────────────────────────────────────────
 * 1. Sube el shapefile DANE  MGN_ADM_MPIO_GRAFICO.shp
 * 2. Filtra Cauca:    -filter 'dpto_ccdgo=="19"'
 * 3. Simplifica:      -simplify 5% keep-shapes
 * 4. Asigna campos:   -each 'svg_id=mpio_cdpmp; svg_nombre=mpio_cnmbr'
 * 5. Exporta SVG:     -o format=svg id-field=svg_id cauca-mapshaper.svg
 * 6. Mueve el .svg a la RAÍZ del proyecto (Frontend-Vigia/cauca-mapshaper.svg)
 * 7. Ejecuta este script
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * El SVG de Mapshaper puede tener dos estructuras:
 *   A) id en el <path>:   <path id="19001" d="..."/>
 *   B) id en el <g>:      <g id="19001"><path d="..."/></g>
 * Este script maneja ambas.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');

// ── Municipios del Cauca (DIVIPOLA → nombre) ──────────────────────────────────
const MUNICIPIOS = {
  19001: 'POPAYÁN',
  19022: 'ALMAGUER',
  19050: 'ARGELIA',
  19075: 'BALBOA',
  19100: 'BOLÍVAR',
  19110: 'BUENOS AIRES',
  19130: 'CAJIBÍO',
  19137: 'CALDONO',
  19142: 'CALOTO',
  19212: 'CORINTO',
  19256: 'EL TAMBO',
  19290: 'FLORENCIA',
  19300: 'GUACHENÉ',
  19318: 'GUAPI',
  19355: 'INZÁ',
  19364: 'JAMBALÓ',
  19392: 'LA SIERRA',
  19397: 'LA VEGA',
  19418: 'LÓPEZ DE MICAY',
  19450: 'MERCADERES',
  19455: 'MIRANDA',
  19473: 'MORALES',
  19513: 'PADILLA',
  19517: 'PÁEZ',
  19532: 'PATÍA',
  19533: 'PIAMONTE',
  19548: 'PIENDAMÓ - TUNÍA',
  19573: 'PUERTO TEJADA',
  19585: 'PURACÉ',
  19622: 'ROSAS',
  19693: 'SAN SEBASTIÁN',
  19698: 'SANTANDER DE QUILICHAO',
  19701: 'SANTA ROSA',
  19743: 'SILVIA',
  19760: 'SOTARÁ PAISPAMBA',
  19780: 'SUÁREZ',
  19785: 'SUCRE',
  19807: 'TIMBÍO',
  19809: 'TIMBIQUÍ',
  19821: 'TORIBÍO',
  19824: 'TOTORÓ',
  19845: 'VILLA RICA',
};

// ── Leer SVG ──────────────────────────────────────────────────────────────────
const inputPath  = resolve(ROOT, 'cauca-mapshaper.svg');
const outputPath = resolve(ROOT, 'public', 'cauca-municipios.svg');

let svg;
try {
  svg = readFileSync(inputPath, 'utf-8');
} catch {
  console.error(`❌ No se encontró: ${inputPath}`);
  console.error('   Genera el archivo con Mapshaper según las instrucciones del encabezado.');
  process.exit(1);
}

let matched = 0;
let skipped = 0;

// ── Estrategia A: id en el <path> directamente ────────────────────────────────
// Mapshaper puede generar: <path id="19001" d="M..."/>
// Usamos una regex que captura TODOS los atributos del path excepto el id,
// luego los reescribe añadiendo data-id y data-nombre.
let processed = svg.replace(
  /<path\b([^>]*)>/g,
  (fullMatch, attrs) => {
    // Extraer el id si existe y es un código DIVIPOLA de 5 dígitos (19xxx)
    const idMatch = attrs.match(/\bid="(\d{5})"/);
    if (!idMatch) return fullMatch;             // no tiene id numérico de 5 dígitos

    const id     = idMatch[1];
    const numId  = Number(id);
    const nombre = MUNICIPIOS[numId];

    if (!nombre) {
      console.warn(`⚠️  ID ${id} no es municipio del Cauca, se omite`);
      skipped++;
      return fullMatch;
    }

    // Quitar el id original y reemplazar con los atributos enriquecidos
    const attrsNoId = attrs.replace(/\s*\bid="[^"]*"/, '');
    matched++;
    return `<path id="mpio-${id}" data-id="${id}" data-nombre="${nombre}"${attrsNoId}>`;
  }
);

// ── Estrategia B: id en el <g> padre (Mapshaper a veces usa grupos) ───────────
// Mapshaper puede generar: <g id="19001"><path d="..."/></g>
// En este caso transferimos data-id y data-nombre al primer <path> hijo.
if (matched === 0) {
  console.log('ℹ️  No se encontraron paths con id directo. Buscando en elementos <g>…');
  processed = svg.replace(
    /<g\b([^>]*)>([\s\S]*?)<\/g>/g,
    (fullMatch, gAttrs, inner) => {
      const idMatch = gAttrs.match(/\bid="(\d{5})"/);
      if (!idMatch) return fullMatch;

      const id     = idMatch[1];
      const numId  = Number(id);
      const nombre = MUNICIPIOS[numId];

      if (!nombre) {
        skipped++;
        return fullMatch;
      }

      // Inyectar data-id y data-nombre en el primer <path> del grupo
      const newInner = inner.replace(
        /<path\b([^>]*)>/,
        (pm, pAttrs) => {
          matched++;
          return `<path id="mpio-${id}" data-id="${id}" data-nombre="${nombre}"${pAttrs}>`;
        }
      );
      return `<g${gAttrs}>${newInner}</g>`;
    }
  );
}

// ── Resultado ─────────────────────────────────────────────────────────────────
if (matched === 0) {
  console.error('❌ No se procesó ningún municipio.');
  console.error('   Verifica que el SVG de Mapshaper tenga paths con id numérico de 5 dígitos.');
  console.error('   Abre el SVG en un editor y busca el atributo id en los elementos <path> o <g>.');
  process.exit(1);
}

writeFileSync(outputPath, processed, 'utf-8');
console.log(`✅ SVG procesado → ${outputPath}`);
console.log(`   Municipios asignados : ${matched}`);
if (skipped) console.log(`   IDs no reconocidos   : ${skipped}`);
