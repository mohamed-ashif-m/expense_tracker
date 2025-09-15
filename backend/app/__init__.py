from flask import Flask
from .config import Config
from .extensions import db, migrate, ma, jwt
from .routes.auth import auth_bp
from .routes.expenses import expenses_bp
from .routes.categories import categories_bp
from .routes.reports import reports_bp
from flask_cors import CORS

def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)
    CORS(app, origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:8081"], supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(expenses_bp, url_prefix="/expenses")
    app.register_blueprint(categories_bp, url_prefix="/categories")
    app.register_blueprint(reports_bp, url_prefix="/reports")

    return app
