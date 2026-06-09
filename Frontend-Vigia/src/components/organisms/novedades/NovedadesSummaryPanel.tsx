import { useEffect, useState } from 'react';
import { novedadesService } from '../../../services/novedades.service';
import { estadisticasService } from '../../../services/estadisticas.service';
import type { NovedadDTORespuesta } from '../../../types/novedad.types';
import type { ResumenKPIDTO } from '../../../types/estadisticas.types';
import styles from './NovedadesSummaryPanel.module.css';

interface Props {
  /** Cambia cada vez que la lista de novedades se modifica (crear/editar/eliminar). */
  refreshKey?: number;
  /** Rol del usuario; OPERADOR solo cuenta sus propias novedades, ADMIN todas. */
  userRole?: string;
  /** UUID del usuario autenticado (para el filtro por rol). */
  userId?: string;
}

interface AuditActivity {
  id: string;
  text: string;
  date: string;
  dot: 'green' | 'orange' | 'red' | 'blue' | 'gray';
}

function formatAuditDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  ENFRENTAMIENTO:        'Enfrentamiento',
  HOSTIGAMIENTO:         'Hostigamiento',
  ATENTADO_TERRORISTA:   'Atentado Terrorista',
  ATAQUE_CON_DRON:       'Ataque con Dron',
  HOMICIDIO:             'Homicidio',
  SECUESTRO:             'Secuestro',
  RETEN_ILEGAL:          'Retén Ilegal',
  RECLUTAMIENTO_ILICITO: 'Reclutamiento Ilícito',
  ACCION_DE_PROTESTA:    'Acción de Protesta',
  HALLAZGO_DE_MATERIAL:  'Hallazgo de Material',
  OTRO:                  'Otro',
};

export function NovedadesSummaryPanel({ refreshKey = 0, userRole, userId }: Props) {
  const [novedades, setNovedades] = useState<NovedadDTORespuesta[]>([]);
  const [resumen, setResumen]     = useState<ResumenKPIDTO | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params: any = { page: 0, size: 5, sort: 'fechaHecho,desc' };
    const filtrosStats: any = {};

    if (userRole && userId) {
      params.rol = userRole;
      params.usuarioId = userId;
      if (userRole !== 'ADMIN') filtrosStats.usuarioId = userId;
    }

    Promise.all([
      novedadesService.listarPaginado(params),
      estadisticasService.getResumen(filtrosStats)
    ])
      .then(([resNovedades, resStats]) => {
        if (!cancelled) {
          setNovedades(resNovedades.content || []);
          setResumen(resStats);
        }
      })
      .catch(err => {
        console.error('[SummaryPanel] Error cargando resumen:', err);
        if (!cancelled) {
          setNovedades([]);
          setResumen(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [refreshKey, userRole, userId]);

  // ── KPIs derivados del backend ───────────────────────────────────────────────
  const totalEventos     = resumen?.totalEventos ?? 0;
  const totalMuertos     = resumen?.totalMuertos ?? 0;
  const totalHeridos     = resumen?.totalHeridos ?? 0;
  const totalDesplazados = resumen?.totalDesplazados ?? 0;

  // ── Feed: 5 novedades más recientes ──────────────────────────────────────────
  const activities: AuditActivity[] = novedades.map(nov => ({
      id: nov.novedadId,
      text: `Novedad registrada: ${CATEGORY_LABELS[nov.categoria] ?? nov.categoria}`,
      date: nov.fechaReporte ? formatAuditDate(nov.fechaReporte) : formatAuditDate(nov.fechaHecho),
      dot: nov.nivelConfianza === 'CONFIRMADO' ? 'green'
        : nov.nivelConfianza === 'PRELIMINAR'  ? 'orange'
        : 'blue',
  }));

  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>RESUMEN · NOVEDADES</p>

      <div className={styles.metricsGrid}>
        <article className={[styles.metricBox, styles.metricBlue].join(' ')}>
          <strong>{loading ? '—' : totalEventos}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>TOTAL NOVEDADES</span>
            <span className={styles.metricSubtitle}>registradas</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricRed].join(' ')}>
          <strong>{loading ? '—' : totalMuertos}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>TOTAL MUERTOS</span>
            <span className={styles.metricSubtitle}>afectación humana</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricOrange].join(' ')}>
          <strong>{loading ? '—' : totalHeridos}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>TOTAL HERIDOS</span>
            <span className={styles.metricSubtitle}>reportados</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricGreen].join(' ')}>
          <strong>{loading ? '—' : totalDesplazados}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>DESPLAZADOS</span>
            <span className={styles.metricSubtitle}>reportados</span>
          </div>
        </article>
      </div>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>AFECTACIÓN HUMANA</h3>
        {loading ? (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Cargando...</p>
        ) : (
          <>
            <div className={styles.progressGroup}>
              <div className={styles.progressLabelRow}>
                <span>MUERTOS</span>
                <span>{totalMuertos}</span>
              </div>
              <div className={styles.track}>
                <span
                  className={styles.fill}
                  style={{
                    width: `${totalEventos > 0 ? Math.min((totalMuertos / totalEventos) * 100, 100) : 0}%`,
                    background: '#e74c3c',
                  }}
                />
              </div>
            </div>
            <div className={styles.progressGroup}>
              <div className={styles.progressLabelRow}>
                <span>HERIDOS</span>
                <span>{totalHeridos}</span>
              </div>
              <div className={styles.track}>
                <span
                  className={styles.fill}
                  style={{
                    width: `${totalEventos > 0 ? Math.min((totalHeridos / totalEventos) * 100, 100) : 0}%`,
                    background: '#f39c12',
                  }}
                />
              </div>
            </div>
          </>
        )}
      </section>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>ACTIVIDAD RECIENTE</h3>
        <ul className={styles.activityList}>
          {loading ? (
            <li style={{ padding: '14px 0', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              Cargando actividad...
            </li>
          ) : activities.length > 0 ? (
            activities.map(act => (
              <li key={act.id} className={styles.activityItem}>
                <span className={[styles.dot, styles[act.dot]].join(' ')} aria-hidden="true" />
                <div>
                  <p className={styles.activityText}>{act.text}</p>
                  <p className={styles.activityDate}>{act.date}</p>
                </div>
              </li>
            ))
          ) : (
            <li style={{ padding: '14px 0', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              No hay actividad reciente
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
