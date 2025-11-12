from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import Config

# Inicializa as extensões (sem app ainda)
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    """
    Função "Application Factory".
    Cria e configura a instância do aplicativo Flask.
    """
    
    app = Flask(__name__)
    
    # 1. Carrega a configuração a partir da classe Config
    app.config.from_object(config_class)

    # 2. Inicializa as extensões com a aplicação
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    jwt.init_app(app)
    bcrypt.init_app(app)

    # 3. Registrar Blueprints (Módulos de Rotas)
    
    # Rotas principais (ex: /api/status)
    from app.routes.main import bp as main_bp
    app.register_blueprint(main_bp)

    # Rotas do Módulo de Cadastros (ex: /api/cadastros/motoristas)
    from app.routes.cadastros import bp as cadastros_bp
    app.register_blueprint(cadastros_bp, url_prefix='/api/cadastros')

    # Rotas do Módulo de Autenticação (ex: /api/auth/login)
    from app.routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app

# Importa os modelos no final.
# Isso é crucial para evitar importações circulares com 'db'.
from app import models