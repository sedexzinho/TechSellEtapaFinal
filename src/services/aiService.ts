import type { Order } from '../schemas/orderSchema';
import type { Product } from '../schemas/productSchema';

/**
 * Serviço de resumos com IA (Gemini).
 *
 * Os números são sempre calculados aqui, no código. O modelo só recebe o
 * resumo agregado e redige o texto, para não inventar valores. Sem chave
 * configurada (ou se a chamada falhar), devolve um resumo montado por template.
 */

export interface RankedProduct {
  name: string;
  revenue: number;
  quantity: number;
}

export interface RankedCustomer {
  name: string;
  revenue: number;
  orders: number;
}

export interface LowStockItem {
  name: string;
  stock: number;
  minStock: number;
}

export interface SalesSnapshot {
  periodStart: string; // AAAA-MM-DD
  periodEnd: string; // AAAA-MM-DD
  totalRevenue: number;
  orderCount: number;
  averageTicket: number;
  topProducts: RankedProduct[];
  topCustomers: RankedCustomer[];
  previousPeriod: {
    periodStart: string;
    periodEnd: string;
    totalRevenue: number;
    orderCount: number;
  };
  revenueChangePct: number | null; // null quando o período anterior não tem vendas
  lowStock: LowStockItem[];
}

export interface SummaryResult {
  text: string;
  source: 'ia' | 'template';
  model?: string;
  /** Motivo de ter caído no resumo sem IA quando a chamada falhou. */
  warning?: string;
}

export interface GenerateSummaryOptions {
  apiKey?: string;
  model?: string;
  fetchFn?: typeof fetch;
}

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
export const DEFAULT_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODEL = 'gemini-flash-latest';
const TIMEOUT_MS = 30_000;
const DAY_MS = 86_400_000;

const SYSTEM_PROMPT = [
  'Você é um analista comercial de uma marmoraria (mármore e granito).',
  'Você recebe um JSON com métricas de vendas já calculadas e escreve um resumo para o administrador.',
  'Regras:',
  '- Use somente os números do JSON. Nunca invente valores, clientes ou produtos.',
  '- Valores em reais no formato brasileiro (R$ 1.234,56) e datas no formato dd/mm/aaaa.',
  '- Só compare com o período anterior se previousPeriod.orderCount for maior que zero.',
  '- Se orderCount for zero, diga apenas que não houve vendas confirmadas no período.',
  '- Escreva em português do Brasil, em texto simples, sem markdown, sem asteriscos e sem emojis.',
  '- Use exatamente três blocos, cada um com o título em uma linha própria: Panorama, Destaques, Atenção.',
  '- Em Atenção, cite produtos com estoque baixo (lowStock) e sugira no máximo duas ações práticas.',
  '- No máximo 180 palavras no total.',
].join('\n');

// ---------- datas e formatação ----------

const parseDay = (day: string): number => {
  const [year, month, date] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, date);
};

const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

export const toLocalDay = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const formatDayBR = (day: string): string => {
  const [year, month, date] = day.split('-');
  return `${date}/${month}/${year}`;
};

export const formatBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const round2 = (value: number): number => Math.round(value * 100) / 100;
const round1 = (value: number): number => Math.round(value * 10) / 10;

// ---------- cálculo das métricas ----------

function previousRange(start: string, end: string): { start: string; end: string } {
  const length = (parseDay(end) - parseDay(start)) / DAY_MS + 1;
  const prevEnd = parseDay(start) - DAY_MS;
  const prevStart = prevEnd - (length - 1) * DAY_MS;
  return { start: dayKey(prevStart), end: dayKey(prevEnd) };
}

function confirmedInRange(orders: Order[], start: string, end: string): Order[] {
  return orders.filter((order) => {
    const day = order.date.slice(0, 10);
    return order.status === 'confirmado' && day >= start && day <= end;
  });
}

const sumTotals = (orders: Order[]): number => orders.reduce((sum, order) => sum + order.total, 0);

