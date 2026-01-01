import api from "../api";
import { Department } from "./departmentService";

// Interface dành cho dữ liệu hiển thị (Read)
export interface Staff {
  id: number;
  department_id: number;
  department?: Department;
  name: string;
  email: string;
  phone: string;
  position: string;
  avatar: string | null;
  salary: number;
  bonus: number;
  join_date: string;
  status: "active" | "off" | "inactive";
  shift: string | null;
  created_at: string;
}



// Interface dành cho kết quả trả về từ API
export interface StaffResponse {
  success: boolean;
  data: Staff;
  message?: string;
}

const staffService = {
  // 1. Lấy danh sách
  getStaffs: async (): Promise<{ success: boolean; data: Staff[] }> => {
    const res = await api.get("/admin/staff");
    return res.data;
  },

  // 2. Lấy chi tiết
  getStaffById: async (
    id: string | number
  ): Promise<{ success: boolean; data: Staff }> => {
    const res = await api.get(`/admin/staff/${id}`);
    return res.data;
  },

  // 3. Thêm mới nhân viên (Sử dụng FormData để chứa ảnh)
  createStaff: async (formData: FormData): Promise<StaffResponse> => {
    const res = await api.post("/admin/staff", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 4. Cập nhật nhân viên (Sử dụng FormData + Method Spoofing)
  updateStaff: async (
    id: string | number,
    formData: FormData
  ): Promise<StaffResponse> => {
    // Laravel yêu cầu dòng này để hiểu đây là lệnh PUT khi gửi FormData qua POST
    formData.append("_method", "PUT");

    const res = await api.post(`/admin/staff/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 5. Xóa nhân viên
  deleteStaff: async (
    id: string | number
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/admin/staff/${id}`);
    return res.data;
  },

  // 6. Đổi trạng thái nhanh
  toggleStatus: async (
    id: string | number
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.patch(`/admin/staff/${id}/toggle-status`);
    return res.data;
  },
};

export default staffService;
