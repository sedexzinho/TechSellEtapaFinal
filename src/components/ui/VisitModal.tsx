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
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

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
    <div className="modal-backdrop">
      <div className="modal-panel modal-form-card bg-navy-surface rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-text-primary">
          {visit ? 'Editar Visita' : 'Nova Visita'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Cliente *</label>
            <div className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isCustomerOpen}
                onClick={() => setIsCustomerOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setIsCustomerOpen(false);
                }}
                className="custom-select-trigger"
              >
                <span className={customerId ? 'text-text-primary' : 'text-text-secondary'}>
                  {customerId
                    ? customers.find((customer) => customer.id === customerId)?.nome
                    : 'Selecione um cliente'}
                </span>
                <span aria-hidden="true" className="custom-select-chevron">⌄</span>
              </button>
              {isCustomerOpen && (
                <div role="listbox" aria-label="Clientes" className="custom-select-menu">
                  <button
                    type="button"
                    role="option"
                    aria-selected={customerId === null}
                    className="custom-select-option"
                    onClick={() => {
                      setCustomerId(null);
                      setIsCustomerOpen(false);
                    }}
                  >
                    Selecione um cliente
                  </button>
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      role="option"
                      aria-selected={customer.id === customerId}
                      className="custom-select-option"
                      onClick={() => {
                        setCustomerId(customer.id);
                        setIsCustomerOpen(false);
                      }}
                    >
                      <span>{customer.nome}</span>
                      <small>{customer.cpfCnpj}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            <div className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isStatusOpen}
                onClick={() => setIsStatusOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setIsStatusOpen(false);
                }}
                className="custom-select-trigger"
              >
                <span className="text-text-primary">
                  {status === 'agendada' ? 'Agendada' : status === 'realizada' ? 'Realizada' : 'Cancelada'}
                </span>
                <span aria-hidden="true" className="custom-select-chevron">⌄</span>
              </button>
              {isStatusOpen && (
                <div role="listbox" aria-label="Status da visita" className="custom-select-menu">
                  {[
                    ['agendada', 'Agendada'],
                    ['realizada', 'Realizada'],
                    ['cancelada', 'Cancelada'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={status === value}
                      className="custom-select-option"
                      onClick={() => {
                        setStatus(value as 'agendada' | 'realizada' | 'cancelada');
                        setIsStatusOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
