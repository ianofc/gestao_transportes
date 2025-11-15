import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, Edit, Trash2 } from 'lucide-react'; // Ícone de Ônibus
import OnibusModal from './OnibusModal'; // Importa o novo modal

const API_URL = 'http://localhost:5000/api';

export default function CadastroOnibus() {
  const [onibusLista, setOnibusLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOnibus, setCurrentOnibus] = useState(null); 

  // Função para buscar os dados
  const fetchOnibus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cadastros/onibus`);
      setOnibusLista(response.data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar a lista de ônibus.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnibus();
  }, []);

  // --- Funções CRUD ---

  const handleOpenModal = (onibus = null) => {
    setCurrentOnibus(onibus);
    setIsModalOpen(true);
    setModalError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOnibus(null);
    setModalError(null);
  };

  const handleSaveOnibus = async (formData) => {
    try {
      if (currentOnibus) {
        // ATUALIZAR (PUT)
        await axios.put(`${API_URL}/cadastros/onibus/${currentOnibus.id}`, formData);
      } else {
        // CRIAR (POST)
        await axios.post(`${API_URL}/cadastros/onibus`, formData);
      }
      fetchOnibus(); 
      handleCloseModal();
    } catch (err) {
      console.error("Erro ao salvar:", err.response?.data?.error || err.message);
      setModalError(err.response?.data?.error || 'Erro ao salvar. Verifique os dados.');
    }
  };

  const handleDeleteOnibus = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este ônibus?')) {
      try {
        await axios.delete(`${API_URL}/cadastros/onibus/${id}`);
        fetchOnibus();
      } catch (err) {
        setError('Erro ao excluir ônibus.');
        console.error(err);
      }
    }
  };


  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      
      {/* Cabeçalho e Botão de Adicionar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Ônibus
        </h2>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center bg-brand-500 text-white py-2 px-4 rounded-lg shadow hover:bg-brand-600 transition-colors"
        >
          <Bus size={18} className="mr-2" />
          Adicionar Ônibus
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {onibusLista.map((onibus) => (
                <tr key={onibus.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{onibus.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{onibus.numero_onibus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{onibus.placa || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{onibus.empresa_parceira}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{onibus.capacidade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button
                      onClick={() => handleOpenModal(onibus)}
                      className="text-brand-600 hover:text-brand-800"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteOnibus(onibus.id)}
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

      {/* Mensagem caso não haja ônibus */}
      {!loading && !error && onibusLista.length === 0 && (
         <p className="text-gray-500 mt-4">Nenhum ônibus encontrado. Clique em "Adicionar Ônibus" para começar.</p>
      )}

      {/* O Modal */}
      <OnibusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveOnibus}
        onibus={currentOnibus}
        error={modalError}
      />

    </div>
  );
}