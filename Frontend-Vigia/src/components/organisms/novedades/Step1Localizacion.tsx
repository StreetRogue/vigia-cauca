import { useNovedades, formatDateInput, formatTimeInput, validateDate, required } from '../../../context/NovedadesContext';
import { MUNICIPIOS_CAUCA } from '../../../constants/dominios';

export function Step1Localizacion() {
  const {
    fecha, setFecha, errFecha, setErrFecha,
    horaInicio, setHoraInicio, errHoraInicio, setErrHoraInicio,
    horaFin, setHoraFin, errHoraFin, setErrHoraFin,
    municipio, setMunicipio, errMunicipio, setErrMunicipio,
    localidad, setLocalidad, errLocalidad, setErrLocalidad
  } = useNovedades();

  return (
    <>
      <div className="step-title"><h4>PASO 1 — LOCALIZACION Y TIEMPO DEL EVENTO</h4></div>
      <div className="form-grid">
        <div className="form-group row-3">
          <div className={`input-col ${errFecha ? 'input-error' : ''}`}>
            <label>FECHA DEL HECHO * <span className="label-code">NOV-F01</span></label>
            <input
              type="text"
              placeholder="DD/MM/AAAA"
              value={fecha}
              maxLength={10}
              onChange={e => setFecha(formatDateInput(e.target.value))}
              onBlur={() => setErrFecha(validateDate(fecha))}
            />
            {errFecha && <span className="field-error">{errFecha}</span>}
          </div>
          <div className={`input-col ${errHoraInicio ? 'input-error' : ''}`}>
            <label>HORA INICIO * <span className="label-code">NOV-F02</span></label>
            <input
              type="text"
              placeholder="HH:MM"
              value={horaInicio}
              maxLength={5}
              onChange={e => setHoraInicio(formatTimeInput(e.target.value))}
              onBlur={() => setErrHoraInicio(required(horaInicio))}
            />
            {errHoraInicio && <span className="field-error">{errHoraInicio}</span>}
          </div>
          <div className={`input-col ${errHoraFin ? 'input-error' : ''}`}>
            <label>HORA FIN * <span className="label-code">NOV-F03</span></label>
            <input
              type="text"
              placeholder="HH:MM"
              value={horaFin}
              maxLength={5}
              onChange={e => setHoraFin(formatTimeInput(e.target.value))}
              onBlur={() => setErrHoraFin(required(horaFin))}
            />
            {errHoraFin && <span className="field-error">{errHoraFin}</span>}
          </div>
        </div>

        <div className={`form-group ${errMunicipio ? 'input-error' : ''}`}>
          <label>MUNICIPIO * <span className="label-code">NOV-F04</span></label>
          <select
            value={municipio}
            onChange={e => setMunicipio(e.target.value)}
            onBlur={() => setErrMunicipio(required(municipio))}
          >
            <option value="" disabled hidden>Seleccionar municipio</option>
            {MUNICIPIOS_CAUCA.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {errMunicipio && <span className="field-error">{errMunicipio}</span>}
        </div>

        <div className={`form-group ${errLocalidad ? 'input-error' : ''}`}>
          <label>LOCALIDAD ESPECIFICA * <span className="label-code">NOV-F05</span></label>
          <input
            type="text"
            placeholder="Vereda, corregimiento o sector donde ocurrió el hecho"
            value={localidad}
            onChange={e => setLocalidad(e.target.value)}
            onBlur={() => setErrLocalidad(required(localidad))}
          />
          {errLocalidad && <span className="field-error">{errLocalidad}</span>}
        </div>
      </div>

      <div className="info-message">
        <span className="info-icon">i</span>
        <p>La fecha no puede ser futura ni anterior al año 2000. Municipio: solo letras.</p>
      </div>
    </>
  );
}
