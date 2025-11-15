import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Edit, Trash2, KeyRound } from 'lucide-react'; // Adicionado KeyRound
import UsuarioModal from '../components/UsuarioModal';

const API_URL = 'http://localhost:5000/api';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [modalError, setModalError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState(null); 
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null); // Limpa erros antigos
      const response = await axios.get(`${API_URL}/auth/usuarios`);
      setUsuarios(response.data);
    } catch (err) {
      setError('Não foi possível carregar a lista de usuários.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // --- Funções CRUD ---

  const handleOpenModal = (usuario = null) => {
    setCurrentUsuario(usuario);
    setIsModalOpen(true);
    setModalError(null);
    setSuccessMessage('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUsuario(null);
    setModalError(null);
  };

  const handleSaveUsuario = async (formData) => {
    try {
      setSuccessMessage(''); // Limpa msg
      if (currentUsuario) {
        await axios.put(`${API_URL}/auth/usuarios/${currentUsuario.id}`, formData);
        setSuccessMessage('Usuário atualizado com sucesso!');
      } else {
        const response = await axios.post(`${API_URL}/auth/register`, formData);
        setSuccessMessage(`Usuário '${response.data.usuario.usuario}' criado com sucesso!`);
      }
      fetchUsuarios(); 
      handleCloseModal();
      
    } catch (err) {
      console.error("Erro ao salvar usuário:", err.response?.data?.error || err.message);
      setModalError(err.response?.data?.error || 'Erro ao salvar. Verifique os dados.');
    }
  };

  const handleDeleteUsuario = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?\n\n(Atenção: A exclusão falhará se o usuário já tiver vendas ou registros associados.)')) {
      try {
        setSuccessMessage(''); // Limpa msg
        await axios.delete(`${API_URL}/auth/usuarios/${id}`);
        setSuccessMessage('Usuário excluído com sucesso!');
        fetchUsuarios();
      } catch (err) {
        setError(err.response?.data?.error || 'Erro ao excluir usuário.');
        console.error(err);
      }
    }
  };
  
  // --- NOVA FUNÇÃO: Reset de Senha ---
  const handleResetPassword = async (id, nome) => {
    const novaSenha = prompt(`Digite a NOVA senha para o usuário ${nome}:`);
    
    if (novaSenha && novaSenha.length >= 3) {
      try {
        setSuccessMessage(''); // Limpa msg
        await axios.post(`${API_URL}/auth/usuarios/${id}/reset-password`, { nova_senha: novaSenha });
        setSuccessMessage(`Senha do usuário ${nome} atualizada com sucesso!`);
      } catch (err) {
         setError(err.response?.data?.error || 'Erro ao resetar senha.');
         console.error(err);
      }
    } else if (novaSenha) {
      alert("A senha deve ter pelo menos 3 caracteres.");
    }
  };


  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestão de Usuários
        </h1>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center bg-brand-500 text-white py-2 px-4 rounded-lg shadow hover:bg-brand-600 transition-colors"
        >
          <UserPlus size={18} className="mr-2" />
          Adicionar Usuário
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-600">A carregar...</p>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Completo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{usuario.nome_completo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.usuario}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.nivel_acesso === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {usuario.nivel_acesso}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    {/* Botão Resetar Senha */}
                    <button
                      onClick={() => handleResetPassword(usuario.id, usuario.nome_completo)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Resetar Senha"
                    >
                      <KeyRound size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(usuario)}
                      className="text-brand-600 hover:text-brand-800"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUsuario(usuario.id)}
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

      {!loading && !error && usuarios.length === 0 && (
         <p className="text-gray-500 mt-4">Nenhum usuário encontrado. Clique em "Adicionar Usuário" para começar.</p>
      )}

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUsuario}
        usuario={currentUsuario}
        error={modalError}
      />

    </div>
  );
}