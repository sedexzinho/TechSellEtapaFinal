import { LocalStorageRepository } from './localStorageRepository';
import type { Cost } from '../schemas/costSchema';

export class CostRepository extends LocalStorageRepository<Cost, number> {
  protected readonly key = 'costs';
  
  protected deserialize(data: string): Cost {
    return JSON.parse(data);
  }
  
  protected serialize(entity: Cost): string {
    return JSON.stringify(entity);
  }
  
  protected getId(entity: Cost): number {
    return entity.id;
  }
  
  // Additional methods specific to costs
  findByMonthYear(month: number, year: number): Cost[] {
    return this.findAll().filter(cost => cost.month === month && cost.year === year);
  }
  
  getTotalCosts(month: number, year: number): number {
    const costs = this.findByMonthYear(month, year);
    return costs.reduce((sum, cost) => sum + cost.amount, 0);
  }
  
  getFixedCosts(month: number, year: number): number {
    const costs = this.findByMonthYear(month, year);
    return costs.filter(cost => cost.type === 'fixo').reduce((sum, cost) => sum + cost.amount, 0);
  }
  
  getVariableCosts(month: number, year: number): number {
    const costs = this.findByMonthYear(month, year);
    return costs.filter(cost => cost.type === 'variavel').reduce((sum, cost) => sum + cost.amount, 0);
  }
}