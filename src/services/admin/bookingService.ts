import api from '../api';

export interface Booking {
  id: number;
  booking_code: string;
  field_id: number;
  field_name: string;
  customer_id?: number;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  total_price: number;
  deposit?: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingFilters {
  status?: string;
  field_id?: number;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface BookingStatistics {
  total_bookings: number;
  total_revenue: number;
  bookings_by_status: Record<string, number>;
  bookings_by_field: Array<{ field_id: number; field_name: string; count: number }>;
}

// Admin Booking API
const adminBookingService = {
  // Lấy danh sách booking
  getBookings: async (filters?: BookingFilters) => {
    const response = await api.get('/admin/bookings', { params: filters });
    return response.data;
  },

  // Lấy chi tiết booking
  getBooking: async (id: number) => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
  },

  // Duyệt booking
  approveBooking: async (id: number) => {
    const response = await api.patch(`/admin/bookings/${id}/approve`);
    return response.data;
  },

  // Từ chối booking
  rejectBooking: async (id: number, reason?: string) => {
    const response = await api.patch(`/admin/bookings/${id}/reject`, { reason });
    return response.data;
  },

  // Lấy thống kê
  getStatistics: async (date_from?: string, date_to?: string): Promise<BookingStatistics> => {
    const response = await api.get('/admin/bookings/statistics', { params: { date_from, date_to } });
    return response.data;
  },
};

export default adminBookingService;
