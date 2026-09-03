import type { CSSProperties } from 'react';
import escudoCauca from '../../../assets/imgs/escudo-cauca.png';
import logotipoOscuro from '../../../assets/imgs/gobernacion-cauca.png';
import logotipoClaro from '../../../assets/imgs/gobernacion-cauca-blanco.png';
import styles from './GovLogo.module.css';
import type { GovLogoProps } from './types';

/**
 * Lockup institucional de la Gobernación del Cauca:
 * escudo · "Gobernación del CAUCA" · divisor · "Secretaría de Gobierno".
 *
 * `tone="light"` usa el logotipo en blanco, para fondos oscuros.
 * `layout="stacked"` apila escudo y logotipo, para columnas angostas.
 */
export function GovLogo({
  tone = 'dark',
  layout = 'horizontal',
  height = 30,
  className,
}: GovLogoProps) {
  const isLight = tone === 'light';

  return (
    <div
      className={[
        styles.logo,
        styles[layout],
        isLight ? styles.light : styles.dark,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--gov-logo-height': `${height}px` } as CSSProperties}
    >
      <img src={escudoCauca} alt="" aria-hidden="true" className={styles.shield} />
      <img
        src={isLight ? logotipoClaro : logotipoOscuro}
        alt="Gobernación del Cauca"
        className={styles.wordmark}
      />
      <span className={styles.divider} aria-hidden="true" />
      <span className={styles.secretaria}>
        Secretaría de
        <br />
        Gobierno
      </span>
    </div>
  );
}
