from flask import Flask
from config import Config
# Importa as instâncias do novo arquivo
from .extensions import db, migrate, jwt, bcrypt, cors 

def create_app(config_class=Config):
    """
    Função "Application Factory".
    Cria e configura a instância do aplicativo Flask.
    """
    
    app = Flask(__name__)
    
    # 1. Carrega a configuração
    app.config.from_object(config_class)

    # 2. Inicializa as extensões com a aplicação
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # Inicializa o CORS com o padrão robusto que você já tinha
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # 3. Registrar Blueprints
    
    from app.routes.main import bp as main_bp
    app.register_blueprint(main_bp)

    from app.routes.cadastros import bp as cadastros_bp
    app.register_blueprint(cadastros_bp, url_prefix='/api/cadastros')

    from app.routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from app.routes.operacional import bp as operacional_bp
    app.register_blueprint(operacional_bp, url_prefix='/api/operacional')
    
    from app.routes.vendas import bp as vendas_bp
    app.register_blueprint(vendas_bp, url_prefix='/api/vendas')
    
    from app.routes.relatorios import bp as relatorios_bp
    app.register_blueprint(relatorios_bp, url_prefix='/api/relatorios')

    return app