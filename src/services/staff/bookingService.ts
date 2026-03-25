import api from "../api";

// 1. Interface chung cho phản hồi từ Laravel API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// 2. Interface cho đối tượng Booking chuẩn xác
// services/staff/staffBookingService.ts

export interface Booking {
  id: number;
  booking_code: string;
  field_id: number;
  field_name: string; // ✅ Đảm bảo có cái này để dùng r.field_name
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status:
    | "pending"
    | "approved"
    | "playing"
    | "completed"
    | "cancelled"
    | "rejected";
  total_price: number; // ✅ Đổi từ total_amount thành total_price để khớp UI
  total_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  field?: {
    // Nếu Backend trả về object field lồng nhau
    id: number;
    name: string;
  };
}

// 3. Interface cho bộ lọc (Filters)

export interface BookingFilters {
  status?: string;
  field_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

// ✅ Interface cho phản hồi danh sách (Xử lý phân trang Laravel)
export interface BookingListResponse {
  data: Booking[] | { data: Booking[] };
}

// Staff Booking API
const staffBookingService = {
  // ✅ CẬP NHẬT: Thêm kiểu trả về cho danh sách (Paginated hoặc Array)
  getBookings: async (
    filters?: BookingFilters,
  ): Promise<ApiResponse<{ data: Booking[] } | Booking[]>> => {
    const response = await api.get("/bookings", { params: filters });
    return response.data;
  },

  // ✅ CẬP NHẬT: Thêm kiểu trả về cho chi tiết
  getBooking: async (id: number | string): Promise<ApiResponse<Booking>> => {
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

  /**
   * ✅ CẬP NHẬT TRẠNG THÁI BOOKING (Dùng cho nút Bắt đầu/Kết thúc)
   * Sạch any: Nhận vào id và status chuẩn
   */
  // ✅ CẬP NHẬT: Thêm kiểu trả về cho status
  updateStatus: async (
    id: number | string,
    status: "playing" | "completed" | "cancelled" | "approved",
  ): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${id}/status`,
        { status },
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error(`[Staff Service] ❌ Lỗi updateStatus (${id}):`, err);
      throw err;
    }
  },
};

export default staffBookingService;
