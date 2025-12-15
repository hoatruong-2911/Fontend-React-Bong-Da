export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  description: string;
  stock: number;
  unit: string;
}

export type ProductCategory = 
  | 'food'
  | 'drink'
  | 'apparel'
  | 'accessories';

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  icon: string;
}
