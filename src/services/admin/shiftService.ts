// Interface cho loại ca làm việc
import api from "../api";

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

// Định nghĩa cấu trúc data bên trong response
export interface WeeklyScheduleData {
  week_range: {
    start: string;
    end: string;
  };
  shifts: Shift[];
  staff_schedules: StaffSchedule[];
  stats: {
    total_week: number;
    counts: Record<string, number>;
  };
}

// Interface cho lịch phân ca chi tiết
export interface ShiftAssignment {
  id: number;
  staff_id: number;
  shift_id: number;
  work_date: string;
  note?: string;
  shift?: Shift; // Thông tin ca đi kèm
}

// Interface cho nhân viên kèm lịch làm trong tuần
export interface StaffSchedule {
  id: number;
  name: string;
  position: string;
  avatar?: string;
  department?: {
    id: number;
    name: string;
  };
  assignments: ShiftAssignment[]; // Danh sách ca đã gán trong tuần
}

// Interface cho phản hồi tổng hợp từ API getAssignments
export interface WeeklyScheduleResponse {
  success: boolean;
  data: {
    week_range: {
      start: string;
      end: string;
    };
    shifts: Shift[];
    staff_schedules: StaffSchedule[];
    stats: {
      total_week: number;
      counts: Record<string, number>; // Ví dụ: { "Ca sáng": 15, "Ca chiều": 12 }
    };
  };
}

const shiftService = {
  // Lấy lịch làm việc theo tuần (mặc định tuần hiện tại)
  getWeeklyAssignments: async (
    date?: string
  ): Promise<WeeklyScheduleResponse> => {
    const params = date ? { date } : {};
    const res = await api.get<WeeklyScheduleResponse>(
      "/admin/shift-assignments",
      { params }
    );
    return res.data;
  },

  // Gán ca làm mới
  assignShift: async (data: {
    staff_id: number;
    shift_id: number;
    work_date: string;
    note?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const res = await api.post("/admin/shift-assignments", data);
    return res.data;
  },

  // Xóa ca làm
  removeAssignment: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/admin/shift-assignments/${id}`);
    return res.data;
  },

  // Lấy danh sách tất cả các loại ca (để hiển thị cấu hình)
  getShifts: async (): Promise<{ data: Shift[] }> => {
    const res = await api.get("/admin/shifts");
    return res.data;
  },

  // Lấy chi tiết ca làm
  getStaffShiftDetail: async (
    id: string
  ): Promise<{ success: boolean; data: StaffSchedule }> => {
    const res = await api.get<{ success: boolean; data: StaffSchedule }>(
      `/admin/staff-shifts/${id}`
    );
    return res.data;
  },

  // Trong shiftService.ts
  getAssignmentData: async (id: string | number) => {
    // Phải dùng dấu huyền và truyền biến id vào
    const res = await api.get(`/admin/shift-assignments/${id}`);
    return res.data;
  },

  // Thêm hàm xóa hàng loạt
  removeStaffWeeklyAssignments: async (
    staffId: number,
    startDate: string,
    endDate: string
  ) => {
    const res = await api.delete(`/admin/staff-assignments/bulk/${staffId}`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return res.data;
  },
};

export default shiftService;
