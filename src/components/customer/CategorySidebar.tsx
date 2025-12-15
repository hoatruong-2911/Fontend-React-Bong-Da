import { Card, Menu } from 'antd';
import { 
  AppstoreOutlined,
  CoffeeOutlined,
  SkinOutlined,
  GiftOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { ProductCategory } from '@/types/product';

interface CategorySidebarProps {
  selectedCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  const categories = [
    { key: 'all', label: 'Tất cả sản phẩm', icon: <AppstoreOutlined /> },
    { key: 'food', label: 'Đồ ăn', icon: <CoffeeOutlined /> },
    { key: 'drink', label: 'Đồ uống', icon: <CoffeeOutlined /> },
    { key: 'apparel', label: 'Quần áo', icon: <SkinOutlined /> },
    { key: 'accessories', label: 'Phụ kiện', icon: <GiftOutlined /> },
  ];

  const menuItems = categories.map(cat => ({
    key: cat.key,
    icon: cat.icon,
    label: cat.label,
  }));

  return (
    <Card className="sticky top-24 border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
        <ShoppingOutlined className="text-xl text-primary" />
        <h3 className="font-semibold text-foreground m-0">Danh mục</h3>
      </div>
      <Menu
        mode="vertical"
        selectedKeys={[selectedCategory]}
        onClick={({ key }) => onCategoryChange(key as ProductCategory | 'all')}
        items={menuItems}
        className="border-0"
      />
    </Card>
  );
};

export default CategorySidebar;
