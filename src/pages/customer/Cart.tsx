import { useState, useEffect } from 'react';
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
  message
} from 'antd';
import {
  DeleteOutlined,
  ShoppingOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const handleQuantityChange = (id: string, quantity: number | null) => {
    if (quantity && quantity > 0) {
      const updatedCart = cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const handleRemoveItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    message.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    message.success('Đã xóa toàn bộ giỏ hàng');
  };

  const subtotal: number = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount: number = 0;
  const shipping: number = 0;
  const total: number = subtotal - discount + shipping;

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 350,
      render: (_: unknown, record: CartItem) => (
        <div className="flex items-center gap-4">
          <Image
            src={record.image}
            alt={record.name}
            width={80}
            height={80}
            className="rounded-lg object-cover"
            preview={false}
          />
          <div>
            <div className="font-medium text-foreground">{record.name}</div>
            <div className="text-sm text-muted-foreground">{record.category}</div>
            {record.size && (
              <div className="text-sm text-muted-foreground">Size: {record.size}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price: number) => (
        <Text strong className="text-primary">
          {price.toLocaleString('vi-VN')}đ
        </Text>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 150,
      render: (_: unknown, record: CartItem) => (
        <InputNumber
          min={1}
          max={99}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
          size="large"
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 150,
      render: (_: unknown, record: CartItem) => (
        <Text strong className="text-lg text-primary">
          {(record.price * record.quantity).toLocaleString('vi-VN')}đ
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/products')}
            >
              Tiếp tục mua sắm
            </Button>
            <Title level={2} className="!mb-0">
              🛒 Giỏ Hàng ({cartItems.length} sản phẩm)
            </Title>
          </div>
          {cartItems.length > 0 && (
            <Button danger onClick={handleClearCart}>
              Xóa tất cả
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-16">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-4">
                  <Text className="text-lg text-muted-foreground">
                    Giỏ hàng của bạn đang trống
                  </Text>
                  <div>
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<ShoppingOutlined />}
                      onClick={() => navigate('/products')}
                    >
                      Mua sắm ngay
                    </Button>
                  </div>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Cart Items */}
            <Col xs={24} lg={16}>
              <Card className="shadow-md border-0">
                <Table
                  dataSource={cartItems}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={8}>
              <Card className="shadow-md border-0 sticky top-24">
                <Title level={4}>Tóm tắt đơn hàng</Title>
                <Divider />
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Text className="text-muted-foreground">Tạm tính:</Text>
                    <Text>{subtotal.toLocaleString('vi-VN')}đ</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-muted-foreground">Giảm giá:</Text>
                    <Text className="text-green-600">-{discount.toLocaleString('vi-VN')}đ</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-muted-foreground">Phí vận chuyển:</Text>
                    <Text>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}đ`}</Text>
                  </div>
                  
                  <Divider />
                  
                  <div className="flex justify-between items-center">
                    <Text strong className="text-lg">Tổng cộng:</Text>
                    <Text strong className="text-2xl text-primary">
                      {total.toLocaleString('vi-VN')}đ
                    </Text>
                  </div>
                </div>

                <Divider />

                <Space direction="vertical" className="w-full" size="middle">
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<CreditCardOutlined />}
                    className="h-14 text-lg font-semibold"
                    onClick={() => navigate('/checkout')}
                  >
                    Thanh toán
                  </Button>
                  <Button
                    size="large"
                    block
                    onClick={() => navigate('/products')}
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Space>

                <Divider />

                <div className="text-center text-sm text-muted-foreground">
                  <div className="mb-2">🔒 Thanh toán an toàn & bảo mật</div>
                  <div>📞 Hỗ trợ: 0123 456 789</div>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}
