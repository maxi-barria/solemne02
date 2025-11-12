import { getToken, clearToken } from "./auth";

const BASE_URL = "/api";

/**
 * Realiza una petición GET autenticada.
 */
export async function apiGet<T = any>(path: string): Promise<T> {
  const token = getToken();

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

/**
 * Realiza una petición POST autenticada con JSON.
 */
export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const token = getToken();

  if (!token) {
    clearToken();
    window.location.href = "/";
    throw new Error("No autorizado - token inexistente");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
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
export async function apiPut<T = any>(path: string, body: any): Promise<T> {
  const token = getToken();
  if (!token) { clearToken(); window.location.href = "/"; throw new Error("No autorizado - token inexistente"); }

  const res = await fetch(`/api${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) { clearToken(); window.location.href = "/"; throw new Error("Sesión expirada"); }
  if (!res.ok) { throw new Error(await res.text()); }
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const token = getToken();
  if (!token) { clearToken(); window.location.href = "/"; throw new Error("No autorizado - token inexistente"); }

  const res = await fetch(`/api${path}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) { clearToken(); window.location.href = "/"; throw new Error("Sesión expirada"); }
  if (!res.ok) { throw new Error(await res.text()); }
  return res.json();
}

/**
 * (Opcional) PUT o DELETE para futuras ampliaciones:
 */

// export async function apiPut<T = any>(path: string, body: any): Promise<T> { ... }
// export async function apiDelete<T = any>(path: string): Promise<T> { ... }
