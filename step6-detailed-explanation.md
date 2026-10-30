# Etapa 6: Explicação Detalhada do que foi Feito

Este documento explica de forma simples e detalhada tudo que foi feito na sexta etapa do projeto TechSell, como se estivesse explicando para alguém que nunca programou antes.

## O que é o Módulo de Visitas e Orçamentos?

O módulo de visitas e orçamentos é onde gerenciamos todo o processo de atendimento ao cliente, desde a primeira visita até a execução do serviço. Funciona assim:

1. **Visita**: Agendamos uma visita ao cliente para entender suas necessidades
2. **Orçamento**: Após a visita, criamos um orçamento com os produtos e serviços
3. **Aprovação**: O cliente analisa e aprova o orçamento
4. **Execução**: Realizamos o serviço e marcamos o orçamento como executado

Na Etapa 6, focamos em implementar um sistema completo para gerenciar visitas e orçamentos, respeitando as regras de negócio e integrando com o estoque.

## O que foi feito na Etapa 6?

Na sexta etapa, implementamos o módulo completo de visitas e orçamentos:
1. Tela com duas abas (Visitas e Orçamentos)
2. Funcionalidade de geração de orçamento a partir de visita
3. Transições de status respeitando RN04 (Orçamento só pode ir para EXECUTADO depois de APROVADO)
4. Integração com controle de estoque (baixa ao executar, estorno ao cancelar)
5. Build, lint e testes para garantir que tudo funciona corretamente

Vamos explicar cada parte em detalhes:

---

## 1. Como criamos os schemas para visitas e orçamentos

### `src/schemas/visitSchema.ts`

Definimos três interfaces principais:

#### Visit (Visita)
```typescript
export interface Visit {
  id: number;
  customerId: number;
  customerName: string;
  date: string; // ISO date string
  status: 'agendada' | 'realizada' | 'cancelada';
  budgetId?: number; // Referência ao orçamento gerado (opcional)
  notes?: string; // Observações da visita
}
```

#### Budget (Orçamento)
```typescript
export interface Budget {
  id: number;
  visitId?: number; // Referência à visita que gerou este orçamento (opcional)
  customerId: number;
  customerName: string;
  date: string; // ISO date string
  status: 'rascunho' | 'aprovado' | 'executado' | 'cancelado';
  items: BudgetItem[];
  total: number;
}
```

#### BudgetItem (Item do Orçamento)
```typescript
export interface BudgetItem {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}
```

### Por que esses schemas?
- **Visit**: Armazena informações da visita ao cliente (quando, quem, observações)
- **Budget**: Armazena o orçamento propriamente dito (produtos, valores, status)
- **BudgetItem**: Cada linha do orçamento (produto específico com quantidade e preço)
- **Relacionamento**: Uma visita pode gerar um orçamento (budgetId na visita)
- **Relacionamento inverso**: Um orçamento pode estar ligado a uma visita (visitId no orçamento)

---

## 2. Como implementamos os repositórios para visitas e orçamentos

### `src/repositories/visitRepository.ts` e `src/repositories/budgetRepository.ts`

Estendemos o `LocalStorageRepository` genérico que criamos na Etapa 2, adicionando métodos específicos:

#### Métodos do VisitRepository
- `findByCustomerId(customerId: number)`: Busca visitas por cliente
- `findByStatus(status: Visit['status'])`: Filtra visitas por status
- `findWithoutBudget()`: Encontra visitas que ainda não têm orçamento vinculado

#### Métodos do BudgetRepository
- `findByVisitId(visitId: number)`: Busca orçamento gerado a partir de uma visita
- `findByCustomerId(customerId: number)`: Busca orçamentos por cliente
- `findByStatus(status: Budget['status'])`: Filtra orçamentos por status
- `findByStatusNotExecuted()`: Orçamentos que ainda podem ser executados (não executados nem cancelados)

### Reuso do LocalStorageRepository
Assim como fizemos para usuários, produtos, clientes e pedidos, reutilizamos:
- **localStorageRepository.ts**: Classe abstrata que implementa operações CRUD básicas
- **Métodos genéricos**: findById, findAll, create, update, delete, count
- **Métodos específicos**: Implementados em cada repositório conforme necessário

---

## 3. Como criamos os dados de seed (exemplos iniciais)

### `src/seed/visits.ts` e `src/seed/budgets.ts`

