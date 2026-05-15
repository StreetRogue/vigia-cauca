import { useState, useEffect } from "react";
import { Button } from "../../atoms/Button/Button";
import { CloseButton } from "../../atoms/CloseButton";
import { TextInput } from "../../atoms/TextInput/TextInput";
import { FormField } from "../../molecules/FormField";
import type { MunicipioDTORespuesta } from "../../../types/ubicaciones.types";
import type { UsuarioResponseDTO } from "../../../types/usuario.types";
import styles from "./CreateUserDrawer.module.css";

export interface CreateUserDrawerProps {
  open:           boolean;
  onClose:        () => void;
  municipios?:    MunicipioDTORespuesta[];
  existingEmails?: string[];
  initialData?:   UsuarioResponseDTO;
  onSave?: (payload: {
    cedula?:      string;
    nombre?:      string;
    email?:       string;
    telefono?:    string;
    username?:    string;
    password?:    string;
    rol?:         string;
    idMunicipio?: number;
  }) => Promise<void>;
}

const roleOptions = ["ADMIN", "OPERADOR"];

type FormErrors = Partial<{
  cedula:      string;
  nombre:      string;
  email:       string;
  telefono:    string;
  username:    string;
  password:    string;
  rol:         string;
  idMunicipio: string;
}>;

