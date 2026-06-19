import api from "../api";
import { OrderResponse } from "../customer/checkoutService";

// --- ĐỊNH NGHĨA TYPES (Khớp với OrderController và Model ní gửi) ---
export interface CreateOrderPayload {
  order_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  notes?: string;
  payment_method: "qr" | "cash";
  total_amount: number;
  status: string; // "confirmed" hoặc "paid"
  items: {
    product_id: number;
    price: number;
    quantity: number;
  }[];
}

const staffOrderService = {
  // 1. Lấy danh sách sản phẩm để hiển thị trong Modal (Dùng API sẵn có)
  getProducts: () => {
    return api.get("/products");
  },

  // 2. Lấy danh sách đơn hàng ( Laravel lọc theo Role )
  getAllOrders: () => {
    return api.get("/orders");
  },

  // 3. Cập nhật trạng thái đơn (Xác nhận, Thu tiền...)
  updateStatus: (id: number, status: string) => {
    return api.put(`/orders/${id}/status`, { status });
  },

  /**
   * ✅ HÀM QUAN TRỌNG: Tạo đơn hàng tại quầy
   * Gửi về đúng endpoint /orders mà Backend đã có hàm store()
   */
  createOrder: (data: CreateOrderPayload) => {
    return api.post<OrderResponse>("/orders", data);
  },
};

export default staffOrderService;
