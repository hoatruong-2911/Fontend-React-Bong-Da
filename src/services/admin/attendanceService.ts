import api from "../api";

export interface AttendanceStaff {
  id: number;
  name: string;
  position: string;
  avatar?: string;
  department?: {
    id: number;
    name: string;
  };
}

export interface AttendanceRecord {
  id: number;
  staff_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: "present" | "late" | "absent" | "leave";
  work_hours: number;
  overtime_hours: number;
  note: string | null;
  staff: AttendanceStaff;
}

export interface AttendanceStats {
  total_staff: number;
  present: number;
  late: number;
  absent: number;
  leave: number;
  total_work_hours: number;
  total_overtime: number;
}

// Đây là file service theo form bro mong muốn nhưng vẫn an toàn về dữ liệu
const attendanceService = {
  // Lấy danh sách chấm công theo ngày
  getAttendances: async (date?: string) => {
    const params = date ? { date } : {};
    // Trả về object chứa data (mảng record) và stats (thống kê)
    const response = await api.get("/admin/attendances", { params });
    return response.data;
  },

  // Lấy chi tiết một bản ghi chấm công
  getAttendanceById: async (id: number | string) => {
    const response = await api.get(`/admin/attendances/${id}`);
    return response.data;
  },

  // Lưu hoặc cập nhật chấm công thủ công (Form thường, không cần FormData nếu không có ảnh)
  saveAttendance: async (data: {
    staff_id: number;
    date: string;
    check_in?: string | null;
    check_out?: string | null;
    status: string;
    note?: string;
  }) => {
    const response = await api.post("/admin/attendances", data);
    return response.data;
  },

  // Xóa bản ghi chấm công (Nếu bro cần)
  deleteAttendance: async (id: number) => {
    const response = await api.delete(`/admin/attendances/${id}`);
    return response.data;
  },
};

export default attendanceService;
