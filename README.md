# TechSell - Sistema de Gestão para Marmorarias

## Visão Geral

O TechSell é um sistema web de gestão completo desenvolvido especificamente para marmorarias (empresas que trabalham com mármore e granito). O sistema permite controlar todo o ciclo de negócio, desde a prospecção de clientes até o pós-venda, incluindo gestão de estoque, financeiro e relatórios gerenciais.

## Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e servidor de desenvolvimento rápido
- **Tailwind CSS** - Framework CSS utilitário para styling
- **Headless UI** - Componentes totalmente acessíveis
- **Lucide Icons** - Conjunto de ícones SVG modernos
- **Zod** - Validação de esquemas TypeScript
- **React Hook Form** - Gerenciamento de formulários performático
- **LocalStorage** - Persistência de dados no navegador (para demonstração)

## Funcionalidades Principais

### ✅ Etapa 1: Projeto, Tema, Layout, Login e Rotas Protegidas
- Inicialização do projeto com Vite, React e TypeScript
- Tema visual profissional com tons de azul-marinho escuro
- Layout responsivo com sidebar e header
- Sistema de login com autenticação simulada
- Rotas protegidas que exigem autenticação

### ✅ Etapa 2: Repositórios e Seed
- Camada de repositório com interface genérica para CRUD
- Implementação usando localStorage com prefixo "techsell:" para evitar conflitos
- Mecanismo de seed para popular dados iniciais
- Funcionalidade de restaurar dados de exemplo (exclusivo para ADMIN)
- Tratamento robusto de erros de localStorage

### ✅ Etapa 3: Produtos e Estoque
- Tela de listagem de produtos com busca e filtros por categoria
- Modais de cadastro/edição de produtos (exclusivo para ADMIN)
- Modo consulta apenas para vendedores
- Badges de estoque visual (Normal/Baixo/Zerado)
- Validação de estoque em tempo real

### ✅ Etapa 4: Clientes
- Tela de listagem de clientes com busca avançada (nome, email, CPF/CNPJ)
- Filtros por tipo de pessoa (Física/Jurídica)
- Modals de cadastro/edição de clientes (exclusivo para ADMIN)
- Modal de detalhes do cliente com abas de informações e histórico de pedidos
- Validação de CPF/CNPJ e email únicos para evitar duplicatas

### ✅ Etapa 5: Pedidos
- Tela de listagem de pedidos com status visual
- Fluxo completo de novo pedido com:
  - Seleção de cliente
  - Busca de produtos com validação de estoque em tempo real
  - Adição/remoção de itens com controle de quantidade
- Validação de estoque (RN03): Não permitir vender mais do que tem disponível
- Baixa automática de estoque ao confirmar pedido
- Estorno automático de estoque ao cancelar pedido confirmado
- Fluxo de status: Rascunho → Confirmado → Cancelado

### ✅ Etapa 6: Visitas e Orçamentos
- Tela com duas abas: Visitas e Orçamentos
- Geração de orçamento a partir de visita
- Transições de status respeitando RN04: Orçamento só pode ir para EXECUTADO depois de APROVADO
- Validação de estoque durante execução de orçamento (RN03)
- Baixa de estoque ao executar orçamento
- Estorno de estoque ao cancelar orçamento executado

### ✅ Etapa 7: Prospecção (Leads)
- Tela Kanban com quatro colunas: Novo, Contatado, Convertido, Perdido
- Funcionalidade de arrastar e soltar para mover leads entre colunas
- Botão "Converter em cliente" para leads na coluna Convertido
- Visualização detalhada de leads com informações de contato e valor potencial

### ✅ Etapa 8: Metas, Desempenho e Custos
- Visão diferenciada entre Administradores e Vendedores
- **Para Administradores**:
  - Definição de metas por vendedor e mês
  - Tabela comparativa de desempenho de todos os vendedores
  - Gerenciamento completo de custos (fixos vs variáveis)
- **Para Vendedores**:
  - Visualização apenas de próprias metas e desempenho
  - Barra de progresso visual de atingimento de meta
- Cálculos automáticos de totais, percentuais e margens

### ✅ Etapa 9: Dashboards e Relatórios
- Dashboard do Administrador com cards de métricas e gráficos informativos
- Dashboard do Vendedor com dados pessoais e barra de progresso
- Relatórios administrativos com:
  - Quatro tipos: vendas, produtos, clientes, visitas/orçamentos
  - Filtros de período personalizáveis
  - Pré-visualização antes da exportação
  - Exportação para PDF e Excel (funcionalidade simulada)

### ✅ Etapa 10: Responsividade e Revisão Final
- Menu inferior para mobile como alternativa ao menu hamburger
- Layouts responsivos que se adaptam a todos os tamanhos de tela
- Acessibilidade aprimorada com labels ARIA, navegação por teclado e contraste adequado
- Atualização completa deste README com instruções e credenciais

## Regras de Negócio Críticas

- **RN03**: Não permitir vender quantidade maior que estoque disponível
- **RN04**: Orçamento só pode ir para EXECUTADO depois de APROVADO
- **RN05**: Apenas Administrador cadastra custos, define metas e exclui registros

## Como Instalar e Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm (geralmente vem com o Node.js)
- Git (para clonar o repositório)

### Passo a Passo

1. **Clonar o repositório** (se aplicável):
   ```bash
   git clone <URL-do-repositorio>
   cd techsell
   ```

2. **Instalar as dependências**:
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Abrir no navegador**:
   O sistema estará disponível em: http://localhost:5173

### Credenciais de Acesso

Use um dos usuários de teste abaixo para fazer login:

#### Administrador (acesso total ao sistema)
- **Login**: admin
- **Senha**: admin123
- **Perfil**: ADMIN
- **Acesso**: Todas as funcionalidades incluindo administração de usuários, metas, custos e relatórios

#### Vendedores (acesso limitado às próprias informações)
- **Login**: ricardo
- **Senha**: 123456
- **Perfil**: VENDEDOR
- **Acesso**: Visualização apenas de próprias metas e desempenho

- **Login**: fernanda
- **Senha**: 123456
- **Perfil**: VENDEDOR

- **Login**: paulo
- **Senha**: 123456
- **Perfil**: VENDEDOR

Todos os usuários têm o status "ativo" por padrão.

## Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── layout/           # Componentes de layout (Sidebar, Header, etc.)
│   └── ui/               # Componentes específicos de páginas
├── pages/                # Páginas da aplicação
├── routes/               # Configuração de rotas
├── store/                # Estado global (Zustand)
├── repositories/         # Camada de repositório (localStorage)
├── services/             # Lógica de negócio
├── schemas/              # Validação Zod e interfaces TypeScript
├── types/                # Tipos TypeScript adicionais
├── utils/                # Funções utilitárias
└── seed/                 # Dados de exemplo para inicialização
```

## Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/nova-feature`
3. Faça suas alterações e commit: `git commit -m "Adiciona nova feature"`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob os termos da [LICENSE](LICENSE).

---

## Suporte

Se você tiver alguma dúvida ou encontrar problemas, por favor:
1. Verifique este README primeiro
2. Procure por soluções em documentação técnica específica
3. Para problemas relacionados ao uso do sistema, consulte as credenciais de acesso acima
4. Para problemas técnicos, verifique o console do navegador para mensagens de erro

Boa utilização do TechSell! 🚀