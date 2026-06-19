import React from "react";
import { Card, Button, Tag, Typography, Space, message } from "antd"; // Thêm message
import { ShoppingCartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Product } from "@/services/customer/productService";

const { Text } = Typography;

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
}) => {
  const navigate = useNavigate();
  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  // ✅ HÀM XỬ LÝ THÊM VÀO GIỎ RIÊNG BIỆT
  const handleInternalAddToCart = () => {
    const userStr = localStorage.getItem("user");
    let cartKey = "cart_guest";

    if (userStr) {
      const user = JSON.parse(userStr);
      cartKey = `cart_user_${user.id}`;
    }

    const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingItem = currentCart.find(
      (item: any) => item.id === product.id,
    );

    let updatedCart;
    if (existingItem) {
      updatedCart = currentCart.map((item: any) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      updatedCart = [...currentCart, { ...product, quantity: 1 }];
    }

    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
    // message.success(`Đã thêm ${product.name} vào giỏ hàng!`);

    if (onAddToCart) onAddToCart(product);
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      food: "Đồ ăn",
      drink: "Đồ uống",
      apparel: "Quần áo",
      accessories: "Phụ kiện",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string): string => {
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
          className="relative h-56 bg-white flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <img
            alt={product.name}
            src={
              product.image?.startsWith("http")
                ? product.image
                : `${STORAGE_URL}${product.image?.replace(/^\//, "")}`
            }
            className="w-full h-full object-contain transition-transform duration-500 hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x400?text=⚽+Sản+Phẩm";
            }}
          />
          <Tag
            color={getCategoryColor(product.category)}
            className="absolute top-3 left-3 rounded-full px-3 font-black uppercase italic border-none shadow-md"
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

        <div className="flex gap-2">
          <Button
            type="default"
            icon={<ShoppingCartOutlined />}
            className="flex-1 border-emerald-600 text-emerald-600 font-bold italic uppercase h-10 rounded-lg hover:bg-emerald-50"
            onClick={handleInternalAddToCart}
            disabled={product.stock === 0}
          >
            Thêm Giỏ hàng
          </Button>

          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            className="flex-1 bg-orange-500 border-none font-bold italic uppercase h-10 rounded-lg shadow-sm hover:bg-orange-600"
            onClick={() => onBuyNow?.(product)}
            disabled={product.stock === 0}
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
