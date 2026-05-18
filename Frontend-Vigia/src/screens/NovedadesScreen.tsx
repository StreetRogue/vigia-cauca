import { useState } from 'react';
import { NovedadesProvider, useNovedades } from '../context/NovedadesContext';
import { novedadesService } from '../services/novedades.service';
import { ManagementTemplate } from '../components/templates/ManagementTemplate/ManagementTemplate';
import { NavMenu } from '../components/molecules/NavMenu';
import { UserDropdownSection } from '../components/organisms/UserDropdownSection/UserDropdownSection';
import { ExcelUploadModal } from '../components/organisms/ExcelUploadModal/ExcelUploadModal';
import { NovedadesListPanel } from '../components/organisms/novedades/NovedadesListPanel';
import { NovedadesDetailPanel } from '../components/organisms/novedades/NovedadesDetailPanel';
import { NovedadesSummaryPanel } from '../components/organisms/novedades/NovedadesSummaryPanel';
import { Stepper } from '../components/organisms/novedades/Stepper';
import { Step1Localizacion } from '../components/organisms/novedades/Step1Localizacion';
import { Step2Caracterizacion } from '../components/organisms/novedades/Step2Caracterizacion';
import { Step3Afectacion } from '../components/organisms/novedades/Step3Afectacion';
import { Step4Evidencias } from '../components/organisms/novedades/Step4Evidencias';
import { Step5Success } from '../components/organisms/novedades/Step5Success';
import { useAuth } from '../context/AuthContext';
import { getMenuItemsForRole, resolveAppRole } from '../constants/menuConfig';
import type { NovedadDTORespuesta } from '../types/novedad.types';
import dashboardIcon from '../assets/Dashboard_Icon.svg';
import novedadesIcon from '../assets/novedades_icon.svg';
import usuariosIcon from '../assets/usuarios_icon.svg';
import configuracionIcon from '../assets/configuracion_icon.svg';
import './novedades.css';
import styles from './NovedadesScreen.module.css';

