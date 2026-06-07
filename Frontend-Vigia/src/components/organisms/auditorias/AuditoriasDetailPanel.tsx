import { useState } from 'react';
import type { AuditoriaDTORespuesta } from '../../../types/novedad.types';
import styles from './AuditoriasDetailPanel.module.css';

// ── Etiquetas de campos ───────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  municipio:              'Municipio',
  localidadEspecifica:    'Localidad específica',
  categoria:              'Categoría',
  fechaHecho:             'Fecha del hecho',
  horaInicio:             'Hora de inicio',
  horaFin:                'Hora de fin',
  descripcionHecho:       'Descripción del hecho',
  actores:                'Actores involucrados',
  infraestructuraAfectada:'Infraestructura afectada',
  accionInstitucional:    'Acción institucional',
  nivelConfianza:         'Nivel de confianza',
  nivelVisibilidad:       'Visibilidad',
  usuarioId:              'Registrado por',
  usuarioActualizacion:   'Modificado por',
};

// Campos a mostrar (en orden) — se omiten IDs técnicos y fechas de sistema
const DISPLAY_FIELDS = [
  'municipio', 'localidadEspecifica', 'categoria', 'fechaHecho',
  'horaInicio', 'horaFin', 'descripcionHecho', 'actores',
  'infraestructuraAfectada', 'accionInstitucional', 'nivelConfianza', 'nivelVisibilidad',
];

const ENUM_LABELS: Record<string, string> = {
  // Categorías
  HOMICIDIO: 'Homicidio', ENFRENTAMIENTO: 'Enfrentamiento', AMENAZA: 'Amenaza',
  SECUESTRO: 'Secuestro', DESPLAZAMIENTO: 'Desplazamiento masivo',
  CONFINAMIENTO: 'Confinamiento', MINA_ANTIPERSONA: 'Mina antipersona',
  ATAQUE_CON_DRON: 'Ataque con dron', ATAQUE_INFRAESTRUCTURA: 'Ataque a infraestructura',
  EXTORSION: 'Extorsión', DESAPARICION_FORZADA: 'Desaparición forzada',
  RECLUTAMIENTO_FORZADO: 'Reclutamiento forzado', VIOLENCIA_SEXUAL: 'Violencia sexual',
  ACCION_DE_PROTESTA: 'Acción de protesta', INCAUTACION: 'Incautación',
  BOMBARDEO: 'Bombardeo',
  // Confianza
  ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja',
  // Visibilidad
  PUBLICA: 'Pública', PRIVADA: 'Privada',
  // Actores
  FARC_EP: 'FARC-EP', ELN: 'ELN', BACRIM: 'Bacrim',
  FUERZA_PUBLICA: 'Fuerza pública', DISIDENCIAS_FARC: 'Disidencias FARC',
  AGC: 'AGC', COMUNIDADES: 'Comunidades', CIVIL: 'Civil',
  GRUPOS_ARMADOS: 'Grupos armados', FUERZAS_MILITARES: 'Fuerzas militares',
};

const ACCION_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  CREATE:       { label: 'Creación',           icon: '✦', color: 'green'  },
  UPDATE:       { label: 'Actualización',       icon: '⟳', color: 'yellow' },
  DELETE:       { label: 'Eliminación',         icon: '✕', color: 'red'   },
  EXCEL_IMPORT: { label: 'Importación Excel',   icon: '↑', color: 'purple' },
};

// ── Formateo de valores ───────────────────────────────────────────────────────
function fmtValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (Array.isArray(val)) {
    if (val.length === 0) return '—';
    return val.map(v => ENUM_LABELS[String(v)] ?? String(v)).join(' · ');
  }
  const s = String(val).trim();
  if (!s) return '—';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s))
    return s.substring(0, 8).toUpperCase();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    try { return new Date(s).toLocaleString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch { return s; }
  }
  if (/^\d{2}:\d{2}/.test(s)) return s.substring(0, 5);
  return ENUM_LABELS[s] ?? s;
}

function parseData(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    return (typeof p === 'object' && p !== null && !Array.isArray(p))
      ? p as Record<string, unknown>
      : null;
  } catch { return null; }
}

function relTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1)  return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'ayer';
  if (days < 7)   return `hace ${days} días`;
  if (days < 30)  return `hace ${Math.floor(days/7)} sem.`;
  return `hace ${Math.floor(days/30)} meses`;
}

function fullDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

