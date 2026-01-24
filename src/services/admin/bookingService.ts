import api from "../api";

// 1. Định nghĩa Interface Booking chuẩn (Khớp với Model & Protected Casts)
export interface Booking {
  id: number;
  user_id: number;
  field_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  total_amount: number;
  status:
    | "pending"
    | "confirmed"
    | "playing"
    | "completed"
    | "cancelled"
    | "approved"
    | "rejected";
  customer_name: string;
  customer_phone: string;
  notes?: string;
  field?: {
    id: number;
    name: string;
    price: number;
  };
  user?: {
    id: number;
    name: string;
    profile?: {
      phone?: string;
    };
  };
  created_at: string;
  updated_at: string;
}

// 2. Interface cho phản hồi API chung
export interface ApiResponse<T> {
  success: boolean;
  status?: string;
  message?: string;
  data: T;
}

export interface BookingFilters {
  status?: string;
  page?: number;
}

const adminBookingService = {
  // 1. Lấy danh sách booking (Phân trang của Laravel trả về cấu trúc lồng)
  getBookings: async (
    filters?: BookingFilters,
  ): Promise<ApiResponse<{ data: Booking[]; total: number }>> => {
    console.log(
      "[Service] >>> Đang lấy danh sách Booking với bộ lọc:",
      filters,
    );
    try {
      const response = await api.get<
        ApiResponse<{ data: Booking[]; total: number }>
      >("/bookings", { params: filters });
      console.log("[Service] <<< Danh sách nhận về:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("[Service] ❌ Lỗi getBookings:", error);
      throw error;
    }
  },

  // 2. Lấy chi tiết booking (Model Binding)
  getBookingById: async (
    id: number | string,
  ): Promise<ApiResponse<Booking>> => {
    console.log(`[Service] >>> Truy vấn chi tiết Booking ID: ${id}`);
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
      console.log("[Service] <<< Dữ liệu chi tiết:", response.data);

      // LOG KIỂM TRA QUAN HỆ: Nếu field null là do Backend chưa load()
      if (response.data.data && !response.data.data.field) {
        console.warn(
          `[Service] ⚠️ Cảnh báo: Booking #${id} bị thiếu quan hệ 'field'.`,
        );
      }

      return response.data;
    } catch (error: unknown) {
      console.error(`[Service] ❌ Lỗi getBookingById (${id}):`, error);
      throw error;
    }
  },

  // 3. Tạo đơn đặt sân mới
  createBooking: async (
    data: Partial<Booking>,
  ): Promise<ApiResponse<Booking>> => {
    console.log("[Service] >>> Tạo Booking mới:", data);
    try {
      const response = await api.post<ApiResponse<Booking>>("/bookings", data);
      console.log("[Service] <<< Kết quả tạo mới:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("[Service] ❌ Lỗi tạo đặt sân:", error);
      throw error;
    }
  },

  // 4. Cập nhật thông tin booking (PUT)
  updateBooking: async (
    id: number | string,
    data: Partial<Booking>,
  ): Promise<ApiResponse<Booking>> => {
    console.log(
      `[Service] >>> Cập nhật Booking ID: ${id}. Data gửi lên:`,
      data,
    );
    try {
      const response = await api.put<ApiResponse<Booking>>(
        `/bookings/${id}`,
        data,
      );
      console.log("[Service] <<< Kết quả cập nhật (PUT):", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error(`[Service] ❌ Lỗi updateBooking (${id}):`, error);
      throw error;
    }
  },

  // 5. Lấy lịch trống của sân
  getSchedule: async (
    fieldId: number | string,
    date: string,
  ): Promise<ApiResponse<any[]>> => {
    console.log(`[Service] >>> Lấy lịch sân ID: ${fieldId}, ngày: ${date}`);
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `/fields/${fieldId}/schedule`,
        { params: { date } },
      );
      console.log("[Service] <<< Lịch trống:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("[Service] ❌ Lỗi getSchedule:", error);
      throw error;
    }
  },

  // 6. Cập nhật trạng thái nhanh (PATCH)
  updateStatus: async (
    id: number | string,
    status: string,
  ): Promise<ApiResponse<Booking>> => {
    console.log(`[Service] >>> Đổi trạng thái ID: ${id} sang: ${status}`);
    try {
      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${id}/status`,
        { status },
      );
      console.log("[Service] <<< Kết quả đổi trạng thái:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error(`[Service] ❌ Lỗi updateStatus (${id}):`, error);
      throw error;
    }
  },

  // 7. Xóa đơn đặt sân
  deleteBooking: async (id: number | string): Promise<ApiResponse<null>> => {
    console.log(`[Service] >>> Yêu cầu xóa Booking ID: ${id}`);
    try {
      const response = await api.delete<ApiResponse<null>>(`/bookings/${id}`);
      console.log("[Service] <<< Kết quả xóa:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error(`[Service] ❌ Lỗi deleteBooking (${id}):`, error);
      throw error;
    }
  },

  // Trong adminBookingService.ts
  cancelMyBooking: async (
    id: number | string,
  ): Promise<ApiResponse<Booking>> => {
    console.log(`[Service] >>> Khách hàng yêu cầu hủy đơn ID: ${id}`);
    // Gọi đúng cái route mới mình vừa tạo ở Bước 1
    const response = await api.patch<ApiResponse<Booking>>(
      `/bookings/${id}/cancel-my-booking`,
    );
    return response.data;
  },
};

export default adminBookingService;