export function computeSalesSnapshot(
  orders: Order[],
  products: Product[],
  start: string,
  end: string,
): SalesSnapshot {
  const current = confirmedInRange(orders, start, end);
  const prevRange = previousRange(start, end);
  const previous = confirmedInRange(orders, prevRange.start, prevRange.end);

  const totalRevenue = round2(sumTotals(current));
  const previousRevenue = round2(sumTotals(previous));

  const productTotals = new Map<string, RankedProduct>();
  const customerTotals = new Map<string, RankedCustomer>();

  for (const order of current) {
    const customer = customerTotals.get(order.customerName) ?? {
      name: order.customerName,
      revenue: 0,
      orders: 0,
    };
    customer.revenue += order.total;
    customer.orders += 1;
    customerTotals.set(order.customerName, customer);

    for (const item of order.items) {
      const product = productTotals.get(item.productName) ?? {
        name: item.productName,
        revenue: 0,
        quantity: 0,
      };
      product.revenue += item.subtotal;
      product.quantity += item.quantity;
      productTotals.set(item.productName, product);
    }
  }

  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({ ...p, revenue: round2(p.revenue) }));

  const topCustomers = [...customerTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((c) => ({ ...c, revenue: round2(c.revenue) }));

  const lowStock = products
    .filter((product) => product.ativo && product.estoque <= product.estoqueMinimo)
    .sort((a, b) => a.estoque - b.estoque)
    .slice(0, 10)
    .map((product) => ({
      name: product.nome,
      stock: product.estoque,
      minStock: product.estoqueMinimo,
    }));

  return {
    periodStart: start,
    periodEnd: end,
    totalRevenue,
    orderCount: current.length,
    averageTicket: current.length > 0 ? round2(totalRevenue / current.length) : 0,
    topProducts,
    topCustomers,
    previousPeriod: {
      periodStart: prevRange.start,
      periodEnd: prevRange.end,
      totalRevenue: previousRevenue,
      orderCount: previous.length,
    },
    revenueChangePct:
      previousRevenue > 0 ? round1(((totalRevenue - previousRevenue) / previousRevenue) * 100) : null,
    lowStock,
  };
}

// ---------- resumo sem IA ----------

export function buildTemplateSummary(snapshot: SalesSnapshot): string {
  const period = `${formatDayBR(snapshot.periodStart)} a ${formatDayBR(snapshot.periodEnd)}`;

  if (snapshot.orderCount === 0) {
    return `Panorama\nNão há pedidos confirmados entre ${period}.`;
  }

  const lines: string[] = [];

  lines.push('Panorama');
  let panorama =
    `Entre ${period} foram confirmados ${snapshot.orderCount} pedido${snapshot.orderCount > 1 ? 's' : ''}, ` +
    `somando ${formatBRL(snapshot.totalRevenue)}, com ticket médio de ${formatBRL(snapshot.averageTicket)}.`;
  if (snapshot.revenueChangePct !== null) {
    const sign = snapshot.revenueChangePct > 0 ? '+' : '';
    panorama += ` Em relação ao período anterior, o faturamento variou ${sign}${snapshot.revenueChangePct
      .toString()
      .replace('.', ',')}%.`;
  } else {
    panorama += ' Não houve vendas no período anterior para comparar.';
  }
  lines.push(panorama);

  lines.push('');
  lines.push('Destaques');
  const topProduct = snapshot.topProducts[0];
  const topCustomer = snapshot.topCustomers[0];
  if (topProduct) {
    lines.push(
      `Produto com maior faturamento: ${topProduct.name} (${formatBRL(topProduct.revenue)}, ${topProduct.quantity} un.).`,
    );
  }
  if (topCustomer) {
    lines.push(`Cliente que mais comprou: ${topCustomer.name} (${formatBRL(topCustomer.revenue)}).`);
  }

  lines.push('');
  lines.push('Atenção');
  if (snapshot.lowStock.length > 0) {
    const names = snapshot.lowStock
      .slice(0, 5)
      .map((item) => `${item.name} (${item.stock}/${item.minStock})`)
      .join(', ');
    lines.push(`${snapshot.lowStock.length} produto(s) com estoque no mínimo ou abaixo: ${names}.`);
  } else {
    lines.push('Nenhum produto com estoque abaixo do mínimo.');
  }

  return lines.join('\n');
}

