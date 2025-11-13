from flask import Blueprint, jsonify
from datetime import datetime

bp = Blueprint('main', __name__)

@bp.route('/') # Esta rota agora será /api/
def index():
    """ Rota principal apenas para teste """
    return jsonify({"message": "API Gestão Transportes no ar! (Estrutura de Módulos)"})

@bp.route('/status') # ROTA ALTERADA: de '/api/status' para '/status'
def status():
    """ Rota de status da API """
    return jsonify({"status": "OK", "timestamp": datetime.utcnow()})