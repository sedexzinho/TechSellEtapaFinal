import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const CustosPage = () => {
  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title">Custos</h1>
        <p className="page-subtitle">A estrutura de custos do negócio é gerenciada junto às metas mensais.</p>
      </div>
      <div className="surface-card surface-card-hover flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Gerenciamento disponível em Metas e Desempenho</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Custos fixos, variáveis e o lucro estimado do período continuam no módulo original, sem alteração das regras de negócio.
          </p>
        </div>
        <Link to="/metas" className="btn-primary">
          Abrir metas e custos
        </Link>
      </div>
    </div>
  );
};

export default CustosPage;
