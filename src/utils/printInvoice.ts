/**
 * Print Invoice Utility
 * Generates and prints invoices for orders and bookings
 */

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceData {
  invoiceCode: string;
  type: 'order' | 'booking';
  customerName?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  staffName?: string;
  createdAt: string;
  notes?: string;
}

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email?: string;
  taxCode?: string;
}

const defaultStoreInfo: StoreInfo = {
  name: 'Stadium POS',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  phone: '0123 456 789',
  email: 'contact@stadiumpos.com',
};

/**
 * Generate HTML invoice template
 */
function generateInvoiceHTML(invoice: InvoiceData, storeInfo: StoreInfo = defaultStoreInfo): string {
  const paymentMethodText: Record<string, string> = {
    cash: 'Tiền mặt',
    card: 'Thẻ ngân hàng',
    transfer: 'Chuyển khoản',
    qr: 'QR Code',
  };

  const paymentStatusText: Record<string, string> = {
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    deposit: 'Đã đặt cọc',
    refunded: 'Đã hoàn tiền',
  };

  const itemRows = invoice.items
    .map(
      (item, index) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.unitPrice.toLocaleString()}đ</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.subtotal.toLocaleString()}đ</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hóa đơn ${invoice.invoiceCode}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 14px;
          color: #333;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #10b981;
        }
        .store-name {
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }
        .store-info {
          color: #666;
          font-size: 12px;
        }
        .invoice-title {
          font-size: 20px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          color: #333;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .info-section {
          flex: 1;
        }
        .info-row {
          margin-bottom: 5px;
        }
        .label {
          color: #666;
          font-size: 12px;
        }
        .value {
          font-weight: 500;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #10b981;
          color: white;
          padding: 10px 8px;
          text-align: left;
        }
        .summary {
          text-align: right;
          margin-top: 20px;
        }
        .summary-row {
          margin-bottom: 5px;
        }
        .total {
          font-size: 18px;
          font-weight: bold;
          color: #10b981;
          border-top: 2px solid #10b981;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px dashed #ccc;
          color: #666;
          font-size: 12px;
        }
        .notes {
          margin-top: 15px;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">${storeInfo.name}</div>
        <div class="store-info">
          ${storeInfo.address}<br>
          ĐT: ${storeInfo.phone} ${storeInfo.email ? `| Email: ${storeInfo.email}` : ''}
          ${storeInfo.taxCode ? `<br>MST: ${storeInfo.taxCode}` : ''}
        </div>
      </div>

      <div class="invoice-title">
        ${invoice.type === 'order' ? 'HÓA ĐƠN BÁN HÀNG' : 'HÓA ĐƠN ĐẶT SÂN'}
      </div>

      <div class="invoice-info">
        <div class="info-section">
          <div class="info-row">
            <span class="label">Mã hóa đơn:</span>
            <span class="value" style="color: #10b981; font-weight: bold;">${invoice.invoiceCode}</span>
          </div>
          <div class="info-row">
            <span class="label">Ngày:</span>
            <span class="value">${new Date(invoice.createdAt).toLocaleString('vi-VN')}</span>
          </div>
          ${invoice.staffName ? `
          <div class="info-row">
            <span class="label">Nhân viên:</span>
            <span class="value">${invoice.staffName}</span>
          </div>
          ` : ''}
        </div>
        <div class="info-section" style="text-align: right;">
          <div class="info-row">
            <span class="label">Khách hàng:</span>
            <span class="value">${invoice.customerName || 'Khách lẻ'}</span>
          </div>
          ${invoice.customerPhone ? `
          <div class="info-row">
            <span class="label">SĐT:</span>
            <span class="value">${invoice.customerPhone}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="label">Thanh toán:</span>
            <span class="value">${paymentMethodText[invoice.paymentMethod] || invoice.paymentMethod}</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Sản phẩm/Dịch vụ</th>
            <th style="width: 60px; text-align: center;">SL</th>
            <th style="width: 100px; text-align: right;">Đơn giá</th>
            <th style="width: 120px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span class="label">Tạm tính:</span>
          <span class="value">${invoice.subtotal.toLocaleString()}đ</span>
        </div>
        ${invoice.discount > 0 ? `
        <div class="summary-row">
          <span class="label">Giảm giá:</span>
          <span class="value" style="color: #ef4444;">-${invoice.discount.toLocaleString()}đ</span>
        </div>
        ` : ''}
        ${invoice.tax > 0 ? `
        <div class="summary-row">
          <span class="label">Thuế VAT:</span>
          <span class="value">${invoice.tax.toLocaleString()}đ</span>
        </div>
        ` : ''}
        <div class="total">
          TỔNG CỘNG: ${invoice.total.toLocaleString()}đ
        </div>
        <div style="margin-top: 5px; font-size: 12px; color: #666;">
          Trạng thái: ${paymentStatusText[invoice.paymentStatus] || invoice.paymentStatus}
        </div>
      </div>

      ${invoice.notes ? `
      <div class="notes">
        <strong>Ghi chú:</strong> ${invoice.notes}
      </div>
      ` : ''}

      <div class="footer">
        Cảm ơn quý khách đã sử dụng dịch vụ!<br>
        Hẹn gặp lại quý khách.
      </div>
    </body>
    </html>
  `;
}

/**
 * Print invoice in a new window
 */
export function printInvoice(invoice: InvoiceData, storeInfo?: StoreInfo): void {
  const html = generateInvoiceHTML(invoice, storeInfo);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
}

/**
 * Download invoice as HTML file
 */
export function downloadInvoice(invoice: InvoiceData, storeInfo?: StoreInfo): void {
  const html = generateInvoiceHTML(invoice, storeInfo);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoice.invoiceCode}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
