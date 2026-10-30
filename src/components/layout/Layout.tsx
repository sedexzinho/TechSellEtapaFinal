import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarCollapsed = !isMobile && collapsed;
  const showSidebar = !isMobile || isMobileMenuOpen;

  return (
    <div className="min-h-screen bg-navy-dark text-text-primary">
      {showSidebar && (
        <>
          {isMobile && (
            <div
              className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          <Sidebar
            isMobile={isMobile}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => {
              if (isMobile) {
                setIsMobileMenuOpen(false);
              } else {
                setCollapsed((value) => !value);
              }
            }}
            onNavigate={() => isMobile && setIsMobileMenuOpen(false)}
          />
        </>
      )}

      <div className={`flex min-h-screen flex-col transition-all duration-200 ${isMobile ? '' : sidebarCollapsed ? 'ml-[76px]' : 'ml-64'}`}>
        <Header isMobile={isMobile} onToggleMobileMenu={() => setIsMobileMenuOpen((value) => !value)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-[1680px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
