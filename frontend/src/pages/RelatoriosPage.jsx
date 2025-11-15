import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileDown, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Função para formatar data/hora
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// Hook customizado para download de arquivos
const useFileDownloader = () => {
  const [downloading, setDownloading] = useState(null); // Armazena o ID do item
  const [error, setError] = useState(null);

  const downloadFile = async ({ url, filename }) => {
    try {
      setError(null);
      setDownloading(filename); // Usa o filename como ID
      
      const response = await axios.get(url, {
        responseType: 'blob', // Importante para download de arquivos
      });

      // Cria um link temporário para o download
      const href = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Limpeza
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

    } catch (err) {
      console.error("Erro no download:", err);
      setError('Falha no download do relatório.');
    } finally {
      setDownloading(null);
    }
  };
  
  return { downloadFile, downloading, error };
};


export default function RelatoriosPage() {
  const [viagens, setViagens] = useState([]);
  const [caixas, setCaixas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { downloadFile, downloading, error: downloadError } = useFileDownloader();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [viagensRes, caixasRes] = await Promise.all([
          axios.get(`${API_URL}/operacional/viagens`),
          axios.get(`${API_URL}/vendas/caixa`)
        ]);
        // Filtra por viagens concluídas e caixas fechados
        setViagens(viagensRes.data.filter(v => v.status === 'Concluída'));
        setCaixas(caixasRes.data.filter(c => c.status === 'Fechado'));
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleDownloadViagens = () => {
    // TODO: Adicionar filtros de data
    downloadFile({
      url: `${API_URL}/relatorios/viagens/docx`,
      filename: `relatorio_viagens_${new Date().toISOString().split('T')[0]}.docx`
    });
  };
  
  const handleDownloadCaixa = (caixaId) => {
     downloadFile({
      url: `${API_URL}/relatorios/caixa/${caixaId}/pdf`,
      filename: `relatorio_caixa_${caixaId}.pdf`
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Módulo de Relatórios</h1>
      
      {downloadError && <p className="text-red-500 mb-4">{downloadError}</p>}
      
      {/* Relatório de Viagens */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Relatório de Viagens</h2>
          <button 
            onClick={handleDownloadViagens}
            disabled={downloading === `relatorio_viagens_${new Date().toISOString().split('T')[0]}.docx`}
            className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400"
          >
            {downloading === `relatorio_viagens_${new Date().toISOString().split('T')[0]}.docx` ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet size={18} className="mr-2" />
            )}
            Baixar DOCX de Viagens
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">Gera um relatório DOCX de todas as viagens (concluídas ou não). Filtros de data serão adicionados em breve.</p>
      </div>
      
      {/* Relatório de Caixas */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Relatório de Fecho de Caixa (PDF)</h2>
        {loading && <p>A carregar históricos de caixa...</p>}
        {!loading && (
           <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bilheteiro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Fechamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Vendas</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caixas.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.bilheteiro_nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(c.data_fechamento)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-600">{formatCurrency(c.total_geral_vendas)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDownloadCaixa(c.id)}
                        disabled={downloading === `relatorio_caixa_${c.id}.pdf`}
                        className="flex items-center text-red-600 hover:text-red-800 disabled:text-gray-400"
                      >
                         {downloading === `relatorio_caixa_${c.id}.pdf` ? (
                          <Loader2 size={18} className="mr-1 animate-spin" />
                         ) : (
                          <FileText size={18} className="mr-1" />
                         )}
                        Baixar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {caixas.length === 0 && <p className="text-gray-500 mt-4">Nenhum caixa fechado encontrado para gerar relatórios.</p>}
          </div>
        )}
      </div>
      
    </div>
  );
}