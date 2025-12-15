export interface Notification {
  id: string;
  type: 'order' | 'booking' | 'system' | 'promotion';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Đơn hàng mới',
    message: 'Đơn hàng #ORD001 đã được tạo thành công',
    isRead: false,
    createdAt: '2024-01-15T10:30:00',
    link: '/orders/1',
  },
  {
    id: '2',
    type: 'booking',
    title: 'Đặt sân thành công',
    message: 'Bạn đã đặt sân 5 người số 1 vào ngày 16/01/2024',
    isRead: false,
    createdAt: '2024-01-15T09:15:00',
    link: '/bookings/1',
  },
  {
    id: '3',
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống sẽ bảo trì vào 22:00 ngày 20/01/2024',
    isRead: true,
    createdAt: '2024-01-14T14:00:00',
  },
  {
    id: '4',
    type: 'promotion',
    title: 'Khuyến mãi đặc biệt',
    message: 'Giảm 20% cho tất cả đồ uống trong tuần này!',
    isRead: true,
    createdAt: '2024-01-13T08:00:00',
  },
  {
    id: '5',
    type: 'order',
    title: 'Đơn hàng hoàn thành',
    message: 'Đơn hàng #ORD002 đã được giao thành công',
    isRead: true,
    createdAt: '2024-01-12T16:45:00',
  },
];

export const mockCustomerOrders = [
  {
    id: 1,
    orderCode: 'ORD001',
    items: [
      { productName: 'Coca Cola', quantity: 2, unitPrice: 15000, subtotal: 30000 },
      { productName: 'Bánh mì thịt', quantity: 1, unitPrice: 25000, subtotal: 25000 },
    ],
    subtotal: 55000,
    discount: 0,
    total: 55000,
    status: 'completed',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    createdAt: '2024-01-15T10:30:00',
  },
  {
    id: 2,
    orderCode: 'ORD002',
    items: [
      { productName: 'Áo đấu Manchester United', quantity: 1, unitPrice: 450000, subtotal: 450000 },
    ],
    subtotal: 450000,
    discount: 45000,
    total: 405000,
    status: 'completed',
    paymentMethod: 'transfer',
    paymentStatus: 'paid',
    createdAt: '2024-01-14T15:20:00',
  },
  {
    id: 3,
    orderCode: 'ORD003',
    items: [
      { productName: 'Nước suối', quantity: 5, unitPrice: 10000, subtotal: 50000 },
      { productName: 'Snack khoai tây', quantity: 3, unitPrice: 20000, subtotal: 60000 },
    ],
    subtotal: 110000,
    discount: 0,
    total: 110000,
    status: 'preparing',
    paymentMethod: 'qr',
    paymentStatus: 'paid',
    createdAt: '2024-01-15T11:00:00',
  },
  {
    id: 4,
    orderCode: 'ORD004',
    items: [
      { productName: 'Giày đá bóng Nike', quantity: 1, unitPrice: 1200000, subtotal: 1200000 },
      { productName: 'Vớ thể thao', quantity: 2, unitPrice: 50000, subtotal: 100000 },
    ],
    subtotal: 1300000,
    discount: 130000,
    total: 1170000,
    status: 'pending',
    paymentMethod: 'card',
    paymentStatus: 'unpaid',
    createdAt: '2024-01-15T12:30:00',
  },
];
