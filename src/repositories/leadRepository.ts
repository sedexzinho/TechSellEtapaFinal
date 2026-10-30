import { LocalStorageRepository } from './localStorageRepository';
import type { Lead } from '../schemas/leadSchema';

export class LeadRepository extends LocalStorageRepository<Lead, number> {
  protected readonly key = 'leads';
  
  protected deserialize(data: string): Lead {
    return JSON.parse(data);
  }
  
  protected serialize(entity: Lead): string {
    return JSON.stringify(entity);
  }
  
  protected getId(entity: Lead): number {
    return entity.id;
  }
  
  // Additional methods specific to leads
  findByStatus(status: Lead['status']): Lead[] {
    return this.findAll().filter(lead => lead.status === status);
  }
  
  findBySource(source: Lead['source']): Lead[] {
    return this.findAll().filter(lead => lead.source === source);
  }
  
  // Convert lead to customer
  async convertToCustomer(leadId: number): Promise<boolean> {
    try {
      const lead = this.findById(leadId);
      if (!lead) return false;
      
      // This would typically create a customer from the lead
      // For now, we'll just update the lead status to 'convertido'
      const updatedLead = { ...lead, status: 'convertido' as const };
      this.update(leadId, updatedLead);
      return true;
    } catch (error) {
      console.error('Error converting lead to customer:', error);
      return false;
    }
  }
}