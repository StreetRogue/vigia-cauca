import { useRef, useState } from 'react';
import { Sidebar } from '../components/organisms/Sidebar';
import { ExcelUploadModal } from '../components/organisms/ExcelUploadModal';
import { NavMenu } from '../components/molecules/NavMenu';
import { UserCard } from '../components/molecules/UserCard';
import dashboardIcon from '../assets/Dashboard_Icon.svg';
import novedadesIcon from '../assets/novedades_icon.svg';
import usuariosIcon from '../assets/usuarios_icon.svg';
import reportesIcon from '../assets/reportes_icon.svg';
import configuracionIcon from '../assets/configuracion_icon.svg';
import {
  CATEGORIAS,
  ACTORES,
  NIVELES_CONFIANZA,
  NIVELES_VISIBILIDAD,
  GENEROS_VICTIMA,
  GRUPOS_POBLACIONALES,
  RECLUTAMIENTO_FLAGS,
  MUNICIPIOS_CAUCA,
} from '../constants/dominios';

// ── Helpers ───────────────────────────────────────────────────────────────────
const EXCEL_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Auto-formats a raw string into DD/MM/AAAA as the user types. */
function formatDateInput(raw: string): string {
  // Keep only digits
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Auto-formats a raw string into HH:MM as the user types. */
function formatTimeInput(raw: string): string {
  // Keep only digits
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function validateDate(value: string): string {
  if (!value.trim()) return 'Campo obligatorio';
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year || value.length < 8) return 'Formato inválido (DD/MM/AAAA)';
  const date = new Date(year, month - 1, day);
  if (date > new Date()) return 'La fecha no puede ser futura';
  if (year < 2000) return 'La fecha ingresada no es válida';
  return '';
}

function required(value: string): string {
  return value.trim() ? '' : 'Campo obligatorio';
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Victima {
  id: number;
  nombre: string;
  genero: string;
  edad: string;
  grupoPoblacional: string;
  ocupacion: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function NovedadesScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const evidenciaInputRef = useRef<HTMLInputElement>(null);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // ── Step 1 state ─────────────────────────────────────────────────────────
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [localidad, setLocalidad] = useState('');

  // ── Step 1 errors ────────────────────────────────────────────────────────
  const [errFecha, setErrFecha] = useState('');
  const [errHoraInicio, setErrHoraInicio] = useState('');
  const [errHoraFin, setErrHoraFin] = useState('');
  const [errMunicipio, setErrMunicipio] = useState('');
  const [errLocalidad, setErrLocalidad] = useState('');

  // ── Step 2 state ─────────────────────────────────────────────────────────
  const [categoria, setCategoria] = useState('');
  const [actores, setActores] = useState<string[]>([]);
  const [actorSeleccionado, setActorSeleccionado] = useState('');
  const [nivelConfianza, setNivelConfianza] = useState('');
  const [nivelVisibilidad, setNivelVisibilidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [infraestructura, setInfraestructura] = useState('');
  const [accionInstitucional, setAccionInstitucional] = useState('');

  // ── Step 2 errors ────────────────────────────────────────────────────────
  const [errCategoria, setErrCategoria] = useState('');
  const [errActores, setErrActores] = useState('');
  const [errNivelConfianza, setErrNivelConfianza] = useState('');
  const [errNivelVisibilidad, setErrNivelVisibilidad] = useState('');
  const [errDescripcion, setErrDescripcion] = useState('');
  const [errInfraestructura, setErrInfraestructura] = useState('');
  const [errAccionInstitucional, setErrAccionInstitucional] = useState('');

  // ── Step 3 state ─────────────────────────────────────────────────────────
  const [muertosCiviles, setMuertosCiviles] = useState('');
  const [muertosFuerza, setMuertosFuerza] = useState('');
  const [muertosGrupos, setMuertosGrupos] = useState('');
  const [heridosCiviles, setHeridosCiviles] = useState('');
  const [heridosFuerza, setHeridosFuerza] = useState('');
  const [heridosGrupos, setHeridosGrupos] = useState('');
  const [desplazados, setDesplazados] = useState('');
  const [confinados, setConfinados] = useState('');
  const [afectacionCiviles, setAfectacionCiviles] = useState('');
  const [reclutamiento, setReclutamiento] = useState('');
  const [victimas, setVictimas] = useState<Victima[]>([]);

  // ── Step 3 derived ───────────────────────────────────────────────────────
  const muertosTotal =
    (parseInt(muertosCiviles) || 0) +
    (parseInt(muertosFuerza) || 0) +
    (parseInt(muertosGrupos) || 0);

  const heridosTotal =
    (parseInt(heridosCiviles) || 0) +
    (parseInt(heridosFuerza) || 0) +
    (parseInt(heridosGrupos) || 0);

  // ── Step 4 state ─────────────────────────────────────────────────────────
  const [urlEvidencia, setUrlEvidencia] = useState('');
  const [evidencias, setEvidencias] = useState<{ nombre: string; tipo: string }[]>([
    { nombre: 'foto-001.jpg', tipo: 'IMAGEN' },
    { nombre: 'video-001.mp4', tipo: 'VIDEO' },
  ]);
  const [excelError, setExcelError] = useState('');

  // ── Validation per step ───────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e1 = validateDate(fecha);
    const e2 = required(horaInicio);
    const e3 = required(horaFin);
    const e4 = required(municipio);
    const e5 = required(localidad);
    setErrFecha(e1);
    setErrHoraInicio(e2);
    setErrHoraFin(e3);
    setErrMunicipio(e4);
    setErrLocalidad(e5);
    return !e1 && !e2 && !e3 && !e4 && !e5;
  }

  function validateStep2(): boolean {
    const e1 = required(categoria);
    const e2 = actores.length === 0 ? 'Debe agregar al menos un actor' : '';
    const e3 = required(nivelConfianza);
    const e4 = required(nivelVisibilidad);
    const e5 = descripcion.trim().length < 20 ? (descripcion.trim() === '' ? 'Campo obligatorio' : 'Mínimo 20 caracteres') : '';
    const e6 = infraestructura.trim().length > 0 && infraestructura.trim().length < 20 ? 'Mínimo 20 caracteres' : '';
    const e7 = accionInstitucional.trim().length < 20 ? (accionInstitucional.trim() === '' ? 'Campo obligatorio' : 'Mínimo 20 caracteres') : '';
    setErrCategoria(e1);
    setErrActores(e2);
    setErrNivelConfianza(e3);
    setErrNivelVisibilidad(e4);
    setErrDescripcion(e5);
    setErrInfraestructura(e6);
    setErrAccionInstitucional(e7);
    return !e1 && !e2 && !e3 && !e4 && !e5 && !e6 && !e7;
  }

  function validateStep3(): boolean {
    return true; // totales calculados automáticamente
  }

  function handleContinuar() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Flujo final: registrar novedad
      setShowSuccessToast(true);
      resetForm();
      setTimeout(() => setShowSuccessToast(false), 3500); // ocultar toast a los 3.5 seg
    }
  }

  function resetForm() {
    setCurrentStep(1);
    
    // Paso 1
    setFecha(''); setHoraInicio(''); setHoraFin(''); setMunicipio(''); setLocalidad('');
    setErrFecha(''); setErrHoraInicio(''); setErrHoraFin(''); setErrMunicipio(''); setErrLocalidad('');
    
    // Paso 2
    setCategoria(''); setActores([]); setActorSeleccionado(''); setNivelConfianza(''); setNivelVisibilidad('');
    setDescripcion(''); setInfraestructura(''); setAccionInstitucional('');
    setErrCategoria(''); setErrActores(''); setErrNivelConfianza(''); setErrNivelVisibilidad('');
    setErrDescripcion(''); setErrInfraestructura(''); setErrAccionInstitucional('');
    
    // Paso 3
    setMuertosCiviles(''); setMuertosFuerza(''); setMuertosGrupos('');
    setHeridosCiviles(''); setHeridosFuerza(''); setHeridosGrupos('');
    setDesplazados(''); setConfinados(''); setAfectacionCiviles(''); setReclutamiento('');
    setVictimas([]);
    
    // Paso 4
    setEvidencias([]); setUrlEvidencia('');
  }

  // ── Excel upload ──────────────────────────────────────────────────────────
  function handleExcelFile(file: File) {
    setExcelError('');
    const valid = ['.xls', '.xlsx'];
    const hasValidExt = valid.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setExcelError('Formato de archivo inválido. Solo se aceptan archivos .xls o .xlsx');
      return;
    }
    if (file.size > EXCEL_MAX_BYTES) {
      setExcelError('El archivo excede el tamaño máximo permitido (10 MB)');
      return;
    }
    // Archivo válido — aquí se invocaría el backend
  }

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

  function handleAgregarVictima() {
    setVictimas(prev => [
      ...prev,
      { id: Date.now(), nombre: '', genero: '', edad: '', grupoPoblacional: '', ocupacion: '' },
    ]);
  }

  function handleEliminarVictima(id: number) {
    setVictimas(prev => prev.filter(v => v.id !== id));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const menuItems = [
    { label: 'DASHBOARD', icon: <img src={dashboardIcon} alt="" /> },
    { label: 'NOVEDADES', icon: <img src={novedadesIcon} alt="" />, to: '/novedades' },
    { label: 'USUARIOS', icon: <img src={usuariosIcon} alt="" />, to: '/usuarios' },
    { label: 'REPORTES', icon: <img src={reportesIcon} alt="" /> },
    { label: 'CONFIGURACION', icon: <img src={configuracionIcon} alt="" /> },
  ];
  const sidebarNav = <NavMenu items={menuItems} />;
  const sidebarFooter = <UserCard name="Actual_user" role="Admin Rol" />;

  return (
    <div className="layout">
      {showSuccessToast && (
        <div className="toast-success">
          ✅ Novedad registrada con éxito
        </div>
      )}

      <ExcelUploadModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onUpload={file => {
          handleExcelFile(file);
          setShowExcelModal(false);
        }}
      />

      <Sidebar title="VIGIA CAUCA" subtitle="GESTION INTEGRAL" nav={sidebarNav} footer={sidebarFooter} />
      <main className="main-content">
        <header className="main-header">
          <div className="breadcrumb">
            <span className="breadcrumb-path">Dashboard / </span>
            <span className="breadcrumb-current">Novedades</span>
          </div>
          <div className="header-user-profile">
            <div className="avatar-circle">AC</div>
            <div className="user-info">
              <span className="user-name">Admin Chávez</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
        </header>

        <section className="content-area">
          <div className="registration-card">
            <div className="registration-header">
              <div className="registration-title-group">
                <h3>REGISTRAR NUEVA NOVEDAD</h3>
                <p>Complete los campos del paso actual para continuar</p>
              </div>
              {currentStep === 1 && (
                <div>
                  <button
                    className="btn-excel"
                    onClick={() => setShowExcelModal(true)}
                  >
                    CARGAR DESDE EXCEL
                  </button>
                </div>
              )}
            </div>

            {/* ── Stepper ── */}
            <div className="stepper-container">
              {(['LOCALIZACION', 'CARACTERIZACION', 'AFECTACION', 'EVIDENCIAS'] as const).map(
                (label, i) => {
                  const step = i + 1;
                  const cls = currentStep > step ? 'completed' : currentStep === step ? 'active' : '';
                  return (
                    <>
                      <div key={label} className={`step ${cls}`}>
                        <div className="step-circle">{currentStep > step ? '✓' : step}</div>
                        <span className="step-label">{label}</span>
                      </div>
                      {step < 4 && <div key={`div-${step}`} className="step-divider" />}
                    </>
                  );
                }
              )}
            </div>

            {/* ══════════════════════════════════════════
                PASO 1 — LOCALIZACIÓN
            ══════════════════════════════════════════ */}
            {currentStep === 1 && (
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
            )}

            {/* ══════════════════════════════════════════
                PASO 2 — CARACTERIZACIÓN
            ══════════════════════════════════════════ */}
            {currentStep === 2 && (
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
            )}

            {/* ══════════════════════════════════════════
                PASO 3 — AFECTACIÓN
            ══════════════════════════════════════════ */}
            {currentStep === 3 && (
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
            )}

            {/* ══════════════════════════════════════════
                PASO 4 — EVIDENCIAS
            ══════════════════════════════════════════ */}
            {currentStep === 4 && (
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
            )}

            {/* ── Actions ── */}
            <div className="card-actions">
              <button
                className="btn-secondary"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : null}
              >
                {currentStep > 1 ? 'ANTERIOR' : 'CANCELAR'}
              </button>
              <button className="btn-primary" onClick={handleContinuar}>
                {currentStep === 4 ? 'REGISTRAR NOVEDAD' : 'CONTINUAR'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
