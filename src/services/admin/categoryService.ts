import api from "../api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null; // Category dùng image thay vì logo
  description: string | null;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
  products?: any[]; // Dùng để hiển thị danh sách SP trong trang chi tiết
  created_at: string;
  updated_at: string;
}

const categoryService = {
  // Lấy danh sách danh mục (dành cho Admin)
  getCategories: async () => {
    const response = await api.get("/admin/categories");
    return response.data;
  },

  // Lấy chi tiết 1 danh mục
  getCategoryById: async (id: number | string) => {
    const response = await api.get(`/admin/categories/${id}`);
    return response.data;
  },

  // Thêm mới danh mục (Dùng FormData để upload ảnh)
  createCategory: async (formData: FormData) => {
    const response = await api.post("/admin/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Cập nhật danh mục
  updateCategory: async (id: number | string, data: FormData) => {
    // Laravel yêu cầu method POST kèm _method=PUT khi upload file trong request update
    data.append("_method", "PUT");
    const response = await api.post(`/admin/categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Xóa danh mục
  deleteCategory: async (id: number) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Đổi trạng thái nhanh
  toggleStatus: async (id: number) => {
    const response = await api.patch(`/admin/categories/${id}/toggle-status`);
    return response.data;
  },
};

export default categoryService;
