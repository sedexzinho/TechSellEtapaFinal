import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LeadRepository } from '../repositories/leadRepository';
import type { Lead } from '../schemas/leadSchema';

const LeadsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<'novo' | 'contatado' | 'convertido' | 'perdido' | null>(null);

  const leadRepository = new LeadRepository();

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = leadRepository.findAll();
      setLeads(data);
    } catch (err) {
      setError('Erro ao carregar leads');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (lead: Lead) => {
    setDraggingLead(lead);
  };

  const handleDragEnd = () => {
    setDraggingLead(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: Lead['status']) => {
    e.preventDefault();
    setDragOverColumn(status as 'novo' | 'contatado' | 'convertido' | 'perdido');
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (status: Lead['status']) => {
    if (draggingLead && draggingLead.status !== status) {
      try {
        const updatedLead = { ...draggingLead, status };
        leadRepository.update(draggingLead.id, updatedLead);
        loadLeads();
        setError(null);
      } catch (err) {
        setError('Erro ao atualizar status do lead');
        console.error(err);
      }
    }
    setDraggingLead(null);
    setDragOverColumn(null);
  };

  const handleConvertToCustomer = async (lead: Lead) => {
    if (window.confirm(`Tem certeza que deseja converter o lead "${lead.name}" em cliente?`)) {
      try {
        const success = await leadRepository.convertToCustomer(lead.id);
        if (success) {
          loadLeads();
          setError(null);
        } else {
          setError('Erro ao converter lead em cliente');
        }
      } catch (err) {
        setError('Erro ao converter lead em cliente');
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error">
        {error}
      </div>
    );
  }

  // Group leads by status for kanban columns
  const leadsByStatus: Record<Lead['status'], Lead[]> = {
    novo: leads.filter(lead => lead.status === 'novo'),
    contatado: leads.filter(lead => lead.status === 'contatado'),
    convertido: leads.filter(lead => lead.status === 'convertido'),
    perdido: leads.filter(lead => lead.status === 'perdido')
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Prospecção</h1>
          <p className="page-subtitle">Arraste os leads entre as etapas do funil.</p>
        </div>
        {user?.perfil === 'ADMIN' && (
          <button
            onClick={() => alert('Funcionalidade de novo lead será implementada em uma versão futura')}
            className="btn-primary"
          >
            Novo Lead
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Novo Column */}
        <div className="space-y-3">
          <div
            className={`min-h-[280px] rounded-2xl border-2 border-dashed p-4 transition-colors duration-200 ${dragOverColumn === 'novo' ? 'border-blue-primary bg-teal-50/50' : 'border-navy-border bg-slate-50'}`}
            onDragOver={(e) => handleDragOver(e, 'novo')}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop('novo')}
          >
            <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center">
              Novo
              <span className="ml-2 text-text-primary/70">{leadsByStatus.novo.length}</span>
            </h2>
            <div className="space-y-2 min-h-[200px]">
              {leadsByStatus.novo.map(lead => (
                <div
                  key={lead.id}
                  className={`cursor-grab rounded-xl border border-navy-border bg-white p-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${draggingLead === lead ? 'opacity-50' : ''}`}
                  draggable={true}
                  onDragStart={() => handleDragStart(lead)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-text-primary">{lead.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800`}
                          >Novo</span>
                  </div>
                  <p className="text-text-primary/70 text-sm">{lead.email}</p>
                  <p className="text-text-primary/70 text-sm">{lead.phone}</p>
                  {lead.company && (
                    <p className="text-text-primary/60 text-xs mt-1">{lead.company}</p>
                  )}
                  <p className="text-text-primary/60 text-xs mt-1">
                    Valor potencial: R$ {lead.value.toFixed(2)}
                  </p>
                  {lead.notes && (
                    <p className="text-text-primary/60 text-xs mt-1">
                      {lead.notes.substring(0, 50)}${lead.notes.length > 50 ? '...' : ''}
                    </p>
                  )}
                  <div className="mt-2 flex justify-end space-x-2">
                    {user?.perfil === 'ADMIN' && (
                      <button
                        onClick={() => handleConvertToCustomer(lead)}
                        className="btn-sm bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Converter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contatado Column */}
        <div className="space-y-3">
          <div
            className={`min-h-[280px] rounded-2xl border-2 border-dashed p-4 transition-colors duration-200 ${dragOverColumn === 'contatado' ? 'border-blue-primary bg-teal-50/50' : 'border-navy-border bg-slate-50'}`}
            onDragOver={(e) => handleDragOver(e, 'contatado')}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop('contatado')}
          >
            <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center">
              Contatado
              <span className="ml-2 text-text-primary/70">{leadsByStatus.contatado.length}</span>
            </h2>
            <div className="space-y-2 min-h-[200px]">
              {leadsByStatus.contatado.map(lead => (
                <div
                  key={lead.id}
                  className={`cursor-grab rounded-xl border border-navy-border bg-white p-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${draggingLead === lead ? 'opacity-50' : ''}`}
                  draggable={true}
                  onDragStart={() => handleDragStart(lead)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-text-primary">{lead.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800`}
                          >Contatado</span>
                  </div>
                  <p className="text-text-primary/70 text-sm">{lead.email}</p>
                  <p className="text-text-primary/70 text-sm">{lead.phone}</p>
                  {lead.company && (
                    <p className="text-text-primary/60 text-xs mt-1">{lead.company}</p>
                  )}
                  <p className="text-text-primary/60 text-xs mt-1">
                    Valor potencial: R$ {lead.value.toFixed(2)}
                  </p>
                  {lead.lastContact && (
                    <p className="text-text-primary/60 text-xs mt-1">
                      Último contato: {new Date(lead.lastContact).toLocaleDateString()}
                    </p>
                  )}
                  {lead.notes && (
                    <p className="text-text-primary/60 text-xs mt-1">
                      {lead.notes.substring(0, 50)}${lead.notes.length > 50 ? '...' : ''}
                    </p>
                  )}
                  <div className="mt-2 flex justify-end space-x-2">
                    {user?.perfil === 'ADMIN' && (
                      <button
                        onClick={() => handleConvertToCustomer(lead)}
                        className="btn-sm bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Converter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Convertido Column */}
        <div className="space-y-3">
          <div
            className={`min-h-[280px] rounded-2xl border-2 border-dashed p-4 transition-colors duration-200 ${dragOverColumn === 'convertido' ? 'border-blue-primary bg-teal-50/50' : 'border-navy-border bg-slate-50'}`}
            onDragOver={(e) => handleDragOver(e, 'convertido')}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop('convertido')}
          >
            <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center">
              Convertido
              <span className="ml-2 text-text-primary/70">{leadsByStatus.convertido.length}</span>
            </h2>
            <div className="space-y-2 min-h-[200px]">
              {leadsByStatus.convertido.map(lead => (
                <div
                  key={lead.id}
                  className={`cursor-grab rounded-xl border border-navy-border bg-white p-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${draggingLead === lead ? 'opacity-50' : ''}`}
                  draggable={true}
                  onDragStart={() => handleDragStart(lead)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-text-primary">{lead.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800`}
                          >Convertido</span>
                  </div>
                  <p className="text-text-primary/70 text-sm">{lead.email}</p>
                  <p className="text-text-primary/70 text-sm">{lead.phone}</p>
                  {lead.company && (
                    <p className="text-text-primary/60 text-xs mt-1">{lead.company}</p>
                  )}
                  <p className="text-text-primary/60 text-xs mt-1">
                    Valor potencial: R$ {lead.value.toFixed(2)}
                  </p>
                  {lead.lastContact && (
                    <p className="text-text-primary/60 text-xs mt-1">
                      Último contato: {new Date(lead.lastContact).toLocaleDateString()}
                    </p>
                  )}
                  {lead.notes && (
                    <p className="text-text-primary/60 text-xs mt-1">
                      {lead.notes.substring(0, 50)}${lead.notes.length > 50 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Perdido Column */}
        <div className="space-y-3">
          <div
            className={`min-h-[280px] rounded-2xl border-2 border-dashed p-4 transition-colors duration-200 ${dragOverColumn === 'perdido' ? 'border-blue-primary bg-teal-50/50' : 'border-navy-border bg-slate-50'}`}
            onDragOver={(e) => handleDragOver(e, 'perdido')}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop('perdido')}
          >
            <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center">
              Perdido
              <span className="ml-2 text-text-primary/70">{leadsByStatus.perdido.length}</span>
            </h2>
            <div className="space-y-2 min-h-[200px]">
              {leadsByStatus.perdido.map(lead => (
                <div
                  key={lead.id}
                  className={`cursor-grab rounded-xl border border-navy-border bg-white p-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${draggingLead === lead ? 'opacity-50' : ''}`}
                  draggable={true}
                  onDragStart={() => handleDragStart(lead)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-text-primary">{lead.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800`}
                          >Perdido</span>
                  </div>
                  <p className="text-text-primary/70 text-sm">{lead.email}</p>
                  <p className="text-text-primary/70 text-sm">{lead.phone}</p>
                  {lead.company && (
                    <p className="text-text-primary/60 text-xs mt-1">{lead.company}</p>
                  )}
                  <p className="text-text-primary/60 text-xs mt-1">
                    Valor potencial: R$ {lead.value.toFixed(2)}
                  </p>
                  {lead.lastContact && (
                    <p className="text-text-primary/60 text-xs mt-1">
                      Último contato: {new Date(lead.lastContact).toLocaleDateString()}
                    </p>
                  )}
                  {lead.notes && (
                    <p className="text-text-primary/60 text-xs mt-1">
                      {lead.notes.substring(0, 50)}${lead.notes.length > 50 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;