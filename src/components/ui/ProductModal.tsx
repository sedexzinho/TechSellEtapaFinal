import React, { useState } from 'react';
import type { Product } from '../../schemas/productSchema';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  initialData?: Product; // For edit mode
}

const ProductModal = ({ isOpen, onClose, onSave, initialData }: ProductModalProps) => {
  const [formData, setFormData] = useState<Product>({
    id: initialData?.id || Date.now(), // Temporary ID for new products
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    preco: initialData?.preco || 0,
    estoque: initialData?.estoque || 0,
    estoqueMinimo: initialData?.estoqueMinimo || 0,
    codigoBarras: initialData?.codigoBarras || '',
    categoria: initialData?.categoria || '',
    ativo: initialData?.ativo ?? true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-navy-surface p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">
            {initialData ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            ×
          </button>
        </div>
        
        {error && (
          <div className="bg-red-600/20 border-l-4 border-red-600 p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-navy-border rounded bg-navy-darker text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-navy-border rounded bg-navy-darker text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preço</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                required
                className="w-full px-3 py-2 border border-navy-border rounded bg-navy-darker text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-navy-border rounded bg-navy-darker text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estoque Atual</label>
              <input
                type="number"
                min="0"
                value={formData.estoque}
                onChange={(e) => setFormData(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))}
                required
                className="w-full px-3 py-2 border border-navy-border rounded bg-navy-darker text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
              <input
                type="number"
                min="0"
                value={formData.estoqueMinimo}
                onChange={(e) => setFormData(prev => ({ ...prev, estoqueMinimo: parseInt(e.target.value) || 0 }))}
                required
                className="w-full px-3 py-2 border border-navy-border rounded bg-navy-darker text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Código de Barras</label>
            <input
              type="text"
              value={formData.codigoBarras}
              onChange={(e) => setFormData(prev => ({ ...prev, codigoBarras: e.target.value }))}
              className="w-full px-3 py-2 border border-navy-border rounded bg-navy-darker text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="h-4 w-4 text-blue-primary"
            />
            <label className="text-text-secondary">Produto ativo</label>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;