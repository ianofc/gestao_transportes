import React, { useState } from 'react';
import { User, Bus, Map } from 'lucide-react';

// Importa os componentes reais
import CadastroMotoristas from '../components/CadastroMotoristas';
import CadastroOnibus from '../components/CadastroOnibus';
import CadastroRotas from '../components/CadastroRotas'; // MODIFICADO


export default function CadastrosPage() {
  const [activeTab, setActiveTab] = useState('motoristas');

  const renderContent = () => {
    switch (activeTab) {
      case 'motoristas':
        return <CadastroMotoristas />;
      case 'onibus':
        return <CadastroOnibus />;
      case 'rotas':
        // Agora renderiza o componente importado
        return <CadastroRotas />; 
      default:
        return null;
    }
  };

  // Função auxiliar para classes de estilo da Aba
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
        Módulo de Cadastros
      </h1>
      
      {/* Abas de Navegação */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('motoristas')}
          className={getTabClass('motoristas')}
        >
          <User size={18} className="mr-2" />
          Motoristas
        </button>
        <button 
          onClick={() => setActiveTab('onibus')}
          className={getTabClass('onibus')}
        >
          <Bus size={18} className="mr-2" />
          Ônibus
        </button>
        <button 
          onClick={() => setActiveTab('rotas')}
          className={getTabClass('rotas')}
        >
          <Map size={18} className="mr-2" />
          Rotas
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
}