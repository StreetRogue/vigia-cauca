export interface CredentialFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type: "email" | "password" | "text";
  autoComplete?: string;
  disabled?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  toggleLabel?: string;
  toggleStateLabel?: string;
  onChange: (value: string) => void;
  onToggle?: () => void;
  className?: string;
}