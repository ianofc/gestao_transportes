import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function MotoristaModal({ isOpen, onClose, onSave, motorista, error }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    // REMOVIDO: cpf: '',
    contato: ''
  });

  // Determina se é um formulário de edição (vs. criação)
  const isEditMode = motorista != null;

  // Carrega os dados do motorista no formulário quando ele é aberto para edição
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nome_completo: motorista.nome_completo || '',
        // REMOVIDO: cpf: motorista.cpf || '',
        contato: motorista.contato || ''
      });
    } else {
      // Limpa o formulário para um novo cadastro
      setFormData({
        nome_completo: '',
        // REMOVIDO: cpf: '',
        contato: ''
      });
    }
  }, [motorista, isOpen]); // Roda sempre que o motorista ou o estado 'isOpen' mudar

  // Handler genérico para atualizar o estado do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler para submeter o formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação simples
    if (!formData.nome_completo) {
      alert('O nome completo é obrigatório.');
      return;
    }
    
    // Passa os dados para a função 'onSave' do componente pai
    onSave(formData);
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    // Fundo (Overlay)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      
      {/* Conteúdo do Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Editar Motorista' : 'Adicionar Novo Motorista'}
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

          {/* REMOVIDO: Bloco do CPF foi removido daqui */}

          {/* Contato */}
          <div>
            <label htmlFor="contato" className="block text-sm font-medium text-gray-700">
              Contato (Telefone)
            </label>
            <input
              type="text"
              name="contato"
              id="contato"
              value={formData.contato}
              onChange={handleChange}
              placeholder="(00) 90000-0000"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
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