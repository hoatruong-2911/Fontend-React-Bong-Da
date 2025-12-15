import api from '../api';

export interface Booking {
  id: number;
  booking_code: string;
  field_id: number;
  field_name: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  total_price: number;
  notes?: string;
  created_at: string;
}

export interface BookingFilters {
  status?: string;
  field_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

// Staff Booking API
const staffBookingService = {
  // Lấy danh sách booking
  getBookings: async (filters?: BookingFilters) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },

  // Lấy chi tiết booking
  getBooking: async (id: number) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Bắt đầu booking (khách đến)
  startBooking: async (id: number) => {
    const response = await api.patch(`/bookings/${id}/start`);
    return response.data;
  },

  // Hoàn thành booking
  completeBooking: async (id: number) => {
    const response = await api.patch(`/bookings/${id}/complete`);
    return response.data;
  },
};

export default staffBookingService;
