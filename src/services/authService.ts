import api from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

/**
 * 🛑 CẬP NHẬT: Thêm Interface UserProfile để khớp với cấu trúc DB
 * Giúp hiển thị ảnh đại diện và thông tin bổ sung rực rỡ.
 */
export interface UserProfile {
  phone?: string;
  address?: string;
  avatar?: string; // Tên file ảnh lưu trong Backend
}

/**
 * 🛑 CẬP NHẬT: Mở rộng Interface User
 * Thêm trường 'profile' để tránh lỗi "Property 'profile' does not exist"
 */
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "staff" | "admin";
  avatar?: string;
  created_at: string;
  profile?: UserProfile; // ⬅️ Thêm dòng này để dập lỗi đỏ
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// Interface cho việc thay đổi mật khẩu (Sạch bóng any)
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

const authService = {
  // Login (Giữ nguyên logic bóc tách dữ liệu rực rỡ của bro)
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    const apiData = response.data.data;

    if (!apiData || !apiData.user || !apiData.token) {
      throw new Error(
        "Phản hồi đăng nhập không chứa thông tin người dùng hoặc token."
      );
    }

    const user = apiData.user;
    const token = apiData.token;
    const message = response.data.message || "Đăng nhập thành công.";

    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { user, token, message };
  },

  // Register (Giữ nguyên logic cũ)
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout (Giữ nguyên logic cũ)
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },

  /**
   * 🛑 CẬP NHẬT: Get current user
   * Sửa để bóc tách đúng key 'data' tránh lỗi gán sai Type
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    // Nếu Backend trả về { data: { user } }, bóc tách đúng data
    return response.data.data || response.data;
  },

  /**
   * 🛑 CẬP NHẬT: Update profile
   * Chấp nhận Partial<User> hoặc FormData để upload ảnh mà không dùng any
   */
  updateProfile: async (data: Partial<User> | FormData): Promise<User> => {
    // 🛑 Xóa sạch "?_method=PUT" để khớp với Route::post trong api.php
    const response = await api.post("/auth/user", data, {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {},
    });

    const updatedUser = response.data.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // 🛑 Bắn sự kiện để Avatar trên Header sáng đèn ngay lập tức
    window.dispatchEvent(new Event("userUpdate"));

    return updatedUser;
  },

  // Change password (Sạch bóng any)
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  changeMyPassword: async (data: Record<string, string>) => {
      const response = await api.post("/auth/change-password", data);
      return response.data;
    },

  // Get stored user from localStorage
  getStoredUser: (): User | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
