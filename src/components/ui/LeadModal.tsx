import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Lead } from '../../schemas/leadSchema';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Lead, 'id'>) => void;
  lead: Lead | null;
}

const SOURCES: Array<[Lead['source'], string]> = [
  ['website', 'Site'],
  ['referral', 'Indicação'],
  ['social_media', 'Redes sociais'],
  ['event', 'Evento'],
  ['other', 'Outro'],
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState<Lead['source']>('website');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(lead?.name ?? '');
    setEmail(lead?.email ?? '');
    setPhone(lead?.phone ?? '');
    setCompany(lead?.company ?? '');
    setSource(lead?.source ?? 'website');
    setValue(lead ? String(lead.value) : '');
    setNotes(lead?.notes ?? '');
    setError(null);
  }, [isOpen, lead]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = Number(value.replace(',', '.'));

    if (!name.trim()) return setError('Informe o nome do lead');
    if (!EMAIL_RE.test(email.trim())) return setError('Informe um e-mail válido');
    if (!phone.trim()) return setError('Informe o telefone');
    if (value.trim() === '' || Number.isNaN(parsedValue) || parsedValue < 0) {
      return setError('Informe um valor potencial válido (maior ou igual a zero)');
    }

    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim() || undefined,
      source,
      status: lead?.status ?? 'novo',
      value: parsedValue,
      dateAdded: lead?.dateAdded ?? new Date().toISOString().split('T')[0],
      lastContact: lead?.lastContact,
      notes: notes.trim() || undefined,
    });
  };

  const inputClass =
    'w-full rounded-xl border border-navy-border bg-navy-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-cyan-accent focus:outline-none focus:ring-2 focus:ring-cyan-accent/20';
  const labelClass = 'block text-sm font-medium text-text-primary mb-1';

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-panel modal-form-card max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-navy-border bg-navy-surface p-5 shadow-elevated sm:p-6">
        <div className="mb-5 border-b border-navy-border pb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-accent">Prospecção</p>
          <h2 className="text-xl font-bold text-text-primary">{lead ? 'Editar Lead' : 'Novo Lead'}</h2>
          <p className="mt-1 text-sm text-text-secondary">Registre os dados e o potencial deste contato.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-name" className={labelClass}>Nome *</label>
              <input id="lead-name" className={inputClass} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lead-email" className={labelClass}>E-mail *</label>
              <input id="lead-email" type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-phone" className={labelClass}>Telefone *</label>
              <input id="lead-phone" className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lead-company" className={labelClass}>Empresa</label>
              <input id="lead-company" className={inputClass} value={company} onChange={e => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lead-source" className={labelClass}>Origem *</label>
              <select id="lead-source" className={inputClass} value={source} onChange={e => setSource(e.target.value as Lead['source'])}>
                {SOURCES.map(([v, label]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lead-value" className={labelClass}>Valor potencial (R$) *</label>
              <input id="lead-value" inputMode="decimal" className={inputClass} value={value} onChange={e => setValue(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="lead-notes" className={labelClass}>Observações</label>
            <textarea id="lead-notes" rows={3} className={inputClass} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-navy-border pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{lead ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default LeadModal;
