import type { ReactNode } from 'react';
import styles from './CapLabel.module.css';

interface CapLabelProps {
  children: ReactNode;
  color?: string;
  size?: number;
}

export function CapLabel({ children, color, size }: CapLabelProps) {
  return (
    <div
      className={styles.cap}
      style={{
        ...(color ? { color } : {}),
        ...(size ? { fontSize: size } : {}),
      }}
    >
      {children}
    </div>
  );
}
