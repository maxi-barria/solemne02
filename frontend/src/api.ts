import { getToken, clearToken } from "./auth";

const BASE_URL = "/api";

export async function apiGet<T = any>(path: string): Promise<T> {
  const token = getToken();

  // 🔒 Si no hay token, redirige al login antes de hacer la request
  if (!token) {
    clearToken();
    window.location.href = "/";
    throw new Error("No autorizado - token inexistente");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Accept": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    // 🔒 Token inválido o expirado
    clearToken();
    window.location.href = "/";
    throw new Error("Sesión expirada, inicia sesión nuevamente");
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
