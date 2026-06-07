import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LoginPanel } from "../../components/organisms";
import { LoginTemplate } from "../../components/templates";
import type { CredentialsFieldErrors } from "../../components/shared";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Si ya hay sesión activa (o se restauró via refresh), ir al dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CredentialsFieldErrors>({
    email: undefined,
    password: undefined,
  });
  const [status, setStatus] = useState<"idle" | "error" | "submitting">("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    setStatus("submitting");
    try {
      await login(email, password);
      setStatus("idle");
      navigate("/dashboard");
    } catch (err) {
      setStatus("error");
      setFieldErrors({
        email: undefined,
        password: err instanceof Error ? err.message : "Credenciales inválidas",
      });
    }
  };

  return (
    <LoginTemplate
      panel={
        <LoginPanel
          email={email}
          password={password}
          showPassword={showPassword}
          status={status === "submitting" ? "submitting" : status === "error" ? "error" : "idle"}
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