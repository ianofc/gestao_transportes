from flask import Blueprint, jsonify, request
from app import db
from app.models import Venda, CaixaDiario
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

bp = Blueprint('vendas', __name__)

# --- Caixa Diário ---

@bp.route('/caixa/abrir', methods=['POST'])
@jwt_required()
def abrir_caixa():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Verifica se já existe caixa aberto
    caixa_aberto = CaixaDiario.query.filter_by(bilheteiro_id=current_user_id, status='Aberto').first()
    if caixa_aberto:
        return jsonify({'error': 'Já existe um caixa aberto para este usuário'}), 400
        
    novo_caixa = CaixaDiario(
        bilheteiro_id=current_user_id,
        saldo_inicial=data.get('saldo_inicial', 0.0),
        status='Aberto'
    )
    db.session.add(novo_caixa)
    db.session.commit()
    return jsonify(novo_caixa.to_dict()), 201

@bp.route('/caixa/fechar', methods=['POST'])
@jwt_required()
def fechar_caixa():
    current_user_id = get_jwt_identity()
    
    caixa = CaixaDiario.query.filter_by(bilheteiro_id=current_user_id, status='Aberto').first()
    if not caixa:
        return jsonify({'error': 'Nenhum caixa aberto encontrado'}), 404
        
    # Calcula totais baseado nas vendas deste caixa (Simplificado)
    # Em produção, faria uma query nas Vendas filtrando pelo bilheteiro e período
    
    caixa.status = 'Fechado'
    caixa.data_fechamento = datetime.utcnow()
    db.session.commit()
    
    return jsonify(caixa.to_dict()), 200

# --- Vendas ---

@bp.route('/vendas', methods=['POST'])
@jwt_required()
def create_venda():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Verifica se o caixa está aberto
    caixa = CaixaDiario.query.filter_by(bilheteiro_id=current_user_id, status='Aberto').first()
    if not caixa:
        return jsonify({'error': 'Caixa fechado. Abra o caixa para realizar vendas.'}), 400

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
    if data['metodo_pagamento'] == 'Dinheiro':
        caixa.total_vendas_dinheiro += data['valor_passagem']
    elif data['metodo_pagamento'] == 'Pix':
        caixa.total_vendas_pix += data['valor_passagem']
    elif data['metodo_pagamento'] == 'Cartão':
        caixa.total_vendas_cartao += data['valor_passagem']
    
    caixa.total_geral_vendas += data['valor_passagem']
    
    db.session.add(nova_venda)
    db.session.commit()
    return jsonify(nova_venda.to_dict()), 201