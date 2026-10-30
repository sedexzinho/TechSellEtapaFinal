import React from 'react';
import { useAuthStore } from '../store/authStore';
import { SeedService } from '../repositories/seedService';

const ConfigurationsPage = () => {
  const { user } = useAuthStore();
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState('');

  const handleResetData = async () => {
    setIsResetting(true);
    setResetMessage('');
    
    try {
      const seedService = new SeedService();
      await seedService.resetData();
      setResetMessage('Dados restaurados com sucesso!');
      
      setTimeout(() => {
        setResetMessage('');
      }, 3000);
    } catch (error) {
      setResetMessage('Erro ao restaurar dados: ' + (error as Error).message);
      console.error('Error resetting data:', error);
    } finally {
      setIsResetting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-shell max-w-3xl">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Informações da conta e manutenção dos dados de exemplo.</p>
      </div>
      
      {user.perfil === 'ADMIN' && (
        <div className="surface-card p-6">
          <h2 className="section-title mb-2">Administração</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Restaura os dados de exemplo armazenados no navegador. Esta ação substitui os registros atuais.
          </p>
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="btn-danger"
          >
            {isResetting ? 'Restaurando...' : 'Restaurar dados de exemplo'}
          </button>
          {resetMessage && (
            <p className={`mt-4 ${resetMessage.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
              {resetMessage}
            </p>
          )}
        </div>
      )}
      
      <div className="surface-card p-6">
        <h2 className="section-title mb-4">Informações do sistema</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary">Usuário</dt>
            <dd className="font-medium">{user.nome}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Perfil</dt>
            <dd className="font-medium">{user.perfil === 'ADMIN' ? 'Administrador' : 'Vendedor'}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Login</dt>
            <dd className="font-medium">{user.login}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Status</dt>
            <dd>
              <span className={`badge ${user.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {user.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ConfigurationsPage;
