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
from datetime import datetime, date
from flask_jwt_extended import get_jwt
from bson import ObjectId
from flask_jwt_extended import get_jwt_identity

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
        {"name": "Entrenamientos completados", "value": 24},
        {"name": "Horas totales de entrenamiento", "value": 18},
        {"name": "Promedio de calorías por sesión", "value": 420},
        {"name": "Racha activa (días)", "value": 6},
        {"name": "Sesiones de fuerza", "value": 14},
        {"name": "Sesiones de cardio", "value": 10}
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
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    with pg.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE email=%s;", (email,))
        user = cur.fetchone()

    if not user or not bcrypt.verify(password, user["password_hash"]):
        return jsonify({"error": "credenciales inválidas"}), 401

    # ✅ Fix: identity debe ser string, claims adicionales para email
    token = create_access_token(
        identity=str(user["id"]),
        additional_claims={"email": user["email"]}
    )

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


# ==== MÉTRICAS DE ENTRENAMIENTO (MongoDB) =====================================
from datetime import datetime, date
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt
from flask import jsonify, request, current_app 
# Colección (log de entrenamientos)
metrics_log = mdb.metrics_log

# Índices útiles
metrics_log.create_index([("user_id", 1), ("date", 1)])
metrics_log.create_index([("year", 1), ("month", 1)])


# ----------------------------- Helpers ----------------------------------------
def _parse_yyyy_mm_dd(d: str) -> datetime:
    """Normaliza a ‘fecha sin hora’ (00:00:00). Espera 'YYYY-MM-DD'."""
    try:
        return datetime.strptime(d, "%Y-%m-%d")
    except Exception:
        raise ValueError("fecha inválida (usa YYYY-MM-DD)")

def _get_user_from_jwt():
    """Devuelve (user_id:str|None, email:str|None) desde el JWT.
    create_access_token(identity={"id":..., "email":...}) → sub será un dict."""
    claims = get_jwt()
    sub = claims.get("sub")
    if isinstance(sub, dict):
        return (str(sub.get("id")) if sub.get("id") is not None else None,
                sub.get("email"))
    return (str(sub) if sub is not None else None, claims.get("email"))

def _safe_item_from_doc(d):
    """Convierte un doc de Mongo a item serializable; omite docs viejos/malformados."""
    try:
        _id = d.get("_id")
        if not _id:
            return None
        _id = str(_id)

        mtype = d.get("type")
        if not isinstance(mtype, str) or not mtype.strip():
            current_app.logger.warning("Doc sin 'type', omitido: %s", d)
            return None
        mtype = mtype.strip().capitalize()  # Cardio/Fuerza

        # hours → float
        try:
            hours = float(d.get("hours", 0))
        except Exception:
            current_app.logger.warning("Doc con 'hours' inválido, omitido: %s", d)
            return None

        # date → "YYYY-MM-DD"
        date_raw = d.get("date")
        if isinstance(date_raw, datetime):
            date_str = date_raw.strftime("%Y-%m-%d")
        elif isinstance(date_raw, str):
            try:
                if len(date_raw) == 10 and date_raw[4] == "-" and date_raw[7] == "-":
                    date_str = date_raw
                else:
                    dt = datetime.fromisoformat(date_raw.replace("Z", "+00:00"))
                    date_str = dt.strftime("%Y-%m-%d")
            except Exception:
                current_app.logger.warning("Doc con 'date' inválido, omitido: %s", d)
                return None
        else:
            current_app.logger.warning("Doc sin 'date' usable, omitido: %s", d)
            return None

        return {"_id": _id, "type": mtype, "hours": hours, "date": date_str}
    except Exception as e:
        current_app.logger.exception("Fallo serializando doc de métricas: %s", e)
        return None

# ----------------------------- Endpoints --------------------------------------

@app.post("/api/metrics")
@jwt_required()
def add_metric():
    user_id, email = _get_user_from_jwt()
    if not user_id:
        return jsonify({"error": "No se pudo identificar al usuario"}), 401

    data = request.get_json() or {}
    m_type = str(data.get("type", "")).strip().capitalize()  # Cardio/Fuerza
    hours  = data.get("hours", None)
    date_str = (data.get("date") or "").strip()

    if m_type not in ["Cardio", "Fuerza"]:
        return jsonify({"error": "El tipo debe ser 'Cardio' o 'Fuerza'"}), 400

    try:
        hours = float(hours)
    except Exception:
        return jsonify({"error": "Horas debe ser numérico"}), 400

    if not date_str:
        dt = datetime.combine(date.today(), datetime.min.time())
    else:
        try:
            dt = _parse_yyyy_mm_dd(date_str)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    doc = {
        "user_id": user_id,
        "email": email,
        "type": m_type,
        "hours": hours,
        "date": dt,
        "year": dt.year,
        "month": dt.month,
        "week": dt.isocalendar().week,
        "created_at": datetime.utcnow(),
    }
    metrics_log.insert_one(doc)
    return {"ok": True, "message": "Entrenamiento registrado"}, 201


@app.get("/api/metrics")
@jwt_required()
def list_metrics():
    user_id, _ = _get_user_from_jwt()
    if not user_id:
        return jsonify({"items": []})


    cur = metrics_log.find({"user_id": user_id}).sort([("date", -1)])

    out = []
    for d in cur:
        item = _safe_item_from_doc(d)
        if item:
            out.append(item)
    return {"items": out}


