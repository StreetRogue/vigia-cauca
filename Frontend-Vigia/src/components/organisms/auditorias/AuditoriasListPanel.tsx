import { useState, useEffect, useCallback } from 'react';
import { auditoriaService } from '../../../services/auditoria.service';
import type { AuditoriaDTORespuesta } from '../../../types/novedad.types';
import styles from './AuditoriasListPanel.module.css';

type Modo = 'reciente' | 'novedad' | 'usuario';
type FiltroAccion = 'TODAS' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXCEL_IMPORT';

const ACCION_LABELS: Record<string, string> = {
  CREATE:       'Creación',
  UPDATE:       'Actualización',
  DELETE:       'Eliminación',
  EXCEL_IMPORT: 'Importación Excel',
};

interface Props {
  onSelect: (a: AuditoriaDTORespuesta) => void;
  selectedId: string | null;
}

export function AuditoriasListPanel({ onSelect, selectedId }: Props) {
  const [registros, setRegistros]   = useState<AuditoriaDTORespuesta[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Filtros
  const [modo, setModo]                   = useState<Modo>('reciente');
  const [busquedaId, setBusquedaId]       = useState('');
  const [filtroAccion, setFiltroAccion]   = useState<FiltroAccion>('TODAS');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data: AuditoriaDTORespuesta[] = [];
      if (modo === 'reciente') {
        data = await auditoriaService.obtenerActividadReciente(200);
      } else if (modo === 'novedad' && busquedaId.trim()) {
        data = await auditoriaService.obtenerHistorialNovedad(busquedaId.trim());
      } else if (modo === 'usuario' && busquedaId.trim()) {
        data = await auditoriaService.obtenerHistorialPorUsuario(busquedaId.trim());
      }
      setRegistros(data);
    } catch {
      setError('Error al cargar las auditorías. Verifique la conexión.');
    } finally {
      setLoading(false);
    }
  }, [modo, busquedaId]);

  // Carga inicial y cuando cambia el modo a "reciente"
  useEffect(() => {
    if (modo === 'reciente') load();
  }, [modo, load]);

  function handleBuscar() {
    if ((modo === 'novedad' || modo === 'usuario') && busquedaId.trim()) {
      load();
    }
  }

  function handleModoChange(nuevoModo: Modo) {
    setModo(nuevoModo);
    setBusquedaId('');
    setRegistros([]);
  }

  const filtrados = registros.filter(r =>
    filtroAccion === 'TODAS' ? true : r.accion === filtroAccion
  );

  function formatFecha(iso: string) {
    const d = new Date(iso);
    const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora  = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return { fecha, hora };
  }

  function shortId(id: string | null) {
    if (!id) return '—';
    return id.substring(0, 8).toUpperCase();
  }

  return (
    <div className={styles.panel}>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.title}>AUDITORÍAS</h2>
          {!loading && <span className={styles.count}>{filtrados.length} registros</span>}
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>VER</label>
          <div className={styles.modeButtons}>
            <button
              className={[styles.modeBtn, modo === 'reciente' ? styles.modeBtnActive : ''].join(' ')}
              onClick={() => handleModoChange('reciente')}
            >
              Actividad reciente
            </button>
            <button
              className={[styles.modeBtn, modo === 'novedad' ? styles.modeBtnActive : ''].join(' ')}
              onClick={() => handleModoChange('novedad')}
            >
              Por novedad
            </button>
            <button
              className={[styles.modeBtn, modo === 'usuario' ? styles.modeBtnActive : ''].join(' ')}
              onClick={() => handleModoChange('usuario')}
            >
              Por usuario
            </button>
          </div>
        </div>

        {(modo === 'novedad' || modo === 'usuario') && (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              {modo === 'novedad' ? 'ID NOVEDAD' : 'ID USUARIO'}
            </label>
            <div className={styles.searchRow}>
              <input
                className={styles.searchInput}
                placeholder={`UUID del ${modo === 'novedad' ? 'novedad' : 'usuario'}...`}
                value={busquedaId}
                onChange={e => setBusquedaId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBuscar()}
              />
              <button className={styles.searchBtn} onClick={handleBuscar}>
                Buscar
              </button>
            </div>
          </div>
        )}

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>ACCIÓN</label>
          <select
            className={styles.filterSelect}
            value={filtroAccion}
            onChange={e => setFiltroAccion(e.target.value as FiltroAccion)}
          >
            <option value="TODAS">Todas</option>
            <option value="CREATE">Creación</option>
            <option value="UPDATE">Actualización</option>
            <option value="DELETE">Eliminación</option>
            <option value="EXCEL_IMPORT">Importación Excel</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* ── Tabla ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.numTh}>#</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Acción</th>
              <th>Novedad</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.loadingRow}>Cargando auditorías...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyRow}>
                {modo === 'reciente'
                  ? 'No hay registros de auditoría'
                  : 'Ingrese un ID y presione Buscar'}
              </td></tr>
            ) : filtrados.map((r, i) => {
              const { fecha, hora } = formatFecha(r.fecha);
              return (
                <tr
                  key={r.auditoriaId}
                  className={[
                    styles.row,
                    selectedId === r.auditoriaId ? styles.rowSelected : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onSelect(r)}
                >
                  <td className={styles.numCell}>{i + 1}</td>
                  <td className={styles.dateCell}>{fecha}</td>
                  <td className={styles.timeCell}>{hora}</td>
                  <td>
                    <span className={[styles.accionBadge, styles[`acc_${r.accion}`]].filter(Boolean).join(' ')}>
                      {ACCION_LABELS[r.accion] ?? r.accion}
                    </span>
                  </td>
                  <td className={styles.idCell}>{shortId(r.novedadId)}</td>
                  <td className={styles.idCell}>{shortId(r.usuarioId)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
