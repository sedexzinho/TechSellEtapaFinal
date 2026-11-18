import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LeadRepository } from '../repositories/leadRepository';
import LeadModal from '../components/ui/LeadModal';
import type { Lead } from '../schemas/leadSchema';

type Status = Lead['status'];

const COLUMNS: Array<{ id: Status; title: string; badge: string; accent: string }> = [
  { id: 'novo', title: 'Novo', badge: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300', accent: 'bg-emerald-400' },
  { id: 'contatado', title: 'Contatado', badge: 'border-blue-400/20 bg-blue-400/10 text-blue-300', accent: 'bg-blue-400' },
  { id: 'convertido', title: 'Convertido', badge: 'border-violet-400/20 bg-violet-400/10 text-violet-300', accent: 'bg-violet-400' },
  { id: 'perdido', title: 'Perdido', badge: 'border-rose-400/20 bg-rose-400/10 text-rose-300', accent: 'bg-rose-400' },
];

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR');

const LeadsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.perfil === 'ADMIN';
  const repo = useMemo(() => new LeadRepository(), []);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const load = useCallback(() => {
    try {
      setLeads(repo.findAll());
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar leads');
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (kind: 'error' | 'success', msg: string) => {
    setError(kind === 'error' ? msg : null);
    setSuccess(kind === 'success' ? msg : null);
  };

  const convert = (lead: Lead) => {
    if (!window.confirm(`Converter o lead "${lead.name}" em cliente?`)) return;
    const result = repo.convertToCustomer(lead.id);
    if (!result.ok) return notify('error', result.reason);
    notify(
      'success',
      result.alreadyExisted
        ? `"${lead.name}" convertido. Já havia um cliente com esse e-mail, que foi reaproveitado.`
        : `"${lead.name}" convertido em cliente. Complete CPF/CNPJ e endereço na tela de Clientes.`,
    );
    load();
  };

  const handleDrop = (target: Status) => {
    const lead = leads.find(l => l.id === draggingId);
    setDraggingId(null);
    setDragOver(null);
    if (!lead || lead.status === target) return;

    if (lead.status === 'convertido') {
      return notify('error', 'Lead convertido não pode voltar no funil: o cliente já foi criado.');
    }
    if (target === 'convertido') return convert(lead);

    repo.moveToStatus(lead.id, target);
    notify('success', `"${lead.name}" movido para ${COLUMNS.find(c => c.id === target)!.title}.`);
    load();
  };

  const handleSave = (data: Omit<Lead, 'id'>) => {
    try {
      if (editing) repo.update(editing.id, data);
      else repo.create(data);
      setModalOpen(false);
      setEditing(null);
      notify('success', editing ? 'Lead atualizado.' : 'Lead criado.');
      load();
    } catch (err) {
      console.error(err);
      notify('error', 'Erro ao salvar lead');
    }
  };

  // RN05: apenas o Administrador exclui registros
  const handleDelete = (lead: Lead) => {
    if (!isAdmin) return;
    if (!window.confirm(`Excluir o lead "${lead.name}"? Esta ação não pode ser desfeita.`)) return;
    repo.delete(lead.id);
    notify('success', 'Lead excluído.');
    load();
  };

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Prospecção</h1>
          <p className="page-subtitle">Arraste os leads entre as etapas do funil.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          Novo Lead
        </button>
      </div>

      {error && <div role="alert" className="alert-error">{error}</div>}
      {success && (
        <div role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <div className="grid grid-cols-[repeat(4,minmax(260px,1fr))] gap-4 overflow-x-auto pb-2">
        {COLUMNS.map(col => {
          const items = leads.filter(l => l.status === col.id);
          return (
            <section
              key={col.id}
              aria-label={`Coluna ${col.title}`}
              className={`min-h-[280px] rounded-2xl border p-4 transition-colors duration-200 ${
                dragOver === col.id ? 'border-blue-primary bg-blue-primary/10' : 'border-navy-border bg-navy-surface/70'
              }`}
              onDragOver={e => {
                e.preventDefault();
                setDragOver(col.id);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.id)}
            >
              <h2 className="mb-1 flex items-center text-lg font-bold text-text-primary">
                <span className={`mr-2 size-2 rounded-full ${col.accent}`} aria-hidden="true" />
                {col.title}
                <span className="ml-2 rounded-full bg-navy-card px-2 py-0.5 text-xs font-semibold text-text-secondary">{items.length}</span>
              </h2>
              <p className="mb-3 text-xs text-text-primary/60">
                {brl(items.reduce((sum, l) => sum + l.value, 0))} em potencial
              </p>

              <div className="min-h-[200px] space-y-2">
                {items.map(lead => (
                  <article
                    key={lead.id}
                    draggable={lead.status !== 'convertido'}
                    onDragStart={() => setDraggingId(lead.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOver(null);
                    }}
                    className={`rounded-xl border border-navy-border bg-navy-card p-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-primary/50 hover:shadow-elevated ${
                      lead.status === 'convertido' ? '' : 'cursor-grab'
                    } ${draggingId === lead.id ? 'opacity-50' : ''}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-medium text-text-primary">{lead.name}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${col.badge}`}>{col.title}</span>
                    </div>
                    <p className="text-sm text-text-primary/70">{lead.email}</p>
                    <p className="text-sm text-text-primary/70">{lead.phone}</p>
                    {lead.company && <p className="mt-1 text-xs text-text-primary/60">{lead.company}</p>}
                    <p className="mt-1 text-xs text-text-primary/60">Valor potencial: {brl(lead.value)}</p>
                    {lead.lastContact && (
                      <p className="mt-1 text-xs text-text-primary/60">Último contato: {fmtDate(lead.lastContact)}</p>
                    )}
                    {lead.notes && (
                      <p className="mt-1 text-xs text-text-primary/60">
                        {lead.notes.length > 50 ? `${lead.notes.slice(0, 50)}...` : lead.notes}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      {lead.status !== 'convertido' && (
                        <button
                          onClick={() => {
                            setEditing(lead);
                            setModalOpen(true);
                          }}
                          className="btn-sm border border-navy-border bg-navy-surface px-3 py-1.5 text-text-secondary hover:border-blue-primary/50 hover:text-text-primary"
                        >
                          Editar
                        </button>
                      )}
                      {lead.status !== 'convertido' && lead.status !== 'perdido' && (
                        <button onClick={() => convert(lead)} className="btn-sm bg-emerald-600 text-white hover:bg-emerald-700">
                          Converter em cliente
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDelete(lead)} className="btn-sm bg-red-600 text-white hover:bg-red-700">
                          Excluir
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <LeadModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        lead={editing}
      />
    </div>
  );
};

export default LeadsPage;
