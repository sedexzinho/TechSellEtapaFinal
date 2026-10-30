import { LocalStorageRepository } from './localStorageRepository';
import type { Product } from '../schemas/productSchema';

export class ProductRepository extends LocalStorageRepository<Product, number> {
  protected readonly key = 'products';

  protected deserialize(data: string): Product {
    return JSON.parse(data);
  }

  protected serialize(entity: Product): string {
    return JSON.stringify(entity);
  }

  protected getId(entity: Product): number {
    return entity.id;
  }

  // Additional methods specific to products
  findByNome(nome: string): Product[] {
    return this.findAll().filter(product =>
      product.nome.toLowerCase().includes(nome.toLowerCase()) && product.ativo
    );
  }

  findByCodigoBarras(codigoBarras: string): Product | null {
    return this.findAll().find(product => product.codigoBarras === codigoBarras) || null;
  }

  updateEstoque(id: number, quantidade: number): Product | null {
    const product = this.findById(id);
    if (!product) return null;

    const updated = { ...product, estoque: Math.max(0, product.estoque + quantidade) };
    return this.update(id, updated);
  }
}