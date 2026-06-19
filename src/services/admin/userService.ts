import api from "../api";

// --- INTERFACES CHUẨN XỊN ---
export interface StaffSummary {
  id: number;
  name: string;
  position: string;
  user_id: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  is_active: boolean | number;
  status: number; 
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

// Interface cho các Response trả về từ Laravel
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const adminUserService = {
  // 1. Lấy danh sách Users (Admin)
  getUsers: async (params?: UserParams): Promise<ApiResponse<any>> => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  // 2. Lấy chi tiết User (Admin)
  getUserById: async (id: number | string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // 3. Cập nhật User (FormData để hỗ trợ Upload ảnh)
  updateUser: async (id: number | string, formData: FormData): Promise<ApiResponse<User>> => {
    const response = await api.post(`/admin/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * 🛑 CẬP NHẬT: Tạo tài khoản Admin rực rỡ
   * Đồng bộ Route với Backend quản trị
   */
  createUser: async (formData: FormData): Promise<ApiResponse<User>> => {
    // Chỉnh lại route cho đúng chuẩn RESTful của Admin quản lý Users
    const response = await api.post("/admin/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 4. Xóa tài khoản
  deleteUser: async (id: number | string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // 5. Cập nhật Role nhanh
  updateRole: async (id: number | string, role: string): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // 6. Khóa/Mở khóa tài khoản
  toggleStatus: async (id: number | string): Promise<ApiResponse<{id: number, is_active: boolean}>> => {
    const response = await api.patch(`/admin/users/${id}/status`);
    return response.data;
  },

  /**
   * 🎯 PHẦN THIẾU QUAN TRỌNG: Lấy danh sách nhân viên để liên kết
   * Hàm này gọi sang StaffController để lấy data cho ô Select ở trang User
   */
  getAvailableStaffs: async (): Promise<ApiResponse<StaffSummary[]>> => {
    const response = await api.get("/admin/staff"); // Lấy toàn bộ staff để lọc ở Frontend
    return response.data;
  },

  // 7. Lấy thông tin cá nhân đang đăng nhập
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // 8. Tự cập nhật Profile cá nhân
  updateMyProfile: async (data: Partial<User> | FormData): Promise<User> => {
    const response = await api.post("/auth/user", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    const updatedUser = response.data.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("userUpdate"));
    return updatedUser;
  },

  // 9. Đổi mật khẩu cá nhân
  changeMyPassword: async (data: Record<string, string>): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },
};

export default adminUserService;