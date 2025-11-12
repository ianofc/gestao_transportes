from app import db, bcrypt # Importa 'bcrypt' do __init__.py
from datetime import datetime

# --- Modelos de Dados (Baseados no gestao_transportes_design.md) ---

class Usuario(db.Model):
    """ Usuários (Bilheteiros / Admin) """
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    nome_completo = db.Column(db.String(100), nullable=False)
    usuario = db.Column(db.String(50), unique=True, nullable=False)
    senha_hash = db.Column(db.String(200), nullable=False) # Armazenar apenas o hash
    nivel_acesso = db.Column(db.String(20), default='bilheteiro') # 'bilheteiro' ou 'admin'

    # Relacionamentos
    registros = db.relationship('RegistroOperacional', backref='bilheteiro', lazy=True)
    vendas = db.relationship('Venda', backref='bilheteiro', lazy=True)
    caixas = db.relationship('CaixaDiario', backref='bilheteiro', lazy=True)
    
    def set_password(self, password):
        """Cria um hash da senha e armazena."""
        self.senha_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Verifica se a senha fornecida corresponde ao hash."""
        return bcrypt.check_password_hash(self.senha_hash, password)
        
    def to_dict(self):
        """ Converte o objeto Usuario para um dicionário (JSON) - sem a senha """
        return {
            'id': self.id,
            'nome_completo': self.nome_completo,
            'usuario': self.usuario,
            'nivel_acesso': self.nivel_acesso
        }

class Motorista(db.Model):
    """ Motoristas """
    __tablename__ = 'motorista'
    id = db.Column(db.Integer, primary_key=True)
    nome_completo = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=True)
    contato = db.Column(db.String(20), nullable=True)

    # Relacionamentos
    viagens = db.relationship('Viagem', backref='motorista', lazy=True)
    
    def to_dict(self):
        """ Converte o objeto Motorista para um dicionário (JSON) """
        return {
            'id': self.id,
            'nome_completo': self.nome_completo,
            'cpf': self.cpf,
            'contato': self.contato
        }

class Onibus(db.Model):
    """ Ônibus da Frota """
    __tablename__ = 'onibus'
    id = db.Column(db.Integer, primary_key=True)
    numero_onibus = db.Column(db.String(20), unique=True, nullable=False)
    placa = db.Column(db.String(10), unique=True, nullable=True)
    empresa_parceira = db.Column(db.String(50), default='Guanabara')
    capacidade = db.Column(db.Integer, default=46)

    # Relacionamentos
    viagens = db.relationship('Viagem', backref='onibus', lazy=True)
    
    def to_dict(self):
        """ Converte o objeto Onibus para um dicionário (JSON) """
        return {
            'id': self.id,
            'numero_onibus': self.numero_onibus,
            'placa': self.placa,
            'empresa_parceira': self.empresa_parceira,
            'capacidade': self.capacidade
        }

class Rota(db.Model):
    """ Rotas (Origem/Destino) """
    __tablename__ = 'rota'
    id = db.Column(db.Integer, primary_key=True)
    origem = db.Column(db.String(100), nullable=False)
    destino = db.Column(db.String(100), nullable=False)
    tipo_rota = db.Column(db.String(20), default='Interestadual') # "Intermunicipal"

    # Relacionamentos
    viagens = db.relationship('Viagem', backref='rota', lazy=True)
    
    def to_dict(self):
        """ Converte o objeto Rota para um dicionário (JSON) """
        return {
            'id': self.id,
            'origem': self.origem,
            'destino': self.destino,
            'tipo_rota': self.tipo_rota
        }

class Viagem(db.Model):
    """ A Viagem agendada (Entidade central) """
    __tablename__ = 'viagem'
    id = db.Column(db.Integer, primary_key=True)
    
    rota_id = db.Column(db.Integer, db.ForeignKey('rota.id'), nullable=False)
    onibus_id = db.Column(db.Integer, db.ForeignKey('onibus.id'), nullable=False)
    motorista_id = db.Column(db.Integer, db.ForeignKey('motorista.id'), nullable=False)
    
    data_partida_prevista = db.Column(db.DateTime, nullable=False)
    data_chegada_prevista = db.Column(db.DateTime, nullable=False)
    
    status = db.Column(db.String(30), default='Agendada') # "Agendada", "Em Trânsito", "Concluída", "Cancelada"

    # Relacionamentos
    registros = db.relationship('RegistroOperacional', backref='viagem', lazy=True)
    vendas = db.relationship('Venda', backref='viagem', lazy=True)

class RegistroOperacional(db.Model):
    """ Anotações do Bilheteiro sobre a passagem do ônibus """
    __tablename__ = 'registro_operacional'
    id = db.Column(db.Integer, primary_key=True)
    
    viagem_id = db.Column(db.Integer, db.ForeignKey('viagem.id'), nullable=False)
    bilheteiro_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    
    data_hora_chegada_real = db.Column(db.DateTime, nullable=True)
    data_hora_saida_real = db.Column(db.DateTime, nullable=True)
    
    pass_chegaram = db.Column(db.Integer, default=0)
    pass_embarcaram = db.Column(db.Integer, default=0)
    pass_desembarcaram = db.Column(db.Integer, default=0)
    pass_final = db.Column(db.Integer, default=0)
    
    observacoes = db.Column(db.Text, nullable=True)

class Venda(db.Model):
    """ Venda de Bilhetes/Passagens """
    __tablename__ = 'venda'
    id = db.Column(db.Integer, primary_key=True)
    
    viagem_id = db.Column(db.Integer, db.ForeignKey('viagem.id'), nullable=False)
    bilheteiro_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    
    data_hora_venda = db.Column(db.DateTime, default=datetime.utcnow)
    
    nome_passageiro = db.Column(db.String(100), nullable=False)
    documento_passageiro = db.Column(db.String(50), nullable=False)
    numero_poltrona = db.Column(db.Integer, nullable=False)
    
    valor_passagem = db.Column(db.Float, nullable=False)
    metodo_pagamento = db.Column(db.String(30), nullable=False) # "Dinheiro", "Pix", "Cartão"

class CaixaDiario(db.Model):
    """ Controle de Caixa do Bilheteiro """
    __tablename__ = 'caixa_diario'
    id = db.Column(db.Integer, primary_key=True)
    
    bilheteiro_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    
    data_abertura = db.Column(db.DateTime, default=datetime.utcnow)
    data_fechamento = db.Column(db.DateTime, nullable=True)
    
    saldo_inicial = db.Column(db.Float, default=0.0)
    
    # Esses totais serão calculados no fechamento
    total_vendas_dinheiro = db.Column(db.Float, default=0.0)
    total_vendas_pix = db.Column(db.Float, default=0.0)
    total_vendas_cartao = db.Column(db.Float, default=0.0)
    total_geral_vendas = db.Column(db.Float, default=0.0)
    
    status = db.Column(db.String(20), default='Aberto') # "Aberto", "Fechado"