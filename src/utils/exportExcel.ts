/**
 * Export data to Excel/CSV file
 * This is a simple implementation without external dependencies
 * For production, consider using libraries like xlsx or exceljs
 */

export interface ExportColumn {
  key: string;
  title: string;
  format?: (value: unknown) => string;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
}

/**
 * Convert data to CSV format
 */
function convertToCSV(columns: ExportColumn[], data: Record<string, unknown>[]): string {
  // Header row
  const headers = columns.map((col) => `"${col.title}"`).join(',');

  // Data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col.key];
        const formattedValue = col.format ? col.format(value) : String(value ?? '');
        // Escape quotes and wrap in quotes
        return `"${formattedValue.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csv: string, filename: string): void {
  // Add BOM for UTF-8 encoding (helps Excel recognize Vietnamese characters)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCSV(options: ExportOptions): void {
  const { filename, columns, data } = options;
  const csv = convertToCSV(columns, data);
  downloadCSV(csv, filename);
}

/**
 * Format helpers for common data types
 */
export const formatters = {
  currency: (value: unknown): string => {
    const num = Number(value);
    return isNaN(num) ? '' : `${num.toLocaleString('vi-VN')}đ`;
  },
  
  date: (value: unknown): string => {
    if (!value) return '';
    const date = new Date(String(value));
    return date.toLocaleDateString('vi-VN');
  },
  
  datetime: (value: unknown): string => {
    if (!value) return '';
    const date = new Date(String(value));
    return date.toLocaleString('vi-VN');
  },
  
  boolean: (value: unknown): string => {
    return value ? 'Có' : 'Không';
  },
  
  status: (statusMap: Record<string, string>) => (value: unknown): string => {
    return statusMap[String(value)] || String(value);
  },
};

// Example usage:
// exportToCSV({
//   filename: 'orders-report',
//   columns: [
//     { key: 'orderCode', title: 'Mã đơn hàng' },
//     { key: 'total', title: 'Tổng tiền', format: formatters.currency },
//     { key: 'createdAt', title: 'Ngày tạo', format: formatters.datetime },
//     { key: 'status', title: 'Trạng thái', format: formatters.status({ pending: 'Chờ xử lý', completed: 'Hoàn thành' }) },
//   ],
//   data: orders,
// });
