import api from "../api";

export interface Field {
  id: number;
  name: string; // 🛑 FIX 1: Dùng type cho outdoor/indoor (dùng string)
  type: string; // Có thể là 'outdoor' hoặc 'indoor'
  // 🛑 FIX 2: Dùng price (đã đồng bộ với DB)
  price: number;

  // 🛑 FIX 3: Dùng size (number)
  size: number;

  // 🛑 FIX 4: Thêm các cột bị thiếu mà Component đang cố gắng render
  surface: string; // Tên cột mặt sân
  rating: number;
  reviews_count: number;
  available: boolean;
  is_vip: boolean; // Cột VIP

  description?: string;
  image?: string;
  features?: string[]; // Đã đổi amenities thành features
}

export interface FieldFilters {
  type?: string;
  min_price?: number;
  max_price?: number;
}

// Customer Field API
const customerFieldService = {
  // Lấy danh sách sân
  getFields: async (filters?: FieldFilters) => {
    const response = await api.get("/fields", { params: filters });
    return response.data;
  },

  // Lấy chi tiết sân
  getField: async (id: number) => {
    const response = await api.get(`/fields/${id}`);
    return response.data;
  },

  // Lấy lịch sân theo ngày
  getSchedule: async (id: number, date: string) => {
    const response = await api.get(`/fields/${id}/schedule`, {
      params: { date },
    });
    return response.data;
  },
};

export default customerFieldService;
