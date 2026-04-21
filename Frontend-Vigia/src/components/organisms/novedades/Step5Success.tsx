import { useNovedades } from '../../../context/NovedadesContext';
import './Step5Success.css';

export function Step5Success() {
  const {
    fecha,
    municipio,
    horaInicio,
    horaFin,
    categoria,
    nivelConfianza,
    nivelVisibilidad,
    resetForm
  } = useNovedades();

  // En una app real, el ID provendría del backend tras guardar. Generamos uno dummy.
  const idNovedad = `NOV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const isConfirmed = nivelConfianza.toUpperCase() === 'CONFIRMADO';

  return (
    <div className="success-view-card">
      <div className="success-icon-wrapper">
        <svg
          className="success-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h2 className="success-title">NOVEDAD REGISTRADA</h2>
      <div className="success-id-tag">{idNovedad}</div>

      <p className="success-description">
        El evento ha sido registrado correctamente en el sistema<br />
        y asignado para revisión institucional.
      </p>

      <div className="success-summary-box">
        <div className="success-summary-grid">
          <div className="success-summary-item">
            <span className="success-summary-label">FECHA</span>
            <span className="success-summary-value">{fecha || '—'}</span>
          </div>
          <div className="success-summary-item">
            <span className="success-summary-label">CATEGORIA</span>
            <span className="success-summary-value">{categoria || '—'}</span>
          </div>
          <div className="success-summary-item">
            <span className="success-summary-label">MUNICIPIO</span>
            <span className="success-summary-value">{municipio || '—'}</span>
          </div>
          <div className="success-summary-item">
            <span className="success-summary-label">NIVEL CONFIANZA</span>
            <span className={`success-summary-value ${isConfirmed ? 'confirmed' : ''}`}>
              {nivelConfianza || '—'}
            </span>
          </div>
          <div className="success-summary-item">
            <span className="success-summary-label">HORA DEL HECHO</span>
            <span className="success-summary-value">
              {horaInicio} — {horaFin}
            </span>
          </div>
          <div className="success-summary-item">
            <span className="success-summary-label">VISIBILIDAD</span>
            <span className="success-summary-value">{nivelVisibilidad || '—'}</span>
          </div>
        </div>
      </div>

      <div className="success-actions">
        <button className="btn-primary" onClick={() => console.log('Ver detalle de novedad', idNovedad)}>
          VER NOVEDAD
        </button>
        <button className="btn-outline-primary" onClick={resetForm}>
          NUEVA NOVEDAD
        </button>
      </div>
    </div>
  );
}
