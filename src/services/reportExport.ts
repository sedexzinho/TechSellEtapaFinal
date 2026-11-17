import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatDayBR } from './aiService';
import { PERIOD_REPORTS, REPORT_COLUMNS, REPORT_LABELS, formatCell } from './reportData';
import type { ReportRow, ReportType } from './reportData';

export interface ExportInput {
  type: ReportType;
  startDate: string;
  endDate: string;
  rows: ReportRow[];
  /** Texto do resumo (IA ou template), quando o usuário gerou um. */
  summary?: { text: string; source: 'ia' | 'template' } | null;
}

const periodLabel = ({ type, startDate, endDate }: ExportInput): string =>
  PERIOD_REPORTS.includes(type)
    ? `Período: ${formatDayBR(startDate)} a ${formatDayBR(endDate)}`
    : 'Posição atual (sem filtro de período)';

const fileBase = ({ type, startDate, endDate }: ExportInput): string =>
  PERIOD_REPORTS.includes(type)
    ? `relatorio-${type}-${startDate}_a_${endDate}`
    : `relatorio-${type}-${new Date().toISOString().slice(0, 10)}`;

const summaryNote = (source: 'ia' | 'template'): string =>
  source === 'ia' ? 'Resumo gerado por IA (Gemini). Confira os números antes de usar.' : 'Resumo automático, gerado sem IA.';

export function exportReportPdf(input: ExportInput): void {
  const columns = REPORT_COLUMNS[input.type];
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const pageBottom = doc.internal.pageSize.getHeight() - margin;
  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`TechSell - Relatório de ${REPORT_LABELS[input.type]}`, margin, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(periodLabel(input), margin, y);
  y += 5;
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} - ${input.rows.length} registro(s)`, margin, y);

  if (input.summary) {
    y += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Resumo', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines: string[] = doc.splitTextToSize(input.summary.text, maxWidth);
    for (const line of lines) {
      y += 5;
      if (y > pageBottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
    }

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(summaryNote(input.summary.source), margin, y);
    doc.setTextColor(0);
  }

  autoTable(doc, {
    startY: y + 6,
    margin: { left: margin, right: margin },
    head: [columns.map((column) => column.label)],
    body: input.rows.map((row) => columns.map((column) => formatCell(column.key, row[column.key]))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(`${fileBase(input)}.pdf`);
}

export function exportReportExcel(input: ExportInput): void {
  const columns = REPORT_COLUMNS[input.type];
  const workbook = XLSX.utils.book_new();

  // Números ficam como número para o Excel poder somar e filtrar.
  const header = columns.map((column) => column.label);
  const body = input.rows.map((row) =>
    columns.map((column) => {
      const value = row[column.key];
      if (typeof value === 'number') return value;
      if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
      if (column.key === 'date' && typeof value === 'string') return formatDayBR(value.slice(0, 10));
      return value ?? '';
    }),
  );

  const dataSheet = XLSX.utils.aoa_to_sheet([header, ...body]);
  dataSheet['!cols'] = columns.map((column) => ({ wch: Math.max(14, column.label.length + 2) }));
  XLSX.utils.book_append_sheet(workbook, dataSheet, REPORT_LABELS[input.type].slice(0, 31));

  if (input.summary) {
    const summaryLines = [
      [`Relatório de ${REPORT_LABELS[input.type]}`],
      [periodLabel(input)],
      [summaryNote(input.summary.source)],
      [],
      ...input.summary.text.split('\n').map((line) => [line]),
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryLines);
    summarySheet['!cols'] = [{ wch: 110 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
  }

  XLSX.writeFile(workbook, `${fileBase(input)}.xlsx`);
}
