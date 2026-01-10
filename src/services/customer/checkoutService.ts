import api from "../api";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  image?: string;
}

export interface StoreOrderData {
  order_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  notes?: string;
  payment_method: "qr" | "cash";
  total_amount: number;
  items: CartItem[];
}

export interface OrderDataResponse {
  id: number;
  order_code: string;
  status: string;
  total_amount: string;
  items: CartItem[];
}

export interface OrderResponse {
  status: string;
  message: string;
  data: OrderDataResponse;
}

export interface PaymentStatusResponse {
  order_code: string;
  status: "pending" | "paid" | "completed" | "cancelled";
}

const checkoutService = {
  // Lưu đơn hàng vào DB
  storeOrder: (data: StoreOrderData) => {
    return api.post<OrderResponse>("/orders", data);
  },

  // Kiểm tra trạng thái thanh toán (Polling)

  checkPaymentStatus: (orderCode: string, amount: number) => {
    // Truyền amount dưới dạng query string để Backend xử lý
    return api.get<PaymentStatusResponse>(`/orders/check-status/${orderCode}`, {
      params: { total_amount: amount },
    });
  },

  
};

export default checkoutService;
