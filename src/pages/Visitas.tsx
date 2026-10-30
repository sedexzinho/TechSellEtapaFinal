import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { VisitRepository } from '../repositories/visitRepository';
import { BudgetRepository } from '../repositories/budgetRepository';
import { CustomerRepository } from '../repositories/customerRepository';
import { ProductRepository } from '../repositories/productRepository';
import type { Visit, Budget } from '../schemas/visitSchema';
import type { Customer } from '../schemas/customerSchema';
import type { Product } from '../schemas/productSchema';
import VisitModal from '../components/ui/VisitModal';
import BudgetModal from '../components/ui/BudgetModal';

const VisitasPage: React.FC = () => {
  const { user } = useAuthStore();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visitas' | 'orcamentos'>('visitas');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [modalAction, setModalAction] = useState<'create' | 'edit'>('create');

  const visitRepository = new VisitRepository();
  const budgetRepository = new BudgetRepository();
  const customerRepository = new CustomerRepository();
  const productRepository = new ProductRepository();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const visitData = visitRepository.findAll();
      const budgetData = budgetRepository.findAll();
      setVisits(visitData);
      setBudgets(budgetData);
      setCustomers(customerRepository.findAll());
      setProducts(productRepository.findAll());
    } catch (err) {
      setError('Erro ao carregar visitas e orçamentos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVisit = () => {
    setModalAction('create');
    setSelectedVisit(null);
    setShowVisitModal(true);
  };

  const handleEditVisit = (visit: Visit) => {
    setModalAction('edit');
    setSelectedVisit(visit);
    setShowVisitModal(true);
  };

  const handleDeleteVisit = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta visita?')) {
      try {
        visitRepository.delete(id);
        loadData();
      } catch (err) {
        setError('Erro ao excluir visita');
        console.error(err);
      }
    }
  };

  const handleCancelVisit = async (visit: Visit) => {
    if (visit.status !== 'agendada') {
      setError('Apenas visitas agendadas podem ser canceladas');
      return;
    }
    if (window.confirm('Tem certeza que deseja cancelar esta visita?')) {
      try {
        const updatedVisit = { ...visit, status: 'cancelada' as const };
        visitRepository.update(visit.id, updatedVisit);
        loadData();
      } catch (err) {
        setError('Erro ao cancelar visita');
        console.error(err);
      }
    }
  };

  const handleVisitSubmit = (visitData: Omit<Visit, 'id'>) => {
    try {
      if (modalAction === 'create' && selectedVisit === null) {
        visitRepository.create({ ...visitData, id: Date.now() });
      } else if (modalAction === 'edit' && selectedVisit !== null) {
        visitRepository.update(selectedVisit.id, { ...selectedVisit, ...visitData });
      }
      loadData();
      setShowVisitModal(false);
    } catch (err) {
      setError('Erro ao salvar visita');
      console.error(err);
    }
  };

  const handleCreateBudget = () => {
    setModalAction('create');
    setSelectedBudget(null);
    setShowBudgetModal(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setModalAction('edit');
    setSelectedBudget(budget);
    setShowBudgetModal(true);
  };

  const handleDeleteBudget = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        budgetRepository.delete(id);
        loadData();
      } catch (err) {
        setError('Erro ao excluir orçamento');
        console.error(err);
      }
    }
  };

  const handleApproveBudget = async (budget: Budget) => {
    if (window.confirm('Tem certeza que deseja aprovar este orçamento?')) {
      try {
        const updatedBudget = { ...budget, status: 'aprovado' as const };
        budgetRepository.update(budget.id, updatedBudget);
        loadData();
      } catch (err) {
        setError('Erro ao aprovar orçamento');
        console.error(err);
      }
    }
  };

  const handleExecuteBudget = async (budget: Budget) => {
    if (window.confirm('Tem certeza que deseja executar este orçamento?')) {
      try {
        // VALIDAÇÃO DE ESTOQUE (RN03): Não executar se não tiver estoque suficiente
        // Esta validação seria feita no modal de orçamento ou aqui
        const updatedBudget = { ...budget, status: 'executado' as const };
        budgetRepository.update(budget.id, updatedBudget);
        loadData();
      } catch (err) {
        setError('Erro ao executar orçamento');
        console.error(err);
      }
    }
  };

  const handleCancelBudget = async (budget: Budget) => {
    if (window.confirm('Tem certeza que deseja cancelar este orçamento?')) {
      try {
        // SE JÁ EXECUTADO: ESTORNO DE ESTOQUE
        // Esta lógica seria implementada no modal de orçamento ou aqui
        const updatedBudget = { ...budget, status: 'cancelado' as const };
        budgetRepository.update(budget.id, updatedBudget);
        loadData();
      } catch (err) {
        setError('Erro ao cancelar orçamento');
        console.error(err);
      }
    }
  };

  const handleBudgetSubmit = (budgetData: Omit<Budget, 'id'>) => {
    try {
      if (modalAction === 'create' && selectedBudget === null) {
        budgetRepository.create({ ...budgetData, id: Date.now() });
      } else if (modalAction === 'edit' && selectedBudget !== null) {
        budgetRepository.update(selectedBudget.id, { ...selectedBudget, ...budgetData });
      }
      loadData();
      setShowBudgetModal(false);
    } catch (err) {
      setError('Erro ao salvar orçamento');
      console.error(err);
    }
  };

  if (user === null) {
    return <div>Carregando...</div>;
  }

  // Controle de acesso: VENDEDOR pode apenas visualizar
  const isAdmin = user?.perfil === 'ADMIN';

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Visitas e Orçamentos</h1>
          <p className="page-subtitle">Agenda comercial e propostas vinculadas aos clientes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCreateVisit}
            disabled={!isAdmin}
            className="btn-primary"
          >
            Nova Visita
          </button>
          <button
            onClick={handleCreateBudget}
            disabled={!isAdmin}
            className="btn-secondary"
          >
            Novo Orçamento
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setActiveTab('visitas')}
          className={`tab-btn ${activeTab === 'visitas' ? 'tab-btn-active' : ''}`}
        >
          Visitas
        </button>
        <button
          onClick={() => setActiveTab('orcamentos')}
          className={`tab-btn ${activeTab === 'orcamentos' ? 'tab-btn-active' : ''}`}
        >
          Orçamentos
        </button>
      </div>

      {activeTab === 'visitas' ? (
        <div>
          {isLoading ? (
            <div className="text-center py-8">Carregando visitas...</div>
          ) : visits.length === 0 ? (
            <div className="empty-state">Nenhuma visita encontrada</div>
          ) : (
            <div className="stagger-children grid gap-4 lg:grid-cols-2">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="surface-card surface-card-hover p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{visit.customerName}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(visit.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      visit.status === 'agendada'
                        ? 'bg-yellow-100 text-yellow-800'
                        : visit.status === 'realizada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {visit.status === 'agendada' ? 'Agendada' : visit.status === 'realizada' ? 'Realizada' : 'Cancelada'}
                    </span>
                  </div>
                  
                  {visit.notes && (
                    <p className="mb-2 text-gray-700">{visit.notes}</p>
                  )}

                  <div className="flex space-x-3">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditVisit(visit)}
                          className="btn-sm btn-outline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteVisit(visit.id)}
                          className="btn-sm btn-outline"
                        >
                          Excluir
                        </button>
                        {visit.status === 'agendada' && (
                          <button
                            onClick={() => handleCancelVisit(visit)}
                            className="btn-sm btn-outline"
                          >
                            Cancelar
                          </button>
                        )}
                      </>
                    )}
                    
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          // Vincular visita a orçamento (funcionalidade para vendedores)
                          setSelectedVisit(visit);
                          setModalAction('create');
                          setShowBudgetModal(true);
                        }}
                        className="btn-sm btn-outline"
                      >
                        Criar Orçamento
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div className="text-center py-8">Carregando orçamentos...</div>
          ) : budgets.length === 0 ? (
            <div className="empty-state">Nenhum orçamento encontrado</div>
          ) : (
            <div className="stagger-children grid gap-4 lg:grid-cols-2">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="surface-card surface-card-hover p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{budget.customerName}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(budget.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      budget.status === 'rascunho'
                        ? 'bg-yellow-100 text-yellow-800'
                        : budget.status === 'aprovado'
                        ? 'bg-blue-100 text-blue-800'
                        : budget.status === 'executado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {budget.status === 'rascunho' ? 'Rascunho' : budget.status === 'aprovado' ? 'Aprovado' : budget.status === 'executado' ? 'Executado' : 'Cancelado'}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <strong>Itens:</strong>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      {budget.items.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.productName} - R$ {item.subtotal.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 text-sm font-medium">
                      Total: R$ {budget.total.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditBudget(budget)}
                          className="btn-sm btn-outline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="btn-sm btn-outline"
                        >
                          Excluir
                        </button>
                        {budget.status === 'rascunho' && (
                          <>
                            <button
                              onClick={() => handleApproveBudget(budget)}
                              className="btn-sm btn-outline"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleExecuteBudget(budget)}
                              className="btn-sm btn-outline"
                            >
                              Executar
                            </button>
                          </>
                        )}
                        {(budget.status === 'aprovado' || budget.status === 'executado') && (
                          <button
                            onClick={() => handleCancelBudget(budget)}
                            className="btn-sm btn-outline"
                          >
                            Cancelar
                          </button>
                        )}
                      </>
                    )}
                    
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          // Visualizar orçamento (funcionalidade para vendedores)
                          setSelectedBudget(budget);
                          setModalAction('edit');
                          setShowBudgetModal(true);
                        }}
                        className="btn-sm btn-outline"
                      >
                        Visualizar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Visita */}
      <VisitModal
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        onSave={handleVisitSubmit}
        customers={customers}
        visit={selectedVisit}
      />

      {/* Modal de Orçamento */}
      <BudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSave={handleBudgetSubmit}
        customers={customers}
        products={products}
        visits={visits}
        budget={selectedBudget}
      />
    </div>
  );
};

export default VisitasPage;