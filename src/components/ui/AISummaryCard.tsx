import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateSummary, isAiConfigured } from '../../services/aiService';
import type { SalesSnapshot, SummaryResult } from '../../services/aiService';

interface AISummaryCardProps {
  title: string;
  description: string;
  snapshot: SalesSnapshot | null;
  summary: SummaryResult | null;
  onSummaryChange: (summary: SummaryResult | null) => void;
}

const AISummaryCard = ({ title, description, snapshot, summary, onSummaryChange }: AISummaryCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasSales = Boolean(snapshot && snapshot.orderCount > 0);
  const aiReady = isAiConfigured();

  const handleGenerate = async () => {
    if (!snapshot || isLoading) return;
    setIsLoading(true);
    setCopied(false);
    try {
      onSummaryChange(await generateSummary(snapshot));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="surface-card p-5" aria-labelledby="ai-summary-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="ai-summary-title" className="section-title mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {title}
          </h2>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!hasSales || isLoading}
          className="btn-primary shrink-0"
        >
          {isLoading ? 'Gerando resumo...' : summary ? 'Gerar novamente' : 'Gerar resumo'}
        </button>
      </div>

      {!aiReady && (
        <p className="mt-3 text-xs text-text-secondary">
          Chave do Gemini não configurada. O resumo será montado sem IA. Para usar a IA, defina VITE_GEMINI_API_KEY no
          arquivo .env.local.
        </p>
      )}

      {snapshot && !hasSales && (
        <p className="mt-3 text-sm text-text-secondary">Não há pedidos confirmados no período para resumir.</p>
      )}

      <div aria-live="polite">
        {summary && (
          <div className="mt-4 space-y-3">
            <p className="whitespace-pre-line text-sm leading-relaxed">{summary.text}</p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="badge">
                {summary.source === 'ia'
                  ? 'Gerado por IA. Confira os números antes de usar.'
                  : 'Resumo automático, gerado sem IA'}
              </span>
              <button type="button" onClick={handleCopy} className="btn-sm border border-navy-border">
                {copied ? 'Copiado' : 'Copiar texto'}
              </button>
            </div>

            {summary.warning && (
              <p className="alert-error text-sm">A IA não respondeu e o resumo foi montado sem ela: {summary.warning}.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AISummaryCard;
