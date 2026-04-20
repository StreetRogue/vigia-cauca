import { useState } from "react";
import type { FormEvent } from "react";
import { LoginPanel } from "../../components/organisms";
import { LoginTemplate } from "../../components/templates";
import type { CredentialsFieldErrors } from "../../components/shared";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CredentialsFieldErrors>({
    email: undefined,
    password: undefined,
  });
  const [status, setStatus] = useState<"idle" | "error">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: CredentialsFieldErrors = {
      email: email.trim() ? undefined : "[ ! ] Este campo es obligatorio",
      password: password.trim() ? undefined : "[ ! ] Este campo es obligatorio",
    };

    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      setStatus("error");
      return;
    }

    setStatus("idle");
  };

  return (
    <LoginTemplate
      panel={
        <LoginPanel
          email={email}
          password={password}
          showPassword={showPassword}
          status={status}
          fieldErrors={fieldErrors}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onTogglePassword={() => setShowPassword((currentValue) => !currentValue)}
          onSubmit={handleSubmit}
        />
      }
    />
  );
}