const ICON_MAP: Record<string, string> = {
  DASHBOARD:     dashboardIcon,
  NOVEDADES:     novedadesIcon,
  USUARIOS:      usuariosIcon,
  CONFIGURACION: configuracionIcon,
};

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function NovedadesContent() {
  const { user, logout } = useAuth();
  const {
    currentStep, setCurrentStep,
    showExcelModal, setShowExcelModal,
    showSuccessToast,
    handleContinuar, handleExcelFile,
    initFromNovedad, resetForm,
    editingNovedadId,
  } = useNovedades();

  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [selectedNovedad, setSelectedNovedad] = useState<NovedadDTORespuesta | null>(null);
  const [selectedNovedadId, setSelectedNovedadId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const role    = resolveAppRole([user?.rol ?? '']);
  const items   = getMenuItemsForRole(role).map(item => ({
    ...item,
    icon: <img src={ICON_MAP[item.label]} alt="" />,
  }));
  const initials = getInitials(user?.name ?? user?.username ?? 'U');
  const displayName = user?.name ?? user?.username ?? 'Usuario';
  const displayRole = user?.rol ?? 'OPERADOR';
  const isAdmin = user?.rol === 'ADMIN';

  function handleNew() {
    resetForm();
    setMode('form');
  }

  function handleEdit(nov: NovedadDTORespuesta) {
    initFromNovedad(nov);
    setMode('form');
  }

  function handleCancel() {
    resetForm();
    setMode('list');
  }

  function handleFormDone() {
    resetForm();
    setRefreshKey(k => k + 1);
    setSelectedNovedad(null);
    setSelectedNovedadId(null);
    setMode('list');
  }

  function handleRowClick(nov: NovedadDTORespuesta) {
    if (selectedNovedadId === nov.novedadId) {
      setSelectedNovedad(null);
      setSelectedNovedadId(null);
    } else {
      setSelectedNovedad(nov);
      setSelectedNovedadId(nov.novedadId);
    }
  }

  const sidebarNav = <NavMenu items={items} selectedItem="NOVEDADES" />;

  const sidebarFooter = (
    <div className={styles.sidebarUser}>
      <div className={styles.sidebarAvatar}>{initials}</div>
      <div>
        <p className={styles.sidebarName}>{user?.name ?? user?.username}</p>
        <p className={styles.sidebarRole}>{user?.rol ?? 'OPERADOR'}</p>
      </div>
    </div>
  );

  const breadcrumb = (
    <>
      <span>Dashboard / </span>
      <strong>Novedades</strong>
    </>
  );

  const topbarUser = (
    <UserDropdownSection displayName={displayName} displayRol={displayRole} isAdmin={isAdmin} onLogout={logout} />
  );

  const formTitle = editingNovedadId ? 'EDITAR NOVEDAD' : 'REGISTRAR NUEVA NOVEDAD';
  const submitLabel = currentStep === 4
    ? (editingNovedadId ? 'ACTUALIZAR NOVEDAD' : 'REGISTRAR NOVEDAD')
    : 'CONTINUAR';

  const formOverlay = mode === 'form' ? (
    <div className={styles.formBackdrop}>
      <div className={styles.formCard}>
        {showSuccessToast && (
          <div className="toast-success">
            ✅ Novedad {editingNovedadId ? 'actualizada' : 'registrada'} con éxito
          </div>
        )}

        {currentStep === 5 ? (
          <div className="registration-card">
            <Step5Success onViewNovedad={(novedadId) => {
              novedadesService.obtenerPorId(novedadId)
                .then((novedad) => {
                  setMode('list');
                  setSelectedNovedad(novedad);
                  setSelectedNovedadId(novedad.novedadId);
                  setRefreshKey(k => k + 1);
                })
                .catch((err) => {
                  console.error('Error al cargar novedad:', err);
                });
            }} />
            <div className="card-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={handleFormDone}>
                VOLVER AL LISTADO
              </button>
            </div>
          </div>
        ) : (
          <div className="registration-card">
            <div className="registration-header">
              <div className="registration-title-group">
                <h3>{formTitle}</h3>
                <p>Complete los campos del paso actual para continuar</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {currentStep === 1 && !editingNovedadId && (
                  <button className="btn-excel" onClick={() => setShowExcelModal(true)}>
                    CARGAR DESDE EXCEL
                  </button>
                )}
                <button className="btn-secondary" onClick={handleCancel}>
                  CANCELAR
                </button>
              </div>
            </div>

            <Stepper />

            {currentStep === 1 && <Step1Localizacion />}
            {currentStep === 2 && <Step2Caracterizacion />}
            {currentStep === 3 && <Step3Afectacion />}
            {currentStep === 4 && <Step4Evidencias />}

            <div className="card-actions">
              <button
                className="btn-secondary"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : handleCancel()}
              >
                {currentStep > 1 ? 'ANTERIOR' : 'CANCELAR'}
              </button>
              <button className="btn-primary" onClick={handleContinuar}>
                {submitLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <ManagementTemplate
        sidebarTitle="VIGIA CAUCA"
        sidebarSubtitle="GESTION INTEGRAL"
        sidebarNav={sidebarNav}
        sidebarFooter={sidebarFooter}
        breadcrumb={breadcrumb}
        topbarUser={topbarUser}
        mainPanel={
          <NovedadesListPanel
            refreshKey={refreshKey}
            onNew={handleNew}
            onEdit={handleEdit}
            onExcel={() => setShowExcelModal(true)}
            onRowClick={handleRowClick}
            selectedId={selectedNovedadId}
            userRole={user?.rol}
          />
        }
        rightPanel={
          selectedNovedad ? (
            <NovedadesDetailPanel
              novedad={selectedNovedad}
              onEdit={handleEdit}
            />
          ) : (
            <NovedadesSummaryPanel />
          )
        }
        overlay={formOverlay}
      />

      <ExcelUploadModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onUpload={file => {
          handleExcelFile(file);
          setShowExcelModal(false);
        }}
      />
    </>
  );
}

export function NovedadesScreen() {
  return (
    <NovedadesProvider>
      <NovedadesContent />
    </NovedadesProvider>
  );
}
