from app import create_app, db
from app.models import Usuario, Motorista, Onibus, Rota, Viagem, RegistroOperacional, Venda, CaixaDiario

# Cria a aplicação usando a "factory"
app = create_app()

@app.shell_context_processor
def make_shell_context():
    """
    Facilita o teste no terminal com 'flask shell'.
    Disponibiliza o 'db' e os modelos automaticamente.
    """
    return {
        'db': db,
        'Usuario': Usuario,
        'Motorista': Motorista,
        'Onibus': Onibus,
        'Rota': Rota,
        'Viagem': Viagem,
        'RegistroOperacional': RegistroOperacional,
        'Venda': Venda,
        'CaixaDiario': CaixaDiario
    }

if __name__ == '__main__':
    # Usamos o app.app_context() para garantir que o banco
    # de dados seja criado no contexto correto da aplicação.
    with app.app_context():
        # Cria as tabelas do banco de dados (se não existirem)
        db.create_all()
        
    # Executa o servidor
    app.run(debug=True, port=5000)