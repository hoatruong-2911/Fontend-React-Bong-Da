import api from "../api";

// --- ĐỊNH NGHĨA TYPES CHUẨN XỊN ---
export interface OrderItem {
  id: number;
  product_id?: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  notes?: string;
  payment_method: string;
  total_amount: number;
  /** * 🛑 ĐỒNG BỘ TRẠNG THÁI: Phải khớp 100% với Migration Database và Giao diện
   * Thêm 'paid', 'preparing' để hết lỗi đỏ so sánh
   */
  status:
    | "pending" // Chờ xác nhận
    | "confirmed" // Đã xác nhận ⬅️ THÊM DÒNG NÀY ĐÂY BRO
    | "paid" // Đã thanh toán
    | "preparing" // Đang chuẩn bị
    | "completed" // Hoàn thành
    | "cancelled"; // Đã hủy
  created_at: string;
  items?: OrderItem[];
}

export interface OrderResponse {
  success: boolean;
  data: Order[];
  message?: string;
}

export interface SingleOrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

// Interface cho dữ liệu gửi lên khi sửa
export interface UpdateOrderPayload {
  customer_name: string;
  phone: string;
  notes?: string;
  status: Order["status"];
  total_amount: number;
  items: {
    product_id: number;
    price: number;
    quantity: number;
  }[];
}

const adminOrderService = {
  getAllOrders: () => {
    return api.get<OrderResponse>("/admin/orders");
  },

  getOrderDetails: (id: number) => {
    return api.get<SingleOrderResponse>(`/admin/orders/${id}`);
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * Khớp Type Order["status"] để đảm bảo không truyền sai string
   */
  updateStatus: (id: number, status: Order["status"]) => {
    return api.put<{ success: boolean; message: string }>(
      `/admin/orders/${id}/status`,
      { status },
    );
  },

  deleteOrder: (id: number) => {
    return api.delete<{ success: boolean; message: string }>(
      `/admin/orders/${id}`,
    );
  },

  updateOrder: (id: number, data: UpdateOrderPayload) => {
    return api.put<{ success: boolean; message: string }>(
      `/admin/orders/${id}`,
      data,
    );
  },
};

export default adminOrderService;
