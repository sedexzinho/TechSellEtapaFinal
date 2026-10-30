# Etapa 5: Explicação Detalhada do que foi Feito

Este documento explica de forma simples e detalhada tudo que foi feito na quinta etapa do projeto TechSell, como se estivesse explicando para alguém que nunca programou antes.

## O que é o Módulo de Pedidos?

O módulo de pedidos é a parte mais importante do sistema! É onde gerenciamos todos os pedidos que os clientes fazem para nossa marmoraria. Cada pedido contém:
- Quem comprou (cliente)
- O que comprou (produtos com quantidades)
- Quanto deu conta (preço total)
- Qual o andamento (rascunho, confirmado, cancelado)

Na Etapa 5, focamos em implementar um fluxo completo de pedidos, respeitando as regras de negócio e integrando com o estoque.

## O que foi feito na Etapa 5?

Na quinta etapa, implementamos o módulo completo de pedidos:
1. Tela de listagem de pedidos com informações completas
2. Fluxo de novo pedido (seleção de cliente, busca de produtos)
3. Validação de estoque (RN03) - não permitir vender mais do que tem disponível
4. Baixa de estoque ao confirmar pedido
5. Estorno de estoque ao cancelar pedido confirmado
6. Build, lint e testes para garantir que tudo funciona corretamente

Vamos explicar cada parte em detalhes:

---

## 1. Como implementamos a tela de listagem de pedidos

### `src/pages/Pedidos.tsx`

Esta é a página principal onde os usuários podem visualizar todos os pedidos do sistema.

#### Estrutura da página
A página tem um layout simples e eficiente:
- Cabeçalho com título "Pedidos" e botão "Novo Pedido" (apenas para ADMIN)
- Lista de pedidos exibida em cards
- Cada card mostra as informações essenciais do pedido

#### Informações exibidas em cada card
- Número do pedido
- Nome do cliente (com ID)
- Data do pedido
- Status (Rascunho, Confirmado, Cancelado)
- Total do pedido em reais

#### Estilização
Cada card tem:
- Fundo escuro (`bg-navy-surface`)
- Bordas arredondadas
- Sombra suave
- Efeito hover quando passa o mouse

---

## 2. Como criamos o fluxo de novo pedido

### `src/components/ui/NewOrderModal.tsx`

Este é o componente mais complexo que criamos na etapa! Ele explica como montar um pedido do zero.

#### Estrutura do modal
O modal é dividido em duas partes principais:
1. **Sidebar esquerda** (64px de largura):
   - Seleção do cliente (dropdown com todos os clientes)
   - Busca de produtos com filtragem

2. **Conteúdo principal** (resto da tela):
   - Lista de itens adicionados ao pedido
   - Resumo do total
   - Botões de ação

#### Como funciona a seleção do cliente
- Um dropdown mostra todos os clientes cadastrados
- O usuário seleciona um cliente
- O nome do cliente é automaticamente preenchido no cabeçalho do pedido

#### Como funciona a busca de produtos
- Um campo de busca permite filtrar produtos pelo nome
- O sistema mostra apenas produtos com estoque disponível (`estoque > 0`)
- Cada produto mostra:
  - Nome
  - Estoque atual
  - Preço
  - Código de barras (se tiver)

#### Como adicionar produtos ao pedido
Quando o usuário clica no botão "+" de um produto:
1. O produto é adicionado à lista com quantidade 1
2. Se já estiver na lista, a quantidade é incrementada
3. O sistema recalcula automaticamente o total

#### Como ajustar a quantidade
Na lista de itens, o usuário pode:
- Aumentar a quantidade com o botão "+"
- Diminuir a quantidade com o botão "-"
- Remover o item com o botão "Remover"

#### Interface do carrinho de itens
Cada item na lista mostra:
- Nome do produto
- Preço unitário
- Quantidade
- Subtotal (preço × quantidade)
- Código de barras (se tiver)
- Botões para ajustar quantidade ou remover

---

## 3. Como implementamos a validação de estoque (RN03)

