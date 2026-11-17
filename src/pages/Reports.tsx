import { useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { OrderRepository } from '../repositories/orderRepository';
import { ProductRepository } from '../repositories/productRepository';
import AISummaryCard from '../components/ui/AISummaryCard';
import { computeSalesSnapshot, formatDayBR, toLocalDay } from '../services/aiService';
import type { SummaryResult } from '../services/aiService';
import { PERIOD_REPORTS, REPORT_COLUMNS, REPORT_LABELS, buildReport, formatCell } from '../services/reportData';
import type { ReportRow, ReportType } from '../services/reportData';
import { exportReportExcel, exportReportPdf } from '../services/reportExport';

const defaultRange = (): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return { start: toLocalDay(start), end: toLocalDay(end) };
};

const ReportTable = ({ type, rows }: { type: ReportType; rows: ReportRow[] }) => {
  const columns = REPORT_COLUMNS[type];
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr className="bg-navy-border">
            {columns.map((column) => (
              <th key={column.key} className="text-left px-4 py-3 font-medium text-text-secondary">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="bg-navy-darker/50 hover:bg-navy-border/50 transition-colors border-b border-navy-border/50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-text-primary">
                  {formatCell(column.key, row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportsPage = () => {
  const { user } = useAuthStore();

  const [reportType, setReportType] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState(() => defaultRange().start);
  const [endDate, setEndDate] = useState(() => defaultRange().end);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [summary, setSummary] = useState<SummaryResult | null>(null);

  const usesPeriod = PERIOD_REPORTS.includes(reportType);

  const report = useMemo(() => buildReport(reportType, startDate, endDate), [reportType, startDate, endDate]);

  const snapshot = useMemo(() => {
    if (reportType !== 'sales' || report.error) return null;
    return computeSalesSnapshot(new OrderRepository().findAll(), new ProductRepository().findAll(), startDate, endDate);
  }, [reportType, report.error, startDate, endDate]);

  // O resumo vale para um período e um tipo; ao mudar qualquer filtro, ele deixa de valer.
  const changeType = (value: ReportType) => {
    setReportType(value);
    setSummary(null);
  };
  const changeStart = (value: string) => {
    setStartDate(value);
    setSummary(null);
  };
  const changeEnd = (value: string) => {
    setEndDate(value);
    setSummary(null);
  };

  if (user?.perfil !== 'ADMIN') {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <div className="text-center">
            <p className="text-xl">Acesso negado</p>
            <p className="text-text-primary/70 mt-2">Esta página está disponível apenas para administradores.</p>
          </div>
        </div>
      </div>
    );
  }

  const exportInput = { type: reportType, startDate, endDate, rows: report.rows, summary };
  const hasRows = report.rows.length > 0;
  const periodText = usesPeriod
    ? `${formatDayBR(startDate)} a ${formatDayBR(endDate)}`
    : 'posição atual, sem filtro de período';

  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Geração de relatórios para análise do negócio</p>
      </div>

      <div className="surface-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-text-primary mb-1">
              Tipo de relatório
            </label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => changeType(e.target.value as ReportType)}
              className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
            >
              {(Object.keys(REPORT_LABELS) as ReportType[]).map((type) => (
                <option key={type} value={type}>
                  {REPORT_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-start" className="block text-sm font-medium text-text-primary mb-1">
              Data inicial
            </label>
            <input
              id="report-start"
              type="date"
              value={startDate}
              disabled={!usesPeriod}
              onChange={(e) => changeStart(e.target.value)}
              className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="report-end" className="block text-sm font-medium text-text-primary mb-1">
              Data final
            </label>
            <input
              id="report-end"
              type="date"
              value={endDate}
              disabled={!usesPeriod}
              onChange={(e) => changeEnd(e.target.value)}
              className="w-full bg-navy-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-primary disabled:opacity-50"
            />
          </div>
        </div>
        {!usesPeriod && (
          <p className="mt-3 text-xs text-text-secondary">
            O período se aplica aos relatórios de vendas e de visitas e orçamentos.
          </p>
        )}
      </div>

      {reportType === 'sales' && (
        <AISummaryCard
          title="Resumo do período"
          description="Texto com panorama, destaques e pontos de atenção, escrito a partir das vendas confirmadas do período."
          snapshot={snapshot}
          summary={summary}
          onSummaryChange={setSummary}
        />
      )}

      {report.error && (
        <div className="alert-error" role="alert">
          {report.error}
        </div>
      )}

      {!report.error && (
        <div className="surface-card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-1">Resultados</h2>
          <p className="text-text-primary/70 mb-4">
            {report.rows.length} registro{report.rows.length !== 1 ? 's' : ''} ({periodText})
          </p>

          {hasRows ? (
            <ReportTable type={reportType} rows={report.rows} />
          ) : (
            <div className="empty-state">Nenhum dado encontrado para o período selecionado</div>
          )}

          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => setPreviewVisible(true)} disabled={!hasRows} className="btn-secondary">
              Pré-visualizar
            </button>
            <button type="button" onClick={() => exportReportPdf(exportInput)} disabled={!hasRows} className="btn-primary">
              Exportar PDF
            </button>
            <button type="button" onClick={() => exportReportExcel(exportInput)} disabled={!hasRows} className="btn-primary">
              Exportar Excel
            </button>
          </div>
        </div>
      )}

      {previewVisible && hasRows && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <div className="modal-panel bg-navy-surface rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-navy-border">
              <h2 id="preview-title" className="text-xl font-bold text-text-primary">
                Pré-visualização do relatório
              </h2>
              <button
                type="button"
                onClick={() => setPreviewVisible(false)}
                aria-label="Fechar pré-visualização"
                className="text-text-secondary hover:text-text-primary text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <h3 className="text-lg font-bold text-text-primary">Relatório de {REPORT_LABELS[reportType]}</h3>
              <p className="text-text-primary/70 mb-4">
                {periodText}. Total de registros: {report.rows.length}.
              </p>

              {summary && (
                <div className="mb-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed">{summary.text}</p>
                  <p className="mt-2 text-xs text-text-secondary">
                    {summary.source === 'ia' ? 'Resumo gerado por IA.' : 'Resumo automático, gerado sem IA.'}
                  </p>
                </div>
              )}

              <ReportTable type={reportType} rows={report.rows} />
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-navy-border">
              <button type="button" onClick={() => setPreviewVisible(false)} className="btn-secondary">
                Fechar
              </button>
              <button type="button" onClick={() => exportReportPdf(exportInput)} className="btn-primary">
                Exportar PDF
              </button>
              <button type="button" onClick={() => exportReportExcel(exportInput)} className="btn-primary">
                Exportar Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
