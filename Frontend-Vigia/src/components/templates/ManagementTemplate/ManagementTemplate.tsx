import { Sidebar } from "../../organisms/Sidebar";
import styles from "./ManagementTemplate.module.css";
import type { ManagementTemplateProps } from "./types";

export function ManagementTemplate({
  sidebarTitle,
  sidebarSubtitle,
  sidebarMark = "VC",
  sidebarNav,
  sidebarFooter,
  breadcrumb,
  topbarUser,
  mainPanel,
  rightPanel,
  overlay,
  mainPanelClassName,
  rightPanelClassName,
}: ManagementTemplateProps) {
  return (
    <main className={styles.page}>
      <Sidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        mark={sidebarMark}
        nav={sidebarNav}
        footer={sidebarFooter}
      />

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>{breadcrumb}</div>
          <div className={styles.topbarUser}>{topbarUser}</div>
        </header>

        <div className={styles.contentGrid}>
          <div className={[styles.mainPanelSlot, mainPanelClassName].filter(Boolean).join(" ")}>
            {mainPanel}
          </div>
          <aside className={[styles.rightPanelSlot, rightPanelClassName].filter(Boolean).join(" ")}>
            {rightPanel}
          </aside>
        </div>

        {overlay ? <div className={styles.overlayLayer}>{overlay}</div> : null}
      </section>
    </main>
  );
}
