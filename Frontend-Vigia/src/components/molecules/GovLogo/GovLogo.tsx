import type { CSSProperties } from 'react';
import logoGobernacion from '../../../assets/imgs/logo-gobernacion-horizontal.png';
import styles from './GovLogo.module.css';
import type { GovLogoProps } from './types';

/**
 * Logotipo institucional de la Gobernación del Cauca — Secretaría de Gobierno.
 * Usa el archivo oficial tal cual; no se recompone por partes.
 */
export function GovLogo({ plate = false, height = 30, className }: GovLogoProps) {
  return (
    <div
      className={[styles.logo, plate ? styles.plate : null, className]
        .filter(Boolean)
        .join(' ')}
      style={{ '--gov-logo-height': `${height}px` } as CSSProperties}
    >
      <img
        src={logoGobernacion}
        alt="Gobernación del Cauca · Secretaría de Gobierno"
        className={styles.image}
      />
    </div>
  );
}
