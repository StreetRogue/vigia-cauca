import type { ReactNode } from "react";
import styles from "./FormField.module.css";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required = false, hint, error, children }: FormFieldProps) {
  return (
    <label className={styles.field}>
      <span className={[styles.label, error ? styles.labelError : ""].filter(Boolean).join(" ")}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      <div className={styles.supportContainer}>
        {error ? <span className={styles.error}>{error}</span> : hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
    </label>
  );
}
