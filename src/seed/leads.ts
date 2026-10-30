export interface LeadSeed {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'website' | 'referral' | 'social_media' | 'event' | 'other';
  status: 'novo' | 'contatado' | 'convertido' | 'perdido';
  value: number;
  dateAdded: string;
  lastContact?: string;
  notes?: string;
}

export const leads: LeadSeed[] = [
  {
    id: 1,
    name: 'Ana Pereira',
    email: 'ana.pereira@email.com',
    phone: '(11) 99999-1111',
    company: 'Pereira Ltda',
    source: 'website',
    status: 'novo',
    value: 5000,
    dateAdded: '2025-01-20',
    notes: 'Interessada em bancos de quartzo'
  },
  {
    id: 2,
    name: 'Carlos Lima',
    email: 'carlos.lima@email.com',
    phone: '(11) 88888-2222',
    company: 'Construções Lima',
    source: 'referral',
    status: 'contatado',
    value: 15000,
    dateAdded: '2025-01-15',
    lastContact: '2025-01-18',
    notes: 'Cliente indicado pelo João Silva'
  },
  {
    id: 3,
    name: 'Marina Silva',
    email: 'marina.silva@email.com',
    phone: '(11) 77777-3333',
    source: 'social_media',
    status: 'convertido',
    value: 8000,
    dateAdded: '2025-01-10',
    lastContact: '2025-01-12',
    notes: 'Convertida em cliente após visita'
  },
  {
    id: 4,
    name: 'Roberto Costa',
    email: 'roberto.costa@email.com',
    phone: '(11) 66666-4444',
    company: 'Costa & Filhos',
    source: 'event',
    status: 'perdido',
    value: 3000,
    dateAdded: '2025-01-05',
    lastContact: '2025-01-07',
    notes: 'Cliente escolheu concorrente'
  }
];