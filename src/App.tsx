import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { 
  Users, 
  LayoutDashboard, 
  GraduationCap, 
  ClipboardCheck, 
  DollarSign, 
  LogOut, 
  Plus, 
  Search, 
  User,
  BookOpen,
  Calendar,
  ChevronRight,
  School,
  Bell,
  FileText,
  Settings as SettingsIcon,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  MessageSquare,
  Download,
  Filter,
  Menu,
  Printer,
  X,
  Briefcase,
  ShieldCheck,
  Camera,
  Check,
  Upload,
  Edit,
  Trash2,
  Database,
  Shield,
  Award,
  Key,
  Map,
  MessageCircle,
  Mail,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import api from './lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPerms, setUserPerms] = useState<any[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    if (user.id) {
      api.get(`/permissoes/${user.id}`)
        .then(res => {
          setUserPerms(res.data);
          setLoadingPerms(false);
        })
        .catch(() => setLoadingPerms(false));
    } else {
      setLoadingPerms(false);
    }
  }, [user.id]);

  const isAdmin = user.perfil === 'admin';
  const isProfessor = user.perfil === 'professor';

  const hasAccess = (tela: string) => {
    if (isAdmin) return true;
    const perm = userPerms.find(p => p.tela === tela);
    return perm?.pode_acessar === 1;
  };

  if (loadingPerms) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Carregando permissões...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <School className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">EduManager</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 lg:w-72",
        sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
      )}>
        <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <School className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">EduManager</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar mt-12 lg:mt-0">
          {hasAccess('Painel') && <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Painel" active={location.pathname === '/dashboard'} />}
          
          {hasAccess('Mural do Aluno') && (
            <SidebarItem to="/mural" icon={BookOpen} label="Mural do Aluno" active={location.pathname === '/mural'} />
          )}
          
          {hasAccess('Alunos') && <SidebarItem to="/alunos" icon={Users} label="Alunos" active={location.pathname === '/alunos'} />}
          {hasAccess('Acadêmico') && <SidebarItem to="/academic" icon={BookOpen} label="Acadêmico" active={location.pathname === '/academic'} />}
          {hasAccess('Professor') && <SidebarItem to="/professor" icon={GraduationCap} label="Professor" active={location.pathname === '/professor'} />}
          {hasAccess('Mapa de Sala') && <SidebarItem to="/mapa-sala" icon={Map} label="Mapa de Sala" active={location.pathname === '/mapa-sala'} />}
          {hasAccess('Funcionários') && <SidebarItem to="/funcionarios" icon={Briefcase} label="Funcionários" active={location.pathname === '/funcionarios'} />}
          {hasAccess('Financeiro') && <SidebarItem to="/financeiro" icon={DollarSign} label="Financeiro" active={location.pathname === '/financeiro'} />}
          {hasAccess('Comunicação') && <SidebarItem to="/comunicacao" icon={MessageSquare} label="Comunicação" active={location.pathname === '/comunicacao'} />}
          {hasAccess('Secretaria') && <SidebarItem to="/secretaria" icon={FileText} label="Secretaria" active={location.pathname === '/secretaria'} />}
          {hasAccess('Acesso') && <SidebarItem to="/controle-acesso" icon={ShieldCheck} label="Acesso" active={location.pathname === '/controle-acesso'} />}
          {hasAccess('Configurações') && <SidebarItem to="/configuracoes" icon={SettingsIcon} label="Configurações" active={location.pathname === '/configuracoes'} />}
          
          {isAdmin && (
            <button
              onClick={() => window.open('/api/download-db', '_blank')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all duration-200 group w-full text-left"
            >
              <Download size={20} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:scale-110" />
              <span className="font-medium">Backup de Dados</span>
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user.nome?.[0] || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-800 truncate">{user.nome}</span>
              <span className="text-xs text-slate-500 capitalize">{user.perfil}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-10 pt-24 lg:pt-10 w-full max-w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

// --- Pages ---

const Login = () => {
  const [email, setEmail] = useState('admin@admin.com');
  const [senha, setSenha] = useState('123');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', { email, senha });
      if (res.data.user.perfil === 'aluno' && res.data.user.primeiro_acesso) {
        localStorage.setItem('tempToken', res.data.token);
        localStorage.setItem('tempUser', JSON.stringify(res.data.user));
        setMustChangePassword(true);
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('tempToken');
      await axios.post('/api/change-password', { novaSenha }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = JSON.parse(localStorage.getItem('tempUser') || '{}');
      user.primeiro_acesso = false;
      localStorage.setItem('token', token!);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('tempToken');
      localStorage.removeItem('tempUser');
      alert('Senha alterada com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      alert('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 overflow-hidden"
      >
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200">
              <School className="text-white" size={40} />
            </div>
          </div>
          
          {!mustChangePassword ? (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Bem-vindo</h2>
              <p className="text-slate-500 text-center mb-10">Acesse o sistema da sua escola</p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="exemplo@escola.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Primeiro Acesso</h2>
              <p className="text-slate-500 text-center mb-10">Por segurança, você deve alterar sua senha temporária.</p>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nova Senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Repita a nova senha"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Alterando...' : 'Confirmar Nova Senha'}
                </button>
              </form>
            </>
          )}
        </div>
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500">EduManager SaaS &copy; 2026</p>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({ alunos: 0, financeiro: 0, turmas: 0, inadimplencia: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [alunoData, setAlunoData] = useState<any>(null);
  const [showMatriculaModal, setShowMatriculaModal] = useState(false);
  const [matriculaData, setMatriculaData] = useState({ aluno_id: '', turma_id: '' });
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.perfil === 'admin';

  const fetchData = async () => {
    try {
      if (user.perfil === 'aluno') {
        const res = await api.get(`/portal-aluno/${user.aluno_id}`);
        setAlunoData(res.data);
      } else {
        const [alunosRes, financeiroRes, turmasRes] = await Promise.all([
          api.get('/alunos'),
          api.get('/financeiro'),
          api.get('/turmas')
        ]);
        
        setAlunos(alunosRes.data);
        setTurmas(turmasRes.data);

        const totalFinanceiro = financeiroRes.data.reduce((acc: number, curr: any) => acc + curr.valor, 0);
        const inadimplentes = financeiroRes.data.filter((f: any) => f.status === 'pendente' || f.status === 'atrasado').length;

        setStats({
          alunos: alunosRes.data.length,
          financeiro: totalFinanceiro,
          turmas: turmasRes.data.length,
          inadimplencia: inadimplentes
        });

        setChartData([
          { name: 'Jan', matriculas: 45, financeiro: 12000 },
          { name: 'Fev', matriculas: 52, financeiro: 15000 },
          { name: 'Mar', matriculas: 48, financeiro: 14000 },
          { name: 'Abr', matriculas: 61, financeiro: 18000 },
          { name: 'Mai', matriculas: 55, financeiro: 16500 },
          { name: 'Jun', matriculas: 67, financeiro: 21000 },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.perfil, user.aluno_id]);

  const handleMatricula = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/matriculas', matriculaData);
      alert('Matrícula realizada com sucesso!');
      setShowMatriculaModal(false);
      fetchData();
    } catch (err) {
      alert('Erro ao realizar matrícula');
    }
  };

  if (user.perfil === 'aluno') {
    if (!alunoData) return <div className="p-10 text-slate-500">Carregando portal...</div>;
    return (
      <div className="space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Olá, {user.nome}!</h1>
            <p className="text-slate-500 mt-2">Acompanhe seu desempenho acadêmico e financeiro.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <Calendar className="text-indigo-600" size={20} />
            <span className="font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center relative z-10">
              <GraduationCap size={24} />
            </div>
            <div className="relative z-10">
              <span className="text-slate-500 font-medium">Média Geral</span>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {((alunoData.notas.reduce((acc: number, n: any) => acc + (n.media || 0), 0) / (alunoData.notas.length || 1)) || 0).toFixed(1)}
              </h3>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center relative z-10">
              <ClipboardCheck size={24} />
            </div>
            <div className="relative z-10">
              <span className="text-slate-500 font-medium">Frequência</span>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {(alunoData.frequencia.percentual || 0).toFixed(0)}%
              </h3>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center relative z-10">
              <DollarSign size={24} />
            </div>
            <div className="relative z-10">
              <span className="text-slate-500 font-medium">Situação Financeira</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {alunoData.financeiro.some((f: any) => f.status === 'pendente' || f.status === 'atrasado') ? 'Pendências' : 'Regular'}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                Minhas Notas
              </h2>
              <button className="text-xs font-bold text-indigo-600 hover:underline">Ver Detalhes</button>
            </div>
            <div className="p-2 overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="text-xs font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Disciplina</th>
                    <th className="px-6 py-4 text-center">Média</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {alunoData.notas.map((n: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">{n.disciplina}</td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-600">{(n.media || 0).toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                          n.media >= 7 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {n.media >= 7 ? 'Aprovado' : 'Recuperação'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                Financeiro
              </h2>
              <button className="text-xs font-bold text-emerald-600 hover:underline">Pagar Agora</button>
            </div>
            <div className="p-2 overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="text-xs font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Vencimento</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {alunoData.financeiro.map((f: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-600">{new Date(f.vencimento).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">R$ {(f.valor || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                          f.status === 'pago' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Painel Estratégico</h1>
          <p className="text-slate-500 mt-2">Visão geral em tempo real da sua instituição.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
            <Download size={20} />
          </button>
          <button 
            onClick={() => setShowMatriculaModal(true)}
            className="bg-indigo-600 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Matrícula
          </button>
        </div>
      </header>

      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 p-6 rounded-[32px] flex flex-col md:flex-row items-center gap-6 shadow-sm"
        >
          <div className="bg-amber-100 p-4 rounded-2xl text-amber-600">
            <Download size={28} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-bold text-amber-900 text-lg">Atenção: Backup Necessário</h4>
            <p className="text-sm text-amber-700 mt-1 leading-relaxed">
              O banco de dados é local e temporário neste ambiente de desenvolvimento. 
              Para não perder seus dados, clique no botão ao lado ou em <strong>"Backup de Dados"</strong> no menu lateral para baixar uma cópia do arquivo <code>database.db</code>.
            </p>
          </div>
          <button 
            onClick={() => window.open('/api/download-db', '_blank')}
            className="w-full md:w-auto bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Baixar Backup
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showMatriculaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMatriculaModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Nova Matrícula</h2>
              <form onSubmit={handleMatricula} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Aluno</label>
                  <select
                    value={matriculaData.aluno_id}
                    onChange={(e) => setMatriculaData({ ...matriculaData, aluno_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">Selecione um aluno</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Turma</label>
                  <select
                    value={matriculaData.turma_id}
                    onChange={(e) => setMatriculaData({ ...matriculaData, turma_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.ano_letivo})</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMatriculaModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Matricular
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <span className="text-slate-500 font-medium">Total de Alunos</span>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.alunos}</h3>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
              <TrendingUp size={14} />
              <span>+12% este mês</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-slate-500 font-medium">Receita Mensal</span>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              R$ {stats.financeiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
              <TrendingUp size={14} />
              <span>+8% vs anterior</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="bg-red-100 text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} className="rotate-180" />
          </div>
          <div>
            <span className="text-slate-500 font-medium">Inadimplência</span>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.inadimplencia}</h3>
            <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-bold">
              <span>5.2% do total</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-slate-500 font-medium">Turmas Ativas</span>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.turmas}</h3>
            <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs font-bold">
              <span>92% ocupação</span>
            </div>
          </div>
        </div>
      </div>

      {/* BI Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChartIcon size={20} className="text-indigo-600" />
              Crescimento de Matrículas
            </h2>
            <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-2 outline-none">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="matriculas" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMat)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <PieChartIcon size={20} className="text-emerald-600" />
              Saúde Financeira
            </h2>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="financeiro" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction to="/alunos" icon={Users} label="Novo Aluno" color="bg-blue-50 text-blue-600" />
            <QuickAction to="/academic" icon={BookOpen} label="Nova Turma" color="bg-purple-50 text-purple-600" />
            <QuickAction to="/financeiro" icon={DollarSign} label="Lançar Taxa" color="bg-emerald-50 text-emerald-600" />
            <QuickAction to="/comunicacao" icon={MessageSquare} label="Enviar Aviso" color="bg-amber-50 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Avisos Recentes</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-indigo-600 mb-1">SECRETARIA</p>
              <p className="text-sm font-bold text-slate-800">Reunião de Pais</p>
              <p className="text-xs text-slate-500 mt-1">Próxima sexta-feira às 19h no auditório.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-emerald-600 mb-1">FINANCEIRO</p>
              <p className="text-sm font-bold text-slate-800">Rematrícula 2026</p>
              <p className="text-xs text-slate-500 mt-1">Prazo final para renovação com desconto.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ to, icon: Icon, label, color }: { to: string; icon: any; label: string; color: string }) => (
  <Link to={to} className={cn("p-6 rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95", color)}>
    <Icon size={24} />
    <span className="text-xs font-bold text-center">{label}</span>
  </Link>
);

const Academic = () => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'cursos' | 'disciplinas' | 'turmas'>('cursos');
  const [showModal, setShowModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<any>(null);
  const [allAlunos, setAllAlunos] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    const [cRes, dRes, tRes, aRes] = await Promise.all([
      api.get('/cursos'),
      api.get('/disciplinas'),
      api.get('/turmas'),
      api.get('/alunos')
    ]);
    setCursos(cRes.data);
    setDisciplinas(dRes.data);
    setTurmas(tRes.data);
    setAllAlunos(aRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = activeTab === 'cursos' ? '/cursos' : activeTab === 'disciplinas' ? '/disciplinas' : '/turmas';
    try {
      if (editingItem) {
        await api.post(`${endpoint}/${editingItem.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (err) {
      alert('Erro ao salvar registro');
    }
  };

  const handleToggleAluno = async (aluno: any) => {
    const isCurrentlyInTurma = aluno.turma_id === selectedTurma.id;
    try {
      await api.post(`/alunos/${aluno.id}`, {
        ...aluno,
        turma_id: isCurrentlyInTurma ? null : selectedTurma.id
      });
      fetchData(); // Refresh both turmas and allAlunos
    } catch (err) {
      alert('Erro ao atualizar enturmação');
    }
  };

  const handleDeleteCurso = async (id: number) => {
    if (confirm('Deseja realmente excluir este curso?')) {
      try {
        await api.delete(`/cursos/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir curso');
      }
    }
  };

  const handleDeleteDisciplina = async (id: number) => {
    if (confirm('Deseja realmente excluir esta disciplina?')) {
      try {
        await api.delete(`/disciplinas/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir disciplina');
      }
    }
  };

  const handleDeleteTurma = async (id: number) => {
    if (confirm('Deseja realmente excluir esta turma?')) {
      try {
        await api.delete(`/turmas/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir turma');
      }
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Gestão Acadêmica</h1>
          <p className="text-slate-500 mt-2">Controle de cursos, matrizes curriculares e turmas.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setFormData({}); setShowModal(true); }}
          className="bg-indigo-600 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Novo {activeTab.slice(0, -1)}
        </button>
      </header>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto custom-scrollbar whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('cursos')}
          className={cn("px-6 py-4 font-bold text-sm transition-all border-b-2", activeTab === 'cursos' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          Cursos
        </button>
        <button 
          onClick={() => setActiveTab('disciplinas')}
          className={cn("px-6 py-4 font-bold text-sm transition-all border-b-2", activeTab === 'disciplinas' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          Disciplinas
        </button>
        <button 
          onClick={() => setActiveTab('turmas')}
          className={cn("px-6 py-4 font-bold text-sm transition-all border-b-2", activeTab === 'turmas' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          Turmas
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Detalhes</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTab === 'cursos' && cursos.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-700">{c.nome}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm">{c.descricao || 'Sem descrição'}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(c)} className="text-indigo-600 font-bold text-sm hover:underline">Editar</button>
                      <button onClick={() => handleDeleteCurso(c.id)} className="text-red-600 font-bold text-sm hover:underline">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTab === 'disciplinas' && disciplinas.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-700">{d.nome}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm">Carga horária: {d.carga_horaria}h</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(d)} className="text-indigo-600 font-bold text-sm hover:underline">Editar</button>
                      <button onClick={() => handleDeleteDisciplina(d.id)} className="text-red-600 font-bold text-sm hover:underline">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTab === 'turmas' && turmas.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-700">{t.nome}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm">Curso: {t.curso_nome} | Ano: {t.ano_letivo}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(t)} className="text-indigo-600 font-bold text-sm hover:underline">Editar</button>
                      <button 
                        onClick={() => { setSelectedTurma(t); setShowStudentsModal(true); }}
                        className="text-indigo-600 font-bold text-sm hover:underline"
                      >
                        Alunos
                      </button>
                      <button onClick={() => handleDeleteTurma(t.id)} className="text-red-600 font-bold text-sm hover:underline">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showStudentsModal && selectedTurma && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStudentsModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Alunos da Turma</h2>
                  <p className="text-slate-500">{selectedTurma.nome} - {selectedTurma.curso_nome}</p>
                </div>
                <button 
                  onClick={() => setShowStudentsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white border-b border-slate-100">
                    <tr>
                      <th className="py-4 text-xs font-bold text-slate-400 uppercase">Nome do Aluno</th>
                      <th className="py-4 text-xs font-bold text-slate-400 uppercase text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allAlunos.map(aluno => {
                      const isInThisTurma = aluno.turma_id === selectedTurma.id;
                      const isInOtherTurma = aluno.turma_id && aluno.turma_id !== selectedTurma.id;
                      
                      return (
                        <tr key={aluno.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">
                            <div className="font-bold text-slate-700">{aluno.nome}</div>
                            {isInOtherTurma && (
                              <div className="text-[10px] text-amber-600 font-bold uppercase">
                                Já em outra turma
                              </div>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleToggleAluno(aluno)}
                              className={cn(
                                "px-4 py-2 rounded-xl font-bold text-xs transition-all",
                                isInThisTurma 
                                  ? "bg-red-50 text-red-600 hover:bg-red-100" 
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              )}
                            >
                              {isInThisTurma ? 'Remover' : 'Adicionar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="w-full bg-slate-100 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {editingItem ? 'Editar' : 'Novo'} {activeTab.slice(0, -1)}
              </h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                {activeTab === 'cursos' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Curso</label>
                      <select
                        value={formData.tipo || 'regular'}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        required
                      >
                        <option value="regular">Ensino Regular (Fundamental/Médio)</option>
                        <option value="infantil">Educação Infantil (BNCC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
                      <textarea
                        value={formData.descricao || ''}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                      />
                    </div>
                  </>
                )}
                {activeTab === 'disciplinas' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Avaliação</label>
                      <select
                        value={formData.tipo_avaliacao || 'nota'}
                        onChange={(e) => setFormData({ ...formData, tipo_avaliacao: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        required
                      >
                        <option value="nota">Nota Numérica (0-10)</option>
                        <option value="conceito">Conceito (Iniciado/Desenvolvido)</option>
                        <option value="descritivo">Relatório Descritivo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Carga Horária (h)</label>
                      <input
                        type="number"
                        value={formData.carga_horaria || ''}
                        onChange={(e) => setFormData({ ...formData, carga_horaria: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Curso</label>
                      <select
                        value={formData.curso_id || ''}
                        onChange={(e) => setFormData({ ...formData, curso_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        required
                      >
                        <option value="">Selecione um curso</option>
                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {activeTab === 'turmas' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Ano Letivo</label>
                        <input
                          type="number"
                          value={formData.ano_letivo || ''}
                          onChange={(e) => setFormData({ ...formData, ano_letivo: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Turno</label>
                        <select
                          value={formData.turno || ''}
                          onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="Manhã">Manhã</option>
                          <option value="Tarde">Tarde</option>
                          <option value="Noite">Noite</option>
                          <option value="Integral">Integral</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Capacidade</label>
                        <input
                          type="number"
                          value={formData.capacidade || ''}
                          onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Curso</label>
                        <select
                          value={formData.curso_id || ''}
                          onChange={(e) => setFormData({ ...formData, curso_id: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          required
                        >
                          <option value="">Selecione um curso</option>
                          {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MuralAluno = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [data, setData] = useState<any>(null);
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [solicitacoesFin, setSolicitacoesFin] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('mural');
  const [showDocModal, setShowDocModal] = useState(false);
  const [showFinModal, setShowFinModal] = useState(false);
  const [docType, setDocType] = useState('');
  const [docObs, setDocObs] = useState('');
  const [finObs, setFinObs] = useState('');
  const [selectedFinId, setSelectedFinId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user.aluno_id) {
      setError('Acesso negado: Este usuário não possui um ID de aluno vinculado.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [portalRes, comRes, solRes, finSolRes] = await Promise.all([
        api.get(`/portal-aluno/${user.aluno_id}`),
        api.get(`/comunicados-aluno/${user.aluno_id}`),
        api.get(`/solicitacoes-documentos?aluno_id=${user.aluno_id}`),
        api.get(`/solicitacoes-financeiras?aluno_id=${user.aluno_id}`)
      ]);
      setData(portalRes.data);
      setComunicados(comRes.data);
      setSolicitacoes(solRes.data);
      setSolicitacoesFin(finSolRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar os dados do mural. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarcarLido = async (id: number) => {
    try {
      await api.post('/comunicados/marcar-lido', { comunicado_id: id, aluno_id: user.aluno_id });
      fetchData();
    } catch (err) {
      alert('Erro ao marcar como lido');
    }
  };

  const handleRequestDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/solicitacoes-documentos', { 
        aluno_id: user.aluno_id, 
        tipo_documento: docType, 
        observacao: docObs 
      });
      setDocType('');
      setDocObs('');
      setShowDocModal(false);
      fetchData();
    } catch (err) {
      alert('Erro ao solicitar documento');
    }
  };

  const handleRequestFin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/solicitacoes-financeiras', { 
        aluno_id: user.aluno_id, 
        financeiro_id: selectedFinId,
        observacao: finObs 
      });
      setFinObs('');
      setSelectedFinId(null);
      setShowFinModal(false);
      fetchData();
    } catch (err) {
      alert('Erro ao solicitar atendimento financeiro');
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando informações do mural...</div>;

  if (error) return (
    <div className="p-10 flex flex-col items-center justify-center space-y-4">
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md text-center">
        <p className="font-bold">{error}</p>
      </div>
      {user.perfil === 'admin' && (
        <p className="text-slate-500 text-sm italic">Dica: Como administrador, você deve acessar o mural através da gestão de alunos (em breve).</p>
      )}
    </div>
  );

  if (!data) return <div className="p-10 text-slate-500">Carregando mural...</div>;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Mural do Aluno</h1>
          <p className="text-slate-500 mt-2">Bem-vindo, {user.nome}! Aqui está o resumo da sua vida escolar.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          {['mural', 'academico', 'financeiro', 'secretaria'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize",
                activeTab === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'mural' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bell size={20} className="text-indigo-600" />
              Comunicados da Escola
            </h2>
            {comunicados.length === 0 && <p className="text-slate-400 italic">Nenhum comunicado no momento.</p>}
            {comunicados.map(c => (
              <div key={c.id} className={cn(
                "p-8 rounded-3xl border transition-all relative overflow-hidden",
                c.lido ? "bg-white border-slate-100 opacity-75" : "bg-white border-indigo-200 shadow-xl shadow-indigo-50"
              )}>
                {!c.lido && <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{c.titulo}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase">
                      {new Date(c.data_postagem).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  {!c.lido && (
                    <button 
                      onClick={() => handleMarcarLido(c.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      Marcar como Lido
                    </button>
                  )}
                  {c.lido && (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                      <Check size={14} /> Lido
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{c.conteudo}</p>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
              <h3 className="font-bold text-lg mb-2">Resumo Acadêmico</h3>
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100 text-sm">Média Geral</span>
                  <span className="text-2xl font-bold">
                    {((data.notas.reduce((acc: number, n: any) => acc + (n.media || 0), 0) / (data.notas.length || 1)) || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100 text-sm">Frequência</span>
                  <span className="text-2xl font-bold">{(data.frequencia.percentual || 0).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'academico' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Boletim Escolar</h2>
              <button onClick={() => window.print()} className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                <Printer size={18} /> Imprimir Boletim
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="px-8 py-4">Disciplina</th>
                    <th className="px-8 py-4 text-center">Média</th>
                    <th className="px-8 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.notas.map((n: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-700">{n.disciplina}</td>
                      <td className="px-8 py-6 text-center font-mono font-bold text-indigo-600">{(n.media || 0).toFixed(1)}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                          n.media >= 7 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {n.media >= 7 ? 'Aprovado' : 'Recuperação'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financeiro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Histórico de Pagamentos</h2>
                <button 
                  onClick={() => setShowFinModal(true)}
                  className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1"
                >
                  <MessageSquare size={16} /> Solicitar Atendimento
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="px-8 py-4">Vencimento</th>
                      <th className="px-8 py-4">Valor</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.financeiro.map((f: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-slate-600">{new Date(f.vencimento).toLocaleDateString('pt-BR')}</td>
                        <td className="px-8 py-6 font-bold text-slate-800">R$ {(f.valor || 0).toFixed(2)}</td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                            f.status === 'pago' ? "bg-emerald-100 text-emerald-700" : 
                            f.status === 'atrasado' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {f.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {f.status !== 'pago' && (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setFinObs(`Solicitação referente ao pagamento de R$ ${f.valor.toFixed(2)} com vencimento em ${new Date(f.vencimento).toLocaleDateString('pt-BR')}.`);
                                  setSelectedFinId(f.id);
                                  setShowFinModal(true);
                                }}
                                className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1"
                              >
                                <HelpCircle size={14} /> Questionar
                              </button>
                              <button className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                                <Download size={14} /> Boleto
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Minhas Solicitações Financeiras</h2>
              <div className="space-y-4">
                {solicitacoesFin.map((s: any) => (
                  <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Financeiro</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase",
                        s.status === 'pendente' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{s.observacao}</p>
                    <p className="text-[10px] text-slate-400 mt-2">{new Date(s.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                ))}
                {solicitacoesFin.length === 0 && <p className="text-slate-400 text-center py-4 italic">Nenhuma solicitação pendente.</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
            <h3 className="font-bold text-slate-800 mb-6">Formas de Pagamento</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <TrendingUp size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">PIX Copia e Cola</p>
                  <p className="text-xs text-slate-500">Liberação imediata</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <FileText size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Boleto Bancário</p>
                  <p className="text-xs text-slate-500">Até 3 dias para compensar</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <DollarSign size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Cartão de Crédito</p>
                  <p className="text-xs text-slate-500">Parcelamento em até 12x</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'secretaria' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Minhas Solicitações</h2>
              <button 
                onClick={() => setShowDocModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> Nova Solicitação
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="px-8 py-4">Documento</th>
                    <th className="px-8 py-4">Data</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {solicitacoes.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-10 text-center text-slate-400 italic">Nenhuma solicitação realizada.</td>
                    </tr>
                  )}
                  {solicitacoes.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-700">{s.tipo_documento}</td>
                      <td className="px-8 py-6 text-slate-500">{new Date(s.data_solicitacao).toLocaleDateString('pt-BR')}</td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                          s.status === 'concluido' ? "bg-emerald-100 text-emerald-700" : 
                          s.status === 'cancelado' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDocModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Solicitar Documento</h2>
              <form onSubmit={handleRequestDoc} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Documento</label>
                  <select 
                    value={docType} 
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Declaração de Matrícula">Declaração de Matrícula</option>
                    <option value="Histórico Escolar">Histórico Escolar</option>
                    <option value="Certificado de Conclusão">Certificado de Conclusão</option>
                    <option value="Carteirinha Estudantil">Carteirinha Estudantil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Observação (Opcional)</label>
                  <textarea 
                    value={docObs} 
                    onChange={(e) => setDocObs(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                    placeholder="Alguma informação adicional?"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowDocModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Solicitar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {showFinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFinModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Solicitar Atendimento Financeiro</h2>
              <form onSubmit={handleRequestFin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Observação / Motivo</label>
                  <textarea 
                    value={finObs} 
                    onChange={(e) => setFinObs(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                    placeholder="Descreva sua dúvida ou solicitação..."
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowFinModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Enviar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Communication = () => {
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showStats, setShowStats] = useState<any>(null);
  const [statsData, setStatsData] = useState<any[]>([]);

  const fetchComunicados = async () => {
    const res = await api.get('/comunicados');
    setComunicados(res.data);
  };

  useEffect(() => {
    fetchComunicados();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/comunicados/${editingId}`, { titulo, conteudo });
    } else {
      await api.post('/comunicados', { titulo, conteudo });
    }
    setTitulo('');
    setConteudo('');
    setEditingId(null);
    fetchComunicados();
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setTitulo(c.titulo);
    setConteudo(c.conteudo);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este comunicado?')) {
      await api.delete(`/comunicados/${id}`);
      fetchComunicados();
    }
  };

  const handleViewStats = async (c: any) => {
    const res = await api.get(`/comunicados/stats/${c.id}`);
    setStatsData(res.data);
    setShowStats(c);
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Comunicação</h1>
        <p className="text-slate-500 mt-2">Envie avisos e comunicados para toda a comunidade escolar.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6">{editingId ? 'Editar Comunicado' : 'Novo Comunicado'}</h2>
          <form onSubmit={handlePost} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: Reunião de Pais"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Conteúdo</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                placeholder="Descreva o aviso..."
                required
              />
            </div>
            <div className="flex gap-3">
              {editingId && (
                <button 
                  type="button"
                  onClick={() => { setEditingId(null); setTitulo(''); setConteudo(''); }}
                  className="flex-1 bg-slate-100 py-4 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              )}
              <button className="flex-[2] bg-indigo-600 py-4 rounded-xl text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                {editingId ? 'Salvar Alterações' : 'Publicar Agora'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {comunicados.map(c => (
            <div key={c.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{c.titulo}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
                    {new Date(c.data_postagem).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewStats(c)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Ver Visualizações"
                  >
                    <Users size={18} />
                  </button>
                  <button 
                    onClick={() => handleEdit(c)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <SettingsIcon size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <X size={18} />
                  </button>
                  <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                    <Bell size={20} />
                  </div>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{c.conteudo}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showStats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStats(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Visualizações</h2>
              <p className="text-slate-500 text-sm mb-6">Alunos que leram: {showStats.titulo}</p>
              <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {statsData.length === 0 && <p className="text-slate-400 italic text-center py-10">Ninguém leu este comunicado ainda.</p>}
                {statsData.map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">{s.nome}</span>
                    <span className="text-xs text-slate-400">{new Date(s.data_leitura).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowStats(null)} className="w-full mt-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Fechar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DocumentModal = ({ type, aluno, empresa, onClose }: { type: string; aluno: any; empresa: any; onClose: () => void }) => {
  const [boletim, setBoletim] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);

  useEffect(() => {
    if ((type === "Boletim Acadêmico" || type === "Histórico Escolar" || type === "Ficha de Desenvolvimento (BNCC)") && aluno?.id) {
      api.get(`/boletim/${aluno.id}`).then(res => setBoletim(res.data));
    }
    api.get('/funcionarios').then(res => setFuncionarios(res.data));
  }, [type, aluno?.id]);

  const getFuncionarioPorCargo = (cargo: string) => {
    return funcionarios.find(f => f.cargo === cargo)?.nome || '';
  };

  const diretor = getFuncionarioPorCargo("Diretor(a)");
  const secretario = getFuncionarioPorCargo("Secretário(a)");
  const coordenador = getFuncionarioPorCargo("Coordenador(a) Pedagógico(a)");

  const handlePrint = () => {
    window.print();
  };

  if (!aluno) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{type}</h2>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
            >
              <Printer size={18} />
              Imprimir / Salvar PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-100">
          <div 
            className="bg-white shadow-lg mx-auto p-16 min-h-[1123px] w-[794px] text-slate-800 print:shadow-none print:p-0 print:m-0"
            id="printable-document"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-slate-800 pb-8 mb-8">
              <h1 className="text-2xl font-bold uppercase">{empresa.nome || 'Escola EduManager'}</h1>
              <p className="text-sm">{empresa.endereco || 'Endereço não informado'}</p>
              <p className="text-sm">CNPJ: {empresa.cnpj || '00.000.000/0001-00'} | Tel: {empresa.telefone || '---'}</p>
            </div>

            {/* Content based on type */}
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-center underline uppercase">{type}</h2>
              
              {type === "Declaração de Matrícula" && (
                <div className="space-y-6 text-justify leading-relaxed">
                  <p>
                    Declaramos para os devidos fins que o(a) aluno(a) <strong>{aluno.nome}</strong>, 
                    inscrito(a) no CPF sob o nº <strong>{aluno.cpf}</strong> e RG nº <strong>{aluno.rg || '---'}</strong>, 
                    encontra-se regularmente matriculado(a) nesta instituição de ensino no ano letivo de {new Date().getFullYear()}.
                  </p>
                  <p>
                    A referida matrícula está ativa e o(a) aluno(a) frequenta regularmente as atividades escolares.
                  </p>
                  <div className="pt-20 text-center">
                    <p>{empresa.endereco?.split(',')[0] || 'Cidade'}, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <div className="mt-20 border-t border-slate-800 w-64 mx-auto pt-2">
                      <p className="font-bold">{secretario || empresa.secretario || 'Secretaria Acadêmica'}</p>
                      <p className="text-xs uppercase">Secretário(a)</p>
                    </div>
                  </div>
                </div>
              )}

              {type === "Boletim Acadêmico" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                    <p><strong>Aluno:</strong> {aluno.nome}</p>
                    <p><strong>CPF:</strong> {aluno.cpf}</p>
                    <p><strong>Ano Letivo:</strong> {new Date().getFullYear()}</p>
                    <p><strong>Status:</strong> {aluno.status || 'Ativo'}</p>
                  </div>
                  <table className="w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-left">Disciplina</th>
                        <th className="border border-slate-300 p-2 text-center">Média Final</th>
                        <th className="border border-slate-300 p-2 text-center">Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boletim.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border border-slate-300 p-2">{item.disciplina}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{(item.media || 0).toFixed(1)}</td>
                          <td className="border border-slate-300 p-2 text-center">
                            <span className={item.media >= 6 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                              {item.media >= 6 ? 'APROVADO' : 'REPROVADO'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pt-12 flex justify-around">
                    <div className="border-t border-slate-800 w-48 pt-2 text-center">
                      <p className="text-[10px] font-bold uppercase">{secretario || empresa.secretario || 'Secretaria'}</p>
                      <p className="text-[8px]">Secretário(a)</p>
                    </div>
                    <div className="border-t border-slate-800 w-48 pt-2 text-center">
                      <p className="text-[10px] font-bold uppercase">{diretor || empresa.diretor || 'Direção'}</p>
                      <p className="text-[8px]">Diretor(a)</p>
                    </div>
                  </div>
                </div>
              )}

              {type === "Ficha Cadastral" && (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold border-b border-slate-200 pb-2">Dados Pessoais</h3>
                      <p><strong>Nome:</strong> {aluno.nome}</p>
                      <p><strong>CPF:</strong> {aluno.cpf}</p>
                      <p><strong>RG:</strong> {aluno.rg || '---'}</p>
                      <p><strong>Data Nasc.:</strong> {aluno.data_nascimento}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold border-b border-slate-200 pb-2">Endereço</h3>
                      <p className="text-sm">{aluno.endereco || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              )}

              {type === "Certificado de Conclusão" && (
                <div className="space-y-12 text-center pt-10">
                  <p className="text-lg italic">Certificamos que</p>
                  <h3 className="text-4xl font-serif font-bold text-indigo-900">{aluno.nome}</h3>
                  <p className="text-lg">
                    concluiu com êxito os requisitos acadêmicos necessários para a obtenção do título correspondente, 
                    tendo cumprido integralmente a carga horária e as exigências desta instituição.
                  </p>
                  <div className="pt-20">
                    <p className="text-sm">{empresa.endereco?.split(',')[0] || 'Cidade'}, {new Date().toLocaleDateString('pt-BR')}</p>
                    <div className="flex justify-around mt-20">
                      <div className="border-t border-slate-800 w-48 pt-2">
                        <p className="text-xs font-bold uppercase">{diretor || empresa.diretor || 'Direção Geral'}</p>
                        <p className="text-[10px]">Diretor(a)</p>
                      </div>
                      <div className="border-t border-slate-800 w-48 pt-2">
                        <p className="text-xs font-bold uppercase">{secretario || empresa.secretario || 'Secretaria'}</p>
                        <p className="text-[10px]">Secretário(a)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {type === "Contrato de Prestação" && (
                <div className="space-y-4 text-xs text-justify leading-relaxed">
                  <p className="font-bold text-center text-sm mb-4">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</p>
                  <p>
                    <strong>CONTRATADA:</strong> {empresa.nome}, com sede em {empresa.endereco}, inscrita no CNPJ sob o nº {empresa.cnpj}.
                  </p>
                  <p>
                    <strong>CONTRATANTE:</strong> {aluno.nome}, portador do CPF nº {aluno.cpf}, residente e domiciliado em {aluno.endereco}.
                  </p>
                  <p>
                    <strong>CLÁUSULA PRIMEIRA:</strong> O presente contrato tem por objeto a prestação de serviços educacionais pela CONTRATADA ao CONTRATANTE, referente ao ano letivo de {new Date().getFullYear()}.
                  </p>
                  <p>
                    <strong>CLÁUSULA SEGUNDA:</strong> Como contraprestação pelos serviços, o CONTRATANTE pagará à CONTRATADA os valores estabelecidos na tabela de mensalidades vigente.
                  </p>
                  <div className="pt-10 flex justify-around">
                    <div className="border-t border-slate-800 w-48 pt-2 text-center">
                      <p className="font-bold text-[10px]">{diretor || empresa.diretor || 'DIRETOR(A)'}</p>
                      <p className="text-[8px]">CONTRATADA</p>
                    </div>
                    <div className="border-t border-slate-800 w-48 pt-2 text-center">
                      <p className="font-bold text-[10px]">{aluno.nome}</p>
                      <p className="text-[8px]">CONTRATANTE</p>
                    </div>
                  </div>
                </div>
              )}

              {type === "Ficha de Desenvolvimento (BNCC)" && (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                    <p><strong>Aluno:</strong> {aluno.nome}</p>
                    <p><strong>Turma:</strong> {aluno.turma_nome || '---'}</p>
                    <p><strong>Ano Letivo:</strong> {new Date().getFullYear()}</p>
                  </div>
                  <div className="space-y-8">
                    {boletim.map((item, idx) => (
                      <div key={idx} className="border border-slate-200 p-6 rounded-xl space-y-4">
                        <h3 className="font-bold text-indigo-700 border-b pb-2">{item.disciplina}</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <p><strong>Avaliação:</strong> {item.conceito || '---'}</p>
                        </div>
                        <div className="text-sm italic text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <p className="font-bold mb-2 text-xs uppercase text-slate-400 tracking-wider">Relatório de Desenvolvimento:</p>
                          {item.observacao || 'Nenhuma observação registrada para este período.'}
                        </div>
                      </div>
                    ))}
                  </div>
                  {boletim.length === 0 && <div className="p-10 text-center text-slate-400 italic">Nenhum registro de desenvolvimento encontrado.</div>}
                  <div className="pt-12 flex justify-around">
                    <div className="border-t border-slate-800 w-48 pt-2 text-center">
                      <p className="text-[10px] font-bold uppercase">{coordenador || 'Coordenação'}</p>
                      <p className="text-[8px]">Coordenador(a) Pedagógico(a)</p>
                    </div>
                    <div className="border-t border-slate-800 w-48 pt-2 text-center">
                      <p className="text-[10px] font-bold uppercase">{diretor || empresa.diretor || 'Direção'}</p>
                      <p className="text-[8px]">Diretor(a)</p>
                    </div>
                  </div>
                </div>
              )}

              {type === "Histórico Escolar" && (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                    <p><strong>Aluno:</strong> {aluno.nome}</p>
                    <p><strong>CPF:</strong> {aluno.cpf}</p>
                  </div>
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-left">Disciplina</th>
                        <th className="border border-slate-300 p-2 text-center">Carga Horária</th>
                        <th className="border border-slate-300 p-2 text-center">Média</th>
                        <th className="border border-slate-300 p-2 text-center">Frequência</th>
                        <th className="border border-slate-300 p-2 text-center">Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boletim.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border border-slate-300 p-2">{item.disciplina}</td>
                          <td className="border border-slate-300 p-2 text-center">80h</td>
                          <td className="border border-slate-300 p-2 text-center">{(item.media || 0).toFixed(1)}</td>
                          <td className="border border-slate-300 p-2 text-center">95%</td>
                          <td className="border border-slate-300 p-2 text-center">{item.media >= 6 ? 'APROVADO' : 'REPROVADO'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pt-12 flex justify-around">
                    <div className="border-t border-slate-800 w-48 pt-2 text-center">
                      <p className="text-[10px] font-bold uppercase">{secretario || empresa.secretario || 'Secretaria'}</p>
                      <p className="text-[8px]">Secretário(a)</p>
                    </div>
                    <div className="border-t border-slate-800 w-48 pt-2 text-center">
                      <p className="text-[10px] font-bold uppercase">{diretor || empresa.diretor || 'Direção'}</p>
                      <p className="text-[8px]">Diretor(a)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-slate-200 text-[10px] text-slate-400 text-center">
              <p>Documento gerado eletronicamente pelo Sistema EduManager em {new Date().toLocaleString('pt-BR')}</p>
              <p>A autenticidade deste documento pode ser verificada na secretaria da instituição.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-document, #printable-document * {
            visibility: visible !important;
          }
          #printable-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const DigitalSecretary = () => {
  const [searchParams] = useSearchParams();
  const initialAlunoId = searchParams.get('alunoId') || '';
  const [alunos, setAlunos] = useState<any[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState(initialAlunoId);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docType, setDocType] = useState('');
  const [empresa, setEmpresa] = useState<any>({});
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('documentos');

  const fetchData = async () => {
    const [aluRes, empRes, solRes] = await Promise.all([
      api.get('/alunos'),
      api.get('/empresa'),
      api.get('/solicitacoes-documentos')
    ]);
    setAlunos(aluRes.data);
    setEmpresa(empRes.data || {});
    setSolicitacoes(solRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialAlunoId) {
      setSelectedAlunoId(initialAlunoId);
    }
  }, [initialAlunoId]);

  const handleGenerate = (title: string) => {
    if (!selectedAlunoId) {
      alert('Por favor, selecione um aluno primeiro.');
      return;
    }
    setDocType(title);
    setShowDocModal(true);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    await api.put(`/solicitacoes-documentos/${id}`, { status });
    fetchData();
  };

  const selectedAluno = alunos.find(a => a.id === parseInt(selectedAlunoId));

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Secretaria Digital</h1>
          <p className="text-slate-500 mt-2">Gestão de documentos e solicitações acadêmicas.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveTab('documentos')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'documentos' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            Solicitações
          </button>
          <button
            onClick={() => setActiveTab('gerador')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'gerador' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            Gerador de Documentos
          </button>
        </div>
      </header>

      {activeTab === 'documentos' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Solicitações Pendentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                <tr>
                  <th className="px-8 py-4">Aluno</th>
                  <th className="px-8 py-4">Documento</th>
                  <th className="px-8 py-4">Data</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {solicitacoes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-slate-400 italic">Nenhuma solicitação encontrada.</td>
                  </tr>
                )}
                {solicitacoes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-700">{s.aluno_nome}</td>
                    <td className="px-8 py-6 text-slate-600">{s.tipo_documento}</td>
                    <td className="px-8 py-6 text-slate-500">{new Date(s.data_solicitacao).toLocaleDateString('pt-BR')}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        s.status === 'concluido' ? "bg-emerald-100 text-emerald-700" : 
                        s.status === 'cancelado' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {s.status === 'pendente' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(s.id, 'concluido')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Marcar como Concluído"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(s.id, 'cancelado')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancelar Solicitação"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gerador' && (
        <>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-4">Selecione o Aluno para emissão:</label>
            <div className="flex gap-4">
              <select 
                value={selectedAlunoId}
                onChange={(e) => setSelectedAlunoId(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Selecione um aluno...</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome} - {a.cpf}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DocumentCard 
              title="Declaração de Matrícula" 
              icon={FileText} 
              description="Gere declarações oficiais para alunos ativos." 
              onClick={() => handleGenerate("Declaração de Matrícula")}
            />
            {selectedAluno?.curso_tipo === 'infantil' ? (
              <DocumentCard 
                title="Ficha de Desenvolvimento (BNCC)" 
                icon={BookOpen} 
                description="Emita a ficha individual de desenvolvimento do aluno." 
                onClick={() => handleGenerate("Ficha de Desenvolvimento (BNCC)")}
              />
            ) : (
              <DocumentCard 
                title="Histórico Escolar" 
                icon={BookOpen} 
                description="Emita o histórico completo de notas e frequência." 
                onClick={() => handleGenerate("Histórico Escolar")}
              />
            )}
            <DocumentCard 
              title="Contrato de Prestação" 
              icon={DollarSign} 
              description="Gere contratos personalizados para novas matrículas." 
              onClick={() => handleGenerate("Contrato de Prestação")}
            />
            <DocumentCard 
              title="Certificado de Conclusão" 
              icon={GraduationCap} 
              description="Emita certificados para alunos concluintes." 
              onClick={() => handleGenerate("Certificado de Conclusão")}
            />
            <DocumentCard 
              title="Boletim Acadêmico" 
              icon={ClipboardCheck} 
              description="Gere o boletim do bimestre atual ou anterior." 
              onClick={() => handleGenerate("Boletim Acadêmico")}
            />
            <DocumentCard 
              title="Ficha Cadastral" 
              icon={User} 
              description="Ficha completa com todos os dados cadastrais do aluno." 
              onClick={() => handleGenerate("Ficha Cadastral")}
            />
          </div>
        </>
      )}

      <AnimatePresence>
        {showDocModal && (
          <DocumentModal 
            type={docType} 
            aluno={selectedAluno} 
            empresa={empresa}
            onClose={() => setShowDocModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const DocumentCard = ({ title, icon: Icon, description, onClick }: { title: string; icon: any; description: string; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200 transition-all group cursor-pointer"
  >
    <div className="bg-slate-50 text-slate-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    <button className="mt-6 text-indigo-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
      Gerar Documento
      <ChevronRight size={16} />
    </button>
  </div>
);

const Settings = () => {
  const [empresa, setEmpresa] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/empresa').then(res => {
      setEmpresa(res.data || {});
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      await api.post('/empresa', empresa);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configurações');
    }
  };

  const handleResetDB = async () => {
    if (confirm('TEM CERTEZA? Esta ação é irreversível e apagará TODOS os dados do sistema.')) {
      const confirmText = prompt('Para confirmar, digite "RESETAR" abaixo:');
      if (confirmText === 'RESETAR') {
        try {
          await api.post('/system/reset-db');
          alert('Banco de dados resetado com sucesso. O sistema será reiniciado.');
          window.location.reload();
        } catch (err) {
          alert('Erro ao resetar banco de dados');
        }
      }
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-500">Carregando configurações...</div>;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Configurações</h1>
          <p className="text-slate-500 mt-2">Gerencie as configurações da sua instituição.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          Salvar Alterações
        </button>
      </header>

      <div className="max-w-4xl space-y-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <School size={20} className="text-indigo-600" />
            Dados da Escola
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 flex items-center gap-6 mb-4">
              <div className="relative group">
                {empresa.logo_url ? (
                  <img src={empresa.logo_url} alt="Logo" className="w-32 h-32 rounded-3xl object-contain border-4 border-white shadow-lg bg-slate-50" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-300 border-4 border-white shadow-lg">
                    <School size={48} />
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
                  <Upload size={16} className="text-indigo-600" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const base64 = await toBase64(file);
                        setEmpresa({...empresa, logo_url: base64});
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da Instituição</label>
                <input 
                  type="text" 
                  value={empresa.nome || ''} 
                  onChange={(e) => setEmpresa({...empresa, nome: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">CNPJ</label>
              <input 
                type="text" 
                value={empresa.cnpj || ''} 
                onChange={(e) => setEmpresa({...empresa, cnpj: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Endereço Completo</label>
              <input 
                type="text" 
                value={empresa.endereco || ''} 
                onChange={(e) => setEmpresa({...empresa, endereco: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone</label>
              <input 
                type="text" 
                value={empresa.telefone || ''} 
                onChange={(e) => setEmpresa({...empresa, telefone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail de Contato</label>
              <input 
                type="email" 
                value={empresa.email || ''} 
                onChange={(e) => setEmpresa({...empresa, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Diretor(a)</label>
              <input 
                type="text" 
                value={empresa.diretor || ''} 
                onChange={(e) => setEmpresa({...empresa, diretor: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Secretário(a)</label>
              <input 
                type="text" 
                value={empresa.secretario || ''} 
                onChange={(e) => setEmpresa({...empresa, secretario: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="col-span-2 pt-4 border-t border-slate-100 mt-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600" />
                Mensagens de Cobrança (Templates)
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Template WhatsApp</label>
                  <textarea 
                    value={empresa.msg_cobranca_whatsapp || ''} 
                    onChange={(e) => setEmpresa({...empresa, msg_cobranca_whatsapp: e.target.value})}
                    rows={3}
                    placeholder="Ex: Olá {responsavel}, lembramos que a mensalidade de {aluno} no valor de R$ {valor} está pendente."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">Tags: {'{aluno}'}, {'{responsavel}'}, {'{valor}'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Template E-mail</label>
                  <textarea 
                    value={empresa.msg_cobranca_email || ''} 
                    onChange={(e) => setEmpresa({...empresa, msg_cobranca_email: e.target.value})}
                    rows={3}
                    placeholder="Ex: Prezado(a) {responsavel}, informamos que consta um débito em aberto para o aluno {aluno}..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">Tags: {'{aluno}'}, {'{responsavel}'}, {'{valor}'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <SettingsIcon size={20} className="text-indigo-600" />
            Preferências do Sistema
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-slate-700 font-medium">Notificar responsáveis por e-mail sobre faltas</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-slate-700 font-medium">Permitir que alunos vejam notas antes do fechamento</span>
            </label>
          </div>
        </div>

        <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
          <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Zona de Perigo
          </h2>
          <p className="text-red-600 text-sm mb-6">
            Atenção: Ao resetar o banco de dados, todos os dados (alunos, turmas, notas, etc.) serão permanentemente excluídos. 
            O sistema voltará ao estado inicial de produção.
          </p>
          <button 
            onClick={handleResetDB}
            className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
          >
            Resetar Banco de Dados
          </button>
        </div>
      </div>
    </div>
  );
};
const Alunos = () => {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeFormTab, setActiveFormTab] = useState('pessoal');
  
  const [formData, setFormData] = useState<any>({
    nome: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    cidade_nascimento: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    foto: '',
    nome_pai: '',
    nome_mae: '',
    responsavel_legal: '',
    whatsapp_responsavel: '',
    email_responsavel: '',
    telefone: '',
    email: '',
    problemas_saude: [],
    problemas_saude_outros: '',
    uso_medicamentos: false,
    medicamentos_quais: '',
    turma_id: '',
    fileira: '',
    assento: ''
  });

  const healthProblemsList = [
    'Asma', 'Diabetes', 'Epilepsia', 'Alergia Alimentar', 
    'Alergia a Medicamentos', 'Problemas Cardíacos', 
    'TDAH', 'Autismo', 'Anemia', 'Intolerância a Lactose', 
    'Problemas de Visão', 'Problemas de Audição', 'Outros'
  ];

  const fetchAlunos = async () => {
    const [aluRes, turRes] = await Promise.all([
      api.get('/alunos'),
      api.get('/turmas')
    ]);
    setAlunos(aluRes.data);
    setTurmas(turRes.data);
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!res.data.erro) {
          setFormData({
            ...formData,
            cep: cleanCep,
            endereco: res.data.logradouro,
            bairro: res.data.bairro,
            cidade: res.data.localidade,
            estado: res.data.uf
          });
        }
      } catch (err) {
        console.error('Erro ao buscar CEP');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalFormData = {
        ...formData,
        whatsapp_responsavel: `${formData.whatsapp_pais_codigo || '+55'} (${formData.whatsapp_ddd || ''}) ${formData.whatsapp_numero || ''}`
      };
      if (editingItem) {
        await api.post(`/alunos/${editingItem.id}`, finalFormData);
      } else {
        await api.post('/alunos', finalFormData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        nome: '', cpf: '', rg: '', data_nascimento: '', cidade_nascimento: '',
        cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '',
        foto: '', nome_pai: '', nome_mae: '', responsavel_legal: '',
        telefone: '', email: '', problemas_saude: [], 
        problemas_saude_outros: '', uso_medicamentos: false, medicamentos_quais: '',
        turma_id: '', fileira: '', assento: '',
        whatsapp_pais_codigo: '+55', whatsapp_ddd: '', whatsapp_numero: '',
        email_responsavel: ''
      });
      fetchAlunos();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message;
      alert(`Erro ao salvar aluno: ${errorMsg}`);
    }
  };

  const toggleHealthProblem = (problem: string) => {
    const current = formData.problemas_saude || [];
    if (current.includes(problem)) {
      setFormData({ ...formData, problemas_saude: current.filter((p: string) => p !== problem) });
    } else {
      setFormData({ ...formData, problemas_saude: [...current, problem] });
    }
  };

  const handleDeleteAluno = async (id: number) => {
    if (confirm('Deseja realmente excluir este aluno?')) {
      try {
        await api.delete(`/alunos/${id}`);
        fetchAlunos();
      } catch (err) {
        alert('Erro ao excluir aluno');
      }
    }
  };

  const filteredAlunos = alunos.filter(a => 
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Gestão de Alunos</h1>
          <p className="text-slate-500 mt-1">Base de dados centralizada de estudantes.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              nome: '', cpf: '', rg: '', data_nascimento: '', cidade_nascimento: '',
              cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '',
              foto: '', nome_pai: '', nome_mae: '', responsavel_legal: '',
              telefone: '', email: '', problemas_saude: [], 
              problemas_saude_outros: '', uso_medicamentos: false, medicamentos_quais: '',
              turma_id: '', email_responsavel: ''
            });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Aluno
        </button>
      </header>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Aluno</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Documentos</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAlunos.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {aluno.foto ? (
                        <img src={aluno.foto} alt={aluno.nome} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {aluno.nome[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{aluno.nome}</p>
                        <p className="text-xs text-slate-400 font-medium">{aluno.turma_nome || 'Sem turma'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-500">CPF: <span className="font-mono">{aluno.cpf}</span></span>
                      <span className="text-xs font-bold text-slate-500">RG: <span className="font-mono">{aluno.rg || '---'}</span></span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Link to={`/secretaria?alunoId=${aluno.id}`} className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all" title="Gerar Documentos">
                          <FileText size={18} />
                        </Link>
                        <Link to={`/boletim/${aluno.id}`} className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all" title="Ver Boletim">
                          <BookOpen size={18} />
                        </Link>
                        <button 
                          onClick={() => { 
                            const whatsapp = aluno.whatsapp_responsavel || '';
                            const match = whatsapp.match(/^(\+\d+)\s\((\d+)\)\s(.*)$/);
                            const whatsappParts = match ? {
                              whatsapp_pais_codigo: match[1],
                              whatsapp_ddd: match[2],
                              whatsapp_numero: match[3]
                            } : {
                              whatsapp_pais_codigo: '+55',
                              whatsapp_ddd: '',
                              whatsapp_numero: whatsapp
                            };

                            setEditingItem(aluno); 
                            setFormData({
                              ...aluno,
                              ...whatsappParts,
                              problemas_saude: typeof aluno.problemas_saude === 'string' ? JSON.parse(aluno.problemas_saude) : (aluno.problemas_saude || [])
                            });
                            setShowModal(true); 
                          }}
                          className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="Editar Aluno"
                        >
                          <SettingsIcon size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAluno(aluno.id)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                          title="Excluir Aluno"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingItem ? 'Editar Aluno' : 'Novo Aluno'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex border-b border-slate-100 bg-white">
                <button 
                  onClick={() => setActiveFormTab('pessoal')}
                  className={cn("px-8 py-4 font-bold text-sm transition-all border-b-2", activeFormTab === 'pessoal' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500")}
                >
                  Dados Pessoais
                </button>
                <button 
                  onClick={() => setActiveFormTab('endereco')}
                  className={cn("px-8 py-4 font-bold text-sm transition-all border-b-2", activeFormTab === 'endereco' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500")}
                >
                  Endereço
                </button>
                <button 
                  onClick={() => setActiveFormTab('responsaveis')}
                  className={cn("px-8 py-4 font-bold text-sm transition-all border-b-2", activeFormTab === 'responsaveis' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500")}
                >
                  Responsáveis
                </button>
                <button 
                  onClick={() => setActiveFormTab('saude')}
                  className={cn("px-8 py-4 font-bold text-sm transition-all border-b-2", activeFormTab === 'saude' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500")}
                >
                  Saúde
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {activeFormTab === 'pessoal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex items-center gap-6 mb-4">
                      <div className="relative group">
                        {formData.foto ? (
                          <img src={formData.foto} alt="Preview" className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-300 border-4 border-white shadow-lg">
                            <Camera size={32} />
                          </div>
                        )}
                        <label className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
                          <Upload size={14} className="text-indigo-600" />
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const base64 = await toBase64(file);
                                setFormData({...formData, foto: base64});
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
                        <input
                          type="text"
                          value={formData.nome || ''}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">CPF</label>
                      <input
                        type="text"
                        value={formData.cpf || ''}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">RG</label>
                      <input
                        type="text"
                        value={formData.rg || ''}
                        onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Data de Nascimento</label>
                      <input
                        type="date"
                        value={formData.data_nascimento || ''}
                        onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Cidade de Nascimento</label>
                      <input
                        type="text"
                        value={formData.cidade_nascimento || ''}
                        onChange={(e) => setFormData({ ...formData, cidade_nascimento: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Turma</label>
                      <select
                        value={formData.turma_id || ''}
                        onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="">Selecione uma turma</option>
                        {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Telefone</label>
                      <input
                        type="text"
                        value={formData.telefone || ''}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Fileira</label>
                      <input
                        type="number"
                        value={formData.fileira || ''}
                        onChange={(e) => setFormData({ ...formData, fileira: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="1, 2, 3..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Assento</label>
                      <input
                        type="number"
                        value={formData.assento || ''}
                        onChange={(e) => setFormData({ ...formData, assento: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="1, 2, 3..."
                      />
                    </div>
                  </div>
                )}

                {activeFormTab === 'endereco' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">CEP</label>
                      <input
                        type="text"
                        value={formData.cep || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, cep: e.target.value });
                          handleCepLookup(e.target.value);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Logradouro</label>
                      <input
                        type="text"
                        value={formData.endereco || ''}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Número</label>
                      <input
                        type="text"
                        value={formData.numero || ''}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Bairro</label>
                      <input
                        type="text"
                        value={formData.bairro || ''}
                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Cidade</label>
                      <input
                        type="text"
                        value={formData.cidade || ''}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Estado (UF)</label>
                      <input
                        type="text"
                        value={formData.estado || ''}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        maxLength={2}
                      />
                    </div>
                  </div>
                )}

                {activeFormTab === 'responsaveis' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Pai</label>
                      <input
                        type="text"
                        value={formData.nome_pai || ''}
                        onChange={(e) => setFormData({ ...formData, nome_pai: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Mãe</label>
                      <input
                        type="text"
                        value={formData.nome_mae || ''}
                        onChange={(e) => setFormData({ ...formData, nome_mae: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Responsável Legal</label>
                      <input
                        type="text"
                        value={formData.responsavel_legal || ''}
                        onChange={(e) => setFormData({ ...formData, responsavel_legal: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Caso não seja o pai ou a mãe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Responsável</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.whatsapp_pais_codigo || '+55'}
                          onChange={(e) => setFormData({ ...formData, whatsapp_pais_codigo: e.target.value })}
                          className="w-20 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="+55"
                        />
                        <input
                          type="text"
                          value={formData.whatsapp_ddd || ''}
                          onChange={(e) => setFormData({ ...formData, whatsapp_ddd: e.target.value })}
                          className="w-20 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="DDD"
                          maxLength={2}
                        />
                        <input
                          type="text"
                          value={formData.whatsapp_numero || ''}
                          onChange={(e) => setFormData({ ...formData, whatsapp_numero: e.target.value })}
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="99999-9999"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">E-mail Responsável</label>
                      <input
                        type="email"
                        value={formData.email_responsavel || ''}
                        onChange={(e) => setFormData({ ...formData, email_responsavel: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="email@responsavel.com"
                      />
                    </div>
                  </div>
                )}

                {activeFormTab === 'saude' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-4">Selecione os problemas de saúde conhecidos:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {healthProblemsList.map(problem => (
                          <button
                            key={problem}
                            type="button"
                            onClick={() => toggleHealthProblem(problem)}
                            className={cn(
                              "px-4 py-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between",
                              (formData.problemas_saude || []).includes(problem)
                                ? "bg-red-50 border-red-200 text-red-600"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            )}
                          >
                            {problem}
                            {(formData.problemas_saude || []).includes(problem) && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(formData.problemas_saude || []).includes('Outros') && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <label className="block text-sm font-bold text-slate-700 mb-2">Descreva outros problemas de saúde</label>
                        <textarea
                          value={formData.problemas_saude_outros || ''}
                          onChange={(e) => setFormData({ ...formData, problemas_saude_outros: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-h-[100px]"
                          placeholder="Detalhes sobre outras condições..."
                        />
                      </motion.div>
                    )}

                    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">Uso de Medicamentos</h4>
                          <p className="text-xs text-slate-500">O aluno faz uso contínuo de algum medicamento?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formData.uso_medicamentos || false}
                            onChange={(e) => setFormData({ ...formData, uso_medicamentos: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      {formData.uso_medicamentos && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <label className="block text-sm font-bold text-slate-700 mb-2">Quais medicamentos e horários?</label>
                          <textarea
                            value={formData.medicamentos_quais || ''}
                            onChange={(e) => setFormData({ ...formData, medicamentos_quais: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-h-[80px]"
                            placeholder="Nome do medicamento, dosagem e horários..."
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Salvar Aluno
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CARGOS = [
  "Diretor(a)",
  "Secretário(a)",
  "Coordenador(a) Pedagógico(a)",
  "Professor(a)",
  "Auxiliar Administrativo",
  "Serviços Gerais",
  "Porteiro(a)",
  "Cozinheiro(a)"
];

const MapaDeSala = () => {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const [tRes, aRes] = await Promise.all([
      api.get('/turmas'),
      api.get('/alunos')
    ]);
    setTurmas(tRes.data);
    setAlunos(aRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedTurma = turmas.find(t => t.id === parseInt(selectedTurmaId));
  const alunosDaTurma = alunos.filter(a => a.turma_id === parseInt(selectedTurmaId));

  const handleAssignSeat = async (fileira: number, assento: number, alunoId: number | null) => {
    if (!alunoId) return;
    try {
      const aluno = alunos.find(a => a.id === alunoId);
      await api.post(`/alunos/${alunoId}`, { ...aluno, fileira, assento });
      fetchData();
    } catch (err) {
      alert('Erro ao atribuir lugar');
    }
  };

  const renderSeats = () => {
    if (!selectedTurma) return null;
    const rows = 6; // Default 6 rows
    const cols = 6; // Default 6 seats per row
    
    const grid = [];
    for (let f = 1; f <= rows; f++) {
      const rowSeats = [];
      for (let a = 1; a <= cols; a++) {
        const studentAtSeat = alunosDaTurma.find(al => al.fileira === f && al.assento === a);
        rowSeats.push(
          <div key={`${f}-${a}`} className="relative group">
            <button
              className={cn(
                "w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all",
                studentAtSeat 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
                  : "bg-white border-slate-100 text-slate-300 hover:border-slate-200"
              )}
            >
              {studentAtSeat ? (
                <>
                  <User size={20} />
                  <span className="text-[8px] font-bold truncate w-full px-1">{studentAtSeat.nome.split(' ')[0]}</span>
                </>
              ) : (
                <span className="text-[10px] font-bold text-slate-200">{f}-{a}</span>
              )}
            </button>
            
            {studentAtSeat && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-slate-800 text-white p-3 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-3">
                  {studentAtSeat.foto && (
                    <img src={studentAtSeat.foto} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                  )}
                  <div>
                    <p className="text-xs font-bold">{studentAtSeat.nome}</p>
                    <p className="text-[10px] text-slate-400">Fileira: {f}, Assento: {a}</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-slate-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
              </div>
            )}
          </div>
        );
      }
      grid.push(
        <div key={f} className="flex gap-4 justify-center">
          {rowSeats}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Mapa de Sala</h1>
        <p className="text-slate-500 mt-1">Visualize e organize a disposição dos alunos por fileira e assento.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="max-w-xs mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-2">Selecione a Turma</label>
          <select
            value={selectedTurmaId}
            onChange={(e) => setSelectedTurmaId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="">Selecione...</option>
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        {selectedTurma ? (
          <div className="space-y-8">
            <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 overflow-x-auto">
              <div className="min-w-[600px] space-y-6">
                <div className="max-w-md mx-auto bg-white py-4 rounded-xl border border-slate-200 text-center mb-12 font-bold text-slate-400 uppercase tracking-widest text-xs">
                  Quadro / Professor
                </div>
                <div className="flex flex-col gap-6">
                  {renderSeats()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Alunos sem lugar definido</h3>
                <div className="space-y-2">
                  {alunosDaTurma.filter(a => !a.fileira || !a.assento).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl gap-4">
                      <span className="text-sm font-medium text-slate-700 truncate flex-1">{a.nome}</span>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Fil" 
                          className="w-12 text-xs border rounded p-1"
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (val) a._tempFileira = val;
                          }}
                        />
                        <input 
                          type="number" 
                          placeholder="Ass" 
                          className="w-12 text-xs border rounded p-1"
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (val && a._tempFileira) handleAssignSeat(a._tempFileira, val, a.id);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {alunosDaTurma.filter(a => !a.fileira || !a.assento).length === 0 && (
                    <p className="text-sm text-slate-400 italic">Todos os alunos possuem lugar definido.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
            Selecione uma turma para visualizar o mapa de sala.
          </div>
        )}
      </div>
    </div>
  );
};

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {
    const [fRes, dRes, tRes] = await Promise.all([
      api.get('/funcionarios'),
      api.get('/disciplinas'),
      api.get('/turmas')
    ]);
    setFuncionarios(fRes.data);
    setDisciplinas(dRes.data);
    setTurmas(tRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Salvando funcionário:', formData);
      if (editingItem) {
        await api.post(`/funcionarios/${editingItem.id}`, formData);
      } else {
        await api.post('/funcionarios', formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (err: any) {
      console.error('Erro ao salvar funcionário:', err.response?.data || err.message);
      alert(`Erro ao salvar funcionário: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!res.data.erro) {
          setFormData({
            ...formData,
            endereco: res.data.logradouro,
            bairro: res.data.bairro,
            cidade: res.data.localidade,
            estado: res.data.uf
          });
        }
      } catch (err) {
        console.error('Erro ao buscar CEP');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este funcionário?')) {
      try {
        await api.delete(`/funcionarios/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir funcionário');
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Funcionários</h1>
          <p className="text-slate-500 mt-1">Gestão de equipe e colaboradores.</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setFormData({}); setShowModal(true); }}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Funcionário
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Funcionário</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Contato</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {funcionarios.map(f => (
              <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    {f.foto ? (
                      <img src={f.foto} alt={f.nome} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                        {f.nome[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800">{f.nome}</p>
                      <p className="text-xs text-slate-400">CPF: {f.cpf}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-slate-600 font-medium">{f.cargo}</td>
                <td className="px-8 py-6">
                  <p className="text-sm text-slate-600">{f.email}</p>
                  <p className="text-xs text-slate-400">{f.telefone}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => { setEditingItem(f); setFormData(f); setShowModal(true); }}
                      className="text-indigo-600 font-bold text-sm hover:underline"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(f.id)}
                      className="text-red-600 font-bold text-sm hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-8">{editingItem ? 'Editar' : 'Novo'} Funcionário</h2>
              <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 flex items-center gap-6 mb-4">
                  <div className="relative group">
                    {formData.foto ? (
                      <img src={formData.foto} alt="Preview" className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-300 border-4 border-white shadow-lg">
                        <Camera size={32} />
                      </div>
                    )}
                    <label className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
                      <Upload size={14} className="text-indigo-600" />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await toBase64(file);
                            setFormData({...formData, foto: base64});
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.nome || ''}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf || ''}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">RG</label>
                  <input
                    type="text"
                    value={formData.rg || ''}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cargo</label>
                  <select
                    value={formData.cargo || ''}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">Selecione o cargo...</option>
                    {CARGOS.map(cargo => (
                      <option key={cargo} value={cargo}>{cargo}</option>
                    ))}
                  </select>
                </div>
                {formData.cargo === 'Professor(a)' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Disciplina</label>
                      <select
                        value={formData.disciplina_id || ''}
                        onChange={(e) => setFormData({ ...formData, disciplina_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        required
                      >
                        <option value="">Selecione a disciplina...</option>
                        {disciplinas.map(d => (
                          <option key={d.id} value={d.id}>{d.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Turma/Sala</label>
                      <select
                        value={formData.turma_id || ''}
                        onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        required
                      >
                        <option value="">Selecione a turma...</option>
                        {turmas.map(t => (
                          <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Data de Admissão</label>
                  <input
                    type="date"
                    value={formData.data_admissao || ''}
                    onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">CEP</label>
                    <input
                      type="text"
                      value={formData.cep || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, cep: e.target.value });
                        handleCepLookup(e.target.value);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Logradouro</label>
                    <input
                      type="text"
                      value={formData.endereco || ''}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-2 grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Número</label>
                    <input
                      type="text"
                      value={formData.numero || ''}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Bairro</label>
                    <input
                      type="text"
                      value={formData.bairro || ''}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade || ''}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">UF</label>
                    <input
                      type="text"
                      value={formData.estado || ''}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 col-span-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Telefone</label>
                    <input
                      type="text"
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-2 flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Salvar Funcionário
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ControleAcesso = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [permissoes, setPermissoes] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const combinedList = useMemo(() => {
    const list: any[] = [];
    
    alunos.forEach(a => {
      const user = usuarios.find(u => u.aluno_id === a.id);
      list.push({
        id: a.id,
        nome: a.nome,
        tipo: 'aluno',
        email: a.email,
        usuario: user,
        isNew: !user
      });
    });
    
    funcionarios.forEach(f => {
      const user = usuarios.find(u => u.funcionario_id === f.id);
      list.push({
        id: f.id,
        nome: f.nome,
        tipo: 'funcionario',
        email: f.email,
        cargo: f.cargo,
        usuario: user,
        isNew: !user
      });
    });
    
    return list.filter(item => 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [alunos, funcionarios, usuarios, searchTerm]);
  
  const telas = [
    { id: 'Painel', label: 'Painel / Dashboard' },
    { id: 'Mural do Aluno', label: 'Mural do Aluno' },
    { id: 'Alunos', label: 'Gestão de Alunos' },
    { id: 'Acadêmico', label: 'Gestão Acadêmica' },
    { id: 'Professor', label: 'Portal do Professor' },
    { id: 'Funcionários', label: 'Gestão de Funcionários' },
    { id: 'Financeiro', label: 'Gestão Financeira' },
    { id: 'Comunicação', label: 'Comunicação / Mural' },
    { id: 'Secretaria', label: 'Secretaria Digital' },
    { id: 'Acesso', label: 'Controle de Acesso' },
    { id: 'Configurações', label: 'Configurações do Sistema' }
  ];

  const fetchData = async () => {
    const [uRes, aRes, fRes] = await Promise.all([
      api.get('/usuarios'),
      api.get('/alunos'),
      api.get('/funcionarios')
    ]);
    setUsuarios(uRes.data);
    setAlunos(aRes.data);
    setFuncionarios(fRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      api.get(`/permissoes/${selectedUser.id}`).then(res => setPermissoes(res.data));
    }
  }, [selectedUser]);

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    const novaSenha = prompt('Digite a nova senha temporária:');
    if (!novaSenha) return;
    try {
      await api.post('/usuarios/reset-password', {
        usuario_id: selectedUser.id,
        nova_senha: novaSenha
      });
      alert('Senha resetada com sucesso! O usuário deverá alterá-la no próximo acesso.');
    } catch (err) {
      alert('Erro ao resetar senha');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setLoading(true);
    try {
      let userId = selectedRecord.usuario?.id;
      
      if (!userId) {
        // Create user first
        const res = await api.post('/usuarios/criar', {
          nome: selectedRecord.nome,
          email: userEmail,
          senha: tempPassword,
          perfil: selectedRecord.tipo === 'aluno' ? 'aluno' : (selectedRecord.cargo === 'Professor' ? 'professor' : 'funcionario'),
          aluno_id: selectedRecord.tipo === 'aluno' ? selectedRecord.id : null,
          professor_id: selectedRecord.tipo === 'funcionario' && selectedRecord.cargo === 'Professor' ? selectedRecord.id : null,
          funcionario_id: selectedRecord.tipo === 'funcionario' ? selectedRecord.id : null
        });
        userId = res.data.id;
      }

      // Permissions are handled via togglePermissao which is already implemented
      // But if we want a "Save" button for the whole modal, we'd need to batch them.
      // For now, let's stick to the requirement of "abrirá nova janela contendo todas as telas para que possa ser selecionadas para liberação e salvar"
      
      alert('Usuário e permissões processados com sucesso!');
      setShowModal(false);
      setSelectedRecord(null);
      setTempPassword('');
      setUserEmail('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao processar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Deseja realmente excluir o acesso deste usuário? O cadastro de aluno/funcionário permanecerá intacto.')) return;
    try {
      await api.delete(`/usuarios/${userId}`);
      alert('Acesso removido com sucesso!');
      fetchData();
    } catch (err) {
      alert('Erro ao excluir acesso');
    }
  };

  const openPermissions = (record: any) => {
    setSelectedRecord(record);
    if (record.usuario) {
      setSelectedUser(record.usuario);
      setUserEmail(record.usuario.email);
    } else {
      setSelectedUser(null);
      setUserEmail(record.email || '');
    }
    setShowModal(true);
  };

  const togglePermissao = async (telaId: string, field: string) => {
    if (!selectedUser) return;
    
    const current = permissoes.find(p => p.tela === telaId) || {
      pode_acessar: 0,
      pode_editar: 0,
      pode_excluir: 0,
      pode_backup: 0
    };

    let newAcesso = current.pode_acessar;
    let newEditar = current.pode_editar;
    let newExcluir = current.pode_excluir;
    let newBackup = current.pode_backup;

    if (field === 'pode_acessar') {
      newAcesso = current.pode_acessar ? 0 : 1;
      if (newAcesso === 0) {
        newEditar = 0;
        newExcluir = 0;
        newBackup = 0;
      }
    } else {
      const newVal = current[field] ? 0 : 1;
      if (field === 'pode_editar') newEditar = newVal;
      if (field === 'pode_excluir') newExcluir = newVal;
      if (field === 'pode_backup') newBackup = newVal;
      
      // Se qualquer um for ativado, o acesso deve ser ativado
      if (newVal === 1) newAcesso = 1;
    }

    const payload = {
      usuario_id: selectedUser.id,
      tela: telaId,
      pode_acessar: newAcesso,
      pode_editar: newEditar,
      pode_excluir: newExcluir,
      pode_backup: newBackup
    };
    
    try {
      await api.post('/permissoes', payload);
      const res = await api.get(`/permissoes/${selectedUser.id}`);
      setPermissoes(res.data);
    } catch (err) {
      alert('Erro ao atualizar permissão');
    }
  };

  const grantAll = async () => {
    if (!selectedUser) return;
    try {
      for (const tela of telas) {
        await api.post('/permissoes', {
          usuario_id: selectedUser.id,
          tela: tela.id,
          pode_acessar: 1,
          pode_editar: 1,
          pode_excluir: 1,
          pode_backup: 1
        });
      }
      const res = await api.get(`/permissoes/${selectedUser.id}`);
      setPermissoes(res.data);
    } catch (err) {
      alert('Erro ao conceder todas as permissões');
    }
  };

  const revokeAll = async () => {
    if (!selectedUser) return;
    try {
      for (const tela of telas) {
        await api.post('/permissoes', {
          usuario_id: selectedUser.id,
          tela: tela.id,
          pode_acessar: 0,
          pode_editar: 0,
          pode_excluir: 0,
          pode_backup: 0
        });
      }
      const res = await api.get(`/permissoes/${selectedUser.id}`);
      setPermissoes(res.data);
    } catch (err) {
      alert('Erro ao revogar todas as permissões');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Controle de Acesso</h1>
          <p className="text-slate-500 mt-1">Gerencie as permissões de acesso para alunos e funcionários.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
            <span>Novos registros piscando aguardando liberação</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo / Cargo</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status de Acesso</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {combinedList.map((item) => (
                <tr 
                  key={`${item.tipo}-${item.id}`} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => openPermissions(item)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {item.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.nome}</p>
                        <p className="text-xs text-slate-400">{item.email || 'Sem e-mail'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-600">
                      {item.tipo === 'aluno' ? 'Aluno' : `Funcionário (${item.cargo})`}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {item.isNew ? (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        Novo Registro
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Acesso Liberado
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openPermissions(item)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Alterar Permissões"
                      >
                        <Edit size={18} />
                      </button>
                      {!item.isNew && (
                        <button 
                          onClick={() => handleDeleteUser(item.usuario.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir Acesso"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Configurar Acesso: {selectedRecord?.nome}</h2>
                  <p className="text-sm text-slate-500 mt-1">Defina as permissões de acesso para cada módulo do sistema.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {!selectedUser ? (
                  <div className="space-y-6 mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h3 className="font-bold text-indigo-800 flex items-center gap-2">
                      <Shield size={18} />
                      Criar Conta de Acesso
                    </h3>
                    <p className="text-sm text-indigo-600">Este registro ainda não possui uma conta de acesso ao sistema. Preencha os dados abaixo para criar.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-indigo-700 uppercase mb-2">E-mail de Acesso</label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-700 uppercase mb-2">Senha Temporária</label>
                        <input
                          type="password"
                          value={tempPassword}
                          onChange={(e) => setTempPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleSaveUser}
                      disabled={loading || !userEmail || !tempPassword}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Criando Conta...' : 'Criar Conta e Liberar Acesso'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3">
                        <button
                          onClick={grantAll}
                          className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-2"
                        >
                          <Check size={14} />
                          Liberar Tudo
                        </button>
                        <button
                          onClick={revokeAll}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                        >
                          <X size={14} />
                          Bloquear Tudo
                        </button>
                      </div>
                      <button
                        onClick={handleResetPassword}
                        className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-2"
                      >
                        <Key size={14} />
                        Resetar Senha
                      </button>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <th className="px-8 py-4 border-b border-slate-100">Módulo / Tela</th>
                            <th className="px-4 py-4 border-b border-slate-100 text-center">Acesso</th>
                            <th className="px-4 py-4 border-b border-slate-100 text-center">Editar</th>
                            <th className="px-4 py-4 border-b border-slate-100 text-center">Excluir</th>
                            <th className="px-4 py-4 border-b border-slate-100 text-center">Backup</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {telas.map(tela => {
                            const p = permissoes.find(perm => perm.tela === tela.id) || {
                              pode_acessar: 0,
                              pode_editar: 0,
                              pode_excluir: 0,
                              pode_backup: 0
                            };

                            return (
                              <tr key={tela.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                  <span className="font-bold text-slate-700">{tela.label}</span>
                                </td>
                                <td className="px-4 py-5 text-center">
                                  <PermissionToggle 
                                    active={p.pode_acessar === 1} 
                                    onClick={() => togglePermissao(tela.id, 'pode_acessar')} 
                                  />
                                </td>
                                <td className="px-4 py-5 text-center">
                                  <PermissionToggle 
                                    active={p.pode_editar === 1} 
                                    disabled={p.pode_acessar === 0}
                                    onClick={() => togglePermissao(tela.id, 'pode_editar')} 
                                  />
                                </td>
                                <td className="px-4 py-5 text-center">
                                  <PermissionToggle 
                                    active={p.pode_excluir === 1} 
                                    disabled={p.pode_acessar === 0}
                                    onClick={() => togglePermissao(tela.id, 'pode_excluir')} 
                                  />
                                </td>
                                <td className="px-4 py-5 text-center">
                                  <PermissionToggle 
                                    active={p.pode_backup === 1} 
                                    disabled={p.pode_acessar === 0}
                                    onClick={() => togglePermissao(tela.id, 'pode_backup')} 
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Fechar
                </button>
                {selectedUser && (
                  <button
                    onClick={() => {
                      alert('Alterações salvas com sucesso!');
                      setShowModal(false);
                    }}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Salvar Alterações
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PermissionToggle = ({ active, onClick, disabled = false }: { active: boolean; onClick: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
      active ? "bg-indigo-600" : "bg-slate-200",
      disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
        active ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

const ProfessorPortal = () => {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [turmaId, setTurmaId] = useState('');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [bimestre, setBimestre] = useState('1');
  const [notasColetivas, setNotasColetivas] = useState<any>({});
  const [dataFreq, setDataFreq] = useState(new Date().toISOString().split('T')[0]);
  const [frequenciaData, setFrequenciaData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lancamento');
  const [historicoNotas, setHistoricoNotas] = useState<any[]>([]);
  const [historicoFreq, setHistoricoFreq] = useState<any[]>([]);

  const fetchData = async () => {
    const [a, t, d] = await Promise.all([
      api.get('/alunos'),
      api.get('/turmas'),
      api.get('/disciplinas')
    ]);
    setAlunos(a.data);
    setTurmas(t.data);
    setDisciplinas(d.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchHistorico = async () => {
    if (!turmaId || !disciplinaId) return;
    setLoading(true);
    try {
      const [nRes, fRes] = await Promise.all([
        api.get(`/notas-turma/${turmaId}/${disciplinaId}/${bimestre}`),
        api.get(`/frequencia-turma/${turmaId}/${disciplinaId}/${dataFreq}`)
      ]);
      setHistoricoNotas(nRes.data);
      setHistoricoFreq(fRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'historico') {
      fetchHistorico();
    }
  }, [activeTab, turmaId, disciplinaId, bimestre, dataFreq]);

  useEffect(() => {
    if (turmaId) {
      const initialFreq: any = {};
      const initialNotas: any = {};
      alunos.filter(a => a.turma_id === parseInt(turmaId)).forEach(a => {
        initialFreq[a.id] = 'P';
        initialNotas[a.id] = { valor: '', conceito: '', observacao: '' };
      });
      setFrequenciaData(initialFreq);
      setNotasColetivas(initialNotas);
    } else {
      setFrequenciaData({});
      setNotasColetivas({});
    }
  }, [turmaId, alunos]);

  const handleLancarNotasColetivas = async () => {
    if (!turmaId || !disciplinaId) {
      alert('Selecione uma turma e uma disciplina');
      return;
    }
    setLoading(true);
    try {
      const notas = Object.entries(notasColetivas)
        .filter(([_, data]: [string, any]) => data.valor || data.conceito || data.observacao)
        .map(([id, data]: [string, any]) => ({
          aluno_id: parseInt(id),
          valor: data.valor ? parseFloat(data.valor) : null,
          conceito: data.conceito || null,
          observacao: data.observacao || null
        }));

      await api.post('/notas-coletivas', { 
        turma_id: parseInt(turmaId),
        disciplina_id: parseInt(disciplinaId),
        bimestre: parseInt(bimestre),
        notas
      });
      alert('Notas lançadas com sucesso!');
      if (activeTab === 'historico') fetchHistorico();
    } catch (err) {
      alert('Erro ao lançar notas');
    } finally {
      setLoading(false);
    }
  };

  const handleLancarFrequenciaColetiva = async () => {
    setLoading(true);
    try {
      const frequencias = Object.entries(frequenciaData).map(([id, status]) => ({
        aluno_id: parseInt(id),
        status,
        justificativa: ''
      }));

      await api.post('/frequencia-coletiva', { 
        turma_id: parseInt(turmaId),
        disciplina_id: parseInt(disciplinaId),
        data: dataFreq,
        frequencias
      });
      alert('Frequência coletiva registrada com sucesso!');
      if (activeTab === 'historico') fetchHistorico();
    } catch (err) {
      alert('Erro ao registrar frequência');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlunos = turmaId 
    ? alunos.filter(a => a.turma_id === parseInt(turmaId)) 
    : [];

  const selectedDisciplina = disciplinas.find(d => d.id === parseInt(disciplinaId));

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Diário de Classe</h1>
          <p className="text-slate-500">Gestão de notas e frequência.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveTab('lancamento')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'lancamento' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            Lançamento
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'historico' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            Histórico
          </button>
        </div>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Turma</label>
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">Selecione uma turma</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Disciplina</label>
            <select
              value={disciplinaId}
              onChange={(e) => setDisciplinaId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">Selecione uma disciplina</option>
              {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome} ({d.tipo_avaliacao})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bimestre / Data</label>
            <div className="flex gap-2">
              <select
                value={bimestre}
                onChange={(e) => setBimestre(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="1">1º Bim</option>
                <option value="2">2º Bim</option>
                <option value="3">3º Bim</option>
                <option value="4">4º Bim</option>
              </select>
              <input
                type="date"
                value={dataFreq}
                onChange={(e) => setDataFreq(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {turmaId && disciplinaId ? (
          activeTab === 'lancamento' ? (
            <div className="space-y-10">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" size={24} />
                    Lançamento de Notas Coletivo
                  </h2>
                  <button
                    onClick={handleLancarNotasColetivas}
                    disabled={loading || filteredAlunos.length === 0}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Notas'}
                  </button>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Aluno</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Avaliação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAlunos.map(a => (
                        <tr key={a.id}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">{a.nome}</td>
                          <td className="px-6 py-4">
                            {selectedDisciplina?.tipo_avaliacao === 'nota' && (
                              <input
                                type="number"
                                step="0.1"
                                max="10"
                                min="0"
                                value={notasColetivas[a.id]?.valor || ''}
                                onChange={(e) => setNotasColetivas({
                                  ...notasColetivas,
                                  [a.id]: { ...notasColetivas[a.id], valor: e.target.value }
                                })}
                                className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0.0"
                              />
                            )}
                            {selectedDisciplina?.tipo_avaliacao === 'conceito' && (
                              <select
                                value={notasColetivas[a.id]?.conceito || ''}
                                onChange={(e) => setNotasColetivas({
                                  ...notasColetivas,
                                  [a.id]: { ...notasColetivas[a.id], conceito: e.target.value }
                                })}
                                className="w-full max-w-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                              >
                                <option value="">Selecione</option>
                                <option value="Iniciado">Iniciado (I)</option>
                                <option value="Em Desenvolvimento">Em Desenvolvimento (ED)</option>
                                <option value="Desenvolvido">Desenvolvido (D)</option>
                              </select>
                            )}
                            {selectedDisciplina?.tipo_avaliacao === 'descritivo' && (
                              <textarea
                                value={notasColetivas[a.id]?.observacao || ''}
                                onChange={(e) => setNotasColetivas({
                                  ...notasColetivas,
                                  [a.id]: { ...notasColetivas[a.id], observacao: e.target.value }
                                })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                                placeholder="Relatório descritivo..."
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardCheck className="text-indigo-600" size={24} />
                    Diário de Classe (Frequência)
                  </h2>
                  <button
                    onClick={handleLancarFrequenciaColetiva}
                    disabled={loading || filteredAlunos.length === 0}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Frequência'}
                  </button>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Aluno</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAlunos.map(a => (
                        <tr key={a.id}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">{a.nome}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              {['P', 'F', 'FJ'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => setFrequenciaData({ ...frequenciaData, [a.id]: status })}
                                  className={cn(
                                    "w-8 h-8 rounded-lg text-[10px] font-bold transition-all border",
                                    (frequenciaData[a.id] || 'P') === status
                                      ? status === 'P' ? "bg-emerald-600 text-white border-emerald-600" :
                                        status === 'F' ? "bg-red-600 text-white border-red-600" :
                                        "bg-amber-500 text-white border-amber-500"
                                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                  )}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-10">
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BookOpen className="text-indigo-600" size={24} />
                  Histórico de Notas ({bimestre}º Bimestre)
                </h2>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Aluno</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Nota/Conceito</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAlunos.map(a => {
                        const nota = historicoNotas.find(n => n.aluno_id === a.id);
                        return (
                          <tr key={a.id}>
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{a.nome}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {selectedDisciplina?.tipo_avaliacao === 'nota' ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    defaultValue={nota?.valor || ''}
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value);
                                      if (!isNaN(val)) {
                                        api.post('/notas', { 
                                          aluno_id: a.id, 
                                          disciplina_id: disciplinaId, 
                                          turma_id: turmaId,
                                          bimestre: parseInt(bimestre),
                                          valor: val
                                        });
                                      }
                                    }}
                                    className="w-20 px-2 py-1 border rounded"
                                  />
                                ) : (
                                  <span className="font-bold text-indigo-600">{nota?.conceito || '-'}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 italic">{nota?.observacao || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <ClipboardCheck className="text-indigo-600" size={24} />
                  Histórico de Frequência ({new Date(dataFreq).toLocaleDateString('pt-BR')})
                </h2>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Aluno</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAlunos.map(a => {
                        const freq = historicoFreq.find(f => f.aluno_id === a.id);
                        return (
                          <tr key={a.id}>
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{a.nome}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                {['P', 'F', 'FJ'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      api.post('/frequencia', { 
                                        aluno_id: a.id, 
                                        data: dataFreq, 
                                        status: status,
                                        turma_id: turmaId,
                                        disciplina_id: disciplinaId
                                      }).then(() => fetchHistorico());
                                    }}
                                    className={cn(
                                      "w-8 h-8 rounded-lg text-[10px] font-bold transition-all border",
                                      (freq?.status || 'P') === status
                                        ? status === 'P' ? "bg-emerald-600 text-white border-emerald-600" :
                                          status === 'F' ? "bg-red-600 text-white border-red-600" :
                                          "bg-amber-500 text-white border-amber-500"
                                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                    )}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )
        ) : (
          <div className="p-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
            Selecione uma turma e uma disciplina para carregar o diário.
          </div>
        )}
      </div>
    </div>
  );
};

const Financeiro = () => {
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const [finRes, aluRes] = await Promise.all([
      api.get('/financeiro'),
      api.get('/alunos')
    ]);
    setPagamentos(finRes.data);
    setAlunos(aluRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGerarCobranca = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/financeiro', { 
        aluno_id: alunoId, 
        valor: parseFloat(valor),
        vencimento,
        status: 'pendente'
      });
      setValor('');
      setVencimento('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/financeiro/${id}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCobranca = async (id: number) => {
    if (confirm('Deseja realmente excluir esta cobrança?')) {
      try {
        await api.delete(`/financeiro/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendReminder = async (aluno: any, type: 'whatsapp' | 'email') => {
    try {
      const configRes = await api.get('/configuracoes');
      const config = configRes.data;
      const template = type === 'whatsapp' ? config.msg_cobranca_whatsapp : config.msg_cobranca_email;
      
      const message = template
        ?.replace('{aluno}', aluno.nome)
        ?.replace('{responsavel}', aluno.responsavel_legal || aluno.nome_mae || 'Responsável')
        ?.replace('{valor}', aluno.valor_pendente || '0,00');

      if (type === 'whatsapp') {
        const phone = aluno.telefone?.replace(/\D/g, '');
        if (phone) {
          const finalPhone = phone.startsWith('55') ? phone : `55${phone}`;
          window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message || 'Lembrete de pagamento')}`, '_blank');
        } else {
          alert('Telefone não cadastrado');
        }
      } else {
        if (aluno.email) {
          window.open(`mailto:${aluno.email}?subject=Lembrete de Pagamento&body=${encodeURIComponent(message || 'Lembrete de pagamento')}`, '_blank');
        } else {
          alert('E-mail não cadastrado');
        }
      }
    } catch (err) {
      alert('Erro ao enviar lembrete');
    }
  };

  const totalRecebido = pagamentos.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.valor, 0);
  const totalPendente = pagamentos.filter(p => p.status === 'pendente' || p.status === 'atrasado').reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Gestão Financeira</h1>
          <p className="text-slate-500 mt-2">Controle de mensalidades, inadimplência e fluxo de caixa.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Total Recebido</p>
            <p className="text-xl font-bold text-emerald-700">R$ {totalRecebido.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100">
            <p className="text-[10px] font-bold text-amber-600 uppercase">Total Pendente</p>
            <p className="text-xl font-bold text-amber-700">R$ {totalPendente.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Lançar Mensalidade</h2>
          <form onSubmit={handleGerarCobranca} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Aluno</label>
              <select
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                required
              >
                <option value="">Selecione um aluno</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Valor (R$)</label>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vencimento</label>
                <input
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-indigo-600 py-4 rounded-xl text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Gerar Cobrança'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Aluno</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Vencimento</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagamentos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-700">{p.aluno_nome}</td>
                    <td className="px-8 py-6 text-slate-500 text-sm">{new Date(p.vencimento).toLocaleDateString('pt-BR')}</td>
                    <td className="px-8 py-6 font-bold text-slate-800">R$ {(p.valor || 0).toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        p.status === 'pago' ? "bg-emerald-100 text-emerald-700" : 
                        p.status === 'atrasado' ? "bg-red-100 text-red-700" : 
                        p.status === 'estornado' ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {p.status !== 'pago' && p.status !== 'estornado' && (
                          <>
                            <button 
                              onClick={() => handleSendReminder({ 
                                nome: p.aluno_nome, 
                                telefone: p.aluno_telefone, 
                                email: p.aluno_email, 
                                responsavel_legal: p.responsavel_legal,
                                nome_mae: p.nome_mae,
                                valor_pendente: p.valor.toFixed(2) 
                              }, 'whatsapp')}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Enviar lembrete WhatsApp"
                            >
                              <MessageCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleSendReminder({ 
                                nome: p.aluno_nome, 
                                telefone: p.aluno_telefone, 
                                email: p.aluno_email, 
                                responsavel_legal: p.responsavel_legal,
                                nome_mae: p.nome_mae,
                                valor_pendente: p.valor.toFixed(2) 
                              }, 'email')}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Enviar lembrete E-mail"
                            >
                              <Mail size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(p.id, 'pago')}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Dar Baixa (Pago)"
                            >
                              <Check size={18} />
                            </button>
                          </>
                        )}
                        {p.status === 'pago' && (
                          <button 
                            onClick={() => handleUpdateStatus(p.id, 'estornado')}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Estornar"
                          >
                            <TrendingUp size={18} className="rotate-180" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteCobranca(p.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir Cobrança"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Boletim = () => {
  const { alunoId } = useParams();
  const [notas, setNotas] = useState<any[]>([]);
  const [frequencia, setFrequencia] = useState<any[]>([]);
  const [aluno, setAluno] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [notasRes, alunosRes, freqRes] = await Promise.all([
        api.get(`/boletim/${alunoId}`),
        api.get('/alunos'),
        api.get(`/frequencia/${alunoId}`)
      ]);
      setNotas(notasRes.data);
      setAluno(alunosRes.data.find((a: any) => a.id === parseInt(alunoId || '0')));
      setFrequencia(freqRes.data.historico || []);
    };
    fetchData();
  }, [alunoId]);

  return (
    <div className="max-w-4xl space-y-10">
      <header className="flex items-center gap-4">
        <Link to="/alunos" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="rotate-180" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Boletim Escolar</h1>
          <p className="text-slate-500">Desempenho acadêmico de {aluno?.nome}.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              Notas por Disciplina
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[400px]">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Disciplina</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Bimestre</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Avaliação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notas.map((n, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{n.disciplina}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{n.bimestre}º</td>
                    <td className="px-6 py-4 text-center">
                      {n.tipo_avaliacao === 'nota' && (
                        <span className={cn(
                          "font-bold px-2 py-1 rounded-lg",
                          (n.valor || 0) >= 6 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                        )}>
                          {(n.valor || 0).toFixed(1)}
                        </span>
                      )}
                      {n.tipo_avaliacao === 'conceito' && (
                        <span className={cn(
                          "font-bold px-2 py-1 rounded-lg",
                          n.conceito === 'Desenvolvido' ? "text-emerald-600 bg-emerald-50" : 
                          n.conceito === 'Em Desenvolvimento' ? "text-amber-600 bg-amber-50" : "text-blue-600 bg-blue-50"
                        )}>
                          {n.conceito}
                        </span>
                      )}
                      {n.tipo_avaliacao === 'descritivo' && (
                        <div className="text-left text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {n.observacao}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {notas.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">Sem notas.</div>}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-indigo-600" />
              Histórico de Frequência
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[300px]">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {frequencia.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{f.data}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-xs font-bold uppercase",
                        f.status === 'P' ? "text-emerald-600 bg-emerald-50" : 
                        f.status === 'FJ' ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"
                      )}>
                        {f.status === 'P' ? 'Presente' : f.status === 'FJ' ? 'Justificada' : 'Faltou'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {frequencia.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">Sem registros.</div>}
        </div>
      </div>
    </div>
  );
};

// --- App Root ---

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  useEffect(() => {
    // Initialize database
    api.post('/init-db').catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/mural" element={<ProtectedRoute><MuralAluno /></ProtectedRoute>} />
        <Route path="/alunos" element={<ProtectedRoute><Alunos /></ProtectedRoute>} />
        <Route path="/funcionarios" element={<ProtectedRoute><Funcionarios /></ProtectedRoute>} />
        <Route path="/academic" element={<ProtectedRoute><Academic /></ProtectedRoute>} />
        <Route path="/professor" element={<ProtectedRoute><ProfessorPortal /></ProtectedRoute>} />
        <Route path="/mapa-sala" element={<ProtectedRoute><MapaDeSala /></ProtectedRoute>} />
        <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
        <Route path="/comunicacao" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
        <Route path="/secretaria" element={<ProtectedRoute><DigitalSecretary /></ProtectedRoute>} />
        <Route path="/controle-acesso" element={<ProtectedRoute><ControleAcesso /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/boletim/:alunoId" element={<ProtectedRoute><Boletim /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
