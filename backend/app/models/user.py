from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    reset_token = db.Column(db.String(256), nullable=True)
    reset_token_exp = db.Column(db.DateTime, nullable=True)
