import { LocalStorageRepository } from './localStorageRepository';
import type { Budget } from '../schemas/visitSchema';

export class BudgetRepository extends LocalStorageRepository<Budget, number> {
  protected readonly key = 'budgets';
  
  protected deserialize(data: string): Budget {
    return JSON.parse(data);
  }
  
  protected serialize(entity: Budget): string {
    return JSON.stringify(entity);
  }
  
  protected getId(entity: Budget): number {
    return entity.id;
  }
  
  // Additional methods specific to budgets
  findByVisitId(visitId: number): Budget | null {
    return this.findAll().find(budget => budget.visitId === visitId) || null;
  }
  
  findByCustomerId(customerId: number): Budget[] {
    return this.findAll().filter(budget => budget.customerId === customerId);
  }
  
  findByStatus(status: Budget['status']): Budget[] {
    return this.findAll().filter(budget => budget.status === status);
  }
  
  findByStatusNotExecuted(): Budget[] {
    return this.findAll().filter(
      budget => budget.status !== 'executado' && budget.status !== 'cancelado'
    );
  }
}