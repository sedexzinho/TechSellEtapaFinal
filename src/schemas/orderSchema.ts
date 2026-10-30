export interface OrderItem {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  date: string; // ISO date string
  status: 'rascunho' | 'confirmado' | 'cancelado';
  items: OrderItem[];
  total: number;
}