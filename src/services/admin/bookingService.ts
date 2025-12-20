import api from "../api";

export interface Booking {
  id: number;
  user_id: number;
  field_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  total_amount: number;
  status: "pending" | "confirmed" | "playing" | "completed" | "cancelled";
  customer_name: string;
  customer_phone: string;
  notes?: string;
  field?: { name: string };
  created_at: string;
  updated_at: string;
}

// Định nghĩa kiểu dữ liệu cho hàm tạo mới
export interface CreateBookingData {
  field_id: number;
  start_time: string; // Định dạng: YYYY-MM-DD HH:mm:ss
  end_time: string; // Định dạng: YYYY-MM-DD HH:mm:ss
  customer_name: string;
  customer_phone: string;
  notes?: string;
}

export interface BookingFilters {
  status?: string;
  page?: number;
}

const adminBookingService = {
  // 1. Lấy danh sách booking
  getBookings: async (filters?: BookingFilters) => {
    const response = await api.get("/bookings", { params: filters });
    return response.data;
  },

  // 2. Lấy chi tiết booking
  getBookingById: async (id: number | string) => {
    console.log(`[Service] Đang gọi API lấy chi tiết Booking ID: ${id}`);
    try {
      const response = await api.get(`/bookings/${id}`);
      console.log("[Service] Dữ liệu Booking nhận được:", response.data);
      return response.data;
    } catch (error) {
      console.error("[Service] Lỗi khi gọi API getBookingById:", error);
      throw error;
    }
  },

  // 3. Tạo đơn đặt sân mới (Hàm bạn đang cần)
  createBooking: async (data: CreateBookingData) => {
    const response = await api.post("/bookings", data);
    return response.data; // Trả về { success: true, message: "...", data: { ... } }
  },

  // 4. Cập nhật trạng thái (Xác nhận, Bắt đầu, Hoàn thành, Hủy)
  updateBooking: async (id: number | string, data: any) => {
    console.log(`[Service] Đang gửi yêu cầu cập nhật ID: ${id}`, data);
    try {
      const response = await api.put(`/bookings/${id}`, data);
      console.log("[Service] Kết quả cập nhật:", response.data);
      return response.data;
    } catch (error) {
      console.error("[Service] Lỗi khi gọi API updateBooking:", error);
      throw error;
    }
  },

  // 5. Lấy lịch trống của sân
  getSchedule: async (fieldId: number | string, date: string) => {
    const response = await api.get(`/fields/${fieldId}/schedule`, {
      params: { date },
    });
    return response.data;
  },

  // 6 
 
};

export default adminBookingService;
