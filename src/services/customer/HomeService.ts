import api from "../api";

export interface Field {
  id: number;
  name: string;
  image: string | null;
  price_per_hour: number;
  type: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: string;
  brand?: string;
  unit?: string;
  stock: number;
  description?: string;
  is_active: boolean;
}

// Interface định nghĩa dữ liệu thô từ API
interface RawFieldResponse {
  id: number;
  name: string;
  image: string | null;
  price_per_hour: string | number;
  type: number;
  is_active: boolean | number;
}

interface RawProductResponse {
  id: number;
  name: string;
  price: string | number;
  category?: { name: string } | string;
  brand?: { name: string } | string;
  image?: string;
  stock?: string | number;
  unit?: string;
  available?: boolean | number;
  description?: string;
}

const homeService = {
  getFeaturedFields: async () => {
    const response = await api.get<{
      success: boolean;
      data: RawFieldResponse[];
    }>("/fields");
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get<{
      success: boolean;
      data: RawProductResponse[];
    }>("/products/customer");
    return response.data;
  },
};

export default homeService;
