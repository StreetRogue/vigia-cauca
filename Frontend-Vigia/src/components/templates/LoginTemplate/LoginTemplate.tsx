import styles from "./LoginTemplate.module.css";
import type { LoginTemplateProps } from "./types";
import mapImage from "../../../assets/MGN_ADM 1.svg";

export function LoginTemplate({ panel }: LoginTemplateProps) {
  return (
    <main className={styles.shell}>
      <section className={styles.blueprint} aria-label="Vista de contexto del sistema">
        <div className={styles.blueprintContent}>
          <div>
            <div className={styles.brandRow}>
              <div className={styles.brandMark}>VC</div>
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
          </div>

          <div className={styles.blueprintFooter}>
            <span>v2.1.0 · USO INTERNO RESTRINGIDO</span>
            <span>2026 · GOBERNACION DEL CAUCA</span>
          </div>
        </div>
      </section>

      <section className={styles.panelSlot}>{panel}</section>
    </main>
  );
}