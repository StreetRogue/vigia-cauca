import { NovedadesProvider, useNovedades } from '../context/NovedadesContext';
import { Sidebar } from '../components/organisms/Sidebar';
import { ExcelUploadModal } from '../components/organisms/ExcelUploadModal';
import { Stepper } from '../components/organisms/novedades/Stepper';
import { Step1Localizacion } from '../components/organisms/novedades/Step1Localizacion';
import { Step2Caracterizacion } from '../components/organisms/novedades/Step2Caracterizacion';
import { Step3Afectacion } from '../components/organisms/novedades/Step3Afectacion';
import { Step4Evidencias } from '../components/organisms/novedades/Step4Evidencias';
import { Step5Success } from '../components/organisms/novedades/Step5Success';

function NovedadesContent() {
  const {
    currentStep, setCurrentStep,
    showExcelModal, setShowExcelModal,
    showSuccessToast,
    handleContinuar, handleExcelFile
  } = useNovedades();

  return (
    <div className="layout">
      {showSuccessToast && (
        <div className="toast-success">
          ✅ Novedad registrada con éxito
        </div>
      )}

      <ExcelUploadModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onUpload={file => {
          handleExcelFile(file);
          setShowExcelModal(false);
        }}
      />

      <Sidebar title="VIGIA CAUCA" subtitle="GESTION INTEGRAL" />
      <main className="main-content">
        <header className="main-header">
          <div className="breadcrumb">
            <span className="breadcrumb-path">Dashboard / </span>
            <span className="breadcrumb-current">Novedades</span>
          </div>
          <div className="header-user-profile">
            <div className="avatar-circle">AC</div>
            <div className="user-info">
              <span className="user-name">Admin Chávez</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
        </header>

        <section className="content-area">
          {currentStep === 5 ? (
            <Step5Success />
          ) : (
            <div className="registration-card">
              <div className="registration-header">
                <div className="registration-title-group">
                  <h3>REGISTRAR NUEVA NOVEDAD</h3>
                  <p>Complete los campos del paso actual para continuar</p>
                </div>
                {currentStep === 1 && (
                  <div>
                    <button
                      className="btn-excel"
                      onClick={() => setShowExcelModal(true)}
                    >
                      CARGAR DESDE EXCEL
                    </button>
                  </div>
                )}
              </div>

              <Stepper />

              {currentStep === 1 && <Step1Localizacion />}
              {currentStep === 2 && <Step2Caracterizacion />}
              {currentStep === 3 && <Step3Afectacion />}
              {currentStep === 4 && <Step4Evidencias />}

              <div className="card-actions">
                <button
                  className="btn-secondary"
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : null}
                >
                  {currentStep > 1 ? 'ANTERIOR' : 'CANCELAR'}
                </button>
                <button className="btn-primary" onClick={handleContinuar}>
                  {currentStep === 4 ? 'REGISTRAR NOVEDAD' : 'CONTINUAR'}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export function NovedadesScreen() {
  return (
    <NovedadesProvider>
      <NovedadesContent />
    </NovedadesProvider>
  );
}
