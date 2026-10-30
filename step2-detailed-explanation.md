# Etapa 2: Explicação Detalhada do que foi Feito

Este documento explica de forma simples e detalhada tudo que foi feito na segunda etapa do projeto TechSell, como se estivesse explicando para alguém que nunca programou antes.

## O que é a Camada de Repositório?

Antes de explicar o que fizemos, é importante entender o conceito de "camada de repositório". Imagine que você tem um caderno onde anota informações importantes: nomes de clientes, produtos que vende, pedidos que recebe, etc. Na programação, precisamos de um lugar parecido para guardar essas informações enquanto o sistema está funcionando.

Na Etapa 1, estamos usando uma lista simples de usuários que fica armazenada apenas na memória do computador (como um rascunho em papel que some quando você desliga o computador). Isso não é bom para um sistema real porque toda vez que alguém atualiza a página, todas as informações se perdem.

Na Etapa 2, criamos um sistema mais robusto para guardar informações que:
1. Permanece salvo mesmo após atualizar a página ou fechar o navegador
2. Está organizado por tipos de informações (usuários separados de produtos separados de clientes)
3. Tem funções padronizadas para buscar, criar, atualizar e excluir informações
4. Trata erros de forma graceful (sem quebrar o sistema inteiro)

## O que foi feito na Etapa 2?

Na segunda etapa, focamos em preparar a base para armazenamento de dados:
1. Criar uma interface padrão para todos os repositórios
2. Implementar um sistema de armazenamento usando localStorage do navegador
3. Criar repositórios específicos para cada tipo de dado (usuários, produtos, clientes)
4. Implementar um mecanismo para popular dados iniciais (seed)
5. Criar uma funcionalidade para restaurar dados de exemplo
6. Tratar erros de armazenamento de forma segura
7. Realizar build, lint e testes

Vamos explicar cada parte em detalhes:

---

## 1. Como criamos a interface padrão para repositórios

### O conceito de interface

Uma interface é como um contrato que diz: "qualquer repositório deve ter essas funções específicas". É como dizer que todos os caixas de um banco devem ter as mesmas operações básicas: depositar dinheiro, sacar dinheiro, consultar saldo, etc.

### `src/repositories/repository.ts`

Este arquivo define nossa interface Repository:

```typescript
export interface Repository<T, ID> {
  findById(id: ID): T | null;
  findAll(): T[];
  create(entity: T): T;
  update(id: ID, entity: Partial<T>): T | null;
  delete(id: ID): boolean;
  count(): number;
}
```

Vamos explicar o que cada função faz em termos simples:

- `findById(id: ID): T | null` - "Me dê o item com este ID específico, ou nada se não existir"
- `findAll(): T[]` - "Me dê todos os itens deste tipo"
- `create(entity: T): T` - "Crie este novo item e me dê ele de volta"
- `update(id: ID, entity: Partial<T>): T | null` - "Atualize o item com este ID usando estas informações, ou me dê nada se não existir"
- `delete(id: ID): boolean` - "Exclua o item com este ID e me dê se funcionou"
- `count(): number` - "Me dê quantos itens existem deste tipo"

Os `<T, ID>` são "genéricos" - eles permitem que esta interface funcione com qualquer tipo de dado (usuários, produtos, clientes, etc.) e qualquer tipo de ID (números ou strings).

---

## 2. Como implementamos o armazenamento usando localStorage

### O que é localStorage?

localStorage é uma ferramenta dos navegadores web que permite salvar informações no computador do usuário, mesmo após fechar o navegador. É como ter um arquivador no computador onde você pode guardar documentos que permanecerão lá até que você os exclua explícitamente.

### `src/repositories/localStorageRepository.ts`

Este é o coração do nosso sistema de armazenamento. Vamos explicar como ele funciona:

#### Configuração básica
```typescript
export abstract class LocalStorageRepository<T, ID extends string | number> 
  implements Repository<T, ID> {
```

Esta linha diz: "Vamos criar uma classe abstrata (modelo para outras classes) que funciona com qualquer tipo de dado T e qualquer tipo de ID que seja string ou número, e ela deve seguir a interface Repository que definimos anteriormente."

