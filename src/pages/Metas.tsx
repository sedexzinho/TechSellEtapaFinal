import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useAuthStore } from '../store/authStore';
import { GoalRepository } from '../repositories/goalRepository';
import { CostRepository } from '../repositories/costRepository';
import type { Goal } from '../schemas/goalSchema';
import type { Cost } from '../schemas/costSchema';
import { UserRepository } from '../repositories/userRepository';

const MetasPage: FC = () => {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Current year
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editCost, setEditCost] = useState<Cost | null>(null);
  // Vendedor pré-selecionado quando ainda não existe meta para ele no mês
  const [goalFormError, setGoalFormError] = useState<string | null>(null);
  const [goalVendor, setGoalVendor] = useState<{ userId: number; userName: string } | null>(null);

  // Refs dos formulários (devem viver dentro do componente, não no módulo)
  const userRef = useRef<HTMLSelectElement>(null);
  const targetValueRef = useRef<HTMLInputElement>(null);
  const achievedValueRef = useRef<HTMLInputElement>(null);
  const descricaoRef = useRef<HTMLInputElement>(null);
  const valorRef = useRef<HTMLInputElement>(null);
  const tipoRef = useRef<HTMLSelectElement>(null);
  const mesRef = useRef<HTMLSelectElement>(null);
  const anoRef = useRef<HTMLSelectElement>(null);
  const recorrenteRef = useRef<HTMLInputElement>(null);

  const goalRepository = new GoalRepository();
  const costRepository = new CostRepository();
  const userRepository = new UserRepository();

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const goalsData = goalRepository.findByMonthYear(selectedMonth, selectedYear);
      const costsData = costRepository.findByMonthYear(selectedMonth, selectedYear);
      const usersData = userRepository.findAll();
      
      setGoals(goalsData);
      setCosts(costsData);
      setUsers(usersData);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openGoalModal = (vendor: { id: number; nome: string }, goal: Goal | null) => {
    setEditGoal(goal);
    setGoalVendor({ userId: vendor.id, userName: vendor.nome });
    setGoalFormError(null);
    setShowAddGoalModal(true);
  };

  const handleDeleteGoal = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        goalRepository.delete(id);
        loadData();
      } catch (err) {
        setError('Erro ao excluir meta');
        console.error(err);
      }
    }
  };

  const handleSaveGoal = async (goalData: Omit<Goal, 'id'>) => {
    try {
      if (editGoal) {
        const updatedGoal = { ...editGoal, ...goalData };
        goalRepository.update(editGoal.id, updatedGoal);
      } else {
        const newGoal = {
          ...goalData,
          id: Date.now()
        };
        goalRepository.create(newGoal);
      }
      loadData();
      setShowAddGoalModal(false);
    } catch (err) {
      setError('Erro ao salvar meta');
      console.error(err);
    }
  };

  const handleAddCost = () => {
    setEditCost(null);
    setShowAddCostModal(true);
  };

  const handleEditCost = (cost: Cost) => {
    setEditCost(cost);
    setShowAddCostModal(true);
  };

  const handleDeleteCost = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este custo?')) {
      try {
        costRepository.delete(id);
        loadData();
      } catch (err) {
        setError('Erro ao excluir custo');
        console.error(err);
      }
    }
  };

  const handleSaveCost = async (costData: Omit<Cost, 'id'>) => {
    try {
      if (editCost) {
        const updatedCost = { ...editCost, ...costData };
        costRepository.update(editCost.id, updatedCost);
      } else {
        const newCost = {
          ...costData,
          id: Date.now()
        };
        costRepository.create(newCost);
      }
      loadData();
      setShowAddCostModal(false);
    } catch (err) {
      setError('Erro ao salvar custo');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error">
        {error}
      </div>
    );
  }

  // Calculate totals
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetValue, 0);
  const totalAchieved = goals.reduce((sum, goal) => sum + goal.achievedValue, 0);
  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const totalFixedCosts = costs.filter(cost => cost.type === 'fixo').reduce((sum, cost) => sum + cost.amount, 0);
  const totalVariableCosts = costs.filter(cost => cost.type === 'variavel').reduce((sum, cost) => sum + cost.amount, 0);
  const performancePercentage = totalTarget === 0 ? 0 : (totalAchieved / totalTarget) * 100;
  const profit = totalAchieved - totalCosts;

  // Get user's own goals (for VENDEDOR view)
  const userGoals = goals.filter(goal => goal.userId === user?.id);
  const userTarget = userGoals.reduce((sum, goal) => sum + goal.targetValue, 0);
  const userAchieved = userGoals.reduce((sum, goal) => sum + goal.achievedValue, 0);
  const userPerformance = userTarget === 0 ? 0 : (userAchieved / userTarget) * 100;

  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title">Metas, Desempenho e Custos</h1>
        <p className="page-subtitle">Resultados do período selecionado e estrutura de custos.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-text-primary">Mês:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                <option key={month} value={month}>
                  {new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-text-primary">Ano:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visão Admin vs Vendedor */}
      {user?.perfil === 'ADMIN' ? (
        <>
          {/* Visão do Administrador */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">Visão Administrativa</h2>
            
            {/* Métricas gerais */}
            <div className="stagger-children mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="stat-card">
                <h3 className="text-sm font-medium text-text-secondary">Meta Total</h3>
                <p className="text-2xl font-bold text-blue-primary">R$ {totalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="stat-card">
                <h3 className="text-sm font-medium text-text-secondary">Atingido Total</h3>
                <p className="text-2xl font-bold text-green-600">R$ {totalAchieved.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="stat-card">
                <h3 className="text-sm font-medium text-text-secondary">Performance Geral</h3>
                <p className="text-2xl font-bold">{performancePercentage.toFixed(1)}%</p>
              </div>
              <div className="stat-card">
                 <h3 className="text-sm font-medium text-text-secondary">Lucro Estimado</h3>
                 <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            
            {/* Tabela de desempenho por vendedor */}
            <div className="surface-card overflow-hidden p-0">
              <h3 className="section-title border-b border-navy-border px-5 py-4">Desempenho por Vendedor</h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary">Vendedor</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary">Meta</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary">Atingido</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary">Performance</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user => user.perfil === 'VENDEDOR' && user.ativo)
                      .map(user => {
                        const userGoal = goals.find(g => g.userId === user.id);
                        const target = userGoal ? userGoal.targetValue : 0;
                        const achieved = userGoal ? userGoal.achievedValue : 0;
                        const performance = target === 0 ? 0 : (achieved / target) * 100;
                        
                        return (
                          <tr key={user.id}>
                            <td className="px-4 py-3 text-text-primary font-medium">{user.nome}</td>
                            <td className="px-4 py-3 text-text-primary">R$ {target.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                             <td className={`px-4 py-3 text-text-primary ${achieved >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {achieved.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                            <td className="px-4 py-3 text-text-primary">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                performance >= 90 ? 'bg-green-100 text-green-800' :
                                performance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {performance.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-text-center space-x-2">
                              {user?.perfil === 'ADMIN' && (
                                <>
                                  <button
                                    onClick={() => openGoalModal(user, userGoal ?? null)}
                                    className="btn-sm btn-outline"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => userGoal && handleDeleteGoal(userGoal.id)}
                                    className="btn-sm border border-red-200 text-red-700 hover:bg-red-50"
                                  >
                                    Excluir
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          
          {/* Gerenciamento de Custos */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">Gerenciamento de Custos</h2>
            
            {/* Métricas de custos */}
            <div className="stagger-children mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="stat-card">
                <h3 className="text-sm font-medium text-text-secondary">Custos Totais</h3>
                <p className="text-2xl font-bold text-red-600">R$ {totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="stat-card">
                <h3 className="text-sm font-medium text-text-secondary">Custos Fixos</h3>
                <p className="text-2xl font-bold text-blue-primary">R$ {totalFixedCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="stat-card">
                <h3 className="text-sm font-medium text-text-secondary">Custos Variáveis</h3>
                <p className="text-2xl font-bold text-yellow-600">R$ {totalVariableCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            
            {/* Lista de custos */}
            <div className="bg-navy-surface rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Lista de Custos</h3>
              {user?.perfil === 'ADMIN' && (
                <div className="mb-4">
                  <button
                    onClick={handleAddCost}
                    className="btn-primary"
                  >
                    Novo Custo
                  </button>
                </div>
              )}
              <div className="bg-navy-card rounded-xl p-4">
                {costs.length === 0 ? (
                  <p className="text-text-primary/50 text-center py-4">Nenhum custo cadastrado para este período</p>
                ) : (
                  <div className="space-y-3">
                    {costs.map(cost => (
                      <div key={cost.id} className="bg-navy-surface rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-text-primary">{cost.description}</h4>
                          <p className="text-text-primary/70 text-sm">
                            {cost.type === 'fixo' ? '(Fixo)' : '(Variável)'} • 
                            {cost.isRecurring ? 'Recorrente' : 'Único'}
                          </p>
                          <p className="text-text-primary/70 text-sm">
                            Mês: {new Date(0, cost.month - 1).toLocaleString('pt-BR', { month: 'long' })} {cost.year}
                          </p>
                        </div>
                        <div className="text-right space-x-3">
                          <p className="text-2xl font-bold text-red-600">R$ {cost.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <div className="flex space-x-2">
                            {user?.perfil === 'ADMIN' && (
                              <>
                                <button
                                  onClick={() => handleEditCost(cost)}
                                  className="text-blue-primary hover:text-blue-primary/90"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteCost(cost.id)}
                                  className="text-red-600 hover:text-red-600/90"
                                >
                                  Excluir
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
          
          {/* Modais para Admin */}
          {showAddGoalModal && (
            <div className="modal-backdrop">
              <div className="modal-panel bg-navy-surface rounded-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-text-primary">
                  {editGoal ? 'Editar Meta' : 'Nova Meta'}
                </h2>
                {goalFormError && (
                  <p role="alert" className="text-sm text-red-400 mb-3">{goalFormError}</p>
                )}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const selectedUserId = Number(userRef.current?.value);
                  const selectedUser = users.find(u => u.id === selectedUserId);
                  if (!selectedUser) {
                    setGoalFormError('Selecione um vendedor');
                    return;
                  }
                  handleSaveGoal({
                    userId: selectedUser.id,
                    userName: selectedUser.nome,
                    month: editGoal?.month ?? selectedMonth,
                    year: editGoal?.year ?? selectedYear,
                    targetValue: parseFloat(targetValueRef.current?.value || '0') || 0,
                    achievedValue: parseFloat(achievedValueRef.current?.value || '0') || 0
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Vendedor *</label>
                    <select
                      ref={userRef}
                      defaultValue={(editGoal?.userId ?? goalVendor?.userId)?.toString() || ''}
                      className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                    >
                      <option value="">Selecione um vendedor</option>
                      {users
                        .filter(u => u.perfil === 'VENDEDOR' && u.ativo)
                        .map(user => (
                          <option key={user.id} value={user.id}>
                            {user.nome}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Meta (R$) *</label>
                    <input
                      type="number"
                      ref={targetValueRef}
                      defaultValue={editGoal?.targetValue?.toString() || '0'}
                      className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Atingido (R$) *</label>
                    <input
                      type="number"
                      ref={achievedValueRef}
                      defaultValue={editGoal?.achievedValue?.toString() || '0'}
                      className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddGoalModal(false);
                      }}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editGoal ? 'Atualizar' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {showAddCostModal && (
            <div className="modal-backdrop">
              <div className="modal-panel bg-navy-surface rounded-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-text-primary">
                  {editCost ? 'Editar Custo' : 'Novo Custo'}
                </h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCost({
                    description: descricaoRef.current?.value || '',
                    amount: parseFloat(valorRef.current?.value || '0') || 0,
                    type: (tipoRef.current?.value === 'fixo' || tipoRef.current?.value === 'variavel') 
                      ? (tipoRef.current?.value as 'fixo' | 'variavel') 
                      : 'fixo',
                    month: parseInt(mesRef.current?.value || '0') || selectedMonth,
                    year: parseInt(anoRef.current?.value || '0') || selectedYear,
                    isRecurring: recorrenteRef.current?.checked || false
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Descrição *</label>
                    <input
                      type="text"
                      ref={descricaoRef}
                      defaultValue={editCost?.description || ''}
                      className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Valor (R$) *</label>
                    <input
                      type="number"
                      ref={valorRef}
                      defaultValue={editCost?.amount?.toString() || '0'}
                      className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-text-primary">Tipo *</label>
                    <select
                      ref={tipoRef}
                      defaultValue={editCost?.type || 'fixo'}
                      className="bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                    >
                      <option value="fixo">Fixo (mensal)</option>
                      <option value="variavel">Variável (depende do volume)</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-text-primary">Mês *</label>
                    <select
                      ref={mesRef}
                      defaultValue={selectedMonth.toString()}
                      className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                        <option key={month} value={month}>
                          {new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-text-primary">Ano *</label>
                    <select
                      ref={anoRef}
                      defaultValue={selectedYear.toString()}
                      className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                    >
                      {[2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-text-primary">Recorrente</label>
                    <input
                      type="checkbox"
                      ref={recorrenteRef}
                      defaultChecked={editCost?.isRecurring || false}
                      className="bg-navy-border rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCostModal(false);
                      }}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editCost ? 'Atualizar' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Visão do Vendedor (apenas suas próprias metas) */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">Seu Desempenho</h2>
            
            {/* Métricas pessoais */}
            <div className="stagger-children grid grid-cols-2 gap-4 mb-6">
              <div className="bg-navy-surface rounded-xl p-4">
                <h3 className="text-sm font-medium text-text-secondary">Sua Meta</h3>
                <p className="text-2xl font-bold text-blue-primary">R$ {userTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-navy-surface rounded-xl p-4">
                <h3 className="text-sm font-medium text-text-secondary">Seu Atingido</h3>
                <p className="text-2xl font-bold text-green-600">R$ {userAchieved.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-navy-surface rounded-xl p-4">
                <h3 className="text-sm font-medium text-text-secondary">Sua Performance</h3>
                <p className="text-2xl font-bold">{userPerformance.toFixed(1)}%</p>
              </div>
            </div>
            
            {/* Barra de progresso */}
            <div className="bg-navy-surface rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Progresso da Meta</h3>
              <div className="bg-navy-border rounded-full h-4 overflow-hidden">
                <div
                  className="progress-fill h-4 rounded-full bg-blue-primary"
                  style={{ width: `${Math.min(userPerformance, 100)}%` }}
                ></div>
              </div>
              <p className="text-center text-sm mt-2 text-text-primary/70">
                {userAchieved.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} de 
                {userTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                ({userPerformance.toFixed(1)}%)
              </p>
            </div>
          </section>
          
          {/* Informação de que custos são apenas para admin */}
          <div className="bg-navy-surface rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Informação</h2>
            <p className="text-text-primary/70">
              O gerenciamento de custos está disponível apenas para usuários com perfil de Administrador.
              Como você está logado como VENDEDOR, esta funcionalidade não está acessível para você.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default MetasPage;
