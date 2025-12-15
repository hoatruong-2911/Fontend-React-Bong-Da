import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space,
  Input,
  Select,
  Avatar,
  message,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ExportOutlined,
  UserOutlined,
  MailOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { mockCustomers, type Customer } from '@/data/mockBookings';

const dailyStats = {
  totalCustomers: mockCustomers.length,
  activeCustomers: mockCustomers.filter(c => c.status === 'active').length,
  vipCustomers: 2,
  totalBookings: mockCustomers.reduce((sum, c) => sum + c.totalBookings, 0),
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    active: { color: 'green', text: 'Hoạt động' },
    inactive: { color: 'default', text: 'Không hoạt động' },
  };
  const { color, text } = statusMap[status] || { color: 'default', text: status };
  return <Tag color={color}>{text}</Tag>;
};

export default function CustomersManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleExport = () => {
    message.success('Đã xuất báo cáo khách hàng!');
  };

  const columns = [
    { 
      title: 'Khách hàng', 
      key: 'customer',
      render: (_: unknown, record: Customer) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-info" />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-muted-foreground">{record.email}</div>
          </div>
        </div>
      )
    },
    { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Số lần đặt', dataIndex: 'totalBookings', key: 'totalBookings' },
    { 
      title: 'Tổng chi tiêu', 
      dataIndex: 'totalSpent', 
      key: 'totalSpent',
      render: (value: number) => formatCurrency(value)
    },
    { title: 'Đặt gần nhất', dataIndex: 'lastBooking', key: 'lastBooking' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Customer) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => navigate(`/admin/customers/${record.id}`)}
          />
          <Button 
            icon={<MailOutlined />} 
            size="small" 
            type="primary"
          >
            Gửi mail
          </Button>
        </Space>
      )
    },
  ];

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchSearch = customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
                       customer.email.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tổng khách hàng"
              value={dailyStats.totalCustomers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-green-50 dark:bg-green-900/20">
            <Statistic
              title="Đang hoạt động"
              value={dailyStats.activeCustomers}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-amber-50 dark:bg-amber-900/20">
            <Statistic
              title="Khách VIP"
              value={dailyStats.vipCustomers}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-blue-50 dark:bg-blue-900/20">
            <Statistic
              title="Tổng booking"
              value={dailyStats.totalBookings}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <Space wrap>
            <Input
              placeholder="Tìm kiếm khách hàng..."
              prefix={<SearchOutlined />}
              className="w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select 
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="inactive">Không hoạt động</Select.Option>
            </Select>
          </Space>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            Xuất Excel
          </Button>
        </div>
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
