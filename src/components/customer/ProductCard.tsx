import { Card, Button, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      food: 'Đồ ăn',
      drink: 'Đồ uống',
      apparel: 'Quần áo',
      accessories: 'Phụ kiện'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: 'orange',
      drink: 'blue',
      apparel: 'purple',
      accessories: 'green'
    };
    return colors[category] || 'default';
  };

  return (
    <Card
      hoverable
      className="h-full border-border shadow-sm hover:shadow-md transition-all"
      cover={
        <div 
          className="relative h-48 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <img
            alt={product.name}
            src={product.image}
            className="w-full h-full object-cover"
          />
          <Tag 
            color={getCategoryColor(product.category)}
            className="absolute top-2 left-2"
          >
            {getCategoryLabel(product.category)}
          </Tag>
        </div>
      }
    >
      <div className="space-y-3">
        <h3 
          className="font-semibold text-foreground truncate cursor-pointer hover:text-primary"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {product.price.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-muted-foreground text-sm ml-1">/{product.unit}</span>
          </div>
          <span className="text-muted-foreground text-sm">
            Còn {product.stock}
          </span>
        </div>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          className="w-full"
          onClick={() => onAddToCart?.(product)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
