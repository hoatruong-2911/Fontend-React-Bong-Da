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

  amount_paid?: number;
  deposit_amount?: number;
  payment_type?: "full" | "deposit";
  payment_status?: string;
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
  // getBookings: async (
  //   filters?: BookingFilters,
  // ): Promise<ApiResponse<{ data: Booking[] } | Booking[]>> => {
  //   const response = await api.get("/bookings", { params: filters });
  //   return response.data;
  // },
  // 🚀 CẬP NHẬT CHÍNH XÁC: Định nghĩa rõ Object phân trang trả về từ Laravel Pagination để sạch any
  getBookings: async (
    filters?: BookingFilters,
  ): Promise<
    ApiResponse<
      { data: Booking[]; total: number; current_page: number } | Booking[]
    >
  > => {
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
    status?: string | null,
    payment_status?: string | null,
  ): Promise<ApiResponse<Booking>> => {
    try {
      const data: any = {};
      if (status !== undefined) data.status = status;
      if (payment_status !== undefined) data.payment_status = payment_status;

      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${id}/status`,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error(`[Staff Service] ❌ Lỗi updateStatus (${id}):`, err);
      throw err;
    }
  },

  /**
   * Cập nhật hàm createBooking trỏ đúng sang endpoint store2 chuyên dụng của Staff
   */
  createBooking: async (
    data: Partial<Booking>,
  ): Promise<ApiResponse<Booking>> => {
    console.log("[Staff Service] >>> Đang đẩy payload sang store2:", data);
    try {
      // ĐẢM BẢO ĐOẠN NÀY PHẢI CÓ CHỮ "/staff/bookings"
      const response = await api.post<ApiResponse<Booking>>(
        "/staff/bookings/create",
        data,
      );
      return response.data;
    } catch (error: unknown) {
      console.error("[Staff Service] ❌ Lỗi createBooking:", error);
      throw error;
    }
  },

  /**
   * 🚀 BỔ SUNG: Hàm tạo chuỗi đặt sân định kỳ còn thiếu
   * Trỏ đến endpoint /bookings/recurring của BookingController@createRecurring
   */
  createRecurringBooking: async (data: any): Promise<any> => {
    console.log(
      "[Staff Service] >>> Đang đẩy payload ĐƠN CHUỖI sang create-recurring:",
      data,
    );
    try {
      const response = await api.post("/bookings/recurring", data);
      return response.data;
    } catch (error: unknown) {
      console.error("[Staff Service] ❌ Lỗi createRecurringBooking:", error);
      throw error;
    }
  },

  confirmDeposit: async (
    recurringGroupId: string | number,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>(
        `/bookings/confirm-deposit/${recurringGroupId}`,
      );
      return response.data;
    } catch (error: unknown) {
      console.error("[Staff Service] ❌ Lỗi confirmDeposit:", error);
      throw error;
    }
  },
};

export default staffBookingService;
