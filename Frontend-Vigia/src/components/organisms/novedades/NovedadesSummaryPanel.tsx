import { useEffect, useState } from 'react';
import { novedadesService } from '../../../services/novedades.service';
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

export function NovedadesSummaryPanel() {
  const [novedades, setNovedades] = useState<NovedadDTORespuesta[]>([]);
  const [activities, setActivities] = useState<AuditActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Obtener novedades
      const res = await novedadesService.listarPaginado({ page: 0, size: 100 });
      const allNovedades = res.content || [];
      setNovedades(allNovedades);

      // Construir actividades de auditoría
      const activityMap = new Map<string, { item: AuditActivity; timestamp: number }>();

      for (const novedad of allNovedades) {
        if (novedad.fechaReporte) {
          const timestamp = new Date(novedad.fechaReporte).getTime();
          const catLabel = CATEGORY_LABELS[novedad.categoria] || novedad.categoria;
          const key = `reported-${novedad.novedadId}`;
          activityMap.set(key, {
            item: {
              id: key,
              text: `Novedad reportada: ${catLabel}`,
              date: formatAuditDate(novedad.fechaReporte),
              dot: 'blue' as const,
            },
            timestamp,
          });
        }

        if (novedad.fechaCreacion) {
          const timestamp = new Date(novedad.fechaCreacion).getTime();
          const catLabel = CATEGORY_LABELS[novedad.categoria] || novedad.categoria;
          const key = `created-${novedad.novedadId}`;
          activityMap.set(key, {
            item: {
              id: key,
              text: `Novedad registrada: ${catLabel}`,
              date: formatAuditDate(novedad.fechaCreacion),
              dot: 'green' as const,
            },
            timestamp,
          });
        }
      }

      const sortedActivities = Array.from(activityMap.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
        .map((x) => x.item);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error cargando resumen de novedades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas
  const totalNovedades = novedades.length;
  const novedadesPorConfianza = {
    PRELIMINAR: novedades.filter((n) => n.nivelConfianza === 'PRELIMINAR').length,
    CONFIRMADO: novedades.filter((n) => n.nivelConfianza === 'CONFIRMADO').length,
    DESCARTADO: novedades.filter((n) => n.nivelConfianza === 'DESCARTADO').length,
  };

  const categoriasUnicas = new Set(novedades.map((n) => n.categoria)).size;
  const conMuertes = novedades.filter((n) => (n.afectacionHumana?.muertosTotales ?? 0) > 0).length;

  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>RESUMEN · NOVEDADES</p>

      <div className={styles.metricsGrid}>
        <article className={[styles.metricBox, styles.metricBlue].join(' ')}>
          <strong>{loading ? '—' : totalNovedades}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>TOTAL NOVEDADES</span>
            <span className={styles.metricSubtitle}>registradas</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricGreen].join(' ')}>
          <strong>{loading ? '—' : novedadesPorConfianza.CONFIRMADO}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>CONFIRMADAS</span>
            <span className={styles.metricSubtitle}>verificadas</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricOrange].join(' ')}>
          <strong>{loading ? '—' : novedadesPorConfianza.PRELIMINAR}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>PRELIMINARES</span>
            <span className={styles.metricSubtitle}>en revisión</span>
          </div>
        </article>

        <article className={[styles.metricBox, styles.metricRed].join(' ')}>
          <strong>{loading ? '—' : conMuertes}</strong>
          <div className={styles.metricTextGroup}>
            <span className={styles.metricTitle}>CON MUERTES</span>
            <span className={styles.metricSubtitle}>afectación humana</span>
          </div>
        </article>
      </div>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>CATEGORÍAS</h3>
        <div className={styles.statsRow}>
          <span className={styles.statLabel}>Categorías únicas:</span>
          <span className={styles.statValue}>{loading ? '—' : categoriasUnicas}</span>
        </div>
      </section>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>NIVEL DE CONFIANZA</h3>
        <div className={styles.progressGroup}>
          <div className={styles.progressLabelRow}>
            <span>CONFIRMADAS</span>
            <span>{novedadesPorConfianza.CONFIRMADO}</span>
          </div>
          <div className={styles.track}>
            <span
              className={styles.fill}
              style={{
                width: `${totalNovedades > 0 ? (novedadesPorConfianza.CONFIRMADO / totalNovedades) * 100 : 0}%`,
                background: '#27ae60',
              }}
            />
          </div>
        </div>
        <div className={styles.progressGroup}>
          <div className={styles.progressLabelRow}>
            <span>PRELIMINARES</span>
            <span>{novedadesPorConfianza.PRELIMINAR}</span>
          </div>
          <div className={styles.track}>
            <span
              className={styles.fill}
              style={{
                width: `${totalNovedades > 0 ? (novedadesPorConfianza.PRELIMINAR / totalNovedades) * 100 : 0}%`,
                background: '#f39c12',
              }}
            />
          </div>
        </div>
      </section>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>AUDITORÍA RECIENTE</h3>
        <ul className={styles.activityList}>
          {activities.length > 0 ? (
            activities.map((act) => (
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

const CATEGORY_LABELS: Record<string, string> = {
  ENFRENTAMIENTO: 'Enfrentamiento',
  HOSTIGAMIENTO: 'Hostigamiento',
  ATENTADO_TERRORISTA: 'Atentado Terrorista',
  ATAQUE_CON_DRON: 'Ataque con Dron',
  HOMICIDIO: 'Homicidio',
  SECUESTRO: 'Secuestro',
  RETEN_ILEGAL: 'Retén Ilegal',
  RECLUTAMIENTO_ILICITO: 'Reclutamiento Ilícito',
  ACCION_DE_PROTESTA: 'Acción de Protesta',
  HALLAZGO_DE_MATERIAL: 'Hallazgo de Material',
  OTRO: 'Otro',
};
