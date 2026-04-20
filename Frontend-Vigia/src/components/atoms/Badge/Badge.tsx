import styles from "./Badge.module.css";
import type { BadgeProps } from "./types";

export function Badge({ children, tone = "default", className }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}