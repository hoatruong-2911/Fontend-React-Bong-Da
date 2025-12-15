import api from '../api';

export interface RevenueStatistics {
  total_revenue: number;
  order_revenue: number;
  booking_revenue: number;
  revenue_by_date: Array<{ date: string; amount: number }>;
  revenue_by_category: Array<{ category: string; amount: number }>;
}

export interface RevenueFilters {
  date_from?: string;
  date_to?: string;
  type?: 'order' | 'booking' | 'all';
}

// Admin Revenue API
const adminRevenueService = {
  // Lấy thống kê doanh thu
  getStatistics: async (filters?: RevenueFilters): Promise<RevenueStatistics> => {
    const response = await api.get('/admin/revenue/statistics', { params: filters });
    return response.data;
  },

  // Lấy doanh thu theo ngày
  getDailyRevenue: async (date_from: string, date_to: string) => {
    const response = await api.get('/admin/revenue/daily', { params: { date_from, date_to } });
    return response.data;
  },

  // Lấy doanh thu theo tháng
  getMonthlyRevenue: async (year: number) => {
    const response = await api.get('/admin/revenue/monthly', { params: { year } });
    return response.data;
  },

  // Export báo cáo
  exportReport: async (filters?: RevenueFilters) => {
    const response = await api.get('/admin/revenue/export', { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },
};

export default adminRevenueService;
