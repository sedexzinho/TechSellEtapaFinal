import React, { useState, useEffect } from 'react';
import { OrderRepository } from '../../repositories/orderRepository';
import type { Customer } from '../../schemas/customerSchema';
import type { Order } from '../../schemas/orderSchema';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const [activeTab, setActiveTab] = useState<'detalhes' | 'historico'>('detalhes');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const orderRepository = new OrderRepository();

  useEffect(() => {
    if (isOpen && customer) {
      loadOrders();
    }
  }, [isOpen, customer?.id]);

  const loadOrders = () => {
    setIsLoading(true);
    try {
      const customerOrders = orderRepository.findByCustomerId(customer!.id);
      setOrders(customerOrders);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmado': return 'text-green-600 bg-green-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      default: return 'Rascunho';
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel bg-navy-surface rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-navy-border">
          <h2 className="text-xl font-bold text-text-primary">Detalhes do Cliente</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-navy-border">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('detalhes')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'detalhes'
                  ? 'border-blue-primary text-blue-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'historico'
                  ? 'border-blue-primary text-blue-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Histórico de Pedidos
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'detalhes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">Informações Pessoais</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm text-text-secondary">Nome</dt>
                      <dd className="text-text-primary font-medium">{customer.nome}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-text-secondary">Email</dt>
                      <dd className="text-text-primary">{customer.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-text-secondary">Telefone</dt>
                      <dd className="text-text-primary">{customer.telefone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-text-secondary">{customer.tipo === 'FISICA' ? 'CPF' : 'CNPJ'}</dt>
                      <dd className="text-text-primary font-mono">{customer.cpfCnpj}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-text-secondary">Tipo</dt>
                      <dd className="text-text-primary">
                        {customer.tipo === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-text-secondary">Status</dt>
                      <dd className="text-text-primary">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">Endereço</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm text-text-secondary">Endereço</dt>
                      <dd className="text-text-primary">{customer.endereco}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-text-secondary">Cidade</dt>
                      <dd className="text-text-primary">{customer.cidade}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-text-secondary">Estado</dt>
                      <dd className="text-text-primary">{customer.estado}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-text-secondary">CEP</dt>
                      <dd className="text-text-primary font-mono">{customer.cep}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="pt-6 border-t border-navy-border">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">Resumo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-navy-card rounded-lg p-4 border border-navy-border">
                    <p className="text-sm text-text-secondary">Total de Pedidos</p>
                    <p className="text-2xl font-bold text-text-primary">{orders.length}</p>
                  </div>
                  <div className="bg-navy-card rounded-lg p-4 border border-navy-border">
                    <p className="text-sm text-text-secondary">Pedidos Confirmados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter(o => o.status === 'confirmado').length}
                    </p>
                  </div>
                  <div className="bg-navy-card rounded-lg p-4 border border-navy-border">
                    <p className="text-sm text-text-secondary">Pedidos Cancelados</p>
                    <p className="text-2xl font-bold text-red-600">
                      {orders.filter(o => o.status === 'cancelado').length}
                    </p>
                  </div>
                  <div className="bg-navy-card rounded-lg p-4 border border-navy-border">
                    <p className="text-sm text-text-secondary">Faturamento Total</p>
                    <p className="text-2xl font-bold text-blue-primary">
                      R$ {orders
                        .filter(o => o.status === 'confirmado')
                        .reduce((sum, o) => sum + o.total, 0)
                        .toFixed(2)
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">Histórico de Pedidos</h3>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full border-4 border-b-primary h-8 w-8"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-secondary">Nenhum pedido encontrado para este cliente.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy-border">
                        <th className="text-left px-4 py-3 font-medium text-text-secondary">Pedido</th>
                        <th className="text-left px-4 py-3 font-medium text-text-secondary">Data</th>
                        <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-text-secondary">Itens</th>
                        <th className="text-left px-4 py-3 font-medium text-text-secondary">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="bg-navy-darker/50 hover:bg-navy-border/50 transition-colors border-b border-navy-border/50">
                          <td className="px-4 py-3 text-text-primary font-mono">#{order.id}</td>
                          <td className="px-4 py-3 text-text-primary">{formatDate(order.date)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">{order.items.length}</td>
                          <td className="px-4 py-3 text-text-primary font-medium">R$ {order.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;