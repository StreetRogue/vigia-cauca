import { useState } from "react";
import { Button } from "../atoms/Button/Button";
import { CloseButton } from "../atoms/CloseButton";
import { TextInput } from "../atoms/TextInput/TextInput";
import { FormField } from "../molecules/FormField";
import styles from "./CreateUserDrawer.module.css";

export interface CreateUserDrawerProps {
  open: boolean;
  onClose: () => void;
  existingEmails?: string[];
  onSave?: (payload: {
    cedula: string;
    nombreCompleto: string;
    emailInstitucional: string;
    telefono: string;
    nombreUsuario: string;
    rol: string;
    municipio: string;
  }) => void;
}

const roleOptions = ["ADMIN", "OPERADOR"];
const municipalityOptions = ["Popayan", "Santander Q.", "Patia", "Timbio", "Bolivar", "Rosas", "Silvia", "Cajibio"];

type FormErrors = Partial<{
  cedula: string;
  nombreCompleto: string;
  emailInstitucional: string;
  telefono: string;
  nombreUsuario: string;
  rol: string;
  municipio: string;
}>;

export function CreateUserDrawer({ open, onClose, existingEmails = [], onSave }: CreateUserDrawerProps) {
  const [cedula, setCedula] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [emailInstitucional, setEmailInstitucional] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rol, setRol] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");

  if (!open) {
    return null;
  }

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!cedula.trim()) nextErrors.cedula = "Campo obligatorio.";
    if (!nombreCompleto.trim()) nextErrors.nombreCompleto = "Campo obligatorio.";
    if (!emailInstitucional.trim()) {
      nextErrors.emailInstitucional = "Campo obligatorio.";
    } else {
      const normalizedEmail = emailInstitucional.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        nextErrors.emailInstitucional = "Correo institucional invalido.";
      } else if (existingEmails.map((email) => email.toLowerCase()).includes(normalizedEmail)) {
        nextErrors.emailInstitucional = "Correo ya en uso.";
      }
    }
    if (!telefono.trim()) nextErrors.telefono = "Campo obligatorio.";
    if (!nombreUsuario.trim()) {
      nextErrors.nombreUsuario = "Campo obligatorio.";
    } else if (!/^\w+$/.test(nombreUsuario.trim())) {
      nextErrors.nombreUsuario = "Solo letras, numeros y guion bajo.";
    }
    if (!rol.trim()) nextErrors.rol = "Debes seleccionar un rol.";
    if (!municipio.trim()) nextErrors.municipio = "Debes seleccionar un municipio.";

    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const hasRequiredMissing = Object.values(nextErrors).some((error) => error === "Campo obligatorio.");
      setFormError(hasRequiredMissing ? "Campos obligatorios faltantes." : "Revisa los campos con error.");
      return;
    }

    setFormError("");

    onSave?.({
      cedula,
      nombreCompleto,
      emailInstitucional,
      telefono,
      nombreUsuario,
      rol,
      municipio,
    });

    onClose();
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

          <p className={styles.section}>Datos personales</p>

          <FormField label="Cédula" required error={errors.cedula}>
            <TextInput
              value={cedula}
              onChange={(event) => setCedula(event.target.value)}
              placeholder="Ej. 1094123456"
              invalid={Boolean(errors.cedula)}
              required
            />
          </FormField>

          <FormField label="Nombre completo" required error={errors.nombreCompleto}>
            <TextInput
              value={nombreCompleto}
              onChange={(event) => setNombreCompleto(event.target.value)}
              placeholder="Ej. Maria Garcia Ruiz"
              invalid={Boolean(errors.nombreCompleto)}
              required
            />
          </FormField>

          <div className={styles.twoCols}>
            <FormField label="Email institucional" required error={errors.emailInstitucional}>
              <TextInput
                value={emailInstitucional}
                onChange={(event) => setEmailInstitucional(event.target.value)}
                placeholder="usuario@cauca.gov.co"
                type="email"
                invalid={Boolean(errors.emailInstitucional)}
                required
              />
            </FormField>

            <FormField label="Telefono" required error={errors.telefono}>
              <TextInput
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                placeholder="Ej. 310 456 7890"
                invalid={Boolean(errors.telefono)}
                required
              />
            </FormField>
          </div>

          <FormField
            label="Nombre de usuario"
            required
            hint="Solo letras, numeros y guion bajo. Sin espacios."
            error={errors.nombreUsuario}
          >
            <TextInput
              value={nombreUsuario}
              onChange={(event) => setNombreUsuario(event.target.value)}
              placeholder="usuario123"
              invalid={Boolean(errors.nombreUsuario)}
              required
            />
          </FormField>

          <p className={styles.section}>Acceso al sistema</p>

          <div className={styles.twoCols}>
            <FormField label="Rol" required error={errors.rol}>
              <select
                className={[styles.select, errors.rol ? styles.selectInvalid : ""].filter(Boolean).join(" ")}
                value={rol}
                onChange={(event) => setRol(event.target.value)}
                aria-invalid={errors.rol ? "true" : undefined}
                required
              >
                <option value="">Seleccionar...</option>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Municipio" required error={errors.municipio}>
              <select
                className={[styles.select, errors.municipio ? styles.selectInvalid : ""].filter(Boolean).join(" ")}
                value={municipio}
                onChange={(event) => setMunicipio(event.target.value)}
                aria-invalid={errors.municipio ? "true" : undefined}
                required
              >
                <option value="">Seleccionar...</option>
                {municipalityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <p className={styles.audit}>Los cambios quedan registrados en el historial de auditoria.</p>

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose} className={styles.cancelBtn}>
              Cancelar
            </Button>
            <Button type="submit" className={styles.saveBtn}>Guardar</Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