export function CreateUserDrawer({
  open,
  onClose,
  municipios = [],
  existingEmails =[],
  initialData,
  onSave,
}: CreateUserDrawerProps) {
  const isEditing = Boolean(initialData);

  const [cedula,       setCedula]       = useState("");
  const [nombre,       setNombre]       = useState("");
  const [email,        setEmail]        = useState("");
  const [telefono,     setTelefono]     = useState("");
  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rol,          setRol]          = useState("");
  const [idMunicipio,  setIdMunicipio]  = useState<string>("");
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [formError,    setFormError]    = useState("");
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (isEditing && initialData) {
      setCedula(initialData.cedula);
      setNombre(initialData.nombre);
      setEmail(initialData.email);
      setTelefono(initialData.telefono);
      setUsername(initialData.username);
      setRol(initialData.rol);
      setIdMunicipio(initialData.municipio?.idMunicipio?.toString() ?? "");
      setPassword("");
    } else {
      setCedula("");
      setNombre("");
      setEmail("");
      setTelefono("");
      setUsername("");
      setPassword("");
      setRol("");
      setIdMunicipio("");
    }
    setErrors({});
    setFormError("");
  }, [open, isEditing, initialData]);

  if (!open) return null;

  const validate = (): FormErrors => {
    const e: FormErrors = {};

    if (!cedula.trim()) {
      e.cedula = "Campo obligatorio.";
    } else if (!/^\d{7,11}$/.test(cedula.trim())) {
      e.cedula = "Debe contener solo números (7-11 dígitos).";
    }

    if (!nombre.trim()) {
      e.nombre = "Campo obligatorio.";
    } else if (nombre.trim().length < 3) {
      e.nombre = "Nombre muy corto (mínimo 3 caracteres).";
    }

    if (!telefono.trim()) {
      e.telefono = "Campo obligatorio.";
    } else if (!/^3\d{9}$/.test(telefono.trim())) {
      e.telefono = "Debe ser un celular válido (10 dígitos, empezar por 3).";
    }

    if (!email.trim()) {
      e.email = "Campo obligatorio.";
    } else {
      const norm = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) {
        e.email = "Correo institucional inválido.";
      } else if (existingEmails.map((x) => x.toLowerCase()).includes(norm)) {
        e.email = "Correo ya en uso.";
      }
    }

    if (!username.trim()) {
      e.username = "Campo obligatorio.";
    } else if (username.trim().length < 3) {
      e.username = "Mínimo 3 caracteres.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      e.username = "Solo letras, números y guion bajo.";
    }

    if (!isEditing) {
      if (!password.trim()) {
        e.password = "Campo obligatorio.";
      } else if (password.length < 8) {
        e.password = "Mínimo 8 caracteres.";
      } else if (!/[A-Z]/.test(password)) {
        e.password = "Debe incluir al menos una mayúscula.";
      } else if (!/[0-9]/.test(password)) {
        e.password = "Debe incluir al menos un número.";
      }
    } else if (password.trim()) {
      if (password.length < 8) {
        e.password = "Mínimo 8 caracteres.";
      } else if (!/[A-Z]/.test(password)) {
        e.password = "Debe incluir al menos una mayúscula.";
      } else if (!/[0-9]/.test(password)) {
        e.password = "Debe incluir al menos un número.";
      }
    }

    if (!rol.trim())         e.rol         = "Debes seleccionar un rol.";
    if (!idMunicipio.trim()) e.idMunicipio = "Debes seleccionar un municipio.";

    return e;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const hasRequired = Object.values(nextErrors).some((e) => e === "Campo obligatorio.");
      setFormError(hasRequired ? "Campos obligatorios faltantes." : "Revisa los campos con error.");
      return;
    }

    setFormError("");
    setSaving(true);
    try {
      const payload: any = {
        cedula:      cedula.trim(),
        nombre:      nombre.trim(),
        email:       email.trim().toLowerCase(),
        telefono:    telefono.trim(),
        username:    username.trim(),
        rol,
        idMunicipio: Number(idMunicipio),
      };
      if (!isEditing || password.trim()) {
        payload.password = password.trim();
      }
      await onSave?.(payload);
      onClose();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string; error?: string } } };
      const errorMessage = apiError?.response?.data?.message;
      const errorType = apiError?.response?.data?.error;

      let displayMessage = `Error al ${isEditing ? 'actualizar' : 'crear'} el usuario.`;

      // Mapear errores específicos del backend a mensajes amigables
      if (errorType === 'CEDULA_ALREADY_EXISTS') {
        displayMessage = errorMessage || 'Esta cédula ya está registrada.';
      } else if (errorType === 'EMAIL_ALREADY_EXISTS') {
        displayMessage = errorMessage || 'Este email ya está registrado.';
      } else if (errorType === 'USERNAME_ALREADY_EXISTS') {
        displayMessage = errorMessage || 'Este nombre de usuario ya existe.';
      } else if (errorMessage) {
        displayMessage = errorMessage;
      }

      setFormError(displayMessage);
      console.error('Error al guardar usuario:', { err, errorType, errorMessage });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <button className={styles.backdrop} type="button" onClick={onClose} aria-label="Cerrar formulario" />

      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="create-user-title">
        <header className={styles.header}>
          <p className={styles.kicker}>SYS-VIG-02 · {isEditing ? 'EDITAR USUARIO' : 'CREAR NUEVO USUARIO'}</p>
          <div className={styles.headerRow}>
            <h2 id="create-user-title" className={styles.title}>{isEditing ? 'Editar usuario' : 'Crear nuevo usuario'}</h2>
            <CloseButton className={styles.closeBtn} onClick={onClose} ariaLabel="Cerrar" />
          </div>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError ? <p className={styles.formError}>{formError}</p> : null}

          <p className={styles.section}>DATOS PERSONALES</p>

          <FormField label="CÉDULA" required error={errors.cedula}>
            <TextInput
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Ej. 1094123456"
              invalid={Boolean(errors.cedula)}
              required
            />
          </FormField>

          <FormField label="NOMBRE COMPLETO" required error={errors.nombre}>
            <TextInput
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Maria Garcia Ruiz"
              invalid={Boolean(errors.nombre)}
              required
            />
          </FormField>

          <div className={styles.twoCols}>
            <FormField label="EMAIL INSTITUCIONAL" required error={errors.email}>
              <TextInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@cauca.gov.co"
                type="email"
                invalid={Boolean(errors.email)}
                required
              />
            </FormField>

            <FormField label="TELEFONO" required error={errors.telefono}>
              <TextInput
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 3104567890"
                invalid={Boolean(errors.telefono)}
                required
              />
            </FormField>
          </div>

          <FormField
            label="NOMBRE DE USUARIO"
            required
            hint="Solo letras, números y guion bajo. Sin espacios."
            error={errors.username}
          >
            <TextInput
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario123"
              invalid={Boolean(errors.username)}
              required
            />
          </FormField>

          <p className={styles.section}>ACCESO AL SISTEMA</p>

          <FormField label="CONTRASEÑA" required={!isEditing} hint={isEditing ? "Dejar en blanco para no cambiar." : "Mínimo 8 caracteres."} error={errors.password}>
            <div className={styles.passwordInputWrapper}>
              <TextInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña segura"
                type={showPassword ? "text" : "password"}
                invalid={Boolean(errors.password)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "Ocultar" : "Ver"}
              </Button>
            </div>
          </FormField>

          <div className={styles.twoCols}>
            <FormField label="ROL" required error={errors.rol}>
              <select
                className={[styles.select, errors.rol ? styles.selectInvalid : ""].filter(Boolean).join(" ")}
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                aria-invalid={errors.rol ? "true" : undefined}
                required
              >
                <option value="" disabled>Seleccionar...</option>
                {roleOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </FormField>

            <FormField label="MUNICIPIO" required error={errors.idMunicipio}>
              <select
                className={[styles.select, errors.idMunicipio ? styles.selectInvalid : ""].filter(Boolean).join(" ")}
                value={idMunicipio}
                onChange={(e) => setIdMunicipio(e.target.value)}
                aria-invalid={errors.idMunicipio ? "true" : undefined}
                required
              >
                <option value="" disabled>Seleccionar...</option>
                {municipios.map((m) => (
                  <option key={m.idMunicipio} value={m.idMunicipio}>{m.nombre}</option>
                ))}
              </select>
            </FormField>
          </div>

          <p className={styles.audit}>Los cambios quedan registrados en el historial de auditoria.</p>

          <div className={styles.actions}>
            {/* Se envía text-transform uppercase directo en los estilos, pero en texto garantizamos el formato */}
            <Button type="button" variant="ghost" onClick={onClose} className={styles.cancelBtn} disabled={saving}>
              CANCELAR
            </Button>
            <Button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? (isEditing ? "ACTUALIZANDO..." : "GUARDANDO...") : (isEditing ? "ACTUALIZAR" : "GUARDAR")}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}