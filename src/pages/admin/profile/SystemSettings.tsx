import {
  Card,
  Switch,
  List,
  Typography,
  Select,
  Divider,
  Space,
  Button,
} from "antd";
import {
  BgColorsOutlined,
  TranslationOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

export default function SystemSettings() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <Title level={5}>Giao diện & Trải nghiệm</Title>
        <List itemLayout="horizontal">
          <List.Item
            actions={[
              <Select key="lang" defaultValue="vi" style={{ width: 120 }}>
                <Select.Option value="vi">Tiếng Việt</Select.Option>
                <Select.Option value="en">English</Select.Option>
              </Select>,
            ]}
          >
            <List.Item.Meta
              avatar={<TranslationOutlined className="text-xl mt-2" />}
              title="Ngôn ngữ hiển thị"
              description="Chọn ngôn ngữ sử dụng cho giao diện quản trị."
            />
          </List.Item>

          <List.Item actions={[<Switch key="darkmode" />]}>
            <List.Item.Meta
              avatar={<BgColorsOutlined className="text-xl mt-2" />}
              title="Chế độ tối (Dark Mode)"
              description="Thay đổi giao diện sang tông màu tối để bảo vệ mắt."
            />
          </List.Item>
        </List>
      </div>

      <Divider />

      <div className="mb-6">
        <Title level={5}>Bảo mật hệ thống</Title>
        <List itemLayout="horizontal">
          <List.Item actions={[<Switch key="auto-logout" defaultChecked />]}>
            <List.Item.Meta
              avatar={<LogoutOutlined className="text-xl mt-2" />}
              title="Tự động đăng xuất"
              description="Tự động thoát tài khoản sau 30 phút không hoạt động."
            />
          </List.Item>

          <List.Item actions={[<Switch key="2fa" />]}>
            <List.Item.Meta
              avatar={<SafetyCertificateOutlined className="text-xl mt-2" />}
              title="Xác thực 2 bước (2FA)"
              description="Yêu cầu mã OTP khi đăng nhập từ thiết bị lạ."
            />
          </List.Item>
        </List>
      </div>

      <div className="mt-8 flex justify-end">
        <Space>
          <Button>Khôi phục mặc định</Button>
          <Button type="primary" style={{ backgroundColor: "#1890ff" }}>
            Lưu cấu hình hệ thống
          </Button>
        </Space>
      </div>
    </div>
  );
}
