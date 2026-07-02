import api from "../api";
import { AxiosError } from "axios";

export interface CreateBookingData {
  field_id: number; // Frontend gửi Full Datetime, Backend sẽ tự tách
  start_time: string; // YYYY-MM-DD HH:mm:ss
  end_time: string; // YYYY-MM-DD HH:mm:ss
  customer_name: string;
  customer_phone: string;
  notes?: string;
  payment_type?: string;
}
// BỔ SUNG: Dữ liệu gửi đi cho ĐẶT SÂN ĐỊNH KỲ (Recurring)
export interface CreateRecurringBookingData {
  field_id: number;
  start_date: string; // Ngày bắt đầu chuỗi (YYYY-MM-DD)
  number_of_months: number; // 1, 3, 6 tháng
  start_time: string; // Giờ đá (HH:mm)
  end_time: string; // Giờ nghỉ (HH:mm)
  customer_name: string;
  customer_phone: string;
  notes?: string;
  payment_type?: string;
}

// ĐỒNG BỘ: Cập nhật Interface Booking khớp 100% với database thật
export interface Booking {
  id: number;
  recurring_group_id?: string | null; // Cột mới
  user_id: number; // Khớp cấu hình
  field_id: number;
  staff_id?: number | null; // Khớp cấu hình
  booking_date: string; // Khớp cấu hình
  start_time: string; // Khớp cấu hình
  end_time: string; // Khớp cấu hình
  duration: number; // Khớp cấu hình
  total_amount: number; // Khớp cấu hình
  deposit_amount: number; // Cột mới
  status: string; // Khớp cấu hình
  payment_status: "unpaid" | "partial_paid" | "fully_paid"; // Cột mới
  customer_name: string; // Khớp cấu hình
  customer_phone: string; // Khớp cấu hình
  notes?: string | null; // Khớp cấu hình
  approved_by?: number | null; // Khớp cấu hình
  approved_at?: string | null; // Khớp cấu hình
  created_at: string;
  updated_at: string;
}

// Interface cho phản hồi lịch bận của sân
export interface FieldOccupation {
  id: number;
  field_id: number;
  start_time: string; // HH:mm:ss hoặc YYYY-MM-DD HH:mm:ss tùy DB
  end_time: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Interface cho phản hồi lịch bận của sân
export interface FieldOccupation {
  id: number;
  field_id: number;
  start_time: string; // HH:mm:ss hoặc YYYY-MM-DD HH:mm:ss tùy DB
  end_time: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Customer Booking API
const customerBookingService = {
  // Tạo booking mới (ĐÃ THÊM LOG CHI TIẾT)
  createBooking: async (data: CreateBookingData) => {
    // --- BƯỚC 1: LOG DỮ LIỆU ĐƯỢC GỬI ĐI ---
    console.log(
      `[API Booking] Gửi yêu cầu đặt sân cho Field ID: ${data.field_id}`,
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
        `[API Booking] LỖI đặt sân! Status: ${error.response?.status}`,
      );
      console.error(
        `[API Booking] Chi tiết lỗi:`,
        error.response?.data || error,
      );

      // Quan trọng: Ném lỗi để component calling (BookingPage) xử lý
      throw error;
    }
  }, // Lấy booking của tôi

  // 🚀 BỔ SUNG CHÍNH XÁC: API Đặt sân định kỳ cố định hàng tuần
  createRecurringBooking: async (data: CreateRecurringBookingData) => {
    console.log(
      `[API Recurring Booking] Gửi chuỗi đặt sân định kỳ cho Field ID: ${data.field_id}`,
    );
    console.log(
      `[API Recurring Booking] Thời gian: Cố định vào khung giờ ${data.start_time} - ${data.end_time} trong vòng ${data.number_of_months} tháng.`,
    );
    try {
      const response = await api.post("/bookings/recurring", data);
      console.log(
        `[API Recurring Booking] Đặt chuỗi thành công! Mã nhóm:`,
        response.data.recurring_group_id,
      );
      return response.data;
    } catch (error: unknown) {
      // 🚀 Sửa any thành unknown theo chuẩn bảo mật mới của TS
      const axiosError = error as AxiosError; // Ép kiểu an toàn (Type Assertion)
      console.error(
        `[API Recurring Booking] LỖI đặt sân chuỗi định kỳ!`,
        axiosError.response?.data || axiosError.message,
      );
      throw axiosError;
    }
  },

  // 🚀 BỔ SUNG CHÍNH XÁC: Admin hoặc Staff bấm xác nhận nhận được tiền cọc
  confirmDeposit: async (recurring_group_id: string) => {
    console.log(
      `[API Admin Admin] Xác nhận nhận cọc chuỗi cho mã nhóm: ${recurring_group_id}`,
    );
    try {
      const response = await api.post(
        `/bookings/confirm-deposit/${recurring_group_id}`,
      );
      return response.data;
    } catch (error: unknown) {
      // 🚀 Sửa any thành unknown theo chuẩn bảo mật mới của TS
      const axiosError = error as AxiosError; // Ép kiểu an toàn (Type Assertion)
      console.error(
        `[API Admin Admin] LỖI khi duyệt cọc chuỗi!`,
        axiosError.response?.data || axiosError.message,
      );
      throw axiosError;
    }
  },

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

  getFieldSchedule: async (
    field_id: number,
    date: string,
  ): Promise<ApiResponse<FieldOccupation[]>> => {
    try {
      const response = await api.get<ApiResponse<FieldOccupation[]>>(
        "/bookings/field-schedule",
        { params: { field_id, date } },
      );
      return response.data;
    } catch (error: unknown) {
      console.error("[Customer Service] ❌ Lỗi lấy lịch sân:", error);
      throw error;
    }
  },
};

export default customerBookingService;
