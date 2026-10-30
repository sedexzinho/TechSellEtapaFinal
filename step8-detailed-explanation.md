# Etapa 8: Explicação Detalhada do que foi Feito

Este documento explica de forma simples e detalhada tudo que foi feito na oitava etapa do projeto TechSell, como se estivesse explicando para alguém que nunca programou antes.

## O que é o Módulo de Metas, Desempenho e Custos?

O módulo de metas, desempenho e custos é onde gerenciamos o aspecto financeiro e de desempenho do negócio. Funciona como o "painel de controle" do negócio donde:

1. **Metas**: Definimos objetivos de vendas para cada vendedor e para o negócio como um todo
2. **Desempenho**: Acompanhamos quanto cada vendedor está atingindo de suas metas
3. **Custos**: Gerenciamos os gastos do negócio, separando entre fixos (que sempre acontecem) e variáveis (que dependem do volume de vendas)

Na Etapa 8, focamos em implementar um sistema completo para administrar essas três áreas, com visões diferentes para administradores e vendedores.

## O que foi feito na Etapa 8?

Na oitava etapa, implementamos o módulo completo de metas, desempenho e custos:
1. Schemas para metas e custos com todos os campos necessários
2. Repositórios especializados com métodos de busca e cálculo
3. Dados de seed (exemplos iniciais) para testes e demonstração
4. Tela com visões diferenciadas:
   - **Para Administradores**: Definição de metas, tabela comparativa de desempenho, gerenciamento completo de custos
   - **Para Vendedores**: Visualização apenas de suas próprias metas e desempenho
5. Funcionalidade de adição, edição e exclusão de metas e custos (apenas para ADMIN)
6. Cálculos automáticos de totais, percentuais de desempenho e margens de lucro
7. Build, lint e testes para garantir que tudo funciona corretamente

Vamos explicar cada parte em detalhes:

---

## 1. Como criamos os schemas para metas e custos

### `src/schemas/goalSchema.ts`

Definimos a interface para metas:

#### Goal (Meta)
```typescript
export interface Goal {
  id: number;
  userId: number;
  userName: string;
  month: number; // 1-12
  year: number;
  targetValue: number; // Meta de faturamento
  achievedValue: number; // Valor realmente atingido
}
```

### `src/schemas/costSchema.ts`

Definimos a interface para custos:

#### Cost (Custo)
```typescript
export interface Cost {
  id: number;
  description: string;
  amount: number;
  type: 'fixo' | 'variavel'; // fixo = mensal, variavel = depende do volume
  month: number; // 1-12
  year: number;
  isRecurring: boolean; // Se o custo se repete todo mês
}
```

### Explicação dos campos das metas
- **id**: Identificador único da meta
- **userId**: ID do usuário (vendedor) ao qual a meta se aplica
- **userName**: Nome do usuário (para exibição)
- **month**: Mês da meta (1 = Janeiro, 12 = Dezembro)
- **year**: Ano da meta
- **targetValue**: Valor que o vendedor deve atingir (meta)
- **achievedValue**: Valor que o vendedor realmente atingiu até agora

### Explicação dos campos dos custos
- **id**: Identificador único do custo
- **description**: Descrição do que o custo representa
- **amount**: Valor do custo em reais
- **type**: 
  - 'fixo': Custos que acontecem todo mês independentemente das vendas (aluguel, salários)
  - 'variavel': Custos que variam com o volume de vendas (comissões, materiais)
- **month**: Mês ao qual o custo se aplica
- **year**: Ano ao qual o custo se aplica
- **isRecurring**: Se o custo se repete todo mês (útil para planejamento futuro)

---

## 2. Como implementamos os repositórios para metas e custos

### `src/repositories/goalRepository.ts` e `src/repositories/costRepository.ts`

Estendemos o `LocalStorageRepository` genérico (da Etapa 2) e adicionamos métodos específicos:

#### Métodos do GoalRepository
- `findByUserId(userId: number)`: Busca metas de um usuário específico
- `findByMonthYear(month: number, year: number)`: Busca metas de um determinado mês/ano
- `getPerformancePercentage()`: Calcula o percentual geral de desempenho (atingido/meta)

