export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fieldId: number;
  fieldName: string;
  date: string;
  timeSlot: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'playing' | 'completed' | 'cancelled';
  createdAt: string;
  note?: string;
}

export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    customerEmail: 'nguyenvana@email.com',
    fieldId: 1,
    fieldName: 'Sân 1 - Sân 5 người',
    date: '2024-01-15',
    timeSlot: '18:00 - 19:30',
    duration: 1.5,
    totalAmount: 750000,
    status: 'playing',
    createdAt: '2024-01-15T10:30:00',
    note: 'Khách quen, đặt sân thường xuyên'
  },
  {
    id: 'BK002',
    customerName: 'Trần Văn B',
    customerPhone: '0912345678',
    customerEmail: 'tranvanb@email.com',
    fieldId: 2,
    fieldName: 'Sân 2 - Sân 7 người',
    date: '2024-01-15',
    timeSlot: '19:00 - 21:00',
    duration: 2,
    totalAmount: 1600000,
    status: 'confirmed',
    createdAt: '2024-01-15T08:00:00'
  },
  {
    id: 'BK003',
    customerName: 'Lê Thị C',
    customerPhone: '0923456789',
    customerEmail: 'lethic@email.com',
    fieldId: 3,
    fieldName: 'Sân 3 - Sân 11 người',
    date: '2024-01-15',
    timeSlot: '16:00 - 18:00',
    duration: 2,
    totalAmount: 2400000,
    status: 'completed',
    createdAt: '2024-01-14T14:00:00'
  },
  {
    id: 'BK004',
    customerName: 'Phạm Văn D',
    customerPhone: '0934567890',
    customerEmail: 'phamvand@email.com',
    fieldId: 4,
    fieldName: 'Sân 4 - Sân 5 người',
    date: '2024-01-16',
    timeSlot: '20:00 - 21:30',
    duration: 1.5,
    totalAmount: 675000,
    status: 'pending',
    createdAt: '2024-01-15T16:00:00',
    note: 'Cần xác nhận lại qua điện thoại'
  },
  {
    id: 'BK005',
    customerName: 'Hoàng Văn E',
    customerPhone: '0945678901',
    customerEmail: 'hoangvane@email.com',
    fieldId: 5,
    fieldName: 'Sân 5 - Sân 7 người VIP',
    date: '2024-01-16',
    timeSlot: '17:00 - 19:00',
    duration: 2,
    totalAmount: 1800000,
    status: 'confirmed',
    createdAt: '2024-01-15T09:30:00'
  },
  {
    id: 'BK006',
    customerName: 'Võ Thị F',
    customerPhone: '0956789012',
    customerEmail: 'vothif@email.com',
    fieldId: 1,
    fieldName: 'Sân 1 - Sân 5 người',
    date: '2024-01-14',
    timeSlot: '19:00 - 20:30',
    duration: 1.5,
    totalAmount: 750000,
    status: 'completed',
    createdAt: '2024-01-13T11:00:00'
  },
  {
    id: 'BK007',
    customerName: 'Đặng Văn G',
    customerPhone: '0967890123',
    customerEmail: 'dangvang@email.com',
    fieldId: 6,
    fieldName: 'Sân 6 - Sân 5 người trong nhà',
    date: '2024-01-15',
    timeSlot: '21:00 - 22:30',
    duration: 1.5,
    totalAmount: 825000,
    status: 'cancelled',
    createdAt: '2024-01-14T20:00:00',
    note: 'Khách hủy do bận việc'
  },
  {
    id: 'BK008',
    customerName: 'Bùi Văn H',
    customerPhone: '0978901234',
    customerEmail: 'buivanh@email.com',
    fieldId: 7,
    fieldName: 'Sân 7 - Sân 7 người',
    date: '2024-01-17',
    timeSlot: '18:00 - 20:00',
    duration: 2,
    totalAmount: 1500000,
    status: 'pending',
    createdAt: '2024-01-15T17:30:00'
  }
];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  memberSince: string;
  status: 'active' | 'inactive';
}

export const mockCustomers: Customer[] = [
  {
    id: 'CUS001',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@email.com',
    totalBookings: 25,
    totalSpent: 15000000,
    lastBooking: '2024-01-15',
    memberSince: '2023-06-01',
    status: 'active'
  },
  {
    id: 'CUS002',
    name: 'Trần Văn B',
    phone: '0912345678',
    email: 'tranvanb@email.com',
    totalBookings: 18,
    totalSpent: 12500000,
    lastBooking: '2024-01-15',
    memberSince: '2023-07-15',
    status: 'active'
  },
  {
    id: 'CUS003',
    name: 'Lê Thị C',
    phone: '0923456789',
    email: 'lethic@email.com',
    totalBookings: 12,
    totalSpent: 8000000,
    lastBooking: '2024-01-15',
    memberSince: '2023-08-20',
    status: 'active'
  },
  {
    id: 'CUS004',
    name: 'Phạm Văn D',
    phone: '0934567890',
    email: 'phamvand@email.com',
    totalBookings: 8,
    totalSpent: 4500000,
    lastBooking: '2024-01-16',
    memberSince: '2023-09-10',
    status: 'active'
  },
  {
    id: 'CUS005',
    name: 'Hoàng Văn E',
    phone: '0945678901',
    email: 'hoangvane@email.com',
    totalBookings: 30,
    totalSpent: 25000000,
    lastBooking: '2024-01-16',
    memberSince: '2023-03-01',
    status: 'active'
  },
  {
    id: 'CUS006',
    name: 'Võ Thị F',
    phone: '0956789012',
    email: 'vothif@email.com',
    totalBookings: 5,
    totalSpent: 3000000,
    lastBooking: '2024-01-14',
    memberSince: '2023-11-05',
    status: 'active'
  },
  {
    id: 'CUS007',
    name: 'Đặng Văn G',
    phone: '0967890123',
    email: 'dangvang@email.com',
    totalBookings: 2,
    totalSpent: 1200000,
    lastBooking: '2024-01-10',
    memberSince: '2023-12-20',
    status: 'inactive'
  }
];
