import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (!newPass || !confirmPass) {
      setMsg("Ambas contraseñas son requeridas");
      return;
    }

    if (newPass !== confirmPass) {
      setMsg("Las contraseñas no coinciden");
      return;
    }
    console.log("Enviando reset", token, newPass)
    try {
      const res = await fetch(`/api/auth/reset-password?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("Contraseña cambiada correctamente. Ahora puedes iniciar sesión.");
      } else {
        setMsg(data.error || "Error al cambiar la contraseña");
      }
    } catch (err) {
      setMsg("Error de conexión con el servidor");
    }
  };

  return (
    <form className="max-w-sm mx-auto mt-24 space-y-3" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold">Restablecer Contraseña</h1>

      <input
        type="password"
        placeholder="Nueva contraseña"
        className="border p-2 w-full"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirmar contraseña"
        className="border p-2 w-full"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
      />

      <button className="bg-black text-white px-4 py-2 rounded w-full">
        Cambiar contraseña
      </button>

      {msg && <p className="text-center text-sm text-gray-700">{msg}</p>}
    </form>
  );
}
