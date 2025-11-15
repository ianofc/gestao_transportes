# Importa o create_app de 'app' (o __init__.py)
from app import create_app
# Importa o 'db' do novo 'extensions.py'
from app.extensions import db

app = create_app()

@app.shell_context_processor
def make_shell_context():
    """
    Facilita o teste no terminal com 'flask shell'.
    Disponibiliza o 'db' e os modelos automaticamente.
    """
    from app.models import (
        Usuario, Motorista, Onibus, Rota, Viagem, 
        RegistroOperacional, Venda, CaixaDiario
    )
    
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
    with app.app_context():
        # Cria as tabelas do banco de dados (se não existirem)
        db.create_all()
        
    # Executa o servidor
    app.run(debug=True, port=5002)