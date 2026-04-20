interface CloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function CloseButton({ onClick, ariaLabel = 'Cerrar' }: CloseButtonProps) {
  return (
    <button className="close-btn" onClick={onClick} aria-label={ariaLabel} type="button">
      ✕
    </button>
  );
}
