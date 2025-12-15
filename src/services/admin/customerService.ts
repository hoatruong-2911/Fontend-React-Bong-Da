import api from '../api';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  total_orders: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

// Admin Customer API
const adminCustomerService = {
  // Lấy danh sách khách hàng
  getCustomers: async (filters?: CustomerFilters) => {
    const response = await api.get('/admin/customers', { params: filters });
    return response.data;
  },

  // Lấy chi tiết khách hàng
  getCustomer: async (id: number) => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  // Cập nhật khách hàng
  updateCustomer: async (id: number, data: Partial<Customer>) => {
    const response = await api.put(`/admin/customers/${id}`, data);
    return response.data;
  },

  // Lấy lịch sử đơn hàng của khách
  getCustomerOrders: async (id: number) => {
    const response = await api.get(`/admin/customers/${id}/orders`);
    return response.data;
  },

  // Lấy lịch sử booking của khách
  getCustomerBookings: async (id: number) => {
    const response = await api.get(`/admin/customers/${id}/bookings`);
    return response.data;
  },
};

export default adminCustomerService;
