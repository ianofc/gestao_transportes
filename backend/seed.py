# Importa o create_app de 'app' e o 'db' de 'extensions'
from app import create_app
from app.extensions import db
from app.models import Usuario

def create_admin_user():
    """
    Cria um usuário 'admin' padrão se ele não existir.
    """
    print("A iniciar o script 'seed'...")
    
    app = create_app()
    with app.app_context():
        
        if Usuario.query.filter_by(usuario='admin').first():
            print("Usuário 'admin' já existe. Nada a fazer.")
            return

        print("A criar usuário 'admin'...")
        admin_user = Usuario(
            nome_completo="Administrador Padrão",
            usuario="admin",
            nivel_acesso="admin"
        )
        
        admin_user.set_password("123")
        
        db.session.add(admin_user)
        db.session.commit()
        
        print("Usuário 'admin' com senha '123' criado com sucesso!")

if __name__ == '__main__':
    create_admin_user()