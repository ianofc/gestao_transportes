import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Archive, Ticket, DollarSign, Lock, Unlock, PlusCircle } from 'lucide-react';
import AbrirCaixaModal from '../components/AbrirCaixaModal';
import VendaModal from '../components/VendaModal';

const API_URL = 'http://localhost:5000/api';

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (value) => {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- Componente da Aba Caixa ---
function TabCaixa({ caixaAtivo, fetchCaixaAtivo }) {
  const [caixas, setCaixas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCaixas = async () => {
    try { setLoading(true); const res = await axios.get(`${API_URL}/vendas/caixa`); setCaixas(res.data); setError(null); }
    catch (err) { setError('Falha ao carregar histórico de caixas.'); }
    finally { setLoading(false); }
  };
  
  useEffect(() => { fetchCaixas(); }, [caixaAtivo]); // Recarrega histórico quando o caixa ativo muda
  
  const handleOpenModal = () => { setIsModalOpen(true); setModalError(null); };
  const handleCloseModal = () => { setIsModalOpen(false); setModalError(null); };

  const handleAbrirCaixa = async (formData) => {
    try {
      await axios.post(`${API_URL}/vendas/caixa/abrir`, formData);
      fetchCaixaAtivo(); // Atualiza o estado global
      handleCloseModal();
    } catch (err) { setModalError(err.response?.data?.error || 'Erro ao abrir caixa.'); }
  };

  const handleFecharCaixa = async () => {
    if (window.confirm('Tem certeza que deseja fechar o caixa? Esta ação não pode ser desfeita.')) {
      try {
        await axios.post(`${API_URL}/vendas/caixa/fechar`);
        fetchCaixaAtivo(); // Atualiza o estado global
      } catch (err) { setError(err.response?.data?.error || 'Erro ao fechar caixa.'); }
    }
  };

  return (
    <div>
      {/* Card do Caixa Ativo */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Caixa Atual</h2>
        {caixaAtivo ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div><p className="text-sm text-gray-500">Saldo Inicial</p><p className="font-semibold">{formatCurrency(caixaAtivo.saldo_inicial)}</p></div>
              <div><p className="text-sm text-gray-500">Vendas (Dinheiro)</p><p className="font-semibold">{formatCurrency(caixaAtivo.total_vendas_dinheiro)}</p></div>
              <div><p className="text-sm text-gray-500">Vendas (Pix/Cartão)</p><p className="font-semibold">{formatCurrency(caixaAtivo.total_vendas_pix + caixaAtivo.total_vendas_cartao)}</p></div>
              <div><p className="text-sm text-gray-500">Total em Vendas</p><p className="font-semibold text-brand-600">{formatCurrency(caixaAtivo.total_geral_vendas)}</p></div>
            </div>
            <button onClick={handleFecharCaixa} className="flex items-center bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600">
              <Lock size={18} className="mr-2" /> Fechar Caixa
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Não há caixa aberto para o seu usuário.</p>
            <button onClick={handleOpenModal} className="flex items-center bg-brand-500 text-white py-2 px-4 rounded-lg shadow hover:bg-brand-600">
              <Unlock size={18} className="mr-2" /> Abrir Novo Caixa
            </button>
          </div>
        )}
      </div>
      
      {/* Histórico de Caixas */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Histórico de Caixas</h2>
        {loading && <p>A carregar...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abertura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Inicial</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Vendas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caixas.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(c.data_abertura)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(c.data_fechamento)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(c.saldo_inicial)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-600">{formatCurrency(c.total_geral_vendas)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'Aberto' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {caixas.length === 0 && <p className="text-gray-500 mt-4">Nenhum histórico de caixa encontrado.</p>}
          </div>
        )}
      </div>
      <AbrirCaixaModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleAbrirCaixa} error={modalError} />
    </div>
  );
}

// --- Componente da Aba Vendas ---
function TabVendas({ caixaAtivo, fetchCaixaAtivo }) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVendas = async () => {
    try { setLoading(true); const res = await axios.get(`${API_URL}/vendas/vendas`); setVendas(res.data); setError(null); }
    catch (err) { setError('Falha ao carregar vendas.'); }
    finally { setLoading(false); }
  };
  
  useEffect(() => { fetchVendas(); }, []);
  
  const handleOpenModal = () => { 
    if (!caixaAtivo) {
      alert("É preciso abrir o caixa antes de registrar uma venda.");
      return;
    }
    setIsModalOpen(true); 
    setModalError(null);
  };
  const handleCloseModal = () => { setIsModalOpen(false); setModalError(null); };

  const handleSaveVenda = async (formData) => {
    try {
      await axios.post(`${API_URL}/vendas/vendas`, formData);
      fetchVendas();       // Atualiza a lista de vendas
      fetchCaixaAtivo(); // Atualiza o saldo do caixa ativo
      handleCloseModal();
    } catch (err) { setModalError(err.response?.data?.error || 'Erro ao registrar venda.'); }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Últimas Vendas</h2>
        <button onClick={handleOpenModal} disabled={!caixaAtivo} className="flex items-center bg-brand-500 text-white py-2 px-4 rounded-lg shadow hover:bg-brand-600 disabled:bg-gray-400">
          <Ticket size={18} className="mr-2" /> Nova Venda
        </button>
      </div>
      {loading && <p>A carregar...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passageiro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poltrona</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendas.map((v) => (
                <tr key={v.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(v.data_hora_venda)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{v.nome_passageiro}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.numero_poltrona}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-600">{formatCurrency(v.valor_passagem)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.metodo_pagamento}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vendas.length === 0 && <p className="text-gray-500 mt-4">Nenhuma venda registrada.</p>}
        </div>
      )}
      <VendaModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveVenda} error={modalError} />
    </div>
  );
}


// --- Componente Principal da Página ---
export default function VendasPage() {
  const [activeTab, setActiveTab] = useState('caixa');
  const [caixaAtivo, setCaixaAtivo] = useState(null);

  // Esta função é central, ela busca o caixa ativo e
  // é passada para os componentes filhos para que eles possam
  // atualizar o estado global
  const fetchCaixaAtivo = async () => {
    try {
      const res = await axios.get(`${API_URL}/vendas/caixa/ativo`);
      setCaixaAtivo(res.data);
    } catch (err) {
      console.error("Erro ao buscar caixa ativo", err);
    }
  };

  useEffect(() => {
    fetchCaixaAtivo();
  }, []);

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
        Módulo de Vendas
      </h1>
      
      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('caixa')} className={getTabClass('caixa')}>
          <Archive size={18} className="mr-2" /> Caixa
        </button>
        <button onClick={() => setActiveTab('vendas')} className={getTabClass('vendas')}>
          <Ticket size={18} className="mr-2" /> Registrar Venda
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'caixa' ? (
          <TabCaixa caixaAtivo={caixaAtivo} fetchCaixaAtivo={fetchCaixaAtivo} />
        ) : (
          <TabVendas caixaAtivo={caixaAtivo} fetchCaixaAtivo={fetchCaixaAtivo} />
        )}
      </div>
    </div>
  );
}