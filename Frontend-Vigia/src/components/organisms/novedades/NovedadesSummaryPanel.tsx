import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSSE } from '../../../hooks/useSSE';
import { estadisticasService } from '../../../services/estadisticas.service';
import { novedadesService } from '../../../services/novedades.service';
import { auditoriaService } from '../../../services/auditoria.service';
import type { ResumenKPIDTO } from '../../../types/estadisticas.types';
import type { NovedadDTORespuesta, AuditoriaDTORespuesta } from '../../../types/novedad.types';
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

function formatAuditText(audit: AuditoriaDTORespuesta): string {
  const accionTexto: Record<string, string> = {
    'CREATE': 'Novedad creada',
    'UPDATE': 'Novedad actualizada',
    'DELETE': 'Novedad ocultada',
    'EXCEL_IMPORT': 'Cargado desde Excel',
  };
  return accionTexto[audit.accion] ?? `Acción: ${audit.accion}`;
}

function getAuditDot(accion: string): 'green' | 'orange' | 'red' | 'blue' | 'gray' {
  switch (accion) {
    case 'CREATE':
      return 'blue';
    case 'UPDATE':
      return 'orange';
    case 'DELETE':
      return 'red';
    case 'EXCEL_IMPORT':
      return 'green';
    default:
      return 'gray';
  }
}

/** Calcula KPIs localmente a partir de una lista de novedades del operador. */
function calcularKPIsLocales(lista: NovedadDTORespuesta[]): ResumenKPIDTO {
  let muertos = 0, heridos = 0, desplazados = 0, confinados = 0;
  for (const nov of lista) {
    const ah = nov.afectacionHumana;
    if (ah) {
      muertos     += ah.muertosTotales    ?? 0;
      heridos     += ah.heridosTotales    ?? 0;
      desplazados += ah.desplazadosTotales ?? 0;
      confinados  += ah.confinadosTotales  ?? 0;
    }
  }
  return {
    totalEventos:     lista.length,
    totalMuertos:     muertos,
    totalHeridos:     heridos,
    totalDesplazados: desplazados,
    totalConfinados:  confinados,
    filtrosAplicados: {},
  };
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
  const { user } = useAuth();
  const isOperador = user?.rol === 'OPERADOR';

  const [resumen, setResumen]       = useState<ResumenKPIDTO | null>(null);
  const [activities, setActivities] = useState<AuditActivity[]>([]);
  const [loadingKpi, setLoadingKpi]   = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSSE = useCallback(() => {
    estadisticasService.invalidarCache();
    setRefreshKey(k => k + 1);
  }, []);

  useSSE({ onMessage: handleSSE });

  // Escuchar eventos de novedad ocultada/desocultada para refrescar en tiempo real
  useEffect(() => {
    const handleNovedadChange = () => {
      setRefreshKey(k => k + 1);
    };
    window.addEventListener('novedadOcultada', handleNovedadChange);
    window.addEventListener('novedadDesoculta', handleNovedadChange);
    return () => {
      window.removeEventListener('novedadOcultada', handleNovedadChange);
      window.removeEventListener('novedadDesoculta', handleNovedadChange);
    };
  }, []);

  useEffect(() => {
    setLoadingKpi(true);
    setLoadingFeed(true);

    if (isOperador && user?.sub) {
      // OPERADOR: obtiene sus propias novedades y calcula todo localmente
      // (una sola llamada, sin depender del microservicio de reportes)
      novedadesService.listarPorUsuario(user.sub)
        .then(lista => {
          // KPIs calculados en el cliente
          setResumen(calcularKPIsLocales(lista));
        })
        .catch(err => console.error('[SummaryPanel] Error operador:', err))
        .finally(() => { setLoadingKpi(false); });

    } else {
      // ADMIN / COORDINADOR: KPIs globales del microservicio de reportes
      estadisticasService.getResumen({})
        .then(data => setResumen(data))
        .catch(err => console.error('[SummaryPanel] Error KPIs:', err))
        .finally(() => setLoadingKpi(false));
    }

    // Cargar actividad reciente (auditoría) para todos los usuarios
    auditoriaService.obtenerActividadReciente(5)
      .then(auditItems => {
        setActivities(auditItems.map(audit => ({
          id:   audit.auditoriaId,
          text: formatAuditText(audit),
          date: formatAuditDate(audit.fecha),
          dot:  getAuditDot(audit.accion),
        })));
      })
      .catch(err => console.error('[SummaryPanel] Error feed:', err))
      .finally(() => setLoadingFeed(false));
  }, [isOperador, user?.sub, refreshKey]);

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
