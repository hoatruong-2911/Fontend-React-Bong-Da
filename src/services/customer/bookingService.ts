import api from "../api";

export interface CreateBookingData {
  field_id: number; // Frontend gửi Full Datetime, Backend sẽ tự tách
  start_time: string; // YYYY-MM-DD HH:mm:ss
  end_time: string; // YYYY-MM-DD HH:mm:ss
  customer_name: string;
  customer_phone: string;
  notes?: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  field_id: number;
  field_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  created_at: string;
}

// Customer Booking API
const customerBookingService = {
  // Tạo booking mới (ĐÃ THÊM LOG CHI TIẾT)
  createBooking: async (data: CreateBookingData) => {
    // --- BƯỚC 1: LOG DỮ LIỆU ĐƯỢC GỬI ĐI ---
    console.log(
      `[API Booking] Gửi yêu cầu đặt sân cho Field ID: ${data.field_id}`
    );
    console.log(`[API Booking] Payload chi tiết:`, data);

    try {
      const response = await api.post("/bookings", data);

      // --- BƯỚC 2: LOG PHẢN HỒI THÀNH CÔNG ---
      console.log(`[API Booking] Đặt sân thành công (201 Created)`);
      console.log(`[API Booking] Phản hồi từ Server:`, response.data);

      return response.data;
    } catch (error) {
      // --- BƯỚC 3: LOG PHẢN HỒI LỖI ---
      console.error(
        `[API Booking] LỖI đặt sân! Status: ${error.response?.status}`
      );
      console.error(
        `[API Booking] Chi tiết lỗi:`,
        error.response?.data || error
      );

      // Quan trọng: Ném lỗi để component calling (BookingPage) xử lý
      throw error;
    }
  }, // Lấy booking của tôi

  getMyBookings: async () => {
    const response = await api.get("/bookings/my-bookings");
    return response.data;
  }, // Lấy chi tiết booking

  getBooking: async (id: number) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  }, // Hủy booking

  cancelBooking: async (id: number, reason?: string) => {
    const response = await api.patch(`/bookings/${id}/cancel`, { reason });
    return response.data;
  }, // Kiểm tra slot trống

  checkAvailability: async (field_id: number, date: string) => {
    const response = await api.get(`/fields/${field_id}/schedule`, {
      params: { date },
    });
    return response.data;
  },
};

export default customerBookingService;
