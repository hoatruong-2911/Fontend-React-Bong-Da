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
  SettingOutlined,
  BellOutlined,
  SafetyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Mock admin data
const mockAdmin = {
  id: 'ADM001',
  name: 'Admin Nguyễn',
  email: 'admin@stadium.com',
  phone: '0901 234 567',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  lastLogin: '29/05/2025 08:30',
  createdAt: '01/01/2024',
};

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  };

  const tabItems = [
    {
      key: 'info',
      label: <span><UserOutlined /> Thông tin cá nhân</span>,
      children: (
        <Card className="border-0 shadow-sm">
          <Form
            form={form}
            layout="vertical"
            initialValues={mockAdmin}
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
                <Form.Item label="Vai trò" name="role">
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
      key: 'security',
      label: <span><SafetyOutlined /> Bảo mật</span>,
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
                <div className="font-medium">Thông báo đặt sân mới</div>
                <div className="text-sm text-muted-foreground">Nhận thông báo khi có đặt sân mới</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <div className="font-medium">Thông báo đơn hàng</div>
                <div className="text-sm text-muted-foreground">Nhận thông báo khi có đơn hàng mới</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <div className="font-medium">Báo cáo doanh thu</div>
                <div className="text-sm text-muted-foreground">Nhận báo cáo doanh thu hàng ngày</div>
              </div>
              <Switch />
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <div className="font-medium">Email marketing</div>
                <div className="text-sm text-muted-foreground">Nhận thông tin khuyến mãi qua email</div>
              </div>
              <Switch />
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'settings',
      label: <span><SettingOutlined /> Cài đặt hệ thống</span>,
      children: (
        <Card className="border-0 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <div className="font-medium">Chế độ tối</div>
                <div className="text-sm text-muted-foreground">Bật/tắt giao diện tối</div>
              </div>
              <Switch />
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <div className="font-medium">Tự động đăng xuất</div>
                <div className="text-sm text-muted-foreground">Đăng xuất sau 30 phút không hoạt động</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <div className="font-medium">Xác thực 2 bước</div>
                <div className="text-sm text-muted-foreground">Bảo mật tài khoản với OTP</div>
              </div>
              <Switch />
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
          <Avatar src={mockAdmin.avatar} size={120} icon={<UserOutlined />} />
          <div className="text-center md:text-left flex-1">
            <Title level={2} className="!mb-1">{mockAdmin.name}</Title>
            <Text className="text-primary font-medium">{mockAdmin.role}</Text>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
              <div>
                <div className="text-sm text-muted-foreground">Mã Admin</div>
                <div className="font-medium">{mockAdmin.id}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Đăng nhập lần cuối</div>
                <div className="font-medium">{mockAdmin.lastLogin}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ngày tạo</div>
                <div className="font-medium">{mockAdmin.createdAt}</div>
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
