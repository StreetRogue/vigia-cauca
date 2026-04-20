import { Badge } from "../../atoms";
import { CredentialForm, InfoRow } from "../../molecules";
import styles from "./LoginPanel.module.css";
import type { LoginPanelCopy, LoginPanelProps } from "./types";

const defaultCopy: LoginPanelCopy = {
  badge: "SYS-VIG-01 · MÓDULO DE AUTENTICACIÓN",
  title: "ACCESO AL SISTEMA",
  description: "Ingrese sus credenciales institucionales para continuar.",
  emailLabel: "CORREO ELECTRÓNICO",
  emailPlaceholder: "usuario@cauca.gov.co",
  passwordLabel: "CONTRASEÑA",
  passwordPlaceholder: "••••••••••",
  forgotPassword: "¿Olvidaste tu contraseña?",
  submitLabel: "INICIAR SESIÓN",
  infoTitle: "INFORMACIÓN DE ACCESO",
  infoRows: [
    { label: "ÚLTIMA SESIÓN", value: "08/04/2026 — 16:43 · Bogotá, Colombia" },
    {
      label: "POLÍTICA DE ACCESO",
      value: "Uso exclusivo del personal autorizado · Ley 1273 de 2009",
    },
    { label: "VERSIÓN", value: "v2.1.0 · Entorno: Producción" },
  ],
  footer:
    "Sistema de acceso restringido. Uso exclusivo de funcionarios autorizados por la Gobernación del Cauca.",
};

export function LoginPanel({
  email,
  password,
  showPassword,
  status = "idle",
  copy,
  fieldErrors,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  className,
}: LoginPanelProps) {
  const mergedCopy = {
    ...defaultCopy,
    ...copy,
    infoRows: copy?.infoRows ?? defaultCopy.infoRows,
  } satisfies LoginPanelCopy;

  const isBusy = status === "submitting";
  const isDisabled = status === "disabled" || isBusy;

  return (
    <section className={[styles.panel, className].filter(Boolean).join(" ")}>
      <header className={styles.header}>
        <Badge>{mergedCopy.badge}</Badge>
        <h1 className={styles.title}>{mergedCopy.title}</h1>
        <p className={styles.description}>{mergedCopy.description}</p>
      </header>

      <div className={styles.divider} aria-hidden="true" />

      <CredentialForm
        email={email}
        password={password}
        showPassword={showPassword}
        fieldErrors={fieldErrors}
        copy={{
          emailLabel: mergedCopy.emailLabel,
          emailPlaceholder: mergedCopy.emailPlaceholder,
          passwordLabel: mergedCopy.passwordLabel,
          passwordPlaceholder: mergedCopy.passwordPlaceholder,
          forgotPassword: mergedCopy.forgotPassword,
          submitLabel: mergedCopy.submitLabel,
        }}
        disabled={isDisabled}
        isBusy={isBusy}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onTogglePassword={onTogglePassword}
        onSubmit={onSubmit}
        onForgotPassword={onForgotPassword}
      />

      <section className={styles.infoSection} aria-label={mergedCopy.infoTitle}>
        <h2 className={styles.infoTitle}>{mergedCopy.infoTitle}</h2>
        <dl className={styles.infoList}>
          {mergedCopy.infoRows.map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      </section>

      <p className={styles.footer}>{mergedCopy.footer}</p>
    </section>
  );
}