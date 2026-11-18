import { beforeEach, describe, expect, it } from 'vitest';

const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

import { LeadRepository } from './leadRepository';
import { CustomerRepository } from './customerRepository';

const base = {
  name: 'Ana Pereira',
  email: 'ana@email.com',
  phone: '(11) 99999-1111',
  source: 'website' as const,
  status: 'novo' as const,
  value: 5000,
  dateAdded: '2026-01-01',
};

describe('LeadRepository', () => {
  beforeEach(() => store.clear());

  it('converte lead em cliente de verdade e marca como convertido', () => {
    const repo = new LeadRepository();
    const lead = repo.create(base);
    const res = repo.convertToCustomer(lead.id);

    expect(res.ok).toBe(true);
    expect(new CustomerRepository().findByEmail('ana@email.com')).not.toBeNull();
    expect(repo.findById(lead.id)?.status).toBe('convertido');
  });

  it('reaproveita cliente existente com o mesmo e-mail', () => {
    const repo = new LeadRepository();
    new CustomerRepository().create({
      nome: 'Ana', email: 'ANA@email.com', telefone: '1', cpfCnpj: '1', endereco: '', cidade: '', estado: '', cep: '', tipo: 'FISICA', ativo: true,
    } as any);
    const lead = repo.create(base);
    const res = repo.convertToCustomer(lead.id);

    expect(res.ok && res.alreadyExisted).toBe(true);
    expect(new CustomerRepository().count()).toBe(1);
  });

  it('não converte duas vezes', () => {
    const repo = new LeadRepository();
    const lead = repo.create(base);
    repo.convertToCustomer(lead.id);
    expect(repo.convertToCustomer(lead.id).ok).toBe(false);
  });

  it('registra último contato ao mover para contatado', () => {
    const repo = new LeadRepository();
    const lead = repo.create(base);
    expect(repo.moveToStatus(lead.id, 'contatado')?.lastContact).toBeTruthy();
  });
});
