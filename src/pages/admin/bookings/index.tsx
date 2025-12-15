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
  message,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  ExportOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { mockBookings, type Booking } from '@/data/mockBookings';

const dailyStats = {
  total: mockBookings.length,
  pending: mockBookings.filter(b => b.status === 'pending').length,
  confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
  completed: mockBookings.filter(b => b.status === 'completed').length,
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

export default function BookingsManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleExport = () => {
    message.success('Đã xuất báo cáo đặt sân!');
  };

  const handleConfirm = (id: string) => {
    message.success(`Đã xác nhận đặt sân #${id}`);
  };

  const handleStart = (id: string) => {
    message.success(`Đã bắt đầu sân #${id}`);
  };

  const columns = [
    { title: 'Mã đặt', dataIndex: 'id', key: 'id', width: 100 },
    { 
      title: 'Khách hàng', 
      key: 'customer',
      render: (_: unknown, record: Booking) => (
        <div>
          <div className="font-medium">{record.customerName}</div>
          <div className="text-sm text-muted-foreground">{record.customerPhone}</div>
        </div>
      )
    },
    { title: 'Sân', dataIndex: 'fieldName', key: 'fieldName', ellipsis: true },
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Giờ', dataIndex: 'timeSlot', key: 'timeSlot' },
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
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Booking) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => navigate(`/admin/bookings/${record.id}`)}
          />
          {record.status === 'pending' && (
            <Button size="small" type="primary" onClick={() => handleConfirm(record.id)}>
              Xác nhận
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button 
              size="small" 
              type="primary" 
              style={{ backgroundColor: 'hsl(var(--success))' }}
              onClick={() => handleStart(record.id)}
            >
              Bắt đầu
            </Button>
          )}
        </Space>
      )
    },
  ];

  const filteredBookings = mockBookings.filter(booking => {
    const matchSearch = booking.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
                       booking.id.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tổng đặt sân"
              value={dailyStats.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-amber-50 dark:bg-amber-900/20">
            <Statistic
              title="Chờ xác nhận"
              value={dailyStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-blue-50 dark:bg-blue-900/20">
            <Statistic
              title="Đã xác nhận"
              value={dailyStats.confirmed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-green-50 dark:bg-green-900/20">
            <Statistic
              title="Hoàn thành"
              value={dailyStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <Space wrap>
            <Input
              placeholder="Tìm kiếm..."
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
              <Select.Option value="pending">Chờ xác nhận</Select.Option>
              <Select.Option value="confirmed">Đã xác nhận</Select.Option>
              <Select.Option value="playing">Đang chơi</Select.Option>
              <Select.Option value="completed">Hoàn thành</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/bookings/add')}
            >
              Tạo đặt sân
            </Button>
          </Space>
        </div>
        <Table
          dataSource={filteredBookings}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
