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

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "staff" | "admin";
  avatar?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

const authService = {
  // Login
  // login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
  //   const response = await api.post('/auth/login', credentials);
  //   if (response.data.token) {
  //     localStorage.setItem('auth_token', response.data.token);
  //     localStorage.setItem('user', JSON.stringify(response.data.user));
  //   }
  //   return response.data;
  // },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    // Backend trả về: { success, message, data: { user, token, ... } }
    const apiData = response.data.data; // Lấy nội dung bên trong key 'data'

    if (!apiData || !apiData.user || !apiData.token) {
      // Ném lỗi rõ ràng nếu dữ liệu cần thiết bị thiếu
      throw new Error(
        "Phản hồi đăng nhập không chứa thông tin người dùng hoặc token."
      );
    }

    const user = apiData.user;
    const token = apiData.token;
    const message = response.data.message || "Đăng nhập thành công.";

    // 1. Lưu trữ Token và User vào LocalStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // 2. Trả về cấu trúc mà Login.tsx mong đợi (user, token, message)
    // Cấu trúc này khớp với interface AuthResponse
    return { user, token, message };
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Update profile
  // updateProfile: async (data: Partial<User>): Promise<User> => {
  //   const response = await api.put("/auth/profile", data);
  //   localStorage.setItem("user", JSON.stringify(response.data));
  //   return response.data;
  // },
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put("/auth/user", data); // Backend trả về: { success, message, data: UpdatedUserObject }
    const updatedUser = response.data.data;

    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser; // ⬅️ Sửa để trả về User Object
  },

  // Change password
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> => {
    await api.put("/auth/change-password", data);
  },

  // Get stored user from localStorage
  getStoredUser: (): User | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },
};

export default authService;
