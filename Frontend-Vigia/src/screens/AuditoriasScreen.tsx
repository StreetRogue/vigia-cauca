import { useState } from 'react';
import { ManagementTemplate } from '../components/templates/ManagementTemplate/ManagementTemplate';
import { UserDropdownSection } from '../components/organisms/UserDropdownSection/UserDropdownSection';
import { AuditoriasListPanel } from '../components/organisms/auditorias/AuditoriasListPanel';
import { AuditoriasDetailPanel } from '../components/organisms/auditorias/AuditoriasDetailPanel';
import { useSidebarNav } from '../hooks/useSidebarNav';
import type { AuditoriaDTORespuesta } from '../types/novedad.types';
import styles from './AuditoriasScreen.module.css';

export function AuditoriasScreen() {
  const { user, logout, displayName, displayRole, isAdmin, initials, sidebarNav } = useSidebarNav('AUDITORIAS');

  const [selectedAuditoria, setSelectedAuditoria] = useState<AuditoriaDTORespuesta | null>(null);

  const sidebarFooter = (
    <div className={styles.sidebarUser}>
      <div className={styles.sidebarAvatar}>{initials}</div>
      <div>
        <p className={styles.sidebarName}>{displayName}</p>
        <p className={styles.sidebarRole}>{displayRole}</p>
      </div>
    </div>
  );

  const breadcrumb = (
    <>
      <span>Dashboard / </span>
      <strong>Auditorías</strong>
    </>
  );

  const topbarUser = (
    <UserDropdownSection
      displayName={displayName}
      displayRol={displayRole}
      isAdmin={isAdmin}
      onLogout={logout}
    />
  );

  return (
    <div className={styles.auditoriasScope}>
    <ManagementTemplate
      sidebarTitle="VIGIA CAUCA"
      sidebarSubtitle="GESTION INTEGRAL"
      sidebarNav={sidebarNav}
      sidebarFooter={sidebarFooter}
      breadcrumb={breadcrumb}
      topbarUser={topbarUser}
      mainPanel={
        <AuditoriasListPanel
          onSelect={a => setSelectedAuditoria(a)}
          selectedId={selectedAuditoria?.auditoriaId ?? null}
        />
      }
      rightPanel={
        <AuditoriasDetailPanel auditoria={selectedAuditoria} />
      }
    />
    </div>
  );
}