### Regra de Negócio RN03
**"Não permitir vender quantidade maior que estoque disponível"**

Esta regra é CRÍTICA para não invalidarmos nossos pedidos!

### Onde a validação acontece

#### Na criação do novo pedido
Antes de salvar o pedido, validamos:
```typescript
for (const item of selectedProducts) {
  const product = products.find(p => p.id === item.productId);
  if (!product || product.estoque < item.quantity) {
    setError(`Estoque insuficiente para o produto ${product?.nome || 'desconhecido'}. 
              Disponível: ${product?.estoque || 0}, necessário: ${item.quantity}`);
    return;
  }
}
```

Se houver estoque insuficiente, mostramos uma mensagem de erro clara para o usuário.

#### No momento da confirmação
Mesmo na confirmação, validamos novamente:
```typescript
for (const item of order.items) {
  const product = productRepository.findById(item.productId);
  if (!product || product.estoque < item.quantity) {
    setError(`Estoque insuficiente para o produto ${product?.nome || item.productName}`);
    return;
  }
}
```

### Por que validamos duas vezes?
1. **Primeira validação**: Evita que o usuário crie pedidos com estoque insuficiente
2. **Segunda validação**: Protege contra alterações no estoque entre a criação e a confirmação (outro usuário pode ter vendido)

---

## 4. Como implementamos a baixa de estoque ao confirmar pedido

### `src/pages/Pedidos.tsx` - função `handleConfirmOrder`

Quando um ADMIN confirma um pedido, o sistema:

```typescript
// Para cada item do pedido
for (const item of order.items) {
  // Reduz o estoque do produto
  productRepository.updateEstoque(item.productId, -item.quantity);
}
```

O método `updateEstoque` do `ProductRepository`:
```typescript
updateEstoque(id: number, quantidade: number): Product | null {
  const product = this.findById(id);
  if (!product) return null;
  // Adiciona a quantidade (pode ser negativa para baixa)
  const updated = { ...product, estoque: Math.max(0, product.estoque + quantidade) };
  return this.update(id, updated);
}
```

### Exemplo prático
Se temos:
- Produto A: 10 unidades em estoque
- Pedido com 3 unidades do Produto A

Depois de confirmar:
- Produto A: 7 unidades em estoque (10 - 3 = 7)

---

## 5. Como implementamos o estorno de estoque ao cancelar pedido

### `src/pages/Pedidos.tsx` - função `handleCancelOrder`

Quando um ADMIN cancela um **pedido confirmado**, o sistema:

```typescript
// Para cada item do pedido
for (const item of order.items) {
  // RESTAURAR (adiantar) o estoque
  productRepository.updateEstoque(item.productId, item.quantity);
}
```

O segundo parâmetro positivo (`+item.quantity`) adiciona as unidades de volta ao estoque.

### Estado dos botões

O sistema controla o que é possível fazer com base no status:

| Status | Botões visíveis | Ações disponíveis |
|--------|-----------------|---------------------|
| Rascunho | Confirmar, Excluir | Ainda pode ser confirmado |
| Confirmado | Cancelar | Estorno de estoque |
| Cancelado | Restaurar | Torna o estoque novamente disponível |

---

## 6. Como funciona o controle de estoque visual

### Badge de status
Cada card de pedido mostra o status com cores diferentes:

```tsx
<span className={`text-${order.status === 'confirmado' ? 'green-600' : 
                     order.status === 'cancelado' ? 'red-600' : 'yellow-600'}`}>
  {order.status === 'rascunho' ? 'Rascunho' : 
   order.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
</span>
```

- **Rascunho (amarelo)**: Ainda não foi confirmado
- **Confirmado (verde)**: Estoque foi debitado, pedido foi finalizado
- **Cancelado (vermelho)**: Estoque foi estornado, pedido foi cancelado

---

## 7. Como realizamos build, lint e testes

### Build bem-sucedido
Executamos `npm run build` que:
1. Compila todo o TypeScript para JavaScript
2. Otimiza e empacota com Vite
3. Gera arquivos na pasta `dist/`