@app.get("/api/metrics/summary-current-month")
@jwt_required()
def summary_current_month():
    user_id, _ = _get_user_from_jwt()
    if not user_id:
        return jsonify({"month": {"year": 0, "month": 0, "summary": []},
                        "week":  {"year": 0, "week": 0, "summary": []}})

    today = date.today()
    y, m = today.year, today.month
    current_week = today.isocalendar().week

    monthly_pipeline = [
        {"$match": {"user_id": user_id, "year": y, "month": m}},
        {"$group": {"_id": "$type", "total_hours": {"$sum": "$hours"}}},
        {"$sort": {"_id": 1}},
    ]
    weekly_pipeline = [
        {"$match": {"user_id": user_id, "year": y, "week": current_week}},
        {"$group": {"_id": "$type", "total_hours": {"$sum": "$hours"}}},
        {"$sort": {"_id": 1}},
    ]

    monthly = list(metrics_log.aggregate(monthly_pipeline))
    weekly  = list(metrics_log.aggregate(weekly_pipeline))

    out_monthly = [{"type": r["_id"], "hours": r["total_hours"]} for r in monthly]
    out_weekly  = [{"type": r["_id"], "hours": r["total_hours"]} for r in weekly]

    return {
        "month": {"year": y, "month": m, "summary": out_monthly},
        "week":  {"year": y, "week": current_week, "summary": out_weekly},
    }


@app.put("/api/metrics/<metric_id>")
@jwt_required()
def update_metric(metric_id):
    user_id, _ = _get_user_from_jwt()
    if not user_id:
        return jsonify({"error": "No se pudo identificar al usuario"}), 401

    data = request.get_json() or {}
    mtype    = str(data.get("type", "")).strip().capitalize()
    hours_in = data.get("hours", None)
    date_str = (data.get("date") or "").strip()

    if mtype not in ["Cardio", "Fuerza"]:
        return jsonify({"error": "El tipo debe ser 'Cardio' o 'Fuerza'"}), 400
    try:
        hours = float(hours_in)
    except Exception:
        return jsonify({"error": "Horas debe ser numérico"}), 400
    try:
        dt = _parse_yyyy_mm_dd(date_str)
    except Exception:
        return jsonify({"error": "fecha inválida (YYYY-MM-DD)"}), 400

    res = metrics_log.update_one(
        {"_id": ObjectId(metric_id), "user_id": user_id},
        {"$set": {
            "type": mtype,
            "hours": hours,
            "date": dt,
            "year": dt.year,
            "month": dt.month,
            "week": dt.isocalendar().week,
        }}
    )
    if res.matched_count == 0:
        return jsonify({"error": "Métrica no encontrada"}), 404
    return {"ok": True}


@app.delete("/api/metrics/<metric_id>")
@jwt_required()
def delete_metric(metric_id):
    user_id, _ = _get_user_from_jwt()
    if not user_id:
        return jsonify({"error": "No se pudo identificar al usuario"}), 401

    res = metrics_log.delete_one({"_id": ObjectId(metric_id), "user_id": user_id})
    if res.deleted_count == 0:
        return jsonify({"error": "Métrica no encontrada"}), 404
    return {"ok": True}

from datetime import datetime, date
from flask_jwt_extended import jwt_required
from flask import request, jsonify

@app.get("/api/metrics/summary-by-month")
@jwt_required()
def summary_by_month():
    """Totales por mes (últimos N meses) separados por tipo (solo docs válidos)."""
    user_id, _ = _get_user_from_jwt()
    if not user_id:
        return jsonify({"months": []})

    try:
        limit = int(request.args.get("limit", 6))
    except Exception:
        limit = 6
    limit = max(1, min(limit, 24))

    # Filtra SOLO documentos con schema correcto: type y hours presentes
    pipeline = [
        {"$match": {
            "user_id": user_id,
            "type": {"$exists": True, "$ne": None},
            "hours": {"$exists": True}
        }},
        {"$group": {
            "_id": {"year": "$year", "month": "$month", "type": "$type"},
            "total_hours": {"$sum": "$hours"}
        }},
        {"$group": {
            "_id": {"year": "$_id.year", "month": "$_id.month"},
            "by_type": {"$push": {"type": "$_id.type", "hours": "$total_hours"}}
        }},
        {"$sort": {"_id.year": -1, "_id.month": -1}},
        {"$limit": limit}
    ]

    rows = list(metrics_log.aggregate(pipeline))

    out = []
    for r in rows:
        y = r["_id"]["year"]
        m = r["_id"]["month"]
        entry = {"year": y, "month": m, "summary": []}
        for t in r.get("by_type", []):
            # Tolerante por si algún doc trae type nulo o raro
            t_type = t.get("type") or "Desconocido"
            try:
                t_hours = float(t.get("hours", 0))
            except Exception:
                t_hours = 0.0
            entry["summary"].append({"type": t_type, "hours": t_hours})
        out.append(entry)

    return {"months": out}


if __name__ == "__main__":
    # importante: host 0.0.0.0 para que sea accesible desde otros contenedores (nginx)
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=False)
