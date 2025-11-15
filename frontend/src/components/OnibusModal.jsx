import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function OnibusModal({ isOpen, onClose, onSave, onibus, error }) {
  const [formData, setFormData] = useState({
    numero_onibus: '',
    placa: '',
    empresa_parceira: 'Guanabara',
    capacidade: 46
  });

  const isEditMode = onibus != null;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        numero_onibus: onibus.numero_onibus || '',
        placa: onibus.placa || '',
        empresa_parceira: onibus.empresa_parceira || 'Guanabara',
        capacidade: onibus.capacidade || 46
      });
    } else {
      // Limpa o formulário para um novo cadastro
      setFormData({
        numero_onibus: '',
        placa: '',
        empresa_parceira: 'Guanabara',
        capacidade: 46
      });
    }
  }, [onibus, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.numero_onibus) {
      alert('O número do ônibus é obrigatório.');
      return;
    }
    
    // Converte capacidade para número
    const dataToSave = {
      ...formData,
      capacidade: parseInt(formData.capacidade, 10) || 46
    };
    
    onSave(dataToSave);
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
            {isEditMode ? 'Editar Ônibus' : 'Adicionar Novo Ônibus'}
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
          
          {/* Número do Ônibus */}
          <div>
            <label htmlFor="numero_onibus" className="block text-sm font-medium text-gray-700">
              Número do Ônibus <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numero_onibus"
              id="numero_onibus"
              value={formData.numero_onibus}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Placa */}
          <div>
            <label htmlFor="placa" className="block text-sm font-medium text-gray-700">
              Placa
            </label>
            <input
              type="text"
              name="placa"
              id="placa"
              value={formData.placa}
              onChange={handleChange}
              placeholder="ABC-1234"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Empresa Parceira */}
          <div>
            <label htmlFor="empresa_parceira" className="block text-sm font-medium text-gray-700">
              Empresa Parceira
            </label>
            <input
              type="text"
              name="empresa_parceira"
              id="empresa_parceira"
              value={formData.empresa_parceira}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          
          {/* Capacidade */}
          <div>
            <label htmlFor="capacidade" className="block text-sm font-medium text-gray-700">
              Capacidade
            </label>
            <input
              type="number"
              name="capacidade"
              id="capacidade"
              value={formData.capacidade}
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