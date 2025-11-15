from flask import Blueprint, request, jsonify
from app.extensions import db, bcrypt 
from app.models import Usuario
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
# Importa o novo decorator
from app.decorators import admin_required

bp = Blueprint('auth', __name__)

# --- ROTAS DE AUTENTICAÇÃO (Login/Logout) ---

@bp.route('/login', methods=['POST'])
def login():
    """ Rota de login """
    data = request.get_json()
    
    if not data or not 'usuario' in data or not 'senha' in data:
        return jsonify({'error': 'Usuário e senha são obrigatórios'}), 400
        
    usuario = Usuario.query.filter_by(usuario=data['usuario']).first()
    
    if not usuario or not usuario.check_password(data['senha']):
        return jsonify({'error': 'Credenciais inválidas'}), 401
        
    # Adiciona o nível de acesso ao token
    access_token = create_access_token(
        identity=usuario.id,
        additional_claims={"nivel_acesso": usuario.nivel_acesso} 
    )
    
    return jsonify({
        'message': 'Login bem-sucedido',
        'access_token': access_token,
        'usuario': usuario.to_dict()
    }), 200

@bp.route('/perfil', methods=['GET'])
@jwt_required() 
def perfil():
    """ Rota para buscar o perfil do usuário logado """
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)
    
    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 404
        
    return jsonify({'usuario': usuario.to_dict()}), 200

# --- ROTAS DE GESTÃO DE USUÁRIOS (CRUD - SÓ ADMIN) ---

@bp.route('/register', methods=['POST'])
@admin_required() # Protegido
def register():
    """ Rota de registo de novos usuários (CRIAR) """
    data = request.get_json()
    
    if not data or not 'usuario' in data or not 'senha' in data or not 'nome_completo' in data:
        return jsonify({'error': 'Dados incompletos (usuário, senha, nome_completo)'}), 400

    try:
        novo_usuario = Usuario(
            nome_completo=data['nome_completo'],
            usuario=data['usuario'],
            nivel_acesso=data.get('nivel_acesso', 'bilheteiro')
        )
        novo_usuario.set_password(data['senha'])
        
        db.session.add(novo_usuario)
        db.session.commit()
        
        return jsonify({'message': 'Usuário criado com sucesso', 'usuario': novo_usuario.to_dict()}), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Esse nome de usuário já existe.'}), 409

@bp.route('/usuarios', methods=['GET'])
@admin_required() # Protegido
def get_usuarios():
    """ Lista todos os usuários (LISTAR) """
    try:
        usuarios = Usuario.query.all()
        return jsonify([u.to_dict() for u in usuarios]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/usuarios/<int:id>', methods=['PUT'])
@admin_required() # Protegido
def update_usuario(id):
    """ Atualiza um usuário (ATUALIZAR) """
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()

    try:
        usuario.nome_completo = data.get('nome_completo', usuario.nome_completo)
        usuario.usuario = data.get('usuario', usuario.usuario)
        usuario.nivel_acesso = data.get('nivel_acesso', usuario.nivel_acesso)
        
        db.session.commit()
        return jsonify(usuario.to_dict()), 200
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Esse nome de usuário já existe.'}), 409

@bp.route('/usuarios/<int:id>', methods=['DELETE'])
@admin_required() # Protegido
def delete_usuario(id):
    """ Deleta um usuário (DELETAR) """
    
    current_user_id = get_jwt_identity()
    if id == current_user_id:
        return jsonify({'error': 'Você não pode excluir a si mesmo.'}), 403
        
    usuario = Usuario.query.get_or_404(id)
    
    try:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({'message': 'Usuário deletado'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Não é possível excluir. Este usuário está associado a vendas ou registros operacionais.'}), 409

@bp.route('/usuarios/<int:id>/reset-password', methods=['POST'])
@admin_required() # Protegido
def reset_password(id):
    """ Admin redefine a senha de um usuário """
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()
    
    if not data or not 'nova_senha' in data:
        return jsonify({'error': 'Nova senha é obrigatória'}), 400
        
    try:
        usuario.set_password(data['nova_senha'])
        db.session.commit()
        return jsonify({'message': f'Senha do usuário {usuario.usuario} atualizada.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500