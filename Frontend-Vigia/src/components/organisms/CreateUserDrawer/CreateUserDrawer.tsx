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

  // Validaciones individuales de campos
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case "cedula":
        if (!value.trim()) return "Campo obligatorio.";
        if (!/^\d{10}$/.test(value.trim())) return "Debe contener exactamente 10 dígitos.";
        return undefined;

      case "nombre":
        if (!value.trim()) return "Campo obligatorio.";
        if (value.trim().length < 3) return "Nombre muy corto (mínimo 3 caracteres).";
        return undefined;

      case "telefono":
        if (!value.trim()) return "Campo obligatorio.";
        if (!/^3\d{9}$/.test(value.trim())) return "Debe ser un celular válido (10 dígitos, empezar por 3).";
        return undefined;

      case "email":
        if (!value.trim()) return "Campo obligatorio.";
        const norm = value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) return "Correo institucional inválido.";
        if (existingEmails.map((x) => x.toLowerCase()).includes(norm)) return "Correo ya en uso.";
        return undefined;

      case "username":
        if (!value.trim()) return "Campo obligatorio.";
        if (value.trim().length < 3) return "Mínimo 3 caracteres.";
        if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) return "Solo letras, números y guion bajo.";
        return undefined;

      case "password":
        if (!isEditing) {
          if (!value.trim()) return "Campo obligatorio.";
          if (value.length < 8) return "Mínimo 8 caracteres.";
          if (!/[A-Z]/.test(value)) return "Debe incluir al menos una mayúscula.";
          if (!/[0-9]/.test(value)) return "Debe incluir al menos un número.";
        } else if (value.trim()) {
          if (value.length < 8) return "Mínimo 8 caracteres.";
          if (!/[A-Z]/.test(value)) return "Debe incluir al menos una mayúscula.";
          if (!/[0-9]/.test(value)) return "Debe incluir al menos un número.";
        }
        return undefined;

      case "rol":
        if (!value.trim()) return "Debes seleccionar un rol.";
        return undefined;

      case "idMunicipio":
        if (!value.trim()) return "Debes seleccionar un municipio.";
        return undefined;

      default:
        return undefined;
    }
  };

  // Validación al perder foco (blur)
  const handleFieldBlur = (field: string, value: string) => {
    const error = validateField(field, value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field as keyof FormErrors] = error;
      } else {
        delete newErrors[field as keyof FormErrors];
      }
      return newErrors;
    });
  };

  // Validación completa para submit
  const validateComplete = (): FormErrors => {
    const e: FormErrors = {};
    const fields = ["cedula", "nombre", "email", "telefono", "username", "password", "rol", "idMunicipio"] as const;

    fields.forEach((field) => {
      let value = "";
      switch (field) {
        case "cedula": value = cedula; break;
        case "nombre": value = nombre; break;
        case "email": value = email; break;
        case "telefono": value = telefono; break;
        case "username": value = username; break;
        case "password": value = password; break;
        case "rol": value = rol; break;
        case "idMunicipio": value = idMunicipio; break;
      }
      const error = validateField(field, value);
      if (error) e[field] = error;
    });

    return e;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateComplete();
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
              onBlur={(e) => handleFieldBlur("cedula", e.target.value)}
              placeholder="Ej. 1094123456"
              invalid={Boolean(errors.cedula)}
              required
            />
          </FormField>

          <FormField label="NOMBRE COMPLETO" required error={errors.nombre}>
            <TextInput
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={(e) => handleFieldBlur("nombre", e.target.value)}
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
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
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
                onBlur={(e) => handleFieldBlur("telefono", e.target.value)}
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
              onBlur={(e) => handleFieldBlur("username", e.target.value)}
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
                onBlur={(e) => handleFieldBlur("password", e.target.value)}
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
                onBlur={(e) => handleFieldBlur("rol", e.target.value)}
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
                onBlur={(e) => handleFieldBlur("idMunicipio", e.target.value)}
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