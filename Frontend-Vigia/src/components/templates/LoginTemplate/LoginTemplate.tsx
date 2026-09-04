import styles from "./LoginTemplate.module.css";
import type { LoginTemplateProps } from "./types";
import mapImage from "../../../assets/MGN_ADM 1.svg";
import escudoCauca from "../../../assets/imgs/escudo-cauca.png";
import { GovLogo } from "../../molecules";

export function LoginTemplate({ panel }: LoginTemplateProps) {
  return (
    <main className={styles.shell}>
      <section className={styles.blueprint} aria-label="Vista de contexto del sistema">
        <div className={styles.blueprintContent}>
          <div>
            <div className={styles.brandRow}>
              <img src={escudoCauca} alt="" aria-hidden="true" className={styles.brandMark} />
              <div>
                <p className={styles.brandTitle}>VIGIA CAUCA</p>
                <p className={styles.brandSubtitle}>SISTEMA DE GESTION · GOBERNACION DEL CAUCA</p>
              </div>
            </div>
            <p className={styles.monitorLabel}>GEO-VIG · ZONA DE MONITOREO ACTIVA</p>
          </div>

          <div className={styles.mapFrame} aria-hidden="true">
            <img src={mapImage} alt="" className={styles.mapImage} />
            <span className={styles.coordinateTop}>
              <span className={styles.coordinateDot} />
              2.891° N 76.920° W
            </span>
            <span className={styles.coordinateBottom}>
              <span className={styles.coordinateDot} />
              0.653° N 77.885° W
            </span>
            <span className={`${styles.cornerMark} ${styles.cornerTopRight}`} />
            <span className={`${styles.cornerMark} ${styles.cornerBottomRight}`} />
          </div>
        </div>

        <footer className={styles.institutionalBar}>
          <span className={styles.flagLine} aria-hidden="true" />
          <GovLogo height={26} />
        </footer>
      </section>

      <section className={styles.panelSlot}>
        <span className={styles.watermark} aria-hidden="true">
          CAUCA
        </span>
        <span className={styles.edgeStripe} aria-hidden="true" />
        <div className={styles.panelInner}>{panel}</div>
      </section>
    </main>
  );
}
