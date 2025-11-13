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
          // Define o token no cabeçalho do axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          const response = await axios.get(`${API_URL}/auth/perfil`);
          setUser(response.data.usuario);
          setToken(storedToken);
        } catch (err) {
          // Token inválido ou expirado
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
    setError(''); // Limpa erros anteriores
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        usuario: username,
        senha: password
      });

      const { access_token, usuario } = response.data;

      // Armazena o token
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Atualiza o estado
      setToken(access_token);
      setUser(usuario);
      setCurrentPage('dashboard'); // Redireciona para o dashboard
      
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
    setCurrentPage('login'); // Garante que a página de login seja mostrada
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold">A carregar...</div>
      </div>
    );
  }

  // Se não houver token, mostra a página de login
  if (!token) {
    return <LoginPage onLogin={handleLogin} error={error} />;
  }

  // Se houver token, mostra o Dashboard
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
      alert("Por favor, preencha o usuário e a senha.");
      return;
    }
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <Bus size={48} className="text-blue-600" />
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
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-10">
          {/* Renderiza a página atual com base no estado */}
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
    <aside className="w-64 bg-gray-800 text-white flex flex-col shadow-lg">
      <div className="h-16 flex items-center justify-center px-4 shadow-md">
         <Bus size={28} className="text-blue-400" />
        <h1 className="ml-3 text-xl font-semibold">Gestão Transp.</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Itens de Navegação */}
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
        
        <NavItem 
          icon={<Wrench size={20} />} 
          label="Cadastros"
          pageName="cadastros"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
         <NavItem 
          icon={<Users size={20} />} 
          label="Usuários"
          pageName="usuarios"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </nav>
      
      {/* Rodapé do Sidebar com Infos do Usuário */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center">
           <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
             <span className="text-lg font-bold">
               {user ? user.nome_completo.charAt(0).toUpperCase() : '?'}
             </span>
           </div>
           <div className="ml-3">
             <p className="text-sm font-medium">{user ? user.nome_completo : 'Usuário'}</p>
             <p className="text-xs text-gray-400">{user ? user.nivel_acesso : 'N/A'}</p>
           </div>
           <button 
             onClick={onLogout}
             className="ml-auto flex-shrink-0 p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
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
          ? 'bg-blue-600 text-white shadow-inner' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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

// --- Componentes de Página (Placeholders) ---
// (Estes seriam movidos para seus próprios ficheiros num projeto maior)

function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="mt-2 text-gray-600">Bem-vindo ao sistema de gestão.</p>
      {/* Aqui entrariam gráficos e estatísticas rápidas */}
    </div>
  );
}

function VendasPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Módulo de Vendas</h1>
      <p className="mt-2 text-gray-600">Abertura/Fecho de caixa e registo de vendas.</p>
      {/* Componentes de Venda (ex: Abrir Caixa, Vender Bilhete) */}
    </div>
  );
}

function OperacionalPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Módulo Operacional</h1>
      <p className="mt-2 text-gray-600">Agendamento de viagens e registos operacionais.</p>
      {/* Componentes Operacionais (ex: Tabela de Viagens, Formulário de Registo) */}
    </div>
  );
}

function RelatoriosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Módulo de Relatórios</h1>
      <p className="mt-2 text-gray-600">Geração de relatórios PDF e DOCX.</p>
      {/* Componentes de Relatório (ex: Filtros de Data, Botões de Download) */}
    </div>
  );
}

function CadastrosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Módulo de Cadastros</h1>
      <p className="mt-2 text-gray-600">Gestão de Motoristas, Ônibus e Rotas.</p>
      {/* Componentes de CRUD (ex: Tabela de Motoristas, Modal de Edição) */}
    </div>
  );
}

function UsuariosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Gestão de Usuários</h1>
      <p className="mt-2 text-gray-600">Gestão de bilheteiros e administradores (Apenas Admin).</p>
      {/* Componente de CRUD de Usuários */}
    </div>
  );
}