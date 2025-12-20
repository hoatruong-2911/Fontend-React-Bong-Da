import { Card, Switch, List, Typography, Divider, message } from "antd";
import {
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Text } = Typography;

export default function Notifications() {
  const [loading, setLoading] = useState(false);

  const onChange = (checked: boolean, settingName: string) => {
    // Giả lập gọi API cập nhật cấu hình thông báo
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(`Đã ${checked ? "bật" : "tắt"} thông báo ${settingName}`);
    }, 500);
  };

  const notificationSettings = [
    {
      title: "Thông báo đặt sân mới",
      desc: "Nhận thông báo đẩy khi có khách hàng đặt sân thành công.",
      icon: <SoundOutlined className="text-blue-500" />,
      key: "booking_notif",
    },
    {
      title: "Báo cáo doanh thu qua Email",
      desc: "Hệ thống tự động gửi báo cáo tổng kết doanh thu vào 23:00 hàng ngày.",
      icon: <MailOutlined className="text-green-500" />,
      key: "email_report",
    },
    {
      title: "Thông báo nhắc lịch nhân viên",
      desc: "Gửi nhắc nhở cho nhân viên trước khi ca trực bắt đầu 15 phút.",
      icon: <MobileOutlined className="text-orange-500" />,
      key: "staff_reminder",
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <Text type="secondary">
          Quản lý cách bạn nhận thông báo về hoạt động của sân bóng.
        </Text>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notificationSettings}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Switch
                key={item.key}
                defaultChecked
                loading={loading}
                onChange={(checked) => onChange(checked, item.title)}
              />,
            ]}
          >
            <List.Item.Meta
              avatar={
                <div className="p-2 bg-gray-100 rounded-lg">{item.icon}</div>
              }
              title={<Text strong>{item.title}</Text>}
              description={item.desc}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
