import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

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
          <div className="mb-5 flex h-[116px] w-[220px] items-center justify-center overflow-hidden rounded-xl bg-white p-2">
            <img
              src="/logo-vk.png"
              alt="VK Mármores — Soluções que constroem"
              className="h-full w-full object-contain"
            />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">TechSell</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Gestão comercial para a VK marmore.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Pedidos, estoque, visitas, orçamentos e desempenho em um único ambiente profissional.
          </p>
        </div>

        <div className="login-card w-full max-w-md justify-self-center rounded-3xl border border-white/10 bg-[#111A2D] p-8 text-white shadow-elevated">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-[60px] w-[112px] items-center justify-center overflow-hidden rounded-lg bg-white p-1 lg:hidden">
              <img
                src="/logo-vk.png"
                alt="VK Mármores — Soluções que constroem"
                className="h-full w-full object-contain"
              />
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
            <p>Rafaela Ferrari — rafaela.ferrari / admin123</p>
            <p>Davi Silva — davi.silva / 123456</p>
            <p>Davi Barbosa — davi.barbosa / 123456</p>
            <p>Vinicius Kauan — vinicius.kauan / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
