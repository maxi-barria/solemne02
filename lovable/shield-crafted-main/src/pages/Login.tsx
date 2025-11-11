import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import FormInput from "@/components/auth/FormInput";
import ButtonPrimary from "@/components/auth/ButtonPrimary";
import Alert from "@/components/auth/Alert";
import SmallLink from "@/components/auth/SmallLink";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulated API call - replace with actual backend call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response - replace with actual API response
      const mockToken = "mock-jwt-token-" + Date.now();
      localStorage.setItem("token", mockToken);

      toast.success("¡Inicio de sesión exitoso!");
      navigate("/dashboard");
    } catch (error: any) {
      // Handle different HTTP error codes
      if (error.status === 401) {
        setServerError("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
      } else if (error.status === 400) {
        setServerError("Datos de inicio de sesión inválidos.");
      } else if (error.status === 500) {
        setServerError("Error del servidor. Por favor, intenta más tarde.");
      } else {
        setServerError(error.message || "Error al iniciar sesión. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Ingresa a tu cuenta para continuar"
    >
      {serverError && (
        <Alert variant="error" onClose={() => setServerError("")}>
          {serverError}
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          showPasswordToggle
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <SmallLink to="/forgot-password">
            ¿Olvidaste tu contraseña?
          </SmallLink>
        </div>

        <ButtonPrimary type="submit" isLoading={isLoading}>
          Entrar
        </ButtonPrimary>

        <div className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <SmallLink to="/register">Regístrate aquí</SmallLink>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
