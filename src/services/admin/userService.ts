import api from "../api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  is_active: boolean | number;
  status: number; // 1: active, 0: locked
  created_at: string;
  avatar?: string;
  profile?: {
    id: number;
    phone?: string;
    avatar?: string;
    address?: string;
  };
}

interface UserParams {
  page?: number;
  search?: string;
  role?: string;
  [key: string]: string | number | undefined;
}

const adminUserService = {
  getUsers: async (params?: UserParams) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  getUserById: async (id: number | string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number | string, formData: FormData) => {
    const response = await api.post(`/admin/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  createUser: async (formData: FormData) => {
    const response = await api.post("/admin/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteUser: async (id: number | string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  updateRole: async (id: number | string, role: string) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  toggleStatus: async (id: number | string) => {
    const response = await api.patch(`/admin/users/${id}/status`);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * 🛑 CẬP NHẬT: Update profile Admin rực rỡ
   * Dùng chung Route /auth/user để tránh lỗi 404 và đồng bộ logic với Customer
   */
  updateMyProfile: async (data: Partial<User> | FormData): Promise<User> => {
    // 1. Gọi đúng Route công khai cho việc tự cập nhật profile
    const response = await api.post("/auth/user", data, {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {},
    });

    const updatedUser = response.data.data;

    // 2. Lưu lại vào LocalStorage để các thông tin như Tên, Role không bị mất
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // 3. 🔔 Bắn sự kiện để Header Admin nhận lệnh và đổi ảnh rực rỡ ngay lập tức
    window.dispatchEvent(new Event("userUpdate"));

    return updatedUser;
  },

  changeMyPassword: async (data: Record<string, string>) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },
};

export default adminUserService;
