import { useEffect, useRef, useState, useCallback } from 'react';
import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import styles from './MapPanel.module.css';
import type { EstadisticaMunicipioDTO } from '../../../types/estadisticas.types';

// ── Municipios del Cauca: id → nombre (igual que el seed SQL) ─────────────────
const MUNICIPIO_NAMES: Record<number, string> = {
  19001: 'POPAYÁN',           19022: 'ALMAGUER',        19050: 'ARGELIA',
  19075: 'BALBOA',            19100: 'BOLÍVAR',          19110: 'BUENOS AIRES',
  19130: 'CAJIBÍO',           19137: 'CALDONO',          19142: 'CALOTO',
  19212: 'CORINTO',           19256: 'EL TAMBO',         19290: 'FLORENCIA',
  19300: 'GUACHENÉ',          19318: 'GUAPI',            19355: 'INZÁ',
  19364: 'JAMBALÓ',           19392: 'LA SIERRA',        19397: 'LA VEGA',
  19418: 'LÓPEZ DE MICAY',    19450: 'MERCADERES',       19455: 'MIRANDA',
  19473: 'MORALES',           19513: 'PADILLA',          19517: 'PÁEZ',
  19532: 'PATÍA',             19533: 'PIAMONTE',         19548: 'PIENDAMÓ - TUNÍA',
  19573: 'PUERTO TEJADA',     19585: 'PURACÉ',           19622: 'ROSAS',
  19693: 'SAN SEBASTIÁN',     19698: 'SANTANDER DE QUILICHAO',
  19701: 'SANTA ROSA',        19743: 'SILVIA',           19760: 'SOTARÁ PAISPAMBA',
  19780: 'SUÁREZ',            19785: 'SUCRE',            19807: 'TIMBÍO',
  19809: 'TIMBIQUÍ',          19821: 'TORIBÍO',          19824: 'TOTORÓ',
  19845: 'VILLA RICA',
};

// ── Escala de colores (bajo → crítico) ────────────────────────────────────────
function getHeatColor(ratio: number): string {
  // ratio 0-1 → de azul profundo a rojo crítico
  if (ratio <= 0)    return 'rgba(26,63,134,0.25)';
  if (ratio < 0.20)  return 'rgba(26,63,134,0.55)';
  if (ratio < 0.40)  return 'rgba(59,100,180,0.70)';
  if (ratio < 0.55)  return 'rgba(200,151,31,0.70)';
  if (ratio < 0.75)  return 'rgba(230,100,30,0.80)';
  return                    'rgba(192,57,43,0.90)';
}

function getHeatLabel(ratio: number): string {
  if (ratio <= 0)   return 'Sin datos';
  if (ratio < 0.20) return 'Muy bajo';
  if (ratio < 0.40) return 'Bajo';
  if (ratio < 0.55) return 'Medio';
  if (ratio < 0.75) return 'Alto';
  return 'Crítico';
}

