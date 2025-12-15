export interface Field {
  id: number;
  name: string;
  price: number;
  size: string;
  surface: string;
  description: string;
  image: string;
  features: string[];
  location: string;
  rating: number;
  reviews: number;
  available: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}
