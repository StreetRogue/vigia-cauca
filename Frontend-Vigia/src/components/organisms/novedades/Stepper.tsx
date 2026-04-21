import React, { Fragment } from 'react';
import { useNovedades } from '../../../context/NovedadesContext';
import './Stepper.css';

export function Stepper() {
  const { currentStep } = useNovedades();

  return (
    <div className="stepper-container">
      {(['LOCALIZACION', 'CARACTERIZACION', 'AFECTACION', 'EVIDENCIAS'] as const).map(
        (label, i) => {
          const step = i + 1;
          const cls = currentStep > step ? 'completed' : currentStep === step ? 'active' : '';
          return (
            <Fragment key={label}>
              <div className={`step ${cls}`}>
                <div className="step-circle">{currentStep > step ? '✓' : step}</div>
                <span className="step-label">{label}</span>
              </div>
              {step < 4 && <div className="step-divider" />}
            </Fragment>
          );
        }
      )}
    </div>
  );
}
