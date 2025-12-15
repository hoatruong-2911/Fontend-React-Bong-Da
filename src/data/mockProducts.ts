import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  // Đồ ăn
  {
    id: '1',
    name: 'Bánh mì thịt nướng',
    category: 'food',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1598182198871-d3f4ab4fd181?w=500',
    description: 'Bánh mì thịt nướng thơm ngon',
    stock: 50,
    unit: 'cái'
  },
  {
    id: '2',
    name: 'Xúc xích nướng',
    category: 'food',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1612392062422-4c7678c6faa0?w=500',
    description: 'Xúc xích nướng than hoa',
    stock: 100,
    unit: 'cái'
  },
  {
    id: '3',
    name: 'Mì tôm trứng',
    category: 'food',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
    description: 'Mì tôm trứng nóng hổi',
    stock: 30,
    unit: 'tô'
  },
  {
    id: '4',
    name: 'Snack khoai tây',
    category: 'food',
    price: 10000,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
    description: 'Snack khoai tây giòn tan',
    stock: 80,
    unit: 'gói'
  },
  
  // Thức uống
  {
    id: '5',
    name: 'Coca Cola',
    category: 'drink',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500',
    description: 'Nước ngọt có ga Coca Cola',
    stock: 120,
    unit: 'chai'
  },
  {
    id: '6',
    name: 'Pepsi',
    category: 'drink',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500',
    description: 'Nước ngọt có ga Pepsi',
    stock: 100,
    unit: 'chai'
  },
  {
    id: '7',
    name: 'Nước tăng lực Red Bull',
    category: 'drink',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
    description: 'Nước tăng lực Red Bull',
    stock: 90,
    unit: 'lon'
  },
  {
    id: '8',
    name: 'Sting dâu',
    category: 'drink',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500',
    description: 'Nước tăng lực Sting vị dâu',
    stock: 110,
    unit: 'chai'
  },
  {
    id: '9',
    name: 'Aquafina',
    category: 'drink',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500',
    description: 'Nước suối tinh khiết',
    stock: 150,
    unit: 'chai'
  },
  
  // Trang phục
  {
    id: '10',
    name: 'Áo đấu Manchester United',
    category: 'apparel',
    price: 250000,
    image: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=500',
    description: 'Áo đấu CLB Manchester United chính hãng',
    stock: 20,
    unit: 'cái'
  },
  {
    id: '11',
    name: 'Áo đấu Real Madrid',
    category: 'apparel',
    price: 250000,
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500',
    description: 'Áo đấu CLB Real Madrid chính hãng',
    stock: 18,
    unit: 'cái'
  },
  {
    id: '12',
    name: 'Quần đùi thể thao',
    category: 'apparel',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
    description: 'Quần đùi thể thao cao cấp',
    stock: 40,
    unit: 'cái'
  },
  {
    id: '13',
    name: 'Tất bóng đá Nike',
    category: 'apparel',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500',
    description: 'Tất bóng đá Nike chống trượt',
    stock: 60,
    unit: 'đôi'
  },
  
  // Phụ kiện
  {
    id: '14',
    name: 'Giày đá bóng Adidas',
    category: 'accessories',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500',
    description: 'Giày đá bóng Adidas Predator',
    stock: 15,
    unit: 'đôi'
  },
  {
    id: '15',
    name: 'Giày đá bóng Nike',
    category: 'accessories',
    price: 920000,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    description: 'Giày đá bóng Nike Mercurial',
    stock: 12,
    unit: 'đôi'
  },
  {
    id: '16',
    name: 'Găng tay thủ môn',
    category: 'accessories',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500',
    description: 'Găng tay thủ môn chuyên nghiệp',
    stock: 25,
    unit: 'đôi'
  },
  {
    id: '17',
    name: 'Bóng đá Nike',
    category: 'accessories',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1614632537323-2f1c3c0d51cc?w=500',
    description: 'Bóng đá Nike Premier League',
    stock: 30,
    unit: 'quả'
  },
  {
    id: '18',
    name: 'Bảo vệ ống đồng',
    category: 'accessories',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500',
    description: 'Bảo vệ ống đồng chống chấn thương',
    stock: 45,
    unit: 'đôi'
  }
];
