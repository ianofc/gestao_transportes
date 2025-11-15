from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import Usuario

def admin_required():
    """
    Um decorator que só permite o acesso a utilizadores com
    nivel_acesso == 'admin'.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Verifica se o token JWT é válido
            verify_jwt_in_request()
            # Pega a identidade (ID) do utilizador a partir do token
            current_user_id = get_jwt_identity()
            
            # Busca o utilizador na base de dados
            user = Usuario.query.get(current_user_id)
            
            # Se não for admin, retorna erro
            if not user or user.nivel_acesso != 'admin':
                return {"error": "Acesso restrito a administradores."}, 403 # Forbidden
            
            # Se for admin, permite que a rota continue
            return fn(*args, **kwargs)
        return decorator
    return wrapper