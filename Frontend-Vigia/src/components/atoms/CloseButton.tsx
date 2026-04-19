import styles from "./CloseButton.module.css";

interface CloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

export function CloseButton({ onClick, ariaLabel = "Cerrar", className }: CloseButtonProps) {
  return (
    <button className={[styles.button, className].filter(Boolean).join(" ")} onClick={onClick} aria-label={ariaLabel} type="button">
      x
    </button>
  );
}