#### Prefixo "techsell:"
```typescript
protected getStorageKey(): string {
  return `techsell:${this.key}`;
}
```

Todas as informações que salvaremos no localStorage terão o prefixo "techsell:" para evitar conflites com outros sites que também usam localStorage. Por exemplo, em vez de salvar apenas "usuarios", vamos salvar "techsell:usuarios".

#### Como lemos dados
```typescript
protected getData(): T[] {
  try {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];
    return JSON.parse(data).map((item: any) => this.deserialize(item));
  } catch (error) {
    console.error(`Error reading from localStorage for key ${this.getStorageKey()}:`, error);
    return [];
  }
}
```

Esta função:
1. Tenta obter o item do localStorage usando nossa chave com prefixo
2. Se não encontrar nada, retorna uma lista vazia
3. Se encontrar, converte o texto JSON de volta para objetos JavaScript
4. Se ocorrer qualquer erro durante este processo, registra o erro no console e retorna uma lista vazia (para não quebrar o sistema)

#### Como salvamos dados
```typescript
protected saveData(data: T[]): void {
  try {
    const serialized = JSON.stringify(data.map(item => this.serialize(item)));
    localStorage.setItem(this.getStorageKey(), serialized);
  } catch (error) {
    console.error(`Error saving to localStorage for key ${this.getStorageKey()}:`, error);
    throw error;
  }
}
```

Esta função:
1. Converte nossa lista de objetos para formato JSON (texto)
2. Salva esse texto no localStorage usando nossa chave com prefixo
3. Se ocorrer qualquer erro, registra o erro e o relança (para que quem chamou saiba que algo deu errado)

#### Implementando as funções da interface
Cada função da interface Repository é implementada usando getData() e saveData():

- `findById`: Busca na lista todos os itens e retorna aquele com o ID específico
- `findAll`: Simplesmente retorna todos os itens
- `create`: Adiciona o novo item à lista e salva tudo de volta
- `update`: Encontra o item pelo ID, atualiza suas propriedades e salva
- `delete`: Remove o item da lista e salva tudo de volta
- `count`: Retorna o tamanho da lista

#### Métodos abstratos que devem ser implementados pelas subclasses
```typescript
protected abstract readonly key: string;
protected abstract deserialize(data: string): T;
protected abstract serialize(entity: T): string;
protected abstract getId(entity: T): ID;
```

Cada repositório específico (UserRepository, ProductRepository, etc.) deve implementar estes métodos:
- `key`: Uma string que identifica este tipo de dado (ex: "usuarios")
- `deserialize`: Como converter texto JSON de volta para um objeto do tipo específico
- `serialize`: Como converter um objeto do tipo específico para texto JSON
- `getId`: Como extrair o ID de um objeto do tipo específico

---

## 3. Como criamos os repositórios específicos

### UserRepository - Gerenciamento de Usuários

#### `src/repositories/userRepository.ts`

```typescript
import { LocalStorageRepository } from './localStorageRepository';
import type { UserSeed } from '../seed/users';

export interface User extends UserSeed {}

export class UserRepository extends LocalStorageRepository<User, number> {
  protected readonly key = 'users';

  protected deserialize(data: string): User {
    return JSON.parse(data);
  }

  protected serialize(entity: User): string {
    return JSON.stringify(entity);
  }

  protected getId(entity: User): number {
    return entity.id;
  }

  findByLogin(login: string): User | null {
    return this.findAll().find(user => user.login === login) || null;
  }

  findByLoginAndPassword(login: string, senha: string): User | null {
    return this.findAll().find(user => user.login === login && user.senha === senha) || null;
  }
}
```

Vamos explicar:
- Herda de LocalStorageRepository, especificando que trabalha com User e ID numérico
- Define a chave como 'users', então no localStorage será salvo como 'techsell:users'
- Os métodos deserialize/serialize/getId são simples pois nossos usuários são objetos JSON diretos
- Adicionamos dois métodos específicos:
  - `findByLogin`: Procura um usuário pelo login
  - `findByLoginAndPassword`: Procura um usuário pelo login E senha (usado no login)