#### Métodos do CostRepository
- `findByMonthYear(month: number, year: number)`: Busca custos de um determinado mês/ano
- `getTotalCosts(month: number, year: number)`: Soma todos os custos do mês/ano
- `getFixedCosts(month: number, year: number)`: Soma apenas os custos fixos
- `getVariableCosts(month: number, year: number)`: Soma apenas os custos variáveis

### Reuso do LocalStorageRepository (reuso)
Assim como fizemos para outros módulos, reutilizamos a estrutura genérica:
- **Operações básicas**: findById, findAll, create, update, delete, count
- **Métodos específicos**: Implementados conforme necessário para cada tipo de dado

### Métodos de cálculo importantes
#### Performance Geral (GoalRepository)
```typescript
getPerformancePercentage(): number {
  const goals = this.findAll();
  if (goals.length === 0) return 0;
  
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetValue, 0);
  const totalAchieved = goals.reduce((sum, goal) => sum + goal.achievedValue, 0);
  
  return totalTarget === 0 ? 0 : (totalAchieved / totalTarget) * 100;
}
```

#### Custos por Tipo (CostRepository)
```typescript
getFixedCosts(month: number, year: number): number {
  const costs = this.findByMonthYear(month, year);
  return costs.filter(cost => cost.type === 'fixo').reduce((sum, cost) => sum + cost.amount, 0);
}

getVariableCosts(month: number, year: number): number {
  const costs = this.findByMonthYear(month, year);
  return costs.filter(cost => cost.type === 'variavel').reduce((sum, cost) => sum + cost.amount, 0);
}
```

---

## 3. Como criamos os dados de seed (exemplos iniciais)

### `src/seed/goals.ts` e `src/seed/costs.ts`

Criamos dados de exemplo para testar o sistema:

#### Metas de exemplo
```typescript
export const goals: GoalSeed[] = [
  {
    id: 1,
    userId: 2, // Ricardo Silva (VENDEDOR)
    userName: 'Ricardo Silva',
    month: 10, // Outubro
    year: 2025,
    targetValue: 50000,
    achievedValue: 35000
  },
  {
    id: 2,
    userId: 3, // Fernanda Lima (VENDEDOR)
    userName: 'Fernanda Lima',
    month: 10, // Outubro
    year: 2025,
    targetValue: 45000,
    achievedValue: 42000
  },
  {
    id: 3,
    userId: 4, // Paulo Oliveira (VENDEDOR)
    userName: 'Paulo Oliveira',
    month: 10, // Outubro
    year: 2025,
    targetValue: 40000,
    achievedValue: 28000
  },
  {
    id: 4,
    userId: 1, // Carlos Mendes (ADMIN)
    userName: 'Carlos Mendes',
    month: 10, // Outubro
    year: 2025,
    targetValue: 100000,
    achievedValue: 85000
  }
];
```

### Custos de exemplo
```typescript
export const costs: CostSeed[] = [
  {
    id: 1,
    description: 'Aluguel do estabelecimento',
    amount: 3000,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 2,
    description: 'Conta de luz',
    amount: 450,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 3,
    description: 'Conta de água',
    amount: 120,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 4,
    description: 'Salários dos funcionários',
    amount: 18000,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 5,
    description: 'Comissão de vendas',
    amount: 7500,
    type: 'variavel',
    month: 10,
    year: 2025,
    isRecurring: false
  },
  {
    id: 6,
    description: 'Marketing e publicidade',
    amount: 2000,
    type: 'fixo',
    month: 10,
    year: 2025,
    isRecurring: true
  },
  {
    id: 7,
    description: 'Manutenção de equipamentos',
    amount: 1500,
    type: 'variavel',
    month: 10,
    year: 2025,
    isRecurring: false
  }
];
```

