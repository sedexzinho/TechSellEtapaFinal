import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  Package,
  Truck,
  Building2,
  Settings,
  Wallet,
  TrendingUp,
  FileText,
  Activity,
  ChevronsLeft,
  ChevronsRight,
  Gem,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../ui/utils';

interface SidebarProps {
  isMobile: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}

const Sidebar = ({ isMobile, collapsed, onToggleCollapse, onNavigate }: SidebarProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.perfil === 'ADMIN';

  const operations = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Produtos e Estoque', href: '/produtos', icon: Package },
    { name: 'Clientes', href: '/clientes', icon: Building2 },
    { name: 'Pedidos', href: '/pedidos', icon: ClipboardList },
  ];

  const relationship = [
    { name: 'Visitas e Orçamentos', href: '/visitas', icon: Truck },
    { name: 'Prospecção', href: '/prospeccao', icon: Activity },
  ];

  const management = isAdmin
    ? [
        { name: 'Metas e Desempenho', href: '/metas', icon: TrendingUp },
        { name: 'Custos', href: '/custos', icon: Wallet },
        { name: 'Relatórios', href: '/relatorios', icon: FileText },
        { name: 'Configurações', href: '/configuracoes', icon: Settings },
      ]
    : [];

  const renderGroup = (label: string, items: typeof operations) => (
    <div className="mb-5">
      {!collapsed && (
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted/80">
          {label}
        </p>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            title={collapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-teal-400/15 text-white shadow-sm ring-1 ring-inset ring-teal-300/20'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <item.icon className={cn('h-[18px] w-[18px] shrink-0', collapsed ? '' : 'mr-3')} />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-white shadow-[8px_0_30px_rgba(2,6,23,0.08)] transition-all duration-200',
        collapsed && !isMobile ? 'w-[76px]' : 'w-64'
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-white/5', collapsed ? 'justify-center px-2' : 'px-4')}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
          <Gem className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">TechSell</p>
            <p className="truncate text-[11px] text-sidebar-muted">Gestão para marmorarias</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {renderGroup('Operação', operations)}
        {renderGroup('Relacionamento', relationship)}
        {management.length > 0 && renderGroup('Gestão', management)}
      </div>

      <div className="border-t border-white/5 p-3">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-xl px-3 py-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : (
            <>
              <ChevronsLeft className="mr-2 h-4 w-4" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
