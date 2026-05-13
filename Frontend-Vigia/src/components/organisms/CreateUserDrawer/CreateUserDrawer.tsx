import { useState } from "react";
import { Button } from "../../atoms/Button/Button";
import { CloseButton } from "../../atoms/CloseButton";
import { TextInput } from "../../atoms/TextInput/TextInput";
import { FormField } from "../../molecules/FormField";
import type { MunicipioDTORespuesta } from "../../../types/ubicaciones.types";
import styles from "./CreateUserDrawer.module.css";

export interface CreateUserDrawerProps {
  open:           boolean;
  onClose:        () => void;
  municipios?:    MunicipioDTORespuesta[];
  existingEmails?: string[];
  onSave?: (payload: {
    cedula:      string;
    nombre:      string;
    email:       string;
    telefono:    string;
    username:    string;
    rol:         string;
    idMunicipio: number;
  }) => Promise<void>;
}

const roleOptions = ["ADMIN", "OPERADOR"];

type FormErrors = Partial<{
  cedula:      string;
  nombre:      string;
  email:       string;
  telefono:    string;
  username:    string;
  rol:         string;
  idMunicipio: string;
}>;

export function CreateUserDrawer({
  open,
  onClose,
  municipios = [],
  existingEmails =[],
  onSave,
}: CreateUserDrawerProps) {
  const [cedula,      setCedula]      = useState("");
  const [nombre,      setNombre]      = useState("");
  const [email,       setEmail]       = useState("");
  const [telefono,    setTelefono]    = useState("");
  const [username,    setUsername]    = useState("");
  const [rol,         setRol]         = useState("");
  const [idMunicipio, setIdMunicipio] = useState<string>("");
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [formError,   setFormError]   = useState("");
  const [saving,      setSaving]      = useState(false);

  if (!open) return null;

  const validate = (): FormErrors => {
    const e: FormErrors = {};

    if (!cedula.trim())   e.cedula   = "Campo obligatorio.";
    if (!nombre.trim())   e.nombre   = "Campo obligatorio.";
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
    } else if (!/^\w+$/.test(username.trim())) {
      e.username = "Solo letras, números y guion bajo.";
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
      await onSave?.({
        cedula:      cedula.trim(),
        nombre:      nombre.trim(),
        email:       email.trim().toLowerCase(),
        telefono:    telefono.trim(),
        username:    username.trim(),
        rol,
        idMunicipio: Number(idMunicipio),
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Error al crear el usuario. Intente de nuevo.";
      setFormError(msg);
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
              {saving ? "GUARDANDO..." : "GUARDAR"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}