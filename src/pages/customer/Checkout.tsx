import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Steps, Form, Input, Radio, Button, Divider, Typography, Space, message, Result } from 'antd';
import { ShoppingCartOutlined, UserOutlined, CreditCardOutlined, CheckCircleOutlined, QrcodeOutlined, BankOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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

// Mock QR data
const mockQRData = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890123',
  accountName: 'CONG TY TNHH SAN VAN DONG ABC',
  bankCode: 'VCB',
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('qr');
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    customerName: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0;
  const serviceFee = subtotal * 0.02; // 2% service fee
  const total = subtotal - discount + serviceFee;

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  const generateQRContent = () => {
    // Format: Bank transfer QR content (simplified VietQR format)
    return `${mockQRData.bankCode}|${mockQRData.accountNumber}|${mockQRData.accountName}|${total}|${orderId || 'ORDER'}`;
  };

  const handleInfoSubmit = (values: OrderInfo) => {
    setOrderInfo(values);
    setCurrentStep(1);
  };

  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(2);
      setOrderComplete(true);
      localStorage.removeItem('cart');
      message.success('Đặt hàng thành công!');
    }, 2000);
  };

  const steps = [
    { title: 'Thông tin', icon: <UserOutlined /> },
    { title: 'Thanh toán', icon: <CreditCardOutlined /> },
    { title: 'Hoàn tất', icon: <CheckCircleOutlined /> },
  ];

  const renderOrderSummary = () => (
    <Card className="sticky top-4">
      <Title level={5} className="flex items-center gap-2 mb-4">
        <ShoppingCartOutlined /> Đơn hàng ({cartItems.length} sản phẩm)
      </Title>
      
      <div className="max-h-60 overflow-y-auto mb-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
              <div>
                <Text className="block text-sm font-medium">{item.name}</Text>
                <Text type="secondary" className="text-xs">x{item.quantity}</Text>
              </div>
            </div>
            <Text className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
          </div>
        ))}
      </div>
      
      <Divider className="my-3" />
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Text type="secondary">Tạm tính:</Text>
          <Text>{subtotal.toLocaleString('vi-VN')}đ</Text>
        </div>
        <div className="flex justify-between">
          <Text type="secondary">Giảm giá:</Text>
          <Text className="text-green-600">-{discount.toLocaleString('vi-VN')}đ</Text>
        </div>
        <div className="flex justify-between">
          <Text type="secondary">Phí dịch vụ (2%):</Text>
          <Text>{serviceFee.toLocaleString('vi-VN')}đ</Text>
        </div>
        <Divider className="my-2" />
        <div className="flex justify-between">
          <Text strong className="text-lg">Tổng cộng:</Text>
          <Text strong className="text-lg text-primary">{total.toLocaleString('vi-VN')}đ</Text>
        </div>
      </div>
    </Card>
  );

  const renderInfoStep = () => (
    <Card title="Thông tin khách hàng">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleInfoSubmit}
        initialValues={orderInfo}
      >
        <Form.Item
          name="customerName"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input placeholder="Nhập họ và tên" size="large" />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
          ]}
        >
          <Input placeholder="Nhập số điện thoại" size="large" />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: 'email', message: 'Email không hợp lệ' }
          ]}
        >
          <Input placeholder="Nhập email (không bắt buộc)" size="large" />
        </Form.Item>
        
        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={3} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block className="bg-primary">
            Tiếp tục thanh toán
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4">
      <Card title="Chọn phương thức thanh toán">
        <Radio.Group
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full"
        >
          <Space direction="vertical" className="w-full">
            <Radio value="qr" className="w-full p-3 border rounded-lg hover:border-primary">
              <div className="flex items-center gap-3">
                <QrcodeOutlined className="text-2xl text-primary" />
                <div>
                  <Text strong>Quét mã QR</Text>
                  <br />
                  <Text type="secondary" className="text-xs">Thanh toán nhanh qua ứng dụng ngân hàng</Text>
                </div>
              </div>
            </Radio>
            
            <Radio value="bank" className="w-full p-3 border rounded-lg hover:border-primary">
              <div className="flex items-center gap-3">
                <BankOutlined className="text-2xl text-blue-500" />
                <div>
                  <Text strong>Chuyển khoản ngân hàng</Text>
                  <br />
                  <Text type="secondary" className="text-xs">Chuyển khoản thủ công</Text>
                </div>
              </div>
            </Radio>
            
            <Radio value="cash" className="w-full p-3 border rounded-lg hover:border-primary">
              <div className="flex items-center gap-3">
                <WalletOutlined className="text-2xl text-green-500" />
                <div>
                  <Text strong>Thanh toán tại quầy</Text>
                  <br />
                  <Text type="secondary" className="text-xs">Thanh toán khi nhận hàng</Text>
                </div>
              </div>
            </Radio>
          </Space>
        </Radio.Group>
      </Card>

      {paymentMethod === 'qr' && (
        <Card title="Quét mã QR để thanh toán" className="text-center">
          <div className="flex flex-col items-center">
            {/* QR Code placeholder - in real app, use a QR library */}
            <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4 relative">
              <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <div className="text-center">
                  <QrcodeOutlined className="text-6xl text-primary mb-2" />
                  <div className="text-xs text-gray-500">
                    <div className="font-mono bg-gray-100 p-2 rounded text-xs break-all">
                      {generateQRContent()}
                    </div>
                  </div>
                </div>
              </div>
              {/* Corner markers */}
              <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-primary"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-primary"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-primary"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-primary"></div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg w-full max-w-sm">
              <Text strong className="text-green-700 block mb-2">Thông tin chuyển khoản:</Text>
              <div className="text-left space-y-1">
                <div className="flex justify-between">
                  <Text type="secondary">Ngân hàng:</Text>
                  <Text strong>{mockQRData.bankName}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Số tài khoản:</Text>
                  <Text strong className="font-mono">{mockQRData.accountNumber}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Chủ tài khoản:</Text>
                  <Text strong className="text-xs">{mockQRData.accountName}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Số tiền:</Text>
                  <Text strong className="text-primary">{total.toLocaleString('vi-VN')}đ</Text>
                </div>
              </div>
            </div>
            
            <Paragraph type="secondary" className="mt-4 text-sm">
              Mở ứng dụng ngân hàng và quét mã QR để thanh toán
            </Paragraph>
          </div>
        </Card>
      )}

      {paymentMethod === 'bank' && (
        <Card title="Thông tin chuyển khoản">
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <Text type="secondary">Ngân hàng:</Text>
              <Text strong copyable>{mockQRData.bankName}</Text>
            </div>
            <div className="flex justify-between items-center">
              <Text type="secondary">Số tài khoản:</Text>
              <Text strong copyable className="font-mono">{mockQRData.accountNumber}</Text>
            </div>
            <div className="flex justify-between items-center">
              <Text type="secondary">Chủ tài khoản:</Text>
              <Text strong copyable>{mockQRData.accountName}</Text>
            </div>
            <div className="flex justify-between items-center">
              <Text type="secondary">Số tiền:</Text>
              <Text strong className="text-primary text-lg">{total.toLocaleString('vi-VN')}đ</Text>
            </div>
            <Divider />
            <Paragraph type="warning" className="text-sm">
              Vui lòng ghi nội dung chuyển khoản: <Text strong copyable>THANHTOAN {orderId || 'ORDER'}</Text>
            </Paragraph>
          </div>
        </Card>
      )}

      {paymentMethod === 'cash' && (
        <Card title="Thanh toán tại quầy">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <WalletOutlined className="text-5xl text-green-500 mb-3" />
            <Title level={5}>Thanh toán khi nhận hàng</Title>
            <Paragraph type="secondary">
              Bạn sẽ thanh toán <Text strong className="text-primary">{total.toLocaleString('vi-VN')}đ</Text> khi nhận hàng tại quầy
            </Paragraph>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button size="large" onClick={() => setCurrentStep(0)} className="flex-1">
          Quay lại
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handlePaymentSubmit}
          loading={isProcessing}
          className="flex-1 bg-primary"
        >
          {isProcessing ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <Result
      status="success"
      title="Đặt hàng thành công!"
      subTitle={
        <div className="space-y-2">
          <Text>Mã đơn hàng: <Text strong copyable className="font-mono">{orderId}</Text></Text>
          <br />
          <Text type="secondary">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận sớm nhất!</Text>
        </div>
      }
      extra={[
        <Button type="primary" key="home" onClick={() => navigate('/')} className="bg-primary">
          Về trang chủ
        </Button>,
        <Button key="products" onClick={() => navigate('/products')}>
          Tiếp tục mua sắm
        </Button>,
      ]}
    >
      <Card className="mt-4">
        <Title level={5}>Thông tin đơn hàng</Title>
        <div className="space-y-2 mt-3">
          <div className="flex justify-between">
            <Text type="secondary">Khách hàng:</Text>
            <Text>{orderInfo.customerName}</Text>
          </div>
          <div className="flex justify-between">
            <Text type="secondary">Số điện thoại:</Text>
            <Text>{orderInfo.phone}</Text>
          </div>
          <div className="flex justify-between">
            <Text type="secondary">Phương thức:</Text>
            <Text>
              {paymentMethod === 'qr' && 'Quét mã QR'}
              {paymentMethod === 'bank' && 'Chuyển khoản ngân hàng'}
              {paymentMethod === 'cash' && 'Thanh toán tại quầy'}
            </Text>
          </div>
          <Divider />
          <div className="flex justify-between">
            <Text strong>Tổng thanh toán:</Text>
            <Text strong className="text-primary text-lg">{total.toLocaleString('vi-VN')}đ</Text>
          </div>
        </div>
      </Card>
    </Result>
  );

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Result
          status="warning"
          title="Giỏ hàng trống"
          subTitle="Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán"
          extra={
            <Button type="primary" onClick={() => navigate('/products')} className="bg-primary">
              Đi mua sắm
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={3} className="mb-6">Thanh toán</Title>
      
      <Steps current={currentStep} items={steps} className="mb-8" />
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {currentStep === 0 && renderInfoStep()}
          {currentStep === 1 && renderPaymentStep()}
          {currentStep === 2 && renderCompleteStep()}
        </Col>
        
        {currentStep < 2 && (
          <Col xs={24} lg={8}>
            {renderOrderSummary()}
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Checkout;
