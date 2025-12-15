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
  Col,
  Popconfirm
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const mockStaffList = [
  { id: '1', name: 'Nguyễn Văn Nam', phone: '0901111111', email: 'nam@stadium.com', position: 'Quản lý sân', department: 'Vận hành', status: 'active', salary: 12000000 },
  { id: '2', name: 'Trần Thị Hoa', phone: '0902222222', email: 'hoa@stadium.com', position: 'Thu ngân', department: 'Bán hàng', status: 'active', salary: 8000000 },
  { id: '3', name: 'Lê Văn Minh', phone: '0903333333', email: 'minh@stadium.com', position: 'Bảo vệ', department: 'An ninh', status: 'active', salary: 7000000 },
  { id: '4', name: 'Phạm Thị Lan', phone: '0904444444', email: 'lan@stadium.com', position: 'Phục vụ', department: 'F&B', status: 'off', salary: 6500000 },
  { id: '5', name: 'Hoàng Văn Đức', phone: '0905555555', email: 'duc@stadium.com', position: 'Kỹ thuật', department: 'Kỹ thuật', status: 'active', salary: 10000000 },
];

const dailyStats = {
  totalStaff: mockStaffList.length,
  activeStaff: mockStaffList.filter(s => s.status === 'active').length,
  offStaff: mockStaffList.filter(s => s.status === 'off').length,
  departments: 5,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    active: { color: 'green', text: 'Hoạt động' },
    inactive: { color: 'default', text: 'Không hoạt động' },
    off: { color: 'orange', text: 'Nghỉ phép' },
  };
  const { color, text } = statusMap[status] || { color: 'default', text: status };
  return <Tag color={color}>{text}</Tag>;
};

export default function StaffManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleDelete = (id: string) => {
    message.success(`Đã xóa nhân viên #${id}`);
  };

  const handleExport = () => {
    message.success('Đã xuất báo cáo nhân viên!');
  };

  const columns = [
    { 
      title: 'Nhân viên', 
      key: 'staff',
      render: (_: unknown, record: typeof mockStaffList[0]) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-primary" />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-muted-foreground">{record.position}</div>
          </div>
        </div>
      )
    },
    { title: 'Phòng ban', dataIndex: 'department', key: 'department' },
    { 
      title: 'Liên hệ', 
      key: 'contact',
      render: (_: unknown, record: typeof mockStaffList[0]) => (
        <div className="text-sm">
          <div className="flex items-center gap-1"><PhoneOutlined /> {record.phone}</div>
          <div className="flex items-center gap-1"><MailOutlined /> {record.email}</div>
        </div>
      )
    },
    { 
      title: 'Lương', 
      dataIndex: 'salary', 
      key: 'salary',
      render: (salary: number) => formatCurrency(salary)
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
      render: (_: unknown, record: typeof mockStaffList[0]) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => navigate(`/admin/staff/${record.id}`)}
          />
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            type="primary"
            onClick={() => navigate(`/admin/staff/${record.id}/edit`)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  const filteredStaff = mockStaffList.filter(staff => {
    const matchSearch = staff.name.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || staff.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tổng nhân viên"
              value={dailyStats.totalStaff}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-green-50 dark:bg-green-900/20">
            <Statistic
              title="Đang làm việc"
              value={dailyStats.activeStaff}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-amber-50 dark:bg-amber-900/20">
            <Statistic
              title="Nghỉ phép"
              value={dailyStats.offStaff}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-blue-50 dark:bg-blue-900/20">
            <Statistic
              title="Phòng ban"
              value={dailyStats.departments}
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
              placeholder="Tìm kiếm nhân viên..."
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
              <Select.Option value="active">Đang làm</Select.Option>
              <Select.Option value="off">Nghỉ phép</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/staff/add')}
            >
              Thêm nhân viên
            </Button>
          </Space>
        </div>
        <Table
          dataSource={filteredStaff}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
