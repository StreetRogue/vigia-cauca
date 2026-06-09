import { useState } from 'react';
import { CloseButton } from '../../atoms/CloseButton';
import { ExcelDropzone } from '../../molecules/ExcelDropzone';
import { novedadesService } from '../../../services/novedades.service';
import type { ExcelCargaResultado } from '../../../services/novedades.service';
import './ExcelUploadModal.css';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<ExcelCargaResultado>;
}

export function ExcelUploadModal({ isOpen, onClose, onUpload }: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ExcelCargaResultado | null>(null);

  if (!isOpen) return null;

  function handleFileChange(f: File | null, err: string) {
    setFile(f);
    setError(err);
  }

  async function handleUpload() {
    if (!file) {
      setError('Debe seleccionar un archivo .xlsx o .xls antes de continuar.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const res = await onUpload(file);
      if (res.errores > 0) {
        // Hubo filas omitidas: mostramos el resumen y dejamos el modal abierto
        setResult(res);
      } else {
        // Todo cargado sin omisiones: cerrar directamente
        handleClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el archivo';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    if (uploading) return;
    setFile(null);
    setError('');
    setResult(null);
    onClose();
  }

  async function handleDescargarPlantilla() {
    setDownloading(true);
    try {
      const blob = await novedadesService.descargarPlantilla();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla-novedades.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al descargar la plantilla. Intente de nuevo.');
      console.error('Error descargando plantilla:', err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={uploading ? undefined : handleClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <span className="modal-title">CARGAR NOVEDAD DESDE EXCEL</span>
          <div className="modal-header-right">
            <span className="modal-code">HE-02 · HU-EX</span>
            <CloseButton onClick={handleClose} disabled={uploading} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          {result ? (
            /* ── Resumen del resultado de la carga ── */
            <div className="modal-result">
              <p className="modal-result-summary">
                <strong>{result.novedadesCreadas}</strong> novedad(es) cargada(s)
                {result.errores > 0 && (
                  <> · <strong>{result.errores}</strong> omitida(s)</>
                )}
                {' '}de {result.totalFilasProcesadas} fila(s).
              </p>

              {result.erroresDetalle.length > 0 && (
                <>
                  <p className="modal-result-subtitle">Filas omitidas:</p>
                  <ul className="modal-result-list">
                    {result.erroresDetalle.map((e, i) => (
                      <li key={i}>
                        <strong>Fila {e.fila}:</strong> {e.error}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <>
              <ExcelDropzone onFileChange={handleFileChange} />

              {error && <p className="field-error" style={{ marginTop: '8px' }}>{error}</p>}

              <div className="modal-file-info">
                Formatos: .xlsx, .xls &nbsp;·&nbsp; Máximo 5 MB
              </div>

              <button
                type="button"
                className="modal-download-link"
                onClick={handleDescargarPlantilla}
                disabled={downloading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {downloading ? 'Descargando...' : 'Descargar plantilla oficial'}
              </button>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          {result ? (
            <button className="btn-primary" onClick={handleClose} type="button">
              ENTENDIDO
            </button>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleClose} type="button" disabled={uploading}>
                CANCELAR
              </button>
              <button
                className="btn-primary"
                onClick={handleUpload}
                disabled={!file || uploading}
                type="button"
              >
                {uploading ? 'CARGANDO...' : 'CARGAR ARCHIVO'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
