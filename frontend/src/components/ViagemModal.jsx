import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function ViagemModal({ isOpen, onClose, onSave, viagem, error }) {
  
  // Estado para o formulário
  const [formData, setFormData] = useState({
    rota_id: '',
    onibus_id: '',
    motorista_id: '',
    data_partida_prevista: '',
    data_chegada_prevista: '',
    status: 'Agendada'
  });
  
  // Estado para as opções dos dropdowns
  const [opcoes, setOpcoes] = useState({
    rotas: [],
    onibus: [],
    motoristas: []
  });
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);

  const isEditMode = viagem != null;

  // Carrega os dados da viagem no formulário
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        rota_id: viagem.rota?.id || '',
        onibus_id: viagem.onibus?.id || '',
        motorista_id: viagem.motorista?.id || '',
        data_partida_prevista: viagem.data_partida_prevista.substring(0, 16) || '', // Formato YYYY-MM-DDTHH:MM
        data_chegada_prevista: viagem.data_chegada_prevista.substring(0, 16) || '',
        status: viagem.status || 'Agendada'
      });
    } else {
      setFormData({
        rota_id: '',
        onibus_id: '',
        motorista_id: '',
        data_partida_prevista: '',
        data_chegada_prevista: '',
        status: 'Agendada'
      });
    }
  }, [viagem, isOpen]);
  
  // Busca as opções (rotas, onibus, motoristas) ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      const fetchOpcoes = async () => {
        setLoadingOpcoes(true);
        try {
          const [rotasRes, onibusRes, motoristasRes] = await Promise.all([
            axios.get(`${API_URL}/cadastros/rotas`),
            axios.get(`${API_URL}/cadastros/onibus`),
            axios.get(`${API_URL}/cadastros/motoristas`)
          ]);
          setOpcoes({
            rotas: rotasRes.data,
            onibus: onibusRes.data,
            motoristas: motoristasRes.data
          });
        } catch (err) {
          console.error("Erro ao buscar opções", err);
        } finally {
          setLoadingOpcoes(false);
        }
      };
      fetchOpcoes();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rota_id || !formData.onibus_id || !formData.motorista_id || !formData.data_partida_prevista || !formData.data_chegada_prevista) {
      alert('Todos os campos são obrigatórios.');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Editar Viagem' : 'Agendar Nova Viagem'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
        </div>

        {loadingOpcoes ? (
          <p className="py-10 text-center text-gray-600">A carregar opções...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Rota */}
            <div>
              <label htmlFor="rota_id" className="block text-sm font-medium text-gray-700">Rota <span className="text-red-500">*</span></label>
              <select name="rota_id" id="rota_id" value={formData.rota_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
                <option value="" disabled>Selecione a Rota</option>
                {opcoes.rotas.map(r => <option key={r.id} value={r.id}>{r.origem} → {r.destino}</option>)}
              </select>
            </div>

            {/* Ônibus */}
            <div>
              <label htmlFor="onibus_id" className="block text-sm font-medium text-gray-700">Ônibus <span className="text-red-500">*</span></label>
              <select name="onibus_id" id="onibus_id" value={formData.onibus_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
                <option value="" disabled>Selecione o Ônibus</option>
                {opcoes.onibus.map(o => <option key={o.id} value={o.id}>Nº {o.numero_onibus} (Placa: {o.placa || 'N/A'})</option>)}
              </select>
            </div>
            
            {/* Motorista */}
            <div>
              <label htmlFor="motorista_id" className="block text-sm font-medium text-gray-700">Motorista <span className="text-red-500">*</span></label>
              <select name="motorista_id" id="motorista_id" value={formData.motorista_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
                <option value="" disabled>Selecione o Motorista</option>
                {opcoes.motoristas.map(m => <option key={m.id} value={m.id}>{m.nome_completo}</option>)}
              </select>
            </div>
            
            {/* Partida Prevista */}
            <div>
              <label htmlFor="data_partida_prevista" className="block text-sm font-medium text-gray-700">Partida Prevista <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="data_partida_prevista" id="data_partida_prevista" value={formData.data_partida_prevista} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
            
            {/* Chegada Prevista */}
            <div>
              <label htmlFor="data_chegada_prevista" className="block text-sm font-medium text-gray-700">Chegada Prevista <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="data_chegada_prevista" id="data_chegada_prevista" value={formData.data_chegada_prevista} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
                <option value="Agendada">Agendada</option>
                <option value="Em Trânsito">Em Trânsito</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
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