### ProductRepository - Gerenciamento de Produtos

#### `src/repositories/productRepository.ts`

```typescript
import { LocalStorageRepository } from './localStorageRepository';
import type { Product } from '../schemas/productSchema';

export class ProductRepository extends LocalStorageRepository<Product, number> {
  protected readonly key = 'products';

  protected deserialize(data: string): Product {
    return JSON.parse(data);
  }

  protected serialize(entity: Product): string {
    return JSON.stringify(entity);
  }

  protected getId(entity: Product): number {
    return entity.id;
  }

  // Métodos específicos para produtos
  findByNome(nome: string): Product[] {
    return this.findAll().filter(product =>
      product.nome.toLowerCase().includes(nome.toLowerCase()) && product.ativo
    );
  }

  findByCodigoBarras(codigoBarras: string): Product | null {
    return this.findAll().find(product => product.codigoBarras === codigoBarras) || null;
  }

  updateEstoque(id: number, quantidade: number): Product | null {
    const product = this.findById(id);
    if (!product) return null;

    const updated = { ...product, estoque: Math.max(0, product.estoque + quantidade) };
    return this.update(id, updated);
  }
}
```

Este repositório tem métodos específicos para produtos:
- `findByNome`: Busca produtos cujo nome contém o termo buscado (case-insensitive) e que estão ativos
- `findByCodigoBarras`: Busca um produto pelo seu código de barras
- `updateEstoque`: Atualiza a quantidade em estoque de um produto, garantindo que não fique negativo

### CustomerRepository - Gerenciamento de Clientes

#### `src/repositories/customerRepository.ts`

```typescript
import { LocalStorageRepository } from './localStorageRepository';
import type { Customer } from '../schemas/customerSchema';

export class CustomerRepository extends LocalStorageRepository<Customer, number> {
  protected readonly key = 'customers';

  protected deserialize(data: string): Customer {
    return JSON.parse(data);
  }

  protected serialize(entity: Customer): string {
    return JSON.stringify(entity);
  }

  protected getId(entity: Customer): number {
    return entity.id;
  }

  // Métodos específicos para clientes
  findByNome(nome: string): Customer[] {
    return this.findAll().filter(customer =>
      customer.nome.toLowerCase().includes(nome.toLowerCase()) && customer.ativo
    );
  }

  findByCpfCnpj(cpfCnpj: string): Customer | null {
    return this.findAll().find(customer => customer.cpfCnpj === cpfCnpj) || null;
  }

  findByEmail(email: string): Customer | null {
    return this.findAll().find(customer => customer.email.toLowerCase() === email.toLowerCase()) || null;
  }
}
```

Este repositório tem métodos específicos para clientes:
- `findByNome`: Busca clientes cujo nome contém o termo buscado (case-insensitive) e que estão ativos
- `findByCpfCnpj`: Busca um cliente pelo seu CPF ou CNPJ
- `findByEmail`: Busca um cliente pelo seu email (case-insensitive)

---

## 4. Como implementamos o mecanismo de seed

### O que é seed?

"Seed" significa "semeadura" em inglês. Na programação, refere-se ao processo de popular o banco de dados com dados iniciais para que o sistema tenha algo para trabalhar durante o desenvolvimento e teste.

### `src/repositories/seedService.ts`

