import { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Tabs,
  Table,
  Tag,
  Progress,
  Switch,
  message
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined,
  EditOutlined,
  SaveOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BellOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Mock staff data
const mockStaff = {
  id: 'NV001',
  name: 'Trần Văn B',
  email: 'tranvanb@stadium.com',
  phone: '0987 654 321',
  position: 'Nhân viên quầy',
  department: 'Bán hàng',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  startDate: '15/03/2024',
  totalShifts: 120,
  rating: 4.8,
  attendance: 96,
};

// Mock shift history
const mockShiftHistory = [
  { id: 1, date: '29/05/2025', shift: 'Ca sáng', checkIn: '06:55', checkOut: '14:05', status: 'completed' },
  { id: 2, date: '28/05/2025', shift: 'Ca chiều', checkIn: '13:58', checkOut: '22:02', status: 'completed' },
  { id: 3, date: '27/05/2025', shift: 'Ca sáng', checkIn: '07:10', checkOut: '14:00', status: 'late' },
  { id: 4, date: '26/05/2025', shift: 'Ca tối', checkIn: '17:55', checkOut: '23:58', status: 'completed' },
];

export default function StaffProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  };

  const shiftColumns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Ca làm', dataIndex: 'shift', key: 'shift' },
    { title: 'Giờ vào', dataIndex: 'checkIn', key: 'checkIn' },
    { title: 'Giờ ra', dataIndex: 'checkOut', key: 'checkOut' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'late' ? 'orange' : 'red'}>
          {status === 'completed' ? 'Đúng giờ' : status === 'late' ? 'Đi muộn' : 'Vắng'}
        </Tag>
      )
    },
  ];

  const tabItems = [
    {
      key: 'info',
      label: <span><UserOutlined /> Thông tin cá nhân</span>,
      children: (
        <Card className="border-0 shadow-sm">
          <Form
            form={form}
            layout="vertical"
            initialValues={mockStaff}
            disabled={!isEditing}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Họ và tên" name="name">
                  <Input prefix={<UserOutlined />} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Email" name="email">
                  <Input prefix={<MailOutlined />} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input prefix={<PhoneOutlined />} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Vị trí" name="position">
                  <Input disabled size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Phòng ban" name="department">
                  <Input disabled size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div className="flex justify-end gap-3 mt-4">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>Hủy</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  Lưu thay đổi
                </Button>
              </>
            ) : (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            )}
          </div>
        </Card>
      ),
    },
    {
      key: 'shifts',
      label: <span><CalendarOutlined /> Lịch sử ca làm</span>,
      children: (
        <Card className="border-0 shadow-sm">
          <Table 
            dataSource={mockShiftHistory} 
            columns={shiftColumns} 
            rowKey="id"
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: 'performance',
      label: <span><TrophyOutlined /> Hiệu suất</span>,
      children: (
        <Card className="border-0 shadow-sm">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card className="bg-muted/30">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Tỉ lệ chuyên cần</div>
                  <Progress 
                    type="circle" 
                    percent={mockStaff.attendance} 
                    strokeColor="#62B462"
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="bg-muted/30">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Đánh giá</div>
                  <div className="text-4xl font-bold text-primary">{mockStaff.rating}</div>
                  <div className="text-yellow-500 text-xl">★★★★★</div>
                </div>
              </Card>
            </Col>
            <Col xs={24}>
              <Card className="bg-muted/30">
                <Row gutter={24}>
                  <Col xs={8} className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockStaff.totalShifts}</div>
                    <div className="text-sm text-muted-foreground">Tổng ca làm</div>
                  </Col>
                  <Col xs={8} className="text-center">
                    <div className="text-2xl font-bold text-green-500">115</div>
                    <div className="text-sm text-muted-foreground">Đúng giờ</div>
                  </Col>
                  <Col xs={8} className="text-center">
                    <div className="text-2xl font-bold text-orange-500">5</div>
                    <div className="text-sm text-muted-foreground">Đi muộn</div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'security',
      label: <span><LockOutlined /> Bảo mật</span>,
      children: (
        <Card className="border-0 shadow-sm">
          <Form layout="vertical">
            <Form.Item label="Mật khẩu hiện tại">
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>
            <Form.Item label="Mật khẩu mới">
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>
            <Form.Item label="Xác nhận mật khẩu mới">
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>
            <Button type="primary" icon={<SaveOutlined />}>
              Đổi mật khẩu
            </Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: <span><BellOutlined /> Thông báo</span>,
      children: (
        <Card className="border-0 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <div className="font-medium">Thông báo ca làm</div>
                <div className="text-sm text-muted-foreground">Nhận nhắc nhở trước ca làm</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <div className="font-medium">Đơn hàng mới</div>
                <div className="text-sm text-muted-foreground">Nhận thông báo khi có đơn hàng mới</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <div className="font-medium">Tin tức công ty</div>
                <div className="text-sm text-muted-foreground">Nhận thông báo từ quản lý</div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar src={mockStaff.avatar} size={120} icon={<UserOutlined />} />
          <div className="text-center md:text-left flex-1">
            <Title level={2} className="!mb-1">{mockStaff.name}</Title>
            <Text className="text-primary font-medium">{mockStaff.position} - {mockStaff.department}</Text>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
              <div>
                <div className="text-sm text-muted-foreground">Mã NV</div>
                <div className="font-medium">{mockStaff.id}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ngày vào làm</div>
                <div className="font-medium">{mockStaff.startDate}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Chuyên cần</div>
                <div className="font-medium text-green-500">{mockStaff.attendance}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Đánh giá</div>
                <div className="font-medium text-yellow-500">★ {mockStaff.rating}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs items={tabItems} size="large" />
    </div>
  );
}
