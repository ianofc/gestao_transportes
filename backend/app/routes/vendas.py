from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Venda, CaixaDiario
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy.exc import IntegrityError

bp = Blueprint('vendas', __name__)

# --- API: Caixa Diário ---

@bp.route('/caixa/abrir', methods=['POST'])
@jwt_required()
def abrir_caixa():
    """ (CRIAR) Abre um novo caixa diário """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    caixa_aberto = CaixaDiario.query.filter_by(bilheteiro_id=current_user_id, status='Aberto').first()
    if caixa_aberto:
        return jsonify({'error': 'Já existe um caixa aberto para este usuário'}), 400
        
    try:
        novo_caixa = CaixaDiario(
            bilheteiro_id=current_user_id,
            saldo_inicial=data.get('saldo_inicial', 0.0),
            status='Aberto'
        )
        db.session.add(novo_caixa)
        db.session.commit()
        return jsonify(novo_caixa.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/caixa/fechar', methods=['POST'])
@jwt_required()
def fechar_caixa():
    """ (ATUALIZAR) Fecha o caixa diário ativo """
    current_user_id = get_jwt_identity()
    
    caixa = CaixaDiario.query.filter_by(bilheteiro_id=current_user_id, status='Aberto').first()
    if not caixa:
        return jsonify({'error': 'Nenhum caixa aberto encontrado'}), 404
        
    try:
        caixa.status = 'Fechado'
        caixa.data_fechamento = datetime.utcnow()
        db.session.commit()
        return jsonify(caixa.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/caixa', methods=['GET'])
@jwt_required()
def get_caixas():
    """ (LISTAR) Lista todos os caixas (histórico) """
    try:
        caixas = CaixaDiario.query.order_by(CaixaDiario.data_abertura.desc()).all()
        return jsonify([c.to_dict() for c in caixas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/caixa/ativo', methods=['GET'])
@jwt_required()
def get_caixa_ativo():
    """ (LISTAR) Retorna o caixa ativo do usuário """
    current_user_id = get_jwt_identity()
    caixa = CaixaDiario.query.filter_by(bilheteiro_id=current_user_id, status='Aberto').first()
    if not caixa:
        return jsonify(None), 200 # Retorna nulo, mas com sucesso
    return jsonify(caixa.to_dict()), 200


# --- API: Vendas ---

@bp.route('/vendas', methods=['POST'])
@jwt_required()
def create_venda():
    """ (CRIAR) Registra uma nova venda """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    caixa = CaixaDiario.query.filter_by(bilheteiro_id=current_user_id, status='Aberto').first()
    if not caixa:
        return jsonify({'error': 'Caixa fechado. Abra o caixa para realizar vendas.'}), 400

    try:
        nova_venda = Venda(
            viagem_id=data['viagem_id'],
            bilheteiro_id=current_user_id,
            nome_passageiro=data['nome_passageiro'],
            documento_passageiro=data['documento_passageiro'],
            numero_poltrona=data['numero_poltrona'],
            valor_passagem=data['valor_passagem'],
            metodo_pagamento=data['metodo_pagamento']
        )
        
        # Atualiza os totais do caixa em tempo real
        valor = float(data['valor_passagem'])
        if data['metodo_pagamento'] == 'Dinheiro':
            caixa.total_vendas_dinheiro += valor
        elif data['metodo_pagamento'] == 'Pix':
            caixa.total_vendas_pix += valor
        elif data['metodo_pagamento'] == 'Cartão':
            caixa.total_vendas_cartao += valor
        
        caixa.total_geral_vendas += valor
        
        db.session.add(nova_venda)
        db.session.commit()
        return jsonify(nova_venda.to_dict()), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erro de integridade. Verifique o ID da Viagem.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/vendas', methods=['GET'])
@jwt_required()
def get_vendas():
    """ (LISTAR) Lista todas as vendas """
    try:
        # Filtra vendas por data, viagem, etc. (opcional)
        vendas = Venda.query.order_by(Venda.data_hora_venda.desc()).all()
        return jsonify([v.to_dict() for v in vendas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500