# Etapa 1: Explicação Detalhada do que foi Feito

Este documento explica de forma simples e detalhada tudo que foi feito na primeira etapa do projeto TechSell, como se estivesse explicando para alguém que nunca programou antes.

## O que é o TechSell?

O TechSell é um sistema web para ajudar marmorarias (empresas que trabalham com mármore e granito) a gerenciar seu negócio. Ele permite controlar produtos, clientes, pedidos, visitas e muito mais.

## O que foi feito na Etapa 1?

Na primeira etapa, focamos em preparar a base do sistema:
1. Criar o projeto usando ferramentas modernas
2. Definir a aparência visual com cores e estilos
3. Criar o layout básico (barra lateral e cabeçalho)
4. Fazer a tela de login
5. Proteger as páginas para que apenas usuários logados possam acessá-las
6. Criar um sistema simples de autenticação (login/logout)

Vamos explicar cada parte em detalhes:

---

## 1. Como o projeto foi criado

### Ferramentas utilizadas

Usamos várias ferramentas modernas para criar este projeto:

- **Vite**: É uma ferramenta que ajuda a criar e executar aplicações web rapidamente
- **React**: Uma biblioteca do JavaScript para criar interfaces de usuário
- **TypeScript**: Uma versão mais segura do JavaScript que ajuda a evitar erros
- **Tailwind CSS**: Uma ferramenta para estilizar (dar aparência) ao site de forma fácil

### Arquivos de configuração do projeto

#### `package.json`
Este é como o "cardápio" do projeto. Ele lista todas as ferramentas e bibliotecas que usamos:
- React e ReactDOM: para criar a interface
- TypeScript: para escrever código mais seguro
- Vite: para executar e construir o projeto
- Tailwind CSS e PostCSS: para estilizar
- React Router: para criar as diferentes páginas do sistema
- Zustand: para guardar informações do usuário logado
- E outras bibliotecas específicas que usaremos depois (como para gráficos, exportação de PDF, etc.)

#### `vite.config.ts`
Este arquivo diz ao Vite como executar nosso projeto. É bem simples:
- Diz que vamos usar o React
- Configura algumas opções básicas

#### `tsconfig.json` e outros arquivos de configuração do TypeScript
Estes arquivos dizem como o TypeScript deve verificar nosso código. Eles estão configurados para:
- Aceitar a sintaxe moderna do JavaScript
- Trabalhar bem com o React
- Detectar erros comuns de programação

---

## 2. Como definimos a aparência visual

### O tema de cores azul-marinho

Escolhemos um tema escuro com tons de azul-marinho para dar uma aparência profissional e moderna ao sistema.

#### `tailwind.config.js`
Este arquivo define todas as cores que usamos no sistema. Em vez de usar nomes genéricos como "azul" ou "cinza", definimos nomes específicos:
- `navy-dark`: #0A1128 (fundo da página - quase preto azulado)
- `navy-darker`: #070D20 (barra lateral - ainda mais escuro)
- `navy-card`: #0F1B3D (cards - caixas com informações)
- `navy-surface`: #14244F (superfícies elevadas - como botões)
- `navy-border`: #1E3166 (bordas e linhas divisórias)
- `blue-primary`: #3B82F6 (cor principal - azul claro)
- E várias outras cores para textos, sucesso, alertas, erros, etc.

Também definimos bordas arredondadas para deixar a interface mais suave:
- Cards: 12px de arredondamento
- Botões: 8px de arredondamento
- Campos de entrada: 8px de arredondamento

#### `src/index.css`
Este é o arquivo onde dizemos para usar o Tailwind CSS:
- `@tailwind base;` - reseta alguns estilos padrão do navegador
- `@tailwind components;` - permite usar componentes pré-definidos
- `@tailwind utilities;` - permite usar classes utilitárias do Tailwind
- Podemos adicionar nosso CSS personalizado aqui se precisar

