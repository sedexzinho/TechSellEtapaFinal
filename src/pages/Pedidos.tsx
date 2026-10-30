import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { OrderRepository } from '../repositories/orderRepository';
import { CustomerRepository } from '../repositories/customerRepository';
import { ProductRepository } from '../repositories/productRepository';
import type { Order } from '../schemas/orderSchema';
import NewOrderModal from '../components/ui/NewOrderModal';

const PedidosPage: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  const orderRepository = new OrderRepository();
  const customerRepository = new CustomerRepository();
  const productRepository = new ProductRepository();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load all data
      const orderData = orderRepository.findAll();
      
      setOrders(orderData);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewOrder = () => {
    setShowNewOrderModal(true);
  };

  const handleConfirmOrder = async (order: Order) => {
    if (window.confirm('Tem certeza que deseja confirmar este pedido?')) {
      try {
        // Validate stock before confirming
        for (const item of order.items) {
          const product = productRepository.findById(item.productId);
          if (!product || product.estoque < item.quantity) {
            setError(`Estoque insuficiente para o produto ${product?.nome || item.productName}. Disponível: ${product?.estoque || 0}, necessário: ${item.quantity}`);
            return;
          }
        }
        
        // Reduce stock for each item
        for (const item of order.items) {
          productRepository.updateEstoque(item.productId, -item.quantity);
        }
        
        const updatedOrder = { ...order, status: 'confirmado' as const };
        orderRepository.update(order.id, updatedOrder);
        loadData();
        setError(null);
      } catch (err) {
        setError('Erro ao confirmar pedido');
        console.error(err);
      }
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (window.confirm(`Tem certeza que deseja ${order.status === 'confirmado' ? 'cancelar' : 'restaurar'} este pedido?`)) {
      try {
        let updatedOrder: Order;
        
        if (order.status === 'confirmado' && order.status === 'confirmado') {
          // Restore stock when cancelling a confirmed order
          for (const item of order.items) {
            productRepository.updateEstoque(item.productId, item.quantity);
          }
          updatedOrder = { ...order, status: 'cancelado' as const };
        } else if (order.status === 'cancelado') {
          // Restore to draft when "restoring" a cancelled order
          updatedOrder = { ...order, status: 'rascunho' as const };
        } else {
          // Confirming a draft
          updatedOrder = { ...order, status: 'confirmado' as const };
          
          // Reduce stock for each item
          for (const item of order.items) {
            productRepository.updateEstoque(item.productId, -item.quantity);
          }
        }
        
        orderRepository.update(order.id, updatedOrder);
        loadData();
        setError(null);
      } catch (err) {
        setError('Erro ao processar pedido');
        console.error(err);
      }
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        orderRepository.delete(id);
        loadData();
      } catch (err) {
        setError('Erro ao excluir pedido');
        console.error(err);
      }
    }
  };

  const handleSaveNewOrder = async (orderData: Omit<Order, 'id' | 'status'>) => {
    try {
      // Validate stock before saving
      for (const item of orderData.items) {
        const product = productRepository.findById(item.productId);
        if (!product || product.estoque < item.quantity) {
          setError(`Estoque insuficiente para o produto ${product?.nome || item.productName}. Disponível: ${product?.estoque || 0}, necessário: ${item.quantity}`);
          return;
        }
      }
      
      // Reduce stock for each item (temporarily, will be confirmed/cancelled later)
      for (const item of orderData.items) {
        productRepository.updateEstoque(item.productId, -item.quantity);
      }
      
      const newOrder = {
        ...orderData,
        id: Date.now(), // Temporary ID
        status: 'rascunho' as const
      };
      
      orderRepository.create(newOrder);
      loadData();
      setShowNewOrderModal(false);
      setError(null);
    } catch (err) {
      setError('Erro ao salvar pedido');
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

  const statusClass = (status: Order['status']) =>
    status === 'confirmado' ? 'order-status order-status-success' :
    status === 'cancelado' ? 'order-status order-status-danger' :
    'order-status order-status-warning';

  const confirmedOrders = orders.filter((order) => order.status === 'confirmado').length;
  const pendingOrders = orders.filter((order) => order.status === 'rascunho').length;
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="page-shell orders-page">
      <div className="orders-hero flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Operação comercial</span>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">Acompanhe o ciclo completo dos pedidos da sua operação.</p>
        </div>
        {user?.perfil === 'ADMIN' && (
          <button
            onClick={handleNewOrder}
            className="btn-primary orders-primary-action"
          >
            Novo Pedido
          </button>
        )}
      </div>

      <div className="orders-summary-grid">
        <div className="orders-summary-card">
          <span className="orders-summary-label">Pedidos no período</span>
          <strong>{orders.length}</strong>
          <span className="orders-summary-meta">Todos os registros</span>
        </div>
        <div className="orders-summary-card orders-summary-card-accent">
          <span className="orders-summary-label">Confirmados</span>
          <strong>{confirmedOrders}</strong>
          <span className="orders-summary-meta">Prontos para acompanhamento</span>
        </div>
        <div className="orders-summary-card">
          <span className="orders-summary-label">Em aberto</span>
          <strong>{pendingOrders}</strong>
          <span className="orders-summary-meta">Valor total R$ {totalValue.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Novo Pedido Modal */}
      <NewOrderModal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onSave={handleSaveNewOrder}
        customers={customerRepository.findAll()}
        products={productRepository.findAll()}
      />

      {orders.length === 0 ? (
        <div className="empty-state">Nenhum pedido cadastrado.</div>
      ) : (
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Status</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">#{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`badge ${statusClass(order.status)}`}>
                      {order.status === 'rascunho' ? 'Rascunho' : order.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="font-semibold">R$ {order.total.toFixed(2)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {user?.perfil === 'ADMIN' && (
                        <>
                          {order.status === 'rascunho' && (
                            <>
                              <button onClick={() => handleConfirmOrder(order)} className="btn-sm btn-outline">Confirmar</button>
                              <button onClick={() => handleDeleteOrder(order.id)} className="btn-sm border border-red-200 text-red-700 hover:bg-red-50">Excluir</button>
                            </>
                          )}
                          {(order.status === 'confirmado' || order.status === 'cancelado') && (
                            <button onClick={() => handleCancelOrder(order)} className="btn-sm btn-outline">
                              {order.status === 'confirmado' ? 'Cancelar' : 'Restaurar'}
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => {
                          alert(`Detalhes do pedido #${order.id}\nCliente: ${order.customerName}\nData: ${order.date}\nStatus: ${order.status === 'rascunho' ? 'Rascunho' : order.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}\nTotal: R$ ${order.total.toFixed(2)}`);
                        }}
                        className="btn-sm btn-outline"
                      >
                        Visualizar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

export default PedidosPage;
