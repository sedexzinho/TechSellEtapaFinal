import React, { useState, useEffect } from 'react';
import type { Budget, BudgetItem, Visit } from '../../schemas/visitSchema';
import type { Customer } from '../../schemas/customerSchema';
import type { Product } from '../../schemas/productSchema';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budgetData: Omit<Budget, 'id'>) => void;
  customers: Customer[];
  products: Product[];
  budget: Budget | null;
  visits: Visit[];
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  products,
  budget,
  visits,
}) => {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [visitId, setVisitId] = useState<number | null>(null);
  const [status, setStatus] = useState<'rascunho' | 'aprovado' | 'executado' | 'cancelado'>('rascunho');
  const [budgetItems, setBudgetItems] = useState<Array<BudgetItem & { id: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isVisitOpen, setIsVisitOpen] = useState(false);

  // Calculate total
  const total = budgetItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Filter customers and products for dropdowns
  const availableCustomers = customers.filter(c => c.ativo);
  const availableProducts = products.filter(p => p.ativo && p.estoque > 0);

  useEffect(() => {
    if (budget) {
      setCustomerId(budget.customerId);
      setDate(budget.date);
      setVisitId(budget.visitId ?? null);
      setStatus(budget.status);
      setBudgetItems(budget.items.map((item, index) => ({ ...item, id: index + 1000 })));
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('rascunho');
    }
  }, [budget]);

  // Estoque atual de um produto (0 se não existir mais)
  const getStock = (productId: number) => products.find(p => p.id === productId)?.estoque ?? 0;

  const stockMessage = (name: string, stock: number) =>
    `Estoque insuficiente para "${name}". Disponível: ${stock}.`;

  // Add item to budget
  const handleAddItem = (product: Product) => {
    const existingItemIndex = budgetItems.findIndex(item => item.productId === product.id);
    if (existingItemIndex >= 0) {
      // Increase quantity (respeitando o estoque)
      const current = budgetItems[existingItemIndex];
      if (current.quantity + 1 > product.estoque) {
        setError(stockMessage(product.nome, product.estoque));
        return;
      }
      setError(null);
      setBudgetItems(prev => 
        prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: item.productPrice * (item.quantity + 1), id: item.id } 
            : item
        )
      );
    } else {
      // Add new item
      setBudgetItems(prev => [...prev, {
        productId: product.id,
        productName: product.nome,
        productPrice: product.preco,
        quantity: 1,
        subtotal: product.preco,
        id: Date.now() + Math.random()
      }]);
    }
  };

  // Update item quantity
  const handleQuantityChange = (itemId: number, quantity: number) => {
    const target = budgetItems.find(item => item.id === itemId);
    if (!target) return;

    const stock = getStock(target.productId);
    if (quantity > stock) {
      setError(stockMessage(target.productName, stock));
    } else {
      setError(null);
    }
    const finalQuantity = Math.min(Math.max(1, quantity), Math.max(1, stock));

    setBudgetItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: finalQuantity, 
              subtotal: item.productPrice * finalQuantity 
            } 
          : item
      )
    );
  };

  // Remove item
  const handleRemoveItem = (itemId: number) => {
    setBudgetItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      setError('Por favor, selecione um cliente');
      return;
    }

    if (budgetItems.length === 0) {
      setError('Por favor, adicione pelo menos um item ao orçamento');
      return;
    }

    const overStock = budgetItems.find(item => item.quantity > getStock(item.productId));
    if (overStock) {
      setError(stockMessage(overStock.productName, getStock(overStock.productId)));
      return;
    }

    setIsLoading(true);
    
    try {
      const budgetData: Omit<Budget, 'id'> = {
        customerId: customerId!,
        customerName: customers.find(c => c.id === customerId)!.nome || '',
        date,
        visitId: visitId ?? undefined,
        status,
        items: budgetItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
          subtotal: item.subtotal
        })),
        total
      };

      onSave(budgetData);
      setError(null);
    } catch (err) {
      setError('Erro ao salvar orçamento');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel modal-form-panel relative bg-navy-surface rounded-xl w-full max-w-3xl max-h-[calc(100vh-3rem)] overflow-hidden flex">
        {/* Sidebar - Customer and visit selection */}
        <div className="w-72 border-r border-navy-border flex flex-col">
          <div className="p-4">
            <h2 className="text-xl font-bold text-text-primary">
              {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
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
                className="custom-select-trigger"
              >
                <span className={customerId ? 'text-text-primary' : 'text-text-secondary'}>
                  {customerId
                    ? availableCustomers.find((customer) => customer.id === customerId)?.nome
                    : 'Selecione um cliente'}
                </span>
                <span aria-hidden="true" className="custom-select-chevron">⌄</span>
              </button>
              {isCustomerOpen && (
                <div role="listbox" aria-label="Clientes" className="custom-select-menu">
                  <button type="button" role="option" aria-selected={customerId === null} className="custom-select-option" onClick={() => { setCustomerId(null); setIsCustomerOpen(false); }}>
                    Selecione um cliente
                  </button>
                  {availableCustomers.map((customer) => (
                    <button key={customer.id} type="button" role="option" aria-selected={customer.id === customerId} className="custom-select-option" onClick={() => { setCustomerId(customer.id); setIsCustomerOpen(false); }}>
                      <span>{customer.nome}</span>
                      <small>{customer.cpfCnpj}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Visit selection (only for creating new budget from visit) */}
          {!budget && (
            <div className="p-4 border-b border-navy-border">
              <label className="block text-sm font-medium text-text-primary mb-1">Vincular à visita (opcional)</label>
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isVisitOpen}
                  onClick={() => setIsVisitOpen((open) => !open)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setIsVisitOpen(false);
                  }}
                  className="custom-select-trigger"
                >
                  <span className={visitId ? 'text-text-primary' : 'text-text-secondary'}>
                    {visitId ? `Visita #${visitId} - ${visits.find((visit) => visit.id === visitId)?.customerName}` : 'Nenhuma visita'}
                  </span>
                  <span aria-hidden="true" className="custom-select-chevron">⌄</span>
                </button>
                {isVisitOpen && (
                  <div role="listbox" aria-label="Visitas disponíveis" className="custom-select-menu">
                    <button type="button" role="option" aria-selected={visitId === null} className="custom-select-option" onClick={() => { setVisitId(null); setIsVisitOpen(false); }}>
                      Nenhuma visita
                    </button>
                    {visits.map((visit) => (
                      <button key={visit.id} type="button" role="option" aria-selected={visit.id === visitId} className="custom-select-option" onClick={() => { setVisitId(visit.id); setIsVisitOpen(false); }}>
                        Visita #{visit.id} - {visit.customerName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Product search */}
          <div className="p-4 border-b border-navy-border flex-1 overflow-y-auto">
            <label className="block text-sm font-medium text-text-primary mb-1">Buscar produtos</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Digite para buscar produtos..."
                className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary pl-10"
              />
            </div>
            
            {/* Quick add products (simplified) */}
            <div className="space-y-2">
              {availableProducts.slice(0, 6).map(product => (
                <div key={product.id} className="bg-navy-card rounded-lg p-3 border border-navy-border flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{product.nome}</p>
                    <p className="text-text-primary/70 text-sm">
                      Estoque: {product.estoque} | R$ {product.preco.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddItem(product)}
                    className="bg-blue-primary hover:bg-blue-primary/90 text-white font-bold py-1 px-2 rounded transition-colors"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content - Budget items */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Budget items list */}
          {budgetItems.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Itens do Orçamento</h3>
              <div className="space-y-3">
                {budgetItems.map(item => (
                  <div key={item.id} className="bg-navy-surface rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text-primary">{item.productName}</p>
                      <p className="text-text-primary/70 text-sm">
                        R$ {item.productPrice.toFixed(2)} x {item.quantity} = R$ 
                        {item.subtotal.toFixed(2)}
                      </p>
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
                        onClick={() => handleRemoveItem(item.id)}
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
          
          {/* Budget total */}
          <div className="mt-8 pt-6 border-t border-navy-border">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-medium text-text-primary">Total do Orçamento:</p>
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
                disabled={isLoading || !customerId || budgetItems.length === 0}
                className="btn-primary"
              >
                {isLoading ? 'Salvando...' : budget ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
