import { describe, expect, it, vi } from 'vitest';
import { buildTemplateSummary, computeSalesSnapshot, generateSummary } from './aiService';
import type { Order } from '../schemas/orderSchema';
import type { Product } from '../schemas/productSchema';

const order = (id: number, date: string, total: number, status: Order['status'] = 'confirmado'): Order => ({
  id,
  customerId: id,
  customerName: id % 2 ? 'Cliente A' : 'Cliente B',
  date,
  status,
  total,
  items: [{ productId: 1, productName: 'Granito Preto', productPrice: total, quantity: 1, subtotal: total }],
});

const product = (nome: string, estoque: number, estoqueMinimo: number, ativo = true): Product => ({
  id: 1,
  nome,
  descricao: '',
  preco: 100,
  estoque,
  estoqueMinimo,
  categoria: 'Granito',
  ativo,
});

const orders = [
  order(1, '2026-11-02', 1000),
  order(2, '2026-11-10', 500),
  order(3, '2026-11-12', 900, 'cancelado'),
  order(4, '2026-10-20', 1000), // período anterior (mesma duração)
];

describe('computeSalesSnapshot', () => {
  const snapshot = computeSalesSnapshot(orders, [product('Mármore', 1, 5), product('Quartzo', 50, 5)], '2026-11-01', '2026-11-15');

  it('conta só pedidos confirmados dentro do período', () => {
    expect(snapshot.orderCount).toBe(2);
    expect(snapshot.totalRevenue).toBe(1500);
    expect(snapshot.averageTicket).toBe(750);
  });

  it('compara com o período anterior de mesma duração', () => {
    expect(snapshot.previousPeriod.periodStart).toBe('2026-10-17');
    expect(snapshot.previousPeriod.periodEnd).toBe('2026-10-31');
    expect(snapshot.previousPeriod.totalRevenue).toBe(1000);
    expect(snapshot.revenueChangePct).toBe(50);
  });

  it('lista só produtos ativos com estoque no mínimo ou abaixo', () => {
    expect(snapshot.lowStock).toEqual([{ name: 'Mármore', stock: 1, minStock: 5 }]);
  });

  it('deixa a variação nula quando não há vendas no período anterior', () => {
    const result = computeSalesSnapshot([order(1, '2026-11-02', 100)], [], '2026-11-01', '2026-11-15');
    expect(result.revenueChangePct).toBeNull();
  });
});

describe('buildTemplateSummary', () => {
  it('avisa quando não há vendas', () => {
    const empty = computeSalesSnapshot([], [], '2026-11-01', '2026-11-15');
    expect(buildTemplateSummary(empty)).toContain('Não há pedidos confirmados');
  });

  it('traz os três blocos quando há vendas', () => {
    const text = buildTemplateSummary(computeSalesSnapshot(orders, [], '2026-11-01', '2026-11-15'));
    expect(text).toContain('Panorama');
    expect(text).toContain('Destaques');
    expect(text).toContain('Atenção');
  });
});

describe('generateSummary', () => {
  const snapshot = computeSalesSnapshot(orders, [], '2026-11-01', '2026-11-15');

  it('usa o resumo sem IA quando não há chave', async () => {
    const result = await generateSummary(snapshot, { apiKey: '' });
    expect(result.source).toBe('template');
    expect(result.warning).toBeUndefined();
  });

  it('chama o Gemini e devolve o texto quando há chave', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Resumo da IA' }] } }] }), { status: 200 }),
    );
    const result = await generateSummary(snapshot, { apiKey: 'chave-teste', model: 'modelo-x', fetchFn });

    expect(result).toMatchObject({ source: 'ia', text: 'Resumo da IA', model: 'modelo-x' });
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toContain('/models/modelo-x:generateContent');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('chave-teste');
  });

  it('cai no resumo sem IA e informa o motivo quando a API falha', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'API key not valid' } }), { status: 400 }),
    );
    const result = await generateSummary(snapshot, { apiKey: 'ruim', fetchFn });

    expect(result.source).toBe('template');
    expect(result.warning).toContain('HTTP 400');
  });
});
