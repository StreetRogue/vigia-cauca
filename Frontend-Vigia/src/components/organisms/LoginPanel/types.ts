import type { FormEvent } from "react";
import type { CredentialsFieldErrors, DisplayRow } from "../../shared/types";

export type LoginPanelState = "idle" | "error" | "submitting" | "disabled";

export interface LoginPanelCopy {
  badge: string;
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  submitLabel: string;
  infoTitle: string;
  infoRows: readonly DisplayRow[];
  footer: string;
}

export interface LoginPanelProps {
  email: string;
  password: string;
  showPassword: boolean;
  status?: LoginPanelState;
  copy?: Partial<LoginPanelCopy>;
  fieldErrors?: CredentialsFieldErrors;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPassword?: () => void;
  className?: string;
}