// src/auth.ts

export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setToken(t: string) {
  localStorage.setItem("access_token", t);
}

export function clearToken() {
  localStorage.removeItem("access_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Decodifica un JWT (Base64URL) y retorna el payload como objeto */
function parseJwt(token: string): any {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  // Base64URL → Base64
  let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  // Padding
  const pad = payload.length % 4;
  if (pad === 2) payload += "==";
  else if (pad === 3) payload += "=";

  try {
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Devuelve el email guardado como claim adicional en el token (si existe) */
export function getUserEmailFromToken(): string | null {
  const t = getToken();
  if (!t) return null;
  const p = parseJwt(t);
  // En tu backend, el email se envía en additional_claims: {"email": "..."}
  return p?.email ?? null;
}

/** Devuelve el id de usuario (sub) como string (o null si no existe) */
export function getUserIdFromToken(): string | null {
  const t = getToken();
  if (!t) return null;
  const p = parseJwt(t);
  // Flask-JWT-Extended guarda identity en el claim "sub"
  return p?.sub ?? null;
}
