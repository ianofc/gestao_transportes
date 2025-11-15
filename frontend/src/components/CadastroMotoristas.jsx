import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import MotoristaModal from './MotoristaModal'; // Importa o novo modal

// O URL base da API
const API_URL = 'http://localhost:5000/api';

export default function CadastroMotoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Erro da lista
  const [modalError, setModalError] = useState(null); // Erro do modal
  
  // Estados de controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMotorista, setCurrentMotorista] = useState(null); // null = Criar, Objeto = Editar

  // Função para buscar os dados (agora reutilizável)
  const fetchMotoristas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cadastros/motoristas`);
      setMotoristas(response.data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar os motoristas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os dados quando o componente é montado
  useEffect(() => {
    fetchMotoristas();
  }, []); // O array vazio [] garante que isto só executa uma vez

  // --- Funções CRUD ---

  const handleOpenModal = (motorista = null) => {
    setCurrentMotorista(motorista); // Se 'motorista' for null, é modo "Criar"
    setIsModalOpen(true);
    setModalError(null); // Limpa erros antigos do modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMotorista(null);
    setModalError(null);
  };

  const handleSaveMotorista = async (formData) => {
    try {
      if (currentMotorista) {
        // ATUALIZAR (PUT)
        await axios.put(`${API_URL}/cadastros/motoristas/${currentMotorista.id}`, formData);
      } else {
        // CRIAR (POST)
        await axios.post(`${API_URL}/cadastros/motoristas`, formData);
      }
      
      fetchMotoristas(); // Recarrega a lista
      handleCloseModal();  // Fecha o modal

    } catch (err) {
      console.error("Erro ao salvar:", err.response?.data?.error || err.message);
      setModalError(err.response?.data?.error || 'Erro ao salvar. Verifique os dados.');
    }
  };

  const handleDeleteMotorista = async (id) => {
    // Pede confirmação
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      try {
        await axios.delete(`${API_URL}/cadastros/motoristas/${id}`);
        fetchMotoristas(); // Recarrega a lista
      } catch (err) {
        setError('Erro ao excluir motorista.');
        console.error(err);
      }
    }
  };


  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      
      {/* Cabeçalho e Botão de Adicionar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Motoristas
        </h2>
        <button 
          onClick={() => handleOpenModal(null)} // Chama o modal em modo "Criar"
          className="flex items-center bg-brand-500 text-white py-2 px-4 rounded-lg shadow hover:bg-brand-600 transition-colors"
        >
          <UserPlus size={18} className="mr-2" />
          Adicionar Motorista
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Completo</th>
                {/* REMOVIDO: Coluna CPF */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {motoristas.map((motorista) => (
                <tr key={motorista.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{motorista.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{motorista.nome_completo}</td>
                  {/* REMOVIDO: Coluna CPF */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{motorista.contato || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button
                      onClick={() => handleOpenModal(motorista)} // Chama o modal em modo "Editar"
                      className="text-brand-600 hover:text-brand-800"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteMotorista(motorista.id)}
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

      {/* Mensagem caso não haja motoristas */}
      {!loading && !error && motoristas.length === 0 && (
         <p className="text-gray-500 mt-4">Nenhum motorista encontrado. Clique em "Adicionar Motorista" para começar.</p>
      )}

      {/* O Modal (controlado pelos estados) */}
      <MotoristaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMotorista}
        motorista={currentMotorista}
        error={modalError}
      />

    </div>
  );
}