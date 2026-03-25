import api from "../api";

// Định nghĩa Interface chuẩn cho dữ liệu trả về
export interface StaffInfo {
  id: number;
  name: string;
  avatar: string | null;
  position: string; // Chức vụ
  department: string; // Bộ phận
  shift: string; // Ca làm việc
  phone: string;
  email: string;
  salary: number;
  bonus: number;
  status: "active" | "inactive";
}

export interface StaffDashboardStats {
  todayRevenue: number;
  ordersToday: number;
  pendingBookings: number;
  playingFields: number;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  fieldsManaged: number;
  attendance: {
    totalShifts: number;
    completedShifts: number;
    remainingShifts: number;
    totalHours: number;
  };
}

export interface DashboardDataResponse {
  success: boolean;
  data: {
    staff: StaffInfo;
    stats: StaffDashboardStats;
  };
}

const dashboardService = {
  // Lấy toàn bộ dữ liệu tổng quan cho trang Dashboard Staff
  getOverview: async () => {
    const response = await api.get<DashboardDataResponse>(
      "/staff/dashboard/overview",
    );
    return response.data;
  },

  // Có thể thêm các hàm bổ sung sau này như điểm danh nhanh, v.v.
  checkIn: async () => {
    const response = await api.post("/staff/attendance/check-in");
    return response.data;
  },
};

export default dashboardService;
