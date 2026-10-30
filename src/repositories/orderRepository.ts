import { LocalStorageRepository } from './localStorageRepository';
import type { Order, OrderItem } from '../schemas/orderSchema';

export class OrderRepository extends LocalStorageRepository<Order, number> {
  protected readonly key = 'orders';

  protected deserialize(data: string): Order {
    return JSON.parse(data);
  }

  protected serialize(entity: Order): string {
    return JSON.stringify(entity);
  }

  protected getId(entity: Order): number {
    return entity.id;
  }

  // Additional methods specific to orders
  findByCustomerId(customerId: number): Order[] {
    return this.findAll().filter(order => order.customerId === customerId);
  }

  findByStatus(status: Order['status']): Order[] {
    return this.findAll().filter(order => order.status === status);
  }

  // Calculate total for an order
  calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }
}