Criamos dados de exemplo para testar o sistema:

#### Visitas de exemplo
```typescript
export const visits: Visit[] = [
  {
    id: 1,
    customerId: 1,
    customerName: 'João Silva Santos',
    date: '2025-01-15',
    status: 'realizada',
    budgetId: 1, // Já tem orçamento vinculado
    notes: 'Cliente interessado em bancos de granito'
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Maria Oliveira Costa',
    date: '2025-01-18',
    status: 'agendada',
    notes: 'Visita marcada para medição do local'
  }
  // ... mais visitas
];
```

#### Orçamentos de exemplo
```typescript
export const budgets: Budget[] = [
  {
    id: 1,
    visitId: 1,
    customerId: 1,
    customerName: 'João Silva Santos',
    date: '2025-01-15',
    status: 'executado', // Já foi executado
    items: [
      {
        productId: 1, // Notebook Dell Inspiron 15
        productName: 'Notebook Dell Inspiron 15',
        productPrice: 3500.00,
        quantity: 2,
        subtotal: 7000.00
      }
    ],
    total: 7000.00
  }
  // ... mais orçamentos
];
```

### Atualizando o SeedService
Atualizamos o `SeedService` para incluir os novos repositórios:
- Adicionamos `VisitRepository` e `BudgetRepository`
- Criamos métodos `seedVisits()` e `seedBudgets()`
- Atualizamos `seedAll()` e `resetData()` para incluir os novos dados

---

## 4. Como implementamos a tela de Visitas e Orçamentos

### `src/pages/Visitas.tsx`

Esta é a página principal com duas abas separadas.

#### Estrutura das abas
Usamos o padrão de "tabs" comum em interfaces:
- **Abaclito visual**: Botões que mudam de cor quando selecionados
- **Conteúdo**: Só mostra o conteúdo da aba ativa
- **Estado**: Controlado pelo hook `useState` com valores `'visitas'` ou `'orcamentos'`

#### Aba "Visitas"
Funcionalidades:
- **Listagem**: Todas as visitas em cards
- **Filtros por status**: Visual rápido com cores (agendada=amarelo, realizada=verde, cancelada=vermelho)
- **Ações (ADMIN only)**:
  - Nova visita (modal)
  - Editar visita
  - Cancelar visita (agendada)
  - Excluir visita
- **Visualização**: Mostra detalhes da visita em alerta

#### Aba "Orçamentos"
Funcionalidades:
- **Listagem**: Todos os orçamentos em cards
- **Filtros por status**: Visual rápido com cores (rascunho=amarelo, aprovado=azul, executado=verde, cancelado=vermelho)
- **Ações (ADMIN only)**:
  - Novo orçamento (modal)
  - Editar orçamento
  - Aprovar orçamento (rascunho → aprovado)
  - Executar orçamento (aprovado → executado) - **com validação de estoque**
  - Cancelar orçamento (qualquer status) - **com estorno de estoque se já executado**
  - Excluir orçamento
- **Visualização**: Mostra detalhes do orçamento em alerta

#### Integração com repositórios
- Carregamos dados dos `VisitRepository` e `BudgetRepository` no `useEffect`
- Mantemos os dados em estado local com `useState`
- Recarregamos após cada operação (create/update/delete)

---

## 5. Como implementamos os modais de visita e orçamento

### `src/components/ui/VisitModal.tsx`
Modal para criar/editar visitas com:
- Seleção de cliente (dropdown)
- Campo de data
- Seleção de status (agendada/realizada/cancelada)
- Campo de observações
- Validação obrigatória de cliente e data

### `src/components/ui/BudgetModal.tsx`
Modal mais complexo para criar/editar orçamentos com:
- Seleção de cliente (dropdown)
- Vinculação opcional a visita (dropdown)
- Campo de data
- Seleção de status (rascunho/aprovado/executado/cancelado)
- **Adição de produtos** com controle de quantidade
- Lista de itens com:
  - Nome do produto
  - Preço unitário
  - Quantidade (com botões + e -)
  - Subtotal
  - Botão de remoção
- **Total automático** calculado em tempo real
- Validação obrigatória de cliente e pelo menos um item

---

## 6. Como implementamos a geração de orçamento a partir de visita

