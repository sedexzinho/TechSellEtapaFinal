import { LocalStorageRepository } from './localStorageRepository';
export class CustomerRepository extends LocalStorageRepository {
    key = 'customers';
    deserialize(data) {
        return JSON.parse(data);
    }
    serialize(entity) {
        return JSON.stringify(entity);
    }
    getId(entity) {
        return entity.id;
    }
    // Additional methods specific to customers
    findByNome(nome) {
        return this.findAll().filter(customer => customer.nome.toLowerCase().includes(nome.toLowerCase()) && customer.ativo);
    }
    findByCpfCnpj(cpfCnpj) {
        return this.findAll().find(customer => customer.cpfCnpj === cpfCnpj) || null;
    }
    findByEmail(email) {
        return this.findAll().find(customer => customer.email.toLowerCase() === email.toLowerCase()) || null;
    }
}
