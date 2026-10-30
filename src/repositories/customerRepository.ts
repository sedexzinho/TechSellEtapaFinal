import { LocalStorageRepository } from './localStorageRepository';
import type { Customer } from '../schemas/customerSchema';

export class CustomerRepository extends LocalStorageRepository<Customer, number> {
  protected readonly key = 'customers';

  protected deserialize(data: string): Customer {
    return JSON.parse(data);
  }

  protected serialize(entity: Customer): string {
    return JSON.stringify(entity);
  }

  protected getId(entity: Customer): number {
    return entity.id;
  }

  // Additional methods specific to customers
  findByNome(nome: string): Customer[] {
    return this.findAll().filter(customer =>
      customer.nome.toLowerCase().includes(nome.toLowerCase()) && customer.ativo
    );
  }

  findByCpfCnpj(cpfCnpj: string): Customer | null {
    return this.findAll().find(customer => customer.cpfCnpj === cpfCnpj) || null;
  }

  findByEmail(email: string): Customer | null {
    return this.findAll().find(customer => customer.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // Check if CPF/CNPJ already exists (excluding a specific ID for updates)
  cpfCnpjExists(cpfCnpj: string, excludeId?: number): boolean {
    const customers = this.findAll();
    return customers.some(customer => 
      customer.cpfCnpj === cpfCnpj && customer.id !== excludeId
    );
  }

  // Check if email already exists (excluding a specific ID for updates)
  emailExists(email: string, excludeId?: number): boolean {
    const customers = this.findAll();
    return customers.some(customer => 
      customer.email.toLowerCase() === email.toLowerCase() && customer.id !== excludeId
    );
  }
}