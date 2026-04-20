import styles from "./InfoRow.module.css";

import type { InfoRowProps } from "./types";

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(" ")}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  );
}