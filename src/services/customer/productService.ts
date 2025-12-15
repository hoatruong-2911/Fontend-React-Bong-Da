import api from '../api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  unit?: string;
  is_active: boolean;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
}

// Customer Product API
const customerProductService = {
  // Lấy danh sách sản phẩm
  getProducts: async (filters?: ProductFilters) => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Lấy danh sách danh mục
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },
};

export default customerProductService;