### Distribuição inicial
Com esses dados, o sistema começa com:
- **Metas**: 4 metas (3 vendedores + 1 admin)
- **Performance geral**: ~77% (200.000 atingido de 260.000 meta)
- **Custos totais**: R$ 26.070
  - Fixos: R$ 23.570 (aluguel, luz, água, salários, marketing)
  - Variáveis: R$ 2.500 (comissão, manutenção)

### Atualizando o SeedService
Atualizamos o `SeedService` para incluir os novos repositórios:
- Adicionamos `GoalRepository` e `CostRepository`
- Criamos métodos `seedGoals()` e `seedCosts()`
- Atualizamos `seedAll()` e `resetData()` para incluir os novos dados

---

## 4. Como implementamos a tela de Metas, Desempenho e Custos

### `src/pages/Metas.tsx`

Esta é a página principal com visões completamente diferentes para ADMIN e VENDEDOR.

#### Controle de acesso baseado em perfis
A página verifica `user?.perfil` e mostra conteúdo diferente:
- **ADMIN**: Acesso completo a todas as funcionalidades
- **VENDEDOR**: Acesso limitado apenas às próprias metas

#### Filtros de mês/ano
Ambas as vistas compartilham:
- Seletores de mês (janeiro a dezembro) e ano (2024-2026)
- Recarregam os dados quando alterados
- Começam com o mês/ano atual

---

### Visão do Administrador (ADMIN)

Quando um usuário com perfil "ADMIN" acessa a página, vê:

#### 1. Métricas gerais do negócio
Quatro cards com informações resumidas:
- **Meta Total**: Soma de todas as metas definidas
- **Atingido Total**: Soma de todos os valores realmente atingidos
- **Performance Geral**: Percentual de (Atingido / Meta) × 100
- **Lucro Estimado**: (Atingido Total - Custos Totais)

#### 2. Tabela de desempenho por vendedor
Tabela com uma linha para cada vendedor ativo:
- **Vendedor**: Nome do vendedor
- **Meta**: Meta de faturamento definida
- **Atingido**: Valor realmente atingido (cor verde se positivo, vermelho se negativo)
- **Performance**: Percentual de atingimento com badge colorido:
  - ≥90%: Verde (excelente)
  - ≥70%: Amarelo (bom)
  - <70%: Vermelho (precisa melhorar)
- **Ações**: Botões para editar e excluir metas (somente ADMIN)

#### 3. Gerenciamento de custos
Seção dividida em:
- **Métricas de custos**: Custos totais, fixos e variáveis
- **Lista de custos**: Todos os custos cadastrados com:
  - Descrição
  - Tipo (fixo/variável) e se é recorrente
  - Mês/ano de referência
  - Valor
  - Ações: Editar e Excluir (somente ADMIN)
- **Botão "Novo Custo"**: Abre modal para criar novo custo

#### 4. Modais de criação/edição
- **Meta**: Seleção de vendedor, mês, ano, meta, atingido
- **Custo**: Descrição, valor, tipo, mês, ano, recorrente

---

### Visão do Vendedor (VENDEDOR)

Quando um usuário com perfil "VENDEDOR" acessa a página, vê:

#### 1. Seu desempenho pessoal
Três cards com informações pessoais:
- **Sua Meta**: Meta definida para este vendedor
- **Seu Atingido**: Valor realmente atingido pelo vendedor
- **Sua Performance**: Percentual de (Seu Atingido / Sua Meta) × 100

#### 2. Barra de progresso visual
- Barra horizontal que mostra o percentual de atingimento
- Cor azul que preenche conforme o desempenho aumenta
- Texto mostrando "X de Y (Z%)" abaixo da barra

#### 3. Informação de restrição
Card informativo explicando que:
- O gerenciamento de custos está disponível apenas para administradores
- Como o usuário é vendedor, esta funcionalidade não está acessível

---

## 5. Como realizamos build, lint e testes

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
1. **Acesso à página**: Confirmamos que a página é acessível após login para ambos os perfis
2. **Filtros de mês/ano**: Alterar mês/ano recarrega os dados corretamente
3. **Visão ADMIN**:
   - Métricas gerais calculadas corretamente
   - Tabela de desempenho mostra todos os vendedores
   - Botões de editar/excluir metas funcionam
   - Métricas de custos calculadas corretamente
   - Lista de custos mostra todos os custos
   - Botões de editar/excluir custos funcionam
   - Modais de meta e custo abrem com campos pré-preenchidos quando editando
   - Modais validam campos obrigatórios
   - Novas metas e custos são salvos e aparecem na lista