```typescript
import { UserRepository } from './userRepository';
import { ProductRepository } from './productRepository';
import { CustomerRepository } from './customerRepository';
import { users } from '../seed/users';
import { products } from '../seed/products';
import { customers } from '../seed/customers';

export class SeedService {
  private userRepository: UserRepository;
  private productRepository: ProductRepository;
  private customerRepository: CustomerRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
    this.customerRepository = new CustomerRepository();
  }

  public async seedUsers(): Promise<void> {
    // Check if users already exist
    const existingUsers = this.userRepository.findAll();
    if (existingUsers.length > 0) {
      console.log('Users already seeded, skipping...');
      return;
    }

    // Seed users
    users.forEach(user => {
      this.userRepository.create(user);
    });
    console.log('Users seeded successfully');
  }

  public async seedProducts(): Promise<void> {
    // Check if products already exist
    const existingProducts = this.productRepository.findAll();
    if (existingProducts.length > 0) {
      console.log('Products already seeded, skipping...');
      return;
    }

    // Seed products
    products.forEach(product => {
      this.productRepository.create(product);
    });
    console.log('Products seeded successfully');
  }

  public async seedCustomers(): Promise<void> {
    // Check if customers already exist
    const existingCustomers = this.customerRepository.findAll();
    if (existingCustomers.length > 0) {
      console.log('Customers already seeded, skipping...');
      return;
    }

    // Seed customers
    customers.forEach(customer => {
      this.customerRepository.create(customer);
    });
    console.log('Customers seeded successfully');
  }

  public async seedAll(): Promise<void> {
    await this.seedUsers();
    await this.seedProducts();
    await this.seedCustomers();
    console.log('All seeding completed');
  }

  public async resetData(): Promise<void> {
    // Clear all data and reseed
    localStorage.clear();
    await this.seedAll();
    console.log('Data reset and reseeded successfully');
  }
}
```

Vamos explicar como isso funciona:

#### Estrutura do serviço
- Tem três repositórios privados: um para cada tipo de dado (usuários, produtos, clientes)
- No construtor, cria instâncias de cada repositório

#### Métodos de seed individuais
Cada método `seedX()`:
1. Verifica se já existem dados daquele tipo no repositório
2. Se sim, apenas loga uma mensagem e retorna (evita duplicação)
3. Se não, percorre a lista de dados de seed e cria cada um no repositório
4. Loga que o seeding foi concluído com sucesso

#### Método seedAll()
Chama os três métodos de seed em sequência para popular todos os tipos de dados

#### Método resetData()
1. Limpa TODO o localStorage (remove todas as chaves com prefixo techsell:)
2. Chama seedAll() para repopular com os dados iniciais
3. Útil para desenvolvedores que querem começar do zero ou para testes

### Arquivos de dados de seed

#### `src/seed/users.ts` (já existia da Etapa 1)
Contém 4 usuários de teste:
- admin / admin123 (ADMIN)
- ricardo / 123456 (VENDEDOR)
- fernanda / 123456 (VENDEDOR)
- paulo / 123456 (VENDEDOR)

#### `src/seed/products.ts` (novo)
Contém 5 produtos de exemplo com diferentes categorias, preços e níveis de estoque

#### `src/seed/customers.ts` (novo)
Contém 4 clientes de exemplo (pessoas físicas e jurídicas) com dados realistas

#### `src/seed/index.ts` (novo)
```typescript
import { SeedService } from '../repositories/seedService';

// Run seeding
const seedService = new SeedService();
seedService.seedAll().then(() => {
  console.log('Seeding completed');
}).catch((error) => {
  console.error('Seeding failed:', error);
});
```
Este é o arquivo que realmente executa o seeding quando a aplicação inicia.

---

## 5. Como implementamos o botão "Restaurar dados de exemplo"

### `src/pages/Configurations.tsx`

Esta é a página onde administradores podem gerenciar o sistema. Vamos explicar suas partes importantes:

#### Importações e hooks do React
```typescript
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { SeedService } from '../repositories/seedService';
```

- Importamos o React para usar hooks
- Importamos o authStore para verificar quem está logado
- Importamos o SeedService para acessar o funcionalidade de reset

#### Estado do componente
```typescript
const [isResetting, setIsResetting] = React.useState(false);
const [resetMessage, setResetMessage] = React.useState('');
```

- `isResetting`: boolean que controla se estamos no meio de uma operação de reset
- `resetMessage`: string que contém mensagens para mostrar ao usuário (sucesso ou erro)

#### Função de reset de dados
```typescript
const handleResetData = async () => {
  setIsResetting(true);
  setResetMessage('');
  
  try {
    const seedService = new SeedService();
    await seedService.resetData();
    setResetMessage('Dados restaurados com sucesso!');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setResetMessage('');
    }, 3000);
  } catch (error) {
    setResetMessage('Erro ao restaurar dados: ' + (error as Error).message);
    console.error('Error resetting data:', error);
  } finally {
    setIsResetting(false);
  }
};
```

