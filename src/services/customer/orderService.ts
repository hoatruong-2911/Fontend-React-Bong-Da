import api from "../api";

// --- 1. ĐỊNH NGHĨA CÁC INTERFACE (TYPES) ---
export interface OrderItemDetail {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: string | number;
  unit?: string;
  subtotal: string | number;
}

export interface OrderRecord {
  id: number;
  order_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  total_amount: string | number;
  status: "pending" | "preparing" | "completed" | "cancelled" | "paid";
  payment_method: "qr" | "cash";
  notes?: string;
  pickup_address?: string;
  created_at: string;
  items: OrderItemDetail[];
}

export interface OrderResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface StoreOrderData {
  order_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  notes?: string;
  payment_method: "qr" | "cash";
  total_amount: number;
  items: {
    id: number | string;
    name: string;
    price: number;
    quantity: number;
    unit?: string;
  }[];
}

// --- 2. ĐỊNH NGHĨA SERVICE ---
const orderService = {
  getMyOrders: async () => {
    const response = await api.get<OrderResponse<OrderRecord[]>>("/orders");
    return response.data;
  },

  getOrderDetail: async (orderCode: string) => {
    const response = await api.get<OrderResponse<OrderRecord>>(
      `/orders/${orderCode}`
    );
    return response.data;
  },

  checkPaymentStatus: async (orderCode: string, totalAmount: number) => {
    const response = await api.get<{ order_code: string; status: string }>(
      `/orders/check-status/${orderCode}`,
      { params: { total_amount: totalAmount } }
    );
    return response.data;
  },

  storeOrder: async (orderData: StoreOrderData) => {
    const response = await api.post<OrderResponse<OrderRecord>>(
      "/orders",
      orderData
    );
    return response.data;
  },
};

export default orderService;
