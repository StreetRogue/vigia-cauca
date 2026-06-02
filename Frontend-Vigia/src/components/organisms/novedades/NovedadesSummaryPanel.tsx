import { useEffect, useState } from 'react';
import { estadisticasService } from '../../../services/estadisticas.service';
import { novedadesService } from '../../../services/novedades.service';
import type { ResumenKPIDTO } from '../../../types/estadisticas.types';
import type { NovedadDTORespuesta } from '../../../types/novedad.types';
import styles from './NovedadesSummaryPanel.module.css';

interface AuditActivity {
  id: string;
  text: string;
  date: string;
  dot: 'green' | 'orange' | 'red' | 'blue' | 'gray';
}

function formatAuditDate(isoDate: string): string {
  const date = new Date(isoDate);
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

export function NovedadesSummaryPanel() {
  const [resumen, setResumen]     = useState<ResumenKPIDTO | null>(null);
  const [activities, setActivities] = useState<AuditActivity[]>([]);
  const [loadingKpi, setLoadingKpi]       = useState(true);
  const [loadingFeed, setLoadingFeed]     = useState(true);

  useEffect(() => {
    // Carga 1: KPIs del endpoint optimizado de estadísticas (muy rápido)
    estadisticasService.getResumen({ anio: new Date().getFullYear() })
      .then(data => setResumen(data))
      .catch(err => console.error('[SummaryPanel] Error KPIs:', err))
      .finally(() => setLoadingKpi(false));

    // Carga 2: Solo 5 novedades recientes para el feed de auditoría
    novedadesService.listarPaginado({ page: 0, size: 5 })
      .then(res => {
        const recientes: NovedadDTORespuesta[] = res.content || [];
        const acts: AuditActivity[] = recientes.map(nov => ({
          id: nov.novedadId,
          text: `Novedad registrada: ${CATEGORY_LABELS[nov.categoria] ?? nov.categoria}`,
          date: nov.fechaCreacion ? formatAuditDate(nov.fechaCreacion) : nov.fechaHecho,
          dot: nov.nivelConfianza === 'CONFIRMADO' ? 'green'
            : nov.nivelConfianza === 'PRELIMINAR'  ? 'orange'
            : 'blue',
        }));
        setActivities(acts);
      })
      .catch(err => console.error('[SummaryPanel] Error feed:', err))
      .finally(() => setLoadingFeed(false));
  }, []);

  const totalEventos    = resumen?.totalEventos    ?? 0;
  const totalMuertos    = resumen?.totalMuertos    ?? 0;
  const totalHeridos    = resumen?.totalHeridos    ?? 0;
  const totalDesplazados = resumen?.totalDesplazados ?? 0;

  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>RESUMEN · NOVEDADES</p>

      <div className={styles.metricsGrid}>
        <article className={[styles.metricBox, styles.metricBlue].join(' ')}>
          <strong>{loadingKpi ? '—' : totalEventos}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>TOTAL NOVEDADES</span>
            <span className={styles.metricSubtitle}>registradas</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricRed].join(' ')}>
          <strong>{loadingKpi ? '—' : totalMuertos}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>TOTAL MUERTOS</span>
            <span className={styles.metricSubtitle}>afectación humana</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricOrange].join(' ')}>
          <strong>{loadingKpi ? '—' : totalHeridos}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>TOTAL HERIDOS</span>
            <span className={styles.metricSubtitle}>reportados</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricGreen].join(' ')}>
          <strong>{loadingKpi ? '—' : totalDesplazados}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>DESPLAZADOS</span>
            <span className={styles.metricSubtitle}>reportados</span>
          </div>
        </article>
      </div>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>AFECTACIÓN HUMANA</h3>
        {loadingKpi ? (
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
          {loadingFeed ? (
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
