import React, { useRef } from 'react';
import { useNovedades } from '../../../context/NovedadesContext';

export function Step4Evidencias() {
  const {
    urlEvidencia, setUrlEvidencia,
    evidencias, setEvidencias
  } = useNovedades();
  
  const evidenciaInputRef = useRef<HTMLInputElement>(null);

  function handleAgregarEvidenciaUrl() {
    if (!urlEvidencia.trim()) return;
    const ext = urlEvidencia.split('.').pop()?.toLowerCase() ?? '';
    const tipo = ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
      ? 'IMAGEN'
      : ['mp4', 'avi', 'mov'].includes(ext)
      ? 'VIDEO'
      : 'DOCUMENTO';
    const nombre = urlEvidencia.split('/').pop() ?? urlEvidencia;
    setEvidencias(prev => [...prev, { nombre, tipo }]);
    setUrlEvidencia('');
  }

  function handleEliminarEvidencia(index: number) {
    setEvidencias(prev => prev.filter((_, i) => i !== index));
  }

  function handleEvidenciaFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newEvidencias = Array.from(e.target.files).map(f => {
        const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
        const tipo = ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
          ? 'IMAGEN'
          : ['mp4', 'avi', 'mov'].includes(ext)
          ? 'VIDEO'
          : 'DOCUMENTO';
        return { nombre: f.name, tipo };
      });
      setEvidencias(prev => [...prev, ...newEvidencias]);
      if (evidenciaInputRef.current) {
        evidenciaInputRef.current.value = '';
      }
    }
  }

  return (
    <>
      <div className="step-title"><h4>PASO 4 — EVIDENCIAS Y DOCUMENTACION</h4></div>
      <div className="form-grid">
        <div className="section-subtitle">ADJUNTAR ARCHIVOS</div>
        <input
          type="file"
          ref={evidenciaInputRef}
          style={{ display: 'none' }}
          accept=".pdf, .jpg, .jpeg, .png, .mp4"
          multiple
          onChange={handleEvidenciaFileSelect}
        />
        <div className="dropzone" onClick={() => evidenciaInputRef.current?.click()}>
          <div className="dropzone-icon" />
          <div className="dropzone-text">Arrastre archivos aquí o haga clic para seleccionar</div>
          <div className="dropzone-subtext">Formatos: PDF, JPG, PNG, MP4 — Máximo 10 MB por archivo</div>
        </div>

        <div className="section-subtitle">AGREGAR POR URL</div>
        <div className="url-group">
          <div className="input-col">
            <label>URL DE EVIDENCIA * <span className="label-code">NOV-F23</span></label>
            <input
              type="text"
              placeholder="https://storage.example.com/..."
              value={urlEvidencia}
              onChange={e => setUrlEvidencia(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAgregarEvidenciaUrl()}
            />
          </div>
          <button
            className="btn-primary"
            style={{ padding: '12px 24px', height: '41px' }}
            onClick={handleAgregarEvidenciaUrl}
          >
            AGREGAR
          </button>
        </div>

        {evidencias.length > 0 && (
          <>
            <div className="section-subtitle">EVIDENCIAS ADJUNTAS ({evidencias.length})</div>
            <div className="evidence-list">
              {evidencias.map((ev, i) => (
                <div key={i} className="evidence-item">
                  <div className="evidence-thumbnail" />
                  <div className="evidence-info">
                    <span className="evidence-name">{ev.nombre}</span>
                    <span className="evidence-tag">{ev.tipo}</span>
                  </div>
                  <button className="btn-delete" onClick={() => handleEliminarEvidencia(i)}>Eliminar</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