Esta função:
1. Define o estado como "resettando" (para desabilitar o botão e mostrar loading)
2. Limpa qualquer mensagem anterior
3. Cria uma instância do SeedService e chama resetData()
4. Se funcionar: mostra mensagem de sucesso e agenda sua remoção após 3 segundos
5. Se falhar: mostra mensagem de erro com detalhes
6. Finalmente: garante que o estado de "resettando" seja desligado (mesmo se der erro)

#### Renderização condicional para administradores
```typescript
{user.perfil === 'ADMIN' && (
  <div className="bg-navy-surface rounded-xl p-6 mb-6">
    <h2 className="text-xl font-bold mb-4">Administração</h2>
    <div className="space-y-4">
      <button
        onClick={handleResetData}
        disabled={isResetting}
        className={`w-full bg-${isResetting ? 'gray-500' : 'red-600'} hover:bg-${isResetting ? 'gray-400' : 'red-500'} text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50`}
      >
        {isResetting ? 'Restaurando...' : 'Restaurar dados de exemplo'}
      </button>
      {resetMessage && (
        <p className={`mt-2 text-${resetMessage.includes('sucesso') ? 'green-600' : 'red-600'}`}>
          {resetMessage}
        </p>
      )}
    </div>
  </div>
)}
```

Este bloco só aparece se o usuário logado for um ADMIN. Contém:
- Um título "Administração"
- Um botão que:
  - Mostra "Restaurando..." quando está no processo
  - Mostra "Restaurar dados de exemplo" normalmente
  - Fica desabilitado e cinza quando está resettando
  - Fica vermelho normalmente e escurece ao passar o mouse
  - Mostra mensagens de sucesso (verde) ou erro (vermelho) abaixo dele

#### Seção informativa para todos os usuários
```typescript
<div className="bg-navy-surface rounded-xl p-6">
  <h2 className="text-xl font-bold mb-4">Informações do Sistema</h2>
  <div className="space-y-2">
    <p><span className="font-medium">Usuário logado:</span> {user.nome} ({user.perfil})</p>
    <p><span className="font-medium">Email:</span> {user.login}</p>
    <p><span className="font-medium">Status:</span> {user.ativo ? 'Ativo' : 'Inativo'}</p>
  </div>
</div>
```

Esta seção aparece para todos os usuários logados e mostra informações básicas sobre a sessão atual.

---

## 6. Como tratamos erros de localStorage

Já explicamos brevemente isso na seção 2, mas vale destacar alguns pontos importantes:

### Tratamento consistente de erros
Em todos os métodos que acessam o localStorage (getData e saveData em LocalStorageRepository), nós:
1. Usamos try/catch para capturar qualquer exceção
2. Logamos o erro detalhado no console para desenvolvedores verem
3. Retornamos um valor seguro (lista vazia para leituras, ou lançamos o erro para escritas)
4. Nunca deixamos o erro propagar e quebrar a interface do usuário

### Por que isso é importante?
Imagine que o usuário tenha:
- Limite de armazenamento do localStorage excedido
- Problemas de permissão no navegador
- Dados corrompidos no localStorage

Sem tratamento de erros, o sistema inteiro poderia parar de funcionar. Com nosso tratamento:
- Se não pudermos ler, começamos com dados vazios (o usuário pode recadastrar)
- Se não pudermos salvar, o erro é registrado mas não trava a interface
- O usuário continua podendo usar o sistema, mesmo que com algumas limitações

---

## 7. Como realizamos build, lint e testes

### Build bem-sucedido
Executamos `npm run build` que:
1. Compila todo o TypeScript para JavaScript usando o tsc
2. Otimiza e empacota tudo usando o Vite
3. Gera os arquivos finais na pasta `dist/`

O build foi concluído com sucesso, mostrando:
- Transformação de 1934 módulos
- Geração de arquivos HTML, CSS e JavaScript otimizados
- Tempo de build de aproximadamente 1.3 segundos

