import React, { useState } from 'react';
import type { Customer } from '../../schemas/customerSchema';
import type { Product } from '../../schemas/productSchema';
import type { Order, OrderItem } from '../../schemas/orderSchema';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Omit<Order, 'id' | 'status'>) => void;
  customers: Customer[];
  products: Product[];
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  products,
}) => {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Array<Product & { quantity: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.ativo &&
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.estoque > 0
  );

  // Calculate total
  const total = selectedProducts.reduce((sum, item) => sum + (item.preco * item.quantity), 0);

  // Handle product quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    const product = products.find((item) => item.id === productId);
    const maxQuantity = product?.estoque ?? 1;

    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(maxQuantity, Math.max(1, quantity)) }
          : item
      )
    );
  };

  // Handle remove product from order
  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(item => item.id !== productId));
  };

  // Handle add product to order
  const handleAddProduct = (product: Product) => {
    const existingItem = selectedProducts.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.estoque) {
        setError(`Estoque máximo atingido para ${product.nome}. Disponível: ${product.estoque}`);
        return;
      }

      setSelectedProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(product.estoque, item.quantity + 1) }
            : item
        )
      );
      setError(null);
    } else {
      // Add new item
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      setError('Por favor, selecione um cliente');
      return;
    }

    if (selectedProducts.length === 0) {
      setError('Por favor, adicione pelo menos um produto ao pedido');
      return;
    }

    // Final stock validation
    for (const item of selectedProducts) {
      const product = products.find(p => p.id === item.id);
      if (!product || product.estoque < item.quantity) {
        setError(`Estoque insuficiente para o produto ${product?.nome || 'desconhecido'}. Disponível: ${product?.estoque || 0}, necessário: ${item.quantity}`);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const orderItems: OrderItem[] = selectedProducts.map(item => ({
        productId: item.id,
        productName: item.nome,
        productPrice: item.preco,
        quantity: item.quantity,
        subtotal: item.preco * item.quantity
      }));

      const orderData: Omit<Order, 'id' | 'status'> = {
        customerId: customerId!,
        customerName: customers.find(c => c.id === customerId)!.nome || '',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        items: orderItems,
        total: total
      };

      onSave(orderData);
      setError(null);
    } catch (err) {
      setError('Erro ao salvar pedido');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel modal-form-panel relative bg-navy-surface rounded-xl w-full max-w-4xl max-h-[calc(100vh-3rem)] overflow-hidden flex">
        {/* Sidebar - Customer selection and product search */}
        <div className="w-64 border-r border-navy-border flex flex-col">
          <div className="border-b border-navy-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-accent">Venda</p>
            <h2 className="mt-1 text-xl font-bold text-text-primary">Novo Pedido</h2>
            <p className="mt-1 text-sm text-text-primary/60">Selecione o cliente e monte o pedido.</p>
          </div>
          
          {/* Customer selection */}
          <div className="p-4 border-b border-navy-border">
            <label className="block text-sm font-medium text-text-primary mb-1">Cliente *</label>
            <div className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isCustomerOpen}
                onClick={() => setIsCustomerOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setIsCustomerOpen(false);
                }}
                className="flex min-h-11 w-full items-center justify-between rounded-xl border border-navy-border bg-navy-card px-3 text-left text-sm text-text-primary transition-colors hover:border-cyan-accent/60 focus:outline-none focus:ring-2 focus:ring-cyan-accent/30"
              >
                <span className={customerId ? 'text-text-primary' : 'text-text-primary/50'}>
                  {customerId
                    ? customers.find((customer) => customer.id === customerId)?.nome
                    : 'Selecione um cliente'}
                </span>
                <span aria-hidden="true" className={`ml-3 transition-transform ${isCustomerOpen ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>

              {isCustomerOpen && (
                <div
                  role="listbox"
                  aria-label="Clientes disponíveis"
                  className="customer-select-menu absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-navy-border bg-navy-card p-1 shadow-elevated"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={customerId === null}
                    onClick={() => {
                      setCustomerId(null);
                      setIsCustomerOpen(false);
                    }}
                    className="customer-select-option w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary/60"
                  >
                    Selecione um cliente
                  </button>
                  {customers.map((customer) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={customer.id === customerId}
                      key={customer.id}
                      onClick={() => {
                        setCustomerId(customer.id);
                        setIsCustomerOpen(false);
                        setError(null);
                      }}
                      className={`customer-select-option w-full rounded-lg px-3 py-2 text-left text-sm ${customer.id === customerId ? 'customer-select-option-active' : 'text-text-primary'}`}
                    >
                      {customer.nome} <span className="text-text-primary/50">({customer.cpfCnpj})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Product search */}
          <div className="p-4 border-b border-navy-border flex-1 overflow-y-auto">
            <label className="block text-sm font-medium text-text-primary mb-1">Buscar produtos</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite para buscar produtos..."
                className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary pl-10"
              />
            </div>
            
            {/* Product list */}
            {filteredProducts.length === 0 ? (
              <p className="text-text-primary/50 text-center py-4">Nenhum produto encontrado</p>
             ) : (
              <div className="space-y-2">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-navy-card rounded-lg p-3 border border-navy-border flex items-center">
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{product.nome}</p>
                      <p className="text-text-primary/70 text-sm">
                        Estoque: {product.estoque} | R$ {product.preco.toFixed(2)}
                      </p>
                      {product.codigoBarras && (
                        <p className="text-text-primary/60 text-xs">CB: {product.codigoBarras}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddProduct(product)}
                        className="bg-blue-primary hover:bg-blue-primary/90 text-white font-bold py-1 px-2 rounded transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
             )}
          </div>
        </div>
        
        {/* Main content - Order summary */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-navy-border pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-primary/50">Resumo</p>
              <h3 className="mt-1 text-2xl font-bold text-text-primary">Itens do pedido</h3>
            </div>
            <span className="rounded-full border border-cyan-accent/20 bg-cyan-accent/10 px-3 py-1 text-xs font-semibold text-cyan-accent">
              {selectedProducts.length} {selectedProducts.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          {/* Order items list */}
          {selectedProducts.length > 0 ? (
            <div className="mb-6">
              <div className="space-y-3">
                {selectedProducts.map(item => (
                  <div key={item.id} className="order-item-card bg-navy-card rounded-xl border border-navy-border p-4 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-medium text-text-primary">{item.nome}</p>
                      <p className="text-text-primary/70 text-sm">
                        R$ {item.preco.toFixed(2)} x {item.quantity} = R$ 
                        {(item.preco * item.quantity).toFixed(2)}
                      </p>
                      {item.codigoBarras && (
                        <p className="text-text-primary/60 text-xs mt-1">CB: {item.codigoBarras}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-navy-border rounded px-3 py-2">
                        <button
                          onClick={() => {
                            const newQuantity = Math.max(1, item.quantity - 1);
                            handleQuantityChange(item.id, newQuantity);
                          }}
                          className="p-1 hover:bg-navy-surface"
                        >
                          -
                        </button>
                        <span className="w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.estoque}
                          aria-label={`Aumentar quantidade de ${item.nome}`}
                          className="p-1 hover:bg-navy-surface disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-primary/50">Nenhum item adicionado ainda</p>
            </div>
          )}
          
          {/* Order total */}
          <div className="order-total-panel mt-8 rounded-xl border border-navy-border bg-navy-card p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-medium text-text-primary">Total do Pedido:</p>
              <p className="text-2xl font-bold text-blue-primary">R$ {total.toFixed(2)}</p>
            </div>
            
            {error && (
              <p role="alert" className="text-sm text-red-400 mb-3">{error}</p>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !customerId || selectedProducts.length === 0}
                className="btn-primary"
              >
                {isLoading ? 'Salvando...' : 'Salvar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderModal;