const LEGEND = [
  { label: 'Sin datos', color: 'rgba(26,63,134,0.25)' },
  { label: 'Bajo',      color: 'rgba(59,100,180,0.70)' },
  { label: 'Medio',     color: 'rgba(200,151,31,0.70)' },
  { label: 'Alto',      color: 'rgba(230,100,30,0.80)' },
  { label: 'Crítico',   color: 'rgba(192,57,43,0.90)'  },
];

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipData {
  x: number; y: number;
  nombre: string;
  totalEventos: number;
  totalMuertos: number;
  nivel: string;
  color: string;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MapPanelProps {
  municipios?:         EstadisticaMunicipioDTO[];
  loading?:            boolean;
  selectedMunicipio?:  string;               // nombre seleccionado actualmente
  onMunicipioSelect?:  (nombre: string | null) => void;
}

// ═════════════════════════════════════════════════════════════════════════════
export function MapPanel({ municipios, loading, selectedMunicipio, onMunicipioSelect }: MapPanelProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapAreaRef   = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [svgError, setSvgError]   = useState(false);

  // ── Construir índice nombre → stats ────────────────────────────────────────
  const statsByNombre: Record<string, EstadisticaMunicipioDTO> = {};
  let maxEventos = 1;
  (municipios ?? []).forEach((m) => {
    statsByNombre[m.municipio.toUpperCase()] = m;
    if (m.totalEventos > maxEventos) maxEventos = m.totalEventos;
  });

  // ── Cargar SVG externo (public/cauca-municipios.svg) ───────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setSvgLoaded(false);
    setSvgError(false);

    fetch('/cauca-municipios.svg')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((svgText) => {
        container.innerHTML = svgText;
        const svgEl = container.querySelector('svg');
        if (svgEl) {
          // Expandir el viewBox un 3% en cada lado para que los strokes
          // de los municipios en los bordes no queden cortados
          const vb = svgEl.viewBox.baseVal;
          if (vb && vb.width > 0 && vb.height > 0) {
            const padX = vb.width  * 0.03;
            const padY = vb.height * 0.03;
            svgEl.setAttribute(
              'viewBox',
              `${vb.x - padX} ${vb.y - padY} ${vb.width + padX * 2} ${vb.height + padY * 2}`,
            );
          }
          // Escalar preservando la relación de aspecto
          svgEl.removeAttribute('width');
          svgEl.removeAttribute('height');
          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          svgEl.style.width    = '100%';
          svgEl.style.height   = '100%';
          svgEl.style.display  = 'block';
          svgEl.style.overflow = 'visible'; // permite ver strokes en el límite del viewBox
        }
        setSvgLoaded(true);
      })
      .catch(() => setSvgError(true));
  }, []);

  // ── Aplicar colores y eventos cada vez que cambian los datos ───────────────
  useEffect(() => {
    if (!svgLoaded || !containerRef.current) return;
    const container = containerRef.current;

    // Seleccionar todos los paths de municipios (id="mpio-XXXXX")
    const paths = container.querySelectorAll<SVGPathElement>('path[data-id]');

    paths.forEach((path) => {
      const idAttr  = path.getAttribute('data-id');
      const nombre  = (path.getAttribute('data-nombre') ?? MUNICIPIO_NAMES[Number(idAttr)] ?? '').toUpperCase();
      const stats   = statsByNombre[nombre];
      const ratio   = stats ? stats.totalEventos / maxEventos : 0;
      const color   = getHeatColor(ratio);
      const isSelected = selectedMunicipio?.toUpperCase() === nombre;

      // Estilo base
      path.style.fill   = color;
      path.style.stroke = isSelected ? 'var(--dash-accent)' : 'rgba(255,255,255,0.18)';
      path.style.strokeWidth = isSelected ? '2.5' : '0.5';
      path.style.cursor = 'pointer';
      path.style.transition = 'fill 0.2s, stroke 0.2s, opacity 0.15s';

      // Helpers de posición con clamping para que el tooltip no se corte
      const TOOLTIP_W = 178;
      const TOOLTIP_H = 124;
      const calcPos = (e: MouseEvent) => {
        const areaEl = mapAreaRef.current;
        if (!areaEl) return { x: 0, y: 0 };
        const rect = areaEl.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        // Voltear a la izquierda si no hay espacio a la derecha
        const x = cx + TOOLTIP_W + 18 > rect.width  ? cx - TOOLTIP_W - 6 : cx + 14;
        // Subir si no hay espacio abajo
        const y = cy + TOOLTIP_H + 10 > rect.height ? cy - TOOLTIP_H - 6 : cy - 10;
        return { x: Math.max(4, x), y: Math.max(4, y) };
      };

      // Handlers
      const onEnter = (e: MouseEvent) => {
        if (!isSelected) {
          path.style.opacity     = '0.85';
          path.style.strokeWidth = '1.5';
          path.style.stroke      = 'rgba(255,255,255,0.6)';
        }
        const { x, y } = calcPos(e);
        setTooltip({
          x, y,
          nombre:       nombre || `ID ${idAttr}`,
          totalEventos: stats?.totalEventos ?? 0,
          totalMuertos: stats?.totalMuertos  ?? 0,
          nivel:        getHeatLabel(ratio),
          color,
        });
      };

      const onMove = (e: MouseEvent) => {
        const { x, y } = calcPos(e);
        setTooltip((t) => t ? { ...t, x, y } : null);
      };

      const onLeave = () => {
        if (!isSelected) {
          path.style.opacity     = '1';
          path.style.strokeWidth = '0.5';
          path.style.stroke      = 'rgba(255,255,255,0.18)';
        }
        setTooltip(null);
      };

      const onClick = () => {
        const nombreTitle = nombre.charAt(0) + nombre.slice(1).toLowerCase();
        if (selectedMunicipio === nombreTitle) {
          onMunicipioSelect?.(null);   // deseleccionar
        } else {
          // El backend guarda los nombres en mayúsculas, pero el filtro
          // puede ser case-sensitive; pasamos como está en el estadístico
          onMunicipioSelect?.(stats?.municipio ?? nombre);
        }
      };

      // Limpiar handlers previos clonando el nodo
      const clone = path.cloneNode(true) as SVGPathElement;
      path.parentNode?.replaceChild(clone, path);
      clone.addEventListener('mouseenter', onEnter);
      clone.addEventListener('mousemove',  onMove);
      clone.addEventListener('mouseleave', onLeave);
      clone.addEventListener('click',      onClick);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgLoaded, municipios, selectedMunicipio, maxEventos]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <CapLabel color="var(--color-primary-400)">INTELIGENCIA GEOESPACIAL · CAUCA</CapLabel>
        <div className={styles.headerRight}>
          {selectedMunicipio && (
            <button className={styles.clearBtn} onClick={() => onMunicipioSelect?.(null)}>
              <svg viewBox="0 0 10 10" width={9} height={9} fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <CapLabel size={7} color="inherit">
                {selectedMunicipio.length > 14 ? selectedMunicipio.slice(0, 14) + '…' : selectedMunicipio}
              </CapLabel>
            </button>
          )}
        </div>
      </div>

      {/* Coordenadas */}
      <div className={styles.coords}>
        <CapLabel size={8} color="var(--color-primary-400)">2.891° N  76.920° W</CapLabel>
        <CapLabel size={8} color="var(--color-primary-400)">0.653° N  77.885° W</CapLabel>
      </div>

      {/* Área del mapa */}
      <div className={styles.mapArea} ref={mapAreaRef}>
        {/* SVG cargado inline */}
        <div
          ref={containerRef}
          className={styles.svgContainer}
          style={{ display: svgLoaded && !svgError ? 'flex' : 'none' }}
        />

        {/* Placeholder mientras carga o si hay error */}
        {(!svgLoaded || svgError) && (
          <div className={styles.placeholder}>
            {svgError ? (
              <>
                <svg viewBox="0 0 220 260" className={styles.caucaSvg} fill="none">
                  <path
                    d="M 95,12 L 118,9 L 142,28 L 158,55 L 165,85 L 162,115 L 155,145 L 142,172 L 124,198 L 100,215 L 78,212 L 56,198 L 38,174 L 30,145 L 34,112 L 40,82 L 52,52 L 70,28 Z"
                    fill="rgba(26,63,134,0.20)"
                    stroke="var(--color-primary-400)"
                    strokeWidth="1.5"
                  />
                </svg>
                <div className={styles.placeholderLabel}>
                  <CapLabel color="var(--dash-text-2)">Mapa no disponible</CapLabel>
                  <div className={styles.placeholderSub}>
                    Genera <code>public/cauca-municipios.svg</code><br />
                    con Mapshaper (ver scripts/assign-municipio-ids.mjs)
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.spinnerWrap}>
                <div className={styles.spinner} />
                <CapLabel size={8} color="var(--dash-text-3)">Cargando mapa…</CapLabel>
              </div>
            )}
          </div>
        )}

        {/* Tooltip */}
        {tooltip && (
          <div
            className={styles.tooltip}
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className={styles.tooltipHeader}>
              <div className={styles.tooltipDot} style={{ background: tooltip.color }} />
              <span className={styles.tooltipName}>{tooltip.nombre}</span>
            </div>
            <div className={styles.tooltipDivider} />
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Eventos</span>
              <span className={styles.tooltipVal}>{tooltip.totalEventos}</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Muertos</span>
              <span className={styles.tooltipVal}>{tooltip.totalMuertos}</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Nivel</span>
              <span className={styles.tooltipVal} style={{ color: tooltip.color }}>{tooltip.nivel}</span>
            </div>
            <div className={styles.tooltipHint}>Click para filtrar</div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className={styles.legend}>
        <CapLabel color="var(--dash-text-3)">INTENSIDAD:</CapLabel>
        {LEGEND.map(({ label, color }) => (
          <div key={label} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: color }} />
            <CapLabel size={8} color="var(--dash-text-2)">{label}</CapLabel>
          </div>
        ))}
      </div>
    </div>
  );
}
