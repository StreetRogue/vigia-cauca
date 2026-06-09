import { useState, useRef, useEffect, useCallback } from 'react';
import type { NovedadDTORespuesta } from '../../../types/novedad.types';
import styles from './NovedadesDetailPanel.module.css';

// ── Endpoint de descarga de evidencias ──────────────────────────────────────
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080';
function evidenciaUrl(idEvidencia: string) {
  return `${GATEWAY}/api/v1/microNovedades/novedades/evidencias/${idEvidencia}`;
}

// ── Componente para cargar una sola evidencia con autenticación ──────────────
function EvidenciaItem({ idEvidencia, nombreArchivo, tipoMime, urlArchivo }: {
  idEvidencia: string;
  nombreArchivo: string | null;
  tipoMime: string | null;
  urlArchivo: string | null;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError]     = useState(false);

  // Si tiene urlArchivo y es una URL real (http/https), usarla directamente
  const isLegacyUrl = !!urlArchivo && (urlArchivo.startsWith('http://') || urlArchivo.startsWith('https://'));

  const load = useCallback(async () => {
    if (isLegacyUrl) return; // No necesita fetch; usaremos urlArchivo directamente
    const token = localStorage.getItem('kc-token');
    const url = evidenciaUrl(idEvidencia);
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      setBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('[EvidenciaItem] error:', err);
      setError(true);
    }
  }, [idEvidencia, isLegacyUrl]);

  useEffect(() => {
    load();
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEvidencia]);

  // Determinar mime y si es imagen
  const isImage = tipoMime?.startsWith('image/')
    || (!tipoMime && isLegacyUrl && /\.(jpe?g|png|gif|webp|svg|bmp)(\?|#|$)/i.test(urlArchivo!));

  // ── Evidencia URL externa (http/https) ──
  if (isLegacyUrl) {
    // Nombre a mostrar: preferir nombreArchivo, si no mostrar la URL
    const displayName = nombreArchivo && nombreArchivo.trim() ? nombreArchivo : urlArchivo!;
    if (isImage) {
      return (
        <a href={urlArchivo!} target="_blank" rel="noopener noreferrer"
           className={styles.evidenciaImageWrap} title={displayName}>
          <img
            src={urlArchivo!}
            alt={displayName}
            className={styles.evidenciaImage}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              // Mostrar como link en vez de imagen rota
              const parent = img.parentElement;
              if (parent) {
                parent.style.flexDirection = 'row';
                parent.style.padding = '8px 10px';
                parent.style.alignItems = 'center';
              }
            }}
          />
          <span className={styles.evidenciaName}>{displayName}</span>
        </a>
      );
    }
    return (
      <a href={urlArchivo!} target="_blank" rel="noopener noreferrer"
         className={styles.evidenciaLink} title={displayName}>
        <span className={styles.evidenciaLinkIcon}>🔗</span>
        <span className={styles.evidenciaLinkName}>{displayName}</span>
      </a>
    );
  }

  // ── Evidencia filesystem (requiere fetch autenticado) ──
  const fileDisplayName = nombreArchivo || 'Archivo adjunto';

  if (error) {
    return (
      <div className={styles.evidenciaError}>
        ⚠ No se pudo cargar: {fileDisplayName}
      </div>
    );
  }

  if (!blobUrl) {
    return <div className={styles.evidenciaSkeleton}>{fileDisplayName}</div>;
  }

  if (isImage) {
    return (
      <a href={blobUrl} target="_blank" rel="noopener noreferrer"
         className={styles.evidenciaImageWrap} title={fileDisplayName}>
        <img src={blobUrl} alt={fileDisplayName} className={styles.evidenciaImage} />
        <span className={styles.evidenciaName}>{fileDisplayName}</span>
      </a>
    );
  }

  return (
    <a href={blobUrl} download={fileDisplayName}
       className={styles.evidenciaLink} title={fileDisplayName}>
      <span className={styles.evidenciaLinkIcon}>📎</span>
      <span className={styles.evidenciaLinkName}>{fileDisplayName}</span>
    </a>
  );
}


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
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const fullId = novedad.novedadId;

  function handleCopyId() {
    navigator.clipboard.writeText(fullId).then(() => {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <div className={styles.headerIdRow}>
            <span className={styles.headerId}>
              #{novedad.novedadId.substring(0, 8).toUpperCase()}
            </span>
            <button
              type="button"
              className={[styles.copyBtn, copied ? styles.copyBtnDone : ''].filter(Boolean).join(' ')}
              onClick={handleCopyId}
              title={`Copiar ID completo: ${fullId}`}
            >
              {copied ? '✓ Copiado' : '⎘ Copiar'}
            </button>
          </div>
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

        {novedad.infraestructuraAfectada && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <p className={styles.sectionTitle}>INFRAESTRUCTURA AFECTADA</p>
              <p className={styles.descText}>{novedad.infraestructuraAfectada}</p>
            </div>
          </>
        )}

        {novedad.accionInstitucional && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <p className={styles.sectionTitle}>ACCIÓN INSTITUCIONAL</p>
              <p className={styles.descText}>{novedad.accionInstitucional}</p>
            </div>
          </>
        )}

        {novedad.evidencias && novedad.evidencias.length > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <p className={styles.sectionTitle}>EVIDENCIAS ({novedad.evidencias.length})</p>
              <div className={styles.evidenciasGrid}>
                {novedad.evidencias.map(ev => (
                  <EvidenciaItem
                    key={ev.idEvidencia}
                    idEvidencia={ev.idEvidencia}
                    nombreArchivo={ev.nombreArchivo}
                    tipoMime={ev.tipoMime}
                    urlArchivo={ev.urlArchivo}
                  />
                ))}
              </div>
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
