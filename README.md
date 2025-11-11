![alt text](image.png)

## Auth Frontend (Login / Register)

This project includes a minimal React + Vite frontend. The following describes the authentication flow implemented in the frontend:

- Login (`/`): posts to `POST /api/auth/login`, stores `access_token` in `localStorage` under key `token` and redirects to `/dashboard` on success.
- Register (`/register`): posts to `POST /api/auth/register`. On successful registration the user is redirected to the login page.
- Protected route: `/dashboard` is protected by a small guard which checks for `localStorage.token`. If missing, it redirects to `/` (login).

How to test locally:

1. Start backend and databases (recommended via Docker Compose):

```powershell
docker compose up --build
```

2. Start frontend in dev mode (or open the app served by nginx after Docker Compose build):

```powershell
cd frontend
npm ci
$Env:VITE_API_URL = "http://localhost:5000/api"
npm run dev
```

3. Open http://localhost:5173 (Vite) or http://localhost (nginx) and use the Register and Login screens.

Notes:
- JWT is persisted in `localStorage` (key `token`). Protect this storage in production and consider httpOnly cookies for sensitive apps.
- Backend endpoints used: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/dashboard/metrics` (requires `Authorization: Bearer <token>`).
# Pasos para instalar 
    1. Clona la rama
    2. En git bash escribe:
        1.docker-compose down -v
        2. npm ci
        3. npm run build
        4. docker-compose up --build
    3. En una terminal aparte de git entra el directorio frontend y tipea:
        1. npm run dev
        2. Ve a tu navegador y busca localhost:5173
        



![alt text](image.png)
