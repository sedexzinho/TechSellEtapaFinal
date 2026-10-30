import type { Budget } from '../schemas/visitSchema';
import { products } from './products';

export const budgets: Budget[] = [
  {
    id: 1,
    visitId: 1,
    customerId: 1,
    customerName: 'João Silva Santos',
    date: '2025-01-15',
    status: 'executado',
    items: [
      {
        productId: 1,
        productName: products[0].nome,
        productPrice: products[0].preco,
        quantity: 2,
        subtotal: products[0].preco * 2
      },
      {
        productId: 3,
        productName: products[2].nome,
        productPrice: products[2].preco,
        quantity: 1,
        subtotal: products[2].preco * 1
      }
    ],
    total: (products[0].preco * 2) + (products[2].preco * 1)
  },
  {
    id: 2,
    visitId: 3,
    customerId: 3,
    customerName: 'Empresa Tecnologia Ltda',
    date: '2025-01-10',
    status: 'aprovado',
    items: [
      {
        productId: 4,
        productName: products[3].nome,
        productPrice: products[3].preco,
        quantity: 3,
        subtotal: products[3].preco * 3
      }
    ],
    total: products[3].preco * 3
  }
];