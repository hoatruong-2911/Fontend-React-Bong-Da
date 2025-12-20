import api from "../api";

export interface Field {
  id: number;
  name: string;
  type: string; // Khớp với cột 'type' trong DB
  price: number; // Sửa từ price_per_hour thành price
  size: number;
  surface: string | null;
  description?: string;
  image?: string;
  location: string;
  rating: number;
  reviews_count: number;
  available: boolean | number; // Sửa từ is_active thành available
  is_vip: boolean | number;
  created_at: string;
  updated_at: string;
}

export interface FieldFilters {
  type?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

/**
 * Hàm hỗ trợ log lỗi chi tiết giúp fix 404/500 nhanh chóng
 */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
const logApiError = (method: string, url: string, error: any) => {
  console.group(`🔴 [AdminFieldService Error] at ${method}`);
  console.error(`URL thực tế đã gọi: ${url}`);
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Data phản hồi từ Server:", error.response.data);
    if (error.response.status === 404) {
      console.warn(
        "LỜI KHUYÊN: Hãy chạy 'php artisan route:list | grep fields' để xem URL đúng."
      );
    }
  } else if (error.request) {
    console.error("Không nhận được phản hồi. Kiểm tra lại Backend Server.");
  } else {
    console.error("Lỗi cấu hình request:", error.message);
  }
  console.groupEnd();
};

const adminFieldService = {
  // 1. Lấy danh sách sân
  getFields: async (filters?: FieldFilters) => {
    const url = "/fields";
    try {
      console.log(`[AdminFieldService] GET: ${url}`);
      const response = await api.get(url, { params: filters });
      return response.data;
    } catch (error) {
      logApiError("getFields", url, error);
      throw error;
    }
  },

  // 2. Lấy chi tiết sân
  // getField: async (id: number) => {
  //   const url = `/fields/${id}`;
  //   try {
  //     const response = await api.get(url);
  //     return response.data;
  //   } catch (error) {
  //     logApiError(`getField(${id})`, url, error);
  //     throw error;
  //   }
  // },

  // 2. Lấy chi tiết sân theo ID (Dùng cho cả trang xem chi tiết và trang chỉnh sửa)
  getFieldById: async (id: string | number) => {
    const url = `/fields/${id}`;
    try {
      console.log(`[AdminFieldService] GET: ${url}`);
      const response = await api.get(url);
      return response.data; // Trả về { success: true, data: { ... } }
    } catch (error) {
      logApiError(`getFieldById(${id})`, url, error);
      throw error;
    }
  },
  // 3. Tạo sân mới
  createField: async (
    data: Omit<Field, "id" | "created_at" | "updated_at">
  ) => {
    const url = "/fields";
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      logApiError("createField", url, error);
      throw error;
    }
  },

  // 4. Cập nhật sân
  updateField: async (id: string | number, data: Partial<Field>) => {
    const url = `/fields/${id}`;
    try {
      console.log(`[AdminFieldService] PUT: ${url}`);
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      logApiError(`updateField(${id})`, url, error);
      throw error;
    }
  },

  // 5. Xóa sân

  deleteField: async (id: number | string) => {
    const url = `/fields/${id}`;
    try {
      console.log(`[AdminFieldService] DELETE: ${url}`);
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      logApiError(`deleteField(${id})`, url, error);
      throw error;
    }
  },

  // 6. Bật/tắt trạng thái sân
  toggleActive: async (id: number) => {
    const url = `/admin/fields/${id}/toggle-active`;
    try {
      const response = await api.patch(url);
      return response.data;
    } catch (error) {
      logApiError(`toggleActive(${id})`, url, error);
      throw error;
    }
  },
};

export default adminFieldService;
