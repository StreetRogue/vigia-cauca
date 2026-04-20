import styles from "./TextInput.module.css";
import type { TextInputProps } from "./types";

export function TextInput({ className, invalid, ...props }: TextInputProps) {
  return (
    <input
      className={[styles.input, invalid ? styles.invalid : null, className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}