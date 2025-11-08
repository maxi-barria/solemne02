import { useState } from 'react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const r = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email })
    });

    const j = await r.json();
    setMsg(j.message || j.error || 'Error');
  };

  return (
    <form className="max-w-sm mx-auto mt-24 space-y-3" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold">Recuperar Contraseña</h1>

      <input
        className="border p-2 w-full"
        placeholder="Tu email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <button className="bg-black text-white px-4 py-2 rounded w-full">Enviar enlace</button>

      {msg && <p className="text-center text-sm text-gray-700">{msg}</p>}
    </form>
  );
}
