import api from '../api';

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrderData {
  customer_name?: string;
  customer_phone?: string;
  items: OrderItem[];
  payment_method?: string;
  notes?: string;
}

export interface Order {
  id: number;
  order_code: string;
  items: any[];
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

// Customer Order API
const customerOrderService = {
  // Tạo đơn hàng mới
  createOrder: async (data: CreateOrderData) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Lấy đơn hàng của tôi
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  // Lấy chi tiết đơn hàng
  getOrder: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Hủy đơn hàng
  cancelOrder: async (id: number, reason?: string) => {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
};

export default customerOrderService;
