# 📘 Documentación de Pruebas - Solemne 2

## 📄 Descripción general
Este documento contiene la colección de pruebas realizadas sobre los módulos principales del sistema, utilizando **Postman** como herramienta de validación.  
Las pruebas verifican el correcto funcionamiento de los endpoints relacionados con autenticación y métricas.

---

## 🛠️ Entorno de pruebas
- **Backend:** Node.js (Express)
- **Frontend:** React + Vite
- **Base de datos:** MongoDB (Docker)
- **Herramienta de prueba:** Postman
- **Modo de ejecución:** `docker compose up -d`

---

## 🔍 Casos de prueba

### 1️⃣ Registro de usuario (`/register`)
**Método:** `POST`  
**URL:** `http://localhost/api/auth/register`
**Headers (Authorization):**
{
  content-type: application/json
}

**Body (JSON):**
```json
{
  "email": "usuario1@example4.com",
  "password": "clave1234"
}
```
**Respuesta esperada:**
codigo 201 Created
**mensaje:** Usuario registrado correctamente
Usuario creado y almacendado en la base de datos.

**Resultado obtenido:**
codigo 201 Created

**Evidencia:**
![Register](./images/register.png)

**Registro Duplicado**
**Método:** `POST`  
**URL:** `http://localhost/api/auth/register`
**Headers (Authorization):**
{
  content-type: application/json
}
**Body (JSON):**
```json
{
  "email": "usuario1@example4.com",
  "password": "clave1234"
  }
```
**Respuesta esperada:**
Código 409 Conflict
**Mensaje:** El usuario ya existe.

**Resultado obtenido:**
Código 409 Conflict  
**Mensaje:** El usuario ya existe.
**Evidencia:**
![Conflict](./images/register2.png)



### 2️⃣ Inicio de sesión (`/login`)
**Método:** `POST`  
**URL:** `http://localhost/api/auth/login`
**Headers (Authorization):**
{
  content-type: application/json
}
**Body (JSON):**
```json
{
  "email": "usuario1@example4.com",
  "password": "clave1234"
}
```
**Respuesta esperada:**
Código 200 OK
creacion del token
**mensaje:** Inicio de sesión exitoso

**Resultado obtenido:**
Código 200 OK
**mensaje:** Inicio de sesión exitoso
**Evidencia:**
![Login](./images/login.png)

**Credenciales incorrectas**
**Método:** `POST`  
**URL:** `http://localhost/api/auth/login`
**Headers (Authorization):**
{
  content-type: application/json
}
**Body (JSON):**
```json
{
  "email": "usuario1@example4.com",
  "password": "mala clave123"
}

```
**Respuesta esperada:**
Código 401 Unauthorized
**mensaje:**Credenciales invalidas

**Resultado obtenido:**
Código 401 Unauthorized  
**Mensaje:** Credenciales invalidas
**Evidencia:**
![Login](./images/login2.png)

### 3️⃣ Obtener métricas (`/metrics`)
**Método:** `GET`  
**URL:** `http://localhost/api/dashboard/metrics`
**Headers (Authorization):**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2MjY1NzAxOSwianRpIjoiMGZiYjZjMTItNGJmOS00ZjRiLTk3N2UtMjEwNDVlYTAxMTVlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjkiLCJuYmYiOjE3NjI2NTcwMTksImNzcmYiOiJkMjFiZDMxZi0zOThhLTRiZjAtODA5Yy1mMDQ2OWMwMTRiMjciLCJleHAiOjE3NjI2Nzg2MTksImVtYWlsIjoidXN1YXJpbzFAZXhhbXBsZTQuY29tIn0.r4sE63WqjZorpOeheBk2mlBr0mwyNtQc2mxFGRao4pg"
}
```
**respuesta esperada**
Código 200 OK

**Resultado obtenido:**
Código 200 OK
**Evidencia:**
![Metrics](./images/metrics.png)

**Metrica sin token**
**metodo**
**URL:** `http://localhost/api/dashboard/metrics`
**Headers (Authorization):**
```json
{
  "Authorization": ""
}
```
**respuesta esperada**
Código 401 Unauthorized

**Resultado obtenido:**
Código 401 Unauthorized
**Evidencia:**
![Metrics](./images/metrics2.png)

### 4️⃣  Forgot password (`/forgot-password`)
**Método:** `POST`  
**URL:** `http://localhost/api/auth/forgot-password`

**Body (JSON):**
```json
{
  "email": "usuario1@example3.com"
}
```
**Respuesta esperada:**
Código 200 OK
**mensaje:**"correo enviado correctamente"

**Resultado obtenido:**
Código 200 OK
**mensaje:**"correo enviado correctamente"
Evidencia:
![Forgot](./images/forgot.png)
![Forgot](./images/mailhog.png)

### 5️⃣ Reset password (`/reset-password/:token`)
**Método:** `POST`  
**URL:** `http://localhost/api/auth/reset-password?token=InVzdWFyaW8xQGV4YW1wbGU0LmNvbSI.aRAD-w.iqaIl0z0CNpqOJOx2lwxOMvntyg`
**Headers (Authorization):**
{
  "content-type": "application/json"
}
**Body (JSON):**
```json

{
  "password": "nuevaclave123"
}
```
**Respuesta esperada:**
Código 200 OK
**mensaje:** "Contraseña cambiada y correo de confirmación enviado"
**Resultado obtenido:**
Código 200 OK
**mensaje:** "Contraseña cambiada y correo de confirmación enviado"
**Evidencia:**
![Reset](./images/reset_password.png)
![Reset](./images/reestablecer.png)

**Token invalido**
**respuesta esperada**
Código 400 Bad Request
mensaje: token invalido
**Resultado obtenido:**
Código 400 Bad Request
mensaje: token invalido
**Evidencia:**
![Reset](./images/reset_password2.png)

## ✅ Conclusiones
Todos los endpoints probados responden correctamente según los casos de uso definidos.  
Las validaciones de errores funcionan como se esperaba (conflicto de usuario, token inválido, falta de autorización, etc.).  
No se detectaron errores en las rutas implementadas.
