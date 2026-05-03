import { useState } from 'react';
import { CloseButton } from '../atoms/CloseButton';
import { ExcelDropzone } from '../molecules/ExcelDropzone';
import './ExcelUploadModal.css';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export function ExcelUploadModal({ isOpen, onClose, onUpload }: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleFileChange(f: File | null, err: string) {
    setFile(f);
    setError(err);
  }

  function handleUpload() {
    if (!file) {
      setError('Debe seleccionar un archivo .xlsx o .xls antes de continuar.');
      return;
    }
    onUpload(file);
    handleClose();
  }

  function handleClose() {
    setFile(null);
    setError('');
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <span className="modal-title">CARGAR NOVEDAD DESDE EXCEL</span>
          <div className="modal-header-right">
            <span className="modal-code">HE-02 · HU-EX</span>
            <CloseButton onClick={handleClose} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          <ExcelDropzone onFileChange={handleFileChange} />

          {error && <p className="field-error" style={{ marginTop: '8px' }}>{error}</p>}

          <div className="modal-file-info">
            Formatos: .xlsx, .xls &nbsp;·&nbsp; Máximo 5 MB
          </div>

          <a href="#" className="modal-download-link" onClick={e => e.preventDefault()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Descargar plantilla oficial
          </a>
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose} type="button">
            CANCELAR
          </button>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file}
            type="button"
          >
            CARGAR ARCHIVO
          </button>
        </div>

      </div>
    </div>
  );
}
