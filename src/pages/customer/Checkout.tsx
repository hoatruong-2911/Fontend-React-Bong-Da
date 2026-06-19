import React, { useState, useEffect, useRef } from "react";
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
  Image as AntdImage,
  Tag,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  WalletOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import checkoutService, {
  StoreOrderData,
  CartItem,
} from "@/services/customer/checkoutService";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface OrderInfo {
  customerName: string;
  phone: string;
  email?: string;
  notes?: string;
}

const BANK_CONFIG = {
  BANK_ID: "vietcombank",
  ACCOUNT_NO: "1034993840",
  ACCOUNT_NAME: "TRUONG THANH HOA",
  TEMPLATE: "compact",
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm<OrderInfo>();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "cash">("qr");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [orderInfoState, setOrderInfoState] = useState<OrderInfo | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  const steps = [
    { title: "Thông tin", icon: <UserOutlined /> },
    { title: "Thanh toán", icon: <CreditCardOutlined /> },
    { title: "Hoàn tất", icon: <CheckCircleOutlined /> },
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const phoneNumber =
          user.phone ||
          user.customer_phone ||
          user.phone_number ||
          user.profile?.phone ||
          user.profile?.phone_number ||
          "";

        const initialInfo = {
          customerName: user.name || user.profile?.full_name || "",
          phone: phoneNumber,
          email: user.email || "",
        };

        form.setFieldsValue(initialInfo);
        setOrderInfoState((prev) => ({ ...prev, ...initialInfo }));
      } catch (e) {
        console.error("Lỗi parse thông tin user:", e);
      }
    }
  }, [form]);

  // ✅ CẬP NHẬT LOGIC NHẬN DỮ LIỆU CHỌN LỌC TỪ GIỎ HÀNG
  useEffect(() => {
    if (!orderId) {
      const newId = `ORD${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(newId);
    }

    const state = location.state as {
      buyNowItem?: CartItem;
      checkoutItems?: CartItem[];
    } | null;

    if (state?.buyNowItem) {
      // 1. Nếu mua ngay 1 sản phẩm
      setCartItems([state.buyNowItem]);
    } else if (state?.checkoutItems && state.checkoutItems.length > 0) {
      // 2. Nếu chọn một vài sản phẩm từ giỏ hàng gửi qua
      setCartItems(state.checkoutItems);
    } else {
      // 3. Trường hợp vào trực tiếp hoặc fallback (Lấy giỏ hàng theo ID người dùng nếu có)
      const userStr = localStorage.getItem("user");
      let cartKey = "cart"; // Mặc định cũ
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          cartKey = `cart_user_${user.id}`;
        } catch (e) {}
      }

      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart) as CartItem[]);
      }
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [location.state, orderId]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + subtotal * 0.02;

  const saveOrderToDatabase = async (
    info: OrderInfo,
    method: "qr" | "cash",
  ) => {
    try {
      const orderData: StoreOrderData = {
        order_code: orderId,
        customer_name: info.customerName,
        phone: info.phone,
        email: info.email,
        notes: info.notes,
        payment_method: method,
        total_amount: total,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          image: item.image,
        })),
      };

      await checkoutService.storeOrder(orderData);

      // ✅ LOGIC DỌN DẸP GIỎ HÀNG SAU KHI THANH TOÁN
      const state = location.state as {
        buyNowItem?: CartItem;
        checkoutItems?: CartItem[];
      } | null;

      // Nếu không phải là "Mua ngay" (tức là thanh toán từ giỏ hàng)
      if (!state?.buyNowItem) {
        const userStr = localStorage.getItem("user");
        let cartKey = userStr
          ? `cart_user_${JSON.parse(userStr).id}`
          : "cart_guest";

        if (state?.checkoutItems) {
          // CHỈ XÓA NHỮNG MÓN ĐÃ MUA khỏi giỏ hàng chính thức
          const currentFullCart: CartItem[] = JSON.parse(
            localStorage.getItem(cartKey) || "[]",
          );
          const remainingCart = currentFullCart.filter(
            (cartItem) =>
              !state.checkoutItems?.some(
                (boughtItem) => boughtItem.id === cartItem.id,
              ),
          );
          localStorage.setItem(cartKey, JSON.stringify(remainingCart));
        } else {
          // Fallback xóa hết nếu không có thông tin cụ thể
          localStorage.removeItem(cartKey);
        }
        window.dispatchEvent(new Event("storage"));
      }

      setCurrentStep(2);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(
        "Lưu đơn lỗi: " + (err.response?.data?.message || "Thử lại sau!"),
      );
    }
  };

  useEffect(() => {
    if (currentStep === 1 && paymentMethod === "qr" && orderInfoState) {
      pollingRef.current = setInterval(async () => {
        try {
          const response = await checkoutService.checkPaymentStatus(
            orderId,
            total,
          );
          if (response.data && response.data.status === "paid") {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            await saveOrderToDatabase(orderInfoState, "qr");
            message.success("Hệ thống nhận tiền thành công!");
          }
        } catch (error: unknown) {
          console.warn("Đang đợi tiền về túi rực rỡ... ⚽");
        }
      }, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentStep, paymentMethod, orderId, orderInfoState, total]);

  const handleInfoSubmit = (values: OrderInfo) => {
    setOrderInfoState(values);
    setCurrentStep(1);
    message.success("Mời bro quét mã thanh toán!");
  };

  const handleManualConfirmCash = async () => {
    if (!orderInfoState) return;
    setIsProcessing(true);
    await saveOrderToDatabase(orderInfoState, "cash");
    setIsProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Đã sao chép nội dung!");
  };

  const qrImageUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${
    BANK_CONFIG.ACCOUNT_NO
  }-${
    BANK_CONFIG.TEMPLATE
  }.png?amount=${total}&addInfo=${orderId}%20THANH%20TOAN&accountName=${encodeURIComponent(
    BANK_CONFIG.ACCOUNT_NAME,
  )}`;

  const renderOrderSummary = () => (
    <Card className="sticky top-4 shadow-xl border-none rounded-[32px] overflow-hidden bg-white p-6">
      <Title
        level={4}
        className="!font-black !italic !uppercase mb-6 flex items-center gap-2"
      >
        <ShoppingCartOutlined className="text-emerald-500" /> Đơn hàng của bro
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
                    className="w-14 h-14 object-cover rounded-2xl border border-gray-100"
                  />
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    x{item.quantity}
                  </span>
                </div>
                <div>
                  <Text
                    strong
                    className="block text-sm uppercase italic truncate w-32"
                  >
                    {item.name}
                  </Text>
                  <Text className="text-[10px] text-gray-400 uppercase italic">
                    {item.price.toLocaleString()}đ
                  </Text>
                </div>
              </div>
              <Text className="font-black italic text-emerald-600">
                {(item.price * item.quantity).toLocaleString()}đ
              </Text>
            </div>
          );
        })}
      </div>
      <div className="bg-gray-50 p-6 rounded-[24px] space-y-3 shadow-inner">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
          <span>Tạm tính:</span>
          <span>{subtotal.toLocaleString()}đ</span>
        </div>
        <Divider className="my-2" />
        <div className="flex justify-between items-center">
          <Text className="font-black uppercase italic text-emerald-800">
            Tổng cộng:
          </Text>
          <Text className="text-3xl font-black italic text-emerald-600">
            {total.toLocaleString()}đ
          </Text>
        </div>
      </div>
    </Card>
  );

  const renderQRSection = () => (
    <Card className="text-center shadow-2xl border-none rounded-[32px] p-6 bg-white animate-in zoom-in-95 duration-500 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        <Tag color="green" className="font-bold italic animate-pulse">
          SỐNG
        </Tag>
      </div>
      <Title
        level={5}
        className="font-black italic uppercase text-emerald-600 mb-6"
      >
        Quét mã VietQR để thanh toán
      </Title>
      <div className="bg-[#f0fdf4] p-4 rounded-[32px] inline-block mb-6 shadow-inner border border-emerald-100">
        <AntdImage
          src={qrImageUrl}
          width={280}
          className="rounded-2xl shadow-2xl"
          placeholder={
            <LoadingOutlined className="text-6xl text-emerald-300" />
          }
        />
      </div>
      <div className="mt-2 mb-6">
        <Text className="font-black italic text-emerald-600 uppercase text-xs animate-bounce block">
          <LoadingOutlined className="mr-2" /> Đang chờ tiền về túi...
        </Text>
      </div>
      <div className="space-y-4 max-w-sm mx-auto text-left">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
          <div className="flex-1">
            <Text className="text-[10px] text-gray-400 block font-black uppercase">
              Nội dung chuyển khoản
            </Text>
            <Text className="font-black italic text-emerald-700 text-lg">
              {orderId} THANH TOAN
            </Text>
          </div>
          <Button
            icon={<CopyOutlined />}
            type="text"
            className="text-emerald-500"
            onClick={() => copyToClipboard(`${orderId} THANH TOAN`)}
          />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#f8fafb] py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <Title
            level={1}
            className="!mb-0 !font-black !italic !uppercase !text-slate-800 tracking-tighter"
          >
            🚀 Thanh toán <span className="text-emerald-500">Cực phẩm</span>
          </Title>
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            onClick={() => navigate(-1)}
            className="font-bold uppercase italic text-gray-400"
          >
            Quay lại
          </Button>
        </div>
        <Steps
          current={currentStep}
          items={steps}
          className="mb-16 custom-checkout-steps"
        />
        <Row gutter={[48, 48]}>
          <Col xs={24} lg={15}>
            {currentStep === 0 && (
              <Card className="shadow-2xl border-none rounded-[32px] p-8">
                <Title
                  level={4}
                  className="!font-black !italic !uppercase !text-slate-800 mb-8"
                >
                  <UserOutlined className="text-blue-500 mr-2" /> Thông tin
                  khách hàng
                </Title>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleInfoSubmit}
                  scrollToFirstError
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="customerName"
                        label={
                          <span className="font-black uppercase italic text-[10px] text-gray-400">
                            Họ tên *
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Bro quên nhập tên rồi kìa!",
                          },
                          { min: 2, message: "Tên gì mà ngắn vậy bro?" },
                        ]}
                      >
                        <Input
                          placeholder="Tên của bạn"
                          className="rounded-xl h-12 font-bold"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label={
                          <span className="font-black uppercase italic text-[10px] text-gray-400">
                            SĐT *
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Cho xin cái số điện thoại đi bro!",
                          },
                          {
                            pattern: /^(0)[0-9]{9}$/,
                            message:
                              "SĐT phải đúng 10 số và bắt đầu bằng số 0 nhé!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="09xxxxxxx"
                          className="rounded-xl h-12 font-bold"
                          onChange={(e) => {
                            form.setFieldsValue({
                              phone: e.target.value.replace(/[^0-9]/g, ""),
                            });
                          }}
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
                    rules={[
                      {
                        type: "email",
                        message: "Định dạng email có vẻ sai sai rồi bro!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Email để nhận thông báo (nếu có)"
                      className="rounded-xl h-12 font-bold"
                    />
                  </Form.Item>
                  <Form.Item
                    name="notes"
                    label={
                      <span className="font-black uppercase italic text-[10px] text-gray-400">
                        Ghi chú
                      </span>
                    }
                  >
                    <TextArea
                      rows={3}
                      placeholder="Ghi chú thêm (ví dụ: giao giờ hành chính...)"
                      className="rounded-xl font-bold"
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    className="h-16 rounded-[24px] bg-emerald-600 font-black italic uppercase shadow-lg hover:scale-[1.02] transition-transform"
                  >
                    Tiếp tục thanh toán
                  </Button>
                </Form>
              </Card>
            )}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Card className="shadow-2xl border-none rounded-[32px] p-8">
                  <Title
                    level={4}
                    className="!font-black !italic !uppercase !text-slate-800 mb-8"
                  >
                    <CreditCardOutlined className="text-blue-500 mr-2" /> Phương
                    thức thanh toán
                  </Title>
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full"
                  >
                    <Space
                      direction="vertical"
                      className="w-full"
                      size="middle"
                    >
                      <Radio
                        value="qr"
                        className={`w-full p-6 border-2 rounded-[24px] ${
                          paymentMethod === "qr"
                            ? "border-emerald-500 bg-emerald-50/20"
                            : "border-gray-50"
                        }`}
                      >
                        <Space>
                          <QrcodeOutlined className="text-2xl text-emerald-500" />{" "}
                          <Text className="font-black italic uppercase">
                            VietQR (Tự động chốt đơn)
                          </Text>
                        </Space>
                      </Radio>
                      <Radio
                        value="cash"
                        className={`w-full p-6 border-2 rounded-[24px] ${
                          paymentMethod === "cash"
                            ? "border-orange-500 bg-orange-50/20"
                            : "border-gray-50"
                        }`}
                      >
                        <Space>
                          <WalletOutlined className="text-2xl text-orange-500" />{" "}
                          <Text className="font-black italic uppercase">
                            Tiền mặt tại quầy
                          </Text>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Card>
                {paymentMethod === "qr" ? (
                  renderQRSection()
                ) : (
                  <Card className="text-center shadow-xl border-none rounded-[32px] p-10 bg-white">
                    <WalletOutlined className="text-6xl text-orange-400 mb-4" />
                    <Title level={4} className="font-black italic uppercase">
                      Thanh toán tại quầy
                    </Title>
                  </Card>
                )}
                <div className="flex gap-4">
                  <Button
                    size="large"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1 h-16 rounded-2xl font-black italic uppercase"
                  >
                    Quay lại
                  </Button>
                  {paymentMethod === "cash" && (
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleManualConfirmCash}
                      loading={isProcessing}
                      className="flex-[2] h-16 rounded-2xl bg-emerald-600 font-black italic uppercase"
                    >
                      Xác nhận đơn hàng
                    </Button>
                  )}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <Result
                status="success"
                title={
                  <span className="text-4xl font-black italic uppercase text-emerald-600">
                    Đặt hàng thành công!
                  </span>
                }
                subTitle={
                  <Text className="font-bold italic text-gray-400">
                    Đơn hàng {orderId} đang được chuẩn bị!
                  </Text>
                }
                extra={[
                  <Button
                    type="primary"
                    key="home"
                    onClick={() => navigate("/")}
                    className="h-14 px-10 rounded-2xl bg-emerald-600 font-black italic uppercase"
                  >
                    Về trang chủ
                  </Button>,
                ]}
              />
            )}
          </Col>
          {currentStep < 2 && (
            <Col xs={24} lg={9}>
              {renderOrderSummary()}
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default Checkout;