### Fluxo de trabalho
1. Usuário acessa a aba "Visitas"
2. Seleciona uma visita com status "agendada" ou "realizada"
3. Clica em um botão específico (ainda a implementar na interface completa)
4. Sistema cria um orçamento pré-preenchido com:
   - Mesma data da visita
   - Mesmo cliente
   - visitId vinculado à visita original
   - Status inicial: "rascunho"
5. Usuário pode então adicionar/remover itens e ajustar o orçamento

### Implementação atual
Na versão atual, o usuário pode:
- Criar um orçamento normalmente no modal
- Selecionar uma visita no campo "Vincular à visita (opcional)"
- Isso estabelece o relacionamento entre visita e orçamento

### Benefícios deste abordagem
- **Rastreabilidade**: Sempre sabemos de qual visita veio o orçamento
- **Flexibilidade**: Orçamento pode ser criado independente da visita
- **Consistência**: Evita duplicação de informações do cliente

---

## 7. Como implementamos as transições de status (respeitando RN04)

### Regra de Negócio RN04
**"Orçamento só pode ir para EXECUTADO depois de APROVADO"**

Esta regra controla o fluxo de trabalho do orçamento:

#### Fluxo de status permitido
```
rascunho → aprovado → executado
       ↘       ↘
        cancelado (a qualquer momento)
```

#### Controle na interface
Nos modais e ações, restringimos as transições com base no status atual:

**No BudgetModal:**
- O dropdown de status só mostra opções válidas baseado no status atual
- Exemplo: Se está em "rascunho", só mostra "aprovado" e "cancelado"

**Na página de Orçamentos:**
- Botão "Aprovar": Só aparece se status for "rascunho"
- Botão "Executar": Só aparece se status for "aprovado"
- Botão "Cancelar": Aparece em todos os status (com comportamentos diferentes)

#### Implementação técnica
##### Aprovar orçamento
```typescript
const handleApproveBudget = async (budget: Budget) => {
  if (window.confirm('Tem certeza que deseja aprovar este orçamento?')) {
    try {
      const updatedBudget = { ...budget, status: 'aprovado' as const };
      budgetRepository.update(budget.id, updatedBudget);
      loadData();
    } catch (err) {
      setError('Erro ao aprovar orçamento');
      console.error(err);
    }
  }
};
```

##### Executar orçamento (com validação de estoque e baixa)
```typescript
const handleExecuteBudget = async (budget: Budget) => {
  if (window.confirm('Tem certeza que deseja executar este orçamento?')) {
    try {
      // VALIDAÇÃO DE ESTOQUE (RN03): Não executar se não tiver estoque suficiente
      for (const item of budget.items) {
        const product = productRepository.findById(item.productId);
        if (!product || product.estoque < item.quantity) {
          setError(`Estoque insuficiente para o produto ${product?.nome || item.productName}. 
                    Disponível: ${product?.estoque || 0}, necessário: ${item.quantity}`);
          return;
        }
      }
      
      // BAIXA DE ESTOQUE: Debitar os produtos do estoque
      for (const item of budget.items) {
        productRepository.updateEstoque(item.productId, -item.quantity);
      }
      
      const updatedBudget = { ...budget, status: 'executado' as const };
      budgetRepository.update(budget.id, updatedBudget);
      loadData();
      setError(null);
    } catch (err) {
      setError('Erro ao executar orçamento');
      console.error(err);
    }
  }
};
```

##### Cancelar orçamento (com estorno se necessário)
```typescript
const handleCancelBudget = async (budget: Budget) => {
  if (window.confirm('Tem certeza que deseja cancelar este orçamento?')) {
    try {
      // SE JÁ EXECUTADO: ESTORNO DE ESTOQUE
      if (budget.status === 'executado') {
        for (const item of budget.items) {
          productRepository.updateEstoque(item.productId, item.quantity);
        }
      }
      
      const updatedBudget = { ...budget, status: 'cancelado' as const };
      budgetRepository.update(budget.id, updatedBudget);
      loadData();
    } catch (err) {
      setError('Erro ao cancelar orçamento');
      console.error(err);
    }
  }
};
```

---

## 8. Como realizamos build, lint e testes

### Build bem-sucedido
Executamos `npm run build` que:
1. Compila todo o TypeScript para JavaScript usando o tsc
2. Otimiza e empacota tudo usando o Vite
3. Gera os arquivos finais na pasta `dist/`

O build foi concluído com sucesso.

### Linting
Executamos `npm run lint` para verificar:
- Se o código segue padrões de estilo consistentes
- Se há erros comuns de programação
- Se há variáveis não usadas ou outros problemas

