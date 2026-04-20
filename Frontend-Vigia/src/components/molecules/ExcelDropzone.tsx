import { useRef, useState } from 'react';

const VALID_EXTS = ['.xlsx', '.xls'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

interface ExcelDropzoneProps {
  onFileChange: (file: File | null, error: string) => void;
}

export function ExcelDropzone({ onFileChange }: ExcelDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function processFile(file: File) {
    const hasValidExt = VALID_EXTS.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setSelectedFile(null);
      onFileChange(null, 'Formato inválido. Solo se aceptan archivos .xlsx o .xls.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setSelectedFile(null);
      onFileChange(null, 'El archivo excede el tamaño máximo permitido (5 MB).');
      return;
    }
    setSelectedFile(file);
    onFileChange(file, '');
  }

  return (
    <div className="excel-dropzone-wrapper">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = '';
        }}
      />

      <div
        className={`excel-dropzone${dragging ? ' excel-dropzone--active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
      >
        {/* Icon */}
        <svg className="excel-dropzone-icon" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="36,4 68,20 68,52 36,68 4,52 4,20" fill="#dbeafe" stroke="#1e40af" strokeWidth="2"/>
          <polygon points="36,4 68,20 36,36 4,20" fill="#bfdbfe" stroke="#1e40af" strokeWidth="1.5"/>
          <polygon points="4,20 36,36 36,68 4,52" fill="#93c5fd" stroke="#1e40af" strokeWidth="1.5"/>
          <polygon points="68,20 36,36 36,68 68,52" fill="#dbeafe" stroke="#1e40af" strokeWidth="1.5"/>
          {/* Arrow up inside */}
          <line x1="36" y1="44" x2="36" y2="26" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round"/>
          <polyline points="29,32 36,25 43,32" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {selectedFile ? (
          <p className="excel-dropzone-filename">📄 {selectedFile.name}</p>
        ) : (
          <>
            <p className="excel-dropzone-title">Arrastre el archivo .xlsx aquí</p>
            <p className="excel-dropzone-sub">o seleccione desde su computador</p>
          </>
        )}

        <button
          className="btn-select-file"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          SELECCIONAR ARCHIVO
        </button>
      </div>
    </div>
  );
}
