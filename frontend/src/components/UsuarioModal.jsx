import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function UsuarioModal({ isOpen, onClose, onSave, usuario, error }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    usuario: '',
    senha: '',
    nivel_acesso: 'bilheteiro'
  });

  // Determina se é um formulário de edição
  const isEditMode = usuario != null;

  // Carrega os dados do usuário no formulário
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nome_completo: usuario.nome_completo || '',
        usuario: usuario.usuario || '',
        senha: '', // Senha fica vazia no modo de edição
        nivel_acesso: usuario.nivel_acesso || 'bilheteiro'
      });
    } else {
      // Limpa o formulário para um novo cadastro
      setFormData({
        nome_completo: '',
        usuario: '',
        senha: '',
        nivel_acesso: 'bilheteiro'
      });
    }
  }, [usuario, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode) {
        // Em modo de edição, nome e usuário são obrigatórios
        if (!formData.nome_completo || !formData.usuario) {
            alert('Nome e Usuário são obrigatórios.');
            return;
        }
    } else {
        // Em modo de criação, senha também é obrigatória
        if (!formData.nome_completo || !formData.usuario || !formData.senha) {
            alert('Nome, Usuário e Senha são obrigatórios.');
            return;
        }
    }
    
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    // Fundo (Overlay)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      
      {/* Conteúdo do Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Nome Completo */}
          <div>
            <label htmlFor="nome_completo" className="block text-sm font-medium text-gray-700">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome_completo"
              id="nome_completo"
              value={formData.nome_completo}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Usuário (login) */}
          <div>
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
              Usuário (para login) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="usuario"
              id="usuario"
              value={formData.usuario}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          
          {/* Senha (Aparece apenas no modo de CRIAÇÃO) */}
          {!isEditMode && (
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="senha"
                id="senha"
                value={formData.senha}
                onChange={handleChange}
                required={!isEditMode} // Obrigatório apenas se NÃO estiver em modo de edição
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          )}

          {/* Nível de Acesso */}
          <div>
            <label htmlFor="nivel_acesso" className="block text-sm font-medium text-gray-700">
              Nível de Acesso
            </label>
            <select
              name="nivel_acesso"
              id="nivel_acesso"
              value={formData.nivel_acesso}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="bilheteiro">Bilheteiro</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Exibição de erro (se houver) */}
          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end pt-6 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-brand-500 text-white rounded-lg shadow hover:bg-brand-600 transition-colors"
            >
              Salvar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}