O build foi concluído com sucesso, sem erros TypeScript.

### Linting
Executamos `npm run lint` para verificar padrões de estilo.

### Testes manuais
Testamos todas as funcionalidades:
1. **Listagem de pedidos**: Todos os pedidos são exibidos corretamente
2. **Botão Novo Pedido (ADMIN)**: Abre o modal corretamente
3. **Seleção de cliente**: Dropdown funciona e preenche nome do cliente
4. **Busca de produtos**: Filtra apenas produtos com estoque
5. **Adição de itens ao pedido**: Aciona o carrinho corretamente
6. **Ajuste de quantidades**: + e - funcionam
7. **Validação de estoque**: Impede adicionar quantidade maior que disponível
8. **Salvamento do pedido**: Cria o pedido com status "rascunho"
9. **Confirmação de pedido**: 
   - Muda status para "confirmado"
   - Reduz estoque dos produtos
10. **Cancelamento de pedido confirmado**:
    - Muda status para "cancelado"
    - RESTAURA o estoque dos produtos
11. **Botão excluir (rascunho)**: Remove o pedido do sistema
12. **Persistência**: Dados permanecem após recarregar a página

---

## 8. Integração com outros módulos

### Com Clientes (`CustomerRepository`)
O `CustomerRepository` é usado para:
- Buscar todos os clientes para o dropdown de seleção
- Obter o nome do cliente para o cabeçalho do pedido

```typescript
const customerRepository = new CustomerRepository();
// ...
customers={customerRepository.findAll()}
```

### Com Produtos (`ProductRepository`)
O `ProductRepository` é usado para:
- Buscar produtos com estoque disponível
- Validar estoque durante a criação do pedido
- Atualizar estoque ao confirmar/cancelar

```typescript
const productRepository = new ProductRepository();
// ...
productRepository.updateEstoque(item.productId, -item.quantity);
```

### Com Pedidos (`OrderRepository`)
O `OrderRepository` é usado para:
- Salvar novos pedidos
- Atualizar status
- Deletar pedidos
- Calcular totais

```typescript
const orderRepository = new OrderRepository();
orderRepository.create(newOrder);
orderRepository.update(order.id, updatedOrder);
orderRepository.delete(order.id);
```

---

## 9. Resumo do que foi realizado

Na Etapa 5, criamos um módulo completo de pedidos para o sistema TechSell:

✅ **Tela de listagem de pedidos** com interface limpa e cards informativos  
✅ **Botão "Novo Pedido"** (exclusivo para ADMIN)  
✅ **Modal de novo pedido** com seleção de cliente e busca de produtos  
✅ **Validação de estoque (RN03)** - impede vender mais do que tem disponível  
✅ **Baixa de estoque ao confirmar** - estoque é debitado automaticamente  
✅ **Estorno de estoque ao cancelar** - estoque é restaurado automaticamente  
✅ **Fluxo de status** completo (Rascunho → Confirmado → Cancelado)  
✅ **Controle de acesso baseado em perfis** (ADMIN pode confirmar/cancelar)  
✅ **Integração com CustomerRepository e ProductRepository**  
✅ **Build e lint bem-sucedidos**  
✅ **Persistência de dados** com localStorage  

Este fluxo completo de pedidos permite que o sistema gerencie do início ao fim todo o ciclo de vida de um pedido, desde a criação até a finalização ou cancelamento, mantendo o estoque sempre atualizado e respeitando as regras de negócio.

---

## 10. Próximos passos

Na Etapa 6, vamos:
1. Implementar a tela de Visitas e Orçamentos com duas abas separadas
2. Criar o fluxo de geração de orçamento a partir de visita
3. Implementar transições de status respeitando RN04 (Orçamento só pode ir para EXECUTADO depois de APROVADO)
4. Criar schemas e repositórios para visitas e orçamentos
5. Realizar build, lint e testes

Cada etapa constrói sobre a anterior, garantindo que temos um sistema robusto e bem estruturado no final.