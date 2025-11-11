import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import FormInput from "../components/auth/FormInput";
import ButtonPrimary from "../components/auth/ButtonPrimary";
import SmallLink from "../components/auth/SmallLink";
import Alert from "../components/auth/Alert";
import { ArrowLeft, Mail } from "../components/icons";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email) return setError("Ingresa tu correo");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      let j: any = null;
      try { j = await res.json(); } catch { j = null; }
      if (res.ok) {
        setMessage('Si el correo existe en nuestro sistema recibirás un email con instrucciones.');
      } else {
        setError(j?.error || `Error ${res.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Te enviaremos un correo para restablecer tu contraseña">
      <div className="mb-2">
        <SmallLink to="/">
          <ArrowLeft className="h-4 w-4 mr-2 inline" /> Volver al inicio
        </SmallLink>
      </div>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={onSubmit} className="space-y-4">


        <FormInput label="Email" type="email" name="email" placeholder="correo@ejemplo.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setEmail(e.target.value)} required />

        <ButtonPrimary type="submit" isLoading={loading}>Enviar instrucciones</ButtonPrimary>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;

