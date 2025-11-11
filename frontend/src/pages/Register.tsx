import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import FormInput from "../components/auth/FormInput";
import ButtonPrimary from "../components/auth/ButtonPrimary";
import SmallLink from "../components/auth/SmallLink";
import { ArrowLeft } from "../components/icons";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password) return "Email y contraseña son requeridos";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Email inválido";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (password.length > 72) return "La contraseña supera los 72 caracteres permitidos";
    if (password !== password2) return "Las contraseñas no coinciden";
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let j: any = null;
      try { j = await r.json(); } catch { j = { error: r.statusText || `Error ${r.status}` }; }

      if (r.status === 201) {
        // Registered OK; redirect to login
        alert('Registro exitoso. Puedes iniciar sesión.');
        navigate('/');
      } else {
        setError(j?.error || `Error ${r.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Regístrate y comienza a usar la app">
      <div className="mb-2">
        <SmallLink to="/">
          <ArrowLeft className="h-4 w-4 mr-2 inline" /> Ya tengo una cuenta
        </SmallLink>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput label="Email" type="email" name="email" placeholder="correo@ejemplo.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setEmail(e.target.value)} required />
        <FormInput label="Contraseña" type="password" name="password" placeholder="••••••" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)} required showPasswordToggle />
        <FormInput label="Confirmar contraseña" type="password" name="password2" placeholder="••••••" value={password2} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPassword2(e.target.value)} required showPasswordToggle />
        {error && <div className="text-destructive text-sm">{error}</div>}
        <ButtonPrimary type="submit" isLoading={loading}>Registrarse</ButtonPrimary>
      </form>
    </AuthLayout>
  );
};

export default Register;
