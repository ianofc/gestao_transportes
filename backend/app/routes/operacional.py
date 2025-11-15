from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Viagem, RegistroOperacional
from flask_jwt_extended import jwt_required, get_jwt_identity
from dateutil import parser
from sqlalchemy.exc import IntegrityError

bp = Blueprint('operacional', __name__)

# --- API CRUD: Viagens ---

@bp.route('/viagens', methods=['POST'])
@jwt_required()
def create_viagem():
    """ (CRIAR) Cria uma nova viagem """
    data = request.get_json()
    
    try:
        nova_viagem = Viagem(
            rota_id=data['rota_id'],
            onibus_id=data['onibus_id'],
            motorista_id=data['motorista_id'],
            data_partida_prevista=parser.parse(data['data_partida_prevista']),
            data_chegada_prevista=parser.parse(data['data_chegada_prevista']),
            status=data.get('status', 'Agendada')
        )
        db.session.add(nova_viagem)
        db.session.commit()
        return jsonify(nova_viagem.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erro de integridade, verifique os IDs fornecidos.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/viagens', methods=['GET'])
@jwt_required()
def get_viagens():
    """ (LISTAR) Lista todas as viagens """
    try:
        viagens = Viagem.query.order_by(Viagem.data_partida_prevista.desc()).all()
        return jsonify([v.to_dict() for v in viagens]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/viagens/<int:id>', methods=['PUT'])
@jwt_required()
def update_viagem(id):
    """ (ATUALIZAR) Atualiza uma viagem """
    viagem = Viagem.query.get_or_404(id)
    data = request.get_json()

    try:
        viagem.rota_id = data.get('rota_id', viagem.rota_id)
        viagem.onibus_id = data.get('onibus_id', viagem.onibus_id)
        viagem.motorista_id = data.get('motorista_id', viagem.motorista_id)
        viagem.status = data.get('status', viagem.status)
        
        if 'data_partida_prevista' in data:
            viagem.data_partida_prevista = parser.parse(data['data_partida_prevista'])
        if 'data_chegada_prevista' in data:
            viagem.data_chegada_prevista = parser.parse(data['data_chegada_prevista'])
            
        db.session.commit()
        return jsonify(viagem.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/viagens/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_viagem(id):
    """ (DELETAR) Deleta uma viagem """
    viagem = Viagem.query.get_or_404(id)
    try:
        # Verifica se há dependências (vendas, registros)
        if viagem.vendas or viagem.registros:
            return jsonify({'error': 'Não é possível excluir. Viagem possui vendas ou registros associados.'}), 409
            
        db.session.delete(viagem)
        db.session.commit()
        return jsonify({'message': 'Viagem deletada'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Não é possível excluir. Viagem possui vendas ou registros associados.'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# --- API CRUD: Registros Operacionais ---

@bp.route('/registros', methods=['POST'])
@jwt_required()
def create_registro():
    """ (CRIAR) Cria um novo registro operacional """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('viagem_id'):
        return jsonify({'error': 'Viagem ID é obrigatório'}), 400
        
    try:
        novo_registro = RegistroOperacional(
            viagem_id=data['viagem_id'],
            bilheteiro_id=current_user_id,
            pass_chegaram=data.get('pass_chegaram', 0),
            pass_embarcaram=data.get('pass_embarcaram', 0),
            pass_desembarcaram=data.get('pass_desembarcaram', 0),
            pass_final=data.get('pass_final', 0),
            observacoes=data.get('observacoes', '')
        )
        
        if 'data_hora_chegada_real' in data and data['data_hora_chegada_real']:
            novo_registro.data_hora_chegada_real = parser.parse(data['data_hora_chegada_real'])
        if 'data_hora_saida_real' in data and data['data_hora_saida_real']:
            novo_registro.data_hora_saida_real = parser.parse(data['data_hora_saida_real'])
            
        db.session.add(novo_registro)
        
        # Atualiza o status da viagem se foi fornecido
        if 'novo_status_viagem' in data:
            viagem = Viagem.query.get(data['viagem_id'])
            if viagem:
                viagem.status = data['novo_status_viagem']
            
        db.session.commit()
        return jsonify(novo_registro.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/registros', methods=['GET'])
@jwt_required()
def get_registros():
    """ (LISTAR) Lista todos os registros """
    try:
        registros = RegistroOperacional.query.order_by(RegistroOperacional.id.desc()).all()
        return jsonify([r.to_dict() for r in registros]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/registros/<int:id>', methods=['PUT'])
@jwt_required()
def update_registro(id):
    """ (ATUALIZAR) Atualiza um registro """
    registro = RegistroOperacional.query.get_or_404(id)
    data = request.get_json()

    try:
        registro.pass_chegaram = data.get('pass_chegaram', registro.pass_chegaram)
        registro.pass_embarcaram = data.get('pass_embarcaram', registro.pass_embarcaram)
        registro.pass_desembarcaram = data.get('pass_desembarcaram', registro.pass_desembarcaram)
        registro.pass_final = data.get('pass_final', registro.pass_final)
        registro.observacoes = data.get('observacoes', registro.observacoes)
        
        if 'data_hora_chegada_real' in data and data['data_hora_chegada_real']:
            registro.data_hora_chegada_real = parser.parse(data['data_hora_chegada_real'])
        if 'data_hora_saida_real' in data and data['data_hora_saida_real']:
            registro.data_hora_saida_real = parser.parse(data['data_hora_saida_real'])

        db.session.commit()
        return jsonify(registro.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/registros/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_registro(id):
    """ (DELETAR) Deleta um registro """
    registro = RegistroOperacional.query.get_or_404(id)
    try:
        db.session.delete(registro)
        db.session.commit()
        return jsonify({'message': 'Registro deletado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500