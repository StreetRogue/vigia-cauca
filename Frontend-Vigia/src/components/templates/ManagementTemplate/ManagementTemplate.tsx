import { Sidebar } from "../../organisms/Sidebar";
import { SidebarProvider, useSidebar } from "../../../context/SidebarContext";
import styles from "./ManagementTemplate.module.css";
import type { ManagementTemplateProps } from "./types";

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <line x1="8" y1="3.5" x2="8" y2="16.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d={collapsed ? "M11.4 8.2 13.2 10l-1.8 1.8" : "M13.6 8.2 11.8 10l1.8 1.8"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ManagementLayout({
  sidebarTitle,
  sidebarSubtitle,
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
  const { collapsed, toggle, close } = useSidebar();

  return (
    <main className={[styles.page, collapsed ? styles.pageCollapsed : ""].filter(Boolean).join(" ")}>
      <Sidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        nav={sidebarNav}
        footer={sidebarFooter}
      />

      {/* Solo actúa en pantallas angostas, donde la barra se superpone. */}
      {!collapsed ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Cerrar el menú"
          onClick={close}
        />
      ) : null}

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={toggle}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expandir el menú" : "Recoger el menú"}
              title={collapsed ? "Expandir el menú" : "Recoger el menú"}
            >
              <CollapseIcon collapsed={collapsed} />
            </button>
            <div className={styles.breadcrumb}>{breadcrumb}</div>
          </div>
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

export function ManagementTemplate(props: ManagementTemplateProps) {
  return (
    <SidebarProvider>
      <ManagementLayout {...props} />
    </SidebarProvider>
  );
}
