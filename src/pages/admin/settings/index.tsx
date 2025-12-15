import { useState } from 'react';
import { Card, Form, Input, Switch, Select, Button, Tabs, Typography, Divider, message, InputNumber, Upload, Row, Col } from 'antd';
import { SaveOutlined, UploadOutlined, SettingOutlined, ShopOutlined, BellOutlined, SecurityScanOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AdminSettings() {
  const [generalForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSaveGeneral = async () => {
    try {
      setLoading(true);
      await generalForm.validateFields();
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Đã lưu cài đặt chung!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotification = async () => {
    try {
      setLoading(true);
      await notificationForm.validateFields();
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Đã lưu cài đặt thông báo!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setLoading(true);
      await securityForm.validateFields();
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Đã lưu cài đặt bảo mật!');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <ShopOutlined /> Cài đặt chung
        </span>
      ),
      children: (
        <Card>
          <Form
            form={generalForm}
            layout="vertical"
            initialValues={{
              storeName: 'Stadium POS',
              phone: '0123 456 789',
              email: 'contact@stadiumpos.com',
              address: '123 Đường ABC, Quận 1, TP.HCM',
              currency: 'VND',
              timezone: 'Asia/Ho_Chi_Minh',
              taxRate: 10,
              openTime: '06:00',
              closeTime: '23:00',
            }}
          >
            <Title level={5}>Thông tin cửa hàng</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="storeName" label="Tên cửa hàng" rules={[{ required: true }]}>
                  <Input placeholder="Nhập tên cửa hàng" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="email" label="Email">
                  <Input placeholder="Nhập email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="address" label="Địa chỉ">
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="logo" label="Logo cửa hàng">
              <Upload maxCount={1} listType="picture">
                <Button icon={<UploadOutlined />}>Tải lên logo</Button>
              </Upload>
            </Form.Item>

            <Divider />
            <Title level={5}>Cài đặt hệ thống</Title>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="currency" label="Đơn vị tiền tệ">
                  <Select
                    options={[
                      { value: 'VND', label: 'VND - Việt Nam Đồng' },
                      { value: 'USD', label: 'USD - US Dollar' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="timezone" label="Múi giờ">
                  <Select
                    options={[
                      { value: 'Asia/Ho_Chi_Minh', label: 'GMT+7 (Việt Nam)' },
                      { value: 'Asia/Bangkok', label: 'GMT+7 (Bangkok)' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="taxRate" label="Thuế VAT (%)">
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="openTime" label="Giờ mở cửa">
                  <Input type="time" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="closeTime" label="Giờ đóng cửa">
                  <Input type="time" />
                </Form.Item>
              </Col>
            </Row>

            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveGeneral} loading={loading}>
              Lưu cài đặt
            </Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> Thông báo
        </span>
      ),
      children: (
        <Card>
          <Form
            form={notificationForm}
            layout="vertical"
            initialValues={{
              emailNotification: true,
              smsNotification: false,
              orderNotification: true,
              bookingNotification: true,
              lowStockNotification: true,
              lowStockThreshold: 10,
            }}
          >
            <Title level={5}>Kênh thông báo</Title>
            <Form.Item name="emailNotification" label="Thông báo qua Email" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="smsNotification" label="Thông báo qua SMS" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Divider />
            <Title level={5}>Loại thông báo</Title>

            <Form.Item name="orderNotification" label="Thông báo đơn hàng mới" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="bookingNotification" label="Thông báo đặt sân mới" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="lowStockNotification" label="Cảnh báo hết hàng" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="lowStockThreshold" label="Ngưỡng cảnh báo tồn kho">
              <InputNumber min={1} max={100} addonAfter="sản phẩm" />
            </Form.Item>

            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveNotification} loading={loading}>
              Lưu cài đặt
            </Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SecurityScanOutlined /> Bảo mật
        </span>
      ),
      children: (
        <Card>
          <Form
            form={securityForm}
            layout="vertical"
            initialValues={{
              twoFactorAuth: false,
              sessionTimeout: 30,
              passwordExpiry: 90,
              minPasswordLength: 8,
              requireSpecialChar: true,
            }}
          >
            <Title level={5}>Xác thực</Title>
            <Form.Item name="twoFactorAuth" label="Xác thực 2 lớp (2FA)" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sessionTimeout" label="Thời gian hết phiên (phút)">
              <InputNumber min={5} max={120} style={{ width: 200 }} />
            </Form.Item>

            <Divider />
            <Title level={5}>Chính sách mật khẩu</Title>

            <Form.Item name="passwordExpiry" label="Thời hạn mật khẩu (ngày)">
              <InputNumber min={30} max={365} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="minPasswordLength" label="Độ dài tối thiểu">
              <InputNumber min={6} max={20} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="requireSpecialChar" label="Yêu cầu ký tự đặc biệt" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveSecurity} loading={loading}>
              Lưu cài đặt
            </Button>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SettingOutlined style={{ fontSize: 24 }} />
        <Title level={4} style={{ margin: 0 }}>Cài đặt hệ thống</Title>
      </div>

      <Tabs items={tabItems} />
    </div>
  );
}
