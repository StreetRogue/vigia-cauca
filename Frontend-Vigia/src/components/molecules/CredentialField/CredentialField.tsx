import { Button, TextInput } from "../../atoms";
import styles from "./CredentialField.module.css";
import type { CredentialFieldProps } from "./types";

export function CredentialField({
  id,
  label,
  value,
  placeholder,
  type,
  autoComplete,
  disabled,
  invalid,
  errorMessage,
  toggleLabel,
  toggleStateLabel,
  onChange,
  onToggle,
  className,
}: CredentialFieldProps) {
  const errorId = errorMessage ? `${id}-error` : undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputShell}>
        <TextInput
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.currentTarget.value)}
          disabled={disabled}
          invalid={invalid}
          aria-describedby={errorId}
        />
        {onToggle && toggleLabel ? (
          <Button
            type="button"
            variant="ghost"
            className={styles.toggle}
            onClick={onToggle}
            disabled={disabled}
            aria-label={toggleStateLabel ?? toggleLabel}
            aria-pressed={type === "text"}
          >
            <EyeIcon crossed={type === "text"} />
          </Button>
        ) : null}
      </div>
      <div id={errorId} className={styles.errorContainer} role={errorMessage ? "alert" : undefined}>
        {errorMessage}
      </div>
    </div>
  );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      className={styles.toggleIcon}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.75" />
      {crossed ? <path d="m4 20 16-16" /> : null}
    </svg>
  );
}
