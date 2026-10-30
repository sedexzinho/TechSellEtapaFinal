export interface CostSeed {
  id: number;
  description: string;
  amount: number;
  type: 'fixo' | 'variavel';
  month: number;
  year: number;
  isRecurring: boolean;
}

export const costs: CostSeed[] = [
  {
    id: 1,
    description: 'Aluguel do estabelecimento',
    amount: 3000,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 2,
    description: 'Conta de luz',
    amount: 450,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 3,
    description: 'Conta de água',
    amount: 120,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 4,
    description: 'Salários dos funcionários',
    amount: 18000,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 5,
    description: 'Comissão de vendas',
    amount: 7500,
    type: 'variavel',
    month: 10,
    year: 2025,
    isRecurring: false
  },
  {
    id: 6,
    description: 'Marketing e publicidade',
    amount: 2000,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 7,
    description: 'Manutenção de equipamentos',
    amount: 1500,
    type: 'variavel',
    month: 10,
    year: 2025,
    isRecurring: false
  }
];