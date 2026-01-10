import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Steps,
  Form,
  Input,
  Radio,
  Button,
  Divider,
  Typography,
  Space,
  message,
  Result,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  BankOutlined,
  WalletOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  unit?: string;
}

interface OrderInfo {
  customerName: string;
  phone: string;
  email: string;
  notes: string;
}

const mockQRData = {
  bankName: "Vietcombank",
  accountNumber: "1034993840",
  accountName: "TRUONG THANH HOA",
  bankCode: "VCB",
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("qr");
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    customerName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [form] = Form.useForm();

  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  // FIX LỖI: ĐỊNH NGHĨA BIẾN STEPS TẠI ĐÂY
  const steps = [
    { title: "Thông tin", icon: <UserOutlined /> },
    { title: "Thanh toán", icon: <CreditCardOutlined /> },
    { title: "Hoàn tất", icon: <CheckCircleOutlined /> },
  ];

  useEffect(() => {
    if (location.state && location.state.buyNowItem) {
      setCartItems([location.state.buyNowItem]);
    } else {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [location.state]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = 0;
  const serviceFee = subtotal * 0.02;
  const total = subtotal - discount + serviceFee;

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  const generateQRContent = () => {
    return `${mockQRData.bankCode}|${mockQRData.accountNumber}|${
      mockQRData.accountName
    }|${total}|${orderId || "ORDER"}`;
  };

  const handleInfoSubmit = (values: OrderInfo) => {
    setOrderInfo(values);
    setCurrentStep(1);
  };

  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(2);
      setOrderComplete(true);
      if (!location.state || !location.state.buyNowItem) {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));
      }
      message.success("Đặt hàng thành công rực rỡ!");
    }, 2000);
  };

  const renderOrderSummary = () => (
    <Card className="sticky top-4 shadow-xl border-none rounded-[32px] overflow-hidden bg-white">
      <Title
        level={4}
        className="!font-black !italic !uppercase !text-slate-800 flex items-center gap-2 mb-6"
      >
        <ShoppingCartOutlined className="text-emerald-500" /> Đơn hàng (
        {cartItems.length})
      </Title>

      <div className="max-h-80 overflow-y-auto mb-6 pr-2">
        {cartItems.map((item) => {
          const fullImageUrl = item.image?.startsWith("http")
            ? item.image
            : `${STORAGE_URL}${item.image?.replace(/^\//, "")}`;

          return (
            <div
              key={item.id}
              className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={fullImageUrl}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-2xl shadow-sm border border-gray-100 group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    x{item.quantity}
                  </span>
                </div>
                <div>
                  <Text className="block text-sm font-black uppercase italic text-slate-700 truncate w-32">
                    {item.name}
                  </Text>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase italic tracking-tighter">
                    Giá: {item.price.toLocaleString("vi-VN")}đ
                  </Text>
                </div>
              </div>
              <Text className="font-black italic text-emerald-600">
                {(item.price * item.quantity).toLocaleString("vi-VN")}đ
              </Text>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 bg-gray-50 p-6 rounded-[24px] border border-gray-100 shadow-inner">
        <div className="flex justify-between">
          <Text className="text-gray-400 font-bold uppercase italic text-[10px]">
            Tạm tính:
          </Text>
          <Text className="font-bold">{subtotal.toLocaleString("vi-VN")}đ</Text>
        </div>
        <div className="flex justify-between">
          <Text className="text-gray-400 font-bold uppercase italic text-[10px]">
            Dịch vụ (2%):
          </Text>
          <Text className="font-bold">
            {serviceFee.toLocaleString("vi-VN")}đ
          </Text>
        </div>
        <Divider className="my-2 border-gray-200" />
        <div className="flex justify-between items-center">
          <Text className="font-black italic uppercase text-emerald-800">
            Tổng cộng:
          </Text>
          <Text className="text-2xl font-black italic text-emerald-600">
            {total.toLocaleString("vi-VN")}đ
          </Text>
        </div>
      </div>
    </Card>
  );

  const renderInfoStep = () => (
    <Card className="shadow-2xl border-none rounded-[32px] p-4">
      <Title
        level={4}
        className="!font-black !italic !uppercase !text-slate-800 mb-8"
      >
        <UserOutlined className="text-blue-500 mr-2" /> Thông tin nhận hàng
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleInfoSubmit}
        initialValues={orderInfo}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerName"
              label={
                <span className="font-black uppercase italic text-[10px] text-gray-400">
                  Họ và tên
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input
                placeholder="Ví dụ: Anh Ba Khía"
                className="rounded-xl h-12 font-bold"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={
                <span className="font-black uppercase italic text-[10px] text-gray-400">
                  Số điện thoại
                </span>
              }
              rules={[{ required: true, message: "Nhập SĐT" }]}
            >
              <Input
                placeholder="09xxxxxxx"
                className="rounded-xl h-12 font-bold"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="email"
          label={
            <span className="font-black uppercase italic text-[10px] text-gray-400">
              Email (Không bắt buộc)
            </span>
          }
        >
          <Input
            placeholder="email@stadium.com"
            className="rounded-xl h-12 font-bold"
          />
        </Form.Item>
        <Form.Item
          name="notes"
          label={
            <span className="font-black uppercase italic text-[10px] text-gray-400">
              Ghi chú đơn hàng
            </span>
          }
        >
          <TextArea
            rows={3}
            placeholder="Ví dụ: Giao hàng tại quầy số 5..."
            className="rounded-xl font-bold"
          />
        </Form.Item>
        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            className="h-16 rounded-[24px] bg-gradient-to-r from-emerald-500 to-teal-600 border-none font-black italic uppercase shadow-xl text-lg hover:scale-[1.02] transition-transform"
          >
            Tiếp tục thanh toán
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <Card className="shadow-2xl border-none rounded-[32px] p-4">
        <Title
          level={4}
          className="!font-black !italic !uppercase !text-slate-800 mb-8"
        >
          <CreditCardOutlined className="text-blue-500 mr-2" /> Phương thức
          thanh toán
        </Title>
        <Radio.Group
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full"
        >
          <Space direction="vertical" className="w-full" size="middle">
            <Radio
              value="qr"
              className={`w-full p-6 border-2 rounded-[24px] transition-all ${
                paymentMethod === "qr"
                  ? "border-emerald-500 bg-emerald-50/30 shadow-md"
                  : "border-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <QrcodeOutlined className="text-3xl text-emerald-500" />
                <div>
                  <Text className="block font-black italic uppercase text-sm">
                    Quét mã QR
                  </Text>
                  <Text className="text-[10px] text-gray-400 font-bold uppercase italic">
                    Thanh toán nhanh - Xử lý ngay
                  </Text>
                </div>
              </div>
            </Radio>
            <Radio
              value="bank"
              className={`w-full p-6 border-2 rounded-[24px] transition-all ${
                paymentMethod === "bank"
                  ? "border-blue-500 bg-blue-50/30 shadow-md"
                  : "border-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <BankOutlined className="text-3xl text-blue-500" />
                <div>
                  <Text className="block font-black italic uppercase text-sm">
                    Chuyển khoản
                  </Text>
                  <Text className="text-[10px] text-gray-400 font-bold uppercase italic">
                    Thông tin tài khoản ngân hàng
                  </Text>
                </div>
              </div>
            </Radio>
            <Radio
              value="cash"
              className={`w-full p-6 border-2 rounded-[24px] transition-all ${
                paymentMethod === "cash"
                  ? "border-orange-500 bg-orange-50/30 shadow-md"
                  : "border-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <WalletOutlined className="text-3xl text-orange-500" />
                <div>
                  <Text className="block font-black italic uppercase text-sm">
                    Tại quầy
                  </Text>
                  <Text className="text-[10px] text-gray-400 font-bold uppercase italic">
                    Nhận món và gửi tiền tại quầy
                  </Text>
                </div>
              </div>
            </Radio>
          </Space>
        </Radio.Group>
      </Card>

      {paymentMethod === "qr" && (
        <Card className="text-center shadow-2xl border-none rounded-[32px] p-6 bg-white animate-in zoom-in-95 duration-500">
          <Title
            level={5}
            className="font-black italic uppercase text-emerald-600 mb-6"
          >
            Mã thanh toán QR
          </Title>
          <div className="relative inline-block p-4 border-4 border-emerald-500 rounded-[32px] shadow-2xl">
            <div className="w-56 h-56 bg-white flex items-center justify-center relative">
              <QrcodeOutlined className="text-8xl text-emerald-500 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                  <Text className="text-[8px] font-mono break-all px-2 uppercase">
                    {generateQRContent()}
                  </Text>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 bg-emerald-50 p-6 rounded-[28px] border border-emerald-100 max-w-sm mx-auto shadow-inner text-left">
            <div className="flex justify-between mb-2">
              <Text className="font-black italic uppercase text-[10px] text-emerald-600">
                STK:
              </Text>
              <Text className="font-black italic text-emerald-800">
                {mockQRData.accountNumber}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text className="font-black italic uppercase text-[10px] text-emerald-600">
                SỐ TIỀN:
              </Text>
              <Text className="text-xl font-black italic text-emerald-700">
                {total.toLocaleString("vi-VN")}đ
              </Text>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          size="large"
          onClick={() => setCurrentStep(0)}
          className="flex-1 h-16 rounded-[20px] font-black italic uppercase text-gray-400 border-none shadow-md"
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handlePaymentSubmit}
          loading={isProcessing}
          className="flex-[2] h-16 rounded-[20px] bg-emerald-600 border-none font-black italic uppercase shadow-xl text-lg hover:scale-105"
        >
          Xác nhận đặt hàng
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="animate-in fade-in zoom-in duration-700">
      <Result
        status="success"
        title={
          <span className="text-4xl font-black italic uppercase text-emerald-600">
            Đặt hàng thành công!
          </span>
        }
        subTitle={
          <div className="space-y-4 pt-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 inline-block">
              <Text className="text-gray-400 font-black italic uppercase text-xs">
                Mã định danh đơn hàng
              </Text>
              <br />
              <Text className="text-2xl font-black italic text-emerald-700 tracking-wider">
                {orderId}
              </Text>
            </div>
            <p className="font-bold italic text-gray-400">
              Cực phẩm của bạn đang được chuẩn bị rực rỡ!
            </p>
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="home"
            onClick={() => navigate("/")}
            className="h-14 px-10 rounded-2xl bg-emerald-600 border-none font-black italic uppercase shadow-lg shadow-emerald-100"
          >
            Về trang chủ
          </Button>,
          <Button
            key="products"
            onClick={() => navigate("/products")}
            className="h-14 px-10 rounded-2xl border-gray-100 font-bold uppercase italic text-gray-400"
          >
            Tiếp tục mua sắm
          </Button>,
        ]}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafb] py-16 animate-in fade-in duration-500">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <Title
            level={1}
            className="!mb-0 !font-black !italic !uppercase !text-slate-800 tracking-tighter"
          >
            🚀 Thanh toán <span className="text-emerald-500">Đơn hàng</span>
          </Title>
          <div className="flex gap-2">
            <div className="w-12 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-100"></div>
            <div className="w-6 h-2 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        <Steps
          current={currentStep}
          items={steps}
          className="mb-16 custom-checkout-steps"
        />

        <Row gutter={[48, 48]}>
          <Col xs={24} lg={15}>
            {currentStep === 0 && renderInfoStep()}
            {currentStep === 1 && renderPaymentStep()}
            {currentStep === 2 && renderCompleteStep()}
          </Col>

          {currentStep < 2 && (
            <Col xs={24} lg={9}>
              {renderOrderSummary()}
            </Col>
          )}
        </Row>
      </div>

      <style>{`
        .custom-checkout-steps .ant-steps-item-title { font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 12px !important; }
        .custom-checkout-steps .ant-steps-item-process .ant-steps-item-icon { background: #10b981 !important; border-color: #10b981 !important; }
        .custom-checkout-steps .ant-steps-item-finish .ant-steps-item-icon { border-color: #10b981 !important; color: #10b981 !important; }
      `}</style>
    </div>
  );
};

export default Checkout;
