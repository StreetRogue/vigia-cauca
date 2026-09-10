import type { ReactNode } from 'react';
import styles from './CapLabel.module.css';

interface CapLabelProps {
  children: ReactNode;
  color?: string;
  size?: number;
  /** Antepone la regla verde/amarilla institucional. Para títulos de sección. */
  accent?: boolean;
}

export function CapLabel({ children, color, size, accent }: CapLabelProps) {
  return (
    <div
      className={[styles.cap, accent ? styles.withAccent : null].filter(Boolean).join(' ')}
      style={{
        ...(color ? { color } : {}),
        ...(size ? { fontSize: size } : {}),
      }}
    >
      {accent ? <span className={styles.accentRule} aria-hidden="true" /> : null}
      {children}
    </div>
  );
}
