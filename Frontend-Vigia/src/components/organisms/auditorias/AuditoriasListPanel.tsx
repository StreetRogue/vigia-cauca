import { useState, useEffect, useCallback, useRef } from 'react';
import { auditoriaService } from '../../../services/auditoria.service';
import type { AuditoriaDTORespuesta } from '../../../types/novedad.types';
import styles from './AuditoriasListPanel.module.css';

type Modo = 'reciente' | 'novedad' | 'usuario';
type FiltroAccion = 'TODAS' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXCEL_IMPORT';

function CopyableId({ id }: { id: string | null }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!id) return <span>—</span>;

  const short = id.substring(0, 8).toUpperCase();

  function handleCopy() {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <span className={styles.copyableId}>
      {short}
      <button
        className={[styles.copyBtn, copied ? styles.copyBtnDone : ''].filter(Boolean).join(' ')}
        onClick={e => { e.stopPropagation(); handleCopy(); }}
        title={id}
      >
        {copied ? '✓ Copiado' : '⎘ Copiar'}
      </button>
    </span>
  );
}

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

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    if (modo !== 'novedad' && modo !== 'usuario') return;
    const id = busquedaId.trim();
    if (!id) {
      setError('Ingrese un ID para buscar.');
      return;
    }
    if (!UUID_REGEX.test(id)) {
      setError('El ID debe ser un UUID completo. Ejemplo: 34384a2c-1234-5678-abcd-ef0123456789');
      return;
    }
    load();
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

  function relTime(iso: string): string {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (mins < 1)  return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d`;
    return `${Math.floor(days / 7)}sem`;
  }

function getResumen(r: AuditoriaDTORespuesta): string {
    const raw = r.datosNuevos ?? r.datosAnteriores;
    if (!raw) return '';
    try {
      const d = JSON.parse(raw) as Record<string, unknown>;
      const municipio = d.municipio ? String(d.municipio) : '';
      const categoria = d.categoria ? String(d.categoria) : '';
      if (municipio && categoria) return `${municipio} · ${categoria}`;
      return municipio || categoria;
    } catch { return ''; }
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
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
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
              <th>Fecha · Hora</th>
              <th></th>
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
              const resumen = getResumen(r);
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
                  <td className={styles.dateCell}>
                    <span className={styles.dateMain}>{fecha}</span>
                    <span className={styles.dateSub}>{hora}</span>
                  </td>
                  <td className={styles.relCell}>{relTime(r.fecha)}</td>
                  <td>
                    <span className={[styles.accionBadge, styles[`acc_${r.accion}`]].filter(Boolean).join(' ')}>
                      {ACCION_LABELS[r.accion] ?? r.accion}
                    </span>
                    {resumen && <span className={styles.rowResumen}>{resumen}</span>}
                  </td>
                  <td className={styles.idCell}><CopyableId id={r.novedadId} /></td>
                  <td className={styles.idCell}><CopyableId id={r.usuarioId} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
