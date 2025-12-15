import api from '../api';

export interface Shift {
  id: number;
  staff_id: number;
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
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'late' | 'absent' | 'leave';
  work_hours?: number;
  overtime_hours?: number;
}

// Staff Shift/Attendance API
const staffShiftService = {
  // Lấy ca làm việc của tôi
  getMyShifts: async (date_from?: string, date_to?: string) => {
    const response = await api.get('/shifts/me', { params: { date_from, date_to } });
    return response.data;
  },

  // Check-in
  checkIn: async (shift_id: number) => {
    const response = await api.post(`/shifts/${shift_id}/check-in`);
    return response.data;
  },

  // Check-out
  checkOut: async (shift_id: number) => {
    const response = await api.post(`/shifts/${shift_id}/check-out`);
    return response.data;
  },

  // Lấy chấm công của tôi
  getMyAttendance: async (month?: string) => {
    const response = await api.get('/attendance/me', { params: { month } });
    return response.data;
  },
};

export default staffShiftService;