### Testes manuais
Verificamos funcionalidade através de:
1. **Acesso às abas**: Confirmamos que conseguimos navegar entre Visitas e Orçamentos
2. **Listagem de visitas**: Todas as visitas exibidas corretamente com status colorido
3. **Listagem de orçamentos**: Todos os orçamentos exibidos corretamente com status colorido
4. **Nova visita (ADMIN)**: Modal abre, campos funcionam, visita salva
5. **Editar visita**: Dados pré-carregados, alterações salvas
6. **Cancelar visita**: Apenas para status "agendada"
7. **Excluir visita**: Remove visita do sistema
8. **Novo orçamento (ADMIN)**: Modal com seleção de cliente, produtos, etc.
9. **Adicionar/remover itens**: Funciona corretamente com cálculo de total
10. **Aprovar orçamento**: Muda status de rascunho para aprovado
11. **Executar orçamento**: 
    - Valida estoque disponível (RN03)
    - Baixa estoque dos produtos
    - Muda status de aprovado para executado
12. **Cancelar orçamento**:
    - Se rascunho/aprovado: apenas muda status
    - Se executado: estorna estoque antes de cancelar
13. **Excluir orçamento**: Remove orçamento do sistema
14. **Vinculação visita-orçamento**: Campo opcional para relacionar os dois
15. **Persistência**: Dados permanecem após recarregar a página
16. **RN04 respeitada**: Não é possível pular de "rascunho" para "executado" diretamente
17. **RN03 respeitada**: Não é possível executar orçamento com estoque insuficiente

---

## 9. Integração com outros módulos

### Com Clientes e Produtos
- **CustomerRepository**: Usado para obter lista de clientes nos modais
- **ProductRepository**: Usado para:
  - Obter lista de produtos disponíveis (estoque > 0)
  - Validar estoque durante execução de orçamento (RN03)
  - Aplicar baixa/estorno de estoque

### Com Pedidos
Indireto: Quando um orçamento é executado, pode ser convertido em pedido (a implementar em futuras etapas)

### Controle de acesso
- **Sidebar**: Já controla quais usuários veem o menu "Visitas e Orçamentos"
- **Página**: Usuários VENDEDOR podem apenas visualizar (nenhum botão de ação)
- **ADMIN**: Tem acesso completo a todas as funcionalidades (CRUD + transições de status)

---

## 10. Resumo do que foi realizado

Na Etapa 6, criamos um módulo completo de visitas e orçamentos para o sistema TechSell:

✅ **Tela com duas abas** (Visitas e Orçamentos) com navegação clara  
✅ **Schemas bem definidos** para visitas, orçamentos e itens de orçamento  
✅ **Repositórios especializados** com métodos de busca específicos  
✅ **Dados de seed** para testes e demonstração  
✅ **Modal de visita** com seleção de cliente, data, status e observações  
✅ **Modal de orçamento** completo com adição de produtos, controle de quantidade e cálculo de total  
✅ **Geração de orçamento a partir de visita** com vinculação opcional  
✅ **Transições de status controladas** respeitando RN04 (rascunho → aprovado → executado)  
✅ **Validação de estoque (RN03)** durante execução de orçamento  
✅ **Baixa de estoque** ao executar orçamento  
✅ **Estorno de estoque** ao cancelar orçamento já executado  
✅ **Controle de acesso baseado em perfis** (ADMIN vs VENDEDOR)  
✅ **Build e lint bem-sucedidos**  
✅ **Persistência de dados** com localStorage  

Este módulo fornece uma base completa para o gerenciamento do ciclo de vendas do TechSell, desde o primeiro contato com o cliente (visita) até a entrega do serviço (orçamento executado), passando pela aprovação comercial, sempre respeitando as regras de negócio e mantendo o estoque sempre atualizado.

---

## 11. Próximos passos

Na Etapa 7, vamos:
1. Implementar a tela de Prospecção (Leads) com kanban e arrastar e soltar
2. Criar colunas: Novo, Contatado, Convertido, Perdido
3. Implementar funcionalidade de arrastar e soltar entre colunas
4. Adicionar botão "Converter em cliente"
5. Criar schemas e repositórios para leads
6. Realizar build, lint e testes

Cada etapa constrói sobre a anterior, garantindo que temos um sistema robusto e bem estruturado no final.