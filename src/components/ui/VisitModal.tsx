import React, { useState, useEffect } from 'react';
import type { Visit } from '../../schemas/visitSchema';
import type { Customer } from '../../schemas/customerSchema';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitData: Omit<Visit, 'id'>) => void;
  customers: Customer[];
  visit: Visit | null;
}

const VisitModal: React.FC<VisitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  visit,
}) => {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'agendada' | 'realizada' | 'cancelada'>('agendada');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visit) {
      setCustomerId(visit.customerId);
      setDate(visit.date);
      setStatus(visit.status);
      setNotes(visit.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('agendada');
    }
  }, [visit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      setError('Por favor, selecione um cliente');
      return;
    }

    if (!date) {
      setError('Por favor, informe a data');
      return;
    }

    setIsLoading(true);
    
    try {
      const visitData: Omit<Visit, 'id'> = {
        customerId: customerId!,
        customerName: customers.find(c => c.id === customerId)!.nome || '',
        date,
        status,
        budgetId: visit?.budgetId,
        notes: notes.trim() || undefined
      };

      onSave(visitData);
      setError(null);
    } catch (err) {
      setError('Erro ao salvar visita');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-navy-surface rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-text-primary">
          {visit ? 'Editar Visita' : 'Nova Visita'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Cliente *</label>
            <select
              value={customerId ?? ''}
              onChange={(e) => setCustomerId(e.target.value === '' ? null : parseInt(e.target.value))}
              className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            >
              <option value="">Selecione um cliente</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.nome} ({customer.cpfCnpj})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Data *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'agendada' | 'realizada' | 'cancelada')}
              className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            >
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
              rows={4}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-400 mb-3">{error}</p>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Salvando...' : visit ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitModal;