import styles from "./Button.module.css";
import type { ButtonProps } from "./types";

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}