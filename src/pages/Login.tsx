import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import { Eye, EyeOff, Gem, Lock, User } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [credentials, setCredentials] = useState({
    login: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0C1222] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div className="login-copy hidden lg:block">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300">
            <Gem className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">TechSell</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Gestão comercial para marmorarias, com clareza e controle.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Pedidos, estoque, visitas, orçamentos e desempenho em um único ambiente profissional.
          </p>
        </div>

        <div className="login-card w-full max-w-md justify-self-center rounded-3xl border border-white/10 bg-white p-8 text-text-primary shadow-elevated">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white lg:hidden">
              <Gem className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Entrar no TechSell</h2>
            <p className="mt-1 text-sm text-text-secondary">Use suas credenciais para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Login</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                <input
                  type="text"
                  value={credentials.login}
                  onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                  className="field-control pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="field-label">Senha</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.senha}
                  onChange={(e) => setCredentials({ ...credentials, senha: e.target.value })}
                  className="field-control pl-9 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Mostrar/ocultar senha"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="alert-error">{error}</p>}
            <Button type="submit" isLoading={isLoading} className="w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-text-secondary">
            <p className="mb-1 font-semibold text-slate-700">Usuários de teste</p>
            <p>admin / admin123 (ADMIN)</p>
            <p>ricardo / 123456 (VENDEDOR)</p>
            <p>fernanda / 123456 (VENDEDOR)</p>
            <p>paulo / 123456 (VENDEDOR)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
