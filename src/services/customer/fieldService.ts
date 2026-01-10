import api from "../api";

export interface Field {
  id: number;
  name: string;
  type: string; // 'outdoor' | 'indoor'
  price: number; // Giá thuê/giờ
  size: number; // Quy mô: 5, 7, 11
  surface: string; // Mặt sân: Cỏ nhân tạo, Cỏ tự nhiên...
  rating: number;
  location: string;
  reviews_count: number;
  available: boolean;
  is_vip: boolean;
  description?: string;
  image: string; // URL ảnh sân
  features?: string[];
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
