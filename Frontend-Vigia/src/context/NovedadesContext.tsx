import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────
export const EXCEL_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function validateDate(value: string): string {
  if (!value.trim()) return 'Campo obligatorio';
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year || value.length < 8) return 'Formato inválido (DD/MM/AAAA)';
  const date = new Date(year, month - 1, day);
  if (date > new Date()) return 'La fecha no puede ser futura';
  if (year < 2000) return 'La fecha ingresada no es válida';
  return '';
}

export function required(value: string): string {
  return value.trim() ? '' : 'Campo obligatorio';
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Victima {
  id: number;
  nombre: string;
  genero: string;
  edad: string;
  grupoPoblacional: string;
  ocupacion: string;
}

export interface Evidencia {
  nombre: string;
  tipo: string;
}

// ── Context Provider Value Type ───────────────────────────────────────────────
export interface NovedadesContextType {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  showExcelModal: boolean;
  setShowExcelModal: React.Dispatch<React.SetStateAction<boolean>>;
  showSuccessToast: boolean;
  setShowSuccessToast: React.Dispatch<React.SetStateAction<boolean>>;
  excelError: string;
  setExcelError: React.Dispatch<React.SetStateAction<string>>;
  
  // Step 1
  fecha: string; setFecha: React.Dispatch<React.SetStateAction<string>>;
  horaInicio: string; setHoraInicio: React.Dispatch<React.SetStateAction<string>>;
  horaFin: string; setHoraFin: React.Dispatch<React.SetStateAction<string>>;
  municipio: string; setMunicipio: React.Dispatch<React.SetStateAction<string>>;
  localidad: string; setLocalidad: React.Dispatch<React.SetStateAction<string>>;
  errFecha: string; setErrFecha: React.Dispatch<React.SetStateAction<string>>;
  errHoraInicio: string; setErrHoraInicio: React.Dispatch<React.SetStateAction<string>>;
  errHoraFin: string; setErrHoraFin: React.Dispatch<React.SetStateAction<string>>;
  errMunicipio: string; setErrMunicipio: React.Dispatch<React.SetStateAction<string>>;
  errLocalidad: string; setErrLocalidad: React.Dispatch<React.SetStateAction<string>>;

  // Step 2
  categoria: string; setCategoria: React.Dispatch<React.SetStateAction<string>>;
  actores: string[]; setActores: React.Dispatch<React.SetStateAction<string[]>>;
  actorSeleccionado: string; setActorSeleccionado: React.Dispatch<React.SetStateAction<string>>;
  nivelConfianza: string; setNivelConfianza: React.Dispatch<React.SetStateAction<string>>;
  nivelVisibilidad: string; setNivelVisibilidad: React.Dispatch<React.SetStateAction<string>>;
  descripcion: string; setDescripcion: React.Dispatch<React.SetStateAction<string>>;
  infraestructura: string; setInfraestructura: React.Dispatch<React.SetStateAction<string>>;
  accionInstitucional: string; setAccionInstitucional: React.Dispatch<React.SetStateAction<string>>;
  errCategoria: string; setErrCategoria: React.Dispatch<React.SetStateAction<string>>;
  errActores: string; setErrActores: React.Dispatch<React.SetStateAction<string>>;
  errNivelConfianza: string; setErrNivelConfianza: React.Dispatch<React.SetStateAction<string>>;
  errNivelVisibilidad: string; setErrNivelVisibilidad: React.Dispatch<React.SetStateAction<string>>;
  errDescripcion: string; setErrDescripcion: React.Dispatch<React.SetStateAction<string>>;
  errInfraestructura: string; setErrInfraestructura: React.Dispatch<React.SetStateAction<string>>;
  errAccionInstitucional: string; setErrAccionInstitucional: React.Dispatch<React.SetStateAction<string>>;

  // Step 3
  muertosCiviles: string; setMuertosCiviles: React.Dispatch<React.SetStateAction<string>>;
  muertosFuerza: string; setMuertosFuerza: React.Dispatch<React.SetStateAction<string>>;
  muertosGrupos: string; setMuertosGrupos: React.Dispatch<React.SetStateAction<string>>;
  heridosCiviles: string; setHeridosCiviles: React.Dispatch<React.SetStateAction<string>>;
  heridosFuerza: string; setHeridosFuerza: React.Dispatch<React.SetStateAction<string>>;
  heridosGrupos: string; setHeridosGrupos: React.Dispatch<React.SetStateAction<string>>;
  desplazados: string; setDesplazados: React.Dispatch<React.SetStateAction<string>>;
  confinados: string; setConfinados: React.Dispatch<React.SetStateAction<string>>;
  afectacionCiviles: string; setAfectacionCiviles: React.Dispatch<React.SetStateAction<string>>;
  reclutamiento: string; setReclutamiento: React.Dispatch<React.SetStateAction<string>>;
  victimas: Victima[]; setVictimas: React.Dispatch<React.SetStateAction<Victima[]>>;
  muertosTotal: number;
  heridosTotal: number;

  // Step 4
  urlEvidencia: string; setUrlEvidencia: React.Dispatch<React.SetStateAction<string>>;
  evidencias: Evidencia[]; setEvidencias: React.Dispatch<React.SetStateAction<Evidencia[]>>;
  
  // Handlers and Actions
  handleContinuar: () => void;
  resetForm: () => void;
  handleExcelFile: (file: File) => void;
}

const NovedadesContext = createContext<NovedadesContextType | undefined>(undefined);

export function NovedadesProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [excelError, setExcelError] = useState('');

  // Step 1
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [errFecha, setErrFecha] = useState('');
  const [errHoraInicio, setErrHoraInicio] = useState('');
  const [errHoraFin, setErrHoraFin] = useState('');
  const [errMunicipio, setErrMunicipio] = useState('');
  const [errLocalidad, setErrLocalidad] = useState('');

  // Step 2
  const [categoria, setCategoria] = useState('');
  const [actores, setActores] = useState<string[]>([]);
  const [actorSeleccionado, setActorSeleccionado] = useState('');
  const [nivelConfianza, setNivelConfianza] = useState('');
  const [nivelVisibilidad, setNivelVisibilidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [infraestructura, setInfraestructura] = useState('');
  const [accionInstitucional, setAccionInstitucional] = useState('');
  const [errCategoria, setErrCategoria] = useState('');
  const [errActores, setErrActores] = useState('');
  const [errNivelConfianza, setErrNivelConfianza] = useState('');
  const [errNivelVisibilidad, setErrNivelVisibilidad] = useState('');
  const [errDescripcion, setErrDescripcion] = useState('');
  const [errInfraestructura, setErrInfraestructura] = useState('');
  const [errAccionInstitucional, setErrAccionInstitucional] = useState('');

  // Step 3
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

  const muertosTotal =
    (parseInt(muertosCiviles) || 0) +
    (parseInt(muertosFuerza) || 0) +
    (parseInt(muertosGrupos) || 0);

  const heridosTotal =
    (parseInt(heridosCiviles) || 0) +
    (parseInt(heridosFuerza) || 0) +
    (parseInt(heridosGrupos) || 0);

  // Step 4
  const [urlEvidencia, setUrlEvidencia] = useState('');
  const [evidencias, setEvidencias] = useState<Evidencia[]>([
    { nombre: 'foto-001.jpg', tipo: 'IMAGEN' },
    { nombre: 'video-001.mp4', tipo: 'VIDEO' },
  ]);

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

  function resetForm() {
    setCurrentStep(1);
    setFecha(''); setHoraInicio(''); setHoraFin(''); setMunicipio(''); setLocalidad('');
    setErrFecha(''); setErrHoraInicio(''); setErrHoraFin(''); setErrMunicipio(''); setErrLocalidad('');
    setCategoria(''); setActores([]); setActorSeleccionado(''); setNivelConfianza(''); setNivelVisibilidad('');
    setDescripcion(''); setInfraestructura(''); setAccionInstitucional('');
    setErrCategoria(''); setErrActores(''); setErrNivelConfianza(''); setErrNivelVisibilidad('');
    setErrDescripcion(''); setErrInfraestructura(''); setErrAccionInstitucional('');
    setMuertosCiviles(''); setMuertosFuerza(''); setMuertosGrupos('');
    setHeridosCiviles(''); setHeridosFuerza(''); setHeridosGrupos('');
    setDesplazados(''); setConfinados(''); setAfectacionCiviles(''); setReclutamiento('');
    setVictimas([]);
    setEvidencias([]); setUrlEvidencia('');
  }

  function handleContinuar() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSuccessToast(true);
      setCurrentStep(5);
      setTimeout(() => setShowSuccessToast(false), 3500);
    }
  }

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

  const value: NovedadesContextType = {
    currentStep, setCurrentStep, showExcelModal, setShowExcelModal,
    showSuccessToast, setShowSuccessToast, excelError, setExcelError,
    fecha, setFecha, horaInicio, setHoraInicio, horaFin, setHoraFin, municipio, setMunicipio, localidad, setLocalidad,
    errFecha, setErrFecha, errHoraInicio, setErrHoraInicio, errHoraFin, setErrHoraFin, errMunicipio, setErrMunicipio, errLocalidad, setErrLocalidad,
    categoria, setCategoria, actores, setActores, actorSeleccionado, setActorSeleccionado, nivelConfianza, setNivelConfianza,
    nivelVisibilidad, setNivelVisibilidad, descripcion, setDescripcion, infraestructura, setInfraestructura, accionInstitucional, setAccionInstitucional,
    errCategoria, setErrCategoria, errActores, setErrActores, errNivelConfianza, setErrNivelConfianza, errNivelVisibilidad, setErrNivelVisibilidad,
    errDescripcion, setErrDescripcion, errInfraestructura, setErrInfraestructura, errAccionInstitucional, setErrAccionInstitucional,
    muertosCiviles, setMuertosCiviles, muertosFuerza, setMuertosFuerza, muertosGrupos, setMuertosGrupos,
    heridosCiviles, setHeridosCiviles, heridosFuerza, setHeridosFuerza, heridosGrupos, setHeridosGrupos,
    desplazados, setDesplazados, confinados, setConfinados, afectacionCiviles, setAfectacionCiviles, reclutamiento, setReclutamiento,
    victimas, setVictimas, muertosTotal, heridosTotal,
    urlEvidencia, setUrlEvidencia, evidencias, setEvidencias,
    handleContinuar, resetForm, handleExcelFile
  };

  return <NovedadesContext.Provider value={value}>{children}</NovedadesContext.Provider>;
}

export function useNovedades() {
  const context = useContext(NovedadesContext);
  if (!context) {
    throw new Error('useNovedades debe usarse dentro de un NovedadesProvider');
  }
  return context;
}