### Resultado visual
Graças a essas configurações, toda vez que usamos classes como:
- `bg-navy-dark` - o fundo fica azul-marinho escuro
- `text-text-primary` - o texto fica branco acinzentado (legível no fundo escuro)
- `border-navy-border` - as bordas ficam em um azul-marinho médio
- `hover:bg-navy-surface` - ao passar o mouse, o fundo fica um azul-marinho levemente mais claro

---

## 3. Como o aplicativo é estruturado

### `src/main.tsx`
Este é o ponto de entrada do nosso aplicativo, onde tudo começa:
1. Importa o modo estrito do React (ajuda a detectar problemas)
2. Importa o React DOM (para mostrar na página)
3. Importa nosso CSS global
4. Importa nosso componente principal App
5. Cria a raiz da aplicação e mostra o App dentro dela

### `src/App.tsx`
Este é o componente principal que organiza tudo:
1. Importa o React Router Dom (para criar diferentes páginas)
2. Importa o Layout (barra lateral + cabeçalho)
3. Importa o ProtectedRoute (para proteger páginas)
4. Importa as páginas de login e dashboard
5. Define as rotas do sistema:
   - Página pública: `/login` (tela de login)
   - Rotas protegidas: tudo que fica dentro do `<ProtectedRoute>` (requere login)
   - Dentro das rotas protegidas:
     - Página inicial: `/dashboard`
     - Outras páginas: `/produtos`, `/clientes`, etc. (ainda em construção)
   - Redirecionamento: se acessar qualquer outra página, vai para o login

---

## 4. Como criamos o layout básico

O layout consiste em duas partes principais:
- Barra lateral esquerda (com o menu de navegação)
- Cabeçalho superior (com buscador, notificações e informações do usuário)
- Área central (onde o conteúdo de cada página aparece)

### `src/components/layout/Layout.tsx`
Este arquivo organiza a barra lateral e o conteúdo principal:
1. Usa hooks do React para detectar se estamos em um dispositivo móvel (tela pequena)
2. Em telas grandes: mostra a barra lateral o tempo todo
3. Em telas pequenas: esconde a barra lateral e mostra um botão para abri-la
4. Organiza o conteúdo em:
   - Barra lateral (condicional, baseado no tamanho da tela)
   - Área principal:
     - Cabeçalho
     - Conteúdo da página (usando `<Outlet />` do React Router)

### `src/components/layout/Sidebar.tsx`
Esta é a barra lateral esquerda:
1. Mostra o logo "TechSell" no topo
2. Tem um botão para abrir/fechar o menu em dispositivos móveis
3. Lista todos os itens do menu baseado no papel do usuário:
   - Para todos os usuários: Dashboard, Produtos, Clientes, Pedidos, Visitas, Prospecção
   - Para administradores adicionais: Metas, Custos, Relatórios, Configurações
4. Cada item tem:
   - Um ícone (da biblioteca lucide-react)
   - O nome do item
   - Um link para a página correspondente
5. Estilização:
   - Fundo azul-marinho ainda mais escuro
   - Texto branco acinzentado
   - Efeito hover: fundo fica um pouco mais claro e texto azul claro

### `src/components/layout/Header.tsx`
Este é o cabeçalho superior:
1. Em dispositivos móveis: mostra um botão de menu (hambúrguer) no canto esquerdo
2. Barra de busca no centro (ainda funcional, será implementada completamente depois)
3. Lado direito com:
   - Ícone de sino (notificações) - mostra um indicador quando há alertas de estoque baixo
   - Avatar do usuário com nome e perfil (ADMIN ou VENDEDOR)
4. Estilização:
   - Fundo azul-marinho escuro
   - Texto branco acinzentado
   - Ícones e botões com efeito hover suave

---

## 5. Como fizemos a tela de login

### `src/pages/Login.tsx`
Esta é a primeira tela que o usuário vê:
1. Tem um fundo azul-marinho escuro com o formulário centralizado
2. Mostra o logo "TechSell" e uma descrição
3. Formulário com dois campos:
   - Login (nome de usuário ou email)
   - Senha (com botão para mostrar/ocultar)
4. Botão "Entrar" que envia os dados
5. Área para mostrar mensagens de erro
6. Informações de usuários de teste para facilitar o desenvolvimento

