import { BudgetRepository } from '../repositories/budgetRepository';
import { CustomerRepository } from '../repositories/customerRepository';
import { OrderRepository } from '../repositories/orderRepository';
import { ProductRepository } from '../repositories/productRepository';
import { VisitRepository } from '../repositories/visitRepository';
import { formatBRL, formatDayBR } from './aiService';

export type ReportType = 'sales' | 'products' | 'customers' | 'visits';
export type Cell = string | number | boolean | null;
export type ReportRow = Record<string, Cell>;

export interface ReportColumn {
  key: string;
  label: string;
}

export const REPORT_LABELS: Record<ReportType, string> = {
  sales: 'Vendas',
  products: 'Produtos',
  customers: 'Clientes',
  visits: 'Visitas e Orçamentos',
};

/** Relatórios que dependem do período selecionado. */
export const PERIOD_REPORTS: ReportType[] = ['sales', 'visits'];

export const REPORT_COLUMNS: Record<ReportType, ReportColumn[]> = {
  sales: [
    { key: 'date', label: 'Data' },
    { key: 'id', label: 'Pedido' },
    { key: 'customerName', label: 'Cliente' },
    { key: 'items', label: 'Itens' },
    { key: 'total', label: 'Total' },
  ],
  products: [
    { key: 'name', label: 'Produto' },
    { key: 'category', label: 'Categoria' },
    { key: 'price', label: 'Preço' },
    { key: 'stock', label: 'Estoque' },
    { key: 'minStock', label: 'Estoque mínimo' },
  ],
  customers: [
    { key: 'name', label: 'Cliente' },
    { key: 'type', label: 'Tipo' },
    { key: 'document', label: 'CPF/CNPJ' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefone' },
  ],
  visits: [
    { key: 'date', label: 'Data' },
    { key: 'customerName', label: 'Cliente' },
    { key: 'status', label: 'Status da visita' },
    { key: 'hasBudget', label: 'Orçamento' },
    { key: 'budgetStatus', label: 'Status do orçamento' },
    { key: 'budgetValue', label: 'Valor do orçamento' },
  ],
};

const CURRENCY_KEYS = new Set(['total', 'price', 'budgetValue']);
const DATE_KEYS = new Set(['date']);

/** Texto exibido na tela e no PDF. */
export function formatCell(key: string, value: Cell): string {
  if (value === null || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number' && CURRENCY_KEYS.has(key)) return formatBRL(value);
  if (typeof value === 'string' && DATE_KEYS.has(key)) return formatDayBR(value.slice(0, 10));
  return String(value);
}

export interface ReportResult {
  rows: ReportRow[];
  error: string | null;
}

const inRange = (isoDate: string, start: string, end: string): boolean => {
  const day = isoDate.slice(0, 10);
  return day >= start && day <= end;
};

export function buildReport(type: ReportType, start: string, end: string): ReportResult {
  if (PERIOD_REPORTS.includes(type)) {
    if (!start || !end) return { rows: [], error: 'Selecione a data inicial e a data final.' };
    if (start > end) return { rows: [], error: 'A data inicial não pode ser depois da data final.' };
  }

  try {
    switch (type) {
      case 'sales': {
        const rows = new OrderRepository()
          .findAll()
          .filter((order) => order.status === 'confirmado' && inRange(order.date, start, end))
          .sort((a, b) => b.date.localeCompare(a.date))
          .map<ReportRow>((order) => ({
            date: order.date,
            id: order.id,
            customerName: order.customerName,
            items: order.items.length,
            total: order.total,
          }));
        return { rows, error: null };
      }
      case 'products': {
        const rows = new ProductRepository()
          .findAll()
          .filter((product) => product.ativo)
          .map<ReportRow>((product) => ({
            name: product.nome,
            category: product.categoria,
            price: product.preco,
            stock: product.estoque,
            minStock: product.estoqueMinimo,
          }));
        return { rows, error: null };
      }
      case 'customers': {
        const rows = new CustomerRepository()
          .findAll()
          .filter((customer) => customer.ativo)
          .map<ReportRow>((customer) => ({
            name: customer.nome,
            type: customer.tipo === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica',
            document: customer.cpfCnpj,
            email: customer.email,
            phone: customer.telefone,
          }));
        return { rows, error: null };
      }
      case 'visits': {
        const budgets = new BudgetRepository().findAll();
        const rows = new VisitRepository()
          .findAll()
          .filter((visit) => inRange(visit.date, start, end))
          .sort((a, b) => b.date.localeCompare(a.date))
          .map<ReportRow>((visit) => {
            const budget = budgets.find((b) => b.visitId === visit.id);
            return {
              date: visit.date,
              customerName: visit.customerName,
              status: visit.status,
              hasBudget: Boolean(budget),
              budgetStatus: budget ? budget.status : null,
              budgetValue: budget ? budget.total : null,
            };
          });
        return { rows, error: null };
      }
    }
  } catch (error) {
    console.error(error);
    return { rows: [], error: 'Não foi possível ler os dados deste relatório.' };
  }
}
