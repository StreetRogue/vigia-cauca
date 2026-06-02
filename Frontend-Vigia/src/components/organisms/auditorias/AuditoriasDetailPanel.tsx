import { useState } from 'react';
import type { AuditoriaDTORespuesta } from '../../../types/novedad.types';
import styles from './AuditoriasDetailPanel.module.css';

const ACCION_LABELS: Record<string, string> = {
  CREATE:       'Creación',
  UPDATE:       'Actualización',
  DELETE:       'Eliminación',
  EXCEL_IMPORT: 'Importación Excel',
};

function formatFechaHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function tryPrettyJson(raw: string | null): string {
  if (!raw) return '—';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

interface JsonBlockProps {
  title: string;
  content: string | null;
  defaultOpen?: boolean;
}

function JsonBlock({ title, content, defaultOpen = false }: JsonBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const text = tryPrettyJson(content);
  const isEmpty = !content;

  return (
    <div className={styles.jsonBlock}>
      <button
        className={styles.jsonToggle}
        onClick={() => !isEmpty && setOpen(o => !o)}
        disabled={isEmpty}
      >
        <span className={[styles.jsonArrow, open ? styles.jsonArrowOpen : ''].filter(Boolean).join(' ')}>
          {isEmpty ? '' : '▶'}
        </span>
        <span className={styles.jsonTitle}>{title}</span>
        {isEmpty && <span className={styles.jsonEmpty}>vacío</span>}
      </button>
      {open && !isEmpty && (
        <pre className={styles.jsonPre}>{text}</pre>
      )}
    </div>
  );
}

interface Props {
  auditoria: AuditoriaDTORespuesta | null;
}

export function AuditoriasDetailPanel({ auditoria }: Props) {
  if (!auditoria) {
    return (
      <div className={styles.panel}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>🔍</div>
          <p className={styles.placeholderText}>Seleccione un registro para ver el detalle</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <p className={styles.headerId}>
            #{auditoria.auditoriaId.substring(0, 8).toUpperCase()}
          </p>
          <span className={[styles.accionBadge, styles[`acc_${auditoria.accion}`]].filter(Boolean).join(' ')}>
            {ACCION_LABELS[auditoria.accion] ?? auditoria.accion}
          </span>
        </div>
      </div>

      <div className={styles.body}>
        {/* ── Metadatos ── */}
        <div className={styles.section}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Fecha y hora</span>
            <span className={styles.infoValue}>{formatFechaHora(auditoria.fecha)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Novedad</span>
            <span className={[styles.infoValue, styles.monoValue].join(' ')}>
              {auditoria.novedadId ?? '—'}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Usuario</span>
            <span className={[styles.infoValue, styles.monoValue].join(' ')}>
              {auditoria.usuarioId}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* ── Cambios ── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>DETALLE DE CAMBIOS</p>
          <JsonBlock title="Cambios"          content={auditoria.cambios}          defaultOpen={true} />
          <JsonBlock title="Datos anteriores" content={auditoria.datosAnteriores} />
          <JsonBlock title="Datos nuevos"     content={auditoria.datosNuevos}     />
        </div>
      </div>
    </div>
  );
}