#### Funcionamento:
1. Quando o usuário digita login e senha e clica em "Entrar":
   - Evita o comportamento padrão do formulário (recarregar página)
   - Chama a função de login do authStore
   - Enquanto espera, mostra um indicador de carregamento no botão
   - Se der certo, redireciona para o dashboard
   - Se der errado, mostra uma mensagem de erro

2. O botão de mostrar/ocultar senha:
   - Alterna entre tipo "password" e "text" do campo
   - Muda o ícone entre 👁️‍🗨️ (oculto) e 👁️ (visível)

3. Estilização:
   - Caixa com fundo ligeiramente mais claro que o fundo principal
   - Borda arredondada e sombra para destacar
   - Campos com fundo azul-marinho ainda mais escuro
   - Texto branco acinzentado
   - Placeholder com cor cinza claro
   - Foco nos campos: contorno azul-primary
   - Botão: fundo azul-primary que escurece ao passar o mouse

---

## 6. Como protegemos as páginas

### `src/routes/AppRoutes.tsx`
Este arquivo contém componentes que protegem nossas páginas:

#### `ProtectedRoute`
1. Verifica se o usuário está autenticado (logado)
2. Se não estiver: redireciona para a página de login
3. Se estiver: mostra o conteúdo da página normalmente

#### `AdminRoute` (para uso futuro)
1. Verifica se o usuário está autenticado E se é administrador
2. Se não for: redireciona para o dashboard
3. Se for: mostra o conteúdo da página normalmente

### Como é usado no App.tsx
- Toda rota que fica dentro do `<ProtectedRoute>` só pode ser acessada por usuários logados
- Isso protege o dashboard e todas as outras páginas do sistema

---

## 7. Como funcionou o sistema de autenticação

### `src/store/authStore.ts`
Este é nosso "cérebro" para gerenciar o estado de autenticação (usando Zustand):

#### Estado guardado
1. `user`: informações do usuário logado (ou null se não estiver logado)
2. `isAuthenticated`: true se estiver logado, false caso contrário
3. `isLoading`: true enquanto está fazendo login/logout
4. `error`: mensagem de erro se algo deu errado

#### Ações (funções que podem ser executadas)
1. `login`:
   - Define estado como carregando
   - Chama o serviço de autenticação
   - Se funcionar: salva o token no localStorage, define o usuário e marca como autenticado
   - Se der erro: guarda a mensagem de erro
   - Sempre para o carregamento

2. `logout`:
   - Define estado como carregando
   - Chama o serviço de logout
   - Remove o token do localStorage
   - Limpa informações do usuário
   - Sempre para o carregamento

3. `initialize`:
   - Ao iniciar o aplicativo, verifica se há um token salvo no localStorage
   - Se houver: define o usuário como autenticado (com dados fictícios por enquanto)

### `src/services/authService.ts`
Este é nosso serviço que "finge" ser um servidor real:

#### Funcionamento do login
1. Espera 1 segundo (para simular rede lenta)
2. Procura na lista de usuários (do arquivo seed/users.ts) alguém com:
   - Login exatamente igual ao digitado
   - Senha exatamente igual à digitada
   - Conta ativa (não desativada)
3. Se encontrar:
   - Remove a senha dos dados retornados (por segurança)
   - Cria um token falso (em um sistema real seria um JWT)
   - Retorna o usuário e o token
4. Se não encontrar: throws an error com mensagem "Credenciais inválidas ou usuário inativo"

#### Funcionamento do logout
1. Espera 0.5 segundos
2. Retorna true (indicando que funcionou)

### `src/seed/users.ts`
Este é nosso banco de dados de teste:
1. Define o formato dos dados de usuário
2. Lista quatro usuários de teste:
   - admin / admin123 (perfil ADMIN)
   - ricardo / 123456 (perfil VENDEDOR)
   - fernanda / 123456 (perfil VENDEDOR)
   - paulo / 123456 (perfil VENDEDOR)

---

