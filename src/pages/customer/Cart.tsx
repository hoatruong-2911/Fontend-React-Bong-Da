import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  InputNumber,
  Typography,
  Empty,
  Divider,
  Row,
  Col,
  Image,
  message,
  Checkbox, // ✅ Thêm Checkbox
} from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";

const { Title, Text } = Typography;

interface CartItem {
  id: string | number;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  size?: string;
  category: string | { name: string };
  unit?: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // ✅ STATE LƯU CÁC ID SẢN PHẨM ĐƯỢC CHỌN
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  const getCartKey = useCallback(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return `cart_user_${user.id}`;
      } catch (e) {
        return "cart_guest";
      }
    }
    return "cart_guest";
  }, []);

  useEffect(() => {
    const currentKey = getCartKey();
    const guestCart = localStorage.getItem("cart_guest");
    const userCart = localStorage.getItem(currentKey);

    if (currentKey !== "cart_guest" && guestCart) {
      const gItems: CartItem[] = JSON.parse(guestCart);
      if (gItems.length > 0) {
        let uItems: CartItem[] = userCart ? JSON.parse(userCart) : [];
        gItems.forEach((gItem) => {
          const existIndex = uItems.findIndex((i) => i.id === gItem.id);
          if (existIndex > -1) {
            uItems[existIndex].quantity += gItem.quantity;
          } else {
            uItems.push(gItem);
          }
        });
        localStorage.setItem(currentKey, JSON.stringify(uItems));
        localStorage.removeItem("cart_guest");
        setCartItems(uItems);
        // ✅ TỰ ĐỘNG CHỌN TẤT CẢ KHI MỚI VÀO
        setSelectedRowKeys(uItems.map((item) => item.id));
        window.dispatchEvent(new Event("storage"));
        return;
      }
    }

    const savedCart = localStorage.getItem(currentKey);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
        // ✅ TỰ ĐỘNG CHỌN TẤT CẢ KHI MỚI VÀO
        setSelectedRowKeys(parsed.map((item: CartItem) => item.id));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, [getCartKey]);

  const handleQuantityChange = (
    id: string | number,
    quantity: number | null,
  ) => {
    if (quantity && quantity > 0) {
      const updatedCart = cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      );
      setCartItems(updatedCart);
      localStorage.setItem(getCartKey(), JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleRemoveItem = (id: string | number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    setSelectedRowKeys(selectedRowKeys.filter((key) => key !== id)); // Bỏ chọn nếu xóa
    localStorage.setItem(getCartKey(), JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
    message.success("Đã xóa sản phẩm khỏi giỏ hàng rực rỡ!");
  };

  const handleClearCart = () => {
    setCartItems([]);
    setSelectedRowKeys([]);
    localStorage.removeItem(getCartKey());
    window.dispatchEvent(new Event("storage"));
    message.success("Đã dọn sạch giỏ hàng!");
  };

  // ✅ LOGIC TÍNH TIỀN CHỈ CHO NHỮNG MÓN ĐƯỢC CHỌN
  const selectedItems = cartItems.filter((item) =>
    selectedRowKeys.includes(item.id),
  );
  const subtotal: number = selectedItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const total: number = subtotal;

  // ✅ CHUYỂN DỮ LIỆU SANG CHECKOUT
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning("Ní chọn ít nhất 1 sản phẩm để thanh toán nhé!");
      return;
    }
    // Truyền mảng sản phẩm đã chọn qua state
    navigate("/checkout", { state: { checkoutItems: selectedItems } });
  };

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 350,
      render: (_: unknown, record: CartItem) => {
        const fullImageUrl = record.image?.startsWith("http")
          ? record.image
          : `${STORAGE_URL}${record.image?.replace(/^\//, "")}`;

        const categoryName =
          typeof record.category === "object"
            ? record.category?.name
            : record.category;

        return (
          <div className="flex items-center gap-4">
            <Image
              src={fullImageUrl}
              alt={record.name}
              width={80}
              height={80}
              className="rounded-xl object-cover shadow-sm border border-gray-100"
              preview={false}
              fallback="https://placehold.co/80x80?text=No+Image"
            />
            <div>
              <div className="font-black text-slate-800 uppercase italic text-[13px] leading-tight mb-1">
                {record.name}
              </div>
              <div className="text-[10px] font-black uppercase italic text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                {categoryName || "Sản phẩm"}
              </div>
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
        <Text className="text-slate-600 font-black italic">
          {Number(price).toLocaleString("vi-VN")}đ
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
          className="rounded-xl font-black italic w-20 custom-input-number"
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 150,
      render: (_: unknown, record: CartItem) => (
        <Text className="text-lg text-emerald-600 font-black italic">
          {(Number(record.price) * record.quantity).toLocaleString("vi-VN")}đ
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
          className="hover:bg-red-50 rounded-lg flex items-center justify-center h-10 w-10"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] py-12 animate-in fade-in duration-500">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/products")}
              className="rounded-2xl font-black italic border-none bg-white shadow-xl h-12 uppercase text-xs"
            >
              Tiếp tục mua sắm
            </Button>
            <Title
              level={1}
              className="!mb-0 !font-black !italic !uppercase !text-slate-800 tracking-tighter"
            >
              🛒 Giỏ Hàng{" "}
              <span className="text-emerald-500">({cartItems.length})</span>
            </Title>
          </div>
          {cartItems.length > 0 && (
            <Button
              danger
              type="link"
              onClick={handleClearCart}
              className="font-black uppercase italic hover:scale-105 transition-transform"
            >
              Xóa sạch giỏ hàng
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-24 rounded-[40px] shadow-2xl border-none bg-white">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-6">
                  <Text className="text-2xl font-black italic uppercase text-gray-300 block">
                    Giỏ hàng của bạn đang trống rực rỡ
                  </Text>
                  <div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingOutlined />}
                      onClick={() => navigate("/products")}
                      className="h-16 px-12 rounded-[2rem] bg-emerald-600 border-none font-black italic uppercase shadow-2xl shadow-emerald-500/20 text-lg"
                    >
                      Bắt đầu mua sắm ngay
                    </Button>
                  </div>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white/95 backdrop-blur-sm">
                {/* ✅ THÊM ROW SELECTION ĐỂ CHỌN DÒNG */}
                <Table
                  rowSelection={{
                    type: "checkbox",
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                  }}
                  dataSource={cartItems}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  className="custom-cart-table"
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="shadow-2xl border-none rounded-[3rem] sticky top-24 bg-white p-6">
                <Title
                  level={3}
                  className="!font-black !italic !uppercase !text-slate-800 !mb-8"
                >
                  Tóm tắt đơn hàng
                </Title>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-400 font-black uppercase italic text-[10px] tracking-widest">
                      Số lượng món đã chọn:
                    </Text>
                    <Text className="font-black italic text-emerald-600">
                      {selectedItems.length} món
                    </Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-400 font-black uppercase italic text-[10px] tracking-widest">
                      Tạm tính:
                    </Text>
                    <Text className="font-black italic text-slate-700">
                      {subtotal.toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-400 font-black uppercase italic text-[10px] tracking-widest">
                      Vận chuyển:
                    </Text>
                    <Tag
                      color="blue"
                      className="rounded-full font-black italic border-none px-4"
                    >
                      MIỄN PHÍ
                    </Tag>
                  </div>
                  <Divider className="border-gray-50 my-2" />
                  <div className="flex justify-between items-center bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 shadow-inner">
                    <Text className="font-black italic uppercase text-emerald-800 text-sm">
                      Tổng cộng:
                    </Text>
                    <Text className="text-3xl font-black italic text-emerald-700 tracking-tighter">
                      {total.toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <Button
                    type="primary"
                    size="large"
                    block
                    disabled={selectedItems.length === 0}
                    icon={<CreditCardOutlined />}
                    className={`h-20 rounded-[2rem] border-none font-black italic uppercase shadow-2xl text-xl transition-all ${
                      selectedItems.length > 0
                        ? "bg-emerald-600 shadow-emerald-500/20 hover:scale-[1.02] active:scale-95"
                        : "bg-gray-300 shadow-none cursor-not-allowed"
                    }`}
                    onClick={handleCheckout}
                  >
                    Thanh toán ngay ({selectedItems.length})
                  </Button>
                </div>
                <Divider className="border-gray-50" />
                <div className="text-center space-y-2 opacity-50">
                  <div className="text-[9px] font-black italic uppercase tracking-widest text-slate-400">
                    🔒 Thanh toán bảo mật Platinum 100%
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      <style>{`
        .custom-cart-table .ant-table-thead > tr > th { background: #f8fafc !important; font-weight: 900 !important; font-style: italic !important; font-size: 11px !important; text-transform: uppercase !important; color: #64748b !important; padding: 20px !important; border: none !important; }
        .custom-cart-table .ant-table-tbody > tr > td { padding: 24px 20px !important; border-bottom: 1px solid #f8fafc !important; }
        /* ✅ TÙY CHỈNH CHECKBOX CHO PLATINUM */
        .ant-checkbox-checked .ant-checkbox-inner { background-color: #10b981 !important; border-color: #10b981 !important; }
        .ant-checkbox-wrapper:hover .ant-checkbox-inner, .ant-checkbox:hover .ant-checkbox-inner { border-color: #10b981 !important; }
        .custom-input-number .ant-input-number-handler-wrap { display: none !important; }
        .custom-input-number input { text-align: center !important; }
      `}</style>
    </div>
  );
}
