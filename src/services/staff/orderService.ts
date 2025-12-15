import api from '../api';

export interface Order {
  id: number;
  order_code: string;
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
  notes?: string;
  created_at: string;
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

// Staff Order API
const staffOrderService = {
  // Lấy danh sách đơn hàng
  getOrders: async (filters?: OrderFilters) => {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  },

  // Lấy chi tiết đơn hàng
  getOrder: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (id: number, status: Order['status']) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: async (id: number, payment_status: Order['payment_status']) => {
    const response = await api.patch(`/orders/${id}/payment`, { payment_status });
    return response.data;
  },
};

export default staffOrderService;
