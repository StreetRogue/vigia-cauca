import { useState, useEffect } from 'react';
import { Button }      from '../../atoms/Button/Button';
import { CloseButton } from '../../atoms/CloseButton';
import { TextInput }   from '../../atoms/TextInput/TextInput';
import { FormField }   from '../../molecules/FormField';
import styles          from '../CreateUserDrawer.module.css';   // reusa estilos
import type { UsuarioResponseDTO, UsuarioUpdatePayload, MunicipioDTO, RolUsuario, EstadoUsuario } from '../../../types/usuarios.types';

export interface EditUserDrawerProps {
  open:         boolean;
  usuario:      UsuarioResponseDTO | null;
  municipios:   MunicipioDTO[];
  onClose:      () => void;
  onSave:       (id: string, payload: UsuarioUpdatePayload) => Promise<void>;
}

type FormErrors = Partial<{
  nombre:    string;
  email:     string;
  telefono:  string;
  username:  string;
  rol:       string;
  municipio: string;
}>;

const roleOptions: RolUsuario[]    = ['ADMIN', 'OPERADOR'];
const estadoOptions: EstadoUsuario[] = ['ACTIVO', 'INACTIVO'];

export function EditUserDrawer({ open, usuario, municipios, onClose, onSave }: EditUserDrawerProps) {
  const [nombre,    setNombre]    = useState('');
  const [email,     setEmail]     = useState('');
  const [telefono,  setTelefono]  = useState('');
  const [username,  setUsername]  = useState('');
  const [rol,       setRol]       = useState<RolUsuario | ''>('');
  const [estado,    setEstado]    = useState<EstadoUsuario | ''>('');
  const [municipio, setMunicipio] = useState('');
  const [errors,    setErrors]    = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  // Rellenar formulario cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre ?? '');
      setEmail(usuario.email ?? '');
      setTelefono(usuario.telefono ?? '');
      setUsername(usuario.username ?? '');
      setRol(usuario.rol ?? '');
      setEstado(usuario.estado ?? '');
      setMunicipio(usuario.municipio ? String(usuario.municipio.idMunicipio) : '');
      setErrors({});
      setFormError('');
    }
  }, [usuario]);

  if (!open || !usuario) return null;

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!nombre.trim())   e.nombre   = 'Campo obligatorio.';
    if (!email.trim())    e.email    = 'Campo obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Correo inválido.';
    if (!telefono.trim()) e.telefono = 'Campo obligatorio.';
    if (!username.trim()) e.username = 'Campo obligatorio.';
    if (!rol)             e.rol      = 'Debes seleccionar un rol.';
    if (!municipio)       e.municipio = 'Debes seleccionar un municipio.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setFormError('Revisa los campos con error.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      const payload: UsuarioUpdatePayload = {
        nombre:      nombre.trim(),
        email:       email.trim(),
        telefono:    telefono.trim(),
        username:    username.trim(),
        rol:         rol as RolUsuario,
        estado:      estado as EstadoUsuario,
        idMunicipio: Number(municipio),
      };
      await onSave(usuario.idUsuario, payload);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <button className={styles.backdrop} type="button" onClick={onClose} aria-label="Cerrar formulario" />

      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
        <header className={styles.header}>
          <p className={styles.kicker}>SYS-VIG-02 · EDITAR USUARIO</p>
          <div className={styles.headerRow}>
            <h2 id="edit-user-title" className={styles.title}>Editar usuario</h2>
            <CloseButton className={styles.closeBtn} onClick={onClose} ariaLabel="Cerrar" />
          </div>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError && <p className={styles.formError}>{formError}</p>}

          <p className={styles.section}>Datos personales</p>

          <FormField label="Nombre completo" required error={errors.nombre}>
            <TextInput
              value={nombre}
              onChange={(ev) => setNombre(ev.target.value)}
              placeholder="Ej. Maria Garcia Ruiz"
              invalid={Boolean(errors.nombre)}
              required
            />
          </FormField>

          <div className={styles.twoCols}>
            <FormField label="Email institucional" required error={errors.email}>
              <TextInput
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="usuario@cauca.gov.co"
                type="email"
                invalid={Boolean(errors.email)}
                required
              />
            </FormField>

            <FormField label="Teléfono" required error={errors.telefono}>
              <TextInput
                value={telefono}
                onChange={(ev) => setTelefono(ev.target.value)}
                placeholder="Ej. 3104567890"
                invalid={Boolean(errors.telefono)}
                required
              />
            </FormField>
          </div>

          <FormField label="Nombre de usuario" required error={errors.username}>
            <TextInput
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              placeholder="usuario123"
              invalid={Boolean(errors.username)}
              required
            />
          </FormField>

          <p className={styles.section}>Acceso al sistema</p>

          <div className={styles.twoCols}>
            <FormField label="Rol" required error={errors.rol}>
              <select
                className={[styles.select, errors.rol ? styles.selectInvalid : ''].filter(Boolean).join(' ')}
                value={rol}
                onChange={(ev) => setRol(ev.target.value as RolUsuario)}
                required
              >
                <option value="">Seleccionar...</option>
                {roleOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormField>

            <FormField label="Estado" required>
              <select
                className={styles.select}
                value={estado}
                onChange={(ev) => setEstado(ev.target.value as EstadoUsuario)}
              >
                {estadoOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Municipio" required error={errors.municipio}>
            <select
              className={[styles.select, errors.municipio ? styles.selectInvalid : ''].filter(Boolean).join(' ')}
              value={municipio}
              onChange={(ev) => setMunicipio(ev.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              {municipios.map((m) => (
                <option key={m.idMunicipio} value={String(m.idMunicipio)}>{m.nombre}</option>
              ))}
            </select>
          </FormField>

          <p className={styles.audit}>Los cambios quedan registrados en el historial de auditoría.</p>

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose} className={styles.cancelBtn} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
