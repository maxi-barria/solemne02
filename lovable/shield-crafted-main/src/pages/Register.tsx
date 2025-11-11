import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import FormInput from "@/components/auth/FormInput";
import ButtonPrimary from "@/components/auth/ButtonPrimary";
import Alert from "@/components/auth/Alert";
import SmallLink from "@/components/auth/SmallLink";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Formato de email inválido";
    }

    // Password validation
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (password.length > 72) {
      newErrors.password = "La contraseña no puede exceder 72 caracteres";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar tu contraseña";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulated API call - replace with actual backend call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock success response
      setSuccessMessage("¡Registro exitoso! Redirigiendo al inicio de sesión...");
      toast.success("¡Cuenta creada exitosamente!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      // Handle different HTTP error codes
      if (error.status === 409) {
        setServerError("Este email ya está registrado. Por favor, inicia sesión.");
      } else if (error.status === 400) {
        setServerError(error.message || "Datos de registro inválidos.");
      } else if (error.status === 500) {
        setServerError("Error del servidor. Por favor, intenta más tarde.");
      } else {
        setServerError(error.message || "Error al crear la cuenta. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="Regístrate para comenzar"
    >
      {serverError && (
        <Alert variant="error" onClose={() => setServerError("")}>
          {serverError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          name="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          autoFocus
          autoComplete="email"
        />

        <FormInput
          label="Contraseña"
          type="password"
          name="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          showPasswordToggle
          autoComplete="new-password"
        />

        <FormInput
          label="Confirmar Contraseña"
          type="password"
          name="confirmPassword"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
          showPasswordToggle
          autoComplete="new-password"
        />

        <ButtonPrimary type="submit" isLoading={isLoading}>
          Registrarse
        </ButtonPrimary>

        <div className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <SmallLink to="/">Inicia sesión aquí</SmallLink>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
