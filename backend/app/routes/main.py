from flask import Blueprint, jsonify
from datetime import datetime

# Cria um "Módulo" (Blueprint) chamado 'main'
bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    """ Rota principal apenas para teste """
    return jsonify({"message": "API Gestão Transportes no ar! (Estrutura de Módulos)"})

@bp.route('/api/status')
def status():
    """ Rota de status da API """
    return jsonify({"status": "OK", "timestamp": datetime.utcnow()})