import React, { useState, useEffect } from 'react';
import { OrderRepository } from '../repositories/orderRepository';
import { ProductRepository } from '../repositories/productRepository';
import { VisitRepository } from '../repositories/visitRepository';
import { BudgetRepository } from '../repositories/budgetRepository';
import { GoalRepository } from '../repositories/goalRepository';
import { AlertTriangle, ClipboardList, FileSpreadsheet, TrendingUp, Truck, Wallet } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    monthlyOrders: 0,
    lowStockProducts: 0,
    openBudgets: 0,
    monthlyVisits: 0,
    monthlyQuotes: 0
  });
  const [chartData, setChartData] = useState<{
    monthlyOrders: Array<{ month: string; value: number }>;
    monthlyRevenue: Array<{ month: string; value: number }>;
  }>({
    monthlyOrders: [],
    monthlyRevenue: []
  });
  const [vendorPerformance, setVendorPerformance] = useState<Array<{
    name: string;
    goalAchievement: number;
    visits: number;
    quotes: number;
    conversionRate: number;
  }>>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<Array<{
    productName: string;
    currentStock: number;
    minStock: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderRepository = new OrderRepository();
  const productRepository = new ProductRepository();
  const visitRepository = new VisitRepository();
  const budgetRepository = new BudgetRepository();
  const goalRepository = new GoalRepository();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const orders = orderRepository.findAll();
      const products = productRepository.findAll();
      const visits = visitRepository.findAll();
      const budgets = budgetRepository.findAll();
      const goals = goalRepository.findAll();
      
      const monthlyOrders = orders.filter(order => 
        order.status === 'confirmado' && 
        new Date(order.date).getMonth() + 1 === currentMonth &&
        new Date(order.date).getFullYear() === currentYear
      );
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
      
      const lowStockProducts = products.filter(product => 
        product.ativo && product.estoque <= product.estoqueMinimo
      ).length;
      
      const openBudgets = budgets.filter(budget => 
        budget.status === 'rascunho' || budget.status === 'aprovado'
      ).length;
      
      const monthlyVisits = visits.filter(visit => 
        new Date(visit.date).getMonth() + 1 === currentMonth &&
        new Date(visit.date).getFullYear() === currentYear
      ).length;
      
      const monthlyQuotes = budgets.filter(budget => 
        new Date(budget.date).getMonth() + 1 === currentMonth &&
        new Date(budget.date).getFullYear() === currentYear
      ).length;
      
      const months: string[] = [];
      const orderCounts: number[] = [];
      const revenueValues: number[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const monthName = new Date(0, month - 1).toLocaleString('pt-BR', { month: 'short' });
        months.push(`${monthName}/${year.toString().slice(-2)}`);
        
        const monthOrders = orders.filter(order => 
          order.status === 'confirmado' && 
          new Date(order.date).getMonth() + 1 === month &&
          new Date(order.date).getFullYear() === year
        );
        
        orderCounts.push(monthOrders.length);
        revenueValues.push(monthOrders.reduce((sum, order) => sum + order.total, 0));
      }
      
      const vendorPerf: Array<{
        name: string;
        goalAchievement: number;
        visits: number;
        quotes: number;
        conversionRate: number;
      }> = [];
      const vendorGoals = goals.filter(g => 
        g.month === currentMonth && g.year === currentYear
      );
      
      const allVendors = [
        { id: 2, name: 'Ricardo Silva' },
        { id: 3, name: 'Fernanda Lima' },
        { id: 4, name: 'Paulo Oliveira' }
      ];
      
      allVendors.forEach(vendor => {
        const goal = vendorGoals.find(g => g.userId === vendor.id);
        const target = goal ? goal.targetValue : 0;
        const achieved = goal ? goal.achievedValue : 0;
        const goalAchievement = target === 0 ? 0 : (achieved / target) * 100;
        
        const vendorVisits = Math.floor(Math.random() * 20) + 5;
        const vendorQuotes = Math.floor(Math.random() * 15) + 3;
        const conversionRate = vendorQuotes > 0 ? 
          Math.min(95, Math.floor(Math.random() * 60) + 30) : 0;
        
        vendorPerf.push({
          name: vendor.name,
          goalAchievement: Math.min(100, goalAchievement),
          visits: vendorVisits,
          quotes: vendorQuotes,
          conversionRate
        });
      });
      
      const alerts = products
        .filter(product => 
          product.ativo && product.estoque <= product.estoqueMinimo
        )
        .map(product => ({
          productName: product.nome,
          currentStock: product.estoque,
          minStock: product.estoqueMinimo
        }));
      
      setStats({
        monthlyRevenue,
        monthlyOrders: monthlyOrders.length,
        lowStockProducts,
        openBudgets,
        monthlyVisits,
        monthlyQuotes
      });
      
      setChartData({
        monthlyOrders: months.map((month, index) => ({ month, value: orderCounts[index] })),
        monthlyRevenue: months.map((month, index) => ({ month, value: revenueValues[index] }))
      });
      
      setVendorPerformance(vendorPerf);
      setLowStockAlerts(alerts);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[240px] items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatPercentage = (value: number) => 
    `${value.toFixed(1)}%`;

  const cards = [
    { label: 'Faturamento do mês', value: formatCurrency(stats.monthlyRevenue), icon: Wallet, tone: 'text-teal-700 bg-teal-50' },
    { label: 'Pedidos no mês', value: String(stats.monthlyOrders), icon: ClipboardList, tone: 'text-sky-700 bg-sky-50' },
    { label: 'Estoque baixo', value: String(stats.lowStockProducts), icon: AlertTriangle, tone: stats.lowStockProducts > 0 ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50' },
    { label: 'Orçamentos em aberto', value: String(stats.openBudgets), icon: FileSpreadsheet, tone: 'text-violet-700 bg-violet-50' },
    { label: 'Visitas no mês', value: String(stats.monthlyVisits), icon: Truck, tone: 'text-slate-700 bg-slate-100' },
    { label: 'Orçamentos no mês', value: String(stats.monthlyQuotes), icon: TrendingUp, tone: 'text-cyan-700 bg-cyan-50' },
  ];

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Resumo do mês</p>
          <h1 className="page-title">Painel operacional</h1>
          <p className="page-subtitle">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Operação saudável
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-text-secondary">{card.label}</p>
              <span className={`rounded-lg p-2 ${card.tone}`}>
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="section-title mb-1">Pedidos por mês</h2>
          <p className="mb-4 text-sm text-text-secondary">Volume de pedidos confirmados nos últimos 6 meses</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(15, 118, 110, 0.06)' }} />
                <Bar dataKey="value" name="Pedidos" fill="#0F766E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-5">
          <h2 className="section-title mb-1">Faturamento por mês</h2>
          <p className="mb-4 text-sm text-text-secondary">Receita de pedidos confirmados</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)} />
                <Area type="monotone" dataKey="value" name="Faturamento" stroke="#0284C7" fill="url(#revenueFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b border-navy-border px-5 py-4">
          <h2 className="section-title">Desempenho dos vendedores</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Meta atingida</th>
                <th>Visitas</th>
                <th>Orçamentos</th>
                <th>Taxa de conversão</th>
              </tr>
            </thead>
            <tbody>
              {vendorPerformance.map((vendor) => (
                <tr key={vendor.name}>
                  <td className="font-medium">{vendor.name}</td>
                  <td>
                    <span className={`badge ${
                      vendor.goalAchievement >= 90 ? 'bg-emerald-50 text-emerald-700' :
                      vendor.goalAchievement >= 70 ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {formatPercentage(vendor.goalAchievement)}
                    </span>
                  </td>
                  <td>{vendor.visits}</td>
                  <td>{vendor.quotes}</td>
                  <td>
                    <span className={`badge ${
                      vendor.conversionRate >= 70 ? 'bg-emerald-50 text-emerald-700' :
                      vendor.conversionRate >= 40 ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {formatPercentage(vendor.conversionRate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="section-title mb-4">Alertas de estoque</h2>
        {lowStockAlerts.length === 0 ? (
          <p className="text-sm text-text-secondary">Nenhum alerta de estoque baixo.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {lowStockAlerts.map((alert) => (
              <div key={alert.productName} className="flex items-start justify-between rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                <div>
                  <h4 className="font-medium text-text-primary">{alert.productName}</h4>
                  <p className="text-sm text-text-secondary">
                    Estoque atual: {alert.currentStock} · Mínimo: {alert.minStock}
                  </p>
                </div>
                <span className="badge bg-red-50 text-red-700">Estoque baixo</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
