import api from '../api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

// Admin Product API
const adminProductService = {
  // Lấy danh sách sản phẩm
  getProducts: async (filters?: ProductFilters) => {
    const response = await api.get('/admin/products', { params: filters });
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getProduct: async (id: number) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  // Tạo sản phẩm mới
  createProduct: async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/admin/products', data);
    return response.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (id: number, data: Partial<Product>) => {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data;
  },

  // Xóa sản phẩm
  deleteProduct: async (id: number) => {
    await api.delete(`/admin/products/${id}`);
  },

  // Cập nhật tồn kho
  updateStock: async (id: number, quantity: number) => {
    const response = await api.patch(`/admin/products/${id}/stock`, { quantity });
    return response.data;
  },
};

export default adminProductService;
