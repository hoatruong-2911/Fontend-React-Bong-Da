import api from "../api";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

const brandService = {
  // Lấy danh sách thương hiệu (dành cho Admin)
  getBrands: async () => {
    const response = await api.get("/admin/brands");
    return response.data;
  },

  // Lấy chi tiết 1 thương hiệu
  getBrandById: async (id: number | string) => {
    const response = await api.get(`/admin/brands/${id}`);
    return response.data;
  },

  // Thêm mới thương hiệu (Dùng FormData để upload logo)
  createBrand: async (formData: FormData) => {
    const response = await api.post("/admin/brands", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Cập nhật thương hiệu
  updateBrand: async (id: number | string, data: FormData) => {
    // Lưu ý: Laravel đôi khi yêu cầu method POST kèm _method=PUT khi upload file
    data.append("_method", "PUT");
    const response = await api.post(`/admin/brands/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Xóa thương hiệu
  deleteBrand: async (id: number) => {
    const response = await api.delete(`/admin/brands/${id}`);
    return response.data;
  },

  // Đổi trạng thái nhanh
  toggleStatus: async (id: number) => {
    const response = await api.patch(`/admin/brands/${id}/toggle-status`);
    return response.data;
  },
};

export default brandService;
