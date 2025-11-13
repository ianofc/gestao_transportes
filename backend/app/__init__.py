from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS # A importação continua
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import Config

# Inicializa as extensões (sem app ainda)
db = SQLAlchemy()
migrate = Migrate()
# A linha 'cors = CORS()' foi REMOVIDA daqui
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
    
    # CORREÇÃO: Inicializa o CORS diretamente na 'app'
    # Isto é mais robusto que o método 'cors.init_app()'
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
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
    
    # Rotas do Módulo Operacional
    from app.routes.operacional import bp as operacional_bp
    app.register_blueprint(operacional_bp, url_prefix='/api/operacional')
    
    # Rotas do Módulo de Vendas
    from app.routes.vendas import bp as vendas_bp
    app.register_blueprint(vendas_bp, url_prefix='/api/vendas')
    
    # NOVO REGISTO (Relatórios)
    from app.routes.relatorios import bp as relatorios_bp
    app.register_blueprint(relatorios_bp, url_prefix='/api/relatorios')

    return app