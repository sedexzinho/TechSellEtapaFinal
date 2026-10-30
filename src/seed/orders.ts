export interface OrderSeed {
  id: number;
  customerId: number;
  customerName: string;
  date: string; // ISO date string
  status: 'rascunho' | 'confirmado' | 'cancelado';
  items: {
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  total: number;
}

export const orders: OrderSeed[] = [
  {
    id: 1,
    customerId: 1, // João Silva Santos
    customerName: 'João Silva Santos',
    date: '2026-10-10',
    status: 'confirmado',
    items: [
      {
        productId: 1, // Notebook Dell Inspiron 15
        productName: 'Notebook Dell Inspiron 15',
        productPrice: 3500.00,
        quantity: 1,
        subtotal: 3500.00
      }
    ],
    total: 3500.00
  },
  {
    id: 2,
    customerId: 2, // Maria Oliveira Costa
    customerName: 'Maria Oliveira Costa',
    date: '2026-10-11',
    status: 'confirmado',
    items: [
      {
        productId: 2, // Mouse Logitech Wireless
        productName: 'Mouse Logitech Wireless',
        productPrice: 85.00,
        quantity: 2,
        subtotal: 170.00
      },
      {
        productId: 3, // Teclado Mecânico Redragon
        productName: 'Teclado Mecânico Redragon',
        productPrice: 220.00,
        quantity: 1,
        subtotal: 220.00
      }
    ],
    total: 390.00
  }
];