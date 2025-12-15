import { Button, Card, Row, Col, Statistic } from 'antd';
import {
  ShoppingOutlined,
  TeamOutlined,
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  TrophyOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🍔',
      title: 'Đồ Ăn & Thức Uống',
      description: 'Bánh mì, xúc xích, snack, nước ngọt & nước tăng lực',
      color: 'border-orange-500',
    },
    {
      icon: '👕',
      title: 'Trang Phục',
      description: 'Áo, quần, tất bóng đá chính hãng',
      color: 'border-blue-500',
    },
    {
      icon: '👟',
      title: 'Phụ Kiện',
      description: 'Giày, găng tay, bóng đá & dụng cụ tập',
      color: 'border-green-500',
    },
    {
      icon: '⚙️',
      title: 'Quản Lý Nhân Viên',
      description: 'Chấm công, xếp ca, theo dõi hiệu suất',
      color: 'border-purple-500',
    },
  ];

  const stats = [
    {
      icon: <ThunderboltOutlined />,
      title: 'Nhanh Chóng',
      value: '99.9%',
      suffix: 'Uptime',
      color: '#faad14',
    },
    {
      icon: <SafetyOutlined />,
      title: 'Bảo Mật',
      value: '100%',
      suffix: 'Secure',
      color: '#52c41a',
    },
    {
      icon: <CustomerServiceOutlined />,
      title: 'Hỗ Trợ',
      value: '24/7',
      suffix: 'Support',
      color: '#1890ff',
    },
    {
      icon: <TrophyOutlined />,
      title: 'Chất Lượng',
      value: '5.0',
      suffix: '⭐',
      color: '#eb2f96',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto text-center space-y-8 max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 animate-bounce">
            <RocketOutlined className="text-primary" />
            <span className="text-primary font-semibold">Hệ Thống Quản Lý Chuyên Nghiệp</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Stadium Pro
          </h1>

          <p className="text-2xl md:text-3xl font-bold text-foreground animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
            Quản Lý Sân Bóng Thông Minh
          </p>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Hệ thống POS toàn diện cho sân bóng đá - Tối ưu hóa vận hành, tăng doanh thu và nâng cao trải nghiệm khách hàng
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-6 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-300">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/products')}
              className="h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Xem Sản Phẩm
            </Button>
            <Button
              size="large"
              icon={<TeamOutlined />}
              onClick={() => navigate('/staff')}
              className="h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Dashboard Nhân Viên
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="container mx-auto">
          <Row gutter={[32, 32]} className="max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  className="text-center hover:shadow-xl transition-all hover:scale-105 border-2"
                  bodyStyle={{ padding: '24px 16px' }}
                >
                  <div className="text-4xl mb-4" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <Statistic
                    title={<span className="text-base font-semibold">{stat.title}</span>}
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color, fontSize: '2rem', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tất cả những gì bạn cần để quản lý sân bóng đá chuyên nghiệp
            </p>
          </div>

          <Row gutter={[24, 24]} className="max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  className={`h-full hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 ${feature.color} hover:border-primary group`}
                  bodyStyle={{ padding: '32px 24px' }}
                >
                  <div className="text-center space-y-4">
                    <div className="text-5xl group-hover:scale-125 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto text-center space-y-8 max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Sẵn Sàng Bắt Đầu?
          </h2>
          <p className="text-xl text-muted-foreground">
            Trải nghiệm hệ thống quản lý sân bóng hiện đại nhất hiện nay
          </p>
          <div className="flex flex-wrap gap-6 justify-center pt-4">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/products')}
              className="h-16 px-12 text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-110 transition-all"
            >
              Khám Phá Ngay
            </Button>
            <Button
              size="large"
              icon={<DollarOutlined />}
              className="h-16 px-12 text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-110 transition-all"
            >
              Xem Báo Giá
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
