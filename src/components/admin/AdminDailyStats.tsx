import { Card, Row, Col, Statistic } from 'antd';
import {
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
} from '@ant-design/icons';

// Mock daily stats data
const dailyStats = {
  todayRevenue: 15500000,
  revenueGrowth: 12.5,
  todayBookings: 28,
  bookingGrowth: 8,
  todayCustomers: 45,
  newCustomers: 3,
  todayProducts: 156,
  productGrowth: 25,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function AdminDailyStats() {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} lg={6}>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <Statistic
            title={<span className="text-muted-foreground">Doanh thu hôm nay</span>}
            value={dailyStats.todayRevenue}
            formatter={(value) => formatCurrency(Number(value))}
            prefix={<DollarOutlined className="text-primary" />}
            valueStyle={{ color: 'hsl(142, 76%, 36%)' }}
          />
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <RiseOutlined /> +{dailyStats.revenueGrowth}% so với hôm qua
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <Statistic
            title={<span className="text-muted-foreground">Đặt sân hôm nay</span>}
            value={dailyStats.todayBookings}
            prefix={<CalendarOutlined className="text-blue-500" />}
            valueStyle={{ color: '#3b82f6' }}
          />
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <RiseOutlined /> +{dailyStats.bookingGrowth}% so với hôm qua
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <Statistic
            title={<span className="text-muted-foreground">Khách hàng</span>}
            value={dailyStats.todayCustomers}
            prefix={<TeamOutlined className="text-amber-500" />}
            valueStyle={{ color: '#f59e0b' }}
          />
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <RiseOutlined /> +{dailyStats.newCustomers} khách mới
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <Statistic
            title={<span className="text-muted-foreground">Sản phẩm bán</span>}
            value={dailyStats.todayProducts}
            prefix={<ShoppingCartOutlined className="text-purple-500" />}
            valueStyle={{ color: '#a855f7' }}
          />
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <RiseOutlined /> +{dailyStats.productGrowth} sản phẩm
          </div>
        </Card>
      </Col>
    </Row>
  );
}
