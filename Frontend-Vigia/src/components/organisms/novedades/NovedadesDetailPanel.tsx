import type { NovedadDTORespuesta } from '../../../types/novedad.types';
import styles from './NovedadesDetailPanel.module.css';

interface Props {
  novedad: NovedadDTORespuesta | null;
  onEdit: (nov: NovedadDTORespuesta) => void;
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

const ACTOR_LABELS: Record<string, string> = {
  FUERZA_PUBLICA:         'Fuerza Pública',
  GRUPO_ARMADO_ORGANIZADO:'Grupo Armado',
  ELN:                    'ELN',
  SEGUNDA_MARQUETALIA:    'Segunda Marquetalia',
  COMUNIDAD_CIVIL:        'Comunidad Civil',
  GUARDIA_INDIGENA:       'Guardia Indígena',
  NO_IDENTIFICADO:        'No Identificado',
  OTRO:                   'Otro',
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function NovedadesDetailPanel({ novedad, onEdit }: Props) {
  if (!novedad) {
    return (
      <div className={styles.panel}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>📋</div>
          <p className={styles.placeholderText}>Seleccione una novedad para ver el detalle</p>
        </div>
      </div>
    );
  }

  const ah = novedad.afectacionHumana;
  const actores = novedad.actores ?? [];
  const victimas = novedad.victimas ?? [];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.headerId}>
            #{novedad.novedadId.substring(0, 8).toUpperCase()}
          </p>
          <h3 className={styles.headerTitle}>
            {CATEGORY_LABELS[novedad.categoria] ?? novedad.categoria}
          </h3>
        </div>
        <button className={styles.editBtn} onClick={() => onEdit(novedad)}>
          Editar
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Fecha</span>
            <span className={styles.infoValue}>{formatDate(novedad.fechaHecho)}</span>
          </div>
          {novedad.horaInicio && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Hora</span>
              <span className={styles.infoValue}>
                {novedad.horaInicio}{novedad.horaFin ? ` — ${novedad.horaFin}` : ''}
              </span>
            </div>
          )}
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Municipio</span>
            <span className={styles.infoValue}>{novedad.municipio}</span>
          </div>
          {novedad.localidadEspecifica && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Localidad</span>
              <span className={styles.infoValue}>{novedad.localidadEspecifica}</span>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Confianza</span>
            <span className={[styles.badge, styles[`conf_${novedad.nivelConfianza}`]].filter(Boolean).join(' ')}>
              {novedad.nivelConfianza.replace('_', ' ')}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Visibilidad</span>
            <span className={[
              styles.badge,
              novedad.nivelVisibilidad === 'PUBLICA' ? styles.visPublic : styles.visPrivate,
            ].join(' ')}>
              {novedad.nivelVisibilidad === 'PUBLICA' ? 'Pública' : 'Privada'}
            </span>
          </div>
        </div>

        {actores.length > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <p className={styles.sectionTitle}>ACTORES</p>
              <div className={styles.actorList}>
                {actores.map(a => (
                  <span key={a} className={styles.actorChip}>
                    {ACTOR_LABELS[a] ?? a}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {novedad.descripcionHecho && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <p className={styles.sectionTitle}>DESCRIPCIÓN</p>
              <p className={styles.descText}>{novedad.descripcionHecho}</p>
            </div>
          </>
        )}

        {ah && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <p className={styles.sectionTitle}>AFECTACIÓN HUMANA</p>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={[styles.statValue, (ah.muertosTotales ?? 0) > 0 ? styles.statDanger : ''].filter(Boolean).join(' ')}>
                    {ah.muertosTotales ?? 0}
                  </span>
                  <span className={styles.statLabel}>Muertos</span>
                </div>
                <div className={styles.statBox}>
                  <span className={[styles.statValue, (ah.heridosTotales ?? 0) > 0 ? styles.statWarn : ''].filter(Boolean).join(' ')}>
                    {ah.heridosTotales ?? 0}
                  </span>
                  <span className={styles.statLabel}>Heridos</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>{ah.desplazadosTotales ?? 0}</span>
                  <span className={styles.statLabel}>Desplazados</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>{ah.confinadosTotales ?? 0}</span>
                  <span className={styles.statLabel}>Confinados</span>
                </div>
              </div>
            </div>
          </>
        )}

        {victimas.length > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <p className={styles.sectionTitle}>VÍCTIMAS ({victimas.length})</p>
              {victimas.map(v => (
                <div key={v.victimaId} className={styles.victimaRow}>
                  <span className={styles.victimaName}>{v.nombreVictima}</span>
                  <span className={styles.victimaInfo}>
                    {v.generoVictima.replace('_', ' ')} · {v.grupoPoblacional}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {novedad.fechaReporte && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Reportada</span>
                <span className={styles.infoValue}>{formatDate(novedad.fechaReporte)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
