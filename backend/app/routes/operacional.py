from flask import Blueprint, jsonify, request
from app import db
from app.models import Viagem, RegistroOperacional
from flask_jwt_extended import jwt_required, get_jwt_identity
from dateutil import parser

bp = Blueprint('operacional', __name__)

# --- Viagens ---

@bp.route('/viagens', methods=['POST'])
@jwt_required()
def create_viagem():
    data = request.get_json()
    # Validações básicas omitidas para brevidade
    
    nova_viagem = Viagem(
        rota_id=data['rota_id'],
        onibus_id=data['onibus_id'],
        motorista_id=data['motorista_id'],
        data_partida_prevista=parser.parse(data['data_partida_prevista']),
        data_chegada_prevista=parser.parse(data['data_chegada_prevista']),
        status='Agendada'
    )
    db.session.add(nova_viagem)
    db.session.commit()
    return jsonify(nova_viagem.to_dict()), 201

@bp.route('/viagens', methods=['GET'])
@jwt_required()
def get_viagens():
    # Filtros opcionais podem ser adicionados aqui (ex: por data)
    viagens = Viagem.query.all()
    return jsonify([v.to_dict() for v in viagens]), 200

# --- Registros Operacionais ---

@bp.route('/registros', methods=['POST'])
@jwt_required()
def create_registro():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    novo_registro = RegistroOperacional(
        viagem_id=data['viagem_id'],
        bilheteiro_id=current_user_id,
        pass_chegaram=data.get('pass_chegaram', 0),
        pass_embarcaram=data.get('pass_embarcaram', 0),
        pass_desembarcaram=data.get('pass_desembarcaram', 0),
        pass_final=data.get('pass_final', 0),
        observacoes=data.get('observacoes', '')
    )
    
    if 'data_hora_chegada_real' in data:
        novo_registro.data_hora_chegada_real = parser.parse(data['data_hora_chegada_real'])
    if 'data_hora_saida_real' in data:
        novo_registro.data_hora_saida_real = parser.parse(data['data_hora_saida_real'])
        
    db.session.add(novo_registro)
    
    # Atualiza o status da viagem se necessário (ex: para "Em Trânsito" ou "Concluída")
    viagem = Viagem.query.get(data['viagem_id'])
    if viagem and 'novo_status_viagem' in data:
        viagem.status = data['novo_status_viagem']
        
    db.session.commit()
    return jsonify(novo_registro.to_dict()), 201