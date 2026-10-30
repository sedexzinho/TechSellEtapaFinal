import React, { useState, useEffect, useMemo } from 'react';
import { ProductRepository } from '../repositories/productRepository';
import { useAuthStore } from '../store/authStore';
import ProductModal from '../components/ui/ProductModal';
import type { Product } from '../schemas/productSchema';

const ProdutosPage = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const productRepository = new ProductRepository();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(productRepository.findAll());
  };

  // Lista filtrada derivada do estado: recalcula sozinha quando products, busca ou categoria mudam
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter(product => {
      const matchesSearch =
        !term ||
        product.nome.toLowerCase().includes(term) ||
        product.descricao.toLowerCase().includes(term);
      const matchesCategory = !selectedCategory || product.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  // Get unique categories for the filter dropdown
  const categories = Array.from(new Set(products.map(p => p.categoria)));

  // Determine stock status
  const getStockStatus = (estoque: number, estoqueMinimo: number): {
    label: string;
    color: 'green' | 'yellow' | 'red';
  } => {
    if (estoque === 0) {
      return { label: 'Zerado', color: 'red' };
    }
    if (estoque <= estoqueMinimo) {
      return { label: 'Baixo', color: 'yellow' };
    }
    return { label: 'Normal', color: 'green' };
  };

  const handleAddProduct = async (productData: Product) => {
    // Assign a proper ID (in a real app, this would come from the backend)
    const newProduct = {
      ...productData,
      id: Date.now() // Temporary ID
    };
    productRepository.create(newProduct);
    loadProducts();
  };

  const handleUpdateProduct = async (productData: Product) => {
    productRepository.update(productData.id, productData);
    loadProducts();
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      productRepository.delete(id);
      loadProducts();
    }
  };

  if (!user) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const stockTone = (color: 'green' | 'yellow' | 'red') =>
    color === 'green' ? 'bg-emerald-50 text-emerald-700' :
    color === 'yellow' ? 'bg-amber-50 text-amber-700' :
    'bg-red-50 text-red-700';

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Produtos e Estoque</h1>
          <p className="page-subtitle">Controle de catálogo, preços e disponibilidade.</p>
        </div>
        {user.perfil === 'ADMIN' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Novo Produto
          </button>
        )}
      </div>

      <div className="surface-card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Buscar produtos</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Digite o nome ou descrição..."
              className="field-control"
            />
          </div>
          <div>
            <label className="field-label">Categoria</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="field-control"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">Nenhum produto encontrado com os filtros aplicados.</div>
      ) : (
        <div className="stagger-children grid gap-4 xl:grid-cols-2">
          {filteredProducts.map(product => {
            const status = getStockStatus(product.estoque, product.estoqueMinimo);
            return (
            <div key={product.id} className="surface-card surface-card-hover p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{product.nome}</h2>
                  <p className="mb-3 text-sm text-text-secondary">{product.descricao}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-slate-100 text-slate-700">
                      R$ {product.preco.toFixed(2)}
                    </span>
                    <span className="badge bg-teal-50 text-teal-800">
                      {product.categoria}
                    </span>
                    <span className="badge bg-slate-50 text-slate-600">
                      {product.codigoBarras || 'Sem código'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${stockTone(status.color)}`}>{status.label}</span>
                  {user.perfil === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => {
                          setEditProduct(product);
                          setShowEditModal(true);
                        }}
                        className="btn-sm btn-outline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn-sm border border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </>
                  )}
                  {user.perfil === 'VENDEDOR' && (
                    <button
                      onClick={() => {
                        alert('Modo consulta apenas para vendedores');
                      }}
                      className="btn-sm btn-outline"
                    >
                      Visualizar
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-border pt-4">
                <div>
                  <p className="text-xs text-text-secondary">Estoque atual</p>
                  <p className="text-xl font-semibold">{product.estoque}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Estoque mínimo</p>
                  <p className="text-xl font-semibold">{product.estoqueMinimo}</p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
      
      {/* Add Product Modal */}
      <ProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProduct}
      />
      
      {/* Edit Product Modal */}
      <ProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditProduct(null);
        }}
        onSave={handleUpdateProduct}
        initialData={editProduct ?? undefined}
      />
    </div>
  );
};

export default ProdutosPage;