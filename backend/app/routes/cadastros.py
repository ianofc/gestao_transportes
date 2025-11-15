from flask import Blueprint, jsonify, request
from app.extensions import db 
from app.models import Motorista, Onibus, Rota
from sqlalchemy.exc import IntegrityError
# Importa o decorator de login
from flask_jwt_extended import jwt_required

bp = Blueprint('cadastros', __name__)

# --- API CRUD: Motoristas ---

@bp.route('/motoristas', methods=['POST'])
@jwt_required() # Protegido
def create_motorista():
    data = request.get_json()
    if not data or not 'nome_completo' in data:
        return jsonify({'error': 'Dados incompletos'}), 400
    
    novo_motorista = Motorista(
        nome_completo=data['nome_completo'],
        contato=data.get('contato')
    )
    try:
        db.session.add(novo_motorista)
        db.session.commit()
        return jsonify(novo_motorista.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Este nome de motorista já está cadastrado.'}), 409

@bp.route('/motoristas', methods=['GET'])
@jwt_required() # Protegido
def get_motoristas():
    motoristas = Motorista.query.all()
    return jsonify([m.to_dict() for m in motoristas]), 200

@bp.route('/motoristas/<int:id>', methods=['GET'])
@jwt_required() # Protegido
def get_motorista(id):
    motorista = Motorista.query.get_or_404(id)
    return jsonify(motorista.to_dict()), 200

@bp.route('/motoristas/<int:id>', methods=['PUT'])
@jwt_required() # Protegido
def update_motorista(id):
    motorista = Motorista.query.get_or_404(id)
    data = request.get_json()
    
    motorista.nome_completo = data.get('nome_completo', motorista.nome_completo)
    motorista.contato = data.get('contato', motorista.contato)
    
    try:
        db.session.commit()
        return jsonify(motorista.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Este nome de motorista já está cadastrado.'}), 409

@bp.route('/motoristas/<int:id>', methods=['DELETE'])
@jwt_required() # Protegido
def delete_motorista(id):
    motorista = Motorista.query.get_or_404(id)
    db.session.delete(motorista)
    db.session.commit()
    return jsonify({'message': 'Motorista deletado'}), 200

# --- API CRUD: Ônibus ---

@bp.route('/onibus', methods=['POST'])
@jwt_required() # Protegido
def create_onibus():
    data = request.get_json()
    if not data or not 'numero_onibus' in data:
        return jsonify({'error': 'Número do ônibus é obrigatório'}), 400
    
    novo_onibus = Onibus(
        numero_onibus=data['numero_onibus'],
        placa=data.get('placa'),
        empresa_parceira=data.get('empresa_parceira', 'Guanabara'),
        capacidade=data.get('capacidade', 46)
    )
    try:
        db.session.add(novo_onibus)
        db.session.commit()
        return jsonify(novo_onibus.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Número do ônibus ou placa já cadastrado.'}), 409

@bp.route('/onibus', methods=['GET'])
@jwt_required() # Protegido
def get_onibus_lista():
    onibus_lista = Onibus.query.all()
    return jsonify([o.to_dict() for o in onibus_lista]), 200

@bp.route('/onibus/<int:id>', methods=['GET'])
@jwt_required() # Protegido
def get_onibus(id):
    onibus = Onibus.query.get_or_404(id)
    return jsonify(onibus.to_dict()), 200

@bp.route('/onibus/<int:id>', methods=['PUT'])
@jwt_required() # Protegido
def update_onibus(id):
    onibus = Onibus.query.get_or_404(id)
    data = request.get_json()
    
    onibus.numero_onibus = data.get('numero_onibus', onibus.numero_onibus)
    onibus.placa = data.get('placa', onibus.placa)
    onibus.empresa_parceira = data.get('empresa_parceira', onibus.empresa_parceira)
    onibus.capacidade = data.get('capacidade', onibus.capacidade)
    
    try:
        db.session.commit()
        return jsonify(onibus.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Número do ônibus ou placa já cadastrado.'}), 409

@bp.route('/onibus/<int:id>', methods=['DELETE'])
@jwt_required() # Protegido
def delete_onibus(id):
    onibus = Onibus.query.get_or_404(id)
    db.session.delete(onibus)
    db.session.commit()
    return jsonify({'message': 'Ônibus deletado'}), 200

# --- API CRUD: Rotas ---

@bp.route('/rotas', methods=['POST'])
@jwt_required() # Protegido
def create_rota():
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
@jwt_required() # Protegido
def get_rotas():
    rotas = Rota.query.all()
    return jsonify([r.to_dict() for r in rotas]), 200

@bp.route('/rotas/<int:id>', methods=['GET'])
@jwt_required() # Protegido
def get_rota(id):
    rota = Rota.query.get_or_404(id)
    return jsonify(rota.to_dict()), 200

@bp.route('/rotas/<int:id>', methods=['PUT'])
@jwt_required() # Protegido
def update_rota(id):
    rota = Rota.query.get_or_404(id)
    data = request.get_json()
    
    rota.origem = data.get('origem', rota.origem)
    rota.destino = data.get('destino', rota.destino)
    rota.tipo_rota = data.get('tipo_rota', rota.tipo_rota)
    
    db.session.commit()
    return jsonify(rota.to_dict()), 200

@bp.route('/rotas/<int:id>', methods=['DELETE'])
@jwt_required() # Protegido
def delete_rota(id):
    rota = Rota.query.get_or_404(id)
    db.session.delete(rota)
    db.session.commit()
    return jsonify({'message': 'Rota deletada'}), 200