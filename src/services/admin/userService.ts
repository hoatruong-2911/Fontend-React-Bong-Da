import api from "../api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  is_active: boolean | number;
  status: number; // 1: active, 0: locked
  created_at: string;
  profile?: {
    id: number;
    phone?: string;
    avatar?: string;
    address?: string;
  };
}

const adminUserService = {
  // 1. Lấy danh sách user (có phân trang/lọc)
  getUsers: async (params?: any) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  // 2. Lấy chi tiết 1 user để sửa (CẦN THIẾT cho trang EditUser)
  getUserById: async (id: number | string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  

  // 3. Cập nhật user (Dùng POST kèm _method PUT để hỗ trợ upload file trong Laravel)
  updateUser: async (id: number | string, formData: FormData) => {
    const response = await api.post(`/admin/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Lưu ý: Đổi từ "/admin/users/register" thành "/admin/users" để khớp với Route::post
  // 4. Tạo tài khoản mới (Hỗ trợ upload ảnh bằng FormData)
  createUser: async (formData: FormData) => {
    const response = await api.post("/admin/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  // 5. Xóa tài khoản
  deleteUser: async (id: number | string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // 6. Cập nhật nhanh vai trò (Nếu dùng hàm riêng)
  updateRole: async (id: number | string, role: string) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Hàm thay đổi trạng thái Khóa/Mở khóa
  toggleStatus: async (id: number | string) => {
    // Gọi đến route: PATCH /api/admin/users/{id}/status
    const response = await api.patch(`/admin/users/${id}/status`);
    return response.data;
  },

  // Lấy thông tin chính mình
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Cập nhật Profile cá nhân (Hỗ trợ upload ảnh)
  updateMyProfile: async (formData: FormData) => {
    // Lưu ý: Dùng POST kèm _method PUT cho Laravel
    const response = await api.post("/auth/user", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Đổi mật khẩu
  changeMyPassword: async (data: any) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },

  
};

export default adminUserService;
