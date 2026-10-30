# TechSell - Plano de Desenvolvimento Frontend

## Visão Geral
Este documento descreve o plano de desenvolvimento para o TechSell, um sistema web de gestão frontend-only utilizando React 18, TypeScript, Vite e outras tecnologias especificadas.

## Estrutura de Pastas Proposta
```
src/
├── components/           # Componentes reutilizáveis
├── pages/               # Páginas da aplicação
├── routes/              # Configuração de rotas
├── store/               # Estado global (Zustand)
├── repositories/        # Camada de repositório (localStorage)
├── services/            # Lógica de negócio
├── schemas/             # Validação Zod
├── types/               # Tipos TypeScript
├── utils/               # Funções utilitárias
└── seed/                # Dados de exemplo
```

## Dependências Necessárias
- react@18
- react-dom@18
- typescript@^5.0.0
- vite@^4.0.0
- tailwindcss@^3.0.0
- postcss
- autoprefixer
- react-router-dom@^6.0.0
- zustand
- recharts
- jspdf
- jspdf-autotable
- xlsx
- zod
- react-hook-form
- lucide-react
- vitest (para testes)

## Abordagem de Desenvolvimento em Etapas

### Etapa 1: Projeto, Tema, Layout, Login e Rotas Protegidas
- [ ] Inicializar projeto Vite com React e TypeScript
- [ ] Configurar Tailwind CSS com tema escuro azul-marinho
- [ ] Criar layout básico com barra lateral e cabeçalho
- [ ] Implementar página de login
- [ ] Configurar rotas protegidas por perfil (ADMIN/VENDEDOR)
- [ ] Criar serviço de autenticação simulada
- [ ] Build, lint e testes

### Etapa 2: Repositórios e Seed
- [ ] Criar camada de repositório com interface por entidade
- [ ] Implementar repositórios usando localStorage com prefixo "techsell:"
- [ ] Criar mecanismo de seed para popular dados iniciais
- [ ] Implementar botão "Restaurar dados de exemplo" nas configurações do Administrador
- [ ] Tratamento de erros de localStorage
- [ ] Build, lint e testes

### Etapa 3: Produtos e Estoque
- [ ] Implementar tela de listagem de produtos com filtro e busca
- [ ] Criar modal de cadastro/edição (apenas para ADMIN)
- [ ] Para VENDEDOR: modo consulta apenas
- [ ] Implementar badges de estoque (Normal, Baixo, Zerado)
- [ ] Build, lint e testes

### Etapa 4: Clientes
- [ ] Implementar tela de listagem de clientes
- [ ] Criar formulário de cadastro/edição
- [ ] Implementar detalhe do cliente com aba "Histórico de pedidos"
- [ ] Validação de CPF/CNPJ único
- [ ] Build, lint e testes

### Etapa 5: Pedidos
- [ ] Implementar tela de listagem de pedidos
- [ ] Criar fluxo de novo pedido (seleção de cliente, busca de produtos)
- [ ] Implementar validação de estoque (RN03)
- [ ] Baixa de estoque ao confirmar pedido
- [ ] Estorno de estoque ao cancelar pedido confirmado
- [ ] Build, lint e testes

### Etapa 6: Visitas e Orçamentos
- [ ] Implementar tela com duas abas (Visitas e Orçamentos)
- [ ] Gerar orçamento a partir de visita
- [ ] Implementar transições de status respeitando RN04
- [ ] Build, lint e testes

### Etapa 7: Prospecção (Leads)
- [ ] Implementar kanban com arrastar e soltar
- [ ] Status: Novo, Contatado, Convertido, Perdido
- [ ] Botão "Converter em cliente"
- [ ] Build, lint e testes

### Etapa 8: Metas, Desempenho e Custos
- [ ] Admin: definir metas por vendedor e mês
- [ ] Admin: tabela comparativa de desempenho
- [ ] Vendedor: ver apenas próprio desempenho
- [ ] Admin: gerenciamento de custos (fixos/variáveis)
- [ ] Build, lint e testes

### Etapa 9: Dashboards e Relatórios
- [ ] Dashboard do Administrador com cards e gráficos
- [ ] Dashboard do Vendedor com dados pessoais
- [ ] Relatórios (Admin): tipos, período, pré-visualização, exportação PDF/Excel
- [ ] Build, lint e testes

### Etapa 10: Ajustes de Responsividade e Revisão Final
- [ ] Implementar menu inferior para mobile
- [ ] Ajustar layout para diferentes tamanhos de tela
- [ ] Revisão final de usabilidade e acessibilidade
- [ ] Build, lint e testes
- [ ] Atualizar README com instruções e credenciais

## Regras de Negócio Críticas para Testes
- RN03: Não permitir vender quantidade maior que estoque disponível
- RN04: Orçamento só pode ir para EXECUTADO depois de APROVADO
- RN05: Apenas Administrador cadastra custos, define metas e exclui registros
- Baixa/estorno de estoque em pedidos
- Cálculo de desempenho do vendedor

## Próximos Passos
1. Revisar e aprovar este plano
2. Inicializar o projeto na Etapa 1