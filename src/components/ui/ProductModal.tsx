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
    <div className="modal-backdrop">
      <div className="modal-panel surface-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-primary">Catálogo</p>
            <h2 className="mt-1 text-xl font-bold text-text-primary">
              {initialData ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">Mantenha os dados comerciais e de estoque atualizados.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="btn-ghost rounded-full px-2 text-xl leading-none"
          >
            ×
          </button>
        </div>
        
        {error && (
          <div className="alert-error mb-5">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="field-label">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
              className="field-control"
            />
          </div>
          
          <div>
            <label className="field-label">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
              className="field-control"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Preço</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                required
                className="field-control"
              />
            </div>
            
            <div>
              <label className="field-label">Categoria</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                required
                className="field-control"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Estoque Atual</label>
              <input
                type="number"
                min="0"
                value={formData.estoque}
                onChange={(e) => setFormData(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))}
                required
                className="field-control"
              />
            </div>
            
            <div>
              <label className="field-label">Estoque Mínimo</label>
              <input
                type="number"
                min="0"
                value={formData.estoqueMinimo}
                onChange={(e) => setFormData(prev => ({ ...prev, estoqueMinimo: parseInt(e.target.value) || 0 }))}
                required
                className="field-control"
              />
            </div>
          </div>
          
          <div>
            <label className="field-label">Código de Barras</label>
            <input
              type="text"
              value={formData.codigoBarras}
              onChange={(e) => setFormData(prev => ({ ...prev, codigoBarras: e.target.value }))}
              className="field-control"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="h-4 w-4 text-blue-primary"
            />
            <label className="text-text-secondary">Produto ativo</label>
          </div>
          
          <div className="mt-2 flex justify-end gap-3 border-t border-navy-border pt-5">
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