4. **Visão VENDEDOR**:
   - Mostra apenas as metas do usuário logado
   - Barra de progresso reflete corretamente o percentual
   - Não exibe seção de custos
   - Mostra mensagem informativa sobre restrição de custos
5. **Persistência**: Alterações permanecem após recarregar a página
6. **Cálculos automáticos**:
   - Performance geral = (Σ atingido / Σ meta) × 100
   - Lucro = Total atingido - Total custos
   - Margem de lucro = (Lucro / Total atingido) × 100
   - Custos fixos vs variáveis separados corretamente
7. **Acesso por perfil**: VENDEDOR não pode ver ou interagir com funcionalidades admin exclusivas

---

## 6. Integração com outros módulos

### Com Usuários
- **UserRepository**: Usado para obter lista de vendedores nos modais de metas
- **Integração**: Metas estão vinculadas a usuários através do `userId`

### Com Vendas (Pedidos)
- **Indireto**: O `achievedValue` das metas deveria vir do somatório dos pedidos confirmados
- **Em desenvolvimento futuro**: Integrar com o módulo de pedidos para atualização automática do atingido

### Controle de acesso
- **Sidebar**: Já controla quais usuários veem o menu "Metas e Desempenho"
- **Página Metas**: Controle granular baseado no perfil do usuário logado
- **ADMIN**: Acesso total a criação, edição, exclusão e visualização
- **VENDEDOR**: Acesso apenas à visualização de próprio desempenho

---

## 7. Resumo do que foi realizado

Na Etapa 8, criamos um módulo completo de metas, desempenho e custos para o sistema TechSell:

✅ **Schemas bem definidos** para metas e custos com todos os campos necessários  
✅ **Repositórios especializados** com métodos de busca por usuário/mês/ano e cálculos específicos  
✅ **Dados de seed** para demonstração e testes iniciais  
✅ **Tela com visões diferenciadas** para ADMIN e VENDEDOR  
✅ **Visão Administrativa completa** com:
  - Métricas gerais do negócio (meta, atingido, performance, lucro)
  - Tabela de desempenho por vendedor com indicadores visuais
  - Gerenciamento completo de custos (fixos vs variáveis, recorrentes)
  - Modais de criação/edição de metas e custos
✅ **Visão do Vendedor limitada e focada** com:
  - Métricas pessoais de meta, atingido e performance
  - Barra de progresso visual de atingimento
  - Informação sobre restrição de acesso a custos
✅ **Funcionalidade de CRUD** para metas e custos (apenas para ADMIN)
✅ **Cálculos automáticos e precisos** de totais, percentuais e margens
✅ **Controle de acesso baseado em perfis** em todos os níveis
✅ **Build e lint bem-sucedidos**
✅ **Persistência de dados** com localStorage
✅ **Integração com SeedService** para carregamento automático de dados iniciais

Este módulo fornece uma base sólida para o controle financeiro e de desempenho do TechSell, permitindo que a administração planeje, monitore e controle todos os aspectos financeiros do negócio, enquanto os vendedores podem acompanhar seu próprio progresso em direção às metas estabelecidas.

---

## 8. Próximos passos

Na Etapa 9, vamos:
1. Implementar a tela de Dashboards e Relatórios
2. Criar dashboard do Administrador com cards e gráficos
3. Criar dashboard do Vendedor com dados pessoais
4. Implementar relatórios (Admin) com tipos, período, pré-visualização e exportação PDF/Excel
5. Criar componentes de gráficos utilizando a biblioteca recharts
6. Implementar funcionalidade de exportação usando jspdf e xlsx
7. Realizar build, lint e testes

Cada etapa constrói sobre a anterior, garantindo que temos um sistema robusto e bem estruturado no final.