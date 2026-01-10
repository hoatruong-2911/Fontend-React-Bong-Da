import api from "../api";

export interface Category {
  id: number;
  name: string;
}
export interface Brand {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  category_id?: number; // Thêm để lọc sản phẩm liên quan
  brand_id?: number;
  image?: string;
  stock: number;
  unit?: string;
  is_active: boolean;
  brand?: string;
}

export interface ProductFilters {
  category?: string | number;
  brand?: string | number;
  search?: string;
  sort?: string;
}

const customerProductService = {
  // Lấy danh sách sản phẩm cho khách
  getProducts: async (filters?: ProductFilters) => {
    console.log(">>> [SERVICE] Gọi API lọc khách hàng với params:", filters);
    const response = await api.get("/products/customer", { params: filters });
    return response.data;
  },

  // Lấy chi tiết sản phẩm - Giữ đúng cách bro đang làm
  getProduct: async (id: number | string) => {
    console.log(">>> [SERVICE] Gọi API chi tiết sản phẩm ID:", id);
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Lấy danh mục
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  // Lấy thương hiệu
  getBrands: async () => {
    const response = await api.get("/brands");
    return response.data;
  },
};

export default customerProductService;
