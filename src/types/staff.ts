export interface Staff {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  position: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'off';
  shift: string;
  salary: number;
  bonus: number;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  date: string;
  staff: string[];
}

export interface FieldBooking {
  id: string;
  fieldName: string;
  fieldNumber: number;
  startTime: string;
  endTime?: string;
  customerName: string;
  customerPhone: string;
  pricePerHour: number;
  status: 'playing' | 'completed' | 'reserved';
  totalAmount?: number;
}

export interface StaffOrder {
  id: string;
  customerName?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: string;
  staffId: string;
}

export interface StaffStats {
  totalOrders: number;
  totalRevenue: number;
  fieldsManaged: number;
  todayRevenue: number;
  ordersToday: number;
  rating: number;
}
