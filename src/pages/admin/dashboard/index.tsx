import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Button 
} from 'antd';
import {
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { mockBookings } from '@/data/mockBookings';

// Mock revenue data for charts
const revenueData = [
  { name: 'T1', revenue: 45000000, bookings: 120 },
  { name: 'T2', revenue: 52000000, bookings: 135 },
  { name: 'T3', revenue: 48000000, bookings: 128 },
  { name: 'T4', revenue: 61000000, bookings: 156 },
  { name: 'T5', revenue: 55000000, bookings: 142 },
  { name: 'T6', revenue: 67000000, bookings: 175 },
  { name: 'T7', revenue: 72000000, bookings: 190 },
  { name: 'T8', revenue: 78000000, bookings: 210 },
  { name: 'T9', revenue: 69000000, bookings: 185 },
  { name: 'T10', revenue: 75000000, bookings: 198 },
  { name: 'T11', revenue: 82000000, bookings: 220 },
  { name: 'T12', revenue: 95000000, bookings: 250 },
];

const fieldUsageData = [
  { name: 'Sân 5v5', value: 45, color: '#22c55e' },
  { name: 'Sân 7v7', value: 35, color: '#3b82f6' },
  { name: 'Sân 11v11', value: 20, color: '#f59e0b' },
];

const weeklyData = [
  { day: 'T2', morning: 15, afternoon: 25, evening: 35 },
  { day: 'T3', morning: 18, afternoon: 28, evening: 38 },
  { day: 'T4', morning: 20, afternoon: 30, evening: 40 },
  { day: 'T5', morning: 22, afternoon: 35, evening: 45 },
  { day: 'T6', morning: 25, afternoon: 40, evening: 50 },
  { day: 'T7', morning: 30, afternoon: 45, evening: 55 },
  { day: 'CN', morning: 35, afternoon: 50, evening: 60 },
];

// Daily stats
const dailyStats = {
  revenue: 15500000,
  revenueGrowth: 12.5,
  bookings: 28,
  bookingsGrowth: 8.2,
  customers: 45,
  newCustomers: 12,
  products: 156,
  productsGrowth: 15.3,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'gold', text: 'Chờ xác nhận' },
    confirmed: { color: 'blue', text: 'Đã xác nhận' },
    playing: { color: 'green', text: 'Đang chơi' },
    completed: { color: 'default', text: 'Hoàn thành' },
    cancelled: { color: 'red', text: 'Đã hủy' },
  };
  const { color, text } = statusMap[status] || { color: 'default', text: status };
  return <Tag color={color}>{text}</Tag>;
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Daily Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-muted-foreground">Doanh thu hôm nay</span>}
              value={dailyStats.revenue}
              precision={0}
              valueStyle={{ color: 'hsl(var(--primary))' }}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <div className="mt-2 flex items-center text-sm text-green-600">
              <RiseOutlined className="mr-1" />
              +{dailyStats.revenueGrowth}% so với hôm qua
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-muted-foreground">Lượt đặt sân</span>}
              value={dailyStats.bookings}
              valueStyle={{ color: '#3b82f6' }}
              prefix={<CalendarOutlined />}
              suffix="lượt"
            />
            <div className="mt-2 flex items-center text-sm text-green-600">
              <RiseOutlined className="mr-1" />
              +{dailyStats.bookingsGrowth}% so với hôm qua
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-muted-foreground">Khách hàng</span>}
              value={dailyStats.customers}
              valueStyle={{ color: '#f59e0b' }}
              prefix={<TeamOutlined />}
              suffix="người"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              +{dailyStats.newCustomers} khách mới
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-muted-foreground">Sản phẩm bán</span>}
              value={dailyStats.products}
              valueStyle={{ color: '#8b5cf6' }}
              prefix={<ShoppingCartOutlined />}
              suffix="sp"
            />
            <div className="mt-2 flex items-center text-sm text-green-600">
              <RiseOutlined className="mr-1" />
              +{dailyStats.productsGrowth}% so với hôm qua
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu theo tháng" className="border-0 shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(142, 76%, 36%)" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Tỷ lệ sử dụng sân" className="border-0 shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fieldUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {fieldUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Weekly Chart */}
      <Card title="Lượt đặt sân theo ngày trong tuần" className="border-0 shadow-md">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="morning" name="Sáng" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="afternoon" name="Chiều" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="evening" name="Tối" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Bookings */}
      <Card title="Đặt sân gần đây" className="border-0 shadow-md">
        <Table
          dataSource={mockBookings.slice(0, 5)}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'Mã', dataIndex: 'id', key: 'id' },
            { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
            { title: 'Sân', dataIndex: 'fieldName', key: 'fieldName', ellipsis: true },
            { title: 'Thời gian', dataIndex: 'timeSlot', key: 'timeSlot' },
            { 
              title: 'Tổng tiền', 
              dataIndex: 'totalAmount', 
              key: 'totalAmount',
              render: (value: number) => formatCurrency(value)
            },
            { 
              title: 'Trạng thái', 
              dataIndex: 'status', 
              key: 'status',
              render: (status: string) => getStatusTag(status)
            },
          ]}
        />
      </Card>
    </div>
  );
}
