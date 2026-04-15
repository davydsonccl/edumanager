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
  AlertTriangle,
  ArrowRightLeft,
  FileCheck,
  Palette,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Lock
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

const SidebarItem = ({ to, icon: Icon, label, active, isSuperAdmin }: { to: string; icon: any; label: string; active: boolean; isSuperAdmin?: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? (isSuperAdmin ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-indigo-600 text-white shadow-lg shadow-indigo-200") 
        : (isSuperAdmin ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600")
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : (isSuperAdmin ? "text-slate-500 group-hover:text-amber-500" : "text-slate-400 group-hover:text-indigo-600"))} />
    <span className="font-medium">{label}</span>
  </Link>
);

const applyTheme = (color: string, theme: string) => {
  if (!color) return;
  
  // Simple palette generation
  const root = document.documentElement;
  root.style.setProperty('--primary-600', color);
  
  // Generate darker/lighter versions (simplified)
  root.style.setProperty('--primary-700', color); // Should be darker
  root.style.setProperty('--primary-500', color); // Should be lighter
  root.style.setProperty('--primary-50', `${color}10`);
  root.style.setProperty('--primary-100', `${color}20`);
  root.style.setProperty('--primary-200', `${color}30`);

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPerms, setUserPerms] = useState<any[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [todasEmpresas, setTodasEmpresas] = useState<any[]>([]);
  const [activeEmpresaId, setActiveEmpresaId] = useState(localStorage.getItem('activeEmpresaId') || user.empresa_id);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeEmpresaId');
    navigate('/login');
  };

  useEffect(() => {
    if (user.id) {
      // Fetch current empresa settings to apply theme
      api.get('/empresa').then(res => {
        if (res.data) {
          applyTheme(res.data.cor_primaria, res.data.tema);
        }
      }).catch(err => console.error('Erro ao carregar tema da empresa:', err));

      api.get(`/permissoes/${user.id}`)
        .then(res => {
          setUserPerms(res.data);
          setLoadingPerms(false);
        })
        .catch(() => setLoadingPerms(false));
      
      if (user.super_admin) {
        api.get('/todas-empresas')
          .then(res => {
            setTodasEmpresas(res.data || []);
            // Se não houver empresa ativa, seleciona a primeira da lista
            if (!activeEmpresaId && res.data && res.data.length > 0) {
              const firstId = res.data[0].id.toString();
              localStorage.setItem('activeEmpresaId', firstId);
              setActiveEmpresaId(firstId);
            }
          })
          .catch(err => console.error('Erro ao buscar todas as empresas:', err));
      }
    } else {
      setLoadingPerms(false);
    }
  }, [user.id, user.super_admin, activeEmpresaId]);

  const handleSwitchEmpresa = (id: string) => {
    localStorage.setItem('activeEmpresaId', id);
    setActiveEmpresaId(id);
    window.location.href = '/'; // Use location.href to ensure a clean reload at the root
  };

  const isAdmin = user.perfil === 'admin';
  const isSuperAdmin = !!user.super_admin;
  const isProfessor = user.perfil === 'professor';

  const hasAccess = (tela: string) => {
    if (isSuperAdmin) return true;
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
        "border-r p-6 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 lg:w-72",
        isSuperAdmin ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-900",
        sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
      )}>
        <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
          <div className={cn("p-2 rounded-lg", isSuperAdmin ? "bg-amber-500" : "bg-indigo-600")}>
            <School className="text-white" size={24} />
          </div>
          <h1 className={cn("text-xl font-bold tracking-tight", isSuperAdmin ? "text-white" : "text-slate-800")}>
            EduManager
            {isSuperAdmin && <span className="block text-[10px] text-amber-500 font-black uppercase tracking-tighter">Master Admin</span>}
          </h1>
        </div>

        {isSuperAdmin && (
          <div className="mb-8 px-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <label className="block text-[10px] font-bold text-amber-500 uppercase mb-3 tracking-widest">Unidade em Foco</label>
              <select 
                value={activeEmpresaId || ''}
                onChange={(e) => handleSwitchEmpresa(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-amber-500 bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <option value="" disabled>Selecionar Unidade</option>
                {todasEmpresas.map(e => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
                {todasEmpresas.length === 0 && <option disabled>Nenhuma escola cadastrada</option>}
              </select>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar mt-12 lg:mt-0">
          {hasAccess('Painel') && <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Painel" active={location.pathname === '/dashboard'} isSuperAdmin={isSuperAdmin} />}
          {isSuperAdmin && <SidebarItem to="/escolas" icon={School} label="Escolas" active={location.pathname === '/escolas'} isSuperAdmin={isSuperAdmin} />}
          
          {hasAccess('Mural do Aluno') && !isAdmin && !isSuperAdmin && (
            <SidebarItem to="/mural" icon={BookOpen} label="Mural do Aluno" active={location.pathname === '/mural'} isSuperAdmin={isSuperAdmin} />
          )}
          
          {hasAccess('Alunos') && <SidebarItem to="/alunos" icon={Users} label="Alunos" active={location.pathname === '/alunos'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Acadêmico') && <SidebarItem to="/academic" icon={BookOpen} label="Acadêmico" active={location.pathname === '/academic'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Professor') && <SidebarItem to="/professor" icon={GraduationCap} label="Professor" active={location.pathname === '/professor'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Mapa de Sala') && <SidebarItem to="/mapa-sala" icon={Map} label="Mapa de Sala" active={location.pathname === '/mapa-sala'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Funcionários') && <SidebarItem to="/funcionarios" icon={Briefcase} label="Funcionários" active={location.pathname === '/funcionarios'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Financeiro') && <SidebarItem to="/financeiro" icon={DollarSign} label="Financeiro" active={location.pathname === '/financeiro'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Comunicação') && <SidebarItem to="/comunicacao" icon={MessageSquare} label="Comunicação" active={location.pathname === '/comunicacao'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Secretaria') && <SidebarItem to="/secretaria" icon={FileText} label="Secretaria" active={location.pathname === '/secretaria'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Relatórios') && <SidebarItem to="/relatorios" icon={BarChartIcon} label="Relatórios" active={location.pathname === '/relatorios'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Transferências') && <SidebarItem to="/transferencias" icon={ArrowRightLeft} label="Transferências" active={location.pathname === '/transferencias'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Acesso') && <SidebarItem to="/controle-acesso" icon={ShieldCheck} label="Acesso" active={location.pathname === '/controle-acesso'} isSuperAdmin={isSuperAdmin} />}
          {hasAccess('Configurações') && <SidebarItem to="/configuracoes" icon={SettingsIcon} label="Configurações" active={location.pathname === '/configuracoes'} isSuperAdmin={isSuperAdmin} />}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", isSuperAdmin ? "bg-amber-500/20 text-amber-500" : "bg-indigo-100 text-indigo-700")}>
              {user.nome?.[0] || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className={cn("text-sm font-semibold truncate", isSuperAdmin ? "text-white" : "text-slate-800")}>{user.nome}</span>
              <span className={cn("text-xs capitalize", isSuperAdmin ? "text-amber-500 font-bold" : "text-slate-500")}>
                {isSuperAdmin ? 'Administrador Master' : user.perfil}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors font-medium",
              isSuperAdmin ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-red-600 hover:bg-red-50"
            )}
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

const Login = ({ addToast }: { addToast: (m: string, t?: any) => void }) => {
  const [email, setEmail] = useState('admin@admin.com');
  const [senha, setSenha] = useState('123');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/forgot-password', { email: forgotEmail });
      addToast(res.data.message, 'success');
      setStep('code');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao processar solicitação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/verify-reset-code', { email: forgotEmail, code: resetCode });
      addToast('Código verificado com sucesso!', 'success');
      setStep('newPassword');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Código inválido ou expirado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      addToast('As senhas não coincidem', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reset-password-with-code', { email: forgotEmail, code: resetCode, novaSenha });
      addToast('Senha alterada com sucesso!', 'success');
      setShowForgot(false);
      setStep('email');
      setForgotEmail('');
      setResetCode('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao alterar senha', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', { email, senha });
      if (res.data.user.primeiro_acesso) {
        localStorage.setItem('tempToken', res.data.token);
        localStorage.setItem('tempUser', JSON.stringify(res.data.user));
        setMustChangePassword(true);
        addToast('Primeiro acesso detectado. Por favor, altere sua senha.', 'info');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('activeEmpresaId', res.data.user.empresa_id.toString());
        addToast('Bem-vindo ao sistema!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      addToast('Credenciais inválidas ou erro no servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      addToast('As senhas não coincidem', 'error');
      return;
    }
    if (novaSenha.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres', 'error');
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
      addToast('Senha alterada com sucesso!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast('Erro ao alterar senha', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden relative z-10"
      >
        <div className="p-12">
          <div className="flex justify-center mb-10">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-3xl shadow-xl shadow-indigo-200 transform hover:rotate-6 transition-transform">
              <School className="text-white" size={44} />
            </div>
          </div>
          
          {!mustChangePassword ? (
            !showForgot ? (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">EduManager</h2>
                  <p className="text-slate-500 font-medium">Gestão escolar inteligente e simplificada</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowForgot(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Entrar no Sistema
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Recuperar Senha</h2>
                  <p className="text-slate-500 font-medium">
                    {step === 'email' && 'Informe seu e-mail para receber o código'}
                    {step === 'code' && 'Informe o código de 6 dígitos enviado'}
                    {step === 'newPassword' && 'Defina sua nova senha de acesso'}
                  </p>
                </div>

                {step === 'email' && (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Enviar Código
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {step === 'code' && (
                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Código de Recuperação</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="text"
                          maxLength={6}
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-center text-2xl tracking-[0.5em]"
                          placeholder="000000"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Verificar Código
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="w-full text-indigo-600 font-bold text-xs hover:underline"
                    >
                      Não recebeu? Tentar novamente
                    </button>
                  </form>
                )}

                {step === 'newPassword' && (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                      <input
                        type="password"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="Repita a senha"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Alterar Senha
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setStep('email');
                    }}
                    className="w-full text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                  >
                    Voltar para o Login
                  </button>
                </div>
              </>
            )
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Nova Senha</h2>
                <p className="text-slate-500 font-medium">Defina sua senha definitiva para continuar</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="Repita a nova senha"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Confirmar e Acessar'}
                </button>
              </form>
            </>
          )}
        </div>
        <div className="bg-slate-50/50 p-8 text-center border-t border-slate-100">
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} EduManager. Todos os direitos reservados.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }: { toasts: any[], onRemove: (id: number) => void }) => (
  <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
    <AnimatePresence>
      {toasts.map(toast => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          className={cn(
            "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] border",
            toast.type === 'success' ? "bg-emerald-600 text-white border-emerald-500" :
            toast.type === 'error' ? "bg-red-600 text-white border-red-500" :
            "bg-slate-800 text-white border-slate-700"
          )}
        >
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
          <p className="font-bold text-sm flex-1">{toast.message}</p>
          <button onClick={() => onRemove(toast.id)} className="text-white/60 hover:text-white">
            <X size={16} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ alunos: 0, financeiro: 0, turmas: 0, inadimplencia: 0 });
  const [globalStats, setGlobalStats] = useState({ totalEmpresas: 0, totalAlunos: 0, totalUsuarios: 0, totalFinanceiro: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [alunoData, setAlunoData] = useState<any>(null);
  const [showMatriculaModal, setShowMatriculaModal] = useState(false);
  const [matriculaData, setMatriculaData] = useState({ aluno_id: '', turma_id: '' });
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.perfil === 'admin';
  const isSuperAdmin = !!user.super_admin;

  const fetchData = async () => {
    try {
      if (isSuperAdmin) {
        const res = await api.get('/system/stats');
        setGlobalStats(res.data);
      }

      if (user.perfil === 'aluno') {
        const res = await api.get(`/portal-aluno/${user.aluno_id}`);
        setAlunoData(res.data);
      } else {
        const [alunosRes, financeiroRes, turmasRes, matriculasRes] = await Promise.all([
          api.get('/alunos'),
          api.get('/financeiro'),
          api.get('/turmas'),
          api.get('/matriculas')
        ]);
        
        setAlunos(alunosRes.data);
        setTurmas(turmasRes.data);

        const totalFinanceiro = financeiroRes.data.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0);
        const inadimplentes = financeiroRes.data.filter((f: any) => f.status === 'pendente' || f.status === 'atrasado').length;

        setStats({
          alunos: alunosRes.data.length,
          financeiro: totalFinanceiro,
          turmas: turmasRes.data.length,
          inadimplencia: inadimplentes
        });

        // Processamento de dados para os gráficos
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentYear = new Date().getFullYear();
        
        const dynamicChartData = months.map((month, index) => {
          const monthMatriculas = matriculasRes.data.filter((m: any) => {
            const d = new Date(m.data_matricula);
            return d.getMonth() === index && d.getFullYear() === currentYear;
          }).length;
          
          const monthFinanceiro = financeiroRes.data.filter((f: any) => {
            const d = new Date(f.vencimento);
            return d.getMonth() === index && d.getFullYear() === currentYear && f.status === 'pago';
          }).reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0);

          return { name: month, matriculas: monthMatriculas, financeiro: monthFinanceiro };
        });

        setChartData(dynamicChartData);
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

  if (isSuperAdmin) {
    return (
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Painel Master</h1>
            <p className="text-slate-500 mt-2 font-medium">Visão geral de todo o ecossistema EduManager</p>
          </div>
          <div className="flex items-center gap-3">
             <Link to="/escolas" className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center gap-3 active:scale-95">
               <School size={22} />
               Gerenciar Escolas
             </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="bg-amber-100 text-amber-600 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10">
              <School size={28} />
            </div>
            <div className="relative z-10">
              <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total de Escolas</span>
              <h3 className="text-4xl font-black text-slate-800 mt-2">{globalStats.totalEmpresas}</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10">
              <Users size={28} />
            </div>
            <div className="relative z-10">
              <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total de Alunos</span>
              <h3 className="text-4xl font-black text-slate-800 mt-2">{globalStats.totalAlunos}</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="bg-indigo-100 text-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10">
              <ShieldCheck size={28} />
            </div>
            <div className="relative z-10">
              <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total de Usuários</span>
              <h3 className="text-4xl font-black text-slate-800 mt-2">{globalStats.totalUsuarios}</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10">
              <DollarSign size={28} />
            </div>
            <div className="relative z-10">
              <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Receita Global</span>
              <h3 className="text-3xl font-black text-slate-800 mt-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(globalStats.totalFinanceiro)}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-4">Bem-vindo ao Centro de Controle Master</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Como Administrador Master, você tem controle total sobre todas as instâncias do sistema. 
              Gerencie escolas, monitore o crescimento global e garanta a integridade de todo o ecossistema EduManager.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/escolas" className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                Configurar Unidades
              </Link>
              <Link to="/configuracoes" className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm">
                Configurações Globais
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  {alunoData.notas.map((n: any) => (
                    <tr key={n.id || `nota-${n.disciplina}`} className="hover:bg-slate-50/50 transition-colors">
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
                  {alunoData.financeiro.map((f: any) => (
                    <tr key={f.id || `fin-${f.vencimento}`} className="hover:bg-slate-50/50 transition-colors">
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Matrículas</span>
            </div>
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
              <DollarSign size={20} className="text-emerald-600" />
              Receita por Mês
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Receita (R$)</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
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
  const { alunoId: urlAlunoId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const alunoId = urlAlunoId || user.aluno_id;
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
    if (!alunoId) {
      if (user.perfil === 'admin' || user.super_admin) {
        setError('Dica: Como administrador, você deve acessar o mural através da gestão de alunos.');
      } else {
        setError('Acesso negado: Este usuário não possui um ID de aluno vinculado.');
      }
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [portalRes, comRes, solRes, finSolRes] = await Promise.all([
        api.get(`/portal-aluno/${alunoId}`),
        api.get(`/comunicados-aluno/${alunoId}`),
        api.get(`/solicitacoes-documentos?aluno_id=${alunoId}`),
        api.get(`/solicitacoes-financeiras?aluno_id=${alunoId}`)
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
  }, [alunoId]);

  const handleMarcarLido = async (id: number) => {
    try {
      await api.post('/comunicados/marcar-lido', { comunicado_id: id, aluno_id: alunoId });
      fetchData();
    } catch (err) {
      alert('Erro ao marcar como lido');
    }
  };

  const handleRequestDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/solicitacoes-documentos', { 
        aluno_id: alunoId, 
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
        aluno_id: alunoId, 
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
      <div className="bg-indigo-50 text-indigo-600 p-8 rounded-[32px] border border-indigo-100 max-w-md text-center shadow-xl shadow-indigo-50">
        <LayoutDashboard size={48} className="mx-auto mb-4 opacity-50" />
        <p className="font-bold text-lg leading-tight">{error}</p>
      </div>
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
                  {data.notas.map((n: any) => (
                    <tr key={n.id || `nota-${n.disciplina}`} className="hover:bg-slate-50/50 transition-colors">
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
                    {data.financeiro.map((f: any) => (
                      <tr key={f.id || `fin-${f.vencimento}`} className="hover:bg-slate-50/50 transition-colors">
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
                {statsData.map((s: any, idx: number) => (
                  <div key={s.id || `stat-${s.nome}-${idx}`} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
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
            <div className="text-center border-b-2 border-slate-800 pb-8 mb-8 flex flex-col items-center">
              {empresa.logo_url && (
                <img 
                  src={empresa.logo_url} 
                  alt="Logo" 
                  className="h-24 mb-4 object-contain" 
                  referrerPolicy="no-referrer"
                />
              )}
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

              {type === "Declaração Escolar" && (
                <div className="space-y-6 text-justify leading-relaxed">
                  <p>
                    A Instituição de Ensino <strong>{empresa.nome}</strong>, por meio de sua Secretaria Escolar, declara que o(a) aluno(a) 
                    <strong> {aluno.nome}</strong>, portador(a) do CPF nº <strong>{aluno.cpf}</strong>, 
                    está devidamente matriculado(a) e frequentando as aulas do {aluno.turma_nome || '---'} no ano letivo de {new Date().getFullYear()}.
                  </p>
                  <p>
                    Esta declaração é válida para fins de comprovação de escolaridade junto a órgãos públicos e privados.
                  </p>
                  <div className="pt-20 text-center">
                    <p>{empresa.endereco?.split(',')[0] || 'Cidade'}, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <div className="mt-20 border-t border-slate-800 w-64 mx-auto pt-2">
                      <p className="font-bold">{diretor || empresa.diretor || 'Direção Escolar'}</p>
                      <p className="text-xs uppercase">Diretor(a)</p>
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
                          <th className="border border-slate-300 p-2 text-center">Bimestre</th>
                          <th className="border border-slate-300 p-2 text-center">Nota / Conceito</th>
                          <th className="border border-slate-300 p-2 text-center">Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boletim.map((item: any) => (
                          <tr key={item.id || `boletim-table-${item.disciplina}-${item.bimestre}`}>
                            <td className="border border-slate-300 p-2">{item.disciplina}</td>
                            <td className="border border-slate-300 p-2 text-center">{item.bimestre}º</td>
                            <td className="border border-slate-300 p-2 text-center font-mono font-bold">
                              {item.tipo_avaliacao === 'conceito' ? item.conceito : (item.valor !== null ? item.valor.toFixed(1) : '---')}
                            </td>
                            <td className="border border-slate-300 p-2 text-center">
                              <span className={(item.valor >= 6 || item.conceito === 'A' || item.conceito === 'B' || item.conceito === 'P') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                {(item.valor >= 6 || item.conceito === 'A' || item.conceito === 'B' || item.conceito === 'P') ? 'APROVADO' : 'REPROVADO'}
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
                    {boletim.map((item: any) => (
                      <div key={item.id || `boletim-ficha-${item.disciplina}-${item.bimestre}`} className="border border-slate-200 p-6 rounded-xl space-y-4">
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
                        <th className="border border-slate-300 p-2 text-center">Bimestre</th>
                        <th className="border border-slate-300 p-2 text-center">Nota / Conceito</th>
                        <th className="border border-slate-300 p-2 text-center">Frequência</th>
                        <th className="border border-slate-300 p-2 text-center">Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boletim.map((item, idx) => (
                        <tr key={item.id || `boletim-row-${idx}`}>
                          <td className="border border-slate-300 p-2">{item.disciplina}</td>
                          <td className="border border-slate-300 p-2 text-center">{item.carga_horaria || '80'}h</td>
                          <td className="border border-slate-300 p-2 text-center">{item.bimestre}º</td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {item.tipo_avaliacao === 'conceito' ? item.conceito : (item.valor !== null ? item.valor.toFixed(1) : '---')}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">95%</td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {(item.valor >= 6 || item.conceito === 'A' || item.conceito === 'B' || item.conceito === 'P') ? 'APROVADO' : 'REPROVADO'}
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
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-document, #printable-document * {
            visibility: visible !important;
          }
          #printable-document {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            z-index: 9999 !important;
          }
          /* Hide scrollbars and other UI elements during print */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const Relatorios = () => {
  const [activeSubTab, setActiveSubTab] = useState('alunos');
  const [alunos, setAlunos] = useState<any[]>([]);
  const [financeiro, setFinanceiro] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [aluRes, finRes, turRes] = await Promise.all([
          api.get('/alunos'),
          api.get('/financeiro'),
          api.get('/turmas')
        ]);
        setAlunos(aluRes.data);
        setFinanceiro(finRes.data);
        setTurmas(turRes.data);
      } catch (err) {
        console.error('Erro ao buscar dados para relatórios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAlunos = alunos.filter(a => {
    // Filter by school year (ano letivo) of the student's turma
    if (filterYear) {
      const turma = turmas.find(t => t.id === a.turma_id);
      if (!turma || turma.ano_letivo?.toString() !== filterYear) return false;
    }

    // Filter by date range (intervalo) based on registration date (data_matricula)
    if (startDate || endDate) {
      if (!a.data_matricula) return false;
      const regDate = new Date(a.data_matricula);
      if (startDate && regDate < new Date(startDate)) return false;
      if (endDate && regDate > new Date(endDate)) return false;
    }

    return true;
  });

  const inadimplentes = financeiro.filter(f => {
    if (f.status !== 'pendente') return false;
    const vencimento = new Date(f.vencimento || f.data_vencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  });

  const printReport = (title: string, contentId: string) => {
    const printContent = document.getElementById(contentId);
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; font-size: 18px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório: ${title}</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          ${printContent.innerHTML}
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Relatórios</h1>
          <p className="text-slate-500 mt-1">Extração de dados e indicadores do sistema.</p>
        </div>
      </header>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('alunos')}
          className={cn(
            "px-8 py-3 rounded-xl text-sm font-bold transition-all",
            activeSubTab === 'alunos' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
          )}
        >
          Relatório de Alunos
        </button>
        <button
          onClick={() => setActiveSubTab('inadimplencia')}
          className={cn(
            "px-8 py-3 rounded-xl text-sm font-bold transition-all",
            activeSubTab === 'inadimplencia' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
          )}
        >
          Inadimplência
        </button>
      </div>

      {activeSubTab === 'alunos' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ano Letivo</label>
              <input 
                type="number" 
                placeholder="Ex: 2024" 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data Inicial (Matrícula)</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data Final (Matrícula)</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={() => printReport('Relatório de Alunos', 'report-alunos')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
            >
              <Printer size={18} />
              Imprimir
            </button>
          </div>

          <div id="report-alunos" className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Nome</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Nascimento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Turma</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAlunos.map(a => (
                  <tr key={a.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{a.nome}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(a.data_nascimento).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{a.turma_nome || '---'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{a.responsavel_legal || a.nome_mae || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'inadimplencia' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Alunos com Mensalidades em Atraso</h3>
              <p className="text-sm text-slate-500">Total de {inadimplentes.length} registros pendentes.</p>
            </div>
            <button 
              onClick={() => printReport('Relatório de Inadimplência', 'report-inadimplencia')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
            >
              <Printer size={18} />
              Imprimir
            </button>
          </div>

          <div id="report-inadimplencia" className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Aluno</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Vencimento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Valor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Dias de Atraso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inadimplentes.map(f => {
                  const vencimento = new Date(f.vencimento || f.data_vencimento);
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  const diffTime = hoje.getTime() - vencimento.getTime();
                  const diasAtraso = Math.max(0, Math.floor(diffTime / (1000 * 3600 * 24)));
                  return (
                    <tr key={f.id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{f.aluno_nome}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{vencimento.toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-bold">R$ {f.valor.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{diasAtraso} dias</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlunos = useMemo(() => {
    return alunos.filter(a => 
      a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.cpf && a.cpf.includes(searchTerm))
    );
  }, [alunos, searchTerm]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Buscar Aluno:</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Selecione o Aluno:</label>
                <select 
                  value={selectedAlunoId}
                  onChange={(e) => setSelectedAlunoId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Selecione um aluno...</option>
                  {filteredAlunos.map(a => <option key={a.id} value={a.id}>{a.nome} - {a.cpf}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DocumentCard 
              title="Declaração de Matrícula" 
              icon={FileText} 
              description="Gere declarações oficiais para alunos ativos." 
              onClick={() => handleGenerate("Declaração de Matrícula")}
            />
            <DocumentCard 
              title="Declaração Escolar" 
              icon={FileCheck} 
              description="Declaração de escolaridade para diversos fins." 
              onClick={() => handleGenerate("Declaração Escolar")}
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
            <Palette size={20} className="text-indigo-600" />
            Personalização Visual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Cor Primária do Sistema</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={empresa.cor_primaria || '#4f46e5'} 
                  disabled={!user.super_admin}
                  onChange={(e) => setEmpresa({...empresa, cor_primaria: e.target.value})}
                  className="w-16 h-16 rounded-2xl border-4 border-white shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                />
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={empresa.cor_primaria || '#4f46e5'} 
                    disabled={!user.super_admin}
                    onChange={(e) => setEmpresa({...empresa, cor_primaria: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono text-sm disabled:bg-slate-50" 
                  />
                </div>
              </div>
              {!user.super_admin && <p className="text-[10px] text-slate-400 mt-2 italic">Somente o Administrador Master pode alterar as cores da rede.</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Tema do Sistema</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  disabled={!user.super_admin}
                  onClick={() => setEmpresa({...empresa, tema: 'light'})}
                  className={cn(
                    "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    empresa.tema === 'light' ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 hover:border-slate-200 text-slate-500",
                    !user.super_admin && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Sun size={24} />
                  <span className="font-bold text-sm">Claro</span>
                </button>
                <button
                  type="button"
                  disabled={!user.super_admin}
                  onClick={() => setEmpresa({...empresa, tema: 'dark'})}
                  className={cn(
                    "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    empresa.tema === 'dark' ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 hover:border-slate-200 text-slate-500",
                    !user.super_admin && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Moon size={24} />
                  <span className="font-bold text-sm">Escuro</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Mail size={20} className="text-indigo-600" />
            Configurações de E-mail (SMTP)
          </h2>
          <p className="text-slate-500 text-sm mb-6">Configure o servidor SMTP para envio de e-mails de recuperação de senha e notificações.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Servidor SMTP (Host)</label>
              <input 
                type="text" 
                value={empresa.smtp_host || ''} 
                onChange={(e) => setEmpresa({...empresa, smtp_host: e.target.value})}
                placeholder="smtp.exemplo.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Porta SMTP</label>
              <input 
                type="number" 
                value={empresa.smtp_port || ''} 
                onChange={(e) => setEmpresa({...empresa, smtp_port: e.target.value})}
                placeholder="587"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail Remetente (From)</label>
              <input 
                type="email" 
                value={empresa.smtp_from || ''} 
                onChange={(e) => setEmpresa({...empresa, smtp_from: e.target.value})}
                placeholder="nao-responda@escola.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Usuário SMTP</label>
              <input 
                type="text" 
                value={empresa.smtp_user || ''} 
                onChange={(e) => setEmpresa({...empresa, smtp_user: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Senha SMTP</label>
              <input 
                type="password" 
                value={empresa.smtp_pass || ''} 
                onChange={(e) => setEmpresa({...empresa, smtp_pass: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
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
  const [loading, setLoading] = useState(false);
  const [escolaAtual, setEscolaAtual] = useState<any>(null);
  
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
    assento: '',
    matricula: '',
    nis: '',
    cor_raca: '',
    deficiencia: false,
    deficiencia_tipo: '',
    nacionalidade: 'Brasileira',
    certidao_nascimento: '',
    pais_origem: 'Brasil',
    municipio_nascimento: '',
    zona_residencial: 'Urbana',
    localizacao_diferenciada: 'Não se aplica'
  });

  const healthProblemsList = [
    'Asma', 'Diabetes', 'Epilepsia', 'Alergia Alimentar', 
    'Alergia a Medicamentos', 'Problemas Cardíacos', 
    'TDAH', 'Autismo', 'Anemia', 'Intolerância a Lactose', 
    'Problemas de Visão', 'Problemas de Audição', 'Outros'
  ];

  const fetchAlunos = async () => {
    const [aluRes, turRes, escolaRes] = await Promise.all([
      api.get('/alunos'),
      api.get('/turmas'),
      api.get('/escola-atual')
    ]);
    setAlunos(aluRes.data);
    setTurmas(turRes.data);
    setEscolaAtual(escolaRes.data);
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
        email_responsavel: '',
        matricula: '', nis: '', cor_raca: '', deficiencia: false, deficiencia_tipo: '',
        nacionalidade: 'Brasileira', certidao_nascimento: '', pais_origem: 'Brasil', municipio_nascimento: '',
        zona_residencial: 'Urbana', localizacao_diferenciada: 'Não se aplica'
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

  const generateFichaMatricula = (aluno: any) => {
    const doc = window.open('', '_blank');
    if (!doc) return;
    const html = `
      <html>
        <head>
          <title>Ficha de Matrícula - ${aluno.nome}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; background: #f8fafc; padding: 8px 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #4f46e5; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .field { margin-bottom: 8px; }
            .label { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block; }
            .value { font-size: 14px; font-weight: 500; }
            .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; text-align: center; }
            .sig { border-top: 1px solid #ccc; padding-top: 10px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0; color: #1e293b;">${escolaAtual?.nome || 'FICHA DE MATRÍCULA'}</h1>
            <p style="margin:5px 0; color: #64748b;">Ano Letivo: ${new Date().getFullYear()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">DADOS DO ALUNO</div>
            <div class="grid">
              <div class="field"><span class="label">Nome</span><span class="value">${aluno.nome}</span></div>
              <div class="field"><span class="label">CPF</span><span class="value">${aluno.cpf}</span></div>
              <div class="field"><span class="label">RG</span><span class="value">${aluno.rg || '---'}</span></div>
              <div class="field"><span class="label">Nascimento</span><span class="value">${new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</span></div>
              <div class="field"><span class="label">Turma</span><span class="value">${aluno.turma_nome || 'A definir'}</span></div>
              <div class="field"><span class="label">E-mail</span><span class="value">${aluno.email || '---'}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">FILIAÇÃO E RESPONSÁVEIS</div>
            <div class="grid">
              <div class="field"><span class="label">Mãe</span><span class="value">${aluno.nome_mae || '---'}</span></div>
              <div class="field"><span class="label">Pai</span><span class="value">${aluno.nome_pai || '---'}</span></div>
              <div class="field"><span class="label">Responsável Legal</span><span class="value">${aluno.responsavel_legal || '---'}</span></div>
              <div class="field"><span class="label">Contato</span><span class="value">${aluno.whatsapp_responsavel || aluno.telefone || '---'}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ENDEREÇO</div>
            <div class="field"><span class="label">Logradouro</span><span class="value">${aluno.endereco}, ${aluno.numero} - ${aluno.bairro}</span></div>
            <div class="field"><span class="label">Cidade/UF</span><span class="value">${aluno.cidade} - ${aluno.estado} | CEP: ${aluno.cep}</span></div>
          </div>

          <div class="footer">
            <div class="sig">Assinatura do Responsável</div>
            <div class="sig">Secretaria Escolar</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    doc.document.write(html);
    doc.document.close();
  };

  const generateDeclaracaoEscolaridade = (aluno: any) => {
    const doc = window.open('', '_blank');
    if (!doc) return;
    const html = `
      <html>
        <head>
          <title>Declaração de Escolaridade - ${aluno.nome}</title>
          <style>
            body { font-family: serif; padding: 80px; line-height: 1.8; text-align: justify; }
            .header { text-align: center; margin-bottom: 60px; }
            .title { font-weight: bold; text-decoration: underline; margin-bottom: 40px; display: block; text-align: center; font-size: 20px; }
            .footer { margin-top: 100px; text-align: center; }
            .sig { border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0;">${escolaAtual?.nome || 'INSTITUIÇÃO DE ENSINO'}</h1>
            <p>${escolaAtual?.endereco || ''}</p>
          </div>
          
          <span class="title">DECLARAÇÃO DE ESCOLARIDADE</span>
          
          <p>Declaramos para os devidos fins que o(a) aluno(a) <b>${aluno.nome}</b>, portador(a) do CPF nº <b>${aluno.cpf}</b>, encontra-se regularmente matriculado(a) nesta unidade de ensino, cursando a turma <b>${aluno.turma_nome || '---'}</b> no ano letivo de ${new Date().getFullYear()}.</p>
          
          <p>Por ser verdade, firmamos a presente declaração.</p>
          
          <p style="text-align: right; margin-top: 50px;">${aluno.cidade || 'Local'}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>

          <div class="footer">
            <div class="sig">Secretaria Escolar / Direção</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    doc.document.write(html);
    doc.document.close();
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
                        <button onClick={() => generateFichaMatricula(aluno)} className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all" title="Ficha de Matrícula">
                          <FileCheck size={18} />
                        </button>
                        <button onClick={() => generateDeclaracaoEscolaridade(aluno)} className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-all" title="Declaração de Escolaridade">
                          <FileText size={18} />
                        </button>
                        <Link to={`/boletim/${aluno.id}`} className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all" title="Ver Boletim">
                          <BookOpen size={18} />
                        </Link>
                        <Link to={`/mural/${aluno.id}`} className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all" title="Ver Mural">
                          <LayoutDashboard size={18} />
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
                <button 
                  onClick={() => setActiveFormTab('educacenso')}
                  className={cn("px-8 py-4 font-bold text-sm transition-all border-b-2", activeFormTab === 'educacenso' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500")}
                >
                  Educacenso
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
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Matrícula</label>
                          <input
                            type="text"
                            value={formData.matricula || ''}
                            onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Gerado automaticamente"
                          />
                        </div>
                        <div>
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

                {activeFormTab === 'educacenso' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">NIS (PIS/PASEP)</label>
                      <input
                        type="text"
                        value={formData.nis || ''}
                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Cor / Raça</label>
                      <select
                        value={formData.cor_raca || ''}
                        onChange={(e) => setFormData({ ...formData, cor_raca: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="">Selecione</option>
                        <option value="Branca">Branca</option>
                        <option value="Preta">Preta</option>
                        <option value="Parda">Parda</option>
                        <option value="Amarela">Amarela</option>
                        <option value="Indígena">Indígena</option>
                        <option value="Não declarado">Não declarado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Certidão de Nascimento</label>
                      <input
                        type="text"
                        value={formData.certidao_nascimento || ''}
                        onChange={(e) => setFormData({ ...formData, certidao_nascimento: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Termo, Livro, Folha..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nacionalidade</label>
                      <input
                        type="text"
                        value={formData.nacionalidade || ''}
                        onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">País de Origem</label>
                      <input
                        type="text"
                        value={formData.pais_origem || ''}
                        onChange={(e) => setFormData({ ...formData, pais_origem: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Município de Nascimento</label>
                      <input
                        type="text"
                        value={formData.municipio_nascimento || ''}
                        onChange={(e) => setFormData({ ...formData, municipio_nascimento: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Zona Residencial</label>
                      <select
                        value={formData.zona_residencial || ''}
                        onChange={(e) => setFormData({ ...formData, zona_residencial: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="Urbana">Urbana</option>
                        <option value="Rural">Rural</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-8">
                      <input
                        type="checkbox"
                        id="deficiencia"
                        checked={formData.deficiencia || false}
                        onChange={(e) => setFormData({ ...formData, deficiencia: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="deficiencia" className="text-sm font-bold text-slate-700">Possui Deficiência / TGD / Altas Habilidades</label>
                    </div>
                    {formData.deficiencia && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Deficiência</label>
                        <input
                          type="text"
                          value={formData.deficiencia_tipo || ''}
                          onChange={(e) => setFormData({ ...formData, deficiencia_tipo: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Ex: Autismo, Deficiência Visual..."
                        />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Localização Diferenciada</label>
                      <select
                        value={formData.localizacao_diferenciada || ''}
                        onChange={(e) => setFormData({ ...formData, localizacao_diferenciada: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="Não se aplica">Não se aplica</option>
                        <option value="Área de assentamento">Área de assentamento</option>
                        <option value="Terra indígena">Terra indígena</option>
                        <option value="Área remanescente de quilombo">Área remanescente de quilombo</option>
                      </select>
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
  const [vinculos, setVinculos] = useState<any[]>([]);
  const [escolaAtual, setEscolaAtual] = useState<any>(null);

  const [showVinculosModal, setShowVinculosModal] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [newVinculo, setNewVinculo] = useState({ disciplina_id: '', turma_id: '' });

  const fetchData = async () => {
    const [fRes, dRes, tRes, eRes] = await Promise.all([
      api.get('/funcionarios'),
      api.get('/disciplinas'),
      api.get('/turmas'),
      api.get('/escola-atual')
    ]);
    setFuncionarios(fRes.data);
    setDisciplinas(dRes.data);
    setTurmas(tRes.data);
    setEscolaAtual(eRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchVinculos = async (funcionarioId: number) => {
    try {
      const res = await api.get(`/professor-vinculos/${funcionarioId}`);
      setVinculos(res.data);
    } catch (err) {
      console.error('Erro ao buscar vínculos:', err);
    }
  };

  const handleAddVinculo = async () => {
    if (!newVinculo.disciplina_id || !newVinculo.turma_id) {
      alert('Selecione a disciplina e a turma.');
      return;
    }
    try {
      await api.post('/professor-vinculos/add', {
        funcionario_id: selectedProfessor.id,
        disciplina_id: newVinculo.disciplina_id,
        turma_id: newVinculo.turma_id
      });
      setNewVinculo({ disciplina_id: '', turma_id: '' });
      fetchVinculos(selectedProfessor.id);
    } catch (err: any) {
      alert(`Erro ao adicionar vínculo: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleRemoveVinculo = async (id: number) => {
    if (confirm('Deseja realmente remover este vínculo?')) {
      try {
        await api.delete(`/professor-vinculos/${id}`);
        fetchVinculos(selectedProfessor.id);
      } catch (err) {
        alert('Erro ao remover vínculo');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Salvando funcionário:', formData);
      let funcionarioId = editingItem?.id;
      if (editingItem) {
        await api.post(`/funcionarios/${editingItem.id}`, formData);
      } else {
        const res = await api.post('/funcionarios', formData);
        funcionarioId = res.data.id;
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      fetchData();

      // Se for professor e for um novo cadastro, abre a tela de vínculos
      if (!editingItem && formData.cargo?.includes('Professor')) {
        const newProf = { ...formData, id: funcionarioId };
        setSelectedProfessor(newProf);
        setVinculos([]);
        setShowVinculosModal(true);
      }

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

  const generateDeclaracaoVinculo = (f: any) => {
    const doc = window.open('', '_blank');
    if (!doc) return;
    const html = `
      <html>
        <head>
          <title>Declaração de Vínculo - ${f.nome}</title>
          <style>
            body { font-family: serif; padding: 80px; line-height: 1.8; text-align: justify; }
            .header { text-align: center; margin-bottom: 60px; }
            .title { font-weight: bold; text-decoration: underline; margin-bottom: 40px; display: block; text-align: center; font-size: 20px; }
            .footer { margin-top: 100px; text-align: center; }
            .sig { border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0;">${escolaAtual?.nome || 'INSTITUIÇÃO DE ENSINO'}</h1>
            <p>${escolaAtual?.endereco || ''}</p>
          </div>
          
          <span class="title">DECLARAÇÃO DE VÍNCULO EMPREGATÍCIO</span>
          
          <p>Declaramos para os devidos fins que o(a) Sr(a). <b>${f.nome}</b>, portador(a) do CPF nº <b>${f.cpf}</b>, possui vínculo profissional com esta instituição de ensino, exercendo atualmente o cargo de <b>${f.cargo}</b>.</p>
          
          <p>O referido colaborador encontra-se em pleno exercício de suas atividades profissionais desde ${f.data_admissao ? new Date(f.data_admissao).toLocaleDateString('pt-BR') : 'a data de sua admissão'}.</p>
          
          <p>Por ser verdade, firmamos a presente declaração.</p>
          
          <p style="text-align: right; margin-top: 50px;">${f.cidade || 'Local'}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>

          <div class="footer">
            <div class="sig">Direção / Recursos Humanos</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    doc.document.write(html);
    doc.document.close();
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Funcionários</h1>
          <p className="text-slate-500 mt-1">Gestão de equipe e colaboradores.</p>
        </div>
        <button
          onClick={() => { 
            setEditingItem(null); 
            setFormData({}); 
            setVinculos([]); 
            setShowModal(true); 
          }}
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
                      onClick={() => generateDeclaracaoVinculo(f)}
                      className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-all"
                      title="Gerar Declaração de Vínculo"
                    >
                      <FileText size={18} />
                    </button>
                    <button 
                      onClick={async () => { 
                        setEditingItem(f); 
                        setFormData(f); 
                        setVinculos([]); 
                        setShowModal(true); 
                        if (f.cargo?.includes('Professor')) {
                          try {
                            const vRes = await api.get(`/professor-vinculos/${f.id}`);
                            setVinculos(vRes.data);
                          } catch (err) {
                            console.error('Erro ao buscar vínculos:', err);
                          }
                        }
                      }}
                      className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="Editar Funcionário"
                    >
                      <SettingsIcon size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(f.id)}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                      title="Excluir Funcionário"
                    >
                      <Trash2 size={18} />
                    </button>
                    {f.cargo?.includes('Professor') && (
                      <button 
                        onClick={() => {
                          setSelectedProfessor(f);
                          fetchVinculos(f.id);
                          setShowVinculosModal(true);
                        }}
                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all"
                        title="Gerar Vínculos"
                      >
                        <BookOpen size={18} />
                      </button>
                    )}
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

      <AnimatePresence>
        {showVinculosModal && selectedProfessor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVinculosModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Vínculos do Professor</h2>
                  <p className="text-slate-500 mt-1">{selectedProfessor.nome}</p>
                </div>
                <button onClick={() => setShowVinculosModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                <h3 className="font-bold text-slate-700 mb-4">Adicionar Novo Vínculo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Disciplina</label>
                    <select
                      value={newVinculo.disciplina_id}
                      onChange={(e) => setNewVinculo({ ...newVinculo, disciplina_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      {disciplinas.map(d => (
                        <option key={d.id} value={d.id}>{d.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Turma/Sala</label>
                    <select
                      value={newVinculo.turma_id}
                      onChange={(e) => setNewVinculo({ ...newVinculo, turma_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddVinculo}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Inserir Vínculo
                </button>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 mb-4">Vínculos Atuais</h3>
                {vinculos.length === 0 ? (
                  <p className="text-slate-500 text-sm italic text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                    Nenhum vínculo cadastrado para este professor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {vinculos.map((v) => {
                      const disciplina = disciplinas.find(d => d.id === Number(v.disciplina_id));
                      const turma = turmas.find(t => t.id === Number(v.turma_id));
                      return (
                        <div key={v.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <div>
                            <p className="font-bold text-slate-800">{disciplina?.nome || 'Disciplina Desconhecida'}</p>
                            <p className="text-sm text-slate-500">{turma?.nome || 'Turma Desconhecida'}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveVinculo(v.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Remover Vínculo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ControleAcesso = ({ addToast }: { addToast: (m: string, t?: any) => void }) => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [permissoes, setPermissoes] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const combinedList = useMemo(() => {
    const list: any[] = [];
    
    // Add all students
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
    
    // Add all employees
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

    // Add users that are not linked to students or employees (like the main Admin)
    usuarios.forEach(u => {
      if (!u.aluno_id && !u.funcionario_id) {
        // Check if already in list (shouldn't be, but just in case)
        if (!list.find(item => item.usuario?.id === u.id)) {
          list.push({
            id: u.id,
            nome: u.nome,
            tipo: 'usuario',
            email: u.email,
            cargo: u.perfil === 'admin' ? 'Administrador' : 'Usuário do Sistema',
            usuario: u,
            isNew: false
          });
        }
      }
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
    { id: 'Transferências', label: 'Gestão de Transferências' },
    { id: 'Acesso', label: 'Controle de Acesso' },
    { id: 'Relatórios', label: 'Relatórios' },
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
    const targetUserId = selectedUser?.id || selectedRecord?.usuario?.id;
    
    if (!targetUserId) {
      addToast('Usuário não identificado para o reset', 'error');
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/usuarios/reset-password', {
        usuario_id: targetUserId,
        nova_senha: newPassword
      });
      addToast('Senha resetada com sucesso! O usuário deverá alterá-la no próximo acesso.', 'success');
      setShowResetModal(false);
      setNewPassword('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao resetar senha';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
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
          perfil: selectedRecord.tipo === 'aluno' ? 'aluno' : (selectedRecord.cargo?.includes('Professor') ? 'professor' : 'funcionario'),
          aluno_id: selectedRecord.tipo === 'aluno' ? selectedRecord.id : null,
          professor_id: selectedRecord.tipo === 'funcionario' && selectedRecord.cargo?.includes('Professor') ? selectedRecord.id : null,
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
      pode_excluir: 0
    };

    let newAcesso = current.pode_acessar;
    let newEditar = current.pode_editar;
    let newExcluir = current.pode_excluir;

    if (field === 'pode_acessar') {
      newAcesso = current.pode_acessar ? 0 : 1;
      if (newAcesso === 0) {
        newEditar = 0;
        newExcluir = 0;
      }
    } else {
      const newVal = current[field] ? 0 : 1;
      if (field === 'pode_editar') newEditar = newVal;
      if (field === 'pode_excluir') newExcluir = newVal;
      
      // Se qualquer um for ativado, o acesso deve ser ativado
      if (newVal === 1) newAcesso = 1;
    }

    const payload = {
      usuario_id: selectedUser.id,
      tela: telaId,
      pode_acessar: newAcesso,
      pode_editar: newEditar,
      pode_excluir: newExcluir
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
          pode_excluir: 1
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
          pode_excluir: 0
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
        {showResetModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Resetar Senha: {selectedRecord?.nome}</h3>
                <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500">Digite uma nova senha temporária para o usuário. Ele será obrigado a alterá-la no próximo login.</p>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Nova Senha Temporária</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={loading || newPassword.length < 6}
                  className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Confirmar Reset de Senha'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
                        onClick={() => setShowResetModal(true)}
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
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {telas.map(tela => {
                            const p = permissoes.find(perm => perm.tela === tela.id) || {
                              pode_acessar: 0,
                              pode_editar: 0,
                              pode_excluir: 0
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
  const [showFreqMap, setShowFreqMap] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [monthlyFreq, setMonthlyFreq] = useState<any[]>([]);
  const [historicoNotas, setHistoricoNotas] = useState<any[]>([]);
  const [historicoFreq, setHistoricoFreq] = useState<any[]>([]);
  const [professorVinculos, setProfessorVinculos] = useState<any[]>([]);
  const [statsFreq, setStatsFreq] = useState<any>({});
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.perfil === 'admin';
  const isProfessor = user.perfil === 'professor';

  const fetchData = async () => {
    const [a, t, d] = await Promise.all([
      api.get('/alunos'),
      api.get('/turmas'),
      api.get('/disciplinas')
    ]);
    setAlunos(a.data);
    
    if (isProfessor && user?.professor_id) {
      const vRes = await api.get(`/professor-vinculos/${user.professor_id}`);
      setProfessorVinculos(vRes.data);
      
      // Filter turmas and disciplinas based on vinculos
      const linkedTurmaIds = [...new Set(vRes.data.map((v: any) => v.turma_id))];
      const linkedDisciplinaIds = [...new Set(vRes.data.map((v: any) => v.disciplina_id))];
      
      setTurmas(t.data.filter((turma: any) => linkedTurmaIds.includes(turma.id)));
      setDisciplinas(d.data.filter((disc: any) => linkedDisciplinaIds.includes(disc.id)));
    } else {
      setTurmas(t.data);
      setDisciplinas(d.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchMonthlyFreq = async () => {
    if (!turmaId || !disciplinaId) return;
    try {
      const res = await api.get(`/frequencia-mensal/${turmaId}/${disciplinaId}/${selectedMonth}/${selectedYear}`);
      setMonthlyFreq(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showFreqMap) {
      fetchMonthlyFreq();
    }
  }, [showFreqMap, turmaId, disciplinaId, selectedMonth, selectedYear]);

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
    if (turmaId && disciplinaId && dataFreq) {
      api.get(`/frequencia-turma/${turmaId}/${disciplinaId}/${dataFreq}`)
        .then(res => {
          const freqMap: any = {};
          res.data.forEach((f: any) => {
            freqMap[f.aluno_id] = f.status;
          });
          // Merge with current state to avoid overwriting unsaved changes if needed, 
          // but usually we want to load what's in the DB for that date.
          setFrequenciaData(prev => ({ ...prev, ...freqMap }));
        })
        .catch(console.error);
    }
  }, [turmaId, disciplinaId, dataFreq]);

  useEffect(() => {
    if (turmaId) {
      const initialNotas: any = {};
      alunos.filter(a => a.turma_id === parseInt(turmaId)).forEach(a => {
        initialNotas[a.id] = { valor: '', conceito: '', observacao: '' };
      });
      setNotasColetivas(initialNotas);
    } else {
      setNotasColetivas({});
    }
  }, [turmaId, alunos]);

  const saveTimeoutRef = useRef<any>(null);

  const fetchStats = async () => {
    if (!turmaId || !disciplinaId) return;
    try {
      const res = await api.get(`/frequencia-stats/${turmaId}/${disciplinaId}`);
      setStatsFreq(res.data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas de frequência:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [turmaId, disciplinaId]);

  const saveFrequencia = async (data: any) => {
    if (!turmaId || !disciplinaId) return;
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const frequencias = Object.entries(data).map(([id, status]) => ({
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
        fetchStats();
      } catch (err) {
        console.error('Erro ao salvar frequência automaticamente:', err);
      }
    }, 500); // Debounce of 500ms
  };

  const handleFrequenciaChange = (alunoId: number, status: string) => {
    const oldStatus = frequenciaData[alunoId];
    const newFreq = { ...frequenciaData, [alunoId]: status };
    setFrequenciaData(newFreq);
    
    // Update local stats for immediate feedback
    const currentStats = statsFreq[alunoId] || { presencas: 0, ausencias: 0, justificadas: 0, total: 0 };
    let newPresencas = currentStats.presencas || 0;
    let newAusencias = currentStats.ausencias || 0;
    let newJustificadas = currentStats.justificadas || 0;
    let newTotal = currentStats.total || 0;

    if (!oldStatus && status) {
      newTotal++;
    } else if (oldStatus && !status) {
      newTotal--;
    }

    if (oldStatus === 'P') newPresencas--;
    else if (oldStatus === 'F') newAusencias--;
    else if (oldStatus === 'FJ') newJustificadas--;

    if (status === 'P') newPresencas++;
    else if (status === 'F') newAusencias++;
    else if (status === 'FJ') newJustificadas++;

    const newPerc = newTotal > 0 ? ((newPresencas + newJustificadas) / newTotal) * 100 : 100;

    setStatsFreq({
      ...statsFreq,
      [alunoId]: {
        ...currentStats,
        presencas: newPresencas,
        ausencias: newAusencias,
        justificadas: newJustificadas,
        total: newTotal,
        percentual: newPerc.toFixed(1)
      }
    });

    saveFrequencia(newFreq);
  };

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

  const availableDisciplinas = useMemo(() => {
    if (!turmaId) return [];
    
    let filtered = disciplinas;
    
    // If professor, filter by vinculos for the selected turma
    if (isProfessor && user?.professor_id) {
      const linkedDisciplinaIds = professorVinculos
        .filter((v: any) => v.turma_id === parseInt(turmaId))
        .map((v: any) => v.disciplina_id);
      
      filtered = disciplinas.filter((d: any) => linkedDisciplinaIds.includes(d.id));
    } else {
      // If admin, filter disciplines by the course of the selected turma
      const selectedTurma = turmas.find(t => t.id === parseInt(turmaId));
      if (selectedTurma) {
        filtered = disciplinas.filter((d: any) => d.curso_id === selectedTurma.curso_id);
      }
    }
    
    return filtered;
  }, [turmaId, disciplinas, isProfessor, professorVinculos, user?.professor_id, turmas]);

  useEffect(() => {
    if (disciplinaId && !availableDisciplinas.find(d => d.id === parseInt(disciplinaId))) {
      setDisciplinaId('');
    }
  }, [availableDisciplinas, disciplinaId]);

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
            onClick={() => setShowFreqMap(!showFreqMap)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              showFreqMap ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Calendar size={18} />
            Mapa de Frequência
          </button>
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
        {showFreqMap ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">Mapa de Frequência Mensal</h2>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[2023, 2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={() => setShowFreqMap(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-400 uppercase sticky left-0 bg-slate-50 z-10">Aluno</th>
                    {Array.from({ length: 31 }, (_, i) => (
                      <th key={`day-${i}`} className="px-2 py-3 font-bold text-slate-400 text-center w-8 border-l border-slate-100">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAlunos.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100">{a.nome}</td>
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = (i + 1).toString().padStart(2, '0');
                        const dateStr = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${day}`;
                        const freq = monthlyFreq.find(f => f.aluno_id === a.id && f.data === dateStr);
                        return (
                          <td 
                            key={`cell-${a.id}-${i}`} 
                            className="px-2 py-3 text-center border-l border-slate-100 cursor-pointer hover:bg-indigo-50 transition-colors"
                            onClick={() => {
                              const statuses = ['', 'P', 'F', 'FJ'];
                              const currentStatus = freq?.status || '';
                              const currentIndex = statuses.indexOf(currentStatus);
                              const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                              
                              // Create a temporary frequenciaData object to use handleFrequenciaChange logic
                              // but we need to handle the date as well.
                              // For the map, we might need a direct API call or a more complex state update.
                              // Let's implement a direct save for the map interaction.
                              const updateFreq = async () => {
                                try {
                                  await api.post('/frequencia-coletiva', {
                                    turma_id: parseInt(turmaId),
                                    disciplina_id: parseInt(disciplinaId),
                                    data: dateStr,
                                    frequencias: [{ aluno_id: a.id, status: nextStatus }]
                                  });
                                  fetchMonthlyFreq();
                                  // Also update stats if it's the current dateFreq
                                  if (dateStr === dataFreq) {
                                    fetchStats();
                                  }
                                } catch (err) {
                                  console.error('Erro ao atualizar frequência no mapa:', err);
                                }
                              };
                              updateFreq();
                            }}
                          >
                            {freq ? (
                              <span className={cn(
                                "w-6 h-6 rounded flex items-center justify-center font-bold text-[10px]",
                                freq.status === 'P' ? "bg-emerald-100 text-emerald-700" :
                                freq.status === 'F' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {freq.status}
                              </span>
                            ) : (
                              <span className="text-slate-200">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
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
              {availableDisciplinas.map(d => <option key={d.id} value={d.id}>{d.nome} ({d.tipo_avaliacao})</option>)}
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
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 italic">Salvamento automático habilitado</span>
                    <button
                      onClick={() => saveFrequencia(frequenciaData)}
                      disabled={loading || filteredAlunos.length === 0}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : 'Forçar Salvamento'}
                    </button>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase text-center w-12">Nº</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase w-32">Matrícula</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Aluno</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Frequência ({new Date(dataFreq + 'T12:00:00').toLocaleDateString('pt-BR')})</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase text-center">P</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase text-center">F</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase text-center">% Freq</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAlunos.map((a, idx) => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-4 text-xs font-mono text-slate-500">{a.matricula || '---'}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">{a.nome}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">
                                {new Date(dataFreq + 'T12:00:00').toLocaleDateString('pt-BR')}
                              </span>
                              <select
                                value={frequenciaData[a.id] || ''}
                                onChange={(e) => handleFrequenciaChange(a.id, e.target.value)}
                                className={cn(
                                  "px-4 py-2 rounded-xl font-bold text-sm outline-none transition-all border-2 w-full max-w-[160px]",
                                  frequenciaData[a.id] === 'P' ? "bg-emerald-50 border-emerald-500 text-emerald-700" :
                                  frequenciaData[a.id] === 'F' ? "bg-red-50 border-red-500 text-red-700" :
                                  frequenciaData[a.id] === 'FJ' ? "bg-amber-50 border-amber-500 text-amber-700" :
                                  "bg-slate-50 border-slate-200 text-slate-400"
                                )}
                              >
                                <option value="">Selecionar</option>
                                <option value="P">P</option>
                                <option value="F">F</option>
                                <option value="FJ">FJ</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-bold text-emerald-600">
                            {statsFreq[a.id]?.presencas || 0}
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-bold text-red-600">
                            {statsFreq[a.id]?.ausencias || 0}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold",
                              parseFloat(statsFreq[a.id]?.percentual || '100') >= 75 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                              {statsFreq[a.id]?.percentual || '100'}%
                            </span>
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
                              <div className="flex flex-col gap-2">
                                {selectedDisciplina?.tipo_avaliacao === 'nota' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Nota:</span>
                                    <input
                                      type="number"
                                      step="0.1"
                                      defaultValue={nota?.valor || ''}
                                      onBlur={(e) => {
                                        const val = parseFloat(e.target.value);
                                        api.post('/notas', { 
                                          aluno_id: a.id, 
                                          disciplina_id: disciplinaId, 
                                          turma_id: turmaId,
                                          bimestre: parseInt(bimestre),
                                          valor: isNaN(val) ? null : val,
                                          conceito: nota?.conceito,
                                          observacao: nota?.observacao
                                        });
                                      }}
                                      className="w-20 px-2 py-1 border rounded text-sm"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Conceito:</span>
                                    <select
                                      defaultValue={nota?.conceito || ''}
                                      onChange={(e) => {
                                        api.post('/notas', { 
                                          aluno_id: a.id, 
                                          disciplina_id: disciplinaId, 
                                          turma_id: turmaId,
                                          bimestre: parseInt(bimestre),
                                          valor: nota?.valor,
                                          conceito: e.target.value,
                                          observacao: nota?.observacao
                                        });
                                      }}
                                      className="px-2 py-1 border rounded text-sm bg-white"
                                    >
                                      <option value="">Selecione</option>
                                      <option value="Iniciado">Iniciado (I)</option>
                                      <option value="Em Desenvolvimento">Em Desenvolvimento (ED)</option>
                                      <option value="Desenvolvido">Desenvolvido (D)</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <textarea
                                defaultValue={nota?.observacao || ''}
                                onBlur={(e) => {
                                  api.post('/notas', { 
                                    aluno_id: a.id, 
                                    disciplina_id: disciplinaId, 
                                    turma_id: turmaId,
                                    bimestre: parseInt(bimestre),
                                    valor: nota?.valor,
                                    conceito: nota?.conceito,
                                    observacao: e.target.value
                                  });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm h-12"
                                placeholder="Observações..."
                              />
                            </td>
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
          </>
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
                {notas.map((n) => (
                  <tr key={n.id || `boletim-nota-${n.disciplina}-${n.bimestre}`} className="hover:bg-slate-50 transition-colors">
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
                {frequencia.map((f) => (
                  <tr key={f.id || `boletim-freq-${f.data}`} className="hover:bg-slate-50 transition-colors">
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

const Transferencias = () => {
  const [transferencias, setTransferencias] = useState<any[]>([]);
  const [empresasRede, setEmpresasRede] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showRequisitarModal, setShowRequisitarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [escolaAtual, setEscolaAtual] = useState<any>(null);
  const [formData, setFormData] = useState({
    aluno_id: '',
    escola_destino_id: '',
    tipo: 'interna',
    escola_externa_nome: '',
    motivo: '',
    observacoes: ''
  });
  const [requisitarData, setRequisitarData] = useState({
    aluno_cpf: '',
    escola_origem_id: '',
    motivo: '',
    observacoes: ''
  });

  const fetchData = async () => {
    try {
      // Fetch concurrently but handle errors individually if needed
      const [transRes, redeRes, alunosRes, escolaRes] = await Promise.all([
        api.get('/transferencias').catch(err => ({ data: [] })),
        api.get('/empresas-rede').catch(err => ({ data: [] })),
        api.get('/alunos').catch(err => ({ data: [] })),
        api.get('/escola-atual').catch(err => ({ data: null }))
      ]);
      
      setTransferencias(Array.isArray(transRes.data) ? transRes.data : []);
      setEmpresasRede(Array.isArray(redeRes.data) ? redeRes.data : []);
      setAlunos(Array.isArray(alunosRes.data) ? alunosRes.data : []);
      setEscolaAtual(escolaRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados de transferência:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transferencias', formData);
      setShowModal(false);
      fetchData();
      alert('Solicitação de transferência enviada!');
    } catch (err) {
      alert('Erro ao criar transferência');
    } finally {
      setLoading(false);
    }
  };

  const handleRequisitarTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transferencias/requisitar', requisitarData);
      setShowRequisitarModal(false);
      fetchData();
      alert('Requisição de transferência enviada!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao requisitar transferência');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const obs = prompt('Observações (opcional):');
    try {
      await api.post(`/transferencias/${id}/status`, { status, observacoes: obs });
      fetchData();
      alert(`Transferência ${status === 'aprovada' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  const generateDeclaration = (t: any) => {
    const doc = window.open('', '_blank');
    if (!doc) return;

    const html = `
      <html>
        <head>
          <title>Declaração de Transferência</title>
          <style>
            body { font-family: sans-serif; padding: 50px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 50px; }
            .content { text-align: justify; }
            .footer { margin-top: 100px; text-align: center; }
            .signature { border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${escolaAtual?.nome || 'ESCOLA'}</h1>
            <p>${escolaAtual?.endereco || ''} - Tel: ${escolaAtual?.telefone || ''}</p>
            <hr/>
            <h2>DECLARAÇÃO DE TRANSFERÊNCIA</h2>
          </div>
          <div class="content">
            <p>Declaramos para os devidos fins que o(a) aluno(a) <b>${t.aluno_nome}</b>, está em processo de transferência desta unidade escolar para a instituição <b>${t.tipo === 'interna' ? t.escola_destino_nome : t.escola_externa_nome}</b>.</p>
            <p>O referido aluno encontra-se com sua documentação regularizada e apto para prosseguir seus estudos na instituição de destino.</p>
            <p>Motivo da transferência: ${t.motivo || 'Não informado'}</p>
            <br/>
            <p>Local e data: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="footer">
            <div class="signature">
              <p>Direção / Secretaria Escolar</p>
              <p>${escolaAtual?.nome || ''}</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    doc.document.write(html);
    doc.document.close();
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Transferências</h1>
          <p className="text-slate-500 mt-2">Gerencie a movimentação de alunos entre escolas da rede e externas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowRequisitarModal(true)}
            className="bg-white text-indigo-600 border border-indigo-200 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Requisitar Aluno
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <ArrowRightLeft size={20} />
            Nova Transferência
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Origem</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Destino</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transferencias.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-800">{t.aluno_nome}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-600">{t.escola_origem_nome}</td>
                  <td className="px-8 py-6 text-sm text-slate-600">
                    {t.tipo === 'interna' ? t.escola_destino_nome : t.escola_externa_nome}
                    {t.tipo === 'externa' && <span className="ml-2 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">Externa</span>}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase",
                      t.status === 'pendente' ? "bg-amber-100 text-amber-700" :
                      t.status === 'aprovada' ? "bg-emerald-100 text-emerald-700" :
                      t.status === 'rejeitada' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                    )}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500">
                    {new Date(t.data_solicitacao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {t.status === 'pendente' && t.escola_origem_id === escolaAtual?.id && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(t.id, 'aprovada')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Aprovar Saída"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(t.id, 'rejeitada')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Rejeitar Saída"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {t.status === 'aprovada' && (
                        <button 
                          onClick={() => generateDeclaration(t)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Gerar Declaração"
                        >
                          <FileCheck size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transferencias.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-400 font-medium">Nenhuma transferência registrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Transferência (Saída) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Nova Transferência</h2>
                  <p className="text-slate-500 text-sm">Solicite a saída de um aluno da escola.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateTransfer} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Aluno</label>
                    <select 
                      value={formData.aluno_id}
                      onChange={(e) => setFormData({...formData, aluno_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    >
                      <option value="">Selecione o aluno</option>
                      {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Transferência</label>
                    <div className="flex gap-4">
                      <label className="flex-1 flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                        <input type="radio" name="tipo" value="interna" checked={formData.tipo === 'interna'} onChange={() => setFormData({...formData, tipo: 'interna'})} />
                        <span className="text-sm font-medium">Rede Interna</span>
                      </label>
                      <label className="flex-1 flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                        <input type="radio" name="tipo" value="externa" checked={formData.tipo === 'externa'} onChange={() => setFormData({...formData, tipo: 'externa'})} />
                        <span className="text-sm font-medium">Escola Externa</span>
                      </label>
                    </div>
                  </div>
                  {formData.tipo === 'interna' ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Escola de Destino</label>
                      <select 
                        value={formData.escola_destino_id}
                        onChange={(e) => setFormData({...formData, escola_destino_id: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      >
                        <option value="">Selecione a escola</option>
                        {empresasRede.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Escola Externa</label>
                      <input 
                        type="text"
                        value={formData.escola_externa_nome}
                        onChange={(e) => setFormData({...formData, escola_externa_nome: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ex: Colégio Estadual..."
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Motivo</label>
                    <input 
                      type="text"
                      value={formData.motivo}
                      onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Ex: Mudança de endereço"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Solicitar Transferência'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Requisitar Aluno (Entrada) */}
      <AnimatePresence>
        {showRequisitarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowRequisitarModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Requisitar Aluno</h2>
                  <p className="text-slate-500 text-sm">Solicite a vinda de um aluno de outra escola da rede.</p>
                </div>
                <button onClick={() => setShowRequisitarModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleRequisitarTransfer} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">CPF do Aluno</label>
                    <input 
                      type="text"
                      value={requisitarData.aluno_cpf}
                      onChange={(e) => setRequisitarData({...requisitarData, aluno_cpf: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Escola de Origem</label>
                    <select 
                      value={requisitarData.escola_origem_id}
                      onChange={(e) => setRequisitarData({...requisitarData, escola_origem_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    >
                      <option value="">Selecione a escola</option>
                      {empresasRede.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Motivo da Requisição</label>
                    <input 
                      type="text"
                      value={requisitarData.motivo}
                      onChange={(e) => setRequisitarData({...requisitarData, motivo: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Ex: Solicitação dos pais"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowRequisitarModal(false)} className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Requisitar Aluno'}
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

const Escolas = () => {
  const [escolas, setEscolas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/todas-empresas');
      setEscolas(res.data);
    } catch (err) {
      console.error('Erro ao buscar escolas:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await api.put(`/empresas/${formData.id}`, formData);
        alert('Escola atualizada com sucesso!');
      } else {
        await api.post('/empresas', formData);
        alert('Escola cadastrada com sucesso!');
      }
      setShowModal(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert('Erro ao salvar escola');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir esta escola? Todos os dados vinculados serão inacessíveis.')) {
      try {
        await api.delete(`/empresas/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir escola');
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Escolas da Rede</h1>
          <p className="text-slate-500 mt-1">Gerencie as unidades escolares da sua rede.</p>
        </div>
        <button
          onClick={() => { setFormData({}); setShowModal(true); }}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Escola
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {escolas.map(e => (
          <div key={e.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => { setFormData(e); setShowModal(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                <SettingsIcon size={18} />
              </button>
              <button onClick={() => handleDelete(e.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <School size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{e.nome}</h3>
            <p className="text-slate-500 text-sm mb-6">ID: {e.id}</p>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              Unidade Ativa
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-800">{formData.id ? 'Editar Escola' : 'Nova Escola'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Instituição</label>
                    <input type="text" value={formData.nome || ''} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">CNPJ</label>
                    <input type="text" value={formData.cnpj || ''} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Endereço</label>
                    <input type="text" value={formData.endereco || ''} onChange={(e) => setFormData({...formData, endereco: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Telefone</label>
                    <input type="text" value={formData.telefone || ''} onChange={(e) => setFormData({...formData, telefone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>

                  {!formData.id && (
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800 mb-4">Credenciais do Administrador da Unidade</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">E-mail de Login</label>
                          <input 
                            type="email" 
                            value={formData.admin_email || ''} 
                            onChange={(e) => setFormData({...formData, admin_email: e.target.value})} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="admin@escola.com"
                            required={!formData.id}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Senha Inicial</label>
                          <input 
                            type="password" 
                            value={formData.admin_senha || ''} 
                            onChange={(e) => setFormData({...formData, admin_senha: e.target.value})} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="••••••••"
                            required={!formData.id}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" disabled={loading} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">
                    {loading ? 'Salvando...' : (formData.id ? 'Atualizar Escola' : 'Cadastrar Escola')}
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

// --- App Root ---

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    // Initialize database
    api.post('/init-db').catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
        <Routes>
          <Route path="/login" element={<Login addToast={addToast} />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/escolas" element={<ProtectedRoute><Escolas /></ProtectedRoute>} />
        <Route path="/mural" element={<ProtectedRoute><MuralAluno /></ProtectedRoute>} />
        <Route path="/mural/:alunoId" element={<ProtectedRoute><MuralAluno /></ProtectedRoute>} />
        <Route path="/alunos" element={<ProtectedRoute><Alunos /></ProtectedRoute>} />
        <Route path="/funcionarios" element={<ProtectedRoute><Funcionarios /></ProtectedRoute>} />
        <Route path="/academic" element={<ProtectedRoute><Academic /></ProtectedRoute>} />
        <Route path="/professor" element={<ProtectedRoute><ProfessorPortal /></ProtectedRoute>} />
        <Route path="/mapa-sala" element={<ProtectedRoute><MapaDeSala /></ProtectedRoute>} />
        <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
        <Route path="/comunicacao" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
        <Route path="/secretaria" element={<ProtectedRoute><DigitalSecretary /></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
        <Route path="/transferencias" element={<ProtectedRoute><Transferencias /></ProtectedRoute>} />
        <Route path="/controle-acesso" element={<ProtectedRoute><ControleAcesso addToast={addToast} /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/boletim/:alunoId" element={<ProtectedRoute><Boletim /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}
