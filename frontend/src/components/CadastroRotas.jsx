import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Map, Edit, Trash2 } from 'lucide-react'; // Ícone de Mapa
import RotaModal from './RotaModal'; // Importa o novo modal

const API_URL = 'http://localhost:5000/api';

export default function CadastroRotas() {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRota, setCurrentRota] = useState(null); 

  // Função para buscar os dados
  const fetchRotas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cadastros/rotas`);
      setRotas(response.data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar a lista de rotas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRotas();
  }, []);

  // --- Funções CRUD ---

  const handleOpenModal = (rota = null) => {
    setCurrentRota(rota);
    setIsModalOpen(true);
    setModalError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRota(null);
    setModalError(null);
  };

  const handleSaveRota = async (formData) => {
    try {
      if (currentRota) {
        // ATUALIZAR (PUT)
        await axios.put(`${API_URL}/cadastros/rotas/${currentRota.id}`, formData);
      } else {
        // CRIAR (POST)
        await axios.post(`${API_URL}/cadastros/rotas`, formData);
      }
      fetchRotas(); 
      handleCloseModal();
    } catch (err) {
      console.error("Erro ao salvar:", err.response?.data?.error || err.message);
      // O backend retorna 400 se 'origem' ou 'destino' estiverem faltando
      setModalError(err.response?.data?.error || 'Erro ao salvar. Verifique os dados.');
    }
  };

  const handleDeleteRota = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta rota?')) {
      try {
        await axios.delete(`${API_URL}/cadastros/rotas/${id}`);
        fetchRotas();
      } catch (err) {
        setError('Erro ao excluir rota.');
        console.error(err);
      }
    }
  };


  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      
      {/* Cabeçalho e Botão de Adicionar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Rotas
        </h2>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center bg-brand-500 text-white py-2 px-4 rounded-lg shadow hover:bg-brand-600 transition-colors"
        >
          <Map size={18} className="mr-2" />
          Adicionar Rota
        </button>
      </div>

      {/* Exibição de Loading ou Erro */}
      {loading && <p className="text-gray-600">A carregar...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Tabela de Dados */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rotas.map((rota) => (
                <tr key={rota.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rota.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rota.origem}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rota.destino}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rota.tipo_rota}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button
                      onClick={() => handleOpenModal(rota)}
                      className="text-brand-600 hover:text-brand-800"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRota(rota.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mensagem caso não haja rotas */}
      {!loading && !error && rotas.length === 0 && (
         <p className="text-gray-500 mt-4">Nenhuma rota encontrada. Clique em "Adicionar Rota" para começar.</p>
      )}

      {/* O Modal */}
      <RotaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRota}
        rota={currentRota}
        error={modalError}
      />

    </div>
  );
}