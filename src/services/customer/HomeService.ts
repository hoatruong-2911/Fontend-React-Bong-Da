import api from "../api";
// Import interface Field từ file service của sân bóng để dùng chung
import { Field } from "./fieldService";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: string | { name: string };
  brand?: string | { name: string };
  unit?: string;
  stock: number;
  description?: string;
  is_active: boolean;
}

// 🛑 Định nghĩa cấu trúc dữ liệu thô (Raw) từ API để dọn sạch any
interface RawFieldData {
  id: number;
  name: string;
  price: string | number;
  size: string | number;
  rating: string | number;
  available: boolean | number;
  is_vip: boolean | number;
  image: string | null;
  [key: string]: unknown; // Cho phép các trường mở rộng khác mà không dùng any
}

interface RawProductData {
  id: number;
  name: string;
  price: string | number;
  image: string | null;
  category: string | { name: string };
  brand?: string | { name: string };
  unit?: string;
  stock: string | number;
  available?: boolean | number;
  is_active?: boolean | number;
  description?: string;
}

// Interface chuẩn cho ApiResponse
interface ApiResponse<T> {
  success: boolean;
  data: T | { data: T }; // Xử lý trường hợp dữ liệu bọc trong data.data hoặc data
}

const homeService = {
  // Lấy sân bóng: Đã dọn sạch any
  getFeaturedFields: async (): Promise<{ success: boolean; data: Field[] }> => {
    const response = await api.get<ApiResponse<RawFieldData[]>>("/fields");

    // Logic bóc tách linh hoạt: data.data hoặc data
    const rawData = response.data.data;
    const fieldsArray = Array.isArray(rawData)
      ? rawData
      : (rawData as { data: RawFieldData[] }).data;

    const formattedData: Field[] = Array.isArray(fieldsArray)
      ? fieldsArray.map(
          (raw) =>
            ({
              ...raw,
              price: Number(raw.price) || 0,
              size: Number(raw.size) || 0,
              rating: Number(raw.rating) || 0,
              available: Boolean(raw.available),
              is_vip: Boolean(raw.is_vip),
            }) as Field,
        )
      : [];

    return { success: true, data: formattedData };
  },

  // Lấy sản phẩm: Đã dọn sạch any
  getFeaturedProducts: async (): Promise<{
    success: boolean;
    data: Product[];
  }> => {
    const response =
      await api.get<ApiResponse<RawProductData[]>>("/products/customer");

    const rawData = response.data.data;
    const productsArray = Array.isArray(rawData)
      ? rawData
      : (rawData as { data: RawProductData[] }).data;

    const formattedData: Product[] = Array.isArray(productsArray)
      ? productsArray.map(
          (p) =>
            ({
              ...p,
              price: Number(p.price) || 0,
              stock: Number(p.stock) || 0,
              is_active: Boolean(p.available || p.is_active),
            }) as Product,
        )
      : [];

    return { success: true, data: formattedData };
  },
};

export default homeService;
