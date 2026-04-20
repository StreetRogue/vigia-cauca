import styles from "./TextInput.module.css";
import type { TextInputProps } from "./types";

export function TextInput({ className, invalid, maxLength, ...props }: TextInputProps) {
  return (
    <input
      className={[styles.input, invalid ? styles.invalid : null, className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={invalid || undefined}
      maxLength={maxLength ?? 15}
      {...props}
    />
  );
}