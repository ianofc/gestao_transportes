import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Bus, Map, Truck } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Componente Card de Estatística
function StatCard({ title, value, icon, loading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className="p-3 rounded-full bg-brand-100 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <p className="text-2xl font-semibold text-gray-900">...</p>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    motoristas: 0,
    onibus: 0,
    rotas: 0,
    viagens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Busca todas as contagens em paralelo
        const [motoristasRes, onibusRes, rotasRes, viagensRes] = await Promise.all([
          axios.get(`${API_URL}/cadastros/motoristas`),
          axios.get(`${API_URL}/cadastros/onibus`),
          axios.get(`${API_URL}/cadastros/rotas`),
          axios.get(`${API_URL}/operacional/viagens`)
        ]);
        
        setStats({
          motoristas: motoristasRes.data.length,
          onibus: onibusRes.data.length,
          rotas: rotasRes.data.length,
          viagens: viagensRes.data.length,
        });
        
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Motoristas Cadastrados" 
          value={stats.motoristas} 
          icon={<User size={24} />} 
          loading={loading}
        />
        <StatCard 
          title="Ônibus na Frota" 
          value={stats.onibus} 
          icon={<Bus size={24} />} 
          loading={loading}
        />
        <StatCard 
          title="Rotas Definidas" 
          value={stats.rotas} 
          icon={<Map size={24} />} 
          loading={loading}
        />
        <StatCard 
          title="Viagens Agendadas" 
          value={stats.viagens} 
          icon={<Truck size={24} />} 
          loading={loading}
        />
      </div>
      
      {/* TODO: Adicionar gráficos ou tabelas de próximas viagens */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800">Próximas Viagens</h2>
        <p className="mt-2 text-gray-600">(Em breve)</p>
      </div>
      
    </div>
  );
}