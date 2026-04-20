import { Button } from "../../atoms";
import { CredentialField } from "../CredentialField/CredentialField";
import styles from "./CredentialForm.module.css";
import type { CredentialFormProps } from "./types";

export function CredentialForm({
  email,
  password,
  showPassword,
  fieldErrors,
  copy,
  disabled,
  isBusy,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  className,
}: CredentialFormProps) {
  return (
    <form className={[styles.form, className].filter(Boolean).join(" ")} onSubmit={onSubmit}>
      <CredentialField
        id="login-email"
        label={copy.emailLabel}
        value={email}
        placeholder={copy.emailPlaceholder}
        type="email"
        autoComplete="email"
        disabled={disabled}
        invalid={Boolean(fieldErrors?.email)}
        errorMessage={fieldErrors?.email}
        onChange={onEmailChange}
      />

      <div className={styles.passwordField}>
        <CredentialField
          id="login-password"
          label={copy.passwordLabel}
          value={password}
          placeholder={copy.passwordPlaceholder}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          disabled={disabled}
          invalid={Boolean(fieldErrors?.password)}
          errorMessage={fieldErrors?.password}
          toggleLabel={showPassword ? "Ocultar" : "Ver"}
          toggleStateLabel={
            showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
          }
          onChange={onPasswordChange}
          onToggle={onTogglePassword}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        className={styles.forgotButton}
        onClick={onForgotPassword}
        disabled={disabled || !onForgotPassword}
      >
        {copy.forgotPassword}
      </Button>

      <Button type="submit" className={styles.submitButton} disabled={disabled}>
        {isBusy ? "VALIDANDO..." : copy.submitLabel}
      </Button>
    </form>
  );
}