import api from "../api";

export interface Product {
  id: number;
  name: string;
  // slug: string;
  category_id: number;
  brand_id: number;
  price: number;
  stock: number;
  image: string | null;
  description: string | null;
  available: boolean;
  created_at: string;
  updated_at: string;
  // Quan hệ dữ liệu
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
}

const productService = {
  getProducts: async () => {
    const response = await api.get("/admin/products");
    return response.data;
  },

  getProductById: async (id: number | string) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  createProduct: async (formData: FormData) => {
    const response = await api.post("/admin/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateProduct: async (id: number | string, data: FormData) => {
    data.append("_method", "PUT");
    const response = await api.post(`/admin/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number) => {
    const response = await api.patch(`/admin/products/${id}/toggle-status`);
    return response.data;
  },
};

export default productService;
