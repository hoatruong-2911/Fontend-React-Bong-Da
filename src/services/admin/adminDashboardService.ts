import api from "../api";

// --- INTERFACES CHUẨN (DẸP LOẠN ANY) ---
export interface DashboardStats {
  revenue: number;
  revenueGrowth: number;
  bookings: number;
  bookingsGrowth: number;
  customers: number;
  newCustomers: number;
  products: number;
  productsGrowth: number;
}

export interface RevenueChartData {
  name: string;
  revenue: number;
  bookings: number;
}

export interface FieldUsageData {
  name: string;
  value: number;
  color: string;
}

export interface RecentBooking {
  id: number;
  booking_code: string;
  customer_name: string;
  field_name: string;
  time_slot: string;
  total_amount: number;
  status: "pending" | "confirmed" | "playing" | "completed" | "cancelled";
}

export interface RecentOrder {
  id: number;
  order_code: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  revenueData: RevenueChartData[];
  fieldUsage: FieldUsageData[];
  recentBookings: RecentBooking[];
  recentOrders: RecentOrder[];
  yearlyTotal: number;
}

// --- CHI TIẾT CÁC MẢNH DỮ LIỆU ---

export interface DailyRevenueData {
  date: string; // Ví dụ: "01/01"
  orders: number;
  bookings: number;
  revenue: number;
}

export interface CategoryRevenueData {
  name: string; // Ví dụ: "Đồ uống"
  value: number; // Doanh thu theo loại
  color: string; // Màu sắc biểu đồ
}

export interface TopProduct {
  id: number;
  name: string;
  quantity: number;
  revenue: number;
}

export interface TopCustomer {
  name: string; // Tên khách hàng
  orders: number; // Số đơn đã mua
  totalSpent: number; // Tổng chi tiêu
}

// --- INTERFACE TỔNG CHO REVENUE REPORT ---
export interface RevenueReportResponse {
  success: boolean;
  totalRevenue: number;
  totalOrders: number;
  totalBookings: number;
  dailyData: DailyRevenueData[];
  categoryData: CategoryRevenueData[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
}

const adminDashboardService = {
  getDashboardData: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>("/admin/dashboard");
    return response.data;
  },

  getRevenueReport: async (params?: {
    period: string;
  }): Promise<RevenueReportResponse> => {
    const response = await api.get<RevenueReportResponse>(
      "/admin/dashboard/revenue-report",
      { params },
    );
    return response.data;
  },
};

export default adminDashboardService;
