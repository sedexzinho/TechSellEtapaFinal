import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  BarChart3, 
  Package, 
  Building2, 
  ClipboardList, 
  Truck, 
  Activity,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const { user } = useAuthStore();
  
  // Define nav items based on user role
  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
      { name: 'Produtos', href: '/produtos', icon: Package },
      { name: 'Clientes', href: '/clientes', icon: Building2 },
      { name: 'Pedidos', href: '/pedidos', icon: ClipboardList },
      { name: 'Visitas', href: '/visitas', icon: Truck },
      { name: 'Prospecção', href: '/prospeccao', icon: Activity },
    ];

    if (user?.perfil === 'ADMIN') {
      return [
        ...baseItems,
        { name: 'Metas', href: '/metas', icon: TrendingUp },
        { name: 'Relatórios', href: '/relatorios', icon: FileText },
        { name: 'Configurações', href: '/configuracoes', icon: Settings },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const [activeItem, setActiveItem] = useState('/dashboard');

  // Set active item based on current path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/dashboard')) setActiveItem('/dashboard');
    else if (path.startsWith('/produtos')) setActiveItem('/produtos');
    else if (path.startsWith('/clientes')) setActiveItem('/clientes');
    else if (path.startsWith('/pedidos')) setActiveItem('/pedidos');
    else if (path.startsWith('/visitas')) setActiveItem('/visitas');
    else if (path.startsWith('/prospeccao')) setActiveItem('/prospeccao');
    else if (path.startsWith('/metas')) setActiveItem('/metas');
    else if (path.startsWith('/relatorios')) setActiveItem('/relatorios');
    else if (path.startsWith('/configuracoes')) setActiveItem('/configuracoes');
  }, []);

  return (
    <div className="hidden md:block">
      {/* This component is only visible on mobile - will be shown via media query in CSS */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-navy-darker border-t border-navy-border flex items-center justify-around z-50">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center text-sm font-medium ${
              activeItem === item.href
                ? 'text-blue-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <item.icon className={`h-5 w-5 mb-1 ${
              activeItem === item.href
                ? 'text-blue-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`} />
            <span>{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;