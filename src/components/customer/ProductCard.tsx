import React from "react";
import { Card, Button, Tag, Typography, Space } from "antd";
import { ShoppingCartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Product } from "@/services/customer/productService";

const { Text } = Typography;

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  // BỔ SUNG: Prop để xử lý logic Mua ngay từ trang danh sách
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
}) => {
  const navigate = useNavigate();
  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      food: "Đồ ăn",
      drink: "Đồ uống",
      apparel: "Quần áo",
      accessories: "Phụ kiện",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "orange",
      drink: "blue",
      apparel: "purple",
      accessories: "green",
    };
    return colors[category] || "default";
  };

  return (
    <Card
      hoverable
      className="h-full border-border shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden"
      cover={
        <div
          className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer p-4"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <img
            alt={product.name}
            src={
              product.image?.startsWith("http")
                ? product.image
                : `${STORAGE_URL}${product.image?.replace(/^\//, "")}`
            }
            className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-105"
          />
          <Tag
            color={getCategoryColor(product.category)}
            className="absolute top-3 left-3 rounded-full px-3 font-bold uppercase italic border-none shadow-sm"
          >
            {getCategoryLabel(product.category)}
          </Tag>
        </div>
      }
    >
      <div className="space-y-3">
        <h3
          className="font-bold text-slate-800 truncate cursor-pointer hover:text-emerald-600 uppercase italic m-0"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          {product.name}
        </h3>

        <Space
          split={<span className="text-gray-200">|</span>}
          className="text-[10px] font-bold uppercase italic text-slate-400 block"
        >
          <Text className="text-blue-500">{product.brand || "Sport Pro"}</Text>
          <Text className="text-orange-500">
            {getCategoryLabel(product.category)}
          </Text>
        </Space>

        <p className="text-gray-400 text-xs line-clamp-2 h-8 italic m-0">
          {product.description || "Chưa có mô tả cho sản phẩm này."}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <Text className="text-lg font-black text-red-500 italic">
              {product.price.toLocaleString("vi-VN")}đ
            </Text>
            <span className="text-gray-400 text-[10px] ml-1">
              /{product.unit || "món"}
            </span>
          </div>
          <Tag
            color={product.stock < 10 ? "red" : "green"}
            className="m-0 border-none font-bold rounded-full px-2 text-[10px]"
          >
            KHO: {product.stock}
          </Tag>
        </div>

        {/* CHỖ THAY ĐỔI: Chia làm 2 nút bấm rực rỡ nằm song song */}
        <div className="flex gap-2">
          <Button
            type="default"
            icon={<ShoppingCartOutlined />}
            className="flex-1 border-emerald-600 text-emerald-600 font-bold italic uppercase h-10 rounded-lg hover:bg-emerald-50"
            onClick={() => onAddToCart?.(product)}
            disabled={product.stock === 0}
          >
            Giỏ hàng
          </Button>

          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            className="flex-1 bg-orange-500 border-none font-bold italic uppercase h-10 rounded-lg shadow-sm hover:bg-orange-600"
            onClick={() => onBuyNow?.(product)} // Gọi hàm Mua ngay truyền từ Products.tsx
            disabled={product.stock === 0}
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </Card>
  );
};
