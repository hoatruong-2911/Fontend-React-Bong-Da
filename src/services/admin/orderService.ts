import api from '../api';

export interface Order {
  id: number;
  order_code: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  payment_method?: string;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  staff_id?: number;
  staff_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  customer_id?: number;
  staff_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface OrderStatistics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
}

// Admin Order API
const adminOrderService = {
  // Lấy danh sách đơn hàng
  getOrders: async (filters?: OrderFilters) => {
    const response = await api.get('/admin/orders', { params: filters });
    return response.data;
  },

  // Lấy chi tiết đơn hàng
  getOrder: async (id: number) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  // Cập nhật trạng thái
  updateStatus: async (id: number, status: Order['status']) => {
    const response = await api.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  // Lấy thống kê
  getStatistics: async (date_from?: string, date_to?: string): Promise<OrderStatistics> => {
    const response = await api.get('/admin/orders/statistics', { params: { date_from, date_to } });
    return response.data;
  },
};

export default adminOrderService;