// ---------- chamada ao Gemini ----------

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] }; finishReason?: string }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

const readEnv = (name: string): string | undefined => {
  const value = import.meta.env?.[name] as string | undefined;
  return value?.trim() || undefined;
};

export const isAiConfigured = (): boolean => Boolean(readEnv('VITE_GEMINI_API_KEY'));

const truncate = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max)}...` : text);

async function describeHttpError(response: Response): Promise<string> {
  let detail = '';
  try {
    const body = (await response.json()) as GeminiResponse;
    detail = body.error?.message ? `: ${truncate(body.error.message, 160)}` : '';
  } catch {
    // corpo sem JSON, segue só com o status
  }

  const hints: Record<number, string> = {
    400: 'a API recusou a requisição (confira a chave e o nome do modelo)',
    401: 'chave de API inválida',
    403: 'chave sem permissão para esta API',
    404: 'modelo não encontrado (ajuste VITE_GEMINI_MODEL)',
    429: 'limite de uso da API atingido',
  };
  const hint = hints[response.status] ?? (response.status >= 500 ? 'serviço do Gemini indisponível' : 'erro na API');
  return `${hint} (HTTP ${response.status}${detail})`;
}

function extractText(data: GeminiResponse): string {
  if (data.promptFeedback?.blockReason) {
    throw new Error(`a API bloqueou o conteúdo (${data.promptFeedback.blockReason})`);
  }
  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .filter((part) => !part.thought && typeof part.text === 'string')
    .map((part) => part.text as string)
    .join('')
    .trim();
  if (!text) {
    throw new Error(`a API devolveu uma resposta vazia${candidate?.finishReason ? ` (${candidate.finishReason})` : ''}`);
  }
  return text;
}

async function callGemini(
  snapshot: SalesSnapshot,
  apiKey: string,
  model: string,
  fetchFn: typeof fetch,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetchFn(`${API_BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: 'user',
            parts: [{ text: `Métricas do período (JSON):\n${JSON.stringify(snapshot)}` }],
          },
        ],
        // O limite é folgado porque modelos com raciocínio contam esses tokens na saída.
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await describeHttpError(response));
    }
    return extractText((await response.json()) as GeminiResponse);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('a API demorou mais de 30 segundos para responder');
    }
    if (error instanceof TypeError) {
      throw new Error('falha de rede ao chamar a API (conexão ou bloqueio do navegador)');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateSummary(
  snapshot: SalesSnapshot,
  options: GenerateSummaryOptions = {},
): Promise<SummaryResult> {
  const apiKey = options.apiKey?.trim() || readEnv('VITE_GEMINI_API_KEY');
  const model = options.model?.trim() || readEnv('VITE_GEMINI_MODEL') || DEFAULT_MODEL;

  if (!apiKey) {
    return { text: buildTemplateSummary(snapshot), source: 'template' };
  }

  const fetchFn = options.fetchFn ?? fetch;
  // Se o modelo estiver sobrecarregado (503) ou no limite (429), tenta de novo e depois com um modelo reserva.
  const attempts: Array<{ model: string; delayMs: number }> = [
    { model, delayMs: 0 },
    { model, delayMs: 2000 },
    ...(model !== FALLBACK_MODEL ? [{ model: FALLBACK_MODEL, delayMs: 1000 }] : []),
  ];

  try {
    let lastError: unknown;
    for (const attempt of attempts) {
      if (attempt.delayMs) await new Promise((resolve) => setTimeout(resolve, attempt.delayMs));
      try {
        const text = await callGemini(snapshot, apiKey, attempt.model, fetchFn);
        return { text, source: 'ia', model: attempt.model };
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : '';
        const temporary = /HTTP (503|429|500|502|504)/.test(message);
        if (!temporary) throw error;
      }
    }
    throw lastError;
  } catch (error) {
    return {
      text: buildTemplateSummary(snapshot),
      source: 'template',
      warning: error instanceof Error ? error.message : 'erro desconhecido',
    };
  }
}