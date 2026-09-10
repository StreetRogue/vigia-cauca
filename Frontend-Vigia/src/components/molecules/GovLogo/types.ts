export interface GovLogoProps {
  /**
   * Sitúa el logotipo sobre una placa blanca. El logotipo oficial es de
   * tipografía oscura, así que sobre fondos oscuros necesita la placa.
   */
  plate?: boolean;
  /** Alto del logotipo en px. El ancho escala en proporción. */
  height?: number;
  className?: string;
}
