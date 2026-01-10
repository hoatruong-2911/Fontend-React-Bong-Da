import api from "../api";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  total_bookings: number; // Đổi từ orders sang bookings cho khớp DB
  total_spent: number;
  status: "active" | "inactive"; // Dùng status thay vì is_active cho khớp giao diện
  is_vip: boolean; // Thêm trường VIP
  last_booking?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
  totalBookings: number;
}

export interface CustomerResponse {
  success: boolean;
  data: Customer[];
  stats: CustomerStats;
}

export interface CustomerFilters {
  search?: string;
  status?: string;
  page?: number;
}

// Thêm interface này vào file service hiện tại
export interface CustomerBooking {
  id: number;
  booking_code: string;
  check_in_date: string;
  total_price: number;
  status: "completed" | "pending" | "cancelled";
}

const adminCustomerService = {
  getCustomers: async (
    filters?: CustomerFilters
  ): Promise<CustomerResponse> => {
    const response = await api.get<CustomerResponse>("/admin/customers", {
      params: filters,
    });
    return response.data;
  },

  getCustomer: async (
    id: number
  ): Promise<{ success: boolean; data: Customer }> => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  // Lấy chi tiết kèm lịch sử đặt sân
  getCustomerDetail: async (
    id: number | string
  ): Promise<{
    success: boolean;
    data: Customer;
    bookings: CustomerBooking[];
  }> => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  deleteCustomer: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/admin/customers/${id}`);
    return response.data;
  },
};

export default adminCustomerService;
