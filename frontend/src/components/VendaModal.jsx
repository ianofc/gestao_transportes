import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function VendaModal({ isOpen, onClose, onSave, error }) {
  
  const [formData, setFormData] = useState({
    viagem_id: '',
    nome_passageiro: '',
    documento_passageiro: '',
    numero_poltrona: '',
    valor_passagem: '',
    metodo_pagamento: 'Dinheiro'
  });
  
  const [viagens, setViagens] = useState([]);
  const [loadingViagens, setLoadingViagens] = useState(false);

  // Limpa formulário ao abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        viagem_id: '',
        nome_passageiro: '',
        documento_passageiro: '',
        numero_poltrona: '',
        valor_passagem: '',
        metodo_pagamento: 'Dinheiro'
      });
      
      // Busca viagens ativas
      const fetchViagens = async () => {
        setLoadingViagens(true);
        try {
          const response = await axios.get(`${API_URL}/operacional/viagens`);
          const viagensAtivas = response.data.filter(v => v.status === 'Agendada' || v.status === 'Em Trânsito');
          setViagens(viagensAtivas);
        } catch (err) {
          console.error("Erro ao buscar viagens", err);
        } finally {
          setLoadingViagens(false);
        }
      };
      fetchViagens();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.viagem_id || !formData.nome_passageiro || !formData.documento_passageiro || !formData.numero_poltrona || !formData.valor_passagem) {
      alert('Todos os campos são obrigatórios.');
      return;
    }
     const dataToSave = {
      ...formData,
      numero_poltrona: parseInt(formData.numero_poltrona, 10),
      valor_passagem: parseFloat(formData.valor_passagem)
    };
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">Registrar Nova Venda</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
        </div>

        {loadingViagens ? (
          <p className="py-10 text-center text-gray-600">A carregar viagens...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Viagem */}
            <div>
              <label htmlFor="viagem_id" className="block text-sm font-medium text-gray-700">Viagem <span className="text-red-500">*</span></label>
              <select name="viagem_id" id="viagem_id" value={formData.viagem_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
                <option value="" disabled>Selecione a Viagem</option>
                {viagens.map(v => <option key={v.id} value={v.id}>
                  {v.rota.origem} → {v.rota.destino} ({new Date(v.data_partida_prevista).toLocaleDateString()})
                </option>)}
              </select>
            </div>
            
            {/* Nome Passageiro */}
            <div>
              <label htmlFor="nome_passageiro" className="block text-sm font-medium text-gray-700">Nome do Passageiro <span className="text-red-500">*</span></label>
              <input type="text" name="nome_passageiro" id="nome_passageiro" value={formData.nome_passageiro} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            {/* Documento Passageiro */}
            <div>
              <label htmlFor="documento_passageiro" className="block text-sm font-medium text-gray-700">Documento (CPF/RG) <span className="text-red-500">*</span></label>
              <input type="text" name="documento_passageiro" id="documento_passageiro" value={formData.documento_passageiro} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            
            {/* Poltrona e Valor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="numero_poltrona" className="block text-sm font-medium text-gray-700">Poltrona <span className="text-red-500">*</span></label>
                <input type="number" name="numero_poltrona" id="numero_poltrona" value={formData.numero_poltrona} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="valor_passagem" className="block text-sm font-medium text-gray-700">Valor (R$) <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" name="valor_passagem" id="valor_passagem" value={formData.valor_passagem} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>

            {/* Método de Pagamento */}
            <div>
              <label htmlFor="metodo_pagamento" className="block text-sm font-medium text-gray-700">Método de Pagamento <span className="text-red-500">*</span></label>
              <select name="metodo_pagamento" id="metodo_pagamento" value={formData.metodo_pagamento} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="Dinheiro">Dinheiro</option>
                <option value="Pix">Pix</option>
                <option value="Cartão">Cartão</option>
              </select>
            </div>
            
            {error && <p className="text-sm text-center text-red-600">{error}</p>}
            
            <div className="flex justify-end pt-6 space-x-4">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
              <button type="submit" className="py-2 px-4 bg-brand-500 text-white rounded-lg shadow hover:bg-brand-600 transition-colors">Salvar Venda</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}