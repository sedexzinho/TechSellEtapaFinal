export interface Goal {
  id: number;
  userId: number;
  userName: string;
  month: number; // 1-12
  year: number;
  targetValue: number; // Meta de faturamento
  achievedValue: number; // Valor realmente atingido
}

export interface Cost {
  id: number;
  description: string;
  amount: number;
  type: 'fixo' | 'variavel'; // fixo = mensal, variavel = depende do volume
  month: number; // 1-12
  year: number;
  isRecurring: boolean; // Se o custo se repete todo mês
}