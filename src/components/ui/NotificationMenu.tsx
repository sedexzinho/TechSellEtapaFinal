import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 'stock',
    title: 'Estoque baixo',
    detail: 'Alguns produtos atingiram o estoque mínimo.',
    time: 'Agora',
  },
  {
    id: 'orders',
    title: 'Pedidos do mês',
    detail: 'Acompanhe o volume operacional no painel.',
    time: 'Hoje',
  },
];

const NotificationMenu = () => {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const close = () => {
    setVisible(false);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setRendered(false), 200);
  };

  const open = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setRendered(true);
    requestAnimationFrame(() => setVisible(true));
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Notificações"
        aria-expanded={visible}
        onClick={() => (rendered ? close() : open())}
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-accent" />
      </button>
      {rendered && (
        <div className={`notification-panel ${visible ? 'is-open' : ''}`}>
          <div className="border-b border-navy-border px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">Notificações</p>
            <p className="text-xs text-text-secondary">Atualizações da operação</p>
          </div>
          <div className="stagger-children p-2">
            {NOTIFICATIONS.map((item) => (
              <div key={item.id} className="rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary">{item.title}</p>
                  <span className="text-[11px] text-text-disabled">{item.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
