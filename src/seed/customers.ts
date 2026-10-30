export interface CustomerSeed {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: 'FISICA' | 'JURIDICA';
  ativo: boolean;
}

export const customers: CustomerSeed[] = [
  {
    id: 1,
    nome: 'João Silva Santos',
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-1111',
    cpfCnpj: '123.456.789-00',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    tipo: 'FISICA',
    ativo: true
  },
  {
    id: 2,
    nome: 'Maria Oliveira Costa',
    email: 'maria.oliveira@email.com',
    telefone: '(11) 88888-2222',
    cpfCnpj: '987.654.321-00',
    endereco: 'Avenida Paulista, 456',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    tipo: 'FISICA',
    ativo: true
  },
  {
    id: 3,
    nome: 'Empresa Tecnologia Ltda',
    email: 'contato@empresa.com.br',
    telefone: '(11) 77777-3333',
    cpfCnpj: '12.345.678/0001-90',
    endereco: 'Rua das Indústrias, 1000',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    tipo: 'JURIDICA',
    ativo: true
  },
  {
    id: 4,
    nome: 'Carlos Souza Pereira',
    email: 'carlos.souza@email.com',
    telefone: '(11) 66666-4444',
    cpfCnpj: '111.222.333-44',
    endereco: 'Rua dos Comerciantes, 789',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    tipo: 'FISICA',
    ativo: true
  }
];