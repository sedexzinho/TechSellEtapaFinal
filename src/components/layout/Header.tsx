import { LogOut, Menu, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationMenu from '../ui/NotificationMenu';

interface HeaderProps {
  isMobile: boolean;
  onToggleMobileMenu: () => void;
}

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral da operação' },
  '/produtos': { title: 'Produtos e Estoque', subtitle: 'Catálogo e controle de disponibilidade' },
  '/clientes': { title: 'Clientes', subtitle: 'Cadastro e relacionamento comercial' },
  '/pedidos': { title: 'Pedidos', subtitle: 'Acompanhamento de vendas' },
  '/visitas': { title: 'Visitas e Orçamentos', subtitle: 'Rotina comercial em campo' },
  '/prospeccao': { title: 'Prospecção', subtitle: 'Funil de leads' },
  '/metas': { title: 'Metas e Desempenho', subtitle: 'Acompanhamento de resultados' },
  '/custos': { title: 'Custos', subtitle: 'Estrutura de custos do negócio' },
  '/relatorios': { title: 'Relatórios', subtitle: 'Análise e exportação de dados' },
  '/configuracoes': { title: 'Configurações', subtitle: 'Preferências e dados do sistema' },
};

const Header = ({ isMobile, onToggleMobileMenu }: HeaderProps) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_META[location.pathname] ?? { title: 'TechSell', subtitle: 'Sistema de gestão' };
  const initials = user?.nome?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'TS';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between gap-4 border-b border-navy-border/80 bg-navy-dark/90 px-4 backdrop-blur-xl lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        {isMobile && (
          <button
            onClick={onToggleMobileMenu}
            className="icon-btn"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div key={location.pathname} className="page-enter min-w-0">
          <h1 className="truncate text-base font-semibold text-text-primary">{meta.title}</h1>
          <p className="hidden truncate text-xs text-text-secondary sm:block">{meta.subtitle}</p>
        </div>
      </div>

      <div className="hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
          <input
            type="search"
            placeholder="Buscar no sistema..."
            className="w-full rounded-full border-navy-border bg-navy-card py-2 pl-9 pr-4 text-sm"
            aria-label="Busca"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationMenu />
        <div className="hidden items-center gap-2 rounded-full border border-navy-border bg-navy-card py-1 pl-1 pr-3 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{user?.nome}</p>
            <p className="text-[11px] text-text-secondary">{user?.perfil === 'ADMIN' ? 'Administrador' : 'Vendedor'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="icon-btn hover:bg-red-50 hover:text-red-600"
          aria-label="Sair"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
