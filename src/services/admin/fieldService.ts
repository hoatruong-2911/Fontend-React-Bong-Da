import api from '../api';

export interface Field {
  id: number;
  name: string;
  type: '5v5' | '7v7' | '11v11';
  description?: string;
  price_per_hour: number;
  image?: string;
  amenities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FieldFilters {
  type?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

// Admin Field API
const adminFieldService = {
  // Lấy danh sách sân
  getFields: async (filters?: FieldFilters) => {
    const response = await api.get('/admin/fields', { params: filters });
    return response.data;
  },

  // Lấy chi tiết sân
  getField: async (id: number) => {
    const response = await api.get(`/admin/fields/${id}`);
    return response.data;
  },

  // Tạo sân mới
  createField: async (data: Omit<Field, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/admin/fields', data);
    return response.data;
  },

  // Cập nhật sân
  updateField: async (id: number, data: Partial<Field>) => {
    const response = await api.put(`/admin/fields/${id}`, data);
    return response.data;
  },

  // Xóa sân
  deleteField: async (id: number) => {
    await api.delete(`/admin/fields/${id}`);
  },

  // Bật/tắt trạng thái sân
  toggleActive: async (id: number) => {
    const response = await api.patch(`/admin/fields/${id}/toggle-active`);
    return response.data;
  },
};

export default adminFieldService;
