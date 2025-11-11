import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import FormInput from "../components/auth/FormInput";
import ButtonPrimary from "../components/auth/ButtonPrimary";
import Alert from "../components/auth/Alert";
import SmallLink from "../components/auth/SmallLink";
import { getToken } from "../auth"; // ✅ usamos helper centralizado

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ✅ Solo se ejecuta una vez al montar
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Si ya está logeado, redirige al dashboard
      navigate("/dashboard", { replace: true });
    }
  }, []); // <-- sin dependencias, ejecuta solo una vez

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

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let j: any = null;
      try {
        j = await r.json();
      } catch {
        j = { error: r.statusText || `Error ${r.status}` };
      }

      if (r.ok && j?.access_token) {
        // ✅ Guarda token con nombre consistente
        localStorage.setItem("access_token", j.access_token);
        alert("¡Inicio de sesión exitoso!");
        navigate("/dashboard");
      } else {
        if (r.status === 401)
          setServerError("Credenciales inválidas. Verifica tu email y contraseña.");
        else setServerError(j?.error || `Error ${r.status}`);
      }
    } catch (error: any) {
      setServerError(error.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Ingresa a tu cuenta para continuar">
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
          <SmallLink to="/forgot-password">¿Olvidaste tu contraseña?</SmallLink>
        </div>

        <ButtonPrimary type="submit" isLoading={isLoading}>
          Entrar
        </ButtonPrimary>

        <div className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta? <SmallLink to="/register">Regístrate aquí</SmallLink>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
