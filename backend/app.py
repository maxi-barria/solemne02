from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from passlib.hash import bcrypt
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from datetime import timedelta
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from pymongo import MongoClient
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_mail import Mail, Message



app = Flask(__name__)
CORS(app)


app.config["MAIL_SERVER"] = "mailhog"
app.config["MAIL_PORT"] = 1025
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = False
app.config["MAIL_DEFAULT_SENDER"] = "noreply@miapp.com"

mail = Mail(app)


# Config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "dev")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=6)
jwt = JWTManager(app)
s = URLSafeTimedSerializer(app.config["JWT_SECRET_KEY"])

# Postgres
pg = psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=RealDictCursor)
pg.autocommit = True
with pg.cursor() as cur:
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    """)

# Mongo
mongo = MongoClient(os.getenv("MONGODB_URI"))
mdb = mongo.app
metrics = mdb.metrics
if metrics.count_documents({}) == 0:
    metrics.insert_many([
      {"name": "usuarios_totales", "value": 1},
      {"name": "ventas_hoy", "value": 0},
    ])

@app.get("/api/health")
def health():
    return {"ok": True}

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email o contraseña vacíos"}), 400

    # Truncar la contraseña a 72 caracteres
    if len(password) > 72:
        password = password[:72]

    ph = bcrypt.hash(password)  # hash seguro

    try:
        with pg.cursor() as cur:
            cur.execute(
                "INSERT INTO users(email,password_hash) VALUES (%s,%s) RETURNING id;",
                (email, ph)
            )
            uid = cur.fetchone()["id"]
        return {"id": uid, "email": email}, 201
    except Exception as e:
        return jsonify({"error": "Email ya registrado"}), 409



@app.post("/api/auth/login")
def login():
    data = request.get_json()
    email = data.get("email","").strip().lower()
    password = data.get("password","")
    with pg.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE email=%s;", (email,))
        user = cur.fetchone()
    if not user or not bcrypt.verify(password, user["password_hash"]):
        return jsonify({"error":"credenciales inválidas"}), 401
    # JWT 'sub' (identity) must be a string according to PyJWT; avoid passing a dict.
    # Use the user id (string) as identity and include the email as an additional claim.
    token = create_access_token(identity=str(user["id"]), additional_claims={"email": user["email"]})
    return {"access_token": token}

@app.get("/api/dashboard/metrics")
@jwt_required()
def get_metrics():
    out = list(metrics.find({}, {"_id": 0}))
    # Try to retrieve time-series data from a `series` collection if present.
    # If not present, return reasonable mock data so the frontend can render charts.
    series = {}
    try:
        if "series" in mdb.list_collection_names():
            sdocs = list(mdb.series.find({}, {"_id": 0}))
            # expect documents like { name: 'activity', data: [...] }
            for d in sdocs:
                name = d.get("name")
                data = d.get("data")
                if name and data is not None:
                    series[name] = data
        else:
            # fallback mock time-series
            series = {
                "activity": [
                    {"date": "Lun", "value": 45},
                    {"date": "Mar", "value": 52},
                    {"date": "Mié", "value": 48},
                    {"date": "Jue", "value": 61},
                    {"date": "Vie", "value": 55},
                    {"date": "Sáb", "value": 38},
                    {"date": "Dom", "value": 42},
                ],
                "revenue": [
                    {"mes": "Ene", "valor": 4200},
                    {"mes": "Feb", "valor": 3800},
                    {"mes": "Mar", "valor": 5100},
                    {"mes": "Abr", "valor": 4600},
                    {"mes": "May", "valor": 5400},
                    {"mes": "Jun", "valor": 6200},
                ],
            }
    except Exception:
        # If anything goes wrong, still return mock series so frontend remains functional.
        series = {
            "activity": [
                {"date": "Lun", "value": 45},
                {"date": "Mar", "value": 52},
                {"date": "Mié", "value": 48},
                {"date": "Jue", "value": 61},
                {"date": "Vie", "value": 55},
                {"date": "Sáb", "value": 38},
                {"date": "Dom", "value": 42},
            ],
            "revenue": [
                {"mes": "Ene", "valor": 4200},
                {"mes": "Feb", "valor": 3800},
                {"mes": "Mar", "valor": 5100},
                {"mes": "Abr", "valor": 4600},
                {"mes": "May", "valor": 5400},
                {"mes": "Jun", "valor": 6200},
            ],
        }

    return {"metrics": out, "series": series}

@app.post("/api/auth/forgot-password")
def forgot_password():
    data = request.get_json()
    email = data.get("email","").strip().lower()

    # Verificar si existe el usuario
    with pg.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE email=%s;", (email,))
        user = cur.fetchone()
    if not user:
        return jsonify({"error": "email no registrado"}), 404

    token = s.dumps(email)  # firmamos el email
    reset_link = f"http://localhost:5173/reset-password?token={token}"  # frontend

    # Enviar correo a MailHog
    msg = Message("Recupera tu contraseña", recipients=[email])
    msg.body = f"Hola!\n\nHaz clic para cambiar tu contraseña:\n{reset_link}\n\nSi no pediste esto, ignora este mensaje."
    mail.send(msg)

    return {"message": "Correo enviado correctamente"}


@app.post("/api/auth/reset-password")
def reset_password():
    token = request.args.get("token","")
    data = request.get_json()
    newpass = data.get("password","").strip()

    if not newpass:
        return jsonify({"error":"contraseña requerida"}), 400

    try:
        email = s.loads(token, max_age=3600)
    except SignatureExpired:
        return jsonify({"error":"token expirado"}), 400
    except BadSignature:
        return jsonify({"error":"token inválido"}), 400

    ph = bcrypt.hash(newpass)

    with pg.cursor() as cur:
        cur.execute("UPDATE users SET password_hash=%s WHERE email=%s;", (ph, email))

    # Enviar correo de confirmación
    msg = Message(
        "Confirmación de cambio de contraseña",
        recipients=[email]
    )
    msg.body = (
        f"Hola!\n\nTu contraseña ha sido cambiada correctamente.\n"
        "Si no realizaste este cambio, por favor contacta con soporte inmediatamente."
    )
    mail.send(msg)

    return {"ok": True, "message": "Contraseña cambiada y correo de confirmación enviado"}




if __name__ == "__main__":
    # importante: host 0.0.0.0 para que sea accesible desde otros contenedores (nginx)
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=False)
