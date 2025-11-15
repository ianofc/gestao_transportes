import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function RegistroOperacionalModal({ isOpen, onClose, onSave, registro, error }) {
  
  const [formData, setFormData] = useState({
    viagem_id: '',
    data_hora_chegada_real: '',
    data_hora_saida_real: '',
    pass_chegaram: 0,
    pass_embarcaram: 0,
    pass_desembarcaram: 0,
    pass_final: 0,
    observacoes: '',
    novo_status_viagem: '' // Campo opcional para mudar status da viagem
  });
  
  const [viagens, setViagens] = useState([]);
  const [loadingViagens, setLoadingViagens] = useState(false);

  const isEditMode = registro != null;

  // Carrega dados no formulário
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        viagem_id: registro.viagem_id || '',
        data_hora_chegada_real: registro.data_hora_chegada_real?.substring(0, 16) || '',
        data_hora_saida_real: registro.data_hora_saida_real?.substring(0, 16) || '',
        pass_chegaram: registro.pass_chegaram || 0,
        pass_embarcaram: registro.pass_embarcaram || 0,
        pass_desembarcaram: registro.pass_desembarcaram || 0,
        pass_final: registro.pass_final || 0,
        observacoes: registro.observacoes || '',
        novo_status_viagem: '' // Não editar status da viagem ao editar registro
      });
    } else {
      setFormData({
        viagem_id: '',
        data_hora_chegada_real: '',
        data_hora_saida_real: '',
        pass_chegaram: 0,
        pass_embarcaram: 0,
        pass_desembarcaram: 0,
        pass_final: 0,
        observacoes: '',
        novo_status_viagem: ''
      });
    }
  }, [registro, isOpen]);
  
  // Busca viagens ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      const fetchViagens = async () => {
        setLoadingViagens(true);
        try {
          // Apenas viagens 'Agendada' ou 'Em Trânsito'
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
    if (!formData.viagem_id) {
      alert('A viagem é obrigatória.');
      return;
    }
    // Converte campos numéricos
    const dataToSave = {
      ...formData,
      pass_chegaram: parseInt(formData.pass_chegaram, 10) || 0,
      pass_embarcaram: parseInt(formData.pass_embarcaram, 10) || 0,
      pass_desembarcaram: parseInt(formData.pass_desembarcaram, 10) || 0,
      pass_final: parseInt(formData.pass_final, 10) || 0,
    };
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Editar Registro' : 'Novo Registro Operacional'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
        </div>

        {loadingViagens ? (
          <p className="py-10 text-center text-gray-600">A carregar viagens...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Viagem */}
            <div>
              <label htmlFor="viagem_id" className="block text-sm font-medium text-gray-700">Viagem <span className="text-red-500">*</span></label>
              <select name="viagem_id" id="viagem_id" value={formData.viagem_id} onChange={handleChange} required disabled={isEditMode} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-100">
                <option value="" disabled>Selecione a Viagem</option>
                {viagens.map(v => <option key={v.id} value={v.id}>
                  {v.rota.origem} → {v.rota.destino} ({new Date(v.data_partida_prevista).toLocaleDateString()})
                </option>)}
              </select>
            </div>

            {/* Chegada Real */}
            <div>
              <label htmlFor="data_hora_chegada_real" className="block text-sm font-medium text-gray-700">Chegada Real</label>
              <input type="datetime-local" name="data_hora_chegada_real" id="data_hora_chegada_real" value={formData.data_hora_chegada_real} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
            
            {/* Saída Real */}
            <div>
              <label htmlFor="data_hora_saida_real" className="block text-sm font-medium text-gray-700">Saída Real</label>
              <input type="datetime-local" name="data_hora_saida_real" id="data_hora_saida_real" value={formData.data_hora_saida_real} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
            
            {/* Passageiros (em grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pass_chegaram" className="block text-sm font-medium text-gray-700">Pass. Chegaram</label>
                <input type="number" name="pass_chegaram" id="pass_chegaram" value={formData.pass_chegaram} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="pass_embarcaram" className="block text-sm font-medium text-gray-700">Pass. Embarcaram</label>
                <input type="number" name="pass_embarcaram" id="pass_embarcaram" value={formData.pass_embarcaram} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="pass_desembarcaram" className="block text-sm font-medium text-gray-700">Pass. Desembarcaram</label>
                <input type="number" name="pass_desembarcaram" id="pass_desembarcaram" value={formData.pass_desembarcaram} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="pass_final" className="block text-sm font-medium text-gray-700">Pass. Final (em trânsito)</label>
                <input type="number" name="pass_final" id="pass_final" value={formData.pass_final} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>

            {/* Mudar Status (Apenas ao criar) */}
            {!isEditMode && (
              <div>
                <label htmlFor="novo_status_viagem" className="block text-sm font-medium text-gray-700">Mudar Status da Viagem para:</label>
                <select name="novo_status_viagem" id="novo_status_viagem" value={formData.novo_status_viagem} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
                  <option value="">Não alterar</option>
                  <option value="Em Trânsito">Em Trânsito</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>
            )}
            
            {/* Observações */}
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
              <textarea name="observacoes" id="observacoes" value={formData.observacoes} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"></textarea>
            </div>
            
            {error && <p className="text-sm text-center text-red-600">{error}</p>}
            
            <div className="flex justify-end pt-6 space-x-4">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
              <button type="submit" className="py-2 px-4 bg-brand-500 text-white rounded-lg shadow hover:bg-brand-600 transition-colors">Salvar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}