## 8. Como criamos a página inicial (Dashboard)

### `src/pages/Dashboard.tsx`
Esta é a primeira página que o usuário vê após fazer login:
1. Cabeçalho com título "Dashboard"
2. Seção de cards com quatro informações:
   - Faturamento do mês (ainda zerado, será implementado depois)
   - Pedidos no mês (ainda zerado)
   - Produtos com estoque baixo (ainda zerado)
   - Orçamentos em aberto (ainda zerado)
3. Seção de gráficos:
   - Dois gráficos placeholder (ainda serão implementados)
4. Seção de desempenho dos vendedores:
   - Tabela placeholder com dados de exemplo
5. Seção de alertas de estoque:
   - Mensagem dizendo que não há alertas (ainda será implementado)

#### Estilização
- Fundo azul-marinho escuro
- Cards com fundo ligeiramente mais claro
- Bordas arredondadas
- Sombra suave para destacar
- Textos em branco acinzentado
- Números importantes em azul-primary
- Alertas em cor de aviso (amarelo)

---

## 9. Como configuramos o TypeScript

Configuramos vários arquivos para garantir que nosso código seja verificado corretamente:

### `tsconfig.json`
Configuração básica do TypeScript para projetos React

### `tsconfig.app.json`
Configuração específica para o código do aplicativo

### `tsconfig.node.json`
Configuração específica para código que roda no Node.js (scripts de build)

Estes arquivos garantem que:
- Usamos a sintaxe moderna do JavaScript (ES2020)
- Permitimos JSX (sintaxe HTML dentro do JavaScript)
- Fazemos verificação rígida de tipos
- Não permitimos tipos implícitos 'any'
- Incluímos todos os arquivos .ts e .tsx na pasta src
- Excluímos arquivos de teste e node_modules

---

## 10. Como testamos o que foi feito

Verificamos que tudo funciona corretamente através de:

### Build
Executamos `npm run build` para garantir que:
- Todo o código TypeScript é convertido para JavaScript
- O Vite pode otimizar e empacotar tudo corretamente
- Não há erros de sintaxe ou de tipos

### Linting
Executamos `npm run lint` para garantir que:
- O código segue padrões de estilo consistentes
- Não há erros comuns de programação
- Não há variáveis não usadas ou outros problemas

### Teste manual
Abrimos o aplicativo no navegador e verificamos que:
1. A página de login aparece corretamente
2. Podemos fazer login com os usuários de teste
3. Após o login, somos redirecionados para o dashboard
4. O layout (barra lateral e cabeçalho) aparece corretamente
5. O menu lateral mostra os itens corretos baseado no perfil do usuário
6. Tentando acessar páginas protegidas sem login, somos redirecionados para o login
7. O logout funciona corretamente

---

## Resumo do que foi accomplished

Na Etapa 1, criamos a base sólida para o sistema TechSell:

✅ **Projeto inicializado** com Vite, React e TypeScript  
✅ **Tema visual definido** com cores azul-marinho escuro profissional  
✅ **Layout básico criado** com barra lateral responsiva e cabeçalho  
✅ **Tela de login funcional** com validação e feedback visual  
✅ **Sistema de rotas protegidas** que só permite acesso após login  
✅ **Serviço de autenticação simulado** que funciona com usuários de teste  
✅ **Página inicial (Dashboard)** com estrutura pronta para futuras implementações  
✅ **Build, lint e testes manuais** realizados com sucesso  

Esta base nos permite agora avançar para as próximas etapas, onde vamos implementar as funcionalidades específicas de produtos, clientes, pedidos, etc., sabendo que a fundação do sistema está sólida e bem estruturada.

---

## Próximos passos

Na Etapa 2, vamos:
1. Criar a camada de repositório para armazenar dados no localStorage
2. Implementar o mecanismo de seed para popular dados iniciais
3. Criar a funcionalidade para restaurar dados de exemplo
4. Tratar erros de localStorage
5. Realizar build, lint e testes

Cada etapa constrói sobre a anterior, garantindo que temos um sistema robusto e bem estruturado no final.