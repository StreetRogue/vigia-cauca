import { useState } from 'react';
import { Button }      from '../atoms/Button/Button';
import { CloseButton } from '../atoms/CloseButton';
import { TextInput }   from '../atoms/TextInput/TextInput';
import { FormField }   from '../molecules/FormField';
import styles          from './CreateUserDrawer.module.css';
import type { MunicipioDTO, RolUsuario, UsuarioCreatePayload } from '../../types/usuarios.types';

export interface CreateUserDrawerProps {
  open:         boolean;
  municipios:   MunicipioDTO[];
  existingEmails?: string[];
  onClose:      () => void;
  onSave:       (payload: UsuarioCreatePayload) => Promise<void>;
}

const roleOptions: RolUsuario[] = ['ADMIN', 'OPERADOR'];

type FormErrors = Partial<{
  cedula:      string;
  nombre:      string;
  email:       string;
  telefono:    string;
  username:    string;
  rol:         string;
  municipio:   string;
}>;

export function CreateUserDrawer({ open, municipios, existingEmails = [], onClose, onSave }: CreateUserDrawerProps) {
  const [cedula,    setCedula]    = useState('');
  const [nombre,    setNombre]    = useState('');
  const [email,     setEmail]     = useState('');
  const [telefono,  setTelefono]  = useState('');
  const [username,  setUsername]  = useState('');
  const [rol,       setRol]       = useState('');
  const [municipio, setMunicipio] = useState('');
  const [errors,    setErrors]    = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  if (!open) return null;

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!cedula.trim())   e.cedula  = 'Campo obligatorio.';
    if (!nombre.trim())   e.nombre  = 'Campo obligatorio.';
    if (!email.trim()) {
      e.email = 'Campo obligatorio.';
    } else {
      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        e.email = 'Correo institucional inválido.';
      } else if (existingEmails.map((x) => x.toLowerCase()).includes(normalizedEmail)) {
        e.email = 'Correo ya en uso.';
      }
    }
    if (!telefono.trim())  e.telefono = 'Campo obligatorio.';
    if (!username.trim()) {
      e.username = 'Campo obligatorio.';
    } else if (!/^\w+$/.test(username.trim())) {
      e.username = 'Solo letras, números y guion bajo.';
    }
    if (!rol)       e.rol      = 'Debes seleccionar un rol.';
    if (!municipio) e.municipio = 'Debes seleccionar un municipio.';
    return e;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const hasRequired = Object.values(nextErrors).some((err) => err === 'Campo obligatorio.');
      setFormError(hasRequired ? 'Campos obligatorios faltantes.' : 'Revisa los campos con error.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      await onSave({
        cedula:      cedula.trim(),
        nombre:      nombre.trim(),
        email:       email.trim(),
        telefono:    telefono.trim(),
        username:    username.trim(),
        rol:         rol as RolUsuario,
        idMunicipio: Number(municipio),
      });
      // Limpiar formulario
      setCedula(''); setNombre(''); setEmail(''); setTelefono('');
      setUsername(''); setRol(''); setMunicipio('');
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

      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="create-user-title">
        <header className={styles.header}>
          <p className={styles.kicker}>SYS-VIG-02 · CREAR NUEVO USUARIO</p>
          <div className={styles.headerRow}>
            <h2 id="create-user-title" className={styles.title}>Crear nuevo usuario</h2>
            <CloseButton className={styles.closeBtn} onClick={onClose} ariaLabel="Cerrar" />
          </div>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError && <p className={styles.formError}>{formError}</p>}

          <p className={styles.section}>Datos personales</p>

          <FormField label="Cédula" required error={errors.cedula}>
            <TextInput
              value={cedula}
              onChange={(ev) => setCedula(ev.target.value)}
              placeholder="Ej. 1094123456"
              invalid={Boolean(errors.cedula)}
              required
            />
          </FormField>

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

          <FormField
            label="Nombre de usuario"
            required
            hint="Solo letras, números y guion bajo. Sin espacios."
            error={errors.username}
          >
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
                onChange={(ev) => setRol(ev.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {roleOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormField>

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
          </div>

          <p className={styles.audit}>Los cambios quedan registrados en el historial de auditoría.</p>

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose} className={styles.cancelBtn} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
