import api from '../api';

export interface Staff {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  avatar?: string;
  hire_date: string;
  salary: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: number;
  staff_id: number;
  staff_name: string;
  date: string;
  start_time: string;
  end_time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'scheduled' | 'working' | 'completed' | 'absent';
  check_in?: string;
  check_out?: string;
  notes?: string;
}

export interface Attendance {
  id: number;
  staff_id: number;
  staff_name: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'late' | 'absent' | 'leave';
  work_hours?: number;
  overtime_hours?: number;
  notes?: string;
}

export interface StaffFilters {
  position?: string;
  department?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

// Admin Staff API
const adminStaffService = {
  // ===== STAFF =====
  getStaff: async (filters?: StaffFilters) => {
    const response = await api.get('/admin/staff', { params: filters });
    return response.data;
  },

  getStaffMember: async (id: number) => {
    const response = await api.get(`/admin/staff/${id}`);
    return response.data;
  },

  createStaff: async (data: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/admin/staff', data);
    return response.data;
  },

  updateStaff: async (id: number, data: Partial<Staff>) => {
    const response = await api.put(`/admin/staff/${id}`, data);
    return response.data;
  },

  deleteStaff: async (id: number) => {
    await api.delete(`/admin/staff/${id}`);
  },

  // ===== SHIFTS =====
  getShifts: async (filters?: { staff_id?: number; date_from?: string; date_to?: string }) => {
    const response = await api.get('/admin/shifts', { params: filters });
    return response.data;
  },

  createShift: async (data: Omit<Shift, 'id' | 'staff_name'>) => {
    const response = await api.post('/admin/shifts', data);
    return response.data;
  },

  updateShift: async (id: number, data: Partial<Shift>) => {
    const response = await api.put(`/admin/shifts/${id}`, data);
    return response.data;
  },

  deleteShift: async (id: number) => {
    await api.delete(`/admin/shifts/${id}`);
  },

  // ===== ATTENDANCE =====
  getAttendance: async (filters?: { staff_id?: number; date_from?: string; date_to?: string }) => {
    const response = await api.get('/admin/attendance', { params: filters });
    return response.data;
  },

  getAttendanceStatistics: async (date_from?: string, date_to?: string) => {
    const response = await api.get('/admin/attendance/statistics', { params: { date_from, date_to } });
    return response.data;
  },
};

export default adminStaffService;
