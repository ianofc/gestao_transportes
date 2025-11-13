from flask import Blueprint, request, jsonify
from app import db, bcrypt
from app.models import Usuario
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# Cria um "Módulo" (Blueprint) chamado 'auth'
bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    """ Rota de registo de novos usuários """
    data = request.get_json()
    
    if not data or not 'usuario' in data or not 'senha' in data or not 'nome_completo' in data:
        return jsonify({'error': 'Dados incompletos (usuário, senha, nome_completo)'}), 400

    # Verifica se o usuário já existe
    if Usuario.query.filter_by(usuario=data['usuario']).first():
        return jsonify({'error': 'Usuário já existe'}), 409

    novo_usuario = Usuario(
        nome_completo=data['nome_completo'],
        usuario=data['usuario'],
        nivel_acesso=data.get('nivel_acesso', 'bilheteiro')
    )
    novo_usuario.set_password(data['senha'])
    
    db.session.add(novo_usuario)
    db.session.commit()
    
    return jsonify({'message': 'Usuário criado com sucesso', 'usuario': novo_usuario.to_dict()}), 201

@bp.route('/login', methods=['POST'])
def login():
    """ Rota de login """
    data = request.get_json()
    
    if not data or not 'usuario' in data or not 'senha' in data:
        return jsonify({'error': 'Usuário e senha são obrigatórios'}), 400
        
    usuario = Usuario.query.filter_by(usuario=data['usuario']).first()
    
    # Verifica se o usuário existe E se a senha está correta
    if not usuario or not usuario.check_password(data['senha']):
        return jsonify({'error': 'Credenciais inválidas'}), 401
        
    # Cria o token de acesso JWT
    # A 'identity' é o que será armazenado no token (usamos o ID do usuário)
    access_token = create_access_token(identity=usuario.id)
    
    return jsonify({
        'message': 'Login bem-sucedido',
        'access_token': access_token,
        'usuario': usuario.to_dict()
    }), 200

@bp.route('/perfil', methods=['GET'])
@jwt_required() # Protege a rota, exigindo um token JWT
def perfil():
    """ Rota de exemplo protegida """
    
    # Pega a identidade (ID do usuário) armazenada no token
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)
    
    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 404
        
    return jsonify({'usuario': usuario.to_dict()}), 200