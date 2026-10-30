import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { CustomerRepository } from '../repositories/customerRepository';
import type { Customer } from '../schemas/customerSchema';

const ClientesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'FISICA' | 'JURIDICA' | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const customerRepository = new CustomerRepository();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = customerRepository.findAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (!customers.length) return;

    let filtered = [...customers];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(customer =>
        customer.nome.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.cpfCnpj.includes(term)
      );
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(customer => customer.tipo === selectedType);
    }

    setFilteredCustomers(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [customers, searchTerm, selectedType]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as '' | 'FISICA' | 'JURIDICA');
  };

  const handleAddCustomer = () => {
    setEditCustomer(null);
    setShowAddModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditCustomer(customer);
    setShowEditModal(true);
  };

  const handleDeleteCustomer = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        customerRepository.delete(id);
        loadCustomers();
      } catch (err) {
        setError('Erro ao excluir cliente');
        console.error(err);
      }
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    // For now, just show an alert - we'll implement the detailed view later
    alert('Visualizando cliente: ' + customer.nome);
  };

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      if (editCustomer) {
        // Updating existing customer
        const updatedCustomer = { ...editCustomer, ...customerData };
        customerRepository.update(editCustomer.id, updatedCustomer);
      } else {
        // Adding new customer
        const newCustomer = {
          ...customerData,
          id: Date.now() // Temporary ID
        };
        customerRepository.create(newCustomer);
      }

      loadCustomers();
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (err) {
      setError('Erro ao salvar cliente');
      console.error(err);
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

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Base comercial de pessoas físicas e jurídicas.</p>
        </div>
        {user?.perfil === 'ADMIN' && (
          <button
            onClick={handleAddCustomer}
            className="btn-primary"
          >
            Novo Cliente
          </button>
        )}
      </div>

      <div className="surface-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="field-label">Buscar por nome, email ou CPF/CNPJ</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Digite para buscar..."
              className="field-control"
            />
          </div>
          <div>
            <label className="field-label">Tipo de Pessoa</label>
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="field-control"
            >
              <option value="">Todos</option>
              <option value="FISICA">Pessoa Física</option>
              <option value="JURIDICA">Pessoa Jurídica</option>
            </select>
          </div>
          <div className="flex items-end">
            {filteredCustomers.length > 0 && (
              <span className="text-text-primary/70 mb-2">
                {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} encontrado{filteredCustomers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mensagem vazia */}
      {filteredCustomers.length === 0 && customers.length > 0 && (
        <div className="empty-state">Nenhum cliente encontrado com os filtros aplicados.</div>
      )}

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Documento</th>
                <th>Contato</th>
                <th>Cidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <p className="font-medium">{customer.nome}</p>
                    <p className="text-xs text-text-secondary">{customer.tipo === 'FISICA' ? 'Pessoa física' : 'Pessoa jurídica'}</p>
                  </td>
                  <td>{customer.cpfCnpj}</td>
                  <td>
                    <p>{customer.email}</p>
                    <p className="text-xs text-text-secondary">{customer.telefone}</p>
                  </td>
                  <td>{customer.cidade} - {customer.estado}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {user?.perfil === 'ADMIN' && (
                        <>
                          <button onClick={() => handleEditCustomer(customer)} className="btn-sm btn-outline">Editar</button>
                          <button onClick={() => handleDeleteCustomer(customer.id)} className="btn-sm border border-red-200 text-red-700 hover:bg-red-50">Excluir</button>
                        </>
                      )}
                      <button onClick={() => handleViewCustomer(customer)} className="btn-sm btn-outline">Visualizar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar/Editar Cliente */}
      {showAddModal || showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-navy-surface rounded-xl p-6 w-full max-w-md">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              {showAddModal ? 'Novo Cliente' : 'Editar Cliente'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveCustomer({
                nome: nomeRef.current?.value || '',
                email: emailRef.current?.value || '',
                telefone: telefoneRef.current?.value || '',
                cpfCnpj: cpfCnpjRef.current?.value || '',
                endereco: enderecoRef.current?.value || '',
                cidade: cidadeRef.current?.value || '',
                estado: estadoRef.current?.value || '',
                cep: cepRef.current?.value || '',
                tipo: (tipoRef.current?.value === 'FISICA' || tipoRef.current?.value === 'JURIDICA') 
                  ? (tipoRef.current?.value as 'FISICA' | 'JURIDICA') 
                  : 'FISICA',
                ativo: true
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nome completo *</label>
                <input
                  type="text"
                  ref={nomeRef}
                  defaultValue={editCustomer?.nome || ''}
                  className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
                <input
                  type="email"
                  ref={emailRef}
                  defaultValue={editCustomer?.email || ''}
                  className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Telefone *</label>
                <input
                  type="tel"
                  ref={telefoneRef}
                  defaultValue={editCustomer?.telefone || ''}
                  className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">CPF/CNPJ *</label>
                <input
                  type="text"
                  ref={cpfCnpjRef}
                  defaultValue={editCustomer?.cpfCnpj || ''}
                  className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Endereço *</label>
                <input
                  type="text"
                  ref={enderecoRef}
                  defaultValue={editCustomer?.endereco || ''}
                  className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Cidade *</label>
                  <input
                    type="text"
                    ref={cidadeRef}
                    defaultValue={editCustomer?.cidade || ''}
                    className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Estado *</label>
                  <input
                    type="text"
                    ref={estadoRef}
                    defaultValue={editCustomer?.estado || ''}
                    className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">CEP *</label>
                <input
                  type="text"
                  ref={cepRef}
                  defaultValue={editCustomer?.cep || ''}
                  className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                  required
                />
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-text-primary">
                  Tipo de Pessoa *
                </label>
                <select
                  ref={tipoRef}
                  defaultValue={editCustomer?.tipo || 'FISICA'}
                  className="bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
                >
                  <option value="FISICA">Pessoa Física (CPF)</option>
                  <option value="JURIDICA">Pessoa Jurídica (CNPJ)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {showAddModal ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesPage;

// Refs para os campos do formulário
const nomeRef = React.createRef<HTMLInputElement>();
const emailRef = React.createRef<HTMLInputElement>();
const telefoneRef = React.createRef<HTMLInputElement>();
const cpfCnpjRef = React.createRef<HTMLInputElement>();
const enderecoRef = React.createRef<HTMLInputElement>();
const cidadeRef = React.createRef<HTMLInputElement>();
const estadoRef = React.createRef<HTMLInputElement>();
const cepRef = React.createRef<HTMLInputElement>();
const tipoRef = React.createRef<HTMLSelectElement>();