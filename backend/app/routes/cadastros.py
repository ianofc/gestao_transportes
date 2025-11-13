from flask import Blueprint, jsonify, request
from app import db
from app.models import Motorista, Onibus, Rota

# Cria um "Módulo" (Blueprint) chamado 'cadastros'
bp = Blueprint('cadastros', __name__)

# --- API CRUD: Motoristas ---

@bp.route('/motoristas', methods=['POST'])
def create_motorista():
    """ Cria um novo motorista """
    data = request.get_json()
    if not data or not 'nome_completo' in data:
        return jsonify({'error': 'Dados incompletos'}), 400
    
    novo_motorista = Motorista(
        nome_completo=data['nome_completo'],
        cpf=data.get('cpf'),
        contato=data.get('contato')
    )
    db.session.add(novo_motorista)
    db.session.commit()
    return jsonify(novo_motorista.to_dict()), 201

@bp.route('/motoristas', methods=['GET'])
def get_motoristas():
    """ Lista todos os motoristas """
    motoristas = Motorista.query.all()
    return jsonify([m.to_dict() for m in motoristas]), 200

@bp.route('/motoristas/<int:id>', methods=['GET'])
def get_motorista(id):
    """ Busca um motorista específico por ID """
    motorista = Motorista.query.get_or_404(id)
    return jsonify(motorista.to_dict()), 200

@bp.route('/motoristas/<int:id>', methods=['PUT'])
def update_motorista(id):
    """ Atualiza um motorista """
    motorista = Motorista.query.get_or_404(id)
    data = request.get_json()
    
    motorista.nome_completo = data.get('nome_completo', motorista.nome_completo)
    motorista.cpf = data.get('cpf', motorista.cpf)
    motorista.contato = data.get('contato', motorista.contato)
    
    db.session.commit()
    return jsonify(motorista.to_dict()), 200

@bp.route('/motoristas/<int:id>', methods=['DELETE'])
def delete_motorista(id):
    """ Deleta um motorista """
    motorista = Motorista.query.get_or_404(id)
    db.session.delete(motorista)
    db.session.commit()
    return jsonify({'message': 'Motorista deletado'}), 200

# --- API CRUD: Ônibus ---

@bp.route('/onibus', methods=['POST'])
def create_onibus():
    """ Cria um novo ônibus """
    data = request.get_json()
    if not data or not 'numero_onibus' in data:
        return jsonify({'error': 'Número do ônibus é obrigatório'}), 400
    
    novo_onibus = Onibus(
        numero_onibus=data['numero_onibus'],
        placa=data.get('placa'),
        empresa_parceira=data.get('empresa_parceira', 'Guanabara'),
        capacidade=data.get('capacidade', 46)
    )
    db.session.add(novo_onibus)
    db.session.commit()
    return jsonify(novo_onibus.to_dict()), 201

@bp.route('/onibus', methods=['GET'])
def get_onibus_lista():
    """ Lista todos os ônibus """
    onibus_lista = Onibus.query.all()
    return jsonify([o.to_dict() for o in onibus_lista]), 200

@bp.route('/onibus/<int:id>', methods=['GET'])
def get_onibus(id):
    """ Busca um ônibus específico por ID """
    onibus = Onibus.query.get_or_404(id)
    return jsonify(onibus.to_dict()), 200

@bp.route('/onibus/<int:id>', methods=['PUT'])
def update_onibus(id):
    """ Atualiza um ônibus """
    onibus = Onibus.query.get_or_404(id)
    data = request.get_json()
    
    onibus.numero_onibus = data.get('numero_onibus', onibus.numero_onibus)
    onibus.placa = data.get('placa', onibus.placa)
    onibus.empresa_parceira = data.get('empresa_parceira', onibus.empresa_parceira)
    onibus.capacidade = data.get('capacidade', onibus.capacidade)
    
    db.session.commit()
    return jsonify(onibus.to_dict()), 200

@bp.route('/onibus/<int:id>', methods=['DELETE'])
def delete_onibus(id):
    """ Deleta um ônibus """
    onibus = Onibus.query.get_or_404(id)
    db.session.delete(onibus)
    db.session.commit()
    return jsonify({'message': 'Ônibus deletado'}), 200

# --- API CRUD: Rotas ---

@bp.route('/rotas', methods=['POST'])
def create_rota():
    """ Cria uma nova rota """
    data = request.get_json()
    if not data or not 'origem' in data or not 'destino' in data:
        return jsonify({'error': 'Origem e Destino são obrigatórios'}), 400
    
    nova_rota = Rota(
        origem=data['origem'],
        destino=data['destino'],
        tipo_rota=data.get('tipo_rota', 'Interestadual')
    )
    db.session.add(nova_rota)
    db.session.commit()
    return jsonify(nova_rota.to_dict()), 201

@bp.route('/rotas', methods=['GET'])
def get_rotas():
    """ Lista todas as rotas """
    rotas = Rota.query.all()
    return jsonify([r.to_dict() for r in rotas]), 200

@bp.route('/rotas/<int:id>', methods=['GET'])
def get_rota(id):
    """ Busca uma rota específica por ID """
    rota = Rota.query.get_or_404(id)
    return jsonify(rota.to_dict()), 200

@bp.route('/rotas/<int:id>', methods=['PUT'])
def update_rota(id):
    """ Atualiza uma rota """
    rota = Rota.query.get_or_404(id)
    data = request.get_json()
    
    rota.origem = data.get('origem', rota.origem)
    rota.destino = data.get('destino', rota.destino)
    rota.tipo_rota = data.get('tipo_rota', rota.tipo_rota)
    
    db.session.commit()
    return jsonify(rota.to_dict()), 200

@bp.route('/rotas/<int:id>', methods=['DELETE'])
def delete_rota(id):
    """ Deleta uma rota """
    rota = Rota.query.get_or_404(id)
    db.session.delete(rota)
    db.session.commit()
    return jsonify({'message': 'Rota deletada'}), 200