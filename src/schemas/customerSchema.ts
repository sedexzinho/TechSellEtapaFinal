export interface Customer {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: 'FISICA' | 'JURIDICA'; // FISICA for CPF, JURIDICA for CNPJ
  ativo: boolean;
}