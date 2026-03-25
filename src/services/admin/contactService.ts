import api from "../api";

// Định nghĩa Interface chuẩn doanh nghiệp
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string | null;
  message: string;
  status: 0 | 1 | 2; // 0: Chưa đọc, 1: Đã đọc, 2: Đã xử lý
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactStats {
  total: number;
  unread: number;
  processing: number;
  completed: number;
}

export interface ContactResponse {
  success: boolean;
  data: {
    data: Contact[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

// Định nghĩa dữ liệu gửi đi khi thêm mới
export interface ContactCreateInput {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}

const contactService = {
  // Lấy danh sách liên hệ (có phân trang & lọc)
  getContacts: async (params?: { status?: number; page?: number }) => {
    const response = await api.get<ContactResponse>("/admin/contacts", {
      params,
    });
    return response.data;
  },

  // Lấy chi tiết & Thống kê
  getContactById: async (id: number | string) => {
    const response = await api.get<{ success: boolean; data: Contact }>(
      `/admin/contacts/${id}`,
    );
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<{ success: boolean; data: ContactStats }>(
      "/admin/contacts/stats",
    );
    return response.data;
  },

  // Cập nhật trạng thái & Ghi chú (Dùng cho cả đơn lẻ và hàng loạt)
  updateContact: async (
    id: number | string,
    data: { status: number; admin_note?: string },
  ) => {
    const response = await api.put(`/admin/contacts/${id}`, data);
    return response.data;
  },

  bulkUpdateStatus: async (ids: number[], status: number) => {
    const response = await api.patch("/admin/contacts/bulk-status", {
      ids,
      status,
    });
    return response.data;
  },

  // Xóa
  deleteContact: async (id: number) => {
    const response = await api.delete(`/admin/contacts/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: number[]) => {
    const response = await api.delete("/admin/contacts/bulk-delete", {
      data: { ids },
    });
    return response.data;
  },

  store: async (data: ContactCreateInput) => {
      const response = await api.post<{ success: boolean; data: Contact }>("/admin/contacts", data);
      return response.data;
    },
};
  
 

export default contactService;
