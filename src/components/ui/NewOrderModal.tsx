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
    setSelectedProducts(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity: Math.max(1, quantity) } 
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
      // Increase quantity if already in cart
      setSelectedProducts(prev => 
        prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
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
      <div className="modal-panel bg-navy-surface rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex">
        {/* Sidebar - Customer selection and product search */}
        <div className="w-64 border-r border-navy-border flex flex-col">
          <div className="p-4">
            <h2 className="text-xl font-bold text-text-primary">Novo Pedido</h2>
          </div>
          
          {/* Customer selection */}
          <div className="p-4 border-b border-navy-border">
            <label className="block text-sm font-medium text-text-primary mb-1">Cliente *</label>
            <select
              value={customerId ?? ''}
              onChange={(e) => setCustomerId(e.target.value === '' ? null : parseInt(e.target.value))}
              className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            >
              <option value="">Selecione um cliente</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.nome} ({customer.cpfCnpj})
                </option>
              ))}
            </select>
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
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Order items list */}
          {selectedProducts.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Itens do Pedido</h3>
              <div className="space-y-3">
                {selectedProducts.map(item => (
                  <div key={item.id} className="bg-navy-surface rounded-lg p-4 flex justify-between items-center">
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
                          className="p-1 hover:bg-navy-surface"
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
          <div className="mt-8 pt-6 border-t border-navy-border">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-medium text-text-primary">Total do Pedido:</p>
              <p className="text-2xl font-bold text-blue-primary">R$ {total.toFixed(2)}</p>
            </div>
            
            {error && (
              <p role="alert" className="text-sm text-red-400 mb-3">{error}</p>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
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
