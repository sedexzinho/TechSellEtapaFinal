import { LocalStorageRepository } from './localStorageRepository';
export class ProductRepository extends LocalStorageRepository {
    key = 'products';
    deserialize(data) {
        return JSON.parse(data);
    }
    serialize(entity) {
        return JSON.stringify(entity);
    }
    getId(entity) {
        return entity.id;
    }
    // Additional methods specific to products
    findByNome(nome) {
        return this.findAll().filter(product => product.nome.toLowerCase().includes(nome.toLowerCase()) && product.ativo);
    }
    findByCodigoBarras(codigoBarras) {
        return this.findAll().find(product => product.codigoBarras === codigoBarras) || null;
    }
    updateEstoque(id, quantidade) {
        const product = this.findById(id);
        if (!product)
            return null;
        const updated = { ...product, estoque: Math.max(0, product.estoque + quantidade) };
        return this.update(id, updated);
    }
}
