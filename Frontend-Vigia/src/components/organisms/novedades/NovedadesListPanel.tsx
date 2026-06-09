import { useState, useEffect, useCallback } from 'react';
import { novedadesService } from '../../../services/novedades.service';
import { cacheService } from '../../../services/cache.service';
import { MUNICIPIOS_CAUCA } from '../../../constants/dominios';
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
  /** Notifica al padre que los datos cambiaron (p. ej. tras eliminar) para refrescar el resumen. */
  onChanged?: () => void;
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

export function NovedadesListPanel({ refreshKey, onNew, onEdit, onExcel, onRowClick, selectedId, userRole, onChanged }: Props) {
  const isAdmin = userRole === 'ADMIN';
  const { user } = useAuth();
  const [novedades, setNovedades] = useState<NovedadDTORespuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [archiveTarget, setArchiveTarget] = useState<NovedadDTORespuesta | null>(null);
  const [archiving, setArchiving] = useState(false);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterConfianza, setFilterConfianza] = useState('');
  const [filterConMuertes, setFilterConMuertes] = useState(false);
  // Modo "ver archivadas" (las que se archivaron / soft-delete)
  const [verArchivadas, setVerArchivadas] = useState(false);

  const categoriasList = Object.keys(CATEGORY_LABELS);
  const confianzaList = Object.keys(CONFIDENCE_LABELS);

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
      
      // Modo archivadas: el backend devuelve solo las archivadas (oculto=true)
      if (verArchivadas) params.archivadas = true;
      
      // Filtros
      if (search.trim()) params.search = search.trim();
      if (filterMunicipio) params.municipio = filterMunicipio;
      if (filterCategoria) params.categoria = filterCategoria;
      if (filterConfianza) params.nivelConfianza = filterConfianza;
      if (filterConMuertes) params.conMuertes = true;

      // Generar key de caché para esta página y filtros
      const cacheKey = cacheService.buildKey('novedades-paginado', params);

      // Usar caché de 60 segundos
      const res = await cacheService.remember(cacheKey, 60, async () => {
        return await novedadesService.listarPaginado(params);
      });

      setNovedades(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch {
      setError('Error al cargar las novedades. Verifique la conexión.');
    } finally {
      setLoading(false);
    }
  }, [page, userRole, user?.sub, search, filterMunicipio, filterCategoria, filterConfianza, filterConMuertes, verArchivadas]);

  useEffect(() => {
    setPage(0); // Reset a página 0 cuando cambian los filtros
  }, [search, filterMunicipio, filterCategoria, filterConfianza, filterConMuertes, verArchivadas]);

  useEffect(() => { load(); }, [load, refreshKey]);

  async function handleArchivar() {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      const uid = user?.sub ?? 'ANONIMO';
      // "Archivar" = soft-delete (marca oculto=true); se puede recuperar luego
      await novedadesService.eliminar(archiveTarget.novedadId, uid);
      setArchiveTarget(null);
      cacheService.invalidate('novedades-paginado'); // Invalidar caché
      // Refresca la lista local y, vía el padre, el panel de resumen.
      load();
      onChanged?.();
    } catch {
      setError('Error al archivar la novedad.');
    } finally {
      setArchiving(false);
    }
  }

  async function handleDesarchivar(nov: NovedadDTORespuesta) {
    try {
      const uid = user?.sub ?? 'ANONIMO';
      await novedadesService.desocultar(nov.novedadId, uid);
      cacheService.invalidate('novedades-paginado'); // Invalidar caché
      load();
      onChanged?.();
    } catch {
      setError('Error al desarchivar la novedad.');
    }
  }

  function formatDate(iso: string) {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  const hasActiveFilters = search || filterMunicipio || filterCategoria || filterConfianza || filterConMuertes || verArchivadas;

  function resetFilters() {
    setSearch('');
    setFilterMunicipio('');
    setFilterCategoria('');
    setFilterConfianza('');
    setFilterConMuertes(false);
    setVerArchivadas(false);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.title}>NOVEDADES</h2>
          {!loading && (
            <span className={styles.count}>
              {totalElements} {verArchivadas ? 'archivadas' : 'registros'}
            </span>
          )}
        </div>
        <div className={styles.toolbarRight}>
          <button className={styles.btnSecondary} onClick={onExcel}>CARGAR EXCEL</button>
          <button className={styles.btnPrimary} onClick={onNew}>+ NUEVA NOVEDAD</button>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            placeholder="Buscar por municipio, categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={filterMunicipio}
          onChange={(e) => setFilterMunicipio(e.target.value)}
        >
          <option value="">Municipio</option>
          {MUNICIPIOS_CAUCA.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
        >
          <option value="">Categoría</option>
          {categoriasList.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filterConfianza}
          onChange={(e) => setFilterConfianza(e.target.value)}
        >
          <option value="">Confianza</option>
          {confianzaList.map(cf => (
            <option key={cf} value={cf}>{CONFIDENCE_LABELS[cf]}</option>
          ))}
        </select>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={filterConMuertes}
            onChange={(e) => setFilterConMuertes(e.target.checked)}
          />
          <span>Con muertes</span>
        </label>

        <label className={[styles.checkboxLabel, verArchivadas ? styles.checkboxLabelActive : ''].filter(Boolean).join(' ')}>
          <input
            type="checkbox"
            checked={verArchivadas}
            onChange={(e) => setVerArchivadas(e.target.checked)}
          />
          <span>Archivadas</span>
        </label>

        {hasActiveFilters && (
          <button className={styles.resetBtn} onClick={resetFilters}>
            ✕ Limpiar
          </button>
        )}
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
                <td colSpan={8} className={styles.emptyRow}>
                  {verArchivadas ? 'No hay novedades archivadas' : 'No hay novedades registradas'}
                </td>
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
                  {verArchivadas ? (
                    // En el modo archivadas: solo ADMIN puede restaurar
                    isAdmin && (
                      <button
                        className={styles.restoreBtn}
                        onClick={() => handleDesarchivar(nov)}
                        title="Desarchivar (restaurar)"
                      >
                        Desarchivar
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        className={styles.editBtn}
                        onClick={() => onEdit(nov)}
                        title="Editar"
                      >
                        ✎
                      </button>
                      {/* Solo ADMIN puede archivar novedades (HU-2.5) */}
                      {isAdmin && (
                        <button
                          className={styles.archiveBtn}
                          onClick={() => setArchiveTarget(nov)}
                          title="Archivar"
                        >
                          🗄
                        </button>
                      )}
                    </>
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

      {archiveTarget && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <h3 className={styles.confirmTitle}>Archivar novedad</h3>
            <p className={styles.confirmText}>
              ¿Archivar la novedad del{' '}
              <strong>{formatDate(archiveTarget.fechaHecho)}</strong> en{' '}
              <strong>{archiveTarget.municipio}</strong>?{' '}
              Dejará de aparecer en el listado y en el contador, pero podrás
              recuperarla con el filtro <strong>Archivadas</strong>.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setArchiveTarget(null)}
                disabled={archiving}
              >
                Cancelar
              </button>
              <button
                className={styles.dangerBtn}
                onClick={handleArchivar}
                disabled={archiving}
              >
                {archiving ? 'Archivando...' : 'Archivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
