import os

# Define o diretório base do projeto
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    """
    Configurações da aplicação.
    """
    
    # Chave secreta para segurança (usada para sessões, CSRF, etc.)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'minha-chave-secreta-gestao-transportes'
    
    # Configuração do Banco de Dados (padrão SQLite)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'gestao_transportes.db')
    
    # Desativa o rastreamento de modificações do SQLAlchemy (melhora performance)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuração do JWT (para os tokens de login)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'minha-chave-secreta-jwt'