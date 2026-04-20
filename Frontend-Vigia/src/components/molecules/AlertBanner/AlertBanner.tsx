import styles from "./AlertBanner.module.css";
import type { AlertBannerProps } from "./types";

export function AlertBanner({ label, message, className }: AlertBannerProps) {
  return (
    <div className={[styles.banner, className].filter(Boolean).join(" ")} role="alert">
      <span className={styles.label}>{label}</span>
      <p className={styles.message}>{message}</p>
    </div>
  );
}