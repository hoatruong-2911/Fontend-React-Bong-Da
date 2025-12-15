import React from 'react';
import { Row, Col, Empty, message } from 'antd';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: { xs: number; sm: number; md: number; lg: number; xl: number };
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  loading = false,
  columns = { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }
}) => {
  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
        unit: product.unit,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    message.success('Đã thêm vào giỏ hàng');
  };

  if (!loading && products.length === 0) {
    return <Empty description="Không có sản phẩm nào" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <Col key={product.id} {...columns}>
          <ProductCard product={product} onAddToCart={handleAddToCart} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
