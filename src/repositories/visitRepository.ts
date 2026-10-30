import { LocalStorageRepository } from './localStorageRepository';
import type { Visit } from '../schemas/visitSchema';

export class VisitRepository extends LocalStorageRepository<Visit, number> {
  protected readonly key = 'visits';
  
  protected deserialize(data: string): Visit {
    return JSON.parse(data);
  }
  
  protected serialize(entity: Visit): string {
    return JSON.stringify(entity);
  }
  
  protected getId(entity: Visit): number {
    return entity.id;
  }
  
  // Additional methods specific to visits
  findByCustomerId(customerId: number): Visit[] {
    return this.findAll().filter(visit => visit.customerId === customerId);
  }
  
  findByStatus(status: Visit['status']): Visit[] {
    return this.findAll().filter(visit => visit.status === status);
  }
  
  // Find visits without budget
  findWithoutBudget(): Visit[] {
    return this.findAll().filter(visit => !visit.budgetId);
  }
}