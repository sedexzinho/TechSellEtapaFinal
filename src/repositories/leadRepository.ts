import { LocalStorageRepository } from './localStorageRepository';
import { CustomerRepository } from './customerRepository';
import type { Lead } from '../schemas/leadSchema';
import type { Customer } from '../schemas/customerSchema';

export type ConvertResult =
  | { ok: true; customer: Customer; alreadyExisted: boolean }
  | { ok: false; reason: string };

export class LeadRepository extends LocalStorageRepository<Lead, number> {
  protected readonly key = 'leads';

  protected deserialize(data: string): Lead {
    return JSON.parse(data);
  }

  protected serialize(entity: Lead): string {
    return JSON.stringify(entity);
  }

  protected getId(entity: Lead): number {
    return entity.id;
  }

  findByStatus(status: Lead['status']): Lead[] {
    return this.findAll().filter(lead => lead.status === status);
  }

  findBySource(source: Lead['source']): Lead[] {
    return this.findAll().filter(lead => lead.source === source);
  }

  // Muda o status. Registra o último contato ao mover para "contatado".
  // "convertido" só é alcançado via convertToCustomer (cria o cliente).
  moveToStatus(leadId: number, status: Lead['status']): Lead | null {
    const lead = this.findById(leadId);
    if (!lead) return null;
    const patch: Partial<Lead> = { status };
    if (status === 'contatado') patch.lastContact = new Date().toISOString().split('T')[0];
    return this.update(leadId, patch);
  }

  // Converte o lead em cliente: cria o Customer (ou reaproveita um com o mesmo e-mail)
  // e só então marca o lead como convertido.
  convertToCustomer(leadId: number): ConvertResult {
    const lead = this.findById(leadId);
    if (!lead) return { ok: false, reason: 'Lead não encontrado' };
    if (lead.status === 'convertido') return { ok: false, reason: 'Lead já foi convertido' };

    const customers = new CustomerRepository();
    const existing = customers.findByEmail(lead.email);

    let customer: Customer;
    if (existing) {
      customer = existing;
    } else {
      customer = customers.create({
        nome: lead.name,
        email: lead.email,
        telefone: lead.phone,
        cpfCnpj: '', // o lead não tem documento; completar no cadastro do cliente
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        tipo: lead.company ? 'JURIDICA' : 'FISICA',
        ativo: true,
      } as Omit<Customer, 'id'>);
    }

    this.update(leadId, {
      status: 'convertido',
      lastContact: lead.lastContact ?? new Date().toISOString().split('T')[0],
    });
    return { ok: true, customer, alreadyExisted: !!existing };
  }
}
