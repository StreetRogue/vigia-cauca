import type { FormEvent } from "react";
import type { CredentialsFieldErrors } from "../../shared/types";

export interface CredentialFormCopy {
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  submitLabel: string;
}

export interface CredentialFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  fieldErrors?: CredentialsFieldErrors;
  copy: CredentialFormCopy;
  disabled?: boolean;
  isBusy?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPassword?: () => void;
  className?: string;
}