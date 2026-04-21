import { useNovedades } from '../../../context/NovedadesContext';
import { GENEROS_VICTIMA, GRUPOS_POBLACIONALES, RECLUTAMIENTO_FLAGS } from '../../../constants/dominios';

export function Step3Afectacion() {
  const {
    muertosCiviles, setMuertosCiviles,
    muertosFuerza, setMuertosFuerza,
    muertosGrupos, setMuertosGrupos,
    heridosCiviles, setHeridosCiviles,
    heridosFuerza, setHeridosFuerza,
    heridosGrupos, setHeridosGrupos,
    desplazados, setDesplazados,
    confinados, setConfinados,
    afectacionCiviles, setAfectacionCiviles,
    reclutamiento, setReclutamiento,
    victimas, setVictimas,
    muertosTotal, heridosTotal
  } = useNovedades();

  function handleAgregarVictima() {
    setVictimas(prev => [
      ...prev,
      { id: Date.now(), nombre: '', genero: '', edad: '', grupoPoblacional: '', ocupacion: '' },
    ]);
  }

  function handleEliminarVictima(id: number) {
    setVictimas(prev => prev.filter(v => v.id !== id));
  }

  return (
    <>
      <div className="step-title"><h4>PASO 3 — AFECTACION HUMANA Y VICTIMAS</h4></div>
      <div className="form-grid">
        <div className="section-subtitle">MUERTOS</div>
        <div className="form-group row-3">
          <div className="input-col">
            <label>CIVILES <span className="label-code">NOV-F13</span></label>
            <input type="number" placeholder="0" min="0" value={muertosCiviles} onChange={e => setMuertosCiviles(e.target.value)} />
          </div>
          <div className="input-col">
            <label>FUERZA PUBLICA <span className="label-code">NOV-F14</span></label>
            <input type="number" placeholder="0" min="0" value={muertosFuerza} onChange={e => setMuertosFuerza(e.target.value)} />
          </div>
          <div className="input-col">
            <label>GRUPOS ILEGALES <span className="label-code">NOV-F15</span></label>
            <input type="number" placeholder="0" min="0" value={muertosGrupos} onChange={e => setMuertosGrupos(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <div className="total-label-row">
            <span className="total-label-text">TOTAL MUERTOS</span>
            <span className="total-label-value">{muertosTotal}</span>
          </div>
        </div>

        <div className="section-subtitle">HERIDOS</div>
        <div className="form-group row-3">
          <div className="input-col">
            <label>CIVILES <span className="label-code">NOV-F17</span></label>
            <input type="number" placeholder="0" min="0" value={heridosCiviles} onChange={e => setHeridosCiviles(e.target.value)} />
          </div>
          <div className="input-col">
            <label>FUERZA PUBLICA <span className="label-code">NOV-F18</span></label>
            <input type="number" placeholder="0" min="0" value={heridosFuerza} onChange={e => setHeridosFuerza(e.target.value)} />
          </div>
          <div className="input-col">
            <label>GRUPOS ILEGALES <span className="label-code">NOV-F19</span></label>
            <input type="number" placeholder="0" min="0" value={heridosGrupos} onChange={e => setHeridosGrupos(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <div className="total-label-row">
            <span className="total-label-text">TOTAL HERIDOS</span>
            <span className="total-label-value">{heridosTotal}</span>
          </div>
        </div>

        <div className="section-subtitle">DESPLAZAMIENTO Y CONFINAMIENTO</div>
        <div className="form-group row-2">
          <div className="input-col">
            <label>DESPLAZADOS TOTALES <span className="label-code">NOV-F19</span></label>
            <input type="number" placeholder="0" min="0" value={desplazados} onChange={e => setDesplazados(e.target.value)} />
          </div>
          <div className="input-col">
            <label>CONFINADOS TOTALES <span className="label-code">NOV-F20</span></label>
            <input type="number" placeholder="0" min="0" value={confinados} onChange={e => setConfinados(e.target.value)} />
          </div>
        </div>

        <div className="section-subtitle">INDICADORES ADICIONALES</div>
        <div className="form-group row-2">
          <div className="input-col">
            <label>AFECTACION A CIVILES <span className="label-code">NOV-F21</span></label>
            <input type="text" placeholder="SI / NO" value={afectacionCiviles} onChange={e => setAfectacionCiviles(e.target.value)} />
          </div>
          <div className="input-col">
            <label>RECLUTAMIENTO DE MENORES <span className="label-code">NOV-F22</span></label>
            <select value={reclutamiento} onChange={e => setReclutamiento(e.target.value)}>
              <option value="" disabled hidden>Seleccionar</option>
              {RECLUTAMIENTO_FLAGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="victims-header">
          <div className="victims-title">VICTIMAS INDIVIDUALES (Opcional)</div>
          <button className="btn-add-victim" onClick={handleAgregarVictima}>+ AGREGAR VICTIMA</button>
        </div>

        {victimas.length > 0 && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>NOMBRE COMPLETO</th>
                  <th>GENERO</th>
                  <th>EDAD</th>
                  <th>GRUPO POBLACIONAL</th>
                  <th>OCUPACION</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {victimas.map((v, i) => (
                  <tr key={v.id}>
                    <td>{String(i + 1).padStart(2, '0')}</td>
                    <td>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={v.nombre}
                        style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: '12px' }}
                        onChange={e => setVictimas(prev => prev.map(x => x.id === v.id ? { ...x, nombre: e.target.value } : x))}
                      />
                    </td>
                    <td>
                      <select
                        value={v.genero}
                        style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '12px', background: 'transparent' }}
                        onChange={e => setVictimas(prev => prev.map(x => x.id === v.id ? { ...x, genero: e.target.value } : x))}
                      >
                        <option value="">—</option>
                        {GENEROS_VICTIMA.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="0"
                        value={v.edad}
                        style={{ border: 'none', outline: 'none', width: '60px', fontFamily: 'inherit', fontSize: '12px' }}
                        onChange={e => setVictimas(prev => prev.map(x => x.id === v.id ? { ...x, edad: e.target.value } : x))}
                      />
                    </td>
                    <td>
                      <select
                        value={v.grupoPoblacional}
                        style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '12px', background: 'transparent' }}
                        onChange={e => setVictimas(prev => prev.map(x => x.id === v.id ? { ...x, grupoPoblacional: e.target.value } : x))}
                      >
                        <option value="">—</option>
                        {GRUPOS_POBLACIONALES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Ocupación"
                        value={v.ocupacion}
                        style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: '12px' }}
                        onChange={e => setVictimas(prev => prev.map(x => x.id === v.id ? { ...x, ocupacion: e.target.value } : x))}
                      />
                    </td>
                    <td>
                      <button className="btn-delete" onClick={() => handleEliminarVictima(v.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
