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
          >
            {toggleLabel}
          </Button>
        ) : null}
      </div>
      <div id={errorId} className={styles.errorContainer} role={errorMessage ? "alert" : undefined}>
        {errorMessage}
      </div>
    </div>
  );
}