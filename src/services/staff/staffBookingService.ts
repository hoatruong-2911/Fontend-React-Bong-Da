import api from "../api";

// 1. Interface cho cấu trúc dữ liệu Booking
export interface Booking {
  id: number;
  user_id: number | null;
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

// Interface cho khung giờ sân (Sạch Any cho getSchedule)
export interface TimeSlot {
  start_time: string;
  end_time: string;
  price: number;
  status: "available" | "booked";
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface BookingFilters {
  status?: string;
  page?: number;
  date?: string;
}

export interface FieldInfo {
  id: number;
  name: string;
  location: string;
  price: number;
  type: string;
}

export interface LiveStatusData {
  fields: FieldInfo[];
  bookings: Booking[];
}
const staffBookingService = {
  /**
   * Lấy danh sách booking (Đã fix logic nạp data lồng nhau)
   */
//   getBookings: async (
//     filters?: BookingFilters,
//   ): Promise<ApiResponse<PaginatedData<Booking>>> => {
//     try {
//       const response = await api.get<ApiResponse<PaginatedData<Booking>>>(
//         "/bookings",
//         { params: filters },
//       );
//       // Laravel trả về: response.data { success: true, data: { data: [], total: 10 } }
//       return response.data;
//     } catch (error: unknown) {
//       console.error("[Staff Service] ❌ Lỗi getBookings:", error);
//       throw error;
//     }
//   },

  getBookingById: async (
    id: number | string,
  ): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`[Staff Service] ❌ Lỗi getBookingById (${id}):`, error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái
   */
  updateStatus: async (
    id: number | string,
    status: "playing" | "completed" | "cancelled" | "approved",
  ): Promise<ApiResponse<Booking>> => {
    try {
      // ✅ Lưu ý: Route của ní ở Backend phải là PATCH /bookings/{id}/status
      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${id}/status`,
        { status },
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`[Staff Service] ❌ Lỗi updateStatus (${id}):`, error);
      throw error;
    }
  },

  /**
   * Lấy lịch trống (Sạch Any với TimeSlot)
   */
  getSchedule: async (
    fieldId: number | string,
    date: string,
  ): Promise<ApiResponse<TimeSlot[]>> => {
    try {
      const response = await api.get<ApiResponse<TimeSlot[]>>(
        `/fields/${fieldId}/schedule`,
        { params: { date } },
      );
      return response.data;
    } catch (error: unknown) {
      console.error("[Staff Service] ❌ Lỗi getSchedule:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách booking (Đã fix logic nạp data lồng nhau)
   */
  getBookings: async (
    filters?: BookingFilters,
  ): Promise<ApiResponse<PaginatedData<Booking>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedData<Booking>>>(
        "/bookings",
        { params: filters },
      );
      return response.data; // Trả về nguyên object ApiResponse chứa PaginatedData
    } catch (error: unknown) {
      console.error("[Staff Service] ❌ Lỗi getBookings:", error);
      throw error;
    }
  },

  getLiveStatus: async (date: string): Promise<ApiResponse<LiveStatusData>> => {
    try {
      // ✅ Đảm bảo URL này khớp với Route::get('fields/live-status', ...)
      const response = await api.get<ApiResponse<LiveStatusData>>(
        "/fields/live-status",
        { params: { date } },
      );
      return response.data;
    } catch (error: unknown) {
      console.error("[Staff Service] ❌ Lỗi getLiveStatus:", error);
      throw error;
    }
  },

  createBooking: async (
    data: Partial<Booking>,
  ): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.post<ApiResponse<Booking>>("/bookings", data);
      return response.data;
    } catch (error: unknown) {
      console.error("[Staff Service] ❌ Lỗi createBooking:", error);
      throw error;
    }
  },
};

export default staffBookingService;
