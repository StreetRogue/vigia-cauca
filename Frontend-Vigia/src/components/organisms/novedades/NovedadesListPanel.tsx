import { useState, useEffect, useCallback } from 'react';
import { novedadesService } from '../../../services/novedades.service';
import type { NovedadDTORespuesta } from '../../../types/novedad.types';
import { useAuth } from '../../../context/AuthContext';
import styles from './NovedadesListPanel.module.css';

interface Props {
  refreshKey: number;
  onNew: () => void;
  onEdit: (nov: NovedadDTORespuesta) => void;
  onExcel: () => void;
  onRowClick: (nov: NovedadDTORespuesta) => void;
  selectedId: string | null;
  /** Rol del usuario autenticado; solo ADMIN puede eliminar (HU-2.5) */
  userRole?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ENFRENTAMIENTO:        'Enfrentamiento',
  HOSTIGAMIENTO:         'Hostigamiento',
  ATENTADO_TERRORISTA:   'Atentado',
  ATAQUE_CON_DRON:       'Dron',
  HOMICIDIO:             'Homicidio',
  SECUESTRO:             'Secuestro',
  RETEN_ILEGAL:          'Retén Ilegal',
  RECLUTAMIENTO_ILICITO: 'Reclutamiento',
  ACCION_DE_PROTESTA:    'Protesta',
  HALLAZGO_DE_MATERIAL:  'Hallazgo',
  OTRO:                  'Otro',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  PRELIMINAR:      'Preliminar',
  EN_VERIFICACION: 'Verificando',
  CONFIRMADO:      'Confirmado',
};

const PAGE_SIZE = 10;

export function NovedadesListPanel({ refreshKey, onNew, onEdit, onExcel, onRowClick, selectedId, userRole }: Props) {
  const isAdmin = userRole === 'ADMIN';
  const { user } = useAuth();
  const [novedades, setNovedades] = useState<NovedadDTORespuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<NovedadDTORespuesta | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, size: PAGE_SIZE };
      // Filtrar por rol: ADMIN ve todas, OPERADOR ve solo sus novedades
      if (userRole && user?.sub) {
        params.rol = userRole;
        params.usuarioId = user.sub;
      }
      const res = await novedadesService.listarPaginado(params);
      setNovedades(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      setError('Error al cargar las novedades. Verifique la conexión.');
    } finally {
      setLoading(false);
    }
  }, [page, userRole, user?.sub]);

  useEffect(() => { load(); }, [load, refreshKey]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const uid = user?.sub ?? 'ANONIMO';
      await novedadesService.eliminar(deleteTarget.novedadId, uid);
      setDeleteTarget(null);
      load();
    } catch {
      setError('Error al eliminar la novedad.');
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(iso: string) {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.title}>NOVEDADES</h2>
          {!loading && <span className={styles.count}>{totalElements} registros</span>}
        </div>
        <div className={styles.toolbarRight}>
          <button className={styles.btnSecondary} onClick={onExcel}>CARGAR EXCEL</button>
          <button className={styles.btnPrimary} onClick={onNew}>+ NUEVA NOVEDAD</button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.numTh}>#</th>
              <th>Fecha</th>
              <th>Municipio</th>
              <th>Categoría</th>
              <th>Confianza</th>
              <th>Visibilidad</th>
              <th className={styles.numTh}>Muertos</th>
              <th className={styles.actionsTh}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className={styles.loadingRow}>Cargando novedades...</td>
              </tr>
            ) : novedades.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>No hay novedades registradas</td>
              </tr>
            ) : novedades.map((nov, i) => (
              <tr
                key={nov.novedadId}
                className={[styles.row, selectedId === nov.novedadId ? styles.rowSelected : ''].filter(Boolean).join(' ')}
                onClick={() => onRowClick(nov)}
              >
                <td className={styles.numCell}>{page * PAGE_SIZE + i + 1}</td>
                <td className={styles.dateCell}>{formatDate(nov.fechaHecho)}</td>
                <td className={styles.municipioCell}>{nov.municipio}</td>
                <td>
                  <span className={styles.catBadge}>
                    {CATEGORY_LABELS[nov.categoria] ?? nov.categoria}
                  </span>
                </td>
                <td>
                  <span className={[styles.confBadge, styles[`conf_${nov.nivelConfianza}`]].filter(Boolean).join(' ')}>
                    {CONFIDENCE_LABELS[nov.nivelConfianza] ?? nov.nivelConfianza}
                  </span>
                </td>
                <td>
                  <span className={[styles.visBadge, nov.nivelVisibilidad === 'PUBLICA' ? styles.visPublic : styles.visPrivate].join(' ')}>
                    {nov.nivelVisibilidad === 'PUBLICA' ? 'Pública' : 'Privada'}
                  </span>
                </td>
                <td className={styles.numCell}>{nov.afectacionHumana?.muertosTotales ?? 0}</td>
                <td
                  className={styles.actionsCell}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className={styles.editBtn}
                    onClick={() => onEdit(nov)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  {/* Solo ADMIN puede eliminar novedades (HU-2.5) */}
                  {isAdmin && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteTarget(nov)}
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            ‹ Anterior
          </button>
          <span className={styles.pageInfo}>Página {page + 1} de {totalPages}</span>
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Siguiente ›
          </button>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <h3 className={styles.confirmTitle}>Confirmar eliminación</h3>
            <p className={styles.confirmText}>
              ¿Eliminar la novedad del{' '}
              <strong>{formatDate(deleteTarget.fechaHecho)}</strong> en{' '}
              <strong>{deleteTarget.municipio}</strong>?{' '}
              Esta acción no se puede deshacer.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className={styles.dangerBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
