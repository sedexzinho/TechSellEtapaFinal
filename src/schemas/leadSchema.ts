export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'website' | 'referral' | 'social_media' | 'event' | 'other';
  status: 'novo' | 'contatado' | 'convertido' | 'perdido';
  value: number; // Valor potencial do lead
  dateAdded: string; // ISO date string
  lastContact?: string; // ISO date string
  notes?: string;
}

export interface LeadColumn {
  id: 'novo' | 'contatado' | 'convertido' | 'perdido';
  title: string;
  leads: Lead[];
}