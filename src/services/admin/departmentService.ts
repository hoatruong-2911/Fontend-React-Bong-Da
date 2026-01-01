import api from "../api";

// 1. Interface cốt lõi cho một Phòng Ban
export interface Department {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: number; // Trong Laravel thường là 0 hoặc 1
  staff_count?: number;
  created_at: string;
  updated_at: string;
}

// 2. Interface cho dữ liệu gửi đi (Payload)
export interface DepartmentSubmitData {
  name: string;
  description?: string;
  is_active: number | boolean;
}

// 3. Service với kiểu trả về tường minh
const departmentService = {
  // Trả về mảng Department[]
  getDepartments: async (): Promise<{
    success: boolean;
    data: Department[];
  }> => {
    const res = await api.get("/admin/departments");
    return res.data;
  },

  // Trả về một đối tượng Department duy nhất
  getDepartmentById: async (
    id: number | string
  ): Promise<{ success: boolean; data: Department }> => {
    const res = await api.get(`/admin/departments/${id}`);
    return res.data;
  },

  createDepartment: async (
    data: DepartmentSubmitData
  ): Promise<{ success: boolean; message: string; data: Department }> => {
    const res = await api.post("/admin/departments", data);
    return res.data;
  },

  updateDepartment: async (
    id: number | string,
    data: DepartmentSubmitData
  ): Promise<{ success: boolean; message: string; data: Department }> => {
    const res = await api.put(`/admin/departments/${id}`, data);
    return res.data;
  },

  deleteDepartment: async (
    id: number | string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/admin/departments/${id}`);
    return res.data;
  },

  toggleStatus: async (
    id: number | string
  ): Promise<{ success: boolean; message: string; data: Department }> => {
    const res = await api.patch(`/admin/departments/${id}/toggle-status`);
    return res.data;
  },
};

export default departmentService;
