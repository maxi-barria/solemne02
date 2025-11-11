import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import FormInput from "@/components/auth/FormInput";
import ButtonPrimary from "@/components/auth/ButtonPrimary";
import Alert from "@/components/auth/Alert";
import SmallLink from "@/components/auth/SmallLink";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

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
      // In production, this would call your edge function to send recovery email
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock success response
      setEmailSent(true);
      setSuccessMessage(
        `Hemos enviado un enlace de recuperación a ${email}. Por favor, revisa tu bandeja de entrada y tu carpeta de spam.`
      );
      toast.success("Email de recuperación enviado");
    } catch (error: any) {
      // Handle different HTTP error codes
      if (error.status === 404) {
        setServerError("No existe una cuenta con este email.");
      } else if (error.status === 429) {
        setServerError("Demasiados intentos. Por favor, intenta más tarde.");
      } else if (error.status === 400) {
        setServerError(error.message || "Email inválido.");
      } else if (error.status === 500) {
        setServerError("Error del servidor. Por favor, intenta más tarde.");
      } else {
        setServerError(
          error.message ||
            "Error al enviar el email. Por favor, intenta nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setSuccessMessage("");
    handleSubmit(new Event("submit") as any);
  };

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
    >
      {serverError && (
        <Alert variant="error" onClose={() => setServerError("")}>
          {serverError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Email enviado</p>
                <p className="text-sm opacity-90">{successMessage}</p>
              </div>
            </div>
          </div>
        </Alert>
      )}

      {!emailSent ? (
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

          <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm text-muted-foreground">
            <p>
              Ingresa tu dirección de email y te enviaremos un enlace para
              restablecer tu contraseña.
            </p>
          </div>

          <ButtonPrimary type="submit" isLoading={isLoading}>
            Enviar Enlace de Recuperación
          </ButtonPrimary>

          <div className="flex items-center justify-center gap-2 text-sm">
            <SmallLink to="/" className="flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al inicio de sesión
            </SmallLink>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="text-center space-y-4">
            <div className="bg-success/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-success" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Si no recibes el email en unos minutos, revisa tu carpeta de
                spam o intenta nuevamente.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <ButtonPrimary
              onClick={handleResendEmail}
              isLoading={isLoading}
              variant="secondary"
            >
              Reenviar Email
            </ButtonPrimary>

            <ButtonPrimary
              onClick={() => navigate("/")}
              variant="secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio de Sesión
            </ButtonPrimary>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
