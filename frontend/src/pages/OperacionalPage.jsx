import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, ClipboardList, Edit, Trash2, PlusCircle } from 'lucide-react';
import ViagemModal from '../components/ViagemModal';
import RegistroOperacionalModal from '../components/RegistroOperacionalModal';

const API_URL = 'http://localhost:5000/api';

// Função para formatar data/hora
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// --- Componente da Aba Viagens ---
function TabViagens() {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentViagem, setCurrentViagem] = useState(null);

  const fetchViagens = async () => {
    try { setLoading(true); const res = await axios.get(`${API_URL}/operacional/viagens`); setViagens(res.data); setError(null); }
    catch (err) { setError('Falha ao carregar viagens.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchViagens(); }, []);
  
  const handleOpenModal = (viagem = null) => { setCurrentViagem(viagem); setIsModalOpen(true); setModalError(null); };
  const handleCloseModal = () => { setIsModalOpen(false); setCurrentViagem(null); setModalError(null); };
  
  const handleSave = async (formData) => {
    try {
      if (currentViagem) {
        await axios.put(`${API_URL}/operacional/viagens/${currentViagem.id}`, formData);
      } else {
        await axios.post(`${API_URL}/operacional/viagens`, formData);
      }
      fetchViagens(); handleCloseModal();
    } catch (err) { setModalError(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza? Viagens com vendas ou registros não podem ser excluídas.')) {
      try {
        await axios.delete(`${API_URL}/operacional/viagens/${id}`);
        fetchViagens();
      } catch (err) { setError(err.response?.data?.error || 'Erro ao excluir.'); }
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Viagens Agendadas</h2>
        <button onClick={() => handleOpenModal(null)} className="flex items-center bg-brand-500 text-white py-2 px-4 rounded-lg shadow hover:bg-brand-600">
          <PlusCircle size={18} className="mr-2" /> Agendar Viagem
        </button>
      </div>
      {loading && <p>A carregar...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rota</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partida</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motorista</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ônibus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {viagens.map((v) => (
                <tr key={v.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{v.rota?.origem} → {v.rota?.destino}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(v.data_partida_prevista)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.motorista?.nome_completo || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.onibus?.numero_onibus || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${v.status === 'Agendada' ? 'bg-blue-100 text-blue-800' : v.status === 'Concluída' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{v.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(v)} className="text-brand-600 hover:text-brand-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {viagens.length === 0 && <p className="text-gray-500 mt-4">Nenhuma viagem agendada.</p>}
        </div>
      )}
      <ViagemModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} viagem={currentViagem} error={modalError} />
    </div>
  );
}

// --- Componente da Aba Registros ---
function TabRegistros() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRegistro, setCurrentRegistro] = useState(null);
  
  const fetchRegistros = async () => {
    try { setLoading(true); const res = await axios.get(`${API_URL}/operacional/registros`); setRegistros(res.data); setError(null); }
    catch (err) { setError('Falha ao carregar registros.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchRegistros(); }, []);
  
  const handleOpenModal = (reg = null) => { setCurrentRegistro(reg); setIsModalOpen(true); setModalError(null); };
  const handleCloseModal = () => { setIsModalOpen(false); setCurrentRegistro(null); setModalError(null); };
  
  const handleSave = async (formData) => {
    try {
      if (currentRegistro) {
        await axios.put(`${API_URL}/operacional/registros/${currentRegistro.id}`, formData);
      } else {
        await axios.post(`${API_URL}/operacional/registros`, formData);
      }
      fetchRegistros(); handleCloseModal();
    } catch (err) { setModalError(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await axios.delete(`${API_URL}/operacional/registros/${id}`);
        fetchRegistros();
      } catch (err) { setError('Erro ao excluir.'); }
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Registros Operacionais</h2>
        <button onClick={() => handleOpenModal(null)} className="flex items-center bg-brand-500 text-white py-2 px-4 rounded-lg shadow hover:bg-brand-600">
          <PlusCircle size={18} className="mr-2" /> Novo Registro
        </button>
      </div>
      {loading && <p>A carregar...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viagem (ID)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chegada Real</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saída Real</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Embarcaram</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bilheteiro</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registros.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.viagem_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(r.data_hora_chegada_real)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(r.data_hora_saida_real)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{r.pass_embarcaram}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.pass_final}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.bilheteiro_nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(r)} className="text-brand-600 hover:text-brand-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {registros.length === 0 && <p className="text-gray-500 mt-4">Nenhum registro operacional encontrado.</p>}
        </div>
      )}
      <RegistroOperacionalModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} registro={currentRegistro} error={modalError} />
    </div>
  );
}


// --- Componente Principal da Página ---
export default function OperacionalPage() {
  const [activeTab, setActiveTab] = useState('viagens');

  const getTabClass = (tabName) => {
    return `flex items-center py-3 px-4 rounded-t-lg cursor-pointer transition-colors
            ${activeTab === tabName 
              ? 'border-b-4 border-brand-500 text-brand-600 font-semibold bg-white' 
              : 'text-gray-500 hover:bg-gray-100'
            }`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Módulo Operacional
      </h1>
      
      {/* Abas de Navegação */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('viagens')}
          className={getTabClass('viagens')}
        >
          <Truck size={18} className="mr-2" />
          Viagens
        </button>
        <button 
          onClick={() => setActiveTab('registros')}
          className={getTabClass('registros')}
        >
          <ClipboardList size={18} className="mr-2" />
          Registros
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="mt-4">
        {activeTab === 'viagens' ? <TabViagens /> : <TabRegistros />}
      </div>
    </div>
  );
}