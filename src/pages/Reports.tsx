import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { OrderRepository } from '../repositories/orderRepository';
import { ProductRepository } from '../repositories/productRepository';
import { CustomerRepository } from '../repositories/customerRepository';
import { VisitRepository } from '../repositories/visitRepository';
import { BudgetRepository } from '../repositories/budgetRepository';

const ReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  
  // Only admins can access reports
  if (user?.perfil !== 'ADMIN') {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <div className="text-center">
            <p className="text-xl">Acesso negado</p>
            <p className="text-text-primary/70 mt-2">
              Esta página está disponível apenas para administradores.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [reportType, setReportType] = useState<'sales' | 'products' | 'customers' | 'visits'>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const orderRepository = new OrderRepository();
  const productRepository = new ProductRepository();
  const customerRepository = new CustomerRepository();
  const visitRepository = new VisitRepository();
  const budgetRepository = new BudgetRepository();

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    
    generateReport();
  }, [reportType]);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Por favor, selecione o período');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let data: any[] = [];
      
      switch (reportType) {
        case 'sales':
          const allOrders = orderRepository.findAll();
          data = allOrders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= start && orderDate <= end && order.status === 'confirmado';
          }).map(order => ({
            id: order.id,
            date: order.date,
            customerName: order.customerName,
            items: order.items.length,
            total: order.total,
            status: order.status
          }));
          break;
          
        case 'products':
          const allProducts = productRepository.findAll();
          data = allProducts.filter(product => product.ativo).map(product => ({
            id: product.id,
            name: product.nome,
            description: product.descricao,
            price: product.preco,
            stock: product.estoque,
            minStock: product.estoqueMinimo,
            category: product.categoria,
            status: product.ativo ? 'Ativo' : 'Inativo'
          }));
          break;
          
        case 'customers':
          const allCustomers = customerRepository.findAll();
          data = allCustomers.filter(customer => customer.ativo).map(customer => ({
            id: customer.id,
            name: customer.nome,
            email: customer.email,
            phone: customer.telefone,
            type: customer.tipo === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica',
            document: customer.cpfCnpj,
            status: customer.ativo ? 'Ativo' : 'Inativo'
          }));
          break;
          
        case 'visits':
          const allVisits = visitRepository.findAll();
          const allBudgets = budgetRepository.findAll();
          data = allVisits.filter(visit => {
            const visitDate = new Date(visit.date);
            return visitDate >= start && visitDate <= end;
          }).map(visit => {
            const budget = allBudgets.find(b => b.visitId === visit.id);
            return {
              id: visit.id,
              date: visit.date,
              customerName: visit.customerName,
              status: visit.status,
              hasBudget: !!budget,
              budgetStatus: budget ? budget.status : null,
              budgetValue: budget ? budget.total : 0
            };
          });
          break;
      }
      
      setReportData(data);
    } catch (err) {
      setError('Erro ao gerar relatório');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const handleExportPDF = () => {
    setIsGenerating(true);
    // In a real app, we would use jspdf here to generate PDF
    setTimeout(() => {
      setIsGenerating(false);
      alert('PDF gerado com sucesso! (funcionalidade simulada)');
    }, 1000);
  };

  const handleExportExcel = () => {
    setIsGenerating(true);
    // In a real app, we would use xlsx here to generate Excel
    setTimeout(() => {
      setIsGenerating(false);
      alert('Planilha Excel gerada com sucesso! (funcionalidade simulada)');
    }, 1000);
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

  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">
          Geração de relatórios para análise do negócio
        </p>
      </div>

      <div className="surface-card p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tipo de Relatório *</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'sales' | 'products' | 'customers' | 'visits')}
                className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
              >
                <option value="sales">Vendas</option>
                <option value="products">Produtos</option>
                <option value="customers">Clientes</option>
                <option value="visits">Visitas e Orçamentos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Data Inicial *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Data Final *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
      </div>

      {/* Pré-visualização do relatório */}
      {previewVisible && reportData.length > 0 && (
        <div className="modal-backdrop">
          <div className="modal-panel bg-navy-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-navy-border">
              <h2 className="text-xl font-bold text-text-primary">Pré-visualização do Relatório</h2>
              <button
                onClick={() => setPreviewVisible(false)}
                className="text-text-secondary hover:text-text-primary text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-text-primary">
                  Relatório de {reportType === 'sales' ? 'Vendas' : reportType === 'products' ? 'Produtos' : reportType === 'customers' ? 'Clientes' : 'Visitas e Orçamentos'}
                </h3>
                <p className="text-text-primary/70 mb-2">
                  Período: {new Date(startDate).toLocaleDateString('pt-BR')} a {new Date(endDate).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-text-primary/70">
                  Total de registros: {reportData.length}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="bg-navy-border">
                      {reportData.length > 0 && Object.keys(reportData[0]).map((key, index) => (
                        <th key={index} className="text-left px-4 py-3 font-medium text-text-secondary">
                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .trim()
                            .toUpperCase()
                          }
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="bg-navy-darker/50 hover:bg-navy-border/50 transition-colors border-b">
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-text-primary">
                            {typeof value === 'number' 
                              ? (['total', 'price', 'budgetValue'].includes(Object.keys(row)[colIndex]) 
                                ? `R$ ${value.toFixed(2)}` 
                                : value.toString())
                              : String(value ?? '')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setPreviewVisible(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isGenerating}
                className={`mr-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50`}
              >
                {isGenerating ? 'Gerando...' : 'Exportar PDF'}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={isGenerating}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50`}
              >
                {isGenerating ? 'Gerando...' : 'Exportar Excel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resultados do relatório */}
      {reportData.length > 0 && !previewVisible && (
        <div className="surface-card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Resultados</h2>
          <p className="text-text-primary/70 mb-4">
            Exibindo {reportData.length} registro{reportData.length !== 1 ? 's' : ''} para o período de 
            {new Date(startDate).toLocaleDateString('pt-BR')} a {new Date(endDate).toLocaleDateString('pt-BR')}
          </p>
          
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-navy-border">
                  {reportData.length > 0 && Object.keys(reportData[0]).map((key, index) => (
                    <th key={index} className="text-left px-4 py-3 font-medium text-text-secondary">
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                        .toUpperCase()
                      }
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-navy-darker/50 hover:bg-navy-border/50 transition-colors border-b border-navy-border/50">
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 text-text-primary">
                        {typeof value === 'number' 
                          ? (['total', 'price', 'budgetValue'].includes(Object.keys(row)[colIndex]) 
                            ? `R$ ${value.toFixed(2)}` 
                            : value.toString())
                          : String(value ?? '')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={handlePreview}
              className="btn-primary"
            >
              Pré-visualizar
            </button>
            <button
              onClick={handleExportPDF}
              disabled={reportData.length === 0}
              className={`ml-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors`}
            >
              Exportar PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={reportData.length === 0}
              className={`ml-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors`}
            >
              Exportar Excel
            </button>
          </div>
        </div>
      )}
      
      {!previewVisible && reportData.length === 0 && (
        <div className="empty-state">Nenhum dado encontrado para o período selecionado</div>
      )}
    </div>
  );
};

export default ReportsPage;