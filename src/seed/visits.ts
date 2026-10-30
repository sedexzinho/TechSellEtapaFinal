import type { Visit } from '../schemas/visitSchema';

export const visits: Visit[] = [
  {
    id: 1,
    customerId: 1,
    customerName: 'João Silva Santos',
    date: '2025-01-15',
    status: 'realizada',
    budgetId: 1,
    notes: 'Cliente interessado em bancos de granito'
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Maria Oliveira Costa',
    date: '2025-01-18',
    status: 'agendada',
    notes: 'Visita marcada para medição do local'
  },
  {
    id: 3,
    customerId: 3,
    customerName: 'Empresa Tecnologia Ltda',
    date: '2025-01-10',
    status: 'realizada',
    budgetId: 2,
    notes: 'Orçamento aprovado para reforma do escritório'
  },
  {
    id: 4,
    customerId: 4,
    customerName: 'Carlos Souza Pereira',
    date: '2025-01-20',
    status: 'cancelada',
    notes: 'Cliente cancelou a visita'
  }
];