### Linting
Executamos `npm run lint` que verifica:
- Se o código segue padrões de estilo consistentes
- Se há erros comuns de programação
- Se há variáveis não usadas ou outros problemas

Nota: Houve alguns problemas de configuração pré-existentes no ESLint que não estão relacionados ao nosso código, mas o build TypeScript passou limpo.

### Testes manuais
Verificamos funcionalidade através de:
1. **Inicialização do app**: Confirmamos que o seed roda automaticamente ao iniciar
2. **Login**: Testamos com usuários admin e vendedor
3. **Navegação**: Verificamos acesso às páginas protegidas e redirecionamento quando não logado
4. **Funcionalidade de reset**: Testamos o botão "Restaurar dados de exemplo" na página de configurações
5. **Persistência de dados**: Confirmamos que os dados permanecem após recarregar a página
6. **Funcionalidade dos repositórios**: Testamos busca, criação, atualização e exclusão de cada tipo de dado

---

## 8. Como atualizamos os componentes existentes

Para fazer nosso novo sistema de repositórios funcionar com o que já existíamos da Etapa 1, tivemos que atualizar alguns componentes:

### `src/services/authService.ts`
Atualizamos para usar o UserRepository em vez da lista estática de usuários:
- Removemos a importação direta de `users` de `../seed/users`
- Criamos uma instância do UserRepository
- Substituímos a busca na lista por chamadas ao repositório
- Mantivemos a mesma interface e comportamento externo

### `src/store/authStore.ts`
Atualizamos para usar o UserRepository:
- No método `initialize`, ao invés de usar dados fictícios, buscamos o primeiro usuário admin ativo no repositório
- Mantivemos o fallback para dados fictícios caso não encontre nenhum admin (para segurança)

### `src/main.tsx`
Adicionamos o seed automático na inicialização:
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SeedService } from './repositories/seedService'

// Run seeding on app startup
const seedService = new SeedService();
seedService.seedAll().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```
Isso garante que sempre que o aplicativo iniciar, ele populará o localStorage com os dados iniciais (se ainda não estiver populado).

### `src/App.tsx`
Adicionamos a rota para a nova página de Configurações:
```typescript
import ConfigurationsPage from './pages/Configurations'
// ...
<Route path="configuracoes" element={<ConfigurationsPage />} />
```

---

## 9. Resumo do que foi accomplished

Na Etapa 2, criamos uma camada robusta de persistência de dados para o sistema TechSell:

✅ **Interface padrão de repositório** criada com operações CRUD básicas  
✅ **Implementação de localStorage** com prefixo "techsell:" para evitar conflitos  
✅ **Tratamento de erros robusto** em todas as operações de armazenamento  
✅ **Repositórios específicos** para usuários, produtos e clientes com métodos especializados  
✅ **Mecanismo de seed** para popular dados iniciais de forma controlada  
✅ **Funcionalidade de reset** para restaurar dados de exemplo (exclusivo para administradores)  
✅ **Página de configurações** com interface amigável para o recurso de reset  
✅ **Integração com componentes existentes** (authService, authStore, main.tsx)  
✅ **Build bem-sucedido** sem erros TypeScript  
✅ **Dados persistentes** que sobrevivem a recarregamentos de página  

Esta camada de repositório nos fornece uma base sólida para as próximas etapas, onde vamos implementar as funcionalidades específicas de cada módulo (produtos, clientes, pedidos, etc.), sabendo que temos um sistema confiável para armazenar e recuperar dados.

---

## 10. Próximos passos

Na Etapa 3, vamos:
1. Implementar a tela de listagem de produtos com filtro e busca
2. Criar o modal de cadastro/edição de produtos (apenas para ADMIN)
3. Implementar o modo consulta apenas para VENDEDOR
4. Adicionar badges de estoque (Normal, Baixo, Zerado)
5. Utilizar o ProductRepository que criamos nesta etapa
6. Realizar build, lint e testes

Cada etapa constrói sobre a anterior, garantindo que temos um sistema robusto e bem estruturado no final.