export interface GovLogoProps {
  /** `light` para fondos oscuros (logotipo en blanco). */
  tone?: 'dark' | 'light';
  /**
   * `horizontal`: escudo · logotipo | secretaría. Para barras anchas.
   * `stacked`: escudo sobre el logotipo. Para columnas angostas (sidebar).
   */
  layout?: 'horizontal' | 'stacked';
  /** Alto del escudo en px; el resto escala en proporción. */
  height?: number;
  className?: string;
}
