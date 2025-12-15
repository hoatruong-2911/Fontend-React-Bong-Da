import { useState } from 'react';
import { Card, Row, Col, Typography, DatePicker, Select, Table, Tag } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Mock data for charts
const dailyRevenueData = [
  { date: '01/01', orders: 45, bookings: 12, revenue: 15500000 },
  { date: '02/01', orders: 52, bookings: 15, revenue: 18200000 },
  { date: '03/01', orders: 38, bookings: 10, revenue: 12800000 },
  { date: '04/01', orders: 65, bookings: 18, revenue: 22500000 },
  { date: '05/01', orders: 48, bookings: 14, revenue: 16900000 },
  { date: '06/01', orders: 72, bookings: 22, revenue: 28500000 },
  { date: '07/01', orders: 85, bookings: 25, revenue: 32100000 },
];

const categoryRevenueData = [
  { name: 'Đồ ăn', value: 45000000, color: '#10b981' },
  { name: 'Đồ uống', value: 32000000, color: '#3b82f6' },
  { name: 'Áo quần', value: 28000000, color: '#f59e0b' },
  { name: 'Giày dép', value: 18000000, color: '#ef4444' },
  { name: 'Phụ kiện', value: 12000000, color: '#8b5cf6' },
];

const topProductsData = [
  { id: 1, name: 'Coca Cola', quantity: 520, revenue: 7800000 },
  { id: 2, name: 'Áo đấu MU', quantity: 45, revenue: 20250000 },
  { id: 3, name: 'Bánh mì thịt', quantity: 380, revenue: 9500000 },
  { id: 4, name: 'Giày Nike', quantity: 28, revenue: 33600000 },
  { id: 5, name: 'Nước suối', quantity: 650, revenue: 6500000 },
];

const topCustomersData = [
  { id: 1, name: 'Nguyễn Văn A', orders: 25, totalSpent: 8500000 },
  { id: 2, name: 'Trần Thị B', orders: 18, totalSpent: 6200000 },
  { id: 3, name: 'Lê Văn C', orders: 15, totalSpent: 5800000 },
  { id: 4, name: 'Phạm Thị D', orders: 12, totalSpent: 4500000 },
  { id: 5, name: 'Hoàng Văn E', orders: 10, totalSpent: 3800000 },
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${(value / 1000).toFixed(0)}K`;
};

export default function AdminRevenue() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [period, setPeriod] = useState('week');

  const totalRevenue = dailyRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = dailyRevenueData.reduce((sum, d) => sum + d.orders, 0);
  const totalBookings = dailyRevenueData.reduce((sum, d) => sum + d.bookings, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const statsCards = [
    {
      title: 'Tổng doanh thu',
      value: totalRevenue,
      icon: <DollarOutlined />,
      color: '#10b981',
      format: 'currency',
    },
    {
      title: 'Tổng đơn hàng',
      value: totalOrders,
      icon: <ShoppingCartOutlined />,
      color: '#3b82f6',
      format: 'number',
    },
    {
      title: 'Tổng lượt đặt sân',
      value: totalBookings,
      icon: <CalendarOutlined />,
      color: '#f59e0b',
      format: 'number',
    },
    {
      title: 'Giá trị TB/đơn',
      value: avgOrderValue,
      icon: <TrophyOutlined />,
      color: '#8b5cf6',
      format: 'currency',
    },
  ];

  const productColumns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 50 },
    { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (val: number) => <Text strong className="text-green-600">{val.toLocaleString()}đ</Text>,
    },
  ];

  const customerColumns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 50 },
    { title: 'Khách hàng', dataIndex: 'name', key: 'name' },
    { title: 'Số đơn', dataIndex: 'orders', key: 'orders' },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (val: number) => <Text strong className="text-green-600">{val.toLocaleString()}đ</Text>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <Title level={4}>Báo cáo doanh thu</Title>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
            options={[
              { value: 'today', label: 'Hôm nay' },
              { value: 'week', label: 'Tuần này' },
              { value: 'month', label: 'Tháng này' },
              { value: 'year', label: 'Năm này' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            format="DD/MM/YYYY"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary">{stat.title}</Text>
                  <div className="text-xl font-bold">
                    {stat.format === 'currency' 
                      ? `${stat.value.toLocaleString()}đ`
                      : stat.value.toLocaleString()
                    }
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ doanh thu theo ngày">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()}đ`, 'Doanh thu']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="#10b98133"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Doanh thu theo danh mục">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryRevenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()}đ`]} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Orders & Bookings Chart */}
      <Card title="Đơn hàng & Đặt sân theo ngày">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dailyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#3b82f6" name="Đơn hàng" />
            <Bar dataKey="bookings" fill="#10b981" name="Đặt sân" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Products & Customers */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <TrophyOutlined className="text-yellow-500 mr-2" />
                Top sản phẩm bán chạy
              </span>
            }
          >
            <Table
              columns={productColumns}
              dataSource={topProductsData}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <TrophyOutlined className="text-yellow-500 mr-2" />
                Top khách hàng
              </span>
            }
          >
            <Table
              columns={customerColumns}
              dataSource={topCustomersData}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
