export interface Visit {
  id: number;
  customerId: number;
  customerName: string;
  date: string; // ISO date string
  status: 'agendada' | 'realizada' | 'cancelada';
  budgetId?: number; // Referência ao orçamento gerado
  notes?: string; // Observações da visita
}

export interface Budget {
  id: number;
  visitId?: number; // Referência à visita que gerou este orçamento
  customerId: number;
  customerName: string;
  date: string; // ISO date string
  status: 'rascunho' | 'aprovado' | 'executado' | 'cancelado';
  items: BudgetItem[];
  total: number;
}

export interface BudgetItem {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}