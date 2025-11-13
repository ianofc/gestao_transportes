from app import create_app, db
from app.models import Usuario

# Este script usa o mesmo contexto da sua aplicação
# para interagir diretamente com a base de dados.

def create_admin_user():
    """
    Cria um usuário 'admin' padrão se ele não existir.
    """
    print("A iniciar o script 'seed'...")
    
    # Cria a aplicação e o seu contexto
    app = create_app()
    with app.app_context():
        
        # 1. Verifica se o usuário 'admin' já existe
        if Usuario.query.filter_by(usuario='admin').first():
            print("Usuário 'admin' já existe. Nada a fazer.")
            return

        # 2. Se não existir, cria um novo
        print("A criar usuário 'admin'...")
        admin_user = Usuario(
            nome_completo="Administrador Padrão",
            usuario="admin",
            nivel_acesso="admin"
        )
        
        # 3. Define a senha (o hash é feito automaticamente)
        admin_user.set_password("123")
        
        # 4. Adiciona ao banco de dados
        db.session.add(admin_user)
        db.session.commit()
        
        print("Usuário 'admin' com senha '123' criado com sucesso!")

if __name__ == '__main__':
    create_admin_user()