/** Fila de campo para CREATE / DELETE / EXCEL_IMPORT */
function FieldRow({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'red' }) {
  if (value === '—') return null;
  return (
    <div className={`${styles.fieldRow} ${accent ? styles[`fieldRow_${accent}`] : ''}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  );
}

/** Fila de diff para UPDATE: muestra antes → después */
function DiffRow({ label, before, after }: { label: string; before: string; after: string }) {
  const noChange = before === after;
  if (noChange) return null;
  return (
    <div className={styles.diffRow}>
      <span className={styles.diffLabel}>{label}</span>
      <div className={styles.diffValues}>
        <span className={styles.diffBefore}>
          <span className={styles.diffMarker}>−</span> {before}
        </span>
        <span className={styles.diffArrow}>→</span>
        <span className={styles.diffAfter}>
          <span className={styles.diffMarker}>+</span> {after}
        </span>
      </div>
    </div>
  );
}

/** Bloque de campos sin cambios (colapsable) */
function UnchangedBlock({ fields }: { fields: Array<{ label: string; value: string }> }) {
  const [open, setOpen] = useState(false);
  const visible = fields.filter(f => f.value !== '—');
  if (!visible.length) return null;
  return (
    <div className={styles.unchangedBlock}>
      <button className={styles.unchangedToggle} onClick={() => setOpen(o => !o)}>
        <span className={`${styles.toggleArrow} ${open ? styles.toggleArrowOpen : ''}`}>▶</span>
        {open ? 'Ocultar' : 'Ver'} {visible.length} campo{visible.length !== 1 ? 's' : ''} sin cambios
      </button>
      {open && visible.map(f => (
        <div key={f.label} className={styles.unchangedRow}>
          <span className={styles.fieldLabel}>{f.label}</span>
          <span className={`${styles.fieldValue} ${styles.fieldValueMuted}`}>{f.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Panel principal ───────────────────────────────────────────────────────────
interface Props {
  auditoria: AuditoriaDTORespuesta | null;
}

export function AuditoriasDetailPanel({ auditoria }: Props) {
  if (!auditoria) {
    return (
      <div className={styles.panel}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <svg viewBox="0 0 40 40" width={40} height={40} fill="none">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
              <path d="M14 20h12M20 14v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
            </svg>
          </div>
          <p className={styles.placeholderTitle}>Selecciona un registro</p>
          <p className={styles.placeholderSub}>Haz clic en cualquier fila para ver el detalle del evento</p>
        </div>
      </div>
    );
  }

  const cfg = ACCION_CONFIG[auditoria.accion] ?? { label: auditoria.accion, icon: '●', color: 'gray' };
  const datosNuevos    = parseData(auditoria.datosNuevos);
  const datosAnteriores = parseData(auditoria.datosAnteriores);

  // ── Renderizado según tipo de acción ─────────────────────────────────────
  const renderBody = () => {
    switch (auditoria.accion) {

      case 'CREATE':
      case 'EXCEL_IMPORT': {
        const data = datosNuevos;
        if (!data) return <p className={styles.noData}>Sin datos disponibles</p>;
        return (
          <>
            <p className={styles.sectionTitle}>DATOS REGISTRADOS</p>
            <div className={styles.fieldList}>
              {DISPLAY_FIELDS.map(key => (
                <FieldRow
                  key={key}
                  label={FIELD_LABELS[key] ?? key}
                  value={fmtValue(data[key])}
                  accent="green"
                />
              ))}
            </div>
          </>
        );
      }

      case 'DELETE': {
        const data = datosAnteriores;
        if (!data) return <p className={styles.noData}>Sin datos disponibles</p>;
        return (
          <>
            <p className={styles.sectionTitle}>DATOS ELIMINADOS</p>
            <div className={styles.fieldList}>
              {DISPLAY_FIELDS.map(key => (
                <FieldRow
                  key={key}
                  label={FIELD_LABELS[key] ?? key}
                  value={fmtValue(data[key])}
                  accent="red"
                />
              ))}
            </div>
          </>
        );
      }

      case 'UPDATE': {
        if (!datosAnteriores || !datosNuevos) {
          return <p className={styles.noData}>Sin datos de comparación disponibles</p>;
        }

        const changed: Array<{ key: string; before: string; after: string }> = [];
        const unchanged: Array<{ label: string; value: string }> = [];

        for (const key of DISPLAY_FIELDS) {
          const before = fmtValue(datosAnteriores[key]);
          const after  = fmtValue(datosNuevos[key]);
          if (before !== after) {
            changed.push({ key, before, after });
          } else {
            unchanged.push({ label: FIELD_LABELS[key] ?? key, value: after });
          }
        }

        return (
          <>
            <p className={styles.sectionTitle}>
              CAMBIOS REALIZADOS
              {changed.length > 0 && (
                <span className={styles.changeCount}>{changed.length} modificaci{changed.length === 1 ? 'ón' : 'ones'}</span>
              )}
            </p>

            {changed.length === 0 ? (
              <p className={styles.noData}>No se detectaron cambios en los campos principales</p>
            ) : (
              <div className={styles.diffList}>
                {changed.map(({ key, before, after }) => (
                  <DiffRow
                    key={key}
                    label={FIELD_LABELS[key] ?? key}
                    before={before}
                    after={after}
                  />
                ))}
              </div>
            )}

            <UnchangedBlock fields={unchanged} />
          </>
        );
      }

      default:
        return <p className={styles.noData}>Tipo de evento no reconocido</p>;
    }
  };

  return (
    <div className={styles.panel}>
      {/* ── Cabecera ── */}
      <div className={`${styles.header} ${styles[`header_${cfg.color}`]}`}>
        <div className={styles.headerTop}>
          <span className={`${styles.accionBadge} ${styles[`acc_${auditoria.accion}`]}`}>
            <span className={styles.badgeIcon}>{cfg.icon}</span>
            {cfg.label}
          </span>
          <span className={styles.relTime}>{relTime(auditoria.fecha)}</span>
        </div>
        <p className={styles.headerDate}>{fullDateTime(auditoria.fecha)}</p>
      </div>

      {/* ── Referencia ── */}
      <div className={styles.refBar}>
        <div className={styles.refItem}>
          <span className={styles.refLabel}>Novedad</span>
          <code className={styles.refCode}>
            {auditoria.novedadId ? auditoria.novedadId.substring(0, 8).toUpperCase() : '—'}
          </code>
        </div>
        <div className={styles.refDivider} />
        <div className={styles.refItem}>
          <span className={styles.refLabel}>Usuario</span>
          <code className={styles.refCode}>
            {auditoria.usuarioId.substring(0, 8).toUpperCase()}
          </code>
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div className={styles.body}>
        {renderBody()}
      </div>
    </div>
  );
}
