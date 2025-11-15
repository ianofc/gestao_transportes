import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function RotaModal({ isOpen, onClose, onSave, rota, error }) {
  const [formData, setFormData] = useState({
    origem: '',
    destino: '',
    tipo_rota: 'Interestadual'
  });

  const isEditMode = rota != null;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        origem: rota.origem || '',
        destino: rota.destino || '',
        tipo_rota: rota.tipo_rota || 'Interestadual'
      });
    } else {
      // Limpa o formulário para um novo cadastro
      setFormData({
        origem: '',
        destino: '',
        tipo_rota: 'Interestadual'
      });
    }
  }, [rota, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.origem || !formData.destino) {
      alert('Origem e Destino são obrigatórios.');
      return;
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
            {isEditMode ? 'Editar Rota' : 'Adicionar Nova Rota'}
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
          
          {/* Origem */}
          <div>
            <label htmlFor="origem" className="block text-sm font-medium text-gray-700">
              Origem <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="origem"
              id="origem"
              value={formData.origem}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Destino */}
          <div>
            <label htmlFor="destino" className="block text-sm font-medium text-gray-700">
              Destino <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="destino"
              id="destino"
              value={formData.destino}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Tipo de Rota */}
          <div>
            <label htmlFor="tipo_rota" className="block text-sm font-medium text-gray-700">
              Tipo de Rota
            </label>
            <input
              type="text"
              name="tipo_rota"
              id="tipo_rota"
              value={formData.tipo_rota}
              onChange={handleChange}
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