import { Staff, FieldBooking, StaffOrder, StaffStats } from "@/types/staff";

export const currentStaff: Staff = {
  id: "staff-001",
  name: "Nguyễn Văn An",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff001",
  phone: "0901234567",
  email: "an.nguyen@stadium.com",
  position: "Nhân viên quầy",
  department: "Dịch vụ khách hàng",
  joinDate: "2023-01-15",
  status: "active",
  shift: "Ca sáng (8:00 - 16:00)",
  salary: 8000000,
  bonus: 500000,
};

export const currentStaffStats: StaffStats = {
  totalOrders: 156,
  totalRevenue: 45600000,
  fieldsManaged: 23,
  todayRevenue: 1850000,
  ordersToday: 8,
  rating: 4.8,
};

export const activeFieldBookings: FieldBooking[] = [
  {
    id: "field-001",
    fieldName: "Sân 5 người",
    fieldNumber: 1,
    startTime: "2024-01-15T09:00:00",
    customerName: "Trần Văn Bình",
    customerPhone: "0912345678",
    pricePerHour: 200000,
    status: "playing",
  },
  {
    id: "field-002",
    fieldName: "Sân 7 người",
    fieldNumber: 3,
    startTime: "2024-01-15T10:30:00",
    customerName: "Lê Thị Hoa",
    customerPhone: "0923456789",
    pricePerHour: 300000,
    status: "playing",
  },
  {
    id: "field-003",
    fieldName: "Sân 11 người",
    fieldNumber: 5,
    startTime: "2024-01-15T14:00:00",
    customerName: "Phạm Minh Tuấn",
    customerPhone: "0934567890",
    pricePerHour: 500000,
    status: "reserved",
  },
];

export const recentOrders: StaffOrder[] = [
  {
    id: "order-001",
    customerName: "Trần Văn Bình",
    items: [
      { productId: "1", productName: "Nước suối Aquafina", quantity: 4, price: 10000 },
      { productId: "2", productName: "Bánh mì thịt", quantity: 2, price: 25000 },
    ],
    totalAmount: 90000,
    status: "completed",
    createdAt: "2024-01-15T09:30:00",
    staffId: "staff-001",
  },
  {
    id: "order-002",
    customerName: "Lê Thị Hoa",
    items: [
      { productId: "3", productName: "Cà phê sữa đá", quantity: 3, price: 20000 },
      { productId: "4", productName: "Revive", quantity: 2, price: 15000 },
    ],
    totalAmount: 90000,
    status: "preparing",
    createdAt: "2024-01-15T10:45:00",
    staffId: "staff-001",
  },
  {
    id: "order-003",
    items: [
      { productId: "5", productName: "Áo đấu CLB", quantity: 1, price: 250000 },
    ],
    totalAmount: 250000,
    status: "pending",
    createdAt: "2024-01-15T11:15:00",
    staffId: "staff-001",
  },
];
