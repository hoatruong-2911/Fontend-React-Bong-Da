import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  InputNumber,
  Space,
  Typography,
  Empty,
  Divider,
  Row,
  Col,
  Image,
  message,
} from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  category: string;
  unit?: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Khai báo STORAGE_URL để hiển thị ảnh từ Backend
  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const handleQuantityChange = (id: string, quantity: number | null) => {
    if (quantity && quantity > 0) {
      const updatedCart = cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const handleRemoveItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    message.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    message.success("Đã xóa toàn bộ giỏ hàng");
  };

  const subtotal: number = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount: number = 0;
  const shipping: number = 0;
  const total: number = subtotal - discount + shipping;

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 350,
      render: (_: unknown, record: CartItem) => {
        // Logic xử lý đường dẫn ảnh đồng bộ với hệ thống
        const fullImageUrl = record.image?.startsWith("http")
          ? record.image
          : `${STORAGE_URL}${record.image?.replace(/^\//, "")}`;

        return (
          <div className="flex items-center gap-4">
            <Image
              src={fullImageUrl}
              alt={record.name}
              width={80}
              height={80}
              className="rounded-lg object-cover shadow-sm border border-gray-100"
              preview={false}
              // Hiển thị ảnh thay thế nếu lỗi đường dẫn
              fallback="https://placehold.co/80x80?text=No+Image"
            />
            <div>
              <div className="font-bold text-slate-800 uppercase italic text-[13px]">
                {record.name}
              </div>
              <div className="text-[10px] font-bold uppercase italic text-emerald-600">
                {record.category}
              </div>
              {record.size && (
                <div className="text-xs text-gray-400">Size: {record.size}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price: number) => (
        <Text strong className="text-red-500 italic">
          {price.toLocaleString("vi-VN")}đ
        </Text>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 150,
      render: (_: unknown, record: CartItem) => (
        <InputNumber
          min={1}
          max={99}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
          size="large"
          className="rounded-lg font-bold"
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 150,
      render: (_: unknown, record: CartItem) => (
        <Text strong className="text-lg text-emerald-600 italic">
          {(record.price * record.quantity).toLocaleString("vi-VN")}đ
        </Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
          className="hover:bg-red-50"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] py-12 animate-in fade-in duration-500">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/products")}
              className="rounded-xl font-bold border-none bg-white shadow-md h-12"
            >
              Tiếp tục mua sắm
            </Button>
            <Title
              level={1}
              className="!mb-0 !font-black !italic !uppercase !text-slate-800"
            >
              🛒 Giỏ Hàng{" "}
              <span className="text-emerald-500">({cartItems.length})</span>
            </Title>
          </div>
          {cartItems.length > 0 && (
            <Button
              danger
              type="text"
              onClick={handleClearCart}
              className="font-bold uppercase italic hover:bg-red-50"
            >
              Xóa toàn bộ
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-24 rounded-[32px] shadow-xl border-none">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-6">
                  <Text className="text-xl font-black italic uppercase text-gray-300">
                    Giỏ hàng của bạn đang trống rực rỡ
                  </Text>
                  <div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingOutlined />}
                      onClick={() => navigate("/products")}
                      className="h-16 px-10 rounded-2xl bg-emerald-600 border-none font-black italic uppercase shadow-xl shadow-emerald-100"
                    >
                      Mua sắm ngay
                    </Button>
                  </div>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[32, 32]}>
            {/* Cart Items */}
            <Col xs={24} lg={16}>
              <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
                <Table
                  dataSource={cartItems}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  className="custom-cart-table"
                />
              </Card>
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={8}>
              <Card className="shadow-2xl border-none rounded-[32px] sticky top-24 bg-white p-4">
                <Title
                  level={3}
                  className="!font-black !italic !uppercase !text-slate-800"
                >
                  Tóm tắt đơn hàng
                </Title>
                <Divider className="border-gray-50" />

                <div className="space-y-6">
                  <div className="flex justify-between">
                    <Text className="text-gray-400 font-bold uppercase italic text-xs">
                      Tạm tính:
                    </Text>
                    <Text className="font-bold">
                      {subtotal.toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-400 font-bold uppercase italic text-xs">
                      Giảm giá:
                    </Text>
                    <Text className="text-emerald-500 font-bold">
                      -{discount.toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-400 font-bold uppercase italic text-xs">
                      Phí vận chuyển:
                    </Text>
                    <Text className="text-blue-500 font-bold">
                      {shipping === 0
                        ? "MIỄN PHÍ"
                        : `${shipping.toLocaleString("vi-VN")}đ`}
                    </Text>
                  </div>

                  <Divider className="border-gray-50 my-2" />

                  <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-inner">
                    <Text className="font-black italic uppercase text-emerald-800">
                      Tổng cộng:
                    </Text>
                    <Text className="text-3xl font-black italic text-emerald-700">
                      {total.toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<CreditCardOutlined />}
                    className="h-20 rounded-2xl bg-emerald-600 border-none font-black italic uppercase shadow-xl shadow-emerald-100 text-xl hover:scale-[1.02] transition-transform"
                    onClick={() => navigate("/checkout")}
                  >
                    Thanh toán ngay
                  </Button>
                  <Button
                    size="large"
                    block
                    onClick={() => navigate("/products")}
                    className="h-14 rounded-2xl border-gray-100 font-bold uppercase italic text-gray-400 hover:text-emerald-600"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </div>

                <Divider className="border-gray-50" />

                <div className="text-center space-y-2 opacity-50">
                  <div className="text-[10px] font-black italic uppercase">
                    🔒 Thanh toán bảo mật 100%
                  </div>
                  <div className="text-[10px] font-black italic uppercase">
                    📞 Hỗ trợ: 0123 456 789
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}
