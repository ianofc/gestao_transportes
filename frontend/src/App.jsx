import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Truck, 
  FileText, 
  LogOut, 
  Building, 
  Ticket, 
  Wrench,
  BarChart3,
  Bus,
  UserCheck
} from 'lucide-react';

// Importa as páginas da nova pasta 'pages'
import DashboardPage from './pages/DashboardPage';
import VendasPage from './pages/VendasPage';
import OperacionalPage from './pages/OperacionalPage';
import RelatoriosPage from './pages/RelatoriosPage';
import CadastrosPage from './pages/CadastrosPage';
import UsuariosPage from './pages/UsuariosPage';

// URL base da sua API Flask (backend)
const API_URL = 'http://localhost:5000/api';

/**
 * Componente Principal: App
 * Gere o estado de autenticação e o roteamento de página.
 */
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Efeito para verificar o token e carregar o perfil do usuário
  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await axios.get(`${API_URL}/auth/perfil`);
          setUser(response.data.usuario);
          setToken(storedToken);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  // Função de Login
  const handleLogin = async (username, password) => {
    setError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        usuario: username,
        senha: password
      });

      const { access_token, usuario } = response.data;

      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setToken(access_token);
      setUser(usuario); // O 'usuario' (com nivel_acesso) é guardado no estado
      setCurrentPage('dashboard');
      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Credenciais inválidas. Tente novamente.');
      } else {
        setError('Erro ao conectar ao servidor. Tente mais tarde.');
      }
    }
  };

  // Função de Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold">A carregar...</div>
      </div>
    );
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} error={error} />;
  }

  return (
    <DashboardLayout 
      user={user} 
      onLogout={handleLogout} 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage} 
    />
  );
}

/**
 * Página de Login
 */
function LoginPage({ onLogin, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      // Substituído alert() por uma mensagem de erro no estado
      alert("Por favor, preencha o usuário e a senha.");
      return;
    }
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <Bus size={48} className="text-brand-500" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Gestão de Transportes
        </h2>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700"
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              placeholder="seu.usuario"
            />
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-brand-500 rounded-md shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Layout Principal do Dashboard
 */
function DashboardLayout({ user, onLogout, currentPage, setCurrentPage }) {
  return (
    <div className="flex h-screen bg-gray-50 font-inter">
      {/* Sidebar (Menu Lateral) */}
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-50 p-6 md:p-10">
          {renderPage(currentPage)}
        </main>
      </div>
    </div>
  );
}

/**
 * Sidebar (Menu Lateral)
 */
function Sidebar({ user, onLogout, currentPage, setCurrentPage }) {
  return (
    <aside className="w-64 bg-brand-900 text-white flex flex-col shadow-lg">
      <div className="h-16 flex items-center justify-center px-4 shadow-md">
         <Bus size={28} className="text-brand-300" />
        <h1 className="ml-3 text-xl font-semibold">Gestão Transp.</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard"
          pageName="dashboard"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        
        <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Módulos
        </h3>
        
        <NavItem 
          icon={<ShoppingCart size={20} />} 
          label="Vendas"
          pageName="vendas"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <NavItem 
          icon={<Truck size={20} />} 
          label="Operacional"
          pageName="operacional"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <NavItem 
          icon={<FileText size={20} />} 
          label="Relatórios"
          pageName="relatorios"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        
        <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Gestão
        </h3>
        
        {/* 'Cadastros' é visível para todos os utilizadores logados */}
        <NavItem 
          icon={<Wrench size={20} />} 
          label="Cadastros"
          pageName="cadastros"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        
        {/* MODIFICADO: 'Usuários' só é visível para 'admin' */}
        {user && user.nivel_acesso === 'admin' && (
           <NavItem 
            icon={<Users size={20} />} 
            label="Usuários"
            pageName="usuarios"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </nav>
      
      {/* Rodapé do Sidebar com Infos do Usuário */}
      <div className="border-t border-brand-700 p-4">
        <div className="flex items-center">
           <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
             <span className="text-lg font-bold">
               {user ? user.nome_completo.charAt(0).toUpperCase() : '?'}
             </span>
           </div>
           <div className="ml-3">
             <p className="text-sm font-medium">{user ? user.nome_completo : 'Usuário'}</p>
             <p className="text-xs text-gray-300">{user ? user.nivel_acesso : 'N/A'}</p>
           </div>
           <button 
             onClick={onLogout}
             className="ml-auto flex-shrink-0 p-2 text-gray-300 hover:text-white rounded-full hover:bg-brand-700"
             title="Sair"
           >
             <LogOut size={18} />
           </button>
        </div>
      </div>
    </aside>
  );
}

/**
 * Componente de Item de Navegação
 */
function NavItem({ icon, label, pageName, currentPage, setCurrentPage }) {
  const isActive = currentPage === pageName;
  
  return (
    <button
      onClick={() => setCurrentPage(pageName)}
      className={`
        w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium
        transition-colors duration-150 ease-in-out
        ${isActive 
          ? 'bg-brand-700 text-white shadow-inner'
          : 'text-gray-200 hover:bg-brand-700 hover:text-white'
        }
      `}
    >
      <span className="flex-shrink-0 w-6">{icon}</span>
      <span className="ml-3">{label}</span>
    </button>
  );
}

/**
 * Função "Roteadora": Renderiza o componente da página correta.
 */
function renderPage(pageName) {
  switch (pageName) {
    case 'dashboard':
      return <DashboardPage />;
    case 'vendas':
      return <VendasPage />;
    case 'operacional':
      return <OperacionalPage />;
    case 'relatorios':
      return <RelatoriosPage />;
    case 'cadastros':
      return <CadastrosPage />;
    case 'usuarios':
      return <UsuariosPage />;
    default:
      return <DashboardPage />;
  }
}