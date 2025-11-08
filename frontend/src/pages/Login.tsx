import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ email, password })
    });

    const j = await r.json();
    if (j.access_token) {
      localStorage.setItem("token", j.access_token);
      navigate("/dashboard");
    } else {
      alert(j.error ?? "Error");
    }
  };

  return (
    <form className="max-w-sm mx-auto mt-24 space-y-3" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>

      <input
        className="border p-2 w-full"
        placeholder="email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        type="password"
        placeholder="password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
      />

      <button className="bg-black text-white px-4 py-2 rounded w-full">
        Entrar
      </button>

      <div className="text-center">
        <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  );
}
