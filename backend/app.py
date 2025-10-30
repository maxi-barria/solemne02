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

app = Flask(__name__)
CORS(app)

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

@app.post("/api/auth/register")
def register():
    data = request.get_json()
    email = data.get("email","").strip().lower()
    password = data.get("password","")
    if not email or not password: return jsonify({"error":"datos inválidos"}), 400
    ph = bcrypt.hash(password)
    try:
        with pg.cursor() as cur:
            cur.execute("INSERT INTO users(email,password_hash) VALUES(%s,%s) RETURNING id;", (email, ph))
            uid = cur.fetchone()["id"]
        return {"id": uid, "email": email}, 201
    except Exception as e:
        return jsonify({"error": "email ya registrado"}), 409

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
    token = create_access_token(identity={"id": user["id"], "email": user["email"]})
    return {"access_token": token}

@app.get("/api/dashboard/metrics")
@jwt_required()
def get_metrics():
    out = list(metrics.find({}, {"_id": 0}))
    return {"metrics": out}

@app.post("/api/auth/forgot-password")
def forgot_password():
    data = request.get_json()
    email = data.get("email","").strip().lower()
    token = s.dumps(email)
    # Enviar correo "falso": en entorno dev bastaría con log o JSON (MailHog lo verás al integrar real SMTP)
    reset_link = f"http://localhost/reset?token={token}"
    return {"message": "enviado", "debug_reset_link": reset_link}

@app.post("/api/auth/reset-password")
def reset_password():
    token = request.args.get("token","")
    data = request.get_json()
    newpass = data.get("password","")
    try:
        email = s.loads(token, max_age=3600)
    except (BadSignature, SignatureExpired):
        return jsonify({"error":"token inválido o expirado"}), 400
    ph = bcrypt.hash(newpass)
    with pg.cursor() as cur:
        cur.execute("UPDATE users SET password_hash=%s WHERE email=%s;", (ph, email))
    return {"ok": True}
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
