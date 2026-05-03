import { useNovedades, required } from '../../../context/NovedadesContext';
import { CATEGORIAS, ACTORES, NIVELES_CONFIANZA, NIVELES_VISIBILIDAD } from '../../../constants/dominios';
import './Step2Caracterizacion.css';

export function Step2Caracterizacion() {
  const {
    categoria, setCategoria, errCategoria, setErrCategoria,
    actores, setActores, errActores, setErrActores,
    actorSeleccionado, setActorSeleccionado,
    nivelConfianza, setNivelConfianza, errNivelConfianza, setErrNivelConfianza,
    nivelVisibilidad, setNivelVisibilidad, errNivelVisibilidad, setErrNivelVisibilidad,
    descripcion, setDescripcion, errDescripcion, setErrDescripcion,
    infraestructura, setInfraestructura, errInfraestructura, setErrInfraestructura,
    accionInstitucional, setAccionInstitucional, errAccionInstitucional, setErrAccionInstitucional
  } = useNovedades();

  return (
    <>
      <div className="step-title"><h4>PASO 2 — CARACTERIZACION DEL EVENTO</h4></div>
      <div className="form-grid">
        <div className={`form-group ${errCategoria ? 'input-error' : ''}`}>
          <label>CATEGORIA DEL EVENTO * <span className="label-code">NOV-F06</span></label>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            onBlur={() => setErrCategoria(required(categoria))}
          >
            <option value="" disabled hidden>Seleccionar categoría</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errCategoria && <span className="field-error">{errCategoria}</span>}
        </div>

        <div className={`form-group ${errActores ? 'input-error' : ''}`}>
          <label>ACTORES INVOLUCRADOS * <span className="label-code">NOV-F07</span></label>
          <div className="actor-selector">
            <div className="actor-input-row">
              <select
                value={actorSeleccionado}
                onChange={e => setActorSeleccionado(e.target.value)}
              >
                <option value="" disabled hidden>Seleccionar actor</option>
                {ACTORES.filter(a => !actores.includes(a)).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn-add-actor"
                disabled={!actorSeleccionado}
                onClick={() => {
                  if (actorSeleccionado && !actores.includes(actorSeleccionado)) {
                    setActores(prev => [...prev, actorSeleccionado]);
                    setActorSeleccionado('');
                    setErrActores('');
                  }
                }}
              >
                + AGREGAR
              </button>
            </div>
            {actores.length > 0 && (
              <div className="actor-chips">
                {actores.map(a => (
                  <span key={a} className="actor-chip">
                    {a}
                    <button
                      type="button"
                      className="actor-chip-remove"
                      onClick={() => setActores(prev => prev.filter(x => x !== a))}
                      aria-label={`Eliminar ${a}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {errActores && <span className="field-error">{errActores}</span>}
        </div>

        <div className="form-group row-2">
          <div className={`input-col ${errNivelConfianza ? 'input-error' : ''}`}>
            <label>NIVEL DE CONFIANZA * <span className="label-code">NOV-F08</span></label>
            <select
              value={nivelConfianza}
              onChange={e => setNivelConfianza(e.target.value)}
              onBlur={() => setErrNivelConfianza(required(nivelConfianza))}
            >
              <option value="" disabled hidden>Seleccionar nivel</option>
              {NIVELES_CONFIANZA.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {errNivelConfianza && <span className="field-error">{errNivelConfianza}</span>}
          </div>
          <div className={`input-col ${errNivelVisibilidad ? 'input-error' : ''}`}>
            <label>NIVEL DE VISIBILIDAD * <span className="label-code">NOV-F09</span></label>
            <select
              value={nivelVisibilidad}
              onChange={e => setNivelVisibilidad(e.target.value)}
              onBlur={() => setErrNivelVisibilidad(required(nivelVisibilidad))}
            >
              <option value="" disabled hidden>Seleccionar nivel</option>
              {NIVELES_VISIBILIDAD.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {errNivelVisibilidad && <span className="field-error">{errNivelVisibilidad}</span>}
          </div>
        </div>

        <div className={`form-group ${errDescripcion ? 'input-error' : ''}`}>
          <label>DESCRIPCION DEL HECHO * <span className="label-code">NOV-F10</span></label>
          <textarea
            placeholder="Describa detalladamente el hecho de seguridad ocurrido"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            onBlur={() => setErrDescripcion(descripcion.trim().length < 20 ? (descripcion.trim() === '' ? 'Campo obligatorio' : 'Mínimo 20 caracteres') : '')}
          />
          {errDescripcion && <span className="field-error">{errDescripcion}</span>}
        </div>

        <div className={`form-group ${errInfraestructura ? 'input-error' : ''}`}>
          <label>INFRAESTRUCTURA AFECTADA (Opcional) <span className="label-code">NOV-F11</span></label>
          <textarea
            placeholder="Describa la infraestructura afectada, si aplica"
            value={infraestructura}
            onChange={e => setInfraestructura(e.target.value)}
            onBlur={() => setErrInfraestructura(infraestructura.trim().length > 0 && infraestructura.trim().length < 20 ? 'Mínimo 20 caracteres' : '')}
          />
          {errInfraestructura && <span className="field-error">{errInfraestructura}</span>}
        </div>

        <div className={`form-group ${errAccionInstitucional ? 'input-error' : ''}`}>
          <label>ACCION INSTITUCIONAL * <span className="label-code">NOV-F12</span></label>
          <textarea
            placeholder="Acciones tomadas por la institución"
            value={accionInstitucional}
            onChange={e => setAccionInstitucional(e.target.value)}
            onBlur={() => setErrAccionInstitucional(accionInstitucional.trim().length < 20 ? (accionInstitucional.trim() === '' ? 'Campo obligatorio' : 'Mínimo 20 caracteres') : '')}
          />
          {errAccionInstitucional && <span className="field-error">{errAccionInstitucional}</span>}
        </div>
      </div>
      <div className="info-message-blue">
        <div className="info-icon-square" />
        <p>Los textos descriptivos deben tener mínimo 20 caracteres. Sea claro y preciso.</p>
      </div>
    </>
  );
}
